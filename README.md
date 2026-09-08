# 今晚煮什麼 · Pantry to Table

使用現有食材、用餐人數、忌口、廚具與可用時間，列出單道料理候選及逐步作法的開源網站。

**目前狀態：可操作 beta，非完整通用 AI 食譜搜尋服務。** 內建 8 道原創家常料理草案、有限中文辨識與確定性條件檢查。未設定金鑰也能使用基本流程。AI、即時附近店家查詢是可選伺服器功能，須另行啟用；不得把未啟用功能當成已上線。

## 可以做什麼

- 用中文描述食材、人數、時間、忌口與鍋具，不必秤重；接著選擇廚具與忌口。
- 嚴格現有材料模式：整餐合併用量，油、鹽、水也不默認有。
- 補買模式：顯示各項缺少數量；可預留往返、採買與結帳時間。
- 硬性排除忌口與缺少廚具的食譜；未辨識忌口要先確認。
- 依人數調整用量，提供依序烹調時間表與逐步教學對話框。
- 外部影片以搜尋連結呈現，尚未核對影片內容與食譜差異。
- 手機與桌面響應式介面；原創情境示意圖，不表示特定食譜實拍成果。

## 本機啟動

需要 Node.js 22.13 以上、npm、Bash 與 GNU coreutils。Windows 建議使用 WSL。依賴版本由 package-lock.json 固定。

```bash
npm ci
npm run dev
```

以啟動訊息顯示的 localhost 位址開啟。不要只用檔案瀏覽器開啟 TSX。沒有外部金鑰時，基本辨識與料理規劃仍可使用。

```bash
npm run test:core
npm run typecheck
npm test
```

`npm test` 會先建置，再驗證規則、服務錯誤狀態與 production Worker 的實際 HTTP 回應。未包含瀏覽器互動／視覺測試或有付費金鑰的供應商連線測試。

## 選用的外部服務

`.env.example` 僅含空值。在自己的伺服器設定環境變數；本機可複製為 `.env`。部署至 Sites 時須另設 production runtime 變數，`.env` 不會隨程式上傳。

| 變數 | 用途 |
|---|---|
| `OPENAI_API_KEY` | AI 輸入整理；僅伺服器讀取 |
| `OPENAI_MODEL` | 帳號可使用且支援 Responses 結構化輸出的模型名稱；不預設模型或價格 |
| `GOOGLE_MAPS_API_KEY` | Geocoding、Places API (New)、Routes API 的伺服器金鑰 |

AI 只整理輸入，不直接繞過食材／數量／忌口規則。網站預設基本辨識；啟用 AI 後由使用者勾選才傳送輸入至 OpenAI，請求設定 `store:false`。這不代表服務商完全沒有任何安全或營運紀錄。

查店家時才將地標送至 Google。透過 Nearby Search 找候選店家，再用 Routes 的 WALK 路線篩選單程分鐘；商店類型不等於確認販售某食材，庫存始終標為未確認。無金鑰時只提供地圖搜尋連結，不捏造店家、步行時間或營業狀態。

本 beta 首次部署採擁有者限定存取。公開營運並啟用付費金鑰前，需設定自己的 API 配額、請求限制、存取策略與對外隱私／服務條款；目前沒有跨執行個體的用量限制，不適合無限制提供付費 API 代理。

## 食材與時間邊界

- 目前僅涵蓋雞蛋、番茄、高麗菜、熟飯、豆腐、鮮菇、乾麵與列出的調味料（含糖；目前食譜不需糖）。
- 半顆高麗菜、半瓶醬油、一盒豆腐或「足夠」會保留原描述；輸出精確食譜用量，份量不明時提示自行對照，不要求換算。冷凍及目錄外食材仍不自動猜解凍時間或納入。
- 不會拿生米當熟飯。沒有列出的食材不納入，沒有列出的主食也不計份量與時間。
- 基本辨識是有限規則，不是完整語言模型；可在第一步修改原始描述，第二步只選廚具與忌口。
- 食譜時間為保守估算，受份量、爐具、鍋具大小及熟練度影響；份量最多六人，較大份量延長時間。
- 忌口分類不能替代產品成分與交叉接觸確認。食用油、乾麵、醬油等仍須核對包裝。
- 菜單目錄與步驟為原創草案，尚未經專業食譜審核；沒有虛構第三方來源或影片驗證。

## 專案結構

- `app/page.tsx`：輸入、確認、選餐、教學與採買介面。
- `lib/catalog.mjs`：食材、廚具、忌口分類與原創食譜。
- `lib/planner.mjs`：基本中文辨識、份量與限制驗證、整餐排程。
- `lib/providers.mjs`、`app/api/`：可選 AI 與 Google Maps 接點。
- `tests/`：核心限制及 production HTTP 回應測試。
- `docs/product.md`：需求與目前邊界；`docs/status.md`：交接狀態。

GitHub 是開源原始碼的主要來源；Sites 的來源儲存庫僅為部署鏡像。`.openai/hosting.json` 是此部署識別，fork 後建立自己的 Sites 專案時必須移除其中原 project_id，不得覆用他人 Site。資料庫與上傳儲存未啟用。

## 串接參考

- [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Google Nearby Search](https://developers.google.com/maps/documentation/places/web-service/nearby-search)
- [Google Routes](https://developers.google.com/maps/documentation/routes/compute_route_directions)

## 授權

MIT，見 [LICENSE](LICENSE)。介面使用隨基底提供的開源元件，其相依套件保留各自授權。`public/family-dinner.png` 為本專案生成的餐桌示意圖。

## On-demand 料理候選（本分支，未部署）

預設列出單道菜，Default 與 iCook 摘要共同排序；勾選「搭配成套餐」才查少量主食證據。每次最多三次一般搜尋及兩次選用搭配搜尋，僅首批摘要，不預抓 detail。點開後在本站顯示食譜。

搜尋摘要缺少完整份量、設備及時間涵蓋範圍，必須標示待核對，不能把候選數量稱為已確認能做的數量。已知缺料／設備／忌口仍會排除。收藏是瀏覽器 localStorage 的獨立快照，不會變成 Default recipe。

Recipe engine、iCook 解析／排序、搭配、快取及收藏均無 LLM 依賴或新增付費 API；基本中文 parser 為預設，現有 AI 整理仍須使用者選用。詳見 [on-demand 邊界與驗證](docs/icook-on-demand.md)。
