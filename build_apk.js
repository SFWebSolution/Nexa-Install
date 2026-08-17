const { execSync } = require('child_process');
const path = require('path');

console.log('Building native Android APK package (binary AXML + classes.dex + V1 signatures)...');

try {
  const pythonScript = path.join(__dirname, 'build_apk_native.py');
  const output = execSync(`python "${pythonScript}"`, { encoding: 'utf8' });
  console.log(output);
  console.log('✅ Nexa-Messenger.apk successfully compiled into native Android binary format!');
} catch (err) {
  console.error('Error building APK package:', err.message);
  process.exit(1);
}
