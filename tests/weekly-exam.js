'use strict';

/* Weekly Sunday exam gate for tests/index.html.
   Preview Sunday = planning/syllabus view.
   Next Sunday = candidate exam opens.
*/
(function () {
  const PLAN = [
    { n: 1, date: '2026-09-13', type: 'Foundation 1', focus: 'Initial chapters + core basics' },
    { n: 2, date: '2026-09-27', type: 'Foundation 2', focus: 'New chapters + Test 1 revision' },
    { n: 3, date: '2026-10-11', type: 'Foundation 3', focus: 'New chapters + cumulative revision' },
    { n: 4, date: '2026-10-25', type: 'Progress 1', focus: 'New learning + mixed practice' },
    { n: 5, date: '2026-11-08', type: 'Progress 2', focus: 'New learning + previous revision' },
    { n: 6, date: '2026-11-22', type: 'Monthly Test', focus: 'November syllabus + cumulative revision' },
    { n: 7, date: '2026-12-06', type: 'Progress 3', focus: 'New learning + weak-topic revision' },
    { n: 8, date: '2026-12-20', type: 'Half-Yearly Grand', focus: 'Large cumulative syllabus' },
    { n: 9, date: '2027-01-03', type: 'Progress 4', focus: 'New learning + cumulative revision' },
    { n: 10, date: '2027-01-17', type: 'Progress 5', focus: 'New learning + mixed practice' },
    { n: 11, date: '2027-01-31', type: 'Monthly Test', focus: 'January syllabus + cumulative revision' },
    { n: 12, date: '2027-02-14', type: 'Pre-Final Grand', focus: 'Almost complete syllabus + weak areas' },
    { n: 13, date: '2027-02-28', type: 'FINAL EXAM', focus: 'Complete Class 6 syllabus' }
  ];
  const TZ = 'Asia/Kolkata';
  const $ = (id) => document.getElementById(id);
  function parts(date) {
    const list = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const out = {};
    list.forEach(p => { out[p.type] = p.value; });
    return out;
  }
  function todayKey() { const p = parts(new Date()); return `${p.year}-${p.month}-${p.day}`; }
  function parseKey(key) { const [y, m, d] = key.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); }
  function addDays(key, days) { const d = parseKey(key); d.setUTCDate(d.getUTCDate() + days); return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); }
  function fmt(key) { return new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).format(parseKey(key)); }
  function getState(today) {
    const exam = PLAN.find(x => x.date === today);
    if (exam) return { mode: 'exam', exam };
    const preview = PLAN.find(x => addDays(x.date, -7) === today);
    if (preview) return { mode: 'preview', exam: preview };
    const upcoming = PLAN.find(x => x.date > today);
    if (upcoming) return { mode: 'prep', exam: upcoming };
    return { mode: 'closed', exam: PLAN[PLAN.length - 1] };
  }
  function injectStyle() {
    const style = document.createElement('style');
    style.textContent = `
      .weekly-banner{margin-bottom:16px;padding:18px;border-radius:20px;background:linear-gradient(135deg,#eef2ff,#f7f8ff);border:1px solid #dbe1ff;box-shadow:0 12px 30px rgba(30,48,120,.08)}
      .weekly-banner .wb-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}
      .weekly-banner .wb-pill{display:inline-flex;padding:6px 10px;border-radius:999px;background:#3447d61a;color:#3141b8;font-size:10px;font-weight:950}
      .weekly-banner h2{margin:8px 0 5px;font-size:24px}
      .weekly-banner p{margin:0;color:#667085;line-height:1.6;font-size:12px}
      .weekly-banner .wb-count{min-width:150px;padding:14px;border-radius:16px;background:#fff;border:1px solid #e2e7ec;text-align:center}
      .weekly-banner .wb-count b{display:block;font-size:25px}
      .weekly-banner .wb-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}
      .weekly-banner a{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:10px 15px;border-radius:12px;font-weight:950;text-decoration:none}
      .weekly-banner .wb-primary{background:linear-gradient(135deg,#3447d6,#5b4bdc);color:#fff}
      .weekly-banner .wb-secondary{background:#fff;border:1px solid #d8dfe7;color:#344054}
      .weekly-syllabus{margin-top:14px;display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
      .weekly-syllabus .ws{padding:11px;border-radius:13px;background:#fff;border:1px solid #e2e7ec;font-size:11px;line-height:1.5}
      .weekly-syllabus .ws b{display:block;margin-bottom:4px}
      .weekly-lock{margin-top:12px;padding:11px 12px;border-radius:12px;background:#fff8e6;border:1px solid #f2d58c;color:#765000;font-size:11px;line-height:1.55}
      @media(max-width:720px){.weekly-banner .wb-top{display:grid}.weekly-banner .wb-count{width:100%;min-width:0}.weekly-syllabus{grid-template-columns:1fr}.weekly-banner h2{font-size:21px}.weekly-banner a{width:100%}}
    `;
    document.head.appendChild(style);
  }
  function getOrCreateBanner() {
    let node = document.getElementById('weeklyExamBanner');
    if (node) return node;
    node = document.createElement('section');
    node.id = 'weeklyExamBanner';
    node.className = 'weekly-banner';
    const main = document.querySelector('main.main');
    const anchor = document.getElementById('introCard') || main?.firstElementChild;
    if (main) main.insertBefore(node, anchor || null);
    return node;
  }
  function renderBanner() {
    const today = todayKey();
    const s = getState(today);
    const banner = getOrCreateBanner();
    const previewDate = addDays(s.exam.date, -7);
    const label = s.mode === 'exam' ? '🟢 EXAM SUNDAY' : s.mode === 'preview' ? '🟡 PREVIEW SUNDAY' : s.mode === 'prep' ? '📖 PREPARATION WINDOW' : '🏁 SESSION CLOSED';
    let title = '', text = '', count = '', countLabel = '', action = '', lock = '';
    if (s.mode === 'exam') {
      title = `T${s.exam.n} • ${s.exam.type} is LIVE`;
      text = `आज candidate registration और official 60-question examination खुला है. ${fmt(s.exam.date)} को scheduled paper ही attempt किया जाएगा.`;
      count = 'LIVE'; countLabel = 'Candidate exam';
      action = `<a class="wb-primary" href="#candidateCard">📝 Start Candidate Registration</a>`;
    } else if (s.mode === 'preview') {
      title = `T${s.exam.n} • Preview & Syllabus Day`;
      text = `आज अगले रविवार के candidate exam का syllabus, preparation guidance और rules दिखाए जाएँगे. Exam ${fmt(s.exam.date)} को खुलेगा.`;
      count = '7 DAYS'; countLabel = `Exam: ${fmt(s.exam.date)}`;
      action = `<a class="wb-secondary" href="planner.html">🗓️ Full Test Planner</a>`;
      lock = `<div class="weekly-lock">🔒 Candidate exam अभी locked है. Preview Sunday पर registration नहीं खुलता; अगले Sunday को ही candidate test शुरू होगा.</div>`;
    } else if (s.mode === 'prep') {
      title = `Next Test: T${s.exam.n}`;
      text = `अभी preparation window है. Preview Sunday ${fmt(previewDate)} और candidate exam ${fmt(s.exam.date)} को होगा.`;
      count = fmt(previewDate); countLabel = 'Next preview Sunday';
      action = `<a class="wb-secondary" href="planner.html">🗓️ View Weekly Planner</a>`;
      lock = `<div class="weekly-lock">📚 अभी केवल preparation mode है. Candidate form scheduled exam Sunday पर automatically unlock होगा.</div>`;
    } else {
      title = 'February Final Exam Cycle Completed';
      text = `इस planner का अंतिम examination ${fmt(s.exam.date)} को पूरा हो जाता है. अगला academic cycle अलग planner से जोड़ा जा सकता है.`;
      count = 'DONE'; countLabel = '2026–27 cycle';
      action = `<a class="wb-secondary" href="planner.html">🗓️ View Planner</a>`;
    }
    const syllabus = [
      ['🔬 Science','Current + previous chapters'],
      ['➗ Mathematics','Current + previous chapters'],
      ['🇬🇧 English','Grammar + reading practice'],
      ['🪔 Hindi','Grammar + comprehension'],
      ['🧠 GK + Reasoning','GK + thinking practice'],
      ['🌍 Social Science','Current + revision chapters']
    ];
    banner.innerHTML = `<div class="wb-top"><div><span class="wb-pill">${label}</span><h2>${title}</h2><p>${text}</p></div><div class="wb-count"><b>${count}</b><span>${countLabel}</span></div></div>${s.mode !== 'closed' ? `<div class="weekly-syllabus">${syllabus.map(x => `<div class="ws"><b>${x[0]}</b>${x[1]}</div>`).join('')}</div>` : ''}<div class="wb-actions">${action}</div>${lock}`;
    const candidate = $('candidateCard');
    const submit = candidate?.querySelector('button[type="submit"]');
    if (submit) {
      const unlocked = s.mode === 'exam';
      submit.disabled = !unlocked;
      submit.dataset.scheduleLocked = unlocked ? 'false' : 'true';
      submit.textContent = unlocked ? '📝 Candidate Details Confirm करें और Exam शुरू करें' : '🔒 Candidate Exam — Sunday पर खुलेगा';
      submit.title = unlocked ? 'Start the scheduled candidate examination' : 'Candidate examination is only available on the scheduled exam Sunday';
    }
    if (candidate) candidate.style.opacity = s.mode === 'exam' ? '1' : '.96';
    if (s.mode !== 'exam' && $('candidateCard')) {
      $('candidateCard').querySelectorAll('input').forEach(input => input.disabled = true);
    }
    if (s.mode === 'exam' && $('candidateCard')) {
      $('candidateCard').querySelectorAll('input').forEach(input => input.disabled = false);
    }
  }
  function guardForm() {
    const form = $('candidateForm');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      const state = getState(todayKey());
      if (state.mode !== 'exam') {
        event.preventDefault();
        event.stopImmediatePropagation();
        alert(`Candidate examination केवल scheduled Sunday (${fmt(state.exam.date)}) को खुलेगा.`);
      }
    }, true);
  }
  function init() {
    injectStyle();
    renderBanner();
    guardForm();
    setInterval(renderBanner, 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
