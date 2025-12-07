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
} catch (error) {
  handleError(error)
}
</script>
```
