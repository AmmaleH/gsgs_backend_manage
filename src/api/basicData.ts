import type { BasicDataItem, PageParams, PageResult } from '@/types'
import { del, get, post, put } from '@/utils/request'

export function getBasicDataListApi(params: PageParams & { type?: string; keyword?: string }) {
  return get<PageResult<BasicDataItem>>('/basic-data/list', { params })
}

export function getBasicDataDetailApi(id: string) {
  return get<BasicDataItem>(`/basic-data/${id}`)
}

export function createBasicDataApi(data: Partial<BasicDataItem>) {
  return post<BasicDataItem>('/basic-data/create', data)
}

export function updateBasicDataApi(id: string, data: Partial<BasicDataItem>) {
  return put<BasicDataItem>(`/basic-data/${id}`, data)
}

export function deleteBasicDataApi(id: string) {
  return del<void>(`/basic-data/${id}`)
}
