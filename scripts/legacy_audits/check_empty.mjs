
import fs from 'fs';

const viPath = './src/lib/translations/vi.ts';
const content = fs.readFileSync(viPath, 'utf-8');
const regex = /"((?:[^"\\]|\\.)*)"\s*:\s*""/g; // empty value
let match;
console.log('--- Empty values in vi.ts ---');
while ((match = regex.exec(content)) !== null) {
    console.log(`Key: "${match[1]}"`);
}
