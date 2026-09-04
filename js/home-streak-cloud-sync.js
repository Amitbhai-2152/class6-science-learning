(() => {
  'use strict';

  const SCIENCE_KEY = 'class6ScienceProgressV9';
  let started = false;

  const dayKey = (value) => {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  function readScience() {
    try {
      const raw = localStorage.getItem(SCIENCE_KEY);
      const value = raw ? JSON.parse(raw) : null;
      return value && typeof value === 'object' ? value : {};
    } catch (_) {
      return {};
    }
  }

  function localSnapshot() {
    const science = readScience();
    const today = dayKey(new Date());
    const scienceActive = science.lastActive && dayKey(science.lastActive) === today;
    const xpState = window.XPSystem?.read?.() || {};
    const events = Array.isArray(xpState.events) ? xpState.events : [];
    const days = [...new Set(events.map((event) => dayKey(event?.at)).filter(Boolean))].sort();
    const persisted = xpState.streakState || {};
    return {
      streak: Math.max(
        scienceActive ? Number(science.streak) || 0 : 0,
        Number(persisted.streak) || 0,
        Number(window.HomeStreak?.getStreak?.() || 0)
      ),
      lastActive: persisted.lastActive || (scienceActive ? dayKey(science.lastActive) : (days.at(-1) || null)),
      activeDays: [...new Set([...(Array.isArray(persisted.activeDays) ? persisted.activeDays : []), ...days])].sort()
    };
  }

  function normalize(input) {
    const x = input && typeof input === 'object' ? input : {};
    const days = Array.isArray(x.activeDays) ? [...new Set(x.activeDays.map(dayKey).filter(Boolean))].sort() : [];
    return {
      streak: Math.max(0, Number(x.streak) || 0),
      lastActive: dayKey(x.lastActive) || null,
      activeDays: days.slice(-400)
    };
  }

  function merge(local, cloud) {
    const a = normalize(local);
    const b = normalize(cloud);
    const activeDays = [...new Set([...(a.activeDays || []), ...(b.activeDays || [])])].sort().slice(-400);
    return {
      streak: Math.max(a.streak, b.streak),
      lastActive: [a.lastActive, b.lastActive].filter(Boolean).sort().at(-1) || null,
      activeDays
    };
  }

  async function sync() {
    if (started) return { synced: false, reason: 'already_started' };
    started = true;
    try {
      if (!window.Class6CloudSync?.configured?.()) return { synced: false, reason: 'not_configured' };
      const user = await window.Class6CloudSync.getUser();
      if (!user) return { synced: false, reason: 'not_signed_in' };

      const localState = localSnapshot();
      const row = await window.Class6CloudSync.load();
      const cloud = row?.state?.streakState || {};
      const merged = merge(localState, cloud);

      const current = window.XPSystem?.read?.();
      if (current && window.XPSystem?.save) {
        window.XPSystem.save(Object.assign({}, current, { streakState: merged }));
        const result = await window.Class6CloudSync.save(window.XPSystem.read(), 1);
        window.dispatchEvent(new CustomEvent('class6:streak-cloud-synced', {
          detail: { userId: user.id, streak: merged.streak, lastActive: merged.lastActive, synced: result?.synced === true }
        }));
      } else {
        await window.Class6CloudSync.save({ streakState: merged }, 1);
      }

      window.HomeStreak?.refresh?.();
      return { synced: true, streak: merged.streak };
    } catch (error) {
      console.error('Class 6 streak cloud sync failed:', error);
      return { synced: false, reason: 'sync_error', error: String(error?.message || error) };
    }
  }

  window.Class6StreakCloudSync = Object.freeze({ sync, merge, localSnapshot });

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => sync(), 0);
  }, { once: true });
})();
