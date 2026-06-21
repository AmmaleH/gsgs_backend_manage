<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-header__title">问数审计日志</h2>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索问题或 Trace ID"
        clearable
        style="width: 260px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select
        v-model="statusFilter"
        placeholder="状态"
        clearable
        style="width: 140px"
        @change="handleStatusFilterChange"
      >
        <el-option label="成功" value="success" />
        <el-option label="部分成功" value="partial" />
        <el-option label="失败" value="failed" />
        <el-option label="超时" value="timeout" />
        <el-option label="澄清" value="clarify" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
    </div>

    <ManageCardGrid :loading="isLoading" :empty="tableList.length === 0">
      <ManageCardItem v-for="row in tableList" :key="row.runId" :title="row.question">
        <template #tag>
          <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
        <ManageCardField label="场景" :value="row.scenarioId" />
        <ManageCardField label="路由类型" :value="row.routeType" />
        <ManageCardField label="耗时" :value="`${row.durationMs} ms`" />
        <ManageCardField label="Trace ID" :value="row.traceId" />
        <ManageCardField label="创建时间" :value="row.createdAt" />
        <template #actions>
          <el-button type="primary" link @click="handleTraceOpen(row)">查看 Trace</el-button>
        </template>
      </ManageCardItem>
    </ManageCardGrid>

    <ManageFixedPagination
      :page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      @page-change="handlePageChange"
      @size-change="handlePageSizeChange"
    />

    <el-drawer v-model="isTraceVisible" title="Trace 详情" size="520px" destroy-on-close>
      <div v-loading="isTraceLoading" class="trace-drawer">
        <template v-if="traceDetail">
          <section class="trace-section">
            <h4>基本信息</h4>
            <div class="trace-row"><span>Run ID</span><span>{{ traceDetail.runId }}</span></div>
            <div class="trace-row"><span>Trace ID</span><span>{{ traceDetail.traceId }}</span></div>
            <div class="trace-row"><span>问题</span><span>{{ traceDetail.question }}</span></div>
            <div class="trace-row">
              <span>状态</span>
              <el-tag :type="statusTagType(traceDetail.status)" size="small">
                {{ statusLabel(traceDetail.status) }}
              </el-tag>
            </div>
            <div class="trace-row"><span>耗时</span><span>{{ traceDetail.durationMs }} ms</span></div>
          </section>

          <section class="trace-section">
            <h4>阶段时间线</h4>
            <el-timeline>
              <el-timeline-item
                v-for="log in traceDetail.stageLogs"
                :key="log.stage"
                :type="log.status === 'success' ? 'success' : 'primary'"
              >
                <div class="trace-stage">
                  <strong>{{ log.name }}</strong>
                  <span>{{ log.durationMs }} ms</span>
                </div>
              </el-timeline-item>
            </el-timeline>
          </section>

          <section v-if="traceDetail.planJson" class="trace-section">
            <h4>计划 (planJson)</h4>
            <pre class="trace-json">{{ traceDetail.planJson }}</pre>
          </section>

          <section v-if="traceDetail.resultJson" class="trace-section">
            <h4>结果 (resultJson)</h4>
            <pre class="trace-json">{{ traceDetail.resultJson }}</pre>
          </section>

          <section v-if="traceDetail.error" class="trace-section trace-section--error">
            <h4>错误</h4>
            <p>{{ traceDetail.error.message }}</p>
            <p class="trace-error-code">code: {{ traceDetail.error.code }}</p>
          </section>
        </template>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { Search } from '@element-plus/icons-vue'

import ManageCardField from '@/components/manage/ManageCardField.vue'
import ManageCardGrid from '@/components/manage/ManageCardGrid.vue'
import ManageCardItem from '@/components/manage/ManageCardItem.vue'
import ManageFixedPagination from '@/components/manage/ManageFixedPagination.vue'
import type { RunStatus } from '@/types/api'

import { useQueryLogsManage } from './useQueryLogsManage'

function statusLabel(status: RunStatus) {
  const map: Partial<Record<RunStatus, string>> = {
    success: '成功',
    partial: '部分成功',
    failed: '失败',
    timeout: '超时',
    clarify: '澄清',
    running: '运行中',
    accepted: '已接收',
    blocked: '已拦截',
  }
  return map[status] ?? status
}

function statusTagType(status: RunStatus) {
  if (status === 'success') return 'success'
  if (status === 'partial') return 'warning'
  if (status === 'failed' || status === 'timeout' || status === 'blocked') return 'danger'
  if (status === 'clarify') return 'info'
  return 'primary'
}

const {
  tableList,
  isLoading,
  keyword,
  statusFilter,
  pagination,
  isTraceVisible,
  isTraceLoading,
  traceDetail,
  fetchTableList,
  handleSearch,
  handlePageChange,
  handlePageSizeChange,
  handleStatusFilterChange,
  handleTraceOpen,
} = useQueryLogsManage()

onMounted(() => {
  fetchTableList()
})
</script>

<style scoped lang="scss">
.trace-drawer {
  min-height: 200px;
}

.trace-section {
  margin-bottom: 24px;

  h4 {
    margin: 0 0 12px;
    font-size: 14px;
    color: var(--color-text-primary);
  }

  &--error {
    color: var(--color-danger);
  }
}

.trace-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;

  span:first-child {
    width: 72px;
    flex-shrink: 0;
    color: var(--color-text-secondary);
  }

  span:last-child {
    word-break: break-all;
  }
}

.trace-stage {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;

  span {
    color: var(--color-text-secondary);
  }
}

.trace-json {
  background: var(--color-bg-page);
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.trace-error-code {
  font-size: 12px;
  opacity: 0.85;
}
</style>
