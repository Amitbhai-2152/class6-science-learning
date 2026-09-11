import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const xpPath = path.join(root, 'js/xp-system.js');
const cloudPath = path.join(root, 'js/xp-cloud-sync.js');
const xpSource = fs.readFileSync(xpPath, 'utf8');
const cloudSource = fs.readFileSync(cloudPath, 'utf8');

const fail = (message) => { throw new Error(`[progress-state-migration] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

function makeContext(initialStorage = {}) {
  const store = new Map(Object.entries(initialStorage));
  const listeners = new Map();
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
  };
  const document = {
    addEventListener(type, fn) { listeners.set(`document:${type}`, fn); },
    getElementById() { return null; },
    head: { appendChild() {} },
    createElement() { return { classList: { add() {}, remove() {} }, querySelector() { return null; } }; }
  };
  const window = {
    addEventListener(type, fn) { listeners.set(`window:${type}`, fn); },
    dispatchEvent() { return true; }
  };
  class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } }
  const sandbox = {
    window, document, localStorage, CustomEvent, MutationObserver: undefined,
    setTimeout() {}, setInterval() {}, clearTimeout() {}, clearInterval() {},
    Date, Math, JSON, Set, Map, Array, Object, Number, String, Boolean, Error, Intl, console
  };
  window.window = window;
  window.document = document;
  window.localStorage = localStorage;
  vm.runInNewContext(xpSource, sandbox, { filename: xpPath });
  vm.runInNewContext(cloudSource, sandbox, { filename: cloudPath });
  return { ...sandbox, store };
}

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const yesterdayDate = new Date(now);
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

const legacy = JSON.stringify({
  version: 1,
  total: 25,
  subjects: { science: 25, maths: 0, english: 0, hindi: 0, gk: 0, social: 0, revision: 0 },
  events: [{ id: 'legacy-1', key: 'science|chapter|1', subject: 'science', action: 'chapter', content: '1', points: 25, at: `${yesterday}T10:00:00.000Z` }],
  daily: { date: yesterday, earned: 25 },
  activeDays: [],
  legacySeeded: true
});

const ctx = makeContext({ class6XPSystemV1: legacy });
const xp = ctx.window.XPSystem;
assert(xp.STATE_VERSION === 2, 'Unified XP state version must be 2.');
assert(xp.read().version === 2, 'Version-1 local state must migrate to version 2 on read.');
assert(xp.read().total === 25 && xp.read().subjects.science === 25, 'Migration must preserve existing XP totals.');
assert(xp.read().events.length === 1, 'Migration must preserve existing XP events.');
assert(xp.activityDays().includes(yesterday), 'Migration must recover activity dates from legacy XP events.');
assert(xp.read().activitySource === 'xp-system-v2', 'Migrated state must declare the canonical activity source.');
xp.save();
const persisted = JSON.parse(ctx.store.get('class6XPSystemV1'));
assert(persisted.version === 2, 'Saving migrated state must persist the new version number.');
assert(Array.isArray(persisted.activeDays) && persisted.activeDays.includes(yesterday), 'Saving migrated state must persist recovered activity days.');

const merge = ctx.window.Class6XPCloudSync;
assert(merge && merge.STATE_VERSION === 2, 'Cloud XP sync must use state version 2.');
const merged = merge.mergeStates(
  { version: 1, subjects: { science: 25 }, events: [{ key: 'local', subject: 'science', action: 'p', content: 'a', at: `${yesterday}T10:00:00Z` }], activeDays: [yesterday] },
  { version: 2, subjects: { maths: 40 }, events: [{ key: 'remote', subject: 'maths', action: 'p', content: 'b', at: `${today}T10:00:00Z` }], activeDays: [today] }
);
assert(merged.version === 2, 'Cloud merge must return the current state version.');
assert(merged.subjects.science === 25 && merged.subjects.maths === 40, 'Cloud merge must preserve subject XP from both sides.');
const normalizedMerged = merge.normalizeState(merged);
assert(normalizedMerged.total === 65, 'Normalized cloud merge total must equal merged subject totals.');
assert(normalizedMerged.activeDays.includes(yesterday) && normalizedMerged.activeDays.includes(today), 'Cloud merge must union activity dates from both local and remote state.');
assert(normalizedMerged.events.length === 2, 'Cloud merge must preserve distinct local and remote XP events.');

console.log('Progress state migration test PASSED: v1→v2 migration, XP/event preservation, activity-date recovery, persistence and cloud-state version/merge compatibility verified.');
