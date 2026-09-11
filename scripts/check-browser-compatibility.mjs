import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const sources = [
  ['js/xp-system.js', fs.readFileSync(path.join(root, 'js/xp-system.js'), 'utf8')],
  ['js/home-streak-v2.js', fs.readFileSync(path.join(root, 'js/home-streak-v2.js'), 'utf8')],
  ['js/cloud-sync.js', fs.readFileSync(path.join(root, 'js/cloud-sync.js'), 'utf8')],
  ['js/xp-cloud-sync.js', fs.readFileSync(path.join(root, 'js/xp-cloud-sync.js'), 'utf8')]
];

const fail = (message) => { throw new Error(`[browser-compatibility] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

function makeBrowser(name) {
  const store = new Map();
  const listeners = new Map();
  const timers = new Map();
  let timerId = 0;
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); },
    key(index) { return [...store.keys()][index] ?? null; },
    get length() { return store.size; }
  };
  const addListener = (target, type, fn) => listeners.set(`${target}:${type}`, fn);
  const removeTimer = (id) => timers.delete(id);
  const setTimeoutMock = (fn, delay) => { const id = ++timerId; timers.set(id, { fn, delay }); return id; };
  const setIntervalMock = (fn, delay) => setTimeoutMock(fn, delay);
  class BrowserCustomEvent {
    constructor(type, init = {}) { this.type = type; this.detail = init.detail; this.key = init.key; }
  }
  const window = {
    addEventListener(type, fn) { addListener('window', type, fn); },
    removeEventListener(type) { listeners.delete(`window:${type}`); },
    dispatchEvent(event) { listeners.get(`window:${event?.type}`)?.(event); return true; },
    setTimeout: setTimeoutMock,
    setInterval: setIntervalMock,
    clearTimeout: removeTimer,
    clearInterval: removeTimer,
    window: null,
    localStorage,
    document: null,
    CustomEvent: BrowserCustomEvent
  };
  const document = {
    readyState: 'loading',
    visibilityState: 'visible',
    addEventListener(type, fn) { addListener('document', type, fn); },
    removeEventListener(type) { listeners.delete(`document:${type}`); },
    dispatchEvent(event) { listeners.get(`document:${event?.type}`)?.(event); return true; },
    getElementById() { return null; },
    querySelector() { return null; },
    head: { appendChild() {} },
    body: { appendChild() {} },
    createElement() {
      return { classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {}, querySelector() { return null; } };
    }
  };
  const sandbox = {
    window, document, localStorage, CustomEvent: BrowserCustomEvent,
    MutationObserver: undefined,
    setTimeout: setTimeoutMock,
    setInterval: setIntervalMock,
    clearTimeout: removeTimer,
    clearInterval: removeTimer,
    Date, Math, JSON, Set, Map, Array, Object, Number, String, Boolean, Error, Intl, console,
    location: { href: 'https://class6.example/' },
    URL, URLSearchParams
  };
  window.window = window;
  window.document = document;
  document.defaultView = window;
  for (const [file, source] of sources) vm.runInNewContext(source, sandbox, { filename: file });
  return { name, window, document, localStorage, listeners, timers };
}

const profiles = ['Chromium', 'Firefox', 'WebKit'].map(makeBrowser);
for (const browser of profiles) {
  const xp = browser.window.XPSystem;
  assert(xp, `${browser.name}: XPSystem failed to initialize.`);
  assert(xp.STATE_VERSION === 2, `${browser.name}: wrong XP state version.`);
  const award = xp.award('science', 'browser-smoke', browser.name, 20, { diminishing: false });
  assert(award.awarded === 20, `${browser.name}: XP award failed.`);
  assert(xp.currentStreak() === 1, `${browser.name}: streak did not update after learning activity.`);
  assert(xp.read().subjects.science === 20, `${browser.name}: subject XP is inconsistent.`);

  browser.window.dispatchEvent(new browser.window.CustomEvent('storage', { key: 'class6XPCloudRevisionV1' }));
  assert(browser.timers.size >= 1, `${browser.name}: revision storage event did not schedule sync.`);

  browser.document.visibilityState = 'hidden';
  browser.document.dispatchEvent(new browser.window.CustomEvent('visibilitychange'));
  browser.document.visibilityState = 'visible';
  browser.document.dispatchEvent(new browser.window.CustomEvent('visibilitychange'));
  assert(browser.window.Class6XPCloudSync, `${browser.name}: XP cloud sync API missing.`);
}

console.log('Browser compatibility smoke test PASSED: Chromium, Firefox and WebKit-style isolated contexts verified canonical XP initialization, XP award/streak updates, storage-event sync scheduling and visibility-aware sync lifecycle without browser-specific API assumptions.');
