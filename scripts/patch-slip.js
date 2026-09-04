const fs = require('fs');

// 1. UPDATE CONTROLLERS (remove SMS API dependency)
let tokensCtrl = fs.readFileSync('src/controllers/tokens.controller.js', 'utf8');

// Replace SMS import & calls with clean database/memory notification
tokensCtrl = tokensCtrl.replace(/const smsService = require\('\.\.\/services\/sms\.service'\);/g, '// Clean token management');
tokensCtrl = tokensCtrl.replace(/\/\/ Dispatch Real SMS[\s\S]*?console\.warn\('⚠️ SMS dispatch exception:', smsErr\.message\);\s*\}/g, '// Token record created');
tokensCtrl = tokensCtrl.replace(/message: 'Token issued and SMS dispatched successfully\.',\s*token: tokenNumber,\s*sms: smsResult,/g, "message: 'Token issued successfully.',\n        token: tokenNumber,");

fs.writeFileSync('src/controllers/tokens.controller.js', tokensCtrl, 'utf8');
console.log('✅ src/controllers/tokens.controller.js updated.');

// 2. UPDATE INDEX.HTML & USER.HTML
['index.html', 'user.html'].forEach(filename => {
  let content = fs.readFileSync(filename, 'utf8');

  // Slip generation code
  const slipFunctions = `
/* ============ OFFICIAL TOKEN SLIP (PDF / PRINTABLE) ============ */
function generateTokenSlipHTML(data) {
  return '<!DOCTYPE html>' +
    '<html><head><meta charset="UTF-8"><title>KisanMitra Token Slip - ' + data.token + '</title>' +
    '<style>' +
    '@page { size: A4; margin: 15mm; }' +
    'body { font-family: "Segoe UI", Arial, sans-serif; color: #111; margin: 0; padding: 25px; background: #f4f7f4; }' +
    '.slip { max-width: 650px; margin: 0 auto; background: #fff; border: 2.5px solid #2e7d32; border-radius: 14px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); position: relative; }' +
    '.header { text-align: center; border-bottom: 2px dashed #2e7d32; padding-bottom: 18px; margin-bottom: 22px; }' +
    '.header h1 { margin: 0; color: #2e7d32; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }' +
    '.header p { margin: 6px 0 0; color: #555; font-size: 13px; font-weight: 500; }' +
    '.token-box { background: #e8f5e9; border: 2px solid #4caf50; border-radius: 10px; text-align: center; padding: 14px; margin-bottom: 22px; }' +
    '.token-box span { font-size: 13px; color: #2e7d32; font-weight: bold; text-transform: uppercase; display: block; letter-spacing: 1px; }' +
    '.token-box b { font-size: 34px; color: #1b5e20; letter-spacing: 3px; font-family: monospace; display: block; margin-top: 4px; }' +
    '.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; font-size: 14px; }' +
    '.item { background: #fbfbfb; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #4caf50; border-top: 1px solid #eee; border-right: 1px solid #eee; border-bottom: 1px solid #eee; }' +
    '.item label { color: #666; font-size: 11px; text-transform: uppercase; display: block; font-weight: bold; }' +
    '.item value { font-weight: 700; font-size: 15px; color: #111; display: block; margin-top: 3px; }' +
    '.instructions { background: #fff8e1; border: 1.5px solid #ffe082; border-radius: 8px; padding: 15px 18px; font-size: 13px; line-height: 1.6; color: #5d4037; margin-bottom: 22px; }' +
    '.footer { text-align: center; border-top: 1px solid #ddd; padding-top: 15px; font-size: 12px; color: #777; line-height: 1.6; }' +
    '.btn-print { background: linear-gradient(135deg,#3ecf6f,#2e7d32); color: #fff; border: none; padding: 12px 30px; font-size: 15px; font-weight: 800; border-radius: 25px; cursor: pointer; margin-top: 12px; box-shadow: 0 4px 15px rgba(46,125,50,0.3); }' +
    '@media print { .no-print { display: none !important; } body { background: #fff; padding: 0; } .slip { box-shadow: none; border: 2px solid #000; } }' +
    '</style></head><body>' +
    '<div class="slip">' +
      '<div class="header">' +
        '<h1>🌾 KisanMitra Procurement Token Slip</h1>' +
        '<p>Government of India · Digital Procurement Initiative · Official Gate Pass</p>' +
      '</div>' +
      '<div class="token-box">' +
        '<span>Official Token Number</span>' +
        '<b>' + data.token + '</b>' +
      '</div>' +
      '<div class="details-grid">' +
        '<div class="item"><label>Farmer Name</label><value>' + data.name + '</value></div>' +
        '<div class="item"><label>Mobile Number</label><value>+91 ' + data.phone + '</value></div>' +
        '<div class="item"><label>Crop Commodity</label><value>' + data.crop + '</value></div>' +
        '<div class="item"><label>Quantity</label><value>' + data.qty + '</value></div>' +
        '<div class="item"><label>Designated Mandi</label><value>' + data.mandi + '</value></div>' +
        '<div class="item"><label>Issuance Date & Time</label><value>' + data.date + '</value></div>' +
      '</div>' +
      '<div class="instructions">' +
        '<b>📋 Mandi Gate Entry Instructions:</b><br>' +
        '1. Carry this Token Slip (printed or digital PDF on your phone) with your Aadhaar Card & Bank Passbook.<br>' +
        '2. Reach ' + data.mandi + ' at your designated slot for direct express entry with zero waiting time.<br>' +
        '3. Official MSP rate is guaranteed. Payment will be disbursed within 72 hours via Direct DBT.<br>' +
        '4. 24x7 Farmer Helpline: <b>1800-180-1551</b>' +
      '</div>' +
      '<div class="footer">' +
        'KisanMitra Smart Farm Procurement Portal · Digitally Certified Token · Keep Safe<br>' +
        '<div class="no-print" style="margin-top:14px">' +
          '<button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '</body></html>';
}

function downloadTokenSlip(token) {
  const DB = getDB();
  const d = DB[token] || {
    name: "Registered Farmer",
    phone: "-",
    crop: "Harvest",
    qty: "As registered",
    mandi: "Designated Mandi"
  };

  const slipData = {
    token: token,
    name: d.name || "Farmer",
    phone: d.phone || "-",
    crop: d.crop || "Wheat",
    qty: d.qty || "Quintal",
    mandi: d.mandi || "Mandi",
    date: new Date().toLocaleString("en-IN")
  };

  const html = generateTokenSlipHTML(slipData);
  const win = window.open("", "_blank");
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
  } else {
    // Fallback: download as .html file
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "KisanMitra_Token_" + token + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
`;

  // Clean register function with PDF Download button
  const newRegisterFunc = `
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
  DB[token] = {
    name: name,
    phone: phone,
    crop: crop,
    qty: qty + " quintal",
    mandi: dist + " Mandi",
    steps: [["Registration received",1],["Identity verified",0],["Deposit at mandi",0],["Quality check",0],["Payment",0]]
  };
  localStorage.setItem(DB_KEY, JSON.stringify(DB));
  localStorage.setItem("km_new_token", token);

  // Store in my saved tokens list permanently
  try {
    let myTokens = JSON.parse(localStorage.getItem("km_my_tokens") || "[]");
    if (myTokens.indexOf(token) === -1) {
      myTokens.unshift(token);
      localStorage.setItem("km_my_tokens", JSON.stringify(myTokens));
    }
  } catch(e){}

  const msg = document.getElementById("regMsg");
  msg.style.display = "block";

  msg.innerHTML = '<div style="background:var(--surface);border:2px solid var(--green);border-radius:18px;padding:22px;margin-top:18px;text-align:center;box-shadow:var(--shadow)">' +
    '<div style="font-size:2.2rem">🎉</div>' +
    '<h3 style="color:var(--green);margin:6px 0 2px">Congratulations ' + name + '!</h3>' +
    '<p style="color:var(--muted);font-size:.9rem;margin-bottom:12px">Your procurement token has been generated &amp; stored securely in storage.</p>' +
    '<div style="margin-bottom:16px"><span class="token-chip" style="font-size:1.3rem;padding:8px 24px">' + token + '</span></div>' +
    '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
      '<button type="button" class="btn btn-primary" onclick="downloadTokenSlip(\\'' + token + '\\')" style="padding:12px 24px;font-size:.92rem">📄 Download / Print Token Slip (PDF)</button>' +
      '<button type="button" class="btn btn-ghost" onclick="document.getElementById(\\x27tokenInput\\x27).value=\\x27' + token + '\\x27;trackStatus();" style="padding:12px 20px;font-size:.92rem">🔍 View Live Status</button>' +
    '</div>' +
  '</div>';

  document.getElementById("tokenInput").value = token;
  trackStatus();
  e.target.reset();
  msg.scrollIntoView({behavior:"smooth", block:"center"});
}
`;

  // Find where register is and replace
  const idxRegStart = content.indexOf('/* ============ REGISTRATION ============ */');
  const idxRegEnd = content.indexOf('/* ============ VIDEO DEMO SLIDESHOW ============ */');

  if (idxRegStart !== -1 && idxRegEnd !== -1) {
    content = content.slice(0, idxRegStart) + slipFunctions + '\n' + newRegisterFunc + '\n' + content.slice(idxRegEnd);
    fs.writeFileSync(filename, content, 'utf8');
    console.log(`✅ ${filename} successfully updated with PDF Token Slip generator.`);
  }
});
