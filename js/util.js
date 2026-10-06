/* Hunter System: small shared helpers (DOM, dates, haptics, actions). */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- dates ----------
   All dates are local 'YYYY-MM-DD' strings. Arithmetic is done in UTC on those
   strings so DST and timezone offsets can never shift a day. */
window.__TODAY=null; // test hook: force "today"
function todayStr(d){if(!d){if(window.__TODAY)return window.__TODAY;d=new Date()}const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)}
function addDays(ds,n){const t=new Date(ds+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}
function dayDiff(a,b){return Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/864e5)}
function dowOf(ds){return new Date(ds+'T00:00:00Z').getUTCDay()}
function dayIndex(){return dowOf(todayStr())}
function mondayOf(ds){return addDays(ds,-((dowOf(ds)+6)%7))}
function nextMonday(ds){return addDays(ds,((8-dowOf(ds))%7)||7)}
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function fmtDate(ds){const t=new Date(ds+'T00:00:00Z');return DOW[t.getUTCDay()]+' '+t.getUTCDate()+' '+MON[t.getUTCMonth()]}

/* ---------- haptics ---------- */
const BUZZ={tap:12,set:[30],done:[40,60,40],alarm:[200,100,200],level:[60,40,60,40,160],bad:[300]};
function buzz(kind){
  if(S.profile&&S.profile.haptics===false)return;
  try{navigator.vibrate&&navigator.vibrate(BUZZ[kind]||kind)}catch(e){}
}

/* ---------- actions ----------
   Every button carries data-act="name" (and optional data-arg). One delegated
   listener dispatches to ACT[name](arg, element). */
const ACT={};
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]');
  if(!el||el.disabled)return;
  const fn=ACT[el.dataset.act];
  if(fn){e.preventDefault();fn(el.dataset.arg,el)}
});
