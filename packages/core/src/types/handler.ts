import type { StatusCodes as SC } from './statusCodes'

/**
 * 處理錯誤資料的處理器函數。
 * @param errorData - 標準化後的類型 T 錯誤資料，或為 undefined。
 * @param error - 原始錯誤物件（可選）。
 */
export type Handler<T> = (errorData: T | undefined, error?: unknown) => void

export type Handlers<T = unknown> = Partial<Record<`${SC}`, Handler<T>>>

/**
 * 包含預設處理器的錯誤處理器映射
 */
export type HandlersWithDefault<T = unknown> = Handlers<T> & {
  /**
   * 預設錯誤處理器，當沒有匹配的狀態碼處理器時調用
   */
  DEFAULT: Handler<T>
}
