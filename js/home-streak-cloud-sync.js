(() => {
  'use strict';

  let syncPromise = null;
  let retryTimer = null;
  let cloudResolved = false;
  let rerunAfterSync = false;
  const MAX_ACTIVITY_DAYS = 400;
  const USER_RETRY_DELAYS = [0, 800, 2000, 4000];

  function setPending(force=false){
    if(!window.Class6CloudSync?.configured?.()) return false;
    if(cloudResolved&&!force) return false;
    document.documentElement.dataset.streakCloudPending='1';
    ['streakMini','homeStreak'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='…';});
    return true;
  }
  function clearPending(){delete document.documentElement.dataset.streakCloudPending;}
  function markCloudResolved(){cloudResolved=true;document.documentElement.dataset.streakCloudResolved='1';clearPending();}
  function markAwaitingCloud(){cloudResolved=false;delete document.documentElement.dataset.streakCloudResolved;setPending(true);}
  setPending();

  const dayKey=value=>{const d=value instanceof Date?new Date(value.getTime()):new Date(value);if(Number.isNaN(d.getTime()))return null;return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const normalize=input=>{const x=input&&typeof input==='object'?input:{};return{activeDays:Array.isArray(x.activeDays)?[...new Set(x.activeDays.map(dayKey).filter(Boolean))].sort().slice(-MAX_ACTIVITY_DAYS):[]};};
  function activityFromLocal(){try{const xp=window.XPSystem?.read?.()||{},days=new Set();(xp.activeDays||[]).forEach(v=>{const d=dayKey(v);if(d)days.add(d);});(xp.events||[]).forEach(e=>{const d=dayKey(e?.at);if(d)days.add(d);});return normalize({activeDays:[...days]});}catch(_){return{activeDays:[]};}}
  function activityFromCloud(state){const s=state&&typeof state==='object'?state:{},ss=s.streakState&&typeof s.streakState==='object'?s.streakState:{},days=[...(s.activeDays||[]),...(ss.activeDays||[])];return normalize({activeDays:days});}
  function merge(local,cloud){return{activeDays:[...new Set([...(normalize(local).activeDays||[]),...(normalize(cloud).activeDays||[])])].sort().slice(-MAX_ACTIVITY_DAYS)};}
  function calculateStreak(activeDays){const days=new Set(normalize({activeDays}).activeDays);let cursor=new Date(),streak=0;while(days.has(dayKey(cursor))){streak++;cursor.setDate(cursor.getDate()-1);}return{streak,lastActive:[...days].at(-1)||null};}
  async function getUserWithRetries(){for(let i=0;i<USER_RETRY_DELAYS.length;i+=1){const delay=USER_RETRY_DELAYS[i];if(delay)await new Promise(r=>window.setTimeout(r,delay));try{const user=await window.Class6CloudSync.getUser();if(user)return user;}catch(error){if(i===USER_RETRY_DELAYS.length-1)throw error;}}return null;}
  function scheduleRetry(delay=2000){if(retryTimer)return;retryTimer=window.setTimeout(()=>{retryTimer=null;sync();},delay);}

  async function sync(){
    if(syncPromise){rerunAfterSync=true;return syncPromise;}
    syncPromise=(async()=>{
      try{
        if(!window.Class6CloudSync?.configured?.()){markCloudResolved();window.HomeStreak?.refresh?.();return{synced:false,reason:'not_configured'};}
        setPending();
        const user=await getUserWithRetries();
        if(!user){markCloudResolved();window.HomeStreak?.refresh?.();return{synced:false,reason:'not_signed_in'};}
        const scope=window.Class6CloudSync.prepareUser?.(user.id)||{changed:false};
        const row=await window.Class6CloudSync.load();
        const cloud=activityFromCloud(row?.state||{});
        const local=scope.changed?{activeDays:[]}:activityFromLocal();
        const latestLocal=scope.changed?{activeDays:[]}:activityFromLocal();
        const mergedDays=merge(latestLocal,cloud),derived=calculateStreak(mergedDays.activeDays),merged={activeDays:mergedDays.activeDays,streak:derived.streak,lastActive:derived.lastActive};
        const current=window.XPSystem?.read?.();
        let result={synced:false};
        if(current&&window.XPSystem?.save){
          window.XPSystem.save(Object.assign({},current,{activeDays:merged.activeDays,streakState:merged}));
          result=await window.Class6CloudSync.save(window.XPSystem.read(),1);
        }else result=await window.Class6CloudSync.save({activeDays:merged.activeDays,streakState:merged},1);
        window.dispatchEvent(new CustomEvent('class6:streak-cloud-synced',{detail:{userId:user.id,streak:merged.streak,lastActive:merged.lastActive,activeDays:merged.activeDays,synced:result?.synced===true}}));
        markCloudResolved();window.HomeStreak?.refresh?.();
        return{synced:result?.synced===true,streak:merged.streak,activeDays:merged.activeDays};
      }catch(error){console.error('Class 6 streak cloud sync failed:',error);if(!cloudResolved)setPending(true);scheduleRetry(2000);return{synced:false,reason:'sync_error',error:String(error?.message||error)};}
      finally{syncPromise=null;if(rerunAfterSync){rerunAfterSync=false;window.setTimeout(()=>sync(),0);}}
    })();
    return syncPromise;
  }

  window.Class6StreakCloudSync=Object.freeze({sync,merge,calculateStreak,activityFromLocal,activityFromCloud});
  document.addEventListener('DOMContentLoaded',()=>sync(),{once:true});
  window.addEventListener('pageshow',()=>sync());
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync();});
  window.addEventListener('xp:earned',()=>sync());
  window.addEventListener('xp:activity',()=>sync());
  window.Class6CloudSync?.getClient?.().then(client=>{client?.auth?.onAuthStateChange?.(event=>{if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='USER_UPDATED'||event==='INITIAL_SESSION')markAwaitingCloud();sync();});}).catch(()=>{});
})();