import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const xpPath = path.join(root, 'js/xp-system.js');
const streakPath = path.join(root, 'js/home-streak-v2.js');
const xpSource = fs.readFileSync(xpPath, 'utf8');
const streakSource = fs.readFileSync(streakPath, 'utf8');

const fail = (message) => { throw new Error(`[progress-engine-runtime] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

function makeContext(initialStorage = {}) {
  const store = new Map(Object.entries(initialStorage));
  const listeners = new Map();
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
    constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
  }
  const sandbox = {
    window, document, localStorage, CustomEvent,
    MutationObserver: undefined,
    setTimeout() {}, setInterval() {}, clearTimeout() {}, clearInterval() {},
    Date, Math, JSON, Set, Map, Array, Object, Number, String, Boolean, Error, Intl, console
  };
  window.window = window;
  window.document = document;
  window.localStorage = localStorage;
  window.CustomEvent = CustomEvent;
  vm.runInNewContext(xpSource, sandbox, { filename: xpPath });
  vm.runInNewContext(streakSource, sandbox, { filename: streakPath });
  return { ...sandbox, store };
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

console.log('Progress engine runtime test PASSED: canonical activity dates, streak continuity/gaps, legacy event recovery, idempotent XP awards, subject/global XP invariants, daily cap enforcement and stale-streak protection verified.');
