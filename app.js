/* ==========================================================================
   Nexa Messenger - Universal 1-Tap Automatic Mobile Installer Engine
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
  const primaryBtnText = document.getElementById('primaryInstallText');
  const statusHeading = document.getElementById('statusHeading');
  const statusSubtext = document.getElementById('statusSubtext');

  if (userDevice.isStandalone) {
    if (badgeText) badgeText.innerText = 'App Ready 🎉';
    if (statusHeading) statusHeading.innerText = 'Nexa App Installed! 🎉';
    if (statusSubtext) statusSubtext.innerText = 'Nexa is installed and running at full speed.';
    if (primaryBtnText) primaryBtnText.innerText = '🚀 Launch Nexa Messenger';
    return;
  }

  if (userDevice.isAndroid) {
    if (badgeText) badgeText.innerText = 'Android Phone 🤖';
    if (statusHeading) statusHeading.innerText = 'Install on Android Phone';
    if (statusSubtext) statusSubtext.innerText = '1-Tap automatic installation directly to your Home Screen.';
    if (primaryBtnText) primaryBtnText.innerText = '⚡ Install Nexa App (Android)';
  } else if (userDevice.isIOS) {
    if (badgeText) badgeText.innerText = 'iPhone / iPad 🍎';
    if (statusHeading) statusHeading.innerText = 'Install on iPhone / iPad';
    if (statusSubtext) statusSubtext.innerText = 'Add Nexa directly to your Home Screen for instant native launch.';
    if (primaryBtnText) primaryBtnText.innerText = '⚡ Install Nexa App (iPhone)';
  } else {
    if (badgeText) badgeText.innerText = 'Desktop / PC 💻';
    if (statusHeading) statusHeading.innerText = 'Install on Computer';
    if (statusSubtext) statusSubtext.innerText = 'Install Nexa as a standalone desktop app.';
    if (primaryBtnText) primaryBtnText.innerText = '⚡ Install Nexa Desktop App';
  }
}

// 3. Register PWA Service Worker for Offline Speed and Caching
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Nexa Installer ServiceWorker registered:', reg.scope))
      .catch(err => console.warn('ServiceWorker registration failed:', err));
  }
}

// 4. Capture native beforeinstallprompt (Android & Desktop)
function initPWAInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('Native install prompt ready!');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    updateUIForDetectedDevice();
    showToast('🎉 Nexa Messenger installed successfully!');
  });
}

// 5. Bind UI Events
function bindUIEvents() {
  const primaryBtn = document.getElementById('primaryInstallBtn');
  const closeGuideBtn = document.getElementById('closeGuideBtn');
  const guideActionBtn = document.getElementById('guideActionBtn');

  if (primaryBtn) {
    primaryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handlePrimaryInstallClick();
    });
  }

  if (closeGuideBtn) {
    closeGuideBtn.addEventListener('click', () => {
      document.getElementById('installGuideModal').classList.remove('active');
    });
  }

  if (guideActionBtn) {
    guideActionBtn.addEventListener('click', () => {
      window.location.href = 'https://nexa-qydr.onrender.com';
    });
  }
}

// 6. Master 1-Tap Automatic Installation Engine
function handlePrimaryInstallClick() {
  if (userDevice.isStandalone) {
    window.location.href = 'https://nexa-qydr.onrender.com';
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

  // If on Android without deferredPrompt yet (e.g. in-app browser or waiting for prompt)
  if (userDevice.isAndroid) {
    showAndroidInstallGuide();
    return;
  }

  // Fallback for desktop / standard browsers
  showGeneralInstallGuide();
}

// 7. iOS Guide Modal
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
        ✨ Nexa will appear instantly on your iPhone Home Screen with native app speed!
      </p>
    `;
  }

  if (modal) modal.classList.add('active');
}

// 8. Android Guide Modal (if native prompt is bypassed)
function showAndroidInstallGuide() {
  const modal = document.getElementById('installGuideModal');
  const title = document.getElementById('guideModalTitle');
  const content = document.getElementById('guideModalContent');

  if (title) title.innerText = '🤖 Install on Android';
  if (content) {
    content.innerHTML = `
      <p style="margin-bottom: 12px;">Complete 1-Tap installation on your phone:</p>
      <ol style="margin-left: 20px; line-height: 2;">
        <li>Tap your browser's menu (<strong>⋮</strong> three dots at the top right).</li>
        <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
        <li>Tap <strong>"Install"</strong>.</li>
      </ol>
      <p style="margin-top: 14px; color: #a5b4fc; font-size: 0.85rem;">
        ⚡ Android will automatically install Nexa into your Home Screen and App Drawer with zero parse errors!
      </p>
    `;
  }

  if (modal) modal.classList.add('active');
}

// 9. General Guide Modal
function showGeneralInstallGuide() {
  const modal = document.getElementById('installGuideModal');
  const title = document.getElementById('guideModalTitle');
  const content = document.getElementById('guideModalContent');

  if (title) title.innerText = '💻 Install Nexa Messenger';
  if (content) {
    content.innerHTML = `
      <p style="margin-bottom: 12px;">Install Nexa as a standalone desktop app:</p>
      <ol style="margin-left: 20px; line-height: 2;">
        <li>Look at your browser's address bar at the top right.</li>
        <li>Click the <strong>Install Icon (⊕ or 💻)</strong> in the URL bar.</li>
        <li>Click <strong>"Install"</strong> to launch Nexa in full-speed standalone mode.</li>
      </ol>
    `;
  }

  if (modal) modal.classList.add('active');
}

// 10. Toast Notification Helper
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

