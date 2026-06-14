<template>
  <div class="manage-card">
    <div class="manage-card__header">
      <h3 class="manage-card__title" :title="title">{{ title }}</h3>
      <div v-if="$slots.tag" class="manage-card__tag">
        <slot name="tag" />
      </div>
    </div>
    <div class="manage-card__body">
      <slot />
    </div>
    <div v-if="$slots.actions" class="manage-card__footer">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface ManageCardItemProps {
  title: string
}

const { title } = defineProps<ManageCardItemProps>()
</script>

<style scoped lang="scss">
.manage-card {
  display: flex;
  flex-direction: column;
  min-height: 168px;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  transition: box-shadow 0.2s, border-color 0.2s;

  &:hover {
    border-color: var(--color-primary-light);
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.12);
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__title {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__tag {
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
    color: var(--color-text-regular);
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--color-border);
  }
}
</style>
