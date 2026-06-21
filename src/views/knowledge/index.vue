<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-header__title">Prompt 配置</h2>
      <el-button v-if="hasManagePermission('knowledge')" type="primary" :icon="Plus" @click="handleCreateOpen">
        新建 Prompt
      </el-button>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索 Prompt Key"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
    </div>

    <ManageCardGrid :loading="isLoading" :empty="tableList.length === 0">
      <ManageCardItem v-for="row in tableList" :key="row.id" :title="row.promptKey">
        <template #tag>
          <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
            {{ row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
        <ManageCardField label="版本" :value="row.version" />
        <ManageCardField label="内容摘要" :value="contentPreview(row.content)" />
        <ManageCardField label="更新时间" :value="row.updatedAt" />
        <template #actions>
          <ManageRowActions
            :can-manage="hasManagePermission('knowledge')"
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
      :title="editingRow ? '编辑 Prompt' : '新建 Prompt'"
      width="640px"
      destroy-on-close
    >
      <el-form :model="formModel" label-width="100px">
        <el-form-item label="Prompt Key" required>
          <el-input v-model="formModel.promptKey" placeholder="如 prompt_text2sql_v1" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="formModel.version" placeholder="v1" />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="formModel.content" type="textarea" :rows="8" placeholder="请输入 Prompt 内容" />
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
      title="Prompt 详情"
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

import { useKnowledgeManage } from './useKnowledgeManage'

const { hasManagePermission } = usePermission()

function contentPreview(content: string) {
  return content.length > 48 ? `${content.slice(0, 48)}...` : content
}

const detailFields: DetailField[] = [
  { prop: 'promptKey', label: 'Prompt Key' },
  { prop: 'version', label: '版本' },
  { prop: 'content', label: '内容' },
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
} = useKnowledgeManage()

onMounted(() => {
  fetchTableList()
})
</script>
