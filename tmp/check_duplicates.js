const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\zkfnt\\Desktop\\easy-tax-refund\\easy-tax-refund-main\\easy-tax-refund-main\\src\\lib\\translations\\si.ts', 'utf8');
const lines = content.split('\n');
const keys = {};
const duplicates = [];

lines.forEach((line, i) => {
    const match = line.match(/^\s*"([^"]+)":/);
    if (match) {
        const key = match[1];
        if (keys[key]) {
            duplicates.push({ key, line: i + 1, prevLine: keys[key] });
        }
        keys[key] = i + 1;
    }
});

if (duplicates.length > 0) {
    console.log('Found duplicates:');
    duplicates.forEach(d => console.log(`Key: "${d.key}" at line ${d.line} (previously at line ${d.prevLine})`));
} else {
    console.log('No duplicates found.');
}
