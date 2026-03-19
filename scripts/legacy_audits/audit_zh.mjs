import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');
const zhPath = path.join(__dirname, 'src', 'lib', 'translations', 'zh.ts');
const koPath = path.join(__dirname, 'src', 'lib', 'translations', 'ko.ts');

async function getKeysFromTranslationFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple regex to match "key": "value"
    const matches = content.matchAll(/"([^"]+)":\s*"/g);
    return new Set([...matches].map(m => m[1]));
}

function getAllUsedKeys(dir) {
    const keys = new Set();
    const files = fs.readdirSync(dir, { recursive: true });
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) continue;
        if (!fullPath.match(/\.(tsx|ts|js|jsx)$/)) continue;
        if (fullPath.includes('translations')) continue;

        const content = fs.readFileSync(fullPath, 'utf8');
        // Match t('key') or t("key") or t(`key`)
        const matches = content.matchAll(/t\(['"`]([^'"`]+)['"`]/g);
        for (const match of matches) {
            keys.add(match[1]);
        }
    }
    return keys;
}

async function audit() {
    console.log('--- Starting Chinese Translation Audit ---');
    
    const usedKeys = getAllUsedKeys(srcDir);
    const zhKeys = await getKeysFromTranslationFile(zhPath);
    const koKeys = await getKeysFromTranslationFile(koPath);

    console.log(`Total used keys in code: ${usedKeys.size}`);
    console.log(`Total keys in zh.ts: ${zhKeys.size}`);
    console.log(`Total keys in ko.ts: ${koKeys.size}`);

    const missingInZh = [];
    for (const key of usedKeys) {
        if (!zhKeys.has(key)) {
            missingInZh.push(key);
        }
    }

    console.log('\n--- Missing Keys in zh.ts ---');
    if (missingInZh.length === 0) {
        console.log('None! All used keys are present in zh.ts.');
    } else {
        missingInZh.forEach(k => console.log(`- ${k}`));
    }

    // Check for Korean leakage in zh.ts
    const zhContent = fs.readFileSync(zhPath, 'utf8');
    const zhMatches = zhContent.matchAll(/"([^"]+)":\s*"([^"]+)"/g);
    const leakedKorean = [];
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

    for (const match of zhMatches) {
        const key = match[1];
        const value = match[2];
        if (koreanRegex.test(value) && key !== value) {
            // Some keys might be identical to values but usually not in zh.ts
            leakedKorean.push({ key, value });
        }
    }

    console.log('\n--- Potential Korean Leakage in zh.ts ---');
    if (leakedKorean.length === 0) {
        console.log('None found.');
    } else {
        leakedKorean.forEach(item => console.log(`- Key: [${item.key}] -> Value: [${item.value}]`));
    }
}

audit();
