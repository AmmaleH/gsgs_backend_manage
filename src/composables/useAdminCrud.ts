import { reactive, ref } from 'vue'

import type { AdminPageResult } from '@/types/api'
import { showConfirm, showToast } from '@/utils/message'

export interface AdminCrudFetchParams {
  keyword: string
  pageNo: number
  pageSize: number
  statusFilter?: string
}

interface UseAdminCrudOptions<T extends { id: string }> {
  entityName: string
  fetchList: (params: AdminCrudFetchParams) => Promise<AdminPageResult<T>>
  saveItem: (data: Partial<T>) => Promise<T>
  deleteItem: (id: string) => Promise<void>
  getTitle: (item: T) => string
  createDefaultForm: () => Record<string, unknown>
  rowToForm: (row: T) => Record<string, unknown>
  formToPayload: (form: Record<string, unknown>) => Partial<T>
  validateForm?: (form: Record<string, unknown>) => string | null
}

export function useAdminCrud<T extends { id: string }>(options: UseAdminCrudOptions<T>) {
  const tableList = ref<T[]>([])
  const isLoading = ref(false)
  const isDialogVisible = ref(false)
  const isDetailVisible = ref(false)
  const isSubmitting = ref(false)
  const editingRow = ref<T | null>(null)
  const detailRow = ref<T | null>(null)
  const keyword = ref('')
  const statusFilter = ref('')

  const pagination = reactive({
    page: 1,
    pageSize: 12,
    total: 0,
  })

  const formModel = reactive<Record<string, unknown>>(options.createDefaultForm())

  function resetForm() {
    Object.assign(formModel, options.createDefaultForm())
  }

  async function fetchTableList() {
    isLoading.value = true
    try {
      const res = await options.fetchList({
        keyword: keyword.value.trim(),
        pageNo: pagination.page,
        pageSize: pagination.pageSize,
        statusFilter: statusFilter.value || undefined,
      })
      tableList.value = res.records
      pagination.total = res.total
    } finally {
      isLoading.value = false
    }
  }

  function handleSearch() {
    pagination.page = 1
    fetchTableList()
  }

  function handlePageChange(page: number) {
    pagination.page = page
    fetchTableList()
  }

  function handlePageSizeChange(size: number) {
    pagination.pageSize = size
    pagination.page = 1
    fetchTableList()
  }

  function handleStatusFilterChange() {
    pagination.page = 1
    fetchTableList()
  }

  function handleCreateOpen() {
    editingRow.value = null
    resetForm()
    isDialogVisible.value = true
  }

  function handleEditOpen(row: T) {
    editingRow.value = row
    Object.assign(formModel, options.rowToForm(row))
    isDialogVisible.value = true
  }

  function handleDetailOpen(row: T) {
    detailRow.value = row
    isDetailVisible.value = true
  }

  async function handleDelete(row: T) {
    const title = options.getTitle(row)
    const confirmed = await showConfirm(`确定删除该${options.entityName}「${title}」吗？`)
    if (!confirmed) return

    await options.deleteItem(row.id)
    showToast('删除成功', 'success')
    fetchTableList()
  }

  async function handleSubmit() {
    const err = options.validateForm?.(formModel)
    if (err) {
      showToast(err, 'warning')
      return
    }

    isSubmitting.value = true
    try {
      const payload = options.formToPayload(formModel)
      if (editingRow.value) {
        await options.saveItem({ ...payload, id: editingRow.value.id })
        showToast('更新成功', 'success')
      } else {
        await options.saveItem(payload)
        showToast('创建成功', 'success')
      }
      isDialogVisible.value = false
      fetchTableList()
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    tableList,
    isLoading,
    isDialogVisible,
    isDetailVisible,
    isSubmitting,
    editingRow,
    detailRow,
    keyword,
    statusFilter,
    pagination,
    formModel,
    fetchTableList,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleStatusFilterChange,
    handleCreateOpen,
    handleEditOpen,
    handleDetailOpen,
    handleDelete,
    handleSubmit,
  }
}
