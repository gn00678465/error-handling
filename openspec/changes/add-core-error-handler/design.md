# Design Document: Core Error Handler

## Architecture Overview

本設計文件說明 `@error-handling/core` 的架構設計，建立一個可擴展的錯誤處理框架，核心專注於原生 `fetch` API，同時提供機制讓其他套件（axios、ofetch 等）可以重用核心邏輯。

## Core Concepts

### 1. 錯誤處理流程

```
Unknown Error
    ↓
[validateError] ← 可插拔的驗證函式
    ↓
Is HTTP Error?
    ├─ No  → Re-throw Error
    └─ Yes → [normalizeError] ← 可插拔的標準化函式
                ↓
           NormalizedError<T>
                ↓
        Match Status Code?
            ├─ Matched   → Call Specific Handler
            └─ Unmatched → Call DEFAULT Handler
```

### 2. 核心元件

#### 2.1 ErrorHandler (主要 API)

```typescript
function errorHandler<T = unknown>(
  error: unknown,
  handlers: HandlersWithDefault<T>,
  options?: ErrorHandlerOptions<T>
): void | never
```

**職責：**
- 接收未知錯誤和處理器映射
- 協調驗證和標準化流程
- 路由到對應的狀態碼處理器
- 處理不符合條件的錯誤（重新拋出）

**參數說明：**
- `error`: 任意錯誤物件（通常來自 catch block 或 promise rejection）
- `handlers`: 狀態碼到處理器的映射，**必須包含 DEFAULT 處理器**
- `options`: 可選配置
  - `validateError`: 自訂驗證函式（預設為 fetch 驗證）
  - `normalizeError`: 自訂標準化函式（預設為 fetch 標準化）

#### 2.2 ValidateError (驗證函式)

```typescript
type ValidateErrorFn<T = unknown> = (error: unknown) => error is HttpError<T>
```

**預設實作（fetch）：**
```typescript
function isFetchError(error: unknown): error is Response {
  return error instanceof Response && !error.ok
}
```

**擴展性：**
其他套件可以提供自己的驗證函式：
```typescript
// 在 @error-handling/axios 中
function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error)
}

// 使用時
errorHandler(error, handlers, {
  validateError: isAxiosError,
  normalizeError: normalizeAxiosError
})
```

#### 2.3 NormalizeError (標準化函式)

```typescript
type NormalizeErrorFn<T = unknown> = (
  error: unknown
) => Promise<NormalizedError<T>> | NormalizedError<T>
```

**預設實作（fetch）：**
```typescript
async function normalizeFetchError<T>(error: unknown): Promise<NormalizedError<T>> {
  if (!(error instanceof Response)) {
    throw new TypeError('Expected Response object')
  }

  const contentType = error.headers.get('content-type')
  let data: T | undefined

  try {
    if (contentType?.includes('application/json')) {
      data = await error.json()
    }
    else {
      data = (await error.text()) as unknown as T
    }
  }
  catch {
    // 解析失敗，data 保持 undefined
  }

  return {
    statusCode: error.status,
    statusMessage: error.statusText,
    message: `HTTP Error ${error.status}: ${error.statusText}`,
    name: 'FetchError',
    data,
    cause: error,
    stack: new Error().stack
  }
}
```

**同步版本（當已預先解析）：**
```typescript
function normalizeFetchErrorSync<T>(
  error: Response,
  parsedData?: T
): NormalizedError<T> {
  return {
    statusCode: error.status,
    statusMessage: error.statusText,
    message: `HTTP Error ${error.status}: ${error.statusText}`,
    name: 'FetchError',
    data: parsedData,
    cause: error,
    stack: new Error().stack
  }
}
```

#### 2.4 Handlers (處理器映射)

```typescript
type Handler<T> = (data: T | undefined, error?: unknown) => void

type HandlersWithDefault<T = unknown> = {
  DEFAULT: Handler<T>
} & Partial<Record<`${StatusCodes}`, Handler<T>>>
```

**設計決策：**
- `DEFAULT` 是必要的，確保所有錯誤都能被處理
- 其他狀態碼處理器是可選的
- 使用字串字面量型別映射到 StatusCodes enum
- 每個處理器接收標準化後的 `data` 和原始 `error`

### 3. 型別系統設計

#### 3.1 型別參數 `<T>`

泛型 `T` 代表**錯誤回應的資料型別**：
```typescript
// 範例 1: API 回傳結構化錯誤
interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

errorHandler<ApiError>(error, {
  400: (data) => {
    // data 型別為 ApiError | undefined
    console.log(data?.code, data?.details)
  },
  DEFAULT: (data) => {
    console.log('Unhandled error:', data)
  }
})

// 範例 2: 純文字錯誤
errorHandler<string>(error, {
  500: (data) => {
    // data 型別為 string | undefined
    console.log('Server error:', data)
  },
  DEFAULT: data => console.log(data)
})
```

#### 3.2 StatusCodes 型別

已存在的 `StatusCodes` enum 提供：
- 所有標準 HTTP 狀態碼
- 型別安全的處理器鍵值

```typescript
// packages/core/src/types/statusCodes.ts
export enum StatusCodes {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  // ... 更多狀態碼
}
```

### 4. API 設計

#### 4.1 基本使用（fetch）

```typescript
import { errorHandler } from '@error-handling/core'

try {
  const response = await fetch('/api/users')
  if (!response.ok) {
    errorHandler(response, {
      401: (data) => {
        // 未授權，重新導向登入
        window.location.href = '/login'
      },
      404: (data) => {
        // 資源不存在
        showNotification('User not found')
      },
      DEFAULT: (data, error) => {
        // 其他錯誤
        console.error('Unexpected error:', data)
      }
    })
  }
  // 正常處理 response
}
catch (error) {
  // 網路錯誤等會被重新拋出，在這裡處理
  console.error('Network error:', error)
}
```

#### 4.2 進階使用（自訂驗證和標準化）

```typescript
import { isAxiosError, normalizeAxiosError } from '@error-handling/axios'
import { errorHandler } from '@error-handling/core'

try {
  await axios.get('/api/users')
}
catch (error) {
  errorHandler(error, {
    401: data => redirectToLogin(),
    DEFAULT: data => showError(data)
  }, {
    validateError: isAxiosError,
    normalizeError: normalizeAxiosError
  })
}
```

#### 4.3 型別推導

```typescript
// 型別會自動推導
errorHandler<{ message: string, code: number }>(error, {
  400: (data) => {
    // ✓ data.message 和 data.code 都有完整的型別提示
    console.log(data?.message)
  },
  DEFAULT: data => console.log(data?.code)
})
```

### 5. 非同步處理策略

由於 `Response.json()` 和 `Response.text()` 是非同步的，我們有兩種策略：

#### 策略 A：ErrorHandler 為非同步函式（推薦）

```typescript
async function errorHandler<T>(
  error: unknown,
  handlers: HandlersWithDefault<T>,
  options?: ErrorHandlerOptions<T>
): Promise<void>
```

**優點：**
- API 簡單，使用者無需手動解析 Response
- 自動處理 body 讀取

**缺點：**
- 必須使用 `await errorHandler(...)`

#### 策略 B：要求呼叫者預先解析（備選）

```typescript
// 使用者負責解析
const response = await fetch('/api/users')
if (!response.ok) {
  const data = await response.json()
  errorHandler(
    { response, data },
    handlers,
    { validateError: isPreParsedFetchError }
  )
}
```

**優點：**
- 同步函式，無需 await
- 更靈活的解析控制

**缺點：**
- API 更複雜
- 使用者負擔增加

**決策：採用策略 A**，因為簡化了 API，且 async/await 在現代 JavaScript 中已是標準用法。

### 6. 錯誤處理邊界情況

#### 6.1 Response Body 已被讀取

問題：`Response` body 只能讀取一次。

解決方案：
```typescript
async function normalizeFetchError<T>(error: Response): Promise<NormalizedError<T>> {
  // 檢查 body 是否已被消費
  if (error.bodyUsed) {
    return {
      statusCode: error.status,
      statusMessage: error.statusText,
      message: `HTTP Error ${error.status}: ${error.statusText}`,
      name: 'FetchError',
      data: undefined, // 無法讀取 body
      cause: error
    }
  }

  // 正常讀取 body
  // ...
}
```

#### 6.2 Body 解析失敗

JSON 解析可能失敗（例如回傳的不是有效 JSON）：

```typescript
try {
  if (contentType?.includes('application/json')) {
    data = await error.json()
  }
  else {
    data = (await error.text()) as unknown as T
  }
}
catch (parseError) {
  // 解析失敗，data 保持 undefined
  // 可選：將解析錯誤記錄到 normalized error
}
```

#### 6.3 非 HTTP 錯誤

不符合驗證條件的錯誤會被重新拋出：

```typescript
if (!validateError(error)) {
  throw error // 保持原始錯誤不變
}
```

### 7. 擴展性考量

#### 7.1 套件結構

```
packages/
  core/                    # 核心邏輯
    src/
      errorHandler.ts      # 主要 API
      validators/
        fetch.ts           # fetch 驗證器
      normalizers/
        fetch.ts           # fetch 標準化器
      types/
        handler.ts
        normalizedError.ts
        options.ts
        statusCodes.ts

  axios/                   # Axios 適配器（未來）
    src/
      validators/
        axios.ts
      normalizers/
        axios.ts

  ofetch/                  # oFetch 適配器（未來）
    src/
      validators/
        ofetch.ts
      normalizers/
        ofetch.ts
```

#### 7.2 共享核心邏輯

其他套件可以：
1. 匯入 `errorHandler` 核心函式
2. 提供自己的 `validateError` 和 `normalizeError`
3. 可選地包裝成更簡潔的 API

```typescript
// @error-handling/axios 範例
import { errorHandler as coreErrorHandler } from '@error-handling/core'
import { isAxiosError, normalizeAxiosError } from './internal'

export function axiosErrorHandler<T>(
  error: unknown,
  handlers: HandlersWithDefault<T>
) {
  return coreErrorHandler(error, handlers, {
    validateError: isAxiosError,
    normalizeError: normalizeAxiosError
  })
}
```

### 8. 效能考量

1. **避免不必要的解析**：只在需要時讀取 Response body
2. **型別檢查效率**：`instanceof Response` 是 O(1) 操作
3. **記憶體管理**：大型 Response body 可能需要串流處理（non-goal，未來考慮）

### 9. 測試策略

#### 9.1 單元測試

- `validateError` 函式的型別保護正確性
- `normalizeError` 處理各種 Response 情況
- `errorHandler` 正確路由到處理器
- 邊界情況（body 已讀取、解析失敗等）

#### 9.2 整合測試

- 真實的 fetch 請求和錯誤處理流程
- Node.js 和瀏覽器環境測試

#### 9.3 型別測試

- 使用 `tsd` 或類似工具驗證型別推導
- 確保錯誤的使用方式會產生編譯錯誤

### 10. 文件需求

1. **API 文件**：每個匯出函式和型別的 JSDoc
2. **使用指南**：基本和進階使用範例
3. **遷移指南**：如何從其他錯誤處理方案遷移
4. **擴展指南**：如何建立新的 HTTP 客戶端適配器

## Trade-offs and Alternatives

### Alternative 1: 分離同步和非同步 API

提供 `errorHandler` (async) 和 `errorHandlerSync` (sync) 兩個版本。

**不採用理由：**
- 增加 API 複雜度
- 現代 JavaScript 中 async/await 已是標準
- 同步版本的使用場景有限

### Alternative 2: 使用 Class-based API

```typescript
const handler = new ErrorHandler({
  validators: [isFetchError],
  normalizers: [normalizeFetchError]
})

handler.handle(error, handlers)
```

**不採用理由：**
- 過度設計，當前需求不需要狀態管理
- 函式式 API 更簡潔、tree-shakable

### Alternative 3: 中介軟體模式

```typescript
errorHandler(error)
  .validate(isFetchError)
  .normalize(normalizeFetchError)
  .handle(handlers)
```

**不採用理由：**
- 過於複雜，不符合「簡單優先」原則
- 大部分使用場景不需要這種彈性

## Decision Log

| 決策 | 理由 |
|------|------|
| ErrorHandler 使用 async | 簡化 API，自動處理 Response body 解析 |
| DEFAULT 處理器必須提供 | 確保所有錯誤都能被處理，避免靜默失敗 |
| 驗證和標準化函式可插拔 | 支援多種 HTTP 客戶端，保持核心邏輯通用 |
| 非 HTTP 錯誤重新拋出 | 保持錯誤傳播鏈，不隱藏非預期錯誤 |
| 泛型 T 代表錯誤資料型別 | 提供型別安全的錯誤資料存取 |
| Body 解析失敗降級為 undefined | 避免因解析失敗導致整個錯誤處理流程崩潰 |

## Future Enhancements

1. **錯誤重試機制**：在特定狀態碼下自動重試請求
2. **錯誤日誌整合**：與 Sentry、Datadog 等監控服務整合
3. **串流 Response 支援**：處理大型 Response body
4. **錯誤快取**：避免重複處理相同錯誤
5. **更多 HTTP 客戶端適配器**：Axios, oFetch, ky, wretch 等
