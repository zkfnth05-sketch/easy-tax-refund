import fs from 'fs';

const viPath = 'src/lib/translations/vi.ts';

const content = fs.readFileSync(viPath, 'utf-8');
const keys = [];
const regex = /["'](.+?)["']\s*:\s*["']([\s\S]*?)["'](?=,|\s*\n|$)/g;
let match;
const counts = {};
while ((match = regex.exec(content)) !== null) {
  let key = match[1];
  keys.push(key);
  counts[key] = (counts[key] || 0) + 1;
}

const duplicates = Object.keys(counts).filter(k => counts[k] > 1);
console.log(JSON.stringify(duplicates, null, 2));
