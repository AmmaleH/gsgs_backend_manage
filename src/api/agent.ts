import type { AgentItem, PageParams, PageResult } from '@/types'
import { del, get, post, put } from '@/utils/request'

export function getAgentListApi(params: PageParams & { type?: string; keyword?: string }) {
  return get<PageResult<AgentItem>>('/agent/list', { params })
}

export function getAgentDetailApi(id: string) {
  return get<AgentItem>(`/agent/${id}`)
}

export function createAgentApi(data: Partial<AgentItem>) {
  return post<AgentItem>('/agent/create', data)
}

export function updateAgentApi(id: string, data: Partial<AgentItem>) {
  return put<AgentItem>(`/agent/${id}`, data)
}

export function deleteAgentApi(id: string) {
  return del<void>(`/agent/${id}`)
}
