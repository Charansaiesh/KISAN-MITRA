const fs = require('fs');

let admin = fs.readFileSync('admin.html', 'utf8');

// Replace the broken line 138 & 139 with correctly escaped string concatenation
admin = admin.replace(
  /onclick="advanceStep\('' \+ token \+ ''\)"/g,
  'onclick="advanceStep(\x27' + "' + token + '" + '\x27)"'
);

admin = admin.replace(
  /onclick="deleteToken\('' \+ token \+ ''\)"/g,
  'onclick="deleteToken(\x27' + "' + token + '" + '\x27)"'
);

fs.writeFileSync('admin.html', admin, 'utf8');
console.log('✅ admin.html replacement attempted.');
