# Tag Input Component

本專案用 Vite Vanilla 來建置，在不使用前端框架的前提，使用 JavaScript 來創建一個可以重複使用的標籤輸入元件。
![tag-input](https://github.com/user-attachments/assets/7bf008cf-35da-4edf-8d6b-e866120dbb1f)

## 環境
* Node.js: v20.19.3 (建議 Node 版本 ^18 或 ^20（LTS）)
* NPM: v10.8.2

## 建置
### 初始安裝
```
npm install
```
### 開發模式
```
npm run dev
```
### 測試
```
npm run test
```
測試結果圖示
![test-result](https://github.com/user-attachments/assets/5f3afd25-d216-42b8-b01e-64e44d11664a)

## 主要功能

- 新增標籤
- 刪除標籤
- 亮暗主題的切換

## 額外實作內容

- 主題樣式資訊存放於 localStorage
  - 考量: 當使用者再次訪問網站時，能讀取儲存的樣式資訊，記住上一次使用者的偏好
- 亮暗主題切換加入 css transition 動畫
  - 考量: 亮暗顏色變化的緩衝避免太過生硬的轉變
- 標籤統一小寫
  - 考量: 一方面是因為不會有 "大小寫不分" 的重複標籤所以區分大小寫意義不大，另一方面統一畫面上視覺的一致性
- 限制單個標籤能輸入的最大字數
  - 考量: 避免 DoS 攻擊
