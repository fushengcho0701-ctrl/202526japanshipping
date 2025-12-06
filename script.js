/* =============================================
   V107 — 行事曆支援「開船＋抵達 / 僅開船」切換
   ============================================= */

let rawData = [];
let filteredData = [];
let currentSortKey = "arrivalDate";
let currentSortOrder = "asc";
let currentLang = localStorage.getItem("lang") || "zh";

let calendarView = "week";
let currentDate = new Date();
let calendarDisplay = "both"; // both | sailing

/* -------------------------------
   語言包（保持你的內容）
------------------------------- */
const i18n = {
  zh: {
    appTitle: "船班訂艙與檢疫追蹤系統",
    appSubtitle: "同步 Google Sheet，讓報關行即時掌握船班與文件狀態",

    tableTitle: "船班列表",
    tableDesc: "點欄位標題可排序",
    hintSource: "資料來源：Google Sheet（唯讀）",

    colVessel: "船班",
    colContainerNo: "櫃次",
    colClearanceDate: "結關日",
    colSailingTime: "實際開船時間",
    colLoadingTime: "裝櫃時間",
    colPort: "抵達港口",
    colArrivalDate: "抵達日",
    colSOstatus: "SO 狀態",
    colQuarantineTime: "檢疫官時間",
    colDrugNo: "藥務號",
    colQuarantineCertNo: "檢疫證號",
    colTelexStatus: "電放單",

    legendSailing: "開船",
    legendArrival: "抵達",
  }
};

/* -----------------------------
   Helper：翻譯
----------------------------- */
function t(key) {
  return i18n[currentLang][key] || key;
}

/* -----------------------------
   日期解析（含時間）
----------------------------- */
function parseDate(d) {
  if (!d) return null;

  // 支援格式：2025/12/11 9:00
  let clean = d.replace("星期一", "")
               .replace("星期二", "")
               .replace("星期三", "")
               .replace("星期四", "")
               .replace("星期五", "")
               .replace("星期六", "")
               .replace("星期日", "")
               .trim();

  const dt = new Date(clean);
  return isNaN(dt) ? null : dt;
}
/* ======================================================
   解析 Google Sheet CSV
====================================================== */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");

    rows.push({
      vessel: cols[0] || "",           // 船班
      containerNo: cols[1] || "",      // 櫃次（第 1 櫃 / 2 / 3）
      clearanceDate: parseDate(cols[2]),
      sailingDate: parseDate(cols[3]),
      loadingDate: parseDate(cols[4]),
      port: cols[5] || "",
      arrivalDate: parseDate(cols[6]),
      soStatus: cols[7] === "1" ? "done" : "pending",
      quarantineTime: cols[8] || "",
      drugNo: cols[9] || "",
      quarantineCertNo: cols[10] || "",
      telexStatus: cols[11] === "1" ? "done" : "pending",
    });
  }

  return rows;
}

/* ======================================================
   載入資料
====================================================== */
async function loadSheetData() {
  try {
    const res = await fetch(window.SHEET_CSV_URL);
    const csv = await res.text();

    rawData = parseCSV(csv);

    // 預設依「抵達日」排序
    rawData.sort((a, b) => {
      if (!a.arrivalDate) return 1;
      if (!b.arrivalDate) return -1;
      return a.arrivalDate - b.arrivalDate;
    });

    applyFiltersAndRender();
    renderCalendar();

  } catch (e) {
    console.error("CSV 載入失敗", e);
  }
}

/* ======================================================
   篩選 + 搜尋
====================================================== */
function applyFiltersAndRender() {
  const keyword = document.getElementById("search-input").value.toLowerCase();
  const soFilter = document.getElementById("filter-so").value;
  const telexFilter = document.getElementById("filter-telex").value;

  filteredData = rawData.filter((row) => {
    const matchKeyword =
      row.vessel.toLowerCase().includes(keyword) ||
      row.port.toLowerCase().includes(keyword) ||
      row.drugNo.toLowerCase().includes(keyword);

    const matchSO =
      soFilter === "all" ||
      (soFilter === "done" && row.soStatus === "done") ||
      (soFilter === "pending" && row.soStatus === "pending");

    const matchTelex =
      telexFilter === "all" ||
      (telexFilter === "done" && row.telexStatus === "done") ||
      (telexFilter === "pending" && row.telexStatus === "pending");

    return matchKeyword && matchSO && matchTelex;
  });

  renderTable();
}

/* ======================================================
   表格渲染
====================================================== */
function renderTable() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  filteredData.forEach((row) => {
    const tr = document.createElement("tr");

    const multipleContainers = getMaxContainerCount(row.vessel);

    tr.innerHTML = `
      <td>
        ${row.vessel}
        ${multipleContainers > 1 ? `<div class="table-note">⚠ 此船需訂 ${multipleContainers} 櫃</div>` : ""}
      </td>

      <td>${row.containerNo}</td>
      <td>${formatDisplayDate(row.clearanceDate)}</td>
      <td>${formatDisplayDate(row.sailingDate, true)}</td>
      <td>${formatDisplayDate(row.loadingDate, true)}</td>
      <td>${row.port}</td>
      <td>${formatDisplayDate(row.arrivalDate)}</td>

      <td>${renderStatusChip(row.soStatus)}</td>
      <td>${row.quarantineTime || "—"}</td>
      <td>${row.drugNo || "—"}</td>
      <td>${row.quarantineCertNo || "—"}</td>
      <td>${renderStatusChip(row.telexStatus)}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* ======================================================
   Chip 顯示（SO / 電放單）
====================================================== */
function renderStatusChip(status) {
  if (status === "done") return `<span class="chip chip-ok">✔</span>`;
  return `<span class="chip chip-bad">—</span>`;
}

/* ======================================================
   找此船最大櫃次
====================================================== */
function getMaxContainerCount(vesselName) {
  const numbers = rawData
    .filter((r) => r.vessel === vesselName)
    .map((r) => parseInt(r.containerNo))
    .filter((n) => !isNaN(n));

  return numbers.length ? Math.max(...numbers) : 1;
}

/* ======================================================
   日期顯示格式化
====================================================== */
function formatDisplayDate(dateObj, showTime = false) {
  if (!dateObj) return "—";

  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");

  if (!showTime) return `${y}/${m}/${d}`;

  const hh = String(dateObj.getHours()).padStart(2, "0");
  const mm = String(dateObj.getMinutes()).padStart(2, "0");

  return `${y}/${m}/${d} ${hh}:${mm}`;
}
/* ======================================================
   Calendar Render
  （支援兩種模式：both = 開船＋抵達、 sailing = 只顯示開船）
====================================================== */

let calendarMode = "both"; // default

function renderCalendar() {
  const container = document.getElementById("calendar-grid");
  container.innerHTML = "";

  const view = document.querySelector(".subtab-button.active").dataset.calView;

  if (view === "week") {
    renderWeekView(container);
  } else {
    renderMonthView(container);
  }
}

/* ---------- Prepare event data ---------- */
function getCalendarEvents() {
  return filteredData.map((row) => ({
    vessel: row.vessel,
    containerNo: row.containerNo,
    clearance: row.clearanceDate,
    sailing: row.sailingDate,
    arrival: row.arrivalDate,
    port: row.port,
    raw: row,
  }));
}

/* ======================================================
   Week View
====================================================== */
function renderWeekView(container) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const events = getCalendarEvents();

  // Weekday header
  const headerRow = document.createElement("div");
  headerRow.className = "calendar-week";

  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];

  for (let i = 0; i < 7; i++) {
    const h = document.createElement("div");
    h.className = "calendar-weekday";
    h.textContent = dayNames[i];
    headerRow.appendChild(h);
  }
  container.appendChild(headerRow);

  // Cells row
  const cellRow = document.createElement("div");
  cellRow.className = "calendar-week";

  for (let i = 0; i < 7; i++) {
    const cellDate = new Date(start);
    cellDate.setDate(start.getDate() + i);

    const cell = document.createElement("div");
    cell.className = "calendar-week-cell";
    cell.innerHTML = `<div class="day-number">${cellDate.getDate()}</div>`;

    // place events
    events.forEach((ev) => {
      const addEvent = (date, type) => {
        if (!date) return;
        if (
          date.getFullYear() === cellDate.getFullYear() &&
          date.getMonth() === cellDate.getMonth() &&
          date.getDate() === cellDate.getDate()
        ) {
          addCalendarEvent(cell, ev, type);
        }
      };

      if (calendarMode === "both") {
        addEvent(ev.sailing, "sailing");
        addEvent(ev.arrival, "arrival");
      } else if (calendarMode === "sailing") {
        addEvent(ev.sailing, "sailing");
      }
    });

    cellRow.appendChild(cell);
  }
  container.appendChild(cellRow);

  updatePeriodLabel(start, end);
}

/* ======================================================
   Month View
====================================================== */
function renderMonthView(container) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDay = first.getDay();

  const events = getCalendarEvents();

  // Number of cells = 42 (6 weeks)
  const totalCells = 42;

  const grid = document.createElement("div");
  grid.className = "calendar-month";

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-month-cell";

    const date = new Date(first);
    date.setDate(i - firstDay + 1);

    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    // place events
    events.forEach((ev) => {
      const addEvent = (d, type) => {
        if (!d) return;
        if (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        ) {
          addCalendarEvent(cell, ev, type);
        }
      };

      if (calendarMode === "both") {
        addEvent(ev.sailing, "sailing");
        addEvent(ev.arrival, "arrival");
      } else if (calendarMode === "sailing") {
        addEvent(ev.sailing, "sailing");
      }
    });

    grid.appendChild(cell);
  }

  container.appendChild(grid);

  const end = new Date(first);
  end.setDate(first.getDate() + 41);

  updatePeriodLabel(first, end);
}

/* ======================================================
   Create Event Chip
====================================================== */
function addCalendarEvent(cell, ev, type) {
  const div = document.createElement("div");
  div.className = `calendar-event event-${type}`;
  div.textContent =
    type === "sailing"
      ? `🚢 ${ev.vessel}（櫃 ${ev.containerNo}）`
      : `🏁 ${ev.vessel}（櫃 ${ev.containerNo}）`;

  div.addEventListener("click", () => openModal(ev.raw));

  cell.appendChild(div);
}

/* ======================================================
   Period Label
====================================================== */
function updatePeriodLabel(start, end) {
  const label = document.getElementById("period-label");

  const s = `${start.getMonth() + 1}/${start.getDate()}`;
  const e = `${end.getMonth() + 1}/${end.getDate()}`;

  label.textContent = `${s} - ${e}`;
}

/* ======================================================
   Modal
====================================================== */
function openModal(row) {
  const modal = document.getElementById("detail-modal-backdrop");
  const list = document.getElementById("modal-detail-list");
  const title = document.getElementById("modal-title");

  title.textContent = `${row.vessel}（櫃 ${row.containerNo}）`;

  list.innerHTML = `
    <dt>結關日</dt><dd>${formatDisplayDate(row.clearanceDate)}</dd>
    <dt>開船時間</dt><dd>${formatDisplayDate(row.sailingDate, true)}</dd>
    <dt>裝櫃時間</dt><dd>${formatDisplayDate(row.loadingDate, true)}</dd>
    <dt>抵達港口</dt><dd>${row.port}</dd>
    <dt>抵達日</dt><dd>${formatDisplayDate(row.arrivalDate)}</dd>
    <dt>藥務號</dt><dd>${row.drugNo || "—"}</dd>
    <dt>檢疫證號碼</dt><dd>${row.quarantineCertNo || "—"}</dd>
    <dt>SO</dt><dd>${row.soStatus === "done" ? "✔ 已給" : "— 尚未給"}</dd>
    <dt>電放單</dt><dd>${row.telexStatus === "done" ? "✔ 已給" : "— 尚未給"}</dd>
  `;

  modal.classList.add("active");
}

document.getElementById("modal-close-btn").addEventListener("click", () => {
  document.getElementById("detail-modal-backdrop").classList.remove("active");
});

/* ======================================================
   Calendar Mode Toggle (A=both / B=sailing only)
====================================================== */
function setupCalendarModeToggle() {
  const btnBoth = document.getElementById("btn-cal-both");
  const btnSailing = document.getElementById("btn-cal-sailing");

  btnBoth.addEventListener("click", () => {
    calendarMode = "both";
    btnBoth.classList.add("active");
    btnSailing.classList.remove("active");
    renderCalendar();
  });

  btnSailing.addEventListener("click", () => {
    calendarMode = "sailing";
    btnSailing.classList.add("active");
    btnBoth.classList.remove("active");
    renderCalendar();
  });
}

/* ======================================================
   Initialization
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageToggle();
  applyTranslations();

  setupSorting();
  loadSheetData();

  setupCalendarModeToggle();

  document.getElementById("search-input").addEventListener("input", applyFiltersAndRender);
  document.getElementById("filter-so").addEventListener("change", applyFiltersAndRender);
  document.getElementById("filter-telex").addEventListener("change", applyFiltersAndRender);

  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      document.getElementById(btn.dataset.target).classList.add("active");

      if (btn.dataset.target === "calendar-view") renderCalendar();
    });
  });

  document.querySelectorAll(".subtab-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".subtab-button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCalendar();
    });
  });
});
