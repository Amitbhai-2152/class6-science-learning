window.bindDirectAITutor=()=>{
  const T=window.Tutor,AI=window.AITutorClient;
  if(!T||!AI||T.__directAI)return false;
  T.__directAI=true;T.__history=[];
  T.send=async function(qOverride){
    const input=document.getElementById('chatInput');
    const q=String(qOverride||input?.value||'').trim();
    if(!q)return;
    if(input)input.value='';
    this.add(q,'user');this.updateContext();this.setTyping(true);
    const c=this.current(),s=this.currentSection();
    this.__history.push({role:'user',content:q});
    try{
      const answer=await AI.ask({messages:this.__history.slice(-8),subject:'Science',chapter:c?.title||'',section:s?.title||''});
      this.__history.push({role:'assistant',content:answer});this.add(answer,'bot');
    }catch(err){
      this.__history.pop();
      console.error('Direct AI Tutor error:',err);
      this.add('⚠️ AI Tutor से अभी उत्तर नहीं मिल पाया। Backend/OpenAI connection check करें।','bot');
    }finally{this.setTyping(false)}
  };
  return true;
};
(function bootDirectAI(){
  const tryBind=()=>{if(window.bindDirectAITutor?.())return;setTimeout(tryBind,100)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryBind,{once:true});
  else tryBind();
})();
