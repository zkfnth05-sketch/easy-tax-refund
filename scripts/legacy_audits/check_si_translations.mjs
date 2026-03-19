import fs from 'fs';

const koPath = 'src/lib/translations/ko.ts';
const siPath = 'src/lib/translations/si.ts';

function parseTranslations(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const translations = {};
  // Match "key": "value" or 'key': 'value'
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
const si = parseTranslations(siPath);

const koKeys = Object.keys(ko);

const containsKorean = (text) => /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/.test(text);

const results = {
  missingInSi: [],
  untranslated: [],
  placeholderMismatch: [],
  variableMismatch: []
};

koKeys.forEach(key => {
  if (!(key in si)) {
    results.missingInSi.push(key);
    return;
  }

  const koVal = ko[key];
  const siVal = si[key];

  // Check untranslated
  if (containsKorean(siVal) && !key.endsWith('_ko')) {
    results.untranslated.push({ key, ko: koVal, si: siVal });
  }

  // Check placeholders {name}
  const koPlaceholders = koVal.match(/\{.+?\}/g) || [];
  const siPlaceholders = siVal.match(/\{.+?\}/g) || [];
  const missingPlaceholders = koPlaceholders.filter(p => !siPlaceholders.includes(p));
  if (missingPlaceholders.length > 0) {
    results.placeholderMismatch.push({ key, missing: missingPlaceholders });
  }

  // Check technical variables ${...}
  const koVars = koVal.match(/\$\{.+\}/g) || [];
  const siVars = siVal.match(/\$\{.+\}/g) || [];
  const missingVars = koVars.filter(v => !siVars.includes(v));
  if (missingVars.length > 0) {
    results.variableMismatch.push({ key, missing: missingVars });
  }
});

console.log(JSON.stringify(results, null, 2));
