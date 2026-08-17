const NEXA_LIVE_URL = 'https://nexa-qydr.onrender.com';
const NEXA_APK_URL = 'https://github.com/SFWebSolution/nexa-andriod/releases/download/latest/Nexa-Messenger.apk';

// Pre-warm the live server
prewarmAppServer();

document.addEventListener('DOMContentLoaded', () => {
  initDeviceBadge();
  registerServiceWorker();
  bindUIEvents();
  prewarmAppServer();
});

function prewarmAppServer() {
  try {
    fetch(NEXA_LIVE_URL, { mode: 'no-cors', cache: 'no-cache' }).catch(() => {});
  } catch (e) {}
}

function initDeviceBadge() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const badgeText = document.getElementById('deviceBadgeText');
  const btnText = document.getElementById('primaryInstallText');

  if (/android/i.test(ua)) {
    if (badgeText) badgeText.innerText = 'Android Phone 🤖';
    if (btnText) btnText.innerText = '⚡ Download Nexa App (Android)';
  } else if (/iPad|iPhone|iPod/.test(ua)) {
    if (badgeText) badgeText.innerText = 'Apple Device 🍎';
    if (btnText) btnText.innerText = '⚡ Download Nexa App';
  } else {
    if (badgeText) badgeText.innerText = 'Desktop / PC 💻';
    if (btnText) btnText.innerText = '⚡ Download Nexa App';
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Nexa Installer ServiceWorker registered:', reg.scope))
      .catch(err => console.warn('ServiceWorker registration failed:', err));
  }
}

function bindUIEvents() {
  const primaryBtn = document.getElementById('primaryInstallBtn');

  if (primaryBtn) {
    primaryBtn.addEventListener('click', () => {
      showToast('📥 Starting automatic app download...');
      const btnText = document.getElementById('primaryInstallText');
      if (btnText) {
        btnText.innerText = '✅ Downloading App... Tap to Install';
      }
    });
  }
}

// Toast notification
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
