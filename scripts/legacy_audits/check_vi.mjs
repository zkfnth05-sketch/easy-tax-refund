import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const koTsPath = path.join(srcDir, 'lib', 'translations', 'ko.ts');
const viTsPath = path.join(srcDir, 'lib', 'translations', 'vi.ts');

const koContent = fs.readFileSync(koTsPath, 'utf-8');
const viContent = fs.readFileSync(viTsPath, 'utf-8');

function extractKeys(content) {
  const keys = new Set();
  const lines = content.split('\n');
  for (let line of lines) {
    let lineStr = line.trim();
    if (lineStr.startsWith('"') || lineStr.startsWith("'")) {
      const quoteChar = lineStr[0];
      const keyMatch = lineStr.match(new RegExp(`^${quoteChar}(.*?)${quoteChar}\\s*:`));
      if (keyMatch && keyMatch[1] !== undefined) {
        let key = keyMatch[1];
        if (quoteChar === '"') {
          key = key.replace(/\\"/g, '"');
        } else if (quoteChar === "'") {
          key = key.replace(/\\'/g, "'");
        }
        keys.add(key);
      }
    }
  }
  return keys;
}

const koKeys = extractKeys(koContent);
const viKeys = extractKeys(viContent);

const missingInVi = [];
for (let key of koKeys) {
  if (!viKeys.has(key)) {
    missingInVi.push(key);
  }
}

fs.writeFileSync('missing_in_vi.json', JSON.stringify({ missingKeys: missingInVi }, null, 2));
console.log('Missing keys in vi.ts:', missingInVi.length);
