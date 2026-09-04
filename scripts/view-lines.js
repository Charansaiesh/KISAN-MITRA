const fs = require('fs');
const html = fs.readFileSync('admin.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const lines = scriptMatch[1].split('\n');
console.log(lines.slice(125, 145).join('\n'));
