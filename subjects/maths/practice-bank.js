(function(){
'use strict';

const q=(chapterId,difficulty,question,options,answer,explanation,example)=>({chapterId,chapterTitle:'',difficulty,question,options,answer,explanation,example});

const bank=[
// Chapter 1 — Large numbers
q(1,'EASY','7,05,004 में 5 का place value क्या है?',['5','500','5,000','50,000'],2,'5 हजार के स्थान पर है, इसलिए उसका place value 5,000 है।','7,05,004 = 7 लाख + 5 हजार + 4।'),
q(1,'EASY','“आठ लाख तीन हजार बारह” का सही रूप कौन-सा है?',['8,30,12','8,03,012','8,00,312','80,03,12'],1,'आठ लाख = 8,00,000, तीन हजार = 3,000 और बारह = 12; इसलिए 8,03,012।','बीच के खाली places में zero रखना जरूरी है।'),
q(1,'MEDIUM','4,32,105 का expanded form क्या है?',['4,00,000 + 30,000 + 2,000 + 100 + 5','4,00,000 + 3,000 + 200 + 10 + 5','4,00,000 + 32,000 + 105','4,32,000 + 105'],0,'हर digit को उसके place value के अनुसार अलग करते हैं।','Expanded form number की structure जल्दी दिखाता है।'),
q(1,'HARD','कौन-सी संख्या बड़ी है?',['8,75,000','8,57,000','दोनों बराबर','निर्धारित नहीं'],0,'दोनों में digits की संख्या समान है; सबसे बाएँ difference 7 और 5 में है, इसलिए 8,75,000 बड़ी है।','पहले highest place compare करना सबसे तेज तरीका है।'),
q(1,'HOTS','1 crore के बराबर international system में क्या होगा?',['1 million','10 million','100 million','1 billion'],1,'1 crore = 10,000,000 = 10 million।','Value वही रहती है, केवल naming system बदलता है।'),

// Chapter 2 — Arithmetic expressions
q(2,'EASY','9 + 4 × 2 का मान क्या है?',['26','17','18','22'],1,'पहले multiplication: 4 × 2 = 8; फिर 9 + 8 = 17।','Priority को follow करने से expression का सही अर्थ मिलता है।'),
q(2,'EASY','5 × (7 − 3) का उत्तर क्या है?',['17','20','35','10'],1,'Bracket पहले: 7 − 3 = 4; फिर 5 × 4 = 20।','Bracket calculation का order बदल सकता है।'),
q(2,'MEDIUM','48 ÷ 6 × 3 को left-to-right करने पर क्या मिलेगा?',['2','8','24','18'],2,'÷ और × की समान priority है; 48 ÷ 6 = 8, फिर 8 × 3 = 24।','समान priority में left-to-right नियम उपयोगी है।'),
q(2,'HARD','50 − 4 × (6 + 2) का मान क्या है?',['18','42','368','14'],0,'पहले 6+2=8, फिर 4×8=32 और अंत में 50−32=18।','Long expression को छोटे verified steps में हल करना सुरक्षित है।'),
q(2,'HOTS','एक छात्र ने 36 ÷ 6 + 4 × 2 = 10 लिखा। सही answer क्या है?',['10','12','14','16'],2,'36 ÷ 6 = 6 और 4 × 2 = 8; फिर 6 + 8 = 14।','Estimate और operation priority दोनों answer check करने में मदद करते हैं।'),

// Chapter 3 — Decimals
q(3,'EASY','0.7 में 7 किस place पर है?',['ones','tenths','hundredths','thousandths'],1,'दशमलव के बाद पहला place tenths होता है।','0.7 = 7/10।'),
q(3,'EASY','3.5 + 1.2 कितना है?',['4.7','4.5','3.7','5.7'],0,'दशमलव places align करके 3.5 + 1.2 = 4.7।','₹3.50 + ₹1.20 = ₹4.70 जैसा सोच सकते हो।'),
q(3,'MEDIUM','4.08 में 8 का place value क्या है?',['8','0.8','0.08','0.008'],2,'8 hundredths place पर है, इसलिए 0.08।','4.08 = 4 + 8/100।'),
q(3,'HARD','कौन बड़ा है?',['2.45','2.405','बराबर','कह नहीं सकते'],0,'दोनों को 2.450 और 2.405 लिखकर compare करो; 450 thousandths > 405 thousandths।','Trailing zero value नहीं बदलता।'),
q(3,'HOTS','एक ribbon 5.6 m की है। उसमें से 2.75 m काट दी गई। कितना बचा?',['2.85 m','3.15 m','3.85 m','2.75 m'],0,'5.60 − 2.75 = 2.85 m।','दशमलव places को एक के नीचे एक रखने से subtraction आसान होता है।'),

// Chapter 4 — Algebraic/letter expressions
q(4,'EASY','यदि x = 5 है, तो x + 3 कितना होगा?',['2','8','15','53'],1,'x की जगह 5 रखने पर 5 + 3 = 8।','Variable एक unknown या बदलने वाली quantity को दिखा सकता है।'),
q(4,'EASY','2a का अर्थ क्या है?',['2 + a','a − 2','2 × a','a ÷ 2'],2,'2a का मतलब 2 × a है।','4a = 4 × a भी इसी notation का उदाहरण है।'),
q(4,'MEDIUM','यदि y = 4 है, तो 3y + 2 का मान क्या है?',['10','12','14','18'],2,'3 × 4 + 2 = 12 + 2 = 14।','पहले variable का value substitute करो।'),
q(4,'HARD','कौन-सा expression “किसी संख्या n से 7 अधिक” बताता है?',['7n','n − 7','n + 7','7 − n'],2,'किसी संख्या से अधिक का अर्थ उसमें जोड़ना है: n + 7।','शब्दों से operation पहचानना algebraic reasoning का हिस्सा है।'),
q(4,'HOTS','a = 3 और b = 5 हों तो 2a + b का मान क्या है?',['10','11','13','16'],2,'2(3)+5 = 6+5 = 11।','हर variable की सही value substitute करना जरूरी है।'),

// Chapter 5 — Lines and intersections
q(5,'EASY','जो दो रेखाएँ कभी नहीं मिलतीं उन्हें क्या कहते हैं?',['intersecting lines','parallel lines','curved lines','closed lines'],1,'एक ही plane में कभी न मिलने वाली रेखाएँ parallel होती हैं।','रेल की दो सीधी पटरी parallel lines का अच्छा model हैं।'),
q(5,'EASY','दो रेखाएँ एक बिंदु पर मिलें तो वे कैसी रेखाएँ हैं?',['parallel','intersecting','equal','vertical only'],1,'एक common point पर मिलने वाली रेखाएँ intersecting lines कहलाती हैं।','दो सड़कें एक junction पर मिलें तो वे intersect करती हैं।'),
q(5,'MEDIUM','दो intersecting lines कितने angles बना सकती हैं?',['1','2','3','4'],3,'दो straight lines के intersection पर चार angles बनते हैं।','Cross shape (+) इसका simple visual model है।'),
q(5,'HARD','यदि एक angle 70° है और उसके adjacent linear-pair angle को देख रहे हैं, तो वह कितना होगा?',['70°','90°','110°','180°'],2,'Linear pair के angles का योग 180° होता है: 180−70=110°।','सीधी line पर बने adjacent angles का योग 180° होता है।'),
q(5,'HOTS','दो lines एक-दूसरे को नहीं काटतीं और उनकी direction समान रहती है। सबसे सही description?',['intersecting','parallel','perpendicular','curved'],1,'समान direction में न मिलने वाली straight lines parallel होती हैं।','एक notebook की opposite ruled lines इसका सरल model हैं।'),

// Chapter 6 — Number games
q(6,'EASY','अगली संख्या क्या होगी? 2, 4, 6, 8, __',['9','10','11','12'],1,'हर बार 2 जोड़ा जा रहा है, इसलिए अगली संख्या 10 है।','Even-number pattern में लगातार 2 का difference मिलता है।'),
q(6,'EASY','15 के बाद 5 के multiples में अगली संख्या कौन-सी है?',['18','20','21','25'],1,'5 के multiples: 5,10,15,20… इसलिए 20।','Multiples किसी number को 1,2,3… से गुणा करके मिलते हैं।'),
q(6,'MEDIUM','कौन-सी संख्या 3 और 4 दोनों से divisible है?',['14','18','24','26'],2,'24 ÷ 3 = 8 और 24 ÷ 4 = 6, इसलिए 24 दोनों से divisible है।','Divisibility को actual division से verify कर सकते हैं।'),
q(6,'HARD','एक pattern है 3, 6, 12, 24, __। अगली संख्या?',['30','36','42','48'],3,'हर term पिछली संख्या का 2 गुना है; 24 × 2 = 48।','Pattern पहचानने से sequence reasoning आसान होती है।'),
q(6,'HOTS','एक संख्या 5 से divisible है और 3 से भी divisible है। निम्न में सबसे छोटी positive option कौन-सी है?',['10','12','15','25'],2,'3 और 5 दोनों के common multiple में सबसे छोटी listed संख्या 15 है।','15 ÷ 3 = 5 और 15 ÷ 5 = 3।'),

// Chapter 7 — Intersecting lines / angles
q(7,'EASY','दो रेखाओं के crossing point को क्या कह सकते हैं?',['endpoint','point of intersection','midpoint','radius'],1,'जहाँ दो रेखाएँ मिलती/कटती हैं उसे point of intersection कहा जाता है।','Crossing roads एक real-life example हैं।'),
q(7,'EASY','90° का angle कैसा होता है?',['acute','right','obtuse','straight'],1,'90° को right angle कहते हैं।','किताब के कोने पर लगभग right angle दिखता है।'),
q(7,'MEDIUM','60° किस प्रकार का angle है?',['acute','right','obtuse','straight'],0,'90° से छोटा और 0° से बड़ा angle acute होता है।','60° < 90°, इसलिए यह acute है।'),
q(7,'HARD','120° किस प्रकार का angle है?',['acute','right','obtuse','straight'],2,'90° से बड़ा लेकिन 180° से छोटा angle obtuse होता है।','120° एक “wide-open” angle जैसा दिखता है।'),
q(7,'HOTS','यदि तीन lines एक ही point पर intersect करें, तो अधिकतम कितने अलग rays उस point से निकल सकते हैं?',['3','4','5','6'],3,'तीन distinct lines के छह दिशात्मक arms हो सकते हैं, इसलिए 6 rays निकलते हैं।','तीन crossing lines को center से बाहर जाती छह straight arms की तरह देखो।'),

// Chapter 8 — Fractions
q(8,'EASY','3/8 में denominator कौन है?',['3','8','11','1'],1,'Fraction में नीचे की संख्या denominator होती है।','3/8 का मतलब whole को 8 बराबर parts में बाँटकर 3 लेना है।'),
q(8,'EASY','2/5 + 1/5 कितना है?',['3/10','2/5','3/5','1/5'],2,'Denominator समान है, इसलिए numerators जोड़ते हैं: 2+1=3 और denominator 5 रहता है।','पाँच equal pieces में 2 + 1 pieces = 3 pieces।'),
q(8,'MEDIUM','4/6 का simplest form क्या है?',['2/3','3/4','1/2','4/3'],0,'4 और 6 दोनों को 2 से divide करने पर 2/3 मिलता है।','Equivalent fraction वही quantity दिखाता है।'),
q(8,'HARD','3/4 और 2/3 में कौन बड़ा है?',['3/4','2/3','दोनों बराबर','निर्धारित नहीं'],0,'Common denominator 12: 3/4=9/12 और 2/3=8/12, इसलिए 3/4 बड़ा है।','Equivalent fractions comparison आसान बनाते हैं।'),
q(8,'HOTS','एक cake के 12 बराबर हिस्सों में 8 हिस्से लिए गए। simplest fraction क्या है?',['2/3','3/2','8/12','4/6'],0,'8/12 को 4 से divide करने पर 2/3 मिलता है।','पहले fraction बनाओ: 8/12, फिर simplest form में लाओ।')
];

bank.forEach((item,i)=>{ item.id=`practice-${item.chapterId}-${i}`; item.chapterTitle=`Maths • Chapter ${item.chapterId}`; });

function install(){
 const original=window.MathsExam?.startPractice;
 if(!original)return false;
 const byChapter={};
 bank.forEach(item=>(byChapter[item.chapterId] ||= []).push(item));
 window.MathsExam.startPractice=function(){
   const originals=[];
   for(let i=1;i<=8;i++){
     const target=window[`mathsChapter0${i}`];
     if(!target)continue;
     originals.push([target,target.challenge]);
     target.challenge=byChapter[i]||[];
   }
   try{return original();}
   finally{originals.forEach(([target,old])=>{target.challenge=old;});}
 };
 window.MathsPracticeBank=bank;
 return true;
}
if(!install()) window.addEventListener('load',install,{once:true});
})();
