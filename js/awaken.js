/* Hunter System: the Awakening. First-launch registration and System briefing.
   A returning player (old save, no profile yet) gets a shorter "System update"
   path that keeps every bit of progress and skips the start-date question. */
const A={step:0,returning:false,name:'',diet:'nonveg',weight:63,start:'today',brief:0,onlyBrief:false};

function needsAwakening(){return !S.profile}

function startAwakening(onlyBrief){
  const ds=dietState();
  Object.assign(A,{step:onlyBrief?'brief':'intro',brief:0,onlyBrief:!!onlyBrief,
    returning:!S.profile&&(S.exp>0||S.totalQuests>0||S.deaths>0),
    name:S.profile?S.profile.name:'',diet:ds.type,weight:ds.weight,start:'today'});
  $('awaken').innerHTML='<div class="a-bg" aria-hidden="true"><i></i><i></i><i></i></div><div class="a-screen" id="aScreen"></div>';
  $('awaken').hidden=false;
  document.body.classList.add('locked');
  aRender();
}

function finishAwakening(){
  if(!A.onlyBrief){
    S.profile={name:A.name.trim().slice(0,20)||'Hunter',haptics:true};
    if(!A.returning){
      S.startDate=A.start==='monday'?nextMonday(todayStr()):todayStr();
      S.lastChecked=S.startDate;
    }
    save();
    const d=dietState();d.type=A.diet;d.weight=A.weight;saveDietState(d);
  }
  $('awaken').hidden=true;
  document.body.classList.remove('locked');
  if(!A.onlyBrief)processMissedDays();
  showTab('status');
  renderAll();
  if(!A.onlyBrief)buzz('level');
}

/* Typewriter for the System's opening line. Instant when motion is reduced. */
function typeIn(el){
  if(!el)return;
  const full=el.dataset.text;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=full;return}
  let i=0;el.textContent='';el.classList.add('typing');
  const t=setInterval(()=>{el.textContent=full.slice(0,++i);if(i>=full.length){clearInterval(t);setTimeout(()=>el.classList.remove('typing'),900)}},32);
}

const REG=['name','diet','body'];
const BRIEF_IC=['zap','alert','skull','shield'];
function aNav(back){
  const k=REG.indexOf(A.step);
  return `<div class="a-nav">${back?`<button class="icon-btn" data-act="aGo" data-arg="${back}" aria-label="Back">${ic('left')}</button>`:'<span style="width:44px"></span>'}
    <div class="a-steps" aria-hidden="true">${REG.map((s,i)=>`<i class="${i<=k?'on':''}"></i>`).join('')}</div><span style="width:44px"></span></div>`;
}
function opt(on,act,arg,inner,extra=''){
  return `<button role="radio" aria-checked="${on}" class="a-opt${on?' on':''}" data-act="${act}" data-arg="${arg}" ${extra}>${inner}<span class="chk${on?' on':''}">${ic('check')}</span></button>`;
}

function aRender(){
  let h='';
  const s=A.step;
  if(s==='intro'||s==='decline'){
    const dec=s==='decline';
    const line=dec?'Declining is not an option.':A.returning?'System update detected. Your progress is safe.':'You have acquired the qualifications to be a Player.';
    h=`<div class="a-main a-center"><div class="a-emblem${dec?' red':''}">${ic(dec?'alert':'sparkle')}</div>
      <p class="overline" style="margin-bottom:14px">${dec?'Warning':'System notification'}</p>
      <h1 class="a-title a-type" id="aType" data-text="${esc(line)}"></h1>
      <p class="a-sub">${dec?'The System has already chosen you.':A.returning?'Re-register to continue where you left off.':'Daily quests. Real training. Level up for real.'}</p></div>
      <div class="a-foot"><button class="btn" data-act="aGo" data-arg="name">${A.returning?'Continue':'Accept'}</button>${A.returning||dec?'':`<button class="btn quiet" data-act="aDecline" style="color:var(--text-3)">Decline</button>`}</div>`;
  }else if(s==='name'){
    h=aNav('intro')+`<div class="a-main top"><p class="overline">Registration · 1 of 3</p><h1 class="a-title" style="margin-top:10px">What should the System call you?</h1>
      <label class="a-input" for="aName">${ic('sparkle')}<input id="aName" maxlength="20" autocomplete="nickname" autocapitalize="words" value="${esc(A.name)}" placeholder="Your name"></label>
      <p class="a-sub small" style="margin-top:12px">This is how you'll be greeted every day.</p></div>
      <div class="a-foot"><button class="btn" id="aNameGo" data-act="aName" ${A.name.trim()?'':'disabled'}>Continue</button></div>`;
  }else if(s==='diet'){
    h=aNav('name')+`<div class="a-main top"><p class="overline">Registration · 2 of 3</p><h1 class="a-title" style="margin-top:10px">How do you eat, ${esc(A.name)}?</h1>
      <p class="a-sub">The diet guide will only suggest food that fits.</p>
      <div class="a-opts" role="radiogroup">${Object.entries(DIET_TYPES).map(([k,v])=>opt(A.diet===k,'aDiet',k,`<i class="dot ${k}" style="width:12px;height:12px;border-radius:50%"></i><span class="grow"><b>${v.label}</b><span>${v.sub}</span></span>`)).join('')}</div></div>
      <div class="a-foot"><button class="btn" data-act="aGo" data-arg="body">Continue</button></div>`;
  }else if(s==='body'){
    const t=todayStr(),mon=nextMonday(t);
    h=aNav('diet')+`<div class="a-main top"><p class="overline">Registration · 3 of 3</p><h1 class="a-title" style="margin-top:10px">${A.returning?'Your body weight':'Last details'}</h1>
      <p class="a-sub">Your weight sets your daily protein target.</p>
      <label class="a-input" for="aW">${ic('scale')}<input id="aW" type="number" inputmode="decimal" min="30" max="200" step="0.1" value="${A.weight}" aria-label="Body weight"><span>kg</span></label>
      <p class="a-err" id="aErr" role="alert"></p>
      ${A.returning?'':`<p class="h3" style="margin-top:8px">When do you start?</p>
      <div class="a-opts two" role="radiogroup">
        ${opt(A.start==='today','aStart','today',`<span class="grow"><b>Today</b><span>${fmtDate(t)}</span></span>`)}
        ${opt(A.start==='monday','aStart','monday',`<span class="grow"><b>Next Monday</b><span>${fmtDate(mon)}</span></span>`)}
      </div>`}</div>
      <div class="a-foot"><button class="btn" data-act="aBody">Continue</button></div>`;
  }else if(s==='brief'){
    const b=BRIEFING[A.brief],last=A.brief===BRIEFING.length-1;
    h=`<div class="a-nav">${A.brief?`<button class="icon-btn" data-act="aBrief" data-arg="-1" aria-label="Previous">${ic('left')}</button>`:'<span style="width:44px"></span>'}<span class="overline" style="flex:1;text-align:center">How the System works</span>
      ${last||A.onlyBrief?'<span style="width:44px"></span>':`<button class="btn quiet" data-act="aSkipBrief" style="min-height:44px">Skip</button>`}</div>
      <div class="a-main"><div class="brief-card${b.red?' red':''}"><div class="state-ic">${ic(BRIEF_IC[A.brief])}</div>
        <h2 class="a-title" style="margin:0">${b.h}</h2>
        <ul>${b.lines.map((l,i)=>`<li style="animation-delay:${.1+i*.12}s">${l}</li>`).join('')}</ul></div>
        <div class="a-dots" aria-hidden="true">${BRIEFING.map((_,i)=>`<i class="${i===A.brief?'on':''}"></i>`).join('')}</div></div>
      <div class="a-foot"><button class="btn" data-act="aBrief" data-arg="1">${last?(A.onlyBrief?'Done':'I understand'):'Next'}</button></div>`;
  }else if(s==='done'){
    h=`<div class="a-main a-center"><div class="a-rank">${currentRank().r}</div>
      <p class="overline" style="margin-bottom:10px">Registration complete</p>
      <h1 class="a-title">Welcome, ${esc(A.name)}</h1>
      <p class="a-sub">${A.returning?'Your progress has been restored.':S.startDate>todayStr()?`Your first quest unlocks ${fmtDate(S.startDate)}.`:'Your first daily quest is ready. Rise.'}</p></div>
      <div class="a-foot"><button class="btn" data-act="aEnter">Enter the System ${ic('right')}</button></div>`;
  }
  const scr=$('aScreen');
  scr.innerHTML=h;
  scr.style.animation='none';void scr.offsetWidth;scr.style.animation='';
  typeIn($('aType'));
  const nm=$('aName');
  if(nm){
    nm.addEventListener('input',()=>{A.name=nm.value;$('aNameGo').disabled=!nm.value.trim()});
    nm.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(nm.value.trim())ACT.aName()}});
    setTimeout(()=>nm.focus(),300);
  }
  const w=$('aW');
  if(w)w.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ACT.aBody()}});
}

ACT.aGo=s=>{A.step=s;buzz('tap');aRender()};
ACT.aDecline=()=>{A.step='decline';buzz('bad');aRender()};
ACT.aName=()=>{const v=($('aName')||{}).value||A.name;if(!v.trim())return;A.name=v.trim().slice(0,20);A.step='diet';buzz('tap');aRender()};
ACT.aDiet=k=>{A.diet=k;buzz('tap');aRender()};
ACT.aStart=k=>{A.weight=parseFloat($('aW').value)||A.weight;A.start=k;buzz('tap');aRender()};
ACT.aBody=()=>{
  const v=parseFloat($('aW').value);
  if(!v||v<30||v>200){$('aErr').textContent='Enter a weight between 30 and 200 kg.';buzz('bad');return}
  A.weight=Math.round(v*10)/10;A.step='brief';A.brief=0;buzz('tap');aRender();
};
ACT.aBrief=d=>{
  A.brief+=+d;
  if(A.brief>=BRIEFING.length){
    if(A.onlyBrief){finishAwakening();return}
    commitProfile();A.step='done';buzz('level');
  }
  A.brief=Math.max(0,A.brief);
  aRender();
};
ACT.aSkipBrief=()=>{commitProfile();A.step='done';aRender()};
ACT.aEnter=()=>finishAwakening();

/* Save the profile before the final screen so it can show the real start date and rank. */
function commitProfile(){
  if(!A.returning){S.startDate=A.start==='monday'?nextMonday(todayStr()):todayStr()}
}
