import { reactive, ref } from 'vue'

import type { PageResult } from '@/types'
import { showConfirm, showToast } from '@/utils/message'
import { generateId, formatDateTime } from '@/utils/storage'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export interface ManageTab {
  label: string
  value: string
}

interface UseManageTableOptions<T extends { id: string; type: string; status: number; updatedAt: string; name: string }> {
  tabs: ManageTab[]
  defaultType: string
  entityName: string
  mockData: T[]
  /** 搜索匹配的字段，默认 name */
  searchKeys?: string[]
  /** 新建时的默认字段 */
  defaultCreateFields?: Partial<T>
  fetchList?: (params: { page: number; pageSize: number; type: string; keyword: string }) => Promise<PageResult<T>>
  getDetail?: (id: string) => Promise<T>
  createItem?: (data: Partial<T>) => Promise<T>
  updateItem?: (id: string, data: Partial<T>) => Promise<T>
  deleteItem?: (id: string) => Promise<void>
}

export function useManageTable<T extends { id: string; type: string; status: number; updatedAt: string; name: string }>(
  options: UseManageTableOptions<T>,
) {
  const activeTab = ref(options.defaultType)
  const tableList = ref<T[]>([])
  const isLoading = ref(false)
  const isDialogVisible = ref(false)
  const isDetailVisible = ref(false)
  const isDetailLoading = ref(false)
  const isSubmitting = ref(false)
  const editingRow = ref<T | null>(null)
  const detailRow = ref<T | null>(null)
  const keyword = ref('')

  const searchKeys = options.searchKeys ?? ['name']

  const pagination = reactive({
    page: 1,
    pageSize: 12,
    total: 0,
  })

  const formModel = reactive<Record<string, unknown>>({
    name: '',
    description: '',
    code: '',
    docCount: 0,
    status: 1,
  })

  function matchKeyword(item: T, searchText: string): boolean {
    const lower = searchText.toLowerCase()
    return searchKeys.some((key) => {
      const value = (item as Record<string, unknown>)[key]
      return String(value ?? '').toLowerCase().includes(lower)
    })
  }

  async function fetchTableList() {
    isLoading.value = true
    try {
      if (USE_MOCK || !options.fetchList) {
        await new Promise((r) => setTimeout(r, 300))
        let filtered = options.mockData.filter((item) => item.type === activeTab.value)
        if (keyword.value) {
          filtered = filtered.filter((item) => matchKeyword(item, keyword.value))
        }
        pagination.total = filtered.length
        const start = (pagination.page - 1) * pagination.pageSize
        tableList.value = filtered.slice(start, start + pagination.pageSize)
        return
      }

      const res = await options.fetchList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        type: activeTab.value,
        keyword: keyword.value,
      })
      tableList.value = res.list
      pagination.total = res.total
    } finally {
      isLoading.value = false
    }
  }

  function handleTabChange() {
    pagination.page = 1
    fetchTableList()
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

  function handleCreateOpen() {
    editingRow.value = null
    formModel.name = ''
    formModel.description = ''
    formModel.code = ''
    formModel.docCount = 0
    formModel.status = 1
    isDialogVisible.value = true
  }

  function handleEditOpen(row: T) {
    editingRow.value = row
    formModel.name = row.name
    formModel.description = (row as Record<string, unknown>).description ?? ''
    formModel.code = (row as Record<string, unknown>).code ?? ''
    formModel.docCount = (row as Record<string, unknown>).docCount ?? 0
    formModel.status = row.status
    isDialogVisible.value = true
  }

  async function handleDetailOpen(row: T) {
    detailRow.value = row
    isDetailVisible.value = true

    if (!options.getDetail || USE_MOCK) return

    isDetailLoading.value = true
    try {
      detailRow.value = await options.getDetail(row.id)
    } catch {
      showToast('获取详情失败', 'error')
    } finally {
      isDetailLoading.value = false
    }
  }

  async function handleDelete(row: T) {
    const confirmed = await showConfirm(`确定删除该${options.entityName}「${row.name}」吗？`)
    if (!confirmed) return

    if (USE_MOCK || !options.deleteItem) {
      const index = options.mockData.findIndex((item) => item.id === row.id)
      if (index >= 0) options.mockData.splice(index, 1)
    } else {
      await options.deleteItem(row.id)
    }

    showToast('删除成功', 'success')
    fetchTableList()
  }

  async function handleSubmit() {
    if (!formModel.name) {
      showToast('请输入名称', 'warning')
      return
    }

    isSubmitting.value = true
    try {
      const payload = {
        ...formModel,
        type: activeTab.value,
        updatedAt: formatDateTime(new Date()),
      } as Partial<T>

      if (editingRow.value) {
        if (USE_MOCK || !options.updateItem) {
          Object.assign(editingRow.value, payload)
        } else {
          await options.updateItem(editingRow.value.id, payload)
        }
        showToast('更新成功', 'success')
      } else {
        if (USE_MOCK || !options.createItem) {
          options.mockData.unshift({
            id: generateId(),
            ...options.defaultCreateFields,
            ...payload,
          } as T)
        } else {
          await options.createItem({ ...options.defaultCreateFields, ...payload })
        }
        showToast('创建成功', 'success')
      }

      isDialogVisible.value = false
      fetchTableList()
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    activeTab,
    tableList,
    isLoading,
    isDialogVisible,
    isDetailVisible,
    isDetailLoading,
    isSubmitting,
    editingRow,
    detailRow,
    keyword,
    pagination,
    formModel,
    fetchTableList,
    handleTabChange,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleCreateOpen,
    handleEditOpen,
    handleDetailOpen,
    handleDelete,
    handleSubmit,
  }
}
