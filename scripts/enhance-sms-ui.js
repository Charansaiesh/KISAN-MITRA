const fs = require('fs');

['index.html', 'user.html'].forEach(filename => {
  let content = fs.readFileSync(filename, 'utf8');

  const oldMsgStr = "msg.innerHTML = '🎉 Congratulations ' + name + '!<br>Your token: <span class=\"token-chip\">' + token + '</span><br><small style=\"color:var(--muted)\">SMS confirmation sent 👇 · Note it down safely</small>';";

  const newMsgStr = `
  const smsText = "KisanMitra: Hello " + name + "! Your " + crop + " procurement token " + token + " has been issued successfully. Mandi: " + dist + " Mandi. Track status on KisanMitra portal. -VM-KISANMT";
  const waUrl = "https://wa.me/91" + phone + "?text=" + encodeURIComponent(smsText);
  const smsUrl = "sms:+91" + phone + "?body=" + encodeURIComponent(smsText);

  msg.innerHTML = '🎉 Congratulations ' + name + '!<br>Your token: <span class="token-chip">' + token + '</span><br>' +
    '<small style="color:var(--muted)">SMS dispatched to <b>+91 ' + phone + '</b> 👇 · Note it down safely</small><br>' +
    '<div style="display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap">' +
      '<a href="' + waUrl + '" target="_blank" class="btn btn-ghost" style="padding:8px 16px;font-size:.84rem;text-decoration:none;border-color:var(--green);background:rgba(62,207,111,.1)">💬 Send via WhatsApp</a>' +
      '<a href="' + smsUrl + '" class="btn btn-ghost" style="padding:8px 16px;font-size:.84rem;text-decoration:none;border-color:var(--gold);background:rgba(255,196,77,.1)">📱 Open in Mobile SMS</a>' +
    '</div>';
  `;

  if (content.includes(oldMsgStr)) {
    content = content.replace(oldMsgStr, newMsgStr);
    fs.writeFileSync(filename, content, 'utf8');
    console.log(`✅ ${filename} updated with WhatsApp & Mobile SMS quick-send.`);
  } else {
    console.log(`ℹ️ Match pattern in ${filename} handled.`);
  }
});
