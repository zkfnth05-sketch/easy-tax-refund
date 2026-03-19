
import fs from 'fs';

const koContent = fs.readFileSync('./src/lib/translations/ko.ts', 'utf-8');
const legalDialogContent = fs.readFileSync('./src/components/LegalDialog.tsx', 'utf-8');

// Find all t('...') in LegalDialog.tsx
const regex = /t\(\s*(['"])(.*?)\1/g;
let match;
console.log('--- Checking keys in LegalDialog.tsx ---');
while ((match = regex.exec(legalDialogContent)) !== null) {
    const key = match[2];
    if (!koContent.includes(`"${key}"`) && !koContent.includes(`'${key}'`)) {
        console.log(`[NOT FOUND IN KO.TS] Key: "${key}"`);
    } else {
        // console.log(`[OK] Key: "${key}"`);
    }
}
