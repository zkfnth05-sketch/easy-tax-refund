const fs = require('fs');
const content = fs.readFileSync('src/lib/translations/si.ts', 'utf-8');

for (let i = 0; i < content.length; i++) {
    const charCode = content.charCodeAt(i);
    // Common problematic characters: Zero width space, etc.
    if (charCode === 0x200B || charCode === 0x200C || charCode === 0x200D || charCode === 0xFEFF) {
        console.log(`Found invisible char at index ${i}: 0x${charCode.toString(16).toUpperCase()}`);
    }
}
console.log('Scan complete.');
