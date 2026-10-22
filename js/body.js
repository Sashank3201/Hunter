/* Hunter System: body. A weekly check-in that works without a scale (a tape measure, or a string
   and a ruler, plus how your clothes fit; weight whenever you can get to a scale), a one-tap sleep
   log, and injury care: an injury pauses the training areas it would load until it heals, and
   Arrow checks in on it every day.
   State: S.body [{d, kg, waist, chest, arm, thigh, fit}] (lengths in cm), S.sleep {date: hours, -1 = skipped},
   S.injuries [{part, since, until, sev, asked, healed}]. */
const bodyList=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];

/* ---------- injuries ---------- */
/* Where it hurts (English, Telugu and Hindi words) and the training areas it pauses. */
const INJURY_PARTS={
  knee:{n:'knee',re:/\bknees?\b|mokal\w*|mokaal\w*|ghutn\w*|gutn\w*/,pause:['legs','agility','speed']},
  ankle:{n:'ankle',re:/ankles?|\bfoot\b|\bfeet\b|\bheels?\b|cheelamand\w*|chilamand\w*|takhn\w*|takhan\w*|ediyan?\b/,pause:['legs','agility','speed']},
  hip:{n:'hip',re:/\bhips?\b|groin|kulh\w*/,pause:['legs','agility','speed']},
  leg:{n:'leg',re:/hamstrings?|\bcalf\b|calves|thighs?|quads?|\bshins?\b|\blegs?\b|kaalu|kaallu|\btaang\b|\btang\b|jaangh\w*|pindli/,pause:['legs','agility','speed','flex']},
  back:{n:'back',re:/lower back|\bback\b|spine|nadum\w*|veepu|kamar|peeth/,pause:['legs','pull','core','speed','agility','push']},
  shoulder:{n:'shoulder',re:/shoulders?|bhujam|bhujalu|kandh\w*|rotator/,pause:['push','pull']},
  elbow:{n:'elbow',re:/elbows?|mochey\w*|kohni/,pause:['push','pull']},
  wrist:{n:'wrist',re:/wrists?|\bhands?\b|fingers?|manikatt\w*|kalai/,pause:['push']},
  neck:{n:'neck',re:/\bneck\b|\bmeda\b|gardan/,pause:['push','pull','core']},
  chest:{n:'chest',re:/\bchest\b|\bpecs?\b|chaathi|chhati|seena/,pause:['push']},
  abs:{n:'stomach muscles',re:/\babs\b|obliques?|\bribs?\b|side stitch/,pause:['core']}
};
const AREA_WORDS={push:'push-ups',pull:'rows and pull-ups',legs:'leg work',core:'core work',speed:'sprints',agility:'jumps',mobility:'mobility',flex:'stretches'};
const injuryPart=low=>{const e=Object.entries(INJURY_PARTS).find(([,p])=>p.re.test(low));return e?e[0]:null};
const injuries=()=>(S.injuries||[]).filter(i=>!i.healed&&i.until>=todayStr());
function pausedAreas(){const s=new Set();injuries().forEach(i=>INJURY_PARTS[i.part].pause.forEach(a=>s.add(a)));return s}
const pausedText=part=>bodyList(INJURY_PARTS[part].pause.map(a=>AREA_WORDS[a]));
/* Log an injury (or make an existing one last longer). Mild: 3 days. Severe: a week. */
function injuryAdd(part,sev){
  const today=todayStr(),until=addDays(today,sev>1?6:2);S.injuries=S.injuries||[];
  let i=injuries().find(x=>x.part===part);
  if(i){i.sev=Math.max(i.sev,sev);if(until>i.until)i.until=until}
  else{i={part,since:today,until,sev,asked:today};S.injuries.push(i);S.injuries=S.injuries.slice(-20)}
  save();return i;
}
/* The daily check-in: better clears it, same adds 2 days, worse adds 4 and turns it severe. */
function injuryAnswer(part,how){
  const i=injuries().find(x=>x.part===part);if(!i)return null;const today=todayStr();i.asked=today;
  if(how==='better')i.healed=today;
  else{const u=addDays(today,how==='worse'?4:2);if(how==='worse')i.sev=2;if(u>i.until)i.until=u}
  save();return i;
}
/* The injury to ask about today: once a day, from the day after it started. */
const injuryToAsk=()=>injuries().find(i=>i.asked!==todayStr()&&i.since<todayStr())||null;
const injuryChips=part=>[['Better','better'],['Same','same'],['Worse','worse']].map(([l,h])=>({l,a:'arrowInjury',arg:part+':'+h}));
function injuryCardHTML(compact){
  return injuries().map(i=>{const P=INJURY_PARTS[i.part],ask=i.asked!==todayStr();
    return `<div class="card bad inj-card"><div class="card-head"><span class="h3">Injury care · ${esc(P.n[0].toUpperCase()+P.n.slice(1))}</span><span class="pill bad">Until ${fmtDate(i.until)}</span></div>
      <p class="muted small">${esc(pausedText(i.part)[0].toUpperCase()+pausedText(i.part).slice(1))} ${P.pause.length>1?'are':'is'} paused, so your quest skips ${P.pause.length>1?'them':'it'}.${compact?'':' Gates, trials and raids are not changed: skip the ones that load it.'}${i.sev>1?' If it is swollen or getting worse, see a doctor or physio.':''}</p>
      <p class="overline" style="margin-top:12px">${ask?`How's your ${esc(P.n)} today?`:'Checked in today'}</p>
      <div class="row-btns inj-btns">${(ask?[['Better','better'],['Same','same'],['Worse','worse']]:[['It\'s better now','better']]).map(([l,h])=>`<button class="btn sm${h==='better'?'':' ghost'}" data-act="injuryCheck" data-arg="${i.part}:${h}">${l}</button>`).join('')}</div></div>`}).join('');
}
ACT.injuryCheck=a=>{const [p,h]=a.split(':'),i=injuryAnswer(p,h);if(!i)return;const n=INJURY_PARTS[p].n;
  toast(h==='better'?`Good. ${n[0].toUpperCase()+n.slice(1)} moves are back. Start a step easier.`:h==='same'?`Still resting your ${n}, until ${fmtDate(i.until)}`:`Resting your ${n} until ${fmtDate(i.until)}. Get it checked if it keeps getting worse.`);
  buzz(h==='better'?'done':'tap');renderAll()};

/* ---------- sleep ---------- */
const SLEEP_OPTS=[[4.5,'Under 5'],[5.5,'5 to 6'],[6.5,'6 to 7'],[7.5,'7 to 8'],[8.5,'8+']];
const sleepOn=d=>{const v=(S.sleep||{})[d];return typeof v==='number'&&v>=0?v:null};
const sleepLast=()=>sleepOn(todayStr());
const sleepFmt=h=>{const o=SLEEP_OPTS.find(o=>o[0]===h);return o?`${o[1]} h`:`${h} h`};
/* Last night's sleep, logged under today's date. h<0 means "skipped". */
function sleepLog(h,date=todayStr()){
  S.sleep=S.sleep||{};S.sleep[date]=h<0?-1:Math.max(0,Math.min(16,Math.round(h*2)/2));
  Object.keys(S.sleep).sort().slice(0,-60).forEach(k=>delete S.sleep[k]);save();
  if(h>=0)skinCheck(); // Night Sky counts logged nights
}
const sleepDays=n=>Array.from({length:n},(_,i)=>{const d=addDays(todayStr(),i-n+1);return {d,h:sleepOn(d)}});
function sleepAvg(n){const a=sleepDays(n).filter(x=>x.h!==null);return a.length?Math.round(a.reduce((s,x)=>s+x.h,0)/a.length*10)/10:null}
/* Hours slept, from a message: "slept 6 hours", "7.5 hrs", "slept at 1 woke at 8", "6 gantalu", "7 ghante". */
function sleepParse(low){
  const m=low.match(/(\d+(?:\.\d+)?)\s*(?:h\b|hr|hrs|hours?|ghante|ghanta|gante|gantalu|gantala)/);if(m&&+m[1]<=16)return +m[1];
  const t=low.match(/(?:at|by|around)\s*(\d{1,2})(?::\d\d)?\s*(am|pm)?.*?(?:woke|wake|got up|up at|lechanu|utha)\D*(\d{1,2})(?::\d\d)?\s*(am|pm)?/);
  if(t){let a=+t[1],b=+t[3];if(t[2]==='pm'&&a<12)a+=12;if(!t[2]&&a>=6&&a<=11)a+=12;if(t[4]==='pm'&&b<12)b+=12;const h=(b-a+24)%24;if(h>=2&&h<=14)return h}
  return null;
}
/* Fourteen nights as columns, with the 7-hour goal as a red rule. Hover a night for its value. */
function sleepChartHTML(n=14){
  const D=sleepDays(n),W=300,L=26,R=4,PW=W-L-R,base=74,H=94,mx=10,y=v=>base-Math.min(v,mx)/mx*(base-6),slot=PW/n,bw=Math.min(24,slot-4);
  const col=(x,h)=>{const x0=x-bw/2,x1=x+bw/2,t=y(h),r=Math.min(4,(base-t)/2);return `M${x0.toFixed(1)} ${base}V${(t+r).toFixed(1)}Q${x0.toFixed(1)} ${t.toFixed(1)} ${(x0+r).toFixed(1)} ${t.toFixed(1)}H${(x1-r).toFixed(1)}Q${x1.toFixed(1)} ${t.toFixed(1)} ${x1.toFixed(1)} ${(t+r).toFixed(1)}V${base}Z`};
  const cols=D.map((s,i)=>{const x=L+(i+.5)*slot;return (s.h!==null?`<path class="sl-col" d="${col(x,s.h)}"/>`:`<line class="sl-none" x1="${(x-3).toFixed(1)}" x2="${(x+3).toFixed(1)}" y1="${base-2}" y2="${base-2}"/>`)
    +`<rect class="sc-hit" x="${(x-slot/2).toFixed(1)}" y="0" width="${slot.toFixed(1)}" height="${base}" data-tip="${fmtDate(s.d)}: ${s.h!==null?sleepFmt(s.h):'not logged'}"/>`}).join('');
  return `<svg class="sc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sleep, last ${n} nights: ${D.map(s=>s.h===null?'not logged':s.h+' hours').join(', ')}">
    <line class="sc-grid" x1="${L}" x2="${W-R}" y1="${base}" y2="${base}"/>${cols}
    <line class="sl-goal" x1="${L}" x2="${W-R}" y1="${y(7)}" y2="${y(7)}"/><text class="sc-ax" x="0" y="${y(7)+3}">7 h</text>
    <text class="sc-ax" x="${L}" y="${H-4}">${fmtDate(D[0].d).slice(4)}</text><text class="sc-ax" x="${W-R}" y="${H-4}" text-anchor="end">Today</text></svg>`;
}
const sleepPickHTML=()=>`<div class="sl-pick" role="group" aria-label="Hours slept last night">${SLEEP_OPTS.map(([h,l])=>`<button class="fchip" aria-pressed="${sleepLast()===h}" data-act="sleepPick" data-arg="${h}">${l}</button>`).join('')}</div>`;
ACT.sleepPick=h=>{sleepLog(+h);toast(+h<6?`Logged ${sleepFmt(+h)}. Short night: train a little lighter today.`:`Logged ${sleepFmt(+h)}. Nice.`);buzz('tap');renderAll()};
ACT.sleepSkip=()=>{sleepLog(-1);renderAll()};

/* ---------- body check-ins ---------- */
const BODY_FIELDS=[['waist','Waist'],['chest','Chest'],['arm','Arm'],['thigh','Thigh']];
const lenUnit=()=>(S.profile&&S.profile.lenUnit)||'cm';
const toCm=(v,u)=>u==='in'?v*2.54:v,fromCm=(v,u)=>u==='in'?v/2.54:v,r1=v=>Math.round(v*10)/10;
const fmtLen=(cm,u=lenUnit())=>`${r1(fromCm(cm,u))} ${u}`;
/* Merge values into today's check-in. A weight also becomes the diet's weight, so food targets follow it. */
function bodyLog(e){
  S.body=S.body||[];const d=todayStr();let x=S.body.find(b=>b.d===d);
  if(!x){x={d};S.body.push(x);S.body.sort((a,b)=>a.d.localeCompare(b.d))}
  Object.entries(e).forEach(([k,v])=>{if(v!==null&&v!==undefined&&v!==''&&!(typeof v==='number'&&isNaN(v)))x[k]=v});
  if(typeof e.kg==='number'&&!isNaN(e.kg)){const ds=dietState();ds.weight=e.kg;saveDietState(ds)}
  S.body=S.body.slice(-104);save();skinCheck(); // Circuit counts check-ins
  return x;
}
const bodyHas=k=>(S.body||[]).filter(b=>typeof b[k]==='number');
const lastCheckin=()=>(S.body||[]).length?S.body[S.body.length-1].d:null;
const checkinDue=()=>{const l=lastCheckin();return !l||dayDiff(l,todayStr())>=7};
/* Change in one measure over the check-ins of the last n days: {from, to, weeks}. */
function bodyChange(k,days=42){
  const a=bodyHas(k).filter(b=>b.d>=addDays(todayStr(),-days));if(a.length<2)return null;
  const f=a[0],l=a[a.length-1];return {from:f[k],to:l[k],d:l[k]-f[k],weeks:Math.max(1,dayDiff(f.d,l.d)/7)};
}
/* What the trend means for the Player's goal. */
function bodyVerdict(){
  const goal=dietState().goal||'bulk',kg=bodyChange('kg'),w=bodyChange('waist'),fits=(S.body||[]).filter(b=>b.fit).slice(-2),u=lenUnit(),out=[];
  if(kg){const pw=kg.d/kg.weeks;
    out.push(`Weight ${kg.d>=0?'+':''}${r1(kg.d)} kg over ${r1(kg.weeks)} week${kg.weeks>=1.5?'s':''} (${pw>=0?'+':''}${r1(pw)} a week).`);
    if(goal==='bulk')out.push(pw<.1?'For a lean bulk that is too slow: add about 200 kcal a day.':pw>.5?'That is fast for a lean bulk, so some of it is fat. Trim about 200 kcal a day.':'Right on pace for a lean bulk.');
    if(goal==='cut')out.push(pw>-.2?'For fat loss that is too slow: cut about 200 kcal a day or add a daily walk.':pw<-1?'That is fast. Eat a little more so you keep your muscle.':'Right on pace for fat loss.');
    if(goal==='maintain')out.push(Math.abs(pw)<.25?'Steady, as planned.':'Drifting a little. Check your portions.')}
  if(w){out.push(`Waist ${w.d>=0?'+':'−'}${r1(Math.abs(fromCm(w.d,u)))} ${u}.`);
    out.push(goal==='cut'?(w.d<-.4?'It is shrinking, so you are losing fat.':'Not shrinking yet. Give it two more weeks, or trim 200 kcal.')
      :w.d>1.5?'It is growing faster than it should on a lean bulk. Trim the extras.':'Holding steady while you train, which is what you want.')}
  if(!kg&&!w&&fits.length)out.push(`Clothes feel ${fits[fits.length-1].fit} this week.${fits[fits.length-1].fit==='looser'?(goal==='cut'?' That is fat loss.':' Make sure you are eating enough.'):fits[fits.length-1].fit==='tighter'?(goal==='bulk'?' Around the arms and chest is good, around the waist means slow down.':' Watch the portions.'):''}`);
  if(!out.length)out.push((S.body||[]).length?'One check-in so far. Log again next week and I will tell you the trend.':'No check-ins yet. Do your first one: it takes a minute and needs no scale.');
  return out.join(' ');
}
/* One row per measure, each on its own scale (they are different units). Hover a point for its value. */
function bodyChartHTML(){
  const B=(S.body||[]).slice(-16),u=lenUnit();if(!B.length)return '';
  const rows=[['kg','Weight','kg'],...BODY_FIELDS.map(([k,l])=>[k,l,u])].map(([k,l,unit])=>({k,l,unit,pts:B.filter(b=>typeof b[k]==='number').map(b=>({d:b.d,v:k==='kg'?b[k]:fromCm(b[k],u)}))})).filter(r=>r.pts.length);
  if(!rows.length)return '';
  const W=300,L=52,R=82,PW=W-L-R,RH=34,top=2,d0=B[0].d,span=Math.max(7,dayDiff(d0,todayStr())),x=d=>L+dayDiff(d0,d)/span*PW,H=top+rows.length*RH+18;
  const body=rows.map((r,i)=>{const vs=r.pts.map(p=>p.v),mid=(Math.min(...vs)+Math.max(...vs))/2,half=Math.max(.6,(Math.max(...vs)-Math.min(...vs))/2),lo=mid-half,hi=mid+half;
    const y=v=>top+i*RH+6+(1-(v-lo)/(hi-lo))*(RH-14),b=top+(i+1)*RH-2,P=r.pts.map(p=>[x(p.d),y(p.v)]),last=r.pts[r.pts.length-1],ch=r.pts.length>1?last.v-r.pts[0].v:null;
    return `<line class="sc-grid" x1="${L}" x2="${W-R+30}" y1="${b}" y2="${b}"/><text class="sc-k" x="0" y="${b-9}">${r.l.toUpperCase()}</text>
      ${P.length>1?`<polyline class="sc-hist" points="${P.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}"/>`:''}
      <circle class="sc-dot" cx="${P[P.length-1][0].toFixed(1)}" cy="${P[P.length-1][1].toFixed(1)}" r="4"/>
      <text class="sc-v" x="${W-46}" y="${b-8}" text-anchor="end">${r1(last.v)}</text><text class="sc-ax" x="${W}" y="${b-9}" text-anchor="end">${ch===null?r.unit:`${ch>=0?'+':'−'}${r1(Math.abs(ch))} ${r.unit}`}</text>
      ${r.pts.map((p,j)=>`<circle class="sc-hit" cx="${P[j][0].toFixed(1)}" cy="${P[j][1].toFixed(1)}" r="11" data-tip="${r.l} · ${fmtDate(p.d)}: ${r1(p.v)} ${r.unit}"/>`).join('')}`}).join('');
  const ax=top+rows.length*RH+12;
  return `<svg class="sc" viewBox="0 0 ${W} ${H}" role="img" aria-label="Body check-ins: ${rows.map(r=>`${r.l} ${r1(r.pts[r.pts.length-1].v)} ${r.unit}`).join(', ')}">${body}
    <text class="sc-ax" x="${L}" y="${ax}">${fmtDate(d0).slice(4)}</text><text class="sc-ax" x="${W-R}" y="${ax}" text-anchor="end">Today</text></svg>`;
}

/* ---------- the Body page (Progress tab) ---------- */
function bodyHTML(){
  const u=lenUnit(),T=lastCheckin(),today=(S.body||[]).find(b=>b.d===todayStr())||{},val=k=>typeof today[k]==='number'?r1(k==='kg'?today[k]:fromCm(today[k],u)):'';
  const avg=sleepAvg(7),inj=injuryCardHTML(false),past=(S.injuries||[]).filter(i=>i.healed||i.until<todayStr()).slice(-4).reverse();
  let h=`<div class="sec-label"><span class="overline">Weekly check-in</span><span class="small">${!T?'Do your first one':checkinDue()?'Due now':`Next one ${fmtDate(addDays(T,7))}`}</span></div>
    <div class="card"><form id="bodyForm" class="body-form">
      <label><span>Weight (kg)</span><input id="bfKg" type="number" inputmode="decimal" step="0.1" min="25" max="250" value="${val('kg')}" placeholder="Optional"></label>
      <label><span>Waist (${u})</span><input id="bfWaist" type="number" inputmode="decimal" step="0.1" min="10" max="250" value="${val('waist')}" placeholder="${u==='cm'?'e.g. 80':'e.g. 32'}"></label>
      <details class="bf-more"${val('chest')||val('arm')||val('thigh')?' open':''}><summary>More measurements</summary><div class="bf-grid">
        ${BODY_FIELDS.slice(1).map(([k,l])=>`<label><span>${l} (${u})</span><input id="bf${k}" type="number" inputmode="decimal" step="0.1" min="5" max="250" value="${val(k)}"></label>`).join('')}</div></details>
      <div class="msg-seg bf-fit" role="radiogroup" aria-label="How your clothes fit">${[['looser','Looser'],['same','Same'],['tighter','Tighter']].map(([k,l])=>`<label><input type="radio" name="bfFit" value="${k}" ${today.fit===k?'checked':''}><span>${l}</span></label>`).join('')}</div>
      <p class="muted small bf-note">Clothes fit: your usual belt or jeans, compared with last week.</p>
      <div class="bf-foot"><span class="seg mini" role="radiogroup" aria-label="Length unit">${['cm','in'].map(k=>`<button type="button" role="radio" aria-checked="${u===k}" data-act="bodyUnit" data-arg="${k}">${k}</button>`).join('')}</span>
        <button class="btn sm" type="submit">${T===todayStr()?'Update check-in':'Save check-in'}</button></div></form></div>`;
  const chart=bodyChartHTML();
  h+=`<div class="sec-label"><span class="overline">Trend</span><span class="small">${(S.body||[]).length} check-in${(S.body||[]).length===1?'':'s'}</span></div>
    <div class="card">${chart?`<div class="body-chart">${chart}</div>`:''}<p class="body-verdict">${esc(bodyVerdict())}</p></div>`;
  h+=`<div class="sec-label"><span class="overline">No scale? No problem</span></div><div class="card tight"><ul class="list">
    ${[['ruler','Get a tailor\'s tape','About ₹30 at any stationery or cloth shop. Waist is the best single number: it shows fat going up or down even when the scale would lie.'],
      ['ruler','Or use a string','Wrap a string or a charger cable around your waist at the belly button, pinch the spot, and measure it against a ruler. The long side of an A4 sheet is 29.7 cm.'],
      ['timer','Same time, same way','Morning, after the toilet, before food. Tape snug, not tight, breathe out normally.'],
      ['shield','Your clothes are a scale too','Pick one belt or pair of jeans and note each week whether it feels looser, the same or tighter.'],
      ['scale','Weigh when you can','Pharmacies, gyms and clinics often have a scale. Log it that day, and your food targets update to match.']]
      .map(([i,t,s])=>`<li class="lrow"><span class="lead">${ic(i)}</span><div class="grow"><p class="t">${t}</p><p class="s">${s}</p></div></li>`).join('')}</ul></div>`;
  h+=`<div class="sec-label"><span class="overline">Sleep</span><span class="small">${avg!==null?`${avg} h a night this week`:'Not logged yet'}</span></div>
    <div class="card"><p class="overline">Last night</p>${sleepPickHTML()}<div class="body-chart">${sleepChartHTML(14)}</div>
      <p class="muted small" style="margin-top:8px">${avg===null?'Log each morning. Arrow uses it to tell you when to go easier.':avg<6.5?'Under 6.5 hours on average. Sleep is when muscle gets rebuilt: aim for 7 to 9.':'Good. Muscle gets rebuilt while you sleep.'}</p></div>`;
  h+=`<div class="sec-label"><span class="overline">Injuries</span><span class="small">${injuries().length?`${injuries().length} active`:'None active'}</span></div>
    ${inj||`<div class="card"><p class="muted small">Hurt something? Tell Arrow where, like "my knee hurts". It pauses the moves that load it and checks in every day.</p>
      <button class="btn sm ghost" style="margin-top:12px" data-act="arrowOpen">Tell Arrow</button></div>`}
    ${past.length?`<div class="card tight"><ul class="list plain">${past.map(i=>`<li class="lrow"><span class="lead">${ic('check')}</span><div class="grow"><p class="t">${esc(INJURY_PARTS[i.part].n[0].toUpperCase()+INJURY_PARTS[i.part].n.slice(1))}</p><p class="s">${fmtDate(i.since)} to ${fmtDate(i.healed||i.until)}</p></div></li>`).join('')}</ul></div>`:''}`;
  return h;
}
function bindBody(){
  const f=$('bodyForm');if(!f)return;
  f.addEventListener('submit',e=>{e.preventDefault();const u=lenUnit(),num=id=>{const el=$(id);return el&&el.value!==''?parseFloat(el.value):null},fit=f.querySelector('input[name=bfFit]:checked');
    const e2={kg:num('bfKg'),fit:fit?fit.value:null};[['waist','bfWaist'],['chest','bfchest'],['arm','bfarm'],['thigh','bfthigh']].forEach(([k,id])=>{const v=num(id);if(v!==null)e2[k]=r1(toCm(v,u))});
    if(e2.kg===null&&!e2.fit&&!['waist','chest','arm','thigh'].some(k=>e2[k]!==undefined)){toast('Fill in at least one thing: your waist, weight, or how your clothes fit');return}
    bodyLog(e2);buzz('done');toast('Check-in saved');renderAll()});
}
ACT.bodyUnit=k=>{S.profile=Object.assign(S.profile||{},{lenUnit:k});save();renderProgress()};

/* ---------- Status and Quest cards ---------- */
function bodyStatusHTML(){
  if(!S.profile||notStarted())return '';
  let h=injuryCardHTML(true);
  const asked=(S.sleep||{})[todayStr()]!==undefined;
  if(!asked&&new Date().getHours()<14)h+=`<div class="card sl-card"><div class="card-head"><span class="h3">How did you sleep?</span><button class="btn sm quiet" data-act="sleepSkip">Skip</button></div>
    <p class="muted small" style="margin-bottom:10px">Hours last night. One tap.</p>${sleepPickHTML()}</div>`;
  if(checkinDue()&&S.totalQuests>=1)h+=`<button class="chest-strip body-strip" data-act="goProg" data-arg="body"><span class="cs-ic">${ic('ruler')}</span><span class="grow"><b>Weekly body check-in</b><span>1 minute, no scale needed</span></span>${ic('right')}</button>`;
  return h;
}
function bodyQuestHTML(){
  const s=sleepLast();
  return injuryCardHTML(true)+(s!==null&&s<6?`<p class="warn-line sl-warn">${ic('moon')}<span>Short night (${sleepFmt(s)}). Stop each set a rep or two early today. Form first.</span></p>`:'');
}
