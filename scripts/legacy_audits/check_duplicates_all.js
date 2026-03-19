const fs = require('fs');
const path = require('path');

const languages = ['ko', 'en', 'vi', 'zh', 'ne', 'km', 'th', 'id', 'my', 'uz', 'si'];

languages.forEach(lang => {
    const filePath = path.join('src', 'lib', 'translations', `${lang}.ts`);
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const keyRegex = /\"(.*?)\":/g;
    const keys = [];
    let match;
    while ((match = keyRegex.exec(content)) !== null) {
        keys.push(match[1]);
    }
    
    const counts = {};
    const duplicates = [];
    keys.forEach(k => {
        counts[k] = (counts[k] || 0) + 1;
        if (counts[k] === 2) duplicates.push(k);
    });
    
    if (duplicates.length > 0) {
        console.log(`[DUPLICATES] ${lang}.ts:`, duplicates);
    } else {
        console.log(`[OK] ${lang}.ts (Total Unique: ${Object.keys(counts).length})`);
    }
});
