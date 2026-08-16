const fs = require('fs');
const path = require('path');

class SimpleZip {
  constructor() {
    this.files = [];
  }

  addFile(name, contentBuffer) {
    this.files.push({
      name: name,
      data: contentBuffer,
      crc: this.calculateCRC32(contentBuffer)
    });
  }

  calculateCRC32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  toBuffer() {
    let localHeaders = [];
    let centralDirectories = [];
    let offset = 0;

    for (let file of this.files) {
      let fileNameBuf = Buffer.from(file.name, 'utf8');
      let dataBuf = file.data;
      
      let localHeader = Buffer.alloc(30 + fileNameBuf.length);
      localHeader.writeUInt32LE(0x04034b50, 0);
      localHeader.writeUInt16LE(20, 4);
      localHeader.writeUInt16LE(0, 6);
      localHeader.writeUInt16LE(0, 8);
      localHeader.writeUInt16LE(0, 10);
      localHeader.writeUInt16LE(0, 12);
      localHeader.writeUInt32LE(file.crc, 14);
      localHeader.writeUInt32LE(dataBuf.length, 18);
      localHeader.writeUInt32LE(dataBuf.length, 22);
      localHeader.writeUInt16LE(fileNameBuf.length, 26);
      localHeader.writeUInt16LE(0, 28);
      fileNameBuf.copy(localHeader, 30);

      localHeaders.push(localHeader);
      localHeaders.push(dataBuf);

      let cdHeader = Buffer.alloc(46 + fileNameBuf.length);
      cdHeader.writeUInt32LE(0x02014b50, 0);
      cdHeader.writeUInt16LE(20, 4);
      cdHeader.writeUInt16LE(20, 6);
      cdHeader.writeUInt16LE(0, 8);
      cdHeader.writeUInt16LE(0, 10);
      cdHeader.writeUInt16LE(0, 12);
      cdHeader.writeUInt16LE(0, 14);
      cdHeader.writeUInt32LE(file.crc, 16);
      cdHeader.writeUInt32LE(dataBuf.length, 20);
      cdHeader.writeUInt32LE(dataBuf.length, 24);
      cdHeader.writeUInt16LE(fileNameBuf.length, 28);
      cdHeader.writeUInt16LE(0, 30);
      cdHeader.writeUInt16LE(0, 32);
      cdHeader.writeUInt16LE(0, 34);
      cdHeader.writeUInt16LE(0, 36);
      cdHeader.writeUInt32LE(0, 38);
      cdHeader.writeUInt32LE(offset, 42);
      fileNameBuf.copy(cdHeader, 46);

      centralDirectories.push(cdHeader);
      offset += localHeader.length + dataBuf.length;
    }

    let cdStartOffset = offset;
    let cdSize = 0;
    for (let cd of centralDirectories) {
      cdSize += cd.length;
    }

    let eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(0, 4);
    eocd.writeUInt16LE(0, 6);
    eocd.writeUInt16LE(this.files.length, 8);
    eocd.writeUInt16LE(this.files.length, 10);
    eocd.writeUInt32LE(cdSize, 12);
    eocd.writeUInt32LE(cdStartOffset, 16);
    eocd.writeUInt16LE(0, 20);

    return Buffer.concat([...localHeaders, ...centralDirectories, eocd]);
  }
}

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

const zip = new SimpleZip();

// 1. AndroidManifest.xml
const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.nexa.messenger"
    android:versionCode="100"
    android:versionName="1.0.0">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <application
        android:allowBackup="true"
        android:icon="@drawable/icon"
        android:label="Nexa Messenger"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name="com.nexa.messenger.MainActivity"
            android:exported="true"
            android:label="Nexa Messenger"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

zip.addFile('AndroidManifest.xml', Buffer.from(manifestXml, 'utf8'));

// 2. Embed High-Res PNG App Icons into APK package
const icon192Buf = fs.readFileSync(path.join(__dirname, 'icon-192.png'));
const icon512Buf = fs.readFileSync(path.join(__dirname, 'icon-512.png'));

zip.addFile('res/drawable/icon.png', icon512Buf);
zip.addFile('res/mipmap-hdpi/icon.png', icon192Buf);
zip.addFile('res/mipmap-xxhdpi/icon.png', icon512Buf);
zip.addFile('assets/icon.png', icon512Buf);

// 3. App metadata
const appConfigJson = JSON.stringify({
  appName: "Nexa Messenger",
  startUrl: "https://nexa-qydr.onrender.com",
  themeColor: "#6366f1",
  backgroundColor: "#0b0f19",
  version: "1.0.0",
  icon: "assets/icon.png"
}, null, 2);

zip.addFile('assets/app_config.json', Buffer.from(appConfigJson, 'utf8'));

// Save APK
const apkBuffer = zip.toBuffer();
fs.writeFileSync(path.join(__dirname, 'Nexa-Messenger.apk'), apkBuffer);

console.log(`Nexa-Messenger.apk built with embedded Nexa high-res icons! Size: ${apkBuffer.length} bytes.`);
