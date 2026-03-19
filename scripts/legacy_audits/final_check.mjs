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

const untranslated = [];
const containsKorean = (text) => /[\u3131-\uD79D]/.test(text);

for (const key in vi) {
  const val = vi[key];
  // If the value is identical to the KEY, and the key is Korean or looks like a sentence
  if (val === key) {
     if (containsKorean(key) || key.length > 10) {
        untranslated.push({ key, val, reason: "Value matches Key" });
     }
  } else if (containsKorean(val)) {
     // If value has Korean but isn't a special technical key
     if (!key.endsWith('_ko') && key !== 'welcome_title_ko' && key !== 'welcome_desc_ko') {
        untranslated.push({ key, val, reason: "Value contains Korean" });
     }
  }
}

console.log(JSON.stringify(untranslated, null, 2));
