<template>
  <div class="chat-page">
    <div class="chat-page__glow chat-page__glow--purple" />
    <div class="chat-page__glow chat-page__glow--cyan" />

    <div class="chat-page__container">
      <aside class="chat-sidebar" :class="{ 'is-collapsed': isSidebarCollapsed }">
        <div class="chat-sidebar__header">
          <div v-show="!isSidebarCollapsed" class="chat-sidebar__brand">
            <el-icon :size="22"><Cpu /></el-icon>
            <span class="chat-sidebar__brand-text">GS AI 问数</span>
          </div>
          <el-button
            v-show="!isSidebarCollapsed"
            type="primary"
            class="chat-sidebar__new-btn"
            :icon="Plus"
            @click="handleNewChat"
          >
            新建会话
          </el-button>
        </div>

        <div v-show="!isSidebarCollapsed" class="chat-sidebar__list">
          <div
            v-for="s in chatStore.sessions"
            :key="s.sessionId"
            class="chat-sidebar__item"
            :class="{ 'is-active': s.sessionId === chatStore.sessionId }"
            @click="handleSwitchSession(s.sessionId)"
          >
            <div class="chat-sidebar__item-main">
              <div class="chat-sidebar__item-title">{{ s.title }}</div>
              <div class="chat-sidebar__item-meta">{{ s.messageCount }} 条消息</div>
            </div>
            <div class="chat-sidebar__item-actions" @click.stop>
              <el-icon class="chat-sidebar__action-icon" @click="showToast('重命名功能开发中', 'info')">
                <EditPen />
              </el-icon>
              <el-icon
                class="chat-sidebar__action-icon chat-sidebar__action-icon--danger"
                @click="handleDeleteSession(s.sessionId)"
              >
                <Delete />
              </el-icon>
            </div>
          </div>
        </div>

        <div class="chat-sidebar__footer">
          <div v-show="!isSidebarCollapsed" class="chat-sidebar__user">
            <el-avatar :size="28" class="chat-sidebar__avatar">{{ userInitial }}</el-avatar>
            <span class="chat-sidebar__username">在线</span>
          </div>
          <button type="button" class="chat-sidebar__footer-btn" @click="isSidebarCollapsed = !isSidebarCollapsed">
            <el-icon><component :is="isSidebarCollapsed ? Expand : Fold" /></el-icon>
          </button>
        </div>
      </aside>

      <div class="chat-main">
        <header class="chat-main__header">
          <h2 class="chat-main__title">{{ currentSessionTitle }}</h2>
          <div class="chat-main__header-actions">
            <el-select v-model="selectedModel" class="chat-main__model-select" size="small">
              <el-option
                v-for="m in CHAT_MODEL_OPTIONS"
                :key="m.value"
                :label="m.label"
                :value="m.value"
              />
            </el-select>
            <el-tooltip content="清空当前会话">
              <el-button circle size="small" class="chat-main__icon-btn" @click="handleClearChat">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="全屏">
              <el-button circle size="small" class="chat-main__icon-btn" @click="handleToggleFullscreen">
                <el-icon><FullScreen /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </header>

        <div ref="messageListRef" class="chat-main__messages" @scroll="handleScroll">
          <div v-if="chatStore.isLoadingHistory" class="chat-main__loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载历史消息...</span>
          </div>
          <div v-else-if="chatStore.hasMoreHistory" class="chat-main__load-more">
            <el-button text @click="chatStore.loadHistory">加载更多历史</el-button>
          </div>

          <ChatWelcomePanel v-if="isEmptyChat" :visible="true" @select="handlePromptSelect" />

          <ChatBubble
            v-for="(msg, index) in chatStore.messages"
            :key="msg.id"
            :role="msg.role"
            :content="msg.content"
            :created-at="msg.createdAt"
            :streaming="msg.streaming"
            :run-status="msg.runStatus"
            :result="msg.result"
            :clarify="msg.clarify"
            :error="msg.error"
            @clarify-confirm="(id, label) => handleClarifyConfirm(msg, id, label)"
            @clarify-cancel="chatStore.stopPolling"
            @retry="handleRetry(index)"
            @copy="handleCopy(msg.content)"
            @accurate="showToast('感谢反馈，已标记为准确', 'success')"
            @inaccurate="showToast('感谢反馈，已标记为不准确', 'info')"
          />
        </div>

        <div class="chat-main__input-wrap" :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }">
          <QuickTags v-if="chatStore.messages.length > 0" @select="handleQuickTagSelect" />
          <div
            class="chat-input"
            :class="{ 'is-focused': isInputFocused, 'has-content': !!inputText.trim() }"
          >
            <div class="chat-input__editor">
              <el-input
                ref="inputRef"
                v-model="inputText"
                type="textarea"
                :rows="2"
                placeholder="请输入经营分析问题..."
                resize="none"
                :disabled="chatStore.isLoading"
                @focus="isInputFocused = true"
                @blur="isInputFocused = false"
                @keydown="handleKeydown"
              />
            </div>
            <div class="chat-input__toolbar">
              <el-tooltip content="异步问数（轮询 runs/{runId}）" placement="top">
                <div class="chat-mode-toggle" role="group" aria-label="问数模式">
                  <button
                    type="button"
                    class="chat-mode-toggle__btn"
                    :class="{ 'is-active': chatStore.useAsyncMode }"
                    :disabled="chatStore.isLoading"
                    @click="chatStore.useAsyncMode = true"
                  >
                    异步
                  </button>
                  <button
                    type="button"
                    class="chat-mode-toggle__btn"
                    :class="{ 'is-active': !chatStore.useAsyncMode }"
                    :disabled="chatStore.isLoading"
                    @click="chatStore.useAsyncMode = false"
                  >
                    同步
                  </button>
                </div>
              </el-tooltip>
              <div class="chat-input__toolbar-actions">
                <el-button
                  v-if="chatStore.isLoading"
                  size="small"
                  round
                  class="chat-input__stop-btn"
                  @click="chatStore.stopPolling"
                >
                  停止
                </el-button>
                <button
                  type="button"
                  class="chat-input__send-btn"
                  :disabled="!inputText.trim() || chatStore.isLoading"
                  @click="handleSendClick"
                >
                  <el-icon v-if="chatStore.isLoading" class="is-loading"><Loading /></el-icon>
                  <el-icon v-else><Promotion /></el-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import {
  Cpu,
  Delete,
  EditPen,
  Expand,
  Fold,
  FullScreen,
  Loading,
  Plus,
  Promotion,
} from '@element-plus/icons-vue'
import type { ElInput } from 'element-plus'

import ChatBubble from '@/components/chat/ChatBubble.vue'
import ChatWelcomePanel from '@/components/chat/ChatWelcomePanel.vue'
import QuickTags from '@/components/chat/QuickTags.vue'
import { showConfirm, showToast } from '@/utils/message'

import { CHAT_MODEL_OPTIONS, useChatPage } from './useChatPage'

const inputRef = ref<InstanceType<typeof ElInput>>()

const {
  chatStore,
  inputText,
  messageListRef,
  isSidebarCollapsed,
  isInputFocused,
  selectedModel,
  currentSessionTitle,
  userInitial,
  isEmptyChat,
  handleScroll,
  handleKeydown,
  handleSendClick,
  handlePromptSelect,
  handleQuickTagSelect,
  handleNewChat,
  handleSwitchSession,
  handleClearChat,
  handleToggleFullscreen,
  handleClarifyConfirm,
  handleRetry,
  handleCopy,
} = useChatPage(inputRef)

async function handleDeleteSession(id: string) {
  const confirmed = await showConfirm('确定删除该会话吗？')
  if (!confirmed) return
  chatStore.removeSession(id)
  showToast('会话已删除', 'success')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/chat-theme.scss' as chat;

.chat-page {
  position: relative;
  height: calc(100vh - var(--header-height) - 32px);
  margin: -16px;
  overflow: hidden;
  background: linear-gradient(160deg, chat.$chat-bg-from 0%, chat.$chat-bg-via 45%, chat.$chat-bg-to 100%);
  color: chat.$chat-text-primary;
}

.chat-page__glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;

  &--purple {
    width: 384px;
    height: 384px;
    top: 10%;
    left: 8%;
    background: rgba(168, 85, 247, 0.08);
    filter: blur(100px);
  }

  &--cyan {
    width: 500px;
    height: 500px;
    bottom: 5%;
    right: 10%;
    background: rgba(6, 182, 212, 0.08);
    filter: blur(130px);
  }
}

.chat-page__container {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
}

.chat-sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: chat.$chat-shadow-soft;
  transition: width 0.3s ease;

  &.is-collapsed {
    width: 56px;
  }

  &__header {
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    color: chat.$chat-accent-purple;
  }

  &__brand-text {
    font-size: 16px;
    font-weight: 700;
    @include chat.chat-gradient-text;
  }

  &__new-btn {
    width: 100%;
    border: none;
    background: chat.$chat-gradient-brand;
    border-radius: 12px;
    font-weight: 500;

    &:hover {
      opacity: 0.9;
    }
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 4px;
    transition: background 0.2s, box-shadow 0.2s, color 0.2s;
    border-left: 3px solid transparent;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
      box-shadow: 0 1px 4px rgba(31, 38, 135, 0.06);

      .chat-sidebar__item-title {
        color: chat.$chat-text-primary;
      }

      .chat-sidebar__item-actions {
        opacity: 1;
      }
    }

    &.is-active {
      background: rgba(250, 245, 255, 0.8);
      border-left-color: chat.$chat-accent-cyan;
      box-shadow: chat.$chat-shadow-purple;
    }
  }

  &__item-main {
    flex: 1;
    min-width: 0;
  }

  &__item-title {
    font-size: 13px;
    color: #475569;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s;
  }

  &__item-meta {
    font-size: 11px;
    color: chat.$chat-text-secondary;
    margin-top: 2px;
  }

  &__item-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
  }

  &__action-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 8px;
    font-size: 36px;
    color: chat.$chat-text-secondary;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;

    :deep(svg) {
      width: 36px;
      height: 36px;
    }

    &:hover {
      color: chat.$chat-accent-purple;
      background: rgba(139, 92, 246, 0.08);
    }

    &--danger:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.08);
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.5);
  }

  &__footer-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: chat.$chat-text-secondary;
    cursor: pointer;
    font-size: 13px;
    transition: color 0.2s, background 0.2s;

    :deep(.el-icon) {
      font-size: 20px;
    }

    &:hover {
      color: chat.$chat-text-primary;
      background: rgba(255, 255, 255, 0.5);
    }
  }

  &__user {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__avatar {
    background: chat.$chat-gradient-brand;
    color: #fff;
    font-size: 12px;
    flex-shrink: 0;
  }

  &__username {
    font-size: 12px;
    color: chat.$chat-text-secondary;
  }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  position: relative;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: chat.$chat-shadow-soft;
    flex-shrink: 0;
  }

  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: chat.$chat-text-primary;
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__model-select {
    width: 140px;

    :deep(.el-select__wrapper) {
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: chat.$chat-shadow-soft;
      color: chat.$chat-text-primary;
    }
  }

  &__icon-btn {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.6);
    color: chat.$chat-text-secondary;
    box-shadow: chat.$chat-shadow-soft;

    &:hover {
      color: chat.$chat-accent-purple;
      border-color: rgba(196, 181, 253, 0.8);
      background: rgba(255, 255, 255, 0.8);
    }
  }

  &__messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 32px 140px;
    display: flex;
    flex-direction: column;
  }

  &__loading,
  &__load-more {
    text-align: center;
    padding: 12px;
    color: chat.$chat-text-secondary;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-shrink: 0;
  }

  &__input-wrap {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 24px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(to top, rgba(244, 245, 252, 0.95) 55%, transparent);
  }
}

.chat-input {
  width: 75%;
  max-width: 820px;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 14px 16px 12px;
  border-radius: 24px;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: chat.$chat-shadow-input;

  &.is-focused {
    @include chat.chat-focus-glow;
  }

  &__editor {
    width: 100%;
    min-width: 0;
  }

  :deep(.el-textarea__inner) {
    background: transparent;
    border: none;
    box-shadow: none;
    color: chat.$chat-text-primary;
    padding: 0;
    font-size: 14px;
    line-height: 1.6;

    &::placeholder {
      color: chat.$chat-text-secondary;
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(148, 163, 184, 0.15);
  }

  &__toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__stop-btn {
    border-color: rgba(239, 68, 68, 0.25);
    color: #ef4444;
    background: rgba(255, 255, 255, 0.6);
    font-size: 12px;
  }

  &__send-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s, background 0.2s;
    background: rgba(148, 163, 184, 0.18);
    color: chat.$chat-text-muted;

    .el-icon {
      font-size: 18px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  }

  &.has-content &__send-btn:not(:disabled) {
    background: chat.$chat-gradient-brand;
    color: #fff;
    box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.25) 50%, transparent 60%);
      animation: shimmer 2.5s infinite;
    }

    &:hover:not(:disabled) {
      transform: scale(1.06);
    }
  }
}

.chat-mode-toggle {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 999px;
  background: rgba(241, 245, 249, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);

  &__btn {
    min-width: 44px;
    padding: 5px 12px;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: chat.$chat-text-secondary;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.2;
    cursor: pointer;
    transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;

    &.is-active {
      color: #fff;
      background: chat.$chat-gradient-purple;
      box-shadow: 0 1px 6px rgba(139, 92, 246, 0.35);
    }

    &:not(.is-active):hover:not(:disabled) {
      color: chat.$chat-accent-purple;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
