/* Hunter System: app shell. Modal, toast, tabs, startup and day rollover. */

/* ---------- modal ----------
   tone: 'sys' (accent card), 'red' (warning card), 'death' (full-screen red). */
let lastFocus=null;
function openModal(html,tone,icon){
  tone=tone||'sys';
  lastFocus=document.activeElement;
  const m=$('modal');
  m.className='modal open tone-'+tone;
  $('modalBox').innerHTML=tone==='death'
    ?`<div class="m-ic" style="background:var(--bad);width:72px;height:72px;border-radius:24px">${ic('skull')}</div>${html}`
    :`<div class="m-card${tone==='red'?' red':''}"><div class="m-top"><span class="m-ic">${ic(icon||(tone==='red'?'alert':'info'))}</span>
      <span class="overline">${tone==='red'?'Warning':'System'}</span></div><div class="m-inner">${html}</div></div>`;
  const f=$('modalBox').querySelector('input,button');
  if(f)try{f.focus({preventScroll:true})}catch(e){}
}
function closeModal(){
  $('modal').classList.remove('open');
  if(lastFocus&&lastFocus.focus)try{lastFocus.focus({preventScroll:true})}catch(e){}
  if(REVEALQ.length)setTimeout(()=>{if(revealIdle())nextReveal()},180); // queued rewards
}
ACT.closeModal=closeModal;
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  if($('modal').classList.contains('open'))closeModal();
  else if(!$('shadowLayer').hidden)closeShadow();
  else if(!$('weaponLayer').hidden)closeWeapon();
  else if(!$('trial').hidden&&!S.trialRun)closeTrial();
  else if(!$('recipeLayer').hidden)closeRecipe();
  else if(!$('botLayer').hidden)closeBot();
  else if(!$('groceryLayer').hidden)closeGrocery();
  else if(!$('cardLayer').hidden)closeCard();
  else if(!$('menu').hidden)closeMenu();
});

/* ---------- toast ---------- */
let toastT=null;
function toast(msg){
  const t=$('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2400);
}

/* Animated EXP counter inside the reward card. */
function countUp(){
  document.querySelectorAll('.count-up').forEach(el=>{
    const to=+el.dataset.to,t0=performance.now(),dur=matchMedia('(prefers-reduced-motion: reduce)').matches?0:900;
    const step=now=>{const k=dur?Math.min(1,(now-t0)/dur):1;el.textContent='+'+Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step)};
    requestAnimationFrame(step);
  });
}

/* Replay the staggered entrance animation on a container (tab switch, sub-tab switch). */
function animateIn(el){
  if(!el)return;
  el.classList.remove('enter');void el.offsetWidth;el.classList.add('enter');
  clearTimeout(el._enterT);el._enterT=setTimeout(()=>el.classList.remove('enter'),1300);
}

/* ---------- tabs ---------- */
const TABS=['status','quest','gates','progress','diet'];
function showTab(id){
  document.querySelectorAll('.nav button').forEach(x=>{
    if(x.dataset.t===id)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');
  });
  TABS.forEach(t=>$(t).hidden=(t!==id));
  window.scrollTo(0,0);
  animateIn($(id));
  arrowHome();$('arrowNudge').hidden=true;setTimeout(arrowNudge,1500); // Arrow follows you: in the Diet card or as the floating orb
}
document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>{
  if(b.getAttribute('aria-current')==='page'){window.scrollTo({top:0,behavior:'smooth'});return}
  buzz('tap');showTab(b.dataset.t);
}));
ACT.goQuest=()=>showTab('quest');

/* Hover/focus tooltip for anything with data-tip (heatmap cells, chart bars). */
document.addEventListener('pointerover',e=>{const el=e.target.closest('[data-tip]');if(el)tip(el)});
document.addEventListener('focusin',e=>{const el=e.target.closest('[data-tip]');if(el)tip(el)});
document.addEventListener('pointerout',e=>{if(e.target.closest('[data-tip]'))$('tip').hidden=true});
document.addEventListener('focusout',()=>{$('tip').hidden=true});
function tip(el){
  const t=$('tip'),r=el.getBoundingClientRect();
  t.textContent=el.dataset.tip;t.hidden=false;
  const w=t.offsetWidth;
  t.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';
  t.style.top=(r.top-t.offsetHeight-8)+'px';
}

/* ---------- theme ----------
   'auto' follows the phone; 'light'/'dark' force it. Also keeps the browser bar colour in sync. */
const darkMQ=matchMedia('(prefers-color-scheme: dark)');
function applyTheme(){
  const t=(S.profile&&S.profile.theme)||'auto',root=document.documentElement;
  if(t==='auto')delete root.dataset.theme;else root.dataset.theme=t;
  const dark=t==='dark'||(t==='auto'&&darkMQ.matches);
  document.querySelector('meta[name=theme-color]').setAttribute('content',dark?'#141312':'#ECE7DD');
  Bot.retheme();
}
darkMQ.addEventListener('change',applyTheme);

/* ---------- render + startup ---------- */
let renderedDay=todayStr();
function renderAll(){renderedDay=todayStr();renderTop();renderStatus();renderQuest();renderGates();renderProgress();renderDiet();arrowHome()}

/* If the app stays open past midnight, roll the day over when it comes back into view. */
function checkDay(){
  if(needsAwakening())return;
  if(todayStr()!==renderedDay){processMissedDays();ensureWeekSnap();renderAll();maybeReport();setTimeout(maybeChest,1000)}
  else{ // keep countdowns fresh without rebuilding the screen
    const tl=$('timeLeft');if(tl)tl.textContent=timeLeft();
    const q=S.sudden;
    if(q&&q.state==='open'){if(Date.now()>=q.deadline){q.state='expired';save()}renderStatus()}
  }
  maybeSudden();
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkDay()});
setInterval(checkDay,60000);

applyTheme();
if(needsAwakening()){renderAll();startAwakening()}
else{processMissedDays();ensureWeekSnap();renderAll();animateIn($('status'));huntCatchUp();armoryCatchUp();maybeReport();setTimeout(maybeChest,1000);setTimeout(maybeSudden,1200);setTimeout(arrowNudge,4500)}
