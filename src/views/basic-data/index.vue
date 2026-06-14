<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-header__title">基础数据管理</h2>
      <el-button v-if="hasManagePermission('basic-data')" type="primary" :icon="Plus" @click="handleCreateOpen">
        新建数据
      </el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="数字人" name="digital_human" />
      <el-tab-pane label="问数" name="data_query" />
      <el-tab-pane label="问答" name="qa" />
    </el-tabs>

    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索名称或编码"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
    </div>

    <ManageCardGrid :loading="isLoading" :empty="tableList.length === 0">
      <ManageCardItem v-for="row in tableList" :key="row.id" :title="row.name">
        <template #tag>
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
        <ManageCardField label="编码" :value="row.code" />
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
      :title="editingRow ? '编辑基础数据' : '新建基础数据'"
      width="520px"
      destroy-on-close
    >
      <el-form :model="formModel" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="formModel.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="编码">
          <el-input v-model="formModel.code" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formModel.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formModel.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <ManageItemDetailDialog
      v-model:visible="isDetailVisible"
      title="基础数据详情"
      :data="detailRow as Record<string, unknown> | null"
      :fields="detailFields"
      :loading="isDetailLoading"
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
import { formatBasicDataType, formatRecordStatus } from '@/utils/manage'

import { useBasicDataManage } from './useBasicDataManage'

const { hasManagePermission } = usePermission()

const detailFields: DetailField[] = [
  { prop: 'name', label: '名称' },
  { prop: 'code', label: '编码' },
  { prop: 'type', label: '类型', formatter: (val) => formatBasicDataType(val) },
  { prop: 'description', label: '描述' },
  { prop: 'status', label: '状态', formatter: (val) => formatRecordStatus(val) },
  { prop: 'updatedAt', label: '更新时间' },
]

const {
  activeTab,
  tableList,
  isLoading,
  isDialogVisible,
  isDetailVisible,
  isDetailLoading,
  isSubmitting,
  editingRow,
  detailRow,
  keyword,
  pagination,
  formModel,
  fetchTableList,
  handleTabChange,
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
