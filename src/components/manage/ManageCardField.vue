<template>
  <span class="manage-card-field">
    <span class="manage-card-field__label">{{ label }}</span>
    <span class="manage-card-field__value">{{ value || '-' }}</span>
  </span>
</template>

<script setup lang="ts">
interface ManageCardFieldProps {
  label: string
  value?: string | number
}

const { label, value = '' } = defineProps<ManageCardFieldProps>()
</script>

<style scoped lang="scss">
.manage-card-field {
  display: flex;
  gap: 8px;
  line-height: 1.5;

  &__label {
    flex-shrink: 0;
    color: var(--color-text-secondary);

    &::after {
      content: '：';
    }
  }

  &__value {
    flex: 1;
    color: var(--color-text-regular);
    word-break: break-all;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
