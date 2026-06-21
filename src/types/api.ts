/** API 错误结构 */
export interface ApiErrorBody {
  code: string
  message: string
  traceId: string
  retryable: boolean
}

/** 登录 */
export interface LoginRequest {
  username: string
  password: string
}

export interface DataScope {
  scopeCode: string
  scopeName: string
  roadIds: string[]
  stationIds: string[]
  gantryIds: string[]
}

export interface ApiUser {
  userId: string
  username: string
  displayName: string
  roles: string[]
  permissions: string[]
  dataScopes: DataScope[]
}

export interface LoginResponse {
  accessToken: string
  expiresIn: number
  forceChangePassword: boolean
  user: ApiUser
}

/** 修改密码 */
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

/** 问数任务 */
export type RunStatus =
  | 'accepted'
  | 'running'
  | 'clarify'
  | 'success'
  | 'partial'
  | 'failed'
  | 'blocked'
  | 'timeout'

export interface QueryProgressStep {
  stage: string
  name: string
  status: string
}

export interface QueryProgress {
  percent: number
  steps: QueryProgressStep[]
}

export interface QueryTableColumn {
  field: string
  label: string
  dataType: 'string' | 'integer' | 'decimal' | 'percent' | 'date' | 'datetime'
  unit?: string
  precision?: number
}

export interface QueryTable {
  columns: QueryTableColumn[]
  rows: Record<string, unknown>[]
  total: number
}

export interface QueryProvenance {
  scenarioId: string
  routeType: string
  sources: string[]
  metricDefinition: string
  filters: string[]
}

export interface QueryResult {
  summary: string
  queryType: 'single_value' | 'table' | 'chart' | 'mixed' | 'clarification' | 'unsupported'
  table?: QueryTable
  provenance?: QueryProvenance
  warning?: string
}

export interface ClarifyOption {
  id: string
  label: string
}

export interface ClarifyPayload {
  message: string
  options: ClarifyOption[]
}

export interface CreateRunRequest {
  question: string
  sessionId: string
  context?: Record<string, string>
  clarifyReply?: {
    runId: string
    selectedOptionId: string
    text: string
  }
}

export interface CreateRunResponse {
  runId: string
  traceId: string
  status: RunStatus
  pollAfterMs: number
}

export interface QueryRunDetail {
  runId: string
  traceId: string
  status: RunStatus
  stage: string
  progress?: QueryProgress
  result?: QueryResult
  clarify?: ClarifyPayload
  error?: ApiErrorBody
  createdAt: string
  updatedAt: string
}

/** 会话 */
export interface SessionItem {
  sessionId: string
  title: string
  lastMessageAt: string
  messageCount: number
}

export interface SessionMessage {
  messageId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  traceId?: string
  resultSnapshot?: QueryResult
}

/** 管理端分页 */
export interface AdminPageResult<T> {
  pageNo: number
  pageSize: number
  total: number
  records: T[]
}

export interface QueryLogItem {
  runId: string
  traceId: string
  question: string
  status: RunStatus
  scenarioId: string
  routeType: string
  durationMs: number
  createdAt: string
}

export interface TraceDetail {
  traceId: string
  runId: string
  question: string
  status: RunStatus
  durationMs: number
  stageLogs: { stage: string; name: string; status: string; durationMs: number }[]
  planJson?: string
  resultJson?: string
  error?: ApiErrorBody
}

export interface RoutingRuleItem {
  id: string
  scenarioId: string
  routeType: string
  priority: number
  requiredSlots: string[]
  status: 'draft' | 'published'
  updatedAt: string
}

export interface PromptItem {
  id: string
  promptKey: string
  version: string
  content: string
  status: 'draft' | 'published'
  updatedAt: string
}

export interface SqlTableItem {
  id: string
  tableName: string
  businessDomain: string
  allowedColumns: string[]
  status: 'draft' | 'published'
  updatedAt: string
}

export interface AdminUserItem {
  id: string
  userId: string
  username: string
  displayName: string
  enabled: boolean
  roles: string[]
  updatedAt: string
}

export interface AdminRoleItem {
  id: string
  roleCode: string
  roleName: string
  permissions: string[]
  updatedAt: string
}

export interface AdminPermissionItem {
  code: string
  name: string
  module: string
}
