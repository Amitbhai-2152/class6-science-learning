(() => {
  'use strict';

  let refreshTimer = null;
  let authoritativeTotal = null;
  let observer = null;
  let bodyObserver = null;

  function normalizeTotal(value) {
    const total = Number(value);
    return Number.isFinite(total) && total >= 0 ? Math.round(total) : null;
  }

  function snapshotTotal() {
    try {
      return normalizeTotal(window.XPSystem?.snapshot?.()?.total);
    } catch (_) {
      return null;
    }
  }

  function paintTotal(total) {
    const value = normalizeTotal(total);
    if (value === null) return;

    const snapshot = window.XPSystem?.snapshot?.();
    const level = Math.max(1, Number(snapshot?.level?.level) || 1);
    const desiredChip = `🏅 Lv ${level}<span>${value} XP</span>`;
    const chip = document.getElementById('levelMiniBtn');
    if (chip && chip.innerHTML !== desiredChip) chip.innerHTML = desiredChip;

    const totalText = String(value);
    const totalEl = document.getElementById('homeTotalXP');
    if (totalEl && totalEl.textContent !== totalText) totalEl.textContent = totalText;

    const legacyText = `${value} XP`;
    const legacy = document.getElementById('xpMini');
    if (legacy && legacy.textContent !== legacyText) legacy.textContent = legacyText;

    document.querySelectorAll('.progress-live-level-box b').forEach((el) => {
      const text = String(el.textContent || '').trim();
      const desired = `⚡ ${value} XP`;
      if (/^⚡\s*\d+\s*XP$/.test(text) && text !== desired) el.textContent = desired;
    });
  }

  function render() {
    const value = authoritativeTotal ?? snapshotTotal();
    if (value !== null) paintTotal(value);
  }

  function observeXPDisplays() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(() => {
      if (authoritativeTotal !== null) {
        const chip = document.getElementById('levelMiniBtn');
        const totalEl = document.getElementById('homeTotalXP');
        const legacy = document.getElementById('xpMini');
        const snapshot = window.XPSystem?.snapshot?.();
        const level = Math.max(1, Number(snapshot?.level?.level) || 1);
        const chipExpected = `🏅 Lv ${level}<span>${authoritativeTotal} XP</span>`;
        const totalExpected = String(authoritativeTotal);
        const legacyExpected = `${authoritativeTotal} XP`;
        if ((chip && chip.innerHTML !== chipExpected) ||
            (totalEl && totalEl.textContent !== totalExpected) ||
            (legacy && legacy.textContent !== legacyExpected)) {
          paintTotal(authoritativeTotal);
        }
      }
    });

    const watch = () => {
      ['levelMiniBtn', 'homeTotalXP', 'xpMini'].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.dataset.xpBridgeObserved !== '1') {
          el.dataset.xpBridgeObserved = '1';
          observer.observe(el, { childList: true, characterData: true, subtree: true });
        }
      });
    };

    watch();
    bodyObserver = new MutationObserver(watch);
    if (document.body) bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  function adoptSyncedTotal(event) {
    const eventTotal = normalizeTotal(event?.detail?.total);
    authoritativeTotal = eventTotal ?? snapshotTotal();
    render();
    window.setTimeout(render, 0);
    window.setTimeout(render, 100);
    window.setTimeout(render, 300);
    observeXPDisplays();
  }

  function clearAuthoritativeTotal() {
    authoritativeTotal = null;
    render();
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

  window.addEventListener('class6:xp-cloud-synced', adoptSyncedTotal);
  window.addEventListener('xp:earned', () => {
    clearAuthoritativeTotal();
    requestCloudSync(150);
  });
  window.addEventListener('xp:activity', () => requestCloudSync(150));
  window.addEventListener('storage', (event) => {
    if (!event || event.key === 'class6XPSystemV1') {
      clearAuthoritativeTotal();
      requestCloudSync(250);
    }
  });
  window.addEventListener('pageshow', () => {
    clearAuthoritativeTotal();
    requestCloudSync(0);
  });
  document.addEventListener('DOMContentLoaded', () => {
    render();
    observeXPDisplays();
    requestCloudSync(0);
  }, { once: true });
})();
