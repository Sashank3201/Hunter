/* Trains Arrow's intent model and writes models/arrow-nlu.bin.
   Network: hashed feature embeddings (bag, averaged) -> ReLU layer -> softmax over intents.
   Reports accuracy on held-out generated data and on realworld.tsv, the hand-written test set
   that is never trained on (plus the subset of it that never appears in the training data).
   Usage: node train.js [--B 16384] [--D 32] [--H 96] [--epochs 12] [--seed 7] [--out ../../models/arrow-nlu.bin] */
const fs=require('fs'),path=require('path');
const app=require('./app')(),generate=require('./gen'),NLU=app.NLU;
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const B=+arg('B',16384),D=+arg('D',32),H=+arg('H',96),EPOCHS=+arg('epochs',12),SEED=+arg('seed',7);
const FEAT={ng:arg('ng','3,4').split(',').map(Number),skip:process.argv.includes('--skip')};
const OUT=path.resolve(__dirname,arg('out','../../models/arrow-nlu.bin'));
function rng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
const R=rng(SEED*31+1),gauss=()=>{let u=0,v=0;while(!u)u=R();while(!v)v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};

/* ---------- data ---------- */
const lex=NLU.appLexicon({});
const data=generate(app,SEED);
const labels=[...new Set(data.map(x=>x.intent))].sort(),K=labels.length,L=Object.fromEntries(labels.map((l,i)=>[l,i]));
const real=fs.readFileSync(path.join(__dirname,'realworld.tsv'),'utf8').split('\n').filter(l=>l&&l[0]!=='#').map(l=>{const [i,t]=l.split('\t');return {intent:i,text:t}});
real.forEach(x=>{if(!(x.intent in L))throw new Error('realworld intent not in training: '+x.intent)});
const seenKeys=new Set(data.map(x=>NLU.tokens(x.text).join(' ')));
real.forEach(x=>x.novel=!seenKeys.has(NLU.tokens(x.text).join(' ')));
/* --natval: hold out 1 in 7 collected chats (all their noisy copies too) as a natural validation set */
const NATVAL=process.argv.includes('--natval'),natval=[];
if(NATVAL){for(let i=data.length-1;i>=0;i--){const x=data[i];if(x.src&&NLU.hash(x.src)%7===0){if(x.text===x.src)natval.push(x);data.splice(i,1)}}}
/* stratified hold-out: 8% of each intent */
const byI={};data.forEach(x=>(byI[x.intent]=byI[x.intent]||[]).push(x));
const train=[],val=[];Object.values(byI).forEach(a=>{a.forEach((x,i)=>(i%12===0?val:train).push(x))});
const feat=x=>Int32Array.from(NLU.featureIds(x.text,lex,B,FEAT));
const T=train.map(x=>({ids:feat(x),y:L[x.intent]})),V=val.map(x=>({ids:feat(x),y:L[x.intent],text:x.text})),RW=real.map(x=>({ids:feat(x),y:L[x.intent],text:x.text,novel:x.novel}));
const NV=natval.map(x=>({ids:feat(x),y:L[x.intent],text:x.text}));
if(NATVAL)console.log(`natural validation: ${NV.length} collected chats held out`);
console.log(`examples: ${data.length} (train ${T.length}, held-out ${V.length}), intents: ${K}, real-world: ${RW.length} (${RW.filter(x=>x.novel).length} never seen in training)`);
console.log(`model: B=${B} D=${D} H=${H} epochs=${EPOCHS} features=${JSON.stringify(FEAT)}`);

/* ---------- parameters ---------- */
const E=new Float32Array(B*D),W1=new Float32Array(H*D),b1=new Float32Array(H).fill(.05),W2=new Float32Array(K*H),b2=new Float32Array(K);
for(let i=0;i<W1.length;i++)W1[i]=gauss()*Math.sqrt(2/D);
for(let i=0;i<W2.length;i++)W2[i]=gauss()*Math.sqrt(1/H);
const adam=n=>({m:new Float32Array(n),v:new Float32Array(n)});
const oE=adam(B*D),oW1=adam(H*D),ob1=adam(H),oW2=adam(K*H),ob2=adam(K);
let step=0;
function upd(p,g,o,lr,wd,idx0,n){ // Adam on p[idx0..idx0+n)
  const b1c=1-Math.pow(.9,step),b2c=1-Math.pow(.999,step);
  for(let i=0;i<n;i++){const j=idx0+i;let gi=g[i]+wd*p[j];o.m[j]=.9*o.m[j]+.1*gi;o.v[j]=.999*o.v[j]+.001*gi*gi;p[j]-=lr*(o.m[j]/b1c)/(Math.sqrt(o.v[j]/b2c)+1e-8)}
}

/* ---------- forward ---------- */
const e=new Float32Array(D),a=new Float32Array(H),h=new Float32Array(H),z=new Float32Array(K),p=new Float32Array(K);
function forward(ids){
  e.fill(0);for(const r of ids){const o=r*D;for(let d=0;d<D;d++)e[d]+=E[o+d]}
  const nrm=1/Math.sqrt(Math.max(1,ids.length));for(let d=0;d<D;d++)e[d]*=nrm;
  for(let j=0;j<H;j++){let v=b1[j];const o=j*D;for(let d=0;d<D;d++)v+=W1[o+d]*e[d];a[j]=v;h[j]=v>0?v:0}
  let mx=-1e9;for(let k=0;k<K;k++){let v=b2[k];const o=k*H;for(let j=0;j<H;j++)v+=W2[o+j]*h[j];z[k]=v;if(v>mx)mx=v}
  let s=0;for(let k=0;k<K;k++){p[k]=Math.exp(z[k]-mx);s+=p[k]}for(let k=0;k<K;k++)p[k]/=s;
  return nrm;
}
const argmax=x=>{let b=0;for(let i=1;i<x.length;i++)if(x[i]>x[b])b=i;return b};
function evaluate(set){let ok=0;for(const x of set){forward(x.ids);if(argmax(p)===x.y)ok++}return ok/set.length}

/* ---------- training ---------- */
const BATCH=32,SMOOTH=.05,DROP=.1,WD=1e-5;
const gW1=new Float32Array(H*D),gb1=new Float32Array(H),gW2=new Float32Array(K*H),gb2=new Float32Array(K),dh=new Float32Array(H),da=new Float32Array(H),de=new Float32Array(D);
const total=Math.ceil(T.length/BATCH)*EPOCHS;
const t0=Date.now();
for(let ep=0;ep<EPOCHS;ep++){
  for(let i=T.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[T[i],T[j]]=[T[j],T[i]]}
  let loss=0;
  for(let bs=0;bs<T.length;bs+=BATCH){
    gW1.fill(0);gb1.fill(0);gW2.fill(0);gb2.fill(0);const gE=new Map();
    const end=Math.min(T.length,bs+BATCH),nb=end-bs;
    for(let t=bs;t<end;t++){
      const x=T[t];let ids=x.ids.filter(()=>R()>DROP);if(!ids.length)ids=x.ids;
      const nrm=forward(ids);loss-=Math.log(p[x.y]+1e-9);
      for(let k=0;k<K;k++){const y=(k===x.y?1-SMOOTH:0)+SMOOTH/K,dz=(p[k]-y)/nb;gb2[k]+=dz;const o=k*H;for(let j=0;j<H;j++)gW2[o+j]+=dz*h[j]}
      for(let j=0;j<H;j++){let v=0;for(let k=0;k<K;k++)v+=W2[k*H+j]*((p[k]-((k===x.y?1-SMOOTH:0)+SMOOTH/K))/nb);dh[j]=v;da[j]=a[j]>0?v:0}
      de.fill(0);for(let j=0;j<H;j++){if(!da[j])continue;gb1[j]+=da[j];const o=j*D;for(let d=0;d<D;d++){gW1[o+d]+=da[j]*e[d];de[d]+=W1[o+d]*da[j]}}
      for(const r of ids){let g=gE.get(r);if(!g){g=new Float32Array(D);gE.set(r,g)}for(let d=0;d<D;d++)g[d]+=de[d]*nrm}
    }
    step++;const lr=.004*(.1+.9*.5*(1+Math.cos(Math.PI*step/total)));
    upd(W2,gW2,oW2,lr,WD,0,K*H);upd(b2,gb2,ob2,lr,0,0,K);upd(W1,gW1,oW1,lr,WD,0,H*D);upd(b1,gb1,ob1,lr,0,0,H);
    gE.forEach((g,r)=>upd(E,g,oE,lr,0,r*D,D));
  }
  console.log(`epoch ${ep+1}/${EPOCHS}  loss ${(loss/T.length).toFixed(4)}  held-out ${(evaluate(V)*100).toFixed(1)}%  real-world ${(evaluate(RW)*100).toFixed(1)}%${NV.length?`  natural ${(evaluate(NV)*100).toFixed(1)}%`:''}  (${((Date.now()-t0)/1000).toFixed(1)}s)`);
}

/* ---------- export (int8 embeddings, per-row scale) ---------- */
const scale=new Float32Array(B),emb=new Int8Array(B*D);
for(let r=0;r<B;r++){let mx=0;for(let d=0;d<D;d++)mx=Math.max(mx,Math.abs(E[r*D+d]));if(!mx)continue;scale[r]=mx/127;for(let d=0;d<D;d++)emb[r*D+d]=Math.round(E[r*D+d]/scale[r])}
const accHeld=evaluate(V),accReal=evaluate(RW),accNovel=evaluate(RW.filter(x=>x.novel));
const head={v:1,B,D,H,K,labels,feat:FEAT,examples:data.length,trained:new Date().toISOString().slice(0,10),acc:{heldout:+accHeld.toFixed(4),realworld:+accReal.toFixed(4),novel:+accNovel.toFixed(4)}};
const hb=Buffer.from(JSON.stringify(head));
const parts=[Buffer.from('ARW1'),Buffer.alloc(4),hb];parts[1].writeUInt32LE(hb.length);
let len=8+hb.length;const pad=n=>{const k=(4-(n%4))%4;if(k)parts.push(Buffer.alloc(k));return n+k};
len=pad(len);
parts.push(Buffer.from(scale.buffer));len+=scale.byteLength;
parts.push(Buffer.from(emb.buffer));len+=emb.byteLength;len=pad(len);
[W1,b1,W2,b2].forEach(x=>{parts.push(Buffer.from(x.buffer));len+=x.byteLength});
fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,Buffer.concat(parts));

/* ---------- check the shipped file with the app's own runtime ---------- */
const buf=fs.readFileSync(OUT),model=NLU.load(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength));
let ok=0,okN=0,nN=0;const miss=[],conf={};
const ths=[.3,.4,.5,.6,.7].map(t=>({t,n:0,ok:0}));
for(const x of real){const r=NLU.predict(model,x.text,lex),good=r[0].intent===x.intent;if(good)ok++;else{miss.push(`${x.intent.padEnd(14)} -> ${r[0].intent.padEnd(14)} ${(r[0].p*100).toFixed(0).padStart(3)}%  ${x.text}`);const k=x.intent+' -> '+r[0].intent;conf[k]=(conf[k]||0)+1}
  if(x.novel){nN++;if(good)okN++}
  ths.forEach(s=>{if(r[0].p>=s.t){s.n++;if(good)s.ok++}})}
console.log(`\nshipped model ${OUT} (${(buf.length/1024).toFixed(0)} KB)`);
console.log(`real-world accuracy (int8): ${(ok/real.length*100).toFixed(1)}%   never-seen subset: ${(okN/nN*100).toFixed(1)}% of ${nN}`);
console.log('confidence: '+ths.map(s=>`p>=${s.t}: ${(s.n/real.length*100).toFixed(0)}% of msgs, ${(s.ok/Math.max(1,s.n)*100).toFixed(1)}% right`).join(' | '));
console.log('\nmisses:\n'+miss.join('\n'));
