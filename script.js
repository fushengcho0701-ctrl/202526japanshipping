let rawData = [];
let filteredData = [];
let calendarView = "month"; // 預設為月視圖
let currentDate = new Date();
const weekdayNamesShort = ["日", "一", "二", "三", "四", "五", "六"];

/* 核心：建立事件 Chip 並判斷 3 天前折疊 */
function createCalendarEventChip(row, typeClass, labelText) {
  const chip = document.createElement("div");
  chip.className = `calendar-event ${typeClass}`;

  // 計算今天與 3 天前的界限
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limitDate = new Date(today);
  limitDate.setDate(today.getDate() - 3);

  // 判斷是否過期 (抵達日早於 3 天前)
  const isExpired = row.arrivalDate && row.arrivalDate < limitDate;

  if (isExpired) {
    chip.classList.add("event-expired");
    chip.setAttribute("data-expanded", "false");
    chip.innerHTML = `<div style="text-align:center; font-style:italic;">已過期 (點擊展開)</div>`;
    
    chip.onclick = (e) => {
      e.stopPropagation();
      const isExpanded = chip.getAttribute("data-expanded") === "true";
      if (!isExpanded) {
        renderFullEventContent(chip, row, labelText);
        chip.setAttribute("data-expanded", "true");
      } else {
        chip.innerHTML = `<div style="text-align:center; font-style:italic;">已過期 (點擊展開)</div>`;
        chip.setAttribute("data-expanded", "false");
      }
    };
  } else {
    renderFullEventContent(chip, row, labelText);
    chip.onclick = (e) => {
      e.stopPropagation();
      showDetailModal(row);
    };
  }
  return chip;
}

function renderFullEventContent(container, row, labelText) {
  let html = `<strong>${labelText}</strong>｜${row.vessel}（第 ${row.containerNo} 櫃）`;
  // 在開船方塊中自動加註抵達日
  if (row.arrivalDate) {
    const arr = row.arrivalDate;
    html += `<div class="arrival-info-line">抵達日：${arr.getMonth() + 1}/${arr.getDate()}（${weekdayNamesShort[arr.getDay()]}）</div>`;
  }
  container.innerHTML = html;
}

/* 渲染邏輯：強制 7 天網格 */
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const startDay = new Date(y, m, 1);
  const start = new Date(startDay.setDate(startDay.getDate() - startDay.getDay()));
  const days = [...Array(42)].map((_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));

  // 星期標題
  const header = document.createElement("div");
  header.className = "calendar-week";
  header.innerHTML = weekdayNamesShort.map(w => `<div class="calendar-weekday">${w}</div>`).join("");
  grid.appendChild(header);

  const box = document.createElement("div");
  box.className = calendarView === "week" ? "calendar-week" : "calendar-month";

  const displayDays = calendarView === "week" ? days.slice(0, 7) : days;

  displayDays.forEach((date) => {
    const cell = document.createElement("div");
    cell.className = "calendar-month-cell";
    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    filteredData.forEach((item) => {
      // 開船事件
      if (isSameDate(item.sailingDate, date)) {
        cell.appendChild(createCalendarEventChip(item, "event-sailing", "開船"));
      }
      // 只有非「只看開船」模式才顯示抵達方塊
      if (calendarView !== "sailing-only" && isSameDate(item.arrivalDate, date)) {
        cell.appendChild(createCalendarEventChip(item, "event-arrival", "抵達"));
      }
    });
    box.appendChild(cell);
  });
  grid.appendChild(box);
  document.getElementById("period-label").textContent = `${y}/${m + 1}`;
}

/* 解析 CSV 與資料載入 */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  return lines.slice(1).map(line => {
    const cols = line.split(",");
    return {
      vessel: cols[0] || "",
      containerNo: cols[1] || "1",
      sailingDate: parseDateToObj(cols[3]),
      arrivalDate: parseDateToObj(cols[6]),
      // 電放/SO 狀態：1 為已給 (done)
      soStatus: cols[7]?.trim() === "1" ? "done" : "pending",
      telexStatus: cols[11]?.trim() === "1" ? "done" : "pending",
      raw: cols
    };
  });
}

function parseDateToObj(text) {
  if (!text) return null;
  let clean = text.replace(/星期./g, "").trim().replace(/\//g, "-");
  let d = new Date(clean.includes(" ") ? clean : `${clean} 00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function isSameDate(d1, d2) {
  return d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

async function loadData() {
  const res = await fetch(window.SHEET_CSV_URL);
  const csvText = await res.text();
  rawData = parseCSV(csvText);
  filteredData = rawData;
  renderCalendar();
}

/* 初始化事件 */
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  document.querySelectorAll(".subtab-button").forEach(btn => btn.onclick = () => {
    calendarView = btn.dataset.calView;
    document.querySelectorAll(".subtab-button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderCalendar();
  });
  document.getElementById("btn-prev-period").onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
  document.getElementById("btn-next-period").onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
  document.getElementById("btn-today").onclick = () => { currentDate = new Date(); renderCalendar(); };
  document.getElementById("modal-close-btn").onclick = () => document.getElementById("detail-modal-backdrop").classList.remove("active");
});

function showDetailModal(row) {
  document.getElementById("modal-title").textContent = row.vessel;
  document.getElementById("modal-detail-list").innerHTML = row.raw.map((v, i) => `<dt>欄位 ${i}</dt><dd>${v}</dd>`).join("");
  document.getElementById("detail-modal-backdrop").classList.add("active");
}
