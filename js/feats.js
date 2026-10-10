/* Hunter System: achievements ("feats") and titles.
   Each feat measures real progress, unlocks a title, and pays out items/EXP.
   checkFeats() runs after anything that can move a number. */
const completedDays=()=>Object.entries(S.log).filter(([,r])=>r.completed&&!r.rested);
const hourOf=r=>r.doneAt?new Date(r.doneAt).getHours():null;
function goalWeeks(){const m=new Set(completedDays().map(([d])=>mondayOf(d)));return [...m].filter(x=>trainedInWeek(x)>=5).length}
function minutesTrained(){return Object.values(S.log).reduce((a,r)=>a+(r.duration||0),0)}
function fullPushupDone(){const st=LADDERS.push.steps.map(s=>s[0]);return st.slice(3).some(n=>S.prs[n])||S.ladders.push.step>3}
const FEAT=(id,title,desc,target,prog,reward,exp)=>({id,title,desc,target,prog,reward,exp});
const FEATS=[
  FEAT('first-quest','The Beginning','Clear your first daily quest.',1,()=>S.totalQuests,[['key',1,'E']],25),
  FEAT('streak-7','Persistent','Reach a 7-day streak.',7,()=>S.bestStreak,[['box',1]],50),
  FEAT('streak-30','Iron Will','Reach a 30-day streak.',30,()=>S.bestStreak,[['holy',1]],150),
  FEAT('streak-60','Unbreakable','Reach a 60-day streak.',60,()=>S.bestStreak,[['holy',1],['elixir',1]],300),
  FEAT('early-riser','Early Riser','Clear 10 daily quests before 8 am.',10,()=>completedDays().filter(([,r])=>hourOf(r)!==null&&hourOf(r)<8).length,[['elixir',1]],75),
  FEAT('night-hunter','Night Hunter','Clear 10 daily quests after 9 pm.',10,()=>completedDays().filter(([,r])=>hourOf(r)!==null&&hourOf(r)>=21).length,[['elixir',1]],75),
  FEAT('wolf-slayer','Wolf Slayer','Log your first full push-up.',1,()=>fullPushupDone()?1:0,[['potion',1]],50),
  FEAT('reps-1k','Thousand Cuts','Log 1,000 total reps.',1000,()=>S.totalReps,[['box',1]],50),
  FEAT('reps-10k','Ten Thousand Strikes','Log 10,000 total reps.',10000,()=>S.totalReps,[['key',1]],200),
  FEAT('quests-50','Veteran','Clear 50 daily quests.',50,()=>S.totalQuests,[['box',2]],100),
  FEAT('quests-100','Centurion','Clear 100 daily quests.',100,()=>S.totalQuests,[['holy',1]],200),
  FEAT('goal-4','Disciplined','Hit the 5-day weekly goal in 4 different weeks.',4,goalWeeks,[['elixir',1]],100),
  FEAT('boss-5','Boss Slayer','Clear 5 Saturday boss days.',5,()=>completedDays().filter(([d])=>SPLIT[dowOf(d)].boss).length,[['box',1]],75),
  FEAT('gate-1','Gate Breaker','Clear your first Gate.',1,()=>S.dungeons.filter(d=>d.ok).length,[['box',1]],50),
  FEAT('gate-10','Raid Leader','Clear 10 Gates.',10,()=>S.dungeons.filter(d=>d.ok).length,[['key',1],['elixir',1]],200),
  FEAT('gate-s','National Level','Clear the S-grade Gate on Jeju Island.',1,()=>S.dungeons.some(d=>d.ok&&d.g==='S')?1:0,[['holy',1]],400),
  FEAT('shadow-1','Arise','Extract your first shadow.',1,()=>S.shadows.length,[['potion',1]],50),
  FEAT('shadow-10','Legion','Command 10 shadows.',10,()=>S.shadows.length,[['box',2]],150),
  FEAT('sudden-10','Ready for Anything','Clear 10 sudden quests.',10,()=>S.suddenDone,[['elixir',1]],100),
  FEAT('time-10h','Ten Hours','Train for 10 hours in total.',600,minutesTrained,[['box',1]],100),
  FEAT('cool-10','Supple','Finish 10 cool-downs.',10,()=>Object.values(S.log).filter(r=>r.cooled).length,[['potion',1]],50),
  FEAT('balanced','Jack of All Trades','Raise all five stats to 15.',15,()=>Math.floor(Math.min(...STATS.map(x=>S.stats[x]))),[['key',1]],150),
  FEAT('paid','Paid in Full','Clear a penalty quest.',1,()=>Object.values(S.log).filter(r=>r.penaltyDone).length,[],50)
];

function featProgress(f){return Math.min(f.target,Math.max(0,f.prog()||0))}
/* Unlock everything newly earned. silent: collect without notices (used for the catch-up on update). */
function checkFeats(silent){
  const got=[];
  FEATS.forEach(f=>{
    if(S.feats[f.id]||featProgress(f)<f.target)return;
    S.feats[f.id]=todayStr();
    S.titles=Array.from(new Set([...S.titles,f.title]));
    const loot=f.reward.map(([k,n,g])=>grantItem(k,n,g));
    if(f.exp){S.exp+=f.exp;loot.unshift(`+${f.exp} EXP`)}
    syncLevel();
    got.push({f,loot});
  });
  if(!got.length)return got;
  save();
  if(!silent)got.forEach(({f,loot})=>{
    reveal(`<div class="feat-stamp"><span>${ic('medal')}</span><p class="overline">Achievement unlocked</p></div>
      <div class="m-stamp feat-title">${f.title}</div><p class="m-text">${f.desc} New title earned.</p>
      <p class="overline">Rewards</p>${lootHTML(loot)}
      <div class="m-btns"><button class="btn" data-act="equipTitle" data-arg="${esc(f.title)}">Equip title</button><button class="btn ghost" data-act="closeModal">Continue</button></div>`,'sys','medal');
  });
  if(!silent)renderAll();
  return got;
}

/* Saves from before this update: extract shadows for existing records and unlock earned feats, once. */
function huntCatchUp(){
  if(!S.huntPending)return;
  delete S.huntPending;
  Object.entries(S.prs).sort((a,b)=>a[1].date.localeCompare(b[1].date)).forEach(([ex,p])=>extractShadow(ex,p.best,p.timed,true,p.date));
  const got=checkFeats(true);
  save();renderAll();
  if(!S.shadows.length&&!got.length)return;
  const loot=got.flatMap(g=>g.loot.filter(l=>!l.startsWith('+')));
  reveal(`<div class="m-stamp">System update</div>
    <p class="m-text">Your past training has been assessed. <b>${got.length}</b> achievement${got.length===1?'':'s'} unlocked${S.shadows.length?` and <b>${S.shadows.length}</b> shadow${S.shadows.length===1?'':'s'} extracted from your records`:''}.</p>
    ${loot.length?`<p class="overline">Items received</p>${lootHTML(loot)}`:''}
    <button class="btn" data-act="closeModal">Continue</button>`,'sys','medal');
}

/* ---------- titles ---------- */
function equipTitle(t){S.titleEquipped=t||null;save();renderAll();closeModal();toast(t?`Title equipped: ${t}`:'Title removed')}
ACT.equipTitle=equipTitle;

/* ---------- feats view (Progress tab) ---------- */
function featsHTML(){
  const n=FEATS.filter(f=>S.feats[f.id]).length;
  let h=`<div class="army-head"><div><p class="overline">Achievements</p><p class="army-n">${n}<small>/${FEATS.length}</small></p></div>
    <p class="muted small">Each one is a real milestone. It pays out items and a title you can equip.</p></div>`;
  if(S.titles.length)h+=`<div class="sec-label" style="margin-top:0"><span class="overline">Your titles</span><span class="small">Tap to equip</span></div>
    <div class="chips title-chips">${S.titles.map(t=>`<button class="fchip" aria-pressed="${S.titleEquipped===t}" data-act="equipTitle" data-arg="${esc(t)}">${esc(t)}</button>`).join('')}
    ${S.titleEquipped?`<button class="fchip" data-act="equipTitle" data-arg="">None</button>`:''}</div>`;
  const order=[...FEATS].sort((a,b)=>(!!S.feats[b.id])-(!!S.feats[a.id])||featProgress(b)/b.target-featProgress(a)/a.target);
  h+=`<div class="sec-label"><span class="overline">All achievements</span></div><div class="card tight"><ul class="list plain">${order.map(f=>{
    const done=!!S.feats[f.id],p=featProgress(f);
    const rw=[...(f.exp?[`+${f.exp} EXP`]:[]),...f.reward.map(([k,c,g])=>(c>1?c+'× ':'')+(k==='key'?`${g||'Rank'}-grade key`:ITEMS[k].name))].join(' · ');
    return `<li class="feat${done?' won':''}"><div class="lrow" style="align-items:flex-start"><span class="lead">${ic(done?'medal':'shield')}</span><div class="grow">
      <p class="t">${f.title}</p><p class="s">${f.desc}</p>
      ${done?`<p class="log-line">Unlocked ${fmtDate(S.feats[f.id])}</p>`:`<div class="prog" style="margin-top:8px"><i style="width:${p/f.target*100}%"></i></div><p class="s">${p.toLocaleString('en-US')} / ${f.target.toLocaleString('en-US')}</p>`}
      <p class="s faint">${rw}</p></div></div></li>`}).join('')}</ul></div>`;
  return h;
}
