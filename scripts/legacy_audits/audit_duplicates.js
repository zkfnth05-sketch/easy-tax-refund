const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\zkfnt\\Desktop\\easy-tax-refund\\easy-tax-refund-main\\easy-tax-refund-main\\src\\lib\\translations\\si.ts';

try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Simple syntax check by trying to parse the exported object
    // We need to strip the "export const si = " and the trailing ";"
    const objectContent = content.replace(/export const si = /, '').replace(/;$/, '');
    
    try {
        // Using eval is risky but for a controlled translation file audit it's a quick way to check if it's a valid JS object
        // A better way would be regex or a proper parser, but let's try a regex for duplicate keys first.
        const keys = [];
        const lines = content.split('\n');
        const duplicates = [];
        const keyRegex = /"([^"]+)":/g;
        
        lines.forEach((line, index) => {
            let match;
            while ((match = keyRegex.exec(line)) !== null) {
                const key = match[1];
                if (keys.includes(key)) {
                    duplicates.push({ key, line: index + 1 });
                }
                keys.push(key);
            }
        });

        if (duplicates.length > 0) {
            console.log('Duplicate keys found:');
            duplicates.forEach(d => console.log(`Key: "${d.key}" at line ${d.line}`));
        } else {
            console.log('No duplicate keys found.');
        }

    } catch (e) {
        console.error('Error during key extraction:', e.message);
    }

} catch (e) {
    console.error('Error reading file:', e.message);
}
