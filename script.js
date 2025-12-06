/* ============================================================
   v107 FIXED — 船班追蹤系統
   修正：setupLanguageToggle、事件切換、行事曆、排序、i18n
============================================================ */

/* ==============================
   Global Variables
============================== */
let rawData = [];
let filteredData = [];
let currentSortKey = "arrivalDate";
let currentSortOrder = "asc";
let currentLang = localStorage.getItem("lang") || "zh";

let calendarView = "week"; 
let currentDate = new Date();
let calendarEventMode = "both"; // both | sailing

/* ==============================
   i18n Dictionary
============================== */
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
    colContainerNo: "櫃次",
    colClearanceDate: "結關日",
    colSailingTime: "實際開船時間",
    colLoadingTime: "裝櫃時間",
    colPort: "抵達港口",
    colArrivalDate: "抵達日",
    colSOstatus: "SO 狀態",
    colQuarantineTime: "申請檢疫官到場時間",
    colDrugNo: "藥務號",
    colQuarantineCertNo: "檢疫證號碼",
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

    emptyValue: "—",

    eventModeBoth: "開船＋抵達",
    eventModeSailing: "只顯示開船"
  }
};

/* ==============================
   Translation Helper
============================== */
function t(key) {
  return i18n[currentLang][key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}

/* ==============================
   Language Toggle — FIXED
============================== */
function setupLanguageToggle() {
  const btns = document.querySelectorAll(".lang-btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentLang = btn.dataset.lang;
      localStorage.setItem("lang", currentLang);

      applyTranslations();
      applyFiltersAndRender();
      renderCalendar();
    });
  });
}

/* ==============================
   CSV Parsing
============================== */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");

    data.push({
      vessel: cols[0] || "",
      containerNo: cols[1] || "",
      clearanceDate: normalizeDate(cols[2]),
      sailingDate: normalizeDate(cols[3]),
      loadingTime: normalizeDate(cols[4]),
      port: cols[5] || "",
      arrivalDate: normalizeDate(cols[6]),
      soStatus: cols[7] === "1" ? "done" : "pending",
      quarantineTime: cols[8] || "",
      drugNo: cols[9] || "",
      quarantineCertNo: cols[10] || "",
      telexStatus: cols[11] === "1" ? "done" : "pending",
    });
  }

  return data;
}

/* ==============================
   Normalize date YYYY/MM/DD hh:mm
============================== */
function normalizeDate(raw) {
  if (!raw) return "";
  return raw.replace(/年|月/g, "/").replace("日", "").trim();
}

/* ==============================
   Load CSV
============================== */
async function loadSheetData() {
  try {
    const res = await fetch(window.SHEET_CSV_URL);
    const text = await res.text();
    rawData = parseCSV(text);

    applyFiltersAndRender();
    renderCalendar();
  } catch (err) {
    console.error("CSV 載入失敗：", err);
  }
}

/* ==============================
   Filter + Search
============================== */
function applyFiltersAndRender() {
  const kw = (document.getElementById("search-input")?.value || "")
    .toLowerCase();

  const soFilter = document.getElementById("filter-so")?.value || "all";
  const telexFilter = document.getElementById("filter-telex")?.value || "all";

  filteredData = rawData.filter((row) => {
    const matchKw =
      row.vessel.toLowerCase().includes(kw) ||
      row.port.toLowerCase().includes(kw) ||
      row.drugNo.toLowerCase().includes(kw) ||
      row.quarantineCertNo.toLowerCase().includes(kw);

    const matchSO =
      soFilter === "all" ? true :
      soFilter === "done" ? row.soStatus === "done" :
      row.soStatus === "pending";

    const matchTelex =
      telexFilter === "all" ? true :
      telexFilter === "done" ? row.telexStatus === "done" :
      row.telexStatus === "pending";

    return matchKw && matchSO && matchTelex;
  });

  filteredData.sort((a, b) => {
    return new Date(a.arrivalDate) - new Date(b.arrivalDate);
  });

  renderTable();
}

/* ==============================
   Render Table
============================== */
function renderTable() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  filteredData.forEach((row) => {
    const tr = document.createElement("tr");

    const multiNote =
      filteredData.filter((x) => x.vessel === row.vessel).length > 1
        ? `<div class="table-note">⚠ 此船需要 ${Math.max(
            ...filteredData
              .filter((x) => x.vessel === row.vessel)
              .map((x) => Number(x.containerNo) || 1)
          )} 櫃</div>`
        : "";

    tr.innerHTML = `
      <td>${row.vessel}${multiNote}</td>
      <td>${row.containerNo}</td>
      <td>${row.clearanceDate}</td>
      <td>${row.sailingDate}</td>
      <td>${row.loadingTime}</td>
      <td>${row.port}</td>
      <td>${row.arrivalDate}</td>

      <td>${renderStatusChip(row.soStatus)}</td>
      <td>${row.quarantineTime || t("emptyValue")}</td>
      <td>${row.drugNo || t("emptyValue")}</td>
      <td>${row.quarantineCertNo || t("emptyValue")}</td>
      <td>${renderStatusChip(row.telexStatus)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderStatusChip(status) {
  const ok = status === "done";
  return `
    <span class="chip ${ok ? "chip-ok" : "chip-bad"}">
      <span class="chip-dot"></span>
      ${ok ? "✔" : "—"}
    </span>
  `;
}

/* ==============================
   Calendar
============================== */
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  if (calendarView === "week") renderWeekView();
  else renderMonthView();
}

function shouldShowEvent(type) {
  if (calendarEventMode === "both") return true;
  if (calendarEventMode === "sailing") return type === "sailing";
  return true;
}

function renderWeekView() {
  const start = startOfWeek(currentDate);
  const days = [...Array(7)].map((_, i) => addDays(start, i));

  const grid = document.getElementById("calendar-grid");

  const header = document.createElement("div");
  header.className = "calendar-week";
  header.innerHTML = days.map(d => `
    <div class="calendar-weekday">${d.getMonth() + 1}/${d.getDate()}</div>
  `).join("");
  grid.appendChild(header);

  const row = document.createElement("div");
  row.className = "calendar-week";

  days.forEach(date => {
    const cell = document.createElement("div");
    cell.className = "calendar-week-cell";
    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    filteredData.forEach(item => {
      if (normalizeDate(item.sailingDate) === formatDate(date) &&
          shouldShowEvent("sailing"))
        cell.innerHTML += `<div class="calendar-event event-sailing">${item.vessel}</div>`;

      if (normalizeDate(item.arrivalDate) === formatDate(date) &&
          shouldShowEvent("arrival"))
        cell.innerHTML += `<div class="calendar-event event-arrival">${item.vessel}</div>`;
    });

    row.appendChild(cell);
  });

  grid.appendChild(row);
}

function renderMonthView() {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const first = new Date(y, m, 1);
  const start = startOfWeek(first);

  const days = [...Array(42)].map((_, i) => addDays(start, i));
  const grid = document.getElementById("calendar-grid");

  const box = document.createElement("div");
  box.className = "calendar-month";

  days.forEach(date => {
    const cell = document.createElement("div");
    cell.className = "calendar-month-cell";
    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    filteredData.forEach(item => {
      if (normalizeDate(item.sailingDate) === formatDate(date) &&
          shouldShowEvent("sailing"))
        cell.innerHTML += `<div class="calendar-event event-sailing">${item.vessel}</div>`;

      if (normalizeDate(item.arrivalDate) === formatDate(date) &&
          shouldShowEvent("arrival"))
        cell.innerHTML += `<div class="calendar-event event-arrival">${item.vessel}</div>`;
    });

    box.appendChild(cell);
  });

  grid.appendChild(box);
}

/* ==============================
   Date Helpers
============================== */
function addDays(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function startOfWeek(d) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(d) {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

/* ==============================
   Calendar Event Mode Buttons
============================== */
function setupCalendarEventModeToggle() {
  const btnBoth = document.getElementById("event-mode-both");
  const btnSailing = document.getElementById("event-mode-sailing");

  if (btnBoth && btnSailing) {
    btnBoth.addEventListener("click", () => {
      calendarEventMode = "both";
      btnBoth.classList.add("active");
      btnSailing.classList.remove("active");
      renderCalendar();
    });

    btnSailing.addEventListener("click", () => {
      calendarEventMode = "sailing";
      btnSailing.classList.add("active");
      btnBoth.classList.remove("active");
      renderCalendar();
    });
  }
}

/* ==============================
   DOM Ready
============================== */
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageToggle();
  setupCalendarEventModeToggle();

  applyTranslations();
  loadSheetData();

  document.getElementById("search-input")?.addEventListener("input", applyFiltersAndRender);
  document.getElementById("filter-so")?.addEventListener("change", applyFiltersAndRender);
  document.getElementById("filter-telex")?.addEventListener("change", applyFiltersAndRender);

  document.querySelectorAll(".tab-button")?.forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.getElementById(btn.dataset.target).classList.add("active");

      if (btn.dataset.target === "calendar-view") renderCalendar();
    });
  });

  // 週/月切換
  document.querySelectorAll(".subtab-button").forEach(btn => {
    btn.addEventListener("click", () => {
      calendarView = btn.dataset.calView;
      document.querySelectorAll(".subtab-button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCalendar();
    });
  });

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

  // Auto refresh every 3 min
  setInterval(loadSheetData, 180000);
});
