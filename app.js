const NEXA_LIVE_URL = 'https://nexa-qydr.onrender.com';

let deferredPrompt = null;
let userDevice = {
  isAndroid: false,
  isIOS: false,
  isDesktop: false,
  isStandalone: false,
  browserName: 'Unknown'
};

// Immediate pre-warm on execution
prewarmAppServer();

document.addEventListener('DOMContentLoaded', () => {
  initDeviceDetection();
  initPWAInstallPrompt();
  registerServiceWorker();
  bindUIEvents();
  prewarmAppServer();
  setInterval(prewarmAppServer, 45000);
});

// Pre-warm the live server so cold starts are eliminated
function prewarmAppServer() {
  try {
    fetch(NEXA_LIVE_URL, { mode: 'no-cors', cache: 'no-cache' }).catch(() => {});
  } catch (e) {}
}

// 1. Device & OS Auto-Detection
function initDeviceDetection() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  
  userDevice.isAndroid = /android/i.test(ua);
  userDevice.isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  userDevice.isDesktop = !userDevice.isAndroid && !userDevice.isIOS;
  userDevice.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                            window.matchMedia('(display-mode: fullscreen)').matches ||
                            window.matchMedia('(display-mode: minimal-ui)').matches ||
                            window.navigator.standalone === true || 
                            window.location.search.includes('mode=standalone') ||
                            window.location.search.includes('source=pwa');

  // If launched in standalone / installed app mode, launch native fullscreen frame immediately
  if (userDevice.isStandalone) {
    launchStandaloneApp();
    return;
  }

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

// 2. Launch Standalone Native Fullscreen App (Zero Browser Bar)
function launchStandaloneApp() {
  document.documentElement.classList.add('is-standalone-app');
  const frameContainer = document.getElementById('appFrameContainer');
  const iframe = document.getElementById('nexaAppFrame');
  const splash = document.getElementById('standaloneSplash');
  const mainLanding = document.getElementById('mainLandingContainer');

  if (mainLanding) mainLanding.style.display = 'none';
  if (frameContainer) frameContainer.style.display = 'block';
  
  if (iframe) {
    if (!iframe.src || iframe.src === 'about:blank' || iframe.src.indexOf('onrender.com') === -1) {
      iframe.src = NEXA_LIVE_URL;
    }

    let splashHidden = false;
    const hideSplash = () => {
      if (splashHidden) return;
      splashHidden = true;
      if (splash) {
        splash.classList.add('fade-out');
        setTimeout(() => {
          splash.style.display = 'none';
        }, 450);
      }
    };

    iframe.onload = () => {
      setTimeout(hideSplash, 200);
    };

    // Fast fallback: fade out splash after 1.5 seconds max
    setTimeout(hideSplash, 1500);
  }
}

// 3. Update UI based on Detected Phone/Device
function updateUIForDetectedDevice() {
  const badgeText = document.getElementById('deviceBadgeText');
  const primaryBtnText = document.getElementById('primaryInstallText');
  const statusHeading = document.getElementById('statusHeading');
  const statusSubtext = document.getElementById('statusSubtext');
  const downloadApkBtn = document.getElementById('downloadApkBtn');

  if (userDevice.isStandalone) {
    launchStandaloneApp();
    return;
  }

  if (userDevice.isAndroid) {
    if (badgeText) badgeText.innerText = 'Android Phone 🤖';
    if (statusHeading) statusHeading.innerText = 'Install on Android';
    if (statusSubtext) statusSubtext.innerText = '1-Tap install to Home Screen or download native APK.';
    if (primaryBtnText) primaryBtnText.innerText = '⚡ Add to Home Screen (Web App)';
    if (downloadApkBtn) downloadApkBtn.style.display = 'inline-flex';
  } else if (userDevice.isIOS) {
    if (badgeText) badgeText.innerText = 'iPhone / iPad 🍎';
    if (statusHeading) statusHeading.innerText = 'Install on iPhone / iPad';
    if (statusSubtext) statusSubtext.innerText = 'Add Nexa directly to your Home Screen for instant launch.';
    if (primaryBtnText) primaryBtnText.innerText = '⚡ Install on iPhone';
    if (downloadApkBtn) downloadApkBtn.style.display = 'none';
  } else {
    if (badgeText) badgeText.innerText = 'Desktop / PC 💻';
    if (statusHeading) statusHeading.innerText = 'Install on Computer';
    if (statusSubtext) statusSubtext.innerText = 'Install Nexa as a standalone desktop application.';
    if (primaryBtnText) primaryBtnText.innerText = '⚡ Install Desktop App';
  }
}

// 4. Register PWA Service Worker for Offline Speed and Caching
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Nexa Installer ServiceWorker registered:', reg.scope))
      .catch(err => console.warn('ServiceWorker registration failed:', err));
  }
}

// 5. Capture native beforeinstallprompt (Android & Desktop)
function initPWAInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('Native install prompt ready!');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    showToast('🎉 Nexa Messenger installed successfully!');
    setTimeout(() => {
      launchStandaloneApp();
    }, 800);
  });
}

// 6. Bind UI Events
function bindUIEvents() {
  const primaryBtn = document.getElementById('primaryInstallBtn');
  const directLaunchBtn = document.getElementById('directLaunchBtn');
  const closeGuideBtn = document.getElementById('closeGuideBtn');
  const guideActionBtn = document.getElementById('guideActionBtn');

  if (primaryBtn) {
    primaryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handlePrimaryInstallClick();
    });
  }

  if (directLaunchBtn) {
    directLaunchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      launchStandaloneApp();
    });
  }

  if (closeGuideBtn) {
    closeGuideBtn.addEventListener('click', () => {
      const modal = document.getElementById('installGuideModal');
      if (modal) modal.classList.remove('active');
    });
  }

  if (guideActionBtn) {
    guideActionBtn.addEventListener('click', () => {
      launchStandaloneApp();
    });
  }
}

// 7. Master 1-Tap Automatic Installation Engine
function handlePrimaryInstallClick() {
  if (userDevice.isStandalone) {
    launchStandaloneApp();
    return;
  }

  // If native automatic installer is available (Android Chrome, Edge, Samsung Internet, Desktop Chrome)
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('🚀 Installing Nexa to your Home Screen...');
      }
      deferredPrompt = null;
    });
    return;
  }

  // If on iOS (iPhone / iPad)
  if (userDevice.isIOS) {
    showIOSInstallGuide();
    return;
  }

  // If on Android: Automatically download and trigger APK installation directly!
  if (userDevice.isAndroid) {
    triggerDirectApkDownload();
    return;
  }

  // Fallback for desktop / standard browsers
  showGeneralInstallGuide();
}

// Automatic Direct APK Download for Android Devices
function triggerDirectApkDownload() {
  const apkUrl = 'https://github.com/SFWebSolution/nexa-andriod/releases/download/latest/Nexa-Messenger.apk';
  showToast('📥 Starting automatic app download...');
  
  const link = document.createElement('a');
  link.href = apkUrl;
  link.setAttribute('download', 'Nexa-Messenger.apk');
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  const primaryBtnText = document.getElementById('primaryInstallText');
  if (primaryBtnText) {
    primaryBtnText.innerText = '✅ Downloading App... Tap to Install';
  }
}

// iOS Guide Modal
function showIOSInstallGuide() {
  const modal = document.getElementById('installGuideModal');
  const title = document.getElementById('guideModalTitle');
  const content = document.getElementById('guideModalContent');

  if (title) title.innerText = '📱 Install on iPhone / iPad';
  if (content) {
    content.innerHTML = `
      <p style="margin-bottom: 12px;">Add Nexa directly to your Home Screen in 2 quick steps:</p>
      <ol style="margin-left: 20px; line-height: 2;">
        <li>Tap the <strong>Share button</strong> ( <span style="font-size: 1.2rem;">⎋</span> or box with arrow ) at the bottom of Safari.</li>
        <li>Scroll down and tap <strong>"Add to Home Screen"</strong> ( <strong>⊕</strong> ).</li>
        <li>Tap <strong>"Add"</strong> at the top right.</li>
      </ol>
      <p style="margin-top: 14px; color: #a5b4fc; font-size: 0.85rem;">
        ✨ Nexa will appear instantly on your iPhone Home Screen with zero browser controls!
      </p>
    `;
  }

  if (modal) modal.classList.add('active');
}

// General Desktop Guide Modal
function showGeneralInstallGuide() {
  const modal = document.getElementById('installGuideModal');
  const title = document.getElementById('guideModalTitle');
  const content = document.getElementById('guideModalContent');

  if (title) title.innerText = '💻 Install Nexa Desktop App';
  if (content) {
    content.innerHTML = `
      <p style="margin-bottom: 12px;">To install on your computer:</p>
      <ol style="margin-left: 20px; line-height: 2;">
        <li>Look for the <strong>Install icon ( ⊕ or 💻 )</strong> on the right side of your browser address bar.</li>
        <li>Click <strong>Install</strong> to add Nexa to your Applications / Desktop.</li>
      </ol>
      <p style="margin-top: 14px; color: #a5b4fc; font-size: 0.85rem;">
        🚀 Launches directly from your taskbar/dock as a standalone window!
      </p>
    `;
  }

  if (modal) modal.classList.add('active');
}

// Custom Toast notification
function showToast(message) {
  let toast = document.getElementById('nexaToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'nexaToast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1e1b4b;color:#fff;padding:12px 24px;border-radius:9999px;font-size:0.9rem;font-weight:600;box-shadow:0 10px 25px rgba(0,0,0,0.5);border:1px solid #6366f1;z-index:99999;transition:opacity 0.3s ease;opacity:0;pointer-events:none;';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 3500);
}
