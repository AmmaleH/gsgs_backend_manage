import type { ApiErrorBody, ClarifyPayload, QueryProgress, QueryResult, RunStatus } from '@/types/api'

export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar?: string
  role?: string
  permissions?: string[]
  roles?: string[]
  dataScopes?: import('@/types/api').DataScope[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  streaming?: boolean
  traceId?: string
  runId?: string
  runStatus?: RunStatus
  progress?: QueryProgress
  result?: QueryResult
  clarify?: ClarifyPayload
  error?: ApiErrorBody
  /** 待澄清时关联的 runId */
  pendingClarifyRunId?: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
}

/** @deprecated 使用 RoutingRuleItem */
export interface AgentItem {
  id: string
  name: string
  type: string
  description: string
  status: number
  updatedAt: string
}

export interface AccountPermissionItem {
  id: string
  username: string
  nickname: string
  role: string
  permissions: string[]
  status: number
  updatedAt: string
}

export interface PermissionDefItem {
  code: string
  name: string
  accountCount: number
}

export interface QuickTag {
  id: string
  label: string
  content: string
}

export interface ChatStreamOptions {
  message: string
  sessionId?: string
  onChunk: (chunk: string) => void
  onDone: () => void
  onError: (error: Error) => void
  signal?: AbortSignal
}
