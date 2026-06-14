/** 格式化记录状态 */
export function formatRecordStatus(status: unknown): string {
  return status === 1 ? '启用' : '禁用'
}

const AGENT_TYPE_LABEL: Record<string, string> = {
  qa: '问答 Agent',
  digital_human: '数字人 Agent',
  data_query: '问数 Agent',
}

const KNOWLEDGE_TYPE_LABEL: Record<string, string> = {
  digital_human: '数字人知识库',
  qa: '问答知识库',
}

const BASIC_DATA_TYPE_LABEL: Record<string, string> = {
  digital_human: '数字人',
  data_query: '问数',
  qa: '问答',
}

export function formatAgentType(type: unknown): string {
  return AGENT_TYPE_LABEL[String(type)] ?? String(type)
}

export function formatKnowledgeType(type: unknown): string {
  return KNOWLEDGE_TYPE_LABEL[String(type)] ?? String(type)
}

export function formatBasicDataType(type: unknown): string {
  return BASIC_DATA_TYPE_LABEL[String(type)] ?? String(type)
}
