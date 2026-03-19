
import fs from 'fs';
import path from 'path';

const koPath = './src/lib/translations/ko.ts';
const viPath = './src/lib/translations/vi.ts';

function extractDict(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = {};
    // This regex tries to handle multi-line strings and escaped quotes
    // Key-value pair like "key": "value"
    const regex = /"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const key = match[1].replace(/\\"/g, '"');
        const value = match[2].replace(/\\"/g, '"');
        result[key] = value;
    }
    return result;
}

const koDict = extractDict(koPath);
const viDict = extractDict(viPath);

const koKeys = Object.keys(koDict);
const viKeys = Object.keys(viDict);

console.log('--- Translation Synchronization Audit ---');
console.log(`KO Keys: ${koKeys.length}`);
console.log(`VI Keys: ${viKeys.length}`);

// 1. Missing in VI
const missingInVi = koKeys.filter(k => !(k in viDict));
if (missingInVi.length > 0) {
    console.log(`\n[MISSING IN VI] (${missingInVi.length} keys):`);
    missingInVi.forEach(k => console.log(`  - ${k}`));
} else {
    console.log('\n[SYNC] No missing keys in VI.');
}

// 2. Extra in VI
const extraInVi = viKeys.filter(k => !(k in koDict));
if (extraInVi.length > 0) {
    console.log(`\n[EXTRA IN VI] (${extraInVi.length} keys - should probably be removed or added to KO):`);
    extraInVi.forEach(k => console.log(`  - ${k}`));
}

// 3. Values same as Key (suspected untranslated)
// Note: In this app, many Korean keys ARE their own values in ko.ts.
// So we check if viDict[key] is identical to koDict[key] and contains Korean.
const containsKorean = (text) => /[\u3131-\uD79D]/.test(text);

const suspicious = [];
for (const k of koKeys) {
    if (k in viDict) {
        if (viDict[k] === koDict[k] && containsKorean(viDict[k])) {
            // Exclude keys ending in _ko
            if (!k.endsWith('_ko')) {
                suspicious.push(k);
            }
        }
    }
}

if (suspicious.length > 0) {
    console.log(`\n[SUSPICIOUS - POTENTIALLY UNTRANSLATED] (${suspicious.length} keys):`);
    suspicious.forEach(k => console.log(`  - ${k}: "${viDict[k]}"`));
}

// 4. Variable check {keyword}
function getVars(str) {
    const matches = str.match(/\{[^}]+\}/g) || [];
    return new Set(matches);
}

const varMismatches = [];
for (const k of koKeys) {
    if (k in viDict) {
        const koVars = getVars(koDict[k]);
        const viVars = getVars(viDict[k]);
        
        const missing = [...koVars].filter(v => !viVars.has(v));
        const extra = [...viVars].filter(v => !koVars.has(v));
        
        if (missing.length > 0 || extra.length > 0) {
            varMismatches.push({ k, missing, extra });
        }
    }
}

if (varMismatches.length > 0) {
    console.log(`\n[VARIABLE MISMATCH] (${varMismatches.length} keys):`);
    varMismatches.forEach(m => {
        console.log(`  - ${m.k}`);
        if (m.missing.length > 0) console.log(`    Missing in VI: ${m.missing.join(', ')}`);
        if (m.extra.length > 0) console.log(`    Extra in VI: ${m.extra.join(', ')}`);
    });
}

// 5. Codebase scan for t() calls
console.log('\n--- Codebase scan for missing keys in ko.ts ---');
const usedKeys = new Set();
function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(fullPath);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            if (fullPath.includes('translations')) return;
            const code = fs.readFileSync(fullPath, 'utf-8');
            // t('key') or t("key") or t(`key`)
            const regex = /t\(\s*(['"```])(.*?)\1/g;
            let m;
            while ((m = regex.exec(code)) !== null) {
                usedKeys.add(m[2]);
            }
        }
    });
}

walk('./src');

const missingInKo = [...usedKeys].filter(k => !(k in koDict));
if (missingInKo.length > 0) {
    console.log(`\n[USED IN CODE BUT NOT IN KO.TS] (${missingInKo.length} keys):`);
    missingInKo.forEach(k => console.log(`  - ${k}`));
} else {
    console.log('\n[CODE SYNC] All keys used in code are present in ko.ts.');
}
