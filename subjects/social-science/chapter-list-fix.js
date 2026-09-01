// Reliable chapter navigation: the selector must never depend on lesson-detail scripts.
(function(){
  const list = [
    ['पृथ्वी पर स्थानों का पता लगाना','भूगोल'],['महासागर और महाद्वीप','भूगोल'],['स्थलरूप और जीवन','भूगोल'],['इतिहास की समयरेखा और स्रोत','इतिहास'],['भारत की सांस्कृतिक जड़ें','इतिहास'],['विविधता और समुदाय','नागरिक शास्त्र'],['हमारा स्थानीय प्रशासन','नागरिक शास्त्र'],['जीविका और आर्थिक गतिविधियाँ','अर्थशास्त्र'],['भारत और उसके पड़ोसी','भूगोल'],['प्रारंभिक नगर और व्यापार','इतिहास'],['स्मारक और विरासत','इतिहास'],['लोकतंत्र और नागरिक जिम्मेदारी','नागरिक शास्त्र'],['प्राकृतिक संसाधन और संरक्षण','भूगोल'],['हमारा साझा भविष्य','समेकित सामाजिक विज्ञान']
  ];
  const box=document.getElementById('toc'); if(!box)return;
  const current=Number(new URLSearchParams(location.search).get('chapter'))||1;
  box.innerHTML=list.map((x,i)=>{const n=i+1;return `<a class="${n===current?'active':''}" href="chapter.html?chapter=${n}" aria-current="${n===current?'page':'false'}"><b>${n}.</b> ${x[0]}</a>`}).join('');
})();