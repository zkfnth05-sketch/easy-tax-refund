
import fs from 'fs';

const keysToCheck = [
    "개인정보 처리방침",
    "서비스 이용 약관",
    "고객님의 소중한 정보를 금융권 수준으로 보호합니다.",
    "이용을 위한 표준 약관 및 정책 안내입니다."
];

const koContent = fs.readFileSync('./src/lib/translations/ko.ts', 'utf-8');
const viContent = fs.readFileSync('./src/lib/translations/vi.ts', 'utf-8');

console.log('--- Checking specific keys ---');
keysToCheck.forEach(key => {
    console.log(`\nKey: "${key}"`);
    console.log(`In KO: ${koContent.includes(`"${key}"`) || koContent.includes(`'${key}'`)}`);
    console.log(`In VI: ${viContent.includes(`"${key}"`) || viContent.includes(`'${key}'`)}`);
});
