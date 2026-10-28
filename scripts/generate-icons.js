import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.resolve('public');
const srcLogo = path.join(publicDir, 'assets', 'aistudio', 'Logo_SPMB_35e816eb.jfif');

if (fs.existsSync(srcLogo)) {
  execSync(`convert "${srcLogo}" -resize 512x512 "${path.join(publicDir, 'pwa-512x512.png')}"`);
  execSync(`convert "${srcLogo}" -resize 192x192 "${path.join(publicDir, 'pwa-192x192.png')}"`);
  execSync(
    `convert "${srcLogo}" -resize 420x420 -gravity center -background white -extent 512x512 "${path.join(publicDir, 'pwa-maskable-512x512.png')}"`
  );
  execSync(`convert "${srcLogo}" -resize 180x180 "${path.join(publicDir, 'apple-touch-icon.png')}"`);
  execSync(`convert "${srcLogo}" -resize 64x64 "${path.join(publicDir, 'favicon.ico')}"`);

  const b64 = fs.readFileSync(path.join(publicDir, 'pwa-512x512.png')).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><image width="512" height="512" href="data:image/png;base64,${b64}"/></svg>`;
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
  console.log('Successfully generated PWA icons from Logo_SPMB_35e816eb.jfif!');
} else {
  console.warn('Source logo not found:', srcLogo);
}
