import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const excluded=new Set(['.git','node_modules']);
let changed=0;

function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(excluded.has(entry.name)) continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else if(entry.isFile() && entry.name.toLowerCase().endsWith('.html')) wire(full);
  }
}

function wire(file){
  const original=fs.readFileSync(file,'utf8');
  let updated=original;
  const relDir=path.relative(path.dirname(file),root).replaceAll(path.sep,'/');
  const prefix=relDir?relDir.split('/').filter(Boolean).map(()=> '..').join('/')+'/':'';
  const src=`${prefix}js/theme-toggle.js?v=3`;
  const themeTag=`<script src="${src}"></script>`;
  const themeRe=/<script\s+src="([^"]*\/?js\/theme-toggle\.js)(?:\?[^" ]*)?"\s*><\/script>/i;
  if(themeRe.test(updated)) updated=updated.replace(themeRe,themeTag);
  else if(updated.includes('</head>')) updated=updated.replace('</head>',`${themeTag}</head>`);
  else updated=`${themeTag}${updated}`;

  // Home previously linked the stylesheet as v1; normalize it so cached light-only
  // CSS cannot mask the newer contrast fixes.
  const darkCssRe=/(<link\s+rel="stylesheet"\s+href=")([^"]*\/?css\/dark-theme-fix\.css)(?:\?[^" ]*)?(")/i;
  if(darkCssRe.test(updated)) updated=updated.replace(darkCssRe,'$1$2?v=2$3');

  if(updated!==original){
    fs.writeFileSync(file,updated);
    changed++;
    console.log(`wired ${path.relative(root,file)}`);
  }
}

walk(root);
console.log(`Theme wiring complete: ${changed} HTML file(s) updated.`);
