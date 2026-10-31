/* Hunter System: story events.
   One Solo Leveling arc is live at a time (see story.js), and it stays until its boss raid is
   cleared, however many weeks that takes: nothing expires. Chapter n opens n days after the event
   started. Each chapter is a story scene and a mission. Clearing all five opens the boss raid,
   which runs on the Gate engine (dungeons.js). The next event arrives at the start of the week
   after the raid is won, so events come one at a time and the next one is a surprise. Weeks are
   anchored to the day the Player first saw events.
   State: S.events = {anchor, runs:{n:{id, ch:[dates], raid, clears, start}}, seen, mission}. Runs are
   numbered in order; the latest is the live one. Older saves numbered them by week, so a run
   without a start began at its week's start. */

/* ---------- schedule ---------- */
function evState(){
  if(!S.events||typeof S.events!=='object')S.events={anchor:null,runs:{},seen:-1,mission:null};
  const E=S.events;if(!E.runs)E.runs={};
  if(!E.anchor){E.anchor=todayStr();save()}
  return E;
}
/* The first day of the event week that holds date d. */
const evWeekStart=d=>{const a=evState().anchor;return addDays(a,EVENT_DAYS*Math.floor(Math.max(0,dayDiff(a,d))/EVENT_DAYS))};
/* The live event: which arc, which run (0, 1, 2... reruns count on), how many days since it began,
   and, once its raid is won, the day the next event arrives (next). */
function evNow(){
  const E=evState(),today=todayStr(),ws=evWeekStart(today);
  const ks=Object.keys(E.runs).map(Number).filter(k=>evById(E.runs[k].id)).sort((a,b)=>a-b);
  let dirty=false;
  /* Older saves rolled the event over every week. If that happened this week to an event with
     progress but no win, the new week's untouched run is dropped, so the unfinished event carries on. */
  if(ks.length>1&&!ks.some(k=>E.runs[k].start)){const a=ks[ks.length-1],b=ks[ks.length-2],A=E.runs[a],B=E.runs[b];
    if(a===b+1&&!(A.ch||[]).some(Boolean)&&!A.raid&&addDays(E.anchor,EVENT_DAYS*a)===ws&&(B.ch||[]).some(Boolean)&&!B.raid){delete E.runs[a];ks.pop();dirty=true}}
  let n=ks.length?ks[ks.length-1]:0;
  if(!ks.length){E.runs[0]={id:evOf(0).id,ch:[],raid:null,clears:0,start:ws};dirty=true}
  else{const R=E.runs[n];if(!R.start){R.start=addDays(E.anchor,EVENT_DAYS*n);dirty=true}
    if(R.raid&&R.raid<ws){n++;E.runs[n]={id:evOf(n).id,ch:[],raid:null,clears:0,start:ws};dirty=true}} // won before this week: the next event begins
  if(dirty)save();
  if(E.mission&&E.mission.n!==n){E.mission=null;save()} // a mission left over from an older event
  const R=E.runs[n],ev=evById(R.id);
  return {n,ev,day:Math.max(0,dayDiff(R.start,today)),start:R.start,next:R.raid?addDays(evWeekStart(R.raid),EVENT_DAYS):null,rerun:evRanBefore(ev.id,n)};
}
const evById=id=>STORY_EVENTS.find(e=>e.id===id);
/* The event of week n. A week that has started keeps the event its run stored, so adding or
   reordering events never swaps a live one. Later weeks follow the list from there, events
   the Player hasn't had yet first, then the usual rotation. */
function evOf(n){
  const runs=evState().runs,L=STORY_EVENTS.length;
  const ks=Object.keys(runs).map(Number).filter(k=>k<=n&&evById(runs[k].id)).sort((a,b)=>a-b),last=ks.length?ks[ks.length-1]:-1;
  if(last===n)return evById(runs[n].id);
  const had=new Set(ks.map(k=>runs[k].id));let i=last<0?-1:STORY_EVENTS.indexOf(evById(runs[last].id));
  for(let w=last;w<n;w++){
    let j=(i+1)%L;for(let k=1;k<=L;k++){const c=(i+k+L)%L;if(!had.has(STORY_EVENTS[c].id)){j=c;break}}
    i=j;had.add(STORY_EVENTS[i].id);
  }
  return STORY_EVENTS[i];
}
const evRanBefore=(id,n)=>Object.entries(evState().runs).some(([k,R])=>+k<n&&R.id===id);
function evRun(n){const E=evState();if(!E.runs[n]){E.runs[n]={id:evOf(n).id,ch:[],raid:null,clears:0};save()}return E.runs[n]}
/* Chapter i: done, ready, next (clear the one before it first) or locked (opens on a later day). */
function evChapter(cur,i){
  const R=evRun(cur.n);
  if(R.ch[i])return 'done';
  if(i>cur.day)return 'locked';
  return i>0&&!R.ch[i-1]?'next':'ready';
}
const evDone=cur=>evRun(cur.n).ch.filter(Boolean).length;
const evRaidOpen=cur=>evDone(cur)>=EVENT_CHAPTERS;
/* Time until the next event arrives (only once the live one's raid is won). */
function evLeft(cur){
  const t=new Date(),mins=(dayDiff(todayStr(),cur.next)-1)*1440+(1440-(t.getHours()*60+t.getMinutes()));
  return mins>=1440?`${Math.floor(mins/1440)}d ${Math.floor(mins%1440/60)}h`:`${Math.floor(mins/60)}h ${String(mins%60).padStart(2,'0')}m`;
}
const evMission=()=>evState().mission;

/* ---------- sizing: missions and raid waves fit the Player ----------
   A move is the Player's current step on its ladder; the amount is that step's daily target
   times the move's multiplier. Timed steps are holds, or seconds of work for moving drills. */
const EV_WORK=/fast feet|high knees|sprint|crawl|crab walk|joint flow/i;
function evWave([k,m,story],boss){
  const pz=pausedAreas();if(pz.has(k))k=['core','mobility','flex','push','pull'].find(a=>!pz.has(a))||k; // injury care (body.js)
  const t=targetFor(k),kind=t.timed?(EV_WORK.test(t.name)?'time':'hold'):0;
  return Object.assign(WV(dn(t.name),Math.max(t.timed?10:3,Math.round(t.target*m)),t.name,kind,boss,/each side/.test(t.name)),{story});
}
/* The Gate definition for an event raid (gateOf in dungeons.js asks for it). */
function evGate(g){
  if(typeof g!=='string'||!g.startsWith('ev:'))return undefined;
  const ev=evById(g.slice(3));if(!ev)return undefined;const R=ev.raid;
  return {g,ev:ev.id,mark:'EV',name:R.name,boss:R.boss,focus:R.focus,world:R.world,limit:R.limit,exp:R.exp,army:60,drops:{},title:null,
    waves:R.waves.map((w,i)=>({boss:i===R.waves.length-1}))};
}

/* ---------- art ---------- */
const evArt=(ev,cls='')=>`<svg class="ev-art ${cls}" viewBox="0 0 120 120" aria-hidden="true">${ev.art}</svg>`;
/* Arrow in a skin's colours, wearing its evolution gear (the Player's current pieces unless a list is
   given). The orb is a ball with two tall eyes; another body (a body's own skin, else the given form,
   else the current one) is its still frame. With gear the view widens to fit it. */
let skinN=0;
function skinSVG(id,cls='',gear,form){
  const k=ARROW_SKINS[id],g=gear||(typeof S!=='undefined'&&S.profile?arrowGear():[]),f=(k&&k.form)||form||(typeof S!=='undefined'&&S.profile?arrowForm():'orb');
  let orb,gearInk=k?k.body:null; // horns take the body colour
  if(ARROW_FORM_DATA[f]){const own=ARROW_FORM_DATA[f].avatar.colors,z=44/40.67*100; // as big as the orb preview
    gearInk=gearInk||own.body;orb=`<use href="#${formSymbol(f)}" x="${50-z/2}" y="${50-z/2}" width="${z}" height="${z}" style="fill:${k?k.body:own.body};--fe:${g.includes('eyes')?MONARCH_EYES:k?k.eyes:own.eyes}"/>`}
  else{const eye=g.includes('eyes')?`fill="${MONARCH_EYES}"`:k?`fill="${k.eyes}"`:'class="skin-eye"';
    orb=`<circle cx="50" cy="50" r="44" ${k?`fill="${k.body}"`:'class="skin-ink"'}/><rect x="31" y="33" width="12" height="27" rx="6" ${eye}/><rect x="57" y="33" width="12" height="27" rx="6" ${eye}/>`}
  if(!g.length)return `<svg class="skin-svg ${cls}" viewBox="0 0 100 100" aria-hidden="true">${orb}</svg>`;
  const n=++skinN,vb=g.includes('wings')?'-26 -26 152 152':'-12 -12 124 124';
  return `<svg class="skin-svg ${cls}" viewBox="${vb}" aria-hidden="true">${g.includes('aura')?`<defs><radialGradient id="ga${n}"><stop offset=".68" stop-color="#7d6cff" stop-opacity="0"/><stop offset=".76" stop-color="#7d6cff" stop-opacity=".6"/><stop offset=".9" stop-color="#4632aa" stop-opacity=".22"/><stop offset="1" stop-color="#4632aa" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="58" fill="url(#ga${n})"/>`:''}
    ${arrowGearSVG(g,gearInk,'back',f)}<g transform="translate(50 50) scale(.926) translate(-50 -50)">${orb}</g>${arrowGearSVG(g,gearInk,'front',f)}</svg>`;
}

/* ---------- banner (Status and Gates) ---------- */
function eventBannerHTML(){
  if(!S.profile)return '';
  const cur=evNow(),ev=cur.ev,R=evRun(cur.n),M=evMission();
  const next=ev.chapters.findIndex((c,i)=>!R.ch[i]),st=next>=0?evChapter(cur,next):null;
  const line=M?`Chapter ${M.i+1} mission in progress`
    :R.raid?`Raid cleared${R.clears>1?` ${R.clears}×`:''} · replay it for more rewards`
    :evRaidOpen(cur)?`Boss raid open · ${ev.raid.boss}`
    :st==='ready'?`Chapter ${next+1} ready · ${ev.chapters[next].t}`
    :`Chapter ${next+1} opens tomorrow`;
  const hot=!!M||(!R.raid&&evRaidOpen(cur))||st==='ready';
  return `<button class="ev-banner${hot?' hot':''}" data-act="event" aria-label="${esc(ev.name)}: ${esc(line)}">
    ${evArt(ev,'evb-art')}
    <span class="evb-top"><i class="evb-dot"></i>${cur.rerun?'Event rerun':'Story event'} · ${cur.next?`next event in ${evLeft(cur)}`:'no time limit'}</span>
    <b class="evb-name">${esc(ev.name)}</b>
    <span class="evb-line">${esc(line)}</span>
    <span class="evb-pips" aria-hidden="true">${ev.chapters.map((c,i)=>`<i class="${R.ch[i]?'d':i<=cur.day?'o':''}"></i>`).join('')}<i class="boss${R.raid?' d':evRaidOpen(cur)?' o':''}"></i></span>
  </button>`;
}

/* ---------- the event layer: page, scene, mission, clear ---------- */
const EV={view:'page',ch:0,line:0,res:null};
function openEvent(){
  if(!S.profile)return;
  const L=$('eventLayer');L.hidden=false;document.body.classList.add('locked');
  EV.view='page';evRender();L.scrollTop=0;L.classList.remove('show');void L.offsetWidth;L.classList.add('show');
}
function closeEvent(keepLock){
  const L=$('eventLayer');L.hidden=true;L.className='layer ev-layer';
  if(!keepLock){document.body.classList.remove('locked');renderAll();if(REVEALQ.length)setTimeout(()=>{if(revealIdle())nextReveal()},250)}
}
function evRender(){
  const L=$('eventLayer');if(L.hidden)return;
  const v=EV.view;
  L.className='layer ev-layer'+(v==='scene'?' ev-story':v==='clear'?' ev-clear':'');
  L.innerHTML=v==='scene'?evSceneHTML():v==='mission'&&evMission()?evMissionHTML():v==='clear'?evClearHTML():evPageHTML();
  if(v==='mission')startDemos();
}

function evPageHTML(){
  const cur=evNow(),ev=cur.ev,R=evRun(cur.n),M=evMission(),done=evDone(cur),open=evRaidOpen(cur),run=S.dungeonRun;
  const w=WEAPONS[ev.weapon],wr=RARITY[w.rarity],sk=ARROW_SKINS[ev.skin],shOwned=shadowFor('event:'+ev.id),skOwned=S.skins.includes(ev.skin);
  let h=`<div class="w-top"><button class="icon-btn" data-act="evClose" aria-label="Close">${ic('x')}</button>
      <span class="w-pos"><span>${cur.rerun?'Event rerun':'Story event'}</span><b>${cur.next?`Next event in ${evLeft(cur)}`:'No time limit'}</b></span><span style="width:44px"></span></div>
    <header class="ev-plate">${evArt(ev,'evp-art')}
      <p class="overline">Event ${String(STORY_EVENTS.indexOf(ev)+1).padStart(2,'0')} of ${STORY_EVENTS.length} · ${esc(ev.tag)}</p>
      <h1 class="ev-title">${esc(ev.name)}</h1><p class="ev-blurb">${esc(ev.blurb)}</p>
      <p class="ev-dates">${R.raid?`Started ${fmtDate(cur.start)} · won ${fmtDate(R.raid)}`:`Started ${fmtDate(cur.start)} · a new chapter every day · stays until you win`}</p></header>`;
  h+=`<div class="sec-label"><span class="overline">Chapters</span><span class="small">${done} / ${EVENT_CHAPTERS} cleared</span></div><ol class="ev-chs">`+ev.chapters.map((c,i)=>{
    const st=evChapter(cur,i),live=M&&M.i===i;
    const sub=st==='done'?`Cleared ${fmtDate(R.ch[i])}`:live?`Mission in progress · move ${M.m+1} of ${M.moves.length}`:st==='ready'?`Ready · ${c.moves.length} moves · +${c.exp} EXP`
      :st==='next'?`Clear chapter ${i} first`:`Opens ${fmtDate(addDays(cur.start,i))}`;
    return `<li class="ev-ch ${live?'live':st}"><button class="lrow" data-act="evChapter" data-arg="${i}">
      <b class="evc-n">${String(i+1).padStart(2,'0')}</b><span class="grow"><span class="t">${st==='locked'?'Sealed':esc(c.t)}</span><span class="s">${sub}</span></span>
      <span class="evc-ic">${ic(st==='done'?'check':st==='locked'?'lock':live?'play':'right')}</span></button></li>`}).join('')+`</ol>`;
  const inRaid=run&&run.ev;
  h+=`<div class="sec-label"><span class="overline">Finale</span><span class="small">${R.raid?`Cleared ${R.clears}×`:open?'Open':`${EVENT_CHAPTERS-done} chapter${EVENT_CHAPTERS-done===1?'':'s'} to go`}</span></div>
    <div class="ev-raid${open?' open':''}${R.raid?' won':''}"><div class="evr-seal">${ic('gate')}</div><div class="grow">
      <p class="overline">Boss raid · ${ev.raid.waves.length} waves · ${ev.raid.limit} min</p><p class="h2">${esc(ev.raid.boss)}</p>
      <p class="s">${esc(ev.raid.name)} · ${esc(ev.raid.focus)}</p>
      ${inRaid?`<button class="btn block" data-act="evRaidResume">Return to the raid</button>`
        :`<button class="btn block" ${open&&!run&&!S.trialRun?'data-act="evRaid"':'disabled'}>${!open?'Clear all 5 chapters':run?'Finish your Gate first':S.trialRun?'Finish your trial first':R.raid?'Raid again':'Enter the raid'}</button>`}</div></div>`;
  h+=`<div class="sec-label"><span class="overline">Rewards</span><span class="small">Yours to keep</span></div><div class="ev-rw">
    <div class="evr-tile w" style="--rc:${wr.c}"><span class="evr-art">${weaponSVG(ev.weapon,'tilt')}</span><span class="evr-k">${wr.n} weapon</span><b>${esc(w.name)}</b>
      <span class="evr-s">${S.weapons[ev.weapon]?`Owned${refineOf(ev.weapon)?' · +'+refineOf(ev.weapon):''}`:'Boss raid'}</span></div>
    <div class="evr-tile"><span class="evr-art">${skinSVG(ev.skin)}</span><span class="evr-k">Arrow skin</span><b>${esc(sk.n)}</b>
      ${skOwned?(S.profile.arrowSkin===ev.skin?'<span class="evr-s">Equipped</span>':`<button class="fchip" data-act="evSkin" data-arg="${ev.skin}">Equip</button>`):'<span class="evr-s">Chapter 5</span>'}</div>
    <div class="evr-tile"><span class="evr-art sh">${silhouette({n:ev.shadow,ex:'event:'+ev.id,ev:ev.id})}</span><span class="evr-k">Shadow</span><b>${esc(ev.shadow)}</b>
      <span class="evr-s">${shOwned?`Lv ${shOwned.lvl} · in your army`:'Boss raid'}</span></div></div>`;
  h+=`<div class="sec-label"><span class="overline">What's next</span><span class="small">One event at a time</span></div>
    <div class="card"><p class="muted small">${cur.next?`You won. The next event arrives ${fmtDate(cur.next)}, at the start of the new week. Until then, replay the raid for more loot.`
      :`Defeat ${esc(ev.raid.boss)} and the next event arrives at the start of the following week. Which one? The System isn't saying.`}</p></div>
    <p class="faint small ev-foot">Missed a day, or a whole week? Chapters wait for you, and this event stays until you win. Nothing expires.</p>`;
  return h;
}

/* ---------- story scenes ---------- */
function evLine(l,isNew){
  const c=isNew?' new':'';
  if(l[0]==='sys')return `<div class="evs-sys${c}"><span>System</span><p>${esc(l[1])}</p></div>`;
  if(l[0]==='v')return `<div class="evs-v${c}"><span>${esc(l[1])}</span><p>“${esc(l[2])}”</p></div>`;
  return `<p class="evs-n${c}">${esc(l[1])}</p>`;
}
function evSceneHTML(){
  const cur=evNow(),ch=cur.ev.chapters[EV.ch],st=evChapter(cur,EV.ch),end=EV.line>=ch.lines.length-1,M=evMission();
  const lines=ch.lines.slice(0,EV.line+1);
  return `<div class="w-top"><button class="icon-btn" data-act="evPage" aria-label="Back to the event">${ic('left')}</button>
      <span class="w-pos"><span>${esc(cur.ev.short)}</span><b>Chapter ${EV.ch+1} of ${EVENT_CHAPTERS}</b></span>
      ${end?'<span style="width:44px"></span>':`<button class="icon-btn" data-act="evSkip" aria-label="Show the whole scene">${ic('right')}</button>`}</div>
    <div class="evs-body"${end?'':' data-act="evNext"'}><p class="evs-ch">Chapter ${String(EV.ch+1).padStart(2,'0')}</p><h2 class="evs-title">${esc(ch.t)}</h2>
      ${lines.map((l,k)=>evLine(l,k===lines.length-1)).join('')}
      ${end?(st==='done'?`<p class="evs-after">${esc(ch.after)}</p>`:''):'<p class="evs-tap">Tap to continue</p>'}</div>
    ${end?`<div class="w-foot evs-foot">${st==='ready'?`<button class="btn block" data-act="evMissionGo">${M&&M.i===EV.ch?'Resume the mission':'Begin the mission'}</button>`
      :`<button class="btn ghost block" data-act="evPage">Back to the event</button>`}</div>`:''}`;
}

/* ---------- chapter missions ---------- */
function evMissionHTML(){
  const M=evMission(),ev=evOf(M.n),ch=ev.chapters[M.i],w=M.moves[M.m],remain=w.amt-M.done,holding=M.hold&&M.hold>Date.now();
  return `<div class="d-flash"></div><div class="w-top"><button class="icon-btn" data-act="evPage" aria-label="Back to the event (your progress is kept)">${ic('left')}</button>
      <span class="w-pos"><span>Chapter ${M.i+1} · ${esc(ch.t)}</span><b>Move ${M.m+1} of ${M.moves.length}</b></span><span style="width:44px"></span></div>
    <div class="w-prog">${M.moves.map((x,i)=>`<i class="${i<M.m?'d':''}${i===M.m?' c':''}"></i>`).join('')}</div>
    <div class="w-body"><p class="overline ev-story-line">${esc(w.story)}</p><h2 class="w-name">${esc(w.n)}</h2>${demoHTML(w.demo)}
      <div class="w-target"><p class="overline">${w.work?'Seconds of work':w.hold?'Seconds to hold':w.side?'Reps left, each side':'Reps left'}</p>
        <div class="big-num" id="evLeft">${holding?Math.ceil((M.hold-Date.now())/1000):remain}</div>
        <div class="prog" style="width:100%"><i id="evBar" style="width:${M.done/w.amt*100}%"></i></div>
        <p class="muted">No time limit. Split it into as many sets as you need.</p></div></div>
    ${w.hold?`<div class="w-foot">${holding?`<button class="btn ghost" data-act="evHoldStop">Stop</button>`:`<button class="btn" data-act="evHold">Start ${remain}s${w.work?'':' hold'}</button>`}</div>`
      :`<div class="w-foot"><div class="row-btns" style="width:100%"><button class="btn ghost" data-act="evAdd" data-arg="5">+5</button><button class="btn ghost" data-act="evAdd" data-arg="10">+10</button><button class="btn" data-act="evAdd" data-arg="${remain}">All ${remain}</button></div></div>`}`;
}
function evMissionStart(){
  const cur=evNow(),i=EV.ch;if(evChapter(cur,i)!=='ready')return;
  const E=evState();
  if(!E.mission||E.mission.i!==i)E.mission={n:cur.n,i,m:0,done:0,hold:0,moves:cur.ev.chapters[i].moves.map(w=>evWave(w,false))};
  save();buzz('set');EV.view='mission';evRender();$('eventLayer').scrollTop=0;
}
function evMoveDone(){
  const M=evMission();if(!M)return;const w=M.moves[M.m];
  trainShadow(w.demo,w.amt,w.hold); // the shadow of this exact move trains too
  M.m++;M.done=0;M.hold=0;save();buzz('done');
  if(M.m>=M.moves.length){evChapterClear();return}
  if($('eventLayer').hidden)return;
  if(EV.view==='page')evRender();
  if(EV.view==='mission'){evRender();const f=document.querySelector('#eventLayer .d-flash');if(f){f.textContent='Move cleared';f.classList.remove('go');void f.offsetWidth;f.classList.add('go')}}
}
function evChapterClear(){
  const E=evState(),M=E.mission,ev=evOf(M.n),ch=ev.chapters[M.i],R=evRun(M.n),last=M.i===EVENT_CHAPTERS-1;
  R.ch[M.i]=todayStr();E.mission=null;
  const reps=M.moves.filter(w=>!w.hold).reduce((a,w)=>a+w.amt*(w.side?2:1),0);S.totalReps+=reps;S.exp+=ch.exp;
  const loot=[`+${ch.exp} EXP`];(ch.loot||[]).forEach(k=>loot.push(grantItem(k)));
  const ups=[];armyTrain(20,ups);const shLv=announceUps(ups);
  let skin=null;
  if(last){if(!S.skins.includes(ev.skin)){S.skins=[...S.skins,ev.skin];skin=ev.skin}else{S.exp+=50;loot.push('+50 EXP · skin already owned')}}
  const up=syncLevel();save();
  EV.res={ev,i:M.i,ch,loot,shLv,skin,up,last,reps};EV.view='clear';
  const L=$('eventLayer');if(L.hidden){L.hidden=false;document.body.classList.add('locked')} // a hold can finish while the screen is closed
  evRender();L.scrollTop=0;buzz('level');
  checkFeats();
}
function evClearHTML(){
  const x=EV.res;if(!x){EV.view='page';return evPageHTML()}
  return `<div class="d-result win ev-win"><div class="d-burst">${Array.from({length:12},(_,i)=>`<i style="--a:${i*30}deg"></i>`).join('')}</div>
    <p class="overline">${esc(x.ev.short)} · chapter ${x.i+1} of ${EVENT_CHAPTERS}</p><h2 class="d-big">Cleared</h2>
    <p class="evc-after">${esc(x.ch.after)}</p>
    ${x.reps||x.up?`<p class="m-text">${x.reps?`${x.reps} reps added to your total. `:''}${x.up?`<b>Level ${S.level}!</b>`:''}</p>`:''}
    ${x.skin?`<div class="ev-skin-get">${skinSVG(x.skin,'big')}<div><p class="overline">Arrow skin unlocked</p><p class="h2">${esc(ARROW_SKINS[x.skin].n)}</p>
      ${S.profile.arrowSkin===x.skin?'<span class="pill accent">Equipped</span>':`<button class="btn sm" data-act="evSkin" data-arg="${x.skin}">Put it on Arrow</button>`}</div></div>`:''}
    ${x.last?`<div class="m-flag lvl-flag">The boss raid is open · ${esc(x.ev.raid.boss)}</div>`:''}${x.shLv.length?`<div class="m-flag">Shadows leveled · ${esc(x.shLv.join(', '))}</div>`:''}
    <p class="overline" style="margin-top:8px">Rewards</p>${lootHTML(x.loot)}
    <button class="btn block" data-act="evPage" style="margin-top:18px">Back to the event</button></div>`;
}

/* ---------- boss raid (runs in the Gate layer) ---------- */
function evRaidAsk(){
  const cur=evNow(),ev=cur.ev,R=evRun(cur.n);
  if(!evRaidOpen(cur)){toast('Clear all five chapters first');return}
  if(S.dungeonRun||S.trialRun){toast(S.trialRun?'Finish your trial first':'Finish your Gate first');return}
  if(want3D())load3D(); // start fetching the 3D world while the player decides
  openModal(`<div class="m-stamp">${esc(ev.raid.name)}</div>
    <p class="m-text">The finale of <b>${esc(ev.name)}</b>. ${ev.raid.waves.length} waves, boss: <b>${esc(ev.raid.boss)}</b>. Time limit <b>${ev.raid.limit} minutes</b>.</p>
    <p class="m-text">Every wave is sized to your current steps. No key needed: if time runs out, try again while the event lasts.</p>
    ${R.raid?`<p class="m-text">You already won this raid. Winning again pays EXP, levels up ${esc(ev.shadow)} and may refine ${esc(WEAPONS[ev.weapon].name)}.</p>`:''}
    <div class="m-btns"><button class="btn" data-act="evRaidGo">Open the Gate</button><button class="btn ghost" data-act="closeModal">Not now</button></div>`,'red','gate');
}
function evRaidGo(){
  const cur=evNow(),ev=cur.ev;if(!evRaidOpen(cur)||S.dungeonRun||S.trialRun)return;
  S.dungeonRun={g:'ev:'+ev.id,ev:ev.id,n:cur.n,deadline:0,started:0,wave:0,done:0,hold:0,lv:1,picks:[],
    waves:ev.raid.waves.map((w,i,a)=>evWave(w,i===a.length-1))};
  save();closeModal();closeEvent(true);openDungeon(true);
}
/* Called by gateClear: the event's weapon, a box and the shadow. Returns notice lines for the result screen. */
function evRaidLoot(r,loot){
  const ev=evById(r.ev),R=evRun(r.n),first=!R.raid;
  R.raid=R.raid||todayStr();R.clears=(R.clears||0)+1;
  if(first||Math.random()<WEAPON_DROP)loot.push(grantWeapon(ev.weapon));
  if(first)loot.push(grantItem('box'));
  const x=evExtract(ev);
  afterReveals(openEvent); // back to the event once the weapon and shadow have been shown
  return x.again?`<div class="m-flag">${esc(x.sh.n)} grows stronger · Lv ${x.sh.lvl}</div>`:`<div class="m-flag lvl-flag">Shadow extracted · ${esc(x.sh.n)}</div>`;
}
/* The event's shadow rises (ARISE, after the raid screen), or levels up if it already serves you. */
function evExtract(ev){
  const ex='event:'+ev.id;let sh=shadowFor(ex);
  if(sh){const ups=[];shadowGain(sh,shadowXpAt(sh.lvl+1)-sh.xp,ups);announceUps(ups.filter(u=>u.promo));save();return {sh,again:true}}
  sh={ex,ev:ev.id,n:ev.shadow,rank:EVENT_SHADOWS[ev.shadow].rank,best:0,timed:false,date:todayStr(),lvl:1,xp:0,no:S.shadows.length+1};
  S.shadows.push(sh);if(!S.army.captain)S.army.captain=ex;save();
  afterReveals(()=>arise(sh));
  return {sh,again:false};
}

/* ---------- Arrow's bodies and skins ---------- */
/* The body Arrow is in (ARROW_FORMS); the orb unless the Player picked another. */
const arrowForm=()=>{const f=S.profile&&S.profile.arrowForm;return ARROW_FORMS[f]?f:'orb'};
/* A skin is owned once unlocked, or from the start if it comes with its body (free). */
const skinOwned=id=>!!ARROW_SKINS[id]&&(!!ARROW_SKINS[id].free||S.skins.includes(id));
/* A body's own skins fit only that body; story and milestone skins fit them all. */
const skinFits=(id,f=arrowForm())=>!ARROW_SKINS[id].form||ARROW_SKINS[id].form===f;
const formSkinName=(id,f=arrowForm())=>id?ARROW_SKINS[id].n:f==='orb'?'Ink':'Classic';
/* Switch body. Each body remembers its own skin (S.profile.formSkins), so switching back restores it. */
function equipForm(f,quiet){
  if(!ARROW_FORMS[f])return;
  const p=S.profile||{},cur=arrowForm(),mem=Object.assign({},p.formSkins,{[cur]:p.arrowSkin||null}),sk=mem[f];
  S.profile=Object.assign(p,{arrowForm:f,formSkins:mem,arrowSkin:sk&&skinOwned(sk)&&skinFits(sk,f)?sk:null});save();Bot.reskin();
  if(!quiet){toast(f===cur?`Arrow is already ${ARROW_FORMS[f].n}`:`Arrow is now ${ARROW_FORMS[f].n}`);buzz('done')}
}
function equipSkin(id){
  if(id&&!skinOwned(id))return;
  if(id&&!skinFits(id))equipForm(ARROW_SKINS[id].form,true); // a body's own skin brings its body
  S.profile=Object.assign(S.profile||{},{arrowSkin:id||null});save();Bot.reskin();
  toast(id?`Arrow is wearing ${ARROW_SKINS[id].n}`:arrowForm()==='orb'?'Arrow is back in ink':`Arrow is back in classic ${ARROW_FORMS[arrowForm()].n}`);buzz('done');
}
/* Milestone skins: the number each one counts, and how to earn a skin (todo) or why you have it (done). */
const SKIN_COUNT={quests:()=>S.totalQuests,streak:()=>S.bestStreak,shadows:()=>S.shadows.length,level:()=>S.level,
  sleep:()=>Object.values(S.sleep||{}).filter(h=>h>=0).length,exps:()=>S.expeditions.filter(x=>x.ok).length};
function skinHow(id){
  const k=ARROW_SKINS[id];if(!k)return {todo:'',done:''};
  if(k.free)return {todo:'',done:`Comes with ${ARROW_FORMS[k.form].n}`};
  if(k.ev){const ev=evById(k.ev),nm=ev?ev.name:'its story event';return {todo:`Clear all five chapters of ${nm}`,done:`From ${nm}`}}
  const n=k.how.n,have=Math.min(n,SKIN_COUNT[k.how.k]());
  return {quests:{todo:`Clear ${n} daily quests (${have}/${n})`,done:`For clearing ${n} daily quests`},
    streak:{todo:`Reach a ${n}-day streak (best so far: ${have})`,done:`For a ${n}-day streak`},
    shadows:{todo:`Command ${n} shadows (${have}/${n})`,done:`For commanding ${n} shadows`},
    level:{todo:`Reach Level ${n} (now ${have})`,done:`For reaching Level ${n}`},
    sleep:{todo:`Log your sleep for ${n} nights (${have}/${n})`,done:`For logging ${n} nights of sleep`},
    exps:{todo:`Win ${n} shadow expeditions (${have}/${n})`,done:`For winning ${n} shadow expeditions`}}[k.how.k];
}
/* Unlock every milestone skin whose number has been reached (older saves get theirs on the next start). */
function skinCheck(silent){
  const got=Object.keys(ARROW_SKINS).filter(id=>{const k=ARROW_SKINS[id];return k.how&&!S.skins.includes(id)&&SKIN_COUNT[k.how.k]()>=k.how.n});
  if(!got.length)return got;
  S.skins=[...S.skins,...got];save();
  if(silent)return got;
  if(got.length===1){const id=got[0];reveal(`<div class="ev-skin-get">${skinSVG(id,'big')}<div><p class="overline">${ARROW_SKINS[id].form?`${esc(ARROW_FORMS[ARROW_SKINS[id].form].n)} skin unlocked`:'Arrow skin unlocked'}</p><p class="h2">${esc(ARROW_SKINS[id].n)}</p><p class="small muted">${esc(skinHow(id).done)}.</p></div></div>
    <div class="m-btns"><button class="btn" data-act="skinWear" data-arg="${id}">Put it on Arrow</button><button class="btn ghost" data-act="closeModal">Later</button></div>`,'sys','user')}
  else reveal(`<p class="overline skin-gets-h">${got.length} Arrow skins unlocked</p><div class="skin-gets">${got.map(id=>`<button class="skin-opt" data-act="skinWear" data-arg="${id}" aria-label="Put ${esc(ARROW_SKINS[id].n)} on Arrow. ${esc(skinHow(id).done)}">${skinSVG(id)}<span>${esc(ARROW_SKINS[id].n)}</span></button>`).join('')}</div>
    <p class="small muted skin-gets-h">Tap one to put it on Arrow.</p><div class="m-btns"><button class="btn ghost" data-act="closeModal">Later</button></div>`,'sys','user');
  return got;
}
ACT.skinWear=id=>{closeModal();equipSkin(id)};

/* ---------- Arrow's evolution ---------- */
const rankAt=r=>RANKS.findIndex(x=>x.r===r);
const gearUnlocked=k=>rankAt(currentRank().r)>=rankAt(ARROW_GEAR[k].rank);
/* The pieces Arrow wears: unlocked, and not switched off. */
function arrowGear(){const g=(S.profile&&S.profile.arrowGear)||{};return Object.keys(ARROW_GEAR).filter(k=>gearUnlocked(k)&&g[k]!==false)}
function setGear(keys,on){
  const g=Object.assign({},(S.profile||{}).arrowGear);[].concat(keys).forEach(k=>{g[k]=!!on});
  S.profile=Object.assign(S.profile||{},{arrowGear:g});save();Bot.reskin();
}
/* Announce each piece once, the first time its rank is reached (older saves on their next start). */
function gearCheck(silent){
  S.gearSeen=S.gearSeen||[];const got=Object.keys(ARROW_GEAR).filter(k=>gearUnlocked(k)&&!S.gearSeen.includes(k));
  if(!got.length)return got;
  S.gearSeen=[...S.gearSeen,...got];save();Bot.reskin();
  if(!silent)reveal(`<div class="ev-skin-get">${skinSVG((S.profile||{}).arrowSkin,'big')}<div><p class="overline">Arrow evolved</p><p class="h2">${got.map(k=>esc(ARROW_GEAR[k].n)).join(' + ')}</p>
      <p class="small muted">${got.map(k=>esc(ARROW_GEAR[k].got)).join(' ')} Switch it off any time in Profile → Arrow form.</p></div></div>
    <div class="m-btns"><button class="btn" data-act="closeModal">Love it</button><button class="btn ghost" data-act="gearHide" data-arg="${got.join(',')}">Hide ${got.length>1?'them':'it'}</button></div>`,'sys','zap');
  return got;
}
const gearRefresh=()=>{const L=$('menu');if(L&&!L.hidden){const y=L.scrollTop;openMenu();L.scrollTop=y}};
ACT.gearHide=a=>{closeModal();setGear(a.split(','),false);toast('Hidden. Switch it back on in Profile → Arrow form.')};
ACT.gearToggle=k=>{const on=arrowGear().includes(k);setGear(k,!on);buzz('tap');gearRefresh()};
ACT.gearAll=on=>{setGear(Object.keys(ARROW_GEAR).filter(gearUnlocked),on==='1');buzz('tap');gearRefresh()};
ACT.gearLocked=k=>{toast(`Locked. Arrow grows its ${ARROW_GEAR[k].n.toLowerCase()} at ${ARROW_GEAR[k].rank}-Rank.`);buzz('tap')};
ACT.skinLocked=id=>{toast(`Locked. ${skinHow(id).todo}.`);buzz('tap')};

/* ---------- Arrow's event nudge: at most once a day ---------- */
function evNudge(){
  if(!S.profile||arMem().evDay===todayStr())return null;
  const cur=evNow(),ev=cur.ev,R=evRun(cur.n),M=evMission(),ready=ev.chapters.findIndex((x,i)=>evChapter(cur,i)==='ready');
  if(M)return {say:`Your chapter ${M.i+1} mission is half done. Finish it, I'm invested now.`,mood:'curious',ev:true};
  if(!R.raid&&evRaidOpen(cur))return {say:`${ev.raid.boss} is waiting in the event raid. Go win that weapon.`,mood:'excited',ev:true};
  if(ready>=0)return {say:`Chapter ${ready+1} of ${ev.short} is ready: "${ev.chapters[ready].t}". A little story, then you sweat.`,mood:'excited',ev:true};
  return null;
}

/* ---------- a new event: announce it once ---------- */
function maybeEvent(){
  if(window.__NO_EVENT||!S.profile)return; // __NO_EVENT: test hook
  const cur=evNow(),E=evState();
  if(E.seen>=cur.n)return;
  E.seen=cur.n;save();
  const ev=cur.ev;
  reveal(`<div class="m-stamp">${cur.rerun?'Event rerun':'New story event'}</div>
    <div class="ev-m-art">${evArt(ev)}</div><p class="h2" style="margin-bottom:8px">${esc(ev.name)}</p>
    <p class="m-text">${esc(ev.blurb)}</p>
    <p class="m-text">A new chapter every day for 5 days, then the boss raid. Rewards: <b>${esc(WEAPONS[ev.weapon].name)}</b>, the Arrow skin <b>${esc(ARROW_SKINS[ev.skin].n)}</b> and the shadow <b>${esc(ev.shadow)}</b>. No time limit: it stays until you win.</p>
    <div class="m-btns"><button class="btn" data-act="evFromModal">Open the event</button><button class="btn ghost" data-act="closeModal">Later</button></div>`,'sys','book');
}

/* ---------- actions ---------- */
ACT.event=openEvent;
ACT.evClose=()=>closeEvent();
ACT.evFromModal=()=>{closeModal();openEvent()};
ACT.evPage=()=>{EV.view='page';EV.res=null;evRender();$('eventLayer').scrollTop=0};
ACT.evChapter=a=>{
  const i=+a,cur=evNow(),st=evChapter(cur,i);
  if(st==='locked'){toast(`Chapter ${i+1} opens ${fmtDate(addDays(cur.start,i))}`);return}
  if(st==='next'){toast(`Clear chapter ${i} first`);return}
  const M=evMission();
  if(M&&M.i===i){EV.ch=i;EV.view='mission';evRender();$('eventLayer').scrollTop=0;return}
  EV.ch=i;EV.line=st==='done'?cur.ev.chapters[i].lines.length-1:0;EV.view='scene';evRender();$('eventLayer').scrollTop=0;buzz('tap');
};
ACT.evNext=()=>{const ch=evNow().ev.chapters[EV.ch];if(EV.line<ch.lines.length-1){EV.line++;evRender();buzz('tap');const L=$('eventLayer');L.scrollTo({top:L.scrollHeight,behavior:reduceMotion.matches?'auto':'smooth'})}};
ACT.evSkip=()=>{EV.line=evNow().ev.chapters[EV.ch].lines.length-1;evRender()};
ACT.evMissionGo=evMissionStart;
ACT.evAdd=n=>{const M=evMission();if(!M)return;const w=M.moves[M.m];M.done=Math.min(w.amt,M.done+(+n));buzz('tap');save();if(M.done>=w.amt)evMoveDone();else evRender()};
ACT.evHold=()=>{const M=evMission();if(!M)return;const w=M.moves[M.m];M.hold=Date.now()+(w.amt-M.done)*1000;save();buzz('set');evRender()};
ACT.evHoldStop=()=>{const M=evMission();if(!M||!M.hold)return;const w=M.moves[M.m];M.done=Math.max(0,Math.min(w.amt,w.amt-Math.ceil((M.hold-Date.now())/1000)));M.hold=0;save();evRender()};
ACT.evRaid=evRaidAsk;
ACT.evRaidGo=evRaidGo;
ACT.evRaidResume=()=>{closeEvent(true);openDungeon(false)};
ACT.evSkin=id=>{equipSkin(id);evRender()};

/* Ticker: mission holds keep counting even if the screen is closed. */
setInterval(()=>{
  const M=S.events&&S.events.mission;if(!M||!M.hold)return;
  const w=M.moves[M.m],l=Math.ceil((M.hold-Date.now())/1000);
  if(l<=0){M.done=w.amt;M.hold=0;save();evMoveDone();return}
  const el=$('evLeft');if(el&&el.textContent!==String(l)){el.textContent=l;const b=$('evBar');if(b)b.style.width=`${(w.amt-l)/w.amt*100}%`}
},250);
