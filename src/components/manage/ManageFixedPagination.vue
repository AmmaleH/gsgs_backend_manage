<template>
  <div class="manage-fixed-pagination">
    <el-pagination
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="layout"
      @current-change="emit('pageChange', $event)"
      @size-change="emit('sizeChange', $event)"
    />
  </div>
</template>

<script setup lang="ts">
interface ManageFixedPaginationProps {
  page: number
  pageSize: number
  total: number
  pageSizes?: number[]
  layout?: string
}

const {
  page,
  pageSize,
  total,
  pageSizes = [8, 12, 24],
  layout = 'total, sizes, prev, pager, next',
} = defineProps<ManageFixedPaginationProps>()

const emit = defineEmits<{
  pageChange: [page: number]
  sizeChange: [size: number]
}>()
</script>

<style scoped lang="scss">
.manage-fixed-pagination {
  position: fixed;
  right: 28px;
  bottom: 40px;
  z-index: 100;
  padding: 12px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);

  :deep(.el-pagination) {
    --el-pagination-bg-color: transparent;
    --el-pagination-button-bg-color: rgba(255, 255, 255, 0.45);
    --el-pagination-hover-color: var(--color-primary);
    font-weight: 500;
  }

  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.el-pager li) {
    background: rgba(255, 255, 255, 0.42) !important;
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 10px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: background 0.2s, box-shadow 0.2s;
  }

  :deep(.el-pager li.is-active) {
    background: rgba(64, 158, 255, 0.82) !important;
    border-color: rgba(64, 158, 255, 0.35);
    color: #fff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.28);
  }

  :deep(.btn-prev:hover),
  :deep(.btn-next:hover),
  :deep(.el-pager li:hover) {
    background: rgba(255, 255, 255, 0.72) !important;
  }

  :deep(.el-pagination__total),
  :deep(.el-pagination__sizes),
  :deep(.el-pagination__jump) {
    color: var(--color-text-regular);
  }

  :deep(.el-select .el-select__wrapper) {
    background: rgba(255, 255, 255, 0.42);
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 10px;
    box-shadow: none;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}
</style>
