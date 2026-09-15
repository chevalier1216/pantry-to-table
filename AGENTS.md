# Pantry to Table — Agent 作業規則

## 權威來源
- GitHub `chevalier1216/pantry-to-table` 是專案權威來源；Sites 只是部署目標。
- 修改產品行為前先讀 `README.md`、`docs/product.md`、`docs/status.md`。
- GitHub 可查證時，不得只依聊天紀錄推測目前狀態。

## 執行原則
- 只要下一個安全且可逆的動作已明確，就持續執行，不要只為了回報進度而停止。
- 可逆的實作、審查、測試、文件同步與 branch 維護，不需要例行確認。
- 發現 bug、測試／CI 失敗、過時文件或規格不一致時，只要能安全處理，就直接診斷、修正並重新驗證。
- 只有未決產品決策、缺少必要權限、破壞性／難回復操作、merge 進 `main`、正式 deploy 或修改 Site 存取範圍時才停止確認；若本次對話已明確授權則依授權繼續。

## Git / PR
- 保留使用者既有工作；開發修改在 branch 上進行並保持可審查。
- feature branch 之間的 stacked PR，在審查與必要驗證通過後可自動 merge。
- 未獲明確授權時，不得 merge 進 `main` 或 deploy。
- 已 push 的變更若需回退，優先 revert，不改寫 Git 歷史。
- merge 後仍需確認目標 branch 與 Git tree 符合預期。

## 驗證與效率
- 優先 focused tests；產品程式有實質變更時，完成前應執行 `npm run test:core`、`npm run typecheck`、`npm test`。
- 已驗證的產品 Git tree 沒有改變時，重用既有結果，不重跑高成本完整驗證。
- 不得刪除、弱化或繞過失敗測試來掩蓋缺陷。
- 優先最小安全修改；避免不必要的 Codex / Work 重跑、完整 build、重複 repo 讀取與重複分析。
- 基礎設施或 workflow 問題，不應導致產品功能重新實作。
- 沒有可靠數據時，不對 Work / Codex 額度做過度樂觀的精確估算。

## 產品不變條件
- UI 維持繁體中文、響應式並支援鍵盤操作。
- 不自行假設油、鹽、水、食材數量、設備、庫存、步行路線或已驗證影片。
- Strict mode 只驗證已知的整體食材用量；描述式庫存不得自行換算，應顯示精確食譜需求供使用者比對。
- 尊重明確設備選擇；只有「不拘」可取消設備過濾。未知限制必須保持未知，不得自行補完。
- API key 僅限伺服器端；不得把 production 值、使用者輸入、位置、帳號資料或聊天紀錄提交至 Git。
- 詳細產品規格放在 `docs/product.md`，不要把產品細節持續堆進本檔。

## 交接與完成
- `docs/status.md` 必須與 GitHub 真實狀態一致。
- 若 Chat、Work、Codex、GitHub 間可直接交接或透過 repo 傳遞，不要要求使用者充當傳聲筒。
- 任務只有在「實作 + 必要驗證 + GitHub 交付 + 狀態文件一致」後才算完成。
