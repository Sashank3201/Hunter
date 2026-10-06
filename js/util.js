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

/* ---------- icons ----------
   Small stroke icon set (24px grid, Lucide-style geometry). ic('check') returns inline SVG. */
const ICONS={
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  right:'<path d="m9 18 6-6-6-6"/>',
  left:'<path d="m15 18-6-6 6-6"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  play:'<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',
  flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4.1 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  dumbbell:'<path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M3 10l7-7M14 21l7-7"/>',
  chart:'<path d="M3 3v18h18M8 17v-4M13 17V8M18 17v-7"/>',
  food:'<path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zm0 0v7"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M10 2h4M12 13l3-3"/>',
  alert:'<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3zM12 9v4M12 17h.01"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
  zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  trophy:'<path d="M6 9H4a2 2 0 0 1 0-4h2M18 9h2a2 2 0 0 0 0-4h-2M4 22h16M10 14.7V17c0 .6-.5 1-1 1.2C7.8 18.8 7 20.2 7 22M14 14.7V17c0 .6.5 1 1 1.2 1.2.6 2 2 2 3.8M18 2H6v7a6 6 0 0 0 12 0z"/>',
  skull:'<circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2M12.5 17l-.5-1-.5 1zM16 20a2 2 0 0 0 1.6-3.2A7.9 7.9 0 0 0 20 11a8 8 0 0 0-16 0c0 2.3.9 4.3 2.4 5.8A2 2 0 0 0 8 20z"/>',
  undo:'<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
  settings:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  trash:'<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM20 17v5H6.5A2.5 2.5 0 0 1 4 19.5"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  scale:'<path d="M3 7h18M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0zM12 3v18M8 21h8"/>',
  vibrate:'<rect x="7" y="4" width="10" height="16" rx="2"/><path d="M3 9v6M21 9v6"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'
};
function ic(name,cls){return `<svg class="ic${cls?' '+cls:''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]||''}</svg>`}
