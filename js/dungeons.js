/* Hunter System: Gates (dungeons).
   A Dungeon Key opens a Gate of its grade or lower. Inside: waves of exercises
   and a boss wave, all against one time limit. Clear it for EXP and loot;
   run out of time or retreat and the Gate closes (the key is lost, no penalty).
   The run lives in S.dungeonRun with absolute deadlines, so it survives reloads. */
const gateOf=g=>DUNGEONS.find(d=>d.g===g);
const gi=g=>GRADES.indexOf(g);
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
  h+=`<div class="sec-label"><span class="overline">Gates</span><span class="small">${cleared} cleared</span></div>`;
  DUNGEONS.forEach(d=>{
    const k=keyFor(d.g),wins=S.dungeons.filter(x=>x.ok&&x.g===d.g).length,locked=gi(d.g)>gi(rankGrade())&&!k;
    h+=`<div class="gate${k?' open':''}${gateFocus===d.g?' focus':''}${locked?' locked':''}" id="gate-${d.g}">
      <div class="gate-g">${d.g}</div>
      <div class="grow"><p class="overline">${d.limit} min · ${d.waves.length} waves${wins?` · cleared ${wins}×`:''}</p>
        <p class="h2">${d.name}</p><p class="s">Boss: ${d.boss}</p>
        <p class="s faint">+${d.exp} EXP · ${dropText(d)}${S.titles.includes(d.title)?'':` · title "${d.title}"`}</p></div>
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
  openModal(`<div class="m-stamp">${d.name}</div>
    <p class="m-text">A <b>${g}-grade Gate</b> has opened. ${d.waves.length} waves, boss: <b>${d.boss}</b>. Time limit <b>${d.limit} minutes</b>.</p>
    <p class="m-text">Uses 1 ${k}-grade key. If time runs out or you retreat, the Gate closes and the key is lost. There is no penalty.</p>
    <div class="m-btns"><button class="btn" data-act="gateOpen" data-arg="${g}">Open the Gate</button><button class="btn ghost" data-act="closeModal">Not now</button></div>`,'red','gate');
};
ACT.gateOpen=g=>{
  const k=keyFor(g);if(!k)return;
  S.inv.keys[k]--;S.dungeonRun={g,deadline:0,started:0,wave:0,done:0,hold:0};save();
  closeModal();openDungeon(true);
};
ACT.gateResume=()=>openDungeon(false);

function openDungeon(withPortal){
  const L=$('dungeon');L.hidden=false;document.body.classList.add('locked');
  if(withPortal){
    const d=gateOf(S.dungeonRun.g);
    L.innerHTML=`<div class="portal"><div class="pr r1"></div><div class="pr r2"></div><div class="pr r3"></div><div class="pr core"></div>
      <p class="portal-g">${d.g}</p></div><p class="portal-t">Gate opened</p>`;
    L.classList.remove('opening');void L.offsetWidth;L.classList.add('opening');buzz('alarm');
    setTimeout(()=>{L.classList.remove('opening');dRender()},1700);
  }else dRender();
}
function closeDungeon(){$('dungeon').hidden=true;document.body.classList.remove('locked');renderAll();if(REVEALQ.length)setTimeout(()=>{if(revealIdle())nextReveal()},250)}
ACT.dClose=closeDungeon;

/* ---------- the raid ---------- */
ACT.dBegin=()=>{const r=S.dungeonRun;if(!r||r.deadline)return;const d=gateOf(r.g);r.started=Date.now();r.deadline=r.started+Math.round(d.limit*60000*armyMult('gateTime'));save();buzz('set');dRender()};
ACT.dAdd=n=>{const r=S.dungeonRun,w=gateOf(r.g).waves[r.wave];r.done=Math.min(w.amt,r.done+(+n));buzz('tap');save();if(r.done>=w.amt)waveCleared();else dRender()};
ACT.dHold=()=>{const r=S.dungeonRun,w=gateOf(r.g).waves[r.wave];r.hold=Date.now()+(w.amt-r.done)*1000;save();buzz('set');dRender()};
ACT.dHoldStop=()=>{const r=S.dungeonRun,w=gateOf(r.g).waves[r.wave];r.done=Math.min(w.amt,w.amt-Math.ceil((r.hold-Date.now())/1000));r.hold=0;save();dRender()};
ACT.dRetreat=()=>openModal(`<div class="m-stamp">Retreat?</div><p class="m-text">The Gate will close and the key is lost. No penalty.</p>
  <div class="m-btns"><button class="btn danger" data-act="dRetreatOk">Retreat</button><button class="btn ghost" data-act="closeModal">Keep fighting</button></div>`,'red','gate');
ACT.dRetreatOk=()=>{closeModal();gateFail(true)};

function waveCleared(){
  const r=S.dungeonRun,d=gateOf(r.g);
  r.wave++;r.done=0;r.hold=0;save();buzz('done');
  if(r.wave>=d.waves.length){gateClear();return}
  dRender();
  const f=document.querySelector('.d-flash');if(f){f.classList.remove('go');void f.offsetWidth;f.classList.add('go')}
}
function gateClear(){
  const r=S.dungeonRun,d=gateOf(r.g),secs=Math.round((Date.now()-r.started)/1000);
  const reps=d.waves.filter(w=>!w.hold).reduce((a,w)=>a+w.amt,0);
  const exp=Math.round(d.exp*armyMult('gateExp'));
  S.totalReps+=reps;S.exp+=exp;
  const loot=[`+${exp} EXP`];
  const shUps=[];armyTrain(15*(gi(d.g)+1),shUps);const shLv=announceUps(shUps);
  Object.entries(d.drops).forEach(([k,p])=>{const n=p>=1?Math.floor(p):(Math.random()<p?1:0);if(n)loot.push(grantItem(k,n))});
  const firstTitle=!S.titles.includes(d.title);
  if(firstTitle)S.titles=[...S.titles,d.title];
  S.dungeons.push({g:r.g,date:todayStr(),ok:true,secs});S.dungeonRun=null;
  const up=syncLevel();save();
  const L=$('dungeon');
  L.innerHTML=`<div class="d-result win"><div class="d-burst">${Array.from({length:12},(_,i)=>`<i style="--a:${i*30}deg"></i>`).join('')}</div>
    <p class="overline">${d.g}-grade Gate · ${d.name}</p><h2 class="d-big">Cleared</h2>
    <p class="m-text">${d.boss} has fallen in ${secs<60?secs+' seconds':Math.floor(secs/60)+' min '+String(secs%60).padStart(2,'0')+' s'}. ${reps} reps added to your total.${up?` <b>Level ${S.level}!</b>`:''}</p>
    ${firstTitle?`<div class="m-flag lvl-flag">New title · ${d.title}</div>`:''}${shLv.length?`<div class="m-flag">Shadows leveled · ${esc(shLv.join(', '))}</div>`:''}
    <p class="overline" style="margin-top:8px">Loot</p>${lootHTML(loot)}
    <button class="btn block" data-act="dClose" style="margin-top:18px">Leave the Gate</button></div>`;
  buzz('level');
  checkFeats();
}
function gateFail(retreat){
  const r=S.dungeonRun;if(!r)return;const d=gateOf(r.g);
  S.dungeons.push({g:r.g,date:todayStr(),ok:false,secs:0});S.dungeonRun=null;save();
  const L=$('dungeon');
  L.innerHTML=`<div class="d-result lose"><p class="overline">${d.g}-grade Gate · ${d.name}</p><h2 class="d-big">${retreat?'Retreated':'Gate closed'}</h2>
    <p class="m-text">${retreat?'You escaped before the boss could finish you.':'Time ran out before the dungeon was cleared.'} The key is gone. Train, then come back stronger.</p>
    <button class="btn block" data-act="dClose" style="margin-top:18px">Leave</button></div>`;
  buzz('bad');
}

/* ---------- render ---------- */
function dRender(){
  const r=S.dungeonRun;if(!r){closeDungeon();return}
  const d=gateOf(r.g),w=d.waves[r.wave],L=$('dungeon');
  const left=r.deadline?Math.max(0,Math.ceil((r.deadline-Date.now())/1000)):Math.round(d.limit*60*armyMult('gateTime'));
  let h=`<div class="w-top"><button class="icon-btn" data-act="dClose" aria-label="Leave the screen (the Gate stays open)">${ic('left')}</button>
    <span class="w-pos"><span>${d.g}-grade · ${d.name}</span><b id="dgTime">${fmtClock(left)}</b></span>
    ${r.deadline?`<button class="icon-btn" data-act="dRetreat" aria-label="Retreat">${ic('x')}</button>`:'<span style="width:44px"></span>'}</div>
    <div class="w-prog">${d.waves.map((x,i)=>`<i class="${i<r.wave?'d':''}${i===r.wave?' c':''}${x.boss?' boss':''}"></i>`).join('')}</div>`;
  if(!r.deadline){
    h+=`<div class="w-body d-intro"><p class="overline">Gate of ${d.g} grade</p><h2 class="w-name">${d.name}</h2>
      <p class="muted" style="margin-top:-6px">Boss: ${d.boss}. Clear every wave in ${armyBonus('gateTime')?`${fmtClock(Math.round(d.limit*60*armyMult('gateTime')))} (+${armyBonus('gateTime')}% from your army)`:`${d.limit} minutes`}.</p>
      <ol class="method d-waves">${d.waves.map(x=>`<li><span>${x.boss?'<b class="boss-tag">Boss</b> ':''}${x.n} · ${x.amt}${x.hold?' sec':''}</span></li>`).join('')}</ol></div>
      <div class="w-foot"><button class="btn" data-act="dBegin">Begin the raid</button></div>`;
  }else{
    const remain=w.amt-r.done,holding=r.hold&&r.hold>Date.now();
    h+=`<div class="d-flash">Wave cleared</div><div class="w-body"><p class="overline">${w.boss?`Boss wave · ${d.boss}`:`Wave ${r.wave+1} of ${d.waves.length}`}</p>
      <h2 class="w-name${w.boss?' boss-name':''}">${w.n}</h2>${demoHTML(w.demo)}
      <div class="w-target"><p class="overline">${w.hold?'Seconds to hold':'Reps left'}</p><div class="big-num" id="dgLeft">${holding?Math.ceil((r.hold-Date.now())/1000):remain}</div>
      <div class="prog${w.boss?' bad':''}" style="width:100%"><i style="width:${r.done/w.amt*100}%"></i></div></div></div>`;
    h+=w.hold
      ?`<div class="w-foot">${holding?`<button class="btn ghost" data-act="dHoldStop">Stop</button>`:`<button class="btn" data-act="dHold">Start ${remain}s hold</button>`}</div>`
      :`<div class="w-foot"><div class="row-btns" style="width:100%"><button class="btn ghost" data-act="dAdd" data-arg="5">+5</button><button class="btn ghost" data-act="dAdd" data-arg="10">+10</button><button class="btn" data-act="dAdd" data-arg="${remain}">All ${remain}</button></div></div>`;
  }
  L.innerHTML=h;startDemos();
}

/* Ticker: countdown, holds, and time-outs (even if the raid screen is closed). */
setInterval(()=>{
  const r=S.dungeonRun;if(!r||!r.deadline)return;
  const now=Date.now(),t=$('dgTime');
  if(now>=r.deadline){if(!$('dungeon').hidden)gateFail(false);else{gateFail(false);$('dungeon').hidden=false;document.body.classList.add('locked')}return}
  if(t)t.textContent=fmtClock(Math.ceil((r.deadline-now)/1000));
  if(r.hold){
    const l=Math.ceil((r.hold-now)/1000),el=$('dgLeft');
    if(l<=0){r.done=gateOf(r.g).waves[r.wave].amt;r.hold=0;save();waveCleared()}
    else if(el)el.textContent=l;
  }
},250);
