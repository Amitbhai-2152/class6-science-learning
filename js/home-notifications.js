(() => {
  'use strict';

  const READ_KEY = 'class6HomeNotificationsReadV1';

  // REGULAR UPDATES: add newest items at the top of this array.
  // Each update needs a unique id, date, title and message.
  const UPDATES = [
    {
      id: '2026-09-11-progress',
      date: '11 Sep 2026',
      title: '📊 Progress System Improved',
      message: 'Overall Progress अब सभी 6 subjects के chapter completion के आधार पर calculate होता है।'
    },
    {
      id: '2026-09-11-badges',
      date: '11 Sep 2026',
      title: '🏆 XP Badges Fixed',
      message: 'XP milestones पर badges और उनका unlock animation अब reliably refresh होंगे।'
    }
  ];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (m) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' })[m]);

  function readIds() {
    try {
      const raw = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
      return new Set(Array.isArray(raw) ? raw.map(String) : []);
    } catch (_) { return new Set(); }
  }

  function saveIds(ids) {
    try { localStorage.setItem(READ_KEY, JSON.stringify([...ids])); } catch (_) {}
  }

  function unreadCount() {
    const read = readIds();
    return UPDATES.filter((item) => !read.has(String(item.id))).length;
  }

  function ensureStyle() {
    if (document.getElementById('homeNotificationsStyle')) return;
    const style = document.createElement('style');
    style.id = 'homeNotificationsStyle';
    style.textContent = `
      #homeNotificationBtn{position:relative}
      #homeNotificationBtn .home-notification-count{position:absolute;right:2px;top:2px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#e5484d;color:#fff;font:900 10px/17px system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center;box-shadow:0 0 0 2px #fff}
      #homeNotificationBtn.has-unread{animation:homeNotificationPulse 1.8s ease-in-out infinite}
      @keyframes homeNotificationPulse{0%,100%{transform:translateY(0)}50%{transform:translateY(-1px) scale(1.03)}}
      .home-notification-modal{position:fixed;inset:0;z-index:220;display:grid;place-items:center;padding:16px;background:rgba(15,23,42,.42);backdrop-filter:blur(7px);opacity:0;visibility:hidden;transition:opacity .2s ease,visibility .2s ease}
      .home-notification-modal.show{opacity:1;visibility:visible}
      .home-notification-card{width:min(620px,100%);max-height:min(720px,calc(100vh - 32px));overflow:auto;background:#fff;color:#18202a;border:1px solid #e5e8ed;border-radius:22px;box-shadow:0 24px 70px rgba(15,23,42,.22);padding:20px}
      .home-notification-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:15px}
      .home-notification-head h2{margin:0;font-size:22px}
      .home-notification-head p{margin:4px 0 0;color:#667085;font-size:12px}
      .home-notification-close{width:38px;height:38px;border:1px solid #e5e8ed;border-radius:12px;background:#f8f9fb;font-size:22px;cursor:pointer}
      .home-notification-actions{display:flex;justify-content:flex-end;margin-bottom:12px}
      .home-notification-readall{border:0;border-radius:10px;padding:9px 12px;background:#eef0ff;color:#3f4bd0;font-weight:900;cursor:pointer}
      .home-notification-list{display:grid;gap:10px}
      .home-notification-item{border:1px solid #e5e8ed;border-radius:16px;padding:14px;background:#fff}
      .home-notification-item.unread{border-color:#cfd5ff;background:#f8f9ff;box-shadow:0 7px 18px rgba(91,100,232,.07)}
      .home-notification-meta{display:flex;justify-content:space-between;gap:10px;align-items:center}
      .home-notification-meta time{font-size:10px;color:#667085;font-weight:800}
      .home-notification-new{font-size:9px;font-weight:950;color:#fff;background:#5b64e8;border-radius:999px;padding:4px 7px}
      .home-notification-item h3{margin:8px 0 5px;font-size:16px}
      .home-notification-item p{margin:0;color:#667085;font-size:13px;line-height:1.6}
      .home-notification-empty{padding:30px;text-align:center;color:#667085;background:#f8f9fb;border-radius:16px}
      @media(max-width:600px){#homeNotificationBtn{order:5;width:42px;height:42px;padding:0}.home-notification-card{padding:15px;border-radius:18px}.home-notification-head h2{font-size:20px}}
      @media(prefers-reduced-motion:reduce){#homeNotificationBtn.has-unread,.home-notification-modal{animation:none!important;transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureButton() {
    const actions = document.querySelector('.home-actions');
    if (!actions || document.getElementById('homeNotificationBtn')) return;
    const button = document.createElement('button');
    button.id = 'homeNotificationBtn';
    button.type = 'button';
    button.className = 'home-progress-btn';
    button.setAttribute('aria-label', 'Updates और notifications देखें');
    button.setAttribute('title', 'Updates');
    button.innerHTML = '🔔<span class="home-notification-count" aria-hidden="true"></span>';
    const progress = document.getElementById('levelMiniBtn') || document.getElementById('homeAvatar');
    actions.insertBefore(button, progress || null);
    button.addEventListener('click', open);
  }

  function refreshBadge() {
    const button = document.getElementById('homeNotificationBtn');
    if (!button) return;
    const count = unreadCount();
    const pill = button.querySelector('.home-notification-count');
    button.classList.toggle('has-unread', count > 0);
    button.setAttribute('aria-label', count ? `Updates देखें • ${count} unread` : 'Updates देखें');
    if (pill) {
      pill.textContent = count ? String(Math.min(count, 99)) : '';
      pill.hidden = count === 0;
    }
  }

  function renderModal() {
    const existing = document.getElementById('homeNotificationModal');
    if (existing) existing.remove();
    const read = readIds();
    const modal = document.createElement('div');
    modal.id = 'homeNotificationModal';
    modal.className = 'home-notification-modal';
    modal.innerHTML = `
      <section class="home-notification-card" role="dialog" aria-modal="true" aria-labelledby="homeNotificationTitle">
        <div class="home-notification-head">
          <div><h2 id="homeNotificationTitle">🔔 Updates & Notifications</h2><p>Learning Hub के latest updates यहाँ मिलेंगे।</p></div>
          <button type="button" class="home-notification-close" aria-label="Close">×</button>
        </div>
        <div class="home-notification-actions"><button type="button" class="home-notification-readall">सबको पढ़ा हुआ करें</button></div>
        <div class="home-notification-list">
          ${UPDATES.length ? UPDATES.map((item) => `
            <article class="home-notification-item ${read.has(String(item.id)) ? '' : 'unread'}">
              <div class="home-notification-meta"><time>${esc(item.date)}</time>${read.has(String(item.id)) ? '' : '<span class="home-notification-new">NEW</span>'}</div>
              <h3>${esc(item.title)}</h3>
              <p>${esc(item.message)}</p>
            </article>`).join('') : '<div class="home-notification-empty">अभी कोई नया update नहीं है।</div>'}
        </div>
      </section>`;
    document.body.appendChild(modal);
    const close = () => { modal.classList.remove('show'); setTimeout(() => modal.remove(), 180); };
    modal.querySelector('.home-notification-close')?.addEventListener('click', close);
    modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
    modal.querySelector('.home-notification-readall')?.addEventListener('click', () => { saveIds(new Set(UPDATES.map((x) => String(x.id)))); renderModal(); refreshBadge(); });
    requestAnimationFrame(() => modal.classList.add('show'));
  }

  function open() {
    const read = readIds();
    UPDATES.forEach((item) => read.add(String(item.id)));
    saveIds(read);
    refreshBadge();
    renderModal();
  }

  function boot() {
    if (!document.getElementById('homeView')) return;
    ensureStyle();
    ensureButton();
    refreshBadge();
  }

  window.HomeNotifications = Object.freeze({ open, refresh: refreshBadge, updates: UPDATES.map((x) => Object.assign({}, x)) });
  document.addEventListener('DOMContentLoaded', boot, { once: true });
  window.addEventListener('load', boot, { once: true });
})();
