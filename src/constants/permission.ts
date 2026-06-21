/** 用户角色 */
export enum EUserRole {
  /** 超级管理员，拥有全部页面与操作权限 */
  SUPER_ADMIN = 'super_admin',
  /** 普通账号，按权限码授权 */
  NORMAL = 'normal',
}

/** 管理权限码 */
export enum EPermissionCode {
  /** 智能对话 */
  CHAT = 'chat',
  /** Agent 管理-查看 */
  AGENT_VIEW = 'agent:view',
  /** Agent 管理-操作 */
  AGENT_MANAGE = 'agent:manage',
  /** 知识库管理-查看 */
  KNOWLEDGE_VIEW = 'knowledge:view',
  /** 知识库管理-操作 */
  KNOWLEDGE_MANAGE = 'knowledge:manage',
  /** 基础数据管理-查看 */
  BASIC_DATA_VIEW = 'basic-data:view',
  /** 基础数据管理-操作 */
  BASIC_DATA_MANAGE = 'basic-data:manage',
  /** 权限管理（仅超级管理员默认可见，也可赋权） */
  PERMISSION_MANAGE = 'permission:manage',
  /** 问数审计日志-查看 */
  QUERY_LOG_VIEW = 'query-log:view',
}

/** 超级管理员默认账号名（Mock） */
export const SUPER_ADMIN_USERNAME = 'admin'

/** 权限码 → 展示名称 */
export const PERMISSION_LABEL_MAP: Record<EPermissionCode, string> = {
  [EPermissionCode.CHAT]: '智能对话',
  [EPermissionCode.AGENT_VIEW]: 'Agent 管理-查看',
  [EPermissionCode.AGENT_MANAGE]: 'Agent 管理-操作',
  [EPermissionCode.KNOWLEDGE_VIEW]: '知识库管理-查看',
  [EPermissionCode.KNOWLEDGE_MANAGE]: '知识库管理-操作',
  [EPermissionCode.BASIC_DATA_VIEW]: '基础数据管理-查看',
  [EPermissionCode.BASIC_DATA_MANAGE]: '基础数据管理-操作',
  [EPermissionCode.PERMISSION_MANAGE]: '权限管理',
  [EPermissionCode.QUERY_LOG_VIEW]: '问数审计日志-查看',
}

/** 全部权限码列表（派生自 enum） */
export const ALL_PERMISSION_CODES = Object.values(EPermissionCode)

/** 侧边栏菜单配置 */
export interface MenuItemConfig {
  path: string
  title: string
  icon: string
  /** 访问该菜单所需的任一权限码；超级管理员不受限 */
  permission?: EPermissionCode
  children?: MenuItemConfig[]
}

export const MENU_CONFIG: MenuItemConfig[] = [
  {
    path: '/chat',
    title: '智能对话',
    icon: 'ChatDotRound',
    permission: EPermissionCode.CHAT,
  },
  {
    path: 'manage',
    title: '系统管理',
    icon: 'Setting',
    children: [
      {
        path: '/query-logs',
        title: '问数审计日志',
        icon: 'Document',
        permission: EPermissionCode.QUERY_LOG_VIEW,
      },
      {
        path: '/agent',
        title: '场景路由规则',
        icon: 'Cpu',
        permission: EPermissionCode.AGENT_VIEW,
      },
      {
        path: '/knowledge',
        title: 'Prompt 配置',
        icon: 'Collection',
        permission: EPermissionCode.KNOWLEDGE_VIEW,
      },
      {
        path: '/basic-data',
        title: 'SQL 白名单',
        icon: 'DataLine',
        permission: EPermissionCode.BASIC_DATA_VIEW,
      },
      {
        path: '/permission',
        title: '权限管理',
        icon: 'UserFilled',
        permission: EPermissionCode.PERMISSION_MANAGE,
      },
    ],
  },
]
