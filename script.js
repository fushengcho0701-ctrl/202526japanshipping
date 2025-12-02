/* -----------------------------------------------------
   Global Variables & Default Settings
----------------------------------------------------- */
let rawData = [];
let filteredData = [];
let currentSortKey = null;
let currentSortOrder = "asc";
let currentLang = localStorage.getItem("lang") || "zh";

/* Calendar State */
let calendarView = "week"; // week | month
let currentDate = new Date();

/* -----------------------------------------------------
   i18n Dictionary
----------------------------------------------------- */
const i18n = {
  zh: {
    appTitle: "船班訂艙與檢疫追蹤系統",
    appSubtitle: "同步 Google Sheet，讓報關行即時掌握船班與文件狀態",
    badgeReadonly: "只讀・自動更新",
    tabTable: "表格視圖",
    tabCalendar: "行事曆視圖",
    filterSO: "SO 狀態：",
    filterTelex: "電放單狀態：",
    filterAll: "全部",
    filterSOdone: "已給 SO",
    filterSOpending: "尚未給 SO",
    filterTelexDone: "已給 電放單",
    filterTelexPending: "尚未給 電放單",

    tableTitle: "船班列表",
    tableDesc: "點欄位標題可排序，SO / 電放單會自動判斷。",
    hintSource: "資料來源：Google Sheet CSV（唯讀）",

    colVessel: "船班",
    colClearanceDate: "結關日",
    colSailingTime: "實際開船時間",
    colPort: "抵達港口",
    colArrivalDate: "抵達日",
    colQuantity: "訂櫃數量",
    colSOstatus: "SO 狀態",
    colQuarantineTime: "申請檢疫官到場時間",
    colDrugNo: "藥務號",
    colQuarantineCertNo: "檢疫證號碼",
    colStuffingDate: "實際裝櫃日",
    colTelexStatus: "電放單狀態",

    calTitle: "行事曆",
    calDesc: "週 / 月視圖切換，顏色代表不同事件。",
    calWeekView: "週視圖",
    calMonthView: "月視圖",
    btnToday: "今天",

    legendClearance: "結關",
    legendSailing: "開船",
    legendArrival: "抵達",

    footerSource: "資料來源：Google Sheet（唯讀）",
    footerAutoRefresh: "頁面每 3 分鐘自動更新",

    statusSOdone: "已給 SO",
    statusSOpending: "尚未給 SO",
    statusTelexDone: "已給 電放單",
    statusTelexPending: "尚未給 電放單",

    emptyValue: "—",

    modalTitleDetail: "船班詳細資訊",
  },

  ja: {
    appTitle: "船舶ブッキング・検疫追跡システム",
    appSubtitle: "Google Sheet と連動し、報関行が船便および書類状況を即時把握",
    badgeReadonly: "閲覧専用・自動更新",
    tabTable: "表形式ビュー",
    tabCalendar: "カレンダービュー",
    filterSO: "SO 状況：",
    filterTelex: "テレックスリリース状況：",
    filterAll: "すべて",
    filterSOdone: "SO 提出済",
    filterSOpending: "SO 未提出",
    filterTelexDone: "電放指示済",
    filterTelexPending: "電放未提出",

    tableTitle: "船便一覧",
    tableDesc: "列タイトルをクリックすると並び替えができます。",
    hintSource: "データ元：Google Sheet CSV（閲覧専用）",

    colVessel: "船名 / VOY",
    colClearanceDate: "通関締切日",
    colSailingTime: "実際出港時刻",
    colPort: "到着港",
    colArrivalDate: "到着日",
    colQuantity: "予約コンテナ数",
    colSOstatus: "SO 状況",
    colQuarantineTime: "検疫官申請時刻",
    colDrugNo: "薬務番号",
    colQuarantineCertNo: "検疫証明番号",
    colStuffingDate: "実際積載日",
    colTelexStatus: "電放状況",

    calTitle: "カレンダー",
    calDesc: "週 / 月ビュー切替、色はイベント種類を示す。",
    calWeekView: "週ビュー",
    calMonthView: "月ビュー",
    btnToday: "今日",

    legendClearance: "通関締切",
    legendSailing: "出港",
    legendArrival: "到着",

    footerSource: "データ元：Google Sheet（閲覧専用）",
    footerAutoRefresh: "ページは 3 分ごとに自動更新",

    statusSOdone: "SO 提出済",
    statusSOpending: "SO 未提出",
    statusTelexDone: "電放指示済",
    statusTelexPending: "電放未提出",

    emptyValue: "—",

    modalTitleDetail: "船便詳細情報",
  }
};

/* -----------------------------------------------------
   Helper：取得翻譯
----------------------------------------------------- */
function t(key) {
  return i18n[currentLang][key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}
/* -----------------------------------------------------
   Calendar（週 + 月）
----------------------------------------------------- */
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (calendarView === "week") renderWeekView();
  else renderMonthView();
}

/* ===== 週視圖 ===== */
function renderWeekView() {
  const grid = document.getElementById("calendar-grid");
  const start = startOfWeek(currentDate);
  const days = [...Array(7)].map((_, i) => addDays(start, i));

  // 星期標頭
  const header = document.createElement("div");
  header.className = "calendar-week";
  header.innerHTML = days
    .map(
      (d) =>
        `<div class="calendar-weekday">${d.getMonth() + 1}/${d.getDate()}</div>`
    )
    .join("");
  grid.appendChild(header);

  // 事件列
  const row = document.createElement("div");
  row.className = "calendar-week";

  days.forEach((date) => {
    const cell = document.createElement("div");
    cell.className = "calendar-week-cell";

    cell.innerHTML = `
      <div class="day-number">${date.getDate()}</div>
    `;

    filteredData.forEach((item) => {
      const clearanceMatch = isSameDate(item.clearanceDateRaw, date);
      const sailingMatch = isSameDate(item.sailingTimeRaw, date);
      const arrivalMatch = isSameDate(item.arrivalDateRaw, date);

      if (clearanceMatch)
        cell.appendChild(
          buildCalendarEvent(item, "event-clearance", t("legendClearance"))
        );
      if (sailingMatch)
        cell.appendChild(
          buildCalendarEvent(item, "event-sailing", t("legendSailing"))
        );
      if (arrivalMatch)
        cell.appendChild(
          buildCalendarEvent(item, "event-arrival", t("legendArrival"))
        );
    });

    row.appendChild(cell);
  });

  grid.appendChild(row);

  const label = document.getElementById("period-label");
  if (label)
    label.textContent = `${formatDate(days[0])} - ${formatDate(days[6])}`;
}

/* ===== 月視圖 ===== */
function renderMonthView() {
  const grid = document.getElementById("calendar-grid");

  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();

  const first = new Date(y, m, 1);
  const start = startOfWeek(first);
  const days = [...Array(42)].map((_, i) => addDays(start, i));

  const box = document.createElement("div");
  box.className = "calendar-month";

  days.forEach((date) => {
    const cell = document.createElement("div");
    cell.className = "calendar-month-cell";

    cell.innerHTML = `
      <div class="day-number">${date.getDate()}</div>
    `;

    filteredData.forEach((item) => {
      const clearanceMatch = isSameDate(item.clearanceDateRaw, date);
      const sailingMatch = isSameDate(item.sailingTimeRaw, date);
      const arrivalMatch = isSameDate(item.arrivalDateRaw, date);

      if (clearanceMatch)
        cell.appendChild(
          buildCalendarEvent(item, "event-clearance", t("legendClearance"))
        );
      if (sailingMatch)
        cell.appendChild(
          buildCalendarEvent(item, "event-sailing", t("legendSailing"))
        );
      if (arrivalMatch)
        cell.appendChild(
          buildCalendarEvent(item, "event-arrival", t("legendArrival"))
        );
    });

    box.appendChild(cell);
  });

  grid.appendChild(box);

  const label = document.getElementById("period-label");
  if (label) label.textContent = `${y}/${m + 1}`;
}

/* -----------------------------------------------------
   Calendar Event 元件（事件氣泡）
----------------------------------------------------- */
function buildCalendarEvent(item, cssClass, label) {
  const el = document.createElement("span");
  el.className = `calendar-event ${cssClass}`;

  const qty = item.quantity ? `（${item.quantity} 櫃）` : "";

  el.textContent = `${label}：${item.vessel}${qty}`;

  el.addEventListener("click", (e) => {
    e.stopPropagation();
    openDetailModal(item);
  });

  return el;
}

/* -----------------------------------------------------
   Modal（詳細資訊）
----------------------------------------------------- */
function openDetailModal(item) {
  const backdrop = document.getElementById("detail-modal-backdrop");
  const list = document.getElementById("modal-detail-list");
  const title = document.getElementById("modal-title");

  title.textContent = item.vessel;

  list.innerHTML = `
    <dt>${t("colVessel")}</dt><dd>${item.vessel}</dd>

    <dt>${t("colQuantity")}</dt><dd>${item.quantity || t("emptyValue")}</dd>

    <dt>${t("colClearanceDate")}</dt><dd>${item.clearanceDate || t("emptyValue")}</dd>

    <dt>${t("colSailingTime")}</dt><dd>${item.sailingTime || t("emptyValue")}</dd>

    <dt>${t("colArrivalDate")}</dt><dd>${item.arrivalDate || t("emptyValue")}</dd>

    <dt>${t("colPort")}</dt><dd>${item.port || t("emptyValue")}</dd>

    <dt>${t("colSOstatus")}</dt><dd>${
      item.soStatus === "done" ? t("statusSOdone") : t("statusSOpending")
    }</dd>

    <dt>${t("colTelexStatus")}</dt><dd>${
      item.telexStatus === "done"
        ? t("statusTelexDone")
        : t("statusTelexPending")
    }</dd>

    <dt>${t("colQuarantineTime")}</dt><dd>${
      item.quarantineTime || t("emptyValue")
    }</dd>

    <dt>${t("colDrugNo")}</dt><dd>${item.drugNo || t("emptyValue")}</dd>

    <dt>${t("colQuarantineCertNo")}</dt><dd>${
      item.quarantineCertNo || t("emptyValue")
    }</dd>

    <dt>${t("colStuffingDate")}</dt><dd>${
      item.stuffingDate || t("emptyValue")
    }</dd>
  `;

  backdrop.classList.add("active");
}

/* Modal 關閉 */
document.getElementById("modal-close-btn").addEventListener("click", () => {
  document
    .getElementById("detail-modal-backdrop")
    .classList.remove("active");
});

document
  .getElementById("detail-modal-backdrop")
  .addEventListener("click", (e) => {
    if (e.target.id === "detail-modal-backdrop") {
      e.target.classList.remove("active");
    }
  });
/* -----------------------------------------------------
   Date Helpers（支援 2025/12/11 9:00）
----------------------------------------------------- */
function parseRawDate(text) {
  if (!text) return null;

  // 去除 星期一 / 星期二 / Mon 等格式
  text = text.replace(/星期.\b/g, "").trim();

  // ⬇ 支援格式：
  // 2025/12/11
  // 2025/12/11 9:00
  // 2025-12-11
  // 2025-12-11 09:30  
  const parts = text.split(" ");
  const datePart = parts[0];
  const timePart = parts[1] || "00:00";

  // 替換成標準 YYYY-MM-DD
  const d = new Date(datePart.replace(/\//g, "-") + " " + timePart);

  return isNaN(d.getTime()) ? null : d;
}

function isSameDate(rawText, dateObj) {
  const d = parseRawDate(rawText);
  if (!d) return false;

  return (
    d.getFullYear() === dateObj.getFullYear() &&
    d.getMonth() === dateObj.getMonth() &&
    d.getDate() === dateObj.getDate()
  );
}

function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* -----------------------------------------------------
   視圖切換（表格 / 行事曆）
----------------------------------------------------- */
function setupViewTabs() {
  const tabs = document.querySelectorAll(".tab-button");
  const views = document.querySelectorAll(".view");

  if (!tabs.length) return;

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;

      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      views.forEach((v) => v.classList.remove("active"));
      const section = document.getElementById(target);
      if (section) section.classList.add("active");

      if (target === "calendar-view") {
        renderCalendar();
      }
    });
  });
}

/* -----------------------------------------------------
   行事曆子視圖切換（週 / 月）
----------------------------------------------------- */
function setupCalendarTabs() {
  const subtabs = document.querySelectorAll(".subtab-button");

  subtabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      calendarView = btn.dataset.calView;

      subtabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      renderCalendar();
    });
  });
}

/* -----------------------------------------------------
   Calendar Navigation Buttons
----------------------------------------------------- */
function setupCalendarNav() {
  const btnPrev = document.getElementById("btn-prev-period");
  const btnNext = document.getElementById("btn-next-period");
  const btnToday = document.getElementById("btn-today");

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      currentDate =
        calendarView === "week"
          ? addDays(currentDate, -7)
          : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      renderCalendar();
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      currentDate =
        calendarView === "week"
          ? addDays(currentDate, 7)
          : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      renderCalendar();
    });
  }

  if (btnToday) {
    btnToday.addEventListener("click", () => {
      currentDate = new Date();
      renderCalendar();
    });
  }
}

/* -----------------------------------------------------
   Initialization（系統初始化）
----------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // 語言
  setupLanguageToggle();
  applyTranslations();

  // 排序
  setupSorting();

  // 視圖切換
  setupViewTabs();

  // 行事曆 Tabs
  setupCalendarTabs();

  // 行事曆上一週 / 下一週 / 今天
  setupCalendarNav();

  // 篩選與搜尋
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.addEventListener("input", applyFiltersAndRender);

  const filterSO = document.getElementById("filter-so");
  if (filterSO) filterSO.addEventListener("change", applyFiltersAndRender);

  const filterTelex = document.getElementById("filter-telex");
  if (filterTelex) filterTelex.addEventListener("change", applyFiltersAndRender);

  // 第一次載入資料
  loadSheetData();

  // 每 3 分鐘自動抓一次 Google Sheet
  setInterval(loadSheetData, 180000);
});
