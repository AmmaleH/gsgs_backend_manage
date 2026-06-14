import type { LoginParams, LoginResult } from '@/types'
import { post } from '@/utils/request'

export function loginApi(params: LoginParams) {
  return post<LoginResult>('/auth/login', params)
}

export function logoutApi() {
  return post<void>('/auth/logout')
}

export function getUserInfoApi() {
  return post<{ userInfo: LoginResult['userInfo'] }>('/auth/userinfo')
}
