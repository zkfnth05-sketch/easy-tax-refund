const fs = require('fs');
const path = require('path');

function extractKeys(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simplified regex to extract keys. Assuming keys are like "key": "value" or 'key': 'value'
    const matches = content.matchAll(/["'](.+?)["']\s*:/g);
    return Array.from(matches, m => m[1]);
}

const koPath = path.join(__dirname, 'src/lib/translations/ko.ts');
const kkPath = path.join(__dirname, 'src/lib/translations/kk.ts');

const koKeys = extractKeys(koPath);
const kkKeys = extractKeys(kkPath);

console.log(`Korean keys: ${koKeys.length}`);
console.log(`Kazakh keys: ${kkKeys.length}`);

const missingInKk = koKeys.filter(k => !kkKeys.includes(k));
const extraInKk = kkKeys.filter(k => !koKeys.includes(k));

if (missingInKk.length > 0) {
    console.log('--- Missing in Kazakh ---');
    console.log(missingInKk.join('\n'));
}

if (extraInKk.length > 0) {
    console.log('--- Extra in Kazakh ---');
    console.log(extraInKk.join('\n'));
}

if (missingInKk.length === 0 && extraInKk.length === 0) {
    console.log('SUCCESS: Keys match perfectly!');
} else {
    console.log(`FAILED: ${missingInKk.length} missing, ${extraInKk.length} extra.`);
}

// Check for remaining Korean characters in values
const kkContent = fs.readFileSync(kkPath, 'utf8');
const koreanCharRegex = /[\uac00-\ud7af]/g;
const lines = kkContent.split('\n');
let koreanFound = false;

lines.forEach((line, index) => {
    // Only check the value part (after the colon)
    const parts = line.split(':');
    if (parts.length > 1) {
        const value = parts.slice(1).join(':');
        if (koreanCharRegex.test(value)) {
            console.log(`Line ${index + 1}: Found Korean in value -> ${line.trim()}`);
            koreanFound = true;
        }
    }
});

if (!koreanFound) {
    console.log('SUCCESS: No Korean characters found in values!');
}
