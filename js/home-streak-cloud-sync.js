(() => {
  'use strict';

  let started = false;

  const dayKey = (value) => {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  function normalize(input) {
    const x = input && typeof input === 'object' ? input : {};
    const days = Array.isArray(x.activeDays) ? [...new Set(x.activeDays.map(dayKey).filter(Boolean))].sort() : [];
    return { activeDays: days.slice(-400) };
  }

  function activityFromLocal() {
    try {
      const xp = window.XPSystem?.read?.() || {};
      const days = new Set(Array.isArray(xp.activeDays) ? xp.activeDays.map(dayKey).filter(Boolean) : []);
      if (Array.isArray(xp.events)) xp.events.forEach(event => { const d = dayKey(event?.at); if (d) days.add(d); });
      return { activeDays: [...days].sort().slice(-400) };
    } catch (_) {
      return { activeDays: [] };
    }
  }

  function merge(local, cloud) {
    const a = normalize(local);
    const b = normalize(cloud);
    return { activeDays: [...new Set([...(a.activeDays || []), ...(b.activeDays || [])])].sort().slice(-400) };
  }

  function calculateStreak(activeDays) {
    const days = new Set(normalize({ activeDays }).activeDays);
    let cursor = new Date();
    let streak = 0;
    while (days.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    const lastActive = [...days].at(-1) || null;
    return { streak, lastActive };
  }

  async function sync() {
    if (started) return { synced: false, reason: 'already_started' };
    started = true;
    try {
      if (!window.Class6CloudSync?.configured?.()) return { synced: false, reason: 'not_configured' };
      const user = await window.Class6CloudSync.getUser();
      if (!user) return { synced: false, reason: 'not_signed_in' };

      const scope = window.Class6CloudSync.prepareUser?.(user.id) || { changed: false };
      const local = scope.changed ? { activeDays: [] } : activityFromLocal();
      const row = await window.Class6CloudSync.load();
      const cloud = row?.state?.streakState || {};
      const mergedDays = merge(local, cloud);
      const derived = calculateStreak(mergedDays.activeDays);
      const merged = { activeDays: mergedDays.activeDays, streak: derived.streak, lastActive: derived.lastActive };

      const current = window.XPSystem?.read?.();
      if (current && window.XPSystem?.save) {
        window.XPSystem.save(Object.assign({}, current, { activeDays: merged.activeDays, streakState: merged }));
        const result = await window.Class6CloudSync.save(window.XPSystem.read(), 1);
        window.dispatchEvent(new CustomEvent('class6:streak-cloud-synced', {
          detail: { userId: user.id, streak: merged.streak, lastActive: merged.lastActive, activeDays: merged.activeDays, synced: result?.synced === true }
        }));
      } else {
        await window.Class6CloudSync.save({ streakState: merged }, 1);
      }

      window.HomeStreak?.refresh?.();
      return { synced: true, streak: merged.streak, activeDays: merged.activeDays };
    } catch (error) {
      console.error('Class 6 streak cloud sync failed:', error);
      return { synced: false, reason: 'sync_error', error: String(error?.message || error) };
    }
  }

  window.Class6StreakCloudSync = Object.freeze({ sync, merge, calculateStreak, activityFromLocal });

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => sync(), 0);
  }, { once: true });
})();