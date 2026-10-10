/* Builds Arrow's training set from templates.js: fills every slot with real foods, numbers,
   exercises and pages in English, Telugu or Hindi, then adds the noise real chats have
   (typos, "bro"/"ra"/"yaar", emoji, missing punctuation). Seeded, so runs are reproducible. */
const T=require('./templates');

function rng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}

/* Dishes Arrow has never seen: they teach the model that "had X" is a meal whatever X is. */
const UNKNOWN=['kothu parotta','appam','puttu','bisi bele bath','vangi bath','rava kesari','chakkara pongali','sorakaya kura','beerakaya pappu','dosakaya pappu',
  'kakarakaya fry','chikkudukaya kura','bagara baingan','double ka meetha','haleem','keema pav','misal pav','dal baati','litti chokha','sarson ka saag','undhiyu',
  'khandvi','thukpa','shawarma','falafel','burrito','sushi','pad thai','tacos','lasagna','quesadilla','nachos','waffles','pancakes','french toast','acai bowl',
  'protein pancakes','mushroom risotto','tofu scramble','greek salad','poke bowl','dragonfruit bowl','mystery stew','grandma special','office canteen thali',
  'mutton paya','nihari','pesara punugulu','gongura mutton','ulavacharu','avakaya annam','pootharekulu','ariselu','bobbatlu','sunnundalu','kaju katli',
  'bhindi do pyaza','aloo tikki','ragda pattice','dabeli','kachori','sabudana khichdi','thalipeeth','neer dosa','kori rotti','ghee roast','set dosa',
  'mysore pak','badam milk','rose milk','jigarthanda','filter coffee with cake','cold coffee','energy bar','granola','trail mix','cup noodles'];
const DRINK={en:['water','milk','tea','coffee','juice','orange juice','lassi','buttermilk','coke','a protein shake','green tea','black coffee','coconut water'],
  te:['neellu','paalu','tea','coffee','majjiga','juice','kobbari neellu'],hi:['paani','doodh','chai','coffee','lassi','chaas','juice','nimbu paani']};
const MEAL={en:['breakfast','lunch','dinner','snack','brunch','supper','evening snack','morning snack'],te:['tiffin','madhyanam','rathri','sayantram','poddunna','breakfast','lunch','dinner'],
  hi:['nashta','nashte','dopahar','raat','shaam','subah','breakfast','lunch','dinner']};
const NUMW={en:['a','an','one','two','three','four','five','half','a couple of','a few'],te:['oka','rendu','moodu','naalugu','aidu','aaru','sagam'],
  hi:['ek','do','teen','char','paanch','aadha','dedh','dhai']};
const UNITW={en:['bowl of','bowls of','plate of','cup of','cups of','glass of','slice of','slices of','piece of','pieces of','katori','handful of','tbsp','scoop of','packet of'],
  te:['ginne','ginnelu','plate','glass','cup','katori','mukkalu'],hi:['katori','plate','glass','cup','tukde','packet']};
const SIZEW={en:['small','big','large','huge','medium'],te:['pedda','chinna','konchem'],hi:['bada','chhota','thoda']};
const JOIN={en:[', ',' and ',' with ',' plus ',' & ',', and '],te:[' mariyu ',' inka ',' tho ',' ',', '],hi:[' aur ',' ke saath ',', ',' ']};
const BODY={en:['shoulder','knee','back','lower back','wrist','elbow','ankle','neck','hip','chest','hamstring'],te:['mokalu','nadumu','veepu','bhujam','mokali'],
  hi:['kandha','ghutna','kamar','peeth','kalai']};
const MOVIES=['pushpa 2','rrr','bahubali','salaar','kgf','kalki','jawan','animal','devara','leo','pathaan'];
const BODYP=['chest','arms','biceps','triceps','forearms','shoulders','legs','back','calves','abs','glutes','neck'];
const GOALW=['cut','bulk','lean bulk','lose weight','lose fat','gain weight','gain muscle','maintain','maintenance','recomp','fat loss','get shredded'];
const STATW=['strength','speed','agility','mobility','flexibility','str','agi'];
const PAGES=['status','home','quest','quests','gates','dungeons','progress','diet','nutrition','recipes','history','feats','achievements','plan','skills','army',
  'shadows','armory','weapons','grocery list','shopping list','weekly report'];
const ING_EXTRA=['eggs','paneer','chicken','rice','dal','onions','tomatoes','spinach','potatoes','milk','curd','bread','oats','soya chunks','chickpeas','rajma',
  'besan','atta','peanuts','bananas','apples','cheese','butter','mushrooms','capsicum','carrots','cabbage','cauliflower','fish','mutton','tofu','sprouts','moong dal',
  'poha','rava','noodles','pasta','corn','peas','beans','ginger','garlic','lemons','coconut','kodi guddu','paalu','perugu','pyaz','aloo','tamatar','palak','anda','doodh','dahi'];
const FILLPRE={en:['hey ','yo ','ok ','so ','hmm ','arrow ','hey arrow ','bro ','um ','ok so ','listen ','quick question, ','btw ','one sec, ','so basically ','honestly ','wait ','also '],te:['arrow ','bro ','ra ','anna ','ok ','hey '],hi:['arrow ','yaar ','bhai ','arre ','sun ','ok ']};
const FILLSUF={en:[' pls',' please',' bro',' lol',' !',' ?',' :)',' 😅',' asap',' thanks',' bot',' arrow',' buddy',' man'],te:[' ra',' anna',' bro',' andi',' ok na',' pls'],hi:[' yaar',' bhai',' ji',' na',' pls',' please']};

module.exports=function generate(app,seed=7){
  const R=rng(seed),pick=a=>a[Math.floor(R()*a.length)],chance=p=>R()<p;
  const aliases=[];app.FOODS.forEach(f=>{if(f.tags==='water')return;f.a.forEach(a=>aliases.push(a))});
  const exercises=[...new Set([...app.AX_EX,...Object.values(app.LADDERS).flatMap(L=>L.steps.map(s=>s[0].toLowerCase().replace(/\s*\(.*?\)\s*/g,' ').trim())),
    ...app.WARMUP.map(w=>w[0].toLowerCase())])];
  /* Recipe ingredients, cleaned: "curd (dahi)" -> "curd", "toor or moong dal" -> "toor", "moong dal". */
  const ingredients=[...new Set([...ING_EXTRA,...app.RECIPES.flatMap(r=>r.ing.flatMap(i=>(i.split('|')[2]||'').toLowerCase().replace(/\(.*?\)/g,'')
    .split(/\s+or\s+|\s+and\s+|,/).map(x=>x.trim()).filter(n=>n&&n.length>2&&n.length<20&&!/optional|to taste|water|salt|pepper|masala|powder|seeds|leaves/.test(n))))])];
  const shadows=app.SHADOW_LEGENDS.map(s=>s[0].toLowerCase());
  const num=lang=>chance(.55)?String(1+Math.floor(R()*6)):pick(NUMW[lang].filter(w=>!/^(a|an|half|a couple of|a few)$/.test(w))||NUMW.en);
  const food=(lang,bare)=>{
    const name=chance(.08)?pick(UNKNOWN):pick(aliases);if(bare)return name;
    let q='';const r=R();
    if(r<.42)q='';else if(r<.72)q=String(1+Math.floor(R()*5))+' ';else q=pick(NUMW[lang])+' ';
    let u='';if(chance(.22)){u=pick(UNITW[lang])+' ';if(!q&&lang==='en'&&chance(.7))q=pick(['a ','one ','2 ','half a '])}
    else if(chance(.06)&&lang==='en'){q='';u=(50*(1+Math.floor(R()*8)))+(chance(.5)?'g ':' grams ')}
    const sz=chance(.08)?pick(SIZEW[lang])+' ':'';
    if(lang==='te'&&q&&!u&&chance(.3))return `${sz}${name} ${q.trim()}`; // "idli rendu"
    return `${q}${u}${sz}${name}`;
  };
  const foods=lang=>{const n=chance(.55)?1:chance(.6)?2:3,a=[];for(let i=0;i<n;i++)a.push(food(lang));
    return a.reduce((s,x,i)=>i?s+pick(JOIN[lang])+x:x,'')};
  const ings=lang=>{const n=1+Math.floor(R()*3),a=[];for(let i=0;i<n;i++)a.push(pick(ingredients));return a.reduce((s,x,i)=>i?s+pick(JOIN[lang])+x:x,'')};
  const slot=(k,lang)=>({F:()=>food(lang),FS:()=>foods(lang),Fn:()=>food(lang,true),M:()=>pick(MEAL[lang]),N:()=>num(lang),
    K:()=>`${10*(5+Math.floor(R()*70))} ${pick(['kcal','calories','cal','kcals','cals'])}`,P:()=>`${2+Math.floor(R()*38)}${pick([' g',' grams','g'])} protein`,
    X:()=>pick(exercises),T:()=>pick(PAGES),SH:()=>pick(shadows),I:()=>pick(ingredients),IS:()=>ings(lang),ST:()=>pick(STATW),D:()=>pick(DRINK[lang]),
    G:()=>pick(GOALW),MV:()=>pick(MOVIES),BP:()=>pick(BODYP),U:()=>pick(UNKNOWN),R:()=>pick(['e','d','c','b','a','s']),B:()=>pick(BODY[lang])}[k]||(()=>{throw new Error('slot '+k)}))();
  const expand=(t,lang)=>{
    let s=t;
    for(let g=0;g<5&&/\[[^\[\]]*\]/.test(s);g++)s=s.replace(/\[([^\[\]]*)\]/g,(_,x)=>chance(.5)?x:'');
    for(let g=0;g<5&&/\(([^()]*)\)/.test(s);g++)s=s.replace(/\(([^()]*)\)/g,(_,x)=>pick(x.split('|')));
    return s.replace(/\{(\w+)\}/g,(_,k)=>slot(k,lang)).replace(/\s+/g,' ').trim();
  };
  const typo=w=>{if(w.length<4||/\d/.test(w))return w;const i=1+Math.floor(R()*(w.length-2)),op=R();
    if(op<.3)return w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2);if(op<.55)return w.slice(0,i)+w.slice(i+1);if(op<.8)return w.slice(0,i)+w[i]+w.slice(i);
    return w.slice(0,i)+pick('aeiou')+w.slice(i+1)};
  const noise=(s,lang,intent)=>{
    if(chance(.18)){const ws=s.split(' '),i=Math.floor(R()*ws.length);ws[i]=typo(ws[i]);s=ws.join(' ')}
    if(chance(.06)){const ws=s.split(' '),i=Math.floor(R()*ws.length);ws[i]=typo(ws[i]);s=ws.join(' ')}
    const short=s.split(' ').length<=2&&/^(affirm|deny|laugh|greet|thanks|bye)$/.test(intent);
    if(!short&&chance(.12))s=pick(FILLPRE[lang])+s;
    if(!short&&chance(.12))s=s+pick(FILLSUF[lang]);
    const r=R();if(r<.25)s=s[0].toUpperCase()+s.slice(1);else if(r<.28)s=s.toUpperCase();
    if(chance(.15))s+=pick(['.','!','?','..','!!']);
    return s;
  };
  const out=[];
  for(const [intent,def] of Object.entries(T)){
    const langs=['en','te','hi'].filter(l=>def[l]&&def[l].length);
    const share={en:.6,te:.2,hi:.2};const tot=langs.reduce((a,l)=>a+share[l],0);
    const seen=new Set();let tries=0;
    while(seen.size<def.n&&tries<def.n*12){tries++;
      let x=R()*tot,lang=langs[0];for(const l of langs){x-=share[l];if(x<=0){lang=l;break}}
      const base=expand(pick(def[lang]),lang),s=chance(.75)?noise(base,lang,intent):base;
      if(!seen.has(s)){seen.add(s);out.push({text:s,intent,lang})}
    }
  }
  /* Hand-written chats collected separately (collected_*.tsv): real-sounding messages the templates
     can't produce. Each is used as written plus noisy copies, so they weigh more than template lines. */
  const fs=require('fs'),path=require('path');
  fs.readdirSync(__dirname).filter(f=>/^collected_.*\.tsv$/.test(f)).forEach(f=>{
    fs.readFileSync(path.join(__dirname,f),'utf8').split('\n').forEach(l=>{const [intent,text]=l.split('\t');if(!text||!T[intent])return;
      const t=text.trim();out.push({text:t,intent,lang:'mix',src:t});for(let k=0;k<3;k++)out.push({text:noise(t,'en',intent),intent,lang:'mix',src:t})});
  });
  /* The same words under two intents confuse training: keep one owner (out_of_scope gives way). */
  const key=x=>app.NLU.tokens(x.text).join(' '),owner=new Map();
  out.forEach(x=>{const k=key(x);if(!k)return;const o=owner.get(k);if(!o||(o==='out_of_scope'&&x.intent!=='out_of_scope'))owner.set(k,x.intent)});
  return out.filter(x=>{const k=key(x);return k&&owner.get(k)===x.intent});
};
