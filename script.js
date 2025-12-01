// i18n setup
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
    tableDesc: "點欄位標題可排序，SO / 電放單會自動判斷是否已提供。",
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
    calDesc: "可切換週 / 月視圖，顏色區分結關、開船、抵達時間。",
    calWeekView: "週視圖",
    calMonthView: "月視圖",
    btnToday: "今天",
    legendClearance: "結關日",
    legendSailing: "實際開船時間",
    legendArrival: "抵達日",
    footerSource: "資料來源：Google Sheet（唯讀）",
    footerAutoRefresh: "頁面將自動每 3 分鐘重新整理資料",
    searchPlaceholder: "搜尋船名、船班、港口、藥務號、檢疫證號...",
    weekPrefix: "週",
    alldayRowLabel: "整天",
    sailingRowLabel: "開船",
    weekdayNames: ["日", "一", "二", "三", "四", "五", "六"],
    soProvided: "SO（出貨指示書）已提供",
    soNotProvided: "SO（出貨指示書）尚未提供",
    telexProvided: "電放（Telex Release）已指示",
    telexNotProvided: "電放（Telex Release）尚未指示",
    eventClearanceShort: "結關",
    eventArrivalShort: "抵達",
    eventSailingShort: "開船",
    modalFieldVessel: "船班",
    modalFieldClearanceDate: "結關日",
    modalFieldSailingTime: "實際開船時間",
    modalFieldPort: "抵達港口",
    modalFieldArrivalDate: "抵達日",
    modalFieldQuantity: "訂櫃數量",
    modalFieldSO: "SO",
    modalFieldQuarantineTime: "申請檢疫官到場時間",
    modalFieldDrugNo: "藥務號",
    modalFieldCertNo: "檢疫證號碼",
    modalFieldStuffingDate: "實際裝櫃日",
    modalFieldTelex: "電放單",
    modalSOEmpty: "(尚未給)",
    modalTelexEmpty: "(尚未給)",
    periodYearSuffix: "年",
    periodMonthSuffix: "月",
    between: " ~ "
  },
  ja: {
    appTitle: "船舶ブッキング・検疫管理システム",
    appSubtitle: "Googleスプレッドシートと連携し、通関業者が船積み状況と書類状況を即時把握できます。",
    badgeReadonly: "閲覧専用・自動更新",
    tabTable: "表形式ビュー",
    tabCalendar: "カレンダービュー",
    filterSO: "SO ステータス：",
    filterTelex: "電放ステータス：",
    filterAll: "すべて",
    filterSOdone: "SO 提出済み",
    filterSOpending: "SO 未提出",
    filterTelexDone: "電放指示済み",
    filterTelexPending: "電放指示未提出",
    tableTitle: "船積み一覧",
    tableDesc: "ヘッダーをクリックすると並び替えできます。SO / 電放ステータスは自動判定されます。",
    hintSource: "データソース：Google Sheet CSV（閲覧専用）",
    colVessel: "船名 / VOY",
    colClearanceDate: "通関締切日",
    colSailingTime: "実際出港時刻",
    colPort: "到着港",
    colArrivalDate: "到着日",
    colQuantity: "予約コンテナ数",
    colSOstatus: "SO ステータス",
    colQuarantineTime: "検疫官立会申請時刻",
    colDrugNo: "薬事番号",
    colQuarantineCertNo: "検疫証明番号",
    colStuffingDate: "実際バンニング日",
    colTelexStatus: "電放ステータス",
    calTitle: "カレンダー",
    calDesc: "週 / 月ビューを切り替え、通関締切・出港・到着を色分け表示します。",
    calWeekView: "週ビュー",
    calMonthView: "月ビュー",
    btnToday: "今日",
    legendClearance: "通関締切日",
    legendSailing: "実際出港時刻",
    legendArrival: "到着日",
    footerSource: "データソース：Google Sheet（閲覧専用）",
    footerAutoRefresh: "画面は3分ごとに自動更新されます",
    searchPlaceholder: "船名・港・薬事番号・検疫証明番号で検索...",
    weekPrefix: "週",
    alldayRowLabel: "終日",
    sailingRowLabel: "出港",
    weekdayNames: ["日", "月", "火", "水", "木", "金", "土"],
    soProvided: "SO（出荷指示書）提出済",
    soNotProvided: "SO（出荷指示書）未提出",
    telexProvided: "電放（テレックスリリース）指示済",
    telexNotProvided: "電放（テレックスリリース）未指示",
    eventClearanceShort: "通関締切",
    eventArrivalShort: "到着",
    eventSailingShort: "出港",
    modalFieldVessel: "船名 / VOY",
    modalFieldClearanceDate: "通関締切日",
    modalFieldSailingTime: "実際出港時刻",
    modalFieldPort: "到着港",
    modalFieldArrivalDate: "到着日",
    modalFieldQuantity: "予約コンテナ数",
    modalFieldSO: "SO（出荷指示書）",
    modalFieldQuarantineTime: "検疫官立会申請時刻",
    modalFieldDrugNo: "薬事番号",
    modalFieldCertNo: "検疫証明番号",
    modalFieldStuffingDate: "実際バンニング日",
    modalFieldTelex: "電放（テレックスリリース）",
    modalSOEmpty: "（未提出）",
    modalTelexEmpty: "（未指示）",
    periodYearSuffix: "年",
    periodMonthSuffix: "月",
    between: " 〜 "
  }
};

let currentLang = localStorage.getItem("shipmentLang") || "zh";

// 主要資料
let allShipments = [];
let filteredShipments = [];
let sortState = { key: null, direction: "asc" }; // asc / desc
let currentCalendarView = "week"; // "week" or "month"
let currentWeekStart = getWeekStart(new Date());
let currentMonth = new Date(); // 月視圖用

document.addEventListener("DOMContentLoaded", () => {
  setupLanguageToggle();
  setupTabs();
  setupFilterAndSearch();
  setupTableSorting();
  setupCalendarControls();
  setupModal();
  applyTranslations(); // 先套用語系文字
  loadSheetData();

  // 每 3 分鐘自動更新
  setInterval(loadSheetData, 180000);
});

// i18n helpers
function t(key) {
  const langPack = i18n[currentLang] || i18n.zh;
  return langPack[key] ?? i18n.zh[key] ?? key;
}

function setupLanguageToggle() {
  const buttons = document.querySelectorAll(".lang-btn");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === currentLang);
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (lang === currentLang) return;
      currentLang = lang;
      localStorage.setItem("shipmentLang", currentLang);
      buttons.forEach((b) =>
        b.classList.toggle("active", b.getAttribute("data-lang") === currentLang)
      );
      applyTranslations();
      // 重新渲染表格與行事曆中的文字
      renderTable();
      renderCalendar();
    });
  });
}

function applyTranslations() {
  // 一般 data-i18n 的元素
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  // placeholder
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.placeholder = t("searchPlaceholder");
  }
}

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
      createStatusChip(
        t(hasSO ? "soProvided" : "soNotProvided"),
        hasSO
      )
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
        t(hasTelex ? "telexProvided" : "telexNotProvided"),
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
    formatDate(currentWeekStart) + t("between") + formatDate(days[6]);

  const headerRow = document.createElement("div");
  headerRow.className = "calendar-row calendar-header-row";

  const labelCell = document.createElement("div");
  labelCell.className = "calendar-label";
  labelCell.textContent = "";
  headerRow.appendChild(labelCell);

  const weekdayNames = i18n[currentLang].weekdayNames || i18n.zh.weekdayNames;

  days.forEach((d) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    const spanName = document.createElement("span");
    spanName.className = "day-name";
    spanName.textContent = t("weekPrefix") + weekdayNames[d.getDay()];
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
  allDayLabel.textContent = t("alldayRowLabel");
  allDayRow.appendChild(allDayLabel);

  days.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    filteredShipments.forEach((item) => {
      const clearanceDate = parseDate(item.clearanceDate);
      const arrivalDate = parseDate(item.arrivalDate);

      if (isSameDay(clearanceDate, day)) {
        const pill = createEventPill(item, t("eventClearanceShort"), "event-clearance");
        cell.appendChild(pill);
      }
      if (isSameDay(arrivalDate, day)) {
        const pill = createEventPill(item, t("eventArrivalShort"), "event-arrival");
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
  sailLabel.textContent = t("sailingRowLabel");
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
          `${t("eventSailingShort")} ${timeStr}`,
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
  periodLabel.textContent = `${year}${t("periodYearSuffix")} ${month + 1}${t("periodMonthSuffix")}`;

  const weekdayNames = i18n[currentLang].weekdayNames || i18n.zh.weekdayNames;
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
    spanName.textContent = t("weekPrefix") + weekdayNames[i];
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
          createEventPill(item, t("eventClearanceShort"), "event-clearance")
        );
      }
      if (isSameDay(arrivalDate, cellDate)) {
        eventsContainer.appendChild(
          createEventPill(item, t("eventArrivalShort"), "event-arrival")
        );
      }
      if (sailingDateTime && isSameDay(sailingDateTime, cellDate)) {
        const timeStr =
          pad2(sailingDateTime.getHours()) +
          ":" +
          pad2(sailingDateTime.getMinutes());
        eventsContainer.appendChild(
          createEventPill(item, `${t("eventSailingShort")} ${timeStr}`, "event-sailing")
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
    [t("modalFieldVessel"), item.vessel],
    [t("modalFieldClearanceDate"), item.clearanceDate],
    [t("modalFieldSailingTime"), item.sailingTime],
    [t("modalFieldPort"), item.port],
    [t("modalFieldArrivalDate"), item.arrivalDate],
    [t("modalFieldQuantity"), item.quantity],
    [t("modalFieldSO"), item.so || t("modalSOEmpty")],
    [t("modalFieldQuarantineTime"), item.quarantineTime],
    [t("modalFieldDrugNo"), item.drugNo],
    [t("modalFieldCertNo"), item.quarantineCertNo],
    [t("modalFieldStuffingDate"), item.stuffingDate],
    [t("modalFieldTelex"), item.telexRelease || t("modalTelexEmpty")]
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
