import { computed, nextTick, onMounted, ref, watch, type Ref } from 'vue'

import type { ElInput } from 'element-plus'

import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import type { ChatMessage } from '@/types'
import { showToast } from '@/utils/message'

export const CHAT_MODEL_OPTIONS = [
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'Claude-3.5', value: 'claude-3.5' },
  { label: 'Qwen-Max', value: 'qwen-max' },
  { label: 'Local-Qwen', value: 'local-qwen' },
] as const

export const WELCOME_PROMPT_CARDS = [
  {
    id: 'traffic',
    icon: 'DataLine',
    title: '交通量查询',
    desc: '查询收费站入口/出口交通量',
    content: '昨天兰州东入口交通量是多少？',
  },
  {
    id: 'etc',
    icon: 'TrendCharts',
    title: 'ETC 趋势',
    desc: '分析办理量与渠道分布',
    content: '本月ETC办理量趋势如何？',
  },
  {
    id: 'clarify',
    icon: 'QuestionFilled',
    title: '澄清体验',
    desc: '体验多选项澄清交互',
    content: '兰州附近多个收费站交通量对比',
  },
  {
    id: 'error',
    icon: 'WarningFilled',
    title: '异常排查',
    desc: '模拟失败与重试流程',
    content: '查询失败 error 测试',
  },
] as const

export function useChatPage(inputRef?: Ref<InstanceType<typeof ElInput> | undefined>) {
  const chatStore = useChatStore()
  const userStore = useUserStore()

  const inputText = ref('')
  const messageListRef = ref<HTMLElement>()
  const isNearBottom = ref(true)
  const isSidebarCollapsed = ref(false)
  const isInputFocused = ref(false)
  const selectedModel = ref('local-qwen')

  const currentSessionTitle = computed(() => {
    const session = chatStore.sessions.find((s) => s.sessionId === chatStore.sessionId)
    return session?.title ?? '新会话'
  })

  const userInitial = computed(() => {
    const name = userStore.userInfo?.nickname || 'U'
    return name.charAt(0).toUpperCase()
  })

  const isEmptyChat = computed(
    () => chatStore.messages.length === 0 && !chatStore.isLoadingHistory,
  )

  onMounted(async () => {
    await chatStore.loadSessions()
    if (chatStore.sessions.length) {
      await chatStore.switchSession(chatStore.sessionId)
    }
    scrollToBottom()
  })

  watch(
    () => chatStore.messages.length,
    () => {
      if (isNearBottom.value) nextTick(scrollToBottom)
    },
  )

  watch(
    () => chatStore.messages.map((m) => m.content + (m.runStatus ?? '')).join(''),
    () => {
      if (isNearBottom.value) nextTick(scrollToBottom)
    },
  )

  function scrollToBottom() {
    const el = messageListRef.value
    if (el) el.scrollTop = el.scrollHeight
  }

  function handleScroll() {
    const el = messageListRef.value
    if (!el) return
    if (el.scrollTop <= 10 && chatStore.hasMoreHistory && !chatStore.isLoadingHistory) {
      chatStore.loadHistory()
    }
    isNearBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  function focusInput() {
    nextTick(() => inputRef?.value?.focus())
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? inputText.value).trim()
    if (!text || chatStore.isLoading) return
    if (overrideText === undefined) {
      inputText.value = ''
    }
    isNearBottom.value = true
    await chatStore.sendMessage(text)
    nextTick(scrollToBottom)
  }

  function handlePromptSelect(content: string) {
    void handleSend(content)
  }

  function handleQuickTagSelect(content: string) {
    void handleSend(content)
  }

  async function handleNewChat() {
    await chatStore.newChat()
    focusInput()
  }

  async function handleSwitchSession(id: string) {
    await chatStore.switchSession(id)
    nextTick(scrollToBottom)
  }

  function handleClearChat() {
    chatStore.clearMessages()
    showToast('当前会话已清空', 'success')
  }

  function handleToggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  async function handleClarifyConfirm(msg: ChatMessage, optionId: string, label: string) {
    if (!msg.pendingClarifyRunId) return
    const userIdx = chatStore.messages.findIndex((m) => m.id === msg.id) - 1
    const question = userIdx >= 0 ? chatStore.messages[userIdx].content : msg.content
    await chatStore.submitClarify(msg.pendingClarifyRunId, optionId, label, question)
    nextTick(scrollToBottom)
  }

  function handleRetry(msgIndex: number) {
    const userMsg = [...chatStore.messages].slice(0, msgIndex).reverse().find((m) => m.role === 'user')
    if (userMsg) chatStore.retryLast(userMsg.content)
  }

  function handleCopy(content: string) {
    navigator.clipboard.writeText(content).then(() => showToast('已复制', 'success'))
  }

  function handleSendClick() {
    void handleSend()
  }

  return {
    chatStore,
    inputText,
    messageListRef,
    isNearBottom,
    isSidebarCollapsed,
    isInputFocused,
    selectedModel,
    currentSessionTitle,
    userInitial,
    isEmptyChat,
    scrollToBottom,
    handleScroll,
    handleKeydown,
    handleSend,
    handleSendClick,
    handlePromptSelect,
    handleQuickTagSelect,
    handleNewChat,
    handleSwitchSession,
    handleClearChat,
    handleToggleFullscreen,
    handleClarifyConfirm,
    handleRetry,
    handleCopy,
    focusInput,
  }
}
