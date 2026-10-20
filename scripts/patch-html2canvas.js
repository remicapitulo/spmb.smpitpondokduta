import fs from 'fs';

const files = [
  'node_modules/html2canvas/dist/html2canvas.js',
  'node_modules/html2canvas/dist/html2canvas.esm.js',
  'node_modules/html2canvas/dist/html2canvas.min.js',
  'node_modules/.vite/deps/html2canvas.js'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const targetPattern = /throw new Error\(\s*["']Attempting to parse an unsupported color function/g;
    if (targetPattern.test(content)) {
      // Replace the throw statement with return 0 (transparent color pack)
      content = content.replace(
        /if\s*\(\s*typeof\s+colorFunction\s*===\s*['"]undefined['"]\s*\)\s*\{\s*throw new Error\([^)]+\);\s*\}/g,
        'if (typeof colorFunction === "undefined") { return 0; }'
      );
      content = content.replace(
        /if\s*\(\s*typeof\s+colorFunction\s*===\s*['"]undefined['"]\s*\)\s*throw new Error\([^)]+\);/g,
        'if (typeof colorFunction === "undefined") return 0;'
      );
      fs.writeFileSync(file, content, 'utf8');
      console.log('Successfully patched:', file);
    }
  }
}
