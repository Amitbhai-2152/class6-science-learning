import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => { throw new Error(`[production-cleanup] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const index = read('index.html');
const progress = read('js/progress.js');
const xp = read('js/xp-system.js');
const cloud = read('js/cloud-sync.js');
const xpCloud = read('js/xp-cloud-sync.js');
const bridge = read('js/xp-unify-bridge-v2.js');

// The compatibility wrapper must bootstrap cleanly without document.write and
// reconcile again once the canonical engine has loaded later in the page.
assert(index.includes('js/progress.js?v='), 'Science Progress cache-busting is missing.');
assert(index.includes('js/xp-system.js?v='), 'Canonical XPSystem cache-busting is missing.');
assert(!progress.includes("document.write('<script src=\"xp-system.js"), 'Science Progress must not use a document.write XPSystem fallback in production.');
assert(progress.includes("document.addEventListener('DOMContentLoaded',()=>{try{Progress.syncCanonicalView()}catch(_){}},{once:true})"), 'Science Progress must reconcile after the canonical XP engine bootstraps.');
assert(!progress.includes('this.data.xp+='), 'Legacy Science Progress must not directly mutate canonical XP totals.');
assert(!progress.includes('this.data.streak++'), 'Legacy Science Progress must not directly mutate canonical streaks.');
assert(progress.includes("canonicalAward(action,content,points,meta={})"), 'Science Progress canonical award boundary was removed.');

// Keep cache versions explicit on every canonical runtime dependency.
for (const token of [
  'js/xp-system.js?v=',
  'js/progress.js?v=',
  'js/xp-unify-bridge-v2.js?v=',
  'js/cloud-sync.js?v=',
  'js/xp-cloud-sync.js?v=',
  'js/home-streak-cloud-sync.js?v='
]) assert(index.includes(token), `Missing cache-busting token: ${token}`);

// Legacy local keys are compatibility mirrors, not alternate XP authorities.
const compatibilityOwners = {
  class6ScienceProgressV9: ['js/progress.js', 'js/cloud-sync.js'],
  mathsExamHistory: ['subjects/maths/maths-exam.js', 'js/cloud-sync.js'],
  class6EnglishProgressV1: ['subjects/english/english-progress.js', 'js/cloud-sync.js'],
  class6HindiProgressV2: ['subjects/hindi/hindi-progress.js', 'js/cloud-sync.js'],
  class6GKProgressV1: ['subjects/gk/hi-progress-engine.js', 'js/cloud-sync.js'],
  socialScienceProgressV3: ['subjects/social-science/social-science-progress.js', 'js/cloud-sync.js'],
  class6RevisionProgressV1: ['js/revision-engine.js', 'js/cloud-sync.js']
};
for (const [key, allowedFiles] of Object.entries(compatibilityOwners)) {
  const missing = allowedFiles.filter((file) => !fs.existsSync(path.join(root, file)));
  assert(!missing.length, `${key}: expected compatibility owner file is missing: ${missing.join(', ')}`);
  for (const file of allowedFiles) assert(read(file).includes(key), `${key}: expected owner file no longer references its compatibility key: ${file}`);
}

// Central user scoping remains the only supported cleanup boundary.
assert(cloud.includes("const OWNER_KEY = 'class6CloudOwnerV2'"), 'Central cloud sync owner scope is missing.');
assert(cloud.includes('function clearUserScope()'), 'Central cloud sync cleanup boundary is missing.');
assert(cloud.includes('function prepareUser(userId)'), 'Central cloud sync user preparation boundary is missing.');
assert(xpCloud.includes("const OWNER_KEY = 'class6CloudOwnerV2'"), 'XP cloud sync owner scope is missing.');
assert(xpCloud.includes('function currentOwner()'), 'XP cloud sync owner resolution is missing.');
assert(xpCloud.includes('function clearDirty(expectedSeq=null,userId=\'\')'), 'XP dirty-state cleanup boundary is missing.');

// Old chapter-completion cloud metadata must not be reintroduced into canonical state.
assert(!xp.includes('class6ChapterCompletionsV1'), 'Canonical XP engine must not absorb legacy chapter-completion metadata.');
assert(!xpCloud.includes('class6ChapterCompletionsV1'), 'XP cloud sync must not absorb legacy chapter-completion metadata.');

// Unified bridge is a compatibility adapter only.
assert(bridge.includes('x.score(') && bridge.includes('x.award('), 'Unified XP bridge must remain a thin canonical adapter.');
assert(!bridge.includes("localStorage.setItem('class6XPSystemV1'"), 'XP bridge must not persist canonical XP state directly.');

console.log('PHASE 10 PRODUCTION CLEANUP PASSED: document.write fallback removed, post-bootstrap reconciliation retained, cache-busting verified, legacy compatibility ownership constrained, user-scope cleanup boundaries preserved and canonical XP bridge isolation verified.');