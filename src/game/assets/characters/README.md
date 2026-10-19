# 人物圖檔（src/game/assets/characters/）

這裡已有內建的原創向量圖（.svg，由 `npm run game:characters` 產生）。
想換成自己的人物，把同名的 .png 放進這個資料夾即可，遊戲會優先使用 PNG，不用改程式。
建議使用透明背景的 PNG，半身圖至少 1000px 高。

## 表情（每位人物五張）

| 表情 | 引導人物 | 委託人物 | 提示小幫手 |
| --- | --- | --- | --- |
| 說明 | guide-explain.png | client-explain.png | helper-explain.png |
| 鼓勵 | guide-encourage.png | client-encourage.png | helper-encourage.png |
| 疑惑 | guide-puzzled.png | client-puzzled.png | helper-puzzled.png |
| 提醒 | guide-remind.png | client-remind.png | helper-remind.png |
| 成功 | guide-success.png | client-success.png | helper-success.png |

## 地圖全身圖（引導人物，四方向）

| 方向 | 檔名 |
| --- | --- |
| 正面 | guide-front.png |
| 背面 | guide-back.png |
| 面向左 | guide-left.png |
| 面向右 | guide-right.png |
