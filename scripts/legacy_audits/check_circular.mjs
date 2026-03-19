import fs from 'fs';
import path from 'path';

const srcDir = './src';
const fileMap = new Map();

function getImports(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = [];
  const importRegex = /from\s+['"](@\/|.\/|..\/)([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    let importPath = match[2];
    let resolvedPath = '';
    
    if (match[1] === '@/') {
      resolvedPath = path.join(srcDir, importPath);
    } else {
      resolvedPath = path.resolve(path.dirname(filePath), match[1] + importPath);
    }

    if (fs.existsSync(resolvedPath + '.ts')) resolvedPath += '.ts';
    else if (fs.existsSync(resolvedPath + '.tsx')) resolvedPath += '.tsx';
    else if (fs.existsSync(resolvedPath + '/index.ts')) resolvedPath += '/index.ts';
    else if (fs.existsSync(resolvedPath + '/index.tsx')) resolvedPath += '/index.tsx';
    
    if (resolvedPath.endsWith('.ts') || resolvedPath.endsWith('.tsx')) {
      imports.push(path.relative(process.cwd(), resolvedPath).replace(/\\/g, '/'));
    }
  }
  return imports;
}

function checkCircular(filePath, visited = new Set(), pathStack = []) {
  const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  if (pathStack.includes(relPath)) {
    console.log('CIRCULAR DEPENDENCY DETECTED:');
    console.log(pathStack.join(' -> ') + ' -> ' + relPath);
    return true;
  }
  if (visited.has(relPath)) return false;

  visited.add(relPath);
  pathStack.push(relPath);

  const imports = getImports(filePath);
  for (const imp of imports) {
    const impAbsPath = path.resolve(process.cwd(), imp);
    if (checkCircular(impAbsPath, visited, [...pathStack])) {
      // Keep searching for more
    }
  }
  return false;
}

function scan(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        scan(fullPath);
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      checkCircular(fullPath);
    }
  }
}

scan(srcDir);
console.log('Scan complete.');
