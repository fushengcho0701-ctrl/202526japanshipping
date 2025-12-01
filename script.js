// 主要資料
let allShipments = [];
let filteredShipments = [];
let sortState = { key: null, direction: "asc" }; // asc / desc
let currentCalendarView = "week"; // "week" or "month"
let currentWeekStart = getWeekStart(new Date());
let currentMonth = new Date(); // 月視圖用

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupFilterAndSearch();
  setupTableSorting();
  setupCalendarControls();
  setupModal();
  loadSheetData();

  // 每 3 分鐘自動更新
  setInterval(loadSheetData, 180000);
});

// 讀取 Google Sheet CSV
async function loadSheetData() {
  try {
    const res = await fetch(window.SHEET_CSV_URL);
    const csv = await res.text();
    allShipments = parseCsvToShipments(csv);
    applyFiltersAndRender();
  } catch (err) {
    console.error("載入 Google Sheet 失敗：", err);
    alert("無法載入 Google Sheet 資料，請確認 CSV 連結是否正確與公開。");
  }
}

// 轉換 CSV -> 陣列物件
function parseCsvToShipments(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== "");
  if (lines.length <= 1) return [];

  const rows = lines.map((line) => line.split(","));
  const dataRows = rows.slice(1); // 第 0 列是標題

  return dataRows
    .map((cols) => ({
      vessel: cols[0] || "",
      clearanceDate: cols[1] || "",
      sailingTime: cols[2] || "",
      port: cols[3] || "",
      arrivalDate: cols[4] || "",
      quantity: cols[5] || "",
      so: cols[6] || "",
      quarantineTime: cols[7] || "",
      drugNo: cols[8] || "",
      quarantineCertNo: cols[9] || "",
      stuffingDate: cols[10] || "",
      telexRelease: cols[11] || ""
    }))
    .filter((r) => r.vessel.trim() !== "");
}

// Tabs 切換
function setupTabs() {
  const buttons = document.querySelectorAll(".tab-button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const targetId = btn.getAttribute("data-target");
      document.querySelectorAll(".view").forEach((v) => {
        v.classList.toggle("active", v.id === targetId);
      });
    });
  });

  // Calendar 子 tab（週 / 月）
  const subButtons = document.querySelectorAll(".subtab-button");
  subButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      subButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCalendarView = btn.getAttribute("data-cal-view");

      renderCalendar();
    });
  });
}

// 搜尋與篩選
function setupFilterAndSearch() {
  const searchInput = document.getElementById("search-input");
  const filterSo = document.getElementById("filter-so");
  const filterTelex = document.getElementById("filter-telex");

  searchInput.addEventListener("input", applyFiltersAndRender);
  filterSo.addEventListener("change", applyFiltersAndRender);
  filterTelex.addEventListener("change", applyFiltersAndRender);
}

function applyFiltersAndRender() {
  const searchText = document.getElementById("search-input").value.trim().toLowerCase();
  const soFilter = document.getElementById("filter-so").value;
  const telexFilter = document.getElementById("filter-telex").value;

  filteredShipments = allShipments.filter((item) => {
    // 搜尋
    const searchTarget = [
      item.vessel,
      item.port,
      item.drugNo,
      item.quarantineCertNo
    ]
      .join(" ")
      .toLowerCase();

    if (searchText && !searchTarget.includes(searchText)) return false;

    // SO
    const hasSO = !!item.so.trim();
    if (soFilter === "done" && !hasSO) return false;
    if (soFilter === "pending" && hasSO) return false;

    // 電放單
    const hasTelex = !!item.telexRelease.trim();
    if (telexFilter === "done" && !hasTelex) return false;
    if (telexFilter === "pending" && hasTelex) return false;

    return true;
  });

  // 排序
  if (sortState.key) {
    filteredShipments.sort((a, b) => compareByKey(a, b, sortState.key));
    if (sortState.direction === "desc") {
      filteredShipments.reverse();
    }
  }

  renderTable();
  renderCalendar();
}

// 表格渲染
function renderTable() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  filteredShipments.forEach((item) => {
    const tr = document.createElement("tr");

    tr.appendChild(createCell(item.vessel));
    tr.appendChild(createCell(item.clearanceDate));
    tr.appendChild(createCell(item.sailingTime));
    tr.appendChild(createCell(item.port));
    tr.appendChild(createCell(item.arrivalDate));
    tr.appendChild(createCell(item.quantity));

    const soCell = document.createElement("td");
    const hasSO = !!item.so.trim();
    soCell.appendChild(
      createStatusChip(hasSO ? "已給 SO 訂艙單" : "尚未給 SO 訂艙單", hasSO)
    );
    tr.appendChild(soCell);

    tr.appendChild(createCell(item.quarantineTime));
    tr.appendChild(createCell(item.drugNo));
    tr.appendChild(createCell(item.quarantineCertNo));
    tr.appendChild(createCell(item.stuffingDate));

    const telexCell = document.createElement("td");
    const hasTelex = !!item.telexRelease.trim();
    telexCell.appendChild(
      createStatusChip(
        hasTelex ? "已給電放單" : "尚未給電放單",
        hasTelex
      )
    );
    tr.appendChild(telexCell);

    tbody.appendChild(tr);
  });
}

function createCell(text) {
  const td = document.createElement("td");
  td.textContent = text || "";
  return td;
}

function createStatusChip(text, isOk) {
  const span = document.createElement("span");
  span.className = "chip " + (isOk ? "chip-ok" : "chip-bad");
  const dot = document.createElement("span");
  dot.className = "chip-dot";
  const label = document.createElement("span");
  label.textContent = text;
  span.appendChild(dot);
  span.appendChild(label);
  return span;
}

// 排序

function setupTableSorting() {
  const headers = document.querySelectorAll("#shipment-table thead th");
  headers.forEach((th) => {
    const key = th.getAttribute("data-sort-key");
    if (!key) return;
    th.addEventListener("click", () => {
      const current = sortState.key === key ? sortState.direction : null;
      const nextDir = current === "asc" ? "desc" : "asc";
      sortState = { key, direction: nextDir };

      headers.forEach((h) => h.removeAttribute("data-sort-active"));
      th.setAttribute("data-sort-active", nextDir);

      applyFiltersAndRender();
    });
  });
}

function compareByKey(a, b, key) {
  switch (key) {
    case "vessel":
    case "port":
    case "drugNo":
    case "quarantineCertNo":
      return (a[key] || "").localeCompare(b[key] || "");
    case "quantity":
      return (Number(a[key]) || 0) - (Number(b[key]) || 0);
    case "clearanceDate":
      return dateCompare(a.clearanceDate, b.clearanceDate);
    case "arrivalDate":
      return dateCompare(a.arrivalDate, b.arrivalDate);
    case "sailingTime":
      return dateTimeCompare(a.sailingTime, b.sailingTime);
    case "soStatus": {
      const as = a.so.trim() ? 1 : 0;
      const bs = b.so.trim() ? 1 : 0;
      return as - bs;
    }
    case "telexStatus": {
      const at = a.telexRelease.trim() ? 1 : 0;
      const bt = b.telexRelease.trim() ? 1 : 0;
      return at - bt;
    }
    default:
      return 0;
  }
}

function dateCompare(aStr, bStr) {
  const a = parseDate(aStr);
  const b = parseDate(bStr);
  const aTime = a ? a.getTime() : 0;
  const bTime = b ? b.getTime() : 0;
  return aTime - bTime;
}

function dateTimeCompare(aStr, bStr) {
  const a = parseDateTime(aStr);
  const b = parseDateTime(bStr);
  const aTime = a ? a.getTime() : 0;
  const bTime = b ? b.getTime() : 0;
  return aTime - bTime;
}

// Calendar 控制與渲染

function setupCalendarControls() {
  document.getElementById("btn-prev-period").addEventListener("click", () => {
    if (currentCalendarView === "week") {
      currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    } else {
      currentMonth.setMonth(currentMonth.getMonth() - 1);
    }
    renderCalendar();
  });

  document.getElementById("btn-next-period").addEventListener("click", () => {
    if (currentCalendarView === "week") {
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    } else {
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    renderCalendar();
  });

  document.getElementById("btn-today").addEventListener("click", () => {
    if (currentCalendarView === "week") {
      currentWeekStart = getWeekStart(new Date());
    } else {
      currentMonth = new Date();
    }
    renderCalendar();
  });
}

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  if (currentCalendarView === "week") {
    renderWeekView(grid);
  } else {
    renderMonthView(grid);
  }
}

// 週視圖
function renderWeekView(grid) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const periodLabel = document.getElementById("period-label");
  periodLabel.textContent =
    formatDate(currentWeekStart) + " ~ " + formatDate(days[6]);

  const headerRow = document.createElement("div");
  headerRow.className = "calendar-row calendar-header-row";

  const labelCell = document.createElement("div");
  labelCell.className = "calendar-label";
  labelCell.textContent = "";
  headerRow.appendChild(labelCell);

  const weekDayNames = ["日", "一", "二", "三", "四", "五", "六"];

  days.forEach((d) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    const spanName = document.createElement("span");
    spanName.className = "day-name";
    spanName.textContent = "週" + weekDayNames[d.getDay()];
    const spanDate = document.createElement("span");
    spanDate.className = "day-date";
    spanDate.textContent =
      d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
    cell.appendChild(spanName);
    cell.appendChild(spanDate);
    headerRow.appendChild(cell);
  });

  grid.appendChild(headerRow);

  // 整天列：結關 & 抵達
  const allDayRow = document.createElement("div");
  allDayRow.className = "calendar-row";
  const allDayLabel = document.createElement("div");
  allDayLabel.className = "calendar-label";
  allDayLabel.textContent = "整天";
  allDayRow.appendChild(allDayLabel);

  days.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    filteredShipments.forEach((item) => {
      const clearanceDate = parseDate(item.clearanceDate);
      const arrivalDate = parseDate(item.arrivalDate);

      if (isSameDay(clearanceDate, day)) {
        const pill = createEventPill(item, "結關", "event-clearance");
        cell.appendChild(pill);
      }
      if (isSameDay(arrivalDate, day)) {
        const pill = createEventPill(item, "抵達", "event-arrival");
        cell.appendChild(pill);
      }
    });

    allDayRow.appendChild(cell);
  });

  grid.appendChild(allDayRow);

  // 開船時間列
  const sailRow = document.createElement("div");
  sailRow.className = "calendar-row";
  const sailLabel = document.createElement("div");
  sailLabel.className = "calendar-label";
  sailLabel.textContent = "開船";
  sailRow.appendChild(sailLabel);

  days.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    filteredShipments.forEach((item) => {
      const sailingDateTime = parseDateTime(item.sailingTime);
      if (sailingDateTime && isSameDay(sailingDateTime, day)) {
        const timeStr =
          pad2(sailingDateTime.getHours()) +
          ":" +
          pad2(sailingDateTime.getMinutes());
        const pill = createEventPill(
          item,
          `開船 ${timeStr}`,
          "event-sailing"
        );
        cell.appendChild(pill);
      }
    });

    sailRow.appendChild(cell);
  });

  grid.appendChild(sailRow);
}

// 月視圖
function renderMonthView(grid) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-based
  const firstDayOfMonth = new Date(year, month, 1);
  const startDate = getCalendarMonthStart(firstDayOfMonth);

  const periodLabel = document.getElementById("period-label");
  periodLabel.textContent = `${year} 年 ${month + 1} 月`;

  const weekDayNames = ["日", "一", "二", "三", "四", "五", "六"];
  const headerRow = document.createElement("div");
  headerRow.className = "calendar-row calendar-header-row";

  const labelEmpty = document.createElement("div");
  labelEmpty.className = "calendar-label";
  labelEmpty.textContent = "";
  headerRow.appendChild(labelEmpty);

  for (let i = 0; i < 7; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    const spanName = document.createElement("span");
    spanName.className = "day-name";
    spanName.textContent = "週" + weekDayNames[i];
    cell.appendChild(spanName);
    headerRow.appendChild(cell);
  }

  grid.appendChild(headerRow);

  const monthGrid = document.createElement("div");
  monthGrid.className = "month-grid";

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);
    const cell = document.createElement("div");
    cell.className = "month-cell";

    const header = document.createElement("div");
    header.className = "month-cell-header";

    const dateSpan = document.createElement("span");
    dateSpan.className = "month-cell-date";
    if (cellDate.getMonth() !== month) {
      dateSpan.classList.add("month-cell-date--muted");
    }
    dateSpan.textContent = cellDate.getDate();

    header.appendChild(dateSpan);
    cell.appendChild(header);

    const eventsContainer = document.createElement("div");
    eventsContainer.className = "month-cell-events";

    filteredShipments.forEach((item) => {
      const clearanceDate = parseDate(item.clearanceDate);
      const arrivalDate = parseDate(item.arrivalDate);
      const sailingDateTime = parseDateTime(item.sailingTime);

      if (isSameDay(clearanceDate, cellDate)) {
        eventsContainer.appendChild(
          createEventPill(item, "結關", "event-clearance")
        );
      }
      if (isSameDay(arrivalDate, cellDate)) {
        eventsContainer.appendChild(
          createEventPill(item, "抵達", "event-arrival")
        );
      }
      if (sailingDateTime && isSameDay(sailingDateTime, cellDate)) {
        const timeStr =
          pad2(sailingDateTime.getHours()) +
          ":" +
          pad2(sailingDateTime.getMinutes());
        eventsContainer.appendChild(
          createEventPill(item, `開船 ${timeStr}`, "event-sailing")
        );
      }
    });

    cell.appendChild(eventsContainer);
    monthGrid.appendChild(cell);
  }

  grid.appendChild(monthGrid);
}

// 建立事件 pill + 綁定 modal
function createEventPill(item, label, eventClass) {
  const div = document.createElement("div");
  div.className = "event-pill " + eventClass;
  div.innerHTML = `<strong>${item.vessel}</strong> <small>${label}</small>`;
  div.addEventListener("click", () => openDetailModal(item, label));
  return div;
}

// Modal

function setupModal() {
  const backdrop = document.getElementById("detail-modal-backdrop");
  const closeBtn = document.getElementById("modal-close-btn");

  closeBtn.addEventListener("click", () => {
    backdrop.classList.remove("active");
  });

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove("active");
    }
  });
}

function openDetailModal(item, eventLabel) {
  const backdrop = document.getElementById("detail-modal-backdrop");
  const titleEl = document.getElementById("modal-title");
  const listEl = document.getElementById("modal-detail-list");

  titleEl.textContent = `${item.vessel} (${eventLabel})`;
  listEl.innerHTML = "";

  const fields = [
    ["船班", item.vessel],
    ["結關日", item.clearanceDate],
    ["實際開船時間", item.sailingTime],
    ["抵達港口", item.port],
    ["抵達日", item.arrivalDate],
    ["訂櫃數量", item.quantity],
    ["SO", item.so || "(尚未給)"],
    ["申請檢疫官到場時間", item.quarantineTime],
    ["藥務號", item.drugNo],
    ["檢疫證號碼", item.quarantineCertNo],
    ["實際裝櫃日", item.stuffingDate],
    ["電放單", item.telexRelease || "(尚未給)"]
  ];

  fields.forEach(([label, value]) => {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value || "";
    listEl.appendChild(dt);
    listEl.appendChild(dd);
  });

  backdrop.classList.add("active");
}

// 日期工具

function parseDate(str) {
  if (!str) return null;
  let s = String(str).trim();
  s = s.split(" ")[0]; // 移除星期或多餘文字
  const d = new Date(s.replace(/-/g, "/"));
  return isNaN(d.getTime()) ? null : d;
}

function parseDateTime(str) {
  if (!str) return null;
  let s = String(str).trim();
  const d = new Date(s.replace(/-/g, "/"));
  return isNaN(d.getTime()) ? null : d;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0(日) - 6(六)
  const diff = (day + 6) % 7; // 讓週一為起點
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getCalendarMonthStart(firstDayOfMonth) {
  const d = new Date(firstDayOfMonth);
  const day = d.getDay(); // 0(日) - 6(六)
  d.setDate(d.getDate() - day); // 以星期日為第一格
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d) {
  return d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
}

function pad2(num) {
  return num.toString().padStart(2, "0");
}
