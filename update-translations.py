import os
import re

# New translation keys to add
new_keys = {
    "보완 서류 제출이 필요합니다": {
        "ko": "보완 서류 제출이 필요합니다",
        "en": "Document Supplement Required",
        "zh": "需要提交补充材料",
        "vi": "Yêu cầu bổ sung tài liệu",
        "id": "Diperlukan Tambahan Dokumen",
        "th": "ต้องส่งเอกสารเพิ่มเติม",
        "km": "តម្រូវឱ្យមានការបំពេញបន្ថែមឯកសារ",
        "uz": "Hujjatlarni to'ldirish talab qilinadi",
        "mn": "Баримт бичгийн бүрдүүлэлт шаардлагатай",
        "my": "စာရွက်စာတမ်းဖြည့်စွက်ရန်လိုအပ်သည်",
        "ne": "थप कागजातहरू आवश्यक छ",
        "si": "අතිරේක ලේඛන අවශ්‍ය වේ",
        "ur": "اضافی دستاویزات درکار ہیں",
        "kk": "Құжаттарды толықтыру қажет",
        "bn": "অতিরিক্ত নথিপত্র প্রয়োজন"
    },
    "정확한 환급액 산출을 위해 아래 서류를 추가로 제출해 주세요.": {
        "ko": "정확한 환급액 산출을 위해 아래 서류를 추가로 제출해 주세요.",
        "en": "Please submit the following documents for an accurate refund calculation.",
        "zh": "为了准确计算退税额，请额外提交以下材料。",
        "vi": "Vui lòng nộp thêm các tài liệu sau để tính toán số tiền hoàn thuế chính xác.",
        "id": "Harap serahkan dokumen berikut untuk perhitungan pengembalian dana yang akurat.",
        "th": "โปรดส่งเอกสารต่อไปนี้เพื่อการคำนวณเงินคืนที่ถูกต้อง",
        "km": "សូមបញ្ជូនឯកសារខាងក្រោមសម្រាប់ការគណនាការបង្វិල්ប្រាក់វិញឱ្យបានត្រឹមត្រូវ។",
        "uz": "To'g'ri qaytarish summasini hisoblash uchun quyidagi hujjatlarni qo'shimcha ravishda topshiring.",
        "mn": "Буцаан олголтыг үнэн зөв тооцоолохын тулд дараах баримт бичгийг нэмж ирүүлнэ үү.",
        "my": "တိကျသောပြန်အမ်းငွေတွက်ချက်မှုအတွက် အောက်ပါစာရွက်စာတမ်းများကို ထပ်မံတင်ပြပါ။",
        "ne": "सही फिर्ता गणनाको लागि कृपया निम्न कागजातहरू पेश गर्नुहोस्।",
        "si": "නිවැරදි ආපසු ගෙවීමේ ගණනය කිරීම සඳහා කරුණාකර පහත ලේඛන ඉදිරිපත් කරන්න.",
        "ur": "درست ریفنڈ حساب کتاب کے لیے براہ کرم درج ذیل دستاویزات جمع کرائیں۔",
        "kk": "Қайтару сомасын дәл есептеу үшін төмендегі құжаттарды қосымша өткізіңіз.",
        "bn": "সঠিক অর্থ ফেরতের হিসাবের জন্য দয়া করে নিচের নথিপত্রগুলো জমা দিন।"
    },
    "지금 업로드": {
        "ko": "지금 업로드",
        "en": "Upload Now",
        "zh": "现在上传",
        "vi": "Tải lên ngay",
        "id": "Unggah Sekarang",
        "th": "อัปโหลดทันที",
        "km": "അപ്‌ലോഡ് ചെയ്യുക",
        "uz": "Hoziroq yuklash",
        "mn": "Одоо ачаалах",
        "my": "ယခုတင်ပါ",
        "ne": "अहिले अपलोड गर्नुहोस्",
        "si": "දැන් උඩුගත කරන්න",
        "ur": "ابھی اپ لوڈ کریں",
        "kk": "Қазір жүктеу",
        "bn": "এখনই আপলোড করুন"
    },
    "서류 보완 필요": {
        "ko": "서류 보완 필요",
        "en": "Documents Needed",
        "zh": "需要补充材料",
        "vi": "Cần bổ sung hồ sơ",
        "id": "Perlu Lengkapi Dokumen",
        "th": "ต้องส่งเอกสารเพิ่ม",
        "km": "ត្រូវការបំពេញឯកសារ",
        "uz": "Hujjatlar yetarli emas",
        "mn": "Баримт бичиг шаардлагатай",
        "my": "စာရွက်စာတမ်းလိုအပ်သည်",
        "ne": "कागजातहरू आवश्यक छ",
        "si": "ලේඛන අවශ්‍ය වේ",
        "ur": "دستاویزات درکار ہیں",
        "kk": "Құжаттар қажет",
        "bn": "নথিপত্র প্রয়োজন"
    }
}

dir_path = "c:/Users/zkfnt/Desktop/easy-tax-refund/easy-tax-refund-main/easy-tax-refund-main/src/lib/translations"

# For each file in the directory
for filename in os.listdir(dir_path):
    if filename.endswith(".ts") and filename != "index.ts" and filename != "config.ts":
        lang_code = filename[:-3]
        file_path = os.path.join(dir_path, filename)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Insert before the last closing brace
        last_brace_index = content.rfind('};')
        if last_brace_index == -1:
            last_brace_index = content.rfind('}')
            
        if last_brace_index != -1:
            insert_content = "\n  // New portal status & alerts\n"
            for key, translations in new_keys.items():
                val = translations.get(lang_code, translations.get("en", key))
                # Escape double quotes in value
                val = val.replace('"', '\\"')
                insert_content += f'  "{key}": "{val}",\n'
            
            new_content = content[:last_brace_index] + insert_content + content[last_brace_index:]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
