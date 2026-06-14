import {
  createKnowledgeApi,
  deleteKnowledgeApi,
  getKnowledgeDetailApi,
  getKnowledgeListApi,
  updateKnowledgeApi,
} from '@/api/knowledge'
import { EKnowledgeType } from '@/constants'
import { useManageTable } from '@/composables/useManageTable'
import type { KnowledgeItem } from '@/types'

const MOCK_DATA: KnowledgeItem[] = [
  { id: '1', name: '数字人产品知识库', type: EKnowledgeType.DIGITAL_HUMAN, docCount: 128, status: 1, updatedAt: '2026-06-10 10:00:00' },
  { id: '2', name: '数字人 FAQ 库', type: EKnowledgeType.DIGITAL_HUMAN, docCount: 56, status: 1, updatedAt: '2026-06-11 14:00:00' },
  { id: '3', name: '通用问答知识库', type: EKnowledgeType.QA, docCount: 320, status: 1, updatedAt: '2026-06-12 09:00:00' },
  { id: '4', name: '客服问答知识库', type: EKnowledgeType.QA, docCount: 89, status: 1, updatedAt: '2026-06-12 15:00:00' },
]

export function useKnowledgeManage() {
  return useManageTable<KnowledgeItem>({
    tabs: [
      { label: '数字人知识库', value: EKnowledgeType.DIGITAL_HUMAN },
      { label: '问答知识库', value: EKnowledgeType.QA },
    ],
    defaultType: EKnowledgeType.DIGITAL_HUMAN,
    entityName: '知识库',
    mockData: MOCK_DATA,
    defaultCreateFields: { docCount: 0 },
    fetchList: async (params) => {
      const res = await getKnowledgeListApi(params)
      return res.data
    },
    getDetail: async (id) => {
      const res = await getKnowledgeDetailApi(id)
      return res.data
    },
    createItem: async (data) => {
      const res = await createKnowledgeApi(data)
      return res.data
    },
    updateItem: async (id, data) => {
      const res = await updateKnowledgeApi(id, data)
      return res.data
    },
    deleteItem: async (id) => {
      await deleteKnowledgeApi(id)
    },
  })
}
