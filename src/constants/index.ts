/** 本地存储 Key */
export enum EStorageKey {
  /** 登录 Token */
  TOKEN = 'gs_token',
  /** 用户信息 */
  USER_INFO = 'gs_user_info',
  /** 是否已展示欢迎动画 */
  WELCOME_SHOWN = 'gs_welcome_shown',
  /** 快捷标签 */
  QUICK_TAGS = 'gs_quick_tags',
  /** Mock 账号权限数据 */
  ACCOUNT_PERMISSIONS = 'gs_account_permissions',
}

/** Agent 类型 */
export enum EAgentType {
  QA = 'qa',
  DIGITAL_HUMAN = 'digital_human',
  DATA_QUERY = 'data_query',
}

/** 知识库类型 */
export enum EKnowledgeType {
  DIGITAL_HUMAN = 'digital_human',
  QA = 'qa',
}

/** 基础数据类型 */
export enum EBasicDataType {
  DIGITAL_HUMAN = 'digital_human',
  DATA_QUERY = 'data_query',
  QA = 'qa',
}

/** 消息角色 */
export enum EMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

/** 通用状态 */
export enum ERecordStatus {
  ENABLED = 1,
  DISABLED = 0,
}
