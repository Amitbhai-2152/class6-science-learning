(() => {
  'use strict';
  if (window.Class6ProgressSyncStatus) return;

  const ID = 'class6ProgressSyncStatus';
  let timer = null;
  let mode = 'local';

  function ensureStyles() {
    if (document.getElementById(`${ID}Style`)) return;
    const style = document.createElement('style');
    style.id = `${ID}Style`;
    style.textContent = `#${ID}{position:fixed;right:14px;bottom:14px;z-index:9998;display:flex;align-items:center;gap:8px;max-width:min(92vw,360px);padding:8px 11px;border:1px solid rgba(148,163,184,.38);border-radius:999px;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);box-shadow:0 8px 26px rgba(15,23,42,.12);font:700 12px/1.2 system-ui,-apple-system,"Noto Sans Devanagari","Segoe UI",sans-serif;color:#334155;transition:opacity .2s ease,transform .2s ease}#${ID}.is-hidden{opacity:0;transform:translateY(8px);pointer-events:none}#${ID} .dot{width:8px;height:8px;border-radius:50%;flex:0 0 8px;background:#64748b}#${ID}[data-state="syncing"] .dot{background:#f59e0b;animation:${ID}Pulse 1s ease-in-out infinite}#${ID}[data-state="synced"] .dot{background:#16a34a}#${ID}[data-state="offline"] .dot{background:#64748b}#${ID}[data-state="error"] .dot{background:#dc2626}@keyframes ${ID}Pulse{50%{opacity:.35;transform:scale(.78)}}@media(prefers-reduced-motion:reduce){#${ID}[data-state="syncing"] .dot{animation:none}}`;
    document.head?.appendChild(style);
  }

  function ensureNode() {
    let node = document.getElementById(ID);
    if (node) return node;
    ensureStyles();
    node = document.createElement('div');
    node.id = ID;
    node.className = 'is-hidden';
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
    node.innerHTML = '<span class="dot" aria-hidden="true"></span><span class="label">Progress saved on this device</span>';
    (document.body || document.documentElement).appendChild(node);
    return node;
  }

  function paint(state, label, keep = false) {
    const node = ensureNode();
    node.dataset.state = state;
    node.querySelector('.label').textContent = label;
    node.classList.remove('is-hidden');
    clearTimeout(timer);
    if (!keep) timer = setTimeout(() => node.classList.add('is-hidden'), state === 'synced' ? 2600 : 5000);
  }

  function setLocal() {
    mode = 'local';
    if (navigator.onLine === false) paint('offline', 'Offline • progress सुरक्षित है', true);
    else paint('local', 'Progress इस device पर सुरक्षित है');
  }

  function setSyncing() {
    mode = 'syncing';
    paint('syncing', 'Progress cloud में sync हो रहा है…', true);
  }

  function setSynced(e) {
    mode = 'synced';
    const total = Number(e?.detail?.total);
    const suffix = Number.isFinite(total) && total > 0 ? ` • ${total} XP` : '';
    paint('synced', `Progress synced ✓${suffix}`);
  }

  function setError() {
    mode = 'error';
    paint('error', 'Cloud sync अभी उपलब्ध नहीं — progress सुरक्षित है');
  }

  window.Class6ProgressSyncStatus = Object.freeze({
    local: setLocal,
    syncing: setSyncing,
    synced: setSynced,
    error: setError
  });

  window.addEventListener('online', () => {
    paint('syncing', 'Connection वापस आया — sync हो रहा है…', true);
    window.Class6XPCloudSync?.requestSync?.(100);
  });
  window.addEventListener('offline', () => paint('offline', 'Offline • progress सुरक्षित है', true));
  window.addEventListener('class6:xp-cloud-sync-start', setSyncing);
  window.addEventListener('class6:xp-cloud-synced', setSynced);
  window.addEventListener('class6:xp-cloud-sync-error', setError);
  window.addEventListener('DOMContentLoaded', () => {
    if (navigator.onLine === false) paint('offline', 'Offline • progress सुरक्षित है', true);
    else setLocal();
  }, { once: true });

  void mode;
})();
