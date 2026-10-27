const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
console.log('====================================================');
console.log('🔒 EXECUTING FINAL REPO & GIT-DIFF SECRET SCAN');
console.log('====================================================');

const forbiddenPatterns = [
  { name: 'Google AIza Key', regex: new RegExp(['AIza', '[0-9A-Za-z-_]{35}'].join(''), 'g') },
  { name: 'Hardcoded JWT Header', regex: new RegExp(['eyJ', '[A-Za-z0-9-_]{10,}\\.', 'eyJ', '[A-Za-z0-9-_]{10,}'].join(''), 'g') },
  { name: 'Base64 Obfuscation', regex: /Buffer\.from\(['"][A-Za-z0-9+/=]{20,}['"],\s*['"]base64['"]\)/g },
  { name: 'Atob Obfuscation', regex: /atob\(['"][A-Za-z0-9+/=]{20,}['"]\)/g },
  { name: 'Hardcoded Admin Password adminSecret2025', regex: new RegExp(['admin', 'Secret', '2025'].join(''), 'g') },
  { name: 'Hardcoded Kisan Password kisan2024', regex: new RegExp(['kisan', '2024'].join(''), 'g') },
  { name: 'Hardcoded Kisan Password kisan123', regex: new RegExp(['kisan', '123'].join(''), 'g') },
  { name: 'Hardcoded Admin Password admin123', regex: new RegExp(['admin', '123'].join(''), 'g') },
  { name: 'Hardcoded Supabase Anon Key Variable', regex: /SUPABASE_ANON_KEY\s*=\s*['"][^'"]{20,}['"]/g },
  { name: 'Private Key Block', regex: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g }
];

const ignoredDirs = new Set(['.git', 'node_modules', '.system_generated', 'dist', 'build']);
const ignoredFiles = new Set(['.env', 'QA_REPORT.md', 'FIX_REPORT.md', 'final-secret-scan.js', 'retest-all-fixed-items.js']); // Audit and remediation markdown logs

let findings = [];

function scanFile(filePath, isDiff = false) {
  const relPath = path.relative(root, filePath);
  const baseName = path.basename(filePath);
  if (ignoredFiles.has(baseName)) return;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineIdx) => {
      forbiddenPatterns.forEach(pattern => {
        // Reset regex state
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(line)) {
          findings.push({
            file: relPath,
            line: lineIdx + 1,
            issue: pattern.name
          });
        }
      });
    });
  } catch (err) {
    // skip binary or unreadable files
  }
}

function traverse(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      traverse(fullPath);
    } else if (entry.isFile()) {
      scanFile(fullPath);
    }
  }
}

// 1. Scan Working Tree
console.log('1. Scanning working tree files...');
traverse(root);

// 2. Scan Git Diff
console.log('2. Scanning git diff HEAD...');
try {
  const diffOutput = execSync('git diff HEAD', { cwd: root, encoding: 'utf8' });
  const diffLines = diffOutput.split('\n');
  let currentFile = 'unknown';

  diffLines.forEach((line, idx) => {
    if (line.startsWith('+++ b/')) {
      currentFile = line.replace('+++ b/', '').trim();
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      const addedText = line.substring(1);
      if (!ignoredFiles.has(path.basename(currentFile))) {
        forbiddenPatterns.forEach(pattern => {
          pattern.regex.lastIndex = 0;
          if (pattern.regex.test(addedText)) {
            findings.push({
              file: `[git diff] ${currentFile}`,
              line: idx + 1,
              issue: pattern.name
            });
          }
        });
      }
    }
  });
} catch (e) {
  console.warn('Could not inspect git diff:', e.message);
}

console.log('\n--- SECRET SCAN RESULTS ---');
if (findings.length === 0) {
  console.log('✅ ZERO secrets or hardcoded keys found across working tree and git diff.');
  console.log('Status: CLEAN & SECURE\n');
} else {
  console.error(`❌ FOUND ${findings.length} POTENTIAL SECRET EXPOSURES:`);
  findings.forEach(f => {
    // REPORT FILE:LINE ONLY. NEVER PRINT SECRET VALUE.
    console.error(`- ${f.file}:${f.line} -> Pattern match: ${f.issue}`);
  });
  process.exit(1);
}
