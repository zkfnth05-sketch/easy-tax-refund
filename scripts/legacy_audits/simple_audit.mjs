
import fs from 'fs';
import path from 'path';

const koPath = './src/lib/translations/ko.ts';
const viPath = './src/lib/translations/vi.ts';

function getKeysAndValues(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = {};
    // Match "key": "value"
    const regex = /"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const key = match[1].replace(/\\"/g, '"');
        const value = match[2].replace(/\\"/g, '"');
        result[key] = value;
    }
    return result;
}

const koDict = getKeysAndValues(koPath);
const viDict = getKeysAndValues(viPath);

const koKeys = Object.keys(koDict);
const viKeys = Object.keys(viDict);

console.log('--- Translation Audit (KO vs VI) ---');
console.log(`Total keys matched in ko.ts: ${koKeys.length}`);
console.log(`Total keys matched in vi.ts: ${viKeys.length}`);

// 1. Missing keys in VI
const missingInVi = koKeys.filter(key => !(key in viDict));
console.log(`\n[1] Missing keys in vi.ts (${missingInVi.length}) - Keys in ko.ts but not in vi.ts:`);
missingInVi.forEach(key => console.log(`- ${key}`));

// 2. Extra keys in VI
const extraInVi = viKeys.filter(key => !(key in koDict));
console.log(`\n[2] Extra keys in vi.ts (${extraInVi.length}) - Keys in vi.ts but not in ko.ts (Candidates for cleanup):`);
extraInVi.forEach(key => console.log(`- ${key}`));

// 3. Potential untranslated keys
const containsKorean = (text) => /[\u3131-\uD79D]/.test(text);
const potentialUntranslated = [];
for (const key of koKeys) {
    if (key in viDict && viDict[key] === koDict[key] && containsKorean(viDict[key])) {
        potentialUntranslated.push(key);
    }
}
console.log(`\n[3] Potential untranslated keys in vi.ts (${potentialUntranslated.length}) - Value is same as Korean:`);
potentialUntranslated.forEach(key => {
    console.log(`- ${key}: "${viDict[key]}"`);
});

// 4. Variable mismatch
function getVars(str) {
    const vars = str.match(/\{[^}]+\}/g) || [];
    return new Set(vars);
}

const varMismatches = [];
for (const key of koKeys) {
    if (key in viDict) {
        const koVars = getVars(koDict[key]);
        const viVars = getVars(viDict[key]);
        
        const missing = Array.from(koVars).filter(v => !viVars.has(v));
        const extra = Array.from(viVars).filter(v => !koVars.has(v));
        
        if (missing.length > 0 || extra.length > 0) {
            varMismatches.push({ key, missing, extra });
        }
    }
}
console.log(`\n[4] Variable mismatch errors (${varMismatches.length}):`);
varMismatches.forEach(m => {
    console.log(`- Key: ${m.key}`);
    if (m.missing.length > 0) console.log(`  Missing in VI: ${m.missing.join(', ')}`);
    if (m.extra.length > 0) console.log(`  Extra in VI: ${m.extra.join(', ')}`);
});
