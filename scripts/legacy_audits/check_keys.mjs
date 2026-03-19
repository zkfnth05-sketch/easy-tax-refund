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
      if (fullPath === koTsPath) continue; // 번역 파일 자체는 제외
      
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // t('key') or t("key") or t(`key`)
      const regex = /t\(\s*(["'`])(.*?)\1[\s,)]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (match[2]) {
          // 템플릿 리터럴 내부 변수 치환 문자는 고려해야 할 수 있으나 일단 무시
          extractedKeys.add(match[2]);
        }
      }
    }
  }
}

walkDir(srcDir);

// parsing ko.ts to get existing keys
const koContent = fs.readFileSync(koTsPath, 'utf-8');
const existingKeys = new Set();
// match "key": "value" lines
const koRegex = /"(?:[^"\\]|\\.)*"\s*:\s*"(?:[^"\\]|\\.)*"/g;
let koMatch;
while ((koMatch = koRegex.exec(koContent)) !== null) {
  // 간단히 키 추출
  const mappingStr = koMatch[0];
  const firstColon = mappingStr.indexOf(':');
  let keyStr = mappingStr.substring(0, firstColon).trim();
  // remove surrounding quotes
  if (keyStr.startsWith('"') && keyStr.endsWith('"')) {
    keyStr = keyStr.substring(1, keyStr.length - 1);
  }
  // replace escaped quotes
  keyStr = keyStr.replace(/\\"/g, '"');
  existingKeys.add(keyStr);
}

const missingKeys = [];
for (const key of extractedKeys) {
  if (!existingKeys.has(key)) {
    // skip dynamic values like {month} or keys with interpolation if they were missed due to static regex
    // actually, let's include them for review.
    missingKeys.push(key);
  }
}

console.log(JSON.stringify({
  totalExtracted: extractedKeys.size,
  totalExisting: existingKeys.size,
  missingCount: missingKeys.length,
  missingKeys: missingKeys
}, null, 2));
