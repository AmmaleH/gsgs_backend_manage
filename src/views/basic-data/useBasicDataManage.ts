import { deleteSqlTableApi, getSqlTablesApi, saveSqlTableApi } from '@/api/admin'
import { useAdminCrud } from '@/composables/useAdminCrud'
import type { SqlTableItem } from '@/types/api'

export function useBasicDataManage() {
  return useAdminCrud<SqlTableItem>({
    entityName: 'SQL 白名单表',
    fetchList: (params) =>
      getSqlTablesApi({
        keyword: params.keyword,
        pageNo: params.pageNo,
        pageSize: params.pageSize,
      }),
    saveItem: saveSqlTableApi,
    deleteItem: deleteSqlTableApi,
    getTitle: (item) => item.tableName,
    createDefaultForm: () => ({
      tableName: '',
      businessDomain: 'traffic',
      allowedColumnsText: '',
      status: 'draft',
    }),
    rowToForm: (row) => ({
      tableName: row.tableName,
      businessDomain: row.businessDomain,
      allowedColumnsText: row.allowedColumns.join(', '),
      status: row.status,
    }),
    formToPayload: (form) => ({
      tableName: String(form.tableName ?? '').trim(),
      businessDomain: String(form.businessDomain ?? 'traffic').trim(),
      allowedColumns: String(form.allowedColumnsText ?? '')
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean),
      status: form.status as SqlTableItem['status'],
    }),
    validateForm: (form) => {
      if (!String(form.tableName ?? '').trim()) return '请输入表名'
      return null
    },
  })
}
