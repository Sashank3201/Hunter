/* Hunter System: tab views. Each render* function rebuilds one section from S. */
let progTab='skills';

/* Gradient progress ring. pct 0..1. The stroke animates in when its section has .enter. */
function ring(size,sw,pct){
  const r=(size-sw)/2,c=+(2*Math.PI*r).toFixed(2),off=+(c*(1-Math.max(0,Math.min(1,pct)))).toFixed(2);
  return `<svg class="ring-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="bg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${sw}"/><circle class="fg anim" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${sw}" style="stroke-dasharray:${c};stroke-dashoffset:${off};--c:${c}"/></svg>`;
}
const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;

function renderTop(){
  $('when').textContent=notStarted()?'Starts '+fmtDate(S.startDate):fmtDate(todayStr())+' · Week '+weekNumber();
  $('avatarBtn').textContent=currentRank().r;
}

function greeting(){const h=new Date().getHours();return h<5?'Up late':h<12?'Good morning':h<17?'Good afternoon':'Good evening'}

/* ---------- STATUS ---------- */
function todayCard(){
  const sp=todaysSplit(),rec=todayRec(),all=buildQuestItems(),items=all.filter(i=>!i.warm);
  const doneN=all.filter(i=>rec.done.includes(i.id)).length;
  if(notStarted())return `<div class="card state-card"><div class="state-ic">${ic('calendar')}</div><div class="grow">
    <p class="h3">Your run starts ${fmtDate(S.startDate)}</p><p class="muted small">${plural(dayDiff(todayStr(),S.startDate),'day')} to go. Read through the moves meanwhile.</p>
    <button class="btn sm" data-act="startToday">Start today instead</button></div></div>`;
  if(rec.completed)return `<div class="card ${rec.rested?'':'good'} state-card"><div class="state-ic">${ic(rec.rested?'moon':'check')}</div><div>
    <p class="h3">${rec.rested?'Resting today':'Daily quest cleared'}</p>
    <p class="muted small">${rec.rested?'Rest Pass used. Your streak is safe.':`+${rec.exp||0} EXP earned. Tomorrow: ${SPLIT[(dayIndex()+1)%7].type}.`}</p></div></div>`;
  const mins=sp.rest?'15':sp.boss?'35':'25';
  return `<div class="sec-label"><span class="overline">Today's quest</span><span class="small">${esc(sp.type.replace(' Boss Day',''))} · ${mins} min</span></div>
  <div class="card tight"><ul class="list">${items.map((it,k)=>{const d=rec.done.includes(it.id);return `<li class="${d?'done':''}"><div class="lrow"><span class="ex-num">${String(k+1).padStart(2,'0')}</span><div class="grow"><p class="t">${esc(dn(it.name))}</p></div><span class="target">${it.sets}<i>×</i>${it.amt}${it.timed?'s':''}</span></div></li>`}).join('')}</ul></div>
  <div class="cta-wrap">${sp.boss?`<p class="warn-line" style="padding:0 0 10px">${ic('flame')}Weekly boss day. Push the last set to your limit.</p>`:''}
    <button class="btn block" data-act="goQuest">${doneN?`Continue quest · ${doneN}/${all.length}`:'Begin quest'}</button>
    <p class="warn-line">${ic('alert')}<span>${penaltyDue()?`Clear ${S.penaltyReps-S.penaltyProgress} penalty reps first`:`Failure to complete will result in a penalty · <b id="timeLeft">${timeLeft()}</b> left`}</span></p></div>`;
}

/* Time until midnight, when an unfinished quest becomes a missed day. */
function timeLeft(){const n=new Date(),m=(24*60)-(n.getHours()*60+n.getMinutes());return `${Math.floor(m/60)}h ${String(m%60).padStart(2,'0')}m`}

function weekStrip(){
  const start=mondayOf(todayStr()),today=todayStr();
  return Array.from({length:7},(_,i)=>{
    const ds=addDays(start,i),st=dayState(ds),isRest=SPLIT[dowOf(ds)].rest;
    const cls=st==='done'?'done':st==='pass'?'pass':st==='miss'?'miss':(isRest&&ds>=today)||st==='rest'?'rest':'';
    const icn=cls==='done'?'check':cls==='pass'?'moon':cls==='miss'?'x':'';
    return `<div class="wd ${cls}${ds===today?' today':''}">${DOW[dowOf(ds)][0]}<i>${icn?ic(icn):''}</i></div>`;
  }).join('');
}

function renderStatus(){
  const rk=currentRank(),lv=levelFromExp(),nx=nextRank();
  const name=S.profile?esc(S.profile.name):'Hunter';
  const wd=trainedInWeek(mondayOf(todayStr()));
  const rawName=S.profile?S.profile.name:'Hunter';
  let h=`<div class="hero">
    <div class="h-l"><p class="overline faint">${greeting()} · Player</p><h1 class="name${rawName.length>8?' long':''}">${name}</h1>${S.titleEquipped?`<p class="hero-title">« ${esc(S.titleEquipped)} »</p>`:''}
      <div class="kv2"><div><p class="overline faint">Rank</p><b>${rk.r} — ${rk.name}</b></div><div><p class="overline faint">Streak</p><b>${plural(S.streak,'day')}</b></div>${S.job?`<div><p class="overline faint">Job</p><b>${JOBS[S.job.path].title}</b></div>`:''}</div>
      <div class="prog" role="progressbar" aria-label="EXP to next level" aria-valuemin="0" aria-valuemax="${lv.need}" aria-valuenow="${lv.into}"><i style="width:${lv.into/lv.need*100}%"></i></div>
      <p class="overline">${lv.into} / ${lv.need} EXP${S.deaths?` · ${S.deaths} death${S.deaths>1?'s':''}`:''}</p></div>
    <div class="h-r"><p class="overline">Level</p><div class="lv-big">${String(S.level).padStart(2,'0')}</div></div></div>
  <div class="hstrip">
    <button data-act="goTab" data-arg="gates"><b>${keyCount()}</b><span>Keys</span></button>
    <button data-act="goTab" data-arg="gates"><b>${itemCount()-keyCount()}</b><span>Items</span></button>
    <button data-act="goProg" data-arg="army"><b>${S.shadows.length}</b><span>Shadows</span></button>
    <button data-act="goProg" data-arg="feats"><b>${Object.keys(S.feats).length}<small>/${FEATS.length}</small></b><span>Feats</span></button></div>
  <button class="license-link" data-act="card"><span class="overline">Hunter License</span><span class="overline">View card →</span></button>
  ${chestReady()?`<button class="chest-strip" data-act="chest"><span class="cs-ic">${ic('box')}</span><span class="grow"><b>Daily supply ready</b><span>Day ${chestDay().day} of 7 · ${rewardLabel(LOGIN_REWARDS[chestDay().day-1])}</span></span><span class="overline">Open →</span></button>`:''}
  ${S.elixirActive?`<div class="card" style="border-top:1px solid var(--hair);padding:12px var(--gut)"><p class="overline" style="color:var(--red)">${ic('elixir')} Elixir active · next quest gives 1.5× EXP</p></div>`:''}`;
  const sq=suddenActive();
  if(sq)h+=`<div class="card bad"><div class="card-head"><span class="h3">Sudden quest</span><span class="pill bad">${Math.max(1,Math.ceil((sq.deadline-Date.now())/60000))} min left</span></div>
    <p class="h2" style="margin-bottom:6px">${sq.task}</p><p class="muted small">+${SUDDEN_EXP} EXP. No penalty if you miss it.</p>
    <button class="btn block" style="margin-top:14px" data-act="suddenDone">Done it</button></div>`;
  if(jobAvailable())h+=`<div class="card bad"><div class="card-head"><span class="h3">Job change quest</span><span class="pill warn">S-Rank</span></div>
    <p class="muted small">You passed the S-rank test. Choose Fighter, Assassin or Ranger to unlock a new 12-week program.</p>
    <button class="btn block" style="margin-top:14px" data-act="jobChange">Choose your job</button></div>`;

  h+=todayCard();

  h+=`<div class="sec-label"><span class="overline">This week</span><span class="small">${wd} / 5 days</span></div>
    <div class="card" style="border-top:0;padding-top:4px"><div class="week">${weekStrip()}</div>
    <p class="muted small" style="margin-top:12px">${wd>=5?'Weekly goal hit. Every stat got a boost.':`Train ${plural(5-wd,'more day')} this week for a bonus to every stat.`}</p></div>`;

  const smax=Math.max(20,Math.ceil(Math.max(...STATS.map(x=>S.stats[x]))/10)*10);
  h+=`<div class="sec-label"><span class="overline">Stats</span><span class="small">${S.statPoints?`${S.statPoints} points unassigned`:'Grow by training'}</span></div>
    <div class="card" style="border-top:0;padding-top:6px"><div class="stat-grid">${STATS.map(x=>`<div><b>${String(Math.floor(S.stats[x])).padStart(2,'0')}</b><div class="bar-mini"><i style="width:${S.stats[x]/smax*100}%"></i></div><span>${x.slice(0,3).toUpperCase()}</span></div>`).join('')}</div>
    ${S.statPoints?`<button class="btn block" style="margin-top:16px" data-act="allocate">Assign ${S.statPoints} stat point${S.statPoints>1?'s':''}</button>`:''}</div>`;

  if(S.penaltyLevel>0||S.penaltyReps>0){
    h+=`<div class="card bad"><div class="card-head"><span class="h3">Penalty level ${S.penaltyLevel} of 5</span><span class="pill bad">${ic('alert')}Danger</span></div>
      <div class="pen-seg">${[1,2,3,4,5].map(i=>`<i class="${i<=S.penaltyLevel?'on':''}${i===5?' last':''}"></i>`).join('')}</div>
      <p class="muted small">${S.penaltyReps>0?`You owe ${S.penaltyReps-S.penaltyProgress} reps. `:''}Level 5 means death. Three clean days in a row lower it by 1.</p>
      ${S.penaltyReps>0?`<button class="btn danger block" style="margin-top:14px" data-act="goQuest">Clear penalty</button>`:''}</div>`;
  }else{
    h+=`<div class="card tight"><ul class="list">
      <li class="lrow"><span class="lead">${ic('shield')}</span><div class="grow"><p class="t">No penalties</p><p class="s">Keep the streak alive</p></div><span class="pill good">Safe</span></li>
      <li class="lrow"><span class="lead">${ic('moon')}</span><div class="grow"><p class="t">Rest Pass</p><p class="s">${passUsedThisWeek()?'Used this week':'1 available this week'}</p></div><span class="pill ${passUsedThisWeek()?'':'accent'}">${passUsedThisWeek()?'Used':'Ready'}</span></li>
    </ul></div>`;
  }

  h+=trialCardHTML('status');
  if(S.titles.length)h+=`<div class="card"><p class="h3" style="margin-bottom:12px">Titles</p><div class="chips">${S.titles.map(t=>`<span class="pill accent">${ic('trophy')}${esc(t)}</span>`).join('')}</div></div>`;
  $('status').innerHTML=h;
}

/* ---------- QUEST ---------- */
const openCues=new Set();
let justToggled=null;
function renderQuest(){
  const sp=todaysSplit(),rec=todayRec(),items=buildQuestItems();
  const warm=items.filter(i=>i.warm),main=items.filter(i=>!i.warm);
  const doneN=items.filter(i=>rec.done.includes(i.id)).length;
  const penDue=penaltyDue(),lock=rec.completed||notStarted();

  let h=`<div class="page-head qhead"><div><p class="overline">${sp.boss?'Weekly boss':sp.rest?'Recovery':"Today's quest"}</p><h1 class="h1" style="margin-top:8px">${esc(sp.boss?'Boss Day':sp.type)}</h1><p class="muted">${sp.note}</p></div>
    <div class="count-big">${doneN}<small>/${items.length}</small></div></div>`;

  if(notStarted())h+=`<div class="card state-card"><div class="state-ic">${ic('calendar')}</div><div><p class="h3">Quest locked until ${fmtDate(S.startDate)}</p><p class="muted small">Look through today's moves so you're ready.</p><button class="btn sm" data-act="startToday">Start today instead</button></div></div>`;
  else if(rec.completed)h+=`<div class="card ${rec.rested?'':'good'} state-card"><div class="state-ic">${ic(rec.rested?'moon':'check')}</div><div><p class="h3">${rec.rested?'Rest Pass active':'Quest cleared'}</p><p class="muted small">${rec.rested?'No training today. Recover well.':`+${rec.exp||0} EXP${rec.duration?` · ${rec.duration} min trained`:''}. See you tomorrow.`}</p></div></div>`;
  else h+=timerCardHTML();

  if(penDue){
    const left=S.penaltyReps-S.penaltyProgress;
    h+=`<div class="card bad"><div class="card-head"><span class="h3">Penalty quest</span><span class="pill bad">${left} left</span></div>
      <p class="muted small">Do ${S.penaltyReps} reps of squats, jumping jacks or burpees, in any mix. Log them as you go. Your quest unlocks when it's cleared.</p>
      <div class="prog bad" style="margin-top:14px" role="progressbar" aria-valuemin="0" aria-valuemax="${S.penaltyReps}" aria-valuenow="${S.penaltyProgress}"><i style="width:${S.penaltyProgress/S.penaltyReps*100}%"></i></div>
      <div class="pen-steps"><button class="btn ghost sm" data-act="penalty" data-arg="5">+5</button><button class="btn ghost sm" data-act="penalty" data-arg="10">+10</button><button class="btn danger sm" data-act="penalty" data-arg="${left}">Log all ${left}</button></div></div>`;
  }

  const row=(t,isWarm)=>{
    const on=rec.done.includes(t.id),pop=justToggled===t.id&&on?' pop':'';
    if(isWarm)return `<li class="${on?'done':''}"><div class="lrow"><button class="chk${on?' on':''}${pop}" aria-pressed="${on}" aria-label="${t.name}: mark ${on?'not done':'done'}" data-act="toggle" data-arg="${t.id}" ${lock?'disabled':''}>${ic('check')}</button><div class="grow"><p class="t">${t.name}</p></div><span class="target">${t.amt}</span></div></li>`;
    const open=openCues.has(t.id),logged=rec.sets[t.id]||[],pr=S.prs[t.name];
    return `<li class="ex-row${on?' done':''}"><div class="lrow">
      <button class="chk${on?' on':''}${pop}" aria-pressed="${on}" aria-label="${esc(dn(t.name))}: mark ${on?'not done':'done'}" data-act="toggle" data-arg="${t.id}" ${lock?'disabled':''}>${ic('check')}</button>
      <div class="grow"><p class="t">${dn(t.name)}</p>
        <p class="s">${t.stat===t.family?t.stat:`${t.family} · ${t.stat}`}${t.note?` · <span class="boss-note">${t.note}</span>`:''}</p>
        ${logged.length?`<p class="log-line">Logged ${logged.join(' · ')}${t.timed?' sec':''}</p>`:pr?`<p class="log-line faint">Best ${pr.best}${pr.timed?' sec':''}</p>`:''}
        <button class="how-btn" aria-expanded="${open}" data-act="cue" data-arg="${t.id}">How to ${ic('down')}</button></div>
      <span class="target">${t.sets}<i>×</i>${t.amt}${t.timed?'s':''}</span></div>
      ${open&&t.cue?`<div class="ex-cue">${demoHTML(t.name)}<p>${t.cue}</p></div>`:''}</li>`;
  };
  if(warm.length)h+=`<div class="sec-label"><span class="overline">Warm-up</span><span class="faint small">2 min</span></div><div class="card tight"><ul class="list">${warm.map(w=>row(w,true)).join('')}</ul></div>`;
  h+=`<div class="sec-label"><span class="overline">Main quest</span><span class="faint small">Tap □ to log by hand</span></div><div class="card tight"><ul class="list">${main.map(t=>row(t,false)).join('')}</ul></div>`;
  justToggled=null;

  if(!sp.rest&&!notStarted())h+=fuelHTML();

  if(!rec.completed&&!notStarted()&&!sp.rest){
    h+=passUsedThisWeek()?`<p class="faint small" style="text-align:center;margin-top:16px">Rest Pass used this week. Next one ${fmtDate(addDays(mondayOf(todayStr()),7))}.</p>`
      :`<button class="pass-link" data-act="restPass">${ic('moon')}<span class="grow"><b>Sick or injured?</b>Use this week's Rest Pass</span>${ic('right')}</button>`;
  }

  let label,act='',disabled=false,icon='play';
  if(notStarted()){label='Locked';disabled=true}
  else if(rec.completed){label=rec.rested?'Resting today':'Cleared for today';disabled=true;icon='check'}
  else if(penDue){label='Clear the penalty first';disabled=true;icon='alert'}
  else if(questReady()){label='Complete quest';act='completeDay';icon='trophy'}
  else{label=doneN?'Continue workout':'Start workout';act='workout'}
  h+=`<div class="dock"><button class="btn block${act==='completeDay'?' glow':''}" ${disabled?'disabled':`data-act="${act}"`}>${ic(icon)}${label}</button></div>`;
  $('quest').innerHTML=h;
  startDemos();
}
ACT.cue=id=>{openCues.has(id)?openCues.delete(id):openCues.add(id);renderQuest()};

/* ---------- PROGRESS ---------- */
function renderProgress(){
  const tabs=[['skills','Skills'],['plan','Plan'],['history','History'],['army','Shadows'],['feats','Feats']];
  let h=`<div class="page-head"><h1 class="h1">Progress</h1></div>
    <div class="seg" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${progTab===k}" data-act="prog" data-arg="${k}">${l}</button>`).join('')}</div><div id="progBody">`;
  h+=progTab==='skills'?skillsHTML():progTab==='plan'?planHTML():progTab==='army'?armyHTML():progTab==='feats'?featsHTML():historyHTML();
  $('progress').innerHTML=h+'</div>';
}
ACT.prog=k=>{progTab=k;renderProgress();animateIn($('progBody'))};

function skillsHTML(){
  let h=`<p class="muted small" style="margin:-4px 4px 16px">The System moves you up a step after steady training. Never rush a step.</p>`;
  Object.keys(LADDERS).forEach(k=>{
    const L=LADDERS[k],cur=S.ladders[k].step,pr=S.prs[L.steps[cur][0]];
    h+=`<div class="card ladder"><div class="card-head"><span class="h2">${L.title}</span><span class="pill">${cur+1} / ${L.steps.length}</span></div>
      <p class="move">${dn(L.steps[cur][0])}${pr?` · <span style="color:var(--accent-hi)">best ${pr.best}${pr.timed?'s':''}</span>`:''}</p>
      <div class="steps-bar" aria-hidden="true">${L.steps.map((s,i)=>`<i class="${i<cur?'d':i===cur?'c':''}"></i>`).join('')}</div>
      <details class="more"><summary>All steps ${ic('down')}</summary><ol class="step-list">${L.steps.map((s,i)=>`<li class="${i<cur?'d':i===cur?'c':''}">${dn(s[0])}</li>`).join('')}</ol></details></div>`;
  });
  return h;
}

function planHTML(){
  const cw=weekNumber(),today=dayIndex();
  const testWeek={};Object.keys(RANK_TESTS).forEach(r=>testWeek[RANK_TESTS[r].week]=r);
  let h=`<div class="sec-label" style="margin-top:0"><span class="overline">Weekly split</span></div><div class="card tight"><ul class="list plain">`+
    [1,2,3,4,5,6,0].map(i=>`<li class="lrow plan-row${i===today?' today':''}"><div class="grow"><p class="t">${SPLIT[i].name}</p><p class="s">${SPLIT[i].type}</p></div>${i===today?'<span class="pill accent">Today</span>':SPLIT[i].boss?`<span class="pill warn">${ic('flame')}Boss</span>`:SPLIT[i].rest?`<span class="pill">${ic('moon')}Rest</span>`:''}</li>`).join('')+`</ul></div>`;
  const phases=S.job?[...PHASES,{name:`Phase 6: ${JOBS[S.job.path].title}`,weeks:[25,36],goal:JOBS[S.job.path].desc}]:PHASES;
  phases.forEach(p=>{
    const nowIn=cw>=p.weeks[0]&&cw<=p.weeks[1];
    h+=`<div class="sec-label"><span class="overline">${p.name.replace(/: .*/,'')} · Weeks ${p.weeks[0]}–${p.weeks[1]}</span>${nowIn?'<span class="pill accent">Now</span>':''}</div>
      <div class="card tight phase"><div style="padding:14px 20px 6px"><p class="h2">${p.name.replace(/^Phase \d+: /,'')}</p><p class="muted small" style="margin-top:4px">${p.goal}</p></div><ul class="list">`;
    for(let w=p.weeks[0];w<=p.weeks[1];w++){
      const cls=w===cw?'now':(w<cw?'past':'');
      h+=`<li class="lrow wk-row ${cls}"${w===cw?' aria-current="step"':''}><span class="lead">${w<cw?ic('check'):w}</span><div class="grow"><p class="t" style="font-weight:500;font-size:15px">${w>24?JOBS[S.job.path].focus[w-25]:WEEKLY_FOCUS[w]}</p></div>${testWeek[w]?`<span class="pill accent">${ic('shield')}Trial ${testWeek[w]}</span>`:''}</li>`;
    }
    h+=`</ul></div>`;
  });
  return h;
}

/* Earliest day the Player has any history: before it, the calendar is blank. */
function firstDay(){return Object.keys(S.log).concat(S.startDate).sort()[0]}
/* State of one calendar day, for the heatmap and week strip. */
function dayState(ds){
  const today=todayStr(),r=S.log[ds];
  if(ds>today)return 'future';
  if(!r&&ds<firstDay())return 'future';
  if(r&&r.rested)return 'pass';
  if(r&&r.completed)return 'done';
  if(r&&(r.missed||r.died))return 'miss';
  if(ds===today)return 'today';
  if(SPLIT[dowOf(ds)].rest)return 'rest';
  return 'none';
}
const DAY_LABEL={done:'Quest cleared',pass:'Rest Pass',miss:'Missed',rest:'Recovery day',today:'Today',none:'No record',future:'No data'};

function historyHTML(){
  const durs=Object.values(S.log).map(r=>r.duration||0).filter(Boolean),mins=durs.reduce((a,b)=>a+b,0);
  const tiles=[['timer',mins>=60?`${Math.floor(mins/60)}h ${mins%60}m`:`${mins}m`,'Time trained'],['calendar',durs.length?`${Math.round(mins/durs.length)}m`:'—','Avg session'],['zap',S.totalQuests,'Quests cleared'],['flame',S.bestStreak,'Best streak'],['dumbbell',S.totalReps.toLocaleString(),'Total reps'],['skull',S.deaths,'Deaths']];
  let h=`<button class="license-link" data-act="report" style="border-top:0;margin-bottom:12px"><span class="overline">Weekly System report</span><span class="overline">Last week →</span></button><div class="tiles">${tiles.map(([i,v,l])=>`<div class="tile"><span class="lead">${ic(i)}</span><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;

  const W=12,start=addDays(mondayOf(todayStr()),-7*(W-1));
  h+=`<div class="card"><div class="card-head"><span class="h3">Last 12 weeks</span></div><div class="heat" role="grid" aria-label="Training calendar, last 12 weeks">
    <div class="heat-days" aria-hidden="true">${['M','T','W','T','F','S','S'].map(d=>`<span>${d}</span>`).join('')}</div><div class="heat-grid">`;
  for(let w=0;w<W;w++){
    h+=`<div class="heat-col" role="row">`;
    for(let d=0;d<7;d++){
      const ds=addDays(start,w*7+d),st=dayState(ds);
      h+=`<span role="gridcell" class="hc ${st}${ds===todayStr()?' now':''}" data-tip="${fmtDate(ds)} · ${DAY_LABEL[st]}" aria-label="${fmtDate(ds)}: ${DAY_LABEL[st]}"></span>`;
    }
    h+=`</div>`;
  }
  h+=`</div></div><div class="legend">${['done','pass','miss'].map(k=>`<span><i class="hc ${k}"></i>${DAY_LABEL[k]}</span>`).join('')}</div></div>`;

  const thisMon=mondayOf(todayStr()),weeks=[];
  for(let k=11;k>=0;k--){const m=addDays(thisMon,-7*k);weeks.push([m,trainedInWeek(m),k===0])}
  h+=`<div class="card"><div class="card-head"><span class="h3">Training days per week</span><span class="faint small">Mon–Sun · goal 5</span></div>
    <div class="bars" role="list">${weeks.map(([m,n,cur])=>{const d=new Date(m+'T00:00:00Z').getUTCDate();return `<div class="bar-col${cur?' cur':''}${n>=5?' hit':''}" role="listitem" tabindex="0" data-tip="Week of ${fmtDate(m)} · ${plural(n,'day')}" aria-label="Week of ${fmtDate(m)}: ${plural(n,'training day')}">
      <div class="bar-slot"><i style="height:${n/6*100}%"></i></div><span>${d}</span></div>`}).join('')}
      <div class="goal-line" aria-hidden="true"><span>5</span></div></div></div>`;

  const prs=Object.entries(S.prs).sort((a,b)=>b[1].date.localeCompare(a[1].date));
  h+=`<div class="sec-label"><span class="overline">Personal records</span></div>`;
  h+=prs.length?`<div class="card tight"><ul class="list plain">${prs.map(([n,p])=>`<li class="lrow"><div class="grow"><p class="t">${esc(dn(n))}</p><p class="s">${fmtDate(p.date)}</p></div><span class="pr-val">${p.best}${p.timed?'<small>sec</small>':'<small>reps</small>'}</span></li>`).join('')}</ul></div>`
    :`<div class="card state-card"><div class="state-ic">${ic('trophy')}</div><div><p class="h3">No records yet</p><p class="muted small">Log sets in workout mode and your best set for each move appears here.</p></div></div>`;
  return h;
}

ACT.goTab=t=>showTab(t);
ACT.goProg=k=>{progTab=k;showTab('progress');renderProgress()};
