# Class 6 Science Learning

Modular mobile-first digital Science learning project.

## Structure
- `index.html` — interface
- `css/style.css` — design, responsive layout, animations
- `js/app.js` — navigation/UI
- `js/progress.js` — progress state
- `js/quiz-engine.js` — reusable quiz logic
- `js/tutor.js` — learner tutor logic
- `chapters/chapter-01.js` ... `chapter-12.js` — independent chapter content

## Development workflow
Improve one chapter by editing only its chapter file. Improve the entire design in CSS. Improve quizzes, progress, or tutor in their respective modules.

Chapter 1 is the detailed reference implementation; the remaining chapter files are starter modules ready to be expanded one by one.

Never place an AI API key in browser-side JavaScript. A real generative AI tutor should use a secure backend.
