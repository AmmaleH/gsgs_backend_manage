<template>
  <div class="app-layout">
    <aside class="app-layout__sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="sidebar-logo">
        <div class="sidebar-logo__icon">
          <el-icon :size="24"><Monitor /></el-icon>
        </div>
        <span v-show="!isCollapsed" class="sidebar-logo__text">GS 智能管理</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        background-color="transparent"
        text-color="#a3a6b4"
        active-text-color="#ffffff"
        router
        class="sidebar-menu"
      >
        <template v-for="item in visibleMenus" :key="item.path">
          <el-menu-item v-if="!item.children?.length" :index="item.path">
            <el-icon><component :is="iconMap[item.icon]" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>

          <el-sub-menu v-else :index="item.path">
            <template #title>
              <el-icon><component :is="iconMap[item.icon]" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
              <el-icon><component :is="iconMap[child.icon]" /></el-icon>
              <template #title>{{ child.title }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </aside>

    <div class="app-layout__main">
      <header class="app-layout__header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapsed = !isCollapsed">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-tag v-if="isSuperAdminUser" type="danger" size="small" class="role-tag">超级管理员</el-tag>
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">
                {{ userInitial }}
              </el-avatar>
              <span class="user-name">{{ userStore.userInfo?.nickname || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="chat">智能对话</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="app-layout__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  ArrowDown,
  ChatDotRound,
  Collection,
  Cpu,
  DataLine,
  Expand,
  Fold,
  Monitor,
  Setting,
  UserFilled,
} from '@element-plus/icons-vue'
import type { Component } from 'vue'

import { usePermission } from '@/composables/usePermission'
import { useUserStore } from '@/stores/user'
import { getVisibleMenus } from '@/utils/menu'
import { showConfirm } from '@/utils/message'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { isSuperAdminUser } = usePermission()

const isCollapsed = ref(false)

const iconMap: Record<string, Component> = {
  ChatDotRound,
  Setting,
  Cpu,
  Collection,
  DataLine,
  UserFilled,
}

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta.title as string)
const visibleMenus = computed(() => getVisibleMenus(userStore.userInfo))
const userInitial = computed(() => {
  const name = userStore.userInfo?.nickname || 'U'
  return name.charAt(0).toUpperCase()
})

async function handleCommand(command: string) {
  if (command === 'logout') {
    const confirmed = await showConfirm('确定要退出登录吗？')
    if (confirmed) {
      userStore.logout()
      router.push('/login')
    }
  } else if (command === 'chat') {
    router.push('/chat')
  }
}
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  width: 100%;
  height: 100%;

  &__sidebar {
    width: var(--sidebar-width);
    background: var(--color-bg-sidebar);
    transition: width 0.3s;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    &.is-collapsed {
      width: 64px;
    }
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__header {
    height: var(--header-height);
    background: #fff;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    overflow: auto;
    padding: 16px;
  }
}

.sidebar-logo {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }

  &__text {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
  }
}

.sidebar-menu {
  border-right: none;
  flex: 1;
  padding-top: 8px;

  :deep(.el-menu-item.is-active) {
    background: rgba(64, 158, 255, 0.2) !important;
    border-radius: 6px;
    margin: 2px 8px;
    width: calc(100% - 16px);
  }

  :deep(.el-sub-menu .el-menu-item.is-active) {
    background: rgba(64, 158, 255, 0.15) !important;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    border-radius: 6px;
    margin: 2px 8px;
    width: calc(100% - 16px);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: var(--color-text-regular);

  &:hover {
    color: var(--color-primary);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-tag {
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    background: var(--color-bg-page);
  }
}

.user-avatar {
  background: var(--color-primary);
  color: #fff;
  font-size: 14px;
}

.user-name {
  font-size: 14px;
  color: var(--color-text-primary);
}
</style>
