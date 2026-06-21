import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { loginApi } from '@/api/auth'
import { EStorageKey } from '@/constants'
import { EUserRole } from '@/constants/permission'
import type { LoginParams, UserInfo } from '@/types'
import { normalizeMockUserInfo } from '@/utils/permission'
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function loadUserInfo(): UserInfo | null {
  const stored = getStorageItem<UserInfo | null>(EStorageKey.USER_INFO, null)
  const normalized = normalizeMockUserInfo(stored)
  if (USE_MOCK && stored && normalized && stored.role !== EUserRole.SUPER_ADMIN) {
    setStorageItem(EStorageKey.USER_INFO, normalized)
  }
  return normalized
}

function mapApiUser(user: import('@/types/api').ApiUser): UserInfo {
  return {
    id: user.userId,
    username: user.username,
    nickname: user.displayName,
    role: EUserRole.SUPER_ADMIN,
    permissions: user.permissions,
    roles: user.roles,
    dataScopes: user.dataScopes,
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getStorageItem(EStorageKey.TOKEN, null))
  const userInfo = ref<UserInfo | null>(loadUserInfo())

  const isLoggedIn = computed(() => !!token.value)

  function setLoginData(accessToken: string, info: UserInfo) {
    token.value = accessToken
    userInfo.value = USE_MOCK ? normalizeMockUserInfo(info) : info
    setStorageItem(EStorageKey.TOKEN, accessToken)
    setStorageItem(EStorageKey.USER_INFO, userInfo.value)
  }

  function logout() {
    token.value = null
    userInfo.value = null
    removeStorageItem(EStorageKey.TOKEN)
    removeStorageItem(EStorageKey.USER_INFO)
  }

  async function login(params: LoginParams): Promise<boolean> {
    if (!params.username?.trim() || !params.password?.trim()) return false

    if (USE_MOCK) {
      const res = await loginApi(params)
      setLoginData(res.accessToken, mapApiUser(res.user))
      return true
    }

    const res = await loginApi(params)
    setLoginData(res.accessToken, mapApiUser(res.user))
    return true
  }

  return { token, userInfo, isLoggedIn, login, logout, setLoginData }
})
