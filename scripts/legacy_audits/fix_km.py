import os

filename = r'c:\Users\zkfnt\Desktop\easy-tax-refund\easy-tax-refund-main\easy-tax-refund-main\src\lib\translations\km.ts'

with open(filename, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
found = False
for line in lines:
    if '"외국인 중소기업 청년 소득세 감면"에 대해 무엇이든 물어보세요.' in line and '핸드폰 본인 인증' not in line:
        found = True
        # Original line (short variant)
        # We also need the long variant.
        # Let's construct it precisely.
        
        # Example line:   "\"외국인 중소기업 청년 소득세 감면\"에 대해 무엇이든 물어보세요.": "សួរអ្វីក៏បានអំពី \"ការកាត់បន្ថយពន្ធលើប្រាក់ចំណូលសម្រាប់យុវជនបរទេសនៅសហគ្រាសធុនតូច និងមធ្យម\"。",
        
        long_key = '"\\"외국인 중소기업 청년 소득세 감면 및 핸드폰 본인 인증\\"에 대해 무엇이든 물어보세요."'
        long_val = '"សួរអ្វីក៏បានអំពី \\"ការកាត់បន្ថយពន្ធលើប្រាក់ចំណូលសម្រាប់យុវជនបរទេសនៅសហគ្រាសធុនតូច និងមធ្យម និងការបញ្ជាក់អត្តសញ្ញាណតាមទូរស័ព្ទដៃ\\"。"'
        
        indent = line[:line.find('"')]
        new_lines.append(f'{indent}{long_key}: {long_val},\n')
        new_lines.append(line)
    else:
        new_lines.append(line)

if found:
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Successfully updated km.ts")
else:
    print("Could not find the target line in km.ts")
