const fs = require('fs');

try {
    const content = fs.readFileSync('src/lib/translations/mn.ts', 'utf8');
    // Simple evaluation to check syntax
    // We need to strip 'export const mn = ' and the trailing ';'
    const jsonLike = content.replace('export const mn = ', '').replace(/;$/, '').trim();
    
    // Using eval is risky but for a simple object it works for syntax check
    // Alternatively, just try to parse it as a JS object
    const mn = eval(`(${jsonLike})`);
    console.log('✔ Syntax check passed for mn.ts');
    console.log(`✔ Total keys: ${Object.keys(mn).length}`);

    const koContent = fs.readFileSync('src/lib/translations/ko.ts', 'utf8');
    const koJsonLike = koContent.replace('export const ko = ', '').replace(/;$/, '').trim();
    const ko = eval(`(${koJsonLike})`);
    
    const koKeys = Object.keys(ko);
    const mnKeys = Object.keys(mn);
    
    const missingKeys = koKeys.filter(key => !mnKeys.includes(key));
    if (missingKeys.length > 0) {
        console.log(`❌ Missing keys in mn.ts: ${missingKeys.length}`);
        missingKeys.forEach(k => console.log(`  - ${k}`));
    } else {
        console.log('✔ All keys from ko.ts are present in mn.ts');
    }
} catch (e) {
    console.error('❌ Error during verification:', e.message);
    process.exit(1);
}
