/* Scores a model file on a TSV test set (intent<TAB>message): accuracy, per-intent misses.
   Usage: node evalset.js <set.tsv> [model.bin] [--half dev|test] */
const fs=require('fs'),path=require('path'),app=require('./app')(),NLU=app.NLU,lex=NLU.appLexicon({});
const set=process.argv[2],mf=process.argv[3]&&!process.argv[3].startsWith('--')?process.argv[3]:path.join(__dirname,'../../models/arrow-nlu.bin');
const hi=process.argv.indexOf('--half'),half=hi>0?process.argv[hi+1]:null;
const buf=fs.readFileSync(mf),model=NLU.load(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength));
let rows=fs.readFileSync(set,'utf8').split('\n').filter(l=>l.trim()&&l[0]!=='#').map(l=>{const [i,t]=l.split('\t');return {intent:i,text:t}});
/* dev/test halves: alternate lines within each intent */
const seen={};rows.forEach(r=>{seen[r.intent]=(seen[r.intent]||0)+1;r.half=seen[r.intent]%2?'dev':'test'});
if(half)rows=rows.filter(r=>r.half===half);
let ok=0;const miss=[],ths=[.3,.42,.5,.6,.7].map(t=>({t,n:0,ok:0}));
for(const r of rows){const p=NLU.predict(model,r.text,lex),good=p[0].intent===r.intent;if(good)ok++;else miss.push(`${r.intent.padEnd(15)}-> ${p[0].intent.padEnd(15)}${(p[0].p*100).toFixed(0).padStart(3)}%  ${r.text}`);
  ths.forEach(s=>{if(p[0].p>=s.t){s.n++;if(good)s.ok++}})}
console.log(`${path.basename(set)}${half?' ['+half+']':''}: ${ok}/${rows.length} = ${(ok/rows.length*100).toFixed(1)}%`);
console.log('confident answers: '+ths.map(s=>`p>=${s.t}: ${(s.n/rows.length*100).toFixed(0)}% of msgs, ${(s.ok/Math.max(1,s.n)*100).toFixed(1)}% right`).join(' | '));
if(!process.argv.includes('--quiet'))console.log(miss.join('\n'));
