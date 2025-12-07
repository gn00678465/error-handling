/**
 * 檢查錯誤是否為 Fetch API 的 Response 物件，且狀態碼表示錯誤（>= 400）
 *
 * @param error - 要檢查的錯誤物件
 * @returns 如果是錯誤的 Response 物件則返回 true
 *
 * @example
 * ```ts
 * try {
 *   const response = await fetch('/api')
 *   if (!response.ok) throw response
 * } catch (error) {
 *   if (isFetchError(error)) {
 *     // 處理 fetch 錯誤
 *   }
 * }
 * ```
 */
export function isFetchError(error: unknown): error is Response {
  return error instanceof Response && !error.ok
}
