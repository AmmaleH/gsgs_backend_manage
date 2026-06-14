import { reactive, ref } from 'vue'

import {
  ALL_PERMISSION_CODES,
  EPermissionCode,
  EUserRole,
  PERMISSION_LABEL_MAP,
} from '@/constants/permission'
import { ERecordStatus } from '@/constants'
import { usePermissionStore } from '@/stores/permission'
import type { AccountPermissionItem } from '@/types'
import { showConfirm, showToast } from '@/utils/message'

export function usePermissionManage() {
  const permissionStore = usePermissionStore()

  const activeTab = ref<'account' | 'permission'>('account')
  const keyword = ref('')
  const isLoading = ref(false)
  const tableList = ref<AccountPermissionItem[]>([])

  const isAccountDialogVisible = ref(false)
  const isAccountDetailVisible = ref(false)
  const isAccountPermDialogVisible = ref(false)
  const isPermissionDetailVisible = ref(false)
  const isPermissionAccountDialogVisible = ref(false)
  const isSubmitting = ref(false)

  const editingAccount = ref<AccountPermissionItem | null>(null)
  const detailAccount = ref<AccountPermissionItem | null>(null)
  const editingPermissionCode = ref<EPermissionCode | null>(null)
  const detailPermissionCode = ref<EPermissionCode | null>(null)

  const accountForm = reactive({
    username: '',
    nickname: '',
    role: EUserRole.NORMAL,
    status: ERecordStatus.ENABLED,
  })

  const selectedPermissions = ref<EPermissionCode[]>([])
  const selectedAccountIds = ref<string[]>([])

  const pagination = reactive({
    page: 1,
    pageSize: 12,
    total: 0,
  })

  async function fetchAccountTableList() {
    isLoading.value = true
    try {
      const list = await permissionStore.fetchAccountList(keyword.value)
      pagination.total = list.length
      const start = (pagination.page - 1) * pagination.pageSize
      tableList.value = list.slice(start, start + pagination.pageSize)
    } finally {
      isLoading.value = false
    }
  }

  function handleAccountSearch() {
    pagination.page = 1
    fetchAccountTableList()
  }

  function handleAccountPageChange(page: number) {
    pagination.page = page
    fetchAccountTableList()
  }

  function handleAccountPageSizeChange(size: number) {
    pagination.pageSize = size
    pagination.page = 1
    fetchAccountTableList()
  }

  function handleAccountCreateOpen() {
    editingAccount.value = null
    accountForm.username = ''
    accountForm.nickname = ''
    accountForm.role = EUserRole.NORMAL
    accountForm.status = ERecordStatus.ENABLED
    isAccountDialogVisible.value = true
  }

  function handleAccountEditOpen(row: AccountPermissionItem) {
    editingAccount.value = row
    accountForm.username = row.username
    accountForm.nickname = row.nickname
    accountForm.role = row.role as EUserRole
    accountForm.status = row.status
    isAccountDialogVisible.value = true
  }

  function handleAccountDetailOpen(row: AccountPermissionItem) {
    detailAccount.value = { ...row }
    isAccountDetailVisible.value = true
  }

  function handlePermissionDetailOpen(code: EPermissionCode) {
    detailPermissionCode.value = code
    isPermissionDetailVisible.value = true
  }

  function getAccountsByPermissionCode(code: EPermissionCode): AccountPermissionItem[] {
    return permissionStore.getAccountList().filter((account) => {
      if (account.role === EUserRole.SUPER_ADMIN) return true
      return account.permissions.includes(code)
    })
  }

  async function handleAccountSubmit() {
    if (!accountForm.username.trim()) {
      showToast('请输入账号名', 'warning')
      return
    }
    if (!accountForm.nickname.trim()) {
      showToast('请输入昵称', 'warning')
      return
    }

    isSubmitting.value = true
    try {
      if (editingAccount.value) {
        permissionStore.updateAccount(editingAccount.value.id, {
          username: accountForm.username.trim(),
          nickname: accountForm.nickname.trim(),
          role: accountForm.role,
          status: accountForm.status,
        })
        showToast('账号已更新', 'success')
      } else {
        permissionStore.createAccount({
          username: accountForm.username.trim(),
          nickname: accountForm.nickname.trim(),
          role: accountForm.role,
          permissions:
            accountForm.role === EUserRole.SUPER_ADMIN ? [...ALL_PERMISSION_CODES] : [EPermissionCode.CHAT],
          status: accountForm.status,
        })
        showToast('账号已创建', 'success')
      }
      isAccountDialogVisible.value = false
      fetchAccountTableList()
    } catch (err) {
      showToast(err instanceof Error ? err.message : '操作失败', 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  async function handleAccountDelete(row: AccountPermissionItem) {
    const confirmed = await showConfirm(`确定删除账号「${row.username}」吗？`)
    if (!confirmed) return

    try {
      permissionStore.deleteAccount(row.id)
      showToast('删除成功', 'success')
      fetchAccountTableList()
    } catch (err) {
      showToast(err instanceof Error ? err.message : '删除失败', 'error')
    }
  }

  function handleAccountPermOpen(row: AccountPermissionItem) {
    if (row.role === EUserRole.SUPER_ADMIN) {
      showToast('超级管理员拥有全部权限', 'info')
      return
    }
    editingAccount.value = row
    selectedPermissions.value = [...row.permissions] as EPermissionCode[]
    isAccountPermDialogVisible.value = true
  }

  async function handleAccountPermSubmit() {
    if (!editingAccount.value) return

    isSubmitting.value = true
    try {
      permissionStore.updateAccountPermissions(editingAccount.value.id, selectedPermissions.value)
      showToast('权限已更新', 'success')
      isAccountPermDialogVisible.value = false
      fetchAccountTableList()
    } catch (err) {
      showToast(err instanceof Error ? err.message : '操作失败', 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  function handlePermissionAccountOpen(code: EPermissionCode) {
    editingPermissionCode.value = code
    selectedAccountIds.value = permissionStore.getAccountIdsByPermission(code)
    isPermissionAccountDialogVisible.value = true
  }

  async function handlePermissionAccountSubmit() {
    if (!editingPermissionCode.value) return

    isSubmitting.value = true
    try {
      permissionStore.updatePermissionAccounts(editingPermissionCode.value, selectedAccountIds.value)
      showToast('账号授权已更新', 'success')
      isPermissionAccountDialogVisible.value = false
      fetchAccountTableList()
    } catch (err) {
      showToast(err instanceof Error ? err.message : '操作失败', 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  function getPermissionLabels(codes: string[]): string {
    return codes.map((code) => PERMISSION_LABEL_MAP[code as EPermissionCode] ?? code).join('、')
  }

  function getRoleLabel(role: string): string {
    return role === EUserRole.SUPER_ADMIN ? '超级管理员' : '普通账号'
  }

  /** 权限维度可选账号（不含超级管理员，其默认拥有全部权限） */
  const selectableAccounts = ref<AccountPermissionItem[]>([])

  function loadSelectableAccounts() {
    selectableAccounts.value = permissionStore
      .getAccountList()
      .filter((item) => item.role !== EUserRole.SUPER_ADMIN)
  }

  return {
    activeTab,
    keyword,
    isLoading,
    tableList,
    pagination,
    permissionDefList: permissionStore.permissionDefList,
    isAccountDialogVisible,
    isAccountDetailVisible,
    isAccountPermDialogVisible,
    isPermissionDetailVisible,
    isPermissionAccountDialogVisible,
    isSubmitting,
    editingAccount,
    detailAccount,
    editingPermissionCode,
    detailPermissionCode,
    accountForm,
    selectedPermissions,
    selectedAccountIds,
    selectableAccounts,
    allPermissionCodes: ALL_PERMISSION_CODES,
    permissionLabelMap: PERMISSION_LABEL_MAP,
    fetchAccountTableList,
    handleAccountSearch,
    handleAccountPageChange,
    handleAccountPageSizeChange,
    handleAccountCreateOpen,
    handleAccountEditOpen,
    handleAccountDetailOpen,
    handleAccountSubmit,
    handleAccountDelete,
    handleAccountPermOpen,
    handleAccountPermSubmit,
    handlePermissionAccountOpen,
    handlePermissionDetailOpen,
    handlePermissionAccountSubmit,
    getAccountsByPermissionCode,
    getPermissionLabels,
    getRoleLabel,
    loadSelectableAccounts,
  }
}
