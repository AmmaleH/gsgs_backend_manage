import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { EStorageKey, ERecordStatus } from '@/constants'
import {
  ALL_PERMISSION_CODES,
  EPermissionCode,
  EUserRole,
  PERMISSION_LABEL_MAP,
  SUPER_ADMIN_USERNAME,
} from '@/constants/permission'
import type { AccountPermissionItem, PermissionDefItem } from '@/types'
import { formatDateTime, generateId, getStorageItem, setStorageItem } from '@/utils/storage'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const DEFAULT_ACCOUNTS: AccountPermissionItem[] = [
  {
    id: '1',
    username: SUPER_ADMIN_USERNAME,
    nickname: '超级管理员',
    role: EUserRole.SUPER_ADMIN,
    permissions: [...ALL_PERMISSION_CODES],
    status: ERecordStatus.ENABLED,
    updatedAt: '2026-06-10 10:00:00',
  },
  {
    id: '2',
    username: 'zhangsan',
    nickname: '张三',
    role: EUserRole.NORMAL,
    permissions: [EPermissionCode.CHAT, EPermissionCode.AGENT_VIEW, EPermissionCode.KNOWLEDGE_VIEW],
    status: ERecordStatus.ENABLED,
    updatedAt: '2026-06-11 14:00:00',
  },
  {
    id: '3',
    username: 'lisi',
    nickname: '李四',
    role: EUserRole.NORMAL,
    permissions: [
      EPermissionCode.CHAT,
      EPermissionCode.AGENT_VIEW,
      EPermissionCode.AGENT_MANAGE,
      EPermissionCode.KNOWLEDGE_VIEW,
      EPermissionCode.KNOWLEDGE_MANAGE,
    ],
    status: ERecordStatus.ENABLED,
    updatedAt: '2026-06-12 09:00:00',
  },
  {
    id: '4',
    username: 'wangwu',
    nickname: '王五',
    role: EUserRole.NORMAL,
    permissions: [EPermissionCode.CHAT, EPermissionCode.BASIC_DATA_VIEW],
    status: ERecordStatus.ENABLED,
    updatedAt: '2026-06-13 16:00:00',
  },
]

function loadAccounts(): AccountPermissionItem[] {
  return getStorageItem(EStorageKey.ACCOUNT_PERMISSIONS, DEFAULT_ACCOUNTS)
}

export const usePermissionStore = defineStore('permission', () => {
  const accountList = ref<AccountPermissionItem[]>(loadAccounts())

  function persistAccounts() {
    setStorageItem(EStorageKey.ACCOUNT_PERMISSIONS, accountList.value)
  }

  /** 按用户名查找账号（登录 Mock 用） */
  function findAccountByUsername(username: string): AccountPermissionItem | undefined {
    return accountList.value.find(
      (item) => item.username === username && item.status === ERecordStatus.ENABLED,
    )
  }

  /** 权限定义列表（含关联账号数） */
  const permissionDefList = computed<PermissionDefItem[]>(() => {
    return ALL_PERMISSION_CODES.map((code) => ({
      code,
      name: PERMISSION_LABEL_MAP[code],
      accountCount: accountList.value.filter((account) => {
        if (account.role === EUserRole.SUPER_ADMIN) return true
        return account.permissions.includes(code)
      }).length,
    }))
  })

  function getAccountList(keyword = ''): AccountPermissionItem[] {
    if (!keyword) return [...accountList.value]
    const lower = keyword.toLowerCase()
    return accountList.value.filter(
      (item) =>
        item.username.toLowerCase().includes(lower) || item.nickname.toLowerCase().includes(lower),
    )
  }

  function createAccount(data: Omit<AccountPermissionItem, 'id' | 'updatedAt'>) {
    if (accountList.value.some((item) => item.username === data.username)) {
      throw new Error('账号名已存在')
    }
    accountList.value.unshift({
      ...data,
      id: generateId(),
      updatedAt: formatDateTime(new Date()),
    })
    persistAccounts()
  }

  function updateAccount(id: string, data: Partial<AccountPermissionItem>) {
    const index = accountList.value.findIndex((item) => item.id === id)
    if (index < 0) return
    if (data.username && data.username !== accountList.value[index].username) {
      const exists = accountList.value.some((item) => item.username === data.username && item.id !== id)
      if (exists) throw new Error('账号名已存在')
    }
    accountList.value[index] = {
      ...accountList.value[index],
      ...data,
      updatedAt: formatDateTime(new Date()),
    }
    persistAccounts()
  }

  function deleteAccount(id: string) {
    const account = accountList.value.find((item) => item.id === id)
    if (!account) return
    if (account.role === EUserRole.SUPER_ADMIN) {
      throw new Error('不能删除超级管理员账号')
    }
    accountList.value = accountList.value.filter((item) => item.id !== id)
    persistAccounts()
  }

  /** 按账号维度：更新权限列表 */
  function updateAccountPermissions(id: string, permissions: string[]) {
    const account = accountList.value.find((item) => item.id === id)
    if (!account) return
    if (account.role === EUserRole.SUPER_ADMIN) {
      throw new Error('超级管理员拥有全部权限，无需配置')
    }
    updateAccount(id, { permissions: [...permissions] })
  }

  /** 按权限维度：获取拥有该权限的账号 ID 列表 */
  function getAccountIdsByPermission(code: string): string[] {
    return accountList.value
      .filter((account) => {
        if (account.role === EUserRole.SUPER_ADMIN) return true
        return account.permissions.includes(code)
      })
      .map((account) => account.id)
  }

  /** 按权限维度：批量更新拥有某权限的账号 */
  function updatePermissionAccounts(code: string, accountIds: string[]) {
    accountList.value.forEach((account) => {
      if (account.role === EUserRole.SUPER_ADMIN) return

      const hasCode = account.permissions.includes(code)
      const shouldHave = accountIds.includes(account.id)

      if (shouldHave && !hasCode) {
        account.permissions = [...account.permissions, code]
        account.updatedAt = formatDateTime(new Date())
      } else if (!shouldHave && hasCode) {
        account.permissions = account.permissions.filter((p) => p !== code)
        account.updatedAt = formatDateTime(new Date())
      }
    })
    persistAccounts()
  }

  async function fetchAccountList(keyword = ''): Promise<AccountPermissionItem[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200))
      return getAccountList(keyword)
    }
    const { getAccountListApi } = await import('@/api/permission')
    const res = await getAccountListApi({ keyword })
    return res.data.list
  }

  return {
    accountList,
    permissionDefList,
    findAccountByUsername,
    getAccountList,
    createAccount,
    updateAccount,
    updateAccountPermissions,
    getAccountIdsByPermission,
    updatePermissionAccounts,
    deleteAccount,
    fetchAccountList,
  }
})
