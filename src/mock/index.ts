import type {
  AdminPageResult,
  AdminPermissionItem,
  AdminRoleItem,
  AdminUserItem,
  ApiUser,
  ChangePasswordRequest,
  ClarifyPayload,
  CreateRunRequest,
  CreateRunResponse,
  LoginRequest,
  LoginResponse,
  PromptItem,
  QueryLogItem,
  QueryResult,
  QueryRunDetail,
  RoutingRuleItem,
  SessionItem,
  SessionMessage,
  SqlTableItem,
  TraceDetail,
} from '@/types/api'
import { ALL_PERMISSION_CODES } from '@/constants/permission'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** 内存中的问数任务（模拟轮询） */
interface MockRunState {
  runId: string
  traceId: string
  question: string
  sessionId: string
  pollCount: number
  clarifyOptionId?: string
  createdAt: string
}

const mockRuns = new Map<string, MockRunState>()

export const MOCK_SESSIONS: SessionItem[] = [
  {
    sessionId: 'session-001',
    title: '收费站交通量查询',
    lastMessageAt: '2026-06-20T10:03:00+08:00',
    messageCount: 4,
  },
  {
    sessionId: 'session-002',
    title: 'ETC办理情况',
    lastMessageAt: '2026-06-19T16:20:00+08:00',
    messageCount: 6,
  },
]

export const MOCK_SESSION_MESSAGES: Record<string, SessionMessage[]> = {
  'session-001': [
    {
      messageId: 'msg-1',
      role: 'user',
      content: '昨天兰州东入口交通量是多少？',
      createdAt: '2026-06-20T10:00:00+08:00',
    },
    {
      messageId: 'msg-2',
      role: 'assistant',
      content: '2026-06-19 兰州东收费站入口交通量为 12345 辆次。',
      createdAt: '2026-06-20T10:00:03+08:00',
      traceId: 'trace-20260620-0001',
      resultSnapshot: buildTrafficResult('兰州东收费站'),
    },
  ],
  'session-002': [
    {
      messageId: 'msg-3',
      role: 'user',
      content: '本月ETC办理量趋势如何？',
      createdAt: '2026-06-19T16:18:00+08:00',
    },
    {
      messageId: 'msg-4',
      role: 'assistant',
      content: '本月 ETC 办理量呈稳步上升趋势，详见下表。',
      createdAt: '2026-06-19T16:20:00+08:00',
      traceId: 'trace-20260619-0008',
      resultSnapshot: {
        summary: '2026年6月 ETC 办理量汇总。',
        queryType: 'table',
        table: {
          columns: [
            { field: 'week', label: '周次', dataType: 'string' },
            { field: 'count', label: '办理量', dataType: 'integer', unit: '笔' },
          ],
          rows: [
            { week: '第1周', count: 3200 },
            { week: '第2周', count: 3580 },
            { week: '第3周', count: 4100 },
          ],
          total: 3,
        },
        provenance: {
          scenarioId: 'SCN_ETC_APPLY',
          routeType: 'SQL',
          sources: ['fact_etc_apply_daily'],
          metricDefinition: '办理量单位：笔',
          filters: ['统计月份=2026-06'],
        },
      },
    },
  ],
}

export let MOCK_ROUTING_RULES: RoutingRuleItem[] = [
  {
    id: '1',
    scenarioId: 'SCN_STATION_TRAFFIC',
    routeType: 'SQL',
    priority: 100,
    requiredSlots: ['statDate', 'stationCode', 'direction'],
    status: 'published',
    updatedAt: '2026-06-10 10:00:00',
  },
  {
    id: '2',
    scenarioId: 'SCN_ETC_APPLY',
    routeType: 'API',
    priority: 90,
    requiredSlots: ['statMonth'],
    status: 'published',
    updatedAt: '2026-06-11 14:00:00',
  },
  {
    id: '3',
    scenarioId: 'SCN_GANTRY_FLOW',
    routeType: 'SQL',
    priority: 80,
    requiredSlots: ['statDate', 'gantryCode'],
    status: 'draft',
    updatedAt: '2026-06-12 09:00:00',
  },
]

export let MOCK_PROMPTS: PromptItem[] = [
  {
    id: '1',
    promptKey: 'prompt_text2sql_v1',
    version: 'v1',
    content: '你是联网收费问数 SQL 生成器，请根据用户问题生成安全 SQL。',
    status: 'published',
    updatedAt: '2026-06-10 10:00:00',
  },
  {
    id: '2',
    promptKey: 'prompt_explain_v1',
    version: 'v1',
    content: '你是数据分析助手，请用简洁中文解释查询结果。',
    status: 'published',
    updatedAt: '2026-06-11 11:00:00',
  },
]

export let MOCK_SQL_TABLES: SqlTableItem[] = [
  {
    id: '1',
    tableName: 'fact_station_traffic_daily',
    businessDomain: 'traffic',
    allowedColumns: ['stat_date', 'station_code', 'traffic_count', 'direction'],
    status: 'published',
    updatedAt: '2026-06-10 10:00:00',
  },
  {
    id: '2',
    tableName: 'fact_etc_apply_daily',
    businessDomain: 'etc',
    allowedColumns: ['stat_date', 'apply_count', 'channel'],
    status: 'published',
    updatedAt: '2026-06-12 09:00:00',
  },
]

export let MOCK_QUERY_LOGS: QueryLogItem[] = [
  {
    runId: 'run-20260620-0001',
    traceId: 'trace-20260620-0001',
    question: '昨天兰州东入口交通量是多少？',
    status: 'success',
    scenarioId: 'SCN_STATION_TRAFFIC',
    routeType: 'SQL',
    durationMs: 3200,
    createdAt: '2026-06-20T10:00:00+08:00',
  },
  {
    runId: 'run-20260620-0002',
    traceId: 'trace-20260620-0002',
    question: 'ETC本月办理趋势',
    status: 'timeout',
    scenarioId: 'SCN_ETC_APPLY',
    routeType: 'API',
    durationMs: 95000,
    createdAt: '2026-06-20T10:04:12+08:00',
  },
]

export let MOCK_ADMIN_USERS: AdminUserItem[] = [
  {
    id: '1',
    userId: 'u_admin',
    username: 'admin',
    displayName: '系统管理员',
    enabled: true,
    roles: ['ADMIN'],
    updatedAt: '2026-06-10 10:00:00',
  },
  {
    id: '2',
    userId: 'u_demo',
    username: 'demo_user',
    displayName: '演示用户',
    enabled: true,
    roles: ['DATA_USER'],
    updatedAt: '2026-06-11 14:00:00',
  },
]

export let MOCK_ADMIN_ROLES: AdminRoleItem[] = [
  {
    id: '1',
    roleCode: 'ADMIN',
    roleName: '系统管理员',
    permissions: ALL_PERMISSION_CODES as unknown as string[],
    updatedAt: '2026-06-10 10:00:00',
  },
  {
    id: '2',
    roleCode: 'DATA_USER',
    roleName: '数据用户',
    permissions: ['query:run', 'query:history'],
    updatedAt: '2026-06-11 14:00:00',
  },
]

export const MOCK_ADMIN_PERMISSIONS: AdminPermissionItem[] = [
  { code: 'query:run', name: '发起问数', module: '问数' },
  { code: 'query:history', name: '查看历史', module: '问数' },
  { code: 'admin:query-log:view', name: '查看问数日志', module: '管理端' },
  { code: 'admin:trace:view', name: '查看Trace', module: '管理端' },
  { code: 'admin:prompt:edit', name: '编辑Prompt', module: '管理端' },
  { code: 'admin:sql:edit', name: '编辑SQL白名单', module: '管理端' },
]

function buildTrafficResult(stationName: string): QueryResult {
  return {
    summary: `2026-06-19 ${stationName}入口交通量为 12345 辆次。`,
    queryType: 'table',
    table: {
      columns: [
        { field: 'stationName', label: '收费站', dataType: 'string' },
        { field: 'statDate', label: '统计日期', dataType: 'date' },
        { field: 'trafficCount', label: '入口交通量', dataType: 'integer', unit: '辆次' },
      ],
      rows: [{ stationName, statDate: '2026-06-19', trafficCount: 12345 }],
      total: 1,
    },
    provenance: {
      scenarioId: 'SCN_STATION_TRAFFIC',
      routeType: 'SQL',
      sources: ['fact_station_traffic_daily'],
      metricDefinition: '交通量单位：辆次',
      filters: [`统计日期=2026-06-19`, `收费站=${stationName}`, '方向=入口'],
    },
  }
}

function buildClarify(): ClarifyPayload {
  return {
    message: '找到多个相近收费站，请选择一个。',
    options: [
      { id: 'ST_LZD', label: '兰州东收费站' },
      { id: 'ST_LZX', label: '兰州西收费站' },
      { id: 'ST_LZB', label: '兰州北收费站' },
    ],
  }
}

export async function mockLogin(params: LoginRequest): Promise<LoginResponse> {
  await delay(500)
  if (!params.username?.trim() || !params.password?.trim()) {
    throw { code: 'AUTH_FAILED', message: '账号或密码不能为空', traceId: generateTraceId(), retryable: false }
  }
  const user: ApiUser = {
    userId: 'u_' + params.username.trim(),
    username: params.username.trim(),
    displayName: params.username.trim(),
    roles: ['ADMIN'],
    permissions: ['query:run', 'query:history', ...ALL_PERMISSION_CODES],
    dataScopes: [
      {
        scopeCode: 'road:gansu-all',
        scopeName: '甘肃高速全部路段',
        roadIds: ['G30'],
        stationIds: [],
        gantryIds: [],
      },
    ],
  }
  return {
    accessToken: 'mock-access-' + Date.now(),
    expiresIn: 7200,
    forceChangePassword: false,
    user,
  }
}

export async function mockGetMe(): Promise<ApiUser> {
  await delay(200)
  return mockLogin({ username: 'demo', password: 'x' }).then((r) => r.user)
}

export async function mockChangePassword(params: ChangePasswordRequest): Promise<void> {
  await delay(400)
  if (!params.oldPassword?.trim() || !params.newPassword?.trim()) {
    throw { code: 'INVALID_PARAM', message: '原密码和新密码不能为空', traceId: generateTraceId(), retryable: false }
  }
  if (params.oldPassword === params.newPassword) {
    throw { code: 'INVALID_PARAM', message: '新密码不能与原密码相同', traceId: generateTraceId(), retryable: false }
  }
  if (params.oldPassword === 'wrong') {
    throw { code: 'AUTH_FAILED', message: '原密码错误', traceId: generateTraceId(), retryable: false }
  }
}

export function generateTraceId() {
  return `trace-${Date.now()}`
}

export async function mockCreateRun(req: CreateRunRequest): Promise<CreateRunResponse> {
  await delay(300)
  const runId = `run-${Date.now()}`
  const traceId = generateTraceId()
  mockRuns.set(runId, {
    runId,
    traceId,
    question: req.question,
    sessionId: req.sessionId,
    pollCount: 0,
    clarifyOptionId: req.clarifyReply?.selectedOptionId,
    createdAt: new Date().toISOString(),
  })
  return { runId, traceId, status: 'accepted', pollAfterMs: 800 }
}

export async function mockGetRun(runId: string): Promise<QueryRunDetail> {
  await delay(400)
  const state = mockRuns.get(runId)
  if (!state) {
    throw { code: 'NOT_FOUND', message: '任务不存在', traceId: generateTraceId(), retryable: false }
  }

  state.pollCount += 1
  const now = new Date().toISOString()
  const base = {
    runId: state.runId,
    traceId: state.traceId,
    createdAt: state.createdAt,
    updatedAt: now,
  }

  const q = state.question

  if (q.includes('失败') || q.includes('error')) {
    return {
      ...base,
      status: 'failed',
      stage: 'FAILED',
      error: {
        code: 'SQL_TIMEOUT',
        message: '查询执行超时，请缩小时间范围后重试',
        traceId: state.traceId,
        retryable: true,
      },
    }
  }

  if (state.clarifyOptionId) {
    const label =
      buildClarify().options.find((o) => o.id === state.clarifyOptionId)?.label ?? '兰州东收费站'
    return {
      ...base,
      status: 'success',
      stage: 'DONE',
      progress: buildProgress(100, 'success'),
      result: buildTrafficResult(label),
    }
  }

  if ((q.includes('澄清') || q.includes('多个') || q.includes('相近')) && state.pollCount >= 2) {
    return {
      ...base,
      status: 'clarify',
      stage: 'CLARIFY',
      progress: buildProgress(60, 'running'),
      clarify: buildClarify(),
    }
  }

  if (state.pollCount === 1) {
    return {
      ...base,
      status: 'running',
      stage: 'QUERYING',
      progress: buildProgress(45, 'running'),
    }
  }

  if (q.includes('部分') || q.includes('partial')) {
    return {
      ...base,
      status: 'partial',
      stage: 'DONE',
      progress: buildProgress(100, 'success'),
      result: {
        ...buildTrafficResult('兰州东收费站'),
        warning: '部分路段数据缺失，结果仅供参考。',
      },
    }
  }

  return {
    ...base,
    status: 'success',
    stage: 'DONE',
    progress: buildProgress(100, 'success'),
    result: buildTrafficResult('兰州东收费站'),
  }
}

function buildProgress(percent: number, finalStatus: string): QueryRunDetail['progress'] {
  return {
    percent,
    steps: [
      { stage: 'RECEIVED', name: '接收问题', status: 'success' },
      { stage: 'PLANNING', name: '意图识别', status: percent > 30 ? 'success' : 'running' },
      { stage: 'QUERYING', name: '查询数据', status: percent > 70 ? 'success' : finalStatus === 'running' ? 'running' : 'pending' },
      { stage: 'EXPLAINING', name: '生成解释', status: percent >= 100 ? 'success' : 'pending' },
    ],
  }
}

export async function mockSyncQuery(question: string): Promise<QueryResult> {
  await delay(1000)
  if (question.includes('失败')) {
    throw { code: 'SQL_TIMEOUT', message: '同步查询超时', traceId: generateTraceId(), retryable: true }
  }
  return buildTrafficResult('兰州东收费站')
}

export async function mockGetSessions(): Promise<SessionItem[]> {
  await delay(300)
  return [...MOCK_SESSIONS]
}

export async function mockGetSessionMessages(sessionId: string): Promise<SessionMessage[]> {
  await delay(300)
  return MOCK_SESSION_MESSAGES[sessionId] ? [...MOCK_SESSION_MESSAGES[sessionId]] : []
}

export async function mockGetQueryLogs(params: {
  keyword?: string
  status?: string
  pageNo: number
  pageSize: number
}): Promise<AdminPageResult<QueryLogItem>> {
  await delay(300)
  let list = [...MOCK_QUERY_LOGS]
  if (params.keyword) {
    const k = params.keyword.toLowerCase()
    list = list.filter((i) => i.question.toLowerCase().includes(k) || i.traceId.includes(k))
  }
  if (params.status) list = list.filter((i) => i.status === params.status)
  const start = (params.pageNo - 1) * params.pageSize
  return {
    pageNo: params.pageNo,
    pageSize: params.pageSize,
    total: list.length,
    records: list.slice(start, start + params.pageSize),
  }
}

export async function mockGetTrace(traceId: string): Promise<TraceDetail> {
  await delay(300)
  const log = MOCK_QUERY_LOGS.find((i) => i.traceId === traceId)
  return {
    traceId,
    runId: log?.runId ?? 'run-unknown',
    question: log?.question ?? '未知问题',
    status: log?.status ?? 'success',
    durationMs: log?.durationMs ?? 3000,
    stageLogs: [
      { stage: 'RECEIVED', name: '接收问题', status: 'success', durationMs: 12 },
      { stage: 'PLANNING', name: '意图识别', status: 'success', durationMs: 320 },
      { stage: 'QUERYING', name: '查询数据', status: 'success', durationMs: 410 },
      { stage: 'EXPLAINING', name: '结果解释', status: 'success', durationMs: 900 },
    ],
    planJson: '{"intent":"station_traffic","slots":{"statDate":"2026-06-19"}}',
    resultJson: '{"summary":"...","queryType":"table"}',
  }
}

export function paginateRecords<T>(list: T[], pageNo: number, pageSize: number): AdminPageResult<T> {
  const start = (pageNo - 1) * pageSize
  return { pageNo, pageSize, total: list.length, records: list.slice(start, start + pageSize) }
}
