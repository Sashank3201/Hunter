/* Hunter System: the shadow army.
   Beating a personal record on a move extracts that move's shadow (ARISE).
   Shadows train with you: they earn XP from your sets, quests and Gates, level
   up, get promoted, and each one carries a passive skill. Appoint a captain
   (skill x2) and a vice-captain (skill x1.5). The first nine are legends. */

/* ---------- model ---------- */
function shadowFor(ex){return S.shadows.find(s=>s.ex===ex)}
function ladderOf(ex){for(const k in LADDERS)if(LADDERS[k].steps.some(s=>s[0]===ex))return k;return null}
function stepIndexOf(ex){for(const k in LADDERS){const i=LADDERS[k].steps.findIndex(s=>s[0]===ex);if(i>=0)return i}return 0}
const bodyOf=sh=>SHADOW_BODY[sh.n]||SHADOW_BODY[ladderOf(sh.ex)]||SHADOW_BODY.push;
const skillOf=sh=>SHADOW_SKILLS[sh.n]||SOLDIER_SKILL((LADDERS[ladderOf(sh.ex)]||LADDERS.push).stat);
const roleOf=sh=>S.army.captain===sh.ex?'captain':S.army.vice===sh.ex?'vice':null;
const ROLE_NAME={captain:'Captain',vice:'Vice-captain'};
function shadowLevel(xp){let L=1;while(L<SHADOW_MAX_LV&&xp>=shadowXpAt(L+1))L++;return L}
/* Current grade: the base grade, promoted one step at Lv 11, 21 and 31. */
function shadowRank(sh){return SHADOW_RANKS[Math.min(SHADOW_RANKS.length-1,Math.max(0,SHADOW_RANKS.indexOf(sh.rank))+Math.floor((sh.lvl-1)/10))]}
const rankIdx=sh=>SHADOW_RANKS.indexOf(shadowRank(sh));
/* ATK/DEF/SPD grow with level and grade; the move's record adds to its main stat. */
function shadowStats(sh){
  const b=bodyOf(sh),lm=1+.12*(sh.lvl-1),gm=1+.1*rankIdx(sh),k=ladderOf(sh.ex);
  const main=k==='speed'||k==='agility'?'spd':['core','mobility','flex'].includes(k)?'def':'atk';
  const st={};['atk','def','spd'].forEach(x=>st[x]=Math.round(b[x]*lm*gm)+(x===main?Math.round(sh.best*(sh.timed?.25:.6)):0));
  st.cp=Math.round((st.atk*3+st.def*2.5+st.spd*2.5)*10);
  return st;
}
/* Skill strength in percent: grows 5% per level (max 2x), then the officer multiplier. */
function skillValue(sh,role=roleOf(sh)){
  const v=skillOf(sh).v*Math.min(2,1+.05*(sh.lvl-1))*(role==='captain'?2:role==='vice'?1.5:1);
  return Math.round(v*10)/10;
}
const skillText=(sh,role)=>skillOf(sh).text(skillValue(sh,role));
/* Combined army bonus for one effect, in percent, capped. kind e.g. 'expAll' or 'stat:Strength'. */
function shadowBonus(kind){
  const st=kind.startsWith('stat:')?kind.slice(5):null;let t=0;
  S.shadows.forEach(sh=>{const k=skillOf(sh).kind;
    if(k===kind||(st&&k.startsWith('stat:')&&k.slice(5).split(',').includes(st)))t+=skillValue(sh)});
  return t;
}
const bonusCap=kind=>SKILL_CAP[kind.startsWith('stat:')?'stat':kind]||30;
/* Army skills plus the equipped weapon, capped. */
function armyBonus(kind){return Math.min(bonusCap(kind),Math.round((shadowBonus(kind)+weaponBonus(kind))*10)/10)}
const armyMult=kind=>1+armyBonus(kind)/100;
/* Every active effect, for the army page. */
function armyEffects(){
  const out=[],seen=new Set();
  S.shadows.forEach(sh=>{const k=skillOf(sh).kind;
    (k.startsWith('stat:')?k.slice(5).split(',').map(x=>'stat:'+x):[k]).forEach(kind=>{if(seen.has(kind))return;seen.add(kind);
      const v=Math.min(bonusCap(kind),Math.round(shadowBonus(kind)*10)/10),st=kind.slice(5);
      out.push({kind,v,text:{expPush:`+${v}% EXP on push days`,expBoss:`+${v}% EXP on boss days`,expAll:`+${v}% EXP on every quest`,gateExp:`+${v}% Gate EXP`,
        gateTime:`+${v}% Gate time limit`,penalty:`−${v}% penalty reps`,luck:`+${v}% luck on boxes and chests`}[kind]||`+${v}% ${st} gains`})})});
  return out;
}

/* ---------- training ---------- */
/* Add XP to one shadow. Level-ups go into ups (if given) so callers can report them. */
function shadowGain(sh,n,ups){
  const lv=sh.lvl,rk=shadowRank(sh);
  sh.xp=(sh.xp||0)+Math.max(0,Math.round(n));sh.lvl=shadowLevel(sh.xp);
  if(sh.lvl>lv&&ups)ups.push({sh,promo:shadowRank(sh)!==rk?shadowRank(sh):null});
  return sh.lvl>lv;
}
/* The whole army trains with you. Officers train harder: captain x3, vice x2. */
function armyTrain(base,ups){S.shadows.forEach(sh=>{const r=roleOf(sh);shadowGain(sh,base*(r==='captain'?3:r==='vice'?2:1),ups)})}
/* A logged set feeds the shadow of that move (1 XP per rep, or per 3 seconds held). */
function trainShadow(ex,amount,timed){
  const sh=shadowFor(ex);if(!sh)return;
  const ups=[];shadowGain(sh,timed?amount/3:amount,ups);save();
  if(ups.length)announceUps(ups,true);
}
/* Report level-ups: promotions get their own notice; plain level-ups a toast (or a reward line). */
function announceUps(ups,toastIt){
  ups.filter(u=>u.promo).forEach(u=>reveal(`<div class="m-stamp">Promotion</div>${miniCard(u.sh,'promo')}
    <p class="m-text"><b>${esc(u.sh.n)}</b> has been promoted to <b>${u.promo}</b>. Stats and skill grow stronger.</p>
    <button class="btn" data-act="closeModal">Continue</button>`,'sys','helm'));
  const plain=ups.filter(u=>!u.promo);
  if(toastIt&&plain.length){toast(`${plain[0].sh.n} reached Lv ${plain[0].sh.lvl}`);buzz('done')}
  return plain.map(u=>`${u.sh.n} Lv ${u.sh.lvl}`);
}
function extractShadow(ex,best,timed,silent,date){
  let sh=shadowFor(ex);
  if(sh){ // beaten again: the shadow jumps a full level
    const ups=[];sh.best=best;sh.date=date||todayStr();
    shadowGain(sh,shadowXpAt(sh.lvl+1)-sh.xp,ups);save();
    if(!silent){toast(`${sh.n} grows stronger · Lv ${sh.lvl}`);buzz('done');announceUps(ups.filter(u=>u.promo))}
    return sh;
  }
  const i=S.shadows.length,leg=SHADOW_LEGENDS[i];
  sh={ex,n:leg?leg[0]:`Soldier ${String(i+1).padStart(2,'0')}`,rank:leg?leg[1]:SHADOW_GRADES[Math.min(7,stepIndexOf(ex))],
    best,timed:!!timed,date:date||todayStr(),lvl:1,xp:0,no:i+1};
  S.shadows.push(sh);
  if(!S.army.captain)S.army.captain=ex; // the first shadow leads until you choose
  save();
  if(!silent)arise(sh);
  return sh;
}

/* ---------- silhouettes ----------
   Hand-drawn busts on a 100x120 canvas. Each look: shapes, eye positions, visor line. */
const SIL_BASE='M14 120C14 98 26 86 40 82h20c14 4 26 16 26 38z';
const SIL_ARMOR='M8 120C8 98 22 86 38 82h24c16 4 30 16 30 38z';
const SIL_PAULD='M30 79c-12 0-22 8-24 23 8-6 18-8 28-6zM70 79c12 0 22 8 24 23-8-6-18-8-28-6z';
const SIL={
  knight:{d:['M50 10c-9 0-16 8-16 22v24c0 9 7 15 16 16 9-1 16-7 16-16V32c0-14-7-22-16-22z','M46 14C52 2 70-2 86 6c-8 1-14 5-17 10 7 3 12 10 14 20-7-8-16-12-27-13z',
    SIL_ARMOR,SIL_PAULD,'M80 24h4v64h-4zM74 33h16v4H74z'],dk:['M44 50h12l-6 14z'],eyes:[43,42,57],visor:[38,42,62]},
  heavy:{d:['M33 28l4-14h26l4 14v34l-8 9H41l-8-9z','M2 120c-2-28 8-42 28-44 10 0 14 7 14 15h12c0-8 4-15 14-15 20 2 30 16 28 44z','M4 82h32v22c0 7-8 12-16 16-8-4-16-9-16-16z'],
    dk:['M18 88h4v22h-4zM10 96h20v4H10z','M48 52h4v14h-4z'],eyes:[44,40,56],visor:[37,40,63]},
  bear:{d:['M0 120C2 94 14 74 34 66c6 8 26 8 32 0 20 8 32 28 34 54z','M50 30c15 0 26 9 26 22 0 9-5 16-12 20H36c-7-4-12-11-12-20 0-13 11-22 26-22z',
    'M29 38c-5-6-3-14 4-15 5 0 8 4 9 7zM71 38c5-6 3-14-4-15-5 0-8 4-9 7z','M50 55c8 0 13 4 13 9s-5 9-13 9-13-4-13-9 5-9 13-9z'],dk:['M45 57h10l-5 5z','M44 68c4 2 8 2 12 0','M34 39l13 5-1 3-13-4zM66 39l-13 5 1 3 13-4z'],eyes:[41,47,59]},
  orc:{d:['M50 16c-9 0-16 7-16 20l-2 16c0 10 8 18 18 18s18-8 18-18l-2-16c0-13-7-20-16-20z','M46 17l4-15 4 15z','M33 38l-12-9 12 17zM67 38l12-9-12 17z',
    'M41 62l-5-14 8 11zM59 62l5-14-8 11z','M6 120c0-24 12-36 28-40l4-7 4 7 8-7 8 7 4-7 4 7c16 4 28 16 28 40z'],dk:['M43 60c4 3 10 3 14 0'],eyes:[43,42,57]},
  ant:{d:['M45 20C42 9 35 3 24 1c3 1 5 3 6 6-3-1-6-1-8 0 9 3 15 9 20 15zM55 20c3-11 10-17 21-19-3 1-5 3-6 6 3-1 6-1 8 0-9 3-15 9-20 15z',
    'M40 78C22 60 6 62 0 80c10-5 24-4 40 6zM60 78c18-18 34-16 40 2-10-5-24-4-40 6z','M18 120c2-22 12-34 24-38h16c12 4 22 16 24 38z',
    'M50 16c-10 0-17 9-17 22 0 12 7 20 17 23 10-3 17-11 17-23 0-13-7-22-17-22z','M39 50c-9 4-12 13-7 23 2-7 6-11 12-13zM61 50c9 4 12 13 7 23-2-7-6-11-12-13z'],
    dk:['M46 46h8l-4 8z','M50 82v30'],eyes:[43,34,57]},
  marshal:{d:['M50 14c-8 0-14 7-14 20v24c0 8 6 13 14 14 8-1 14-6 14-14V34c0-13-6-20-14-20z','M39 24c-8-6-12-15-9-24 2 9 7 15 14 18zM61 24c8-6 12-15 9-24-2 9-7 15-14 18z',
    'M8 120l12-36h60l12 36z','M30 84l4-14 6 12zM70 84l-4-14-6 12z','M13 22l4-2 14 82-4 2z'],dk:['M45 50h10l-5 12z'],eyes:[44,40,56],visor:[39,40,61]},
  wyvern:{d:['M50 16c-6 0-11 5-11 14l2 30c2 8 5 12 9 14 4-2 7-6 9-14l2-30c0-9-5-14-11-14z','M42 22L28 6l16 12zM58 22l14-16-16 12z',
    'M44 70C30 50 12 44 0 48c6 6 8 14 6 22 6-4 12-2 16 4 4-4 10-2 12 4zM56 70c14-20 32-26 44-22-6 6-8 14-6 22-6-4-12-2-16 4-4-4-10-2-12 4z',
    'M28 120c2-22 10-36 18-46h8c8 10 16 24 18 46z'],dk:['M47 56h6l-3 10z'],eyes:[45,36,55]},
  horned:{d:['M50 14c-9 0-16 8-16 21v22c0 9 7 15 16 16 9-1 16-7 16-16V35c0-13-7-21-16-21z','M36 28c-8-2-14-8-16-16 6 6 12 8 18 10zM64 28c8-2 14-8 16-16-6 6-12 8-18 10z',
    SIL_ARMOR,SIL_PAULD],dk:['M45 50h10l-5 12z'],eyes:[43,42,57],visor:[38,42,62]},
  naga:{d:['M42 86C26 90 12 96 12 106c0 9 18 14 38 14s38-5 38-14c0-8-12-14-26-17z','M24 100c4-6 14-9 26-9s22 3 26 9c-6 4-16 6-26 6s-20-2-26-6z',
    'M50 10c9 0 15 7 16 17 13 7 20 23 15 41-4 12-14 17-23 19H42c-9-2-19-7-23-19-5-18 2-34 15-41 1-10 7-17 16-17z','M50 13c7 0 12 6 12 15 0 10-5 16-12 18-7-2-12-8-12-18 0-9 5-15 12-15z'],
    dk:['M50 50c8 0 14 6 16 14-4 8-10 13-16 15-6-2-12-7-16-15 2-8 8-14 16-14z','M48 40h4l-2 5z'],eyes:[45,27,55]},
  soldier:{d:['M50 12c-12 0-20 9-20 24v13c0 9 8 15 20 16 12-1 20-7 20-16V36c0-15-8-24-20-24z','M48 4h4v10h-4z',SIL_BASE],eyes:[42,40,58],visor:[35,40,65]},
  spiked:{d:['M50 12c-12 0-20 9-20 24v13c0 9 8 15 20 16 12-1 20-7 20-16V36c0-15-8-24-20-24z','M36 18L26 2l14 10zM64 18L74 2 60 12zM48 12l2-10 2 10z',SIL_BASE,'M14 104l-8-10 12 4zM86 104l8-10-12 4z'],eyes:[42,40,58],visor:[35,40,65]},
  hooded:{d:['M50 8c-16 0-26 14-26 32 0 14 4 26 12 36h28c8-10 12-22 12-36 0-18-10-32-26-32z','M12 120c0-22 12-36 30-40h16c18 4 30 18 30 40z'],
    dk:['M50 26c-10 0-16 8-16 20 0 11 6 19 16 22 10-3 16-11 16-22 0-12-6-20-16-20z'],eyes:[43,46,57]}
};
function silhouette(sh,cls=''){
  const L=SIL[bodyOf(sh).look]||SIL.soldier,[x1,y,x2]=L.eyes;
  return `<svg class="sil ${cls}" viewBox="0 0 100 120" aria-hidden="true"><g class="sil-b">${L.d.map(d=>`<path d="${d}"/>`).join('')}</g>
    ${L.dk?`<g class="sil-d">${L.dk.map(d=>`<path d="${d}"/>`).join('')}</g>`:''}${L.visor?`<path class="sil-v" d="M${L.visor[0]} ${L.visor[1]}H${L.visor[2]}"/>`:''}<circle class="sil-e" cx="${x1}" cy="${y}" r="2.6"/><circle class="sil-e" cx="${x2}" cy="${y}" r="2.6"/></svg>`;
}

/* Full art for legends that have it, otherwise the silhouette. */
function shadowArt(sh,cls='',big){
  const a=bodyOf(sh).art;if(!a)return silhouette(sh,cls);
  const z=big?a.zoom:a.mzoom,o=big?a.origin:a.morigin,ty=big&&a.ty||'0%';
  return `<img class="sh-art ${cls}" src="${a.src}" alt="" style="object-position:${big?a.pos:a.mini};--z:${z||1};--ty:${ty};transform-origin:${o||'50% 30%'}" draggable="false">`;
}

/* ---------- ARISE ---------- */
let ariseTimer=0;
function ariseOpen(){const a=$('arise');return a&&!a.hidden}
function arise(sh){
  const a=$('arise');
  const smoke=Array.from({length:14},(_,i)=>`<i style="left:${8+((i*37)%84)}%;animation-delay:${(i%7)*.12}s;--s:${.7+(i%4)*.25}"></i>`).join('');
  a.innerHTML=`<div class="ar-smoke">${smoke}</div>
    <p class="ar-sub">Shadow extraction</p>
    <h2 class="ar-word">${'ARISE'.split('').map((c,i)=>`<span style="animation-delay:${.35+i*.09}s">${c}</span>`).join('')}</h2>
    <div class="ar-card">${bodyOf(sh).art?`<span class="ar-art">${shadowArt(sh)}</span>`:silhouette(sh)}<div><p class="overline">${esc(shadowRank(sh))}</p><p class="ar-name">${esc(sh.n)}</p>
      <p class="ar-ex">${esc(dn(sh.ex))} · record ${sh.best}${sh.timed?'s':''}</p><p class="ar-skill">${esc(skillOf(sh).name)} · ${esc(skillText(sh))}</p></div></div>
    <button class="btn quiet ar-skip" data-act="ariseClose">Tap to continue</button>`;
  a.hidden=false;a.classList.remove('go');void a.offsetWidth;a.classList.add('go');
  buzz('level');
  clearTimeout(ariseTimer);ariseTimer=setTimeout(ariseClose,4800);
}
function ariseClose(){
  const a=$('arise');if(!a||a.hidden)return;
  clearTimeout(ariseTimer);a.hidden=true;
  if(REVEALQ.length)setTimeout(()=>{if(revealIdle())nextReveal()},150);
  if(!$('progress').hidden)renderProgress();
}
ACT.ariseClose=ariseClose;

/* ---------- cards ---------- */
const fmtN=n=>n.toLocaleString('en-US');
/* Army order: captain, vice-captain, then strongest first. */
function armyOrder(){
  const w=sh=>roleOf(sh)==='captain'?2:roleOf(sh)==='vice'?1:0;
  return S.shadows.slice().sort((a,b)=>w(b)-w(a)||shadowStats(b).cp-shadowStats(a).cp);
}
function miniCard(sh,extra=''){
  const st=shadowStats(sh),role=roleOf(sh);
  return `<button class="mcard g${rankIdx(sh)}${role?' '+role:''} ${extra}" data-act="shadowOpen" data-arg="${esc(sh.ex)}" aria-label="${esc(sh.n)}, open card">
    <span class="mc-art">${shadowArt(sh)}</span>${role?`<span class="mc-role">${role==='captain'?'Captain':'Vice'}</span>`:''}
    <span class="mc-grade">${esc(shadowRank(sh))}</span><b class="mc-name">${esc(sh.n)}</b><span class="mc-lv">Lv ${sh.lvl} · ${fmtN(st.cp)} CP</span></button>`;
}
function bigCard(sh){
  const st=shadowStats(sh),role=roleOf(sh),sk=skillOf(sh),b=bodyOf(sh),max=Math.max(40,...['atk','def','spd'].map(x=>st[x]));
  const into=sh.xp-shadowXpAt(sh.lvl),need=shadowXpAt(sh.lvl+1)-shadowXpAt(sh.lvl),maxed=sh.lvl>=SHADOW_MAX_LV;
  const full=!!b.art;
  return `<article class="scard g${rankIdx(sh)}${role?' '+role:''}${full?' full':''}" id="scard">
    ${full?`${shadowArt(sh,'sc-bg',true)}<div class="sc-shade"></div>`:''}
    <div class="sc-in">
      <header class="sc-head"><span>${esc(shadowRank(sh))}${full?' <em class="sc-leg">Legend</em>':''}</span><span>Lv <b>${sh.lvl}</b></span></header>
      <div class="sc-art">${full?'':`<svg class="sc-rune" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="78" class="d"/><circle cx="100" cy="100" r="62"/></svg>`}
        <span class="sc-fog"><i></i><i></i><i></i></span>${full?'':silhouette(sh,'xl')}${full&&b.art.credit?`<span class="sc-credit">Art · ${esc(b.art.credit)}</span>`:''}<span class="sc-no">No. ${String(sh.no||S.shadows.indexOf(sh)+1).padStart(3,'0')}</span>
        ${role?`<div class="sc-ribbon">${ROLE_NAME[role]}</div>`:''}</div>
      <div class="sc-id"><div class="sc-name"><h2>${esc(sh.n)}</h2><p>${esc(b.epithet||`${(LADDERS[ladderOf(sh.ex)]||LADDERS.push).title} soldier`)}</p></div>
        <div class="sc-cp"><span>Combat power</span><b>${fmtN(st.cp)}</b></div></div>
      <div class="sc-stats">${[['ATK','atk'],['DEF','def'],['SPD','spd']].map(([l,k])=>`<div><span>${l}</span><b>${st[k]}</b><i><em style="width:${st[k]/max*100}%"></em></i></div>`).join('')}</div>
      <div class="sc-skill"><p class="ovl">Skill · ${esc(sk.name)}</p><p class="eff">${esc(skillText(sh))}</p>${role?`<p class="boost">${role==='captain'?'×2 as captain':'×1.5 as vice-captain'}</p>`:''}</div>
      <div class="sc-xp"><span>${maxed?'Max level':`XP to Lv ${sh.lvl+1}`}</span><i><em style="width:${maxed?100:into/need*100}%"></em></i><span>${maxed?'':`${fmtN(into)}/${fmtN(need)}`}</span></div>
      <footer class="sc-foot"><span>${esc(dn(sh.ex))}</span><span>Record ${sh.best}${sh.timed?'s':''} · ${fmtDate(sh.date)}</span></footer>
    </div>
    <div class="sc-holo"></div><div class="sc-glare"></div>
  </article>`;
}

/* ---------- card viewer ---------- */
let scList=[],scI=0;
function openShadow(ex){
  scList=armyOrder().map(s=>s.ex);scI=Math.max(0,scList.indexOf(ex));
  const L=$('shadowLayer');L.hidden=false;document.body.classList.add('locked');
  renderShadow('summon');
}
function renderShadow(anim,stamp){
  const sh=shadowFor(scList[scI]);if(!sh){closeShadow();return}
  const role=roleOf(sh),L=$('shadowLayer'),n=scList.length;
  L.innerHTML=`<div class="set-top"><button class="icon-btn" data-act="shadowClose" aria-label="Back">${ic('x')}</button>
      <div class="sc-pager"><button class="icon-btn" data-act="shadowStep" data-arg="-1" aria-label="Previous shadow" ${n>1?'':'disabled'}>${ic('left')}</button>
      <span class="overline">${scI+1} / ${n}</span>
      <button class="icon-btn" data-act="shadowStep" data-arg="1" aria-label="Next shadow" ${n>1?'':'disabled'}>${ic('right')}</button></div></div>
    <div class="sc-stage"><div class="sc-wrap ${anim||''}${stamp?' slam':''}">${bigCard(sh)}${stamp?`<div class="sc-stamp">${ROLE_NAME[stamp]}</div>`:''}</div></div>
    <div class="sc-acts">${role==='captain'?`<button class="btn ghost" data-act="appoint" data-arg="none">Relieve captain</button>`
      :`<button class="btn" data-act="appoint" data-arg="captain">Make captain</button>`}
      ${role==='vice'?`<button class="btn ghost" data-act="appoint" data-arg="none">Relieve vice</button>`:role==='captain'?'':`<button class="btn ghost" data-act="appoint" data-arg="vice">Make vice</button>`}</div>
    <p class="sc-note">Grows when you train ${esc(dn(sh.ex).toLowerCase())}, clear quests and raid Gates. Beat its record for an instant level. The captain trains 3× as fast and doubles its skill; the vice-captain trains 2× and gets 1.5×.</p>`;
  bindTilt();
  if(stamp)buzz('level');
}
function closeShadow(){$('shadowLayer').hidden=true;document.body.classList.remove('locked');if(!$('progress').hidden)renderProgress()}
function stepShadow(d){if(scList.length<2)return;scI=(scI+(+d)+scList.length)%scList.length;renderShadow(+d>0?'from-r':'from-l');buzz('tap')}
function appoint(role){
  const ex=scList[scI],sh=shadowFor(ex);if(!sh)return;
  if(role==='none'){if(S.army.captain===ex)S.army.captain=null;if(S.army.vice===ex)S.army.vice=null;save();renderShadow();toast(`${sh.n} returns to the ranks`);return}
  const other=role==='captain'?'vice':'captain';
  if(S.army[other]===ex)S.army[other]=S.army[role]; // swap if it held the other post
  S.army[role]=ex;save();renderShadow('',role);
  toast(`${sh.n} appointed ${ROLE_NAME[role].toLowerCase()} · skill ×${role==='captain'?2:1.5}`);
  setTimeout(checkFeats,1600); // after the stamp
}
ACT.shadowOpen=openShadow;
ACT.shadowClose=closeShadow;
ACT.shadowStep=stepShadow;
ACT.appoint=appoint;

/* 3D tilt + holo glare that follows the finger; swipe to move between shadows. */
function bindTilt(){
  const c=$('scard'),stage=document.querySelector('.sc-stage');if(!c)return;
  const set=(x,y)=>{c.style.setProperty('--rx',`${(.5-y)*16}deg`);c.style.setProperty('--ry',`${(x-.5)*20}deg`);c.style.setProperty('--mx',`${x*100}%`);c.style.setProperty('--my',`${y*100}%`)};
  c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.classList.add('live');set((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height)});
  c.addEventListener('pointerleave',()=>{c.classList.remove('live');['--rx','--ry','--mx','--my'].forEach(p=>c.style.removeProperty(p))});
  let sx=null,sy=0;
  stage.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  stage.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)stepShadow(dx<0?1:-1)},{passive:true});
}

/* ---------- army view (Progress tab) ---------- */
function armyHTML(){
  const list=armyOrder(),next=SHADOW_LEGENDS[S.shadows.length];
  const total=S.shadows.reduce((a,sh)=>a+shadowStats(sh).cp,0);
  let h=`<div class="army-head"><div><p class="overline">Shadow army</p><p class="army-n">${S.shadows.length}</p></div>
    <div class="grow"><p class="overline">Army power</p><p class="army-cp">${fmtN(total)} <small>CP</small></p>
    <p class="muted small">Beat a record to extract a shadow.${next?` Next to rise: <b>${next[0]}</b>.`:''}</p></div></div>`;
  if(!list.length)return h+`<div class="card state-card"><div class="state-ic">${ic('helm')}</div><div><p class="h3">No shadows yet</p><p class="muted small">Log sets in workout mode. The first time you beat a record, Igris will answer.</p></div></div>`;
  const slot=role=>{const sh=S.army[role]&&shadowFor(S.army[role]);
    return sh?miniCard(sh,'cmd'):`<div class="mcard cmd empty"><span class="mc-art">${ic('helm')}</span><span class="mc-grade">${ROLE_NAME[role]}</span><b class="mc-name">Vacant</b><span class="mc-lv">Open a card to appoint</span></div>`};
  h+=`<div class="sec-label" style="margin-top:0"><span class="overline">Command</span><span class="small">Skill ×2 · ×1.5</span></div>
    <div class="cmd-row">${slot('captain')}${slot('vice')}</div>`;
  const fx=armyEffects();
  h+=`<div class="sec-label"><span class="overline">Army skills</span><span class="small">Always active</span></div>
    <ul class="fx-grid">${fx.map(f=>{const [v,...t]=f.text.split(' ');return `<li><b>${esc(v)}</b><span>${esc(t.join(' '))}</span></li>`}).join('')}</ul>`;
  h+=`<div class="sec-label"><span class="overline">All shadows</span><span class="small">Tap a card</span></div>
    <div class="army-grid">${list.map((sh,i)=>miniCard(sh).replace('<button ',`<button style="animation-delay:${Math.min(i,12)*.04}s" `)).join('')}</div>`;
  return h;
}
