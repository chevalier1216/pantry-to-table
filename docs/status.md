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
- `feat/initial-website` 目前已整合生活化食材輸入、on-demand iCook 候選、收藏、套餐證據與相關 review 修正；PR #1 仍未 merge 到 `main`。
- GitHub canonical upstream：`https://github.com/chevalier1216/pantry-to-table`。
- 已部署可操作 beta：`https://pantry-to-table.meimeip.chatgpt.site`，目前擁有者限定存取；該部署仍是先前 snapshot，不等同目前 GitHub feature branch。
- 部署來源 snapshot：`cbc9d33843622c483ee6b3f2fde85d71b84595ba`。
- GitHub 初始 main：`a7f8840c65d2cecd8171b4d479792a47d9f085e6`。GitHub 與部署鏡像的 Git 歷史不同；後續 GitHub 工作須以 GitHub 分支為基礎，不可將鏡像歷史強制推覆上游。

## 生活化食材輸入與精簡 UI — 2026-09-07
- 已完成：半顆、半瓶、一盒、有、足夠等描述式庫存；精確庫存仍合併核對，食譜維持精確用量。描述不明確足夠時在結果提醒對照，不要求重填克數。
- 第二步移除食材重填與兩個核對框，只留廚具／熱源與忌口。新增四種設備及互斥「不拘」「無」。鑄鐵鍋仍需爐火；電器不偽裝為爐火。
- AI 輸入整理介面同步支援描述式庫存；外部服務仍未啟用。
- 此次保留原有 8 道食譜。

## On-demand 單菜候選 — 2026-09-08～09（已整合至 feat/initial-website，未部署）
- PR #14 → PR #10 → PR #2 已依序 merge，最後由 PR #2 merge 進 `feat/initial-website`。
- 預設 Default/iCook 單菜候選池、選用套餐搜尋證據、站內詳細頁、短期記憶體快取與 localStorage 收藏。沒有新付費 API 或 LLM 推薦依賴。
- 外部摘要只能確認部分條件，標示待核對；已知缺料、忌口、設備或時間衝突仍排除。未知份量不猜測。
- iCook 來源只顯示不可點擊的站內 attribution；不做 bulk crawl、分頁下載、圖片鏡像或 anti-bot bypass。
- 套餐 evidence 必須包含主菜脈絡與實際主食；組合食譜本身就是核對對象，不再重複合併原主菜材料。

## 驗證
- PR #2 早期生活化輸入版本：`npm run test:core` 20/20、`npm run typecheck` PASS、`npm test` 23/23。
- Issue #13 / PR #14：focused 27/27、`npm run test:core` 21/21、`npm run typecheck` PASS、`npm test` 54/54、`git diff --check` PASS。
- double-combine follow-up：隔離 Node 22 focused recommendation-review 6/6 PASS，未重新啟動 Codex。
- PR #10 merge 後 tree 與已驗證 PR #10 head 完全相同；PR #2 merge 後 tree 與其已審查 head 完全相同，因此 merge 本身未改變產品內容。
- 尚未執行瀏覽器互動／視覺驗證，亦未在部署環境執行 live iCook 多查詢驗證。

## 目前邊界
- `feat/initial-website` 已包含上述功能與修正。
- PR #1：`feat/initial-website → main`，目前是進 main 的人工確認邊界。
- 尚未 merge 到 main、尚未 deploy。
