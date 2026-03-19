const fs = require('fs');
const path = require('path');

const languages = ['ko', 'en', 'vi', 'zh', 'ne', 'km', 'th', 'id', 'my', 'uz'];
const keysToCheck = [
  "Real-time Update",
  "Just now",
  "Vietnam",
  "China",
  "Nepal",
  "Cambodia",
  "Thailand",
  "Uzbekistan",
  "Philippines",
  "Mongolia",
  "Myanmar",
  "Just checked refund amount",
  "Applied for refund",
  "Completed document upload",
  "Verified identity"
];

languages.forEach(lang => {
  const filePath = path.join('src', 'lib', 'translations', `${lang}.ts`);
  if (!fs.existsSync(filePath)) {
    console.log(`[MISSING FILE] ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  
  keysToCheck.forEach(key => {
    const regex = new RegExp(`"${key}":`, 'g');
    const matches = content.match(regex);
    const count = matches ? matches.length : 0;
    if (count === 0) {
      console.log(`[MISSING KEY] ${lang}: ${key}`);
    } else if (count > 1) {
      console.log(`[DUPLICATE KEY] ${lang}: ${key} (Count: ${count})`);
    }
  });
});
