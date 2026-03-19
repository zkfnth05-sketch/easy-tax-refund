const fs = require('fs');
const path = require('path');

const baseDir = 'src/lib/translations';
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    const filePath = path.join(baseDir, file);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Check for common culprits: long lines, many non-ASCII chars
        const lines = content.split('\n');
        let problematicLine = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length > 1000) {
                console.log(`${file}: Very long line at ${i+1} (${lines[i].length} chars)`);
            }
            // Check for potential corruption (e.g. invalid bytes)
            // UTF-8 check is implicitly done by readFileSync(..., 'utf-8') throwing but
            // let's check for specific ranges or many repeated characters
            if (lines[i].includes('\uFFFD')) { // Replacement character
                console.log(`${file}: Found Unicode replacement character (corruption) at line ${i+1}`);
            }
        }
        
        // Try to parse the object (heuristic)
        const objectContent = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
        try {
            new Function('return ' + objectContent)();
        } catch (e) {
            console.log(`${file}: Syntax error in JS object - ${e.message}`);
        }
        
    } catch (e) {
        console.error(`${file}: Error reading/parsing - ${e.message}`);
    }
});
