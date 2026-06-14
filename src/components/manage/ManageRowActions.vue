<template>
  <el-button type="primary" link @click="emit('view')">查看</el-button>
  <template v-if="canManage">
    <el-button type="primary" link @click="emit('edit')">编辑</el-button>
    <el-button v-if="showDelete" type="danger" link @click="emit('delete')">删除</el-button>
  </template>
  <slot />
</template>

<script setup lang="ts">
interface ManageRowActionsProps {
  canManage?: boolean
  showDelete?: boolean
}

const { canManage = false, showDelete = true } = defineProps<ManageRowActionsProps>()

const emit = defineEmits<{
  view: []
  edit: []
  delete: []
}>()
</script>
