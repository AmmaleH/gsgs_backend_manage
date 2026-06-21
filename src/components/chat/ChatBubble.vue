<template>
  <div class="chat-bubble" :class="[`chat-bubble--${role}`, { 'is-streaming': streaming }]">
    <div v-if="role === 'assistant'" class="chat-bubble__avatar">
      <el-icon :size="18"><Cpu /></el-icon>
    </div>
    <div class="chat-bubble__content">
      <div class="chat-bubble__body">
        <ChatThinkingDots v-if="isThinking" />
        <div v-if="content && !isThinking" class="chat-bubble__text">
          {{ content }}<span v-if="streaming" class="typing-cursor">|</span>
        </div>
        <QueryResultPanel v-if="role === 'assistant' && result && !streaming" :result="result" />
        <ClarifyCard
          v-if="role === 'assistant' && clarify && runStatus === 'clarify'"
          :clarify="clarify"
          @confirm="(id, label) => emit('clarifyConfirm', id, label)"
          @cancel="emit('clarifyCancel')"
        />
        <div v-if="role === 'assistant' && error && runStatus !== 'clarify'" class="chat-bubble__error">
          <span>{{ error.message }}</span>
          <el-button v-if="error.retryable" type="primary" link size="small" @click="emit('retry')">
            重试
          </el-button>
        </div>
      </div>

      <div
        v-if="role === 'assistant' && showFeedback"
        class="chat-bubble__feedback"
      >
        <span class="chat-bubble__feedback-hint">请反馈本次回答是否准确，帮助我们持续优化问数质量</span>
        <div class="chat-bubble__feedback-actions">
          <button type="button" class="chat-bubble__feedback-btn" @click="emit('copy')">
            <el-icon :size="14"><DocumentCopy /></el-icon>
            <span>复制</span>
          </button>
          <button
            type="button"
            class="chat-bubble__feedback-btn"
            :class="{ 'is-active': feedback === 'accurate' }"
            @click="handleAccurate"
          >
            <el-icon :size="14"><Select /></el-icon>
            <span>准确</span>
          </button>
          <button
            type="button"
            class="chat-bubble__feedback-btn chat-bubble__feedback-btn--negative"
            :class="{ 'is-active': feedback === 'inaccurate' }"
            @click="handleInaccurate"
          >
            <el-icon :size="14"><CloseBold /></el-icon>
            <span>不准确</span>
          </button>
        </div>
      </div>

      <div v-if="createdAt" class="chat-bubble__time">{{ formattedTime }}</div>
    </div>
    <div v-if="role === 'user'" class="chat-bubble__avatar chat-bubble__avatar--user">
      <el-icon :size="18"><User /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { CloseBold, Cpu, DocumentCopy, Select, User } from '@element-plus/icons-vue'

import ChatThinkingDots from '@/components/chat/ChatThinkingDots.vue'
import ClarifyCard from '@/components/chat/ClarifyCard.vue'
import QueryResultPanel from '@/components/chat/QueryResultPanel.vue'
import type { ApiErrorBody, ClarifyPayload, QueryResult, RunStatus } from '@/types/api'
import { formatDateTime } from '@/utils/storage'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
  streaming?: boolean
  runStatus?: RunStatus
  result?: QueryResult
  clarify?: ClarifyPayload
  error?: ApiErrorBody
}

const {
  role,
  content,
  createdAt = '',
  streaming = false,
  runStatus,
  result,
  clarify,
  error,
} = defineProps<ChatBubbleProps>()

const emit = defineEmits<{
  clarifyConfirm: [optionId: string, label: string]
  clarifyCancel: []
  retry: []
  copy: []
  accurate: []
  inaccurate: []
}>()

const feedback = ref<'accurate' | 'inaccurate' | null>(null)

/** 问数进行中、尚未输出实质内容时视为思考态 */
const isThinking = computed(() => {
  if (role !== 'assistant' || !streaming) return false
  if (runStatus === 'clarify') return false
  if (result) return false
  const text = content.trim()
  return !text || text === '问数任务已提交...' || text.startsWith('正在')
})

const showFeedback = computed(
  () => !streaming && !!content.trim() && runStatus !== 'clarify',
)

const formattedTime = computed(() => (createdAt ? formatDateTime(createdAt) : ''))

function handleAccurate() {
  feedback.value = 'accurate'
  emit('accurate')
}

function handleInaccurate() {
  feedback.value = 'inaccurate'
  emit('inaccurate')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/chat-theme.scss' as chat;

.chat-bubble {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  max-width: 78%;
  position: relative;

  &--assistant {
    align-self: flex-start;
  }

  &--user {
    align-self: flex-end;
    flex-direction: row;
    margin-left: auto;
  }

  &__avatar {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(250, 245, 255, 0.8);
    border: 1px solid chat.$chat-border-purple;
    box-shadow: chat.$chat-shadow-soft;
    color: chat.$chat-accent-purple;

    &--user {
      background: rgba(239, 246, 255, 0.9);
      border-color: chat.$chat-border-blue;
      color: #2563eb;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }

  &__body {
    padding: 20px;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &--assistant &__body {
    background: rgba(250, 245, 255, 0.4);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid chat.$chat-border-purple;
    box-shadow: chat.$chat-shadow-soft, chat.$chat-shadow-purple;
  }

  &--user &__body {
    background: rgba(239, 246, 255, 0.5);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid chat.$chat-border-blue;
    border-right: 3px solid chat.$chat-accent-cyan;
    box-shadow: chat.$chat-shadow-soft;
    color: chat.$chat-text-primary;
  }

  &__text {
    line-height: 1.65;
    word-break: break-word;
    white-space: pre-wrap;
    color: chat.$chat-text-primary;
    font-size: 14px;

    :deep(code),
    code {
      background: rgba(15, 23, 42, 0.05);
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 13px;
      color: #334155;
    }
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #ef4444;
  }

  &__feedback {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 4px;
  }

  &__feedback-hint {
    font-size: 12px;
    color: chat.$chat-text-muted;
    line-height: 1.5;
  }

  &__feedback-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__feedback-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(255, 255, 255, 0.6);
    color: chat.$chat-text-secondary;
    font-size: 12px;
    cursor: pointer;
    transition: color 0.2s, background 0.2s, border-color 0.2s;

    &:hover {
      color: chat.$chat-accent-purple;
      border-color: rgba(196, 181, 253, 0.8);
      background: rgba(255, 255, 255, 0.9);
    }

    &.is-active {
      color: chat.$chat-accent-purple;
      border-color: rgba(139, 92, 246, 0.5);
      background: rgba(250, 245, 255, 0.95);
    }

    &--negative.is-active {
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.4);
      background: rgba(254, 242, 242, 0.9);
    }

    &--negative:hover {
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.35);
    }
  }

  &__time {
    font-size: 11px;
    color: chat.$chat-text-muted;
    padding: 0 8px;
  }

  &--user &__time {
    text-align: right;
  }
}

.typing-cursor {
  animation: blink 1s step-end infinite;
  font-weight: bold;
  color: chat.$chat-accent-purple;
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
