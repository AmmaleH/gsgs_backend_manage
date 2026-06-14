import type { AccountPermissionItem, PageParams, PageResult } from '@/types'
import { del, get, post, put } from '@/utils/request'

export function getAccountListApi(params: { keyword?: string } & Partial<PageParams>) {
  return get<PageResult<AccountPermissionItem>>('/permission/account/list', { params })
}

export function createAccountApi(data: Partial<AccountPermissionItem>) {
  return post<AccountPermissionItem>('/permission/account/create', data)
}

export function updateAccountApi(id: string, data: Partial<AccountPermissionItem>) {
  return put<AccountPermissionItem>(`/permission/account/${id}`, data)
}

export function deleteAccountApi(id: string) {
  return del<void>(`/permission/account/${id}`)
}

export function updateAccountPermissionsApi(id: string, permissions: string[]) {
  return put<void>(`/permission/account/${id}/permissions`, { permissions })
}

export function updatePermissionAccountsApi(code: string, accountIds: string[]) {
  return put<void>(`/permission/code/${code}/accounts`, { accountIds })
}
