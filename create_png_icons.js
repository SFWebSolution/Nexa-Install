const fs = require('fs');
const path = require('path');
const { createPNG } = require('zlib');

// Create a valid minimalist 192x192 and 512x512 PNG file with Nexa Indigo/Cyan colors
function createSimplePNG(width, height) {
  // We can write an SVG file as well, but let's build a standard valid PNG chunk stream
  // A 1x1 or sized PNG structure
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // Bit depth: 8
  ihdr.writeUInt8(6, 17); // Color type: 6 (RGBA)
  ihdr.writeUInt8(0, 18); // Compression
  ihdr.writeUInt8(0, 19); // Filter
  ihdr.writeUInt8(0, 20); // Interlace

  // Simple raw pixel data (Indigo #6366f1)
  const rowSize = width * 4 + 1;
  const imgData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    imgData[rowStart] = 0; // Filter type 0
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      // Gradient effect: Indigo to Cyan
      const factor = (x + y) / (width + height);
      imgData[idx] = Math.floor(99 * (1 - factor) + 6 * factor); // Red
      imgData[idx + 1] = Math.floor(102 * (1 - factor) + 182 * factor); // Green
      imgData[idx + 2] = Math.floor(241 * (1 - factor) + 212 * factor); // Blue
      imgData[idx + 3] = 255; // Alpha
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(imgData);

  const idat = Buffer.alloc(12 + compressed.length);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);

  const crc32 = (buf) => {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let c = buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
    }
    return (crc ^ (-1)) >>> 0;
  };

  // Compute CRCs for IHDR and IDAT
  // CRC for IHDR
  const ihdrTypeAndData = ihdr.slice(4, 21);
  ihdr.writeUInt32BE(calculateCRC(ihdrTypeAndData), 21);

  // CRC for IDAT
  const idatTypeAndData = idat.slice(4, 8 + compressed.length);
  idat.writeUInt32BE(calculateCRC(idatTypeAndData), 8 + compressed.length);

  // IEND chunk
  const iend = Buffer.from([0, 0, 0, 0, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);

  return Buffer.concat([header, ihdr, idat, iend]);
}

function calculateCRC(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

fs.writeFileSync(path.join(__dirname, 'icon-192.png'), createSimplePNG(192, 192));
fs.writeFileSync(path.join(__dirname, 'icon-512.png'), createSimplePNG(512, 512));

console.log('icon-192.png and icon-512.png generated successfully.');
