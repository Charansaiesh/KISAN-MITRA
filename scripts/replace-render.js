const fs = require('fs');

let admin = fs.readFileSync('admin.html', 'utf8');

// Replace the entire renderAdmin function with a perfectly clean implementation
const cleanRenderAdmin = `
async function renderAdmin(){
  let db = getDB();
  const q = (document.getElementById("adminSearch").value || "").toLowerCase();
  const tbody = document.getElementById("adminRows");
  let rows = "", total = 0, done = 0, pend = 0, fresh = 0;

  try {
    if (typeof KM_API !== "undefined" && KM_API.getAllTokens) {
      const apiRes = await KM_API.getAllTokens();
      if (apiRes && apiRes.data && Object.keys(apiRes.data).length > 0) {
        db = apiRes.data;
        saveDB(db);
      }
    }
  } catch(e){}

  const tokens = Object.keys(db).sort();
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const d = db[token];
    if (!d || !d.steps) continue;

    if (q && !(token.toLowerCase().indexOf(q) !== -1 || (d.name || "").toLowerCase().indexOf(q) !== -1 ||
              (d.crop || "").toLowerCase().indexOf(q) !== -1 || (d.mandi || "").toLowerCase().indexOf(q) !== -1)) continue;
    total++;
    const dn = d.steps.filter(function(s){ return s[1]; }).length;
    const pct = Math.round(dn / d.steps.length * 100);
    if (pct === 100) done++; else pend++;
    const finished = dn >= d.steps.length;
    const freshFlag = isNew(token);
    if (freshFlag) fresh++;

    let row = "<tr>";
    row += '<td><b style="color:var(--green)">' + token + (freshFlag ? '<span class="new-badge">NEW</span>' : '') + '</b></td>';
    row += "<td>" + (d.name || "-") + "</td>";
    row += "<td>" + (d.crop || "-") + '<br><small style="color:var(--muted)">' + (d.qty || "-") + "</small></td>";
    row += "<td>" + (d.mandi || "-") + "</td>";
    row += '<td><small style="color:var(--muted)">' + pct + '%</small><div class="mini-bar"><div class="mini-fill" style="width:' + pct + '%"></div></div></td>';
    row += '<td><button class="adm-btn ' + (finished ? "done-btn" : "") + '" ' + (finished ? "disabled" : "") + ' onclick="advanceStep(&apos;' + token + '&apos;)">' + (finished ? "✔ Done" : "▶ Advance") + '</button>';
    row += '<button class="adm-btn del" onclick="deleteToken(&apos;' + token + '&apos;)">🗑</button></td>';
    row += "</tr>";
    rows += row;
  }
  tbody.innerHTML = rows || '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:30px">No tokens found</td></tr>';

  try {
    if (typeof KM_API !== "undefined" && KM_API.getAdminStats) {
      const statsRes = await KM_API.getAdminStats();
      if (statsRes && statsRes.stats) {
        document.getElementById("stTotal").textContent = statsRes.stats.total_tokens || total;
        document.getElementById("stDone").textContent = statsRes.stats.paid_completed || done;
        document.getElementById("stPend").textContent = statsRes.stats.in_process || pend;
        document.getElementById("stNew").textContent = statsRes.stats.new_unreviewed || fresh;
        return;
      }
    }
  } catch(e){}

  document.getElementById("stTotal").textContent = total;
  document.getElementById("stDone").textContent = done;
  document.getElementById("stPend").textContent = pend;
  document.getElementById("stNew").textContent = fresh;
}
`;

const idxStart = admin.indexOf('async function renderAdmin(){');
const idxEnd = admin.indexOf('async function advanceStep(token){');

if (idxStart !== -1 && idxEnd !== -1) {
  admin = admin.slice(0, idxStart) + cleanRenderAdmin + '\n\n' + admin.slice(idxEnd);
  fs.writeFileSync('admin.html', admin, 'utf8');
  console.log('✅ admin.html renderAdmin successfully replaced.');
}
