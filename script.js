/* -----------------------------------------------------
   Global Variables & Default Settings
----------------------------------------------------- */
let rawData = [];
let filteredData = [];
let currentSortKey = "arrivalDate"; // 預設依抵達日排序
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

    statusSOdone: "SO 提出済",
    statusSOpending: "SO 未提出",
    statusTelexDone: "電放指示済",
    statusTelexPending: "電放未提出",

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

/* -----------------------------------------------------
   解析日期（含 2025/12/14 7:00）
----------------------------------------------------- */
function parseRawDate(value) {
  if (!value) return "";

  // 去掉「星期一」這種多餘字
  let cleaned = value.replace(/星期.*/g, "").trim();

  // 轉成 date obj
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return value; // fallback

  // 回傳 YYYY-MM-DD HH:mm
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  // 如果沒有時間，就不要顯示 00:00
  if (value.includes(":")) return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  return `${yyyy}-${mm}-${dd}`;
}

/* -----------------------------------------------------
   CSV Parser
----------------------------------------------------- */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");

    rows.push({
      vessel: cols[0] || "",
      clearanceDate: parseRawDate(cols[1]),
      sailingTime: parseRawDate(cols[2]),
      port: cols[3] || "",
      arrivalDate: parseRawDate(cols[4]),
      quantity: cols[5] || "",

      soStatus: cols[6] === "1" ? "done" : "pending",

      quarantineTime: cols[7] || "",
      drugNo: cols[8] || "",
      quarantineCertNo: cols[9] || "",
      stuffingDate: parseRawDate(cols[10]),

      telexStatus: cols[11] === "1" ? "done" : "pending"
    });
  }

  return rows;
}

/* -----------------------------------------------------
   搜尋 + 篩選 + 排序
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

  // 排序（依抵達日 or 使用者點欄位）
  if (currentSortKey) {
    filteredData.sort((a, b) => {
      return currentSortOrder === "asc"
        ? (a[currentSortKey] || "").localeCompare(b[currentSortKey] || "")
        : (b[currentSortKey] || "").localeCompare(a[currentSortKey] || "");
    });
  }

  renderTable();
}

/* -----------------------------------------------------
   表格渲染
----------------------------------------------------- */
function renderTable() {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  filteredData.forEach((row) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.vessel}</td>
      <td>${row.clearanceDate}</td>
      <td>${row.sailingTime}</td>
      <td>${row.port}</td>
      <td>${row.arrivalDate}</td>
      <td>${row.quantity}</td>

      <td>${renderStatusChip(
        row.soStatus === "done" ? "ok" : "bad",
        row.soStatus === "done" ? t("statusSOdone") : t("statusSOpending")
      )}</td>

      <td>${row.quarantineTime || t("emptyValue")}</td>
      <td>${row.drugNo || t("emptyValue")}</td>
      <td>${row.quarantineCertNo || t("emptyValue")}</td>
      <td>${row.stuffingDate || t("emptyValue")}</td>

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
   行事曆
----------------------------------------------------- */
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (calendarView === "week") renderWeekView();
  else renderMonthView();
}

/* ---- 小工具 ---- */
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
   Modal：顯示事件詳細資料
----------------------------------------------------- */
function showDetailModal(row) {
  const modal = document.getElementById("detail-modal-backdrop");
  const list = document.getElementById("modal-detail-list");
  const title = document.getElementById("modal-title");

  if (!modal || !list || !title) return;

  title.textContent = row.vessel;

  list.innerHTML = `
    <dt>${t("colVessel")}</dt><dd>${row.vessel}</dd>
    <dt>${t("colClearanceDate")}</dt><dd>${row.clearanceDate}</dd>
    <dt>${t("colSailingTime")}</dt><dd>${row.sailingTime}</dd>
    <dt>${t("colPort")}</dt><dd>${row.port}</dd>
    <dt>${t("colArrivalDate")}</dt><dd>${row.arrivalDate}</dd>
    <dt>${t("colQuantity")}</dt><dd>${row.quantity}</dd>
    <dt>${t("colSOstatus")}</dt><dd>${row.soStatus}</dd>
    <dt>${t("colQuarantineTime")}</dt><dd>${row.quarantineTime}</dd>
    <dt>${t("colDrugNo")}</dt><dd>${row.drugNo}</dd>
    <dt>${t("colQuarantineCertNo")}</dt><dd>${row.quarantineCertNo}</dd>
    <dt>${t("colStuffingDate")}</dt><dd>${row.stuffingDate}</dd>
    <dt>${t("colTelexStatus")}</dt><dd>${row.telexStatus}</dd>
  `;

  modal.classList.add("active");
}

document.getElementById("modal-close-btn").addEventListener("click", () => {
  document.getElementById("detail-modal-backdrop").classList.remove("active");
});

/* ---- Calendar Event Chip ---- */
function createEventChip(row, typeKey, label) {
  const chip = document.createElement("span");
  chip.className = `calendar-event ${typeKey}`;
  chip.textContent = `${label}｜${row.vessel}｜${row.quantity || 0} 櫃`;
  chip.addEventListener("click", () => showDetailModal(row));
  return chip;
}

/* -----------------------------------------------------
   Week View
----------------------------------------------------- */
function renderWeekView() {
  const grid = document.getElementById("calendar-grid");

  const start = startOfWeek(currentDate);
  const days = [...Array(7)].map((_, i) => addDays(start, i));

  const header = document.createElement("div");
  header.className = "calendar-week";
  header.innerHTML = days
    .map(
      (d) =>
        `<div class="calendar-weekday">${d.getMonth() + 1}/${d.getDate()}</div>`
    )
    .join("");
  grid.appendChild(header);

  const row = document.createElement("div");
  row.className = "calendar-week";

  days.forEach((date) => {
    const cell = document.createElement("div");
    cell.className = "calendar-week-cell";
    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    const key = formatDate(date);

    filteredData.forEach((item) => {
      if (item.clearanceDate.startsWith(key))
        cell.appendChild(createEventChip(item, "event-clearance", t("legendClearance")));

      if (item.sailingTime.startsWith(key))
        cell.appendChild(createEventChip(item, "event-sailing", t("legendSailing")));

      if (item.arrivalDate.startsWith(key))
        cell.appendChild(createEventChip(item, "event-arrival", t("legendArrival")));
    });

    row.appendChild(cell);
  });

  grid.appendChild(row);

  document.getElementById("period-label").textContent =
    `${formatDate(days[0])} - ${formatDate(days[6])}`;
}

/* -----------------------------------------------------
   Month View
----------------------------------------------------- */
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

    const key = formatDate(date);

    filteredData.forEach((item) => {
      if (item.clearanceDate.startsWith(key))
        cell.appendChild(createEventChip(item, "event-clearance", t("legendClearance")));

      if (item.sailingTime.startsWith(key))
        cell.appendChild(createEventChip(item, "event-sailing", t("legendSailing")));

      if (item.arrivalDate.startsWith(key))
        cell.appendChild(createEventChip(item, "event-arrival", t("legendArrival")));
    });

    box.appendChild(cell);
  });

  grid.appendChild(box);

  document.getElementById("period-label").textContent = `${y}/${m + 1}`;
}

/* -----------------------------------------------------
   Initialize System
----------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageToggle();
  applyTranslations();

  // 預設排序（抵達日 asc）
  currentSortKey = "arrivalDate";
  currentSortOrder = "asc";

  setupSorting();
  loadSheetData();

  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.addEventListener("input", applyFiltersAndRender);

  const filterSO = document.getElementById("filter-so");
  if (filterSO) filterSO.addEventListener("change", applyFiltersAndRender);

  const filterTelex = document.getElementById("filter-telex");
  if (filterTelex) filterTelex.addEventListener("change", applyFiltersAndRender);

  // 視圖切換（表格 / 行事曆）
  const tabButtons = document.querySelectorAll(".tab-button");
  const views = document.querySelectorAll(".view");
  if (tabButtons.length && views.length) {
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;

        tabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        views.forEach((v) => v.classList.remove("active"));
        const targetView = document.getElementById(targetId);
        if (targetView) targetView.classList.add("active");

        if (targetId === "calendar-view") renderCalendar();
      });
    });
  }

  // 行事曆 週/月 切換
  const subtabButtons = document.querySelectorAll(".subtab-button");
  if (subtabButtons.length) {
    subtabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        calendarView = btn.dataset.calView;

        subtabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        renderCalendar();
      });
    });
  }

  // 行事曆上一段 / 下一段 / 今天
  const btnPrev = document.getElementById("btn-prev-period");
  const btnNext = document.getElementById("btn-next-period");
  const btnToday = document.getElementById("btn-today");

  if (btnPrev)
    btnPrev.addEventListener("click", () => {
      currentDate =
        calendarView === "week"
          ? addDays(currentDate, -7)
          : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      renderCalendar();
    });

  if (btnNext)
    btnNext.addEventListener("click", () => {
      currentDate =
        calendarView === "week"
          ? addDays(currentDate, 7)
          : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      renderCalendar();
    });

  if (btnToday)
    btnToday.addEventListener("click", () => {
      currentDate = new Date();
      renderCalendar();
    });

  // Auto refresh 3 mins
  setInterval(loadSheetData, 180000);
});
