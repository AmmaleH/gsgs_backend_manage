<template>
  <div v-if="visible" class="chat-welcome">
    <div class="chat-welcome__logo">
      <div class="chat-welcome__logo-glow" />
      <el-icon :size="36"><Cpu /></el-icon>
    </div>
    <h2 class="chat-welcome__title">GS 智能问数助手</h2>
    <p class="chat-welcome__desc">我是您的 AI 数据分析助手，随时为您解答经营分析问题</p>

    <div class="chat-welcome__cards">
      <button
        v-for="card in cards"
        :key="card.id"
        type="button"
        class="chat-welcome__card"
        @click="emit('select', card.content)"
      >
        <div class="chat-welcome__card-icon">
          <el-icon :size="20"><component :is="iconMap[card.icon]" /></el-icon>
        </div>
        <div class="chat-welcome__card-body">
          <div class="chat-welcome__card-title">{{ card.title }}</div>
          <div class="chat-welcome__card-desc">{{ card.desc }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cpu, DataLine, QuestionFilled, TrendCharts, WarningFilled } from '@element-plus/icons-vue'
import type { Component } from 'vue'

import { WELCOME_PROMPT_CARDS } from '@/views/chat/useChatPage'

interface ChatWelcomePanelProps {
  visible?: boolean
}

const { visible = true } = defineProps<ChatWelcomePanelProps>()

const emit = defineEmits<{
  select: [content: string]
}>()

const cards = WELCOME_PROMPT_CARDS

const iconMap: Record<string, Component> = {
  DataLine,
  TrendCharts,
  QuestionFilled,
  WarningFilled,
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/chat-theme.scss' as chat;

.chat-welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
}

.chat-welcome__logo {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: chat.$chat-shadow-soft, 0 0 24px rgba(139, 92, 246, 0.12);
  color: chat.$chat-accent-purple;
  animation: logo-breathe 3s ease-in-out infinite;
}

.chat-welcome__logo-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
  animation: glow-pulse 3s ease-in-out infinite;
  pointer-events: none;
}

.chat-welcome__title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  @include chat.chat-gradient-text;
}

.chat-welcome__desc {
  margin: 0 0 36px;
  font-size: 14px;
  color: chat.$chat-text-secondary;
  max-width: 420px;
}

.chat-welcome__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(200px, 280px));
  gap: 16px;
  width: 100%;
  max-width: 600px;
}

.chat-welcome__card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: chat.$chat-shadow-soft;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.8);
    border-color: rgba(196, 181, 253, 0.9);
    box-shadow: 0 8px 20px rgba(168, 85, 247, 0.05);
  }
}

.chat-welcome__card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(6, 182, 212, 0.12));
  color: chat.$chat-accent-indigo;
}

.chat-welcome__card-title {
  font-size: 15px;
  font-weight: 600;
  color: chat.$chat-text-primary;
  margin-bottom: 4px;
}

.chat-welcome__card-desc {
  font-size: 12px;
  color: chat.$chat-text-secondary;
  line-height: 1.5;
}

@keyframes logo-breathe {
  0%,
  100% {
    transform: scale(1);
    box-shadow: chat.$chat-shadow-soft, 0 0 16px rgba(139, 92, 246, 0.1);
  }
  50% {
    transform: scale(1.04);
    box-shadow: chat.$chat-shadow-purple, 0 0 28px rgba(139, 92, 246, 0.18);
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
