<template>
  <div class="login-page">
    <div class="login-page__bg">
      <div class="login-page__bg-circle login-page__bg-circle--1" />
      <div class="login-page__bg-circle login-page__bg-circle--2" />
      <div class="login-page__bg-circle login-page__bg-circle--3" />
    </div>

    <div class="login-card">
      <div class="login-card__header">
        <div class="login-card__logo">
          <el-icon :size="36"><Monitor /></el-icon>
        </div>
        <h1 class="login-card__title">GS 智能管理系统</h1>
        <p class="login-card__subtitle">AI Agent · 知识库 · 智能对话</p>
      </div>

      <el-form
        ref="formRef"
        class="login-form"
        :model="formModel"
        :rules="formRules"
        size="large"
        @keyup.enter="handleLoginSubmit"
      >
        <el-form-item prop="username">
          <el-input
            v-model="formModel.username"
            class="login-input"
            :class="{ 'is-filled': !!formModel.username }"
            placeholder="请输入账号"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            class="login-input"
            :class="{ 'is-filled': !!formModel.password }"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="isLoading"
            @click="handleLoginSubmit"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { Lock, Monitor, User } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

import { useUserStore } from '@/stores/user'
import { showToast } from '@/utils/message'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const isLoading = ref(false)

const formModel = reactive({
  username: '',
  password: '',
})

const formRules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLoginSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  isLoading.value = true
  try {
    const success = await userStore.login({
      username: formModel.username,
      password: formModel.password,
    })
    if (success) {
      showToast('登录成功', 'success')
      const redirect = (route.query.redirect as string) || '/chat'
      router.push(redirect)
    } else {
      showToast('账号或密码错误', 'error')
    }
  } catch {
    showToast('登录失败，请稍后重试', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1d1e2c 0%, #2c3e6b 50%, #1a5276 100%);

  &__bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__bg-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.15;

    &--1 {
      width: 400px;
      height: 400px;
      background: var(--color-primary);
      top: -100px;
      right: -100px;
      animation: float 8s ease-in-out infinite;
    }

    &--2 {
      width: 300px;
      height: 300px;
      background: #67c23a;
      bottom: -80px;
      left: -80px;
      animation: float 10s ease-in-out infinite reverse;
    }

    &--3 {
      width: 200px;
      height: 200px;
      background: #e6a23c;
      top: 50%;
      left: 30%;
      animation: float 6s ease-in-out infinite;
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);

  &__header {
    text-align: center;
    margin-bottom: 32px;
  }

  &__logo {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    background: var(--color-primary);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 8px;
  }

  &__subtitle {
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  .login-form {
    :deep(.login-input.el-input--large .el-input__wrapper) {
      --el-input-bg-color: transparent;
      --el-fill-color-blank: transparent;
      padding: 1px 16px !important;
      background-color: transparent !important;
      box-shadow: 0 0 0 1px var(--el-input-border-color, var(--color-border)) inset;

      &:hover,
      &.is-focus {
        background-color: transparent !important;
      }
    }

    :deep(.login-input .el-input__inner) {
      background-color: transparent !important;

      &:-webkit-autofill,
      &:-webkit-autofill:hover,
      &:-webkit-autofill:focus {
        -webkit-text-fill-color: var(--color-text-primary);
        transition: background-color 9999s ease-out;
        box-shadow: 0 0 0 1000px transparent inset;
      }
    }

    /* Element Plus 默认仅 focus/hover 时 visibility:visible，有值时常态显示清除按钮 */
    :deep(.login-input.is-filled .el-input__clear) {
      visibility: visible !important;
    }
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}
</style>
