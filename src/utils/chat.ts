import { EStorageKey } from '@/constants'
import type { ChatStreamOptions } from '@/types'
import { getStorageItem } from '@/utils/storage'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 模拟流式输出 */
async function mockStreamReply(message: string, onChunk: (chunk: string) => void): Promise<void> {
  const reply = `您好！我已收到您的问题：「${message}」。这是模拟流式回复，后续可对接真实 SSE 接口。`
  const chars = reply.split('')
  for (const char of chars) {
    onChunk(char)
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 20))
  }
}

/**
 * 流式对话请求（SSE）
 * 若接口不支持流式，调用方应 fallback 到 syncChat
 */
export async function streamChat(options: ChatStreamOptions): Promise<void> {
  const { message, sessionId, onChunk, onDone, onError, signal } = options

  if (USE_MOCK) {
    try {
      await mockStreamReply(message, onChunk)
      onDone()
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)))
    }
    return
  }

  const token = getStorageItem<string | null>(EStorageKey.TOKEN, null)
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

  try {
    const response = await fetch(`${baseURL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, sessionId }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`流式请求失败: ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''

    // 非 SSE 响应时抛出，由上层 fallback 到同步接口
    if (!contentType.includes('text/event-stream') && !response.body) {
      throw new Error('接口不支持流式响应')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取流式响应')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data) as { content?: string; delta?: string }
            const chunk = parsed.content ?? parsed.delta ?? data
            if (chunk) onChunk(chunk)
          } catch {
            if (data) onChunk(data)
          }
        }
      }
    }

    onDone()
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)))
  }
}

/** 同步对话请求（兜底方案） */
export async function syncChat(message: string, sessionId?: string): Promise<string> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800))
    return `您好！我已收到您的问题：「${message}」。这是同步回复模式，接口对接后可切换为流式显示。`
  }

  const token = getStorageItem<string | null>(EStorageKey.TOKEN, null)
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

  const response = await fetch(`${baseURL}/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, sessionId }),
  })

  if (!response.ok) {
    throw new Error(`同步请求失败: ${response.status}`)
  }

  const result = (await response.json()) as { code: number; message: string; data: { content: string } }
  if (result.code !== 0 && result.code !== 200) {
    throw new Error(result.message || '对话失败')
  }

  return result.data.content
}
