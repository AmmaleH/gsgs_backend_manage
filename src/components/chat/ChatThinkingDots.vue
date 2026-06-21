<template>
  <div class="thinking-state" aria-label="AI 思考中">
    <span class="thinking-state__text">正在思考...</span>
    <div class="thinking-state__dots">
      <span v-for="i in 3" :key="i" class="thinking-state__dot" :style="{ animationDelay: `${(i - 1) * 0.15}s` }" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/chat-theme.scss' as chat;

.thinking-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 0;
}

.thinking-state__text {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  @include chat.thinking-text-gradient;
}

.thinking-state__dots {
  display: flex;
  align-items: center;
  gap: 5px;
}

.thinking-state__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: chat.$chat-accent-purple;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.35);
  animation: dot-bounce 1.2s ease-in-out infinite;
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.35;
  }
  40% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style>
