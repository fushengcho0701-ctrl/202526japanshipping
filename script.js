/* ============================================================
   v107 — 船班系統主程式
   - 表格渲染
   - 行事曆渲染（週/月）
   - Modal 詳細資料
   - 語言切換
   - 開船/抵達顯示切換（A：兩種；B：僅開船）
============================================================ */

/* ============================================================
   全域變數
============================================================ */
let rawData = [];
let filteredData = [];
let currentSortKey = null;
let currentSortDir = "asc";

let calendarView = "week"; // 週 / 月
let currentDate = new Date();

let calendarMode = "both"; 
// both = 顯示開船 + 抵達
// sailing = 顯示開船（只顯示一種事件）


/* ============================================================
   日期解析：允許「2025/12/14 7:00」「2025/12/14」
============================================================ */
function parseRawDate(str) {
  if (!str || str.trim() === "") return null;

  // 移除星期（如：星期一）
  str = str.replace(/星期.*/, "").trim();

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(date, withTime = false) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  if (!withTime) return `${y}/${m}/${d}`;

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  return `${y}/${m}/${d} ${hh}:${mm}`;
}


/* ============================================================
   讀取 Google Sheet CSV
============================================================ */
async function loadSheetData() {
  try {
    const response = await fetch(window.SHEET_CSV_URL);
    const csvText = await response.text();
    const rows = csvText.split("\n").map(r => r.split(","));

    const headers = rows.shift();

    rawData = rows
      .map(row => {
        if (row.length < 12) return null;

        return {
          vessel: row[0].trim(),
          containerNo: Number(row[1].trim()) || 1,
          clearanceDate: parseRawDate(row[2]),
          sailingDate: parseRawDate(row[3]),
          loadingDate: parseRawDate(row[4]),
          port: row[5].trim(),
          arrivalDate: parseRawDate(row[6]),
          soStatus: row[7].trim(),
          quarantineTime: row[8].trim(),
          drugNo: row[9].trim(),
          quarantineCertNo: row[10].trim(),
          telexStatus: row[11].trim()
        };
      })
      .filter(x => x);

    filteredData = [...rawData];

    applyFiltersAndRender();
  } catch (err) {
    console.error("載入 Google Sheet 失敗：", err);
  }
}


/* ============================================================
   搜尋 + 篩選 + 重繪
============================================================ */
function applyFiltersAndRender() {
  const kw = document.getElementById("search-input").value.trim();

  const soFilter = document.getElementById("filter-so").value;
  const telexFilter = document.getElementById("filter-telex").value;

  filteredData = rawData.filter(item => {
    let keep = true;

    // 搜尋
    if (kw) {
      const text = JSON.stringify(item);
      if (!text.includes(kw)) keep = false;
    }

    // SO 狀態
    if (soFilter === "done" && !item.soStatus) keep = false;
    if (soFilter === "pending" && item.soStatus) keep = false;

    // 電放單狀態
    if (telexFilter === "done" && !item.telexStatus) keep = false;
    if (telexFilter === "pending" && item.telexStatus) keep = false;

    return keep;
  });

  if (currentSortKey) {
    sortData(currentSortKey);
  }

  renderTable(filteredData);
  renderCalendar();
}


/* ============================================================
   表格渲染
============================================================ */
function renderTable(data) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  data.forEach(item => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        ${item.vessel}
      </td>
      <td>${item.containerNo}</td>
      <td>${formatDate(item.clearanceDate)}</td>
      <td>${formatDate(item.sailingDate, true)}</td>
      <td>${formatDate(item.loadingDate, true)}</td>
      <td>${item.port}</td>
      <td>${formatDate(item.arrivalDate)}</td>
      <td>${item.soStatus ? renderChip(true) : renderChip(false)}</td>
      <td>${item.quarantineTime}</td>
      <td>${item.drugNo}</td>
      <td>${item.quarantineCertNo}</td>
      <td>${item.telexStatus ? renderChip(true) : renderChip(false)}</td>
    `;

    // 多櫃提醒（只有 containerNo > 1 時顯示）
    const maxContainer = getMaxContainerCount(item.vessel);

    if (maxContainer > 1) {
      const note = document.createElement("div");
      note.className = "table-note";
      note.textContent = `⚠ 此船班共需 ${maxContainer} 櫃`;
      tr.children[0].appendChild(note);
    }

    tbody.appendChild(tr);
  });
}

function getMaxContainerCount(vesselName) {
  const list = rawData.filter(x => x.vessel === vesselName);
  return Math.max(...list.map(x => x.containerNo));
}

function renderChip(ok) {
  return `
    <span class="chip ${ok ? "chip-ok" : "chip-bad"}">
      <span class="chip-dot"></span>${ok ? "已給" : "未給"}
    </span>
  `;
}


/* ============================================================
   排序
============================================================ */
function setupSorting() {
  document.querySelectorAll("th[data-sort-key]").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.sortKey;

      if (currentSortKey === key) {
        currentSortDir = currentSortDir === "asc" ? "desc" : "asc";
      } else {
        currentSortKey = key;
        currentSortDir = "asc";
      }

      sortData(key);
      renderTable(filteredData);

      document.querySelectorAll("th").forEach(h => h.removeAttribute("data-sort-active"));
      th.setAttribute("data-sort-active", currentSortDir);
    });
  });
}

function sortData(key) {
  filteredData.sort((a, b) => {
    let v1 = a[key], v2 = b[key];

    if (v1 instanceof Date) v1 = v1?.getTime() || 0;
    if (v2 instanceof Date) v2 = v2?.getTime() || 0;

    if (v1 < v2) return currentSortDir === "asc" ? -1 : 1;
    if (v1 > v2) return currentSortDir === "asc" ? 1 : -1;
    return 0;
  });
}


/* ============================================================
   行事曆主渲染
============================================================ */
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  if (calendarView === "week") {
    renderWeekCalendar();
  } else {
    renderMonthCalendar();
  }
}


/* ============================================================
   建立行事曆事件（含開船 / 抵達切換）
============================================================ */
function createCalendarEvent(type, text, dateStr, detail) {

  // ⭐ A/B 切換模式：只顯示開船
  if (calendarMode === "sailing" && type !== "sailing") {
    return null;
  }

  const div = document.createElement("div");
  div.className = `calendar-event event-${type}`;
  div.textContent = text;

  div.addEventListener("click", () => {
    openDetailModal(detail);
  });

  return div;
}


/* ============================================================
   Week view
============================================================ */
function renderWeekCalendar() {
  const grid = document.getElementById("calendar-grid");

  const start = new Date(currentDate);
  start.setDate(start.getDate() - start.getDay()); // 本週日開始

  const header = document.createElement("div");
  header.className = "calendar-week";

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  weekdays.forEach(d => {
    const div = document.createElement("div");
    div.className = "calendar-weekday";
    div.textContent = d;
    header.appendChild(div);
  });

  grid.appendChild(header);

  const body = document.createElement("div");
  body.className = "calendar-week";

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);

    const cell = document.createElement("div");
    cell.className = "calendar-week-cell";

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = day.getDate();
    cell.appendChild(num);

    // 加入事件
    rawData.forEach(row => {
      if (row.sailingDate && sameDate(row.sailingDate, day)) {
        const ev = createCalendarEvent(
          "sailing",
          `${row.vessel}（${row.containerNo}）開船`,
          row.sailingDate,
          row
        );
        if (ev) cell.appendChild(ev);
      }

      if (row.arrivalDate && sameDate(row.arrivalDate, day)) {
        const ev = createCalendarEvent(
          "arrival",
          `${row.vessel}（${row.containerNo}）抵達`,
          row.arrivalDate,
          row
        );
        if (ev) cell.appendChild(ev);
      }
    });

    body.appendChild(cell);
  }

  grid.appendChild(body);
}


/* ============================================================
   Month view
============================================================ */
function renderMonthCalendar() {
  const grid = document.getElementById("calendar-grid");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const total = 42; // 6 週

  const wrapper = document.createElement("div");
  wrapper.className = "calendar-month";

  for (let i = 0; i < total; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);

    const cell = document.createElement("div");
    cell.className = "calendar-month-cell";

    if (day.getMonth() !== month) {
      cell.style.opacity = "0.45";
    }

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = day.getDate();
    cell.appendChild(num);

    // 加入事件
    rawData.forEach(row => {
      if (row.sailingDate && sameDate(row.sailingDate, day)) {
        const ev = createCalendarEvent(
          "sailing",
          `${row.vessel}（${row.containerNo}）開船`,
          row.sailingDate,
          row
        );
        if (ev) cell.appendChild(ev);
      }

      if (row.arrivalDate && sameDate(row.arrivalDate, day)) {
        const ev = createCalendarEvent(
          "arrival",
          `${row.vessel}（${row.containerNo}）抵達`,
          row.arrivalDate,
          row
        );
        if (ev) cell.appendChild(ev);
      }
    });

    wrapper.appendChild(cell);
  }

  grid.appendChild(wrapper);
}


/* ============================================================
   比對日期
============================================================ */
function sameDate(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}


/* ============================================================
   詳細資料 Modal
============================================================ */
function openDetailModal(row) {
  const modal = document.getElementById("detail-modal-backdrop");
  const title = document.getElementById("modal-title");
  const list = document.getElementById("modal-detail-list");

  modal.classList.add("active");
  title.textContent = `${row.vessel}（櫃 ${row.containerNo}）`;

  list.innerHTML = `
    <dt>結關日</dt><dd>${formatDate(row.clearanceDate)}</dd>
    <dt>開船時間</dt><dd>${formatDate(row.sailingDate, true)}</dd>
    <dt>裝櫃時間</dt><dd>${formatDate(row.loadingDate, true)}</dd>
    <dt>抵達港口</dt><dd>${row.port}</dd>
    <dt>抵達日</dt><dd>${formatDate(row.arrivalDate)}</dd>
    <dt>SO</dt><dd>${row.soStatus || "未給"}</dd>
    <dt>申請檢疫官到場時間</dt><dd>${row.quarantineTime}</dd>
    <dt>藥務號</dt><dd>${row.drugNo}</dd>
    <dt>檢疫證號碼</dt><dd>${row.quarantineCertNo}</dd>
    <dt>電放單</dt><dd>${row.telexStatus || "未給"}</dd>
  `;
}

document.getElementById("modal-close-btn").addEventListener("click", () => {
  document.getElementById("detail-modal-backdrop").classList.remove("active");
});


/* ============================================================
   語言切換（保留）
============================================================ */
function setupLanguageToggle() {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}


/* ============================================================
   🔥 開船 / 抵達切換按鈕功能
============================================================ */
function setupCalendarModeToggle() {
  const btnBoth = document.getElementById("btn-cal-both");
  const btnSailing = document.getElementById("btn-cal-sailing");

  if (!btnBoth || !btnSailing) {
    console.warn("未找到切換按鈕");
    return;
  }

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


/* ============================================================
   初始化
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageToggle();
  setupSorting();
  setupCalendarModeToggle();   // ⭐ 必須有！
  loadSheetData();
});
