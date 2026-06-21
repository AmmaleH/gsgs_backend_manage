<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-header__title">场景路由规则</h2>
      <el-button v-if="hasManagePermission('agent')" type="primary" :icon="Plus" @click="handleCreateOpen">
        新建规则
      </el-button>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索场景 ID"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
    </div>

    <ManageCardGrid :loading="isLoading" :empty="tableList.length === 0">
      <ManageCardItem v-for="row in tableList" :key="row.id" :title="row.scenarioId">
        <template #tag>
          <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
            {{ row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
        <ManageCardField label="路由类型" :value="row.routeType" />
        <ManageCardField label="优先级" :value="row.priority" />
        <ManageCardField label="必填槽位" :value="row.requiredSlots.join('、') || '-'" />
        <ManageCardField label="更新时间" :value="row.updatedAt" />
        <template #actions>
          <ManageRowActions
            :can-manage="hasManagePermission('agent')"
            @view="handleDetailOpen(row)"
            @edit="handleEditOpen(row)"
            @delete="handleDelete(row)"
          />
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

    <el-dialog
      v-model="isDialogVisible"
      :title="editingRow ? '编辑路由规则' : '新建路由规则'"
      width="560px"
      destroy-on-close
    >
      <el-form :model="formModel" label-width="100px">
        <el-form-item label="场景 ID" required>
          <el-input v-model="formModel.scenarioId" placeholder="如 SCN_STATION_TRAFFIC" />
        </el-form-item>
        <el-form-item label="路由类型">
          <el-select v-model="formModel.routeType" style="width: 100%">
            <el-option label="SQL" value="SQL" />
            <el-option label="API" value="API" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="formModel.priority" :min="1" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item label="必填槽位">
          <el-input
            v-model="formModel.requiredSlotsText"
            placeholder="多个槽位用逗号分隔，如 statDate, stationCode"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formModel.status">
            <el-radio value="draft">草稿</el-radio>
            <el-radio value="published">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <ManageItemDetailDialog
      v-model:visible="isDetailVisible"
      title="路由规则详情"
      :data="detailRow as Record<string, unknown> | null"
      :fields="detailFields"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { Plus, Search } from '@element-plus/icons-vue'

import ManageCardField from '@/components/manage/ManageCardField.vue'
import ManageCardGrid from '@/components/manage/ManageCardGrid.vue'
import ManageCardItem from '@/components/manage/ManageCardItem.vue'
import ManageFixedPagination from '@/components/manage/ManageFixedPagination.vue'
import ManageItemDetailDialog from '@/components/manage/ManageItemDetailDialog.vue'
import ManageRowActions from '@/components/manage/ManageRowActions.vue'
import { usePermission } from '@/composables/usePermission'
import type { DetailField } from '@/types/manage'

import { useAgentManage } from './useAgentManage'

const { hasManagePermission } = usePermission()

const detailFields: DetailField[] = [
  { prop: 'scenarioId', label: '场景 ID' },
  { prop: 'routeType', label: '路由类型' },
  { prop: 'priority', label: '优先级' },
  {
    prop: 'requiredSlots',
    label: '必填槽位',
    formatter: (val) => (Array.isArray(val) ? val.join('、') : String(val ?? '-')),
  },
  {
    prop: 'status',
    label: '状态',
    formatter: (val) => (val === 'published' ? '已发布' : '草稿'),
  },
  { prop: 'updatedAt', label: '更新时间' },
]

const {
  tableList,
  isLoading,
  isDialogVisible,
  isDetailVisible,
  isSubmitting,
  editingRow,
  detailRow,
  keyword,
  pagination,
  formModel,
  fetchTableList,
  handleSearch,
  handlePageChange,
  handlePageSizeChange,
  handleCreateOpen,
  handleEditOpen,
  handleDetailOpen,
  handleDelete,
  handleSubmit,
} = useAgentManage()

onMounted(() => {
  fetchTableList()
})
</script>
