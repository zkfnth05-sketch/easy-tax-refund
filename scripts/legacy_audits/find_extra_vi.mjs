import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const koTsPath = path.join(srcDir, 'lib', 'translations', 'ko.ts');
const viTsPath = path.join(srcDir, 'lib', 'translations', 'vi.ts');

function extractFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();
  
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let lineStr = lines[i].trim();
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

const koKeys = extractFromFile(koTsPath);
const viKeys = extractFromFile(viTsPath);

const extraInVi = [];
for (let key of viKeys) {
  if (!koKeys.has(key)) {
    extraInVi.push(key);
  }
}

console.log('Extra keys in vi.ts:');
console.log(extraInVi);
