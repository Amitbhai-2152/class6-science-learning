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

  window.Class6HomeAccount = Object.freeze({ refresh, avatars: AVATARS.slice() });
  document.addEventListener('DOMContentLoaded', () => refresh(), { once: true });
})();
