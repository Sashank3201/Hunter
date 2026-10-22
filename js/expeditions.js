/* Hunter System: shadow expeditions.
   Send up to three shadows into a Gate. They come back the next morning at 6:00 with EXP for the
   Player, XP for themselves and maybe items. Clear that day's quest before they return and they
   bring more (the streak bonus). One expedition at a time, one launch a day. The outcome is seeded
   from the launch day, so reloading never changes it.
   State: S.expedition {g, squad:[ex], date, back, power, chance}; S.expeditions [{g, date, ok, bonus}]. */
const EXP_POWER={E:2000,D:4000,C:7000,B:11000,A:16000,S:24000}; // squad CP for a 60% chance; double it for 95%
const EXP_BACK_HOUR=6,EXP_SQUAD=3;

/* ---------- model ---------- */
const expGrades=()=>GRADES.slice(0,gi(rankGrade())+1);
const expSquadOK=squad=>squad.map(shadowFor).filter(Boolean);
const expPower=squad=>expSquadOK(squad).reduce((a,sh)=>a+shadowStats(sh).cp,0);
function expChance(g,squad){return Math.round(Math.max(.15,Math.min(.95,.25+.35*expPower(squad)/EXP_POWER[g]))*100)/100}
function expDefaultSquad(){return armyOrder().slice(0,EXP_SQUAD).map(sh=>sh.ex)}
/* The hardest Gate the default squad clears at least 60% of the time. */
function expDefaultGrade(){const sq=expDefaultSquad(),ok=expGrades().filter(g=>expChance(g,sq)>=.6);return ok[ok.length-1]||'E'}
/* 'back' once the return time has passed, else 'away'; null with no expedition out. */
function expState(){
  const e=S.expedition;if(!e)return null;
  const t=todayStr();return t>e.back||(t===e.back&&flHour()>=EXP_BACK_HOUR)?'back':'away';
}
const expLaunchedToday=()=>(S.expedition&&S.expedition.date===todayStr())||S.expeditions.some(x=>x.date===todayStr());
function expCanLaunch(){return !!S.profile&&S.shadows.length>0&&!S.expedition&&!expLaunchedToday()}
const expBackText=e=>e.back===todayStr()?`today at ${EXP_BACK_HOUR}:00`:e.back===addDays(todayStr(),1)?`tomorrow at ${EXP_BACK_HOUR}:00`:`${fmtDate(e.back)}, ${EXP_BACK_HOUR}:00`;
function launchExpedition(g,squad){
  squad=squad.filter(ex=>shadowFor(ex)).slice(0,EXP_SQUAD);
  if(!expCanLaunch()||!squad.length||!expGrades().includes(g))return false;
  const d=todayStr();
  S.expedition={g,squad,date:d,back:flHour()<EXP_BACK_HOUR?d:addDays(d,1),power:expPower(squad),chance:expChance(g,squad)};
  save();return true;
}
/* Loot table for one roll: a key of the Gate's grade, a Random Box, a potion or an elixir. Luck pushes rolls up. */
function expItem(r,g){
  r=Math.min(.999,r+armyBonus('luck')/100);
  return r>=.9?['key',g]:r>=.75?['box']:r>=.62?['potion']:r>=.55?['elixir']:null;
}
/* Bring the squad home: EXP, shadow XP, items. Returns the report, or null if they aren't back. */
function resolveExpedition(){
  if(expState()!=='back')return null;
  const e=S.expedition,k=gi(e.g),seed=S.created+'|exp|'+e.date+'|'+e.g;
  const ok=seeded(seed)<e.chance,rec=S.log[e.date],bonus=!!(rec&&rec.completed&&!rec.rested);
  const mult=bonus?1.5:1,exp=Math.round((ok?15+k*10:5+k*2)*mult),xp=Math.round((ok?30+k*25:10+k*8)*mult);
  const loot=[`+${exp} EXP`],ups=[];
  S.exp+=exp;const lvUp=syncLevel();
  const squad=expSquadOK(e.squad);
  squad.forEach(sh=>shadowGain(sh,xp*shadowXpMult(),ups));
  if(ok)[seed+'|loot',...(bonus?[seed+'|bonus']:[])].forEach(s=>{const it=expItem(seeded(s),e.g);if(it)loot.push(grantItem(it[0],1,it[1]))});
  S.expeditions.push({g:e.g,date:e.date,ok,bonus});S.expeditions=S.expeditions.slice(-60);
  S.expedition=null;save();
  return {e,ok,bonus,exp,xp,loot,squad,ups,lvUp,gate:gateOf(e.g)};
}

/* ---------- screens ---------- */
let expPick=null; // the expedition being planned: {g, squad}
function openExpedition(){
  if(expState()==='back'){claimExpedition();return}
  if(S.expedition){const e=S.expedition,d=gateOf(e.g);
    openModal(`<div class="m-stamp">Expedition</div><p class="h2">${esc(d.name)}</p>
      <p class="m-text">${arList(expSquadOK(e.squad).map(sh=>esc(sh.n)))} ${e.squad.length>1?'are':'is'} inside the ${e.g}-grade Gate. Back ${expBackText(e)}.</p>
      <p class="m-text dim">${Math.round(e.chance*100)}% chance to beat ${esc(d.boss)}. ${S.log[e.date]&&S.log[e.date].completed?'You cleared that day\'s quest, so they bring more.':'Clear today\'s quest before they return and they bring more.'}</p>
      <button class="btn" data-act="closeModal">Close</button>`,'sys','helm');return}
  if(!S.shadows.length){toast('Extract a shadow first: beat a personal record.');return}
  if(!expCanLaunch()){toast('Your shadows already went out today. Send them again tomorrow.');return}
  expPick={g:expDefaultGrade(),squad:expDefaultSquad()};
  openModal(`<div class="m-stamp">Send an expedition</div>
    <p class="m-text">Pick a Gate and up to ${EXP_SQUAD} shadows. They come back tomorrow at ${EXP_BACK_HOUR}:00. Clear today's quest before then and they bring more.</p>
    <div id="expBody"></div>`,'sys','helm');
  paintExpedition();
}
function paintExpedition(){
  const P=expPick,el=$('expBody');if(!P||!el)return;
  const d=gateOf(P.g),ch=expChance(P.g,P.squad);
  el.innerHTML=`<p class="overline">Gate</p><div class="exp-grades" role="radiogroup" aria-label="Gate grade">${expGrades().map(g=>`<button class="fchip" role="radio" aria-checked="${g===P.g}" data-act="expGrade" data-arg="${g}">${g}</button>`).join('')}</div>
    <p class="exp-gate"><b>${esc(d.name)}</b> · boss ${esc(d.boss)}</p>
    <p class="overline">Squad · ${P.squad.length} of ${EXP_SQUAD}</p>
    <div class="exp-squad">${armyOrder().map(sh=>{const on=P.squad.includes(sh.ex);
      return `<button class="exp-sh${on?' on':''}" aria-pressed="${on}" data-act="expShadow" data-arg="${esc(sh.ex)}"><span class="exp-art">${shadowArt(sh)}</span><b>${esc(sh.n)}</b><span>Lv ${sh.lvl} · ${fmtN(shadowStats(sh).cp)} CP</span></button>`}).join('')}</div>
    <div class="exp-odds"><span class="overline">Squad power ${fmtN(expPower(P.squad))}</span><b class="${ch>=.6?'':'risky'}">${Math.round(ch*100)}%</b><span class="overline">chance to win</span></div>
    <div class="m-btns"><button class="btn" data-act="expGo" ${P.squad.length?'':'disabled'}>Send the squad</button><button class="btn ghost" data-act="closeModal">Not now</button></div>`;
}
function claimExpedition(){
  const R=resolveExpedition();if(!R)return;
  const lead=R.squad[0],names=arList(R.squad.map(sh=>esc(sh.n))),promo=R.ups.filter(u=>u.promo),lvls=R.ups.filter(u=>!u.promo).map(u=>`${esc(u.sh.n)} Lv ${u.sh.lvl}`);
  const story=R.ok?`${lead?esc(lead.n):'The squad'} led the way through ${esc(R.gate.name)}. ${esc(R.gate.boss)} fell before dawn.`
    :`${esc(R.gate.boss)} held ${esc(R.gate.name)}. ${names} pulled back with what they could carry.`;
  renderAll();buzz(R.ok?'level':'done');
  openModal(`<div class="m-stamp">${R.ok?'Expedition cleared':'Expedition repelled'}</div><p class="h2">${esc(R.gate.name)} · ${R.e.g}</p>
    <p class="m-text">${story}</p>
    ${R.bonus?`<div class="m-flag">${ic('flame')}Streak bonus · you cleared that day's quest · ×1.5</div>`:''}
    ${R.lvUp?`<div class="m-flag lvl-flag">${ic('zap')}Level up · ${S.level}</div>`:''}
    <p class="overline">The squad brought back</p>${lootHTML(R.loot)}
    <p class="m-text dim">${names}: +${Math.round(R.xp*shadowXpMult())} XP each${lvls.length?` · ${lvls.join(', ')}`:''}.</p>
    <div class="m-btns">${expCanLaunch()?`<button class="btn" data-act="expAgain">Send them out again</button>`:''}<button class="btn ${expCanLaunch()?'ghost':''}" data-act="closeModal">Continue</button></div>`,'sys','helm');
  announceUps(promo);checkFeats();
}
ACT.expedition=openExpedition;
ACT.expGrade=g=>{if(!expPick)return;expPick.g=g;buzz('tap');paintExpedition()};
ACT.expShadow=ex=>{if(!expPick)return;const q=expPick.squad,i=q.indexOf(ex);
  if(i>=0)q.splice(i,1);else if(q.length<EXP_SQUAD)q.push(ex);else{toast(`A squad holds ${EXP_SQUAD} shadows`);return}buzz('tap');paintExpedition()};
ACT.expGo=()=>{if(!expPick||!launchExpedition(expPick.g,expPick.squad))return;const e=S.expedition;expPick=null;closeModal();buzz('level');
  toast(`Squad sent into ${gateOf(e.g).name}. Back ${expBackText(e)}.`);renderAll()};
ACT.expAgain=()=>{closeModal();setTimeout(openExpedition,250)};

/* A strip on the Status tab: shadows back (claim), or an evening invitation to send them out. */
function expStripHTML(){
  const st=expState();
  if(st==='back')return `<button class="chest-strip exp-strip" data-act="expedition"><span class="cs-ic">${ic('helm')}</span><span class="grow"><b>Your shadows are back</b><span>${esc(gateOf(S.expedition.g).name)} · ${S.expedition.g}-grade Gate</span></span><span class="overline">Open →</span></button>`;
  if(expCanLaunch()&&flHour()>=18)return `<button class="chest-strip exp-strip quiet" data-act="expedition"><span class="cs-ic">${ic('helm')}</span><span class="grow"><b>Send your shadows out tonight</b><span>They return at ${EXP_BACK_HOUR}:00 with loot</span></span><span class="overline">Send →</span></button>`;
  return '';
}
/* The expedition card at the top of the Shadows view. */
function expCardHTML(){
  if(!S.shadows.length)return '';
  const st=expState(),e=S.expedition,done=S.expeditions.filter(x=>x.ok).length;
  const line=st==='back'?`Back from ${esc(gateOf(e.g).name)}. Claim the loot.`
    :st==='away'?`${arList(expSquadOK(e.squad).map(sh=>esc(sh.n)))} in ${esc(gateOf(e.g).name)} (${e.g}) · back ${expBackText(e)} · ${Math.round(e.chance*100)}%`
    :expCanLaunch()?'Send up to 3 shadows into a Gate. They return tomorrow at 6:00 with loot.':'Your shadows went out today. Send them again tomorrow.';
  return `<div class="card exp-card"><div class="card-head"><span class="h3">Expeditions</span>${done?`<span class="pill">${done} cleared</span>`:''}</div>
    <p class="muted small">${line}</p>
    ${st==='back'?`<button class="btn block" data-act="expedition">Claim the loot</button>`:st==='away'?`<button class="btn ghost block" data-act="expedition">Check on them</button>`:expCanLaunch()?`<button class="btn block" data-act="expedition">Send an expedition</button>`:''}</div>`;
}
