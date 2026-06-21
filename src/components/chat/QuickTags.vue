<template>
  <div class="quick-tags">
    <div class="quick-tags__list">
      <el-tag
        v-for="tag in tagsStore.tags"
        :key="tag.id"
        class="quick-tags__item"
        effect="plain"
        round
        closable
        @click="handleTagClick(tag.content)"
        @close="handleTagRemove(tag.id)"
        @contextmenu.prevent="handleTagEdit(tag)"
      >
        {{ tag.label }}
      </el-tag>

      <el-button
        v-if="!isAdding"
        class="quick-tags__add"
        size="small"
        round
        :icon="Plus"
        @click="isAdding = true"
      >
        添加标签
      </el-button>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="isDialogVisible"
      :title="editingTag ? '编辑快捷标签' : '添加快捷标签'"
      width="420px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="80px">
        <el-form-item label="标签名" prop="label">
          <el-input v-model="formModel.label" placeholder="如：产品介绍" maxlength="20" />
        </el-form-item>
        <el-form-item label="发送内容" prop="content">
          <el-input
            v-model="formModel.content"
            type="textarea"
            :rows="3"
            placeholder="点击标签后将发送的内容"
            maxlength="200"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTagSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

import { useQuickTagsStore } from '@/stores/quickTags'
import type { QuickTag } from '@/types'
import { showConfirm, showToast } from '@/utils/message'

const emit = defineEmits<{
  select: [content: string]
}>()

const tagsStore = useQuickTagsStore()

const isAdding = ref(false)
const isDialogVisible = ref(false)
const editingTag = ref<QuickTag | null>(null)
const formRef = ref<FormInstance>()

const formModel = reactive({
  label: '',
  content: '',
})

const formRules: FormRules = {
  label: [{ required: true, message: '请输入标签名', trigger: 'blur' }],
  content: [{ required: true, message: '请输入发送内容', trigger: 'blur' }],
}

watch(isAdding, (val) => {
  if (val) {
    editingTag.value = null
    formModel.label = ''
    formModel.content = ''
    isDialogVisible.value = true
    isAdding.value = false
  }
})

function handleTagClick(content: string) {
  emit('select', content)
}

async function handleTagRemove(id: string) {
  const confirmed = await showConfirm('确定删除该快捷标签吗？')
  if (confirmed) {
    tagsStore.removeTag(id)
    showToast('已删除', 'success')
  }
}

function handleTagEdit(tag: QuickTag) {
  editingTag.value = tag
  formModel.label = tag.label
  formModel.content = tag.content
  isDialogVisible.value = true
}

async function handleTagSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (editingTag.value) {
    tagsStore.updateTag(editingTag.value.id, formModel.label, formModel.content)
    showToast('标签已更新', 'success')
  } else {
    tagsStore.addTag(formModel.label, formModel.content)
    showToast('标签已添加', 'success')
  }

  isDialogVisible.value = false
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/chat-theme.scss' as chat;

.quick-tags {
  width: 75%;
  max-width: 820px;
  padding: 0 0 10px;

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  &__item {
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(255, 255, 255, 0.5);
    border-color: rgba(255, 255, 255, 0.7);
    color: chat.$chat-text-secondary;
    box-shadow: chat.$chat-shadow-soft;

    &:hover {
      background: rgba(250, 245, 255, 0.9);
      border-color: rgba(196, 181, 253, 0.8);
      color: chat.$chat-accent-purple;
    }
  }

  &__add {
    border-style: dashed;
    background: rgba(255, 255, 255, 0.3);
    color: chat.$chat-text-muted;
    border-color: rgba(148, 163, 184, 0.3);
  }
}
</style>
