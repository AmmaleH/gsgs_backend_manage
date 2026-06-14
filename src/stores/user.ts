import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { EStorageKey } from '@/constants'
import { ALL_PERMISSION_CODES, EUserRole } from '@/constants/permission'
import type { LoginParams, UserInfo } from '@/types'
import { normalizeMockUserInfo } from '@/utils/permission'
import { getStorageItem, removeStorageItem, setStorageItem } from '@/utils/storage'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function loadUserInfo(): UserInfo | null {
  const stored = getStorageItem<UserInfo | null>(EStorageKey.USER_INFO, null)
  const normalized = normalizeMockUserInfo(stored)
  // 刷新后升级旧版 localStorage 中的用户信息
  if (USE_MOCK && stored && normalized && stored.role !== EUserRole.SUPER_ADMIN) {
    setStorageItem(EStorageKey.USER_INFO, normalized)
  }
  return normalized
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getStorageItem(EStorageKey.TOKEN, null))
  const userInfo = ref<UserInfo | null>(loadUserInfo())

  const isLoggedIn = computed(() => !!token.value)

  function setLoginData(loginToken: string, info: UserInfo) {
    token.value = loginToken
    userInfo.value = info
    setStorageItem(EStorageKey.TOKEN, loginToken)
    setStorageItem(EStorageKey.USER_INFO, info)
  }

  function logout() {
    token.value = null
    userInfo.value = null
    removeStorageItem(EStorageKey.TOKEN)
    removeStorageItem(EStorageKey.USER_INFO)
  }

  async function login(params: LoginParams): Promise<boolean> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600))
      if (!params.username?.trim() || !params.password?.trim()) return false

      // 调试阶段：任意账号密码均可登录，统一按超级管理员处理
      setLoginData('mock-token-' + Date.now(), {
        id: 'debug-' + Date.now(),
        username: params.username.trim(),
        nickname: params.username.trim(),
        role: EUserRole.SUPER_ADMIN,
        permissions: [...ALL_PERMISSION_CODES],
      })
      return true
    }

    const { loginApi } = await import('@/api/auth')
    const res = await loginApi(params)
    setLoginData(res.data.token, res.data.userInfo)
    return true
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    setLoginData,
  }
})
