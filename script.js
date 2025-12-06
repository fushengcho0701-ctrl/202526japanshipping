/* -----------------------------------------------------
   Global State & Defaults (v106)
----------------------------------------------------- */
let rawData = [];
let filteredData = [];

let currentSortKey = "arrivalSortKey"; // 預設用抵達日排序
let currentSortOrder = "asc";

let currentLang = localStorage.getItem("lang") || "zh";

/* Calendar State */
let calendarView = "month"; // "week" | "month"
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
    colContainerSeq: "櫃次",
    colContainerNo: "櫃次",
    colClearanceDate: "結關日",
    colSailingTime: "實際開船時間",
    colLoadingTime: "裝櫃時間",
    colStuffingTime: "裝櫃時間",
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

    emptyValue: "—",

    multiContainerNotice: (n) => `⚠️ 請注意需訂 ${n} 櫃`,
    totalContainersLabel: (n) => `共 ${n} 櫃`,
    moreEventsLabel: (n) => `+${n} 更多…`,
    modalTitleByKind: (vessel, kind) => {
      const kindMap = { clearance: "結關", sailing: "開船", arrival: "抵達" };
      return `${vessel}｜${kindMap[kind] || ""}`;
    },
    modalSectionHeader: (seq) => `第 ${seq} 櫃`,
    modalFieldVessel: "船班",
    modalFieldPort: "抵達港口",
    modalFieldClearanceDate: "結關日",
    modalFieldSailingTime: "實際開船時間",
    modalFieldStuffingTime: "裝櫃時間",
    modalFieldArrivalDate: "抵達日",
    modalFieldSO: "SO 狀態",
    modalFieldTelex: "電放單狀態",
    modalFieldDrugNo: "藥務號",
    modalFieldCertNo: "檢疫證號碼"
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
    colContainerSeq: "コンテナ番号",
    colContainerNo: "コンテナ番号",
    colClearanceDate: "通関締切日",
    colSailingTime: "実際出港時刻",
    colLoadingTime: "積込み時刻",
    colStuffingTime: "積込み時刻",
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

    statusSOdone: "SO 提出済",
    statusSOpending: "SO 未提出",
    statusTelexDone: "電放指示済",
    statusTelexPending: "電放未提出",

    emptyValue: "—",

    multiContainerNotice: (n) => `⚠️ 要予約コンテナ数：${n}`,
    totalContainersLabel: (n) => `合計 ${n} コンテナ`,
    moreEventsLabel: (n) => `+${n} 件…`,
    modalTitleByKind: (vessel, kind) => {
      const kindMap = { clearance: "通関締切", sailing: "出港", arrival: "到着" };
      return `${vessel}｜${kindMap[kind] || ""}`;
    },
    modalSectionHeader: (seq) => `コンテナ No.${seq}`,
    modalFieldVessel: "船名 / VOY",
    modalFieldPort: "到着港",
    modalFieldClearanceDate: "通関締切日",
    modalFieldSailingTime: "実際出港時刻",
    modalFieldStuffingTime: "積込み時刻",
    modalFieldArrivalDate: "到着日",
    modalFieldSO: "SO 状況",
    modalFieldTelex: "電放状況",
    modalFieldDrugNo: "薬務番号",
    modalFieldCertNo: "検疫証明番号"
  }
};

/* -----------------------------------------------------
   i18n Helper
----------------------------------------------------- */
function t(key, ...args) {
  const langPack = i18n[currentLang] || i18n.zh;
  const v = langPack[key];
  if (typeof v === "function") return v(...args);
  return v || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}

/* -----------------------------------------------------
   Language Toggle
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

  // 初始化 active 狀態
  document
    .querySelectorAll(".lang-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.lang === currentLang));
}

/* -----------------------------------------------------
   Date Helpers
----------------------------------------------------- */
function parseRawDate(raw) {
  if (!raw) return null;
  let s = String(raw).trim();

  // 去掉「星期一」這種字尾
  s = s.replace(/\s*星期[一二三四五六日天]$/, "");

  const parts = s.split(/\s+/); // ["2025/12/11", "9:00"] 或 ["2025/12/15"]
  const datePart = parts[0];
  const timePart = parts[1] || "";

  if (!datePart) return null;

  const dParts = datePart.split(/[\/\-]/).map((n) => parseInt(n, 10));
  if (dParts.length < 3 || !dParts[0] || !dParts[1] || !dParts[2]) return null;
  const [y, m, d] = dParts;

  let h = 0;
  let min = 0;
  if (timePart) {
    const tParts = timePart.split(":").map((n) => parseInt(n, 10));
    if (!isNaN(tParts[0])) h = tParts[0];
    if (!isNaN(tParts[1])) min = tParts[1];
  }
  return new Date(y, m - 1, d, h, min);
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeDateStr(raw) {
  const d = parseRawDate(raw);
  return d ? formatDate(d) : "";
}

function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 以週一為開頭
  return new Date(d.setDate(diff));
}

/* -----------------------------------------------------
   Load Google Sheet CSV
----------------------------------------------------- */
async function loadSheetData() {
  try {
    const res = await fetch(window.SHEET_CSV_URL, { cache: "no-store" });
    const csvText = await res.text();
    rawData = parseCSV(csvText);
    applyFiltersAndRender();
    renderCalendar();
  } catch (err) {
    console.error("CSV 載入失敗：", err);
  }
}

/* -----------------------------------------------------
   CSV Parser  (依照你最新欄位順序)
   船班	A
   櫃次	B
   結關日	C
   實際開船時間	D
   裝櫃時間	E
   抵達港口	F
   抵達日	G
   SO	H
   申請檢疫官到場時間 I
   藥務號 J
   檢疫證號碼 K
   電放單 L
----------------------------------------------------- */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");

    const vessel = (cols[0] || "").trim();
    const containerSeq = (cols[1] || "").trim();
    const clearanceDate = (cols[2] || "").trim();
    const sailingTime = (cols[3] || "").trim();
    const stuffingTime = (cols[4] || "").trim();
    const port = (cols[5] || "").trim();
    const arrivalDate = (cols[6] || "").trim();
    const soStatus = cols[7] === "1" ? "done" : "pending";
    const quarantineTime = (cols[8] || "").trim();
    const drugNo = (cols[9] || "").trim();
    const quarantineCertNo = (cols[10] || "").trim();
    const telexStatus = cols[11] === "1" ? "done" : "pending";

    const clearanceSortKey = normalizeDateStr(clearanceDate);
    const sailingSortKey = normalizeDateStr(sailingTime);
    const arrivalSortKey = normalizeDateStr(arrivalDate);

    rows.push({
      vessel,
      containerSeq,
      clearanceDate,
      sailingTime,
      stuffingTime,
      port,
      arrivalDate,
      soStatus,
      quarantineTime,
      drugNo,
      quarantineCertNo,
      telexStatus,
      clearanceSortKey,
      sailingSortKey,
      arrivalSortKey
    });
  }

  return rows;
}

/* -----------------------------------------------------
   Filter + Search + Sort
----------------------------------------------------- */
function applyFiltersAndRender() {
  const keyword = (
    document.getElementById("search-input")?.value || ""
  )
    .trim()
    .toLowerCase();

  const soFilter = document.getElementById("filter-so")?.value || "all";
  const telexFilter = document.getElementById("filter-telex")?.value || "all";

  filteredData = rawData.filter((row) => {
    const kwMatch =
      row.vessel.toLowerCase().includes(keyword) ||
      row.port.toLowerCase().includes(keyword) ||
      (row.drugNo || "").toLowerCase().includes(keyword) ||
      (row.quarantineCertNo || "").toLowerCase().includes(keyword);

    const soMatch =
      soFilter === "all"
        ? true
        : soFilter === "done"
        ? row.soStatus === "done"
        : row.soStatus === "pending";

    const telexMatch =
      telexFilter === "all"
        ? true
        : telexFilter === "done"
        ? row.telexStatus === "done"
        : row.telexStatus === "pending";

    return kwMatch && soMatch && telexMatch;
  });

  // Sort
  if (currentSortKey) {
    filteredData.sort((a, b) => {
      const va = a[currentSortKey] || "";
      const vb = b[currentSortKey] || "";

      // 日期 sortKey（YYYY-MM-DD）
      if (
        currentSortKey === "arrivalSortKey" ||
        currentSortKey === "clearanceSortKey" ||
        currentSortKey === "sailingSortKey"
      ) {
        return currentSortOrder === "asc"
          ? va.localeCompare(vb)
          : vb.localeCompare(va);
      }

      return currentSortOrder === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }

  renderTable();
}

/* -----------------------------------------------------
   Table Rendering
----------------------------------------------------- */
function buildMultiContainerSummary(rows) {
  // key: vessel + arrivalSortKey
  const map = new Map();

  rows.forEach((row) => {
    const key = `${row.vessel}|${row.arrivalSortKey}`;
    const seq = parseInt(row.containerSeq, 10) || 1;
    const current = map.get(key) || 0;
    map.set(key, Math.max(current, seq));
  });

  return map;
}

function renderTable() {
  const tbody = document.getElementById("table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const multiSummary = buildMultiContainerSummary(filteredData);

  filteredData.forEach((row) => {
    const tr = document.createElement("tr");

    const key = `${row.vessel}|${row.arrivalSortKey}`;
    const maxContainers = multiSummary.get(key) || 1;

    const vesselCellHtml = `
      <div>${row.vessel || t("emptyValue")}</div>
      ${
        maxContainers > 1
          ? `<div class="vessel-note">${t(
              "multiContainerNotice",
              maxContainers
            )}</div>`
          : ""
      }
    `;

    tr.innerHTML = `
      <td>${vesselCellHtml}</td>
      <td>${row.containerSeq || t("emptyValue")}</td>
      <td>${row.clearanceDate || t("emptyValue")}</td>
      <td>${row.sailingTime || t("emptyValue")}</td>
      <td>${row.stuffingTime || t("emptyValue")}</td>
      <td>${row.port || t("emptyValue")}</td>
      <td>${row.arrivalDate || t("emptyValue")}</td>

      <td>${renderStatusChip(
        row.soStatus === "done" ? "ok" : "bad",
        row.soStatus === "done" ? t("statusSOdone") : t("statusSOpending")
      )}</td>

      <td>${row.quarantineTime || t("emptyValue")}</td>
      <td>${row.drugNo || t("emptyValue")}</td>
      <td>${row.quarantineCertNo || t("emptyValue")}</td>

      <td>${renderStatusChip(
        row.telexStatus === "done" ? "ok" : "bad",
        row.telexStatus === "done"
          ? t("statusTelexDone")
          : t("statusTelexPending")
      )}</td>
    `;

    // 點表格列 → 開啟單一櫃詳細
    tr.addEventListener("click", () => {
      openSingleRowModal(row, maxContainers);
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
   Sorting Setup
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

  // 預設把 arrivalSortKey 對應到「抵達日」那欄
  const arrivalTh = document.querySelector('th[data-sort-key="arrivalSortKey"]');
  if (arrivalTh) {
    arrivalTh.setAttribute("data-sort-active", currentSortOrder);
  }
}

/* -----------------------------------------------------
   Calendar Events (A + C)
   C：同一船班＋同一組日期合併
   A：每格只顯示最多 2 個事件，剩下用 +N 更多
----------------------------------------------------- */
function buildCalendarEvents() {
  // 先以「船名 + 三個日期」合併
  const groupMap = new Map();

  filteredData.forEach((row) => {
    const key = [
      row.vessel,
      row.clearanceSortKey,
      row.sailingSortKey,
      row.arrivalSortKey
    ].join("|");

    const seqNum = parseInt(row.containerSeq, 10) || 1;

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        vessel: row.vessel,
        port: row.port,
        clearanceDate: row.clearanceDate,
        sailingTime: row.sailingTime,
        arrivalDate: row.arrivalDate,
        clearanceSortKey: row.clearanceSortKey,
        sailingSortKey: row.sailingSortKey,
        arrivalSortKey: row.arrivalSortKey,
        containers: [],
        maxContainerSeq: seqNum
      });
    }

    const group = groupMap.get(key);
    group.containers.push(row);
    if (seqNum > group.maxContainerSeq) group.maxContainerSeq = seqNum;
  });

  const events = [];

  groupMap.forEach((group) => {
    const total = group.maxContainerSeq || group.containers.length || 1;
    const title =
      total > 1
        ? `${group.vessel}（${t("totalContainersLabel", total)}）`
        : `${group.vessel}`;

    if (group.clearanceSortKey) {
      events.push({
        kind: "clearance",
        dateStr: group.clearanceSortKey,
        group,
        total,
        title
      });
    }
    if (group.sailingSortKey) {
      events.push({
        kind: "sailing",
        dateStr: group.sailingSortKey,
        group,
        total,
        title
      });
    }
    if (group.arrivalSortKey) {
      events.push({
        kind: "arrival",
        dateStr: group.arrivalSortKey,
        group,
        total,
        title
      });
    }
  });

  return events;
}

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const events = buildCalendarEvents();
  const eventsByDate = {};
  events.forEach((ev) => {
    if (!ev.dateStr) return;
    if (!eventsByDate[ev.dateStr]) eventsByDate[ev.dateStr] = [];
    eventsByDate[ev.dateStr].push(ev);
  });

  if (calendarView === "week") {
    renderWeekView(grid, eventsByDate);
  } else {
    renderMonthView(grid, eventsByDate);
  }
}

function renderWeekView(grid, eventsByDate) {
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

    const dateStr = formatDate(date);
    const dayEvents = (eventsByDate[dateStr] || []).slice(); // copy

    renderEventsIntoCell(cell, dateStr, dayEvents);

    row.appendChild(cell);
  });

  grid.appendChild(row);

  const label = document.getElementById("period-label");
  if (label) {
    label.textContent = `${formatDate(days[0])} - ${formatDate(days[6])}`;
  }
}

function renderMonthView(grid, eventsByDate) {
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

    const dateStr = formatDate(date);
    const dayEvents = (eventsByDate[dateStr] || []).slice();

    renderEventsIntoCell(cell, dateStr, dayEvents);

    box.appendChild(cell);
  });

  grid.appendChild(box);

  const label = document.getElementById("period-label");
  if (label) {
    label.textContent = `${y}/${m + 1}`;
  }
}

function renderEventsIntoCell(cell, dateStr, dayEvents) {
  const MAX_VISIBLE = 2;

  // 依事件種類排序：結關 → 開船 → 抵達
  const kindOrder = { clearance: 0, sailing: 1, arrival: 2 };
  dayEvents.sort((a, b) => (kindOrder[a.kind] || 0) - (kindOrder[b.kind] || 0));

  const visible = dayEvents.slice(0, MAX_VISIBLE);
  const hiddenCount = dayEvents.length - visible.length;

  visible.forEach((ev) => {
    const chip = document.createElement("span");
    chip.className =
      "calendar-event " +
      (ev.kind === "clearance"
        ? "event-clearance"
        : ev.kind === "sailing"
        ? "event-sailing"
        : "event-arrival");

    const kindLabel =
      ev.kind === "clearance"
        ? t("legendClearance")
        : ev.kind === "sailing"
        ? t("legendSailing")
        : t("legendArrival");

    chip.textContent = `${kindLabel}｜${ev.title}`;

    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      openGroupModal(ev.group, ev.kind);
    });

    cell.appendChild(chip);
  });

  if (hiddenCount > 0) {
    const moreBtn = document.createElement("button");
    moreBtn.className = "calendar-more-btn";
    moreBtn.textContent = t("moreEventsLabel", hiddenCount);
    moreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openDateModal(dateStr, dayEvents);
    });
    cell.appendChild(moreBtn);
  }
}

/* -----------------------------------------------------
   Calendar Nav & View Tabs
----------------------------------------------------- */
function setupCalendarNavButtons() {
  const btnPrev = document.getElementById("btn-prev-period");
  const btnNext = document.getElementById("btn-next-period");
  const btnToday = document.getElementById("btn-today");

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      currentDate =
        calendarView === "week"
          ? addDays(currentDate, -7)
          : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      renderCalendar();
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      currentDate =
        calendarView === "week"
          ? addDays(currentDate, 7)
          : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      renderCalendar();
    });
  }

  if (btnToday) {
    btnToday.addEventListener("click", () => {
      currentDate = new Date();
      renderCalendar();
    });
  }
}

function setupCalendarSubTabs() {
  const subTabs = document.querySelectorAll(".subtab-button");
  if (!subTabs.length) return;

  subTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.calView;
      if (!view) return;
      calendarView = view;

      subTabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      renderCalendar();
    });
  });
}

/* -----------------------------------------------------
   Main View Tabs (表格 / 行事曆)
----------------------------------------------------- */
function setupMainTabs() {
  const views = document.querySelectorAll(".view");
  const tabButtons = document.querySelectorAll(".tab-button");
  if (!views.length || !tabButtons.length) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      if (!targetId) return;

      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      views.forEach((v) => v.classList.remove("active"));
      const target = document.getElementById(targetId);
      if (target) target.classList.add("active");

      if (targetId === "calendar-view") {
        renderCalendar();
      }
    });
  });
}

/* -----------------------------------------------------
   Modal Helpers
----------------------------------------------------- */
function openSingleRowModal(row, maxContainers) {
  const backdrop = document.getElementById("detail-modal-backdrop");
  const titleEl = document.getElementById("modal-title");
  const listEl = document.getElementById("modal-detail-list");
  if (!backdrop || !titleEl || !listEl) return;

  titleEl.textContent = row.vessel || "";

  listEl.innerHTML = "";

  function addField(label, value) {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value || t("emptyValue");
    listEl.appendChild(dt);
    listEl.appendChild(dd);
  }

  if (maxContainers > 1) {
    addField(
      currentLang === "ja" ? "要予約コンテナ数" : "需訂櫃量",
      String(maxContainers)
    );
  }

  addField(t("modalFieldVessel"), row.vessel);
  addField(t("colContainerSeq"), row.containerSeq);
  addField(t("modalFieldPort"), row.port);
  addField(t("modalFieldClearanceDate"), row.clearanceDate);
  addField(t("modalFieldSailingTime"), row.sailingTime);
  addField(t("modalFieldStuffingTime"), row.stuffingTime);
  addField(t("modalFieldArrivalDate"), row.arrivalDate);
  addField(
    t("modalFieldSO"),
    row.soStatus === "done" ? t("statusSOdone") : t("statusSOpending")
  );
  addField(
    t("modalFieldTelex"),
    row.telexStatus === "done"
      ? t("statusTelexDone")
      : t("statusTelexPending")
  );
  addField(t("modalFieldDrugNo"), row.drugNo);
  addField(t("modalFieldCertNo"), row.quarantineCertNo);

  backdrop.classList.add("active");
}

function openGroupModal(group, kind) {
  const backdrop = document.getElementById("detail-modal-backdrop");
  const titleEl = document.getElementById("modal-title");
  const listEl = document.getElementById("modal-detail-list");
  if (!backdrop || !titleEl || !listEl) return;

  titleEl.textContent = t("modalTitleByKind", group.vessel, kind);

  listEl.innerHTML = "";

  const total = group.maxContainerSeq || group.containers.length || 1;

  group.containers
    .slice()
    .sort(
      (a, b) =>
        (parseInt(a.containerSeq, 10) || 0) -
        (parseInt(b.containerSeq, 10) || 0)
    )
    .forEach((row) => {
      const headerDt = document.createElement("dt");
      headerDt.textContent = t(
        "modalSectionHeader",
        row.containerSeq || "?"
      );
      headerDt.style.marginTop = "12px";
      headerDt.style.fontWeight = "700";
      const headerDd = document.createElement("dd");
      headerDd.textContent = t("totalContainersLabel", total);
      listEl.appendChild(headerDt);
      listEl.appendChild(headerDd);

      function addField(label, value) {
        const dt = document.createElement("dt");
        dt.textContent = label;
        const dd = document.createElement("dd");
        dd.textContent = value || t("emptyValue");
        listEl.appendChild(dt);
        listEl.appendChild(dd);
      }

      addField(t("modalFieldVessel"), row.vessel);
      addField(t("modalFieldPort"), row.port);
      addField(t("modalFieldClearanceDate"), row.clearanceDate);
      addField(t("modalFieldSailingTime"), row.sailingTime);
      addField(t("modalFieldStuffingTime"), row.stuffingTime);
      addField(t("modalFieldArrivalDate"), row.arrivalDate);
      addField(
        t("modalFieldSO"),
        row.soStatus === "done" ? t("statusSOdone") : t("statusSOpending")
      );
      addField(
        t("modalFieldTelex"),
        row.telexStatus === "done"
          ? t("statusTelexDone")
          : t("statusTelexPending")
      );
      addField(t("modalFieldDrugNo"), row.drugNo);
      addField(t("modalFieldCertNo"), row.quarantineCertNo);
    });

  backdrop.classList.add("active");
}

function openDateModal(dateStr, events) {
  const backdrop = document.getElementById("detail-modal-backdrop");
  const titleEl = document.getElementById("modal-title");
  const listEl = document.getElementById("modal-detail-list");
  if (!backdrop || !titleEl || !listEl) return;

  titleEl.textContent = dateStr;

  listEl.innerHTML = "";

  const kindLabelMap = {
    clearance: t("legendClearance"),
    sailing: t("legendSailing"),
    arrival: t("legendArrival")
  };

  events.forEach((ev) => {
    const dt = document.createElement("dt");
    dt.textContent = `${kindLabelMap[ev.kind] || ""}｜${ev.group.vessel}`;
    const dd = document.createElement("dd");
    dd.textContent = t("totalContainersLabel", ev.total);
    listEl.appendChild(dt);
    listEl.appendChild(dd);
  });

  backdrop.classList.add("active");
}

function setupModalClose() {
  const backdrop = document.getElementById("detail-modal-backdrop");
  const closeBtn = document.getElementById("modal-close-btn");
  if (!backdrop || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    backdrop.classList.remove("active");
  });

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove("active");
    }
  });
}

/* -----------------------------------------------------
   Init
----------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageToggle();
  applyTranslations();
  setupSorting();
  setupMainTabs();
  setupCalendarSubTabs();
  setupCalendarNavButtons();
  setupModalClose();

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

  loadSheetData();
  setInterval(loadSheetData, 180000); // 每 3 分鐘自動更新
});
