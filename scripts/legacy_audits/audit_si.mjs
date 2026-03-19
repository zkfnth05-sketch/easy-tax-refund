import fs from 'fs';

function extractTranslations(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g);
    const translations = {};
    for (const match of matches) {
        translations[match[1]] = match[2];
    }
    return translations;
}

const ko = extractTranslations('./src/lib/translations/ko.ts');
const si = extractTranslations('./src/lib/translations/si.ts');

const koKeys = Object.keys(ko);
const siKeys = Object.keys(si);

const missingKeys = koKeys.filter(key => !siKeys.hasOwnProperty(key));
const untranslatedKeys = siKeys.filter(key => {
    const value = si[key];
    return /[가-힣]/.test(value);
});

const report = {
    missingCount: missingKeys.length,
    untranslatedCount: untranslatedKeys.length,
    missingItems: missingKeys.map(k => ({ key: k, value: ko[k] })),
    untranslatedItems: untranslatedKeys.map(k => ({ key: k, value: si[k], original: ko[k] }))
};

fs.writeFileSync('audit_report_si.json', JSON.stringify(report, null, 2));
console.log(`Audit complete. Missing: ${missingKeys.length}, Untranslated (Korean found): ${untranslatedKeys.length}`);
