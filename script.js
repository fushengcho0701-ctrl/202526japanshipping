/* -----------------------------------------------------
   Global Variables & Default Settings
----------------------------------------------------- */
let rawData = [];
let filteredData = [];
let currentSortKey = null;
let currentSortOrder = "asc";
let currentLang = localStorage.getItem("lang") || "zh";

/* Calendar State */
let calendarView = "month"; // 預設月曆
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

    emptyValue: "—"
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

    emptyValue: "—"
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
   語言切換
----------------------------------------------------- */
function setupLanguageToggle() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem("lang", currentLang);

      document.querySelectorAll(".lang-btn").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");

      applyTranslations();
      applyFiltersAndRender();
      renderCalendar();
    });
  });
}

/* -----------------------------------------------------
   日期 Parser（強化版）
----------------------------------------------------- */
function parseRawDate(text) {
  if (!text) return null;

  // 去除 "星期一、星期二…"
  text = text.replace(/星期[一二三四五六日天]/g, "").trim();

  // 去除多餘空白
  text = text.replace(/\s+/g, " ").trim();

  // 取出日期 + 時間
  const parts = text.split(" ");
  const datePart = parts[0]?.replace(/\//g, "-");
  const timePart = parts[1] || "00:00";

  const d = new Date(`${datePart} ${timePart}`);

  return isNaN(d.getTime()) ? null : d;
}

function formatDateObj(d) {
  if (!d) return t("emptyValue");
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateTime(d) {
  if (!d) return t("emptyValue");
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const h = `${d.getHours()}`.padStart(2, "0");
  const min = `${d.getMinutes()}`.padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}`;
}

function isSameDate(d1, d2) {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/* -----------------------------------------------------
   載入 Google Sheet CSV
----------------------------------------------------- */
async function loadSheetData() {
  try {
    const res = await fetch(window.SHEET_CSV_URL);
    const csvText = await res.text();

    rawData = parseCSV(csvText);
    applyFiltersAndRender();
    renderCalendar();
  } catch (err) {
    console.error("CSV 載入失敗：", err);
  }
}

/* CSV Parser */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");

    data.push({
      vessel: cols[0] || "",
      clearanceDateRaw: cols[1] || "",
      sailingTimeRaw: cols[2] || "",
      port: cols[3] || "",
      arrivalDateRaw: cols[4] || "",
      quantity: cols[5] || "",

      soStatus: cols[6] === "1" ? "done" : "pending",
      quarantineTime: cols[7] || "",
      drugNo: cols[8] || "",
      quarantineCertNo: cols[9] || "",
      stuffingDate: cols[10] || "",

      telexStatus: cols[11] === "1" ? "done" : "pending",

      clearanceDate: parseRawDate(cols[1]),
      sailingTime: parseRawDate(cols[2]),
      arrivalDate: parseRawDate(cols[4])
    });
  }
  return data;
}

/* -----------------------------------------------------
   篩選 + 搜尋
----------------------------------------------------- */
function applyFiltersAndRender() {
  const keyword = (document.getElementById("search-input")?.value || "")
    .trim()
    .toLowerCase();

  const soFilter = document.getElementById("filter-so")?.value || "all";
  const telexFilter = document.getElementById("filter-telex")?.value || "all";

  filteredData = rawData.filter((row) => {
    const matchKeyword =
      row.vessel.toLowerCase().includes(keyword) ||
      row.port.toLowerCase().includes(keyword) ||
      row.drugNo.toLowerCase().includes(keyword);

    const matchSO =
      soFilter === "all"
        ? true
        : soFilter === "done"
        ? row.soStatus === "done"
        : row.soStatus === "pending";

    const matchTelex =
      telexFilter === "all"
        ? true
        : telexFilter === "done"
        ? row.telexStatus === "done"
        : row.telexStatus === "pending";

    return matchKeyword && matchSO && matchTelex;
  });

  if (currentSortKey) {
    filteredData.sort((a, b) => {
      let va = a[currentSortKey];
      let vb = b[currentSortKey];

      if (va instanceof Date && vb instanceof Date) {
        return currentSortOrder === "asc"
          ? va - vb
          : vb - va;
      }

      return currentSortOrder === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }

  renderTable();
}

/* -----------------------------------------------------
   渲染表格
----------------------------------------------------- */
function renderTable() {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  filteredData.forEach((row) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.vessel}</td>
      <td>${formatDateObj(row.clearanceDate)}</td>
      <td>${formatDateTime(row.sailingTime)}</td>
      <td>${row.port}</td>
      <td>${formatDateObj(row.arrivalDate)}</td>
      <td>${row.quantity}</td>

      <td>${renderStatusChip(
        row.soStatus === "done" ? "ok" : "bad",
        row.soStatus === "done" ? t("filterSOdone") : t("filterSOpending")
      )}</td>

      <td>${row.quarantineTime || t("emptyValue")}</td>
      <td>${row.drugNo || t("emptyValue")}</td>
      <td>${row.quarantineCertNo || t("emptyValue")}</td>
      <td>${row.stuffingDate || t("emptyValue")}</td>

      <td>${renderStatusChip(
        row.telexStatus === "done" ? "ok" : "bad",
        row.telexStatus === "done"
          ? t("filterTelexDone")
          : t("filterTelexPending")
      )}</td>
    `;

    tbody.appendChild(tr);
  });
}

function renderStatusChip(type, text) {
  return `
    <span class="chip chip-${type}">
      <span class="chip-dot"></span>${text}
    </span>
  `;
}

/* -----------------------------------------------------
   Sorting
----------------------------------------------------- */
function setupSorting() {
  document.querySelectorAll("th[data-sort-key]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sortKey;

      if (key === currentSortKey) {
        currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
      } else {
        currentSortKey = key;
        currentSortOrder = "asc";
      }

      document
        .querySelectorAll("th[data-sort-key]")
        .forEach((el) => el.removeAttribute("data-sort-active"));

      th.setAttribute("data-sort-active", currentSortOrder);

      applyFiltersAndRender();
    });
  });
}

/* -----------------------------------------------------
   Calendar（週 + 月 + 船名 + 櫃量）
----------------------------------------------------- */
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (calendarView === "week") renderWeekView();
  else renderMonthView();
}

function buildEventHTML(label, colorClass, row) {
  return `
    <div class="calendar-event ${colorClass}" 
         data-vessel="${row.vessel}"
         data-qty="${row.quantity}"
         data-clear="${formatDateObj(row.clearanceDate)}"
         data-sail="${formatDateTime(row.sailingTime)}"
         data-arr="${formatDateObj(row.arrivalDate)}">
      ${label}｜${row.vessel}（${row.quantity} 櫃）
    </div>`;
}

function attachEventListenersToCalendar() {
  document.querySelectorAll(".calendar-event").forEach((ev) => {
    ev.addEventListener("click", () => {
      openModal({
        vessel: ev.dataset.vessel,
        qty: ev.dataset.qty,
        clearance: ev.dataset.clear,
        sail: ev.dataset.sail,
        arrival: ev.dataset.arr
      });
    });
  });
}

function renderWeekView() {
  const grid = document.getElementById("calendar-grid");
  const start = startOfWeek(currentDate);
  const days = [...Array(7)].map((_, i) => addDays(start, i));

  const header = document.createElement("div");
  header.className = "calendar-week";
  header.innerHTML = days
    .map((d) => `<div class="calendar-weekday">${d.getMonth() + 1}/${d.getDate()}</div>`)
    .join("");
  grid.appendChild(header);

  const row = document.createElement("div");
  row.className = "calendar-week";

  days.forEach((date) => {
    const cell = document.createElement("div");
    cell.className = "calendar-week-cell";
    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    filteredData.forEach((item) => {
      if (isSameDate(item.clearanceDate, date))
        cell.innerHTML += buildEventHTML(t("legendClearance"), "event-clearance", item);
      if (isSameDate(item.sailingTime, date))
        cell.innerHTML += buildEventHTML(t("legendSailing"), "event-sailing", item);
      if (isSameDate(item.arrivalDate, date))
        cell.innerHTML += buildEventHTML(t("legendArrival"), "event-arrival", item);
    });

    row.appendChild(cell);
  });

  grid.appendChild(row);
  attachEventListenersToCalendar();

  const label = document.getElementById("period-label");
  if (label) {
    label.textContent = `${formatDateObj(days[0])} - ${formatDateObj(days[6])}`;
  }
}

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
    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    filteredData.forEach((item) => {
      if (isSameDate(item.clearanceDate, date))
        cell.innerHTML += buildEventHTML(t("legendClearance"), "event-clearance", item);
      if (isSameDate(item.sailingTime, date))
        cell.innerHTML += buildEventHTML(t("legendSailing"), "event-sailing", item);
      if (isSameDate(item.arrivalDate, date))
        cell.innerHTML += buildEventHTML(t("legendArrival"), "event-arrival", item);
    });

    box.appendChild(cell);
  });

  grid.appendChild(box);
  attachEventListenersToCalendar();

  const label = document.getElementById("period-label");
  if (label) label.textContent = `${y}/${m + 1}`;
}

/* -----------------------------------------------------
   Modal
----------------------------------------------------- */
function openModal(data) {
  const modal = document.getElementById("detail-modal-backdrop");
  const list = document.getElementById("modal-detail-list");
  const title = document.getElementById("modal-title");

  title.textContent = data.vessel;

  list.innerHTML = `
    <dt>櫃量</dt><dd>${data.qty}</dd>
    <dt>結關</dt><dd>${data.clearance}</dd>
    <dt>開船</dt><dd>${data.sail}</dd>
    <dt>抵達</dt><dd>${data.arrival}</dd>
  `;

  modal.classList.add("active");
}

function closeModal() {
  document.getElementById("detail-modal-backdrop").classList.remove("active");
}

/* -----------------------------------------------------
   Date Helpers
----------------------------------------------------- */
function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/* -----------------------------------------------------
   Initialize
----------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageToggle();
  applyTranslations();

  setupSorting();
  loadSheetData();

  document.getElementById("search-input")?.addEventListener("input", applyFiltersAndRender);
  document.getElementById("filter-so")?.addEventListener("change", applyFiltersAndRender);
  document.getElementById("filter-telex")?.addEventListener("change", applyFiltersAndRender);

  /* Tab Switch */
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      document.querySelectorAll(".tab-button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      document.getElementById(targetId).classList.add("active");

      if (targetId === "calendar-view") renderCalendar();
    });
  });

  /* Calendar Sub Tabs */
  document.querySelectorAll(".subtab-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      calendarView = btn.dataset.calView;
      document.querySelectorAll(".subtab-button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCalendar();
    });
  });

  /* Calendar Navigation */
  document.getElementById("btn-prev-period")?.addEventListener("click", () => {
    currentDate =
      calendarView === "week"
        ? addDays(currentDate, -7)
        : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    renderCalendar();
  });

  document.getElementById("btn-next-period")?.addEventListener("click", () => {
    currentDate =
      calendarView === "week"
        ? addDays(currentDate, 7)
        : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    renderCalendar();
  });

  document.getElementById("btn-today")?.addEventListener("click", () => {
    currentDate = new Date();
    renderCalendar();
  });

  /* Modal Close */
  document.getElementById("modal-close-btn")?.addEventListener("click", closeModal);
  document.getElementById("detail-modal-backdrop")?.addEventListener("click", (e) => {
    if (e.target.id === "detail-modal-backdrop") closeModal();
  });

  /* Auto Refresh */
  setInterval(loadSheetData, 180000);
});
