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
  firstPaint=true;
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
  let i=0;el.textContent='';
  const t=setInterval(()=>{el.textContent=full.slice(0,++i);if(i>=full.length)clearInterval(t)},28);
}

function aWin(title,body,cls=''){
  return `<div class="a-stage">${sysWin(title,body,'a-win '+cls)}</div>`;
}
const STEPS_REG=['name','diet','body'];
function regDots(cur){
  const list=A.returning?['name','diet','body']:STEPS_REG;
  return `<div class="a-dots" aria-hidden="true">${list.map(s=>`<i class="${s===cur?'c':list.indexOf(s)<list.indexOf(cur)?'d':''}"></i>`).join('')}</div>`;
}

function aRender(){
  let h='';
  const s=A.step;
  if(s==='intro'){
    const line=A.returning?'System update detected. Your progress is safe. Re-register to continue.':'You have acquired the qualifications to be a Player.';
    h=aWin('Notification',`<p class="a-type" id="aType" data-text="${esc(line)}"></p>
      <p class="a-q">${A.returning?'Continue?':'Will you accept?'}</p>
      <div class="a-btns"><button class="btn sys" data-act="aGo" data-arg="name">Accept</button>${A.returning?'':`<button class="btn ghost" data-act="aDecline">Decline</button>`}</div>`,'intro');
  }else if(s==='decline'){
    h=aWin('Warning',`<p class="a-type" id="aType" data-text="Declining is not an option."></p>
      <p class="a-q dim">The System has already chosen you.</p>
      <div class="a-btns"><button class="btn sys" data-act="aGo" data-arg="name">Accept</button></div>`,'red shake');
  }else if(s==='name'){
    h=aWin('Registration',`${regDots('name')}<label class="a-lbl" for="aName">State your name, Player.</label>
      <input id="aName" class="a-in" maxlength="20" autocomplete="nickname" autocapitalize="words" value="${esc(A.name)}" placeholder="Your name">
      <div class="a-btns"><button class="btn sys" id="aNameGo" data-act="aName" ${A.name.trim()?'':'disabled'}>Confirm</button></div>`);
  }else if(s==='diet'){
    h=aWin('Registration',`${regDots('diet')}<p class="a-lbl">Select your fuel, ${esc(A.name)}.</p>
      <p class="a-hint">The diet guide only shows food you eat.</p>
      <div class="a-cards" role="radiogroup">${Object.entries(DIET_TYPES).map(([k,v])=>`<button role="radio" aria-checked="${A.diet===k}" class="a-card${A.diet===k?' on':''}" data-act="aDiet" data-arg="${k}"><b>${v.label}</b><span>${v.sub}</span></button>`).join('')}</div>
      <div class="a-btns"><button class="btn ghost" data-act="aGo" data-arg="name">Back</button><button class="btn sys" data-act="aGo" data-arg="body">Confirm</button></div>`);
  }else if(s==='body'){
    const t=todayStr(),mon=nextMonday(t);
    h=aWin('Registration',`${regDots('body')}<label class="a-lbl" for="aW">Body weight (kg)</label>
      <p class="a-hint">Sets your daily protein target. You can change it later.</p>
      <input id="aW" class="a-in num" type="number" inputmode="decimal" min="30" max="200" step="0.1" value="${A.weight}">
      ${A.returning?'':`<p class="a-lbl" style="margin-top:18px">When does your training begin?</p>
      <div class="a-cards two" role="radiogroup">
        <button role="radio" aria-checked="${A.start==='today'}" class="a-card${A.start==='today'?' on':''}" data-act="aStart" data-arg="today"><b>Today</b><span>${fmtDate(t)}</span></button>
        <button role="radio" aria-checked="${A.start==='monday'}" class="a-card${A.start==='monday'?' on':''}" data-act="aStart" data-arg="monday"><b>Next Monday</b><span>${fmtDate(mon)}</span></button>
      </div>`}
      <p class="a-err" id="aErr" role="alert"></p>
      <div class="a-btns"><button class="btn ghost" data-act="aGo" data-arg="diet">Back</button><button class="btn sys" data-act="aBody">Confirm</button></div>`);
  }else if(s==='brief'){
    const b=BRIEFING[A.brief],last=A.brief===BRIEFING.length-1;
    h=aWin(`Briefing ${A.brief+1}/${BRIEFING.length}`,`<h2 class="a-h${b.red?' red':''}">${b.h}</h2>
      <ul class="a-lines">${b.lines.map((l,i)=>`<li style="animation-delay:${.15+i*.18}s">${l}</li>`).join('')}</ul>
      <div class="a-btns">${A.brief?`<button class="btn ghost" data-act="aBrief" data-arg="-1">Back</button>`:''}<button class="btn sys" data-act="aBrief" data-arg="1">${last?(A.onlyBrief?'Close':'Understood'):'Next'}</button></div>
      ${last||A.onlyBrief?'':`<button class="btn quiet sys-q" data-act="aSkipBrief">Skip briefing</button>`}`,b.red?'red':'');
  }else if(s==='done'){
    h=`<div class="a-stage a-final"><p class="a-reg">Registration complete</p>
      <div class="a-rank">${currentRank().r}</div>
      <p class="a-welcome">Welcome, Player <b>${esc(A.name)}</b>.</p>
      <p class="a-hint">${A.returning?'Your progress has been restored.':S.startDate>todayStr()?`Your first quest unlocks ${fmtDate(S.startDate)}.`:'Your first daily quest is ready.'}</p>
      <button class="btn" data-act="aEnter">Enter the System</button></div>`;
  }
  $('awaken').innerHTML=`<div class="a-bg" aria-hidden="true"></div>`+h;
  typeIn($('aType'));
  const nm=$('aName');
  if(nm){
    nm.addEventListener('input',()=>{A.name=nm.value;$('aNameGo').disabled=!nm.value.trim()});
    nm.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(nm.value.trim())ACT.aName()}});
    setTimeout(()=>nm.focus(),250);
  }
  const w=$('aW');
  if(w)w.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ACT.aBody()}});
  const f=$('awaken').querySelector('.a-stage .btn.sys')||$('awaken').querySelector('.a-stage .btn');
  if(f&&!nm&&!w)try{f.focus({preventScroll:true})}catch(e){}
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
