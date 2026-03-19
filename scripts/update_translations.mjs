import fs from 'fs';
import path from 'path';

/**
 * Usage: node update_translations.mjs [language_code] [new_translations_json_file]
 * Example: node update_translations.mjs si new_si.json
 */

const lang = process.argv[2];
const inputFile = process.argv[3];

if (!lang || !inputFile) {
  console.error('Usage: node update_translations.mjs [lang] [input_json_file]');
  process.exit(1);
}

const targetFile = `./src/lib/translations/${lang}.ts`;
const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

if (!fs.existsSync(targetFile)) {
  console.error(`Target file ${targetFile} not found.`);
  process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

// Simple regex-based merge to preserve formatting/comments
// This looks for the exported object and adds new keys before the closing brace
// Note: This is a basic implementation. For production-level use, a more robust parser would be better.

for (const [key, value] of Object.entries(inputData)) {
  const safeValue = value.replace(/"/g, '\\"');
  const keyExists = new RegExp(`"${key}"\\s*:`).test(content);

  if (keyExists) {
    // Update existing key
    content = content.replace(new RegExp(`("${key}"\\s*:\\s*)"(.*?)"`), `$1"${safeValue}"`);
    console.log(`Updated: ${key}`);
  } else {
    // Append new key before the last brace
    const insertion = `  "${key}": "${safeValue}",\n`;
    const lastBraceIndex = content.lastIndexOf('}');
    content = content.slice(0, lastBraceIndex) + insertion + content.slice(lastBraceIndex);
    console.log(`Added: ${key}`);
  }
}

fs.writeFileSync(targetFile, content);
console.log(`\nSuccessfully updated ${targetFile}`);
