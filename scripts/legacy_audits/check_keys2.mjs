import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const koTsPath = path.join(srcDir, 'lib', 'translations', 'ko.ts');

const extractedKeys = new Set();

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      if (fullPath === koTsPath) continue; 
      
      const content = fs.readFileSync(fullPath, 'utf-8');
      const regex = /t\(\s*(["'`])([\s\S]*?)\1[\s,)]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (match[2]) {
          extractedKeys.add(match[2].replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\r\\n/g, '\\n'));
        }
      }
    }
  }
}

walkDir(srcDir);

const koContent = fs.readFileSync(koTsPath, 'utf-8');
const existingKeys = new Set();
const koLines = koContent.split('\n');

for (let line of koLines) {
  const match = line.match(/^\s*"([^"]+)":\s*"(.*)",?$/);
  if (match) {
    existingKeys.add(match[1].replace(/\\"/g, '"'));
  } else {
    // try to match 'key': 'value'
    const match2 = line.match(/^\s*'([^']+)':\s*'(.*)',?$/);
    if (match2) {
      existingKeys.add(match2[1].replace(/\\'/g, "'"));
    }
  }
}

const missingKeys = [];
for (const key of extractedKeys) {
  if (!existingKeys.has(key)) {
    missingKeys.push(key);
  }
}

const resultObj = {
  totalExtracted: extractedKeys.size,
  totalExisting: existingKeys.size,
  missingCount: missingKeys.length,
  missingKeys: missingKeys
};

fs.writeFileSync('missing_keys2.json', JSON.stringify(resultObj, null, 2));
console.log('done.');
