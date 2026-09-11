import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const fail = (message) => { throw new Error(`[subject-progress-wiring] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const has = (file, token) => read(file).includes(token);
const hasScript = (file, name) => new RegExp(`<script src=[\"'](?:[^\"']*\/)?${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\?v=\\d+)?[\"']><\\/script>`).test(read(file));

const progressEngines = [
  'subjects/gk/gk-progress-hi.js',
  'subjects/gk/hi-progress-engine.js',
  'subjects/english/english-progress.js',
  'subjects/hindi/hindi-progress.js',
  'subjects/social-science/social-science-progress.js'
];
for (const file of progressEngines) {
  assert(hasScript(file, 'xp-system.js'), `${file} does not bootstrap canonical XPSystem.`);
  assert(hasScript(file, 'xp-unify-bridge-v2.js'), `${file} does not bootstrap the unified XP bridge.`);
}

const routes = {
  'subjects/gk/practice-hi.html': ['gk-progress-hi.js?v=2', 'GKProgressHI?.record'],
  'subjects/gk/challenge-hi.html': ['hi-progress-engine.js?v=2', 'GKProgressHI?.record'],
  'subjects/gk/topic-hi.html': ['gk-progress-hi.js?v=2', 'GKProgressHI?.record'],
  'subjects/english/practice.html': ['english-progress.js?v=2', 'EnglishProgress?.record'],
  'subjects/english/chapter.html': ['english-progress.js?v=2', 'EnglishProgress?.record'],
  'subjects/english/full-test.html': ['english-progress.js?v=3', 'EnglishProgress?.record'],
  'subjects/hindi/practice.html': ['hindi-progress.js?v=3', 'HindiProgress.recordPractice'],
  'subjects/hindi/chapter.html': ['hindi-progress.js?v=2', 'HindiProgress.recordChapter'],
  'subjects/hindi/full-test.html': ['hindi-progress.js?v=3', 'HindiProgress.recordTest'],
  'subjects/social-science/practice-v2.html': ['social-science-progress.js?v=2', 'S.practice'],
  'subjects/maths/maths-exam.html': ['../../js/xp-system.js?v=2', '../../js/xp-unify-bridge-v2.js?v=2']
};

for (const [file, tokens] of Object.entries(routes)) {
  for (const token of tokens) assert(has(file, token), `${file} is missing required progress wiring: ${token}`);
}

assert(has('subjects/gk/topic-hi.html', 'यह विषय अभ्यास progress में सुरक्षित हो गया'), 'GK topic route does not expose a saved-progress result state.');
assert(has('subjects/english/chapter.html', "EnglishApp.emit('english:practice-complete',r)"), 'English chapter route lost its practice completion event.');
assert(has('subjects/english/chapter.html', "EnglishProgress?.record('Chapter Practice'"), 'English chapter practice does not record progress.');
assert(has('subjects/english/practice.html', "EnglishProgress?.record('Mixed Practice'"), 'English mixed practice does not record progress.');
assert(has('subjects/hindi/practice.html', 'HindiProgress.recordPractice'), 'Hindi practice does not record progress.');
assert(has('subjects/social-science/practice-v2.html', 'S.practice(Number(mode),score,set.length)'), 'Social Science chapter practice does not update mastery.');
assert(has('subjects/maths/maths-exam.js', "localStorage.setItem(key,JSON.stringify(h.slice(0,20)))"), 'Maths exam does not persist attempt history for the unified bridge.');

const index = read('index.html');
assert(/<script src="js\/progress\.js(?:\?v=\d+)?"><\/script>/.test(index), 'Science main route lost legacy progress initialization.');
assert(/<script src="js\/xp-system\.js(?:\?v=\d+)?"><\/script>/.test(index), 'Science main route lost canonical XPSystem.');
assert(/<script src="js\/xp-unify-bridge-v2\.js(?:\?v=\d+)?"><\/script>/.test(index), 'Science main route lost unified XP bridge.');
assert(has('js/progress.js', 'window.Progress=Progress;'), 'Science progress API is not exposed on window for the app runtime.');

console.log('Subject progress wiring check PASSED: GK, English, Hindi, Social Science, Maths and Science learning/test routes are connected to their progress APIs and the unified XP bridge where required.');
