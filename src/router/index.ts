import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { EStorageKey } from '@/constants'
import { EPermissionCode } from '@/constants/permission'
import type { UserInfo } from '@/types'
import { checkPermission, normalizeMockUserInfo } from '@/utils/permission'
import { getStorageItem } from '@/utils/storage'
import { showToast } from '@/utils/message'

function isLoggedIn(): boolean {
  return !!getStorageItem<string | null>(EStorageKey.TOKEN, null)
}

function getUserInfo(): UserInfo | null {
  return normalizeMockUserInfo(getStorageItem<UserInfo | null>(EStorageKey.USER_INFO, null))
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    redirect: () => (isLoggedIn() ? '/chat' : '/login'),
    children: [
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
        meta: { title: '智能对话', permission: EPermissionCode.CHAT },
      },
      {
        path: 'query-logs',
        name: 'QueryLogs',
        component: () => import('@/views/query-logs/index.vue'),
        meta: { title: '问数审计日志', permission: EPermissionCode.QUERY_LOG_VIEW },
      },
      {
        path: 'agent',
        name: 'AgentManage',
        component: () => import('@/views/agent/index.vue'),
        meta: { title: '场景路由规则', permission: EPermissionCode.AGENT_VIEW },
      },
      {
        path: 'knowledge',
        name: 'KnowledgeManage',
        component: () => import('@/views/knowledge/index.vue'),
        meta: { title: 'Prompt 配置', permission: EPermissionCode.KNOWLEDGE_VIEW },
      },
      {
        path: 'basic-data',
        name: 'BasicDataManage',
        component: () => import('@/views/basic-data/index.vue'),
        meta: { title: 'SQL 白名单', permission: EPermissionCode.BASIC_DATA_VIEW },
      },
      {
        path: 'permission',
        name: 'PermissionManage',
        component: () => import('@/views/permission/index.vue'),
        meta: { title: '权限管理', permission: EPermissionCode.PERMISSION_MANAGE },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'GS智能管理系统'} - GS智能管理系统`

  const loggedIn = isLoggedIn()

  if (to.path === '/login' && loggedIn) {
    next({ path: '/chat' })
    return
  }

  if (to.meta.public) {
    next()
    return
  }

  if (!loggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  const requiredPermission = to.meta.permission as EPermissionCode | undefined
  if (requiredPermission && !checkPermission(getUserInfo(), requiredPermission)) {
    showToast('暂无访问权限', 'warning')
    next({ path: '/chat' })
    return
  }

  next()
})

export default router
