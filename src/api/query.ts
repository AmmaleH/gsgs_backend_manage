import type {
  CreateRunRequest,
  CreateRunResponse,
  QueryResult,
  QueryRunDetail,
  SessionItem,
  SessionMessage,
} from '@/types/api'
import {
  mockCreateRun,
  mockGetRun,
  mockGetSessionMessages,
  mockGetSessions,
  mockSyncQuery,
} from '@/mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function createQueryRunApi(body: CreateRunRequest): Promise<CreateRunResponse> {
  if (USE_MOCK) return mockCreateRun(body)
  const { post } = await import('@/utils/request')
  const res = await post<CreateRunResponse>('/v1/runs/query', body)
  return res.data
}

export async function getQueryRunApi(runId: string): Promise<QueryRunDetail> {
  if (USE_MOCK) return mockGetRun(runId)
  const { get } = await import('@/utils/request')
  const res = await get<QueryRunDetail>(`/v1/runs/${runId}`)
  return res.data
}

export async function syncQueryApi(question: string, sessionId: string): Promise<QueryResult> {
  if (USE_MOCK) return mockSyncQuery(question)
  const { post } = await import('@/utils/request')
  const res = await post<QueryResult>('/v1/query', { question, sessionId })
  return res.data
}

export async function getSessionsApi(): Promise<SessionItem[]> {
  if (USE_MOCK) return mockGetSessions()
  const { get } = await import('@/utils/request')
  const res = await get<SessionItem[]>('/v1/sessions')
  return res.data
}

export async function getSessionMessagesApi(sessionId: string): Promise<SessionMessage[]> {
  if (USE_MOCK) return mockGetSessionMessages(sessionId)
  const { get } = await import('@/utils/request')
  const res = await get<SessionMessage[]>(`/v1/sessions/${sessionId}/messages`)
  return res.data
}
