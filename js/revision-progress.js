(function(){
'use strict';
const subject=document.body.dataset.revisionSubject||location.pathname.split('revision-v2-')[1]?.replace('.html','')||'science';
const chapters=[...document.querySelectorAll('details.chapter')];
if(!chapters.length)return;
const store='revision-v3-'+subject+'-done';
function read(){try{return JSON.parse(localStorage.getItem(store)||'{}')}catch(e){return {}}}
function write(d){localStorage.setItem(store,JSON.stringify(d))}
const done=read();
const summary=document.createElement('div');summary.style.cssText='margin:14px 0;padding:12px 15px;border:1px solid #dfe5eb;border-radius:14px;background:#fff;font:800 13px system-ui;color:#667085';
const update=()=>{summary.textContent=`✅ Completed: ${Object.values(done).filter(Boolean).length} / ${chapters.length} chapters`};
chapters.forEach((chapter,i)=>{
 const box=document.createElement('div');box.style.cssText='padding:0 12px 14px';
 const btn=document.createElement('button');btn.type='button';btn.style.cssText='width:100%;min-height:44px;border:0;border-radius:12px;background:#20252b;color:#fff;font:800 14px system-ui;cursor:pointer;touch-action:manipulation';
 const refresh=()=>{btn.textContent=done[i]?'✓ Chapter completed':'Mark chapter complete'};refresh();
 btn.addEventListener('click',()=>{done[i]=!done[i];write(done);refresh();update()});box.appendChild(btn);chapter.appendChild(box);
});
const grid=chapters[0].parentElement;grid.parentElement.insertBefore(summary,grid);update();
})();