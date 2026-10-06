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
  return `<div class="card glow">
    <div class="card-head"><span class="overline">Today's quest</span>${sp.boss?`<span class="pill warn">${ic('flame')}Boss day</span>`:sp.rest?`<span class="pill accent">${ic('moon')}Recovery</span>`:penaltyDue()?`<span class="pill bad">${ic('alert')}Penalty owed</span>`:`<span class="pill">${doneN}/${all.length} done</span>`}</div>
    <p class="h2">${esc(sp.type.replace(' Boss Day',''))}</p>
    <p class="muted small" style="margin-top:4px">${plural(items.length,'exercise')} · about ${mins} min</p>
    <ul class="quest-preview">${items.map(it=>{const d=rec.done.includes(it.id);return `<li class="${d?'done':''}"><i class="chk${d?' on':''}">${ic('check')}</i><span>${esc(dn(it.name))}</span><b class="target">${it.sets}<i>×</i>${it.amt}${it.timed?'s':''}</b></li>`}).join('')}</ul>
    <button class="btn block" data-act="goQuest">${ic('play')}${doneN?'Continue quest':'Start quest'}</button>
    <p class="warn-line">${ic('alert')}${penaltyDue()?`Clear ${S.penaltyReps-S.penaltyProgress} penalty reps first.`:'Skip it and the System issues a penalty.'}</p>
  </div>`;
}

function weekStrip(){
  const start=mondayOf(todayStr()),today=todayStr();
  return Array.from({length:7},(_,i)=>{
    const ds=addDays(start,i),st=dayState(ds),isRest=SPLIT[dowOf(ds)].rest;
    const cls=st==='done'?'done':st==='pass'?'pass':st==='miss'?'miss':(isRest&&ds>=today)||st==='rest'?'rest':'';
    const icn=cls==='done'?'check':cls==='pass'?'moon':cls==='miss'?'x':'';
    return `<div class="wd ${cls}${ds===today?' today':''}"><i style="animation-delay:${.1+i*.04}s">${icn?ic(icn):''}</i>${DOW[dowOf(ds)][0]}</div>`;
  }).join('');
}

function radar(){
  const vals=STATS.map(s=>S.stats[s]),max=Math.max(20,Math.ceil(Math.max(...vals)/10)*10);
  const cx=125,cy=118,R=86,pt=(i,f)=>{const a=(-90+i*72)*Math.PI/180;return [cx+Math.cos(a)*R*f,cy+Math.sin(a)*R*f]};
  const poly=f=>STATS.map((_,i)=>pt(i,f).map(n=>n.toFixed(1)).join(',')).join(' ');
  const shape=vals.map((v,i)=>pt(i,Math.max(.06,v/max)));
  let g=[.25,.5,.75,1].map(f=>`<polygon class="grid" points="${poly(f)}"/>`).join('');
  g+=STATS.map((_,i)=>{const [x,y]=pt(i,1);return `<line class="axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`}).join('');
  g+=`<polygon class="shape" points="${shape.map(p=>p.join(',')).join(' ')}"/><g class="dots">${shape.map(([x,y])=>`<circle class="dot" cx="${x}" cy="${y}" r="3.5"/>`).join('')}</g>`;
  g+=STATS.map((s,i)=>{const [x,y]=pt(i,1.2);return `<text x="${x}" y="${y+4}" text-anchor="middle">${s}</text>`}).join('');
  return `<svg class="radar" viewBox="0 0 250 232" role="img" aria-label="Stats: ${STATS.map(s=>s+' '+Math.floor(S.stats[s])).join(', ')}">${g}</svg>`;
}

function renderStatus(){
  const rk=currentRank(),lv=levelFromExp(),nx=nextRank();
  const name=S.profile?esc(S.profile.name):'Hunter';
  const wd=trainedInWeek(mondayOf(todayStr()));
  let h=`<div class="page-head greet"><p class="muted">${greeting()},</p><h1 class="h1">${name}</h1></div>`;

  h+=`<div class="card"><div class="hero">
      <div class="lv-ring">${ring(118,10,lv.into/lv.need)}<div class="in"><b>${S.level}</b><span>LEVEL</span></div></div>
      <div class="grow"><div class="rank-badge"><b>${rk.r}</b><span>RANK</span></div>
        <p class="h2">${rk.name}</p>
        <p class="muted small num">${lv.into} / ${lv.need} EXP</p></div>
    </div>
    <div class="hero-meta"><span class="pill flame">${ic('flame')}${S.streak} day streak</span><span class="pill">${ic('trophy')}Best ${S.bestStreak}</span>${S.deaths?`<span class="pill">${ic('skull')}${S.deaths}</span>`:''}</div>
  </div>`;

  h+=todayCard();

  h+=`<div class="card"><div class="card-head"><span class="h3">This week</span><span class="pill ${wd>=5?'good':'accent'}">${wd} of 5 days</span></div>
    <div class="week">${weekStrip()}</div>
    <p class="muted small" style="margin-top:14px">${wd>=5?'Weekly goal hit. Every stat got a boost.':`Train ${plural(5-wd,'more day')} this week for a bonus to every stat.`}</p></div>`;

  h+=`<div class="card"><div class="card-head"><span class="h3">Attributes</span><span class="faint small">Grow by training</span></div>
    <div class="radar-wrap">${radar()}</div>
    <div class="stat-grid">${STATS.map(s=>`<div><b>${Math.floor(S.stats[s])}</b><span>${s.slice(0,3).toUpperCase()}</span></div>`).join('')}</div></div>`;

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

  if(nx){
    const t=RANK_TESTS[nx.r],retry=rankRetryDate(nx.r);
    const lvOk=S.level>=t.level,wkOk=weekNumber()>=t.week,ready=lvOk&&wkOk&&!retry;
    h+=`<div class="card"><div class="card-head"><span class="overline">Next rank</span><span class="pill accent">${nx.r}-Rank</span></div>
      <p class="h2">${nx.name}</p>
      <ul class="req">
        <li><i class="chk${lvOk?' on':''}">${ic('check')}</i><span>Reach level ${t.level}</span><em>you're ${S.level}</em></li>
        <li><i class="chk${wkOk?' on':''}">${ic('check')}</i><span>Train until week ${t.week}</span><em>week ${weekNumber()}</em></li>
        <li><i class="chk">${ic('check')}</i><span>Pass the rank test</span><em>${retry?'retry '+fmtDate(retry):plural(t.tests.length,'move')}</em></li>
      </ul>
      <details class="more"><summary>What's in the test ${ic('down')}</summary><ul class="list plain">${t.tests.map(x=>`<li class="lrow" style="padding:8px 0;min-height:0"><span class="grow">${x[0]}</span><b class="target">${x[1]}</b></li>`).join('')}</ul></details>
      <button class="btn block" style="margin-top:12px" ${ready?`data-act="rankTest" data-arg="${nx.r}"`:'disabled'}>${ready?'Take rank test':retry?'Test on cooldown':'Locked'}</button></div>`;
  }
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

  let h=`<div class="page-head qhead"><div><p class="overline">${sp.boss?'Weekly boss':sp.rest?'Recovery':"Today's quest"}</p><h1 class="h1" style="margin-top:6px">${esc(sp.boss?'Boss Day':sp.type)}</h1><p class="muted">${sp.note}</p></div>
    <div class="mini-ring">${ring(64,6,items.length?doneN/items.length:0)}<div class="in"><span>${doneN}<small>/${items.length}</small></span></div></div></div>`;

  if(notStarted())h+=`<div class="card state-card"><div class="state-ic">${ic('calendar')}</div><div><p class="h3">Quest locked until ${fmtDate(S.startDate)}</p><p class="muted small">Look through today's moves so you're ready.</p><button class="btn sm" data-act="startToday">Start today instead</button></div></div>`;
  else if(rec.completed)h+=`<div class="card ${rec.rested?'':'good'} state-card"><div class="state-ic">${ic(rec.rested?'moon':'check')}</div><div><p class="h3">${rec.rested?'Rest Pass active':'Quest cleared'}</p><p class="muted small">${rec.rested?'No training today. Recover well.':`+${rec.exp||0} EXP. See you tomorrow.`}</p></div></div>`;

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
      ${open&&t.cue?`<p class="ex-cue">${t.cue}</p>`:''}</li>`;
  };
  if(warm.length)h+=`<div class="sec-label"><span class="overline">Warm-up</span><span class="faint small">2 min</span></div><div class="card tight"><ul class="list">${warm.map(w=>row(w,true)).join('')}</ul></div>`;
  h+=`<div class="sec-label"><span class="overline">Main quest</span><span class="faint small">Tap ○ to log without workout mode</span></div><div class="card tight"><ul class="list">${main.map(t=>row(t,false)).join('')}</ul></div>`;
  justToggled=null;

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
}
ACT.cue=id=>{openCues.has(id)?openCues.delete(id):openCues.add(id);renderQuest()};

/* ---------- PROGRESS ---------- */
function renderProgress(){
  const tabs=[['skills','Skills'],['plan','Plan'],['history','History']];
  let h=`<div class="page-head"><h1 class="h1">Progress</h1></div>
    <div class="seg" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${progTab===k}" data-act="prog" data-arg="${k}">${l}</button>`).join('')}</div><div id="progBody">`;
  h+=progTab==='skills'?skillsHTML():progTab==='plan'?planHTML():historyHTML();
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
  PHASES.forEach(p=>{
    const nowIn=cw>=p.weeks[0]&&cw<=p.weeks[1];
    h+=`<div class="sec-label"><span class="overline">${p.name.replace(/: .*/,'')} · Weeks ${p.weeks[0]}–${p.weeks[1]}</span>${nowIn?'<span class="pill accent">Now</span>':''}</div>
      <div class="card tight phase"><div style="padding:14px 20px 6px"><p class="h2">${p.name.replace(/^Phase \d+: /,'')}</p><p class="muted small" style="margin-top:4px">${p.goal}</p></div><ul class="list">`;
    for(let w=p.weeks[0];w<=p.weeks[1];w++){
      const cls=w===cw?'now':(w<cw?'past':'');
      h+=`<li class="lrow wk-row ${cls}"${w===cw?' aria-current="step"':''}><span class="lead">${w<cw?ic('check'):w}</span><div class="grow"><p class="t" style="font-weight:500;font-size:15px">${WEEKLY_FOCUS[w]}</p></div>${testWeek[w]?`<span class="pill accent">${ic('trophy')}Test ${testWeek[w]}</span>`:''}</li>`;
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
  const tiles=[['zap',S.totalQuests,'Quests cleared'],['flame',S.bestStreak,'Best streak'],['dumbbell',S.totalReps.toLocaleString(),'Total reps'],['skull',S.deaths,'Deaths']];
  let h=`<div class="tiles">${tiles.map(([i,v,l])=>`<div class="tile"><span class="lead">${ic(i)}</span><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;

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

/* ---------- DIET ---------- */
function renderDiet(){
  const ds=dietState(),t={low:Math.round(ds.weight*0.83),high:Math.round(ds.weight*1.2)};
  const allow=DIET_TYPES[ds.type].allow,today=todayStr();
  const eaten=(ds.eaten[today]||[]).map(id=>{const [m,i]=id.split(':');return {id,f:FOODS[m]&&FOODS[m][+i]}}).filter(x=>x.f);
  const tot=eaten.reduce((a,x)=>({p:a.p+x.f.p,kcal:a.kcal+x.f.kcal}),{p:0,kcal:0});
  const status=tot.p>=t.high?['good','Target reached']:tot.p>=t.low?['accent',`${t.high-tot.p}g to the muscle range`]:['',`${t.low-tot.p}g to your baseline`];

  let h=`<div class="page-head"><h1 class="h1">Nutrition</h1><p class="muted">Simple Indian meals that hit your protein.</p></div>
    <div class="seg" role="radiogroup" aria-label="Diet type">${Object.entries(DIET_TYPES).map(([k,v])=>`<button role="radio" aria-checked="${ds.type===k}" data-act="dietType" data-arg="${k}">${v.label}</button>`).join('')}</div>

    <div class="card"><div class="protein">
      <div class="ring-box">${ring(112,10,tot.p/t.high)}<div class="in"><b>${tot.p}g</b><span>PROTEIN</span></div></div>
      <div class="grow"><p class="overline">Daily target</p><p class="h2 num" style="margin:4px 0 8px">${t.low}–${t.high}g</p>
        <span class="pill ${status[0]}">${status[1]}</span></div></div>
      <form class="weight-form" id="dwForm"><label class="field" for="dwIn">${ic('scale')}<input id="dwIn" type="number" inputmode="decimal" min="30" max="200" step="0.1" value="${ds.weight}" aria-label="Body weight in kg"><span class="faint">kg</span></label><button class="btn ghost sm" type="submit">Update</button></form>
      <p class="faint small" style="margin-top:10px">0.83 g/kg is the baseline. 1.2 g/kg is better for building muscle while training.</p></div>

    <div class="sec-label"><span class="overline">Today's plate</span><span class="faint small num">${tot.kcal} kcal</span></div>
    ${eaten.length?`<div class="card tight"><ul class="list plain">${eaten.map((x,i)=>`<li class="lrow food-row"><i class="dot ${x.f.tag}"></i><div class="grow"><p class="t">${esc(x.f.n)}</p><p class="s">${x.f.p}g protein · ${x.f.kcal} kcal</p></div><button class="rm" aria-label="Remove ${esc(x.f.n)}" data-act="uneat" data-arg="${i}">${ic('x')}</button></li>`).join('')}</ul></div>`
      :`<div class="card state-card"><div class="state-ic">${ic('food')}</div><div><p class="h3">Nothing logged yet</p><p class="muted small">Tap + on any food below to add it to today.</p></div></div>`}`;

  MEAL_ORDER.forEach(meal=>{
    const list=FOODS[meal].map((f,i)=>({f,i})).filter(x=>allow.includes(x.f.tag));
    h+=`<div class="sec-label"><span class="overline">${MEAL_LABEL[meal]}</span></div><div class="card tight"><ul class="list plain">`;
    list.forEach(({f,i})=>{
      h+=`<li class="lrow food-row"><i class="dot ${f.tag}" title="${f.tag==='nonveg'?'Non-veg':f.tag==='egg'?'Egg':'Veg'}"></i><div class="grow"><p class="t">${f.n}</p>
        <p class="s"><b>${f.p}g</b> protein · ${f.c}g carbs · ${f.f}g fiber · ${f.kcal} kcal</p><p class="s faint">${f.serv}</p></div>
        <button class="add" aria-label="Add ${esc(f.n)} to today's plate" data-act="eat" data-arg="${meal}:${i}">${ic('plus')}</button></li>`;
    });
    h+=`</ul></div>`;
  });

  h+=`<div class="card info-list" style="margin-top:22px"><p class="h3" style="padding:0 0 6px">How to read this</p>
    <p>Numbers are per serving shown, not per 100g, so you can read a plate directly.</p>
    <p>Any one item per meal is a reasonable choice. Aim for a high-fiber item at most meals.</p>
    <p>Values come from USDA FoodData Central and ICMR-NIN. Home cooking varies, so treat them as close estimates.</p></div>`;
  $('diet').innerHTML=h;
  $('dwForm').addEventListener('submit',e=>{
    e.preventDefault();
    const v=parseFloat($('dwIn').value);
    if(!v||v<30||v>200){toast('Enter a weight between 30 and 200 kg');return}
    const d=dietState();d.weight=Math.round(v*10)/10;saveDietState(d);renderDiet();toast('Weight updated');
  });
}
ACT.dietType=k=>{const d=dietState();d.type=k;saveDietState(d);renderDiet()};
ACT.eat=id=>{const d=dietState(),t=todayStr();(d.eaten[t]=d.eaten[t]||[]).push(id);saveDietState(d);buzz('tap');renderDiet();const [m,i]=id.split(':');toast(`Added ${FOODS[m][+i].n} · +${FOODS[m][+i].p}g protein`)};
ACT.uneat=i=>{const d=dietState(),t=todayStr();(d.eaten[t]||[]).splice(+i,1);saveDietState(d);renderDiet()};
