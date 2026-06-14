import {
  createBasicDataApi,
  deleteBasicDataApi,
  getBasicDataDetailApi,
  getBasicDataListApi,
  updateBasicDataApi,
} from '@/api/basicData'
import { EBasicDataType } from '@/constants'
import { useManageTable } from '@/composables/useManageTable'
import type { BasicDataItem } from '@/types'

const MOCK_DATA: BasicDataItem[] = [
  { id: '1', name: '数字人形象-小G', type: EBasicDataType.DIGITAL_HUMAN, code: 'DH_001', status: 1, updatedAt: '2026-06-10 10:00:00' },
  { id: '2', name: '数字人形象-导览员', type: EBasicDataType.DIGITAL_HUMAN, code: 'DH_002', status: 1, updatedAt: '2026-06-11 11:00:00' },
  { id: '3', name: '销售数据模型', type: EBasicDataType.DATA_QUERY, code: 'DQ_001', status: 1, updatedAt: '2026-06-12 09:00:00' },
  { id: '4', name: '运营指标模型', type: EBasicDataType.DATA_QUERY, code: 'DQ_002', status: 1, updatedAt: '2026-06-12 14:00:00' },
  { id: '5', name: '通用问答模板', type: EBasicDataType.QA, code: 'QA_001', status: 1, updatedAt: '2026-06-13 10:00:00' },
  { id: '6', name: '客服话术模板', type: EBasicDataType.QA, code: 'QA_002', status: 0, updatedAt: '2026-06-13 15:00:00' },
]

export function useBasicDataManage() {
  return useManageTable<BasicDataItem>({
    tabs: [
      { label: '数字人', value: EBasicDataType.DIGITAL_HUMAN },
      { label: '问数', value: EBasicDataType.DATA_QUERY },
      { label: '问答', value: EBasicDataType.QA },
    ],
    defaultType: EBasicDataType.DIGITAL_HUMAN,
    entityName: '基础数据',
    mockData: MOCK_DATA,
    searchKeys: ['name', 'code'],
    fetchList: async (params) => {
      const res = await getBasicDataListApi(params)
      return res.data
    },
    getDetail: async (id) => {
      const res = await getBasicDataDetailApi(id)
      return res.data
    },
    createItem: async (data) => {
      const res = await createBasicDataApi(data)
      return res.data
    },
    updateItem: async (id, data) => {
      const res = await updateBasicDataApi(id, data)
      return res.data
    },
    deleteItem: async (id) => {
      await deleteBasicDataApi(id)
    },
  })
}
