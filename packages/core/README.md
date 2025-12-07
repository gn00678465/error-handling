# @error-handling/core

一個框架無關的 HTTP 錯誤處理核心函式庫。提供基於 HTTP 狀態碼的錯誤處理機制，專注於原生 fetch API，並設計為可擴展的架構，允許其他套件重用核心邏輯。

## 安裝

```bash
pnpm add @error-handling/core
```

## 基本用法

```typescript
import { errorHandler } from '@error-handling/core'

try {
  const response = await fetch('https://dummyjson.com/http/403/403_error')
  if (!response.ok)
    throw response
  const data = await response.json()
}
catch (error) {
  await errorHandler(error, {
    400: (data, err) => {
      console.error('Bad Request:', data)
    },
    401: (data, err) => {
      console.error('Unauthorized, redirecting to login...')
      // redirect logic
    },
    404: (data, err) => {
      console.error('Not Found:', data)
    },
    DEFAULT: (data, err) => {
      console.error('An unexpected error occurred:', err)
    }
  })
}
```

## 進階用法

### 自訂錯誤資料型別

```typescript
interface ApiError {
  code: string
  message: string
}

await errorHandler<ApiError>(error, {
  400: (data) => {
    // data is typed as ApiError | undefined
    console.log(data?.code)
  },
  DEFAULT: (data) => {
    console.log(data)
  }
})
```

### 自訂驗證與標準化

你可以傳入自訂的 `validateError` 和 `normalizeError` 函式來支援其他 HTTP 客戶端（如 axios）。

```typescript
import { errorHandler } from '@error-handling/core'
import { isAxiosError } from 'axios'

await errorHandler(error, handlers, {
  validateError: isAxiosError,
  normalizeError: async (error) => {
    // 自訂標準化邏輯
    return {
      statusCode: error.response?.status,
      message: error.message,
      name: 'AxiosError',
      data: error.response?.data,
      // ...
    }
  }
})
```

## API 參考

### `errorHandler(error, handlers, options?)`

核心錯誤處理函式。

- `error`: 未知錯誤物件
- `handlers`: 狀態碼處理器映射，必須包含 `DEFAULT`
- `options`: 可選配置
  - `validateError`: 自訂驗證函式
  - `normalizeError`: 自訂標準化函式

### `isFetchError(error)`

檢查錯誤是否為 Fetch API 的 Response 物件且狀態碼 >= 400。

### `normalizeFetchError(error)`

將 Fetch Response 錯誤標準化為 `NormalizedError` 物件。

## License

ISC
