import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => { throw new Error(`[production-audit] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const has = (file, token) => read(file).includes(token);

const requiredFiles = [
  'index.html',
  'js/xp-system.js',
  'js/xp-cloud-sync.js',
  'js/cloud-sync.js',
  'js/home-streak-v2.js',
  'js/home-streak-cloud-sync.js',
  'js/xp-unify-bridge-v2.js',
  'js/progress.js',
  'js/subject-progress-cloud-sync.js',
  'supabase/schema.sql'
];
for (const file of requiredFiles) assert(fs.existsSync(path.join(root, file)), `Required production file is missing: ${file}`);

const xp = read('js/xp-system.js');
assert(/const STATE_VERSION=2/.test(xp), 'Canonical XP state version must remain 2.');
assert(has('js/xp-system.js', 'window.XPSystem='), 'Canonical XPSystem API is not exposed.');
assert(has('js/xp-system.js', 'function currentStreak()'), 'Canonical streak calculation is missing.');
assert(has('js/xp-system.js', 'function recordActivity()'), 'Canonical activity recording is missing.');
assert(has('js/xp-system.js', 'DAILY_CAP=200'), 'Daily XP cap contract changed unexpectedly.');

const xpCloud = read('js/xp-cloud-sync.js');
assert(has('js/xp-cloud-sync.js', "const OWNER_KEY = 'class6CloudOwnerV2'"), 'XP cloud sync is missing user ownership scoping.');
assert(has('js/xp-cloud-sync.js', "const REVISION_KEY = 'class6XPCloudRevisionV1'"), 'XP cloud revision key is missing.');
assert(has('js/xp-cloud-sync.js', "const DIRTY_KEY = 'class6XPCloudDirtyV1'"), 'XP dirty-state key is missing.');
assert(has('js/xp-cloud-sync.js', 'function mergeStates(localState,cloudState)'), 'Cross-browser XP merge is missing.');
assert(has('js/xp-cloud-sync.js', 'clearDirty(dirtySeq,user.id)'), 'Concurrent mutation protection is missing.');
assert(has('js/xp-cloud-sync.js', "event.key===XP_KEY||event.key===DIRTY_KEY||event.key===OWNER_KEY||event.key===REVISION_KEY"), 'Cross-browser storage-event handling is incomplete.');
assert(has('js/xp-cloud-sync.js', 'function startPolling()'), 'Foreground polling guard is missing.');
assert(has('js/xp-cloud-sync.js', "document.visibilityState==='visible'"), 'Visibility-aware sync guard is missing.');

const cloud = read('js/cloud-sync.js');
assert(has('js/cloud-sync.js', "const OWNER_KEY = 'class6CloudOwnerV2'"), 'Central cloud layer lacks owner scoping.');
assert(has('js/cloud-sync.js', 'function prepareUser(userId)'), 'Central cloud layer lacks user preparation.');
assert(has('js/cloud-sync.js', 'function clearUserScope()'), 'Central cloud layer lacks user-scope cleanup.');
assert(has('js/cloud-sync.js', '.eq(\'user_id\', user.id).eq(\'schema_version\', expectedRevision)'), 'Cloud writes must use user + revision optimistic locking.');
assert(has('js/cloud-sync.js', 'SAVE_RETRIES = 8'), 'Cloud conflict retry budget changed unexpectedly.');

const streakCloud = read('js/home-streak-cloud-sync.js');
assert(has('js/home-streak-cloud-sync.js', 'activeDays'), 'Streak cloud sync must persist canonical activity dates.');
assert(!has('js/home-streak-cloud-sync.js', "Class6CloudSync.save(snapshot,1)"), 'Streak sync must not blindly overwrite the complete student state snapshot.');

const bridge = read('js/xp-unify-bridge-v2.js');
assert(has('js/xp-unify-bridge-v2.js', 'XPSystem.score'), 'Unified bridge must delegate scoring to XPSystem.');
assert(has('js/xp-unify-bridge-v2.js', 'XPSystem.award'), 'Unified bridge must delegate XP awards to XPSystem.');

const progress = read('js/progress.js');
assert(has('js/progress.js', 'window.Progress=Progress;'), 'Legacy Progress API must remain available for Science UI compatibility.');
assert(has('js/progress.js', 'XPSystem.recordLearningDay'), 'Legacy activity marking must delegate to canonical XPSystem.');

const schema = read('supabase/schema.sql');
assert(has('supabase/schema.sql', 'alter table public.student_state enable row level security;'), 'Supabase student_state RLS must remain enabled.');
assert(has('supabase/schema.sql', 'auth.uid() = user_id'), 'Supabase policies must remain user-scoped.');
assert(has('supabase/schema.sql', 'on delete cascade'), 'Student state must remain tied to auth user deletion.');

const auth = read('js/auth-config.js');
assert(!/service_role|secret|sb_secret_/i.test(auth), 'Browser auth config must not contain a service-role or secret key.');
assert(/anonKey\s*:\s*"[^"]+"/.test(auth), 'Public browser auth configuration is missing.');

const index = read('index.html');
const cacheContracts = [
  'js/xp-system.js?v=',
  'js/xp-unify-bridge-v2.js?v=',
  'js/cloud-sync.js?v=',
  'js/xp-cloud-sync.js?v=',
  'js/home-streak-v2.js?v=',
  'js/home-streak-cloud-sync.js?v=',
  'js/subject-progress-cloud-sync.js?v='
];
for (const token of cacheContracts) assert(has('index.html', token), `index.html is missing cache-busting for ${token}`);

const workflow = read('.github/workflows/progress-engine-runtime.yml');
assert(has('.github/workflows/progress-engine-runtime.yml', 'workflow_dispatch:'), 'Progress verification workflow must remain manually dispatchable.');
assert(has('.github/workflows/progress-engine-runtime.yml', 'npm run check:progress-engine-runtime'), 'Runtime regression check is not wired into CI.');
assert(has('.github/workflows/progress-engine-runtime.yml', 'npm run check:progress-state-migration'), 'Migration check is not wired into CI.');
assert(has('.github/workflows/progress-engine-runtime.yml', 'npm run check:subject-progress-wiring'), 'Subject wiring audit is not wired into CI.');

const packageJson = JSON.parse(read('package.json'));
assert(packageJson.scripts?.['check:progress-engine-runtime'], 'Runtime check script is missing from package.json.');
assert(packageJson.scripts?.['check:progress-state-migration'], 'Migration check script is missing from package.json.');
assert(packageJson.scripts?.['check:subject-progress-wiring'], 'Subject wiring script is missing from package.json.');

const forbiddenSecretPattern = /(service[_-]?role|sb_secret_[A-Za-z0-9_-]+|SUPABASE_SERVICE_ROLE|OPENAI_API_KEY\s*[:=]\s*["'][^"']+["'])/i;
const scopedTextFiles = ['index.html','js/auth-config.js','js/cloud-sync.js','js/xp-cloud-sync.js','js/home-streak-cloud-sync.js','.github/workflows/progress-engine-runtime.yml'];
for (const file of scopedTextFiles) assert(!forbiddenSecretPattern.test(read(file)), `Potential secret material found in browser/workflow file: ${file}`);

console.log('Production audit PASSED: canonical XP/streak contracts, cross-browser sync safety, user scoping, optimistic locking, RLS, cache-busting, legacy bridge compatibility, CI wiring and browser-secret hygiene verified for the Class 6 learning hub.');
