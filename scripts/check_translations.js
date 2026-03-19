
import fs from 'fs';
import path from 'path';

const translationsDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';
const koFile = path.join(translationsDir, 'ko.ts');

function extractKeys(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple regex to extract keys from an export const obj = { "key": "value" }
    // This is a bit fragile but should work for this structure
    const keys = [];
    const regex = /"([^"]+)"\s*:/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        keys.push(match[1]);
    }
    return new Set(keys);
}

const koKeys = extractKeys(koFile);
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts') && f !== 'ko.ts');

files.forEach(file => {
    const targetKeys = extractKeys(path.join(translationsDir, file));
    const missing = [...koKeys].filter(k => !targetKeys.has(k));
    if (missing.length > 0) {
        console.log(`File: ${file} is missing ${missing.length} keys.`);
        if (missing.length < 10) {
            console.log('Missing keys:', missing);
        }
    } else {
        console.log(`File: ${file} is complete.`);
    }
});
