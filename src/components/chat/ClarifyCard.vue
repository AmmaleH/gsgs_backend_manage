<template>
  <div v-if="clarify" class="clarify-card">
    <p class="clarify-card__message">{{ clarify.message }}</p>
    <el-radio-group v-model="selectedId" class="clarify-card__options">
      <el-radio v-for="opt in clarify.options" :key="opt.id" :value="opt.id">
        {{ opt.label }}
      </el-radio>
    </el-radio-group>
    <div class="clarify-card__actions">
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="primary" :disabled="!selectedId" @click="handleConfirm">确认</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { ClarifyPayload } from '@/types/api'

interface ClarifyCardProps {
  clarify?: ClarifyPayload
}

const { clarify } = defineProps<ClarifyCardProps>()

const emit = defineEmits<{
  confirm: [optionId: string, label: string]
  cancel: []
}>()

const selectedId = ref('')

function handleConfirm() {
  const opt = clarify?.options.find((o) => o.id === selectedId.value)
  if (!opt) return
  emit('confirm', opt.id, opt.label)
  selectedId.value = ''
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/chat-theme.scss' as chat;

.clarify-card {
  padding-top: 4px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);

  &__message {
    font-size: 14px;
    color: chat.$chat-text-primary;
    margin-bottom: 12px;
  }

  &__options {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 16px;

    :deep(.el-radio) {
      color: chat.$chat-text-primary;

      .el-radio__inner {
        border-color: rgba(139, 92, 246, 0.4);
        background: rgba(255, 255, 255, 0.6);
      }

      &.is-checked .el-radio__inner {
        background: chat.$chat-accent-purple;
        border-color: chat.$chat-accent-purple;
      }
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
