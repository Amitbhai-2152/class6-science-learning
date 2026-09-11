(() => {
  'use strict';

  let syncPromise = null;
  let retryTimer = null;
  const MAX_ACTIVITY_DAYS = 400;
  const USER_RETRY_DELAYS = [0, 800, 2000, 4000];

  function setPending() {
    if (!window.Class6CloudSync?.configured?.()) return false;
    document.documentElement.dataset.streakCloudPending = '1';
    ['streakMini', 'homeStreak'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = '…';
    });
    return true;
  }

  function clearPending() {
    delete document.documentElement.dataset.streakCloudPending;
  }

  setPending();

  const dayKey = (value) => {
    const d = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  function normalize(input) {
    const x = input && typeof input === 'object' ? input : {};
    const days = Array.isArray(x.activeDays)
      ? [...new Set(x.activeDays.map(dayKey).filter(Boolean))].sort()
      : [];
    return { activeDays: days.slice(-MAX_ACTIVITY_DAYS) };
  }

  function activityFromLocal() {
    try {
      const xp = window.XPSystem?.read?.() || {};
      const days = new Set();
      if (Array.isArray(xp.activeDays)) xp.activeDays.forEach((value) => {
        const d = dayKey(value);
        if (d) days.add(d);
      });
      if (Array.isArray(xp.events)) xp.events.forEach((event) => {
        const d = dayKey(event?.at);
        if (d) days.add(d);
      });
      return normalize({ activeDays: [...days] });
    } catch (_) {
      return { activeDays: [] };
    }
  }

  function activityFromCloud(state) {
    const source = state && typeof state === 'object' ? state : {};
    const streakState = source.streakState && typeof source.streakState === 'object' ? source.streakState : {};
    const days = [
      ...(Array.isArray(source.activeDays) ? source.activeDays : []),
      ...(Array.isArray(streakState.activeDays) ? streakState.activeDays : [])
    ];
    return normalize({ activeDays: days });
  }

  function merge(local, cloud) {
    const a = normalize(local);
    const b = normalize(cloud);
    return {
      activeDays: [...new Set([...(a.activeDays || []), ...(b.activeDays || [])])]
        .sort()
        .slice(-MAX_ACTIVITY_DAYS)
    };
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

  async function getUserWithRetries() {
    for (let index = 0; index < USER_RETRY_DELAYS.length; index += 1) {
      const delay = USER_RETRY_DELAYS[index];
      if (delay) await new Promise((resolve) => window.setTimeout(resolve, delay));
      try {
        const user = await window.Class6CloudSync.getUser();
        if (user) return user;
      } catch (error) {
        if (index === USER_RETRY_DELAYS.length - 1) throw error;
      }
    }
    return null;
  }

  function scheduleRetry(delay = 2000) {
    if (retryTimer) return;
    retryTimer = window.setTimeout(() => {
      retryTimer = null;
      sync();
    }, delay);
  }

  async function sync() {
    if (syncPromise) return syncPromise;
    syncPromise = (async () => {
      try {
        if (!window.Class6CloudSync?.configured?.()) {
          clearPending();
          window.HomeStreak?.refresh?.();
          return { synced: false, reason: 'not_configured' };
        }

        setPending();
        const user = await getUserWithRetries();
        if (!user) {
          clearPending();
          window.HomeStreak?.refresh?.();
          return { synced: false, reason: 'not_signed_in' };
        }

        const scope = window.Class6CloudSync.prepareUser?.(user.id) || { changed: false };
        const local = scope.changed ? { activeDays: [] } : activityFromLocal();
        const row = await window.Class6CloudSync.load();
        const sourceCloud = row?.state && typeof row.state === 'object' ? row.state : {};
        const cloud = activityFromCloud(sourceCloud);
        const mergedDays = merge(local, cloud);
        const derived = calculateStreak(mergedDays.activeDays);
        const merged = {
          activeDays: mergedDays.activeDays,
          streak: derived.streak,
          lastActive: derived.lastActive
        };

        const current = window.XPSystem?.read?.();
        if (current && window.XPSystem?.save) {
          window.XPSystem.save(Object.assign({}, current, {
            activeDays: merged.activeDays,
            streakState: merged
          }));
          const result = await window.Class6CloudSync.save(window.XPSystem.read(), 1);
          window.dispatchEvent(new CustomEvent('class6:streak-cloud-synced', {
            detail: {
              userId: user.id,
              streak: merged.streak,
              lastActive: merged.lastActive,
              activeDays: merged.activeDays,
              synced: result?.synced === true
            }
          }));
        } else {
          await window.Class6CloudSync.save({
            activeDays: merged.activeDays,
            streakState: merged
          }, 1);
        }

        clearPending();
        window.HomeStreak?.refresh?.();
        return { synced: true, streak: merged.streak, activeDays: merged.activeDays };
      } catch (error) {
        console.error('Class 6 streak cloud sync failed:', error);
        setPending();
        scheduleRetry(2000);
        return { synced: false, reason: 'sync_error', error: String(error?.message || error) };
      } finally {
        syncPromise = null;
      }
    })();
    return syncPromise;
  }

  window.Class6StreakCloudSync = Object.freeze({
    sync,
    merge,
    calculateStreak,
    activityFromLocal,
    activityFromCloud
  });

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => sync(), 0);
  }, { once: true });
  window.addEventListener('pageshow', () => sync());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') sync();
  });

  window.Class6CloudSync?.getClient?.().then((client) => {
    client?.auth?.onAuthStateChange?.(() => sync());
  }).catch(() => {});
})();