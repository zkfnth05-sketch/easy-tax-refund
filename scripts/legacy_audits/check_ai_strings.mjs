
import fs from 'fs';

const koContent = fs.readFileSync('./src/lib/translations/ko.ts', 'utf-8');

const keysToCheck = [
    "휴대폰 PASS 앱 알림을 확인하고 승인해주세요.",
    "문자로 발송된 인증번호를 입력해주세요.",
    "인증 세션이 활성화되었습니다. (데모 모드)",
    "시스템 점검 중으로 데모 모드로 전환되었습니다.",
    "축하합니다! 숨겨진 환급금을 찾았습니다.",
    "중소기업 취업자 소득세 감면 (90%)",
    "연도별 국세청 상태 시계열 검증 완료",
    "조회된 중복 감면 내역이 없습니다.",
    "이미 감면 혜택을 받고 계시네요!",
    "납부하신 세금이 없어 환급액이 0원입니다.",
    "조회된 데이터가 없습니다."
];

console.log('--- Checking AI Flow Strings in ko.ts ---');
keysToCheck.forEach(k => {
    if (koContent.includes(`"${k}"`)) {
        console.log(`[OK] Found: "${k}"`);
    } else {
        console.log(`[MISSING] Not found: "${k}"`);
    }
});
