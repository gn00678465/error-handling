import type { NormalizedError } from '@gn00678465/error-handling-core'
import { isNuxtError } from 'nuxt/app'
import { isFetchError } from './validators'

/**
 * 統一標準化 Nuxt 與 Fetch 錯誤為統一格式
 * @param error - 待標準化的錯誤物件
 * @returns 標準化後的錯誤物件
 * @throws {TypeError} 如果傳入的不是 NuxtError 或 FetchError 物件
 */
export function normalizeError<T = unknown>(
  error: unknown,
): NormalizedError<T> {
  // 優先處理 NuxtError
  if (isNuxtError<T>(error)) {
    return normalizeNuxtError<T>(error)
  }

  // 其次處理 FetchError
  if (isFetchError<T>(error)) {
    return normalizeFetchError<T>(error)
  }

  throw new TypeError('Expected NuxtError or FetchError object')
}

/**
 * 標準化 Nuxt 的 NuxtError 為統一格式
 * @param error - 待標準化的錯誤物件
 * @returns 標準化後的錯誤物件
 * @throws {TypeError} 如果傳入的不是 NuxtError 物件
 */
export function normalizeNuxtError<T = unknown>(
  error: unknown,
): NormalizedError<T> {
  if (!isNuxtError<T>(error)) {
    throw new TypeError('Expected NuxtError object')
  }

  return {
    statusCode: error.statusCode,
    statusMessage: error.statusMessage,
    message: error.message,
    name: error.name || 'NuxtError',
    data: error.data as T,
    cause: error.cause ?? error,
    stack: error.stack,
  }
}

/**
 * 標準化 ofetch 的 FetchError 為統一格式
 * @param error - 待標準化的錯誤物件
 * @returns 標準化後的錯誤物件
 * @throws {TypeError} 如果傳入的不是 FetchError 物件
 */
export function normalizeFetchError<T = unknown>(
  error: unknown,
): NormalizedError<T> {
  if (!isFetchError<T>(error)) {
    throw new TypeError('Expected FetchError object')
  }

  // ofetch 的 FetchError 可能有 statusCode 或 status
  const statusCode = error.statusCode ?? error.status

  // 優先使用 statusMessage,否則使用 statusText,最後使用預設訊息
  const statusMessage = error.statusMessage ?? error.statusText

  // 優先使用 error.data,否則嘗試從 response._data 取得
  const data = error.data ?? (error.response as unknown & { _data?: T })?._data

  // 建立錯誤訊息
  const message = error.message || (statusCode ? `HTTP Error ${statusCode}` : 'Fetch Error')

  return {
    statusCode,
    statusMessage,
    message,
    name: error.name || 'FetchError',
    data,
    cause: error,
    stack: error.stack,
  }
}
