<template>
  <div class="chat-page">
    <div class="chat-page__container">
      <!-- 消息列表 -->
      <div ref="messageListRef" class="chat-page__messages" @scroll="handleScroll">
        <div v-if="chatStore.isLoadingHistory" class="chat-page__loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载历史消息...</span>
        </div>
        <div v-else-if="chatStore.hasMoreHistory" class="chat-page__load-more">
          <el-button text type="primary" @click="chatStore.loadHistory">加载更多历史</el-button>
        </div>

        <!-- 首次欢迎：嵌入对话区正中 -->
        <WelcomeAnimation
          v-if="showWelcome && chatStore.messages.length === 0"
          :visible="showWelcome"
          @dismiss="handleWelcomeDismiss"
        />

        <div
          v-else-if="chatStore.messages.length === 0 && !chatStore.isLoadingHistory"
          class="chat-page__empty"
        >
          <el-icon :size="48" color="#c0c4cc"><ChatDotRound /></el-icon>
          <p>您好！有什么可以帮助您的吗？</p>
        </div>

        <ChatBubble
          v-for="msg in chatStore.messages"
          :key="msg.id"
          :role="msg.role"
          :content="msg.content"
          :created-at="msg.createdAt"
          :streaming="msg.streaming"
        />
      </div>

      <!-- 底部输入区 -->
      <div class="chat-page__footer">
        <QuickTags @select="handleQuickTagSelect" />

        <div class="chat-page__input-area">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="2"
            placeholder="输入您的问题，Enter 发送，Shift+Enter 换行"
            resize="none"
            :disabled="chatStore.isLoading"
            @keydown="handleKeydown"
          />
          <div class="chat-page__actions">
            <el-tooltip content="流式模式（失败自动降级为同步）" placement="top">
              <el-switch
                v-model="chatStore.useStreamMode"
                active-text="流式"
                inactive-text="同步"
                size="small"
              />
            </el-tooltip>
            <el-button
              v-if="chatStore.isLoading"
              type="danger"
              plain
              size="small"
              @click="chatStore.stopStreaming"
            >
              停止
            </el-button>
            <el-button
              type="primary"
              :loading="chatStore.isLoading"
              :disabled="!inputText.trim()"
              @click="handleSend"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

import { ChatDotRound, Loading } from '@element-plus/icons-vue'

import ChatBubble from '@/components/chat/ChatBubble.vue'
import QuickTags from '@/components/chat/QuickTags.vue'
import WelcomeAnimation from '@/components/chat/WelcomeAnimation.vue'
import { EStorageKey } from '@/constants'
import { useChatStore } from '@/stores/chat'
import { getStorageItem, setStorageItem } from '@/utils/storage'

const chatStore = useChatStore()

const inputText = ref('')
const messageListRef = ref<HTMLElement>()
const isNearBottom = ref(true)
const showWelcome = ref(!getStorageItem<boolean>(EStorageKey.WELCOME_SHOWN, false))

onMounted(() => {
  scrollToBottom()
})

watch(
  () => chatStore.messages.length,
  () => {
    if (isNearBottom.value) {
      nextTick(scrollToBottom)
    }
  },
)

watch(
  () => chatStore.messages.map((m) => m.content).join(''),
  () => {
    if (isNearBottom.value && chatStore.isLoading) {
      nextTick(scrollToBottom)
    }
  },
)

function scrollToBottom() {
  const el = messageListRef.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

function handleScroll() {
  const el = messageListRef.value
  if (!el) return

  if (el.scrollTop <= 10 && chatStore.hasMoreHistory && !chatStore.isLoadingHistory) {
    const prevHeight = el.scrollHeight
    chatStore.loadHistory().then(() => {
      nextTick(() => {
        if (el) {
          el.scrollTop = el.scrollHeight - prevHeight
        }
      })
    })
  }

  isNearBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 80
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  inputText.value = ''
  isNearBottom.value = true
  await chatStore.sendMessage(text)
  nextTick(scrollToBottom)
}

function handleQuickTagSelect(content: string) {
  inputText.value = content
  handleSend()
}

function handleWelcomeDismiss() {
  showWelcome.value = false
  setStorageItem(EStorageKey.WELCOME_SHOWN, true)
  nextTick(scrollToBottom)
}
</script>

<style scoped lang="scss">
.chat-page {
  height: calc(100vh - var(--header-height) - 32px);
  margin: -16px;
  display: flex;
  flex-direction: column;

  &__container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-page);
    overflow: hidden;
  }

  &__messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
  }

  &__loading,
  &__load-more {
    text-align: center;
    padding: 12px;
    color: var(--color-text-secondary);
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-shrink: 0;
  }

  &__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    gap: 12px;

    p {
      font-size: 15px;
    }
  }

  &__footer {
    background: #fff;
    border-top: 1px solid var(--color-border);
    padding-bottom: 12px;
    flex-shrink: 0;
  }

  &__input-area {
    padding: 8px 16px 0;
    display: flex;
    gap: 12px;
    align-items: flex-end;

    :deep(.el-textarea__inner) {
      border-radius: 12px;
      padding: 10px 14px;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
    flex-shrink: 0;
    padding-bottom: 4px;
  }
}
</style>
