'use strict';

/* Single source of truth for the Class 6 Sunday examination cycle. */
window.WEEKLY_EXAM_CONFIG = Object.freeze({
  timeZone: 'Asia/Kolkata',
  previewLeadDays: 7,
  questionCount: 60,
  marks: 60,
  durationMinutes: 90,
  finalDate: '2027-02-28',
  exams: Object.freeze([
    Object.freeze({ n: 1, examDate: '2026-09-13', type: 'Foundation 1', focus: 'Initial chapters + core basics' }),
    Object.freeze({ n: 2, examDate: '2026-09-27', type: 'Foundation 2', focus: 'New chapters + Test 1 revision' }),
    Object.freeze({ n: 3, examDate: '2026-10-11', type: 'Foundation 3', focus: 'New chapters + cumulative revision' }),
    Object.freeze({ n: 4, examDate: '2026-10-25', type: 'Progress 1', focus: 'New learning + mixed practice' }),
    Object.freeze({ n: 5, examDate: '2026-11-08', type: 'Progress 2', focus: 'New learning + previous revision' }),
    Object.freeze({ n: 6, examDate: '2026-11-22', type: 'Monthly Test', focus: 'November syllabus + cumulative revision' }),
    Object.freeze({ n: 7, examDate: '2026-12-06', type: 'Progress 3', focus: 'New learning + weak-topic revision' }),
    Object.freeze({ n: 8, examDate: '2026-12-20', type: 'Half-Yearly Grand', focus: 'Large cumulative syllabus' }),
    Object.freeze({ n: 9, examDate: '2027-01-03', type: 'Progress 4', focus: 'New learning + cumulative revision' }),
    Object.freeze({ n: 10, examDate: '2027-01-17', type: 'Progress 5', focus: 'New learning + mixed practice' }),
    Object.freeze({ n: 11, examDate: '2027-01-31', type: 'Monthly Test', focus: 'January syllabus + cumulative revision' }),
    Object.freeze({ n: 12, examDate: '2027-02-14', type: 'Pre-Final Grand', focus: 'Almost complete syllabus + weak areas' }),
    Object.freeze({ n: 13, examDate: '2027-02-28', type: 'FINAL EXAM', focus: 'Complete Class 6 syllabus' })
  ]),
  previewTitle: 'Sunday Preview + Syllabus',
  examTitle: 'Sunday Candidate Examination'
});

window.WEEKLY_EXAM_UTILS = Object.freeze({
  parseDateKey(key) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key));
    if (!match) throw new Error(`Invalid date key: ${key}`);
    const d = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    if (Number.isNaN(d.getTime())) throw new Error(`Invalid date key: ${key}`);
    return d;
  },
  addDays(key, days) {
    const d = this.parseDateKey(key);
    d.setUTCDate(d.getUTCDate() + Number(days));
    return d.toISOString().slice(0, 10);
  },
  formatKey(key) {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric'
    }).format(this.parseDateKey(key));
  },
  todayKey() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: window.WEEKLY_EXAM_CONFIG.timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const out = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return `${out.year}-${out.month}-${out.day}`;
  },
  validate() {
    const cfg = window.WEEKLY_EXAM_CONFIG;
    const exams = cfg.exams;
    if (!Array.isArray(exams) || exams.length !== 13) throw new Error('Weekly exam plan must contain exactly 13 exams.');
    if (exams.at(-1).examDate !== cfg.finalDate) throw new Error('Final exam date does not match finalDate.');
    const seen = new Set();
    exams.forEach((exam, index) => {
      if (exam.n !== index + 1) throw new Error(`Exam numbering error at T${index + 1}.`);
      if (seen.has(exam.examDate)) throw new Error(`Duplicate exam date: ${exam.examDate}`);
      seen.add(exam.examDate);
      const d = this.parseDateKey(exam.examDate);
      if (d.getUTCDay() !== 0) throw new Error(`Exam T${exam.n} is not scheduled on Sunday.`);
      const preview = this.addDays(exam.examDate, -cfg.previewLeadDays);
      const pd = this.parseDateKey(preview);
      if (pd.getUTCDay() !== 0) throw new Error(`Preview for T${exam.n} is not scheduled on Sunday.`);
      if (index > 0) {
        const previous = exams[index - 1].examDate;
        const gap = (d.getTime() - this.parseDateKey(previous).getTime()) / 86400000;
        if (gap !== 14) throw new Error(`T${exam.n} must be exactly 14 days after the previous exam.`);
      }
    });
    return true;
  },
  getState(today = this.todayKey()) {
    const cfg = window.WEEKLY_EXAM_CONFIG;
    if (!this.validate()) return { mode: 'invalid', exam: cfg.exams[0] };
    const exam = cfg.exams.find(x => x.examDate === today);
    if (exam) return { mode: 'exam', exam };
    const preview = cfg.exams.find(x => this.addDays(x.examDate, -cfg.previewLeadDays) === today);
    if (preview) return { mode: 'preview', exam: preview };
    const upcoming = cfg.exams.find(x => x.examDate > today);
    return upcoming ? { mode: 'prep', exam: upcoming } : { mode: 'closed', exam: cfg.exams.at(-1) };
  },
  getExamId(exam) {
    return `CLASS6-WEEK-${exam.examDate}`;
  }
});

window.WEEKLY_EXAM_UTILS.validate();
