const fs = require('fs');
const path = require('path');

const iconPath = path.join(__dirname, 'icon-192.png');
const iconBase64 = fs.readFileSync(iconPath).toString('base64');

const appJsPath = path.join(__dirname, 'app.js');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Replace the placeholder base64 in triggerIOSMobileConfigDownload with the actual iconBase64
const oldBase64Pattern = /<key>Icon<\/key>\s*<data>[\s\S]*?<\/data>/;
const newBase64Replacement = `<key>Icon</key>\n            <data>${iconBase64}</data>`;

appJsContent = appJsContent.replace(oldBase64Pattern, newBase64Replacement);

fs.writeFileSync(appJsPath, appJsContent, 'utf8');
console.log('app.js updated with real Nexa icon base64 data for iOS mobileconfig!');
