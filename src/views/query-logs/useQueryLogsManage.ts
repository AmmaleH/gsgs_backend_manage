import { reactive, ref } from 'vue'

import { getQueryLogsApi, getTraceApi } from '@/api/admin'
import type { QueryLogItem, TraceDetail } from '@/types/api'
import { showToast } from '@/utils/message'

export function useQueryLogsManage() {
  const tableList = ref<QueryLogItem[]>([])
  const isLoading = ref(false)
  const keyword = ref('')
  const statusFilter = ref('')

  const pagination = reactive({
    page: 1,
    pageSize: 12,
    total: 0,
  })

  const isTraceVisible = ref(false)
  const isTraceLoading = ref(false)
  const traceDetail = ref<TraceDetail | null>(null)

  async function fetchTableList() {
    isLoading.value = true
    try {
      const res = await getQueryLogsApi({
        keyword: keyword.value.trim() || undefined,
        status: statusFilter.value || undefined,
        pageNo: pagination.page,
        pageSize: pagination.pageSize,
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

  async function handleTraceOpen(row: QueryLogItem) {
    isTraceVisible.value = true
    isTraceLoading.value = true
    traceDetail.value = null
    try {
      traceDetail.value = await getTraceApi(row.traceId)
    } catch {
      showToast('获取 Trace 详情失败', 'error')
      isTraceVisible.value = false
    } finally {
      isTraceLoading.value = false
    }
  }

  return {
    tableList,
    isLoading,
    keyword,
    statusFilter,
    pagination,
    isTraceVisible,
    isTraceLoading,
    traceDetail,
    fetchTableList,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleStatusFilterChange,
    handleTraceOpen,
  }
}
