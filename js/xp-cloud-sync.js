(() => {
  'use strict';

  const XP_KEY = 'class6XPSystemV1';
  let started = false;

  function clone(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return value; }
  }

  function normalizeState(input) {
    const fallback = {
      version: 1,
      total: 0,
      subjects: { science: 0, maths: 0, english: 0, hindi: 0, gk: 0, social: 0, revision: 0 },
      events: [],
      daily: { date: '', earned: 0 },
      legacySeeded: false
    };
    const x = input && typeof input === 'object' ? input : {};
    const subjects = Object.assign({}, fallback.subjects, x.subjects || {});
    Object.keys(subjects).forEach((key) => { subjects[key] = Math.max(0, Math.round(Number(subjects[key]) || 0)); });
    const events = Array.isArray(x.events) ? x.events.filter(Boolean).slice(0, 500) : [];
    return Object.assign(fallback, x, {
      version: 1,
      subjects,
      events,
      total: Object.values(subjects).reduce((sum, value) => sum + value, 0),
      daily: x.daily && typeof x.daily === 'object' ? Object.assign({}, fallback.daily, x.daily) : fallback.daily
    });
  }

  function mergeStates(localState, cloudState) {
    const local = normalizeState(localState);
    const remote = normalizeState(cloudState);
    const merged = clone(local);

    Object.keys(merged.subjects).forEach((subject) => {
      merged.subjects[subject] = Math.max(local.subjects[subject] || 0, remote.subjects[subject] || 0);
    });

    const seen = new Set();
    const combined = [];
    [...(local.events || []), ...(remote.events || [])].forEach((event) => {
      const key = String(event?.key || `${event?.subject || ''}|${event?.action || ''}|${event?.content || ''}|${event?.at || ''}`);
      if (seen.has(key)) return;
      seen.add(key);
      combined.push(event);
    });
    combined.sort((a, b) => String(b?.at || '').localeCompare(String(a?.at || '')));
    merged.events = combined.slice(0, 500);
    merged.total = Object.values(merged.subjects).reduce((sum, value) => sum + value, 0);

    const localDaily = local.daily || {};
    const remoteDaily = remote.daily || {};
    if (String(localDaily.date || '') === String(remoteDaily.date || '')) {
      merged.daily = {
        date: String(localDaily.date || remoteDaily.date || ''),
        earned: Math.max(Number(localDaily.earned) || 0, Number(remoteDaily.earned) || 0)
      };
    } else {
      merged.daily = String(localDaily.date || '') > String(remoteDaily.date || '') ? localDaily : remoteDaily;
    }

    merged.legacySeeded = Boolean(local.legacySeeded || remote.legacySeeded);
    return merged;
  }

  async function sync() {
    if (started) return { synced: false, reason: 'already_started' };
    started = true;

    try {
      if (!window.Class6CloudSync?.configured?.()) return { synced: false, reason: 'not_configured' };
      if (!window.XPSystem?.read || !window.XPSystem?.save) return { synced: false, reason: 'xp_system_unavailable' };

      const user = await window.Class6CloudSync.getUser();
      if (!user) return { synced: false, reason: 'not_signed_in' };

      const scope = window.Class6CloudSync.prepareUser?.(user.id) || { changed: false };
      const localState = scope.changed ? null : clone(window.XPSystem.read());
      const row = await window.Class6CloudSync.load();
      const merged = scope.changed ? normalizeState(row?.state || {}) : mergeStates(localState, row?.state || {});
      window.XPSystem.save(merged);

      const result = await window.Class6CloudSync.save(merged, 1);
      if (result?.synced) {
        window.dispatchEvent(new CustomEvent('class6:xp-cloud-synced', {
          detail: { userId: user.id, total: merged.total, subjects: Object.assign({}, merged.subjects) }
        }));
      }
      return result;
    } catch (error) {
      console.error('Class 6 XP cloud sync failed:', error);
      return { synced: false, reason: 'sync_error', error: String(error?.message || error) };
    }
  }

  window.Class6XPCloudSync = Object.freeze({ sync, mergeStates, XP_KEY });

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => { sync(); }, 0);
  }, { once: true });
})();
