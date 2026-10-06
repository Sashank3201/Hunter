/* Hunter System: the System menu. Player settings, rules, backup and reset. */
function openMenu(){
  const p=S.profile||{name:'Hunter',haptics:true};
  const passNext=fmtDate(addDays(mondayOf(todayStr()),7));
  $('menu').innerHTML=`<div class="menu-top"><h2>System</h2><button class="w-x" data-act="menuClose" aria-label="Close System menu">✕</button></div>
  <div class="menu-body">
    <section class="m-sec"><h3>Player</h3>
      <form id="nameForm" class="dwt-row"><input id="mName" maxlength="20" value="${esc(p.name)}" aria-label="Player name"><button class="btn dark" type="submit">Save</button></form>
      <label class="switch"><input type="checkbox" id="mHaptics" ${p.haptics!==false?'checked':''}><span>Vibration feedback</span></label>
      <p class="note">${passUsedThisWeek()?`Rest Pass used this week. Next one ${passNext}.`:'Rest Pass available this week. Use it from the Quest tab if you are sick or injured.'}</p>
    </section>
    <section class="m-sec"><h3>Rules</h3>
      ${BRIEFING.map(b=>`<details class="m-rule${b.red?' red':''}"><summary>${b.h}</summary>${b.lines.map(l=>`<p>${l}</p>`).join('')}</details>`).join('')}
      <details class="m-rule"><summary>Stay alive</summary>
        <p>Sharp pain, joint pain or dizziness means stop. Take an easier step.</p>
        <p>Sore muscles for a day or two is normal. That is not an injury.</p>
        <p>Form beats reps. If your form breaks, end the set.</p>
        <p>Sleep 7 to 8 hours and eat enough protein: eggs, dal, paneer, chicken, curd.</p>
        <p>For table rows, only use a heavy table that does not slide or tip.</p>
        <p>If you have a medical condition, check with a doctor first.</p></details>
      <details class="m-rule"><summary>What trains what</summary>
        <p><b>Strength:</b> push, pull, legs, core</p><p><b>Speed:</b> fast feet, burpees, sprints</p>
        <p><b>Agility:</b> footwork, jumps, crawls</p><p><b>Mobility:</b> joint flows, deep squat, upper-back rotation</p>
        <p><b>Flexibility:</b> long stretches, splits</p></details>
      <button class="btn quiet" data-act="replayBrief">Replay the System briefing</button>
    </section>
    <section class="m-sec"><h3>Backup</h3>
      <p class="note">Progress lives only on this device. Save a backup file now and then, and use it to move to a new phone.</p>
      <div class="m-btns left"><button class="btn bone" data-act="exportData">Save backup</button>
      <label class="btn ghost file-btn">Restore backup<input type="file" id="mImport" accept="application/json,.json" hidden></label></div>
    </section>
    <section class="m-sec danger-zone"><h3>Danger zone</h3>
      <p class="note">Deletes everything: progress, titles, records and diet settings.</p>
      <button class="btn quiet" data-act="resetAsk">Reset all progress</button>
    </section>
  </div>`;
  $('menu').hidden=false;
  document.body.classList.add('locked');
  $('nameForm').addEventListener('submit',e=>{
    e.preventDefault();const v=$('mName').value.trim().slice(0,20);if(!v)return;
    S.profile=Object.assign(S.profile||{},{name:v});save();renderAll();toast('Name saved.');
  });
  $('mHaptics').addEventListener('change',e=>{S.profile=Object.assign(S.profile||{},{haptics:e.target.checked});save();buzz('set')});
  $('mImport').addEventListener('change',importData);
}
function closeMenu(){$('menu').hidden=true;document.body.classList.remove('locked')}

function exportData(){
  const data={app:'hunter-system',version:2,exported:new Date().toISOString(),game:S,diet:dietState()};
  const blob=new Blob([JSON.stringify(data,null,1)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`hunter-backup-${todayStr()}.json`;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  toast('Backup saved.');
}
function importData(e){
  const file=e.target.files&&e.target.files[0];
  if(!file)return;
  const r=new FileReader();
  r.onload=()=>{
    let d;
    try{d=JSON.parse(r.result)}catch(err){}
    if(!d||d.app!=='hunter-system'||!d.game||typeof d.game.exp!=='number'){toast('That file is not a Hunter System backup.');return}
    openModal(`<div class="m-stamp">Restore backup</div><p class="m-text">Replace everything on this device with the backup from <b>${esc((d.exported||'').slice(0,10)||'unknown date')}</b>? Level ${d.game.level}, ${d.game.totalQuests||0} quests cleared.</p>
      <div class="m-btns"><button class="btn" id="doRestore">Restore</button><button class="btn ghost" data-act="closeModal">Cancel</button></div>`,'sys');
    $('doRestore').addEventListener('click',()=>{
      S=migrate(d.game);S.lastChecked=S.lastChecked||todayStr();save();
      if(d.diet)saveDietState(Object.assign(dietState(),d.diet));
      closeModal();closeMenu();processMissedDays();renderAll();toast('Backup restored.');
    });
  };
  r.readAsText(file);
  e.target.value='';
}

ACT.menu=openMenu;
ACT.menuClose=closeMenu;
ACT.exportData=exportData;
ACT.replayBrief=()=>{closeMenu();startAwakening(true)};
ACT.resetAsk=()=>openModal(`<div class="m-stamp">Reset everything?</div><p class="m-text">All progress, titles, records and diet settings will be deleted. This cannot be undone.</p>
  <div class="m-btns"><button class="btn" data-act="resetAll">Delete all</button><button class="btn ghost" data-act="closeModal">Cancel</button></div>`,'red');
ACT.resetAll=()=>{
  try{localStorage.removeItem(KEY);localStorage.removeItem(DKEY)}catch(e){}
  S=fresh();closeModal();closeMenu();renderAll();startAwakening();
};
