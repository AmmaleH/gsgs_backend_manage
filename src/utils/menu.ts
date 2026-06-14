import type { MenuItemConfig } from '@/constants/permission'
import { MENU_CONFIG } from '@/constants/permission'
import type { UserInfo } from '@/types'
import { checkPermission } from '@/utils/permission'

/** 根据用户权限过滤可见菜单 */
export function getVisibleMenus(userInfo: UserInfo | null | undefined): MenuItemConfig[] {
  const result: MenuItemConfig[] = []

  for (const item of MENU_CONFIG) {
    if (item.children?.length) {
      const visibleChildren = item.children.filter(
        (child) => !child.permission || checkPermission(userInfo, child.permission),
      )
      if (visibleChildren.length > 0) {
        result.push({ ...item, children: visibleChildren })
      }
      continue
    }

    if (!item.permission || checkPermission(userInfo, item.permission)) {
      result.push(item)
    }
  }

  return result
}
