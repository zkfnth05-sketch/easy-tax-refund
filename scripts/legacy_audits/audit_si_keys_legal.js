const fs = require('fs');

function extractKeys(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const keys = [];
    const regex = /"([^"]+)"\s*:/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        keys.push(match[1]);
    }
    return keys;
}

const koKeys = extractKeys('src/lib/translations/ko.ts');
const siKeys = extractKeys('src/lib/translations/si.ts');

console.log('--- Keys present in ko but missing/different in si (Legal section focus) ---');
koKeys.forEach(k => {
    if (!siKeys.includes(k)) {
        // Find if there's a similar key in si (to detect corruption)
        const similar = siKeys.find(sk => {
            // Check if at least 70% of characters match (rough heuristic for corruption)
            let matches = 0;
            for(let char of k) if(sk.includes(char)) matches++;
            return matches / k.length > 0.7;
        });
        if (similar) {
            console.log(`Potential corrupted key:\n  KO: ${k}\n  SI: ${similar}\n`);
        } else {
            console.log(`Missing key in SI: ${k}\n`);
        }
    }
});
