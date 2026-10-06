/* Hunter System: tab views. Each render* function rebuilds one section from S. */
let firstPaint=true;
let progTab='skills';

function renderTop(){
  $('when').innerHTML=notStarted()?'Gate opens<br>'+fmtDate(S.startDate):'Week '+weekNumber()+'<br>'+SPLIT[dayIndex()].name;
}

/* Blue System-window shell used across the app. */
function sysWin(title,body,cls=''){
  return `<div class="win ${cls}"><div class="win-h"><span class="win-ico" aria-hidden="true">!</span><span>${title}</span></div><div class="win-b">${body}</div></div>`;
}

/* ---------- STATUS ---------- */
function questCard(){
  const sp=todaysSplit(),rec=todayRec(),items=buildQuestItems().filter(i=>!i.warm);
  if(notStarted())return sysWin('Notice',`<p class="q-line">Your first quest unlocks on <b>${fmtDate(S.startDate)}</b>, in ${dayDiff(todayStr(),S.startDate)} day${dayDiff(todayStr(),S.startDate)>1?'s':''}.</p>
    <button class="btn sys" data-act="startToday">Start today instead</button>`);
  if(rec.completed)return sysWin('Daily Quest',`<p class="q-title">${rec.rested?'Rest Pass active':'Quest cleared'}</p>
    <p class="q-line">${rec.rested?'Recover well. Your streak is safe.':`+${rec.exp||0} EXP earned today. Streak ${S.streak}.`}</p>
    <p class="q-line dim">Tomorrow: ${SPLIT[(dayIndex()+1)%7].name}, ${SPLIT[(dayIndex()+1)%7].type}.</p>`,'cleared');
  const all=buildQuestItems(),doneN=all.filter(i=>rec.done.includes(i.id)).length;
  return sysWin('Daily Quest',`<p class="q-title">${sp.name}: ${sp.boss?'Boss day':esc(sp.type)}</p>
    <ul class="q-list">${items.map(it=>`<li class="${rec.done.includes(it.id)?'ok':''}"><span>${esc(dn(it.name))}</span><b>${it.sets}×${it.amt}${it.timed?'s':''}</b></li>`).join('')}</ul>
    ${penaltyDue()?`<p class="q-warn">Penalty owed: ${S.penaltyReps-S.penaltyProgress} reps. Clear it first.</p>`:`<p class="q-warn">Warning: failing to complete the daily quest will bring a penalty.</p>`}
    <button class="btn sys" data-act="goQuest">${doneN?`Resume quest · ${doneN}/${all.length}`:'Begin quest'}</button>`);
}

function renderStatus(){
  const rk=currentRank(),lv=levelFromExp(),nx=nextRank();
  const pct=Math.min(100,Math.round(lv.into/lv.need*100));
  const enter=firstPaint?' enter':'';
  const name=S.profile?esc(S.profile.name):'Hunter';
  let h=`<div class="hero">
    <div class="rank-letter${rk.r==='S'?' s':''}${enter}" aria-hidden="true">${rk.r}</div>
    <div>
      <span class="player">Player · ${name}</span>
      <span class="lv-word">Level</span><span class="lv-num">${S.level}</span>
      <div class="rank-name"><span class="sr">Rank ${rk.r}: </span>${rk.name}</div>
    </div>
    <div class="exp">
      <div class="track" role="progressbar" aria-label="EXP to next level" aria-valuemin="0" aria-valuemax="${lv.need}" aria-valuenow="${lv.into}"><div class="fill" style="width:${pct}%"></div></div>
      <div class="exp-nums"><span>${lv.into} / ${lv.need} EXP</span><span>Streak ${S.streak} · Best ${S.bestStreak}${S.deaths?` · Deaths ${S.deaths}`:''}</span></div>
    </div>
  </div>`;

  h+=questCard();

  h+=`<h2 class="h">Stats</h2><ul class="stats">`;
  STATS.forEach(st=>{
    const v=S.stats[st],p=Math.max(0,Math.min(100,v));
    h+=`<li class="stat"><b>${st}</b><span class="val">${Math.floor(v)}</span><div class="seg" style="--p:${p.toFixed(1)}" aria-hidden="true"><i></i></div></li>`;
  });
  h+=`</ul>`;

  const wd=S.weekDays[weekKey()]||0;
  h+=`<div class="week-block"><h2 class="h">This week</h2>
    <div class="pips" aria-hidden="true">${[1,2,3,4,5].map(i=>`<div class="pip${i<=wd?' on':''}"></div>`).join('')}</div>
    <p class="note">${wd} of 5 training days done. Hit 5 and every stat gets a boost.</p></div>`;

  h+=`<div class="pen${S.penaltyLevel>0?' hot':''}"><h2 class="h" style="margin-bottom:4px">Penalty</h2>
    <div class="pen-row" aria-label="Penalty level ${S.penaltyLevel} of 5">${[1,2,3,4,5].map(i=>`<div class="lvl${i<=S.penaltyLevel?' on':''}${i===5?' dead':''}">${i===5?'DEAD':i}</div>`).join('')}</div>
    <p class="note">${S.penaltyReps>0?`You owe ${S.penaltyReps-S.penaltyProgress} reps. Clear them in Quest.`:'No debt. Keep the streak alive.'} ${passUsedThisWeek()?'Rest Pass used this week.':'Rest Pass available this week.'}</p></div>`;

  if(nx){
    const t=RANK_TESTS[nx.r],retry=rankRetryDate(nx.r);
    const ready=S.level>=t.level&&weekNumber()>=t.week&&!retry;
    const msg=retry?`Test failed recently. Retry on ${fmtDate(retry)}.`
      :ready?'You are ready. Take the test whenever you feel strong.'
      :`Unlocks at level ${t.level} and from week ${t.week} onward. You are level ${S.level}, week ${weekNumber()}.`;
    h+=`<div class="next"><h3>Rank ${nx.r}: ${nx.name}</h3><p>${msg}</p>
      <ul class="next-tests">${t.tests.map(x=>`<li><span>${x[0]}</span><b>${x[1]}</b></li>`).join('')}</ul>
      <button class="btn dark" ${ready?`data-act="rankTest" data-arg="${nx.r}"`:'disabled'}>Take rank test</button></div>`;
  }
  if(S.titles.length)h+=`<div class="titles"><h2 class="h">Titles</h2><p>${S.titles.map(esc).join(' · ')}</p></div>`;
  $('status').innerHTML=h;
  firstPaint=false;
}

/* ---------- QUEST ---------- */
const openCues=new Set();
function renderQuest(){
  const sp=todaysSplit(),rec=todayRec(),items=buildQuestItems();
  const warm=items.filter(i=>i.warm),main=items.filter(i=>!i.warm);
  const doneN=items.filter(i=>rec.done.includes(i.id)).length;
  const penDue=penaltyDue();

  let h=`<div class="day-head"><h2>${sp.name}</h2><div class="count">${doneN}<small>/${items.length}</small></div></div>
    <div class="day-type"><span>${sp.boss?sp.type.replace(' Boss Day',''):sp.type}</span>${sp.boss?'<span class="boss">Boss day</span>':''}</div>
    <p class="day-note">${sp.note}</p>`;

  if(notStarted()){
    h+=sysWin('Gate locked',`<p class="q-title">Opens ${fmtDate(S.startDate)}</p><p class="q-line">Your run begins in ${dayDiff(todayStr(),S.startDate)} day${dayDiff(todayStr(),S.startDate)>1?"s":""}. Use the time to read the moves below.</p><button class="btn sys" data-act="startToday">Start today instead</button>`);
  }else if(rec.completed){
    h+=sysWin('Daily Quest',`<p class="q-title">${rec.rested?'Rest Pass active':'Quest cleared'}</p><p class="q-line">${rec.rested?'No training today. Your streak is safe.':`+${rec.exp||0} EXP. Come back tomorrow.`}</p>`,'cleared');
  }

  if(penDue){
    const left=S.penaltyReps-S.penaltyProgress,p=Math.round(S.penaltyProgress/S.penaltyReps*100);
    h+=`<div class="pen-quest"><h3>Penalty quest</h3>
      <p>Do <b>${S.penaltyReps}</b> reps, any mix of squats, jumping jacks or burpees. Log them as you go.</p>
      <div class="pq-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${S.penaltyReps}" aria-valuenow="${S.penaltyProgress}"><i style="width:${p}%"></i></div>
      <p class="pq-left"><b>${left}</b> reps left</p>
      <div class="pq-btns"><button class="btn" data-act="penalty" data-arg="5">+5</button><button class="btn" data-act="penalty" data-arg="10">+10</button><button class="btn" data-act="penalty" data-arg="${left}">All ${left}</button></div>
      <p class="small">Today's quest stays locked until this is cleared.</p></div>`;
  }

  const lock=rec.completed||notStarted();
  if(warm.length){
    h+=`<p class="lbl">Warm-up first</p><div class="warm">`+warm.map(w=>{
      const on=rec.done.includes(w.id);
      return `<button class="chip${on?' on':''}" aria-pressed="${on}" data-act="toggle" data-arg="${w.id}" ${lock?'disabled':''}><span>${w.name}</span><small>${w.amt}</small></button>`;
    }).join('')+`</div>`;
  }

  h+=`<p class="lbl">Main quest <span class="lbl-hint">· tap a box to mark done without workout mode</span></p><ul class="tasks">`+main.map(t=>{
    const on=rec.done.includes(t.id),open=openCues.has(t.id),logged=rec.sets[t.id]||[];
    const pr=S.prs[t.name];
    return `<li class="task${on?' done':''}"><div class="task-main">
      <button class="box${on?' on':''}" aria-pressed="${on}" aria-label="${esc(dn(t.name))}: mark ${on?'not done':'done'}" data-act="toggle" data-arg="${t.id}" ${lock?'disabled':''}></button>
      <div><div class="t-name">${dn(t.name)}</div>
        <div class="t-meta"><span>${t.stat===t.family?t.stat:`${t.stat} · ${t.family}`}</span><button class="how" aria-expanded="${open}" data-act="cue" data-arg="${t.id}">${open?'Hide':'How to'}</button>${t.note?`<span class="t-limit">${t.note}</span>`:''}</div>
        ${logged.length?`<div class="t-log">Logged: ${logged.join(' · ')}${t.timed?' sec':''}</div>`:pr?`<div class="t-log dim">Record: ${pr.best}${pr.timed?' sec':''}</div>`:''}</div>
      <div class="t-target" aria-label="${t.sets} sets of ${t.amt}${t.timed?' seconds':''}">${t.sets}<small>×</small>${t.amt}${t.timed?'<small>s</small>':''}</div>
    </div>${open&&t.cue?`<p class="cue">${t.cue}</p>`:''}</li>`;
  }).join('')+`</ul>`;

  if(!rec.completed&&!notStarted()&&!sp.rest){
    h+=`<div class="pass-row">${passUsedThisWeek()
      ?`<p class="note">Rest Pass already used this week.</p>`
      :`<p class="note">Sick or injured?</p><button class="btn quiet" data-act="restPass">Use this week's Rest Pass</button>`}</div>`;
  }

  let label,act='',disabled=false;
  if(notStarted()){label='Gate locked';disabled=true}
  else if(rec.completed){label=rec.rested?'Resting today':'Cleared for today';disabled=true}
  else if(penDue){label='Clear penalty first';disabled=true}
  else if(questReady()){label='Complete quest';act='completeDay'}
  else{label=doneN?`Resume workout · ${doneN}/${items.length}`:'Begin workout';act='workout'}
  h+=`<div class="dock"><button class="btn${act==='completeDay'?' glow':''}" ${disabled?'disabled':`data-act="${act}"`}>${label}</button></div>`;
  $('quest').innerHTML=h;
}
ACT.cue=id=>{openCues.has(id)?openCues.delete(id):openCues.add(id);renderQuest()};

/* ---------- PROGRESS ---------- */
function renderProgress(){
  const tabs=[['skills','Skills'],['plan','Plan'],['history','History']];
  let h=`<div class="segctl" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${progTab===k}" data-act="prog" data-arg="${k}">${l}</button>`).join('')}</div>`;
  h+=progTab==='skills'?skillsHTML():progTab==='plan'?planHTML():historyHTML();
  $('progress').innerHTML=h;
}
ACT.prog=k=>{progTab=k;renderProgress()};

function skillsHTML(){
  let h=`<p class="sub">You climb one step at a time. The System moves you up after steady training. Never rush a step.</p>`;
  Object.keys(LADDERS).forEach(k=>{
    const L=LADDERS[k],cur=S.ladders[k].step,pr=S.prs[L.steps[cur][0]];
    h+=`<div class="lad"><div class="lad-head"><h3>${L.title}</h3><span>${L.stat} · step ${cur+1} of ${L.steps.length}</span></div>
      <div class="cur-name">${dn(L.steps[cur][0])}${pr?` <span class="pr-chip">Record ${pr.best}${pr.timed?'s':''}</span>`:''}</div>
      <div class="segs" aria-hidden="true">${L.steps.map((s,i)=>`<i class="${i<cur?'d':i===cur?'c':''}"></i>`).join('')}</div>
      <details><summary>Show all steps</summary><ol class="steps">${L.steps.map((s,i)=>`<li class="${i<cur?'d':i===cur?'c':''}">${dn(s[0])}</li>`).join('')}</ol></details></div>`;
  });
  return h;
}

function planHTML(){
  const cw=weekNumber(),today=dayIndex();
  const testWeek={};Object.keys(RANK_TESTS).forEach(r=>testWeek[RANK_TESTS[r].week]=r);
  let h=`<h2 class="h">Your week</h2><ul class="sched">`+
    [1,2,3,4,5,6,0].map(i=>`<li${i===today?' class="today"':''}><b>${SPLIT[i].name}</b><span>${SPLIT[i].type}</span></li>`).join('')+`</ul>`;
  PHASES.forEach(p=>{
    h+=`<div class="phase"><h3>${p.name.replace(/^Phase \d+: /,'')}</h3><p>Weeks ${p.weeks[0]} to ${p.weeks[1]}. ${p.goal}</p></div><ul class="weeks">`;
    for(let w=p.weeks[0];w<=p.weeks[1];w++){
      const cls=w===cw?'now':(w<cw?'past':'');
      h+=`<li class="wk ${cls}"${w===cw?' aria-current="step"':''}><span class="n">${w}</span><span>${WEEKLY_FOCUS[w]}</span>${testWeek[w]?`<span class="tag">Test ${testWeek[w]}</span>`:'<span></span>'}</li>`;
    }
    h+=`</ul>`;
  });
  return h;
}

/* Earliest day the Player has any history: before it, the calendar is blank. */
function firstDay(){return Object.keys(S.log).concat(S.startDate).sort()[0]}
/* State of one calendar day, for the heatmap. */
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
const DAY_LABEL={done:'Quest cleared',pass:'Rest Pass',miss:'Missed',rest:'Recovery day',today:'Today, in progress',none:'No record',future:'Upcoming'};

function historyHTML(){
  const tiles=[[S.totalQuests,'Quests cleared'],[S.bestStreak,'Best streak'],[S.totalReps,'Total reps'],[S.deaths,'Deaths']];
  let h=`<div class="tiles">${tiles.map(([v,l])=>`<div class="tile"><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;

  // heatmap: last 12 weeks, Monday-first columns
  const W=12,start=addDays(mondayOf(todayStr()),-7*(W-1));
  h+=`<h2 class="h">Last 12 weeks</h2><div class="heat" role="grid" aria-label="Training calendar, last 12 weeks">`;
  h+=`<div class="heat-days" aria-hidden="true">${['M','T','W','T','F','S','S'].map(d=>`<span>${d}</span>`).join('')}</div><div class="heat-grid">`;
  for(let w=0;w<W;w++){
    h+=`<div class="heat-col" role="row">`;
    for(let d=0;d<7;d++){
      const ds=addDays(start,w*7+d),st=dayState(ds);
      h+=`<span role="gridcell" tabindex="-1" class="hc ${st}${ds===todayStr()?' now':''}" data-tip="${fmtDate(ds)}: ${DAY_LABEL[st]}" aria-label="${fmtDate(ds)}: ${DAY_LABEL[st]}"></span>`;
    }
    h+=`</div>`;
  }
  h+=`</div></div><div class="legend">${['done','pass','miss','rest'].map(k=>`<span><i class="hc ${k}"></i>${DAY_LABEL[k]}</span>`).join('')}</div>`;

  // training days per week of the current run, goal = 5
  const cw=weekNumber(),weeks=[];
  for(let w=Math.max(1,cw-11);w<=cw;w++)weeks.push([w,S.weekDays['w'+w]||0]);
  h+=`<h2 class="h">Training days per week</h2><p class="sub">This run. The line marks the weekly goal of 5.</p>
    <div class="bars" role="list">${weeks.map(([w,n])=>`<div class="bar-col${w===cw?' cur':''}" role="listitem" tabindex="0" data-tip="Week ${w}: ${n} day${n===1?'':'s'}" aria-label="Week ${w}: ${n} training days">
      <div class="bar-slot"><i style="height:${n/6*100}%"></i></div><span>${w}</span></div>`).join('')}
      <div class="goal-line" aria-hidden="true"><span>5</span></div></div>`;

  // personal records
  const prs=Object.entries(S.prs).sort((a,b)=>b[1].date.localeCompare(a[1].date));
  h+=`<h2 class="h">Personal records</h2>`;
  h+=prs.length?`<ul class="prs">${prs.map(([n,p])=>`<li><span>${esc(dn(n))}</span><b>${p.best}${p.timed?'<small>s</small>':''}</b><em>${fmtDate(p.date)}</em></li>`).join('')}</ul>`
    :`<p class="note">Log sets in workout mode and your best single set for each move shows up here.</p>`;
  return h;
}

/* ---------- DIET ---------- */
function renderDiet(){
  const ds=dietState(),t={low:Math.round(ds.weight*0.83),high:Math.round(ds.weight*1.2)};
  const allow=DIET_TYPES[ds.type].allow,today=todayStr();
  const eaten=(ds.eaten[today]||[]).map(id=>{const [m,i]=id.split(':');return {id,f:FOODS[m]&&FOODS[m][+i]}}).filter(x=>x.f);
  const tot=eaten.reduce((a,x)=>({p:a.p+x.f.p,kcal:a.kcal+x.f.kcal,fib:a.fib+x.f.f}),{p:0,kcal:0,fib:0});
  const pPct=Math.min(100,Math.round(tot.p/t.high*100)),lowPct=t.low/t.high*100;

  let h=`<h2 class="h">Diet guide</h2>
    <div class="segctl" role="radiogroup" aria-label="Diet type">${Object.entries(DIET_TYPES).map(([k,v])=>`<button role="radio" aria-checked="${ds.type===k}" data-act="dietType" data-arg="${k}">${v.label}</button>`).join('')}</div>
    <form class="dwt" id="dwForm"><label for="dwIn">Your weight (kg)</label>
      <div class="dwt-row"><input id="dwIn" type="number" inputmode="decimal" min="30" max="200" step="0.1" value="${ds.weight}"><button class="btn dark" type="submit">Set</button></div></form>
    <div class="ptarget"><span class="pt-num">${t.low}<small>-</small>${t.high}<small>g</small></span><span class="pt-label">Protein per day<br>at ${ds.weight}kg body weight</span></div>
    <p class="note" style="margin:0 0 22px">Beginner range: 0.83 g/kg (baseline) to 1.2 g/kg (better for building muscle while training).</p>`;

  h+=`<div class="plate"><div class="plate-head"><h3>Today's plate</h3><span><b>${tot.p}g</b> protein · ${tot.kcal} kcal</span></div>
    <div class="plate-bar" role="progressbar" aria-label="Protein eaten today" aria-valuemin="0" aria-valuemax="${t.high}" aria-valuenow="${tot.p}"><i style="width:${pPct}%"></i><em style="left:${lowPct}%"></em></div>
    <p class="note">${tot.p>=t.high?'Protein target reached.':tot.p>=t.low?`Baseline reached. ${t.high-tot.p}g more for the muscle-building range.`:`${t.low-tot.p}g to the baseline.`}</p>
    ${eaten.length?`<ul class="plate-list">${eaten.map((x,i)=>`<li><span>${esc(x.f.n)}</span><b>${x.f.p}g</b><button class="x" aria-label="Remove ${esc(x.f.n)}" data-act="uneat" data-arg="${i}">×</button></li>`).join('')}</ul>`
      :`<p class="note dim">Tap <b>+</b> on any food below to add it.</p>`}</div>`;

  MEAL_ORDER.forEach(meal=>{
    const list=FOODS[meal].map((f,i)=>({f,i})).filter(x=>allow.includes(x.f.tag));
    h+=`<div class="meal-block"><h3>${MEAL_LABEL[meal]}</h3><ul class="foods">`;
    list.forEach(({f,i})=>{
      h+=`<li class="food"><div class="food-top"><span class="food-name">${f.n}</span><span class="food-tag ${f.tag}">${f.tag==='nonveg'?'Non-veg':f.tag==='egg'?'Egg':'Veg'}</span>
          <button class="add" aria-label="Add ${esc(f.n)} to today's plate" data-act="eat" data-arg="${meal}:${i}">+</button></div>
        <div class="food-serv">${f.serv}</div>
        <div class="macros">
          <div class="macro"><b>${f.p}</b><span>protein</span></div>
          <div class="macro"><b>${f.c}</b><span>carbs</span></div>
          <div class="macro"><b>${f.f}</b><span>fiber</span></div>
          <div class="macro kcal"><b>${f.kcal}</b><span>kcal</span></div>
        </div></li>`;
    });
    h+=`</ul></div>`;
  });

  h+=`<div class="rule"><h3>How to use this</h3>
    <p>Numbers are grams per serving shown, not per 100g, so you can read a plate directly.</p>
    <p>Mix and match: any one item per meal is a reasonable choice, not a rule.</p>
    <p>Fiber helps digestion and keeps you full. Aim for at least one high-fiber item most meals.</p>
    <p>These figures come from USDA FoodData Central and ICMR-NIN guidelines. Home cooking varies, so treat them as a close estimate.</p></div>`;
  $('diet').innerHTML=h;
  $('dwForm').addEventListener('submit',e=>{
    e.preventDefault();
    const v=parseFloat($('dwIn').value);
    if(!v||v<30||v>200){toast('Enter a weight between 30 and 200 kg.');return}
    const d=dietState();d.weight=Math.round(v*10)/10;saveDietState(d);renderDiet();toast('Weight saved.');
  });
}
ACT.dietType=k=>{const d=dietState();d.type=k;saveDietState(d);renderDiet()};
ACT.eat=id=>{const d=dietState(),t=todayStr();(d.eaten[t]=d.eaten[t]||[]).push(id);saveDietState(d);buzz('tap');renderDiet()};
ACT.uneat=i=>{const d=dietState(),t=todayStr();(d.eaten[t]||[]).splice(+i,1);saveDietState(d);renderDiet()};
