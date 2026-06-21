import type { QueryTableColumn } from '@/types/api'

/** 按 API 文档格式化表格单元格 */
export function formatTableCell(value: unknown, column: QueryTableColumn): string {
  if (value === null || value === undefined) return '-'
  switch (column.dataType) {
    case 'integer':
      return Number(value).toLocaleString('zh-CN')
    case 'decimal':
      return Number(value).toFixed(column.precision ?? 2)
    case 'percent':
      return `${Number(value)}%`
    case 'date':
    case 'datetime':
    case 'string':
    default:
      return String(value)
  }
}

export function formatCellWithUnit(text: string, column: QueryTableColumn): string {
  if (column.unit && text !== '-') return `${text} ${column.unit}`
  return text
}
