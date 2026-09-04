const fs = require('fs');

// 1. FIX COMMUNITY.HTML
let comm = fs.readFileSync('community.html', 'utf8');
// Fix input ID mismatch: replace pItem with pTitle
comm = comm.replace(/document\.getElementById\("pItem"\)/g, '(document.getElementById("pTitle") || document.getElementById("pItem"))');
// Fix form reset ID
comm = comm.replace(/e\.target\.reset\(\)/g, '(e.target.reset ? e.target.reset() : document.querySelector("form.post-grid").reset())');
// Fix navigation links to index.html
comm = comm.replace(/href="user\.html"/g, 'href="index.html"');
fs.writeFileSync('community.html', comm, 'utf8');
console.log('✅ community.html patched.');

// 2. FIX ADMIN.HTML
let admin = fs.readFileSync('admin.html', 'utf8');
// Fix advanceStep token quoting
admin = admin.replace(/onclick="advanceStep\('' \+ token \+ ''\)"/g, 'onclick="advanceStep(\'\' + token + \'\')"');
// Fix deleteToken token quoting
admin = admin.replace(/onclick="deleteToken\('' \+ token \+ ''\)"/g, 'onclick="deleteToken(\'\' + token + \'\')"');
// Fix navigation links
admin = admin.replace(/href="user\.html"/g, 'href="index.html"');
admin = admin.replace(/window\.location\.href = "user\.html"/g, 'window.location.href = "index.html"');
fs.writeFileSync('admin.html', admin, 'utf8');
console.log('✅ admin.html patched.');
