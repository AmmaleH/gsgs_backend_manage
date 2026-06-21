import type { LoginRequest, LoginResponse, ApiUser } from '@/types/api'
import { mockGetMe, mockLogin } from '@/mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function loginApi(params: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) return mockLogin(params)
  const { post } = await import('@/utils/request')
  const res = await post<LoginResponse>('/v1/auth/login', params)
  return res.data
}

export async function getMeApi(): Promise<ApiUser> {
  if (USE_MOCK) return mockGetMe()
  const { get } = await import('@/utils/request')
  const res = await get<ApiUser>('/v1/auth/me')
  return res.data
}

export async function logoutApi(): Promise<void> {
  if (USE_MOCK) return
  const { post } = await import('@/utils/request')
  await post('/v1/auth/logout')
}
