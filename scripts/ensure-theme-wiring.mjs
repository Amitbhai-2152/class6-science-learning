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
  if(/theme-toggle\.js(?:\?[^"']*)?["']/i.test(original)) return;
  const relDir=path.relative(path.dirname(file),root).replaceAll(path.sep,'/');
  const prefix=relDir?relDir.split('/').filter(Boolean).map(()=> '..').join('/')+'/':'';
  const src=`${prefix}js/theme-toggle.js?v=3`;
  const tag=`<script src="${src}"></script>`;
  const updated=original.includes('</head>')
    ? original.replace('</head>',`${tag}</head>`)
    : `${tag}${original}`;
  if(updated!==original){
    fs.writeFileSync(file,updated);
    changed++;
    console.log(`wired ${path.relative(root,file)}`);
  }
}

walk(root);
console.log(`Theme wiring complete: ${changed} HTML file(s) updated.`);
