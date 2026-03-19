import { ko } from './src/lib/translations/ko.ts';

const si = {};

// Copy keys from ko to si
Object.keys(ko).forEach(key => {
  si[key] = ko[key];
});

console.log('export const si = ' + JSON.stringify(si, null, 2) + ';');
