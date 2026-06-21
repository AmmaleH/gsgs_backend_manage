<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-header__title">SQL 白名单</h2>
      <el-button v-if="hasManagePermission('basic-data')" type="primary" :icon="Plus" @click="handleCreateOpen">
        新建白名单表
      </el-button>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索表名"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
    </div>

    <ManageCardGrid :loading="isLoading" :empty="tableList.length === 0">
      <ManageCardItem v-for="row in tableList" :key="row.id" :title="row.tableName">
        <template #tag>
          <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
            {{ row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
        <ManageCardField label="业务域" :value="row.businessDomain" />
        <ManageCardField label="允许列" :value="row.allowedColumns.join('、') || '-'" />
        <ManageCardField label="更新时间" :value="row.updatedAt" />
        <template #actions>
          <ManageRowActions
            :can-manage="hasManagePermission('basic-data')"
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
      :title="editingRow ? '编辑白名单表' : '新建白名单表'"
      width="560px"
      destroy-on-close
    >
      <el-form :model="formModel" label-width="100px">
        <el-form-item label="表名" required>
          <el-input v-model="formModel.tableName" placeholder="如 fact_station_traffic_daily" />
        </el-form-item>
        <el-form-item label="业务域">
          <el-input v-model="formModel.businessDomain" placeholder="如 traffic / etc" />
        </el-form-item>
        <el-form-item label="允许列">
          <el-input
            v-model="formModel.allowedColumnsText"
            placeholder="多个列名用逗号分隔"
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
      title="SQL 白名单详情"
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

import { useBasicDataManage } from './useBasicDataManage'

const { hasManagePermission } = usePermission()

const detailFields: DetailField[] = [
  { prop: 'tableName', label: '表名' },
  { prop: 'businessDomain', label: '业务域' },
  {
    prop: 'allowedColumns',
    label: '允许列',
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
} = useBasicDataManage()

onMounted(() => {
  fetchTableList()
})
</script>
