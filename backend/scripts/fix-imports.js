/**
 * Fix ES module imports to include .js extensions
 * This script adds .js extensions to relative imports in compiled JS files
 */

const fs = require('fs');
const path = require('path');

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix relative imports (../something or ./something) to include .js
  content = content.replace(
    /from\s+['"](\.\.?\/[^'"]+)['"]/g,
    (match, importPath) => {
      // Don't modify if already has extension or is a package import
      if (importPath.includes('.js') || importPath.startsWith('@') || !importPath.startsWith('.')) {
        return match;
      }
      modified = true;
      return `from '${importPath}.js'`;
    }
  );
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.js') && !file.endsWith('.d.ts')) {
      fixImportsInFile(filePath);
    }
  }
}

// Fix imports in dist directory
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  console.log('Fixing imports in dist directory...');
  walkDir(distDir);
  console.log('Done!');
}

