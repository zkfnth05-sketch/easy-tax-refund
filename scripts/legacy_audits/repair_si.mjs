import fs from 'fs';
const filePath = 'src/lib/translations/si.ts';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');
// Line 221 is index 220
lines[220] = `  "국세청 데이터 조회를 위해 본인 명의의 휴대폰 인증이나 금융인증서가 반드시 필요합니다. 본인 명의가 아닌 경우 상담원을 통해 별도의 방법을 안내받으실 수 있습니다.": "ජාතික බදු සේවා දත්ත විමසීම සඳහා ඔබගේ නමට ලියාපදිංචි ජංගම දුරකථන සහතික කිරීමක් හෝ මූල්‍ය සහතිකයක් අනිවාර්යයෙන්ම අවශ්‍ය වේ. එය ඔබගේ නමින් නොමැති නම්, උපදේශකයෙකු හරහා වෙනත් ක්‍රම පිළිබඳ මග පෙන්වීම් ලබා ගත හැකිය.",`;
fs.writeFileSync(filePath, lines.join('\n'));
console.log('Fixed line 221 of si.ts');
