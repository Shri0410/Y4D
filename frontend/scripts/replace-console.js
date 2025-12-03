/**
 * Script to replace all console statements with logger
 * Run with: node scripts/replace-console.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');
const filesToSkip = ['logger.js', 'main.jsx']; // Files to skip

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (!filesToSkip.includes(file)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function replaceConsoleStatements(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let hasLoggerImport = content.includes('import') && content.includes('logger');
  
  // Replace console.log with logger.log
  if (content.includes('console.log')) {
    content = content.replace(/console\.log\(/g, 'logger.log(');
    modified = true;
  }
  
  // Replace console.error with logger.error
  if (content.includes('console.error')) {
    content = content.replace(/console\.error\(/g, 'logger.error(');
    modified = true;
  }
  
  // Replace console.warn with logger.warn
  if (content.includes('console.warn')) {
    content = content.replace(/console\.warn\(/g, 'logger.warn(');
    modified = true;
  }
  
  // Replace console.info with logger.info
  if (content.includes('console.info')) {
    content = content.replace(/console\.info\(/g, 'logger.info(');
    modified = true;
  }
  
  // Replace console.debug with logger.debug
  if (content.includes('console.debug')) {
    content = content.replace(/console\.debug\(/g, 'logger.debug(');
    modified = true;
  }
  
  // Add logger import if needed
  if (modified && !hasLoggerImport) {
    // Find the last import statement
    const importRegex = /^import\s+.*$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const nextLineIndex = content.indexOf('\n', lastImportIndex);
      
      // Determine relative path to logger
      const relativePath = path.relative(path.dirname(filePath), path.join(srcDir, 'utils', 'logger.js'))
        .replace(/\\/g, '/')
        .replace(/\.js$/, '');
      
      const loggerImport = `import logger from "${relativePath.startsWith('.') ? relativePath : './' + relativePath}";`;
      
      content = content.slice(0, nextLineIndex) + '\n' + loggerImport + content.slice(nextLineIndex);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Main execution
console.log('🔍 Finding all JavaScript/JSX files...');
const allFiles = getAllFiles(srcDir);
console.log(`📁 Found ${allFiles.length} files`);

let modifiedCount = 0;
allFiles.forEach(file => {
  if (replaceConsoleStatements(file)) {
    modifiedCount++;
    console.log(`✅ Updated: ${path.relative(srcDir, file)}`);
  }
});

console.log(`\n✨ Done! Modified ${modifiedCount} files.`);

