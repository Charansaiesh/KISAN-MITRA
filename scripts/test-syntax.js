const fs = require('fs');

const html = fs.readFileSync('admin.html', 'utf8');

// Extract script
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  const code = scriptMatch[1];
  console.log('--- Script extracted, checking syntax ---');
  try {
    new Function(code);
    console.log('✅ Syntax valid in admin.html script!');
  } catch (err) {
    console.error('❌ Syntax error in admin.html script:', err);
  }
} else {
  console.error('No script tag found!');
}
