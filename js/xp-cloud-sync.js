(() => {
  'use strict';

  const XP_KEY = 'class6XPSystemV1';
  const STATE_VERSION = 2;
  const ACTIVITY_SOURCE = 'xp-system-v2';
  const MAX_ACTIVITY_DAYS = 400;
  const USER_RETRY_DELAYS = [0, 800, 2000, 4000];
  let syncPromise = null;
  let retryTimer = null;
  let queuedSyncTimer = null;
  let rerunAfterSync = false;

  function clone(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return value; }
  }
  function dayKey(value) {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function normalizeState(input) {
    const fallback = {version:STATE_VERSION,total:0,subjects:{science:0,maths:0,english:0,hindi:0,gk:0,social:0,revision:0},events:[],daily:{date:'',earned:0},activeDays:[],activitySource:ACTIVITY_SOURCE,legacySeeded:false};
    const x = input && typeof input === 'object' ? input : {};
    const subjects = Object.assign({}, fallback.subjects, x.subjects || {});
    Object.keys(subjects).forEach((key) => { subjects[key] = Math.max(0, Math.round(Number(subjects[key]) || 0)); });
    const events = Array.isArray(x.events) ? x.events.filter(Boolean).slice(0, 500) : [];
    const eventDays = events.map((event) => dayKey(event?.at)).filter(Boolean);
    const activeDays = [...new Set([...(Array.isArray(x.activeDays) ? x.activeDays : []).map(dayKey).filter(Boolean), ...eventDays])].sort().slice(-MAX_ACTIVITY_DAYS);
    return Object.assign({}, fallback, x, {version:STATE_VERSION,subjects,events,activeDays,activitySource:ACTIVITY_SOURCE,total:Object.values(subjects).reduce((sum,value)=>sum+value,0),daily:x.daily&&typeof x.daily==='object'?Object.assign({},fallback.daily,x.daily):fallback.daily});
  }
  function migrateState(input) {
    const x = input && typeof input === 'object' ? input : {};
    if (Number(x.version) === STATE_VERSION) return normalizeState(x);
    if (Number(x.version) === 1 || !Number.isFinite(Number(x.version))) return normalizeState(x);
    return normalizeState({});
  }
  function mergeStates(localState, cloudState) {
    const local = migrateState(localState), remote = migrateState(cloudState), merged = clone(local);
    Object.keys(merged.subjects).forEach((subject) => { merged.subjects[subject] = Math.max(local.subjects[subject] || 0, remote.subjects[subject] || 0); });
    const seen = new Set(), combined = [];
    [...(local.events || []), ...(remote.events || [])].forEach((event) => {
      const key = String(event?.key || `${event?.subject || ''}|${event?.action || ''}|${event?.content || ''}|${event?.at || ''}`);
      if (seen.has(key)) return;
      seen.add(key); combined.push(event);
    });
    combined.sort((a,b)=>String(b?.at||'').localeCompare(String(a?.at||'')));
    merged.events = combined.slice(0,500);
    merged.activeDays = [...new Set([...(local.activeDays||[]),...(remote.activeDays||[]),...merged.events.map(e=>dayKey(e?.at)).filter(Boolean)])].sort().slice(-MAX_ACTIVITY_DAYS);
    const ld=local.daily||{}, rd=remote.daily||{};
    merged.daily = String(ld.date||'')===String(rd.date||'') ? {date:String(ld.date||rd.date||''),earned:Math.max(Number(ld.earned)||0,Number(rd.earned)||0)} : (String(ld.date||'')>String(rd.date||'')?ld:rd);
    merged.version=STATE_VERSION; merged.activitySource=ACTIVITY_SOURCE; merged.legacySeeded=Boolean(local.legacySeeded||remote.legacySeeded);
    return merged;
  }
  async function getUserWithRetries() {
    for(let i=0;i<USER_RETRY_DELAYS.length;i+=1){
      const delay=USER_RETRY_DELAYS[i]; if(delay) await new Promise(r=>window.setTimeout(r,delay));
      try { const user=await window.Class6CloudSync.getUser(); if(user) return user; }
      catch(error){ if(i===USER_RETRY_DELAYS.length-1) throw error; }
    }
    return null;
  }
  function scheduleRetry(delay=2500){
    if(retryTimer) return;
    retryTimer=window.setTimeout(()=>{retryTimer=null; requestSync(0);},delay);
  }
  function requestSync(delay=150){
    if(syncPromise){ rerunAfterSync=true; return syncPromise; }
    if(queuedSyncTimer) return;
    queuedSyncTimer=window.setTimeout(()=>{queuedSyncTimer=null; sync();},Math.max(0,Number(delay)||0));
  }
  async function sync(){
    if(syncPromise) { rerunAfterSync=true; return syncPromise; }
    syncPromise=(async()=>{
      try{
        if(!window.Class6CloudSync?.configured?.()) return {synced:false,reason:'not_configured'};
        if(!window.XPSystem?.read||!window.XPSystem?.save) return {synced:false,reason:'xp_system_unavailable'};
        const user=await getUserWithRetries();
        if(!user){scheduleRetry(2500);return {synced:false,reason:'not_signed_in'};}
        const scope=window.Class6CloudSync.prepareUser?.(user.id)||{changed:false};
        const row=await window.Class6CloudSync.load();
        const merged=scope.changed
          ? migrateState(row?.state||{})
          : mergeStates(clone(window.XPSystem.read()),row?.state||{});
        window.XPSystem.save(merged);
        const result=await window.Class6CloudSync.save(merged,STATE_VERSION);
        if(result?.synced){
          window.dispatchEvent(new CustomEvent('class6:xp-cloud-synced',{detail:{userId:user.id,version:STATE_VERSION,total:merged.total,subjects:Object.assign({},merged.subjects),activeDays:merged.activeDays.length}}));
        } else if(result?.reason==='not_signed_in') scheduleRetry(2500);
        return result;
      }catch(error){
        console.error('Class 6 XP cloud sync failed:',error); scheduleRetry(2500);
        return {synced:false,reason:'sync_error',error:String(error?.message||error)};
      }finally{
        syncPromise=null;
        if(rerunAfterSync){
          rerunAfterSync=false;
          window.setTimeout(()=>requestSync(0),0);
        }
      }
    })();
    return syncPromise;
  }

  window.Class6XPCloudSync=Object.freeze({sync,requestSync,mergeStates,migrateState,normalizeState,XP_KEY,STATE_VERSION,ACTIVITY_SOURCE});

  document.addEventListener('DOMContentLoaded',()=>requestSync(0),{once:true});
  window.addEventListener('pageshow',()=>requestSync(0));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible') requestSync(100);});
  window.addEventListener('xp:earned',()=>requestSync(150));
  window.addEventListener('xp:activity',()=>requestSync(150));
  window.addEventListener('storage',(event)=>{if(!event||event.key===XP_KEY) requestSync(250);});

  window.Class6CloudSync?.getClient?.().then(client=>{
    client?.auth?.onAuthStateChange?.(event=>{
      if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='USER_UPDATED'||event==='INITIAL_SESSION') requestSync(0);
    });
  }).catch(()=>{});
})();