import {
  deleteRoutingRuleApi,
  getRoutingRulesApi,
  saveRoutingRuleApi,
} from '@/api/admin'
import { useAdminCrud } from '@/composables/useAdminCrud'
import type { RoutingRuleItem } from '@/types/api'

export function useAgentManage() {
  return useAdminCrud<RoutingRuleItem>({
    entityName: '路由规则',
    fetchList: (params) =>
      getRoutingRulesApi({
        keyword: params.keyword,
        pageNo: params.pageNo,
        pageSize: params.pageSize,
      }),
    saveItem: saveRoutingRuleApi,
    deleteItem: deleteRoutingRuleApi,
    getTitle: (item) => item.scenarioId,
    createDefaultForm: () => ({
      scenarioId: '',
      routeType: 'SQL',
      priority: 100,
      requiredSlotsText: '',
      status: 'draft',
    }),
    rowToForm: (row) => ({
      scenarioId: row.scenarioId,
      routeType: row.routeType,
      priority: row.priority,
      requiredSlotsText: row.requiredSlots.join(', '),
      status: row.status,
    }),
    formToPayload: (form) => ({
      scenarioId: String(form.scenarioId ?? '').trim(),
      routeType: String(form.routeType ?? 'SQL'),
      priority: Number(form.priority ?? 100),
      requiredSlots: String(form.requiredSlotsText ?? '')
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean),
      status: form.status as RoutingRuleItem['status'],
    }),
    validateForm: (form) => {
      if (!String(form.scenarioId ?? '').trim()) return '请输入场景 ID'
      return null
    },
  })
}
