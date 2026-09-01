(function(){
  'use strict';
  function boot(){
    const T=window.Tutor, AI=window.AITutorClient;
    if(!T||!AI){setTimeout(boot,100);return;}
    if(T.__forceAI)return;
    T.__forceAI=true;
    T.__aiHistory=[];

    function context(){
      const c=window.CHAPTERS?.[window.currentChapter-1];
      const s=c?.sections?.[window._part];
      return {subject:'Science',chapter:c?.title||'',section:s?.title||''};
    }

    T.send=async function(qOverride){
      const input=document.getElementById('chatInput');
      const q=String(qOverride||input?.value||'').trim();
      if(!q)return;
      if(input)input.value='';
      this.add(q,'user');
      this.updateContext?.();
      this.setTyping?.(true);
      this.__aiHistory.push({role:'user',content:q});
      try{
        const ctx=context();
        const answer=await AI.ask({messages:this.__aiHistory.slice(-8),...ctx});
        this.__aiHistory.push({role:'assistant',content:answer});
        this.add(answer,'bot');
      }catch(err){
        this.__aiHistory.pop();
        console.error('Force AI Tutor error:',err);
        this.add('⚠️ AI Tutor connection failed. Please check the Render backend and OpenAI API configuration.','bot');
      }finally{this.setTyping?.(false)}
    };

    window.sendMessage=function(){return T.send();};
    window.tutorQuick=function(mode){
      const prompts={
        explain:'इस concept को आसान भाषा में समझाओ',
        example:'एक आसान real-life example दो',
        hint:'मुझे एक hint दो',
        quiz:'मुझसे एक practice question पूछो',
        exam:'इस topic का exam tip दो'
      };
      return T.send(prompts[mode]||'इस topic को समझने में मेरी मदद करो');
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
