let allData = [];
let currentMode = "month";
let baseDate = new Date();
const wNames = ["日", "一", "二", "三", "四", "五", "六"];

async function init() {
    try {
        const res = await fetch(window.SHEET_CSV_URL);
        const text = await res.text();
        const rows = text.trim().split("\n").slice(1);
        
        allData = rows.map(line => {
            const c = line.split(",");
            return {
                vessel: c[0] || "",
                container: c[1] || "",
                sailingDate: parseDate(c[3]),
                arrivalDate: parseDate(c[6]),
                port: c[5] || "",
                so: c[7]?.trim() === "1",
                telex: c[11]?.trim() === "1",
                raw: c
            };
        });
        updateDisplay();
    } catch (e) { console.error("Data Load Error", e); }
}

function parseDate(s) {
    if (!s || s === "—") return null;
    let clean = s.replace(/星期./g, "").trim().replace(/\//g, "-");
    let d = new Date(clean.includes(" ") ? clean : `${clean} 00:00`);
    return isNaN(d.getTime()) ? null : d;
}

function updateDisplay() {
    const key = document.getElementById("search-input").value.toLowerCase();
    const filtered = allData.filter(d => d.vessel.toLowerCase().includes(key) || d.port.toLowerCase().includes(key));
    renderTable(filtered);
    renderCalendar(filtered);
}

function renderTable(data) {
    const activeBody = document.getElementById("active-tbody");
    const historyBody = document.getElementById("history-tbody");
    activeBody.innerHTML = ""; historyBody.innerHTML = "";
    const today = new Date(); today.setHours(0,0,0,0);

    data.forEach(d => {
        const arrived = d.arrivalDate && d.arrivalDate < today;
        const html = `
            <tr>
                <td><b>${d.vessel}</b></td>
                <td>第 ${d.container} 櫃</td>
                <td>${d.raw[3] || "—"}</td>
                <td>${d.port}</td>
                <td>${d.raw[6] || "—"}</td>
                <td class="${d.so?'status-ok':'status-pending'}">${d.so?'已給':'未給'}</td>
                <td class="${d.telex?'status-ok':'status-pending'}">${d.telex?'已給':'未給'}</td>
            </tr>
        `;
        if (arrived) historyBody.innerHTML += html;
        else activeBody.innerHTML += html;
    });
}

function renderCalendar(data) {
    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";
    
    // Header
    const head = document.createElement("div"); head.className = "calendar-row";
    head.innerHTML = wNames.map(w => `<div class="cal-head-cell">${w}</div>`).join("");
    grid.appendChild(head);

    let start = new Date(baseDate);
    if (currentMode === "week") start.setDate(baseDate.getDate() - baseDate.getDay());
    else { start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1); start.setDate(start.getDate() - start.getDay()); }
    
    const count = currentMode === "week" ? 7 : 42;
    const days = [...Array(count)].map((_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));

    for (let i = 0; i < days.length; i += 7) {
        const row = document.createElement("div"); row.className = "calendar-row";
        days.slice(i, i + 7).forEach(date => {
            const cell = document.createElement("div"); cell.className = "cal-date-cell";
            cell.innerHTML = `<div style="font-weight:700; color:#86868b">${date.getDate()}</div>`;
            data.forEach(item => {
                if (isSameDay(item.sailingDate, date)) cell.appendChild(createChip(item, "sailing"));
                if (currentMode !== "sailing" && isSameDay(item.arrivalDate, date)) cell.appendChild(createChip(item, "arrival"));
            });
            row.appendChild(cell);
        });
        grid.appendChild(row);
    }
    document.getElementById("period-label").innerText = `${baseDate.getFullYear()}年 ${baseDate.getMonth()+1}月`;
}

function createChip(item, type) {
    const chip = document.createElement("div");
    const limit = new Date(); limit.setDate(limit.getDate() - 3);
    const expired = item.arrivalDate && item.arrivalDate < limit;

    if (expired) {
        chip.className = "event-chip chip-expired"; chip.innerText = "已過期 (點擊展開)";
        chip.onclick = (e) => { e.stopPropagation(); fillFull(chip, item, type); };
    } else {
        fillFull(chip, item, type);
        chip.onclick = (e) => { e.stopPropagation(); showModal(item); };
    }
    return chip;
}

function fillFull(el, item, type) {
    el.className = `event-chip chip-${type}`;
    const label = type === "sailing" ? "開船" : "抵達";
    let html = `<strong>${label}</strong>｜${item.vessel}`;
    if (item.arrivalDate) html += `<div class="arrival-line">抵達：${item.arrivalDate.getMonth()+1}/${item.arrivalDate.getDate()}</div>`;
    el.innerHTML = html;
}

function isSameDay(d1, d2) { return d1 && d2 && d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate(); }

function showModal(d) {
    document.getElementById("modal-title").innerText = d.vessel;
    document.getElementById("modal-body").innerHTML = `<p>櫃號：第 ${d.container} 櫃</p><p>港口：${d.port}</p><p>抵達日：${d.raw[6]}</p><hr><p><b>SO:</b> ${d.so?'✅ 已給':'❌ 尚未'}</p><p><b>電放單:</b> ${d.telex?'✅ 已給':'❌ 尚未'}</p>`;
    document.getElementById("modal-backdrop").style.display = "flex";
}

// 事件綁定
document.getElementById("btn-prev").onclick = () => { baseDate.setMonth(baseDate.getMonth()-1); updateDisplay(); };
document.getElementById("btn-next").onclick = () => { baseDate.setMonth(baseDate.getMonth()+1); updateDisplay(); };
document.getElementById("btn-today").onclick = () => { baseDate = new Date(); updateDisplay(); };
document.getElementById("modal-close").onclick = () => document.getElementById("modal-backdrop").style.display = "none";
document.getElementById("search-input").oninput = updateDisplay;

document.querySelectorAll(".tab-btn").forEach(btn => btn.onclick = () => {
    document.querySelectorAll(".tab-btn, .view").forEach(el => el.classList.remove("active"));
    btn.classList.add("active"); document.getElementById(btn.dataset.target).classList.add("active");
});

document.querySelectorAll(".sub-btn").forEach(btn => btn.onclick = () => {
    currentMode = btn.dataset.mode;
    document.querySelectorAll(".sub-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active"); updateDisplay();
});

window.onload = init;
