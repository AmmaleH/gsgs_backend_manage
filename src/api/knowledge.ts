import type { KnowledgeItem, PageParams, PageResult } from '@/types'
import { del, get, post, put } from '@/utils/request'

export function getKnowledgeListApi(params: PageParams & { type?: string; keyword?: string }) {
  return get<PageResult<KnowledgeItem>>('/knowledge/list', { params })
}

export function getKnowledgeDetailApi(id: string) {
  return get<KnowledgeItem>(`/knowledge/${id}`)
}

export function createKnowledgeApi(data: Partial<KnowledgeItem>) {
  return post<KnowledgeItem>('/knowledge/create', data)
}

export function updateKnowledgeApi(id: string, data: Partial<KnowledgeItem>) {
  return put<KnowledgeItem>(`/knowledge/${id}`, data)
}

export function deleteKnowledgeApi(id: string) {
  return del<void>(`/knowledge/${id}`)
}
