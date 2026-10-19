# 邁向 AI 大師：六關互動遊戲

依《邁向 AI 大師》規劃修訂版 3 製作。入口：網站首頁的「邁向 AI 大師」按鈕，或網址 `#/ai-master`。

## 規格對照

| 規格 | 實作位置 |
| --- | --- |
| 六關、每關六步（10/15/20/20/20/15）、總分 600 | `data/levels.js`，由 `engine/engine.test.js` 驗證 |
| 重送不刷分、當步重試補分、提示不扣分 | `engine/scoring.js`：每個評分項目取歷次最佳 |
| 過關 80 分且完成查核與保存 | `levelPassed()` |
| 固定教學資料與標準答案 | `data/materials.js`（計算口徑 `computeMetrics`） |
| 真實工具驗證與模擬分數分開 | `components/EvidencePanel.jsx`、`engine/checkers.js` |
| 有效操作／自動化完成標記 | `GameApp.jsx` 的 `verifiedStatus()` |
| 人物 ID、表情、文字、觸發、位置、提示層級分開設定 | `data/characters.js`、`data/dialogues.js` |
| 真實網頁與桌面畫面，含版本標示 | `data/screens.js`、`components/ScreenPanel.jsx` |
| 中斷續玩 | `engine/progress.js`（存在瀏覽器 localStorage） |
| 鍵盤操作、拖曳替代 | 卡片皆為按鈕；報告拼圖有 ▲▼；地圖可用方向鍵 |

## 內容團隊待補

1. **真實產品畫面**：目前每個畫面位置都顯示「真實畫面待錄製」。把截圖放到
   `public/game/screens/<chatgpt|claude|gemini>/<web|desktop>/L<關>-<類型>.png`，
   再在 `data/screens.js` 的 `RECORDED` 填入系統、版本、錄製日期、說明與點選位置（百分比）。
   桌面功能需轉網頁時，填 `bridge` 寫明完整轉接。類型見 `SCREEN_KINDS`。
2. **人物素材**：內建原創向量圖在 `assets/characters/`（`npm run game:characters` 產生）。放入同名 PNG 即會優先使用，檔名見該資料夾的 README。
3. **Skill 套件**：`public/game/skills/` 已由腳本產生三平台教學 Skill。上架前請在各平台實際安裝驗證格式。
4. **講師確認碼**：預設 `AIMASTER`，部署時以環境變數 `VITE_INSTRUCTOR_CODE` 覆寫。
   確認碼寫在前端程式中，只能防止誤按，不能當成安全驗證。

## 教學資料

`public/game/materials/` 與 `public/game/skills/` 由 `npm run game:materials` 從 `data/materials.js` 產生，
修改資料或答案後請重跑，保持下載檔與遊戲答案一致。

## 測試

```
npm test           # 計分、口徑、排程時間、證據核對、對話完整性
npm run lint
npm run build
```
