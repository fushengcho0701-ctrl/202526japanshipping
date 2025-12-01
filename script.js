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

    modalClose: "關閉",

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

    modalClose: "閉じる",

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
   Translation Helper
----------------------------------------------------- */
function t(key) {
  return i18n[currentLang][key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });

  // Update placeholders
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.placeholder =
      currentLang === "ja"
        ? "船名、港、薬務番号、検疫証番号などを検索..."
        : "搜尋船名、船班、港口、藥務號、檢疫證號...";
  }
}

/* -----------------------------------------------------
   Language Switching
----------------------------------------------------- */
function setupLanguageToggle() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      currentLang = lang;
      localStorage.setItem("lang", lang);

      document.querySelectorAll(".lang-btn").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");

      applyTranslations();
      applyFiltersAndRender();
      renderCalendar();
    });
  });

  document
    .querySelector(`.lang-btn[data-lang="${currentLang}"]`)
    ?.classList.add("active");
}

/* -----------------------------------------------------
   Load CSV from Google Sheet
----------------------------------------------------- */
async function loadSheetData() {
  try {
    const res = await fetch(window.SHEET_CSV_URL);
    const csvText = await res.text();

    rawData = parseCSV(csvText);
    applyFiltersAndRender();
    renderCalendar();
  } catch (err) {
    console.error("載入 Google Sheet 失敗：", err);
    alert("無法載入 Google Sheet 資料，請確認 CSV 連結是否正確與公開。");
  }
}

/* CSV Parser */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const cols = line.split(",");

    return {
      vessel: cols[0] || "",
      clearanceDate: cols[1] || "",
      sailingTime: cols[2] || "",
      port: cols[3] || "",
      arrivalDate: cols[4] || "",
      quantity: cols[5] || "",
      soStatus: cols[6] || "",
      quarantineTime: cols[7] || "",
      drugNo: cols[8] || "",
      quarantineCertNo: cols[9] || "",
      stuffingDate: cols[10] || "",
      telexStatus: cols[11] || ""
    };
  });
}

/* -----------------------------------------------------
   Table Rendering
----------------------------------------------------- */
function applyFiltersAndRender() {
  const searchInput = document.getElementById("search-input");
  const filterSo = document.getElementById("filter-so");
  const filterTelex = document.getElementById("filter-telex");

  if (!searchInput || !filterSo || !filterTelex) {
    console.warn("DOM 尚未準備好，跳過渲染");
    return;
  }

  const keyword = searchInput.value.trim().toLowerCase();

  filteredData = rawData.filter((row) => {
    const matchKeyword =
      row.vessel.toLowerCase().includes(keyword) ||
      row.port.toLowerCase().includes(keyword) ||
      row.drugNo.toLowerCase().includes(keyword) ||
      row.quarantineCertNo.toLowerCase().includes(keyword);

    const matchSO =
      filterSo.value === "all"
        ? true
        : filterSo.value === "done"
        ? row.soStatus.includes("已") || row.soStatus.includes("済")
        : row.soStatus.includes("未");

    const matchTelex =
      filterTelex.value === "all"
        ? true
        : filterTelex.value === "done"
        ? row.telexStatus.includes("已") || row.telexStatus.includes("済")
        : row.telexStatus.includes("未");

    return matchKeyword && matchSO && matchTelex;
  });

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
}

function renderTable() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  filteredData.forEach((row, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.vessel}</td>
      <td>${row.clearanceDate}</td>
      <td>${row.sailingTime}</td>
      <td>${row.port}</td>
      <td>${row.arrivalDate}</td>
      <td>${row.quantity}</td>

      <td>${renderStatusChip(
        row.soStatus.includes("未") ? "bad" : "ok",
        row.soStatus.includes("未")
          ? t("statusSOpending")
          : t("statusSOdone")
      )}</td>

      <td>${row.quarantineTime || t("emptyValue")}</td>
      <td>${row.drugNo || t("emptyValue")}</td>
      <td>${row.quarantineCertNo || t("emptyValue")}</td>
      <td>${row.stuffingDate || t("emptyValue")}</td>

      <td>${renderStatusChip(
        row.telexStatus.includes("未") ? "bad" : "ok",
        row.telexStatus.includes("未")
          ? t("statusTelexPending")
          : t("statusTelexDone")
      )}</td>
    `;

    tr.addEventListener("click", () => openModal(row));

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

      document.querySelectorAll("th[data-sort-key]").forEach((h) =>
        h.removeAttribute("data-sort-active")
      );
      th.setAttribute("data-sort-active", currentSortOrder);

      applyFiltersAndRender();
    });
  });
}

/* -----------------------------------------------------
   Modal
----------------------------------------------------- */
function openModal(row) {
  const modal = document.getElementById("detail-modal-backdrop");
  const list = document.getElementById("modal-detail-list");

  modal.classList.add("active");

  document.getElementById("modal-title").textContent = row.vessel;

  list.innerHTML = `
    <dt>${t("colClearanceDate")}</dt><dd>${row.clearanceDate}</dd>
    <dt>${t("colSailingTime")}</dt><dd>${row.sailingTime}</dd>
    <dt>${t("colArrivalDate")}</dt><dd>${row.arrivalDate}</dd>
    <dt>${t("colPort")}</dt><dd>${row.port}</dd>
    <dt>${t("colQuantity")}</dt><dd>${row.quantity}</dd>
    <dt>${t("colSOstatus")}</dt><dd>${row.soStatus}</dd>
    <dt>${t("colQuarantineTime")}</dt><dd>${row.quarantineTime}</dd>
    <dt>${t("colDrugNo")}</dt><dd>${row.drugNo}</dd>
    <dt>${t("colQuarantineCertNo")}</dt><dd>${row.quarantineCertNo}</dd>
    <dt>${t("colStuffingDate")}</dt><dd>${row.stuffingDate}</dd>
    <dt>${t("colTelexStatus")}</dt><dd>${row.telexStatus}</dd>
  `;
}

document.getElementById("modal-close-btn").addEventListener("click", () => {
  document.getElementById("detail-modal-backdrop").classList.remove("active");
});

/* -----------------------------------------------------
   Calendar Rendering
----------------------------------------------------- */
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  if (calendarView === "week") renderWeekView();
  else renderMonthView();
}

function renderWeekView() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const start = startOfWeek(currentDate);
  const weekDates = [...Array(7)].map((_, i) => addDays(start, i));

  const header = document.createElement("div");
  header.className = "calendar-week";
  header.innerHTML = weekDates
    .map(
      (d) =>
        `<div class="calendar-weekday">${d.getMonth() + 1}/${d.getDate()}</div>`
    )
    .join("");
  grid.appendChild(header);

  const row = document.createElement("div");
  row.className = "calendar-week";

  weekDates.forEach((date) => {
    const cell = document.createElement("div");
    cell.className = "calendar-week-cell";
    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    filteredData.forEach((item) => {
      if (item.clearanceDate === formatDate(date)) {
        cell.innerHTML += `<span class="calendar-event event-clearance">${t(
          "legendClearance"
        )}</span>`;
      }
      if (item.sailingTime === formatDate(date)) {
        cell.innerHTML += `<span class="calendar-event event-sailing">${t(
          "legendSailing"
        )}</span>`;
      }
      if (item.arrivalDate === formatDate(date)) {
        cell.innerHTML += `<span class="calendar-event event-arrival">${t(
          "legendArrival"
        )}</span>`;
      }
    });

    row.appendChild(cell);
  });

  grid.appendChild(row);

  document.getElementById("period-label").textContent = `${formatDate(
    weekDates[0]
  )} - ${formatDate(weekDates[6])}`;
}

function renderMonthView() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const first = new Date(year, month, 1);
  const start = startOfWeek(first);

  const days = [...Array(42)].map((_, i) => addDays(start, i));

  const box = document.createElement("div");
  box.className = "calendar-month";

  days.forEach((date) => {
    const cell = document.createElement("div");
    cell.className = "calendar-month-cell";
    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    filteredData.forEach((item) => {
      if (item.clearanceDate === formatDate(date)) {
        cell.innerHTML += `<span class="calendar-event event-clearance">${t(
          "legendClearance"
        )}</span>`;
      }
      if (item.sailingTime === formatDate(date)) {
        cell.innerHTML += `<span class="calendar-event event-sailing">${t(
          "legendSailing"
        )}</span>`;
      }
      if (item.arrivalDate === formatDate(date)) {
        cell.innerHTML += `<span class="calendar-event event-arrival">${t(
          "legendArrival"
        )}</span>`;
      }
    });

    box.appendChild(cell);
  });

  grid.appendChild(box);

  document.getElementById("period-label").textContent = `${year}/${month + 1}`;
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

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* -----------------------------------------------------
   Calendar Navigation
----------------------------------------------------- */
document.getElementById("btn-prev-period").addEventListener("click", () => {
  if (calendarView === "week") currentDate = addDays(currentDate, -7);
  else currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

  renderCalendar();
});

document.getElementById("btn-next-period").addEventListener("click", () => {
  if (calendarView === "week") currentDate = addDays(currentDate, 7);
  else currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

  renderCalendar();
});

document.getElementById("btn-today").addEventListener("click", () => {
  currentDate = new Date();
  renderCalendar();
});

/* -----------------------------------------------------
   Calendar View Switching
----------------------------------------------------- */
document.querySelectorAll(".subtab-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".subtab-button")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");
    calendarView = btn.dataset.calView;

    renderCalendar();
  });
});

/* -----------------------------------------------------
   Tab Switching
----------------------------------------------------- */
document.querySelectorAll(".tab-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-button")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    document
      .querySelectorAll(".view")
      .forEach((v) => v.classList.remove("active"));

    const target = btn.dataset.target;
    document.getElementById(target).classList.add("active");

    renderCalendar();
  });
});

/* -----------------------------------------------------
   Initialize System
----------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageToggle();
  applyTranslations();
  setupSorting();

  document.getElementById("search-input").addEventListener("input", applyFiltersAndRender);
  document.getElementById("filter-so").addEventListener("change", applyFiltersAndRender);
  document.getElementById("filter-telex").addEventListener("change", applyFiltersAndRender);

  loadSheetData();

  // Refresh every 3 minutes
  setInterval(loadSheetData, 180000);
});
