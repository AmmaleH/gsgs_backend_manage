import { ElMessage, ElMessageBox } from 'element-plus'

export function showToast(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') {
  ElMessage({ message, type, duration: 3000 })
}

export function showConfirm(message: string, title = '提示'): Promise<boolean> {
  return ElMessageBox.confirm(message, title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => true)
    .catch(() => false)
}
