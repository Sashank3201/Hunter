/* Hunter System: guided workout mode.
   One exercise at a time: log each set, rest starts automatically, timed holds
   count themselves down. Progress is written to today's log after every set,
   so closing the app mid-workout loses nothing. */
const W={open:false,steps:[],i:0,phase:'set',end:0,total:0,reps:0,tick:null,wake:null,after:null};

function wSteps(){
  const items=buildQuestItems(),warm=items.filter(i=>i.warm);
  const steps=[];
  if(warm.length)steps.push({warm:true,items:warm});
  items.filter(i=>!i.warm).forEach(it=>steps.push({item:it}));
  return steps;
}
function stepDone(st){const rec=todayRec();return st.warm?st.items.every(i=>rec.done.includes(i.id)):rec.done.includes(st.item.id)}
function setsLogged(it){return (todayRec().sets[it.id]||[]).length}

function openWorkout(){
  if(todayRec().completed||notStarted()||penaltyDue())return;
  W.steps=wSteps();
  W.i=W.steps.findIndex(s=>!stepDone(s));
  if(W.i<0){W.i=W.steps.length;W.phase='final'}else enterStep();
  W.open=true;
  $('workout').hidden=false;
  document.body.classList.add('locked');
  try{history.pushState({workout:1},'')}catch(e){}
  keepAwake();
  wRender();
}
function closeWorkout(fromPop){
  if(!W.open)return;
  W.open=false;clearInterval(W.tick);
  $('workout').hidden=true;
  document.body.classList.remove('locked');
  if(W.wake){W.wake.release().catch(()=>{});W.wake=null}
  if(!fromPop&&history.state&&history.state.workout)try{history.back()}catch(e){}
  renderAll();
}
window.addEventListener('popstate',()=>{if(W.open)closeWorkout(true)});

async function keepAwake(){
  try{if('wakeLock' in navigator&&W.open&&!W.wake){W.wake=await navigator.wakeLock.request('screen');W.wake.addEventListener('release',()=>{W.wake=null})}}catch(e){}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&W.open){keepAwake();wTick()}});

function enterStep(){
  const st=W.steps[W.i];
  W.phase='set';
  if(st&&st.item){const a=todayRec().sets[st.item.id];W.reps=a&&a.length?a[a.length-1]:st.item.amt}
}

/* ---------- timers ---------- */
function startClock(sec,phase){
  W.phase=phase;W.total=sec;W.end=Date.now()+sec*1000;
  clearInterval(W.tick);W.tick=setInterval(wTick,200);
  wRender();
}
function left(){return Math.max(0,Math.ceil((W.end-Date.now())/1000))}
function wTick(){
  if(W.phase!=='rest'&&W.phase!=='hold'){clearInterval(W.tick);return}
  const l=left();
  const c=$('wClock');if(c)c.textContent=fmtClock(l);
  const r=$('wRing');if(r)r.style.strokeDashoffset=String(339.3*(1-l/W.total));
  if(l<=0){clearInterval(W.tick);W.phase==='hold'?holdFinished():restFinished()}
}
function fmtClock(n){return n>=60?Math.floor(n/60)+':'+String(n%60).padStart(2,'0'):String(n)}

/* ---------- flow ---------- */
/* First unfinished step after the current one (wrapping), or -1 when all are done. */
function nextOpen(){
  const n=W.steps.length;
  for(let k=1;k<=n;k++){const j=(W.i+k)%n;if(!stepDone(W.steps[j]))return j}
  return -1;
}
function afterSet(it){
  const doneEx=setsLogged(it)>=it.sets;
  W.nextI=doneEx?nextOpen():W.i;
  if(doneEx&&W.nextI<0){W.phase='final';buzz('done');wRender();return}
  W.after=doneEx?'next':'set';
  startClock(restFor(it),'rest');
}
function holdFinished(){
  const it=W.steps[W.i].item;
  buzz('alarm');
  const pr=logSet(it,it.amt);
  if(pr)toast('New record: '+dn(it.name));
  afterSet(it);
}
function restFinished(){
  buzz('alarm');
  if(W.after==='next'){W.i=W.nextI;enterStep()}else W.phase='set';
  wRender();
}

ACT.workout=openWorkout;
ACT.wClose=()=>closeWorkout(false);
ACT.wWarm=id=>{toggleDone(id);wRender()};
ACT.wWarmNext=()=>{if(!stepDone(W.steps[W.i]))return;const j=nextOpen();if(j<0)W.phase='final';else{W.i=j;enterStep()}buzz('set');wRender()};
ACT.wFinal=()=>{W.phase='final';wRender()};
ACT.wStep=d=>{W.reps=Math.max(0,Math.min(999,W.reps+(+d)));buzz('tap');const e=$('wReps');if(e)e.textContent=W.reps};
ACT.wSet=()=>{
  const it=W.steps[W.i].item;
  if(W.reps<=0)return;
  buzz('set');
  const pr=logSet(it,W.reps);
  if(pr)toast('New record: '+dn(it.name)+' · '+W.reps);
  afterSet(it);
};
ACT.wHold=()=>{buzz('set');startClock(W.steps[W.i].item.amt,'hold')};
ACT.wHoldLog=()=>{clearInterval(W.tick);holdFinished()};
ACT.wHoldStop=()=>{clearInterval(W.tick);W.phase='set';wRender()};
ACT.wUndo=()=>{const it=W.steps[W.i].item;undoSet(it);W.phase='set';wRender()};
ACT.wMore=()=>{W.end+=15000;W.total+=15;wTick()};
ACT.wSkip=()=>{clearInterval(W.tick);restFinished()};
ACT.wJump=i=>{if(W.phase==='hold'||W.phase==='rest')clearInterval(W.tick);W.i=+i;enterStep();wRender()};
ACT.wClaim=()=>{closeWorkout(false);completeDay()};

/* ---------- render ---------- */
function ring(sec,label,sub){
  return `<div class="ring-wrap"><svg viewBox="0 0 120 120" class="ring" aria-hidden="true"><circle cx="60" cy="60" r="54" class="ring-bg"/><circle id="wRing" cx="60" cy="60" r="54" class="ring-fg" style="stroke-dashoffset:${339.3*(1-sec/W.total)}"/></svg>
    <div class="ring-in"><span class="ring-lbl">${label}</span><b id="wClock" role="timer">${fmtClock(sec)}</b><span class="ring-sub">${sub}</span></div></div>`;
}

function wRender(){
  const steps=W.steps,st=steps[W.i];
  let h=`<div class="w-top"><button class="w-x" data-act="wClose" aria-label="Pause workout and close">✕ <span>Pause</span></button>
    <span class="w-pos">${W.phase==='final'?'All clear':`Quest ${W.i+1} of ${steps.length}`}</span></div>
    <div class="w-prog">${steps.map((s,i)=>`<button class="${stepDone(s)?'d':''}${i===W.i?' c':''}" data-act="wJump" data-arg="${i}" aria-label="Go to ${s.warm?'warm-up':esc(dn(s.item.name))}"></button>`).join('')}</div>`;

  if(W.phase==='final'){
    h+=`<div class="w-body w-final">${sysWin('Daily Quest',`<p class="q-title">All quests cleared</p><p class="q-line">The System is ready to grant your reward.</p>
      <button class="btn sys" data-act="wClaim">Claim reward</button>`)}</div>`;
  }else if(st.warm){
    const rec=todayRec();
    h+=`<div class="w-body"><p class="w-kick">Warm-up</p><h2 class="w-name">Wake the body</h2>
      <p class="w-cue">Do each one, then tap it. Two minutes, no rushing.</p>
      <div class="w-warm">${st.items.map(w=>{const on=rec.done.includes(w.id);return `<button class="w-wi${on?' on':''}" aria-pressed="${on}" data-act="wWarm" data-arg="${w.id}"><span>${w.name}</span><small>${w.amt}</small></button>`}).join('')}</div></div>
      <div class="w-foot"><button class="btn" data-act="wWarmNext" ${stepDone(st)?'':'disabled'}>${stepDone(st)?'Start main quest':'Tap each warm-up'}</button></div>`;
  }else{
    const it=st.item,n=setsLogged(it),logged=todayRec().sets[it.id]||[];
    const setNo=Math.min(n+1,it.sets),pr=S.prs[it.name];
    const pips=`<div class="w-pips" aria-label="${n} of ${it.sets} sets logged">${Array.from({length:it.sets},(_,i)=>`<i class="${i<n?'on':''}${i===n&&W.phase!=='rest'?' cur':''}">${i<n?logged[i]:''}</i>`).join('')}</div>`;
    h+=`<div class="w-body"><p class="w-kick">${it.stat===it.family?it.stat:`${it.stat} · ${it.family}`}${it.note?` · <span class="t-limit">${it.note}</span>`:''}</p>
      <h2 class="w-name">${dn(it.name)}</h2>${pips}`;

    if(W.phase==='rest'){
      const nx=W.after==='next'?steps[W.nextI]:null;
      h+=ring(left(),'Rest',nx?`Next: ${esc(dn(nx.item.name))}`:`Next: set ${n+1} of ${it.sets}`)+`</div>
        <div class="w-foot two"><button class="btn ghost" data-act="wMore">+15s</button><button class="btn" data-act="wSkip">Skip rest</button></div>`;
    }else if(W.phase==='hold'){
      h+=ring(left(),`Set ${setNo} of ${it.sets}`,'Hold steady')+`</div>
        <div class="w-foot two"><button class="btn ghost" data-act="wHoldStop">Stop</button><button class="btn" data-act="wHoldLog">Done early</button></div>`;
    }else if(n>=it.sets){
      const j=nextOpen();
      h+=`<p class="w-big-note">Cleared</p></div><div class="w-foot two"><button class="btn ghost" data-act="wUndo">Undo last set</button>${j>=0?`<button class="btn" data-act="wJump" data-arg="${j}">Next quest</button>`:`<button class="btn" data-act="wFinal">Finish</button>`}</div>`;
    }else if(it.timed){
      h+=`<div class="w-target"><span>Set ${setNo} of ${it.sets}</span><b>${it.amt}<small>sec</small></b>${pr?`<em>Record ${pr.best}s</em>`:''}</div>
        <details class="w-how"${n?"":" open"}><summary>How to</summary><p>${it.cue}</p></details></div>
        <div class="w-foot">${n?`<button class="btn quiet" data-act="wUndo">Undo last set</button>`:''}<button class="btn" data-act="wHold">Start ${it.amt}s hold</button></div>`;
    }else{
      h+=`<div class="w-target"><span>Set ${setNo} of ${it.sets} · target ${it.amt}</span>
          <div class="stepper"><button data-act="wStep" data-arg="-1" aria-label="One less rep">−</button><b id="wReps" aria-live="polite">${W.reps}</b><button data-act="wStep" data-arg="1" aria-label="One more rep">+</button></div>
          <em>reps you actually did${pr?` · record ${pr.best}`:''}</em></div>
        <details class="w-how"${n?"":" open"}><summary>How to</summary><p>${it.cue}</p></details></div>
        <div class="w-foot">${n?`<button class="btn quiet" data-act="wUndo">Undo last set</button>`:''}<button class="btn" data-act="wSet">Set done</button></div>`;
    }
  }
  $('workout').innerHTML=h;
}
