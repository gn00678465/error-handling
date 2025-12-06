# Project Context

## Purpose
本專案為一個以 TypeScript 為主的 monorepo 骨架，主要目標是提供可重複使用的「錯誤處理（error-handling）」函式庫與型別（Type Definitions），並以多套小型套件（monorepo packages）形式維護與發行。預期產出包括
- 可在瀏覽器與 Node.js 環境下使用的錯誤處理工具與輔助函式
- 為消費方（應用程式、其他套件）提供一致且型別安全的錯誤處理 API
- 生成與發佈型別檔案（.d.ts）與文件（以 `tsdown` 或相容工具）

## Tech Stack
- TypeScript（本專案使用 TypeScript 5.x，啟用嚴格檢查）
- pnpm（工作區管理，monorepo）
- ESLint（使用 `@antfu/eslint-config` 作為基礎）
- tsdown（用於生成 TypeScript 導出與文件）
- Vitest（測試框架；在 devDependencies 中宣告）
- 開發工具：`bumpp`（版本管理）、`@types/node`（Node 型別）
- 打包格式：ESM / `esnext` 模組配置（TypeScript 編譯輸出為 ESM 與型別檔案）

## Project Conventions

### Code Style
- 使用 `@antfu/eslint-config`（已在 `eslint.config.mjs` 中套用，開啟 typescript、pnpm 與 stylistics 的設定）。
- 程式碼風格遵循 ESLint 與 Antfu 提供的推薦規則：含命名慣例、空白、換行與型別相關建議。
- TypeScript 編譯器 (`tsconfig.json`) 已啟用 `strict`, `noUnusedLocals` 與 `strictFunctionTypes` 等，強制型別安全。
- 專案秉持小模組（packages/*）之原則，各子套件應使用 `src/index.ts`（或明確入口）並以 ESM 輸出為主。
- `package.json` scripts 目前最小化（只含 `lint` 與 `lint:fix`），建議在子套件內新增 `build`、`test` 等腳本以支援本地開發與 CI。

### Architecture Patterns
- 採用 monorepo 組織（`packages/*`）；每個 package 為單一功能套件（例如錯誤型別、封裝工具、轉譯/格式化錯誤消息等）。
- TypeScript 的 `emitDeclarationOnly: true` 與 `declarationDir: ./types` 顯示此專案會優先發佈型別聲明，供其他 TypeScript 專案引用。
- `tsdown` 用來產生文件輸出（exports、.d.ts 等），配置為生成 ESM export 並跳過 node_modules bundle（`unbundle`, `skipNodeModulesBundle`）。
- 採用 ESM 與 `moduleResolution: Bundler`，意味著套件設計上會更友善於現代 bundlers（Rollup/ESBuild/Vite 等）。

### Testing Strategy
- 本倉儲將 `vitest` 列為 devDependency，建議採單一根目錄下（workspace root）以 `pnpm -w` 或各子套件獨立方式運行測試。
- 建議測試范式：Unit Tests（以小型功能函式為單位）、Integration Tests（必要時，測試不同模組的互動）、以及型別測試（利用 `tsd` 或相同機制驗證導出的型別）。
- 在 CI 中加入 `pnpm -w lint`, `pnpm -w test`, `pnpm -w build`（視套件建立）等檢查流程。

### Git Workflow
- 推薦使用 Pull Request（PR）為主要合併流程，對每個 PR 開啟 CI（lint/test/build）。
- 分支規則（建議）：`main`（或 `master`）為穩定分支；開發分支採 `feature/*`, `fix/*`, `chore/*` 等命名慣例。
- Commit message 採用語意化或 Conventional Commits（例如 `feat:`, `fix:`, `chore:`, `refactor:`），`bumpp` 已做為版本更新工具的 devDependency。

## Domain Context
- 名稱顯示專案專注於「錯誤處理（error-handling）」，目標通常包含下面幾項：
  - 定義與標準化錯誤型別（例如自訂 Error classes / discriminated unions），
  - 提供函式庫級別的錯誤轉換、格式化與上報工具，
  - 支援在不同執行環境（Node / 瀏覽器 / WebWorker）中可移植且型別安全的錯誤處理邏輯。
- AI 助手應了解此類函式庫的核心目標為「保持錯誤處理簡潔、可組合，並以型別來降低工程上的錯誤率」。

## Important Constraints
- TypeScript 設定為 `strict` 與 `emitDeclarationOnly`，代表對型別兼容性、API 設計、以及對外發佈的 .d.ts 文件有較高要求。
- 專案以 ESM 為目標（module: `esnext`），可能不支援老舊的 CommonJS-only 設定；在使用者端需注意 bundler 與 target 環境（Node 版本或瀏覽器）相容性。
- 目前 `packages/*` 未含實際程式碼，開發者在新增套件時需遵循 monorepo 的工作區慣例（`packages/<name>/` 目錄、`src` 檔案、package.json 與對應 build/test/lint 腳本）。
- 專案 licence 為 `ISC`（可於 `package.json` 中看到），若計畫引入第三方授權或外部服務請同步審核授權條款。

## External Dependencies
- 目前的主要外部工具與套件（devDependencies）：
  - `@antfu/eslint-config`：ESLint 規則組合
  - `eslint`：靜態程式碼檢查
  - `typescript`：TS 編譯器
  - `tsdown`：產生 ESM 輸出與型別聲明
  - `vitest`：測試框架（dev）
  - `bumpp`：版本管理工具（dev）
  - `@types/node`：Node 型別定義（dev）
