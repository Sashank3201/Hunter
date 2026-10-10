/* Hunter System: the food log and Arrow's chat screen. Arrow's brain is in arrow.js.
   Tell the bot what you ate ("2 rotis, dal and a glass of milk", typed or spoken)
   and it logs calories, protein, carbs, fat, fiber and sugar against lean-bulk
   targets, plus water. Unknown foods are asked about once and remembered.
   Everything stays on the device, in the diet storage key. */

/* ---------- language ---------- */
const FL_NUM={a:1,an:1,one:1,single:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,
  fifteen:15,twenty:20,half:.5,quarter:.25,couple:2,few:3,dozen:12,double:2};
const FL_ARTICLE=new Set(['a','an']);
const FL_UNITS={g:'g gm gms gram grams gr',kg:'kg kgs kilo kilos',ml:'ml mls millilitre milliliter millilitres milliliters',l:'l litre liter litres liters ltr',
  cup:'cup cups mug mugs',bowl:'bowl bowls katori katoris',plate:'plate plates thali',glass:'glass glasses',slice:'slice slices',
  piece:'piece pieces pc pcs nos',tbsp:'tbsp tablespoon tablespoons tbs',tsp:'tsp teaspoon teaspoons spoon spoons',scoop:'scoop scoops',
  handful:'handful handfuls fistful',serving:'serving servings portion portions',packet:'packet packets pack packs sachet',can:'can cans tin',
  bottle:'bottle bottles',bar:'bar bars'};
const FL_UNIT_OF={};Object.entries(FL_UNITS).forEach(([u,w])=>w.split(' ').forEach(x=>FL_UNIT_OF[x]=u));
/* Telugu and Hindi in English letters (arrow-lex.js): numbers, units, sizes, meals and filler words. */
Object.entries(AX_UNIT).forEach(([u,w])=>w.split(' ').forEach(x=>{if(!FL_UNIT_OF[x])FL_UNIT_OF[x]=u}));
Object.entries(AX_NUM).forEach(([w,v])=>{if(!(w in FL_NUM))FL_NUM[w]=v});
const FL_UNIT_G={cup:200,bowl:200,plate:300,glass:250,slice:30,tbsp:15,tsp:5,scoop:30,handful:30,can:330,bottle:500};
const FL_PIECES={plate:3,bowl:2,serving:2,packet:1}; // a plate of idli = 3 idlis
const FL_SIZE=Object.assign({small:.7,mini:.6,little:.6,medium:1,regular:1,normal:1,large:1.4,big:1.4,huge:1.8,jumbo:1.8,extra:1.3},AX_SIZE);
const FL_FILL=new Set('i im i\'m ive i\'ve i\'ll i\'d gonna going will had have has ate eat eaten eating drank drink drinking just also then some of the my for at in on me today todays tonight around about approx approximately like kind homemade home made fresh got took consumed finished bit lot lots plus more glass\'s'.split(' '));
const FL_MEAL={breakfast:'breakfast',brunch:'breakfast',morning:'breakfast',lunch:'lunch',afternoon:'lunch',dinner:'dinner',supper:'dinner',night:'dinner',
  snack:'snack',snacks:'snack',evening:'snack',preworkout:'snack',postworkout:'snack'};
AX_FILL.forEach(w=>FL_FILL.add(w));Object.entries(AX_MEAL).forEach(([w,m])=>{if(!FL_MEAL[w])FL_MEAL[w]=m});
const MEAL_NAME={breakfast:'Breakfast',lunch:'Lunch',snack:'Snack',dinner:'Dinner'};
/* Everyday words that are never food. They are skipped when matching (so "don't" can't be read
   as a typo of "donut") and never asked about as unknown foods. Any word with an apostrophe too. */
const FL_COMMON=new Set(('about above after again all almost already alright always am an another any anybody anyone anything anyway are around as ask asked at away back bad be '+
  'became because become been before being best better bit both bring but by call came can cannot cant care come coming could date day days did didnt different do does doesnt '+
  'doing done dont down during each early either else end enough even ever every everyone everything exactly feel feeling felt find fine first forgot forget forgotten from '+
  'gave get gets getting give go goes going gone good got great gym guess hardly has hasnt have havent having he hello help her here hey hi him his how however hungry idea if '+
  'into is isnt it its just keep know last late later least left less let life like little long look lot lots made make many may maybe mean meh might mine more most much must my '+
  'myself need never next nice no nobody none nope not nothing now of off often oh ok okay on once only or other our out over own past perhaps please pretty probably quite '+
  'rather really remember right said same saw say see seem seems she should since skip skipped so some somebody someone something sometimes somewhat soon sorry still such '+
  'suggest sure take taken tell than thank thanks that the their them then there these they thing things think this those though through time tired to today told tomorrow '+
  'tonight too took tried try trying under until up upon us use used usual usually very want wanted was wasnt way we week well went were what whatever when where which while '+
  'who why will wish without won wont would wow yeah yep yes yesterday yet you your yours workout target goal clue idk dunno nah hmm umm uh cold sick fever ill pain food meal meals').split(' '));

function flLev(a,b){if(Math.abs(a.length-b.length)>2)return 9;const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]}
const flSing=w=>w.length>4&&w.endsWith('es')&&!w.endsWith('ses')?w.slice(0,-2):w.length>3&&w.endsWith('s')&&!w.endsWith('ss')?w.slice(0,-1):w;
/* Same word, allowing plurals and small typos on longer words. */
function flTokEq(a,b){if(a===b||flSing(a)===b||flSing(a)===flSing(b))return true;if(a[0]!==b[0]||!/^[a-z]+$/.test(a))return false;if(b.length>=5&&flLev(a,b)<=1)return true;return b.length>=8&&flLev(a,b)<=2}

function flTokens(text){
  const s=' '+text.toLowerCase().replace(/½/g,' 0.5 ').replace(/¼/g,' 0.25 ').replace(/(\d+)\s*\/\s*(\d+)/g,(_,a,b)=>' '+(+a/+b)+' ')
    .replace(/(\d)\s*x\b/g,'$1 ').replace(/\bx\s*(\d)/g,' $1').replace(/(\d)([a-z]+)/g,'$1 $2').replace(/([a-z])(\d)/g,'$1 $2')
    .replace(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/g,(_,a,b)=>' '+((+a+ +b)/2)+' ')
    .replace(/[^a-z0-9.'\s]/g,' ').replace(/'s\b/g,'')+' ';
  return s.split(/\s+/).filter(Boolean).map(t=>{
    if(/^\d+(\.\d+)?$/.test(t))return {t,k:'num',v:+t};
    if(t in FL_NUM)return {t,k:'num',v:FL_NUM[t],art:FL_ARTICLE.has(t)};
    if(t in FL_UNIT_OF)return {t,k:'unit',u:FL_UNIT_OF[t]};
    if(t in FL_SIZE)return {t,k:'size',v:FL_SIZE[t]};
    if(t in FL_MEAL)return {t,k:'meal',m:FL_MEAL[t]};
    if(FL_FILL.has(t)||FL_COMMON.has(t)||t.includes("'")||t==='.'||t==='with')return {t,k:'fill'};
    return {t,k:'w'};
  });
}
/* Every food (built-in + taught) as token lists, longest first. */
let flIndex=null,flGlue=[];
function flBuildIndex(custom){
  const all=[...FOODS,...Object.values(custom||{})];
  flGlue=all.flatMap(f=>f.a).filter(al=>/\b(and|with|plus)\b|&/.test(al));
  flIndex=[];all.forEach(f=>f.a.forEach(al=>{const toks=flTokens(al).filter(x=>x.k==='w'||x.k==='size'||x.k==='unit').map(x=>x.t);if(toks.length)flIndex.push({f,toks})}));
  flIndex.sort((a,b)=>b.toks.length-a.toks.length);
}
function flPick(toks,lo,hi){
  let qty=null,unit=null,size=1,found=false;
  for(let i=lo;i<hi;i++){const t=toks[i];
    if(t.k==='num'){if(t.art&&qty!==null)continue;qty=(qty!==null&&toks[i-1]&&toks[i-1].k==='num'&&t.v<1)?qty+t.v:t.v;found=true}
    else if(t.k==='unit'){unit=t.u;found=true}else if(t.k==='size'){size*=t.v;found=true}}
  return {qty,unit,size,found};
}
/* One piece of a message ("2 rotis", "a bowl of dal") -> foods with amounts + leftover words. */
function flParseSeg(seg){
  const toks=flTokens(seg),words=[];toks.forEach((t,i)=>{if(t.k==='w'||t.k==='size'||t.k==='unit')words.push(i)});
  const used=new Set(),hits=[];
  for(let guard=0;guard<8;guard++){
    let best=null;
    for(const e of flIndex){const L=e.toks.length;if(best&&L*100+e.toks.join(' ').length+(e.f.custom?.5:0)<=best.sc)continue;
      for(let s=0;s+L<=words.length;s++){let ok=true;
        for(let j=0;j<L;j++){const wi=words[s+j];if(used.has(wi)||!flTokEq(toks[wi].t,e.toks[j])){ok=false;break}}
        if(ok&&L>1&&words[s+L-1]-words[s]>L+1)ok=false; // keep multi-word names together
        if(ok){const sc=L*100+e.toks.join(' ').length+(e.f.custom?.5:0);if(!best||sc>best.sc)best={e,s,L,sc}}}}
    if(!best)break;
    for(let j=0;j<best.L;j++)used.add(words[best.s+j]);
    hits.push({f:best.e.f,first:words[best.s],last:words[best.s+best.L-1]});
  }
  hits.sort((a,b)=>a.first-b.first);
  /* "coffee without sugar", "no extra butter": those foods are not eaten. */
  for(let k=hits.length-1;k>=0;k--){let i=hits[k].first-1;while(i>=0&&/^(extra|added|any|the|much|more|a)$/.test(toks[i].t))i--;if(i>=0&&/^(no|without|zero|minus|skip)$/.test(toks[i].t))hits.splice(k,1)}
  hits.forEach((h,k)=>{
    let q=flPick(toks,k?hits[k-1].last+1:0,h.first);
    if(!q.found)q=flPick(toks,h.last+1,k+1<hits.length?hits[k+1].first:toks.length);
    Object.assign(h,q);
  });
  const unknown=toks.filter((t,i)=>t.k==='w'&&!used.has(i)).map(t=>t.t);
  const q0=flPick(toks,0,toks.length);
  return {hits,unknown,qty:q0.qty,unit:q0.unit,meal:(toks.find(t=>t.k==='meal')||{}).m};
}
/* How many of the food's own units an amount is. */
function flUnits(f,qty,unit,size){
  qty=qty===null||qty===undefined?1:qty;let n;
  const toG=unit==='g'||unit==='ml'?qty:unit==='kg'||unit==='l'?qty*1000:null;
  if(f.u==='g'){n=toG!==null?toG/100:unit&&FL_UNIT_G[unit]?qty*FL_UNIT_G[unit]/100:qty*(f.serv||100)/100}
  else if(toG!==null)n=toG/f.g;
  else if(!unit||unit===f.u||(unit==='piece'&&f.u!=='g'))n=qty;
  else if(f.u==='piece'&&FL_PIECES[unit])n=qty*FL_PIECES[unit];
  else if(FL_UNIT_G[unit])n=qty*FL_UNIT_G[unit]/f.g;
  else n=qty;
  return n*(size||1);
}
const flR1=x=>Math.round(x*10)/10;
const flPlural=w=>/[^aeiou]y$/.test(w)?w.slice(0,-1)+'ies':/(s|x|ch|sh)$/.test(w)?w+'es':w+'s';
/* "2 rotis", "1 glass of milk", "200 g chicken breast", "500 ml milk". */
function flLabel(f,n,unit,qty){
  const name=f.n.toLowerCase();
  if(unit==='g'||unit==='kg'||unit==='ml'||unit==='l'){const m=unit==='kg'||unit==='l'?qty*1000:qty,liq=unit==='ml'||unit==='l';return `${Math.round(m)} ${liq?'ml':'g'} ${name}`}
  if(f.u==='g')return `${Math.round(n*100)} g ${name}`;
  const q=flR1(n);
  if(f.u==='piece'||f.u==='serving')return `${q} ${q>1&&f.u==='piece'?name.replace(/^([^(,]*?)(\s*[(,].*)?$/,(_,a,b)=>(/s$/.test(a)?a:flPlural(a))+(b||'')):name}`;
  return `${q} ${q>1?flPlural(f.u):f.u} of ${name}`;
}
/* Nouns people use about food that are not foods themselves: never asked about as unknown foods. */
const FL_NOTFOOD=new Set('protein proteins recipe recipes bulk bulking cut cutting diet calories calorie kcal cal cals weight muscle muscles full stuffed macros carbs fiber breakfast lunch dinner snack'.split(' '));
const FL_SPLIT=new RegExp(",|;|\\n|&|\\+|\\.\\s|\\b(?:and|with|plus|along|then|also|after that|but|"+AX_SEP.join('|')+")\\b",'i');
const FL_NEG=new RegExp("\\b(didn'?t|did not|haven'?t|have not|hasn'?t|has not|never|won'?t|will not|skip(?:ped)?|not (?:eat|eaten|have|had|drink|drunk)|"+AX_NEG.join('|')+")\\b",'i');
/* Turn a whole message into foods, water and unknown phrases. */
function flParse(text,custom){
  flBuildIndex(custom);
  /* Keep names like "oats with milk" in one piece before splitting on "with"/"and". */
  flGlue.forEach(al=>{text=text.replace(new RegExp('\\b'+al.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','gi'),m=>m.replace(/\s+/g,'_'))});
  const segs=text.split(FL_SPLIT).map(s=>s.trim()).filter(Boolean);
  const items=[],unknown=[],skipped=[];let water=0;
  /* Each piece gets its own meal. A meal word after the food ("rice and dal for lunch") covers
     the pieces before it; one before the food ("for dinner 4 idlis") covers the pieces after it. */
  const own=segs.map(sg=>{const tk=flTokens(sg),mi=tk.findIndex(t=>t.k==='meal');if(mi<0)return null;
    const food=t=>t.k==='w'||t.k==='num'||t.k==='unit';return {m:tk[mi].m,close:tk.slice(0,mi).some(food)&&!tk.slice(mi+1).some(food)}});
  const meals=own.map(o=>o&&o.m);
  own.forEach((o,i)=>{if(o&&o.close)for(let j=i-1;j>=0&&!own[j]&&!meals[j];j--)meals[j]=o.m});
  const first=meals.find(Boolean)||null;let prev=null;
  meals.forEach((m,i)=>{meals[i]=(prev=m||prev)||first});
  segs.forEach((seg,si)=>{
    const r=flParseSeg(seg);
    /* "I didn't have rice", "skipped breakfast": nothing in this piece was eaten. */
    if(FL_NEG.test(seg)){r.hits.forEach(h=>skipped.push(h.f.n.toLowerCase()));return}
    r.hits.forEach(h=>{
      const n=flUnits(h.f,h.qty,h.unit,h.size);
      if(h.f.tags==='water'){water+=h.unit==='ml'?h.qty/250:h.unit==='l'?h.qty*4:h.unit==='bottle'?(h.qty||1)*2:n;return}
      items.push({n:h.f.n,q:flLabel(h.f,n,h.unit,h.qty),k:Math.round(h.f.k*n),p:flR1(h.f.p*n),c:flR1(h.f.c*n),f:flR1(h.f.f*n),fb:flR1(h.f.fb*n),s:flR1(h.f.s*n),tags:h.f.tags,units:n,custom:!!h.f.custom,est:!!h.f.est,meal:meals[si]});
    });
    const left=r.unknown.filter(w=>w.length>1&&!FL_NOTFOOD.has(w)&&!/^(it|that|this|and|or|but|so|very|too|really|yeah|ok|okay|pls|please)$/.test(w));
    if(!r.hits.length&&left.length)unknown.push({phrase:left.join(' '),qty:r.qty,unit:r.unit,meal:meals[si]});
  });
  return {items,water:Math.round(water*10)/10,unknown,meal:first,skipped};
}

/* ---------- targets (lean bulk by default) ---------- */
const GOALS={bulk:{n:'Lean bulk',k:1.1,p:1.6},cut:{n:'Fat loss',k:.8,p:2},maintain:{n:'Maintain',k:1,p:1.6}};
function foodTargets(ds){
  const b=ds.body||{},w=ds.weight||63,h=b.h||170,a=b.age||22,male=b.sex!=='f',g=GOALS[ds.goal||'bulk'];
  const bmr=10*w+6.25*h-5*a+(male?5:-161),kcal=Math.round(bmr*1.55*g.k/50)*50; // trains most days
  const p=Math.round(w*g.p),f=Math.round(kcal*.25/9),c=Math.max(0,Math.round((kcal-p*4-f*9)/4));
  return {kcal,p,c,f,fb:Math.round(kcal/1000*14),s:Math.round(kcal*.1/4),water:Math.max(8,Math.round((w*35+500)/250))};
}

/* ---------- day store ---------- */
function flDay(ds,date=todayStr()){
  ds.food=ds.food||{};ds.food[date]=ds.food[date]||{items:[],water:0,msgs:[],flags:{}};
  const keys=Object.keys(ds.food).sort();keys.slice(0,-45).forEach(k=>delete ds.food[k]);
  keys.slice(0,-3).forEach(k=>{if(ds.food[k].msgs&&ds.food[k].msgs.length)ds.food[k].msgs=[]});
  return ds.food[date];
}
function flTotals(day){const t={k:0,p:0,c:0,f:0,fb:0,s:0};day.items.forEach(i=>Object.keys(t).forEach(x=>t[x]+=i[x]||0));Object.keys(t).forEach(x=>t[x]=x==='k'?Math.round(t[x]):flR1(t[x]));return t}
/* The hour of the day (window.__HOUR lets tests pick one). */
function flHour(){return typeof window!=='undefined'&&window.__HOUR!==undefined?window.__HOUR:new Date().getHours()}
const mealNow=()=>{const h=flHour();return h<11?'breakfast':h<16?'lunch':h<19?'snack':'dinner'};
const fmtK=n=>Math.round(n).toLocaleString('en-US');

/* ---------- estimates and corrections ----------
   When you don't know a food's calories, the bot estimates from similar foods in its
   records (a "drumstick curry" is priced like other vegetable curries), or from the kind
   of dish. You can correct any food later: "drumstick curry is 150 kcal". */
const FL_MEATY=/chicken|mutton|lamb|goat|fish|prawn|shrimp|egg|anda|paneer|keema|meat|beef|pork|whey/;
const FL_KIND=[[/curry|stew|kura|koora|sabzi|sabji|masala|gravy|fry|vepudu|poriyal|kootu|thoran|bhaji|pulusu|kuzhambu/,180,6],[/rice|biryani|pulao|bath|annam|khichdi/,330,7],
  [/dal|pappu|sambar|rasam/,180,9],[/sweet|halwa|kheer|payasam|laddu|ladoo|barfi|cake|pastry|mithai|jamun/,250,4],[/juice|shake|lassi|smoothie|drink|soda/,150,3],
  [/salad/,120,4],[/soup/,110,5],[/roti|chapati|paratha|naan|bread|dosa|idli/,150,4],[/chicken|mutton|fish|egg|prawn|meat|keema/,280,22],[/paneer|tofu|soya/,280,16]];
const flUnitWord=f=>f.u==='g'?'100 g':f.u;
function flGuess(phrase,unit){
  const words=flTokens(phrase).filter(t=>t.k==='w'&&t.t.length>2).map(t=>t.t),meaty=FL_MEATY.test(phrase.toLowerCase());
  const per=f=>unit&&FL_UNIT_G[unit]?f.k/f.g*FL_UNIT_G[unit]:f.u==='g'?f.k*(f.serv||100)/100:f.k;
  const kind=FL_KIND.find(([re])=>re.test(phrase.toLowerCase()));
  let like=FOODS.filter(f=>f.k>0&&f.tags!=='water'&&(meaty||!FL_MEATY.test(f.n.toLowerCase()))&&f.a.some(al=>al.split(' ').some(x=>x.length>2&&words.some(w=>flTokEq(w,x)))));
  if(kind)like=like.filter(f=>kind[0].test(f.n.toLowerCase()+' '+f.a.join(' '))); // a "stew" is priced like curries, not like biryani
  const med=a=>{a=a.slice().sort((x,y)=>x-y);return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2};
  if(like.length)return {k:Math.round(med(like.map(per))/5)*5,p:flR1(med(like.map(f=>f.p*per(f)/f.k))),from:like.slice(0,3).map(f=>f.n.toLowerCase())};
  return kind?{k:kind[1],p:kind[2],from:[]}:{k:200,p:6,from:[]};
}
/* "drumstick curry is 150 kcal", "2 rotis = 220 cal and 7 g protein" -> fix the food and today's entries. */
function flCorrect(ds,name,k,p){
  flBuildIndex(ds.custom);
  const r=flParseSeg(name),h=r.hits[0];ds.custom=ds.custom||{};
  let base,units=1;
  if(h){base=h.f;units=flUnits(h.f,h.qty,h.unit,h.size)||1}
  else{const key=r.unknown.join(' ');if(!key)return null;units=r.qty||1;
    const u=r.unit&&!FL_BYG.includes(r.unit)?r.unit:'serving';base=ds.custom[key]||{n:key.replace(/\b\w/g,c=>c.toUpperCase()),a:[key],u,g:FL_UNIT_G[u]||100,k:0,p:0,c:0,f:0,fb:0,s:0,tags:''}}
  const k1=k/units,p1=p===null?null:p/units,sc=base.k?k1/base.k:0,pr=p1!==null?p1:sc?base.p*sc:flGuess(base.n,base.u).p;
  const rest=Math.max(0,k1-pr*4);
  const nf=Object.assign({},base,{k:Math.round(k1),p:flR1(pr),custom:true,est:false},sc&&base.c+base.f>0?{c:flR1(base.c*sc),f:flR1(base.f*sc),fb:flR1(base.fb*sc),s:flR1(base.s*sc)}:{c:flR1(rest*.55/4),f:flR1(rest*.45/9)});
  ds.custom[base.custom?Object.keys(ds.custom).find(x=>ds.custom[x]===base)||base.a[0]:base.a[0]]=nf;
  let fixed=0;flDay(ds).items.forEach(i=>{if(i.n===base.n){['k','p','c','f','fb','s'].forEach(x=>i[x]=x==='k'?Math.round(nf.k*i.units):flR1((nf[x]||0)*i.units));i.est=false;fixed++}});
  return {f:nf,fixed};
}

/* "Same as yesterday", "same breakfast as yesterday": copy yesterday's foods. */
function flYesterday(ds,low){
  const y=(ds.food||{})[addDays(todayStr(),-1)],m=(flTokens(low).find(t=>t.k==='meal')||{}).m||null;
  const items=(y?y.items:[]).filter(i=>!m||i.meal===m).map(i=>{const c=Object.assign({},i);delete c.id;delete c.batch;delete c.t;return c});
  return {items,water:0,unknown:[],meal:m,skipped:[]};
}

/* A short report and what to eat next. */
function flSummary(ds){
  const day=flDay(ds),T=foodTargets(ds),t=flTotals(day),pl=Math.max(0,Math.round(T.p-t.p)),kl=Math.max(0,T.kcal-t.k);
  let say=`So far: ${fmtK(t.k)} of ${fmtK(T.kcal)} kcal, ${Math.round(t.p)} of ${T.p} g protein, ${Math.round(t.c)} g carbs, ${Math.round(t.f)} g fat, ${Math.round(t.fb)} g fiber, ${Math.round(t.s)} g sugar, ${day.water} of ${T.water} glasses of water.`;
  if(pl>15){const ok=DIET_TYPES[ds.type].allow,rs=RECIPES.filter(r=>ok.includes(r.tag)&&r.kcal<=Math.max(250,kl)).sort((a,b)=>b.p-a.p).slice(0,2);
    say+=` You still need ${pl} g protein${rs.length?`. Try ${rs.map(r=>`${r.n} (${r.p} g)`).join(' or ')} from your recipe book`:''}.`}
  else if(kl>300)say+=` ${fmtK(kl)} kcal to go: add rice, rotis, fruit or nuts.`;
  else say+=' Right on track. Who even are you?';
  if(day.water<T.water)say+=` Drink ${flR1(T.water-day.water)} more glass${T.water-day.water>1?'es':''} of water.`;
  return say;
}

/* ---------- moods over time ---------- */
const FL={open:false,idle:0,idleT:null,mic:null,typing:0};
function baseMood(){const h=flHour();return h>=23||h<5?'drowsy':'idle'}
/* Bored after 25 s of nothing in the chat, asleep after 60 s. Any input wakes it. */
function flIdleWatch(){
  clearTimeout(FL.idleT);
  FL.idleT=setTimeout(()=>{if(!FL.open)return;Bot.setMood('bored');
    FL.idleT=setTimeout(()=>{if(FL.open){Bot.setMood('sleeping');flStatus('asleep')}},35000)},25000);
}
function flWake(){
  const was=Bot.anim==='sleeping'||Bot.mood==='sleeping'||Bot.mood==='bored';
  Bot.setMood(baseMood());if(was){Bot.react('waking',1600);flStatus('waking up')}
  flIdleWatch();
}
const FL_STATUS={idle:'online',listening:'listening…',thinking:'thinking…',searching:'searching records…',working:'calculating…',sleeping:'asleep',drowsy:'sleepy',bored:'bored'};
function flStatus(t){const e=$('botMood');if(e)e.textContent=t}

/* ---------- Diet tab card ---------- */
function fuelCardHTML(){
  const ds=dietState(),day=flDay(ds),T=foodTargets(ds),t=flTotals(day),st=fcState(ds,T,t,day);
  const pct=Math.min(1,t.k/T.kcal),bar=(l,v,max,cls='')=>`<div class="fc-bar ${cls}"><span>${l}</span><i><em style="width:${Math.min(100,v/max*100)}%"></em></i><b>${Math.round(v)}<small>/${max} g</small></b></div>`;
  const week=Array.from({length:7},(_,i)=>{const d=addDays(todayStr(),i-6),x=(ds.food||{})[d],k=x?flTotals(x).k:0;return {d,k}});
  return `<div class="fuel-card">
    <div class="fc-top"><div class="fc-bot" id="botStageDiet" data-act="botOpen" aria-label="Talk to Arrow"></div>
      <div class="fc-say"><p class="overline">Arrow · Food log</p><p class="fc-line">${esc(st.line)}</p></div></div>
    <div class="fc-main"><div class="fc-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg${t.k>T.kcal*1.1?' over':''}" cx="60" cy="60" r="52" style="stroke-dasharray:326.7;stroke-dashoffset:${326.7*(1-pct)}"/></svg>
      <div><b>${fmtK(t.k)}</b><span>of ${fmtK(T.kcal)} kcal</span></div></div>
      <div class="fc-bars">${bar('Protein',t.p,T.p,'p')}${bar('Carbs',t.c,T.c)}${bar('Fat',t.f,T.f)}${bar('Fiber',t.fb,T.fb)}${bar('Sugar',t.s,T.s,t.s>T.s?'over':'')}</div></div>
    <div class="fc-water"><span class="overline">Water · tap a glass</span><b>${day.water}/${T.water}</b><div class="glasses">${Array.from({length:T.water},(_,i)=>`<button class="gl${i<Math.floor(day.water)?' on':''}" data-act="flWater" data-arg="${i+1}" aria-label="${i+1} glasses"></button>`).join('')}</div></div>
    <p class="overline fc-wk-l">Calories · last 7 days</p>
    <div class="fc-week" aria-label="Calories, last 7 days">${week.map(w=>`<i class="${w.d===todayStr()?'now':''}${w.k>T.kcal*1.1?' over':''}" style="--h:${Math.min(100,w.k/T.kcal*100)}%" data-tip="${fmtDate(w.d)}: ${fmtK(w.k)} kcal"><span>${'SMTWTFS'[new Date(w.d+'T00:00:00Z').getUTCDay()]}</span></i>`).join('')}</div>
    <div class="fc-acts"><button class="btn" data-act="botOpen">${ic('zap')}Tell me what you ate</button>${FL_SR?`<button class="icon-btn fc-mic" data-act="botMic" aria-label="Speak to Arrow">${micIcon()}</button>`:''}</div>
  </div>`;
}
/* The card's line and the bot's resting mood come from how the day is going. */
function fcState(ds,T,t,day){
  const h=flHour();
  if(!ds.body)return {line:'Hi, I\'m Arrow. Tap me and tell me what you ate. I count the rest. And judge a little.',mood:'curious'};
  if(t.k>T.kcal*1.3)return {line:`${Math.round(t.k/T.kcal*100)}% of today's calories. Even a bulk has limits, champ.`,mood:'scared'};
  if(t.k>=T.kcal*.9&&t.p>=T.p&&day.water>=T.water)return {line:'Every target hit today. I\'m emotional.',mood:'proud'};
  if(t.s>T.s)return {line:`Sugar is over the limit (${Math.round(t.s)} of ${T.s} g). I saw that.`,mood:'suspicious'};
  if(!day.items.length)return {line:h<5||h>=23?'Late night. Log today\'s food before the day resets.':`Nothing logged yet. What was ${mealNow()==='snack'?'your last meal':mealNow()}? Don't make me guess.`,mood:h>=23||h<5?'drowsy':h>=13?'bored':'idle'};
  const pl=Math.max(0,Math.round(T.p-t.p)),kl=Math.max(0,T.kcal-t.k);
  if(pl)return {line:`${pl} g protein and ${fmtK(kl)} kcal to go today. Chop chop.`,mood:baseMood()};
  return {line:kl?`Protein done. ${fmtK(kl)} kcal to go.`:'Calories and protein done. Now drink your water.',mood:'happy'};
}
function mountDietBot(){
  const el=$('botStageDiet');if(!el||FL.open||BotGame.on||$('diet').hidden)return;
  const ds=dietState(),day=flDay(ds);
  Bot.mount(el);Bot.setMood(fcState(ds,foodTargets(ds),flTotals(day),day).mood);Bot.resume();
}

/* ---------- chat layer ---------- */
const FL_SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const FL_HINTS=['e.g. 2 rotis, dal and a glass of milk','e.g. rendu idlis tinna','e.g. do roti aur dal khayi','e.g. what should I eat?','e.g. what\'s my streak?','e.g. protein in paneer?','e.g. start my workout'];
/* Quick replies under the chat: the usual meal when it's due, then the everyday ones. */
function flChips(){
  const ds=dietState(),day=flDay(ds),m=mealNow(),u=arHabits(ds)[m],c=[];
  if(u&&!day.items.some(i=>i.meal===m))c.push(['arrowUsual',`Usual ${m}`,m]);
  c.push(['flQuick','Water +1','water'],['arrowAsk','What should I eat?','what should i eat'],['flQuick','Summary','summary'],['flQuick','Undo','undo']);
  const el=$('botChips');if(el)el.innerHTML=c.slice(0,5).map(([a,l,v])=>`<button class="fchip" data-act="${a}" data-arg="${esc(v)}">${esc(l)}</button>`).join('');
}
const micIcon=()=>'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
function openBot(withMic){
  const L=$('botLayer'),ds=dietState();FL.open=true;
  L.hidden=false;L.classList.remove('show');void L.offsetWidth;L.classList.add('show');document.body.classList.add('locked');
  L.innerHTML=`<div class="bot-top"><button class="icon-btn" data-act="botClose" aria-label="Close">${ic('left')}</button>
      <div class="bt-id"><b>Arrow</b><span id="botMood">online</span></div><button class="icon-btn" data-act="botSetup" aria-label="Body and goal">${ic('user')}</button></div>
    <div class="bot-hero"><div class="bot-stage" id="botStageChat" data-act="botPoke" aria-label="Arrow"></div><i class="bot-shadow"></i></div>
    <div class="bot-totals" id="botTotals"></div>
    <div class="bot-chat" id="botChat" aria-live="polite"></div>
    <div class="bot-input"><div class="bot-chips" id="botChips"></div>
      <form id="botForm" class="bot-form"><input id="botIn" autocomplete="off" enterkeyhint="send" placeholder="${FL_HINTS[Math.floor(Math.random()*FL_HINTS.length)]}" aria-label="Message Arrow">
        ${FL_SR?`<button type="button" class="bot-mic" data-act="botMic" aria-label="Speak">${micIcon()}</button>`:''}<button class="bot-send" type="submit" aria-label="Send">${ic('right')}</button></form></div>`;
  Bot.mount($('botStageChat'));Bot.setMood(baseMood());Bot.resume();
  const day=flDay(ds);
  if(!ds.arrowMet){ds.arrowMet=true;flSay(ds,arSay('intro'));Bot.react('excited',2400)}
  if(!ds.body){flSay(ds,'Before I count anything, I need your height, age and sex. Your goal is set to lean bulk.',null,'setup');Bot.react('curious',3000)}
  else if(!day.msgs.length){flSay(ds,`${arSay('greet')} Today's target: ${fmtK(foodTargets(ds).kcal)} kcal and ${foodTargets(ds).p} g protein.`);Bot.react('waking',1800)}
  else Bot.react('happy',1600);
  saveDietState(ds);renderBot();flIdleWatch();
  const inp=$('botIn');
  $('botForm').addEventListener('submit',e=>{e.preventDefault();flSend(inp.value);inp.value=''});
  inp.addEventListener('input',()=>{flWake();if(Bot.anim!=='listening'){Bot.play('listening');flStatus('listening…')}clearTimeout(FL.typing);FL.typing=setTimeout(()=>{if(!FL.mic&&Bot.anim==='listening'){Bot.settle();flStatus('online')}},1400)});
  inp.addEventListener('focus',flWake);
  if(withMic)setTimeout(flMic,350);
}
function closeBot(){
  FL.open=false;clearTimeout(FL.idleT);if(FL.mic)try{FL.mic.abort()}catch(e){}
  $('botLayer').hidden=true;document.body.classList.remove('locked');renderDiet();arrowHome();
}
function flSay(ds,text,items,kind){const day=flDay(ds);day.msgs.push({w:'bot',x:text,at:Date.now(),items:items||null,kind:kind||null});}
function renderBot(){
  const ds=dietState(),day=flDay(ds),T=foodTargets(ds),t=flTotals(day),chat=$('botChat');if(!chat)return;
  $('botTotals').innerHTML=[['kcal',t.k,T.kcal],['protein',t.p,T.p,'g'],['carbs',t.c,T.c,'g'],['fat',t.f,T.f,'g'],['fiber',t.fb,T.fb,'g'],['sugar',t.s,T.s,'g'],['water',day.water,T.water,'']]
    .map(([l,v,m,u])=>`<div class="bt-m${l==='sugar'&&v>m?' over':''}"><b>${fmtK(v)}</b><span>${l}</span><i><em style="width:${Math.min(100,v/m*100)}%"></em></i></div>`).join('');
  const item=id=>day.items.find(i=>i.id===id);
  const lastBot=day.msgs.map(m=>m.w).lastIndexOf('bot');
  chat.innerHTML=day.msgs.map((m,mi)=>{
    if(m.w==='me')return `<div class="msg me"><p>${esc(m.x)}</p></div>`;
    const live=mi===lastBot;
    const its=(m.items||[]).map(item).filter(Boolean);
    const form=m.kind&&mi===day.msgs.length-1&&(m.kind==='setup'||ds.pending);
    const multi=new Set(its.map(i=>i.meal)).size>1;
    return `<div class="msg bot${form?' wide':''}"><p>${esc(m.x)}</p>${its.length?`<ul class="msg-items">${its.map((i,ii)=>`${multi&&(!ii||its[ii-1].meal!==i.meal)?`<li class="mh">${MEAL_NAME[i.meal]||''}</li>`:''}<li><span>${esc(i.q)}</span><em>${i.est?'~':''}${fmtK(i.k)} kcal · ${Math.round(i.p)} g P</em><button data-act="flDel" data-arg="${i.id}" aria-label="Remove ${esc(i.q)}">${ic('x')}</button></li>`).join('')}</ul>`:''}
      ${m.recipes&&m.recipes.length?`<div class="msg-recs">${m.recipes.map(id=>RECIPE_BY_ID[id]).filter(Boolean).map(r=>`<button data-act="recipe" data-arg="${r.id}"><span>${esc(r.n)}</span><em>${r.p} g protein · ${r.kcal} kcal</em>${ic('right')}</button>`).join('')}</div>`:''}
      ${m.demo&&DEMOS[m.demo]?`<div class="msg-demo">${demoHTML(m.demo)}</div>`:''}
      ${m.chips&&m.chips.length&&live?`<div class="msg-chips">${m.chips.map(c=>`<button class="fchip" data-act="${c.a}" data-arg="${esc(c.arg||'')}">${esc(c.l)}</button>`).join('')}</div>`:''}
      ${live&&m.intent&&m.src&&!m.chips?`<button class="msg-wrong" data-act="arrowWrong">Not what I meant</button>`:''}
      ${m.kind==='setup'&&mi===day.msgs.length-1?setupForm(ds):''}${m.kind==='teach'&&mi===day.msgs.length-1&&ds.pending?teachForm(ds):''}</div>`}).join('');
  chat.scrollTop=chat.scrollHeight;flChips();startDemos();
  const sf=$('flSetup');if(sf)sf.addEventListener('submit',e=>{e.preventDefault();flSaveSetup()});
  const tf=$('flTeach');if(tf){tf.addEventListener('submit',e=>{e.preventDefault();flSaveTeach()});
    $('ftK').addEventListener('input',()=>{$('ftGo').textContent=$('ftK').value?'Save':'Estimate it'})}
}
function setupForm(ds){const b=ds.body||{};return `<form class="msg-form" id="flSetup">
  <label><span>Height</span><input id="fsH" type="number" inputmode="numeric" min="120" max="230" value="${b.h||''}" placeholder="cm" required></label>
  <label><span>Age</span><input id="fsA" type="number" inputmode="numeric" min="12" max="90" value="${b.age||''}" placeholder="years" required></label>
  <div class="msg-seg" role="radiogroup" aria-label="Sex">${[['m','Male'],['f','Female']].map(([k,l])=>`<label><input type="radio" name="fsS" value="${k}" ${(b.sex||'m')===k?'checked':''}><span>${l}</span></label>`).join('')}</div>
  <div class="msg-seg" role="radiogroup" aria-label="Goal">${Object.entries(GOALS).map(([k,g])=>`<label><input type="radio" name="fsG" value="${k}" ${(ds.goal||'bulk')===k?'checked':''}><span>${g.n}</span></label>`).join('')}</div>
  <button class="btn sm" type="submit">Set my targets</button></form>`}
const FL_BYG=['g','kg','ml','l'];
const teachUnit=p=>FL_BYG.includes(p.unit)?'100 g':p.unit||'serving';
function teachForm(ds){const p=ds.pending;return `<form class="msg-form" id="flTeach">
  <label><span>kcal per ${esc(teachUnit(p))}</span><input id="ftK" type="number" inputmode="numeric" min="1" max="3000" placeholder="not sure"></label>
  <label><span>Protein (g)</span><input id="ftP" type="number" inputmode="decimal" min="0" max="200" placeholder="not sure"></label>
  <p class="msg-hint">Don't know? Leave both blank and I'll estimate from similar foods.</p>
  <div class="msg-btns"><button class="btn sm" type="submit" id="ftGo">Estimate it</button><button class="btn sm ghost" type="button" data-act="flTeachSkip">Skip</button></div></form>`}
function flSaveSetup(){
  const ds=dietState(),h=+$('fsH').value,a=+$('fsA').value,sx=(document.querySelector('input[name=fsS]:checked')||{}).value||'m',g=(document.querySelector('input[name=fsG]:checked')||{}).value||'bulk';
  if(!h||!a)return;ds.body={h,age:a,sex:sx};ds.goal=g;
  const T=foodTargets(ds);flDay(ds).msgs.forEach(m=>{if(m.kind==='setup')m.kind=null});
  flSay(ds,`Targets set for ${GOALS[g].n}: ${fmtK(T.kcal)} kcal, ${T.p} g protein, ${T.c} g carbs, ${T.f} g fat, ${T.fb} g fiber, sugar under ${T.s} g, and ${T.water} glasses of water. Now tell me what you ate.`);
  saveDietState(ds);renderBot();Bot.react('proud',2600);buzz('level');
}
function flSaveTeach(){
  const ds=dietState(),p=ds.pending;if(!p)return;
  const kIn=+$('ftK').value||0,pIn=$('ftP').value===''?null:+$('ftP').value,byG=FL_BYG.includes(p.unit),u=byG?'g':p.unit||'serving';
  const g=flGuess(p.phrase,byG?null:u),est=!kIn,k=kIn||g.k,pr=pIn!==null?pIn:est?g.p:flR1(g.p*kIn/g.k);
  const rest=Math.max(0,k-pr*4),key=p.phrase.toLowerCase();
  /* Remembered in the unit it was described in: "a dragonfruit bowl" -> per bowl, "200 g tofu" -> per 100 g. */
  ds.custom=ds.custom||{};ds.custom[key]={n:p.phrase.replace(/\b\w/g,c=>c.toUpperCase()),a:[key],u,g:byG?100:FL_UNIT_G[u]||100,serv:byG?100:0,k,p:pr,c:Math.round(rest*.55/4),f:Math.round(rest*.45/9),fb:0,s:0,tags:'',custom:true,est};
  delete ds.pending;flDay(ds).msgs.forEach(m=>{if(m.kind==='teach')m.kind=null});
  if(est)flSay(ds,`I'll count "${p.phrase}" as about ${k} kcal and ${Math.round(pr)} g protein per ${byG?'100 g':u}${g.from.length?`, like ${g.from.join(', ')}`:''}. If you find the real number, tell me: "${p.phrase} is ${k} kcal".`);
  saveDietState(ds);
  flSend(`${p.qty||1} ${p.unit?p.unit+' ':''}${p.phrase} for ${p.meal}`,true);
}
/* Send a message: show it, let Arrow think, answer. force = the intent the Player picked. */
function flSend(text,quiet,force,note){
  text=(text||'').trim();if(!text)return;
  const ds=dietState(),day=flDay(ds);clearTimeout(FL.typing);
  if(!quiet)day.msgs.push({w:'me',x:text,at:Date.now()});
  saveDietState(ds);renderBot();flWake();
  Bot.play('thinking');flStatus('thinking…');
  const r=arrowReply(ds,text,force);if(!r)return;
  if(note==='learned')r.say=arSay('learned')+' '+r.say;
  setTimeout(()=>{
    if(r.work&&r.work!=='thinking'){Bot.play(r.work);flStatus(FL_STATUS[r.work]||'working…')}
    setTimeout(()=>{
      if(r.clear)Object.values(ds.food||{}).forEach(d=>{d.msgs=[]});
      day.msgs.push({w:'bot',x:r.say,at:Date.now(),items:r.items||null,kind:r.ask||null,recipes:r.recipes||null,chips:r.chips||null,demo:r.demo||null,intent:r.intent||null,src:quiet||force?null:text});
      saveDietState(ds);renderBot();
      Bot.react(r.mood||'happy',r.mood==='celebrate'?4600:2800);flStatus('online');buzz(r.items&&r.items.length?'done':'tap');
      if(r.after)setTimeout(()=>{const d2=dietState();flSay(d2,r.after.say);saveDietState(d2);renderBot();Bot.react(r.after.mood,r.after.mood==='celebrate'?5000:3200);buzz('level')},1500);
      if(r.act)setTimeout(r.act,1100);
    },r.work&&r.work!=='thinking'?800:0);
  },550);
}
/* Voice: Web Speech API (Chrome, Edge, Safari). Words appear as you speak; it sends when you stop. */
function flMic(){
  if(!FL_SR){toast('Voice input is not supported in this browser');return}
  if(!FL.open){openBot(true);return}
  if(FL.mic){try{FL.mic.stop()}catch(e){}return}
  const rec=new FL_SR(),inp=$('botIn');rec.lang='en-IN';rec.interimResults=true;rec.maxAlternatives=1;
  let final='';FL.mic=rec;$('botLayer').classList.add('rec');Bot.play('listening');flStatus('listening…');buzz('set');
  rec.onresult=e=>{let s='';for(const res of e.results)s+=res[0].transcript;inp.value=s;final=s};
  rec.onerror=e=>{if(e.error==='not-allowed')toast('Allow microphone access to talk to Arrow')};
  rec.onend=()=>{FL.mic=null;const L=$('botLayer');if(L)L.classList.remove('rec');Bot.settle();flStatus('online');if(final.trim()){flSend(final);inp.value=''}};
  try{rec.start()}catch(e){FL.mic=null}
}
ACT.botOpen=()=>openBot(false);
ACT.botClose=closeBot;
ACT.botMic=flMic;
ACT.botSetup=()=>{const ds=dietState();flSay(ds,'Update your height, age, sex or goal.',null,'setup');saveDietState(ds);renderBot();Bot.react('curious',2400)};
ACT.botPoke=()=>{flWake();Bot.squish();Bot.react(['playful','laughing','shy','surprised','happy'][Math.floor(Math.random()*5)],1800);buzz('tap')};
ACT.flQuick=v=>flSend(v==='water'?'1 glass of water':v);
ACT.flDel=id=>{const ds=dietState(),day=flDay(ds),i=day.items.find(x=>x.id===id);if(!i)return;day.items=day.items.filter(x=>x!==i);
  flSay(ds,`Removed ${i.q}.`);saveDietState(ds);renderBot();Bot.react('sad',2000)};
ACT.flTeachSkip=()=>{const ds=dietState();delete ds.pending;flDay(ds).msgs.forEach(m=>{if(m.kind==='teach')m.kind=null});flSay(ds,'Skipped. Tell me something else.');saveDietState(ds);renderBot();Bot.react('sad',1600)};
ACT.flWater=n=>{const ds=dietState(),day=flDay(ds);n=+n;day.water=day.water>=n?n-1:n;const T=foodTargets(ds);
  saveDietState(ds);renderDiet();buzz('tap');if(day.water>=T.water){Bot.react('proud',2400)}else Bot.react('happy',1400)};
