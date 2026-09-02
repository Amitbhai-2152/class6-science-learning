'use strict';

/* Strict weekly gate for tests/index.html. The schedule is owned by
   weekly-exam-plan.js and this file only renders/enforces it. */
(function () {
  const cfg = () => window.WEEKLY_EXAM_CONFIG;
  const utils = () => window.WEEKLY_EXAM_UTILS;
  const $ = (id) => document.getElementById(id);
  const safe = (value) => String(value ?? '').replace(/[&<>\"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;' }[m]));

  function requireSchedule() {
    if (!cfg() || !utils()) throw new Error('Weekly exam schedule is unavailable.');
    utils().validate();
  }

  function examId(exam) {
    return utils().getExamId(exam);
  }

  function injectStyle() {
    if ($('weeklyExamStyle')) return;
    const style = document.createElement('style');
    style.id = 'weeklyExamStyle';
    style.textContent = `
      .weekly-banner{margin:0 0 16px;padding:18px;border-radius:20px;background:linear-gradient(135deg,#eef2ff,#f7f8ff);border:1px solid #dbe1ff;box-shadow:0 12px 30px rgba(30,48,120,.08)}
      .weekly-banner .wb-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.weekly-banner .wb-pill{display:inline-flex;padding:6px 10px;border-radius:999px;background:#3447d61a;color:#3141b8;font-size:10px;font-weight:950}.weekly-banner h2{margin:8px 0 5px;font-size:24px}.weekly-banner p{margin:0;color:#667085;line-height:1.6;font-size:12px}.weekly-banner .wb-count{min-width:155px;padding:14px;border-radius:16px;background:#fff;border:1px solid #e2e7ec;text-align:center}.weekly-banner .wb-count b{display:block;font-size:25px}.weekly-banner .wb-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}.weekly-banner a{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:10px 15px;border-radius:12px;font-weight:950;text-decoration:none}.weekly-banner .wb-primary{background:linear-gradient(135deg,#3447d6,#5b4bdc);color:#fff}.weekly-banner .wb-secondary{background:#fff;border:1px solid #d8dfe7;color:#344054}.weekly-syllabus{margin-top:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.weekly-syllabus .ws{padding:11px;border-radius:13px;background:#fff;border:1px solid #e2e7ec;font-size:11px;line-height:1.5}.weekly-syllabus .ws b{display:block;margin-bottom:4px}.weekly-lock{margin-top:12px;padding:11px 12px;border-radius:12px;background:#fff8e6;border:1px solid #f2d58c;color:#765000;font-size:11px;line-height:1.55}.weekly-error{padding:14px;border-radius:14px;background:#fff2f2;border:1px solid #edb4b4;color:#8b2632;font-size:12px;line-height:1.55}
      .candidate.schedule-locked{position:relative}.candidate.schedule-locked:before{content:'SCHEDULED EXAM DAY ONLY';position:absolute;top:13px;right:13px;padding:5px 8px;border-radius:999px;background:#fff8e6;border:1px solid #f2d58c;color:#765000;font-size:9px;font-weight:950;z-index:2}.candidate.schedule-locked form{filter:saturate(.82)}
      @media(max-width:720px){.weekly-banner .wb-top{display:grid}.weekly-banner .wb-count{width:100%;min-width:0}.weekly-syllabus{grid-template-columns:1fr}.weekly-banner h2{font-size:21px}.weekly-banner a{width:100%}.candidate.schedule-locked:before{position:static;display:inline-flex;margin-bottom:10px}}
    `;
    document.head.appendChild(style);
  }

  function getBanner() {
    let node = $('weeklyExamBanner');
    if (node) return node;
    node = document.createElement('section');
    node.id = 'weeklyExamBanner';
    node.className = 'weekly-banner';
    const main = document.querySelector('main.main');
    const anchor = $('introCard') || main?.firstElementChild;
    main?.insertBefore(node, anchor || null);
    return node;
  }

  function state() {
    requireSchedule();
    return utils().getState();
  }

  function renderBanner() {
    const s = state();
    const banner = getBanner();
    const exam = s.exam;
    const previewDate = utils().addDays(exam.examDate, -cfg().previewLeadDays);
    const subjects = [
      ['🔬 Science', 'Current + previous chapters'],
      ['➗ Mathematics', 'Current + previous chapters'],
      ['🇬🇧 English', 'Grammar + reading practice'],
      ['🪔 Hindi', 'Grammar + comprehension'],
      ['🧠 GK + Reasoning', 'GK + thinking practice'],
      ['🌍 Social Science', 'Current + revision chapters']
    ];
    let label, title, text, count, countLabel, action, lock = '';
    if (s.mode === 'exam') {
      label = '🟢 EXAM SUNDAY';
      title = `T${exam.n} • ${safe(exam.type)} is LIVE`;
      text = `Official candidate examination is open today. Exam ID: ${safe(examId(exam))}. The candidate details below are required before the ${cfg().questionCount}-question paper starts.`;
      count = 'LIVE';
      countLabel = `Exam date: ${utils().formatKey(exam.examDate)}`;
      action = `<a class="wb-primary" href="#candidateCard">📝 Start Candidate Registration</a><a class="wb-secondary" href="planner.html">🗓️ Test Planner</a>`;
    } else if (s.mode === 'preview') {
      label = '🟡 PREVIEW SUNDAY';
      title = `T${exam.n} • Preview & Syllabus Day`;
      text = `आज अगले रविवार की परीक्षा की तैयारी करो. Candidate exam ${utils().formatKey(exam.examDate)} को खुलेगा.`;
      count = '7 DAYS';
      countLabel = `Exam: ${utils().formatKey(exam.examDate)}`;
      action = `<a class="wb-secondary" href="planner.html">🗓️ Full Test Planner</a>`;
      lock = `<div class="weekly-lock">🔒 Candidate exam locked. Preview Sunday पर paper attempt नहीं हो सकता; registration केवल scheduled exam Sunday पर unlock होगा.</div>`;
    } else if (s.mode === 'prep') {
      label = '📖 PREPARATION WINDOW';
      title = `Next Test: T${exam.n}`;
      text = `अभी preparation window है. Preview Sunday ${utils().formatKey(previewDate)} और candidate exam ${utils().formatKey(exam.examDate)} को होगा.`;
      count = utils().formatKey(previewDate);
      countLabel = 'Next preview Sunday';
      action = `<a class="wb-secondary" href="planner.html">🗓️ View Weekly Planner</a>`;
      lock = `<div class="weekly-lock">🔒 Candidate form disabled until the scheduled exam Sunday. Direct access to this page cannot bypass the gate.</div>`;
    } else {
      label = '🏁 SESSION CLOSED';
      title = '2026–27 Sunday Exam Cycle Completed';
      text = `The final scheduled examination is ${utils().formatKey(exam.examDate)}. This cycle is closed after the final Sunday.`;
      count = 'DONE';
      countLabel = 'Final exam date';
      action = `<a class="wb-secondary" href="planner.html">🗓️ View Planner</a>`;
    }
    banner.innerHTML = `<div class="wb-top"><div><span class="wb-pill">${label}</span><h2>${title}</h2><p>${text}</p></div><div class="wb-count"><b>${safe(count)}</b><span>${safe(countLabel)}</span></div></div>${s.mode !== 'closed' ? `<div class="weekly-syllabus">${subjects.map(x => `<div class="ws"><b>${x[0]}</b>${x[1]}</div>`).join('')}</div>` : ''}<div class="wb-actions">${action}</div>${lock}`;

    const candidate = $('candidateCard');
    const form = $('candidateForm');
    const submit = form?.querySelector('button[type="submit"]');
    const unlocked = s.mode === 'exam';
    if (candidate) candidate.classList.toggle('schedule-locked', !unlocked);
    if (form) form.querySelectorAll('input').forEach(input => { input.disabled = !unlocked; });
    if (submit) {
      submit.disabled = !unlocked;
      submit.dataset.scheduleLocked = unlocked ? 'false' : 'true';
      submit.textContent = unlocked ? '📝 Candidate Details Confirm करें और Exam शुरू करें' : '🔒 Candidate Exam — Scheduled Sunday पर खुलेगा';
      submit.title = unlocked ? `Start ${examId(exam)}` : 'Candidate examination is locked until its scheduled Sunday.';
    }
    if (candidate && !unlocked) candidate.setAttribute('aria-describedby', 'weeklyExamBanner');
  }

  function guardForm() {
    const form = $('candidateForm');
    if (!form || form.dataset.weeklyGuarded === 'true') return;
    form.dataset.weeklyGuarded = 'true';
    form.addEventListener('submit', (event) => {
      try {
        const s = state();
        if (s.mode !== 'exam') {
          event.preventDefault();
          event.stopImmediatePropagation();
          alert(`Candidate examination locked. The next scheduled exam is ${utils().formatKey(s.exam.examDate)}.`);
        }
      } catch (_) {
        event.preventDefault();
        event.stopImmediatePropagation();
        alert('Weekly exam schedule validation failed. The exam is locked for safety.');
      }
    }, true);
  }

  function normalizeStem(value) {
    return String(value ?? '')
      .replace(/[“”"'’‘`.,!?;:()[\]{}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase();
  }

  function validateGeneratedPaper(paper, exam) {
    if (!Array.isArray(paper) || paper.length !== cfg().questionCount) {
      throw new Error(`T${exam.n} generated ${Array.isArray(paper) ? paper.length : 0} questions; expected ${cfg().questionCount}.`);
    }
    const requiredCounts = {
      Science: 10,
      Mathematics: 10,
      English: 10,
      Hindi: 10,
      'GK + Reasoning': 10,
      'Social Science': 10
    };
    const counts = Object.fromEntries(Object.keys(requiredCounts).map(k => [k, 0]));
    const seen = new Set();
    let reasoning = 0;
    const scope = window.WEEKLY_EXAM_SYLLABUS?.[exam.n];
    if (!scope) throw new Error(`T${exam.n} syllabus is unavailable for paper validation.`);
    const scopeFor = (q) => {
      if (q.subject === 'Science') return scope.science;
      if (q.subject === 'Mathematics') return scope.maths;
      if (q.subject === 'English') return scope.english;
      if (q.subject === 'Hindi') return scope.hindi;
      if (q.subject === 'Social Science') return scope.socialScience;
      if (q.subject === 'GK + Reasoning') return q.topic === 'Reasoning' ? scope.reasoning : scope.gk;
      return null;
    };

    paper.forEach((q, i) => {
      const number = i + 1;
      if (!q || !requiredCounts[q.subject]) throw new Error(`T${exam.n} question ${number} has an invalid subject.`);
      counts[q.subject]++;
      if (q.subject === 'GK + Reasoning' && q.topic === 'Reasoning') reasoning++;

      const stem = normalizeStem(q.question);
      if (!stem) throw new Error(`T${exam.n} question ${number} has an empty stem.`);
      if (seen.has(stem)) throw new Error(`T${exam.n} contains a duplicate question stem at question ${number}.`);
      seen.add(stem);

      if (!Array.isArray(q.options) || q.options.length < 4) throw new Error(`T${exam.n} question ${number} must have at least 4 options.`);
      const optionKeys = q.options.map(v => normalizeStem(v));
      if (optionKeys.some(v => !v) || new Set(optionKeys).size !== optionKeys.length) throw new Error(`T${exam.n} question ${number} has duplicate/empty options.`);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) throw new Error(`T${exam.n} question ${number} has an invalid answer index.`);

      const allowed = scopeFor(q);
      if (Array.isArray(allowed) && allowed.length && q.chapterId !== '' && q.chapterId !== undefined && q.chapterId !== null) {
        const chapter = Number(q.chapterId);
        if (!allowed.includes(chapter)) throw new Error(`T${exam.n} question ${number} escaped its declared syllabus scope.`);
      }
    });

    Object.entries(requiredCounts).forEach(([subject, expected]) => {
      if (counts[subject] !== expected) throw new Error(`T${exam.n} ${subject} count is ${counts[subject]}; expected ${expected}.`);
    });
    if (reasoning !== 5) throw new Error(`T${exam.n} reasoning count is ${reasoning}; expected 5.`);
    return true;
  }

  function hardenExamBuilder() {
    if (typeof window.buildExam !== 'function' || window.__weeklyQualityBuilder) return;
    const original = window.buildExam;
    window.buildExam = function () {
      const s = state();
      if (s.mode !== 'exam') throw new Error('Candidate examination is not open today.');
      const seedText = examId(s.exam);
      let seed = 0;
      for (let i = 0; i < seedText.length; i++) seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
      const oldRandom = Math.random;
      Math.random = function () {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      try {
        const paper = original();
        validateGeneratedPaper(paper, s.exam);
        return paper;
      } finally { Math.random = oldRandom; }
    };
    window.__weeklyQualityBuilder = true;
  }

  function init() {
    try {
      requireSchedule();
      injectStyle();
      renderBanner();
      guardForm();
      hardenExamBuilder();
      setInterval(() => { try { renderBanner(); } catch (_) {} }, 60000);
    } catch (error) {
      const main = document.querySelector('main.main');
      if (main) {
        const err = document.createElement('section');
        err.className = 'weekly-error';
        err.textContent = 'Weekly examination schedule could not be validated, so candidate registration is locked. Please contact the site administrator.';
        main.prepend(err);
      }
    }
  }

  function boot() {
    if (window.WEEKLY_EXAM_CONFIG && window.WEEKLY_EXAM_UTILS) { init(); return; }
    const existing = document.querySelector('script[data-weekly-plan]');
    if (existing) { existing.addEventListener('load', init, { once: true }); return; }
    const script = document.createElement('script');
    script.src = './weekly-exam-plan.js';
    script.dataset.weeklyPlan = 'true';
    script.onload = init;
    script.onerror = () => init();
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
