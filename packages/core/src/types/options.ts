import type { HandlersWithDefault } from './handler'
import type { NormalizedError } from './normalizedError'

/**
 * 驗證錯誤是否為特定類型的函式
 */
export type ValidateErrorFn = (error: unknown) => boolean

/**
 * 標準化錯誤的函式
 */
export type NormalizeErrorFn<T = unknown> = (
  error: unknown,
) => Promise<NormalizedError<T>> | NormalizedError<T>

/**
 * 錯誤處理器選項
 */
export interface ErrorHandlerOptions<T = unknown> {
  /**
   * 自訂驗證函式，用於判斷錯誤是否為特定類型（如 fetch Response）
   */
  validateError?: ValidateErrorFn
  /**
   * 自訂標準化函式，用於將錯誤轉換為標準化格式
   */
  normalizeError?: NormalizeErrorFn<T>
}

export interface ErrorHandlingDefaultOptions<TDefault> {
  handlers?: HandlersWithDefault<TDefault>
}
