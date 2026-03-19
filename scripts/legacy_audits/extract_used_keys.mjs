import fs from 'fs';
import path from 'path';

const srcDir = './src';
const usedKeys = new Set();

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Regex for t('key') or t(`key`)
      const matches = content.matchAll(/t\s*\(\s*['"`](.*?)['"`]/g);
      for (const match of matches) {
        usedKeys.add(match[1]);
      }
    }
  }
}

walk(srcDir);
console.log(JSON.stringify(Array.from(usedKeys), null, 2));
