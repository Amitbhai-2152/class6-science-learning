import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const files = {
  auth: await readFile('auth.html', 'utf8'),
  config: await readFile('js/auth-config.js', 'utf8'),
  authJs: await readFile('js/auth.js', 'utf8'),
  cloud: await readFile('js/cloud-sync.js', 'utf8'),
  xpCloud: await readFile('js/xp-cloud-sync.js', 'utf8'),
  badgeCloud: await readFile('js/badge-cloud-sync.js', 'utf8'),
  streakCloud: await readFile('js/home-streak-cloud-sync.js', 'utf8'),
  streak: await readFile('js/home-streak.js', 'utf8'),
  xp: await readFile('js/xp-system.js', 'utf8'),
  schema: await readFile('supabase/schema.sql', 'utf8'),
  index: await readFile('index.html', 'utf8'),
  package: await readFile('package.json', 'utf8'),
};

assert.match(files.auth, /id="loginForm"/);
assert.match(files.auth, /id="signupForm"/);
assert.match(files.auth, /js\/auth-config\.js\?v=1/);
assert.match(files.auth, /js\/auth\.js\?v=1/);
assert.match(files.authJs, /signUp\(\{ email, password \}\)/);
assert.match(files.authJs, /signInWithPassword\(\{ email, password \}\)/);
assert.match(files.authJs, /signOut\(\)/);
assert.match(files.cloud, /from\('student_state'\)/);
assert.match(files.cloud, /upsert\(/);
assert.match(files.xpCloud, /XP_KEY = 'class6XPSystemV1'/);
assert.match(files.xpCloud, /Class6CloudSync\.load\(\)/);
assert.match(files.xpCloud, /Class6CloudSync\.save\(merged, 1\)/);
assert.match(files.xpCloud, /mergeStates/);
assert.match(files.streakCloud, /streakState/);
assert.match(files.streakCloud, /Class6CloudSync\.load\(\)/);
assert.match(files.streakCloud, /Class6CloudSync\.save/);
assert.match(files.streak, /streakState/);
assert.match(files.badgeCloud, /badgeState/);
assert.match(files.badgeCloud, /Class6CloudSync\.load\(\)/);
assert.match(files.badgeCloud, /Class6CloudSync\.save/);
assert.match(files.badgeCloud, /XPSystem\.snapshot/);
assert.match(files.xp, /class6XPSystemV1/);
assert.match(files.xp, /BADGES/);
assert.match(files.schema, /references auth\.users\(id\) on delete cascade/);
assert.match(files.schema, /enable row level security/);
assert.match(files.schema, /auth\.uid\(\) = user_id/);
assert.match(files.index, /js\/auth-config\.js\?v=1/);
assert.match(files.index, /js\/cloud-sync\.js\?v=1/);
assert.match(files.index, /js\/xp-cloud-sync\.js\?v=1/);
assert.match(files.index, /js\/home-streak-cloud-sync\.js\?v=1/);
assert.match(files.index, /js\/badge-cloud-sync\.js\?v=1/);
assert.match(files.index, /href="auth\.html"/);
assert.match(files.package, /check:account-system/);

console.log('Account system static checks: PASS');
