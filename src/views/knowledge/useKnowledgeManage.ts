import { deletePromptApi, getPromptsApi, savePromptApi } from '@/api/admin'
import { useAdminCrud } from '@/composables/useAdminCrud'
import type { PromptItem } from '@/types/api'

export function useKnowledgeManage() {
  return useAdminCrud<PromptItem>({
    entityName: 'Prompt',
    fetchList: (params) =>
      getPromptsApi({
        keyword: params.keyword,
        pageNo: params.pageNo,
        pageSize: params.pageSize,
      }),
    saveItem: savePromptApi,
    deleteItem: deletePromptApi,
    getTitle: (item) => item.promptKey,
    createDefaultForm: () => ({
      promptKey: '',
      version: 'v1',
      content: '',
      status: 'draft',
    }),
    rowToForm: (row) => ({
      promptKey: row.promptKey,
      version: row.version,
      content: row.content,
      status: row.status,
    }),
    formToPayload: (form) => ({
      promptKey: String(form.promptKey ?? '').trim(),
      version: String(form.version ?? 'v1').trim(),
      content: String(form.content ?? ''),
      status: form.status as PromptItem['status'],
    }),
    validateForm: (form) => {
      if (!String(form.promptKey ?? '').trim()) return '请输入 Prompt Key'
      if (!String(form.content ?? '').trim()) return '请输入 Prompt 内容'
      return null
    },
  })
}
