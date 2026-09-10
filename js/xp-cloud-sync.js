(() => {
  'use strict';

  const XP_KEY = 'class6XPSystemV1';
  const STATE_VERSION = 2;
  const ACTIVITY_SOURCE = 'xp-system-v2';
  const MAX_ACTIVITY_DAYS = 400;
  let started = false;

  function clone(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return value; }
  }

  function dayKey(value) {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function normalizeState(input) {
    const fallback = {
      version: STATE_VERSION,
      total: 0,
      subjects: { science: 0, maths: 0, english: 0, hindi: 0, gk: 0, social: 0, revision: 0 },
      events: [],
      daily: { date: '', earned: 0 },
      activeDays: [],
      activitySource: ACTIVITY_SOURCE,
      legacySeeded: false
    };
    const x = input && typeof input === 'object' ? input : {};
    const subjects = Object.assign({}, fallback.subjects, x.subjects || {});
    Object.keys(subjects).forEach((key) => { subjects[key] = Math.max(0, Math.round(Number(subjects[key]) || 0)); });
    const events = Array.isArray(x.events) ? x.events.filter(Boolean).slice(0, 500) : [];
    const eventDays = events.map((event) => dayKey(event?.at)).filter(Boolean);
    const activeDays = [...new Set([...(Array.isArray(x.activeDays) ? x.activeDays : []).map(dayKey).filter(Boolean), ...eventDays])].sort().slice(-MAX_ACTIVITY_DAYS);
    return Object.assign({}, fallback, x, {
      version: STATE_VERSION,
      subjects,
      events,
      activeDays,
      activitySource: ACTIVITY_SOURCE,
      total: Object.values(subjects).reduce((sum, value) => sum + value, 0),
      daily: x.daily && typeof x.daily === 'object' ? Object.assign({}, fallback.daily, x.daily) : fallback.daily
    });
  }

  function migrateState(input) {
    const x = input && typeof input === 'object' ? input : {};
    if (Number(x.version) === STATE_VERSION) return normalizeState(x);
    if (Number(x.version) === 1 || !Number.isFinite(Number(x.version))) return normalizeState(x);
    return normalizeState({});
  }

  function mergeStates(localState, cloudState) {
    const local = migrateState(localState);
    const remote = migrateState(cloudState);
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
    merged.activeDays = [...new Set([
      ...(local.activeDays || []),
      ...(remote.activeDays || []),
      ...merged.events.map((event) => dayKey(event?.at)).filter(Boolean)
    ])].sort().slice(-MAX_ACTIVITY_DAYS);
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

    merged.version = STATE_VERSION;
    merged.activitySource = ACTIVITY_SOURCE;
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
      const merged = scope.changed ? migrateState(row?.state || {}) : mergeStates(localState, row?.state || {});
      window.XPSystem.save(merged);

      const result = await window.Class6CloudSync.save(merged, STATE_VERSION);
      if (result?.synced) {
        window.dispatchEvent(new CustomEvent('class6:xp-cloud-synced', {
          detail: { userId: user.id, version: STATE_VERSION, total: merged.total, subjects: Object.assign({}, merged.subjects), activeDays: merged.activeDays.length }
        }));
      }
      return result;
    } catch (error) {
      console.error('Class 6 XP cloud sync failed:', error);
      return { synced: false, reason: 'sync_error', error: String(error?.message || error) };
    }
  }

  window.Class6XPCloudSync = Object.freeze({ sync, mergeStates, migrateState, normalizeState, XP_KEY, STATE_VERSION, ACTIVITY_SOURCE });

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => { sync(); }, 0);
  }, { once: true });
})();
