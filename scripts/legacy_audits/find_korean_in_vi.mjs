
import fs from 'fs';

const viPath = './src/lib/translations/vi.ts';
const content = fs.readFileSync(viPath, 'utf-8');
const lines = content.split('\n');

const containsKorean = (text) => /[\u3131-\uD79D]/.test(text);

console.log('--- Values in vi.ts containing Korean characters ---');
const regex = /"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/;

lines.forEach((line, index) => {
    const match = regex.exec(line);
    if (match) {
        const value = match[2];
        if (containsKorean(value)) {
            console.log(`L${index + 1}: ${line.trim()}`);
        }
    }
});
