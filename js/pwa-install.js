(function () {
  'use strict';

  const SW_PATH = './service-worker.js';
  const MANIFEST_PATH = './manifest.webmanifest';
  let deferredPrompt = null;

  function ensureManifest() {
    if (document.querySelector('link[rel="manifest"]')) return;
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = MANIFEST_PATH;
    document.head.appendChild(link);
  }

  function isStandalone() {
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function makeInstallButton() {
    if (document.getElementById('pwaInstallBtn') || isStandalone()) return;
    const btn = document.createElement('button');
    btn.id = 'pwaInstallBtn';
    btn.type = 'button';
    btn.textContent = '📲 App Install करें';
    btn.setAttribute('aria-label', 'Install Class 6 Learning Hub as an app');
    btn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:9999;border:0;border-radius:999px;padding:12px 16px;background:linear-gradient(135deg,#3447d6,#5b4bdc);color:#fff;font:800 13px system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 10px 25px rgba(30,40,100,.25);cursor:pointer;display:none';
    btn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice.catch(() => null);
        deferredPrompt = null;
        btn.style.display = 'none';
        if (choice?.outcome === 'accepted') return;
      }
      alert('Browser में Install option खोलें. Chrome/Edge में address bar के install icon या browser menu से “Install app” चुनें. iPhone/iPad में Share → Add to Home Screen चुनें.');
    });
    document.body.appendChild(btn);
  }

  function refreshInstallButton() {
    const btn = document.getElementById('pwaInstallBtn');
    if (!btn || isStandalone()) {
      if (btn && isStandalone()) btn.remove();
      return;
    }
    btn.style.display = deferredPrompt ? 'block' : 'none';
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(SW_PATH, { scope: './' }).catch(() => {});
    }, { once: true });
  }

  ensureManifest();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', makeInstallButton, { once: true });
  } else {
    makeInstallButton();
  }
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    refreshInstallButton();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    document.getElementById('pwaInstallBtn')?.remove();
  });
  registerServiceWorker();
})();
