(function(){'use strict';
function text(x){return String(x||'').toLowerCase()}
function build(query){const q=text(query);const chunks=[];
const chapters=Array.isArray(window.ENGLISH_CHAPTERS)?window.ENGLISH_CHAPTERS:[];
chapters.forEach(c=>(c.sections||[]).forEach(s=>{const hay=text([c.title,s[0],s[1],s[2]].join(' '));if(hay&&q.split(/\s+/).some(w=>w.length>2&&hay.includes(w)))chunks.push(`Chapter: ${c.title}\nLesson: ${s[0]}\nRule: ${s[1]}\nExample: ${s[2]}`)}));
const tb=Array.isArray(window.TRANSLATION_BANK)?window.TRANSLATION_BANK:[];tb.forEach(x=>{const hay=text([x.type,x.prompt,x.hint,x.explanation].join(' '));if(q.split(/\s+/).some(w=>w.length>2&&hay.includes(w)))chunks.push(`Translation topic: ${x.type}\nHint: ${x.hint}\nExplanation: ${x.explanation}`)});
const eb=Array.isArray(window.ENGLISH_ERROR_BANK)?window.ENGLISH_ERROR_BANK:[];eb.forEach(x=>{const hay=text([x.q,x.e].join(' '));if(q.split(/\s+/).some(w=>w.length>2&&hay.includes(w)))chunks.push(`Error-correction rule: ${x.e}`)});
return [...new Set(chunks)].slice(0,5).join('\n\n')}
window.EnglishTutorContext={build};
})();
