# 交接狀態 — 2026-09-07

## 已實作與驗證
- 繁體中文響應式網站：基本自然語言辨識 → 可編輯條件 → 菜單 → 時間表／逐步教學。
- 8 道原創家常食譜；嚴格材料、總用量、廚具、忌口與時間檢查。
- AI 與 Google Maps 伺服器接點、未啟用提示、地圖與影片搜尋連結。
- AI／地圖回應過期時不套用舊結果；過敏詞出現在食材後方也會辨識。
- 已通過 20 項 Node 測試、TypeScript 檢查與正式 Worker 建置。
- 瀏覽器操作／視覺驗證尚未執行；有金鑰的 AI／Maps 連線尚未驗證。

## 尚未接通
- OPENAI_API_KEY、OPENAI_MODEL、GOOGLE_MAPS_API_KEY 均未設定。不要向使用者宣稱這些服務已啟用。
- 未涵蓋任意食材／生肉／解凍、多店採買最佳化、影片內容驗證或即時庫存。

## GitHub 同步與部署
- 已安裝 ChatGPT Codex Connector，2026-09-07 實際 GitHub blob 寫入成功，原 HTTP 403 已解除。
- 網站原始碼提交至 `feat/initial-website` 分支，供 PR 審閱；main 原有 README 與 MIT 授權歷史保留。
- GitHub canonical upstream：`https://github.com/chevalier1216/pantry-to-table`。
- 已部署可操作 beta：`https://pantry-to-table.meimeip.chatgpt.site`，目前擁有者限定存取。
- 部署來源 snapshot：`cbc9d33843622c483ee6b3f2fde85d71b84595ba`。本次 GitHub 同步只更新交接文件，應用程式與已部署版本相同。
- GitHub 初始 main：`a7f8840c65d2cecd8171b4d479792a47d9f085e6`。GitHub 與部署鏡像的 Git 歷史不同；後續 GitHub 工作須以 GitHub 分支為基礎，不可將鏡像歷史強制推覆上游。
- 寫入恢復後再次驗證 20 項測試與 TypeScript；應用程式未改動，沿用先前成功建置。

後續優先工作：設定外部服務並做真實連線驗證、擴充食材與食譜、進行瀏覽器操作與視覺驗證。原始設計與操作細節見 README.md、docs/product.md。
