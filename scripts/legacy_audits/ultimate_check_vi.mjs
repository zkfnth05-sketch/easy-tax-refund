import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const koTsPath = path.join(srcDir, 'lib', 'translations', 'ko.ts');
const viTsPath = path.join(srcDir, 'lib', 'translations', 'vi.ts');

const extractedKeys = new Set();
let totalFilesChecked = 0;

// 1. 코드베이스 전체에서 키 추출
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      if (fullPath === koTsPath || fullPath === viTsPath) continue; 
      
      totalFilesChecked++;
      const content = fs.readFileSync(fullPath, 'utf-8');
      
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

// 2. ko.ts, vi.ts 키 추출 로직
function extractFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();
  let duplicates = 0;
  
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let lineStr = lines[i].trim();
    if (lineStr.startsWith('"') || lineStr.startsWith("'")) {
      const quoteChar = lineStr[0];
      const keyMatch = lineStr.match(new RegExp(`^${quoteChar}(.*?)${quoteChar}\\s*:`));
      if (keyMatch && keyMatch[1] !== undefined) {
        let key = keyMatch[1];
        if (quoteChar === '"') {
          key = key.replace(/\\"/g, '"');
        } else if (quoteChar === "'") {
          key = key.replace(/\\'/g, "'");
        }
        
        if (keys.has(key)) {
          duplicates++;
          console.warn(`Duplicate key found in ${path.basename(filePath)} at line ${i + 1}: [${key}]`);
        }
        keys.add(key);
      }
    }
  }
  return { keys, duplicates };
}

const { keys: koKeys, duplicates: koDuplicates } = extractFromFile(koTsPath);
const { keys: viKeys, duplicates: viDuplicates } = extractFromFile(viTsPath);

// 3. 코드베이스 기준 유효한 키 필터링
const validExtractedKeys = new Set();
for (let key of extractedKeys) {
  if (key === 'ko' || key === 'en' || key.trim() === '' || key.length < 2) continue;
  if (key.includes('${NTS_CONFIG') || key.includes('${CODEF_CONFIG') || key.startsWith('@/')) continue;
  if (key === '2d' || key === 'card' || key === 'bank') continue; // 이전 오탐지 필터링
  
  let unescaped1 = key.replace(/\\"/g, '"').replace(/\\'/g, "'");
  validExtractedKeys.add(unescaped1);
}

// 4. vi.ts 누락 검증 (ko.ts 대비)
const missingInVi = [];
for (let key of koKeys) {
  if (!viKeys.has(key)) {
    missingInVi.push(key);
  }
}

// 5. vi.ts 중복 검증 로직 통계 기록
const report = {
  totalFilesChecked,
  validExtractedKeys: validExtractedKeys.size,
  koKeysCount: koKeys.size,
  viKeysCount: viKeys.size,
  koDuplicates,
  viDuplicates,
  missingInViCount: missingInVi.length,
  missingInVi
};

fs.writeFileSync('ultimate_check_vi.json', JSON.stringify(report, null, 2));

console.log('--- ULTIMATE VIETNAMESE (VI) CHECK REPORT ---');
console.log(`Files Checked: ${report.totalFilesChecked}`);
console.log(`Target Keys (from ko.ts): ${report.koKeysCount}`);
console.log(`Current Keys (in vi.ts): ${report.viKeysCount}`);
console.log(`Duplicates in vi.ts: ${report.viDuplicates}`);
console.log(`Missing Keys in vi.ts: ${report.missingInViCount}`);
if (report.missingInViCount > 0) {
    console.log('Missing Keys List:');
    console.log(report.missingInVi);
} else {
    console.log('SUCCESS! vi.ts is 100% synchronized with ko.ts.');
}
console.log('---------------------------------------------');
