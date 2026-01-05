/* -----------------------------------------------------
   關鍵邏輯 1: 建立 Chip 並處理 3 天前折疊
----------------------------------------------------- */
function createCalendarEventChip(row, typeClass, labelText) {
  const chip = document.createElement("div");
  chip.className = `calendar-event ${typeClass}`;

  // 計算今天與 3 天前的界限
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limitDate = new Date(today);
  limitDate.setDate(today.getDate() - 3);

  // 判斷是否過期 (抵達日早於 limitDate)
  const isExpired = row.arrivalDate && row.arrivalDate < limitDate;

  if (isExpired) {
    chip.classList.add("event-expired");
    chip.setAttribute("data-expanded", "false");
    chip.innerHTML = `<div style="text-align:center;">已過期 (點擊查看)</div>`;
    
    chip.onclick = (e) => {
      e.stopPropagation();
      const isExpanded = chip.getAttribute("data-expanded") === "true";
      if (!isExpanded) {
        renderFullEventContent(chip, row, labelText);
        chip.setAttribute("data-expanded", "true");
      } else {
        chip.innerHTML = `<div style="text-align:center;">已過期 (點擊查看)</div>`;
        chip.setAttribute("data-expanded", "false");
      }
    };
  } else {
    renderFullEventContent(chip, row, labelText);
    chip.onclick = (e) => {
      e.stopPropagation();
      showDetailModal(row); // 顯示彈窗
    };
  }
  return chip;
}

function renderFullEventContent(container, row, labelText) {
  let html = `<strong>${labelText}</strong>｜${row.vessel}（第 ${row.containerNo} 櫃）`;
  if (row.arrivalDate) {
    const arr = row.arrivalDate;
    const w = weekdayNamesShort ? weekdayNamesShort[arr.getDay()] : "";
    html += `<div class="arrival-info-line">抵達日：${arr.getMonth() + 1}/${arr.getDate()}（${w}）</div>`;
  }
  container.innerHTML = html;
}

/* -----------------------------------------------------
   關鍵邏輯 2: 修正電放單判定
----------------------------------------------------- */
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    // 假設電放單在 cols[11]
    const telexVal = (cols[11] || "").trim();
    
    rows.push({
      vessel: cols[0] || "",
      containerNo: cols[1] || "1",
      // ... 其餘欄位 ...
      soStatus: (cols[7] || "").trim() === "1" ? "done" : "pending",
      telexStatus: telexVal === "1" ? "done" : "pending", // 修正：1 為已給
      sailingDate: parseDateToObj(cols[3]),
      arrivalDate: parseDateToObj(cols[6])
    });
  }
  return rows;
}

/* -----------------------------------------------------
   關鍵邏輯 3: 行事曆渲染 (強制 7 欄網格)
----------------------------------------------------- */
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const start = startOfWeek(new Date(y, m, 1));
  const days = [...Array(42)].map((_, i) => addDays(start, i));

  // 星期標題
  const header = document.createElement("div");
  header.className = "calendar-week";
  header.innerHTML = ["日","一","二","三","四","五","六"].map(w => `<div class="calendar-weekday">${w}</div>`).join("");
  grid.appendChild(header);

  const box = document.createElement("div");
  box.className = "calendar-month"; // 套用 CSS 的 7 欄 Grid

  days.forEach((date) => {
    const cell = document.createElement("div");
    cell.className = "calendar-month-cell";
    cell.innerHTML = `<div class="day-number">${date.getDate()}</div>`;

    filteredData.forEach((item) => {
      // 開船事件：不論模式都顯示
      if (isSameDate(item.sailingDate, date)) {
        cell.appendChild(createCalendarEventChip(item, "event-sailing", "開船"));
      }
      // 抵達事件：非「只看開船」模式才顯示
      if (calendarView !== "sailing-only" && isSameDate(item.arrivalDate, date)) {
        cell.appendChild(createCalendarEventChip(item, "event-arrival", "抵達"));
      }
    });
    box.appendChild(cell);
  });
  grid.appendChild(box);
}
