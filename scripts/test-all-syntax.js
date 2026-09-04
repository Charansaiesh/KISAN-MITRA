const fs = require('fs');

['index.html', 'admin.html', 'community.html', 'user.html'].forEach(file => {
  const html = fs.readFileSync(file, 'utf8');
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    try {
      new Function(scriptMatch[1]);
      console.log(`✅ ${file}: JavaScript syntax is 100% valid.`);
    } catch (err) {
      console.error(`❌ ${file}: Syntax error:`, err.message);
    }
  }
});
