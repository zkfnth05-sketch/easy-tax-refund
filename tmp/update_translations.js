
const fs = require('fs');
const path = require('path');

const languages = ['bn', 'en', 'id', 'kk', 'km', 'mn', 'my', 'ne', 'si', 'th', 'ur', 'uz', 'vi', 'zh'];
const transDir = 'c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations';

languages.forEach(lang => {
    const filePath = path.join(transDir, lang + '.ts');
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add "30초 만에 환급액 확인" after "30초 만에 환급액 확인하기"
    const regex30 = /"30초 만에 환급액 확인하기":\s*"([^"]+)"/;
    const match30 = content.match(regex30);
    if (match30) {
        const val = match30[1];
        if (!content.includes('"30초 만에 환급액 확인":')) {
            content = content.replace(regex30, `$&,\n  "30초 만에 환급액 확인": "${val}"`);
        }
    }

    // 2. Add "Easy Tax Refund AI 비서 호출하기" after "Easy Tax Refund AI 비서"
    const regexAI = /"Easy Tax Refund AI 비서":\s*"([^"]+)"/;
    const matchAI = content.match(regexAI);
    if (matchAI) {
        const val = matchAI[1];
        if (!content.includes('"Easy Tax Refund AI 비서 호출하기":')) {
            // Derive a "Call" suffix based on language or just use val
            let suffix = " (Call)";
            if (lang === 'bn') suffix = " ডাকুন";
            if (lang === 'en') suffix = " (Call)";
            if (lang === 'vi') suffix = " (Gọi)";
            if (lang === 'zh') suffix = " (呼叫)";
            
            content = content.replace(regexAI, `$&,\n  "Easy Tax Refund AI 비서 호출하기": "${val}${suffix}"`);
        }
    }

    // Clean up my previous mess in bn.ts if needed (though the script above might already handle it by checking includes)
    if (lang === 'bn') {
        content = content.replace(/"30초 만에 환급액 확인_bn":\s*"[^"]+",?\n?/g, '');
        content = content.replace(/"Easy Tax Refund AI 비서_bn":\s*"[^"]+",?\n?/g, '');
        content = content.replace(/"Easy Tax Refund AI 비서 호출하기_bn":\s*"[^"]+",?\n?/g, '');
        // Also remove the dual English keys I added to bn.ts
        content = content.replace(/"30초 만에 환급액 확인하기":\s*"Check Refund Amount in 30 Seconds",?\n?\s*"30초 만에 환급액 확인":\s*"Check Refund Amount in 30 Seconds",?\n?/g, '');
        // Ensure the correct Bengali one is there
        if (!content.includes('"30초 만에 환급액 확인하기": "৩০ সেকেন্ডে রিফান্ড চেক করুন"')) {
             content = content.replace(/"30초 만에 환급액 확인하기":\s*"[^"]+"/, '"30초 만에 환급액 확인하기": "৩০ সেকেন্ডে রিফান্ড চেক করুন"');
        }
        if (!content.includes('"Easy Tax Refund AI 비서": "Easy Tax Refund AI অ্যাসিস্ট্যান্ট"')) {
             content = content.replace(/"Easy Tax Refund AI 비서":\s*"[^"]+"/, '"Easy Tax Refund AI 비서": "Easy Tax Refund AI অ্যাসিস্ট্যান্ট"');
        }
    }

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${lang}.ts`);
});
