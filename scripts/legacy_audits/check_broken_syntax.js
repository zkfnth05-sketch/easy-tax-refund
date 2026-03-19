const fs = require('fs');
const path = require('path');

const targetFile = 'src/lib/translations/si.ts.broken';
const filePath = path.join(process.cwd(), targetFile);

try {
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`File: ${targetFile}, Length: ${content.length}`);
    
    // Check for duplicate keys using regex
    const keyRegex = /\"(.*?)\":/g;
    const keys = [];
    let match;
    while ((match = keyRegex.exec(content)) !== null) {
        keys.push(match[1]);
    }
    
    if (keys.length > 0) {
        const counts = {};
        const duplicates = [];
        keys.forEach(k => {
            counts[k] = (counts[k] || 0) + 1;
            if (counts[k] === 2) duplicates.push(k);
        });
        
        console.log(`Total keys: ${keys.length}, Unique keys: ${Object.keys(counts).length}`);
        if (duplicates.length > 0) {
            console.log('Duplicate keys found:', duplicates);
        } else {
            console.log('No duplicate keys found.');
        }
    }
} catch (e) {
    console.error('Error analyzing file:', e.message);
}
