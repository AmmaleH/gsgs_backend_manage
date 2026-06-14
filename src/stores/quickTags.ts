import { defineStore } from 'pinia'
import { ref } from 'vue'

import { EStorageKey } from '@/constants'
import type { QuickTag } from '@/types'
import { generateId, getStorageItem, setStorageItem } from '@/utils/storage'

const DEFAULT_TAGS: QuickTag[] = [
  { id: '1', label: '产品介绍', content: '请介绍一下你们的产品和服务' },
  { id: '2', label: '使用帮助', content: '如何使用这个系统？' },
  { id: '3', label: '常见问题', content: '有哪些常见问题及解决方案？' },
]

export const useQuickTagsStore = defineStore('quickTags', () => {
  const tags = ref<QuickTag[]>(getStorageItem(EStorageKey.QUICK_TAGS, DEFAULT_TAGS))

  function persist() {
    setStorageItem(EStorageKey.QUICK_TAGS, tags.value)
  }

  function addTag(label: string, content: string) {
    tags.value.push({ id: generateId(), label, content })
    persist()
  }

  function updateTag(id: string, label: string, content: string) {
    const index = tags.value.findIndex((t) => t.id === id)
    if (index >= 0) {
      tags.value[index] = { id, label, content }
      persist()
    }
  }

  function removeTag(id: string) {
    tags.value = tags.value.filter((t) => t.id !== id)
    persist()
  }

  function resetTags() {
    tags.value = [...DEFAULT_TAGS]
    persist()
  }

  return { tags, addTag, updateTag, removeTag, resetTags }
})
