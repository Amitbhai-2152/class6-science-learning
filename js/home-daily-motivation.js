(function(){
'use strict';
const lines=[
'🌱 हर दिन थोड़ा सीखो — छोटी progress भी बड़ी जीत बनती है।',
'🚀 आज का एक छोटा कदम, कल की बड़ी सफलता की शुरुआत है।',
'🧠 समझकर पढ़ो, सिर्फ याद मत करो — यही असली learning है।',
'🎯 आज एक concept पूरा करो और अपनी streak को आगे बढ़ाओ।',
'💡 सवाल पूछना कमजोरी नहीं, smart learner की पहचान है।',
'⚡ Consistency तुम्हारी superpower है — आज की पढ़ाई मत छोड़ो।',
'🏆 हर सही answer तुम्हें तुम्हारे अगले level के करीब ले जाता है।'
];
function render(){const el=document.getElementById('dailyMotivation');if(!el)return;const d=new Date(),idx=(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000|0)%lines.length;el.textContent=lines[(idx+lines.length)%lines.length]}
window.addEventListener('DOMContentLoaded',render);
window.addEventListener('load',render);
})();
