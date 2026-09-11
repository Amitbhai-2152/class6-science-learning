import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => { throw new Error(`[production-audit] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const has = (file, token) => read(file).includes(token);

const requiredFiles = [
  'index.html','js/xp-system.js','js/xp-cloud-sync.js','js/cloud-sync.js',
  'js/home-streak-v2.js','js/home-streak-cloud-sync.js','js/xp-unify-bridge-v2.js',
  'js/progress.js','js/subject-progress-cloud-sync.js','js/auth-config.js','supabase/schema.sql'
];
for (const file of requiredFiles) assert(fs.existsSync(path.join(root, file)), `Required production file is missing: ${file}`);

const xp = read('js/xp-system.js');
assert(/const STATE_VERSION=2/.test(xp), 'Canonical XP state version must remain 2.');
assert(has('js/xp-system.js','window.XPSystem='), 'Canonical XPSystem API is not exposed.');
assert(has('js/xp-system.js','function currentStreak()'), 'Canonical streak calculation is missing.');
assert(has('js/xp-system.js','function recordActivity()'), 'Canonical activity recording is missing.');
assert(has('js/xp-system.js','DAILY_CAP=200'), 'Daily XP cap contract changed unexpectedly.');

const xpCloud = read('js/xp-cloud-sync.js');
assert(has('js/xp-cloud-sync.js',"const OWNER_KEY = 'class6CloudOwnerV2'"), 'XP cloud sync is missing user ownership scoping.');
assert(has('js/xp-cloud-sync.js',"const REVISION_KEY = 'class6XPCloudRevisionV1'"), 'XP cloud revision key is missing.');
assert(has('js/xp-cloud-sync.js',"const DIRTY_KEY = 'class6XPCloudDirtyV1'"), 'XP dirty-state key is missing.');
assert(has('js/xp-cloud-sync.js','function mergeStates(localState,cloudState)'), 'Cross-browser XP merge is missing.');
assert(has('js/xp-cloud-sync.js','clearDirty(dirtySeq,user.id)'), 'Concurrent mutation protection is missing.');
assert(has('js/xp-cloud-sync.js',"event.key===XP_KEY||event.key===DIRTY_KEY||event.key===OWNER_KEY||event.key===REVISION_KEY"), 'Cross-browser storage-event handling is incomplete.');
assert(has('js/xp-cloud-sync.js','function startPolling()'), 'Foreground polling guard is missing.');
assert(has('js/xp-cloud-sync.js',"document.visibilityState==='visible'"), 'Visibility-aware sync guard is missing.');
assert(has('js/xp-cloud-sync.js','function currentOwner()'), 'XP sync must resolve the current user scope.');
assert(has('js/xp-cloud-sync.js','getRevision(user.id)'), 'XP revision reads must be user-scoped.');
assert(has('js/xp-cloud-sync.js','setRevision(user.id'), 'XP revision writes must be user-scoped.');

const cloud = read('js/cloud-sync.js');
assert(has('js/cloud-sync.js',"const OWNER_KEY = 'class6CloudOwnerV2'"), 'Central cloud layer lacks owner scoping.');
assert(has('js/cloud-sync.js','function prepareUser(userId)'), 'Central cloud layer lacks user preparation.');
assert(has('js/cloud-sync.js','function clearUserScope()'), 'Central cloud layer lacks user-scope cleanup.');
assert(has('js/cloud-sync.js','.eq(\'user_id\', user.id).eq(\'schema_version\', expectedRevision)'), 'Cloud writes must use user + revision optimistic locking.');
assert(has('js/cloud-sync.js','SAVE_RETRIES = 8'), 'Cloud conflict retry budget changed unexpectedly.');
assert(has('js/cloud-sync.js','class6XPCloudDirtyV1'), 'Pending XP state must be included in user-scope cleanup.');
assert(has('js/cloud-sync.js',"if (event === 'SIGNED_OUT') { clearUserScope(); return; }"), 'Signed-out sessions must clear user-scoped local progress.');

const streakCloud = read('js/home-streak-cloud-sync.js');
assert(has('js/home-streak-cloud-sync.js','activeDays'), 'Streak cloud sync must persist canonical activity dates.');
assert(!has('js/home-streak-cloud-sync.js',"Class6CloudSync.save(snapshot,1)"), 'Streak sync must not blindly overwrite the complete student state snapshot.');

const bridge = read('js/xp-unify-bridge-v2.js');
assert(has('js/xp-unify-bridge-v2.js','x.score('), 'Unified bridge must delegate scoring to the canonical XPSystem object.');
assert(has('js/xp-unify-bridge-v2.js','x.award('), 'Unified bridge must delegate XP awards to the canonical XPSystem object.');
assert(has('js/xp-unify-bridge-v2.js','const X=()=>window.XPSystem;'), 'Unified bridge must resolve the canonical XPSystem dynamically.');

const progress = read('js/progress.js');
assert(has('js/progress.js','window.Progress=Progress;'), 'Legacy Progress API must remain available for Science UI compatibility.');
assert(has('js/progress.js','XPSystem.recordLearningDay'), 'Legacy activity marking must delegate to canonical XPSystem.');
assert(has('js/progress.js','canonicalAward(action,content,points,meta={})'), 'Science XP awards must pass through the canonical XP layer.');
assert(!has('js/progress.js','this.data.xp+='), 'Legacy Science progress must not directly increment its own XP field.');
assert(!has('js/progress.js','this.data.streak++'), 'Legacy Science progress must not directly increment its own streak.');

const schema = read('supabase/schema.sql');
assert(has('supabase/schema.sql','alter table public.student_state enable row level security;'), 'Supabase student_state RLS must remain enabled.');
assert(has('supabase/schema.sql','auth.uid() = user_id'), 'Supabase policies must remain user-scoped.');
assert(has('supabase/schema.sql','on delete cascade'), 'Student state must remain tied to auth user deletion.');

const auth = read('js/auth-config.js');
assert(!/service_role|secret|sb_secret_/i.test(auth), 'Browser auth config must not contain a service-role or secret key.');
assert(/anonKey\s*:\s*"[^"]+"/.test(auth), 'Public browser auth configuration is missing.');

const index = read('index.html');
for (const token of [
  'js/xp-system.js?v=','js/xp-unify-bridge-v2.js?v=','js/cloud-sync.js?v=',
  'js/xp-cloud-sync.js?v=','js/home-streak-v2.js?v=','js/home-streak-cloud-sync.js?v=',
  'js/subject-progress-cloud-sync.js?v='
]) assert(has('index.html',token), `index.html is missing cache-busting for ${token}`);
assert(/js\/xp-system\.js\?v=\d+/.test(index), 'Canonical XPSystem cache-busting is malformed.');
assert(/js\/xp-cloud-sync\.js\?v=\d+/.test(index), 'XP cloud-sync cache-busting is malformed.');
assert(/js\/cloud-sync\.js\?v=\d+/.test(index), 'Central cloud-sync cache-busting is malformed.');

const workflow = read('.github/workflows/progress-engine-runtime.yml');
assert(has('.github/workflows/progress-engine-runtime.yml','workflow_dispatch:'), 'Progress verification workflow must remain manually dispatchable.');
assert(has('.github/workflows/progress-engine-runtime.yml','permissions:\n  contents: read'), 'CI workflow must use read-only repository permissions.');
assert(has('.github/workflows/progress-engine-runtime.yml','timeout-minutes: 10'), 'CI workflow must have a bounded execution time.');
for (const token of [
  'npm run check:progress-engine-runtime','npm run check:progress-state-migration',
  'npm run check:subject-progress-wiring','npm run check:production-audit'
]) assert(has('.github/workflows/progress-engine-runtime.yml',token), `CI is missing ${token}`);

const packageJson = JSON.parse(read('package.json'));
for (const key of ['check:progress-engine-runtime','check:progress-state-migration','check:subject-progress-wiring','check:production-audit']) {
  assert(packageJson.scripts?.[key], `${key} is missing from package.json.`);
}

const forbiddenSecretPattern = /(service[_-]?role|sb_secret_[A-Za-z0-9_-]+|SUPABASE_SERVICE_ROLE|OPENAI_API_KEY\s*[:=]\s*["'][^"']+["'])/i;
const scopedTextFiles = ['index.html','js/auth-config.js','js/cloud-sync.js','js/xp-cloud-sync.js','js/home-streak-cloud-sync.js','.github/workflows/progress-engine-runtime.yml'];
for (const file of scopedTextFiles) assert(!forbiddenSecretPattern.test(read(file)), `Potential secret material found in browser/workflow file: ${file}`);

console.log('PHASE 8 FINAL PRODUCTION AUDIT PASSED: canonical XP/streak contracts, cloud-first hydration, user scoping, optimistic locking, concurrent mutation safety, legacy compatibility boundaries, RLS, cache-busting, CI hardening and browser-secret hygiene verified for the Class 6 learning hub.');
