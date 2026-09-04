(() => {
  'use strict';

  const AVATARS = ['🧑‍🎓', '🦊', '🐼', '🐯', '🐸', '🦁', '🚀', '⭐'];

  function localAvatar() {
    try {
      const value = String(localStorage.getItem('class6Avatar') || '').trim();
      return AVATARS.includes(value) ? value : '🧑‍🎓';
    } catch (_) {
      return '🧑‍🎓';
    }
  }

  function apply(avatar, email) {
    const el = document.getElementById('homeAvatar');
    if (!el) return;
    el.textContent = avatar || localAvatar();
    el.title = email ? `Signed in as ${email}` : 'Student account';
    el.setAttribute('aria-label', el.title);
  }

  async function refresh() {
    apply(localAvatar(), '');
    try {
      const user = await window.Class6CloudSync?.getUser?.();
      if (!user) return;
      const metadata = user.user_metadata || {};
      const avatar = AVATARS.includes(metadata.avatar) ? metadata.avatar : localAvatar();
      try { localStorage.setItem('class6Avatar', avatar); } catch (_) {}
      apply(avatar, user.email || '');
    } catch (_) {
      // Guest/offline mode keeps the local avatar.
    }
  }

  function setupMobileNav() {
    const nav = document.querySelector('.home-nav');
    const actions = document.querySelector('.home-actions');
    if (!nav || !actions || document.getElementById('homeMenuBtn')) return;

    const button = document.createElement('button');
    button.id = 'homeMenuBtn';
    button.className = 'home-menu-btn';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open navigation menu');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span></span><span></span><span></span>';

    const close = () => {
      nav.classList.remove('home-menu-open');
      button.setAttribute('aria-expanded', 'false');
    };

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = nav.classList.toggle('home-menu-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    actions.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) close();
    });

    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target)) close();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 600) close();
    });

    nav.insertBefore(button, actions);
  }

  window.Class6HomeAccount = Object.freeze({ refresh, avatars: AVATARS.slice() });
  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    setupMobileNav();
  }, { once: true });
})();
