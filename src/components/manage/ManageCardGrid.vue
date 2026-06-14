<template>
  <div v-loading="loading" class="manage-card-grid">
    <template v-if="!loading && empty">
      <el-empty class="manage-card-grid__empty" description="暂无数据" />
    </template>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
interface ManageCardGridProps {
  loading?: boolean
  empty?: boolean
}

const { loading = false, empty = false } = defineProps<ManageCardGridProps>()
</script>

<style scoped lang="scss">
.manage-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  min-height: 120px;
  padding-bottom: 88px;

  @media (min-width: 960px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }

  &__empty {
    grid-column: 1 / -1;
    padding: 40px 0;
  }
}
</style>
