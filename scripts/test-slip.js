function createSlipHtml(data) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>KisanMitra Token Slip - ${data.token}</title>
<style>
  @page { size: A4; margin: 15mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; margin: 0; padding: 20px; background: #fff; }
  .slip { max-width: 650px; margin: 0 auto; border: 2px solid #2e7d32; border-radius: 12px; padding: 25px; position: relative; }
  .header { text-align: center; border-bottom: 2px dashed #2e7d32; padding-bottom: 15px; margin-bottom: 20px; }
  .header h1 { margin: 0; color: #2e7d32; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
  .header p { margin: 4px 0 0; color: #555; font-size: 13px; }
  .token-box { background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; text-align: center; padding: 12px; margin-bottom: 20px; }
  .token-box span { font-size: 13px; color: #2e7d32; font-weight: bold; text-transform: uppercase; display: block; }
  .token-box b { font-size: 32px; color: #1b5e20; letter-spacing: 3px; font-family: monospace; }
  .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 14px; }
  .item { background: #f9f9f9; padding: 10px 14px; border-radius: 6px; border-left: 3px solid #4caf50; }
  .item label { color: #666; font-size: 11px; text-transform: uppercase; display: block; font-weight: bold; }
  .item value { font-weight: 600; font-size: 15px; color: #111; display: block; margin-top: 2px; }
  .instructions { background: #fff8e1; border: 1px solid #ffe082; border-radius: 6px; padding: 12px 15px; font-size: 12px; line-height: 1.5; color: #795548; margin-bottom: 20px; }
  .footer { text-align: center; border-top: 1px solid #ddd; padding-top: 12px; font-size: 11px; color: #777; }
  .btn-print { background: #2e7d32; color: #fff; border: none; padding: 10px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-top: 10px; }
  @media print { .no-print { display: none !important; } .slip { border: 2px solid #000; } }
</style>
</head>
<body>
<div class="slip">
  <div class="header">
    <h1>🌾 KisanMitra Procurement Token Slip</h1>
    <p>Government of India · Digital Procurement Initiative · Official Gate Entry Pass</p>
  </div>
  <div class="token-box">
    <span>Official Token Number</span>
    <b>${data.token}</b>
  </div>
  <div class="details-grid">
    <div class="item"><label>Farmer Name</label><value>${data.name}</value></div>
    <div class="item"><label>Mobile Number</label><value>+91 ${data.phone}</value></div>
    <div class="item"><label>Crop Commodity</label><value>${data.crop}</value></div>
    <div class="item"><label>Quantity</label><value>${data.qty}</value></div>
    <div class="item"><label>Designated Mandi</label><value>${data.mandi}</value></div>
    <div class="item"><label>Issue Date & Time</label><value>${data.date}</value></div>
  </div>
  <div class="instructions">
    <b>📋 Mandi Visit Instructions:</b><br>
    1. Carry this Token Slip (printed or on phone) along with your Aadhaar Card & Bank Passbook.<br>
    2. Reach ${data.mandi} during your allotted time window for direct express entry with zero waiting time.<br>
    3. Payment will be disbursed within 72 hours directly to your DBT-linked bank account.<br>
    4. 24x7 Farmer Helpline: <b>1800-180-1551</b>
  </div>
  <div class="footer">
    KisanMitra Smart Procurement Portal · Digitally Verified · Keep this document safe
    <div class="no-print" style="margin-top:15px">
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>
  </div>
</div>
</body>
</html>`;
}
console.log('Slip template test length:', createSlipHtml({ token: 'KM20251004', name: 'Ram Yadav', phone: '9876543210', crop: 'Wheat', qty: '45 quintal', mandi: 'Lucknow Mandi', date: new Date().toLocaleString('en-IN') }).length);
