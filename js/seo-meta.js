(function(){
  'use strict';
  if (window.__class6SeoMetaLoaded) return;
  window.__class6SeoMetaLoaded = true;

  const path = location.pathname.replace(/\\/+/g,'/');
  const file = path.split('/').pop() || 'index.html';
  const params = new URLSearchParams(location.search);
  const scriptSrc = document.currentScript?.src || '';
  const siteRoot = scriptSrc ? new URL('../', scriptSrc).href : new URL('./', location.href).href;
  const isHome = file === 'index.html' && !/\/subjects\//.test(path);
  const isAuth = /(^|\/)auth(?:\.html|\/)/.test(path);

  const subjects = {
    science: {name:'Science',hi:'विज्ञान',title:'Class 6 Science | कक्षा 6 विज्ञान Chapter-wise Learning, Practice & Tests',description:'कक्षा 6 विज्ञान के chapter-wise lessons, आसान explanations, practice questions, quizzes, tests और revision resources।'},
    maths: {name:'Maths',hi:'गणित',title:'Class 6 Maths | कक्षा 6 गणित Chapter-wise Learning, Practice & Tests',description:'कक्षा 6 गणित के chapter-wise concepts, step-by-step examples, practice, challenge questions और tests।'},
    english: {name:'English',hi:'अंग्रेज़ी',title:'Class 6 English | कक्षा 6 अंग्रेज़ी Grammar, Chapters & Practice',description:'कक्षा 6 English के grammar topics, chapter-wise learning, translation, practice questions और tests।'},
    hindi: {name:'Hindi',hi:'हिंदी',title:'Class 6 Hindi | कक्षा 6 हिंदी Grammar, Chapters & Practice',description:'कक्षा 6 हिंदी के grammar, chapter-wise learning, writing practice, questions और tests।'},
    gk: {name:'GK & Reasoning',hi:'सामान्य ज्ञान और रीजनिंग',title:'Class 6 GK & Reasoning | सामान्य ज्ञान, Questions & Challenges',description:'कक्षा 6 GK और Reasoning के topic-wise questions, quizzes, challenges और practice।'},
    'social-science': {name:'Social Science',hi:'सामाजिक विज्ञान',title:'Class 6 Social Science | कक्षा 6 सामाजिक विज्ञान Chapter-wise Learning',description:'कक्षा 6 Social Science के History, Geography और Civics chapters, activities, maps, practice और tests।'}
  };

  function setMeta(name, content){
    if(!content) return;
    let el=document.head.querySelector('meta[name="'+name+'"]');
    if(!el){el=document.createElement('meta');el.name=name;document.head.appendChild(el)}
    el.content=content;
  }
  function setProp(property,content){
    if(!content) return;
    let el=document.head.querySelector('meta[property="'+property+'"]');
    if(!el){el=document.createElement('meta');el.setAttribute('property',property);document.head.appendChild(el)}
    el.content=content;
  }
  function setCanonical(){
    const clean=new URL(location.href);clean.hash='';
    let el=document.head.querySelector('link[rel="canonical"]');
    if(!el){el=document.createElement('link');el.rel='canonical';document.head.appendChild(el)}
    el.href=clean.href;
    return clean.href;
  }
  function addJsonLd(id,data){
    let el=document.getElementById(id);
    if(!el){el=document.createElement('script');el.type='application/ld+json';el.id=id;document.head.appendChild(el)}
    el.textContent=JSON.stringify(data);
  }

  if(isAuth){setMeta('robots','noindex,nofollow');return;}

  let subjectKey=null;
  Object.keys(subjects).some(key=>{
    if(path.includes('/subjects/'+key+'/')){subjectKey=key;return true;}
    return false;
  });

  let title='Class 6 Learning Hub | कक्षा 6 Study, Practice, Tests & Revision';
  let description='Class 6 Learning Hub: Science, Maths, English, Hindi, GK & Reasoning और Social Science के lessons, practice questions, tests, revision और learning tools।';

  if(subjectKey && subjects[subjectKey]){
    title=subjects[subjectKey].title;description=subjects[subjectKey].description;
  }else if(/all-classes\.html$/.test(path)){
    title='Class 6 All Subjects | Science, Maths, English, Hindi, GK & Social Science';
    description='कक्षा 6 के सभी subjects एक जगह: Science, Maths, English, Hindi, GK & Reasoning और Social Science के chapter-wise learning resources।';
  }else if(/chapter\.html$/.test(path)){
    const n=params.get('chapter');
    title=(subjectKey?subjects[subjectKey].name:'Class 6')+(n?' Chapter '+n:' Chapters')+' | Class 6 Learning Hub';
    description='Class 6 chapter-wise lesson, examples, practice questions, revision और test resources।';
  }else if(/topic(?:-hi)?\.html$/.test(path)){
    title='Class 6 Topic-wise Learning | Questions, Practice & Revision';
    description='कक्षा 6 के topic-wise learning resources, questions, practice और revision।';
  }

  document.title=title;
  setMeta('description',description);
  setMeta('robots','index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  setMeta('googlebot','index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');

  const canonical=setCanonical();
  setProp('og:type','website');setProp('og:title',title);setProp('og:description',description);setProp('og:url',canonical);
  setMeta('twitter:card','summary_large_image');setMeta('twitter:title',title);setMeta('twitter:description',description);

  addJsonLd('class6-seo-website-jsonld',{
    '@context':'https://schema.org','@type':'WebSite',name:'Class 6 Learning Hub',url:siteRoot,
    inLanguage:['hi','en'],isAccessibleForFree:true
  });
  addJsonLd('class6-seo-page-jsonld',{
    '@context':'https://schema.org','@type':'WebPage',name:title,description:description,url:canonical,inLanguage:'hi',
    isAccessibleForFree:true,isPartOf:{'@type':'WebSite',name:'Class 6 Learning Hub',url:siteRoot}
  });

  if(subjectKey){
    addJsonLd('class6-seo-breadcrumb-jsonld',{
      '@context':'https://schema.org','@type':'BreadcrumbList',
      itemListElement:[
        {'@type':'ListItem',position:1,name:'Class 6 Learning Hub',item:siteRoot},
        {'@type':'ListItem',position:2,name:subjects[subjectKey].hi+' / '+subjects[subjectKey].name,item:canonical}
      ]
    });
  }

  if(isHome && !document.getElementById('class6SeoIntro')){
    const section=document.createElement('section');
    section.id='class6SeoIntro';section.className='home-section class6-seo-intro';
    section.innerHTML=`
      <div class="home-head"><div><h2>Class 6 Learning Hub — सभी subjects की पढ़ाई एक जगह</h2><p>Chapter-wise study, practice, tests और revision resources</p></div></div>
      <div class="home-card" style="margin:0">
        <p>Class 6 Learning Hub में Science, Maths, English, Hindi, GK & Reasoning और Social Science के लिए chapter-wise learning resources मिलते हैं। Students lessons पढ़ सकते हैं, examples समझ सकते हैं, MCQ और practice questions solve कर सकते हैं, tests दे सकते हैं और revision कर सकते हैं।</p>
        <p>कक्षा 6 की पढ़ाई के लिए <strong>Science notes</strong>, <strong>Class 6 Maths practice</strong>, <strong>English grammar</strong>, <strong>Hindi grammar</strong>, <strong>GK questions</strong> और <strong>Social Science chapters</strong> एक ही learning hub में व्यवस्थित किए गए हैं।</p>
        <nav aria-label="Class 6 subject pages" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
          <a class="home-btn soft" href="subjects/science/index.html">🔬 Class 6 Science</a>
          <a class="home-btn soft" href="subjects/maths/index.html">➗ Class 6 Maths</a>
          <a class="home-btn soft" href="subjects/english/index.html">📖 Class 6 English</a>
          <a class="home-btn soft" href="subjects/hindi/index.html">📝 Class 6 Hindi</a>
          <a class="home-btn soft" href="subjects/gk/index.html">🧠 Class 6 GK</a>
          <a class="home-btn soft" href="subjects/social-science/index.html">🌍 Class 6 Social Science</a>
        </nav>
      </div>`;
    const anchor=document.querySelector('.home-notice');
    if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(section,anchor);
    else (document.querySelector('.home-shell')||document.body).appendChild(section);
  }

  const improveFromHeading=()=>{
    const heading=document.querySelector('h1');
    if(!heading) return;
    const text=(heading.textContent||'').trim();
    if(!text||text.length<4||text==='Study • कक्षा 6') return;
    if(/chapter\.html$/.test(path)||/topic(?:-hi)?\.html$/.test(path)){
      const prefix=subjectKey&&subjects[subjectKey]?subjects[subjectKey].name:'Class 6';
      const dynamicTitle=text.startsWith('Class 6')?text+' | Learning Hub':prefix+' — '+text+' | Class 6 Learning Hub';
      if(dynamicTitle.length<=75) document.title=dynamicTitle;
      setMeta('og:title',document.title);setMeta('twitter:title',document.title);
    }
  };
  improveFromHeading();window.addEventListener('load',improveFromHeading,{once:true});setTimeout(improveFromHeading,1200);
})();