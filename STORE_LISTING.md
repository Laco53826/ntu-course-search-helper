# Chrome Web Store 上架素材草案

## 擴充功能名稱
NTU Course Search Helper

## 短描述（Short description）
在臺大課程頁面一鍵搜尋 Dcard／歐趴糖／PTT／Google（課程或老師）。

## 詳細描述（Detailed description）
在舊版與新版臺大課程網頁面自動擷取「課程名稱／授課教師」，一鍵開啟 Google 搜尋結果。
支援：Google、Dcard、歐趴糖、PTT。

特色：
- 支援舊課程網與新版課程網
- 可選擇搜尋「課程名稱」「授課教師」「老師+課程」
- 搜尋來源可自由勾選
- 不使用遠端程式碼與不必要權限

使用方式：
1. 進入課程頁面
2. 右下角浮動卡片選擇搜尋對象與來源
3. 點「開啟搜尋」即自動開啟多個搜尋分頁

## 權限說明
- 無需額外權限（僅使用 content script 與 service worker 開新分頁）。

## 需要補上的資料
- 聯絡信箱
- 隱私權政策網址（可用 GitHub Pages）

## 素材清單
- 圖示：`assets/icons/icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`
- 截圖：請用實際畫面截圖（建議 1280x800）

## 上架步驟簡表
1. 打包 zip（排除 .git、node_modules 等）
2. 進入 Chrome Web Store Developer Dashboard 上傳
3. 填寫描述、上傳圖示/截圖、貼上隱私權政策網址
4. 送審
