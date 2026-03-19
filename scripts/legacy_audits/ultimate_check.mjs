import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const koTsPath = path.join(srcDir, 'lib', 'translations', 'ko.ts');

const extractedKeys = new Set();
let totalFilesChecked = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      if (fullPath === koTsPath) continue; 
      
      totalFilesChecked++;
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Match t("key") or t('key') or t(`key`)
      // It handles optional whitespace and accurately captures the content inside the quotes.
      const regex = /t\(\s*(["'`])([\s\S]*?)\1\s*[),]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (match[2]) {
          extractedKeys.add(match[2]);
        }
      }
    }
  }
}

walkDir(srcDir);

// Read existing keys from ko.ts
const koContent = fs.readFileSync(koTsPath, 'utf-8');
const existingKeys = new Set();
let totalDuplicates = 0;

const lines = koContent.split('\n');
for (let i = 0; i < lines.length; i++) {
  let lineStr = lines[i].trim();
  if (lineStr.startsWith('"') || lineStr.startsWith("'")) {
    const quoteChar = lineStr[0];
    
    // Attempt to match the property key format: "key": "value"
    // Using a more robust regex for JSON-like keys in JS objects
    // It captures everything until the first unescaped quote followed by a colon
    const keyMatch = lineStr.match(new RegExp(`^${quoteChar}(.*?)${quoteChar}\\s*:`));
    if (keyMatch && keyMatch[1] !== undefined) {
      let key = keyMatch[1];
      
      // Unescape quotes if any
      if (quoteChar === '"') {
        key = key.replace(/\\"/g, '"');
      } else if (quoteChar === "'") {
        key = key.replace(/\\'/g, "'");
      }
      
      if (existingKeys.has(key)) {
        totalDuplicates++;
        console.warn(`Duplicate key found in ko.ts at line ${i + 1}: [${key}]`);
      }
      existingKeys.add(key);
    }
  }
}

const missingKeys = [];
for (let key of extractedKeys) {
  // Ignore specific dynamic keys or keys that are not actual translation strings
  // Often times variables or empty strings might get caught
  if (key === 'ko' || key === 'en' || key.trim() === '' || key.length < 2) continue;
  if (key.includes('${') || key.startsWith('@/')) {
     // Dynamic values or file paths passed incorrectly
     continue;
  }
  
  if (!existingKeys.has(key)) {
    // Check if an unescaped version exists (for newlines or quotes)
    let unescaped1 = key.replace(/\\"/g, '"').replace(/\\'/g, "'");
    let unescaped2 = key.replace(/\\n/g, '\n');
    let unescaped3 = unescaped1.replace(/\\n/g, '\n');
    
    if (!existingKeys.has(unescaped1) && !existingKeys.has(unescaped2) && !existingKeys.has(unescaped3)) {
       missingKeys.push(key);
    }
  }
}

const report = {
  totalFilesChecked,
  totalUniqueKeysExtractedFromCode: extractedKeys.size,
  totalUniqueKeysInKoTs: existingKeys.size,
  totalDuplicatesInKoTs: totalDuplicates,
  missingKeysCount: missingKeys.length,
  missingKeys: missingKeys
};

fs.writeFileSync('ultimate_check_result.json', JSON.stringify(report, null, 2));

console.log('--- ULTIMATE CHECK REPORT ---');
console.log(`Files Checked: ${report.totalFilesChecked}`);
console.log(`Extracted Keys: ${report.totalUniqueKeysExtractedFromCode}`);
console.log(`Keys in ko.ts: ${report.totalUniqueKeysInKoTs}`);
console.log(`Duplicates in ko.ts: ${report.totalDuplicatesInKoTs}`);
console.log(`Missing Keys: ${report.missingKeysCount}`);
if (report.missingKeysCount > 0) {
    console.log('Missing Keys List:');
    console.log(report.missingKeys);
} else {
    console.log('SUCCESS! No missing keys found.');
}
console.log('-----------------------------');
