const fs = require('fs');

function verify() {
    try {
        const bnContent = fs.readFileSync('src/lib/translations/bn.ts', 'utf8');
        const koContent = fs.readFileSync('src/lib/translations/ko.ts', 'utf8');

        const getKeys = (content) => {
            const keys = [];
            const lines = content.split('\n');
            lines.forEach(line => {
                const match = line.match(/^\s*"([^"]+)":/);
                if (match) {
                    keys.push(match[1]);
                }
            });
            return keys;
        };

        const bnKeys = getKeys(bnContent);
        const koKeys = getKeys(koContent);

        console.log(`✔ bn.ts: ${bnKeys.length} keys found`);
        console.log(`✔ ko.ts: ${koKeys.length} keys found`);

        const missingInBn = koKeys.filter(k => !bnKeys.includes(k));
        const extraInBn = bnKeys.filter(k => !koKeys.includes(k));

        if (missingInBn.length === 0 && extraInBn.length === 0 && bnKeys.length === koKeys.length) {
            console.log('✔ Keys match perfectly!');
        } else {
            if (missingInBn.length > 0) {
                console.log(`❌ Missing keys in bn.ts (${missingInBn.length}):`);
                missingInBn.slice(0, 5).forEach(k => console.log(`  - ${k}`));
            }
            if (extraInBn.length > 0) {
                console.log(`❌ Extra keys in bn.ts (${extraInBn.length}):`);
                extraInBn.slice(0, 5).forEach(k => console.log(`  - ${k}`));
            }
            if (bnKeys.length !== koKeys.length) {
                console.log(`❌ Key count mismatch: BN(${bnKeys.length}) vs KO(${koKeys.length})`);
            }
        }

        // Check for Korean in values
        const koreanRegex = /[\uAC00-\uD7AF]/;
        const lines = bnContent.split('\n');
        let koreanFound = false;
        lines.forEach((line, i) => {
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const valuePart = line.substring(colonIndex + 1).trim();
                const match = valuePart.match(/"(.*)"/);
                if (match && match[1]) {
                    const value = match[1];
                    if (koreanRegex.test(value)) {
                        console.log(`⚠️ Potential Korean in value at line ${i + 1}: ${value}`);
                        koreanFound = true;
                    }
                }
            }
        });
        if (!koreanFound) console.log('✔ No stray Korean characters found in Bengali translations.');

    } catch (e) {
        console.error('❌ Verification failed:', e.message);
    }
}

verify();
