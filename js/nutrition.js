/* Hunter System: nutrition. A recipe book, plus the System bot's food log (foodlog.js).
   Diet type and weight set the protein target; the day plan suggests meals that
   hit it; recipes open as full cards; picked recipes build a grocery list. */
const NF={q:'',filters:new Set(),meal:'all'};
const FILTERS=[['protein','High protein'],['quick','Under 15 min'],['budget','Budget'],['pre','Pre-workout'],['post','Post-workout'],['global','Global']];

function proteinTarget(w){return {low:Math.round(w*.83),high:Math.round(w*1.2)}}
function allowedRecipes(type){const a=DIET_TYPES[type].allow;return RECIPES.filter(r=>a.includes(r.tag))}
function totalMin(r){return r.prep+r.cook}
function recipeMatches(r){
  const q=NF.q.trim().toLowerCase();
  if(q&&!(r.n.toLowerCase().includes(q)||r.ing.some(i=>i.split('|')[2].toLowerCase().includes(q))))return false;
  if(NF.meal!=='all'&&r.meal!==NF.meal)return false;
  for(const f of NF.filters){
    if(f==='protein'&&r.p<18)return false;
    if(f==='quick'&&totalMin(r)>15)return false;
    if(f==='budget'&&r.cost>1)return false;
    if((f==='pre'||f==='post')&&!r.flags.includes(f))return false;
    if(f==='global'&&r.cuisine!=='Global')return false;
  }
  return true;
}

/* ---------- day plan ----------
   Picks breakfast, lunch, dinner and one or two snacks that land the day's
   protein inside the target range. Seeded, so the plan is stable until shuffled. */
function rng(seed){let h=hashStr(seed);return ()=>{h=Math.imul(h^(h>>>15),2246822519)>>>0;h=Math.imul(h^(h>>>13),3266489917)>>>0;return ((h^(h>>>16))>>>0)/4294967296}}
function buildPlan(ds,seed){
  const pool=allowedRecipes(ds.type),by=m=>pool.filter(r=>r.meal===m);
  const B=by('breakfast'),L=by('lunch'),Sn=by('snack'),D=by('dinner'),t=proteinTarget(ds.weight),mid=(t.low+t.high)/2;
  const rand=rng(seed);let best=null,bestScore=-Infinity;
  for(let i=0;i<500;i++){
    const pick=a=>a[Math.floor(rand()*a.length)];
    const ids=[pick(B),pick(L),pick(Sn),pick(D)];
    if(rand()<.5){const s2=pick(Sn);if(s2!==ids[2])ids.splice(3,0,s2)}
    const p=ids.reduce((a,r)=>a+r.p,0);
    let score=-Math.abs(p-mid);if(p<t.low||p>t.high+10)score-=40;
    score+=rand()*3; // a little variety between equally good plans
    if(score>bestScore){bestScore=score;best=ids}
  }
  return best.map(r=>r.id);
}
function currentPlan(ds){
  const today=todayStr();
  if(!ds.plan||ds.plan.date!==today||ds.plan.type!==ds.type||ds.plan.weight!==ds.weight){
    const n=ds.plan&&ds.plan.date===today?ds.plan.n||0:0;
    ds.plan={date:today,type:ds.type,weight:ds.weight,n,ids:buildPlan(ds,today+'|'+ds.type+'|'+n)};saveDietState(ds);
  }
  return ds.plan.ids.map(id=>RECIPE_BY_ID[id]).filter(Boolean);
}

/* ---------- render ---------- */
function recipeRow(r,label){
  return `<li><button class="lrow food-row" data-act="recipe" data-arg="${r.id}"><i class="dot ${r.tag}" aria-hidden="true"></i><div class="grow">
    ${label?`<p class="s" style="margin:0 0 2px">${label}</p>`:''}<p class="t">${r.n}</p>
    <p class="s"><b>${r.p}g</b> protein · ${r.kcal} kcal · ${totalMin(r)?totalMin(r)+' min':'No cooking'}${r.cuisine==='Global'?' · Global':''}</p></div>${ic('right')}</button></li>`;
}
function renderDiet(){
  const ds=dietState(),t=proteinTarget(ds.weight),plan=currentPlan(ds);
  const pTot=plan.reduce((a,r)=>a+r.p,0),kTot=plan.reduce((a,r)=>a+r.kcal,0),gCount=(ds.grocery&&ds.grocery.ids.length)||0;
  const inRange=pTot>=t.low&&pTot<=t.high+10;
  let h=`<div class="page-head"><h1 class="h1">Nutrition</h1><p class="muted">${RECIPES.length} recipes. Simple meals that hit your protein.</p></div>
    ${fuelCardHTML()}
    <div class="seg" role="radiogroup" aria-label="Diet type">${Object.entries(DIET_TYPES).map(([k,v])=>`<button role="radio" aria-checked="${ds.type===k}" data-act="dietType" data-arg="${k}">${v.label}</button>`).join('')}</div>

    <div class="card"><div class="protein"><p class="overline">Daily protein target</p><p class="pt-num num">${t.low}–${t.high}<small>g</small></p></div>
      <form class="weight-form" id="dwForm"><label class="field" for="dwIn">${ic('scale')}<input id="dwIn" type="number" inputmode="decimal" min="30" max="200" step="0.1" value="${ds.weight}" aria-label="Body weight in kg"><span class="faint">kg</span></label><button class="btn ghost sm" type="submit">Update</button></form>
      <p class="faint small" style="margin-top:10px">0.83 g/kg is the baseline. 1.2 g/kg is better for building muscle while training.</p></div>

    <button class="license-link" data-act="grocery"><span class="overline">Grocery list</span><span class="overline">${gCount?`${gCount} recipe${gCount>1?'s':''} →`:'Empty →'}</span></button>

    <div class="sec-label"><span class="overline">Today's plan</span><button class="small" data-act="planShuffle" style="text-decoration:underline;text-underline-offset:3px">Shuffle</button></div>
    <div class="card tight"><ul class="list plain">${plan.map((r,i)=>recipeRow(r,MEAL_LABEL[r.meal])).join('')}</ul></div>
    <div class="card" style="border-top:1px solid var(--hair)"><div class="card-head" style="margin:0"><div><p class="overline faint">Plan total</p><p class="h2 num" style="margin-top:4px">${pTot}g protein</p><p class="s faint" style="font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.05em;margin-top:4px">${kTot} kcal · add rice, roti or fruit for more energy</p></div>
      <span class="pill ${inRange?'good':'bad'}">${inRange?'On target':pTot<t.low?`${t.low-pTot}g short`:'Over target'}</span></div>
      <button class="btn ghost block" style="margin-top:14px" data-act="planShop">Add this plan to grocery list</button></div>

    <div class="sec-label"><span class="overline">Recipes</span><span class="small" id="recCount"></span></div>
    <div class="rec-tools">
      <label class="field search">${ic('book')}<input id="recQ" type="search" placeholder="Search recipes or ingredients" value="${esc(NF.q)}" aria-label="Search recipes"></label>
      <div class="chip-row" role="group" aria-label="Filters">${FILTERS.map(([k,l])=>`<button class="fchip" aria-pressed="${NF.filters.has(k)}" data-act="recFilter" data-arg="${k}">${l}</button>`).join('')}</div>
      <div class="seg" role="tablist" style="margin:12px 0 0">${[['all','All'],...MEAL_ORDER.map(m=>[m,MEAL_LABEL[m]])].map(([k,l])=>`<button role="tab" aria-selected="${NF.meal===k}" data-act="recMeal" data-arg="${k}">${l}</button>`).join('')}</div>
    </div>
    <div id="recResults"></div>

    <div class="card info-list" style="margin-top:22px"><p class="h3" style="padding:0 0 6px">How to read this</p>
      <p>Macros are per serving shown. Tap any recipe for ingredients, steps and a tip to raise its protein.</p>
      <p>The day plan covers protein. Add plain rice, rotis or fruit around it to match your hunger and training.</p>
      <p>Values come from USDA FoodData Central and ICMR-NIN. Home cooking varies, so treat them as close estimates.</p></div>`;
  $('diet').innerHTML=h;
  mountDietBot();
  renderRecipeResults();
  $('recQ').addEventListener('input',e=>{NF.q=e.target.value;renderRecipeResults()});
  $('dwForm').addEventListener('submit',e=>{
    e.preventDefault();
    const v=parseFloat($('dwIn').value);
    if(!v||v<30||v>200){toast('Enter a weight between 30 and 200 kg');return}
    const d=dietState();d.weight=Math.round(v*10)/10;saveDietState(d);renderDiet();toast('Weight updated');
  });
}
function renderRecipeResults(){
  const ds=dietState(),list=allowedRecipes(ds.type).filter(recipeMatches);
  $('recCount').textContent=`${list.length} found`;
  if(!list.length){$('recResults').innerHTML=`<div class="card state-card"><div class="state-ic">${ic('food')}</div><div><p class="h3">No recipes match</p><p class="muted small">Try fewer filters or a different search.</p></div></div>`;return}
  const meals=NF.meal==='all'?MEAL_ORDER:[NF.meal];
  $('recResults').innerHTML=meals.map(m=>{const rs=list.filter(r=>r.meal===m);if(!rs.length)return '';
    return `<div class="sec-label"><span class="overline">${MEAL_LABEL[m]}</span><span class="small">${rs.length}</span></div><div class="card tight"><ul class="list plain">${rs.map(r=>recipeRow(r)).join('')}</ul></div>`}).join('');
}
ACT.dietType=k=>{const d=dietState();d.type=k;saveDietState(d);renderDiet()};
ACT.recFilter=k=>{NF.filters.has(k)?NF.filters.delete(k):NF.filters.add(k);document.querySelectorAll('.fchip').forEach(b=>b.setAttribute('aria-pressed',NF.filters.has(b.dataset.arg)));renderRecipeResults()};
ACT.recMeal=k=>{NF.meal=k;document.querySelectorAll('[data-act=recMeal]').forEach(b=>b.setAttribute('aria-selected',b.dataset.arg===k));renderRecipeResults()};
ACT.planShuffle=()=>{const d=dietState();d.plan.n=(d.plan.n||0)+1;d.plan.ids=buildPlan(d,todayStr()+'|'+d.type+'|'+d.plan.n);saveDietState(d);buzz('tap');renderDiet()};
ACT.planShop=()=>{const d=dietState();const g=d.grocery;currentPlan(d).forEach(r=>{if(!g.ids.includes(r.id))g.ids.push(r.id)});saveDietState(d);renderDiet();toast('Plan added to grocery list')};

/* ---------- recipe card ---------- */
let recServ=1,recId=null;
function fmtQty(q){
  if(!q)return '';
  const whole=Math.floor(q),frac=q-whole,F={.25:'¼',.5:'½',.75:'¾'};
  const fr=Object.keys(F).find(k=>Math.abs(frac-k)<.01);
  if(fr)return (whole?whole:'')+F[fr];
  return Number.isInteger(q)?String(q):q.toFixed(1).replace(/\.0$/,'');
}
function ingLine(s,serv){
  const [q,u,item]=s.split('|'),n=+q*serv;
  if(!+q)return `<span class="q">To taste</span><span>${item}</span>`;
  return `<span class="q">${fmtQty(n)}${u?' '+u:''}</span><span>${item}</span>`;
}
function openRecipe(id){
  const r=RECIPE_BY_ID[id];if(!r)return;
  if(recId!==id){recServ=1;recId=id}
  const ds=dietState(),inList=ds.grocery.ids.includes(id),s=recServ;
  const L=$('recipeLayer');
  L.innerHTML=`<div class="set-top"><button class="icon-btn" data-act="recipeClose" aria-label="Back">${ic('left')}</button><span class="overline">${MEAL_LABEL[r.meal]} · ${r.cuisine}</span><span style="width:44px"></span></div>
    <h1 class="h1 rec-title">${r.n}</h1>
    <div class="chips" style="margin:12px 0 18px"><span class="pill ${r.tag==='nonveg'?'bad':r.tag==='egg'?'':'good'}"><i class="dot ${r.tag}" style="width:8px;height:8px;display:inline-block"></i>${DIET_TYPES[r.tag==='nonveg'?'nonveg':r.tag==='egg'?'egg':'veg'].label}</span>
      <span class="pill">${ic('timer')}${r.prep?`${r.prep} prep · `:''}${r.cook?`${r.cook} cook`:'no cooking'}</span><span class="pill">${r.diff}</span><span class="pill">${COST_LABEL[r.cost]}</span>
      ${r.flags.includes('pre')?'<span class="pill accent">Pre-workout</span>':''}${r.flags.includes('post')?'<span class="pill accent">Post-workout</span>':''}</div>
    <div class="macro-row">${[[r.p*s,'Protein','g'],[r.c*s,'Carbs','g'],[r.f*s,'Fiber','g'],[r.kcal*s,'kcal','']].map(([v,l,u])=>`<div><b>${v}<small>${u}</small></b><span>${l}</span></div>`).join('')}</div>
    <div class="sec-label"><span class="overline">Ingredients</span>
      <span class="serv"><button data-act="recServ" data-arg="-1" aria-label="Fewer servings">${ic('minus')}</button><b>${s} serving${s>1?'s':''}</b><button data-act="recServ" data-arg="1" aria-label="More servings">${ic('plus')}</button></span></div>
    <p class="faint small" style="margin:-2px 0 8px;font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.05em">1 serving = ${r.serv}</p>
    <ul class="ing">${r.ing.map(i=>`<li>${ingLine(i,s)}</li>`).join('')}</ul>
    <div class="sec-label"><span class="overline">Method</span><span class="small">${totalMin(r)} min total</span></div>
    <ol class="method">${r.steps.map(x=>`<li>${x}</li>`).join('')}</ol>
    <div class="card bad" style="margin-top:18px"><p class="overline" style="color:var(--red);margin-bottom:6px">Protein tip</p><p>${r.tip}</p></div>
    <div class="rec-foot"><button class="btn ${inList?'ghost':''} block" data-act="recList" data-arg="${id}">${inList?'In grocery list · remove':'Add to grocery list'}</button></div>`;
  if(L.hidden){L.hidden=false;L.classList.remove('show');void L.offsetWidth;L.classList.add('show');L.scrollTop=0}
  document.body.classList.add('locked');
}
function closeRecipe(){$('recipeLayer').hidden=true;recId=null;if($('menu').hidden&&$('cardLayer').hidden&&$('groceryLayer').hidden&&$('botLayer').hidden)document.body.classList.remove('locked')}
ACT.recipe=id=>{buzz('tap');openRecipe(id)};
ACT.recipeClose=closeRecipe;
ACT.recServ=d=>{recServ=Math.max(1,Math.min(6,recServ+(+d)));openRecipe(recId)};
ACT.recList=id=>{const d=dietState(),g=d.grocery,i=g.ids.indexOf(id);if(i>=0)g.ids.splice(i,1);else g.ids.push(id);saveDietState(d);buzz('tap');openRecipe(id);renderDiet();toast(i>=0?'Removed from grocery list':'Added to grocery list')};

/* ---------- grocery list ----------
   Ingredients from every listed recipe, merged by item and unit, grouped by
   aisle. Pantry staples (salt, spices, oil) go in a separate "check you have" list. */
function groceryItems(ds){
  const map=new Map();
  ds.grocery.ids.map(id=>RECIPE_BY_ID[id]).filter(Boolean).forEach(r=>r.ing.forEach(s=>{
    const [q,u,item,g]=s.split('|');if(item==='water')return;
    const name=item.replace(/^(small|medium|large) /i,''),key=name.toLowerCase();
    if(!map.has(key))map.set(key,{item:name,g,amounts:{}});
    const e=map.get(key);if(+q)e.amounts[u]=(e.amounts[u]||0)+ +q;
  }));
  return [...map.values()].map(e=>({...e,qty:Object.entries(e.amounts).map(([u,q])=>fmtQty(Math.round(q*100)/100)+(u?' '+u:'')).join(' + ')}));
}
function groceryText(ds){
  const items=groceryItems(ds),out=['Hunter System · grocery list',''];
  Object.entries(GROUPS).forEach(([g,label])=>{const xs=items.filter(i=>i.g===g);if(!xs.length)return;
    out.push(g==='S'?'Check you have:':label+':');xs.forEach(i=>out.push(`- ${i.item}${i.qty?` (${i.qty})`:''}`));out.push('')});
  return out.join('\n');
}
function openGrocery(){
  const ds=dietState(),items=groceryItems(ds),L=$('groceryLayer'),chk=ds.grocery.checked;
  const recs=ds.grocery.ids.map(id=>RECIPE_BY_ID[id]).filter(Boolean);
  let h=`<div class="set-top"><h1 class="h1">Grocery list</h1><button class="icon-btn" data-act="groceryClose" aria-label="Close">${ic('x')}</button></div>`;
  if(!recs.length){
    h+=`<div class="card state-card"><div class="state-ic">${ic('food')}</div><div><p class="h3">Your list is empty</p><p class="muted small">Add today's plan, or open any recipe and tap "Add to grocery list".</p></div></div>`;
  }else{
    h+=`<p class="muted small" style="margin-bottom:6px">For: ${recs.map(r=>r.n).join(', ')}.</p>`;
    Object.entries(GROUPS).forEach(([g,label])=>{const xs=items.filter(i=>i.g===g);if(!xs.length)return;
      h+=`<div class="sec-label"><span class="overline">${g==='S'?'Check you have':label}</span><span class="small">${xs.length}</span></div><div class="card tight"><ul class="list plain">${xs.map(i=>{const k=i.item.toLowerCase(),on=!!chk[k];
        return `<li class="${on?'done':''}"><button class="lrow" data-act="gTick" data-arg="${esc(k)}" aria-pressed="${on}"><span class="chk${on?' on':''}">${ic('check')}</span><span class="grow t">${i.item}</span><span class="target">${i.qty||''}</span></button></li>`}).join('')}</ul></div>`});
    h+=`<div class="card-actions"><button class="btn" data-act="gShare">Share list</button><button class="btn ghost" data-act="gCopy">Copy</button></div>
      <button class="btn quiet bad" style="margin:6px 0 40px" data-act="gClear">Clear list</button>`;
  }
  L.innerHTML=h;
  if(L.hidden){L.hidden=false;L.classList.remove('show');void L.offsetWidth;L.classList.add('show');L.scrollTop=0}
  document.body.classList.add('locked');
}
function closeGrocery(){$('groceryLayer').hidden=true;if($('menu').hidden&&$('cardLayer').hidden&&$('recipeLayer').hidden)document.body.classList.remove('locked')}
ACT.grocery=openGrocery;
ACT.groceryClose=closeGrocery;
ACT.gTick=k=>{const d=dietState();d.grocery.checked[k]=!d.grocery.checked[k];if(!d.grocery.checked[k])delete d.grocery.checked[k];saveDietState(d);buzz('tap');const y=$('groceryLayer').scrollTop;openGrocery();$('groceryLayer').scrollTop=y};
ACT.gClear=()=>{const d=dietState();d.grocery={ids:[],checked:{}};saveDietState(d);openGrocery();renderDiet()};
ACT.gCopy=async()=>{try{await navigator.clipboard.writeText(groceryText(dietState()));toast('List copied')}catch(e){toast('Copy not available here')}};
ACT.gShare=async()=>{const text=groceryText(dietState());if(navigator.share){try{await navigator.share({title:'Grocery list',text})}catch(e){}}else ACT.gCopy()};

/* ---------- pre/post workout picks (Quest tab) ---------- */
function fuelPicks(){
  const ds=dietState(),pool=allowedRecipes(ds.type),rand=rng(todayStr()+'|fuel|'+ds.type);
  const pick=(flag,n)=>{const a=pool.filter(r=>r.flags.includes(flag)).sort(()=>rand()-.5);return a.slice(0,n)};
  return {pre:pick('pre',2),post:pick('post',2)};
}
function fuelHTML(){
  const f=fuelPicks();
  return `<div class="sec-label"><span class="overline">Fuel</span><span class="small">Picked for today</span></div>
    <div class="card tight"><ul class="list plain">${f.pre.map(r=>recipeRow(r,'Before · 30–60 min')).join('')}${f.post.map(r=>recipeRow(r,'After · within 1 hour')).join('')}</ul></div>`;
}
