import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import type { FormInstance, FormRules } from 'element-plus'

import { changePasswordApi } from '@/api/auth'
import { showToast } from '@/utils/message'

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

function getSubmitErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return '密码修改失败，请稍后重试'
}

export function useChangePassword() {
  const router = useRouter()

  const formRef = ref<FormInstance>()
  const isSubmitting = ref(false)

  const formModel = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const formRules: FormRules = {
    oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          if (!value || PASSWORD_PATTERN.test(value)) {
            callback()
            return
          }
          callback(new Error('密码至少 8 位，且包含字母和数字'))
        },
        trigger: 'blur',
      },
    ],
    confirmPassword: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          if (!value || value === formModel.newPassword) {
            callback()
            return
          }
          callback(new Error('两次输入的新密码不一致'))
        },
        trigger: 'blur',
      },
    ],
  }

  async function handleChangePasswordSubmit() {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid || isSubmitting.value) return

    if (formModel.oldPassword === formModel.newPassword) {
      showToast('新密码不能与原密码相同', 'warning')
      return
    }

    isSubmitting.value = true
    try {
      await changePasswordApi({
        oldPassword: formModel.oldPassword,
        newPassword: formModel.newPassword,
      })
      showToast('密码修改成功', 'success')
      formRef.value?.resetFields()
      router.push('/chat')
    } catch (error) {
      const message = getSubmitErrorMessage(error)
      showToast(message, 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  function handleChangePasswordCancel() {
    router.back()
  }

  return {
    formRef,
    formModel,
    formRules,
    isSubmitting,
    handleChangePasswordSubmit,
    handleChangePasswordCancel,
  }
}
