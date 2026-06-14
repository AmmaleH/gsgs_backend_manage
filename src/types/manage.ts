export interface DetailField {
  prop: string
  label: string
  span?: number
  formatter?: (value: unknown, row: Record<string, unknown>) => string
}
