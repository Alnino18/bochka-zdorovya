import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// CRC32 calculation table
const crcTable = new Uint32Array(256);
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
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, isMaskable = false) {
  // RGBA pixels
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.45 : width * 0.42;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable) {
        // Full background filling entire canvas (maskable safe zone in center)
        if (dist < radius) {
          // Inner badge (emerald/teal)
          const grad = y / height;
          const r = Math.round(13 + grad * 10);
          const g = Math.round(148 - grad * 30);
          const b = Math.round(136 - grad * 30);
          rawData[offset++] = r;
          rawData[offset++] = g;
          rawData[offset++] = b;
          rawData[offset++] = 255;
        } else {
          // Teal background
          rawData[offset++] = 15;
          rawData[offset++] = 118;
          rawData[offset++] = 110;
          rawData[offset++] = 255;
        }
      } else {
        // Rounded corner badge or circular icon
        const cornerDist = Math.max(Math.abs(dx), Math.abs(dy));
        if (cornerDist < width * 0.46) {
          // Barrel / wellness center teal
          const t = y / height;
          const r = Math.round(15 * (1 - t) + 13 * t);
          const g = Math.round(118 * (1 - t) + 148 * t);
          const b = Math.round(110 * (1 - t) + 136 * t);
          rawData[offset++] = r;
          rawData[offset++] = g;
          rawData[offset++] = b;
          rawData[offset++] = 255;
        } else {
          // Transparent outside
          rawData[offset++] = 0;
          rawData[offset++] = 0;
          rawData[offset++] = 0;
          rawData[offset++] = 0;
        }
      }
    }
  }

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createIco(pngBuffer) {
  // ICO header (6 bytes) + 1 directory entry (16 bytes) + PNG data
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(1, 4); // 1 image

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(48, 0); // Width 48
  dirEntry.writeUInt8(48, 1); // Height 48
  dirEntry.writeUInt8(0, 2);  // Colors (0 = >256)
  dirEntry.writeUInt8(0, 3);  // Reserved
  dirEntry.writeUInt16LE(1, 4); // Color planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // Size of image
  dirEntry.writeUInt32LE(22, 12); // Offset to image data (6 + 16 = 22)

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

const iconsDir = path.resolve('public/icons');
fs.mkdirSync(iconsDir, { recursive: true });

// 1. Generate icon-192.png
const png192 = createPng(192, 192, false);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);

// 2. Generate icon-512.png
const png512 = createPng(512, 512, false);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);

// 3. Generate icon-maskable-192.png
const pngMask192 = createPng(192, 192, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192.png'), pngMask192);

// 4. Generate icon-maskable-512.png
const pngMask512 = createPng(512, 512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), pngMask512);

// 5. Generate favicon.ico (based on 48x48 PNG)
const png48 = createPng(48, 48, false);
const ico = createIco(png48);
fs.writeFileSync(path.resolve('public/favicon.ico'), ico);

console.log('Icons and favicon successfully generated!');
