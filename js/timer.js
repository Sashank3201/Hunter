/* Hunter System: session stopwatch and rest countdown.
   The stopwatch belongs to today's log (rec.time = {acc ms, run start|null}),
   so it survives reloads and closing the app. The countdown is a quick in-memory
   rest timer. One ticker updates whatever timer readouts are on screen. */

function swState(){const r=todayRec();if(!r.time)r.time={acc:0,run:null};return r.time}
function swElapsed(rec){const t=(rec||todayRec()).time;if(!t)return 0;return t.acc+(t.run?Date.now()-t.run:0)}
function swRunning(){const t=todayRec().time;return !!(t&&t.run)}
function swStart(){const t=swState();if(!t.run){t.run=Date.now();save()}}
function swPause(){const t=swState();if(t.run){t.acc+=Date.now()-t.run;t.run=null;save()}}
function swReset(){todayRec().time={acc:0,run:null};save()}
/* Freeze the session when the quest is completed; returns minutes trained. */
function swFinish(rec){
  const t=rec.time;if(!t)return 0;
  if(t.run){t.acc+=Date.now()-t.run;t.run=null}
  rec.duration=Math.round(t.acc/60000);
  return rec.duration;
}
function fmtElapsed(ms){
  const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s/60)%60,x=s%60;
  return (h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(x).padStart(2,'0');
}

/* ---------- rest countdown ---------- */
const CD={end:0,total:0,done:false};
function cdLeft(){return Math.max(0,Math.ceil((CD.end-Date.now())/1000))}

/* ---------- quest-tab card ---------- */
function timerCardHTML(){
  const run=swRunning(),el=swElapsed(),active=CD.end>Date.now();
  return `<div class="card timer-card">
    <div class="tc-row">
      <div><p class="overline">Session time</p><p class="tc-num${run?' live':''}" id="swTime">${fmtElapsed(el)}</p></div>
      <div class="tc-btns"><button class="btn sm${run?' ghost':''}" data-act="swToggle">${run?'Pause':el?'Resume':'Start'}</button>
        <button class="icon-btn" data-act="swReset" aria-label="Reset session time" ${el?'':'disabled'}>${ic('undo')}</button></div>
    </div>
    <div class="tc-row tc-rest">
      <div><p class="overline">Rest timer</p><p class="tc-num small${active?' live':''}" id="cdTime">${active?fmtClock(cdLeft()):CD.done?'GO':'—'}</p></div>
      <div class="tc-btns">${[30,60,90,120].map(s=>`<button class="fchip" data-act="cdStart" data-arg="${s}">${s<120?s+'s':'2m'}</button>`).join('')}
        ${active?`<button class="icon-btn" data-act="cdStop" aria-label="Stop rest timer">${ic('x')}</button>`:''}</div>
    </div></div>`;
}
ACT.swToggle=()=>{swRunning()?swPause():swStart();buzz('tap');renderQuest()};
ACT.swReset=()=>{swReset();renderQuest()};
ACT.cdStart=s=>{CD.total=+s;CD.end=Date.now()+(+s)*1000;CD.done=false;if(!swRunning()&&!todayRec().completed)swStart();buzz('tap');renderQuest()};
ACT.cdStop=()=>{CD.end=0;CD.done=false;renderQuest()};

/* One ticker for every on-screen readout. */
setInterval(()=>{
  const sw=$('swTime');if(sw)sw.textContent=fmtElapsed(swElapsed());
  const we=$('wElapsed');if(we)we.textContent=fmtElapsed(swElapsed());
  if(CD.end){
    const l=cdLeft(),cd=$('cdTime');
    if(l<=0&&!CD.done){CD.done=true;CD.end=0;buzz('alarm');toast('Rest over. Next set.');if(!$('quest').hidden)renderQuest()}
    else if(cd)cd.textContent=fmtClock(l);
  }
},250);
