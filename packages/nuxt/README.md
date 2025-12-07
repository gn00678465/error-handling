# @error-handling/nuxt

`@error-handling/core` 的 Nuxt 模組。

## 安裝

```bash
pnpm add @error-handling/nuxt @error-handling/core
```

## 使用方法

將 `@error-handling/nuxt` 加入您的 `nuxt.config.ts`：

```typescript
export default defineNuxtConfig({
  modules: [
    '@error-handling/nuxt'
  ]
})
```

在您的組件或頁面中使用 `useErrorHandling`：

```vue
<script setup lang="ts">
const { handleError } = useErrorHandling({
  DEFAULT: (error) => {
    console.error('發生錯誤：', error)
  },
  404: () => {
    console.log('找不到頁面')
  }
})

try {
  await $fetch('/api/something')
}
catch (error) {
  handleError(error)
}
</script>
```

## 功能

### 自動 FetchError 處理

此模組為 Nuxt 的 `$fetch` (ofetch) 提供了專門的錯誤處理。當發生 fetch 錯誤時,會自動:

- 標準化錯誤格式
- 提取 HTTP 狀態碼和訊息
- 解析錯誤回應資料

```vue
<script setup lang="ts">
const { handleError } = useErrorHandling({
  404: (error) => {
    // error.data 包含伺服器回應的資料
    console.log('找不到資源:', error.data)
  },
  500: (error) => {
    console.error('伺服器錯誤:', error.message)
  },
  DEFAULT: (error) => {
    console.error('未預期的錯誤:', error)
  }
})

try {
  const data = await $fetch('/api/users/123')
}
catch (error) {
  handleError(error)
}
</script>
```

### 自訂 Normalizer

如果需要自訂錯誤標準化邏輯,可以提供自己的 `normalizeError` 函式:

```vue
<script setup lang="ts">
const { handleError } = useErrorHandling(
  {
    DEFAULT: error => console.error(error),
  },
  {
    normalizeError: async (err) => {
      // 自訂錯誤標準化邏輯
      return {
        statusCode: 500,
        message: '自訂錯誤訊息',
        // ...
      }
    },
  },
)
</script>
```
