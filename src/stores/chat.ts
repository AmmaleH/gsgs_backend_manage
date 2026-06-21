import { defineStore } from 'pinia'
import { ref } from 'vue'

import { createQueryRunApi, getQueryRunApi, getSessionMessagesApi, syncQueryApi } from '@/api/query'
import type { ApiErrorBody, QueryRunDetail, RunStatus, SessionItem } from '@/types/api'
import type { ChatMessage } from '@/types'
import { generateId } from '@/utils/storage'
import { showToast } from '@/utils/message'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const TERMINAL_STATUS: RunStatus[] = ['success', 'partial', 'failed', 'blocked', 'timeout']

function isTerminal(status: RunStatus) {
  return TERMINAL_STATUS.includes(status)
}

function sessionMsgToChat(msg: import('@/types/api').SessionMessage): ChatMessage {
  return {
    id: msg.messageId,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
    traceId: msg.traceId,
    result: msg.resultSnapshot,
    runStatus: msg.resultSnapshot ? 'success' : undefined,
  }
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const sessionId = ref('session-001')
  const sessions = ref<SessionItem[]>([])
  const isLoading = ref(false)
  const isLoadingHistory = ref(false)
  const hasMoreHistory = ref(false)
  const useAsyncMode = ref(true)
  const activeRunId = ref<string | null>(null)

  let pollTimer: ReturnType<typeof setTimeout> | null = null

  async function loadSessions() {
    if (!USE_MOCK) return
    const { getSessionsApi } = await import('@/api/query')
    sessions.value = await getSessionsApi()
  }

  async function switchSession(id: string) {
    sessionId.value = id
    messages.value = []
    isLoadingHistory.value = true
    try {
      const list = await getSessionMessagesApi(id)
      messages.value = list.map(sessionMsgToChat)
    } finally {
      isLoadingHistory.value = false
    }
  }

  async function loadHistory() {
    if (isLoadingHistory.value) return
    isLoadingHistory.value = true
    try {
      await new Promise((r) => setTimeout(r, 400))
      showToast('当前会话已加载全部历史消息', 'info')
      hasMoreHistory.value = false
    } finally {
      isLoadingHistory.value = false
    }
  }

  function applyRunToMessage(msg: ChatMessage, run: QueryRunDetail) {
    msg.runId = run.runId
    msg.traceId = run.traceId
    msg.runStatus = run.status
    msg.progress = run.progress
    msg.clarify = run.clarify
    msg.error = run.error
    msg.result = run.result
    msg.streaming = !isTerminal(run.status) && run.status !== 'clarify'

    if (run.status === 'success' || run.status === 'partial') {
      msg.content = run.result?.summary ?? msg.content
    } else if (run.status === 'clarify') {
      msg.content = run.clarify?.message ?? '请补充澄清信息'
      msg.pendingClarifyRunId = run.runId
    } else if (run.status === 'failed' || run.status === 'timeout' || run.status === 'blocked') {
      msg.content = run.error?.message ?? '问数失败，请稍后重试'
    } else if (run.progress) {
      const running = run.progress.steps.find((s) => s.status === 'running')
      msg.content = running ? `正在${running.name}...` : '问数处理中...'
    }
  }

  async function pollRun(runId: string, assistantMsg: ChatMessage, pollAfterMs = 800) {
    return new Promise<void>((resolve, reject) => {
      const poll = async () => {
        try {
          const run = await getQueryRunApi(runId)
          applyRunToMessage(assistantMsg, run)

          if (run.status === 'clarify') {
            assistantMsg.streaming = false
            activeRunId.value = runId
            resolve()
            return
          }

          if (isTerminal(run.status)) {
            assistantMsg.streaming = false
            activeRunId.value = null
            resolve()
            return
          }

          pollTimer = setTimeout(poll, pollAfterMs)
        } catch (err) {
          assistantMsg.streaming = false
          assistantMsg.runStatus = 'failed'
          assistantMsg.content = (err as ApiErrorBody)?.message ?? '轮询失败'
          reject(err)
        }
      }
      pollTimer = setTimeout(poll, pollAfterMs)
    })
  }

  function stopPolling() {
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
    isLoading.value = false
    activeRunId.value = null
    const last = messages.value[messages.value.length - 1]
    if (last?.streaming) last.streaming = false
  }

  async function sendMessage(content: string, clarifyReply?: { runId: string; selectedOptionId: string; text: string }) {
    if (!content.trim() || isLoading.value) return

    if (!clarifyReply) {
      messages.value.push({
        id: generateId(),
        role: 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      })
    }

    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '问数任务已提交...',
      createdAt: new Date().toISOString(),
      streaming: true,
      runStatus: 'accepted',
    }
    messages.value.push(assistantMsg)
    isLoading.value = true

    try {
      if (useAsyncMode.value) {
        const created = await createQueryRunApi({
          question: content.trim(),
          sessionId: sessionId.value,
          context: { client: 'pc', timezone: 'Asia/Shanghai' },
          clarifyReply,
        })
        assistantMsg.runId = created.runId
        assistantMsg.traceId = created.traceId
        await pollRun(created.runId, assistantMsg, created.pollAfterMs)
      } else {
        const result = await syncQueryApi(content.trim(), sessionId.value)
        assistantMsg.content = result.summary
        assistantMsg.result = result
        assistantMsg.runStatus = 'success'
        assistantMsg.streaming = false
      }
    } catch (err) {
      assistantMsg.streaming = false
      assistantMsg.runStatus = 'failed'
      assistantMsg.error = err as ApiErrorBody
      assistantMsg.content = (err as ApiErrorBody)?.message ?? '问数失败，请稍后重试'
    } finally {
      isLoading.value = false
    }
  }

  async function submitClarify(runId: string, selectedOptionId: string, text: string, question: string) {
    const idx = messages.value.findIndex((m) => m.pendingClarifyRunId === runId)
    if (idx >= 0) messages.value[idx].pendingClarifyRunId = undefined
    await sendMessage(question, { runId, selectedOptionId, text })
  }

  async function retryLast(question: string) {
    await sendMessage(question)
  }

  function newChat() {
    stopPolling()
    messages.value = []
    const newId = `session-${Date.now()}`
    sessionId.value = newId
    if (USE_MOCK) {
      sessions.value.unshift({
        sessionId: newId,
        title: '新会话',
        lastMessageAt: new Date().toISOString(),
        messageCount: 0,
      })
    }
  }

  function clearMessages() {
    stopPolling()
    messages.value = []
  }

  function removeSession(id: string) {
    if (USE_MOCK) {
      const idx = sessions.value.findIndex((s) => s.sessionId === id)
      if (idx >= 0) sessions.value.splice(idx, 1)
      if (sessionId.value === id) {
        if (sessions.value.length) {
          switchSession(sessions.value[0].sessionId)
        } else {
          newChat()
        }
      }
    }
  }

  return {
    messages,
    sessionId,
    sessions,
    isLoading,
    isLoadingHistory,
    hasMoreHistory,
    useAsyncMode,
    activeRunId,
    loadSessions,
    switchSession,
    loadHistory,
    sendMessage,
    submitClarify,
    retryLast,
    stopPolling,
    newChat,
    clearMessages,
    removeSession,
  }
})
