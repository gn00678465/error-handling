# Error Handling

完整的錯誤處理解決方案，專為現代 Web 開發設計。提供框架無關的核心函式庫和 Nuxt 整合模組。

## 📦 專案概述

`error-handling` 是一個 monorepo 專案，包含以下主要套件：

- **[@gn00678465/error-handling-core](./packages/core)** - 框架無關的 HTTP 錯誤處理核心函式庫
- **[@gn00678465/error-handling-nuxt](./packages/nuxt)** - Nuxt 3/4 模組，整合核心錯誤處理功能

## 🌟 核心特性

### 統一的錯誤處理
- 基於 HTTP 狀態碼的錯誤處理機制
- 自動錯誤驗證和標準化
- 專注於 Fetch API，並支援其他 HTTP 客戶端

### 完全可擴展
- 自訂驗證函式支援 (Axios、ofetch 等)
- 自訂標準化邏輯
- 型別安全的錯誤資料泛型支援

### 框架整合
- 原生 JavaScript/TypeScript 支援
- Nuxt 3/4 composable 整合
- 設計為易於擴展至其他框架

## 🚀 快速開始

### 安裝核心套件

```bash
pnpm add @gn00678465/error-handling-core
```

### 基本使用

```typescript
import { errorHandler } from '@gn00678465/error-handling-core'

try {
  const response = await fetch('/api/data')
  if (!response.ok) throw response
  
  const data = await response.json()
}
catch (error) {
  await errorHandler(error, {
    404: (data) => console.log('未找到資源'),
    500: (data) => console.error('伺服器錯誤'),
    DEFAULT: (data) => console.error('發生錯誤')
  })
}
```

### Nuxt 整合

```bash
pnpm add @gn00678465/error-handling-nuxt @gn00678465/error-handling-core
```

在 `nuxt.config.ts` 中設定：

```typescript
export default defineNuxtConfig({
  modules: ['@gn00678465/error-handling-nuxt']
})
```

在元件中使用：

```vue
<script setup lang="ts">
const { handleError } = useErrorHandling({
  404: () => navigateTo('/404'),
  500: (error) => console.error(error),
  DEFAULT: (error) => console.error(error)
})

try {
  await $fetch('/api/data')
}
catch (error) {
  handleError(error)
}
</script>
```

## 📚 文件

- [Core 文件](./packages/core/README.md) - 詳細的 API 參考和進階用法
- [Nuxt 文件](./packages/nuxt/README.md) - Nuxt 模組文件和範例

## 🏗️ 專案結構

```
error-handling/
├── packages/
│   ├── core/              # 核心錯誤處理函式庫
│   │   ├── src/
│   │   │   ├── errorHandler.ts    # 主要函式
│   │   │   ├── normalizers/       # 錯誤標準化
│   │   │   ├── validators/        # 錯誤驗證
│   │   │   └── types/             # 型別定義
│   │   └── README.md
│   │
│   └── nuxt/              # Nuxt 模組
│       ├── src/
│       │   ├── module.ts          # 模組入口
│       │   ├── runtime/
│       │   │   ├── composables/   # useErrorHandling composable
│       │   │   └── utils/         # 工具函式
│       │   └── __tests__/
│       └── README.md
│
├── package.json           # Workspace 根設定
├── pnpm-workspace.yaml    # pnpm workspace 配置
└── tsconfig.json          # TypeScript 配置
```

## 🛠️ 開發

### 安裝依賴

```bash
pnpm install
```

### 執行測試

```bash
pnpm test
```

### 執行 Linter

```bash
pnpm lint
pnpm lint:fix
```

### 型別檢查

```bash
pnpm typecheck
```

### 建置

```bash
pnpm build
```

## 📦 發佈

該專案使用 `bumpp` 進行版本管理和發佈：

```bash
# 發佈補丁版本
pnpm release:patch

# 發佈次要版本
pnpm release:minor

# 發佈主要版本
pnpm release:major
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request。

## 📄 授權

ISC
