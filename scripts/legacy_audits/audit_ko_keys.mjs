import { ko } from './src/lib/translations/ko.ts';
import { zh } from './src/lib/translations/zh.ts';
import { vi } from './src/lib/translations/vi.ts';

const koKeys = Object.keys(ko);
const zhKeys = Object.keys(zh);
const viKeys = Object.keys(vi);

console.log('Keys in zh but not in ko:');
zhKeys.forEach(k => {
  if (!koKeys.includes(k)) console.log(`- ${k}`);
});

console.log('Keys in vi but not in ko:');
viKeys.forEach(k => {
  if (!koKeys.includes(k)) console.log(`- ${k}`);
});
