/* Arrow's language model: feature extraction and a small neural network.
   A message becomes a bag of hashed features (words, word pairs, character n-grams, and
   placeholders like @F for any food or @N for any number). The network averages the
   feature embeddings, passes them through one ReLU layer and a softmax over intents.
   The trainer (tools/arrow/train.js) loads this same file, so training and the app always
   see identical features. Weights come from models/arrow-nlu.bin (int8 embeddings). */
(function(root){
  const NLU={};
  /* FNV-1a, 32-bit. */
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  NLU.hash=hash;

  /* Lowercase, keep letters, digits, apostrophes and "?"; emoji that carry meaning become words. */
  NLU.norm=function(text){
    return String(text).toLowerCase()
      .replace(/[’‘`´]/g,"'")
      .replace(/😂|🤣|😆|😹|😅/g,' lol ').replace(/❤️|❤|😍|🥰|😘|💕/g,' love ').replace(/👍|👌|✅/g,' ok ').replace(/🙏/g,' thanks ')
      .replace(/😡|🤬|😠/g,' angry ').replace(/😢|😭|☹️|🙁/g,' sad ').replace(/👋/g,' hi ')
      .replace(/(\d+(?:\.\d+)?)/g,' $1 ').replace(/\?+/g,' ? ')
      .replace(/[^a-z0-9?'\s]/g,' ')
      .replace(/([a-z])\1{2,}/g,'$1$1') // "hiiii" -> "hii", "nooo" -> "noo"
      .replace(/\s+/g,' ').trim();
  };
  /* Tokens: apostrophes dropped ("don't" -> "dont"), every number becomes "0". */
  NLU.tokens=function(text){return NLU.norm(text).split(' ').filter(Boolean).map(w=>/^\d/.test(w)?'0':w.replace(/'/g,'')).filter(Boolean)};

  /* ---------- lexicon placeholders ----------
     classes: {F:[phrases], N:[...], U:[...], M:[...], E:[...], T:[...], S:[...]} -> token-level tags. */
  NLU.lexicon=function(classes){
    const first=new Map();
    Object.entries(classes).forEach(([cls,list])=>list.forEach(ph=>{
      const toks=NLU.tokens(ph);if(!toks.length)return;
      const k=toks[0];if(!first.has(k))first.set(k,[]);first.get(k).push({toks,cls});
    }));
    first.forEach(a=>a.sort((x,y)=>y.toks.length-x.toks.length));
    return {first};
  };
  const sing=w=>w.length>4&&w.endsWith('es')&&!w.endsWith('ses')?w.slice(0,-2):w.length>3&&w.endsWith('s')&&!w.endsWith('ss')?w.slice(0,-1):w;
  /* Replace lexicon phrases with @class tokens (longest match first). Numbers become @N. */
  NLU.tag=function(toks,lex){
    const out=[];
    for(let i=0;i<toks.length;){
      const t=toks[i];
      if(t==='0'){out.push('@N');i++;continue}
      let hit=null;
      if(lex){for(const key of [t,sing(t)]){const c=lex.first.get(key);if(!c)continue;
        for(const e of c){const L=e.toks.length;if(i+L>toks.length)continue;let ok=true;
          for(let j=1;j<L;j++){const a=toks[i+j],b=e.toks[j];if(a!==b&&sing(a)!==sing(b)){ok=false;break}}
          if(ok){hit=e;break}}
        if(hit)break}}
      if(hit){out.push('@'+hit.cls);i+=hit.toks.length}else{out.push(t);i++}
    }
    return out;
  };

  /* The app's own lexicon: every food name, number word, unit, meal word, exercise, page, shadow
     and kitchen word Arrow knows (custom = foods the Player taught). Built from the loaded data files. */
  NLU.appLexicon=function(custom){
    const F=[];FOODS.forEach(f=>f.a.forEach(a=>F.push(a)));Object.values(custom||{}).forEach(f=>(f.a||[]).forEach(a=>F.push(a)));
    if(typeof RECIPES!=='undefined')RECIPES.forEach(r=>r.ing.forEach(i=>{const n=i.split('|')[2];if(n)F.push(n)}));
    return NLU.lexicon({F,N:Object.keys(FL_NUM).filter(w=>w!=='a'&&w!=='an'),U:Object.keys(FL_UNIT_OF),M:Object.keys(FL_MEAL),E:AX_EX,T:AX_TAB,S:AX_SHADOW,K:AX_KITCHEN});
  };

  /* Every feature string for one message. opt (stored in the model file): ng = character n-gram sizes,
     skip = also pair each word with the word after next ("ate 2 idlis" -> "ate idlis"). */
  NLU.features=function(text,lex,opt){
    const ng=(opt&&opt.ng)||[3,4],skip=!!(opt&&opt.skip);
    const toks=NLU.tokens(text),f=[];
    toks.forEach((t,i)=>{
      f.push('w|'+t);
      if(i+1<toks.length)f.push('b|'+t+' '+toks[i+1]);
      if(skip&&i+2<toks.length)f.push('k|'+t+' '+toks[i+2]);
      if(t!=='0'&&t!=='?'){const s='<'+t.slice(0,16)+'>';for(const n of ng)for(let k=0;k+n<=s.length;k++)f.push('c|'+s.substr(k,n))}
    });
    const P=NLU.tag(toks,lex);
    P.forEach((p,i)=>{
      if(p[0]==='@')f.push('p|'+p);
      if(i+1<P.length&&(p[0]==='@'||P[i+1][0]==='@'))f.push('q|'+p+' '+P[i+1]);
    });
    if(P.length)f.push('s|'+P[0]),f.push('e|'+P[P.length-1]);
    f.push('n|'+Math.min(6,toks.length));
    return f;
  };
  NLU.featureIds=function(text,lex,B,opt){return NLU.features(text,lex,opt).map(s=>hash(s)%B)};

  /* ---------- the network ---------- */
  /* Binary layout: "ARW1", uint32 header length, JSON header, pad to 4,
     Float32 rowScale[B], Int8 emb[B*D], pad to 4, Float32 W1[H*D], b1[H], W2[K*H], b2[K]. */
  NLU.load=function(buf){
    const dv=new DataView(buf),u8=new Uint8Array(buf);
    if(String.fromCharCode(u8[0],u8[1],u8[2],u8[3])!=='ARW1')throw new Error('Not an Arrow model');
    const hl=dv.getUint32(4,true);let o=8;
    const head=JSON.parse(new TextDecoder().decode(u8.subarray(o,o+hl)));o+=hl;o=(o+3)&~3;
    const {B,D,H,K}=head;
    const scale=new Float32Array(buf.slice(o,o+4*B));o+=4*B;
    const emb=new Int8Array(buf.slice(o,o+B*D));o+=B*D;o=(o+3)&~3;
    const f32=n=>{const a=new Float32Array(buf.slice(o,o+4*n));o+=4*n;return a};
    const W1=f32(H*D),b1=f32(H),W2=f32(K*H),b2=f32(K);
    return {head,B,D,H,K,labels:head.labels,scale,emb,W1,b1,W2,b2};
  };
  /* Probabilities over intents for one message. */
  NLU.predict=function(model,text,lex){
    const {B,D,H,K,scale,emb,W1,b1,W2,b2}=model,ids=NLU.featureIds(text,lex,B,model.head.feat);
    const e=new Float32Array(D);
    ids.forEach(r=>{const s=scale[r],o=r*D;if(!s)return;for(let d=0;d<D;d++)e[d]+=emb[o+d]*s});
    const norm=1/Math.sqrt(Math.max(1,ids.length));for(let d=0;d<D;d++)e[d]*=norm;
    const h=new Float32Array(H);
    for(let j=0;j<H;j++){let v=b1[j];const o=j*D;for(let d=0;d<D;d++)v+=W1[o+d]*e[d];h[j]=v>0?v:0}
    const z=new Float32Array(K);let mx=-1e9;
    for(let k=0;k<K;k++){let v=b2[k];const o=k*H;for(let j=0;j<H;j++)v+=W2[o+j]*h[j];z[k]=v;if(v>mx)mx=v}
    let sum=0;for(let k=0;k<K;k++){z[k]=Math.exp(z[k]-mx);sum+=z[k]}
    const out=[];for(let k=0;k<K;k++)out.push({intent:model.labels[k],p:z[k]/sum});
    return out.sort((a,b)=>b.p-a.p);
  };

  if(typeof module!=='undefined'&&module.exports)module.exports=NLU;else root.ArrowNLU=NLU;
})(typeof window!=='undefined'?window:this);
