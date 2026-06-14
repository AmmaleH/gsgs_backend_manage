# GS 智能管理系统

PC 端后台管理系统，集成 Agent 管理、知识库管理、基础数据管理与智能对话交互功能。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 运行时 | Node.js | >= 22.0.0 |
| 框架 | Vue 3 (Composition API) | ^3.5 |
| 语言 | TypeScript | ~5.7 |
| UI 组件库 | Element Plus | ^2.9 |
| 状态管理 | Pinia | ^2.3 |
| 路由 | Vue Router | ^4.5 |
| HTTP | Axios | ^1.7 |
| 构建工具 | Vite | ^6.0 |
| 包管理 | Yarn | 1.x / 4.x |

## 环境要求

- **Node.js >= 22**（项目根目录已配置 `.nvmrc`）
- **Yarn** 包管理器

```bash
# 使用 nvm 切换 Node 版本
nvm install 22
nvm use 22

# 验证版本
node -v   # 应 >= v22.0.0
yarn -v
```

## 快速开始

```bash
# 1. 安装依赖
yarn install

# 2. 启动开发服务器（默认 http://localhost:5173）
yarn dev

# 3. 类型检查
yarn type-check

# 4. 生产构建
yarn build

# 5. 预览构建产物
yarn preview
```

## 环境变量

| 变量名 | 说明 | 开发默认值 |
|--------|------|-----------|
| `VITE_APP_TITLE` | 应用标题 | GS智能管理系统 |
| `VITE_API_BASE_URL` | 后端 API 地址 | http://localhost:8080 |
| `VITE_USE_MOCK` | 是否启用 Mock 数据 | true |

- 开发环境配置：`.env.development`
- 生产环境配置：`.env.production`

> 开发模式下 `VITE_USE_MOCK=true`，登录、对话、管理页面均使用本地 Mock 数据，无需后端即可体验完整功能。
> **调试阶段**：任意非空账号密码均可登录，且统一按超级管理员权限处理。

## 项目结构

```
src/
├── api/                  # 接口请求模块（按业务拆分）
├── assets/styles/        # 全局样式与 SCSS 变量
├── components/           # 公共组件
│   └── chat/             # 聊天相关组件
├── composables/          # 可复用组合式函数
├── constants/            # 枚举与常量
├── layouts/              # 布局组件
├── router/               # 路由配置与守卫
├── stores/               # Pinia 状态管理
├── types/                # TypeScript 类型定义
├── utils/                # 工具函数（请求、消息、聊天流等）
└── views/                # 页面视图
    ├── login/            # 登录页
    ├── chat/             # 智能对话页（默认首页）
    ├── agent/            # Agent 管理
    ├── knowledge/        # 知识库管理
    └── basic-data/       # 基础数据管理
    └── permission/       # 权限管理
```

## 功能模块

### 1. 登录

- 路由：`/login`
- 登录成功后 Token 与用户信息（含角色、权限码）持久化至 `localStorage`
- 未登录访问受保护路由自动跳转登录页

**调试阶段登录（`VITE_USE_MOCK=true` 时）：**

- 任意非空账号 + 密码均可登录
- 登录后统一按**超级管理员**处理，可见全部页面并拥有全部操作权限

### 2. 智能对话（默认首页）

- 路由：`/` → 已登录跳转 `/chat`，未登录跳转 `/login`
- 首次进入展示数字人欢迎动画（仅首次，记录于 localStorage）
- 左侧气泡为机器人回复，右侧气泡为用户输入
- 向上滑动加载历史对话记录
- 底栏上方快捷标签，支持增删改（右键编辑）
- 流式对话显示，接口不支持时自动降级为同步模式
- 可通过开关手动切换流式/同步模式

### 3. Agent 管理

- 路由：`/agent`
- Tab 分类：问答 Agent / 数字人 Agent / 问数 Agent
- 支持列表查询、新建、编辑、删除（需对应 `:manage` 操作权限）
- 每条记录支持**查看详情**

### 4. 知识库管理

- 路由：`/knowledge`
- Tab 分类：数字人知识库 / 问答知识库
- 支持列表查询、新建、编辑、删除（需对应 `:manage` 操作权限）
- 每条记录支持**查看详情**

### 5. 基础数据管理

- 路由：`/basic-data`
- Tab 分类：数字人 / 问数 / 问答
- 支持列表查询、新建、编辑、删除（需对应 `:manage` 操作权限）
- 每条记录支持**查看详情**

### 6. 权限管理

- 路由：`/permission`（需 `permission:manage` 权限，超级管理员默认可见）
- **按账号管理权限**：账号增删改查，为每个账号配置权限列表
- **按权限管理账号**：查看各权限授权账号数，批量配置拥有某权限的账号
- 超级管理员拥有全部页面访问权与全部操作权，且不可删除

## 权限说明

- 权限分为**页面访问**（如 `agent:view`）与**操作**（如 `agent:manage`）两类
- 侧边栏菜单与路由守卫按权限码过滤，无权限的页面不可见且不可直接访问
- 管理页的新建/编辑/删除按钮按操作权限控制显示
- 权限码定义见 `src/constants/permission.ts`

## 接口文档

> 对接时将 `.env.development` 中 `VITE_USE_MOCK` 设为 `false`，并配置 `VITE_API_BASE_URL`。

| 模块 | 文档链接 |
|------|----------|
| 认证模块 | xxx |
| 对话模块 | xxx |
| Agent 管理 | xxx |
| 知识库管理 | xxx |
| 基础数据管理 | xxx |
| 权限管理 | xxx |

## 开发代理

开发环境下 Vite 将 `/api` 代理至 `VITE_API_BASE_URL`，可在 `vite.config.ts` 中调整：

```ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

## 协作规范

### Git 分支

- `main` / `master`：生产分支
- `develop`：开发集成分支
- `feature/xxx`：功能分支
- `fix/xxx`：修复分支

### 代码规范

- 新页面使用 `<script setup lang="ts">` + Composition API
- 页面专属 composable 与页面 `index.vue` 同级放置
- 业务常量使用 `enum` 定义在 `src/constants/`
- 接口请求统一通过 `src/api/` 模块，不直接在页面中裸写 URL
- 消息提示统一使用 `@/utils/message` 封装

### 新增接口流程

1. 在 `src/types/` 补充类型定义
2. 在 `src/api/` 对应模块添加请求方法
3. 在页面 composable 或 store 中调用
4. 更新本文档「接口文档」模块链接

## 常见问题

**Q: 登录后页面空白？**
检查浏览器控制台是否有路由或组件加载错误，确认 Node 版本 >= 22。

**Q: 如何重置欢迎动画？**
清除 localStorage 中 `gs_welcome_shown` 键值。

**Q: 如何对接真实后端？**
将 `.env.development` 中 `VITE_USE_MOCK` 改为 `false`，并配置正确的 `VITE_API_BASE_URL`。

**Q: 流式对话不生效？**
确认后端 `/chat/stream` 返回 `text/event-stream` 格式；若不支持，系统会自动 fallback 至 `/chat/send` 同步接口。

## License

Private - Internal Use Only
