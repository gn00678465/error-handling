import type { HandlersWithDefault } from './types/handler'
import type { ErrorHandlerOptions, NormalizeErrorFn } from './types/options'
import { normalizeFetchError } from './normalizers/fetch'
import { isFetchError } from './validators/fetch'

/**
 * 處理 HTTP 錯誤的核心函式
 *
 * 這個函式用來標準化與路由 HTTP 錯誤，並根據 status code 將錯誤資料傳給對應的處理器。
 * 它支援傳入自訂的 `validateError` 與 `normalizeError`，可以用於非 fetch 的 HTTP 客戶端。
 *
 * @param error - 錯誤物件（原生 `Response` 或其他由 `validateError` 判定為 HTTP 錯誤的物件）
 * @param handlers - 狀態碼處理器映射，必須包含 `DEFAULT` 處理器
 * @param options - 選項，可自訂 `validateError` 與 `normalizeError` 的實作
 *
 * @example 使用 fetch 的範例
 * ```ts
 * import { errorHandler, normalizeFetchError, isFetchError } from '@error-handling/core'
 *
 * const handlers = {
 *   404: (data) => console.log('Not found', data),
 *   DEFAULT: (data, err) => console.error('Unhandled error', err, data),
 * }
 *
 * try {
 *   // fetch 失敗時會回傳 Response (status >= 400)
 *   await errorHandler(response, handlers)
 * } catch (err) {
 *   // 非 HTTP 錯誤會被重新拋出
 *   console.error('Non-HTTP error', err)
 * }
 * ```
 *
 * @example 自訂 validator 或 normalize 的範例（例如支援其他 HTTP client）
 * ```ts
 * import { errorHandler } from '@error-handling/core'
 *
 * const customValidator = (err: unknown): boolean => {
 *   // 例如判斷 axios 的錯誤物件
 *   return Boolean(err && typeof err === 'object' && 'isAxiosError' in (err as any))
 * }
 *
 * const customNormalize = async (err: any) => {
 *   return {
 *     statusCode: err?.response?.status ?? 500,
 *     statusMessage: err?.response?.statusText ?? 'Error',
 *     message: err?.message ?? 'Unknown error',
 *     name: 'AxiosError',
 *     data: err?.response?.data,
 *     cause: err,
 *     stack: err?.stack,
 *   }
 * }
 *
 * await errorHandler(axiosError, handlers, { validateError: customValidator, normalizeError: customNormalize })
 * ```
 */
export async function errorHandler<T = unknown>(
  error: unknown,
  handlers: HandlersWithDefault<T>,
  options: ErrorHandlerOptions<T> = {},
): Promise<void> {
  const {
    validateError = isFetchError,
    normalizeError = normalizeFetchError as NormalizeErrorFn<T>,
  } = options

  if (!validateError(error)) {
    throw error
  }

  const normalized = await normalizeError(error)
  const { statusCode, data } = normalized

  if (statusCode) {
    const statusKey = `${statusCode}` as keyof typeof handlers
    const handler = handlers[statusKey]

    if (handler) {
      handler(data, error)
      return
    }
  }

  handlers.DEFAULT(data, error)
}
