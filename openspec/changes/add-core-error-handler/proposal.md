# Proposal: Add Core Error Handler

## Change ID
`add-core-error-handler`

## Summary
建立一個框架無關的 HTTP 錯誤處理核心函式庫（`@error-handling/core`），提供基於 HTTP 狀態碼的錯誤處理機制。此核心函式庫專注於原生 `fetch` API，並設計為可擴展的架構，允許其他套件（如 `axios`、`ofetch`）透過泛型和可插拔的驗證函式來重用核心邏輯。

## Why

目前專案缺乏統一的錯誤處理機制，開發者需要在每個 API 呼叫處重複編寫類似的錯誤處理邏輯。這導致：

1. **程式碼重複**：每次 fetch 請求都需要手動檢查 `response.ok`，解析錯誤資料，並根據狀態碼執行不同的處理邏輯
2. **型別安全性不足**：缺乏統一的型別定義，錯誤資料的結構在不同地方可能不一致
3. **可維護性差**：錯誤處理邏輯分散在各處，難以統一修改或擴展
4. **跨環境不一致**：Node.js 和瀏覽器環境的錯誤處理實作可能有差異

建立 `@error-handling/core` 函式庫可以：

- **標準化錯誤處理流程**：提供統一的 API 來處理 HTTP 錯誤，減少重複程式碼
- **提升型別安全**：透過 TypeScript 泛型和嚴格型別檢查，確保錯誤資料的型別正確性
- **簡化程式碼**：使用聲明式的處理器映射，讓錯誤處理邏輯更清晰易讀
- **支援多種 HTTP 客戶端**：透過可插拔的驗證和標準化函式，為 axios、ofetch 等客戶端提供統一的錯誤處理介面
- **跨環境一致性**：基於 Web 標準 API，確保在 Node.js 18+ 和現代瀏覽器中行為一致

這個核心函式庫將成為專案錯誤處理策略的基礎，為未來的適配器套件提供可重用的邏輯。

## Motivation
目前專案缺乏一個統一的錯誤處理機制來：
1. 標準化 HTTP 錯誤的處理流程
2. 提供型別安全的狀態碼處理器映射
3. 支援多種 HTTP 客戶端（fetch、axios、ofetch 等）的錯誤處理需求
4. 在 Node.js 和瀏覽器環境中提供一致的錯誤處理體驗

## Goals
1. 實作 `errorHandler` 作為主要對外 API，接受錯誤物件和狀態碼處理器（含必要的 `DEFAULT` 處理器）
2. 提供 `validateError` 函式來判斷錯誤是否為 fetch Response 錯誤
3. 提供 `normalizeError` 函式來標準化錯誤物件（提取狀態碼、訊息、資料）
4. 設計泛型架構，允許外部套件：
   - 透過泛型 `<T>` 定義錯誤資料型別
   - 傳入自訂的 `validateError` 函式來判斷特定 HTTP 客戶端的錯誤
   - 傳入自訂的 `normalizeError` 函式來轉換錯誤格式
5. 同時支援 Node.js (18+) 和現代瀏覽器環境
6. 維持完整的 TypeScript 型別安全

## Non-Goals
1. 不在此階段實作 axios、ofetch 等其他 HTTP 客戶端的適配器（將在後續套件中實作）
2. 不提供錯誤日誌記錄或監控功能
3. 不處理非 HTTP 錯誤（如業務邏輯錯誤）
4. 不提供錯誤重試機制

## Affected Components
- `packages/core/` - 新增核心錯誤處理邏輯
  - `src/errorHandler.ts` - 主要 API
  - `src/validators/fetch.ts` - fetch 錯誤驗證
  - `src/normalizers/fetch.ts` - fetch 錯誤標準化
  - `src/types/handler.ts` - 已存在，可能需要調整
  - `src/types/normalizedError.ts` - 已存在，可能需要調整
  - `src/types/statusCodes.ts` - 已存在
  - `src/types/options.ts` - 已存在，可能需要調整

## Dependencies
- 現有套件依賴：`packages/core/types/` 中的型別定義
- 新增規格依賴：error-handling-core（新規格）

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Response.json() 等非同步操作可能增加複雜度 | 中 | 提供同步和非同步兩種版本的 API，或要求呼叫者預先解析 |
| 不同環境的 fetch 實作差異 | 中 | 充分的環境測試（Node.js 18+, 主流瀏覽器） |
| 泛型設計可能過於複雜 | 低 | 提供簡單的預設使用案例，進階用法通過文件說明 |
| 狀態碼處理器的型別推導 | 低 | 使用 TypeScript mapped types 確保型別安全 |

## Success Criteria
1. 可以成功處理 fetch API 回傳的錯誤 Response
2. 根據狀態碼路由到對應的處理器
3. 當沒有匹配的狀態碼處理器時，呼叫 DEFAULT 處理器
4. 非 fetch 錯誤會被重新拋出
5. 通過 TypeScript 嚴格模式編譯
6. 在 Node.js 18+ 和主流瀏覽器中測試通過
7. 提供清晰的 API 文件和使用範例

## Timeline
- Spec delta creation: 0.5 day
- Implementation: 2-3 days
- Testing & documentation: 1 day
- Total: 3.5-4.5 days

## Open Questions
1. 是否需要提供 `Response.clone()` 來避免 body 已被讀取的問題？
2. 錯誤資料解析失敗時的降級策略？（例如 JSON 解析失敗）
3. 是否需要支援串流式 Response body 的處理？

## Related Changes
- 未來計畫：`add-axios-adapter` - 建立 axios 錯誤處理適配器
- 未來計畫：`add-ofetch-adapter` - 建立 ofetch 錯誤處理適配器
