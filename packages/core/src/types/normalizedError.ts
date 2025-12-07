/**
 * 標準化錯誤對象的介面
 */
export interface NormalizedError<T = unknown> {
  /**
   * 原始錯誤原因
   */
  cause?: unknown
  /**
   * 錯誤資料
   */
  data?: T
  /**
   * 錯誤訊息
   */
  message: string
  /**
   * 錯誤名稱
   */
  name: string
  /**
   * 錯誤堆疊
   */
  stack?: string
  /**
   * HTTP 狀態碼
   */
  statusCode?: number
  /**
   * HTTP 狀態訊息
   */
  statusMessage?: string
}

/**
 * 錯誤轉換回調函式類型
 */
export type ErrorTransformCallback<T = unknown, R = NormalizedError<T>> = (
  normalized: NormalizedError<T>,
) => R
