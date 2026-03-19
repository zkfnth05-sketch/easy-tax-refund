
import fs from 'fs';
import path from 'path';

const transDir = './src/lib/translations/';
const files = fs.readdirSync(transDir).filter(f => f.endsWith('.ts'));

console.log('--- Searching for "será" in translations ---');
files.forEach(file => {
    const content = fs.readFileSync(path.join(transDir, file), 'utf-8');
    if (content.includes('será')) {
        console.log(`Found in ${file}`);
        // Find the line
        const lines = content.split('\n');
        lines.forEach((line, i) => {
            if (line.includes('será')) {
                console.log(`  L${i+1}: ${line.trim()}`);
            }
        });
    }
});
