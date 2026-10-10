/* Hunter System: Gates (dungeons).
   A Dungeon Key opens a Gate of its grade or lower. Inside: waves of exercises
   and a boss wave, all against one time limit. Clear it for EXP and loot;
   run out of time or retreat and the Gate closes (the key is lost, no penalty).
   The run lives in S.dungeonRun with absolute deadlines, so it survives reloads. */
const gateOf=g=>DUNGEONS.find(d=>d.g===g);
const gi=g=>GRADES.indexOf(g);
/* A Gate's level: +1 per clear, up to GATE_MAX_LV. Each level adds 10% reps and EXP. */
function gateLevel(g){return Math.min(GATE_MAX_LV,1+S.dungeons.filter(d=>d.ok&&d.g===g).length)}
const lvMult=lv=>1+.1*((lv||1)-1);
/* The waves of a run: the alternative picked at entry, the amount scaled by the run's level. */
function runWaves(r){const d=gateOf(r.g),m=lvMult(r.lv);
  return d.waves.map((w,i)=>{const x=Array.isArray(w)?w[((r.picks||[])[i]||0)%w.length]:w;return Object.assign({},x,{amt:Math.round(x.amt*m)})})}
const waveOf=r=>runWaves(r)[r.wave];
const amtText=x=>`${x.amt}${x.hold?' s':''}`;
/* Lowest key that can open a gate of grade g, or null. */
function keyFor(g){return GRADES.slice(gi(g)).find(k=>S.inv.keys[k]>0)||null}
let gateFocus=null;

/* ---------- Gates tab ---------- */
function renderGates(){
  const run=S.dungeonRun,cleared=S.dungeons.filter(d=>d.ok).length;
  let h=`<div class="page-head"><h1 class="h1">Gates</h1><p class="muted">Open a Gate with a Dungeon Key. Clear every wave before time runs out.</p></div>`;
  if(run)h+=`<div class="card bad"><div class="card-head"><span class="h3">Gate in progress</span><span class="pill bad">${gateOf(run.g).name}</span></div>
    <p class="muted small">${run.deadline?`${fmtClock(Math.max(0,Math.ceil((run.deadline-Date.now())/1000)))} left.`:'Waiting at the entrance.'} Wave ${run.wave+1} of ${gateOf(run.g).waves.length}.</p>
    <button class="btn block" style="margin-top:14px" data-act="gateResume">Return to the Gate</button></div>`;
  h+=`<div class="sec-label"><span class="overline">Rank-up trial</span></div>${trialCardHTML('gates')}`;
  h+=`<div class="sec-label"><span class="overline">Inventory</span><span class="small">${itemCount()} item${itemCount()===1?'':'s'}</span></div>${inventoryHTML()}`;
  h+=armoryHTML();
  h+=`<div class="sec-label"><span class="overline">Gates</span><span class="small">${cleared} cleared</span></div>`;
  DUNGEONS.forEach(d=>{
    const k=keyFor(d.g),wins=S.dungeons.filter(x=>x.ok&&x.g===d.g).length,locked=gi(d.g)>gi(rankGrade())&&!k,lv=gateLevel(d.g);
    h+=`<div class="gate${k?' open':''}${gateFocus===d.g?' focus':''}${locked?' locked':''}" id="gate-${d.g}">
      <div class="gate-g">${d.g}</div>
      <div class="grow"><p class="overline">${d.limit} min · ${d.waves.length} waves · Lv ${lv}${wins?` · cleared ${wins}×`:''}</p>
        <p class="h2">${d.name}</p><p class="s gate-focus">${d.focus}</p><p class="s">Boss: ${d.boss}</p>
        <p class="s gate-drop" style="--rc:${RARITY[WEAPONS[GATE_WEAPON[d.g]].rarity].c}">${ic('sword')}${S.weapons[GATE_WEAPON[d.g]]?'':'Drops '}${esc(WEAPONS[GATE_WEAPON[d.g]].name)}${S.weapons[GATE_WEAPON[d.g]]?` · owned${refineOf(GATE_WEAPON[d.g])?' +'+refineOf(GATE_WEAPON[d.g]):''}`:''}</p>
        <p class="s faint">+${Math.round(d.exp*lvMult(lv))} EXP · ${dropText(d)}${S.titles.includes(d.title)?'':` · title "${d.title}"`}${lv>1?` · +${(lv-1)*10}% reps`:''}</p></div>
      ${run||S.trialRun?'':k?`<button class="btn sm" data-act="gateEnter" data-arg="${d.g}">Enter</button>`:`<span class="pill">${ic('key')}${d.g} key</span>`}</div>`;
  });
  const hist=S.dungeons.slice(-6).reverse();
  if(hist.length)h+=`<div class="sec-label"><span class="overline">Raid log</span></div><div class="card tight"><ul class="list plain">${hist.map(r=>`<li class="lrow" style="min-height:48px">
    <span class="lead">${r.g}</span><div class="grow"><p class="t">${gateOf(r.g).name}</p><p class="s">${fmtDate(r.date)}${r.ok?` · ${Math.floor(r.secs/60)}:${String(r.secs%60).padStart(2,'0')}`:''}</p></div><span class="pill ${r.ok?'good':'bad'}">${r.ok?'Cleared':'Failed'}</span></li>`).join('')}</ul></div>`;
  $('gates').innerHTML=h;
  if(gateFocus){const el=$('gate-'+gateFocus);if(el)el.scrollIntoView({block:'center'});gateFocus=null}
}
function dropText(d){
  return Object.entries(d.drops).map(([k,p])=>`${p<1?'chance of ':''}${p>1?p+'× ':''}${ITEMS[k].name}`).join(', ');
}
ACT.goGate=g=>{gateFocus=g;showTab('gates')};

/* ---------- entering ---------- */
ACT.gateEnter=g=>{
  const d=gateOf(g),k=keyFor(g);if(!k||S.dungeonRun||S.trialRun)return;
  if(want3D())load3D(); // start fetching the 3D world while the player decides
  openModal(`<div class="m-stamp">${d.name}</div>
    <p class="m-text">A <b>${g}-grade Gate</b> has opened: <b>${d.focus.toLowerCase()}</b>. ${d.waves.length} waves, boss: <b>${d.boss}</b>. Time limit <b>${d.limit} minutes</b>.</p>
    <p class="m-text">Gate level <b>${gateLevel(g)}</b>${gateLevel(g)>1?` (+${(gateLevel(g)-1)*10}% reps and EXP)`:''}. The moves change from run to run.</p>
    <p class="m-text">Uses 1 ${k}-grade key. If time runs out or you retreat, the Gate closes and the key is lost. There is no penalty.</p>
    <div class="m-btns"><button class="btn" data-act="gateOpen" data-arg="${g}">Open the Gate</button><button class="btn ghost" data-act="closeModal">Not now</button></div>`,'red','gate');
};
ACT.gateOpen=g=>{
  const k=keyFor(g);if(!k)return;
  const d=gateOf(g);
  S.inv.keys[k]--;S.dungeonRun={g,deadline:0,started:0,wave:0,done:0,hold:0,lv:gateLevel(g),picks:d.waves.map(w=>Array.isArray(w)?Math.floor(Math.random()*w.length):0)};save();
  closeModal();openDungeon(true);
};
ACT.gateResume=()=>openDungeon(false);

/* ---------- 3D worlds (world3d.js, loaded on first use) ---------- */
let W3=null,w3Load=null,w3Gl;
function webglOK(){if(w3Gl===undefined){try{const c=document.createElement('canvas');w3Gl=!!(c.getContext('webgl2')||c.getContext('webgl'))}catch(e){w3Gl=false}}return w3Gl}
const want3D=()=>!!S.profile&&S.profile.world3d!==false&&webglOK();
function load3D(){return w3Load||(w3Load=import(new URL('js/world3d.js',document.baseURI).href).then(m=>m.createWorld).catch(()=>null))}
function flash3D(){const f=document.querySelector('#dungeon .d3-flash');if(f){f.classList.remove('go');void f.offsetWidth;f.classList.add('go')}}
async function open3D(L,withPortal){
  L.className='layer w3d';
  L.innerHTML=`<canvas id="d3c" aria-hidden="true"></canvas><div class="d3-flash"></div><div id="dHud"><p class="d3-load">${withPortal?'The Gate is opening':'Entering the Gate'}</p></div>`;
  const create=await load3D(),r=S.dungeonRun;
  if(!create||!r||L.hidden)return false;
  const d=gateOf(r.g);
  const wid=equippedWeapon(),weapon=wid?{type:WEAPONS[wid].type,look:WEAPONS[wid].look}:null;
  try{W3=create($('d3c'),{grade:r.g,waves:d.waves.length,bossWave:d.waves.findIndex(w=>w.boss),reduced:reduceMotion.matches,weapon})}catch(e){W3=null;return false}
  L.onpointermove=e=>{if(W3)W3.look(e.clientX/innerWidth*2-1,e.clientY/innerHeight*2-1)};
  if(withPortal){buzz('alarm');await W3.enter(()=>{flash3D();buzz('set')})}
  if(!W3||!S.dungeonRun)return true;
  W3.goto(S.dungeonRun.wave,true);
  const w=waveOf(S.dungeonRun);if(w)W3.progress(S.dungeonRun.done/w.amt);
  dRender();return true;
}
async function openDungeon(withPortal){
  const L=$('dungeon');L.hidden=false;document.body.classList.add('locked');
  if(want3D()&&await open3D(L,withPortal))return;
  L.className='layer';
  if(withPortal){
    const d=gateOf(S.dungeonRun.g);
    L.innerHTML=`<div class="portal"><div class="pr r1"></div><div class="pr r2"></div><div class="pr r3"></div><div class="pr core"></div>
      <p class="portal-g">${d.g}</p></div><p class="portal-t">Gate opened</p>`;
    L.classList.remove('opening');void L.offsetWidth;L.classList.add('opening');buzz('alarm');
    setTimeout(()=>{L.classList.remove('opening');dRender()},1700);
  }else dRender();
}
function closeDungeon(){const L=$('dungeon');if(W3){W3.dispose();W3=null;L.innerHTML=''}L.hidden=true;L.className='layer';L.onpointermove=null;document.body.classList.remove('locked');renderAll();if(REVEALQ.length)setTimeout(()=>{if(revealIdle())nextReveal()},250)}
ACT.dClose=closeDungeon;

/* ---------- the raid ---------- */
ACT.dBegin=()=>{const r=S.dungeonRun;if(!r||r.deadline)return;const d=gateOf(r.g);r.started=Date.now();r.deadline=r.started+Math.round(d.limit*60000*armyMult('gateTime'));save();buzz('set');dRender()};
ACT.dAdd=n=>{const r=S.dungeonRun,w=waveOf(r);r.done=Math.min(w.amt,r.done+(+n));buzz('tap');save();if(W3){W3.hit();W3.progress(r.done/w.amt)}else slash2D=true;if(r.done>=w.amt)waveCleared();else dRender()};
let slash2D=false; // the 2D screen gets a blade slash across the counter
ACT.dHold=()=>{const r=S.dungeonRun,w=waveOf(r);r.hold=Date.now()+(w.amt-r.done)*1000;save();buzz('set');dRender()};
ACT.dHoldStop=()=>{const r=S.dungeonRun,w=waveOf(r);r.done=Math.min(w.amt,w.amt-Math.ceil((r.hold-Date.now())/1000));r.hold=0;save();dRender()};
ACT.dRetreat=()=>openModal(`<div class="m-stamp">Retreat?</div><p class="m-text">The Gate will close and the key is lost. No penalty.</p>
  <div class="m-btns"><button class="btn danger" data-act="dRetreatOk">Retreat</button><button class="btn ghost" data-act="closeModal">Keep fighting</button></div>`,'red','gate');
ACT.dRetreatOk=()=>{closeModal();gateFail(true)};

function waveCleared(){
  const r=S.dungeonRun,d=gateOf(r.g);
  r.wave++;r.done=0;r.hold=0;save();buzz('done');
  if(W3)W3.clearWave();
  if(r.wave>=d.waves.length){gateClear();return}
  if(W3)W3.goto(r.wave);
  dRender();
  const f=document.querySelector('.d-flash');if(f){f.classList.remove('go');void f.offsetWidth;f.classList.add('go')}
}
function gateClear(){
  const r=S.dungeonRun,d=gateOf(r.g),secs=Math.round((Date.now()-r.started)/1000),firstClear=!S.dungeons.some(x=>x.ok&&x.g===r.g);
  const reps=runWaves(r).filter(w=>!w.hold).reduce((a,w)=>a+w.amt*(w.side?2:1),0),lvBefore=gateLevel(r.g);
  const exp=Math.round(d.exp*lvMult(r.lv)*armyMult('gateExp'));
  S.totalReps+=reps;S.exp+=exp;
  const loot=[`+${exp} EXP`];
  const shUps=[];armyTrain(15*(gi(d.g)+1),shUps);const shLv=announceUps(shUps);
  Object.entries(d.drops).forEach(([k,p])=>{const n=p>=1?Math.floor(p):(Math.random()<p?1:0);if(n)loot.push(grantItem(k,n))});
  const wid=GATE_WEAPON[r.g];if(wid&&(firstClear||Math.random()<WEAPON_DROP))loot.push(grantWeapon(wid)); // the boss's weapon
  const firstTitle=!S.titles.includes(d.title);
  if(firstTitle)S.titles=[...S.titles,d.title];
  S.dungeons.push({g:r.g,date:todayStr(),ok:true,secs});S.dungeonRun=null;
  const up=syncLevel();save();
  const L=W3?$('dHud'):$('dungeon');if(W3)W3.victory();
  L.innerHTML=`${W3?'<div class="d3-spacer"></div>':''}<div class="d-result win${W3?' glass d3-result':''}"><div class="d-burst">${Array.from({length:12},(_,i)=>`<i style="--a:${i*30}deg"></i>`).join('')}</div>
    <p class="overline">${d.g}-grade Gate · ${d.name}</p><h2 class="d-big">Cleared</h2>
    <p class="m-text">${d.boss} has fallen in ${secs<60?secs+' seconds':Math.floor(secs/60)+' min '+String(secs%60).padStart(2,'0')+' s'}. ${reps} reps added to your total.${up?` <b>Level ${S.level}!</b>`:''}</p>
    ${firstTitle?`<div class="m-flag lvl-flag">New title · ${d.title}</div>`:''}${shLv.length?`<div class="m-flag">Shadows leveled · ${esc(shLv.join(', '))}</div>`:''}${gateLevel(d.g)>lvBefore?`<div class="m-flag">${d.name} is now Lv ${gateLevel(d.g)} · +10% reps and EXP</div>`:''}
    <p class="overline" style="margin-top:8px">Loot</p>${lootHTML(loot)}
    <button class="btn block" data-act="dClose" style="margin-top:18px">Leave the Gate</button></div>`;
  buzz('level');
  checkFeats();
}
function gateFail(retreat){
  const r=S.dungeonRun;if(!r)return;const d=gateOf(r.g);
  S.dungeons.push({g:r.g,date:todayStr(),ok:false,secs:0});S.dungeonRun=null;save();
  const L=W3?$('dHud'):$('dungeon');if(W3)W3.defeat();
  L.innerHTML=`${W3?'<div class="d3-spacer"></div>':''}<div class="d-result lose${W3?' glass d3-result':''}"><p class="overline">${d.g}-grade Gate · ${d.name}</p><h2 class="d-big">${retreat?'Retreated':'Gate closed'}</h2>
    <p class="m-text">${retreat?'You escaped before the boss could finish you.':'Time ran out before the dungeon was cleared.'} The key is gone. Train, then come back stronger.</p>
    <button class="btn block" data-act="dClose" style="margin-top:18px">Leave</button></div>`;
  buzz('bad');
}

/* ---------- render ---------- */
function dRender(){
  const r=S.dungeonRun;if(!r){closeDungeon();return}
  if(W3){$('dHud').innerHTML=dHud3();startDemos();return}
  const d=gateOf(r.g),ws=runWaves(r),w=ws[r.wave],L=$('dungeon');
  const left=r.deadline?Math.max(0,Math.ceil((r.deadline-Date.now())/1000)):Math.round(d.limit*60*armyMult('gateTime'));
  let h=`<div class="w-top"><button class="icon-btn" data-act="dClose" aria-label="Leave the screen (the Gate stays open)">${ic('left')}</button>
    <span class="w-pos"><span>${d.g}-grade · ${d.name}</span><b id="dgTime">${fmtClock(left)}</b></span>
    ${r.deadline?`<button class="icon-btn" data-act="dRetreat" aria-label="Retreat">${ic('x')}</button>`:'<span style="width:44px"></span>'}</div>
    <div class="w-prog">${ws.map((x,i)=>`<i class="${i<r.wave?'d':''}${i===r.wave?' c':''}${x.boss?' boss':''}"></i>`).join('')}</div>`;
  if(!r.deadline){
    h+=`<div class="w-body d-intro"><p class="overline">Gate of ${d.g} grade</p><h2 class="w-name">${d.name}</h2>
      <p class="muted" style="margin-top:-6px">Boss: ${d.boss}. Clear every wave in ${armyBonus('gateTime')?`${fmtClock(Math.round(d.limit*60*armyMult('gateTime')))} (+${armyBonus('gateTime')}% from your army)`:`${d.limit} minutes`}.</p>
      <ol class="method d-waves">${ws.map(x=>`<li><span>${x.boss?'<b class="boss-tag">Boss</b> ':''}${x.n} · ${amtText(x)}</span></li>`).join('')}</ol></div>
      <div class="w-foot"><button class="btn" data-act="dBegin">Begin the raid</button></div>`;
  }else{
    const remain=w.amt-r.done,holding=r.hold&&r.hold>Date.now();
    h+=`<div class="d-flash">Wave cleared</div><div class="w-body"><p class="overline">${w.boss?`Boss wave · ${d.boss}`:`Wave ${r.wave+1} of ${d.waves.length}`}</p>
      <h2 class="w-name${w.boss?' boss-name':''}">${w.n}</h2>${demoHTML(w.demo)}
      <div class="w-target">${slash2D?(slash2D=false,`<i class="d2-slash" style="--rc:${equippedWeapon()?WEAPONS[equippedWeapon()].look.glow:'#D7261E'}"></i>`):''}<p class="overline">${w.work?'Seconds of work':w.hold?'Seconds to hold':w.side?'Reps left, each side':'Reps left'}</p><div class="big-num" id="dgLeft">${holding?Math.ceil((r.hold-Date.now())/1000):remain}</div>
      <div class="prog${w.boss?' bad':''}" style="width:100%"><i style="width:${r.done/w.amt*100}%"></i></div></div></div>`;
    h+=w.hold
      ?`<div class="w-foot">${holding?`<button class="btn ghost" data-act="dHoldStop">Stop</button>`:`<button class="btn" data-act="dHold">Start ${remain}s${w.work?'':' hold'}</button>`}</div>`
      :`<div class="w-foot"><div class="row-btns" style="width:100%"><button class="btn ghost" data-act="dAdd" data-arg="5">+5</button><button class="btn ghost" data-act="dAdd" data-arg="10">+10</button><button class="btn" data-act="dAdd" data-arg="${remain}">All ${remain}</button></div></div>`;
  }
  L.innerHTML=h;startDemos();
}

/* The raid HUD over the 3D world: glass panels, the world shows through the middle. */
function dHud3(){
  const r=S.dungeonRun,d=gateOf(r.g),ws=runWaves(r),w=ws[r.wave];
  const left=r.deadline?Math.max(0,Math.ceil((r.deadline-Date.now())/1000)):Math.round(d.limit*60*armyMult('gateTime'));
  let h=`<div class="w-top"><button class="icon-btn" data-act="dClose" aria-label="Leave the screen (the Gate stays open)">${ic('left')}</button>
    <span class="w-pos"><span>${d.g}-grade · ${d.name}</span><b id="dgTime">${fmtClock(left)}</b></span>
    ${r.deadline?`<button class="icon-btn" data-act="dRetreat" aria-label="Retreat">${ic('x')}</button>`:'<span style="width:44px"></span>'}</div>
    <div class="w-prog">${ws.map((x,i)=>`<i class="${i<r.wave?'d':''}${i===r.wave?' c':''}${x.boss?' boss':''}"></i>`).join('')}</div>`;
  if(!r.deadline){
    h+=`<div class="d3-spacer"></div><div class="glass d3-intro"><p class="overline">Gate of ${d.g} grade · ${d.waves.length} waves</p><h2 class="d3-name">${d.name}</h2>
      <p class="d3-sub">Boss: ${d.boss}. Clear every wave in ${armyBonus('gateTime')?fmtClock(left):d.limit+' minutes'}.</p>
      <p class="d3-sub d3-focus">${d.focus} · Gate Lv ${r.lv||1}</p>
      <ol class="d3-waves">${ws.map((x,i)=>`<li${x.boss?' class="boss"':''}><b>${String(i+1).padStart(2,'0')}</b><span>${x.n}</span><em>${amtText(x)}</em></li>`).join('')}</ol>
      <button class="btn block" data-act="dBegin">Begin the raid</button></div>`;
    return h;
  }
  const remain=w.amt-r.done,holding=r.hold&&r.hold>Date.now();
  h+=`<div class="d-flash">Wave cleared</div>
    <div class="d3-wave"><p class="overline">${w.boss?`Boss wave · ${d.boss}`:`Wave ${r.wave+1} of ${d.waves.length}`}</p><h2 class="d3-name${w.boss?' boss':''}">${w.n}</h2></div>
    ${w.boss?`<div class="d3-hp"><span>${d.boss}</span><i><em id="dgHp" style="width:${(1-r.done/w.amt)*100}%"></em></i></div>`:''}
    <div class="d3-spacer"></div>
    <div class="glass d3-panel"><div class="d3-row">${demoHTML(w.demo)}<div class="d3-count"><p class="overline">${w.work?'Seconds of work':w.hold?'Seconds to hold':w.side?'Reps left, each side':'Reps left'}</p><b id="dgLeft">${holding?Math.ceil((r.hold-Date.now())/1000):remain}</b></div></div>
      <div class="prog${w.boss?' bad':''}"><i style="width:${r.done/w.amt*100}%"></i></div>
      ${w.hold?(holding?`<button class="btn ghost block" data-act="dHoldStop">Stop</button>`:`<button class="btn block" data-act="dHold">Start ${remain}s${w.work?'':' hold'}</button>`)
        :`<div class="row-btns"><button class="btn ghost" data-act="dAdd" data-arg="5">+5</button><button class="btn ghost" data-act="dAdd" data-arg="10">+10</button><button class="btn" data-act="dAdd" data-arg="${remain}">All ${remain}</button></div>`}</div>`;
  return h;
}

/* Ticker: countdown, holds, and time-outs (even if the raid screen is closed). */
setInterval(()=>{
  const r=S.dungeonRun;if(!r||!r.deadline)return;
  const now=Date.now(),t=$('dgTime');
  if(now>=r.deadline){if(!$('dungeon').hidden)gateFail(false);else{gateFail(false);$('dungeon').hidden=false;document.body.classList.add('locked')}return}
  if(t)t.textContent=fmtClock(Math.ceil((r.deadline-now)/1000));
  if(r.hold){
    const l=Math.ceil((r.hold-now)/1000),el=$('dgLeft');
    const amt=waveOf(r).amt;
    if(l<=0){r.done=amt;r.hold=0;save();if(W3)W3.progress(1);waveCleared()}
    else{if(el&&el.textContent!==String(l)){el.textContent=l;if(W3){W3.hit();const hp=$('dgHp');if(hp)hp.style.width=`${l/amt*100}%`}}}
  }
},250);
