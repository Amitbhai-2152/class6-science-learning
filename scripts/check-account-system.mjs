import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const files = {
  auth: await readFile('auth.html', 'utf8'),
  authCss: await readFile('css/auth.css', 'utf8'),
  config: await readFile('js/auth-config.js', 'utf8'),
  authJs: await readFile('js/auth.js', 'utf8'),
  homeAccount: await readFile('js/home-account.js', 'utf8'),
  cloud: await readFile('js/cloud-sync.js', 'utf8'),
  xpCloud: await readFile('js/xp-cloud-sync.js', 'utf8'),
  badgeCloud: await readFile('js/badge-cloud-sync.js', 'utf8'),
  streakCloud: await readFile('js/home-streak-cloud-sync.js', 'utf8'),
  streak: await readFile('js/home-streak.js', 'utf8'),
  subjectCloud: await readFile('js/subject-progress-cloud-sync.js', 'utf8'),
  progress: await readFile('js/progress.js', 'utf8'),
  xp: await readFile('js/xp-system.js', 'utf8'),
  schema: await readFile('supabase/schema.sql', 'utf8'),
  index: await readFile('index.html', 'utf8'),
  package: await readFile('package.json', 'utf8'),
};

assert.match(files.auth, /id="loginForm"/);
assert.match(files.auth, /id="signupForm"/);
assert.match(files.auth, /id="profileAvatar"/);
assert.match(files.auth, /id="avatarOptions"/);
assert.match(files.auth, /data-auth-tab="login"/);
assert.match(files.auth, /data-auth-tab="signup"/);
assert.match(files.auth, /data-password-toggle="loginPassword"/);
assert.match(files.auth, /data-password-toggle="signupPassword"/);
assert.match(files.auth, /css\/auth\.css\?v=4/);
assert.match(files.auth, /js\/auth\.js\?v=4/);
assert.match(files.authJs, /updateUser\(\{ data: \{ avatar \} \}\)/);
assert.match(files.authJs, /setupAuthTabs/);
assert.match(files.authJs, /setupPasswordToggles/);
assert.match(files.authJs, /AVATARS = \[/);
assert.match(files.authJs, /signInWithPassword\(\{ email, password \}\)/);
assert.match(files.authJs, /signOut\(\)/);
assert.match(files.authCss, /@keyframes authRise/);
assert.match(files.authCss, /@keyframes authFloat/);
assert.match(files.authCss, /prefers-reduced-motion/);
assert.match(files.homeAccount, /homeAvatar/);
assert.match(files.homeAccount, /user_metadata/);
assert.match(files.homeAccount, /let button = document\.getElementById\('homeMenuBtn'\)/);
assert.match(files.homeAccount, /button\.dataset\.bound = '1'/);
assert.match(files.homeAccount, /home-menu-open/);
assert.match(files.cloud, /from\('student_state'\)/);
assert.match(files.cloud, /upsert\(/);
assert.match(files.cloud, /let saveQueue = Promise\.resolve\(\)/);
assert.match(files.cloud, /const existing = await load\(\)/);
assert.match(files.cloud, /Object\.assign\(\{}, cloudState, incoming\)/);
assert.match(files.xpCloud, /Class6CloudSync\.load\(\)/);
assert.match(files.xpCloud, /Class6CloudSync\.save\(merged, 1\)/);
assert.match(files.streakCloud, /streakState/);
assert.match(files.streakCloud, /Class6CloudSync\.save/);
assert.match(files.badgeCloud, /badgeState/);
assert.match(files.badgeCloud, /Class6CloudSync\.load\(\)/);
assert.match(files.badgeCloud, /Class6CloudSync\.save/);
assert.match(files.badgeCloud, /XPSystem\.snapshot/);
assert.match(files.subjectCloud, /SCIENCE_KEY = 'class6ScienceProgressV9'/);
assert.match(files.subjectCloud, /subjectProgress/);
assert.match(files.subjectCloud, /mergeStates/);
assert.match(files.subjectCloud, /Class6CloudSync\.load\(\)/);
assert.match(files.subjectCloud, /localStorage\.setItem\(SCIENCE_KEY/);
assert.match(files.progress, /class6ScienceProgressV9/);
assert.match(files.xp, /class6XPSystemV1/);
assert.match(files.xp, /BADGES/);
assert.match(files.schema, /references auth\.users\(id\) on delete cascade/);
assert.match(files.schema, /enable row level security/);
assert.match(files.schema, /auth\.uid\(\) = user_id/);
assert.match(files.index, /id="homeMenuBtn"/);
assert.match(files.index, /id="homeAvatar"/);
assert.match(files.index, /href="auth\.html"/);
assert.match(files.index, /css\/home\.css\?v=6/);
assert.match(files.index, /js\/cloud-sync\.js\?v=2/);
assert.match(files.index, /js\/home-account\.js\?v=3/);
assert.match(files.package, /check:account-system/);

console.log('Account system static checks: PASS');
