import fs from 'fs';

const koPath = 'src/lib/translations/ko.ts';
const viPath = 'src/lib/translations/vi.ts';

function parseTranslations(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const translations = {};
  const regex = /["'](.+?)["']\s*:\s*["']([\s\S]*?)["'](?=,|\s*\n|$)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let key = match[1];
    let value = match[2];
    translations[key] = value;
  }
  return translations;
}

const ko = parseTranslations(koPath);
const vi = parseTranslations(viPath);

const koKeys = Object.keys(ko);
const viKeys = Object.keys(vi);

const missingInVi = koKeys.filter(k => !(k in vi));
const extraInVi = viKeys.filter(k => !(k in ko));

console.log(JSON.stringify({ missingInVi, extraInVi }, null, 2));
