(() => {
  'use strict';

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

  window.addEventListener('class6:xp-cloud-synced', render);
  window.addEventListener('xp:earned', render);
  window.addEventListener('storage', render);
  window.addEventListener('pageshow', render);
  document.addEventListener('DOMContentLoaded', render, { once: true });
})();
