<template>
  <div class="change-password-page">
    <div class="change-password-page__panel">
      <div class="change-password-page__header">
        <h2 class="change-password-page__title">修改密码</h2>
        <p class="change-password-page__tip">为保障账号安全，请定期更新登录密码</p>
      </div>

      <el-form
        ref="formRef"
        class="change-password-page__form"
        :model="formModel"
        :rules="formRules"
        label-width="100px"
        size="large"
        @keyup.enter="handleChangePasswordSubmit"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="formModel.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
            clearable
            autocomplete="current-password"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="formModel.newPassword"
            type="password"
            placeholder="至少 8 位，包含字母和数字"
            show-password
            clearable
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="formModel.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            clearable
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item>
          <div class="change-password-page__actions">
            <el-button @click="handleChangePasswordCancel">取消</el-button>
            <el-button
              type="primary"
              :loading="isSubmitting"
              @click="handleChangePasswordSubmit"
            >
              确认修改
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChangePassword } from './useChangePassword'

const {
  formRef,
  formModel,
  formRules,
  isSubmitting,
  handleChangePasswordSubmit,
  handleChangePasswordCancel,
} = useChangePassword()
</script>

<style scoped lang="scss">
.change-password-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height) - 32px);
  margin: -16px;
  padding: 24px;
  background: var(--color-bg-page);

  &__panel {
    width: 100%;
    max-width: 480px;
    padding: 36px 40px 32px;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-base);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }

  &__header {
    text-align: center;
    margin-bottom: 28px;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__tip {
    margin: 0;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__form {
    width: 100%;
  }

  &__actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    width: 100%;
  }
}
</style>
