import type { NormalizedError } from '@error-handling/core'
import { isFetchError } from './validators'

/**
 * 標準化 ofetch 的 FetchError 為統一格式
 * @param error - 待標準化的錯誤物件
 * @returns 標準化後的錯誤物件
 * @throws {TypeError} 如果傳入的不是 FetchError 物件
 */
export async function normalizeFetchError<T = unknown>(
  error: unknown,
): Promise<NormalizedError<T>> {
  if (!isFetchError<T>(error)) {
    throw new TypeError('Expected FetchError object')
  }

  // ofetch 的 FetchError 可能有 statusCode 或 status
  const statusCode = error.statusCode ?? error.status

  // 優先使用 statusMessage,否則使用 statusText,最後使用預設訊息
  const statusMessage = error.statusMessage ?? error.statusText

  // 優先使用 error.data,否則嘗試從 response._data 取得
  const data = error.data ?? (error.response as any)?._data

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
