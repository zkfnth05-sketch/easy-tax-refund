import { ko } from './src/lib/translations/ko.ts';
import { si } from './src/lib/translations/si.ts';
import fs from 'fs';

const report = {
  missingKeys: [],
  untranslatedKeys: [],
  excessKeys: [],
  totalKo: Object.keys(ko).length,
  totalSi: Object.keys(si).length,
};

const koKeys = Object.keys(ko);
const siKeys = Object.keys(si);

koKeys.forEach(key => {
  if (!(key in si)) {
    report.missingKeys.push(key);
  } else if (si[key] === key || (typeof si[key] === 'string' && si[key].trim() === '' )) {
    report.untranslatedKeys.push(key);
  } else if (si[key] === ko[key] && key !== ko[key]) {
      // If the translation is identical to Korean but the key is not the same as the value (some keys are English)
      // This might be untranslated Korean.
      // But be careful: some things like "SKT" are same in all languages.
      const isSuspect = /[\uac00-\ud7af]/.test(si[key]); // Check if it contains Korean characters
      if (isSuspect) {
          report.untranslatedKeys.push(key);
      }
  }
});

siKeys.forEach(key => {
  if (!(key in ko)) {
    report.excessKeys.push(key);
  }
});

console.log(JSON.stringify(report, null, 2));
fs.writeFileSync('robust_audit_si_report.json', JSON.stringify(report, null, 2));
