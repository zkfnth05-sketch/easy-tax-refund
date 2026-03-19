const fs = require('fs');

try {
    const mnContent = fs.readFileSync('src/lib/translations/mn.ts', 'utf8');
    // More robust way to get the object
    const mnMatch = mnContent.match(/export const mn = (\{[\s\S]*\});/);
    if (!mnMatch) {
        throw new Error('Could not find export const mn = { ... }; pattern');
    }
    const mn = eval(`(${mnMatch[1]})`);
    console.log('✔ mn.ts: Syntax OK');
    console.log(`✔ mn.ts: ${Object.keys(mn).length} keys`);

    const koContent = fs.readFileSync('src/lib/translations/ko.ts', 'utf8');
    const koMatch = koContent.match(/export const ko = (\{[\s\S]*\});/);
    const ko = eval(`(${koMatch[1]})`);
    console.log('✔ ko.ts: Syntax OK');
    console.log(`✔ ko.ts: ${Object.keys(ko).length} keys`);

    const koKeys = Object.keys(ko);
    const mnKeys = Object.keys(mn);
    
    const missingKeys = koKeys.filter(key => !mnKeys.includes(key));
    const extraKeys = mnKeys.filter(key => !koKeys.includes(key));

    if (missingKeys.length === 0 && extraKeys.length === 0) {
        console.log('✔ Keys match perfectly!');
    } else {
        if (missingKeys.length > 0) {
            console.log(`❌ Missing keys in mn.ts (${missingKeys.length}):`);
            missingKeys.forEach(k => console.log(`  - ${k}`));
        }
        if (extraKeys.length > 0) {
            console.log(`❌ Extra keys in mn.ts (${extraKeys.length}):`);
            extraKeys.forEach(k => console.log(`  - ${k}`));
        }
    }
} catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
}
