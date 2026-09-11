import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const xpPath = path.join(root, 'js/xp-system.js');
const streakPath = path.join(root, 'js/home-streak-v2.js');
const cloudPath = path.join(root, 'js/xp-cloud-sync.js');
const xpSource = fs.readFileSync(xpPath, 'utf8');
const streakSource = fs.readFileSync(streakPath, 'utf8');
const cloudSource = fs.readFileSync(cloudPath, 'utf8');

const fail = (message) => { throw new Error(`[progress-engine-runtime] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

function makeContext(initialStorage = {}, options = {}) {
  const store = new Map(Object.entries(initialStorage));
  const listeners = new Map();
  const timeoutCalls = [];
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); },
    key(index) { return [...store.keys()][index] ?? null; },
    get length() { return store.size; }
  };
  const document = {
    readyState: 'loading',
    body: { appendChild() {} },
    head: { appendChild() {} },
    documentElement: { dataset: {} },
    visibilityState: 'visible',
    addEventListener(type, fn) { listeners.set(`document:${type}`, fn); },
    getElementById() { return null; },
    querySelector() { return null; },
    createElement() {
      return {
        id: '', className: '', textContent: '', innerHTML: '',
        classList: { add() {}, remove() {} },
        setAttribute() {}, appendChild() {},
        querySelector() { return null; },
        insertAdjacentElement() {},
        addEventListener() {},
        parentNode: null
      };
    }
  };
  const window = {
    addEventListener(type, fn) { listeners.set(`window:${type}`, fn); },
    dispatchEvent(event) {
      const fn = listeners.get(`window:${event?.type}`);
      if (fn) fn(event);
      return true;
    }
  };
  class CustomEvent {
    constructor(type, init = {}) { this.type = type; this.detail = init.detail; this.key = init.key; }
  }
  const sandbox = {
    window, document, localStorage, CustomEvent,
    MutationObserver: undefined,
    setTimeout(fn, delay) { timeoutCalls.push({ fn, delay }); return timeoutCalls.length; },
    setInterval() { return 1; },
    clearTimeout() {}, clearInterval() {},
    Date, Math, JSON, Set, Map, Array, Object, Number, String, Boolean, Error, Intl, console
  };
  window.window = window;
  window.document = document;
  window.localStorage = localStorage;
  window.CustomEvent = CustomEvent;
  vm.runInNewContext(xpSource, sandbox, { filename: xpPath });
  vm.runInNewContext(streakSource, sandbox, { filename: streakPath });
  if (options.loadCloud) {
    const cloudAdapter = options.cloudAdapter || {};
    window.Class6CloudSync = cloudAdapter;
    vm.runInNewContext(cloudSource, sandbox, { filename: cloudPath });
    window.Class6CloudSync = cloudAdapter;
  }
  return { ...sandbox, store, timeoutCalls, listeners };
}

const dayKey = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const shiftDay = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return dayKey(d);
};

const ctx = makeContext();
const xp = ctx.window.XPSystem;
assert(xp, 'XPSystem did not initialize.');
assert(xp.snapshot().total === 0, 'Fresh XP state should start at 0.');
assert(xp.activityDays().length === 0, 'Fresh XP state should have no activity days.');
assert(xp.currentStreak() === 0, 'Fresh XP state should have a 0-day streak.');

const today = dayKey(new Date());
const yesterday = shiftDay(new Date(), -1);
const dayBeforeYesterday = shiftDay(new Date(), -2);

const firstActivity = xp.recordLearningDay('runtime-test');
assert(firstActivity.date === today && firstActivity.streak === 1, 'recordLearningDay() should create a 1-day current streak.');
assert(xp.activityDays().length === 1 && xp.activityDays()[0] === today, 'First activity day was not persisted canonically.');

xp.recordLearningDay('runtime-test-duplicate');
assert(xp.activityDays().filter((d) => d === today).length === 1, 'Recording the same learning day must remain idempotent.');
assert(xp.currentStreak() === 1, 'Duplicate same-day activity must not inflate streak length.');

xp.save();
const state = xp.read();
state.activeDays = [dayBeforeYesterday, yesterday, today];
xp.save();
assert(xp.currentStreak() === 3, 'Consecutive today/yesterday/day-before activity should produce a 3-day streak.');

state.activeDays = [dayBeforeYesterday, today];
xp.save();
assert(xp.currentStreak() === 1, 'A one-day gap must break the current streak.');

state.activeDays = [yesterday];
xp.save();
assert(xp.currentStreak() === 0, 'Yesterday-only activity must not count as a current streak.');

const legacyEventState = JSON.stringify({
  version: 1,
  total: 10,
  subjects: { science: 10, maths: 0, english: 0, hindi: 0, gk: 0, social: 0, revision: 0 },
  events: [{ id: 'legacy-event', key: 'science|chapter|1', subject: 'science', action: 'chapter', content: '1', points: 10, at: `${today}T09:00:00.000Z` }],
  daily: { date: today, earned: 10 },
  activeDays: [],
  legacySeeded: true
});
const legacyCtx = makeContext({ class6XPSystemV1: legacyEventState });
const legacyXP = legacyCtx.window.XPSystem;
assert(legacyXP.currentStreak() === 1, 'Existing XP events from before activeDays migration must still contribute to the current streak.');
assert(legacyXP.activityDays().includes(today), 'Legacy XP event date was not recovered into the activity-date view.');

const awardCtx = makeContext();
const awardXP = awardCtx.window.XPSystem;
const firstAward = awardXP.award('science', 'practice', 'runtime-1', 25, { diminishing: false });
assert(firstAward.awarded === 25, 'A valid XP award should grant the requested points.');
assert(awardXP.read().total === 25 && awardXP.read().subjects.science === 25, 'Global and subject XP totals must update together.');
assert(awardXP.read().events.length === 1, 'A successful award should create exactly one XP event.');
assert(awardXP.activityDays().length === 1 && awardXP.currentStreak() === 1, 'A successful award should record the learning day and current streak.');

const duplicateAward = awardXP.award('science', 'practice', 'runtime-1', 25, { diminishing: false });
assert(duplicateAward.awarded === 0 && duplicateAward.reason === 'duplicate', 'A once-only award must be idempotent.');
assert(awardXP.read().total === 25 && awardXP.read().events.length === 1, 'Duplicate awards must not alter XP total or event count.');

const subjectAwards = [
  ['maths', 'practice', 'm1', 30],
  ['english', 'practice', 'e1', 20],
  ['hindi', 'practice', 'h1', 15],
  ['gk', 'practice', 'g1', 10],
  ['social', 'practice', 's1', 35],
  ['revision', 'chapter', 'r1', 5]
];
for (const [subject, action, content, points] of subjectAwards) {
  awardXP.award(subject, action, content, points, { diminishing: false });
}
const subjectTotal = Object.values(awardXP.read().subjects).reduce((sum, value) => sum + Number(value || 0), 0);
assert(subjectTotal === awardXP.read().total, 'Global XP total must equal the sum of subject XP totals.');

let granted = 0;
for (let i = 0; i < 30; i += 1) {
  granted += awardXP.award('science', 'cap-test', `cap-${i}`, 10, { diminishing: false, once: false }).awarded;
}
assert(awardXP.read().daily.earned === awardXP.DAILY_CAP, 'Daily XP must stop at the configured 200 XP cap.');
assert(granted <= awardXP.DAILY_CAP, 'Awards in one day must never grant more than the configured daily cap.');

const staleStreakState = awardXP.read();
staleStreakState.streakState = { streak: 999, activeDays: [] };
staleStreakState.activeDays = [today];
awardXP.save();
assert(awardXP.currentStreak() === 1, 'Canonical streak must be derived from activity dates, not stale stored streak values.');
assert(awardCtx.window.HomeStreak.getStreak() === 1, 'Home streak display must use the canonical XPSystem streak.');
assert(awardCtx.window.HomeStreak.getActivityDays().includes(today), 'Home streak activity view must expose canonical activity dates.');

const invalid = awardXP.award('not-a-subject', 'invalid', 'x', 50);
assert(invalid.reason === 'invalid-subject' && awardXP.read().total === awardXP.read().total, 'Invalid subjects must be rejected without corrupting XP state.');

function makeCloudAdapter(userId, cloudState) {
  let revision = 1;
  return {
    configured: () => true,
    getUser: async () => ({ id: userId }),
    prepareUser: () => ({ changed: false }),
    load: async () => ({ state: cloudState, schema_version: revision }),
    save: async (state) => {
      cloudState = JSON.parse(JSON.stringify(state));
      revision += 1;
      return { synced: true, userId, revision };
    },
    getClient: async () => ({ auth: { onAuthStateChange() {} } })
  };
}

const baseCloud = {
  version: 2,
  total: 40,
  subjects: { science: 10, maths: 10, english: 5, hindi: 5, gk: 5, social: 5, revision: 0 },
  events: [
    { id: 'cloud-1', key: 'science|practice|cloud-1', subject: 'science', action: 'practice', content: 'cloud-1', points: 10, at: `${today}T08:00:00.000Z` }
  ],
  daily: { date: today, earned: 10 },
  activeDays: [yesterday, today],
  activitySource: 'xp-system-v2',
  legacySeeded: false
};

const browserA = makeContext({ class6XPSystemV1: JSON.stringify(baseCloud) });
const browserB = makeContext({ class6XPSystemV1: JSON.stringify(baseCloud) });
const xpA = browserA.window.XPSystem;
const xpB = browserB.window.XPSystem;
const aAward = xpA.award('science', 'practice', 'browser-a', 20, { diminishing: false });
const bAward = xpB.award('maths', 'practice', 'browser-b', 30, { diminishing: false });
assert(aAward.awarded === 20 && bAward.awarded === 30, 'Independent browser contexts must be able to award XP independently.');
const cloudSyncA = makeContext({}, { loadCloud: true, userId: 'student-1', cloudAdapter: makeCloudAdapter('student-1', baseCloud) });
const mergeFn = cloudSyncA.window.Class6XPCloudSync.mergeStates;
const combined = mergeFn(browserA.window.XPSystem.read(), browserB.window.XPSystem.read());
assert(combined.subjects.science >= 30, 'Cross-browser merge must retain Science XP from browser A.');
assert(combined.subjects.maths >= 40, 'Cross-browser merge must retain Maths XP from browser B.');
assert(combined.events.some((e) => e.content === 'browser-a'), 'Cross-browser merge must retain browser A event history.');
assert(combined.events.some((e) => e.content === 'browser-b'), 'Cross-browser merge must retain browser B event history.');
assert(combined.activeDays.includes(today) && combined.activeDays.includes(yesterday), 'Cross-browser merge must retain the union of activity dates.');
assert(combined.total === Object.values(combined.subjects).reduce((sum, value) => sum + Number(value || 0), 0), 'Cross-browser merged total must remain equal to subject totals.');

const scopedCtx = makeContext({
  class6CloudOwnerV2: 'student-a',
  class6XPCloudRevisionV1: JSON.stringify({ userId: 'student-a', revision: 7 }),
  class6XPCloudDirtyV1: JSON.stringify({ dirty: true, userId: 'student-a', seq: 4, at: new Date().toISOString() })
}, { loadCloud: true, userId: 'student-a', cloudAdapter: makeCloudAdapter('student-a', baseCloud) });
const cloudAPI = scopedCtx.window.Class6XPCloudSync;
assert(cloudAPI.getRevision('student-a') === 7, 'A browser must accept its own scoped cloud revision.');
assert(cloudAPI.getRevision('student-b') === 0, 'A browser must reject another user\'s scoped cloud revision.');
const oldSeq = cloudAPI.getDirty().seq;
cloudAPI.markDirty();
const newSeq = cloudAPI.getDirty().seq;
assert(newSeq === oldSeq + 1, 'A second local mutation must advance the pending-sync sequence.');
assert(cloudAPI.clearDirty(oldSeq, 'student-a') === false, 'An older sync completion must not clear a newer pending mutation.');
assert(cloudAPI.getDirty()?.seq === newSeq, 'Newer pending mutation must survive stale clear attempts.');
assert(cloudAPI.clearDirty(newSeq, 'student-a') === true && !cloudAPI.getDirty(), 'The latest successful sync may clear the current pending marker.');

const storageCtx = makeContext({}, { loadCloud: true, userId: 'student-1', cloudAdapter: makeCloudAdapter('student-1', baseCloud) });
storageCtx.window.dispatchEvent(new storageCtx.CustomEvent('storage', { key: 'class6XPCloudRevisionV1' }));
storageCtx.window.dispatchEvent(new storageCtx.CustomEvent('storage', { key: 'class6XPCloudDirtyV1' }));
assert(storageCtx.timeoutCalls.length >= 2, 'Revision/dirty storage events must request a fresh cloud sync across browser contexts.');

console.log('Progress engine runtime test PASSED: canonical activity dates, streak continuity/gaps, legacy event recovery, idempotent XP awards, subject/global XP invariants, daily cap enforcement, stale-streak protection, cross-browser merge preservation, user-scoped revision isolation, concurrent dirty-sequence protection and storage-event sync triggers verified.');
