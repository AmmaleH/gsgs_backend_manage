<template>
  <Transition name="welcome-fade">
    <div v-if="visible" class="welcome-inline">
      <div class="welcome-inline__content">
        <div class="digital-human">
          <div class="digital-human__glow" />
          <div class="digital-human__avatar">
            <div class="digital-human__face">
              <div class="digital-human__eyes">
                <span class="eye left" />
                <span class="eye right" />
              </div>
              <div class="digital-human__mouth" />
            </div>
            <div class="digital-human__body">
              <div class="digital-human__shoulder left" />
              <div class="digital-human__torso" />
              <div class="digital-human__shoulder right" />
            </div>
          </div>
          <div class="digital-human__wave">
            <span v-for="i in 3" :key="i" class="wave-ring" :style="{ animationDelay: `${i * 0.4}s` }" />
          </div>
        </div>

        <h2 class="welcome-inline__title">
          {{ displayText }}<span v-if="!typingDone" class="cursor-blink">|</span>
        </h2>
        <p class="welcome-inline__desc">我是您的 AI 智能助手，随时为您解答问题</p>

        <el-button type="primary" size="large" round class="welcome-inline__btn" @click="emit('dismiss')">
          开始对话
        </el-button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'

interface WelcomeAnimationProps {
  visible?: boolean
}

const { visible = true } = defineProps<WelcomeAnimationProps>()

const emit = defineEmits<{
  dismiss: []
}>()

const displayText = ref('')
const typingDone = ref(false)
const fullText = '您好，欢迎使用 GS 智能助手！'

let typeTimer: ReturnType<typeof setInterval> | null = null

function startTyping() {
  displayText.value = ''
  typingDone.value = false
  let charIndex = 0
  typeTimer = setInterval(() => {
    if (charIndex < fullText.length) {
      displayText.value += fullText[charIndex]
      charIndex++
    } else {
      typingDone.value = true
      if (typeTimer) {
        clearInterval(typeTimer)
        typeTimer = null
      }
    }
  }, 80)
}

watch(
  () => visible,
  (val) => {
    if (val) startTyping()
  },
  { immediate: true },
)

onUnmounted(() => {
  if (typeTimer) clearInterval(typeTimer)
})
</script>

<style scoped lang="scss">
.welcome-inline {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 24px;

  &__content {
    text-align: center;
    max-width: 420px;
    animation: slideUp 0.6s ease-out;
  }

  &__title {
    font-size: 22px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 12px;
    min-height: 32px;
  }

  &__desc {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin-bottom: 28px;
    line-height: 1.6;
  }

  &__btn {
    min-width: 160px;
    height: 44px;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.digital-human {
  position: relative;
  width: 160px;
  height: 180px;
  margin: 0 auto 24px;

  &__glow {
    position: absolute;
    inset: -20px;
    background: radial-gradient(circle, rgba(64, 158, 255, 0.22) 0%, transparent 70%);
    animation: pulse 2s ease-in-out infinite;
  }

  &__avatar {
    position: relative;
    z-index: 1;
    animation: bobbing 3s ease-in-out infinite;
  }

  &__face {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #409eff, #66b1ff);
    border-radius: 50%;
    margin: 0 auto;
    position: relative;
    box-shadow: 0 8px 24px rgba(64, 158, 255, 0.35);
  }

  &__eyes {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding-top: 28px;

    .eye {
      width: 10px;
      height: 10px;
      background: #fff;
      border-radius: 50%;
      animation: blink 4s ease-in-out infinite;
    }
  }

  &__mouth {
    width: 24px;
    height: 12px;
    border: 3px solid #fff;
    border-top: none;
    border-radius: 0 0 24px 24px;
    margin: 10px auto 0;
    animation: smile 2s ease-in-out infinite;
  }

  &__body {
    display: flex;
    justify-content: center;
    margin-top: -4px;
  }

  &__shoulder {
    width: 20px;
    height: 12px;
    background: #409eff;
    border-radius: 10px 10px 0 0;

    &.left {
      transform: rotate(-15deg);
      animation: waveLeft 2s ease-in-out infinite;
    }

    &.right {
      transform: rotate(15deg);
      animation: waveRight 2s ease-in-out infinite;
    }
  }

  &__torso {
    width: 50px;
    height: 40px;
    background: linear-gradient(180deg, #409eff, #337ecc);
    border-radius: 0 0 12px 12px;
  }

  &__wave {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}

.wave-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid rgba(64, 158, 255, 0.35);
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 2s ease-out infinite;
  opacity: 0;
}

.cursor-blink {
  animation: blink-cursor 1s step-end infinite;
  color: var(--color-primary);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

@keyframes bobbing {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes blink {
  0%,
  90%,
  100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
}

@keyframes smile {
  0%,
  100% {
    width: 24px;
  }
  50% {
    width: 28px;
  }
}

@keyframes waveLeft {
  0%,
  100% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(-30deg);
  }
}

@keyframes waveRight {
  0%,
  100% {
    transform: rotate(15deg);
  }
  50% {
    transform: rotate(30deg);
  }
}

@keyframes ripple {
  0% {
    width: 40px;
    height: 40px;
    opacity: 0.6;
  }
  100% {
    width: 120px;
    height: 120px;
    opacity: 0;
  }
}

@keyframes blink-cursor {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.welcome-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.welcome-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
