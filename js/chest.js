/* Hunter System: the daily supply chest.
   One chest per day for opening the app. Rewards follow a 7-day run (day 7 pays a
   Dungeon Key); missing a day restarts the run at day 1. Greed's luck can add a
   bonus Random Box. The chest pops up once per day; after that the Status tab
   keeps a link until it is opened. */
const CHEST_ICON={exp:'zap',box:'box',elixir:'elixir',key:'key',potion:'flask'};
function chestReady(){return !!S.profile&&!notStarted()&&S.login.last!==todayStr()}
/* Today's place in the run, if claimed today. */
function chestDay(){
  const l=S.login,streak=l.last===addDays(todayStr(),-1)?l.streak+1:1;
  return {streak,day:(streak-1)%7+1};
}
const rewardLabel=([k,n])=>k==='exp'?`+${n} EXP`:k==='key'?'Key':ITEMS[k].name.split(' ')[0];

function chestSVG(){
  return `<svg class="chest-svg" viewBox="0 0 120 104" aria-hidden="true">
    <g class="ch-base"><rect x="12" y="46" width="96" height="50" class="ch-body"/><rect x="24" y="46" width="11" height="50" class="ch-band"/><rect x="85" y="46" width="11" height="50" class="ch-band"/>
      <path d="M12 58h96" class="ch-line"/></g>
    <g class="ch-lid"><path d="M12 46V32C12 17 33 8 60 8s48 9 48 24v14z" class="ch-body"/><path d="M24 46V15.5h11V46zM85 46V15.5h11V46z" class="ch-band"/>
      <rect x="51" y="38" width="18" height="20" class="ch-lock"/><path d="M60 44v6" class="ch-key"/></g>
  </svg>`;
}
function calHTML(cur,claimed){
  return `<ol class="cal">${LOGIN_REWARDS.map((r,i)=>{const d=i+1,st=d<cur||(d===cur&&claimed)?'got':d===cur?'now':'';
    return `<li class="${st}${d===7?' big':''}"><span class="cal-d">D${d}</span><span class="cal-ic">${ic(d<cur||(d===cur&&claimed)?'check':CHEST_ICON[r[0]])}</span><span class="cal-r">${rewardLabel(r)}</span></li>`}).join('')}</ol>`;
}
function openChest(){
  if(!chestReady())return;
  const {streak,day}=chestDay();
  openModal(`<div class="m-stamp">Daily supply</div>
    <p class="m-text">Day <b>${day}</b> of 7${streak>1?` · <b>${streak}</b>-day login streak`:''}. Come back tomorrow to keep the run going.</p>
    ${calHTML(day,false)}
    <div class="chest-stage" id="chestStage"><div class="chest-rays"></div><div class="chest-sparks">${Array.from({length:10},(_,i)=>`<i style="--a:${i*36}deg;--d:${50+(i%3)*14}px"></i>`).join('')}</div>
      <button class="chest" data-act="chestOpen" aria-label="Open the chest">${chestSVG()}</button></div>
    <div id="chestOut"><p class="chest-hint">Tap the chest</p><button class="btn quiet" data-act="closeModal">Later</button></div>`,'sys','box');
}
function chestOpen(){
  if(!chestReady())return;
  const {streak,day}=chestDay(),[k,n]=LOGIN_REWARDS[day-1],loot=[];
  if(k==='exp'){S.exp+=n;loot.push(`+${n} EXP`);syncLevel()}else loot.push(grantItem(k,n));
  const luck=armyBonus('luck');
  if(luck&&Math.random()<luck*2/100)loot.push(grantItem('box')+' · Greed\'s bonus');
  S.login={last:todayStr(),streak,shown:todayStr(),best:Math.max(streak,S.login.best||0)};
  save();
  const st=$('chestStage');if(!st)return;
  st.querySelector('.chest').disabled=true;
  st.classList.add('shake');buzz('tap');
  setTimeout(()=>{st.classList.remove('shake');st.classList.add('open');buzz('level');
    const cal=document.querySelector('.modal .cal');if(cal)cal.outerHTML=calHTML(day,true);
    $('chestOut').innerHTML=`<p class="overline">You obtained</p>${lootHTML(loot)}<button class="btn" data-act="chestDone" style="margin-top:6px">Claim</button>`;
  },650);
}
function chestDone(){closeModal();renderAll();checkFeats()}
/* Pop the chest up once per day, after any other notices. */
function maybeChest(){
  if(window.__NO_CHEST||!chestReady()||S.login.shown===todayStr())return; // __NO_CHEST: test hook
  S.login.shown=todayStr();save();
  afterReveals(openChest);
}
ACT.chest=openChest;
ACT.chestOpen=chestOpen;
ACT.chestDone=chestDone;
