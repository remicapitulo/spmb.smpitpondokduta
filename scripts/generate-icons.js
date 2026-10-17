import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPng(width, height, drawFn) {
  // RGBA buffer with filter byte per row
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowBytes);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const chunkForCrc = buf.subarray(4, 8 + len);
    buf.writeUInt32BE(crc32(chunkForCrc), 8 + len);
    return buf;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type (RGBA)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Drawing logic: Islamic green shield/rounded rect with golden crescent, open book, and star
function drawIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: Rich Islamic Emerald Green (#047857 to #064E3B)
  const normY = y / h;
  const bgR = Math.round(4 + normY * 2);
  const bgG = Math.round(120 - normY * 42);
  const bgB = Math.round(87 - normY * 28);

  // Rounded squircle / circular border
  const cornerRadius = w * 0.22;
  const qx = Math.max(Math.abs(dx) - (cx - cornerRadius), 0);
  const qy = Math.max(Math.abs(dy) - (cy - cornerRadius), 0);
  const cornerDist = Math.sqrt(qx * qx + qy * qy);

  if (cornerDist > cornerRadius) {
    return [0, 0, 0, 0]; // Transparent outer
  }

  // Gold outer border ring (width: 3% of size)
  const isBorder = (cornerDist > cornerRadius - w * 0.035) ||
    (Math.abs(dx) > cx - w * 0.04 && cornerDist <= cornerRadius) ||
    (Math.abs(dy) > cy - w * 0.04 && cornerDist <= cornerRadius);

  if (isBorder) {
    // Gold color (#F59E0B / #D97706)
    return [245, 158, 11, 255];
  }

  // Inner elements:
  // 1. Crescent & Star / Mosque Arch silhouette
  // Book at bottom:
  // Center is (cx, cy + h*0.08)
  const bookY = cy + h * 0.08;
  const bookHalfW = w * 0.28;
  const bookH = h * 0.16;

  if (y >= bookY && y <= bookY + bookH && Math.abs(dx) <= bookHalfW) {
    // Open book pages
    const pageCurve = Math.sin((dx / bookHalfW) * Math.PI) * (h * 0.04);
    if (y >= bookY + pageCurve && y <= bookY + bookH + pageCurve * 0.5) {
      if (Math.abs(dx) < w * 0.015) {
        // Spine
        return [217, 119, 6, 255];
      }
      return [255, 255, 255, 255]; // Crisp white pages
    }
  }

  // Minaret / Arch above book
  const archTop = cy - h * 0.28;
  const archBase = bookY - h * 0.02;
  const archHalfW = w * 0.22;

  if (y >= archTop && y <= archBase && Math.abs(dx) <= archHalfW) {
    // Arch point equation: curve from top
    const normArchY = (y - archTop) / (archBase - archTop);
    const maxArchX = archHalfW * Math.min(1, Math.sqrt(normArchY) * 1.1);
    if (Math.abs(dx) <= maxArchX) {
      // Golden dome / arch inner glow
      if (normArchY < 0.25 || Math.abs(dx) > maxArchX - w * 0.02) {
        return [252, 211, 77, 255]; // Golden outline
      }
    }
  }

  // 8-Point Islamic Star at center top
  const starCY = cy - h * 0.12;
  const starDX = dx;
  const starDY = y - starCY;
  const starDist = Math.sqrt(starDX * starDX + starDY * starDY);
  const starR = w * 0.09;
  if (starDist < starR) {
    const angle = Math.atan2(starDY, starDX);
    const modAngle = ((angle % (Math.PI / 4)) + (Math.PI / 4)) % (Math.PI / 4);
    const rStar = starR * (0.65 + 0.35 * Math.cos(modAngle * 4));
    if (starDist <= rStar) {
      return [251, 191, 36, 255]; // Golden Star
    }
  }

  // Base background emerald
  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, drawIcon));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, drawIcon));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, (x,y,w,h) => {
  // Maskable version: fill square background so no transparent corners get clipped
  const [r,g,b,a] = drawIcon(x, y, w, h);
  if (a === 0) {
    return [4, 120, 87, 255]; // solid emerald safe bleed
  }
  return [r,g,b,a];
}));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, drawIcon));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, drawIcon));

console.log('Successfully generated PWA icons in /public!');
