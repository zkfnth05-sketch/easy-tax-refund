const fs = require('fs');
const path = require('path');

function verify() {
    try {
        const bnContent = fs.readFileSync('src/lib/translations/bn.ts', 'utf8');
        const koContent = fs.readFileSync('src/lib/translations/ko.ts', 'utf8');

        // Simple syntax check by evaluation (simulated)
        const bnMatch = bnContent.match(/export const bn = ({[\s\S]*});/);
        const koMatch = koContent.match(/export const ko = ({[\s\S]*});/);

        if (!bnMatch) {
            console.error('❌ bn.ts: Could not find export object');
            return;
        }
        if (!koMatch) {
            console.error('❌ ko.ts: Could not find export object');
            return;
        }

        // Using a safer way to parse keys without full eval
        const getKeys = (content) => {
            const keys = [];
            const regex = /"([^"]+)":/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                keys.push(match[1]);
            }
            return keys;
        };

        const bnKeys = getKeys(bnMatch[1]);
        const koKeys = getKeys(koMatch[1]);

        console.log(`✔ bn.ts: ${bnKeys.length} keys found`);
        console.log(`✔ ko.ts: ${koKeys.length} keys found`);

        const missingInBn = koKeys.filter(k => !bnKeys.includes(k));
        const extraInBn = bnKeys.filter(k => !koKeys.includes(k));

        if (missingInBn.length === 0 && extraInBn.length === 0) {
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
        }

        // Check for Korean in values
        const koreanRegex = /[\uAC00-\uD7AF]/;
        const lines = bnMatch[1].split('\n');
        let koreanFound = false;
        lines.forEach((line, i) => {
            const parts = line.split(/":\s*"/);
            if (parts.length > 1) {
                const value = parts[1];
                if (koreanRegex.test(value)) {
                    console.log(`⚠️ Potential Korean in value at line ${i + 1}: ${value.substring(0, 50)}...`);
                    koreanFound = true;
                }
            }
        });
        if (!koreanFound) console.log('✔ No stray Korean characters found in Bengali translations.');

    } catch (e) {
        console.error('❌ Verification failed:', e.message);
    }
}

verify();
