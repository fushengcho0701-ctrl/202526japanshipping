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
    calDesc: "週／月視圖切換，顏色代表不同事件。",
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
    emptyValue: "—"
  }
};

/* -----------------------------------------------------
   日期清洗（關鍵功能）
   轉成 YYYY-MM-DD
----------------------------------------------------- */
function cleanDate(str) {
  if (!str) return "";

  return str
    .replace("星期一", "")
    .replace("星期二", "")
    .replace("星期三", "")
    .replace("星期四", "")
    .replace("星期五", "")
    .replace("星期六", "")
    .replace("星期日", "")
    .trim();
}

function parseDate(str) {
  if (!str) return "";

  str = cleanDate(str);

  let parts = str.split(/[\/\-\s]/).filter(Boolean);

  if (parts.length < 3) return "";

  let y = parts[0];
  let m = parts[1];
  let d = parts[2];

  m = m.padStart(2, "0");
  d = d.padStart(2, "0");

  if (y.length === 2) y = "20" + y;

  return `${y}-${m}-${d}`;
}
/* -----------------------------------------------------
   CSV Parsing
----------------------------------------------------- */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");

    rows.push({
      vessel: cols[0] || "",
      clearanceDate: parseDate(cols[1]),
      sailingTime: parseDate(cols[2]),
      port: cols[3] || "",
      arrivalDate: parseDate(cols[4]),
      quantity: cols[5] || "",

      // SO欄位：1=已給、其他=未給
      soStatus: cols[6] === "1" ? "done" : "pending",

      quarantineTime: cols[7] || "",
      drugNo: cols[8] || "",
      quarantineCertNo: cols[9] || "",
      stuffingDate: parseDate(cols[10]),

      // 電放單欄位
      telexStatus: cols[11] === "1" ? "done" : "pending"
    });
  }
  return rows;
}

/* -----------------------------------------------------
   Data Filtering + Searching
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
      row.drugNo.toLowerCase().includes(keyword) ||
      row.quarantineCertNo.toLowerCase().includes(keyword);

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

  // Sorting
  if (currentSortKey) {
    filteredData.sort((a, b) => {
      const va = a[currentSortKey] || "";
      const vb = b[currentSortKey] || "";
      return currentSortOrder === "asc"
        ? va.localeCompare(vb)
        : vb.localeCompare(va);
    });
  }

  renderTable();
  renderCalendar(); // 讓行事曆立即更新
}

/* -----------------------------------------------------
   Table Rendering
----------------------------------------------------- */
function renderTable() {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  filteredData.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.vessel}</td>
      <td>${row.clearanceDate || "—"}</td>
      <td>${row.sailingTime || "—"}</td>
      <td>${row.port}</td>
      <td>${row.arrivalDate || "—"}</td>
      <td>${row.quantity}</td>

      <td>${renderStatusChip(
        row.soStatus === "done" ? "ok" : "bad",
        row.soStatus === "done" ? t("statusSOdone") : t("statusSOpending")
      )}</td>

      <td>${row.quarantineTime || "—"}</td>
      <td>${row.drugNo || "—"}</td>
      <td>${row.quarantineCertNo || "—"}</td>
      <td>${row.stuffingDate || "—"}</td>

      <td>${renderStatusChip(
        row.telexStatus === "done" ? "ok" : "bad",
        row.telexStatus === "done"
          ? t("statusTelexDone")
          : t("statusTelexPending")
      )}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* -----------------------------------------------------
   Status Chip Rendering
----------------------------------------------------- */
function renderStatusChip(type, text) {
  return `
    <span class="chip chip-${type}">
      <span class="chip-dot"></span>
      ${text}
    </span>
  `;
}

/* -----------------------------------------------------
   Sorting Setup
----------------------------------------------------- */
function setupSorting() {
  document.querySelectorAll("th[data-sort-key]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sortKey;

      if (currentSortKey === key) {
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
   Calendar Rendering (Week / Month)
----------------------------------------------------- */
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (calendarView === "week") renderWeekView();
  else renderMonthView();
}

/* ---------- Week View ---------- */
function renderWeekView() {
  const grid = document.getElementById("calendar-grid");

  const start = startOfWeek(currentDate);
  const days = [...Array(7)].map((_, i) => addDays(start, i));

  // Header row (Mon–Sun)
  const header = document.createElement("div");
  header.className = "calendar-week";
  header.innerHTML = days
    .map(d => `<div class="calendar-weekday">${d.getMonth()+1}/${d.getDate()}</div>`)
    .join("");
  grid.appendChild(header);

  // Events row
  const row = document.createElement("div");
  row.className = "calendar-week";

  days.forEach(date => {
    const cell = document.createElement("div");
    cell.className = "calendar-week-cell";

    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    filteredData.forEach(item => {
      if (item.clearanceDate === formatDate(date)) {
        cell.innerHTML += `<div class="calendar-event event-clearance">${t("legendClearance")}</div>`;
      }
      if (item.sailingTime === formatDate(date)) {
        cell.innerHTML += `<div class="calendar-event event-sailing">${t("legendSailing")}</div>`;
      }
      if (item.arrivalDate === formatDate(date)) {
        cell.innerHTML += `<div class="calendar-event event-arrival">${t("legendArrival")}</div>`;
      }
    });

    row.appendChild(cell);
  });

  grid.appendChild(row);

  // Period label
  const label = document.getElementById("period-label");
  if (label) {
    label.textContent = `${formatDate(days[0])} - ${formatDate(days[6])}`;
  }
}

/* ---------- Month View ---------- */
function renderMonthView() {
  const grid = document.getElementById("calendar-grid");

  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const first = new Date(y, m, 1);

  const start = startOfWeek(first);
  const days = [...Array(42)].map((_, i) => addDays(start, i));

  const box = document.createElement("div");
  box.className = "calendar-month";

  days.forEach(date => {
    const cell = document.createElement("div");
    cell.className = "calendar-month-cell";

    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    filteredData.forEach(item => {
      if (item.clearanceDate === formatDate(date)) {
        cell.innerHTML += `<div class="calendar-event event-clearance">${t("legendClearance")}</div>`;
      }
      if (item.sailingTime === formatDate(date)) {
        cell.innerHTML += `<div class="calendar-event event-sailing">${t("legendSailing")}</div>`;
      }
      if (item.arrivalDate === formatDate(date)) {
        cell.innerHTML += `<div class="calendar-event event-arrival">${t("legendArrival")}</div>`;
      }
    });

    box.appendChild(cell);
  });

  grid.appendChild(box);

  const label = document.getElementById("period-label");
  if (label) {
    label.textContent = `${y}/${m+1}`;
  }
}

/* -----------------------------------------------------
   Date Helpers
----------------------------------------------------- */
function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

function startOfWeek(date) {
  const d = new Date(date);
  let day = d.getDay();
  if (day === 0) day = 7; // 星期天視為第 7 天

  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day + 1);
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(text) {
  if (!text) return "";
  // 支援 "2025/12/1 星期一"
  const cleaned = text.split(" ")[0].replace(/\//g, "-");
  return cleaned;
}

/* -----------------------------------------------------
   Initialization
----------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageToggle();
  applyTranslations();
  setupSorting();
  loadSheetData();

  // --- Search ---
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", applyFiltersAndRender);
  }

  // --- Filters ---
  const filterSO = document.getElementById("filter-so");
  if (filterSO) {
    filterSO.addEventListener("change", applyFiltersAndRender);
  }

  const filterTelex = document.getElementById("filter-telex");
  if (filterTelex) {
    filterTelex.addEventListener("change", applyFiltersAndRender);
  }

  // --- View Switch (table/calendar) ---
  const tabButtons = document.querySelectorAll(".tab-button");
  const views = document.querySelectorAll(".view");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const t = btn.dataset.target;

      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      views.forEach(v => v.classList.remove("active"));
      document.getElementById(t)?.classList.add("active");

      if (t === "calendar-view") renderCalendar();
    });
  });

  // --- Calendar Subtabs (week/month) ---
  const subtabButtons = document.querySelectorAll(".subtab-button");
  subtabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      calendarView = btn.dataset.calView;

      subtabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      renderCalendar();
    });
  });

  // --- Calendar Navigation ---
  document.getElementById("btn-prev-period")?.addEventListener("click", () => {
    currentDate = calendarView === "week"
      ? addDays(currentDate, -7)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    renderCalendar();
  });

  document.getElementById("btn-next-period")?.addEventListener("click", () => {
    currentDate = calendarView === "week"
      ? addDays(currentDate, 7)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    renderCalendar();
  });

  document.getElementById("btn-today")?.addEventListener("click", () => {
    currentDate = new Date();
    renderCalendar();
  });

  // Auto Refresh (3 mins)
  setInterval(loadSheetData, 3 * 60 * 1000);
});
