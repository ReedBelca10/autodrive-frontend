const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const filepath = path.join(dir, f);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, filelist);
    } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts') || filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  // Replace typographic double quotes with ASCII double quotes
  content = content.replace(/[\u201C\u201D]/g, '"');
  // Fix use client/server directive if it was changed to typographic quotes
  content = content.replace(/^\s*"use client";?/m, '"use client";');
  content = content.replace(/^\s*"use server";?/m, '"use server";');
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    return true;
  }
  return false;
}

const root = path.join(__dirname, '..');
const targets = walk(path.join(root, 'app')).concat(walk(path.join(root, 'components')));
let changed = 0;
for (const f of targets) {
  try {
    if (fixFile(f)) {
      console.log('Reverted', f);
      changed++;
    }
  } catch (e) {
    console.error('Error processing', f, e.message);
  }
}
console.log('Total files changed:', changed);
process.exit(0);
