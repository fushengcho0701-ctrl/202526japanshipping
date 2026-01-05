let allData = [];
let currentMode = "month"; // month, week, sailing
let baseDate = new Date();
const wNames = ["日", "一", "二", "三", "四", "五", "六"];

/* -----------------------------------------------------
   1. 資料獲取與解析
----------------------------------------------------- */
async function fetchData() {
    try {
        const response = await fetch(window.SHEET_CSV_URL);
        const text = await response.text();
        const rows = text.trim().split("\n").slice(1);
        
        allData = rows.map(line => {
            const c = line.split(",");
            return {
                vessel: c[0] || "未知船名",
                container: c[1] || "1",
                sailingDate: parseDate(c[3]),
                arrivalDate: parseDate(c[6]),
                so: c[7]?.trim() === "1" ? "OK" : "Pending",
                telex: c[11]?.trim() === "1" ? "OK" : "Pending",
                port: c[5] || "",
                raw: c
            };
        });
        render();
    } catch (err) { console.error("CSV Load Error:", err); }
}

function parseDate(str) {
    if (!str) return null;
    let clean = str.replace(/星期./g, "").trim().replace(/\//g, "-");
    let d = new Date(clean.includes(" ") ? clean : `${clean} 00:00`);
    return isNaN(d.getTime()) ? null : d;
}

/* -----------------------------------------------------
   2. 核心渲染
----------------------------------------------------- */
function render() {
    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";
    
    // 生成星期標題列
    const head = document.createElement("div");
    head.className = "calendar-row";
    head.innerHTML = wNames.map(w => `<div class="calendar-header-cell">${w}</div>`).join("");
    grid.appendChild(head);

    // 計算日期範圍
    let days = [];
    if (currentMode === "week") {
        let start = new Date(baseDate);
        start.setDate(baseDate.getDate() - baseDate.getDay());
        for(let i=0; i<7; i++) days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate()+i));
    } else {
        let first = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        let start = new Date(first.setDate(first.getDate() - first.getDay()));
        for(let i=0; i<42; i++) days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate()+i));
    }

    // 渲染日期格
    for (let i = 0; i < days.length; i += 7) {
        const row = document.createElement("div");
        row.className = "calendar-row";
        
        days.slice(i, i + 7).forEach(date => {
            const cell = document.createElement("div");
            cell.className = "calendar-cell";
            cell.innerHTML = `<div class="day-num">${date.getDate()}</div>`;

            allData.forEach(item => {
                // 處理開船事件
                if (isSameDay(item.sailingDate, date)) {
                    cell.appendChild(createChip(item, "sailing", "開船"));
                }
                // 處理抵達事件 (只看開船模式下隱藏)
                if (currentMode !== "sailing" && isSameDay(item.arrivalDate, date)) {
                    cell.appendChild(createChip(item, "arrival", "抵達"));
                }
            });
            row.appendChild(cell);
        });
        grid.appendChild(row);
    }
    updateLabel();
}

function createChip(item, type, label) {
    const chip = document.createElement("div");
    
    // 判斷是否超過 3 天 (自動折疊)
    const limit = new Date();
    limit.setDate(limit.getDate() - 3);
    const isExpired = item.arrivalDate && item.arrivalDate < limit;

    if (isExpired) {
        chip.className = "event-chip event-collapsed";
        chip.innerText = "已結案 (點擊查看)";
        chip.onclick = () => {
            chip.classList.remove("event-collapsed");
            chip.className = `event-chip ${type}`;
            fillFullContent(chip, item, label);
        };
    } else {
        chip.className = `event-chip ${type}`;
        fillFullContent(chip, item, label);
        chip.onclick = () => showModal(item);
    }
    return chip;
}

function fillFullContent(el, item, label) {
    let html = `<strong>${label}</strong>｜${item.vessel} (${item.container})`;
    if (item.arrivalDate) {
        html += `<div class="arrival-line">抵達：${item.arrivalDate.getMonth()+1}/${item.arrivalDate.getDate()}</div>`;
    }
    el.innerHTML = html;
}

/* -----------------------------------------------------
   3. 輔助功能
----------------------------------------------------- */
function isSameDay(d1, d2) {
    return d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function updateLabel() {
    const label = document.getElementById("period-label");
    label.innerText = `${baseDate.getFullYear()}年 ${baseDate.getMonth()+1}月`;
}

function showModal(item) {
    const m = document.getElementById("modal-backdrop");
    document.getElementById("modal-title").innerText = item.vessel;
    document.getElementById("modal-body").innerHTML = `
        <p><b>櫃號：</b> 第 ${item.container} 櫃</p>
        <p><b>抵達港口：</b> ${item.port}</p>
        <p><b>SO 狀態：</b> ${item.so === "OK" ? "✅ 已給" : "❌ 尚未"}</p>
        <p><b>電放單：</b> ${item.telex === "OK" ? "✅ 已給" : "❌ 尚未"}</p>
    `;
    m.style.display = "flex";
}

// 事件監聽
document.getElementById("btn-prev").onclick = () => { baseDate.setMonth(baseDate.getMonth()-1); render(); };
document.getElementById("btn-next").onclick = () => { baseDate.setMonth(baseDate.getMonth()+1); render(); };
document.getElementById("btn-today").onclick = () => { baseDate = new Date(); render(); };
document.getElementById("modal-close").onclick = () => document.getElementById("modal-backdrop").style.display = "none";

document.querySelectorAll(".view-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentMode = btn.dataset.view;
        render();
    };
});

window.onload = fetchData;
