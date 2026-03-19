import { ko } from './src/lib/translations/ko.ts';
import { si } from './src/lib/translations/si.ts';

const koKeys = Object.keys(ko);
const siKeys = Object.keys(si);

const missingInSi = koKeys.filter(key => !siKeys.includes(key));
const extraInSi = siKeys.filter(key => !koKeys.includes(key));

const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/;
const untranslatedInSi = siKeys.filter(key => {
    const value = si[key];
    return typeof value === 'string' && koreanRegex.test(value);
});

console.log('--- Missing in si.ts ---');
missingInSi.forEach(key => console.log(key));

console.log('\n--- Untranslated (contains Korean) in si.ts ---');
untranslatedInSi.forEach(key => console.log(`${key}: ${si[key]}`));

console.log('\n--- Extra in si.ts (not in ko.ts) ---');
extraInSi.forEach(key => console.log(key));
