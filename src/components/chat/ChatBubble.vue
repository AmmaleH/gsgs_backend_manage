<template>
  <div class="chat-bubble" :class="[`chat-bubble--${role}`, { 'is-streaming': streaming }]">
    <div v-if="role === 'assistant'" class="chat-bubble__avatar">
      <el-icon :size="18"><Service /></el-icon>
    </div>
    <div class="chat-bubble__content">
      <div class="chat-bubble__text">{{ content }}<span v-if="streaming" class="typing-cursor">|</span></div>
      <div v-if="createdAt" class="chat-bubble__time">{{ formattedTime }}</div>
    </div>
    <div v-if="role === 'user'" class="chat-bubble__avatar chat-bubble__avatar--user">
      <el-icon :size="18"><User /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { Service, User } from '@element-plus/icons-vue'

import { formatDateTime } from '@/utils/storage'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
  streaming?: boolean
}

const { role, content, createdAt = '', streaming = false } = defineProps<ChatBubbleProps>()

const formattedTime = computed(() => (createdAt ? formatDateTime(createdAt) : ''))
</script>

<style scoped lang="scss">
.chat-bubble {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  max-width: 75%;

  &--assistant {
    align-self: flex-start;
  }

  &--user {
    align-self: flex-end;
    flex-direction: row;
    margin-left: auto;
  }

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-primary-light);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--user {
      background: #e8f4ff;
      color: #337ecc;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__text {
    padding: 12px 16px;
    border-radius: 12px;
    line-height: 1.6;
    word-break: break-word;
    white-space: pre-wrap;
  }

  &--assistant &__text {
    background: #fff;
    border: 1px solid var(--color-border);
    border-top-left-radius: 4px;
  }

  &--user &__text {
    background: var(--color-primary);
    color: #fff;
    border-top-right-radius: 4px;
  }

  &__time {
    font-size: 12px;
    color: var(--color-text-secondary);
    padding: 0 4px;
  }

  &--user &__time {
    text-align: right;
  }
}

.typing-cursor {
  animation: blink 1s step-end infinite;
  color: var(--color-primary);
  font-weight: bold;
}

.is-streaming .chat-bubble__text {
  min-height: 20px;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
