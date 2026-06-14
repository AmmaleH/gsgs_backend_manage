import { EPermissionCode, EUserRole, SUPER_ADMIN_USERNAME } from '@/constants/permission'
import type { UserInfo } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 是否为 Mock 调试模式（调试阶段跳过权限限制） */
export function isDebugMockMode(): boolean {
  return USE_MOCK
}

/** 调试阶段：将本地用户信息统一提升为超级管理员 */
export function normalizeMockUserInfo(userInfo: UserInfo | null | undefined): UserInfo | null {
  if (!userInfo) return null
  if (!USE_MOCK) return userInfo
  return {
    ...userInfo,
    role: EUserRole.SUPER_ADMIN,
    permissions: Object.values(EPermissionCode),
  }
}

/** 是否为超级管理员 */
export function isSuperAdmin(userInfo: UserInfo | null | undefined): boolean {
  if (!userInfo) return false
  if (USE_MOCK) return true
  return userInfo.role === EUserRole.SUPER_ADMIN || userInfo.username === SUPER_ADMIN_USERNAME
}

/** 当前用户是否拥有指定权限（超级管理员恒为 true；Mock 调试阶段恒为 true） */
export function checkPermission(
  userInfo: UserInfo | null | undefined,
  _permission: EPermissionCode | string,
): boolean {
  if (USE_MOCK) return true
  if (isSuperAdmin(userInfo)) return true
  return userInfo?.permissions?.includes(_permission as EPermissionCode) ?? false
}

/** 是否拥有任一权限 */
export function checkAnyPermission(
  userInfo: UserInfo | null | undefined,
  permissions: EPermissionCode[],
): boolean {
  if (isSuperAdmin(userInfo)) return true
  return permissions.some((p) => checkPermission(userInfo, p))
}

/** 是否拥有模块操作权限 */
export function checkManagePermission(
  userInfo: UserInfo | null | undefined,
  module: 'agent' | 'knowledge' | 'basic-data' | 'permission',
): boolean {
  const map: Record<string, EPermissionCode> = {
    agent: EPermissionCode.AGENT_MANAGE,
    knowledge: EPermissionCode.KNOWLEDGE_MANAGE,
    'basic-data': EPermissionCode.BASIC_DATA_MANAGE,
    permission: EPermissionCode.PERMISSION_MANAGE,
  }
  return checkPermission(userInfo, map[module])
}
