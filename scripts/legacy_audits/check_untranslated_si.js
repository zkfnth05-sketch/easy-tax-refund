const fs = require('fs');

const content = fs.readFileSync('src/lib/translations/si.ts', 'utf8');
const lines = content.split('\n');
const koreanRegex = /[\uAC00-\uD7AF]/;

console.log('--- Lines with potential untranslated Korean values in si.ts ---');
lines.forEach((line, index) => {
    // Only look at values (after the colon and first quote)
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
        const valuePart = line.substring(colonIndex + 1).trim();
        // Check if the value part (excluding the key) contains Korean
        // Extract content between first and last quotes in valuePart
        const match = valuePart.match(/"(.*)"/);
        if (match && match[1]) {
            const value = match[1];
            if (koreanRegex.test(value)) {
                console.log(`Line ${index + 1}: ${value}`);
            }
        }
    }
});
