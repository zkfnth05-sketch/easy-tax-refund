const fs = require('fs');
const content = fs.readFileSync('src/lib/translations/ko.ts', 'utf8');
const lines = content.split('\n');
let keyCount = 0;
lines.forEach(line => {
    if (line.includes('": "')) {
        keyCount++;
    }
});
console.log(`ko.ts keys: ${keyCount}`);
