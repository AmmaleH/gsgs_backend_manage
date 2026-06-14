import { computed } from 'vue'

import { EPermissionCode } from '@/constants/permission'
import { useUserStore } from '@/stores/user'
import { checkManagePermission, checkPermission, isSuperAdmin } from '@/utils/permission'

export function usePermission() {
  const userStore = useUserStore()

  const isSuperAdminUser = computed(() => isSuperAdmin(userStore.userInfo))

  function hasPermission(permission: EPermissionCode | string): boolean {
    return checkPermission(userStore.userInfo, permission)
  }

  function hasManagePermission(module: 'agent' | 'knowledge' | 'basic-data' | 'permission'): boolean {
    return checkManagePermission(userStore.userInfo, module)
  }

  return {
    isSuperAdminUser,
    hasPermission,
    hasManagePermission,
  }
}
