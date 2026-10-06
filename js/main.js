/* Hunter System: app shell. Modal, toast, tabs, startup and day rollover. */

/* ---------- modal (System window) ----------
   tone: 'sys' blue window, 'red' alert window, 'death' full red screen. */
let lastFocus=null;
function openModal(html,tone){
  lastFocus=document.activeElement;
  const m=$('modal');
  m.className='modal open tone-'+(tone||'sys');
  $('modalBox').innerHTML=tone==='death'?html:`<div class="win${tone==='red'?' red':''} m-win"><div class="win-h"><span class="win-ico" aria-hidden="true">!</span><span>${tone==='red'?'Warning':'Notification'}</span></div><div class="win-b m-inner">${html}</div></div>`;
  const f=$('modalBox').querySelector('input,button');
  if(f)try{f.focus({preventScroll:true})}catch(e){}
}
function closeModal(){
  $('modal').classList.remove('open');
  if(lastFocus&&lastFocus.focus)try{lastFocus.focus({preventScroll:true})}catch(e){}
}
ACT.closeModal=closeModal;
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  if($('modal').classList.contains('open'))closeModal();
  else if(!$('menu').hidden)closeMenu();
});

/* ---------- toast ---------- */
let toastT=null;
function toast(msg){
  const t=$('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600);
}

/* Animated EXP counter inside the reward window. */
function countUp(){
  document.querySelectorAll('.count-up').forEach(el=>{
    const to=+el.dataset.to,t0=performance.now(),dur=matchMedia('(prefers-reduced-motion: reduce)').matches?0:900;
    const step=now=>{const k=dur?Math.min(1,(now-t0)/dur):1;el.textContent='+'+Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step)};
    requestAnimationFrame(step);
  });
}

/* ---------- tabs ---------- */
const TABS=['status','quest','progress','diet'];
function showTab(id){
  document.querySelectorAll('.nav button').forEach(x=>{
    if(x.dataset.t===id)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');
  });
  TABS.forEach(t=>$(t).hidden=(t!==id));
  window.scrollTo(0,0);
}
document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>{buzz('tap');showTab(b.dataset.t)}));
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

/* ---------- render + startup ---------- */
let renderedDay=todayStr();
function renderAll(){renderedDay=todayStr();renderTop();renderStatus();renderQuest();renderProgress();renderDiet()}

/* If the app stays open past midnight, roll the day over when it comes back into view. */
function checkDay(){
  if(todayStr()!==renderedDay&&!needsAwakening()){processMissedDays();renderAll()}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkDay()});
setInterval(checkDay,60000);

if(needsAwakening()){renderAll();startAwakening()}
else{processMissedDays();renderAll()}
