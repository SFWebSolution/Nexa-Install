const fs = require('fs');
const path = require('path');

const userIconPath = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\4796ab17-24b0-4618-b88e-13a04903d2b0\\.user_uploaded\\media_1786850637655.png';
const targetDir = 'c:\\Users\\HP\\Desktop\\Nexa Install';

const userIconBuf = fs.readFileSync(userIconPath);

fs.writeFileSync(path.join(targetDir, 'icon-512.png'), userIconBuf);
fs.writeFileSync(path.join(targetDir, 'icon-192.png'), userIconBuf);
fs.writeFileSync(path.join(targetDir, 'apple-touch-icon.png'), userIconBuf);
fs.writeFileSync(path.join(targetDir, 'nexa-logo.png'), userIconBuf);

console.log('Successfully copied user Nexa icon to icon-512.png, icon-192.png, apple-touch-icon.png, and nexa-logo.png!');
