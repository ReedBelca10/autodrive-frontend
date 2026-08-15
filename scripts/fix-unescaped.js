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
  let original = content;

  // Common safe replacements
  content = content.replace(/Pas d'image/g, "Pas d’image");
  content = content.replace(/Pas d\"image/g, "Pas d’image");

  // Replace straight apostrophes between letters with typographic apostrophe
  // e.g., l'article -> l’article, n'est -> n’est
  content = content.replace(/([A-Za-zÀ-ÖØ-öø-ÿ])'(?=[A-Za-zÀ-ÖØ-öø-ÿ])/g, "$1’");

  // Replace common contractions with upper-case starting
  content = content.replace(/([A-Za-zÀ-ÖØ-öø-ÿ])\'(?=[A-Za-zÀ-ÖØ-öø-ÿ])/g, "$1’");

  // Replace common patterns like "S'abonner" -> "S’abonner"
  content = content.replace(/S'(?=[A-Za-zÀ-ÖØ-öø-ÿ])/g, "S’");
  content = content.replace(/s'(?=[A-Za-zÀ-ÖØ-öø-ÿ])/g, "s’");

  // Replace straight double quotes around small sentences in JSX like "\"text\"" -> typographic quotes
  content = content.replace(/"([^\n\r\"]{1,100})"/g, '“$1”');

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
      console.log('Fixed', f);
      changed++;
    }
  } catch (e) {
    console.error('Error processing', f, e.message);
  }
}
console.log('Total files changed:', changed);
process.exit(0);
