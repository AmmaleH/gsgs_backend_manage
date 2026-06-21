import type {
  AdminPageResult,
  AdminPermissionItem,
  AdminRoleItem,
  AdminUserItem,
  PromptItem,
  QueryLogItem,
  RoutingRuleItem,
  SqlTableItem,
  TraceDetail,
} from '@/types/api'
import {
  MOCK_ADMIN_PERMISSIONS,
  MOCK_ADMIN_ROLES,
  MOCK_ADMIN_USERS,
  MOCK_PROMPTS,
  MOCK_ROUTING_RULES,
  MOCK_SQL_TABLES,
  mockGetQueryLogs,
  mockGetTrace,
  paginateRecords,
} from '@/mock'
import { formatDateTime, generateId } from '@/utils/storage'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function getQueryLogsApi(params: {
  keyword?: string
  status?: string
  pageNo: number
  pageSize: number
}): Promise<AdminPageResult<QueryLogItem>> {
  if (USE_MOCK) return mockGetQueryLogs(params)
  const { get } = await import('@/utils/request')
  const res = await get<AdminPageResult<QueryLogItem>>('/v1/admin/query-logs', { params })
  return res.data
}

export async function getTraceApi(traceId: string): Promise<TraceDetail> {
  if (USE_MOCK) return mockGetTrace(traceId)
  const { get } = await import('@/utils/request')
  const res = await get<TraceDetail>(`/v1/admin/traces/${traceId}`)
  return res.data
}

export async function getRoutingRulesApi(params: {
  keyword?: string
  pageNo: number
  pageSize: number
}): Promise<AdminPageResult<RoutingRuleItem>> {
  if (USE_MOCK) {
    let list = [...MOCK_ROUTING_RULES]
    if (params.keyword) {
      const k = params.keyword.toLowerCase()
      list = list.filter((i) => i.scenarioId.toLowerCase().includes(k))
    }
    return paginateRecords(list, params.pageNo, params.pageSize)
  }
  const { get } = await import('@/utils/request')
  const res = await get<AdminPageResult<RoutingRuleItem>>('/v1/admin/routing-rules', { params })
  return res.data
}

export async function saveRoutingRuleApi(data: Partial<RoutingRuleItem>): Promise<RoutingRuleItem> {
  if (USE_MOCK) {
    if (data.id) {
      const idx = MOCK_ROUTING_RULES.findIndex((i) => i.id === data.id)
      if (idx >= 0) Object.assign(MOCK_ROUTING_RULES[idx], data, { updatedAt: formatDateTime(new Date()) })
      return MOCK_ROUTING_RULES[idx]
    }
    const item: RoutingRuleItem = {
      id: generateId(),
      scenarioId: data.scenarioId ?? '',
      routeType: data.routeType ?? 'SQL',
      priority: data.priority ?? 100,
      requiredSlots: data.requiredSlots ?? [],
      status: data.status ?? 'draft',
      updatedAt: formatDateTime(new Date()),
    }
    MOCK_ROUTING_RULES.unshift(item)
    return item
  }
  const { post } = await import('@/utils/request')
  const res = await post<RoutingRuleItem>('/v1/admin/routing-rules', data)
  return res.data
}

export async function deleteRoutingRuleApi(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_ROUTING_RULES.findIndex((i) => i.id === id)
    if (idx >= 0) MOCK_ROUTING_RULES.splice(idx, 1)
    return
  }
  const { del } = await import('@/utils/request')
  await del(`/v1/admin/routing-rules/${id}`)
}

export async function getPromptsApi(params: {
  keyword?: string
  pageNo: number
  pageSize: number
}): Promise<AdminPageResult<PromptItem>> {
  if (USE_MOCK) {
    let list = [...MOCK_PROMPTS]
    if (params.keyword) {
      const k = params.keyword.toLowerCase()
      list = list.filter((i) => i.promptKey.toLowerCase().includes(k))
    }
    return paginateRecords(list, params.pageNo, params.pageSize)
  }
  const { get } = await import('@/utils/request')
  const res = await get<AdminPageResult<PromptItem>>('/v1/admin/prompts', { params })
  return res.data
}

export async function savePromptApi(data: Partial<PromptItem>): Promise<PromptItem> {
  if (USE_MOCK) {
    if (data.id) {
      const idx = MOCK_PROMPTS.findIndex((i) => i.id === data.id)
      if (idx >= 0) Object.assign(MOCK_PROMPTS[idx], data, { updatedAt: formatDateTime(new Date()) })
      return MOCK_PROMPTS[idx]
    }
    const item: PromptItem = {
      id: generateId(),
      promptKey: data.promptKey ?? '',
      version: data.version ?? 'v1',
      content: data.content ?? '',
      status: data.status ?? 'draft',
      updatedAt: formatDateTime(new Date()),
    }
    MOCK_PROMPTS.unshift(item)
    return item
  }
  const { post } = await import('@/utils/request')
  const res = await post<PromptItem>('/v1/admin/prompts', data)
  return res.data
}

export async function deletePromptApi(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_PROMPTS.findIndex((i) => i.id === id)
    if (idx >= 0) MOCK_PROMPTS.splice(idx, 1)
    return
  }
  const { del } = await import('@/utils/request')
  await del(`/v1/admin/prompts/${id}`)
}

export async function getSqlTablesApi(params: {
  keyword?: string
  pageNo: number
  pageSize: number
}): Promise<AdminPageResult<SqlTableItem>> {
  if (USE_MOCK) {
    let list = [...MOCK_SQL_TABLES]
    if (params.keyword) {
      const k = params.keyword.toLowerCase()
      list = list.filter((i) => i.tableName.toLowerCase().includes(k))
    }
    return paginateRecords(list, params.pageNo, params.pageSize)
  }
  const { get } = await import('@/utils/request')
  const res = await get<AdminPageResult<SqlTableItem>>('/v1/admin/sql/tables', { params })
  return res.data
}

export async function saveSqlTableApi(data: Partial<SqlTableItem>): Promise<SqlTableItem> {
  if (USE_MOCK) {
    if (data.id) {
      const idx = MOCK_SQL_TABLES.findIndex((i) => i.id === data.id)
      if (idx >= 0) Object.assign(MOCK_SQL_TABLES[idx], data, { updatedAt: formatDateTime(new Date()) })
      return MOCK_SQL_TABLES[idx]
    }
    const item: SqlTableItem = {
      id: generateId(),
      tableName: data.tableName ?? '',
      businessDomain: data.businessDomain ?? 'traffic',
      allowedColumns: data.allowedColumns ?? [],
      status: data.status ?? 'draft',
      updatedAt: formatDateTime(new Date()),
    }
    MOCK_SQL_TABLES.unshift(item)
    return item
  }
  const { post } = await import('@/utils/request')
  const res = await post<SqlTableItem>('/v1/admin/sql/tables', data)
  return res.data
}

export async function deleteSqlTableApi(id: string): Promise<void> {
  if (USE_MOCK) {
    const idx = MOCK_SQL_TABLES.findIndex((i) => i.id === id)
    if (idx >= 0) MOCK_SQL_TABLES.splice(idx, 1)
    return
  }
  const { del } = await import('@/utils/request')
  await del(`/v1/admin/sql/tables/${id}`)
}

export async function getAdminUsersApi(params: {
  keyword?: string
  pageNo: number
  pageSize: number
}): Promise<AdminPageResult<AdminUserItem>> {
  if (USE_MOCK) {
    let list = [...MOCK_ADMIN_USERS]
    if (params.keyword) {
      const k = params.keyword.toLowerCase()
      list = list.filter(
        (i) => i.username.toLowerCase().includes(k) || i.displayName.toLowerCase().includes(k),
      )
    }
    return paginateRecords(list, params.pageNo, params.pageSize)
  }
  const { get } = await import('@/utils/request')
  const res = await get<AdminPageResult<AdminUserItem>>('/v1/admin/users', { params })
  return res.data
}

export async function getAdminRolesApi(): Promise<AdminRoleItem[]> {
  if (USE_MOCK) return [...MOCK_ADMIN_ROLES]
  const { get } = await import('@/utils/request')
  const res = await get<AdminRoleItem[]>('/v1/admin/roles')
  return res.data
}

export async function getAdminPermissionsApi(): Promise<AdminPermissionItem[]> {
  if (USE_MOCK) return [...MOCK_ADMIN_PERMISSIONS]
  const { get } = await import('@/utils/request')
  const res = await get<AdminPermissionItem[]>('/v1/admin/permissions')
  return res.data
}
