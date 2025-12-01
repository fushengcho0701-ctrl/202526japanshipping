# 船班訂艙與檢疫追蹤系統

這是一個提供給報關行使用的前端系統：

- 自動從 **Google Sheet (CSV)** 讀取資料（唯讀）
- 提供：
  - 📋 **表格視圖**：可搜尋 / 篩選 / 排序
  - 📅 **行事曆視圖**：
    - 週視圖（類 Google Calendar）
    - 月視圖
- 會自動判斷：
  - **SO 狀態**：已給 / 尚未給 SO 訂艙單
  - **電放單狀態**：已給 / 尚未給電放單
- 支援手機版（RWD）

---

## 🔗 Google Sheet CSV 來源

目前已寫死為：

```text
https://docs.google.com/spreadsheets/d/e/2PACX-1vRPCnYDQ7Z68xF_BtbDDM3ttAxlzq-Wa_zGQR_TTs2yPemTQuegsXgWl7kEgv6qJ2ut3ASPQ_Q-KnSq/pub?gid=994272775&single=true&output=csv
```

如需更換，只要改 `index.html` 中：

```html
<script>
  window.SHEET_CSV_URL = "你的 CSV 連結";
</script>
```

---

## 🗂 專案結構

```text
shipping-tracking-full/
  ├─ index.html   # 主頁面
  ├─ style.css    # Apple 風格樣式
  └─ script.js    # 所有邏輯：讀取 CSV / 渲染表格 / 行事曆 / 搜尋 / 篩選 / 排序
```

---

## 🚀 部署到 GitHub Pages

1. 在 GitHub 建立一個新 repository，例如 `shipping-tracking`
2. 把這三個檔案上傳到 GitHub（放在根目錄）
3. 到 `Settings → Pages`
   - Source: `Deploy from branch`
   - Branch: `main` (或你的預設分支)
4. 等待幾十秒～幾分鐘，GitHub 會產生一個網址，例如：

```text
https://你的 GitHub 帳號.github.io/shipping-tracking/
```

把這個網址給報關行，他們就能隨時在線查看最新船班資訊。

---

## 🔍 使用說明（給報關行）

### 表格視圖

- **搜尋框**：可輸入船名 / 港口 / 藥務號 / 檢疫證號做關鍵字搜尋
- **SO 狀態篩選**：
  - 全部 / 已給 SO / 尚未給 SO
- **電放單狀態篩選**：
  - 全部 / 已給電放單 / 尚未給電放單
- 點擊欄位標題可排序（例如按「結關日」排序）

### 行事曆視圖

- 左上可切換：**週視圖 / 月視圖**
- 上方按鈕：
  - ◀ / ▶：切換上一週 / 下一週，或上一個月 / 下一個月
  - 今天：回到今天所在的週或月
- 顏色說明：
  - 藍色：結關日
  - 橘色：實際開船時間
  - 綠色：抵達日
- 點擊任一事件（彩色小方塊），會跳出詳細資訊視窗

---

## ⚠ 注意事項

- 此系統為「前端靜態頁面」：
  - 不寫入 Google Sheet，只做讀取
  - 使用你公開的 CSV 連結
- 若頁面顯示「無法載入 Google Sheet 資料」，請確認：
  1. 該 Google Sheet 已在「發布到網路」中選擇工作表 & CSV
  2. 連結沒有權限限制（Anyone 可檢視）
