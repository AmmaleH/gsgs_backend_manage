export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar?: string
  /** 用户角色 */
  role?: string
  /** 权限码列表（普通账号） */
  permissions?: string[]
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

export interface AgentItem {
  id: string
  name: string
  type: string
  description: string
  status: number
  updatedAt: string
}

export interface KnowledgeItem {
  id: string
  name: string
  type: string
  docCount: number
  status: number
  updatedAt: string
}

export interface BasicDataItem {
  id: string
  name: string
  type: string
  code: string
  status: number
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  streaming?: boolean
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
