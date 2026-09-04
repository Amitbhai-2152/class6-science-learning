(() => {
  'use strict';

  const SCIENCE_KEY = 'class6ScienceProgressV9';
  let started = false;

  const clone = (value) => {
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return value; }
  };

  function readLocal() {
    try {
      const raw = localStorage.getItem(SCIENCE_KEY);
      const value = raw ? JSON.parse(raw) : null;
      return value && typeof value === 'object' ? value : {};
    } catch (_) {
      return {};
    }
  }

  function normalize(input) {
    const x = input && typeof input === 'object' ? input : {};
    const completed = Array.isArray(x.completed)
      ? [...new Set(x.completed.map(Number).filter((id) => Number.isFinite(id) && id > 0))].sort((a, b) => a - b)
      : [];
    const best = {};
    Object.entries(x.best && typeof x.best === 'object' ? x.best : {}).forEach(([id, score]) => {
      const n = Number(id);
      if (!Number.isFinite(n) || n <= 0) return;
      best[String(n)] = Math.max(0, Math.min(100, Number(score) || 0));
    });
    const section = {};
    Object.entries(x.section && typeof x.section === 'object' ? x.section : {}).forEach(([id, part]) => {
      const n = Number(id);
      if (!Number.isFinite(n) || n <= 0) return;
      section[String(n)] = Math.max(0, Number(part) || 0);
    });
    const review = {};
    Object.entries(x.review && typeof x.review === 'object' ? x.review : {}).forEach(([id, item]) => {
      const n = Number(id);
      if (!Number.isFinite(n) || n <= 0 || !item || typeof item !== 'object') return;
      review[String(n)] = {
        lastScore: Math.max(0, Math.min(100, Number(item.lastScore) || 0)),
        attempts: Math.max(0, Math.floor(Number(item.attempts) || 0)),
        nextAt: item.nextAt || null,
        streak: Math.max(0, Math.floor(Number(item.streak) || 0))
      };
    });
    const badges = Array.isArray(x.badges) ? [...new Set(x.badges.map(String).filter(Boolean))] : [];
    const history = Array.isArray(x.history) ? x.history.filter((item) => item && typeof item === 'object').slice(0, 30) : [];
    return {
      completed,
      best,
      section,
      history,
      xp: Math.max(0, Number(x.xp) || 0),
      badges,
      streak: Math.max(0, Math.floor(Number(x.streak) || 0)),
      lastActive: x.lastActive || null,
      review
    };
  }

  function mergeStates(localState, cloudState) {
    const local = normalize(localState);
    const cloud = normalize(cloudState);
    const merged = clone(local);

    merged.completed = [...new Set([...local.completed, ...cloud.completed])].sort((a, b) => a - b);
    merged.xp = Math.max(local.xp, cloud.xp);
    merged.streak = Math.max(local.streak, cloud.streak);
    merged.lastActive = [local.lastActive, cloud.lastActive].filter(Boolean).sort().at(-1) || null;
    merged.badges = [...new Set([...local.badges, ...cloud.badges])];

    merged.best = {};
    [...new Set([...Object.keys(local.best), ...Object.keys(cloud.best)])].forEach((id) => {
      merged.best[id] = Math.max(Number(local.best[id]) || 0, Number(cloud.best[id]) || 0);
    });

    merged.section = {};
    [...new Set([...Object.keys(local.section), ...Object.keys(cloud.section)])].forEach((id) => {
      merged.section[id] = Math.max(Number(local.section[id]) || 0, Number(cloud.section[id]) || 0);
    });

    merged.review = {};
    [...new Set([...Object.keys(local.review), ...Object.keys(cloud.review)])].forEach((id) => {
      const a = local.review[id] || {};
      const b = cloud.review[id] || {};
      const dates = [a.nextAt, b.nextAt].filter(Boolean).map((value) => new Date(value)).filter((date) => !Number.isNaN(date.getTime()));
      merged.review[id] = {
        lastScore: Math.max(Number(a.lastScore) || 0, Number(b.lastScore) || 0),
        attempts: Math.max(Number(a.attempts) || 0, Number(b.attempts) || 0),
        nextAt: dates.length ? new Date(Math.min(...dates.map((date) => date.getTime()))).toISOString() : null,
        streak: Math.max(Number(a.streak) || 0, Number(b.streak) || 0)
      };
    });

    const seen = new Set();
    merged.history = [];
    [...local.history, ...cloud.history].forEach((item) => {
      const key = `${item.id ?? ''}|${item.type ?? ''}|${item.score ?? ''}|${item.total ?? ''}|${item.time ?? ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      merged.history.push(item);
    });
    merged.history.sort((a, b) => String(b?.time || '').localeCompare(String(a?.time || '')));
    merged.history = merged.history.slice(0, 30);

    return merged;
  }

  async function sync() {
    if (started) return { synced: false, reason: 'already_started' };
    started = true;
    try {
      if (!window.Class6CloudSync?.configured?.()) return { synced: false, reason: 'not_configured' };
      const user = await window.Class6CloudSync.getUser();
      if (!user) return { synced: false, reason: 'not_signed_in' };

      const localState = readLocal();
      const row = await window.Class6CloudSync.load();
      const cloudState = row?.state?.subjectProgress?.science || {};
      const merged = mergeStates(localState, cloudState);
      localStorage.setItem(SCIENCE_KEY, JSON.stringify(merged));

      const current = window.XPSystem?.read?.();
      const stateToSave = current && typeof current === 'object'
        ? Object.assign({}, current, { subjectProgress: Object.assign({}, current.subjectProgress, { science: merged }) })
        : { subjectProgress: { science: merged } };
      const result = await window.Class6CloudSync.save(stateToSave, 1);
      window.dispatchEvent(new CustomEvent('class6:science-progress-cloud-synced', {
        detail: { userId: user.id, completed: merged.completed.length, synced: result?.synced === true }
      }));
      window.dispatchEvent(new Event('science:progress-restored'));
      window.HomeStreak?.refresh?.();
      return { synced: result?.synced === true, completed: merged.completed.length };
    } catch (error) {
      console.error('Class 6 science progress cloud sync failed:', error);
      return { synced: false, reason: 'sync_error', error: String(error?.message || error) };
    }
  }

  window.Class6SubjectProgressCloudSync = Object.freeze({
    sync,
    normalize,
    mergeStates,
    readLocal
  });

  document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(() => sync(), 0);
  }, { once: true });
})();
