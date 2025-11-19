/**
 * Script to replace console.log statements with consoleLogger
 * Run this script to update all route files
 * 
 * Usage: node scripts/replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const routesDir = path.join(__dirname, '../routes');
const files = glob.sync('**/*.js', { cwd: routesDir, absolute: true });

console.log(`Found ${files.length} route files to process`);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Add consoleLogger import if not present and file uses console
  if (content.includes('console.') && !content.includes('consoleLogger')) {
    // Find the last require statement
    const requireMatch = content.match(/(const\s+\w+\s*=\s*require\([^)]+\);?\s*\n)/g);
    if (requireMatch) {
      const lastRequire = requireMatch[requireMatch.length - 1];
      const consoleLoggerRequire = "const consoleLogger = require('../utils/logger');\n";
      content = content.replace(lastRequire, lastRequire + consoleLoggerRequire);
      modified = true;
    }
  }

  // Replace console.log with consoleLogger.log
  if (content.includes('console.log(')) {
    content = content.replace(/console\.log\(/g, 'consoleLogger.log(');
    modified = true;
  }

  // Replace console.warn with consoleLogger.warn
  if (content.includes('console.warn(')) {
    content = content.replace(/console\.warn\(/g, 'consoleLogger.warn(');
    modified = true;
  }

  // Replace console.info with consoleLogger.info
  if (content.includes('console.info(')) {
    content = content.replace(/console\.info\(/g, 'consoleLogger.info(');
    modified = true;
  }

  // Replace console.debug with consoleLogger.debug
  if (content.includes('console.debug(')) {
    content = content.replace(/console\.debug\(/g, 'consoleLogger.debug(');
    modified = true;
  }

  // Keep console.error as consoleLogger.error (errors should always be logged)
  if (content.includes('console.error(')) {
    content = content.replace(/console\.error\(/g, 'consoleLogger.error(');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated: ${path.basename(file)}`);
  } else {
    console.log(`⏭️  Skipped: ${path.basename(file)} (no console statements)`);
  }
});

console.log('\n✅ All files processed!');

