const fs = require('fs');

const html = fs.readFileSync('admin.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const lines = scriptMatch[1].split('\n');

let accumulated = '';
for (let i = 0; i < lines.length; i++) {
  accumulated += lines[i] + '\n';
  try {
    new Function(accumulated);
  } catch (err) {
    if (err instanceof SyntaxError && !err.message.includes('Unexpected end of input')) {
      console.log(`Line ${i + 1}: ${lines[i]}`);
      console.error('Error:', err.message);
    }
  }
}
