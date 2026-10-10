/* Hunter System: game rules. Day change, penalty, death, rewards, rank tests. */

/* ---------- day-change engine ---------- */
function processMissedDays(){
  const today=todayStr(),from=S.lastChecked;
  const diff=dayDiff(from,today);
  if(diff<=0)return;
  // Long absence: one death, one message, clean restart. No death spiral.
  if(diff>=9&&from>=S.startDate){S.penaltyLevel=5;S.lastChecked=today;save();die(true);return}
  let died=false,penalties=0;
  for(let i=0;i<diff;i++){
    const day=addDays(from,i);
    if(day<S.startDate)continue;
    const rec=S.log[day];
    if(SPLIT[dowOf(day)].rest||dayDiff(S.startDate,day)<=2)continue;
    if(!rec||!rec.completed){
      S.penaltyLevel++;S.penaltyReps+=Math.round(10*S.penaltyLevel*(1-armyBonus('penalty')/100));S.streak=0;penalties++;
      if(rec)rec.missed=true;else S.log[day]={done:[],missed:true};
      if(S.penaltyLevel>=5){died=true;break}
    }
  }
  S.lastChecked=today;
  save();
  if(died)die();
  else if(penalties>0)showPenaltyNotice(penalties);
}

function die(away){
  if(holyWaterSaves()){renderAll();return}
  S.deaths++;
  const keptTitle='Survivor ×'+S.deaths;
  const f=fresh();
  // what survives death: identity, titles, history and records
  f.deaths=S.deaths;f.titles=Array.from(new Set([...S.titles,keptTitle]));f.bestStreak=S.bestStreak;
  f.profile=S.profile;f.log=S.log;f.prs=S.prs;f.passes=S.passes;f.totalReps=S.totalReps;
  // achievements, shadows and gate history are records too; items are lost
  ['feats','shadows','dungeons','titleEquipped','suddenDone','weekSnaps','reportSeen'].forEach(k=>f[k]=S[k]);
  f.log[todayStr()]=Object.assign(f.log[todayStr()]||{done:[]},{died:true});
  S=f;save();
  openModal(`<div class="m-stamp">You have died</div>
   <p class="m-text">${away?'You were gone for over a week.':'You missed too many days.'} The System reset your run.</p>
   <p class="m-text">Title kept: <b>${esc(keptTitle)}</b><br>Ranks, stats and levels are gone. Your records and history remain.</p>
   <button class="btn" data-act="closeModal">Rise again</button>`,'death');
  buzz('bad');
  renderAll();
}

function showPenaltyNotice(n){
  reveal(`<div class="m-stamp">Penalty</div>
   <div class="m-big">${S.penaltyReps}<span>reps owed</span></div>
   <p class="m-text">You missed ${n} quest day${n>1?'s':''}. Penalty level is now <b>${S.penaltyLevel} of 5</b>. Clear the reps before today's quest. At level 5 you die.</p>
   <button class="btn danger" data-act="closeModal">Accept</button>`,'red','alert');
  buzz('bad');
}

/* ---------- penalty debt ---------- */
function penaltyDue(){const r=todayRec();return S.penaltyReps>0&&!r.penaltyDone}
function logPenalty(n){
  if(!penaltyDue())return;
  S.penaltyProgress=Math.min(S.penaltyReps,(S.penaltyProgress||0)+n);
  buzz('tap');
  if(S.penaltyProgress>=S.penaltyReps){
    S.totalReps+=S.penaltyReps;
    todayRec().penaltyDone=true;S.penaltyReps=0;S.penaltyProgress=0;
    save();renderAll();
    buzz('done');
    toast('Penalty cleared. Quest unlocked.');
    checkFeats();
    return true;
  }
  save();renderAll();
  return false;
}

/* ---------- quest log ---------- */
function toggleDone(id){
  const rec=todayRec();
  if(rec.completed||notStarted())return;
  const i=rec.done.indexOf(id);
  if(i>=0)rec.done.splice(i,1);else{rec.done.push(id);justToggled=id;buzz('tap')}
  save();renderAll();
}

/* Log one set of an exercise. Returns true if it set a new personal record. */
function logSet(item,reps){
  const rec=todayRec();
  (rec.sets[item.id]=rec.sets[item.id]||[]).push(reps);
  if(rec.sets[item.id].length>=item.sets&&!rec.done.includes(item.id))rec.done.push(item.id);
  let pr=false;
  if(!item.warm){
    const cur=S.prs[item.name];
    if(!cur||reps>cur.best){
      pr=!!cur; // the very first log is a baseline, not a "new record"
      S.prs[item.name]={best:reps,date:todayStr(),timed:!!item.timed};
    }
  }
  save();
  if(pr)extractShadow(item.name,reps,item.timed); // a beaten record extracts (or strengthens) a shadow
  else if(!item.warm)trainShadow(item.name,reps,item.timed); // every set trains that move's shadow
  checkFeats();
  return pr;
}
function undoSet(item){
  const rec=todayRec(),a=rec.sets[item.id];
  if(!a||!a.length)return;
  a.pop();
  const i=rec.done.indexOf(item.id);
  if(i>=0&&a.length<item.sets)rec.done.splice(i,1);
  save();
}

function questReady(){
  const rec=todayRec();
  return !rec.completed&&!notStarted()&&!penaltyDue()&&buildQuestItems().every(it=>rec.done.includes(it.id));
}

function completeDay(){
  if(!questReady())return;
  const rec=todayRec(),sp=todaysSplit(),w=weekNumber();
  rec.completed=true;rec.doneAt=Date.now();
  const mins=swFinish(rec);
  let gain=sp.rest?30:40+Math.floor(w/2);
  if(sp.boss)gain+=40;
  const bonus=[];
  S.totalQuests++;
  S.streak++;if(S.streak>S.bestStreak)S.bestStreak=S.streak;
  if(S.streak%7===0){gain+=30;bonus.push(`${S.streak}-day streak: +30 EXP`)}
  // reps logged in workout mode count toward lifetime volume
  rec.reps=0;
  buildQuestItems().forEach(it=>{if(!it.warm&&!it.timed&&rec.sets[it.id])rec.reps+=rec.sets[it.id].reduce((a,b)=>a+b,0)});
  S.totalReps+=rec.reps;
  const loot=[];
  // stat gain: each trained stat grows
  const gained={};
  sp.quests.forEach(k=>{const st=LADDERS[k].stat;gained[st]=(gained[st]||0)+1;S.ladders[k].streak++});
  Object.keys(gained).forEach(st=>{S.stats[st]+=gained[st]*0.22*armyMult('stat:'+st)});
  STATS.forEach(st=>{S.stats[st]+=0.08*armyMult('stat:'+st)});
  // weekly goal: 5 training days in a week boosts every stat
  if(!sp.rest&&trainedInWeek(mondayOf(todayStr()))===5){STATS.forEach(st=>{S.stats[st]+=0.6});gain+=40;bonus.push('Weekly goal hit: all stats boosted, +40 EXP');loot.push(grantItem('key'))}
  if(sp.boss)loot.push(grantItem('box'));
  if(rec.cooled){gain+=COOLDOWN_EXP;S.stats.Flexibility+=.2;S.stats.Mobility+=.2;bonus.push(`Cool-down: +${COOLDOWN_EXP} EXP, +0.2 FLX and MOB`)}
  const armyPct=armyBonus('expAll')+(sp.quests.includes('push')?armyBonus('expPush'):0)+(sp.boss?armyBonus('expBoss'):0);
  if(armyPct){const extra=Math.round(gain*armyPct/100);if(extra){gain+=extra;bonus.push(`Shadow army skills: +${extra} EXP`)}}
  const shUps=[];armyTrain(sp.rest?5:10,shUps);
  const shLv=shUps.filter(u=>!u.promo).map(u=>`${u.sh.n} Lv ${u.sh.lvl}`);if(shLv.length)bonus.push(`Shadows leveled: ${shLv.join(', ')}`);
  if(S.elixirActive){const extra=Math.round(gain*.5);gain+=extra;S.elixirActive=false;bonus.push(`Elixir of Growth: +${extra} EXP`)}
  // clean days slowly lower the penalty level
  let penDown=false;
  if(S.penaltyLevel>0&&S.streak>=3&&S.streak%3===0){S.penaltyLevel--;penDown=true}
  // ladder graduations
  const ups=[];
  sp.quests.forEach(k=>{
    const L=LADDERS[k];
    if(S.ladders[k].streak>=6&&S.ladders[k].step<L.steps.length-1&&w>=(S.ladders[k].step+1)*2){
      S.ladders[k].step++;S.ladders[k].streak=0;ups.push(L.title+': '+dn(L.steps[S.ladders[k].step][0]));
    }
  });
  S.exp+=gain;rec.exp=gain;
  const up=syncLevel();
  save();renderAll();
  showReward({gain,leveled:up>0,points:up*POINTS_PER_LEVEL,bonus,ups,penDown,mins,loot});
  announceUps(shUps.filter(u=>u.promo)); // promotions queue behind the reward
  checkFeats();
}

function showReward(r){
  let h=`<div class="m-stamp">Quest complete</div>
    <div class="m-big"><span class="count-up" data-to="${r.gain}">+0</span><span>EXP earned</span></div>`;
  if(r.leveled)h+=`<div class="m-flag lvl-flag">${ic('zap')}Level up · ${S.level}</div><div class="m-flag">+${r.points} stat points to assign</div>`;
  r.bonus.forEach(b=>h+=`<div class="m-flag">${esc(b)}</div>`);
  if(r.mins)h+=`<div class="m-flag">Session time · ${r.mins} min</div>`;
  if(r.loot&&r.loot.length)h+=`<p class="overline">Items obtained</p>${lootHTML(r.loot)}`;
  if(r.penDown)h+=`<p class="m-text">Clean streak: penalty level down to ${S.penaltyLevel}.</p>`;
  if(r.ups.length)h+=`<div class="m-list"><span>New skill unlocked</span>${r.ups.map(u=>`<b>${esc(u)}</b>`).join('')}</div>`;
  const nx=SPLIT[(dayIndex()+1)%7];
  h+=`<p class="m-text">Tomorrow: ${nx.name}, ${nx.type}.</p><button class="btn" data-act="closeModal">Continue</button>`;
  openModal(h,'sys','trophy');
  buzz(r.leveled?'level':'done');
  countUp();
}

/* ---------- rest pass ---------- */
function useRestPass(){
  const rec=todayRec();
  if(rec.completed||passUsedThisWeek()||todaysSplit().rest||notStarted())return;
  rec.completed=true;rec.rested=true;rec.exp=0;if(rec.time)swFinish(rec);
  S.passes[mondayOf(todayStr())]=todayStr();
  save();renderAll();closeModal();
  toast('Rest Pass used. Streak protected. Recover well.');
}

/* ---------- rank trials (see trials.js) ---------- */
const RANK_COOLDOWN=7;
function rankRetryDate(r){const f=S.rankFails[r];if(!f)return null;const d=addDays(f,RANK_COOLDOWN);return d>todayStr()?d:null}
/* ---------- start-date gate ---------- */
function startToday(){
  S.startDate=todayStr();S.lastChecked=todayStr();save();renderAll();
  toast('The gate is open. Your first quest is ready.');
}

ACT.toggle=toggleDone;
ACT.completeDay=completeDay;
ACT.penalty=n=>logPenalty(+n);
ACT.startToday=startToday;
ACT.restPass=()=>openModal(`<div class="m-stamp">Rest Pass</div>
  <p class="m-text">Use this only if you are sick or injured. Today counts as cleared: no EXP, but your streak and penalty level are safe.</p>
  <p class="m-text dim">1 per week. Next one: ${fmtDate(addDays(mondayOf(todayStr()),7))}.</p>
  <div class="m-btns"><button class="btn" data-act="useRestPass">Use Rest Pass</button><button class="btn ghost" data-act="closeModal">Keep training</button></div>`,'sys','moon');
ACT.useRestPass=useRestPass;

/* ---------- stat points ---------- */
let alloc=null;
function openAllocate(){
  if(S.statPoints<=0)return;
  alloc=Object.fromEntries(STATS.map(x=>[x,0]));
  openModal(`<div class="m-stamp">Assign stat points</div>
    <p class="m-text">Each point raises a stat by 1. Choose what kind of Hunter you become.</p>
    <p class="overline" id="allocLeft"></p><ul class="alloc">${STATS.map(x=>`<li><span>${x}</span><b id="al-${x}"></b>
      <button class="icon-btn" data-act="alloc" data-arg="${x}:-1" aria-label="Remove a point from ${x}">${ic('minus')}</button>
      <button class="icon-btn" data-act="alloc" data-arg="${x}:1" aria-label="Add a point to ${x}">${ic('plus')}</button></li>`).join('')}</ul>
    <div class="m-btns"><button class="btn" id="allocOk" data-act="allocOk">Confirm</button><button class="btn ghost" data-act="closeModal">Later</button></div>`,'sys','zap');
  paintAlloc();
}
function paintAlloc(){
  const used=Object.values(alloc).reduce((a,b)=>a+b,0),left=S.statPoints-used;
  $('allocLeft').textContent=`${left} point${left===1?'':'s'} left`;
  STATS.forEach(x=>{$('al-'+x).innerHTML=`${Math.floor(S.stats[x])+alloc[x]}${alloc[x]?` <small>+${alloc[x]}</small>`:''}`});
  $('allocOk').disabled=used===0;
}
ACT.allocate=openAllocate;
ACT.alloc=a=>{const [x,d]=a.split(':'),used=Object.values(alloc).reduce((p,q)=>p+q,0);
  if(+d>0&&used>=S.statPoints)return;if(+d<0&&alloc[x]<=0)return;alloc[x]+=+d;buzz('tap');paintAlloc()};
ACT.allocOk=()=>{const used=Object.values(alloc).reduce((a,b)=>a+b,0);if(!used)return;
  STATS.forEach(x=>{S.stats[x]+=alloc[x]});S.statPoints-=used;save();closeModal();renderAll();buzz('done');toast(`${used} point${used>1?'s':''} assigned`);checkFeats()};

/* ---------- sudden quests ----------
   Rolled once per day from a seed, so reloading never re-rolls. Appears at a seeded
   hour between 10:00 and 19:59 the first time the app is open after it. No penalty. */
function seeded(str){let h=2166136261;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);return ((h>>>0)%100000)/100000}
function maybeSudden(){
  if(window.__NO_SUDDEN||!S.profile||notStarted()||todaysSplit().rest)return;
  const today=todayStr(),seed=today+'|'+S.created;
  if(S.sudden&&S.sudden.date===today)return;
  if(seeded(seed+'roll')>=SUDDEN_CHANCE)return;
  if(new Date().getHours()<10+Math.floor(seeded(seed+'hour')*10))return;
  const [task,stat]=SUDDEN[Math.floor(seeded(seed+'task')*SUDDEN.length)];
  S.sudden={date:today,task,stat,deadline:Date.now()+SUDDEN_MINUTES*60000,state:'open'};
  save();renderAll();buzz('alarm');
  reveal(`<div class="m-stamp">Sudden quest</div><p class="h2">${task}</p>
    <p class="m-text">Complete it within <b>${SUDDEN_MINUTES} minutes</b> for +${SUDDEN_EXP} EXP. There is no penalty for missing it.</p>
    <div class="m-btns"><button class="btn" data-act="suddenDone">Done it</button><button class="btn ghost" data-act="closeModal">Accept</button></div>`,'red','alert');
}
function suddenActive(){const q=S.sudden;return q&&q.date===todayStr()&&q.state==='open'&&Date.now()<q.deadline?q:null}
ACT.suddenDone=()=>{
  const q=suddenActive();if(!q)return;
  q.state='done';S.exp+=SUDDEN_EXP;S.stats[q.stat]+=.3;S.suddenDone++;const up=syncLevel();
  const box=Math.random()<.3;if(box)grantItem('box');
  save();closeModal();renderAll();buzz(up?'level':'done');
  toast(`Sudden quest cleared · +${SUDDEN_EXP} EXP${box?' · Random Box!':''}${up?` · Level ${S.level}`:''}`);
  checkFeats();
};

/* ---------- job change (after the S-rank test) ---------- */
function jobAvailable(){return !S.job&&S.rankTestsPassed.includes('S')}
let jobPick='fighter';
function openJobChange(){
  if(!jobAvailable())return;
  openModal(`<div class="m-stamp">Job change</div>
    <p class="m-text">You have reached the limit of an ordinary Hunter. Choose a path. It sets your program for the next 12 weeks and cannot be undone.</p>
    <div class="a-opts" role="radiogroup" id="jobOpts"></div>
    <div class="m-btns"><button class="btn" data-act="jobOk">Accept the job</button><button class="btn ghost" data-act="closeModal">Not yet</button></div>`,'sys','shield');
  paintJobs();
}
function paintJobs(){
  $('jobOpts').innerHTML=Object.entries(JOBS).map(([k,j])=>`<button role="radio" aria-checked="${jobPick===k}" class="a-opt${jobPick===k?' on':''}" data-act="jobPick" data-arg="${k}"><span class="grow"><b>${j.title}</b><span>${j.tag} · ${j.desc}</span></span><span class="chk${jobPick===k?' on':''}">${ic('check')}</span></button>`).join('');
}
ACT.jobChange=openJobChange;
ACT.jobPick=k=>{jobPick=k;buzz('tap');paintJobs()};
ACT.jobOk=()=>{
  if(!jobAvailable())return;
  const J=JOBS[jobPick];
  S.job={path:jobPick,date:todayStr()};S.titles=Array.from(new Set([...S.titles,'Job: '+J.title]));
  S.stats[J.stat]+=2;save();renderAll();buzz('level');
  openModal(`<div class="m-stamp">Job change complete</div><div class="m-rank">${J.title[0]}</div>
    <p class="m-text">You are now a <b>${J.title}</b>. ${J.desc} Your ${J.title} program runs weeks 25 to 36. +2 ${J.stat}.</p>
    <button class="btn" data-act="closeModal">Continue</button>`,'sys','shield');
};
