
import { ko } from './src/lib/translations/ko.ts';
import { vi } from './src/lib/translations/vi.ts';

const koKeys = Object.keys(ko);
const viKeys = Object.keys(vi);

console.log('--- Translation Audit (KO vs VI) ---');

// 1. Missing keys in VI
const missingInVi = koKeys.filter(key => !viKeys.includes(key));
console.log(`\n[1] Missing keys in vi.ts (${missingInVi.length}):`);
missingInVi.forEach(key => console.log(`- ${key}`));

// 2. Extra keys in VI (keys that are in VI but not in KO)
const extraInVi = viKeys.filter(key => !koKeys.includes(key));
console.log(`\n[2] Extra keys in vi.ts (${extraInVi.length}) - These might be obsolete or specific to VI:`);
extraInVi.forEach(key => console.log(`- ${key}`));

// 3. Potential untranslated keys (value in VI is identical to value in KO, and contains Korean characters)
const containsKorean = (text) => /[\u3131-\uD79D]/.test(text);

const potentialUntranslated = [];
for (const key of koKeys) {
    if (vi[key] === ko[key] && containsKorean(vi[key])) {
        // Exclude some common English keys that happen to be identical (unlikely given the structure but safe to check)
        potentialUntranslated.push(key);
    }
}

console.log(`\n[3] Potential untranslated keys in vi.ts (${potentialUntranslated.length}):`);
potentialUntranslated.forEach(key => {
    console.log(`- ${key}: "${vi[key]}"`);
});

// 4. Checking template variables (e.g., {fullName}, {year})
const checkVariables = (key) => {
    const koValue = ko[key] || '';
    const viValue = vi[key] || '';
    const koVars = koValue.match(/\{[^}]+\}/g) || [];
    const viVars = viValue.match(/\{[^}]+\}/g) || [];
    
    const missingVars = koVars.filter(v => !viVars.includes(v));
    const extraVars = viVars.filter(v => !koVars.includes(v));
    
    if (missingVars.length > 0 || extraVars.length > 0) {
        return { key, missingVars, extraVars };
    }
    return null;
};

const variableErrors = koKeys.map(checkVariables).filter(x => x !== null);
console.log(`\n[4] Variable mismatch errors (${variableErrors.length}):`);
variableErrors.forEach(err => {
    console.log(`- Key: ${err.key}`);
    if (err.missingVars.length > 0) console.log(`  Missing: ${err.missingVars.join(', ')}`);
    if (err.extraVars.length > 0) console.log(`  Extra: ${err.extraVars.join(', ')}`);
});

// 5. Special check for ARC name mismatch error (uses template literal style)
const arcKey = "외국인 등록증 성명(${formData.officialName})과 통신사(PASS) 등록 성명이 다릅니다.";
if (vi[arcKey]) {
    if (!vi[arcKey].includes('${formData.officialName}')) {
        console.log(`\n[5] Critical Error: Template variable ${'${formData.officialName}'} missing in VI version of ARC mismatch message.`);
    }
}
