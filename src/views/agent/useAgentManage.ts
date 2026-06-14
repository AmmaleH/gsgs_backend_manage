import {
  createAgentApi,
  deleteAgentApi,
  getAgentDetailApi,
  getAgentListApi,
  updateAgentApi,
} from '@/api/agent'
import { EAgentType } from '@/constants'
import { useManageTable } from '@/composables/useManageTable'
import type { AgentItem } from '@/types'

const MOCK_DATA: AgentItem[] = [
  { id: '1', name: '通用问答 Agent', type: EAgentType.QA, description: '处理通用问答场景', status: 1, updatedAt: '2026-06-10 10:00:00' },
  { id: '2', name: '客服问答 Agent', type: EAgentType.QA, description: '面向客服场景的问答', status: 1, updatedAt: '2026-06-11 14:30:00' },
  { id: '3', name: '小G数字人', type: EAgentType.DIGITAL_HUMAN, description: '前台数字人交互 Agent', status: 1, updatedAt: '2026-06-12 09:00:00' },
  { id: '4', name: '导览数字人', type: EAgentType.DIGITAL_HUMAN, description: '展厅导览数字人', status: 0, updatedAt: '2026-06-12 11:00:00' },
  { id: '5', name: '销售数据问数', type: EAgentType.DATA_QUERY, description: '销售数据分析查询', status: 1, updatedAt: '2026-06-13 16:00:00' },
  { id: '6', name: '运营数据问数', type: EAgentType.DATA_QUERY, description: '运营指标数据查询', status: 1, updatedAt: '2026-06-13 17:00:00' },
]

export function useAgentManage() {
  return useManageTable<AgentItem>({
    tabs: [
      { label: '问答 Agent', value: EAgentType.QA },
      { label: '数字人 Agent', value: EAgentType.DIGITAL_HUMAN },
      { label: '问数 Agent', value: EAgentType.DATA_QUERY },
    ],
    defaultType: EAgentType.QA,
    entityName: 'Agent',
    mockData: MOCK_DATA,
    fetchList: async (params) => {
      const res = await getAgentListApi(params)
      return res.data
    },
    getDetail: async (id) => {
      const res = await getAgentDetailApi(id)
      return res.data
    },
    createItem: async (data) => {
      const res = await createAgentApi(data)
      return res.data
    },
    updateItem: async (id, data) => {
      const res = await updateAgentApi(id, data)
      return res.data
    },
    deleteItem: async (id) => {
      await deleteAgentApi(id)
    },
  })
}
