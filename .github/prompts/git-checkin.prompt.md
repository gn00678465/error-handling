---
agent: 'agent'
description: 'Git Commit Message Generator - Conventional Commits (繁體中文)'
---
## [GOAL_OF_THE_PROMPT]
分析當前 git repository 的 staged changes，根據 Conventional Commits 規範自動生成符合規範的 commit message，並輸出用於提交的完整 git commit 指令。Commit message 的描述部分必須使用繁體中文撰寫。

## [TONE_AND_AUDIENCE]
- 目標受眾：繁體中文使用者的開發團隊
- 語氣：專業、簡潔、技術性
- 文化考量：使用台灣慣用的技術用語和表達方式

## [CONTENT_CONSTRAINTS]
**Commit Message 的組成順序為：Type(Scope): Subject**
1. **Commit Type（必須為英文）**：
   - `feat`: 新增功能
   - `fix`: 修復錯誤
   - `docs`: 文件更新
   - `style`: 程式碼格式調整（不影響功能）
   - `refactor`: 重構程式碼
   - `perf`: 效能優化
   - `test`: 測試相關
   - `build`: 建置系統或外部相依性
   - `ci`: CI 設定檔案
   - `chore`: 其他雜項（工具、配置等）
   - `revert`: 撤銷先前的 commit

2. **Scope（選用，英文或中文皆可）**：
   - 標註影響範圍，如：`eslint`、`vscode`、`config` 等

3. **Subject（主旨，必須繁體中文）**：
   - 限制在 50 字元以內
   - 使用祈使句（如：「新增」、「修正」、「更新」）
   - 不加句號
   - 清楚描述變更的核心內容

4. **Body（內容，必須繁體中文）**：
   - 使用項目符號列表（- 開頭）
   - 每個項目描述一個具體變更
   - 優先說明做了什麼，必要時補充原因或背景（為什麼）
   - 使用台灣常用的技術詞彙（如：「套件」、「設定」、「腳本」）

5. **Breaking Changes（選用）**：
   - 若有破壞性變更，在 type 後加 `!` 或在 footer 註明 `BREAKING CHANGE:`
     `type(scope)!: 使用繁體中文的主旨`

## [OUTPUT_FORMAT]
```
<type>(optional scope): <description in Traditional Chinese>

[optional body in Traditional Chinese]
- <變更 1>
- <變更 2>
- <變更 3>
- ...

[optional footer(s)]
```

## [EXECUTION_STEPS]

1. **取得變更資訊：**
   - 執行 `git status` 檢查當前狀態。
   - 執行 `git diff --staged` 查看已 staged 的變更內容。

2. **檢查分支與決定行為：**
   - **請判斷**當前分支是否為 `main` 或 `master`。
   - **情況 A (安全分支)：** 若當前**不是** `main` 或 `master` 分支，則繼續執行步驟 3。
   - **情況 B (主分支)：** 若當前**是** `main` 或 `master` 分支：
     - **停止**後續的 `git commit` 操作。
     - 依據步驟 1 取得的變更內容，建議一個符合規範的**新分支名稱**（例如：`feat/login-form-validation`）。
     - **回報錯誤**並建議使用者：`請先切換至建議的分支 (或自訂分支) 後，再執行 commit。`

3. **生成 Commit Message 與指令 (僅在情況 A 執行)：**
   - 分析變更類型和影響範圍。
   - 根據變更內容決定最適合的 commit type。
   - **輸出**完整的 Commit Message（包含 Type, Scope, Subject, Body）。
   - **輸出**建議用於提交的 `git commit -m` 指令（確保多行訊息正確）。

4. **後續清理指示 (僅在情況 A 執行，且使用 -F 提交時)：**
   - 如果步驟 3 建議使用 `-F commit-message.txt` 方式提交，請**輸出**以下指令給使用者，用於提交後清除檔案：
     - macOS/Linux: `git commit -F commit-message.txt && rm -f commit-message.txt`
     - Windows: `請使用者執行 git commit -F commit-message.txt 後，手動執行移除指令。`

## [EXAMPLES]
```
feat: 新增使用者登入功能

- 實作 JWT 認證機制
- 新增登入表單驗證
- 整合第三方 OAuth 登入
```

```
fix: 修正購物車金額計算錯誤

- 修正折扣碼套用順序問題
- 更新稅金計算邏輯
```

```
chore: 設定 ESLint 樣式規則與自動修復功能

- 在 playground 中新增 ESLint stylistic 設定
- 設定 VSCode 儲存時自動使用 ESLint 修復
- 新增 lint:fix 腳本至 package.json
- 更新 ESLint 與 TypeScript 相關套件至最新版本
```

## [CONSTRAINTS]

- 只有在 staged 狀態的變更會被考慮
