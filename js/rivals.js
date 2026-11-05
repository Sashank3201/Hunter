/* Hunter System: rivals. Hunters who meet compete by swapping a small weekly file (JSON): the week's
   numbers, best sets and challenge results, plus a challenge they can issue. Adding a rival's file
   shows the head-to-head; sending yours back lets them do the same. There is no server: the files
   are the whole link. Each file carries a seal (a hash of its contents), so a file edited by hand
   is turned away. That stops casual edits, not a determined cheat.
   State: S.hunterId (this Hunter, made once), S.rivals {id: {name, reports: {monday: file}, added}},
   S.duel {tests: {monday: {kind: {v, at}}}, issued: {monday: kind}, shared: {monday: date}}. */
const RIVAL_APP='hunter-rival',RIVAL_V=1,RIVAL_KEEP=12; // weeks of files kept per rival
/* The week's head-to-head: higher wins each row, a tie scores for nobody. Challenge tests both
   Hunters took that week are added as rows. */
const DUEL_CATS=[['days','Days trained',''],['exp','EXP earned',''],['reps','Reps',''],['mins','Minutes trained',' min'],['gates','Gates cleared','']];
/* What one Hunter can challenge another to. Week challenges are read from the week's numbers;
   tests are taken in the app, as often as you like during the week, and the best result counts. */
const CHALLENGES={
  exp:{n:'Most EXP this week',week:'exp'},
  reps:{n:'Most reps this week',week:'reps'},
  days:{n:'Most days trained this week',week:'days'},
  pushups:{n:'Max push-ups in one set',test:'count',unit:'reps',how:'One set of push-ups, as many as you can with good form: chest near the floor, body in one straight line. Stop when your form breaks.'},
  plank:{n:'Longest plank hold',test:'hold',unit:'s',how:'Forearm plank, body in one straight line. Start the clock, hold as long as you can, and stop it the moment your hips sag or a knee touches.'},
  squats:{n:'Most squats in 60 seconds',test:'timed',secs:60,unit:'reps',how:'Bodyweight squats, hips down to knee height or lower, standing tall at the top. Count them while the 60-second clock runs.'}
};
const TESTS=Object.keys(CHALLENGES).filter(k=>CHALLENGES[k].test);
const unitOf=k=>CHALLENGES[k].unit==='s'?' s':'';

/* ---------- the file ---------- */
function rivalSeal(o){
  const {seal,...rest}=o,str=JSON.stringify(rest)+'|arise';let h1=0x811c9dc5,h2=0x1b873593;
  for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,16777619);h2=Math.imul(h2^c,2246822507)^(h2>>>13)}
  return (h1>>>0).toString(16).padStart(8,'0')+(h2>>>0).toString(16).padStart(8,'0');
}
const thisMonday=()=>mondayOf(todayStr());
function weekNums(m){const R=weekReport(m);return {days:R.days,exp:R.exp,reps:R.reps,mins:R.mins,gates:R.gates,records:R.records}}
function myTests(m){return Object.fromEntries(Object.entries(S.duel.tests[m]||{}).map(([k,t])=>[k,t.v]))}
/* The heaviest set of the week in each strength area (reps, not holds). */
function weekBests(m){
  const out={};
  for(let i=0;i<7;i++){const r=S.log[addDays(m,i)];if(!r||!r.plan)continue;
    r.plan.forEach(p=>{if(!['push','pull','legs','core'].includes(p.a)||isTimed(p.n))return;const v=Math.max(0,...(r.sets[p.id]||[]));
      if(v&&(!out[p.a]||v>out[p.a].v))out[p.a]={n:dn(p.n),v}})}
  return out;
}
function myRivalFile(){
  const m=thisMonday(),f={app:RIVAL_APP,v:RIVAL_V,id:S.hunterId,name:((S.profile&&S.profile.name)||'Hunter').slice(0,40),week:m,made:todayStr(),
    rank:currentRank().r,level:S.level,stats:Object.fromEntries(STATS.map(x=>[x,Math.round(S.stats[x]*10)/10])),
    streak:S.streak,bestStreak:S.bestStreak,quests:S.totalQuests,totalReps:S.totalReps,shadows:S.shadows.length,
    wk:weekNums(m),bests:weekBests(m),tests:myTests(m),challenge:S.duel.issued[m]||null};
  f.seal=rivalSeal(f);return f;
}
/* Check a file someone sent. Returns {f} or {why}. */
function readRivalFile(text){
  let f;try{f=JSON.parse(String(text).trim())}catch(e){return {why:'That isn\'t a Hunter file. Ask your rival to share it again from Rivals.'}}
  if(!f||f.app!==RIVAL_APP)return {why:f&&f.app==='hunter-system'?'That is a full backup, not a rival file. Ask for the file from Status → Rivals → Share file.':'That isn\'t a Hunter rival file.'};
  if(f.v>RIVAL_V)return {why:'That file comes from a newer version of the app. Update yours first: close and reopen the app.'};
  const num=(x,max)=>typeof x==='number'&&isFinite(x)&&x>=0&&x<=max;
  const okWeek=typeof f.week==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(f.week)&&mondayOf(f.week)===f.week;
  const wk=f.wk||{},okWk=num(wk.days,7)&&num(wk.exp,50000)&&num(wk.reps,100000)&&num(wk.mins,10080)&&num(wk.gates,500);
  const okTests=f.tests&&typeof f.tests==='object'&&Object.entries(f.tests).every(([k,v])=>TESTS.includes(k)&&num(v,100000));
  if(typeof f.id!=='string'||!/^[a-z0-9]{4,24}$/.test(f.id)||typeof f.name!=='string'||!f.name.trim()||!okWeek||!okWk||!okTests||!num(f.level,999)
    ||(f.challenge!=null&&!CHALLENGES[f.challenge]))return {why:'That file is damaged or incomplete. Ask for a fresh one.'};
  if(f.seal!==rivalSeal(f))return {why:'That file was changed after it was made, so it can\'t count. Ask for a fresh one.'};
  if(f.id===S.hunterId)return {why:'That is your own file. Send it to your rival, and add theirs here.'};
  if(f.week>thisMonday())return {why:'That file is from a week that hasn\'t started on this phone yet. Check the date on both phones.'};
  f.name=f.name.trim().slice(0,40);
  return {f};
}
/* Keep a rival's file: one per week, the newest made wins. Returns 'new', 'updated' or 'old'. */
function addRival(f){
  const R=S.rivals[f.id]=S.rivals[f.id]||{name:f.name,reports:{},added:todayStr()},prev=R.reports[f.week];
  if(prev&&prev.made>f.made)return 'old';
  const fresh=!Object.keys(R.reports).length;
  R.name=f.name;R.reports[f.week]=f;R.last=todayStr();
  Object.keys(R.reports).sort().slice(0,-RIVAL_KEEP).forEach(k=>delete R.reports[k]);
  save();return fresh?'new':'updated';
}
const rivalIds=()=>Object.keys(S.rivals).sort((a,b)=>(S.rivals[b].last||'').localeCompare(S.rivals[a].last||''));
const latestOf=R=>{const ks=Object.keys(R.reports).sort();return ks.length?R.reports[ks[ks.length-1]]:null};

/* ---------- head-to-head ---------- */
function duelOf(f){
  const m=f.week,me=weekNums(m),mt=myTests(m),rows=DUEL_CATS.map(([k,n,u])=>({k,n,u,a:me[k]||0,b:f.wk[k]||0}));
  TESTS.forEach(k=>{if(mt[k]!=null&&f.tests[k]!=null)rows.push({k,n:CHALLENGES[k].n,u:unitOf(k),a:mt[k],b:f.tests[k],test:true})});
  rows.forEach(r=>r.w=r.a>r.b?1:r.b>r.a?-1:0);
  const you=rows.filter(r=>r.w>0).length,them=rows.filter(r=>r.w<0).length;
  return {m,rows,you,them,res:you>them?'win':them>you?'loss':'draw',live:m===thisMonday()};
}
/* Wins, losses and draws over finished weeks. */
function rivalRecord(R){
  const c={win:0,loss:0,draw:0};Object.values(R.reports).filter(f=>f.week<thisMonday()).forEach(f=>c[duelOf(f).res]++);return c;
}
const recordText=c=>`${c.win}W ${c.loss}L${c.draw?` ${c.draw}D`:''}`;
/* Challenges rivals issued for this week, with the score to beat. */
function incomingChallenges(){
  const m=thisMonday();
  return rivalIds().map(id=>{const f=S.rivals[id].reports[m];if(!f||!f.challenge)return null;const C=CHALLENGES[f.challenge];
    return {id,name:f.name,k:f.challenge,C,their:C.week?f.wk[C.week]:f.tests[f.challenge],mine:C.week?weekNums(m)[C.week]:myTests(m)[f.challenge]}}).filter(Boolean);
}

/* ---------- screen ---------- */
function openRivals(){
  const L=$('rivalLayer');
  if(L.hidden){L.hidden=false;L.classList.remove('show');void L.offsetWidth;L.classList.add('show');L.scrollTop=0}
  document.body.classList.add('locked');save();renderRivals(); // save keeps a new Hunter id
}
function closeRivals(){$('rivalLayer').hidden=true;document.body.classList.remove('locked');renderAll()}
function renderRivals(){
  const m=thisMonday(),me=weekNums(m),mt=myTests(m),issued=S.duel.issued[m],ids=rivalIds(),inc=incomingChallenges();
  const board=[{name:'You',me:true,exp:me.exp,days:me.days},...ids.map(id=>{const f=S.rivals[id].reports[m];return f?{name:f.name,exp:f.wk.exp,days:f.wk.days,made:f.made}:null}).filter(Boolean)].sort((a,b)=>b.exp-a.exp||b.days-a.days);
  let h=`<div class="set-top"><h1 class="h1">Rivals</h1><button class="icon-btn" data-act="rivalsClose" aria-label="Close">${ic('x')}</button></div>
    <p class="muted rv-intro">Compete with Hunters you know. Each week, swap files: share yours, add theirs, and see who trained harder.</p>
    <div class="card rv-me"><div class="card-head"><span class="h3">Your file</span><span class="pill">Week of ${fmtDate(m)}</span></div>
      <div class="rv-nums">${[['Days',me.days],['EXP',me.exp],['Reps',me.reps.toLocaleString()],['Min',me.mins]].map(([l,v])=>`<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>
      <p class="muted small">${issued?`Your challenge: <b>${esc(CHALLENGES[issued].n)}</b>. It goes out in your file. <button class="link-btn" data-act="rivalIssue">Change</button>`:`No challenge issued this week. <button class="link-btn" data-act="rivalIssue">Issue one</button>`}</p>
      <div class="row-btns"><button class="btn" data-act="rivalShare">Share file</button><button class="btn ghost" data-act="rivalCopy">Copy text</button></div></div>
    <div class="card"><div class="card-head"><span class="h3">Add a rival</span></div>
      <p class="muted small">Open the file a rival sent you, or paste its text. Adding a newer file from the same rival updates them.</p>
      <div class="row-btns"><label class="btn" for="rivalFile">Open a file</label><button class="btn ghost" data-act="rivalPaste">Paste text</button></div>
      <input type="file" id="rivalFile" accept="application/json,.json,text/plain" hidden></div>`;
  if(inc.length)h+=`<div class="card"><div class="card-head"><span class="h3">Challenges to you</span></div><ul class="rv-list">${inc.map(x=>`<li><div class="grow"><b>${esc(x.name)}: ${esc(x.C.n)}</b>
      <span>${x.their!=null?`Their score: ${x.their}${unitOf(x.k)}`:'They haven\'t set a score yet'} · ${x.mine!=null?`yours: ${x.mine}${unitOf(x.k)}`:'you: not yet'}</span></div>
      ${x.C.test?`<button class="btn sm" data-act="rivalTest" data-arg="${x.k}">Take it</button>`:`<span class="pill${x.mine!=null&&x.their!=null&&x.mine>x.their?' good':''}">${x.mine!=null&&x.their!=null?(x.mine>x.their?'Ahead':x.mine<x.their?'Behind':'Level'):'This week'}</span>`}</li>`).join('')}</ul></div>`;
  h+=`<div class="card"><div class="card-head"><span class="h3">Challenge tests</span></div><p class="muted small">Take them any time this week. Your best counts, and it goes in your file.</p>
    <ul class="rv-list">${TESTS.map(k=>`<li><div class="grow"><b>${esc(CHALLENGES[k].n)}</b><span>${mt[k]!=null?`Your best this week: ${mt[k]}${unitOf(k)}`:'Not taken this week'}</span></div><button class="btn sm${mt[k]!=null?' ghost':''}" data-act="rivalTest" data-arg="${k}">${mt[k]!=null?'Again':'Take it'}</button></li>`).join('')}</ul></div>`;
  if(board.length>1)h+=`<div class="card"><div class="card-head"><span class="h3">This week's board</span><span class="pill">By EXP</span></div>
    <ol class="rv-board">${board.map((b,i)=>`<li class="${b.me?'me':''}"><span class="rv-pos">${i+1}</span><span class="grow"><b>${esc(b.name)}</b><span>${plural(b.days,'day')} trained${b.made?` · file from ${fmtDate(b.made)}`:''}</span></span><b>${b.exp} EXP</b></li>`).join('')}</ol>
    <p class="faint small">Their numbers are from the last file they sent. Swap files again on Sunday for the final score.</p></div>`;
  h+=`<div class="card"><div class="card-head"><span class="h3">Your rivals</span>${ids.length?`<span class="pill">${ids.length}</span>`:''}</div>
    ${ids.length?`<ul class="rv-list">${ids.map(id=>{const R=S.rivals[id],f=latestOf(R),d=f&&duelOf(f),c=rivalRecord(R);
      return `<li><button class="rv-row" data-act="rivalOpen" data-arg="${id}"><span class="grow"><b>${esc(R.name)}</b><span>${f?`${esc(f.rank)}-Rank · Lv ${f.level} · `:''}${recordText(c)}${f?` · last file: week of ${fmtDate(f.week)}`:''}</span></span>
        ${d?`<span class="rv-score ${d.res}">${d.you}–${d.them}</span>`:''}${ic('right')}</button></li>`}).join('')}</ul>`
      :`<p class="muted small">No rivals yet. Share your file with a friend who uses Hunter System and ask for theirs.</p>`}</div>
    <p class="faint small rv-foot">Files are sealed: one edited by hand won't open. Nothing leaves your phone unless you share it.</p>`;
  const L=$('rivalLayer');L.innerHTML=h;
  $('rivalFile').addEventListener('change',e=>{const file=e.target.files&&e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>takeRivalText(r.result);r.readAsText(file);e.target.value=''});
}
function takeRivalText(text){
  const {f,why}=readRivalFile(text);
  if(!f){openModal(`<div class="m-stamp">Can't add that file</div><p class="m-text">${esc(why)}</p><div class="m-btns"><button class="btn" data-act="closeModal">OK</button></div>`,'red','alert');return}
  const st=addRival(f);buzz(st==='old'?'tap':'done');
  if(st==='old'){toast(`You already have a newer file from ${f.name} for that week`);return}
  renderRivals();closeModal();rivalDuelModal(f.id,f.week,st==='new');
}
/* The head-to-head for one rival and week. */
function rivalDuelModal(id,week,isNew){
  const R=S.rivals[id];if(!R)return;const f=R.reports[week]||latestOf(R);if(!f)return;const d=duelOf(f),c=rivalRecord(R),weeks=Object.keys(R.reports).sort();
  const i=weeks.indexOf(f.week),mine=myRivalFile();
  const prof=[['Rank',currentRank().r,f.rank],['Level',S.level,f.level],['Streak',S.streak,f.streak],['Best streak',S.bestStreak,f.bestStreak],['Quests cleared',S.totalQuests,f.quests],
    ...STATS.map(x=>[x,Math.floor(S.stats[x]),Math.floor((f.stats||{})[x]||0)])];
  const bests=['push','pull','legs','core'].filter(a=>(f.bests||{})[a]||mine.bests[a]);
  openModal(`<div class="m-stamp">${isNew?'New rival':'Head-to-head'} · ${esc(R.name)}</div>
    <div class="rv-wk">${i>0?`<button class="icon-btn" data-act="rivalWeek" data-arg="${id}|${weeks[i-1]}" aria-label="Earlier week">${ic('left')}</button>`:'<span></span>'}
      <span class="overline">Week of ${fmtDate(f.week)}${d.live?' · so far':''}</span>
      ${i<weeks.length-1?`<button class="icon-btn" data-act="rivalWeek" data-arg="${id}|${weeks[i+1]}" aria-label="Later week">${ic('right')}</button>`:'<span></span>'}</div>
    <div class="rv-big ${d.res}"><div><span>You</span><b>${d.you}</b></div><i>–</i><div><span>${esc(R.name)}</span><b>${d.them}</b></div></div>
    <p class="m-text dim" style="text-align:center">${d.live?(d.res==='win'?'You lead so far.':d.res==='loss'?'They lead so far.':'Level so far.')+' Swap files again on Sunday for the final score.'
      :d.res==='win'?'You won this week.':d.res==='loss'?`${esc(R.name)} won this week.`:'A draw.'} Record: ${recordText(c)}.</p>
    <table class="rv-table"><thead><tr><th></th><th>You</th><th>${esc(R.name)}</th></tr></thead><tbody>
      ${d.rows.map(r=>`<tr><td>${esc(r.n)}</td><td class="${r.w>0?'w':''}">${r.a.toLocaleString()}${r.u}</td><td class="${r.w<0?'w':''}">${r.b.toLocaleString()}${r.u}</td></tr>`).join('')}</tbody></table>
    ${f.challenge?`<p class="m-text small">Their challenge that week: <b>${esc(CHALLENGES[f.challenge].n)}</b>.</p>`:''}
    <details class="more rv-more"><summary>Profiles and best sets ${ic('down')}</summary><table class="rv-table"><tbody>
      ${prof.map(([n,a,b])=>`<tr><td>${esc(n)}</td><td>${esc(String(a))}</td><td>${esc(String(b))}</td></tr>`).join('')}
      ${bests.map(a=>{const x=mine.bests[a],y=(f.bests||{})[a];return `<tr><td>Best ${esc(BLOCK_NAMES[a].toLowerCase())} set</td><td>${x?`${x.v} · ${esc(x.n)}`:'—'}</td><td>${y?`${esc(String(y.v))} · ${esc(String(y.n))}`:'—'}</td></tr>`}).join('')}</tbody></table>
      <p class="faint small">Their numbers are from their file made ${fmtDate(f.made)}. Their best sets are in their own moves, so compare them loosely.</p></details>
    <div class="m-btns"><button class="btn" data-act="rivalShare">Send them your file</button><button class="btn ghost" data-act="closeModal">Close</button></div>
    <button class="link-btn rv-remove" data-act="rivalRemove" data-arg="${id}">Remove ${esc(R.name)}</button>`,'sys','sword');
}

/* ---------- sharing ---------- */
function rivalFileName(f){return `hunter-${f.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'hunter'}-${f.week}.json`}
function markShared(){S.duel.shared[thisMonday()]=todayStr();save()}
ACT.rivalShare=async()=>{
  const f=myRivalFile(),txt=JSON.stringify(f),name=rivalFileName(f);
  const file=typeof File==='function'?new File([txt],name,{type:'application/json'}):null;
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:'My Hunter file',text:`${f.name}'s Hunter file for the week of ${fmtDate(f.week)}. In Hunter System: Status → Rivals → Open a file.`});markShared();return}
    catch(e){if(e&&e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=name;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);markShared();toast('File saved. Send it to your rival.');
};
ACT.rivalCopy=async()=>{
  const txt=JSON.stringify(myRivalFile());
  try{await navigator.clipboard.writeText(txt);markShared();toast('Copied. Paste it in a chat to your rival.')}
  catch(e){openModal(`<div class="m-stamp">Copy your file</div><p class="m-text">Select all of it and copy.</p><textarea class="rv-paste" readonly>${esc(txt)}</textarea><div class="m-btns"><button class="btn" data-act="closeModal">Done</button></div>`,'sys','upload');markShared()}
};
ACT.rivalPaste=()=>{openModal(`<div class="m-stamp">Paste a rival's file</div><p class="m-text">Paste the whole text they sent, from { to }.</p>
  <textarea class="rv-paste" id="rivalPasteBox" placeholder='{"app":"hunter-rival", ...}'></textarea>
  <div class="m-btns"><button class="btn" data-act="rivalPasteOk">Add rival</button><button class="btn ghost" data-act="closeModal">Cancel</button></div>`,'sys','download');setTimeout(()=>{const t=$('rivalPasteBox');if(t)t.focus()},120)};
ACT.rivalPasteOk=()=>{const t=$('rivalPasteBox');if(t&&t.value.trim())takeRivalText(t.value)};

/* ---------- challenges ---------- */
ACT.rivalIssue=()=>{const cur=S.duel.issued[thisMonday()];
  openModal(`<div class="m-stamp">Issue a challenge</div><p class="m-text">It goes out in your file this week. Your rival sees it when they add your file.</p>
    <div class="rv-pick">${Object.entries(CHALLENGES).map(([k,C])=>`<button class="rv-opt${cur===k?' on':''}" data-act="rivalIssueOk" data-arg="${k}"><b>${esc(C.n)}</b><span>${C.week?'Counted from the week\'s quests':'A test you both take in the app'}</span></button>`).join('')}</div>
    <div class="m-btns">${cur?`<button class="btn ghost" data-act="rivalIssueOk" data-arg="">No challenge</button>`:''}<button class="btn ghost" data-act="closeModal">Cancel</button></div>`,'sys','sword')};
ACT.rivalIssueOk=k=>{const m=thisMonday();if(k&&CHALLENGES[k])S.duel.issued[m]=k;else delete S.duel.issued[m];save();closeModal();buzz('done');
  toast(k?`Challenge set: ${CHALLENGES[k].n}. Share your file to send it.`:'Challenge withdrawn');renderRivals()};

/* A test in progress: {k, phase: 'ready'|'run'|'count', start, end}. */
let RT=null,rtTick=null;
function rtStop(){clearInterval(rtTick);rtTick=null}
ACT.rivalTest=k=>{const C=CHALLENGES[k];if(!C||!C.test)return;rtStop();RT={k,phase:'ready',n:myTests(thisMonday())[k]||10};paintTest()};
function paintTest(){
  const C=CHALLENGES[RT.k],best=myTests(thisMonday())[RT.k];
  let body='';
  if(RT.phase==='ready')body=`<p class="m-text">${esc(C.how)}</p>${best!=null?`<p class="m-text dim">Your best this week: ${best}${unitOf(RT.k)}.</p>`:''}
    <div class="m-btns">${C.test==='count'?`<button class="btn" data-act="rivalTestCount">I've done my set</button>`:`<button class="btn" data-act="rivalTestGo">${ic('timer')}Start the clock</button>`}<button class="btn ghost" data-act="rivalTestQuit">Cancel</button></div>`;
  else if(RT.phase==='run')body=`<div class="rv-clock"><b id="rtClock" role="timer">${C.test==='hold'?0:C.secs}</b><span>${C.test==='hold'?'seconds held':'seconds left'}</span></div>
    <div class="m-btns">${C.test==='hold'?`<button class="btn" data-act="rivalTestStop">Stop</button>`:`<button class="btn ghost" data-act="rivalTestQuit">Cancel</button>`}</div>`;
  else body=`<p class="m-text">${C.test==='timed'?'Time. How many did you do?':'How many did you do?'}</p>
    <div class="stepper"><button data-act="rivalTestStep" data-arg="-1" aria-label="One less">${ic('minus')}</button><div class="big-num" id="rtNum" aria-live="polite">${RT.n}</div><button data-act="rivalTestStep" data-arg="1" aria-label="One more">${ic('plus')}</button></div>
    <div class="m-btns"><button class="btn" data-act="rivalTestSave">Save ${C.unit}</button><button class="btn ghost" data-act="rivalTestQuit">Cancel</button></div>`;
  openModal(`<div class="m-stamp">Challenge test</div><p class="h2">${esc(C.n)}</p>${body}`,'sys','sword');
}
ACT.rivalTestGo=()=>{const C=CHALLENGES[RT.k];RT.phase='run';RT.start=Date.now();buzz('set');paintTest();
  rtTick=setInterval(()=>{const el=$('rtClock');const s=(Date.now()-RT.start)/1000;
    if(C.test==='hold'){if(el)el.textContent=Math.floor(s)}
    else{const l=Math.max(0,Math.ceil(C.secs-s));if(el)el.textContent=l;if(l<=0){rtStop();buzz('alarm');RT.phase='count';paintTest()}}},200)};
ACT.rivalTestStop=()=>{rtStop();saveTest(Math.floor((Date.now()-RT.start)/1000))};
ACT.rivalTestCount=()=>{RT.phase='count';paintTest()};
ACT.rivalTestStep=d=>{RT.n=Math.max(0,Math.min(999,RT.n+(+d)));buzz('tap');const e=$('rtNum');if(e)e.textContent=RT.n};
ACT.rivalTestSave=()=>saveTest(RT.n);
ACT.rivalTestQuit=()=>{rtStop();RT=null;closeModal()};
function saveTest(v){
  const k=RT.k,m=thisMonday(),T=S.duel.tests[m]=S.duel.tests[m]||{},prev=T[k]&&T[k].v;rtStop();RT=null;
  if(v<=0){closeModal();toast('Nothing saved');return}
  if(prev==null||v>prev)T[k]={v,at:todayStr()};
  Object.keys(S.duel.tests).sort().slice(0,-RIVAL_KEEP).forEach(x=>delete S.duel.tests[x]);
  save();closeModal();buzz(prev==null||v>prev?'level':'done');
  toast(prev!=null&&v<=prev?`${v}${unitOf(k)}. Your best this week stays ${prev}${unitOf(k)}.`:`${CHALLENGES[k].n}: ${v}${unitOf(k)} saved. Share your file to send it.`);
  if(!$('rivalLayer').hidden)renderRivals();
}

ACT.rivals=openRivals;
ACT.rivalsClose=closeRivals;
ACT.rivalOpen=id=>rivalDuelModal(id);
ACT.rivalWeek=a=>{const [id,w]=a.split('|');rivalDuelModal(id,w)};
ACT.rivalRemove=id=>{const R=S.rivals[id];if(!R)return;openModal(`<div class="m-stamp">Remove ${esc(R.name)}?</div><p class="m-text">Their files and your record against them are deleted from this phone. Add a file from them again any time.</p>
  <div class="m-btns"><button class="btn danger" data-act="rivalRemoveOk" data-arg="${id}">Remove</button><button class="btn ghost" data-act="closeModal">Keep</button></div>`,'red','trash')};
ACT.rivalRemoveOk=id=>{const n=S.rivals[id]&&S.rivals[id].name;delete S.rivals[id];save();closeModal();toast(`${n} removed`);renderRivals()};

/* A Status-tab nudge on the weekend: send rivals this week's file. */
function rivalStripHTML(){
  if(!rivalIds().length||S.duel.shared[thisMonday()]===todayStr())return '';
  const d=dowOf(todayStr());if(d!==0&&!(d===6&&flHour()>=18))return '';
  return `<button class="chest-strip exp-strip quiet" data-act="rivals"><span class="cs-ic">${ic('sword')}</span><span class="grow"><b>Send your rivals this week's file</b><span>Swap files tonight for the final score</span></span>${ic('right')}</button>`;
}
