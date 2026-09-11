(() => {
  'use strict';

  if (window.__class6XPBadgeFixLoaded) return;
  window.__class6XPBadgeFixLoaded = true;

  const styleId = 'class6-xp-badge-fix-style';

  function badges() {
    const defs = Array.isArray(window.XPSystem?.BADGES) ? window.XPSystem.BADGES : [];
    const snapshot = window.XPSystem?.snapshot?.();
    const total = Number(snapshot?.total ?? window.XPSystem?.read?.()?.total) || 0;
    const unlocked = Array.isArray(snapshot?.badges) ? snapshot.badges : defs.filter(b => total >= Number(b.xp));
    const ids = new Set(unlocked.map(b => b.id));
    return { defs, unlocked, ids, total };
  }

  function ensureStyle() {
    if (document.getElementById(styleId)) return;
    const s = document.createElement('style');
    s.id = styleId;
    s.textContent = '.unified-xp-badges .unified-xp-badge.xp-fix-new{animation:class6BadgePulse .45s ease-out}@keyframes class6BadgePulse{0%{transform:scale(.96);opacity:.7}100%{transform:scale(1);opacity:1}}';
    (document.head || document.documentElement).appendChild(s);
  }

  function render() {
    const data = badges();
    const section = document.getElementById('unifiedXPBadges');
    if (section) {
      const grid = section.querySelector('.unified-xp-badge-grid');
      if (grid) {
        grid.innerHTML = data.defs.map(b => {
          const unlocked = data.ids.has(b.id) || data.total >= Number(b.xp);
          return `<article class="unified-xp-badge ${unlocked ? 'unlocked xp-fix-new' : 'locked'}"><div class="unified-xp-badge-icon">${unlocked ? b.icon : '🔒'}</div><div class="unified-xp-badge-title">${b.title}</div><div class="unified-xp-badge-xp">${Number(b.xp).toLocaleString()} XP</div></article>`;
        }).join('');
        setTimeout(() => grid.querySelectorAll('.xp-fix-new').forEach(el => el.classList.remove('xp-fix-new')), 500);
      }
    }

    const homeBadge = document.getElementById('badgeHome');
    if (homeBadge) homeBadge.textContent = String(data.unlocked.length || data.defs.filter(b => data.total >= Number(b.xp)).length);
  }

  function refresh() {
    ensureStyle();
    if (window.XPSystem) render();
  }

  document.addEventListener('xp:earned', refresh);
  document.addEventListener('class6:xp-cloud-synced', refresh);
  document.addEventListener('class6:badge-cloud-synced', refresh);
  document.addEventListener('DOMContentLoaded', () => setTimeout(refresh, 0), { once: true });
  window.addEventListener('load', () => setTimeout(refresh, 0), { once: true });
  window.addEventListener('hashchange', () => setTimeout(refresh, 0));

  window.Class6XPBadgeFix = Object.freeze({ refresh });
})();
