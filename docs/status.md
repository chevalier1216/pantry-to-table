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

## 生活化食材輸入與精簡 UI — 2026-09-07
- 已完成：半顆、半瓶、一盒、有、足夠等描述式庫存；精確庫存仍合併核對，食譜維持精確用量。描述不明確足夠時在結果提醒對照，不要求重填克數。
- 第二步移除食材重填與兩個核對框，只留廚具／熱源與忌口。新增四種設備及互斥「不拘」「無」。鑄鐵鍋仍需爐火；電器不偽裝為爐火。
- AI 輸入整理介面同步支援描述式庫存；外部服務仍未啟用。
- 此次保留原有 8 道食譜。下一步另行處理食譜數量不足。
- TypeScript、核心規則、production Worker 建置與 HTTP 測試通過；未執行瀏覽器互動驗證。
- 修正版本待發布；本輪僅授權既有網站修改，線上網址仍是先前 beta。

## On-demand 單菜候選 — 2026-09-08（draft PR，未部署）

- 基底 `feat/friendly-pantry-ui` / `56cecc4`；獨立分支 `feat/on-demand-recipe-candidates`。
- 預設 Default/iCook 單菜候選池、選用套餐搜尋證據、站內詳細頁、短期記憶體快取與 localStorage 收藏。沒有新付費 API 或 LLM 推薦依賴。
- 外部摘要只能確認部分條件，標示待核對；已知缺料、忌口、設備或時間衝突仍排除。未知份量不猜測。
- 一個代表搜尋頁與一個詳細頁正常 server fetch HTTP 200；沒有 anti-bot bypass。
- 最後程式驗證：test:core 21/21、typecheck PASS、npm test 47/47（含 production Worker build 和站內 detail 路由）。未完成瀏覽器互動／視覺驗證或部署環境的 live 驗證。
- 原未提交 D1 索引工作保留在原 worktree；不屬於此分支。無 merge、無 deploy。
- 指定 Google Drive 資料夾尚待使用者回覆；Google Doc 版本紀錄尚未建立。詳細範圍與限制見 `docs/icook-on-demand.md`。

