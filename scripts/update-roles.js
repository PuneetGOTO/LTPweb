const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes('role !== "ADMIN"')) {
    content = content.replace(/\(session\.user as any\)\.role !== "ADMIN"/g, '!["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
