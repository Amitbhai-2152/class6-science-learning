(function(){
'use strict';
if(window.__chapterCompletionSyncLoaded)return;
window.__chapterCompletionSyncLoaded=true;
const KEY_PREFIX='class6ChapterClearedV1:';
const DATE_PREFIX='class6ChapterCompletedAtV1:';
const SCORE_PREFIX='class6ChapterScoreV1:';
const META_KEY='class6ChapterCompletionsV1';
let client=null;
let syncing=false;
function cfg(){return window.CLASS6_AUTH_CONFIG||{}}
function configured(){const c=cfg();return Boolean(String(c.url||'').trim()&&String(c.anonKey||'').trim())}
function localCompletions(){
  const out={};
  try{
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i)||'';
      if(!k.startsWith(KEY_PREFIX)||localStorage.getItem(k)!=='1')continue;
      const rest=k.slice(KEY_PREFIX.length),p=rest.lastIndexOf(':');
      if(p<1)continue;
      const subject=rest.slice(0,p),id=rest.slice(p+1);
      out[`${subject}:${id}`]={subject,id,at:Number(localStorage.getItem(DATE_PREFIX+subject+':'+id)||0),score:localStorage.getItem(SCORE_PREFIX+subject+':'+id)||''};
    }
  }catch(_){}
  return out;
}
function applyLocal(records){
  if(!records||typeof records!=='object')return;
  try{Object.values(records).forEach(r=>{const subject=String(r?.subject||'').toLowerCase(),id=String(r?.id??'').trim();if(!subject||!id)return;localStorage.setItem(KEY_PREFIX+subject+':'+id,'1');if(r.at)localStorage.setItem(DATE_PREFIX+subject+':'+id,String(r.at));if(r.score)localStorage.setItem(SCORE_PREFIX+subject+':'+id,String(r.score))})}catch(_){}
  window.dispatchEvent(new CustomEvent('chapter:status-synced',{detail:records}));
}
function metaRecords(){
  const raw=localCompletions(),saved={};Object.values(raw).forEach(r=>{saved[`${r.subject}:${r.id}`]=r});return saved;
}
async function getClient(){
  if(client)return client;
  if(!configured())return null;
  const mod=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  client=mod.createClient(String(cfg().url).trim(),String(cfg().anonKey).trim());
  return client;
}
function ensureConfig(){
  if(configured())return Promise.resolve();
  return new Promise(resolve=>{
    const existing=document.querySelector('script[data-class6-auth-config]');
    if(existing){existing.addEventListener('load',resolve,{once:true});setTimeout(resolve,1200);return}
    const s=document.createElement('script');s.src=new URL('./auth-config.js',location.href).href;s.async=false;s.setAttribute('data-class6-auth-config','true');s.onload=()=>resolve();s.onerror=()=>resolve();(document.head||document.documentElement).appendChild(s)
  });
}
async function syncNow(){
  if(syncing)return;
  syncing=true;
  try{
    await ensureConfig();
    const supabase=await getClient();
    if(!supabase)return;
    const {data,error}=await supabase.auth.getSession();
    if(error||!data?.session?.user)return;
    const user=data.session.user;
    const cloudRaw=user.user_metadata?.[META_KEY];
    let cloud={};
    if(Array.isArray(cloudRaw))cloudRaw.forEach(r=>{if(r?.subject&&r?.id)cloud[`${String(r.subject).toLowerCase()}:${String(r.id)}`]=r});
    else if(cloudRaw&&typeof cloudRaw==='object')cloud=cloudRaw;
    const local=metaRecords();
    const merged={...cloud,...local};
    Object.keys(merged).forEach(k=>{
      const c=cloud[k],l=local[k];
      if(c&&l)merged[k]=(Number(l.at||0)>=Number(c.at||0))?l:c;
    });
    applyLocal(merged);
    const payload=Object.values(merged).map(r=>({subject:String(r.subject).toLowerCase(),id:String(r.id),at:Number(r.at||Date.now()),score:String(r.score||'')}));
    const {error:updateError}=await supabase.auth.updateUser({data:{[META_KEY]:payload}});
    if(updateError)console.warn('Chapter completion sync failed:',updateError.message);
    else window.dispatchEvent(new CustomEvent('chapter:sync-complete',{detail:{count:payload.length}}));
    window.addEventListener('chapter:completed',pushCompletion,{once:false});
  }catch(error){console.warn('Chapter completion sync unavailable:',error?.message||error)}
  finally{syncing=false}
}
let pushTimer=0;
async function pushCompletion(event){
  clearTimeout(pushTimer);
  pushTimer=setTimeout(async()=>{
    try{
      await ensureConfig();const supabase=await getClient();if(!supabase)return;
      const {data}=await supabase.auth.getSession();if(!data?.session?.user)return;
      await syncNow();
    }catch(_){}
  },150);
}
window.ChapterCompletionSync={sync:syncNow,local:localCompletions};
ensureConfig().finally(()=>syncNow());
window.addEventListener('load',()=>syncNow(),{once:true});
})();
