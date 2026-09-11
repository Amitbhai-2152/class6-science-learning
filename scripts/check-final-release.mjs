import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => { throw new Error(`[final-release] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const requiredFiles = [
  'index.html',
  'auth.html',
  'js/xp-system.js',
  'js/xp-cloud-sync.js',
  'js/cloud-sync.js',
  'js/progress.js',
  'js/progress-sync-status.js',
  'js/home-streak-v2.js',
  'js/home-streak-cloud-sync.js',
  'js/xp-unify-bridge-v2.js',
  'js/subject-progress-cloud-sync.js',
  'js/auth-config.js',
  'supabase/schema.sql',
  'scripts/check-progress-engine-runtime.mjs',
  'scripts/check-progress-state-migration.mjs',
  'scripts/check-subject-progress-wiring.mjs',
  'scripts/check-browser-compatibility.mjs',
  'scripts/check-production-cleanup.mjs',
  'scripts/check-production-audit.mjs'
];
requiredFiles.forEach((file) => assert(exists(file), `Required release file is missing: ${file}`));

const index = read('index.html');
assert(index.includes('js/xp-system.js?v='), 'Canonical XPSystem is not cache-busted in index.html.');
assert(index.includes('js/progress.js?v='), 'Science Progress is not cache-busted in index.html.');
assert(index.includes('js/progress-sync-status.js?v='), 'Progress sync status UI is not loaded with cache-busting.');
assert(index.includes('js/xp-cloud-sync.js?v='), 'XP cloud sync is not cache-busted in index.html.');
assert(index.includes('js/cloud-sync.js?v='), 'Central cloud sync is not cache-busted in index.html.');
assert(index.includes('js/home-streak-cloud-sync.js?v='), 'Streak cloud sync is not cache-busted in index.html.');

const progress = read('js/progress.js');
assert(!progress.includes('document.write('), 'Production Science Progress still contains document.write().');
assert(progress.includes("canonicalAward(action,content,points,meta={})"), 'Science XP does not terminate at the canonical award boundary.');
assert(!progress.includes('this.data.xp+='), 'Science Progress directly increments its own XP.');
assert(!progress.includes('this.data.streak++'), 'Science Progress directly increments its own streak.');

const xp = read('js/xp-system.js');
assert(/const STATE_VERSION=2/.test(xp), 'Canonical XP state version is not v2.');
assert(/const DAILY_CAP=200/.test(xp), 'Daily XP cap is not 200.');
assert(xp.includes('window.XPSystem='), 'Canonical XPSystem global is missing.');
assert(xp.includes('recordLearningDay'), 'Canonical learning-day activity API is missing.');
assert(xp.includes('currentStreak'), 'Canonical streak API is missing.');

const xpCloud = read('js/xp-cloud-sync.js');
assert(xpCloud.includes("const OWNER_KEY = 'class6CloudOwnerV2'"), 'XP cloud owner scoping is missing.');
assert(xpCloud.includes('function mergeStates(localState,cloudState)'), 'Cross-device XP merge is missing.');
assert(xpCloud.includes('clearDirty(dirtySeq,user.id)'), 'Concurrent XP mutation protection is missing.');
assert(xpCloud.includes('visibilitychange'), 'Visibility-aware sync is missing.');

const cloud = read('js/cloud-sync.js');
assert(cloud.includes("const OWNER_KEY = 'class6CloudOwnerV2'"), 'Central cloud owner scoping is missing.');
assert(cloud.includes('function clearUserScope()'), 'User-scope cleanup is missing.');
assert(cloud.includes('function prepareUser(userId)'), 'User preparation is missing.');
assert(cloud.includes(".eq('user_id', user.id).eq('schema_version', expectedRevision)"), 'Optimistic user+revision locking is missing.');

const status = read('js/progress-sync-status.js');
for (const token of ['class6:xp-cloud-sync-start','class6:xp-cloud-synced','class6:xp-cloud-sync-error','online','offline']) {
  assert(status.includes(token), `Sync UX event/online contract is missing: ${token}`);
}

const auth = read('js/auth-config.js');
assert(!/service_role|sb_secret_|SUPABASE_SERVICE_ROLE/i.test(auth), 'Browser auth config contains forbidden secret material.');

const schema = read('supabase/schema.sql');
assert(schema.includes('alter table public.student_state enable row level security;'), 'student_state RLS is missing.');
assert(schema.includes('auth.uid() = user_id'), 'student_state user-scoped policy is missing.');

const pkg = JSON.parse(read('package.json'));
const requiredScripts = [
  'check:progress-engine-runtime',
  'check:progress-state-migration',
  'check:subject-progress-wiring',
  'check:browser-compatibility',
  'check:production-cleanup',
  'check:production-audit',
  'check:final-release'
];
requiredScripts.forEach((key) => assert(pkg.scripts?.[key], `package.json is missing ${key}.`));

const workflow = read('.github/workflows/progress-engine-runtime.yml');
for (const token of [
  'workflow_dispatch:',
  'permissions:\n  contents: read',
  'timeout-minutes: 10',
  'npm run check:progress-engine-runtime',
  'npm run check:progress-state-migration',
  'npm run check:subject-progress-wiring',
  'npm run check:browser-compatibility',
  'npm run check:production-cleanup',
  'npm run check:production-audit',
  'npm run check:final-release'
]) assert(workflow.includes(token), `CI release gate is missing ${token}.`);

const secretPattern = /(service[_-]?role|sb_secret_[A-Za-z0-9_-]+|SUPABASE_SERVICE_ROLE|OPENAI_API_KEY\s*[:=]\s*["'][^"']+["'])/i;
for (const file of ['index.html','auth.html','js/auth-config.js','js/xp-system.js','js/xp-cloud-sync.js','js/cloud-sync.js','js/progress-sync-status.js','.github/workflows/progress-engine-runtime.yml']) {
  assert(!secretPattern.test(read(file)), `Potential secret material found in release/browser file: ${file}`);
}

console.log('PHASE 12 FINAL RELEASE CHECK PASSED: required runtime files, canonical XP/streak architecture, cross-device sync, user scoping, sync UX, browser compatibility gates, production cleanup, RLS, cache-busting, CI release gates and browser-secret hygiene are release-ready for the Class 6 learning hub.');
