(() => {
  'use strict';

  let started = false;

  function snapshot() {
    const xp = window.XPSystem?.snapshot?.();
    const badges = Array.isArray(xp?.badges) ? xp.badges.map((badge) => badge.id) : [];
    return { ids: badges, total: Number(xp?.total) || 0 };
  }

  function merge(local, cloud) {
    const localIds = Array.isArray(local?.ids) ? local.ids : [];
    const cloudIds = Array.isArray(cloud?.ids) ? cloud.ids : [];
    const ids = [...new Set([...localIds, ...cloudIds])];
    const byId = new Map((window.XPSystem?.BADGES || []).map((badge) => [badge.id, badge]));
    ids.sort((a, b) => (Number(byId.get(a)?.xp) || 0) - (Number(byId.get(b)?.xp) || 0));
    return { ids, total: Math.max(Number(local?.total) || 0, Number(cloud?.total) || 0) };
  }

  async function sync() {
    if (started) return { synced: false, reason: 'already_started' };
    started = true;
    try {
      if (!window.Class6CloudSync?.configured?.()) return { synced: false, reason: 'not_configured' };
      const user = await window.Class6CloudSync.getUser();
      if (!user) return { synced: false, reason: 'not_signed_in' };

      const local = snapshot();
      const row = await window.Class6CloudSync.load();
      const cloud = row?.state?.badgeState || {};
      const merged = merge(local, cloud);
      const current = window.XPSystem?.read?.();
      if (!current || !window.XPSystem?.save) return { synced: false, reason: 'xp_system_unavailable' };

      const nextState = Object.assign({}, current, { badgeState: merged });
      window.XPSystem.save(nextState);
      const result = await window.Class6CloudSync.save(nextState, 1);
      window.dispatchEvent(new CustomEvent('class6:badge-cloud-synced', {
        detail: { userId: user.id, badgeIds: merged.ids.slice(), total: merged.total, synced: result?.synced === true }
      }));
      return { synced: result?.synced === true, badgeIds: merged.ids };
    } catch (error) {
      console.error('Class 6 badge cloud sync failed:', error);
      return { synced: false, reason: 'sync_error', error: String(error?.message || error) };
    }
  }

  window.Class6BadgeCloudSync = Object.freeze({ sync, snapshot, merge });

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => sync(), 20);
  }, { once: true });
})();
