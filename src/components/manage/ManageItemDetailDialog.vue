<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="560px"
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <div v-loading="loading">
      <el-descriptions v-if="data" :column="1" border>
        <el-descriptions-item
          v-for="field in fields"
          :key="field.prop"
          :label="field.label"
          :span="field.span"
        >
          {{ formatFieldValue(field, data) }}
        </el-descriptions-item>
      </el-descriptions>
      <slot v-if="data" name="extra" :data="data" />
    </div>
    <template #footer>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { DetailField } from '@/types/manage'

interface ManageItemDetailDialogProps {
  visible: boolean
  title?: string
  data: Record<string, unknown> | null
  fields: DetailField[]
  loading?: boolean
}

const { visible, title = '详情', data, fields, loading = false } = defineProps<ManageItemDetailDialogProps>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

function formatFieldValue(field: DetailField, row: Record<string, unknown>): string {
  const value = row[field.prop]
  if (field.formatter) return field.formatter(value, row)
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}
</script>
