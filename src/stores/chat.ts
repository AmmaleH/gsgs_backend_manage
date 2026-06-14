import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { ChatMessage } from '@/types'
import { generateId } from '@/utils/storage'
import { streamChat, syncChat } from '@/utils/chat'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 模拟历史消息 */
const MOCK_HISTORY: ChatMessage[] = Array.from({ length: 20 }, (_, i) => ({
  id: `history-${i}`,
  role: i % 2 === 0 ? 'user' : 'assistant',
  content: i % 2 === 0 ? `历史问题 ${i + 1}` : `历史回答 ${i + 1}：这是之前的对话记录。`,
  createdAt: new Date(Date.now() - (20 - i) * 3600000).toISOString(),
}))

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const sessionId = ref<string>(generateId())
  const isLoading = ref(false)
  const isLoadingHistory = ref(false)
  const hasMoreHistory = ref(true)
  const historyPage = ref(0)
  const useStreamMode = ref(true)

  let abortController: AbortController | null = null

  async function loadHistory() {
    if (isLoadingHistory.value || !hasMoreHistory.value) return

    isLoadingHistory.value = true
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 500))
        const pageSize = 10
        const start = historyPage.value * pageSize
        const slice = MOCK_HISTORY.slice(start, start + pageSize)
        if (slice.length === 0) {
          hasMoreHistory.value = false
        } else {
          messages.value = [...slice, ...messages.value]
          historyPage.value += 1
          if (start + pageSize >= MOCK_HISTORY.length) {
            hasMoreHistory.value = false
          }
        }
        return
      }

      const { getChatHistoryApi } = await import('@/api/chat')
      const res = await getChatHistoryApi({
        sessionId: sessionId.value,
        page: historyPage.value + 1,
        pageSize: 10,
      })
      const list = res.data.list
      if (list.length === 0) {
        hasMoreHistory.value = false
      } else {
        messages.value = [...list, ...messages.value]
        historyPage.value += 1
      }
    } finally {
      isLoadingHistory.value = false
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading.value) return

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }
    messages.value.push(userMsg)

    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      streaming: true,
    }
    messages.value.push(assistantMsg)

    isLoading.value = true
    abortController = new AbortController()

    try {
      if (useStreamMode.value) {
        await new Promise<void>((resolve, reject) => {
          streamChat({
            message: content.trim(),
            sessionId: sessionId.value,
            signal: abortController!.signal,
            onChunk: (chunk) => {
              assistantMsg.content += chunk
            },
            onDone: () => {
              assistantMsg.streaming = false
              resolve()
            },
            onError: (err) => reject(err),
          })
        })
      } else {
        throw new Error('force sync')
      }
    } catch {
      // 流式失败，fallback 到同步
      try {
        assistantMsg.content = ''
        const reply = await syncChat(content.trim(), sessionId.value)
        assistantMsg.content = reply
      } catch (err) {
        assistantMsg.content = '抱歉，服务暂时不可用，请稍后再试。'
        console.error(err)
      } finally {
        assistantMsg.streaming = false
      }
    } finally {
      isLoading.value = false
      abortController = null
    }
  }

  function stopStreaming() {
    abortController?.abort()
    isLoading.value = false
    const last = messages.value[messages.value.length - 1]
    if (last?.streaming) {
      last.streaming = false
    }
  }

  function clearMessages() {
    messages.value = []
    sessionId.value = generateId()
    historyPage.value = 0
    hasMoreHistory.value = true
  }

  return {
    messages,
    sessionId,
    isLoading,
    isLoadingHistory,
    hasMoreHistory,
    useStreamMode,
    loadHistory,
    sendMessage,
    stopStreaming,
    clearMessages,
  }
})
