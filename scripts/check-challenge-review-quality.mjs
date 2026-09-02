import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const chapterPaths = Array.from({ length: 12 }, (_, i) => path.join(root, 'chapters', `chapter-${String(i + 1).padStart(2, '0')}.js`));
const quizEnginePath = path.join(root, 'js', 'quiz-engine.js');
const reviewPath = path.join(root, 'js', 'test-review.js');
const indexPath = path.join(root, 'index.html');

function loadChapterWithReview(file, reviewSource) {
  const source = fs.readFileSync(file, 'utf8');
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: file, timeout: 1000 });
  const chapterKey = Object.keys(context.window).find((key) => /^chapter\d{2}$/.test(key));
  if (!chapterKey) throw new Error(`[challenge-review] No chapter object found in ${path.relative(root, file)}`);
  const chapter = context.window[chapterKey];
  context.window.CHAPTERS = [chapter];
  context.window.currentChapter = chapter.id;
  vm.runInNewContext(reviewSource, context, { filename: reviewPath, timeout: 1000 });
  if (!context.window.ExamReview?.explanation) throw new Error('[challenge-review] ExamReview explanation resolver did not load.');
  return { chapter, explanation: (question) => context.window.ExamReview.explanation(question) };
}

function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase().replace(/[“”\"'’‘`.,!?;:()[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
}

const quizEngine = fs.readFileSync(quizEnginePath, 'utf8');
const review = fs.readFileSync(reviewPath, 'utf8');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

if (!quizEngine.includes('window.ExamReview?.explanation?.(q)')) {
  throw new Error('[challenge-review] QuizEngine is not using the shared ExamReview explanation resolver.');
}
if (!review.includes('window.currentChapter') || !review.includes('explanation(q)')) {
  throw new Error('[challenge-review] Shared ExamReview resolver is missing chapter-context fallback support.');
}
const reviewScript = indexHtml.indexOf('js/test-review.js');
const quizScript = indexHtml.indexOf('js/quiz-engine.js');
if (reviewScript < 0 || quizScript < 0 || reviewScript < quizScript) {
  throw new Error('[challenge-review] index.html must load quiz-engine.js before test-review.js so the resolver is available by submit time.');
}

let questionCount = 0;
let explicitCount = 0;
let fallbackCount = 0;
const problems = [];

for (const file of chapterPaths) {
  const { chapter, explanation } = loadChapterWithReview(file, review);
  const relative = path.relative(root, file);
  if (!Array.isArray(chapter.challenge) || chapter.challenge.length !== 12) {
    problems.push(`${relative}: expected exactly 12 challenge questions.`);
    continue;
  }
  chapter.challenge.forEach((question, index) => {
    questionCount++;
    if (question.explanation && normalize(question.explanation).length >= 12) explicitCount++;
    else fallbackCount++;
    const text = explanation(question);
    if (normalize(text).length < 12) {
      problems.push(`${relative}#${index + 1}: production review resolver returned a too-short explanation.`);
    }
  });
}

if (problems.length) {
  console.error(problems.map((problem) => `- ${problem}`).join('\n'));
  process.exit(1);
}

console.log(`Challenge review quality check passed: ${questionCount} Science challenge questions across 12 chapters have usable production review explanations (${explicitCount} explicit + ${fallbackCount} chapter-aware fallbacks). QuizEngine and index.html wiring are also verified.`);
