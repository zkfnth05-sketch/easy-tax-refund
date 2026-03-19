const fs = require('fs');
const content = fs.readFileSync('src/lib/translations/ko.ts', 'utf8');

// Simple regex based replacement to preserve comments and structure
// This is safer than JSON.stringify for maintaining the file's "look"
let newContent = content.replace('export const ko = {', 'export const si = {');

// We want to keep the keys exactly as they are in ko.ts
// The user's si.ts already had some translations, but it was corrupted.
// I will start with a clean copy of ko.ts (keys and values) and then translate the values.

fs.writeFileSync('src/lib/translations/si.ts', newContent, 'utf8');
console.log('Created clean si.ts from ko.ts structure');
