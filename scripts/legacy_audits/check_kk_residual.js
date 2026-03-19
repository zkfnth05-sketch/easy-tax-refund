const fs = require('fs');
const content = fs.readFileSync('c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations/kk.ts', 'utf8');
const lines = content.split('\n');
const koreanRegex = /[\uac00-\ud7af]/;
let count = 0;

lines.forEach((line, i) => {
    // Match the pattern: "key": "value",
    // We want to find Korean characters in the "value" part.
    const match = line.match(/^(\s*".*?"):\s*"(.*)"/);
    if (match) {
        const value = match[2];
        if (koreanRegex.test(value)) {
            console.log(`ISSUE at Line ${i + 1}: ${line.trim()}`);
            count++;
        }
    }
});

console.log(`Total issues found: ${count}`);
