# On-demand 料理候選：實作與可行性紀錄

日期：2026-09-08。基底：`feat/friendly-pantry-ui` / `56cecc4`。開發分支：`feat/on-demand-recipe-candidates`。此分支供 draft PR 審閱，未 merge、未 deploy。

## 最小來源可行性

以一般 Node server fetch（不偽裝 User-Agent、不帶 cookies、不用瀏覽器自動化）檢查兩個唯一 URL：

- `https://icook.tw/search/%E7%95%AA%E8%8C%84%20%E8%9B%8B`：HTTP 200，text/html，解析首批 18 筆摘要。
- `https://icook.tw/recipes/488158`：HTTP 200，text/html，Recipe JSON-LD 提供 11 項食材、5 個步驟、來源份數與時間；未提供完整設備。

沙盒首次拒絕網路連線 EACCES，屬本機限制；正常權限 fetch 成功。每個相同 URL 再讀一次以保留本機解析樣本，共四次成功 fetch，沒有增加頁面、追分頁或下載圖片。樣本僅在 ignored `work/`，不提交來源正文；自動測試使用原創合成 fixture。

此結果只證明上述頁面當時可讀，不代表部署環境或整站長期可讀，也不代表內容授權。遇到 HTTP failure、redirect、challenge、超時或結構異常時停止該輪後續來源搜尋，不重試或繞過。保留已取得及內建候選。

## 資料與成本邊界

- 一般查詢最多三個獨立關鍵字組合；僅首批最多二十筆/頁。預設不讀 detail、不組菜單。
- canonical id 去重，依缺料／待核對項排序，再以標題正規化的作法與主要食材分組；同組最多兩筆。番茄炒蛋／番茄滑蛋及食材別名合併，調味／點綴差異不另開群組；不同主要食材的炒菜不會只因「炒」字而合併。
- 套餐勾選後，僅前兩個適合的單菜各取一個主食方向查證，共用五次 search 上限，不做乘積窮舉。規則同時使用食材、標題與已取得的作法：鹹味湯底可支持湯麵、適合冷食切絲的蔬菜可支持涼麵、帶醬汁／咖哩／燉滷可支持飯、適合炒飯的食材與炒製特徵才提出炒飯。每道最多兩個方向，查證只取第一個，不預抓 detail。
- 搭配搜尋包含所選料理標題及主食方向，不單查「白飯／炒飯／麵食」。來源結果須同時包含原菜主要食材、實際米飯或麵條材料，以及符合方向的料理標題；任意獨立主食搜尋命中不算證據。只有該組合方向的來源食譜通過既有條件檢查及整餐合併檢查才顯示。搜尋命中仍只是可行性線索，非完整套餐驗證。
- 外部 ingredient 保留名稱、可選 internalId、來源量與單位。只做精確 alias 對應；複合食材不拆解或強行歸類。未提供量、不同單位或份數未知時提示核對。
- strict 排除已知缺料或超量；shop 列缺料，已知同單位可列缺量。忌口及設備已知衝突排除；摘要欠缺資料者清楚標示待核對，不能聲稱足量或確定能做。Default 維持既有人份、時間、設備規則；套餐對來源份數先正規化，再合併用量。
- 點開後從站內 `/api/recipes/detail` 讀取單篇，顯示材料／步驟／作者／不可點擊的來源文字，來源 URL 保留於 metadata。共用詳細頁元件也用於收藏快照，沒有來源外連。React 以純文字呈現，沒有圖片下載或 HTML 注入。
- search cache 五分鐘、最多六十鍵；detail cache 十五分鐘、最多四十鍵；同鍵 concurrent requests 共用，失敗不快取。是執行個體記憶體快取，重啟可遺失，沒有共享資料庫或背景更新。
- 收藏至瀏覽器 localStorage，最多五十份 normalized recipe snapshot。只保留食譜白名單欄位，不保留 pantry/assessment；reload 可讀、可移除、儲存故障可見。收藏快照可能過時，不自動刷新，也不成為 Default。
- recipe engine、解析、ranking、diversity、套餐、cache、favorite 均 deterministic。既有基本中文 parser 仍優先；LLM 僅為使用者選用的輸入整理。無新增套件、付費 API、向量資料庫或後端帳戶服務。

## 驗證

Issue #13 工作目錄驗證：`npm run test:core` 21/21、`npm run typecheck` PASS、`npm test` 54/54（含 production Worker build 與站內 detail HTTP）。聚焦測試 27 項，涵蓋 budget、dedupe、diversity、strict/shop、quantity、exclusion、equipment、cache、favorite reload/remove、failure fallback、pairing checkbox、脈絡證據、食材特徵方向及詳細頁無外連的實際 React 渲染。四項 review 缺陷均先由失敗測試重現，再修正為通過。

Windows 首次完整測試因 Bash 不在 PATH，第二次因沙盒 mkdir 權限失敗；加入已安裝 Git Bash 路徑並在正常權限執行後通過。未修改建置腳本或刪除失敗測試。

限制：未執行瀏覽器點擊／視覺驗證；站內 detail 以解析、React 元件渲染及 production HTTP 測試驗證。先前真實網路僅檢查兩個代表頁，Issue #13 沒有追加 live 搜尋；沒有跑多查詢 live 推薦或付費 API。尚未部署。

## 交付與保留項

原 `pantry-to-table` 目錄的 `feat/icook-recipe-index` 未提交工作（D1／批次索引等）保持原狀，沒有混入此分支。開發在獨立 `pantry-live` worktree。

版本 Google Doc 的指定 Drive 資料夾尚待使用者提供；已詢問，不建立猜測的位置。文件未同步前不得宣稱版本交付紀錄完整。
