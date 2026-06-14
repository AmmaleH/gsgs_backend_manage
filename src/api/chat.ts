import type { ChatMessage, PageParams, PageResult } from '@/types'
import { get, post } from '@/utils/request'

export function getChatHistoryApi(params: PageParams & { sessionId?: string }) {
  return get<PageResult<ChatMessage>>('/chat/history', { params })
}

export function sendChatApi(message: string, sessionId?: string) {
  return post<{ content: string }>('/chat/send', { message, sessionId })
}

export function createSessionApi() {
  return post<{ sessionId: string }>('/chat/session')
}
