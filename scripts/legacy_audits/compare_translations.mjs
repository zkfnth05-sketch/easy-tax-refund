import fs from 'fs';

const koPath = 'src/lib/translations/ko.ts';
const viPath = 'src/lib/translations/vi.ts';

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
const vi = parseTranslations(viPath);

const koKeys = Object.keys(ko);

const containsKorean = (text) => /[\u3131-\uD79D]/.test(text);

const results = {
  missingInVi: [],
  untranslated: [],
  placeholderMismatch: [],
  variableMismatch: []
};

koKeys.forEach(key => {
  if (!(key in vi)) {
    results.missingInVi.push(key);
    return;
  }

  const koVal = ko[key];
  const viVal = vi[key];

  // Check untranslated
  if (containsKorean(viVal)) {
    // welcome_title_ko is a special case, but user asked for VI page audit
    results.untranslated.push({ key, ko: koVal, vi: viVal });
  } else if (koVal === viVal && koVal.length > 5 && !/^[A-Z0-9\s.()+\-]+$/.test(koVal)) {
    results.untranslated.push({ key, ko: koVal, vi: viVal });
  }

  // Check placeholders {name}
  const koPlaceholders = koVal.match(/\{.+?\}/g) || [];
  const viPlaceholders = viVal.match(/\{.+?\}/g) || [];
  const missingPlaceholders = koPlaceholders.filter(p => !viPlaceholders.includes(p));
  if (missingPlaceholders.length > 0) {
    results.placeholderMismatch.push({ key, missing: missingPlaceholders });
  }

  // Check technical variables ${...}
  const koVars = koVal.match(/\$\{.+\}/g) || [];
  const viVars = viVal.match(/\$\{.+\}/g) || [];
  const missingVars = koVars.filter(v => !viVars.includes(v));
  if (missingVars.length > 0) {
    results.variableMismatch.push({ key, missing: missingVars });
  }
});

console.log(JSON.stringify(results, null, 2));
