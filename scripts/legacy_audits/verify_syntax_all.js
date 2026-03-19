const fs = require('fs');
const path = require('path');

const languages = ['ko', 'en', 'vi', 'zh', 'ne', 'km', 'th', 'id', 'my', 'uz', 'si'];

languages.forEach(lang => {
    const filePath = path.join('src', 'lib', 'translations', `${lang}.ts`);
    if (!fs.existsSync(filePath)) {
        console.log(`[MISSING] ${filePath}`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    try {
        // Extract the object content between { and }
        const startIndex = content.indexOf('{');
        const endIndex = content.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1) {
            throw new Error('Could not find object boundaries');
        }
        const objectContent = content.substring(startIndex, endIndex + 1);
        
        // Use Function to evaluate the object literal
        new Function('return ' + objectContent)();
        console.log(`[OK] ${lang}.ts`);
    } catch (e) {
        console.log(`[ERROR] ${lang}.ts: ${e.message}`);
        
        // Basic line number heuristic
        try {
            const lines = content.substring(0, content.indexOf('{')).split('\n').length;
            // This is very rough, but better than nothing
            console.log(`Possible error near the start of the object.`);
        } catch (inner) {}
    }
});
