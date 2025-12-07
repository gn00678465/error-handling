import type { NormalizedError } from '../types/normalizedError'

/**
 * 將 Fetch API 的 Response 錯誤標準化
 *
 * @param error - Fetch Response 物件
 * @returns 標準化的錯誤物件
 */
export async function normalizeFetchError<T = unknown>(
  error: unknown,
): Promise<NormalizedError<T>> {
  if (!(error instanceof Response)) {
    throw new TypeError('Expected Response object')
  }

  let data: T | undefined

  if (!error.bodyUsed) {
    try {
      const contentType = error.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        data = (await error.json()) as T
      }
      else {
        const text = await error.text()
        if (text) {
          data = text as unknown as T
        }
      }
    }
    catch {
      // 解析失敗時忽略，data 保持 undefined
    }
  }

  return {
    statusCode: error.status,
    statusMessage: error.statusText,
    message: `HTTP Error ${error.status}: ${error.statusText}`,
    name: 'FetchError',
    data,
    cause: error,
    stack: new Error('FetchError').stack,
  }
}
