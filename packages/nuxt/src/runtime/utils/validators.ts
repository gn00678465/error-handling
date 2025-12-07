import { isNuxtError } from 'nuxt/app'

/**
 * 驗證錯誤類型並返回是否為有效錯誤
 * 如果不是任何已知錯誤類型，則拋出錯誤
 */
export function validateError<T = unknown>(error: unknown): boolean {
  if (isFetchError<T>(error))
    return true
  if (isNuxtError<T>(error))
    return true
  if (error instanceof Error)
    return true

  throw error
}

/**
 * 驗證是否為 FetchError 實例
 */
export function isFetchError<T = unknown>(error: unknown): error is FetchError<T> {
  return (
    error instanceof Error
    && 'request' in error
    && 'options' in error
    && ('response' in error || 'status' in error)
  )
}

/**
 * 驗證是否為 FetchContext 物件
 */
export function isFetchContext<T = unknown>(
  context: unknown,
): context is FetchContext<T> {
  if (!context || typeof context !== 'object')
    return false

  const ctx = context as Record<string, unknown>
  return (
    'request' in ctx
    && 'options' in ctx
    && ctx.request !== undefined
    && ctx.options !== undefined
  )
}

/**
 * 驗證是否為 FetchResponse 物件
 */
export function isFetchResponse<T = unknown>(response: unknown): response is FetchResponse<T> {
  if (!response || typeof response !== 'object')
    return false

  const res = response as Record<string, unknown>
  return (
    'status' in res
    && 'statusText' in res
    && 'headers' in res
    && 'ok' in res
    && typeof res.status === 'number'
  )
}

// Define types locally if not available from #app or ofetch during build time for the library
// Ideally these should come from dependencies, but for the purpose of this file:
interface FetchError<T = any> extends Error {
  request?: unknown
  options?: unknown
  response?: FetchResponse<T>
  data?: T
  status?: number
  statusCode?: number
  statusText?: string
  statusMessage?: string
  cause?: unknown
}

interface FetchContext<T = any> {
  request: unknown
  options: unknown
  response?: FetchResponse<T>
  error?: Error
}

interface FetchResponse<T> {
  status: number
  statusText: string
  headers: Headers
  ok: boolean
  _data?: T
}
