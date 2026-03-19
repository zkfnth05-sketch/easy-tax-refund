import fs from 'fs';
const content = fs.readFileSync('src/lib/translations/vi.ts', 'utf-8');
const lines = content.split('\n');
const duplicateKeys = [];
const seenKeys = new Set();
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith('"') || line.startsWith("'")) {
    let match = line.match(/^["']([^"'\\]|\\.)+["']\s*:/);
    if (match) {
      // simpler regex match
      const keyMatch = line.match(/^["'](.*?)["']\s*:/);
      if (keyMatch) {
        let key = keyMatch[1].replace(/\\"/g, '"').replace(/\\'/g, "'");
        if (seenKeys.has(key)) {
          duplicateKeys.push({line: i + 1, key: key});
        } else {
          seenKeys.add(key);
        }
      }
    }
  }
}
console.log('Duplicates in vi.ts:', duplicateKeys);
