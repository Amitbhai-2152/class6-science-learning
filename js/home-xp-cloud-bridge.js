(() => {
  'use strict';

  let refreshTimer = null;

  function render() {
    try {
      const snapshot = window.XPSystem?.snapshot?.();
      if (!snapshot) return;
      const total = Math.max(0, Number(snapshot.total) || 0);
      const level = Math.max(1, Number(snapshot.level?.level) || 1);
      const chip = document.getElementById('levelMiniBtn');
      if (chip) chip.innerHTML = `🏅 Lv ${level}<span>${total} XP</span>`;
      const totalEl = document.getElementById('homeTotalXP');
      if (totalEl) totalEl.textContent = String(total);
      const legacy = document.getElementById('xpMini');
      if (legacy) legacy.textContent = `${total} XP`;
    } catch (_) {}
  }

  function requestCloudSync(delay = 150) {
    if (refreshTimer) window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshTimer = null;
      try {
        const sync = window.Class6XPCloudSync?.requestSync || window.Class6XPCloudSync?.sync;
        if (typeof sync === 'function') sync(delay);
      } catch (_) {}
    }, Math.max(0, Number(delay) || 0));
  }

  window.addEventListener('class6:xp-cloud-synced', render);
  window.addEventListener('xp:earned', () => {
    render();
    requestCloudSync(150);
  });
  window.addEventListener('xp:activity', () => requestCloudSync(150));
  window.addEventListener('storage', (event) => {
    if (!event || event.key === 'class6XPSystemV1') {
      render();
      requestCloudSync(250);
    }
  });
  window.addEventListener('pageshow', () => {
    render();
    requestCloudSync(0);
  });
  document.addEventListener('DOMContentLoaded', () => {
    render();
    requestCloudSync(0);
  }, { once: true });
})();
