/* ==========================================================================
   Nexa Messenger - Universal Mobile App Installer Engine
   ========================================================================== */

let deferredPrompt = null;
let userDevice = {
  isAndroid: false,
  isIOS: false,
  isDesktop: false,
  isStandalone: false,
  browserName: 'Unknown'
};

document.addEventListener('DOMContentLoaded', () => {
  initDeviceDetection();
  initPWAInstallPrompt();
  registerServiceWorker();
  bindUIEvents();
});

// 1. Device & OS Auto-Detection
function initDeviceDetection() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  
  userDevice.isAndroid = /android/i.test(ua);
  userDevice.isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  userDevice.isDesktop = !userDevice.isAndroid && !userDevice.isIOS;
  userDevice.isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  // Browser type
  if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) {
    userDevice.browserName = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    userDevice.browserName = 'Safari';
  } else if (/edg/i.test(ua)) {
    userDevice.browserName = 'Edge';
  } else if (/firefox|fxios/i.test(ua)) {
    userDevice.browserName = 'Firefox';
  } else if (/samsungbrowser/i.test(ua)) {
    userDevice.browserName = 'Samsung Internet';
  }

  updateUIForDetectedDevice();
}

// 2. Update UI based on Detected Phone/Device
function updateUIForDetectedDevice() {
  const badgeText = document.getElementById('deviceBadgeText');
  const primaryBtn = document.getElementById('primaryInstallBtn');
  const primaryBtnText = document.getElementById('primaryInstallText');
  const statusHeading = document.getElementById('statusHeading');
  const statusSubtext = document.getElementById('statusSubtext');

  if (userDevice.isStandalone) {
    if (badgeText) badgeText.innerText = 'Mobile App Ready 🎉';
    if (statusHeading) statusHeading.innerText = 'Nexa Mobile App Ready!';
    if (statusSubtext) statusSubtext.innerText = 'You are running Nexa Mobile App.';
    if (primaryBtnText) primaryBtnText.innerText = '🚀 Launch Nexa Messenger';
    return;
  }

  if (userDevice.isAndroid) {
    if (badgeText) badgeText.innerText = 'Android Phone 🤖';
    if (statusHeading) statusHeading.innerText = 'Download Nexa Mobile App (APK)';
    if (statusSubtext) statusSubtext.innerText = 'Download the native APK package for supercharged mobile speed.';
    if (primaryBtnText) primaryBtnText.innerText = '⚡ Download Nexa Mobile APK';
  } else if (userDevice.isIOS) {
    if (badgeText) badgeText.innerText = 'iPhone / iPad 🍎';
    if (statusHeading) statusHeading.innerText = 'Install Nexa Mobile App (iOS)';
    if (statusSubtext) statusSubtext.innerText = 'Tap below to add the mobile app directly to your iPhone Home Screen.';
    if (primaryBtnText) primaryBtnText.innerText = '⚡ Install Nexa Mobile App (iPhone)';
  } else {
    if (badgeText) badgeText.innerText = 'Desktop Computer 💻';
    if (statusHeading) statusHeading.innerText = 'Download Nexa Mobile APK';
    if (statusSubtext) statusSubtext.innerText = 'Download the ultra-fast mobile APK package to transfer to your device.';
    if (primaryBtnText) primaryBtnText.innerText = '⚡ Download Nexa Mobile APK (v1.0)';
  }
}

// 3. Register PWA Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Nexa Installer ServiceWorker registered:', reg.scope))
      .catch(err => console.warn('ServiceWorker registration failed:', err));
  }
}

// 4. Capture native beforeinstallprompt
function initPWAInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('beforeinstallprompt captured!');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    updateUIForDetectedDevice();
    alert('Nexa Messenger Mobile App installed successfully! 🎉');
  });
}

// 5. Bind User Action Buttons
function bindUIEvents() {
  const primaryBtn = document.getElementById('primaryInstallBtn');
  const apkBtn = document.getElementById('downloadApkBtn');
  const iosBtn = document.getElementById('installIosBtn');
  const webAppBtn = document.getElementById('launchWebAppBtn');
  const openFrameBtn = document.getElementById('openInFrameBtn');
  const closeFrameBtn = document.getElementById('closeFrameBtn');

  if (primaryBtn) {
    primaryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handlePrimaryInstallClick();
    });
  }

  if (apkBtn) {
    apkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerAndroidAPKDownload();
    });
  }

  if (iosBtn) {
    iosBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerIOSMobileConfigDownload();
    });
  }

  if (webAppBtn) {
    webAppBtn.addEventListener('click', () => {
      window.location.href = 'https://nexa-qydr.onrender.com';
    });
  }

  if (openFrameBtn) {
    openFrameBtn.addEventListener('click', () => {
      document.getElementById('webAppFrameModal').classList.add('active');
    });
  }

  if (closeFrameBtn) {
    closeFrameBtn.addEventListener('click', () => {
      document.getElementById('webAppFrameModal').classList.remove('active');
    });
  }
}

// 6. Master Primary Install Action - Direct Mobile APK Download
function handlePrimaryInstallClick() {
  if (userDevice.isStandalone) {
    window.location.href = 'https://nexa-qydr.onrender.com';
    return;
  }

  if (userDevice.isIOS) {
    triggerIOSMobileConfigDownload();
  } else {
    // Direct Mobile APK Download for maximum speed and native app experience
    triggerAndroidAPKDownload();
  }
}

// 7. Direct Android APK Package Downloader
function triggerAndroidAPKDownload() {
  showToast('📥 Starting Nexa Android APK download...');
  
  const link = document.createElement('a');
  link.href = './Nexa-Messenger.apk';
  link.download = 'Nexa-Messenger.apk';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    showToast('💡 Open "Nexa-Messenger.apk" to install on your phone!');
  }, 2000);
}

// 8. Direct iOS Mobile Configuration WebClip Profile Generator (.mobileconfig)
function triggerIOSMobileConfigDownload() {
  showToast('🍎 Downloading Nexa iOS Profile...');

  const configContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>Nexa</string>
            <key>PayloadDescription</key>
            <string>Installs Nexa Messenger App directly to your iPhone Home Screen.</string>
            <key>PayloadDisplayName</key>
            <string>Nexa Messenger App</string>
            <key>PayloadIdentifier</key>
            <string>com.nexa.messenger.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>e984180d-85fa-4c4c-9f6b-88a4e321526f</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>https://nexa-qydr.onrender.com/</string>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>Nexa Messenger</string>
    <key>PayloadIdentifier</key>
    <string>com.nexa.messenger.profile</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>4f058092-2b62-4217-a044-555e96bf5632</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

  const blob = new Blob([configContent], { type: 'application/x-apple-asymmetric-key-exchange' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'Nexa-Messenger.mobileconfig';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    showToast('📱 Open Settings -> Profile Downloaded -> Tap Install to add Nexa to your Home Screen!');
  }, 2500);
}

// 9. Toast Notification Helper
function showToast(message) {
  let toast = document.getElementById('nexaToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'nexaToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 0.88rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 2000;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      text-align: center;
      max-width: 90%;
    `;
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
  }, 5000);
}
