/* -----------------------------------------------------
   Global Variables & Default Settings
----------------------------------------------------- */
let rawData = [];
let filteredData = [];
let currentSortKey = "sailingDate"; // 預設依實際開船時間排序
let currentSortOrder = "asc";
let currentLang = localStorage.getItem("lang") || "zh";

let calendarView = "week";
let currentDate = new Date();
let maxContainersByGroup = {};

/* 星期顯示 */
const weekdayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

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

    statusSOdone: "已給 SO",
    statusSOpending: "尚未給 SO",
    statusTelexDone: "已給 電放單",
    statusTelexPending: "尚未給 電放單",

    modalTotalContainers: "需訂櫃量",
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
    colContainerNo: "コンテナ番号",
    colClearanceDate: "通関締切日",
    colSailingTime: "実際出港時刻",
    colLoadingTime: "積載時間",
    colPort: "到着港",
    colArrivalDate: "到着日",
    colSOstatus: "SO 状況",
    colQuarantineTime: "検疫官申請時刻",
    colDrugNo: "薬務番号",
    colQuarantineCertNo: "検疫証明番号",
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

    modalTotalContainers: "必要コンテナ数",
    emptyValue: "—"
  }
};

/* -----------------------------------------------------
   Helpers
----------------------------------------------------- */
function t(key) {
  return i18n[currentLang][key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}

/** 判斷是否為空運（抵達港口包含「空港」） */
function isAirShipment(row) {
  return (row.port || "").includes("空港");
}

/** 櫃次／捆數顯示（含單位） */
function formatContainerWithUnit(row) {
  const n = row.containerNo;
  if (!n || isNaN(n)) return t("emptyValue");
  if (isAirShipment(row)) {
    return `${n} 捆`;
  }
  return `第 ${n} 櫃`;
}

/** 原本的單純數字→櫃顯示，只在需要時使用 */
function formatContainerNo(n) {
  if (!n || isNaN(n)) return t("emptyValue");
  return `第 ${n} 櫃`;
}

/** 取得總量用的單位（櫃 / 捆） */
function getTotalUnit(row) {
  return isAirShipment(row) ? "捆" : "櫃";
}

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

/* 日期解析 */
function parseDateToObj(text) {
  if (!text) return null;

  text = text.replace(/星期[一二三四五六日天]/g, "").trim();
  text = text.replace(/\s+/g, " ");

  const parts = text.split(" ");
  const datePart = parts[0]?.replace(/\//g, "-");
  if (!datePart) return null;
  const timePart = parts[1] || "00:00";

  const d = new Date(`${datePart} ${timePart}`);
  return isNaN(d.getTime()) ? null : d;
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
   Load CSV
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

/* 解析 CSV
   欄位：船班, 櫃次, 結關日, 實際開船時間, 裝櫃時間, 抵達港口, 抵達日, SO, 檢疫官時間, 藥務號, 檢疫證號碼, 電放單
*/
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(",");

    const vessel = cols[0] || "";
    const containerNo = parseInt(cols[1], 10) || 1;

    const clearanceText = cols[2] || "";
    const sailingText = cols[3] || "";
    const loadingText = cols[4] || "";
    const port = cols[5] || "";
    const arrivalText = cols[6] || "";
    const soCell = cols[7] || "";
    const quarantineTime = cols[8] || "";
    const drugNo = cols[9] || "";
    const quarantineCertNo = cols[10] || "";
    const telexCell = cols[11] || "";

    const groupKey = `${vessel}__${arrivalText}`;

    rows.push({
      vessel,
      containerNo,
      groupKey,

      clearanceText,
      sailingText,
      loadingText,
      port,
      arrivalText,

      soStatus: soCell === "1" ? "done" : "pending",
      telexStatus: telexCell === "1" ? "done" : "pending",

      quarantineTime,
      drugNo,
      quarantineCertNo,

      clearanceDate: parseDateToObj(clearanceText),
      sailingDate: parseDateToObj(sailingText),
      loadingDate: parseDateToObj(loadingText),
      arrivalDate: parseDateToObj(arrivalText)
    });
  }

  maxContainersByGroup = {};
  rows.forEach((row) => {
    const key = row.groupKey;
    const n = row.containerNo || 1;
    if (!maxContainersByGroup[key] || n > maxContainersByGroup[key]) {
      maxContainersByGroup[key] = n;
    }
  });

  rows.forEach((row) => {
    row.totalContainers = maxContainersByGroup[row.groupKey] || 1;
  });

  return rows;
}

/* -----------------------------------------------------
   Filter + Sort
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
      (row.drugNo || "").toLowerCase().includes(keyword) ||
      (row.quarantineCertNo || "").toLowerCase().includes(keyword);

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
      const va = a[currentSortKey];
      const vb = b[currentSortKey];

      if (va instanceof Date && vb instanceof Date) {
        return currentSortOrder === "asc" ? va - vb : vb - va;
      }

      if (typeof va === "number" && typeof vb === "number") {
        return currentSortOrder === "asc" ? va - vb : vb - va;
      }

      const sa = String(va ?? "").toLowerCase();
      const sb = String(vb ?? "").toLowerCase();
      return currentSortOrder === "asc"
        ? sa.localeCompare(sb)
        : sb.localeCompare(sa);
    });
  }

  renderTable();
}

/* -----------------------------------------------------
   Render Table
----------------------------------------------------- */
function renderTable() {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  filteredData.forEach((row) => {
    const tr = document.createElement("tr");

    const needMulti = row.totalContainers && row.totalContainers > 1;
    const unit = getTotalUnit(row);
    const warnHtml = needMulti
      ? `<div class="table-note">⚠️ 請注意需訂 ${row.totalContainers} ${unit}</div>`
      : "";

    tr.innerHTML = `
      <td>
        <div>${row.vessel || t("emptyValue")}</div>
        ${warnHtml}
      </td>
      <td>${formatContainerWithUnit(row)}</td>
      <td>${row.clearanceText || t("emptyValue")}</td>
      <td>${row.sailingText || t("emptyValue")}</td>
      <td>${row.loadingText || t("emptyValue")}</td>
      <td>${row.port || t("emptyValue")}</td>
      <td>${row.arrivalText || t("emptyValue")}</td>
      <td>${renderStatusChip(
        row.soStatus === "done" ? "ok" : "bad",
        row.soStatus === "done" ? t("statusSOdone") : t("statusSOpending")
      )}</td>
      <td>${row.quarantineTime || t("emptyValue")}</td>
      <td>${row.drugNo || t("emptyValue")}</td>
      <td>${row.quarantineCertNo || t("emptyValue")}</td>
      <td>${renderStatusChip(
        row.telexStatus === "done" ? "ok" : "bad",
        row.telexStatus === "done" ? t("statusTelexDone") : t("statusTelexPending")
      )}</td>
    `;

    tr.addEventListener("click", () => {
      showDetailModal(row);
    });

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
   Modal
----------------------------------------------------- */
function showDetailModal(row) {
  const backdrop = document.getElementById("detail-modal-backdrop");
  const list = document.getElementById("modal-detail-list");
  const title = document.getElementById("modal-title");
  if (!backdrop || !list || !title) return;

  title.textContent = `${row.vessel}（${formatContainerWithUnit(row)}）`;

  const totalLine =
    row.totalContainers && row.totalContainers > 1
      ? `<dt>${t("modalTotalContainers")}</dt><dd>${row.totalContainers} ${getTotalUnit(
          row
        )}</dd>`
      : "";

  list.innerHTML = `
    <dt>${t("colVessel")}</dt><dd>${row.vessel}</dd>
    <dt>${t("colContainerNo")}</dt><dd>${formatContainerWithUnit(row)}</dd>
    ${totalLine}
    <dt>${t("colClearanceDate")}</dt><dd>${row.clearanceText || t("emptyValue")}</dd>
    <dt>${t("colSailingTime")}</dt><dd>${row.sailingText || t("emptyValue")}</dd>
    <dt>${t("colLoadingTime")}</dt><dd>${row.loadingText || t("emptyValue")}</dd>
    <dt>${t("colPort")}</dt><dd>${row.port || t("emptyValue")}</dd>
    <dt>${t("colArrivalDate")}</dt><dd>${row.arrivalText || t("emptyValue")}</dd>
    <dt>${t("colQuarantineTime")}</dt><dd>${row.quarantineTime || t("emptyValue")}</dd>
    <dt>${t("colDrugNo")}</dt><dd>${row.drugNo || t("emptyValue")}</dd>
    <dt>${t("colQuarantineCertNo")}</dt><dd>${row.quarantineCertNo || t("emptyValue")}</dd>
    <dt>${t("colSOstatus")}</dt><dd>${
      row.soStatus === "done" ? t("statusSOdone") : t("statusSOpending")
    }</dd>
    <dt>${t("colTelexStatus")}</dt><dd>${
      row.telexStatus === "done" ? t("statusTelexDone") : t("statusTelexPending")
    }</dd>
  `;

  backdrop.classList.add("active");
}

/* -----------------------------------------------------
   Calendar
----------------------------------------------------- */
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (calendarView === "week") {
    renderWeekView(false);
  } else if (calendarView === "month") {
    renderMonthView();
} else if (calendarView === "sailing-only") {
    renderMonthViewSailingOnly(); // 只顯示開船事件（月視圖版）
  }
}
function renderMonthViewSailingOnly() {
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
    cell.innerHTML = `<div class="day-number">${date.getDate()}（${
      weekdayNames[date.getDay()]
    }）</div>`;

    filteredData.forEach((item) => {
      // 只顯示開船事件
      if (isSameDate(item.sailingDate, date)) {
        cell.appendChild(
          createCalendarEventChip(item, "event-sailing", t("legendSailing"))
        );
      }
    });

    box.appendChild(cell);
  });

  grid.appendChild(box);

  const label = document.getElementById("period-label");
  if (label) {
    label.textContent = `${y}/${m + 1}`;
  }
}

function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

/** 以「星期日」為週起始 */
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = d.getDate() - day; // 從星期日開始
  return new Date(d.setDate(diff));
}

function createCalendarEventChip(row, typeClass, labelText) {
  const chip = document.createElement("span");

  // 空運 → 顯示藍色
  if (typeClass === "event-sailing" && isAirShipment(row)) {
    chip.className = `calendar-event event-air`;
  } else {
    chip.className = `calendar-event ${typeClass}`;
  }

  chip.textContent = `${labelText}｜${row.vessel}（${formatContainerWithUnit(
    row
  )}）`;

  chip.addEventListener("click", (e) => {
    e.stopPropagation();
    showDetailModal(row);
  });

  return chip;
}

/** 週視圖：onlySailing=true 時只顯示開船事件並加註抵達日 */
function renderWeekView(onlySailing = false) {
  const grid = document.getElementById("calendar-grid");
  const start = startOfWeek(currentDate);
  const days = [...Array(7)].map((_, i) => addDays(start, i));

  const header = document.createElement("div");
  header.className = "calendar-week";
  header.innerHTML = days
    .map(
      (d) =>
        `<div class="calendar-weekday">${d.getMonth() + 1}/${d.getDate()}（${
          weekdayNames[d.getDay()]
        }）</div>`
    )
    .join("");
  grid.appendChild(header);

  const row = document.createElement("div");
  row.className = "calendar-week";

  days.forEach((date) => {
    const cell = document.createElement("div");
    cell.className = "calendar-week-cell";
    cell.innerHTML = `<div class="day-number">${date.getDate()}（${
      weekdayNames[date.getDay()]
    }）</div>`;

    filteredData.forEach((item) => {
      // 處理開船事件
      if (isSameDate(item.sailingDate, date)) {
        const chip = createCalendarEventChip(item, "event-sailing", t("legendSailing"));
        
        // 如果是「只看開船」模式，額外注入抵達日資訊
        if (onlySailing && item.arrivalDate) {
          const arr = new Date(item.arrivalDate);
          const arrM = arr.getMonth() + 1;
          const arrD = arr.getDate();
          const arrW = weekdayNames[arr.getDay()];
          
          // 找到 chip 內的文字容器並修改
          const titleElem = chip.querySelector('.event-title') || chip;
          titleElem.innerHTML = `${item.title}<div style="border-top: 1px dashed #ccc; margin-top: 4px; padding-top: 2px; color: #d93025;">新增 *抵達日* ${arrM}/${arrD}（${arrW}）</div>`;
        }
        
        cell.appendChild(chip);
      }

      // 如果不是只看開船，才顯示獨立的「抵達」方塊
      if (!onlySailing && isSameDate(item.arrivalDate, date)) {
        cell.appendChild(
          createCalendarEventChip(item, "event-arrival", t("legendArrival"))
        );
      }
    });

    row.appendChild(cell);
  });

  grid.appendChild(row);

  const label = document.getElementById("period-label");
  if (label) {
    const startStr = `${start.getFullYear()}-${String(
      start.getMonth() + 1
    ).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
    const end = days[6];
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(end.getDate()).padStart(2, "0")}`;
    label.textContent = `${startStr} - ${endStr}`;
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
    cell.innerHTML = `<div class="day-number">${date.getDate()}（${
      weekdayNames[date.getDay()]
    }）</div>`;

    filteredData.forEach((item) => {
      // 結關事件已移除，不再顯示
      if (isSameDate(item.sailingDate, date)) {
        cell.appendChild(
          createCalendarEventChip(item, "event-sailing", t("legendSailing"))
        );
      }
      if (isSameDate(item.arrivalDate, date)) {
        cell.appendChild(
          createCalendarEventChip(item, "event-arrival", t("legendArrival"))
        );
      }
    });

    box.appendChild(cell);
  });

  grid.appendChild(box);

  const label = document.getElementById("period-label");
  if (label) {
    label.textContent = `${y}/${m + 1}`;
  }
}

/* -----------------------------------------------------
   Init
----------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageToggle();
  applyTranslations();

  setupSorting();
  loadSheetData();

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", applyFiltersAndRender);
  }

  const filterSO = document.getElementById("filter-so");
  if (filterSO) {
    filterSO.addEventListener("change", applyFiltersAndRender);
  }

  const filterTelex = document.getElementById("filter-telex");
  if (filterTelex) {
    filterTelex.addEventListener("change", applyFiltersAndRender);
  }

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

        if (targetId === "calendar-view") {
          renderCalendar();
        }
      });
    });
  }

  const subtabButtons = document.querySelectorAll(".subtab-button");
  if (subtabButtons.length) {
    subtabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        calendarView = btn.dataset.calView || "week";

        subtabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        renderCalendar();
      });
    });
  }

  const btnPrev = document.getElementById("btn-prev-period");
  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      currentDate =
        calendarView === "week" || calendarView === "sailing-only"
          ? addDays(currentDate, -7)
          : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      renderCalendar();
    });
  }

  const btnNext = document.getElementById("btn-next-period");
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      currentDate =
        calendarView === "week" || calendarView === "sailing-only"
          ? addDays(currentDate, 7)
          : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      renderCalendar();
    });
  }

  const btnToday = document.getElementById("btn-today");
  if (btnToday) {
    btnToday.addEventListener("click", () => {
      currentDate = new Date();
      renderCalendar();
    });
  }

  const modalClose = document.getElementById("modal-close-btn");
  const modalBackdrop = document.getElementById("detail-modal-backdrop");
  if (modalClose && modalBackdrop) {
    modalClose.addEventListener("click", () => {
      modalBackdrop.classList.remove("active");
    });
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove("active");
      }
    });
  }

  // 每 3 分鐘自動重新載入資料
  setInterval(loadSheetData, 180000);
});
