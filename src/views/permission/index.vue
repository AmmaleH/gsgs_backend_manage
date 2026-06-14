<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-header__title">权限管理</h2>
      <el-button
        v-if="activeTab === 'account' && hasManagePermission('permission')"
        type="primary"
        :icon="Plus"
        @click="handleAccountCreateOpen"
      >
        新建账号
      </el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="按账号管理权限" name="account" />
      <el-tab-pane label="按权限管理账号" name="permission" />
    </el-tabs>

    <!-- 按账号维度 -->
    <template v-if="activeTab === 'account'">
      <div class="filter-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索账号名 / 昵称"
          clearable
          style="width: 240px"
          @keyup.enter="handleAccountSearch"
          @clear="handleAccountSearch"
        />
        <el-button type="primary" :icon="Search" @click="handleAccountSearch">搜索</el-button>
      </div>

      <ManageCardGrid :loading="isLoading" :empty="tableList.length === 0">
        <ManageCardItem v-for="row in tableList" :key="row.id" :title="row.username">
          <template #tag>
            <el-tag :type="row.role === 'super_admin' ? 'danger' : 'info'" size="small">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
          <ManageCardField label="昵称" :value="row.nickname" />
          <ManageCardField
            label="已授权权限"
            :value="row.role === 'super_admin' ? '全部权限' : getPermissionLabels(row.permissions) || '无'"
          />
          <ManageCardField label="状态" :value="row.status === 1 ? '启用' : '禁用'" />
          <ManageCardField label="更新时间" :value="row.updatedAt" />
          <template #actions>
            <ManageRowActions
              :can-manage="hasManagePermission('permission')"
              :show-delete="row.role !== 'super_admin'"
              @view="handleAccountDetailOpen(row)"
              @edit="handleAccountEditOpen(row)"
              @delete="handleAccountDelete(row)"
            >
              <el-button
                v-if="hasManagePermission('permission')"
                type="primary"
                link
                @click="handleAccountPermOpen(row)"
              >
                配置权限
              </el-button>
            </ManageRowActions>
          </template>
        </ManageCardItem>
      </ManageCardGrid>

      <ManageFixedPagination
        :page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @page-change="handleAccountPageChange"
        @size-change="handleAccountPageSizeChange"
      />
    </template>

    <!-- 按权限维度 -->
    <template v-else>
      <ManageCardGrid :empty="permissionDefList.length === 0">
        <ManageCardItem v-for="row in permissionDefList" :key="row.code" :title="row.name">
          <template #tag>
            <el-tag type="info" size="small">{{ row.accountCount }} 个账号</el-tag>
          </template>
          <ManageCardField label="权限码" :value="row.code" />
          <template #actions>
            <el-button type="primary" link @click="handlePermissionDetailOpen(row.code as EPermissionCode)">查看</el-button>
            <el-button
              v-if="hasManagePermission('permission')"
              type="primary"
              link
              @click="handlePermissionAccountOpen(row.code as EPermissionCode)"
            >
              配置账号
            </el-button>
          </template>
        </ManageCardItem>
      </ManageCardGrid>
      <p class="permission-tip">超级管理员默认拥有全部权限，配置账号时无需单独勾选。</p>
    </template>

    <!-- 账号详情 -->
    <ManageItemDetailDialog
      v-model:visible="isAccountDetailVisible"
      title="账号详情"
      :data="detailAccount as Record<string, unknown> | null"
      :fields="accountDetailFields"
    />

    <!-- 权限详情 -->
    <el-dialog v-model="isPermissionDetailVisible" title="权限详情" width="560px" destroy-on-close>
      <el-descriptions v-if="detailPermissionCode" :column="1" border>
        <el-descriptions-item label="权限码">{{ detailPermissionCode }}</el-descriptions-item>
        <el-descriptions-item label="权限名称">
          {{ permissionLabelMap[detailPermissionCode] }}
        </el-descriptions-item>
        <el-descriptions-item label="授权账号数">
          {{ getAccountsByPermissionCode(detailPermissionCode).length }}
        </el-descriptions-item>
      </el-descriptions>
      <div v-if="detailPermissionCode" class="detail-account-list">
        <h4 class="detail-account-list__title">已授权账号</h4>
        <el-table
          :data="getAccountsByPermissionCode(detailPermissionCode)"
          stripe
          border
          size="small"
          max-height="240"
        >
          <el-table-column prop="username" label="账号" width="120" />
          <el-table-column prop="nickname" label="昵称" width="100" />
          <el-table-column prop="role" label="角色">
            <template #default="{ row }">{{ getRoleLabel(row.role) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="isPermissionDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新建/编辑账号 -->
    <el-dialog
      v-model="isAccountDialogVisible"
      :title="editingAccount ? '编辑账号' : '新建账号'"
      width="480px"
      destroy-on-close
    >
      <el-form :model="accountForm" label-width="80px">
        <el-form-item label="账号" required>
          <el-input
            v-model="accountForm.username"
            placeholder="登录账号"
            :disabled="!!editingAccount && editingAccount.role === 'super_admin'"
          />
        </el-form-item>
        <el-form-item label="昵称" required>
          <el-input v-model="accountForm.nickname" placeholder="展示昵称" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="accountForm.role"
            :disabled="!!editingAccount && editingAccount.role === 'super_admin'"
          >
            <el-option label="普通账号" :value="EUserRole.NORMAL" />
            <el-option label="超级管理员" :value="EUserRole.SUPER_ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="accountForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isAccountDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleAccountSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 按账号配置权限 -->
    <el-dialog
      v-model="isAccountPermDialogVisible"
      title="配置账号权限"
      width="520px"
      destroy-on-close
    >
      <p v-if="editingAccount" class="dialog-subtitle">
        账号：{{ editingAccount.username }}（{{ editingAccount.nickname }}）
      </p>
      <el-checkbox-group v-model="selectedPermissions">
        <el-checkbox
          v-for="code in allPermissionCodes"
          :key="code"
          :label="code"
          class="perm-checkbox"
        >
          {{ permissionLabelMap[code] }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="isAccountPermDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleAccountPermSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 按权限配置账号 -->
    <el-dialog
      v-model="isPermissionAccountDialogVisible"
      title="配置授权账号"
      width="520px"
      destroy-on-close
    >
      <p v-if="editingPermissionCode" class="dialog-subtitle">
        权限：{{ permissionLabelMap[editingPermissionCode] }}（{{ editingPermissionCode }}）
      </p>
      <el-checkbox-group v-model="selectedAccountIds">
        <el-checkbox
          v-for="account in selectableAccounts"
          :key="account.id"
          :label="account.id"
          class="perm-checkbox"
        >
          {{ account.username }}（{{ account.nickname }}）
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="isPermissionAccountDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handlePermissionAccountSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'

import { Plus, Search } from '@element-plus/icons-vue'

import ManageCardField from '@/components/manage/ManageCardField.vue'
import ManageCardGrid from '@/components/manage/ManageCardGrid.vue'
import ManageCardItem from '@/components/manage/ManageCardItem.vue'
import ManageFixedPagination from '@/components/manage/ManageFixedPagination.vue'
import ManageItemDetailDialog from '@/components/manage/ManageItemDetailDialog.vue'
import ManageRowActions from '@/components/manage/ManageRowActions.vue'
import { usePermission } from '@/composables/usePermission'
import { EPermissionCode, EUserRole, PERMISSION_LABEL_MAP } from '@/constants/permission'
import type { DetailField } from '@/types/manage'
import { formatRecordStatus } from '@/utils/manage'

import { usePermissionManage } from './usePermissionManage'

const { hasManagePermission } = usePermission()

const accountDetailFields: DetailField[] = [
  { prop: 'username', label: '账号' },
  { prop: 'nickname', label: '昵称' },
  { prop: 'role', label: '角色', formatter: (val) => (val === EUserRole.SUPER_ADMIN ? '超级管理员' : '普通账号') },
  {
    prop: 'permissions',
    label: '已授权权限',
    formatter: (val, row) => {
      if (row.role === EUserRole.SUPER_ADMIN) return '全部权限'
      const codes = val as string[]
      return codes?.map((code) => PERMISSION_LABEL_MAP[code as keyof typeof PERMISSION_LABEL_MAP] ?? code).join('、') || '无'
    },
  },
  { prop: 'status', label: '状态', formatter: (val) => formatRecordStatus(val) },
  { prop: 'updatedAt', label: '更新时间' },
]

const {
  activeTab,
  keyword,
  isLoading,
  tableList,
  pagination,
  permissionDefList,
  isAccountDialogVisible,
  isAccountDetailVisible,
  isAccountPermDialogVisible,
  isPermissionDetailVisible,
  isPermissionAccountDialogVisible,
  isSubmitting,
  editingAccount,
  detailAccount,
  editingPermissionCode,
  detailPermissionCode,
  accountForm,
  selectedPermissions,
  selectedAccountIds,
  selectableAccounts,
  allPermissionCodes,
  permissionLabelMap,
  fetchAccountTableList,
  handleAccountSearch,
  handleAccountPageChange,
  handleAccountPageSizeChange,
  handleAccountCreateOpen,
  handleAccountEditOpen,
  handleAccountDetailOpen,
  handleAccountSubmit,
  handleAccountDelete,
  handleAccountPermOpen,
  handleAccountPermSubmit,
  handlePermissionAccountOpen,
  handlePermissionDetailOpen,
  handlePermissionAccountSubmit,
  getAccountsByPermissionCode,
  getPermissionLabels,
  getRoleLabel,
  loadSelectableAccounts,
} = usePermissionManage()

function handleTabChange() {
  if (activeTab.value === 'account') {
    fetchAccountTableList()
  } else {
    loadSelectableAccounts()
  }
}

watch(isPermissionAccountDialogVisible, (visible) => {
  if (visible) loadSelectableAccounts()
})

onMounted(() => {
  fetchAccountTableList()
  loadSelectableAccounts()
})
</script>

<style scoped lang="scss">
.detail-account-list {
  margin-top: 16px;

  &__title {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.permission-tip {
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.dialog-subtitle {
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--color-text-regular);
}

.perm-checkbox {
  display: flex;
  margin-bottom: 8px;
  width: 100%;
}
</style>
