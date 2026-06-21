<template>
  <div v-if="result" class="query-result">
    <p v-if="result.warning" class="query-result__warning">
      <el-icon><WarningFilled /></el-icon>
      {{ result.warning }}
    </p>

    <el-table
      v-if="result.table?.rows?.length"
      :data="result.table.rows"
      border
      stripe
      size="small"
      class="query-result__table"
    >
      <el-table-column
        v-for="col in result.table.columns"
        :key="col.field"
        :prop="col.field"
        :label="col.label"
        min-width="120"
      >
        <template #default="{ row }">
          {{ formatCellWithUnit(formatTableCell(row[col.field], col), col) }}
        </template>
      </el-table-column>
    </el-table>

    <el-collapse v-if="result.provenance" class="query-result__provenance">
      <el-collapse-item title="来源与口径" name="provenance">
        <ManageCardField label="场景" :value="result.provenance.scenarioId" />
        <ManageCardField label="路由类型" :value="result.provenance.routeType" />
        <ManageCardField label="数据来源" :value="result.provenance.sources.join('、')" />
        <ManageCardField label="指标口径" :value="result.provenance.metricDefinition" />
        <ManageCardField label="过滤条件" :value="result.provenance.filters.join('；')" />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { WarningFilled } from '@element-plus/icons-vue'

import ManageCardField from '@/components/manage/ManageCardField.vue'
import type { QueryResult } from '@/types/api'
import { formatCellWithUnit, formatTableCell } from '@/utils/queryFormat'

interface QueryResultPanelProps {
  result?: QueryResult
}

const { result } = defineProps<QueryResultPanelProps>()
</script>

<style scoped lang="scss">
@use '@/assets/styles/chat-theme.scss' as chat;

.query-result {
  &__warning {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    margin-bottom: 10px;
    background: rgba(251, 191, 36, 0.1);
    color: #d97706;
    border-radius: 10px;
    font-size: 13px;
    border: 1px solid rgba(251, 191, 36, 0.25);
  }

  &__table {
    width: 100%;
    margin-bottom: 8px;

    :deep(.el-table) {
      background: transparent;
      color: chat.$chat-text-primary;
      --el-table-border-color: rgba(148, 163, 184, 0.2);
      --el-table-header-bg-color: rgba(255, 255, 255, 0.5);
      --el-table-tr-bg-color: rgba(255, 255, 255, 0.3);
      --el-table-row-hover-bg-color: rgba(139, 92, 246, 0.06);
      --el-table-header-text-color: chat.$chat-text-secondary;
    }
  }

  &__provenance {
    margin-top: 8px;
    border: none;

    :deep(.el-collapse-item__header) {
      font-size: 13px;
      color: chat.$chat-text-secondary;
      background: transparent;
      border: none;
      height: 36px;
    }

    :deep(.el-collapse-item__wrap) {
      border: none;
      background: transparent;
    }

    :deep(.el-collapse-item__content) {
      color: chat.$chat-text-secondary;
    }
  }
}
</style>
