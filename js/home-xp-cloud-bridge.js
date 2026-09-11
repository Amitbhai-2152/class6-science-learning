(() => {
  'use strict';

  let refreshTimer = null;
  let syncedTotalOverride = null;
  let overrideTimer = null;

  function normalizeTotal(value) {
    const total = Number(value);
    return Number.isFinite(total) && total >= 0 ? Math.round(total) : null;
  }

  function paintTotal(total) {
    const value = normalizeTotal(total);
    if (value === null) return;
    const snapshot = window.XPSystem?.snapshot?.();
    const level = Math.max(1, Number(snapshot?.level?.level) || 1);
    const chip = document.getElementById('levelMiniBtn');
    if (chip) chip.innerHTML = `🏅 Lv ${level}<span>${value} XP</span>`;
    const totalEl = document.getElementById('homeTotalXP');
    if (totalEl) totalEl.textContent = String(value);
    const legacy = document.getElementById('xpMini');
    if (legacy) legacy.textContent = `${value} XP`;

    document.querySelectorAll('.progress-live-level-box b').forEach((el) => {
      const text = String(el.textContent || '').trim();
      if (/^⚡\s*\d+\s*XP$/.test(text)) el.textContent = `⚡ ${value} XP`;
    });
  }

  function render() {
    try {
      const snapshot = window.XPSystem?.snapshot?.();
      if (!snapshot) return;
      const total = normalizeTotal(syncedTotalOverride ?? snapshot.total);
      if (total === null) return;
      paintTotal(total);
    } catch (_) {}
  }

  function holdSyncedTotal(total) {
    const value = normalizeTotal(total);
    if (value === null) return false;
    syncedTotalOverride = value;
    clearTimeout(overrideTimer);
    const reapply = () => paintTotal(syncedTotalOverride);
    reapply();
    [0, 50, 150, 300, 600, 1000, 1600].forEach((delay) => {
      window.setTimeout(() => {
        if (syncedTotalOverride !== null) reapply();
      }, delay);
    });
    overrideTimer = window.setTimeout(() => {
      syncedTotalOverride = null;
      render();
    }, 2200);
    return true;
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

  window.addEventListener('class6:xp-cloud-synced', (event) => {
    const total = normalizeTotal(event?.detail?.total);
    if (total !== null) holdSyncedTotal(total);
    else render();
  });

  window.addEventListener('xp:earned', () => {
    syncedTotalOverride = null;
    clearTimeout(overrideTimer);
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
    syncedTotalOverride = null;
    clearTimeout(overrideTimer);
    render();
    requestCloudSync(0);
  });

  document.addEventListener('DOMContentLoaded', () => {
    render();
    requestCloudSync(0);
  }, { once: true });
})();
