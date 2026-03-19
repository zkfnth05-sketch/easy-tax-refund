const fs = require('fs');

const content = fs.readFileSync('src/lib/translations/mn.ts', 'utf8');
const lines = content.split('\n');
const koreanRegex = /[\uAC00-\uD7AF]/;

console.log('--- Lines with potential Korean characters in mn.ts VALUES ---');
lines.forEach((line, index) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
        const valuePart = line.substring(colonIndex + 1).trim();
        const match = valuePart.match(/"(.*)"/);
        if (match && match[1]) {
            const value = match[1];
            if (koreanRegex.test(value)) {
                console.log(`Line ${index + 1}: ${value}`);
            }
        }
    }
});
