import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const translationsDir = 'src/lib/translations';
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  try {
    // Attempt to transpile and run with sucrase-node
    execSync(`.\\node_modules\\.bin\\sucrase-node ${filePath}`, { stdio: 'ignore' });
    console.log(`[OK] ${file}`);
  } catch (err) {
    console.error(`[ERROR] ${file}: Syntax error or failed to parse.`);
  }
});
