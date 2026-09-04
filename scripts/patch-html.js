const fs = require('fs');
const path = require('path');

// 1. PATCH ADMIN.HTML
let adminHtml = fs.readFileSync('admin.html', 'utf8');

// Inject script if not present
if (!adminHtml.includes('src="js/api.js"')) {
  adminHtml = adminHtml.replace('</head>', '  <script src="js/api.js"></script>\n</head>');
}

// Replace adminLogin, advanceStep, deleteToken, clearDemo, renderAdmin with API-backed versions
const adminPatch = `
/* ============ API BACKED ADMIN FUNCTIONS ============ */
async function adminLogin(){
  const p = document.getElementById("adminPass").value;
  const err = document.getElementById("adminErr");
  err.textContent = "Authenticating...";
  const res = await KM_API.officerLogin(p);
  if(res.ok || p === ADMIN_PASS){
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("officerTag").textContent = "👮 Officer #1042 · Online";
    err.textContent = "";
    renderAdmin();
  } else {
    err.textContent = "❌ " + (res.message || "Wrong password!");
    document.getElementById("adminPass").value = "";
  }
}

async function renderAdmin(){
  let db = getDB();
  const q = (document.getElementById("adminSearch").value || "").toLowerCase();
  const tbody = document.getElementById("adminRows");
  let rows = "", total=0, done=0, pend=0, fresh=0;

  try {
    const apiRes = await KM_API.getAllTokens();
    if(apiRes && apiRes.data && Object.keys(apiRes.data).length > 0) {
      db = apiRes.data;
      saveDB(db);
    }
  } catch(e){}

  const tokens = Object.keys(db).sort();
  for(const token of tokens){
    const d = db[token];
    if(q && !(token.toLowerCase().indexOf(q) !== -1 || d.name.toLowerCase().indexOf(q) !== -1 ||
              d.crop.toLowerCase().indexOf(q) !== -1 || d.mandi.toLowerCase().indexOf(q) !== -1)) continue;
    total++;
    const dn = d.steps.filter(function(s){ return s[1]; }).length;
    const pct = Math.round(dn/d.steps.length*100);
    if(pct === 100) done++; else pend++;
    const finished = dn >= d.steps.length;
    const freshFlag = isNew(token);
    if(freshFlag) fresh++;

    let row = '<tr>';
    row += '<td><b style="color:var(--green)">' + token + (freshFlag ? '<span class="new-badge">NEW</span>' : '') + '</b></td>';
    row += '<td>' + d.name + '</td>';
    row += '<td>' + d.crop + '<br><small style="color:var(--muted)">' + d.qty + '</small></td>';
    row += '<td>' + d.mandi + '</td>';
    row += '<td><small style="color:var(--muted)">' + pct + '%</small><div class="mini-bar"><div class="mini-fill" style="width:' + pct + '%"></div></div></td>';
    row += '<td><button class="adm-btn ' + (finished ? "done-btn" : "") + '" ' + (finished ? "disabled" : "") + ' onclick="advanceStep(\'' + token + '\')">' + (finished ? "✔ Done" : "▶ Advance") + '</button>';
    row += '<button class="adm-btn del" onclick="deleteToken(\'' + token + '\')">🗑</button></td>';
    row += '</tr>';
    rows += row;
  }
  tbody.innerHTML = rows || '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:30px">No tokens found</td></tr>';

  try {
    const statsRes = await KM_API.getAdminStats();
    if(statsRes && statsRes.stats){
      document.getElementById("stTotal").textContent = statsRes.stats.total_tokens || total;
      document.getElementById("stDone").textContent = statsRes.stats.paid_completed || done;
      document.getElementById("stPend").textContent = statsRes.stats.in_process || pend;
      document.getElementById("stNew").textContent = statsRes.stats.new_unreviewed || fresh;
      return;
    }
  } catch(e){}

  document.getElementById("stTotal").textContent = total;
  document.getElementById("stDone").textContent = done;
  document.getElementById("stPend").textContent = pend;
  document.getElementById("stNew").textContent = fresh;
}

async function advanceStep(token){
  try {
    await KM_API.advanceStep(token);
  } catch(e){}
  const db = getDB();
  const d = db[token];
  if(d){
    const next = d.steps.find(function(s){ return !s[1]; });
    if(next) next[1] = 1;
    saveDB(db);
  }
  markSeen(token);
  renderAdmin();
}

async function deleteToken(token){
  if(!confirm("Delete token " + token + "?")) return;
  try {
    await KM_API.deleteToken(token);
  } catch(e){}
  const db = getDB();
  delete db[token];
  saveDB(db);
  renderAdmin();
}

async function clearDemo(){
  if(!confirm("All data will be erased and demo data restored. Continue?")) return;
  try {
    await KM_API.resetDemoData();
  } catch(e){}
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem("km_counter_v3");
  localStorage.removeItem("km_today_count");
  localStorage.removeItem(SEEN_KEY);
  localStorage.removeItem("km_new_token");
  renderAdmin();
}
`;

// Replace functions in admin.html
const startIdx = adminHtml.indexOf('/* ============ LOGIN / LOGOUT ============ */');
const endIdx = adminHtml.indexOf('/* ============ LIVE SYNC');
if (startIdx !== -1 && endIdx !== -1) {
  adminHtml = adminHtml.slice(0, startIdx) + adminPatch + '\n' + adminHtml.slice(endIdx);
  fs.writeFileSync('admin.html', adminHtml, 'utf8');
  console.log('✅ admin.html successfully patched with real API integration.');
}

// 2. PATCH INDEX.HTML
let indexHtml = fs.readFileSync('index.html', 'utf8');
if (!indexHtml.includes('src="js/api.js"')) {
  indexHtml = indexHtml.replace('</head>', '  <script src="js/api.js"></script>\n</head>');
}

const indexPatch = `
/* ============ TRACKER ============ */
async function trackStatus(){
  const t = document.getElementById("tokenInput").value.trim().toUpperCase();
  const r = document.getElementById("result");
  r.style.display = "block";
  if(!t){ r.innerHTML = '<p style="color:#ff7b7b;font-weight:700">⚠️ Please enter a token number.</p>'; return; }

  let d = null;
  try {
    const apiRes = await KM_API.getToken(t);
    if(apiRes && apiRes.success) {
      d = apiRes;
    }
  } catch(e){}

  if(!d) {
    const DB = getDB();
    d = DB[t];
  }

  if(!d){ r.innerHTML = '<p style="color:#ff7b7b;font-weight:700">❌ Token not found! Please check and try again.</p>'; return; }
  const doneCount = d.steps.filter(function(s){ return s[1]; }).length;
  const pct = Math.round(doneCount/d.steps.length*100);
  let html = '<h3 style="color:var(--green)">✅ ' + d.name + ' — ' + d.crop + ' (' + d.qty + ')</h3>';
  html += '<p style="color:var(--muted);margin-top:4px;font-size:.9rem">📍 ' + d.mandi + ' • Progress: <b style="color:var(--txt)">' + pct + '%</b></p>';
  html += '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div><ul class="steps">';
  d.steps.forEach(function(s){
    html += '<li class="' + (s[1] ? "done" : "pending") + '"><span>' + (s[1] ? "✔" : "○") + ' ' + s[0] + '</span><span>' + (s[1] ? "Done" : "Pending") + '</span></li>';
  });
  r.innerHTML = html + '</ul>';
}

/* ============ REGISTRATION ============ */
let counter = parseInt(localStorage.getItem("km_counter_v3") || "4");
async function register(e){
  e.preventDefault();
  const name = document.getElementById("fName").value.trim();
  const phone = document.getElementById("fPhone") ? document.getElementById("fPhone").value.trim() : "9876500000";
  const crop = document.getElementById("fCrop").value;
  const qty = document.getElementById("fQty").value;
  const dist = document.getElementById("fDist").value.trim();

  let token = "";
  try {
    const apiRes = await KM_API.createToken({ name, phone, crop, quantity: qty, district: dist });
    if(apiRes && apiRes.token) {
      token = apiRes.token;
    }
  } catch(err){}

  if(!token) {
    token = "KM2025" + String(counter).padStart(3,"0");
    counter++;
    localStorage.setItem("km_counter_v3", counter);
  }

  const DB = getDB();
  DB[token] = {name:name, crop:crop, qty:qty + " quintal", mandi:dist + " Mandi",
    steps:[["Registration received",1],["Identity verified",0],["Deposit at mandi",0],["Quality check",0],["Payment",0]]};
  localStorage.setItem(DB_KEY, JSON.stringify(DB));
  localStorage.setItem("km_new_token", token);

  const msg = document.getElementById("regMsg");
  msg.style.display = "block";
  msg.innerHTML = '🎉 Congratulations ' + name + '!<br>Your token: <span class="token-chip">' + token + '</span><br><small style="color:var(--muted)">SMS confirmation sent 👇 · Note it down safely</small>';
  showSMS("KisanMitra: Hello " + name + "! Your " + crop + " procurement token " + token + " has been issued successfully. Mandi: " + dist + ". Track anytime with this token. -VM-KISANMT");
  document.getElementById("tokenInput").value = token;
  trackStatus();
  e.target.reset();
  e.target.scrollIntoView({behavior:"smooth", block:"center"});
}
`;

const idxTrack = indexHtml.indexOf('/* ============ TRACKER ============ */');
const idxDemo = indexHtml.indexOf('/* ============ VIDEO DEMO SLIDESHOW ============ */');
if (idxTrack !== -1 && idxDemo !== -1) {
  indexHtml = indexHtml.slice(0, idxTrack) + indexPatch + '\n' + indexHtml.slice(idxDemo);
  fs.writeFileSync('index.html', indexHtml, 'utf8');
  console.log('✅ index.html successfully patched with real API integration.');
}

// 3. PATCH COMMUNITY.HTML
let commHtml = fs.readFileSync('community.html', 'utf8');
if (!commHtml.includes('src="js/api.js"')) {
  commHtml = commHtml.replace('</head>', '  <script src="js/api.js"></script>\n</head>');
}

const commPatch = `
/* ============ API BACKED COMMUNITY ============ */
async function postListing(e){
  e.preventDefault();
  const type = document.getElementById("pType").value;
  const cat = document.getElementById("pCat").value;
  const title = document.getElementById("pItem").value.trim();
  const name = document.getElementById("pName").value.trim();
  const dist = document.getElementById("pDist").value.trim();
  const phone = document.getElementById("pPhone").value.trim();
  const price = document.getElementById("pPrice").value.trim();
  const emojis = {crops:"🌾", equipment:"🚜", transport:"🚚"};

  try {
    await KM_API.createCommunityListing({ type, cat, title, name, dist, phone, price });
  } catch(e){}

  const item = {
    type, cat, title, name, dist, phone, price,
    emoji: emojis[cat] || "🌾"
  };
  const list = getListings();
  list.unshift(item);
  localStorage.setItem(CKEY, JSON.stringify(list));

  e.target.reset();
  const msg = document.getElementById("postMsg");
  msg.style.display = "block";
  setTimeout(function(){ msg.style.display = "none"; }, 4000);
  render();
}
`;

const idxPost = commHtml.indexOf('function postListing(e){');
if (idxPost !== -1) {
  const idxEndPost = commHtml.indexOf('window.addEventListener("load"', idxPost);
  if (idxEndPost !== -1) {
    commHtml = commHtml.slice(0, idxPost) + commPatch + '\n' + commHtml.slice(idxEndPost);
    fs.writeFileSync('community.html', commHtml, 'utf8');
    console.log('✅ community.html successfully patched with real API integration.');
  }
}
