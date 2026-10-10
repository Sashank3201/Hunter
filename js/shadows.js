/* Hunter System: the shadow army.
   Beating a personal record on a move extracts that move's shadow (ARISE).
   Beating it again levels the shadow up. The first ten are legendary shadows. */
function shadowFor(ex){return S.shadows.find(s=>s.ex===ex)}
function stepIndexOf(ex){for(const k in LADDERS){const i=LADDERS[k].steps.findIndex(s=>s[0]===ex);if(i>=0)return i}return 0}
function extractShadow(ex,best,timed,silent,date){
  let sh=shadowFor(ex);
  if(sh){
    sh.lvl++;sh.best=best;sh.date=date||todayStr();save();
    if(!silent){toast(`${sh.n} grows stronger · Lv ${sh.lvl}`);buzz('done')}
    return sh;
  }
  const i=S.shadows.length,leg=SHADOW_LEGENDS[i];
  sh={ex,n:leg?leg[0]:`Soldier ${String(i+1).padStart(2,'0')}`,rank:leg?leg[1]:SHADOW_GRADES[Math.min(7,stepIndexOf(ex))],
    best,timed:!!timed,date:date||todayStr(),lvl:1};
  S.shadows.push(sh);save();
  if(!silent)arise(sh);
  return sh;
}

/* Silhouettes: a few shapes, chosen per shadow so the army looks varied. */
function silhouette(sh,cls=''){
  const v=hashStr(sh.n+sh.ex)%3;
  const body='M50 10c-14 0-24 10-24 26v13c0 6 4 10 8 12l-4 9H16C9 70 4 76 4 84v34h92V84c0-8-5-14-12-14H70l-4-9c4-2 8-6 8-12V36C74 20 64 10 50 10z';
  const extra=v===1?'<path d="M30 26 12 4l24 14zM70 26 88 4 64 18z"/>':v===2?'<path d="M38 14 28 0l14 10zM62 14 72 0 58 10zM36 52l-10 14 14-8zM64 52l10 14-14-8z"/>':'<path d="M50 4v10M42 6l8 6 8-6"/>';
  return `<svg class="sil ${cls}" viewBox="0 0 100 120" aria-hidden="true"><g class="sil-b">${extra}<path d="${body}"/></g>
    <path class="sil-v" d="M34 40h32"/><circle class="sil-e" cx="41" cy="40" r="2.6"/><circle class="sil-e" cx="59" cy="40" r="2.6"/></svg>`;
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
    <div class="ar-card">${silhouette(sh)}<div><p class="overline">${esc(sh.rank)}</p><p class="ar-name">${esc(sh.n)}</p>
      <p class="ar-ex">${esc(dn(sh.ex))} · record ${sh.best}${sh.timed?'s':''}</p></div></div>
    <button class="btn quiet ar-skip" data-act="ariseClose">Tap to continue</button>`;
  a.hidden=false;a.classList.remove('go');void a.offsetWidth;a.classList.add('go');
  buzz('level');
  clearTimeout(ariseTimer);ariseTimer=setTimeout(ariseClose,4200);
}
function ariseClose(){
  const a=$('arise');if(!a||a.hidden)return;
  clearTimeout(ariseTimer);a.hidden=true;
  if(REVEALQ.length)setTimeout(()=>{if(revealIdle())nextReveal()},150);
  if(!$('progress').hidden)renderProgress();
}
ACT.ariseClose=ariseClose;

/* ---------- army view (Progress tab) ---------- */
function armyHTML(){
  const list=S.shadows,next=SHADOW_LEGENDS[list.length];
  let h=`<div class="army-head"><div><p class="overline">Shadow army</p><p class="army-n">${list.length}</p></div>
    <p class="muted small">Beat a personal record to extract its shadow. Beat it again to make that shadow stronger.${next?` Next to rise: <b>${next[0]}</b>.`:''}</p></div>`;
  if(!list.length)return h+`<div class="card state-card"><div class="state-ic">${ic('helm')}</div><div><p class="h3">No shadows yet</p><p class="muted small">Log sets in workout mode. The first time you beat a record, Igris will answer.</p></div></div>`;
  h+=`<div class="army">${list.slice().reverse().map(sh=>`<div class="sh-card">${silhouette(sh,'sm')}
    <div class="sh-meta"><p class="overline">${esc(sh.rank)} · Lv ${sh.lvl}</p><p class="sh-name">${esc(sh.n)}</p>
    <p class="sh-ex">${esc(dn(sh.ex))}</p><p class="sh-rec">${sh.best}${sh.timed?'s':''} <span>record</span></p></div></div>`).join('')}</div>`;
  return h;
}
