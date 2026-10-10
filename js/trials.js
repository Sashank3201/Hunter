/* Hunter System: rank-up trials (Hunter Association re-assessments).
   Reaching the level and week for the next rank opens a Trial Gate. Inside, every
   move of the rank test must be hit, in order. Each move gets two attempts, with
   rest between. Clear them all to rank up; fail and the Association re-assesses
   you in 7 days (no penalty). The run lives in S.trialRun, so it survives reloads.
   phase: intro | ready | hold | window | judge | rest */
const TRIAL_RECOVER=120; // seconds of rest after a failed attempt
const moveKind=m=>m[3]==='hold'?'hold':typeof m[3]==='number'?'window':'reps';
function moveTarget(m){const k=moveKind(m);return k==='hold'?`${m[1]} sec hold`:k==='window'?`${m[1]} reps in ${m[3]} sec`:`${m[1]} reps, one set`}

/* Requirements for rank r's trial. */
function trialStatus(r){
  const t=RANK_TESTS[r],retry=rankRetryDate(r),lvOk=S.level>=t.level,wkOk=weekNumber()>=t.week;
  return {t,lvOk,wkOk,retry,ready:lvOk&&wkOk&&!retry&&!S.trialRun&&!S.dungeonRun};
}

/* ---------- card on the Gates tab and Status ---------- */
function trialCardHTML(where){
  const run=S.trialRun;
  if(run){const t=RANK_TESTS[run.r];
    return `<div class="trial-card live"><div class="tc-seal">${run.r}</div><div class="grow"><p class="overline">Rank-up trial in progress</p><p class="h2">${t.gate}</p>
      <p class="s">Move ${Math.min(run.i+1,t.tests.length)} of ${t.tests.length} · ${2-run.tries} attempt${run.tries?'':'s'} left</p>
      <button class="btn block" data-act="trialResume">Return to the trial</button></div></div>`}
  const nx=nextRank();
  if(!nx)return where==='gates'?`<div class="trial-card done"><div class="tc-seal">S</div><div class="grow"><p class="overline">Hunter Association</p><p class="h2">All trials passed</p><p class="s">You are a verified S-Rank hunter.</p></div></div>`:'';
  const st=trialStatus(nx.r);
  return `<div class="trial-card${st.ready?' ready':''}"><div class="tc-seal">${nx.r}</div><div class="grow">
    <p class="overline">Hunter Association · ${nx.r}-Rank trial</p><p class="h2">${st.t.gate}</p><p class="s tc-line">“${st.t.line}”</p>
    <ul class="req">
      <li><i class="chk${st.lvOk?' on':''}">${ic('check')}</i><span>Reach level ${st.t.level}</span><em>you're ${S.level}</em></li>
      <li><i class="chk${st.wkOk?' on':''}">${ic('check')}</i><span>Train until week ${st.t.week}</span><em>week ${weekNumber()}</em></li>
      <li><i class="chk">${ic('check')}</i><span>Clear the trial</span><em>${st.retry?'retry '+fmtDate(st.retry):plural(st.t.tests.length,'move')}</em></li>
    </ul>
    <details class="more"><summary>What's in the trial ${ic('down')}</summary><ul class="list plain">${st.t.tests.map(m=>`<li class="lrow" style="padding:8px 0;min-height:0"><span class="grow">${m[0]}</span><b class="target">${moveTarget(m).replace(', one set','')}</b></li>`).join('')}</ul></details>
    <button class="btn block" style="margin-top:12px" ${st.ready?`data-act="trialEnter" data-arg="${nx.r}"`:'disabled'}>${st.ready?'Enter the trial':st.retry?'Re-assessment on '+fmtDate(st.retry):S.dungeonRun?'Finish your Gate first':'Locked'}</button></div></div>`;
}

/* ---------- entering ---------- */
function trialEnter(r){
  if(!trialStatus(r).ready)return;
  const t=RANK_TESTS[r];
  openModal(`<div class="m-stamp">${r}-Rank trial</div><p class="h2" style="margin-bottom:8px">${t.gate}</p>
    <p class="m-text">Hit every target, in order:</p>
    <ul class="m-moves">${t.tests.map((m,i)=>`<li><b>${String(i+1).padStart(2,'0')}</b><span>${m[0]}</span><em>${moveTarget(m).replace(', one set','')}</em></li>`).join('')}</ul>
    <p class="m-text">Each move has two attempts, with rest in between. If you fail, the Association re-assesses you in 7 days. There is no penalty.</p>
    <div class="m-btns"><button class="btn" data-act="trialOpen" data-arg="${r}">Enter the trial</button><button class="btn ghost" data-act="closeModal">Not now</button></div>`,'sys','shield');
}
function trialOpen(r){
  if(!trialStatus(r).ready)return;
  S.trialRun={r,i:0,tries:0,phase:'intro',t:0};save();closeModal();
  const L=$('trial');L.hidden=false;document.body.classList.add('locked');
  L.className='layer t-opening';
  L.innerHTML=`<div class="t-seal-big"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="94"/><circle cx="100" cy="100" r="80" class="d"/></svg>
    <span class="tsb-r">${r}</span><span class="tsb-t">Re-assessment</span></div><p class="portal-t">Hunter Association</p>`;
  buzz('alarm');
  setTimeout(()=>{L.className='layer';tRender()},1900);
}
function trialResume(){const L=$('trial');L.hidden=false;L.className='layer';document.body.classList.add('locked');tRender()}
function closeTrial(){$('trial').hidden=true;document.body.classList.remove('locked');renderAll();if(REVEALQ.length)setTimeout(()=>{if(revealIdle())nextReveal()},250)}

/* ---------- the trial ---------- */
const tRun=()=>S.trialRun,tMove=()=>{const r=tRun();return RANK_TESTS[r.r].tests[r.i]};
function tBegin(){const r=tRun();if(!r||r.phase!=='intro')return;r.phase='ready';save();buzz('set');tRender()}
function tStart(){ // start a hold or a timed window
  const r=tRun(),m=tMove(),k=moveKind(m);if(r.phase!=='ready')return;
  r.phase=k==='hold'?'hold':'window';r.t=k==='hold'?Date.now():Date.now()+m[3]*1000;save();buzz('set');tRender();
}
function tPass(){
  const r=tRun(),t=RANK_TESTS[r.r];if(!['ready','hold','window','judge'].includes(r.phase))return;
  buzz('done');r.i++;r.tries=0;
  if(r.i>=t.tests.length){trialPass();return}
  r.phase='rest';r.t=Date.now()+TRIAL_REST*1000;save();tRender();flash('Move cleared');
}
function tFail(){
  const r=tRun();if(!['ready','hold','window','judge'].includes(r.phase))return;
  r.tries++;buzz('bad');
  if(r.tries>=2){trialFail(false);return}
  r.phase='rest';r.t=Date.now()+TRIAL_RECOVER*1000;save();tRender();flash('Attempt failed','bad');
}
function tSkipRest(){const r=tRun();if(r&&r.phase==='rest'){r.phase='ready';r.t=0;save();buzz('set');tRender()}}
function flash(txt,cls=''){const f=document.querySelector('#trial .d-flash');if(!f)return;f.textContent=txt;f.className='d-flash go '+cls}
ACT.trialEnter=trialEnter;ACT.rankTest=trialEnter;
ACT.trialOpen=trialOpen;ACT.trialResume=trialResume;ACT.trialClose=closeTrial;
ACT.tBegin=tBegin;ACT.tStart=tStart;ACT.tPass=tPass;ACT.tFail=tFail;ACT.tSkipRest=tSkipRest;
ACT.tForfeit=()=>openModal(`<div class="m-stamp">Forfeit the trial?</div><p class="m-text">It counts as a failed trial: the Association re-assesses you in 7 days. No penalty.</p>
  <div class="m-btns"><button class="btn danger" data-act="tForfeitOk">Forfeit</button><button class="btn ghost" data-act="closeModal">Keep going</button></div>`,'red','shield');
ACT.tForfeitOk=()=>{closeModal();trialFail(true)};

/* ---------- outcomes ---------- */
function trialPass(){
  const r=tRun().r,rk=RANKS.find(x=>x.r===r),from=currentRank().r;
  S.rankTestsPassed=[...new Set([...S.rankTestsPassed,r])];delete S.rankFails[r];S.trialRun=null;
  const exp=TRIAL_EXP;S.exp+=exp;
  const loot=[`+${exp} EXP`,grantItem('key',1,r),grantItem('box')];
  const firstTitle=!S.titles.includes(rk.name);if(firstTitle)S.titles=[...S.titles,rk.name];
  const ups=[];armyTrain(100,ups);const shLv=announceUps(ups);
  const up=syncLevel();save();
  const L=$('trial');L.className='layer t-rankup';
  L.innerHTML=`<div class="rankup">
    <div class="ru-rays">${Array.from({length:16},(_,i)=>`<i style="--a:${i*22.5}deg"></i>`).join('')}</div>
    <div class="ru-stage"><span class="ru-old">${from}</span><span class="ru-new">${r}</span><span class="ru-ring"></span><span class="ru-ring two"></span></div>
    <p class="ru-word">Rank up</p>
    <p class="ru-name">${r}-Rank · ${rk.name}</p>
    <div class="ru-body"><p class="m-text">The Hunter Association has re-assessed you. You are now officially <b>${r}-Rank</b>.${up?` <b>Level ${S.level}!</b>`:''}</p>
      ${firstTitle?`<div class="m-flag lvl-flag">New title · ${rk.name}</div>`:''}${shLv.length?`<div class="m-flag">Your army trained with you · ${esc(shLv.join(', '))}</div>`:''}
      <p class="overline">Rewards</p>${lootHTML(loot)}
      <button class="btn block" data-act="trialClose" style="margin-top:16px">Continue</button></div></div>`;
  buzz('level');setTimeout(()=>buzz('level'),1100);
  checkFeats();
}
function trialFail(forfeit){
  const r=tRun();if(!r)return;const t=RANK_TESTS[r.r];
  S.rankFails[r.r]=todayStr();S.trialRun=null;save();
  const L=$('trial');L.className='layer';
  L.innerHTML=`<div class="d-result lose"><p class="overline">${r.r}-Rank trial · ${t.gate}</p><h2 class="d-big">${forfeit?'Forfeited':'Not yet'}</h2>
    <p class="m-text">${forfeit?'You left the trial.':`Two attempts at ${esc(t.tests[r.i][0].toLowerCase())} fell short.`} The Association will re-assess you on <b>${fmtDate(addDays(todayStr(),RANK_COOLDOWN))}</b>. No penalty: keep training and come back stronger.</p>
    <button class="btn block" data-act="trialClose" style="margin-top:18px">Leave</button></div>`;
  buzz('bad');
}

/* ---------- render ---------- */
function tRing(frac,big,label,sub){
  return `<div class="ring-wrap t-ring"><svg class="ring-svg" viewBox="0 0 120 120" aria-hidden="true"><circle class="bg" cx="60" cy="60" r="54" stroke-width="7"/>
    <circle id="tRingFg" class="fg" cx="60" cy="60" r="54" stroke-width="7" style="stroke-dasharray:339.3;stroke-dashoffset:${339.3*(1-Math.max(0,Math.min(1,frac)))}"/></svg>
    <div class="ring-in"><span class="overline">${label}</span><b id="tBig" role="timer">${big}</b><span class="muted small">${sub}</span></div></div>`;
}
function tRender(){
  const r=tRun(),L=$('trial');if(!r){closeTrial();return}
  const t=RANK_TESTS[r.r],m=t.tests[Math.min(r.i,t.tests.length-1)],k=moveKind(m),now=Date.now();
  let h=`<div class="d-flash"></div><div class="w-top"><button class="icon-btn" data-act="trialClose" aria-label="Leave the screen (the trial stays open)">${ic('left')}</button>
    <span class="w-pos"><span>${r.r}-Rank trial</span><b>${t.gate}</b></span>
    ${r.phase==='intro'?'<span style="width:44px"></span>':`<button class="icon-btn" data-act="tForfeit" aria-label="Forfeit the trial">${ic('x')}</button>`}</div>
    <div class="w-prog">${t.tests.map((x,i)=>`<i class="${i<r.i?'d':''}${i===r.i?' c':''}"></i>`).join('')}</div>`;
  if(r.phase==='intro'){
    h+=`<div class="w-body d-intro"><p class="overline">Hunter Association · re-assessment</p><h2 class="w-name">${t.gate}</h2>
      <p class="t-quote">“${t.line}”</p>
      <ol class="method d-waves">${t.tests.map(x=>`<li><span>${x[0]} · <b>${moveTarget(x)}</b></span></li>`).join('')}</ol>
      <p class="muted small" style="margin-top:14px">Two attempts per move. Rest ${TRIAL_REST} s between moves, ${TRIAL_RECOVER/60} min after a miss. Warm up before you begin.</p></div>
      <div class="w-foot"><button class="btn" data-act="tBegin">Begin the trial</button></div>`;
  }else if(r.phase==='rest'){
    const left=Math.max(0,Math.ceil((r.t-now)/1000)),total=r.tries?TRIAL_RECOVER:TRIAL_REST;
    h+=`<div class="w-body"><p class="overline">${r.tries?'Recover · one attempt left':'Rest'}</p><h2 class="w-name">${r.tries?'Again':'Next up'}</h2>
      <p class="muted" style="margin:-6px 0 14px">${m[0]} · ${moveTarget(m)}</p>
      ${tRing(left/total,fmtClock(left),r.tries?'Recover':'Rest','Breathe. Shake it out.')}</div>
      <div class="w-foot"><button class="btn" data-act="tSkipRest">I'm ready</button></div>`;
  }else{
    const pips=`<span class="t-pips">${[0,1].map(i=>`<i class="${i<r.tries?'x':i===r.tries?'on':''}"></i>`).join('')}<em>Attempt ${r.tries+1} of 2</em></span>`;
    h+=`<div class="w-body"><div class="t-row"><p class="overline">Move ${r.i+1} of ${t.tests.length}</p>${pips}</div><h2 class="w-name">${m[0]}</h2>${demoHTML(m[2])}`;
    if(r.phase==='hold'){const held=Math.floor((now-r.t)/1000);
      h+=tRing(held/m[1],String(Math.min(held,m[1])),'Hold',`Target ${m[1]} s`)+`</div><div class="w-foot"><button class="btn ghost" data-act="tFail">I dropped</button></div>`;
    }else if(r.phase==='window'){const left=Math.max(0,Math.ceil((r.t-now)/1000));
      h+=tRing(left/m[3],String(left),'Go',`${m[1]} reps`)+`</div><div class="w-foot"><button class="btn" data-act="tPass">Hit ${m[1]}</button></div>`;
    }else if(r.phase==='judge'){
      h+=`<div class="w-target"><p class="overline">Time</p><div class="big-num">${m[1]}<small>reps?</small></div><p class="muted">Did you reach it in ${m[3]} seconds?</p></div></div>
        <div class="w-foot two"><button class="btn ghost" data-act="tFail">Fell short</button><button class="btn" data-act="tPass">Hit ${m[1]}</button></div>`;
    }else{
      h+=`<div class="w-target"><p class="overline">Target</p><div class="big-num">${m[1]}<small>${k==='hold'?'sec':'reps'}</small></div><p class="muted">${k==='hold'?'Hold without breaking form':k==='window'?`Inside ${m[3]} seconds`:'In one set, clean form'}</p></div></div>`;
      h+=k==='reps'?`<div class="w-foot two"><button class="btn ghost" data-act="tFail">Fell short</button><button class="btn" data-act="tPass">Hit ${m[1]}</button></div>`
        :`<div class="w-foot"><button class="btn" data-act="tStart">${k==='hold'?'Start the hold':`Start ${m[3]} s`}</button></div>`;
    }
  }
  L.innerHTML=h;startDemos();
}

/* Ticker: holds, timed windows and rest, even if the trial screen is closed. */
setInterval(()=>{
  const r=S.trialRun;if(!r||!['hold','window','rest'].includes(r.phase))return;
  const now=Date.now(),open=!$('trial').hidden,m=RANK_TESTS[r.r].tests[r.i],big=$('tBig'),fg=$('tRingFg');
  if(r.phase==='hold'){const held=Math.floor((now-r.t)/1000);
    if(held>=m[1]){if(!open){$('trial').hidden=false;$('trial').className='layer';document.body.classList.add('locked')}tPass();return}
    if(big)big.textContent=held;if(fg)fg.style.strokeDashoffset=339.3*(1-held/m[1]);
  }else{const left=Math.ceil((r.t-now)/1000),total=r.phase==='window'?m[3]:r.tries?TRIAL_RECOVER:TRIAL_REST;
    if(left<=0){r.phase=r.phase==='window'?'judge':'ready';r.t=0;save();buzz('set');if(open)tRender();return}
    if(big)big.textContent=r.phase==='rest'?fmtClock(left):left;if(fg)fg.style.strokeDashoffset=339.3*(1-left/total);
  }
},250);
