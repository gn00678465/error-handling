/**
 * @error-handling/core
 *
 * 一個框架無關的 HTTP 錯誤處理核心函式庫。
 * 提供基於 HTTP 狀態碼的錯誤處理機制，專注於原生 fetch API，
 * 並設計為可擴展的架構，允許其他套件重用核心邏輯。
 *
 * @packageDocumentation
 */
export * from './errorHandler'
export * from './normalizers/fetch'
export * from './types/handler'
export * from './types/normalizedError'
export * from './types/options'
export * from './types/statusCodes'
export * from './validators/fetch'
