window.MATHS_SUPPORT={
  hintSteps:[
    {level:1,label:'💡 संकेत',text:'पहले प्रश्न में दिए गए numbers, symbols और units को अलग-अलग पहचानो।'},
    {level:2,label:'🧭 अगला कदम',text:'अब उस operation या relation को चुनो जो सवाल के शब्दों से सीधे जुड़ा है।'},
    {level:3,label:'🪜 मजबूत संकेत',text:'एक छोटा intermediate step लिखो। अंतिम answer अभी मत देखो; अपने step को check करो।'}
  ],
  analyze(input){
    const s=String(input??'').trim();
    const issues=[];
    if(!s) issues.push({type:'missing',title:'उत्तर नहीं दिया गया',advice:'पहले अपना उत्तर या पहला step लिखो।'});
    if(/×|\*/.test(s) && /\+|\-/.test(s) && /(left|priority|पहले|क्रम)/i.test(s)) issues.push({type:'operation-order',title:'संक्रिया क्रम जाँचो',advice:'Bracket के बाद ×/÷ और फिर +/− देखो; समान priority में left-to-right चलो।'});
    if(/\.\d{2,}/.test(s) || /decimal|दशमलव/i.test(s)) issues.push({type:'place-value',title:'स्थान-मूल्य जाँचो',advice:'Decimal point align करो और tenths, hundredths जैसी places को compare करो।'});
    if(/\//.test(s)) issues.push({type:'fraction',title:'अंश–हर जाँचो',advice:'अंश ऊपर और हर नीचे पढ़ो; समान हर होने पर numerators पर operation करो।'});
    if(/x|y|n/i.test(s)) issues.push({type:'variable',title:'Variable का मान जाँचो',advice:'पहले variable की दी हुई value substitute करो; फिर multiplication और बाकी operations करो।'});
    if(/\d+[a-zA-Z]|[a-zA-Z]\d/.test(s) && !/[×*]/.test(s)) issues.push({type:'implicit-multiply',title:'गुणा छिपा हो सकता है',advice:'3x का अर्थ 3 × x है, 3 + x नहीं।'});
    if(/,/ .test(s)) issues.push({type:'number-format',title:'अंक-समूह जाँचो',advice:'Indian और international comma grouping को mix मत करो।'});
    return issues;
  },
  feedback({correct=false, mistakeType=null, nextStep=''}={}){
    if(correct) return {title:'✅ अच्छा काम!',body:'तुम्हारा उत्तर सही है। अब एक बार reasoning भी बोलकर/लिखकर check करो।'};
    const map={
      'arithmetic-error':{title:'🔢 Arithmetic error',body:'Method सही हो सकती है, लेकिन calculation में छोटी गलती हुई है। पिछला step दोबारा calculate करो।'},
      'sign-error':{title:'➕➖ Sign error',body:'+ और − के चिन्ह को original question से मिलाओ। एक sign बदलने से पूरा result बदल सकता है।'},
      'place-value':{title:'📍 Place-value error',body:'अंकों की position जाँचो। खासकर decimals और बड़े numbers में digit की जगह बहुत महत्वपूर्ण है।'},
      'operation-choice':{title:'🧩 Operation-choice error',body:'पहले पूछो: question में quantity जोड़नी है, घटानी है, गुणा करनी है या बराबर हिस्सों में बाँटना है?'},
      'reasoning-error':{title:'🧠 Reasoning error',body:'Calculation शुरू करने से पहले given information और required quantity को दोबारा जोड़ो।'},
      'fraction':{title:'🍕 Fraction mistake',body:'अंश और हर की roles जाँचो। Unequal denominators को सीधे जोड़ना/घटाना सही नहीं होता।'}
    };
    const base=map[mistakeType]||{title:'🔍 एक बार फिर जाँचो',body:'अपने पिछले step को देखो और वह पहला स्थान खोजो जहाँ result expected pattern से अलग हुआ।'};
    return {...base,nextStep:nextStep||'अगला छोटा step लिखकर फिर जाँचो।'};
  }
};
