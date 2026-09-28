## Mandatory cross-project PR gate (2026-09-29)

本 repo **必須遵守** [跨專案 Git 交付政策](https://github.com/chevalier1216/KarpathyWiki_personal/blob/main/CROSS_PROJECT_GIT_POLICY.md)。此規範優先於本檔及其他舊文件中任何直接提交預設分支的做法；保留原有產品規格、必要測試、授權與成本限制。Work / Codex / 其他 Agent 不需使用者每次重複提醒：

- 從最新受保護整合分支建立 **每項獨立需求一個短期 branch**；禁止 direct commit/push 至整合分支，包括 Wiki、文件與 hotfix；多 Agent 使用獨立 branch/工作樹。
- 在工作分支驗證、commit、push，建立 PR；審核 diff、範圍、敏感資訊、必要 CI、衝突與 migration/部署影響。未過不得 merge；新費用、破壞性及授權操作仍需明確批准。
- 預設 Squash Merge 並留存 PR、head SHA、merge SHA、CI/部署讀回；需要回檔則從 revert branch 建 PR，不 force push/reset 整合分支。只開 PR 或只 push 不可說已完成整合。
- 並行功能用獨立 PR，合併前確認相依及更新最新整合分支；如不能建立 PR/執行驗證，記錄 blocker，**不可改走直接 push**。
- 此文件為工作方式，不代表 GitHub Ruleset 已啟用；須另行設定與讀回預設分支的 Require PR、必須 CI、禁止 force push/刪除。


# Pantry to Table

Read README.md, docs/product.md and docs/status.md before changing behavior. GitHub chevalier1216/pantry-to-table is canonical; Sites is a deployment mirror.

- Keep the user interface in Traditional Chinese, responsive and keyboard accessible.
- Never assume staples, quantities, equipment, stock availability, walking routes or verified videos.
- Strict mode must validate aggregated known whole-meal quantities; descriptive stock stays unquantified and shows precise recipe needs for the user to compare. Respect explicit equipment choices; the explicit any option removes equipment filtering. Unknown restrictions must be resolved before recommendation.
- Keep API keys server-only, local .env ignored, and production values out of Git. Do not commit user inputs, locations, account data or chat history.
- Use small modules and focused tests for pantry constraints. Run npm run test:core, npm run typecheck, and npm test before claiming completion; skip repetitive full builds when the verified source has not changed.
- Keep pending external credentials and integration limitations explicit. Do not remove failed tests to hide a product defect.
- Preserve existing user work. Make development changes on a branch and provide a reviewable PR; do not merge or change Site audience without authorization.
- Do not require routine user confirmations for reversible implementation and verification already authorized in the session.
