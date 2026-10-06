/* Hunter System: the System menu. Player settings, rules, backup and reset. */
function openMenu(){
  const p=S.profile||{name:'Hunter',haptics:true},rk=currentRank(),lv=levelFromExp();
  const passNext=fmtDate(addDays(mondayOf(todayStr()),7));
  const acc=(icn,title,lines,red)=>`<li><details class="acc"><summary class="lrow"><span class="lead"${red?' style="color:var(--bad);background:var(--bad-soft)"':''}>${ic(icn)}</span><span class="grow t">${title}</span><span class="chev">${ic('right')}</span></summary><div class="acc-body">${lines.map(l=>`<p>${l}</p>`).join('')}</div></details></li>`;
  $('menu').innerHTML=`<div class="set-top"><h1 class="h1">Profile</h1><button class="icon-btn" data-act="menuClose" aria-label="Close">${ic('x')}</button></div>
  <div class="card"><div class="profile"><span class="avatar">${rk.r}</span><div class="grow"><p class="h2">${esc(p.name)}</p><p class="muted small">Level ${S.level} · ${rk.name} · ${S.totalQuests} quests</p></div></div>
    <div class="prog" style="margin-top:16px"><i style="width:${lv.into/lv.need*100}%"></i></div></div>

  <div class="sec-label"><span class="overline">Player</span></div>
  <div class="card tight"><ul class="list">
    <li><form id="nameForm" class="lrow"><span class="lead">${ic('user')}</span><input id="mName" class="text-in" maxlength="20" value="${esc(p.name)}" aria-label="Player name"><button class="btn sm ghost" type="submit">Save</button></form></li>
    <li><label class="lrow" for="mHaptics" style="cursor:pointer"><span class="lead">${ic('vibrate')}</span><span class="grow t">Vibration</span><span class="switch"><input type="checkbox" id="mHaptics" ${p.haptics!==false?'checked':''}><i></i></span></label></li>
    <li class="lrow"><span class="lead">${ic('moon')}</span><div class="grow"><p class="t">Rest Pass</p><p class="s">${passUsedThisWeek()?`Used this week. Next one ${passNext}.`:'Available. Use it from the Quest tab if sick or injured.'}</p></div></li>
  </ul></div>

  <div class="sec-label"><span class="overline">Rules</span></div>
  <div class="card tight"><ul class="list">
    ${BRIEFING.map((b,i)=>acc(['zap','alert','skull','shield'][i],b.h,b.lines,b.red)).join('')}
    ${acc('shield','Stay safe',['Sharp pain, joint pain or dizziness means stop. Take an easier step.','Sore muscles for a day or two is normal. That is not an injury.','Form beats reps. If your form breaks, end the set.','Sleep 7 to 8 hours and eat enough protein.','For table rows, only use a heavy table that does not slide or tip.','If you have a medical condition, check with a doctor first.'])}
    ${acc('dumbbell','What trains what',['<b>Strength</b>: push, pull, legs, core','<b>Speed</b>: fast feet, burpees, sprints','<b>Agility</b>: footwork, jumps, crawls','<b>Mobility</b>: joint flows, deep squat, upper-back rotation','<b>Flexibility</b>: long stretches, splits'])}
    <li><button class="lrow" data-act="replayBrief"><span class="lead">${ic('book')}</span><span class="grow t">Replay the System briefing</span><span class="chev">${ic('right')}</span></button></li>
  </ul></div>

  <div class="sec-label"><span class="overline">Data</span></div>
  <div class="card tight"><ul class="list">
    <li><button class="lrow" data-act="exportData"><span class="lead">${ic('download')}</span><span class="grow"><span class="t" style="display:block">Save backup</span><span class="s" style="display:block">Progress lives only on this device</span></span></button></li>
    <li><label class="lrow file-btn"><span class="lead">${ic('upload')}</span><span class="grow t">Restore from backup</span><input type="file" id="mImport" accept="application/json,.json" hidden></label></li>
    <li><button class="lrow" data-act="resetAsk" style="color:var(--bad)"><span class="lead" style="color:var(--bad);background:var(--bad-soft)">${ic('trash')}</span><span class="grow t">Reset all progress</span></button></li>
  </ul></div>
  <p class="faint small" style="text-align:center;padding:20px 0 40px">Hunter System · Arise.</p>`;
  $('menu').hidden=false;$('menu').classList.remove('show');void $('menu').offsetWidth;$('menu').classList.add('show');
  $('menu').scrollTop=0;
  document.body.classList.add('locked');
  $('nameForm').addEventListener('submit',e=>{
    e.preventDefault();const v=$('mName').value.trim().slice(0,20);if(!v)return;
    S.profile=Object.assign(S.profile||{},{name:v});save();renderAll();openMenu();toast('Name saved');
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
  toast('Backup saved');
}
function importData(e){
  const file=e.target.files&&e.target.files[0];
  if(!file)return;
  const r=new FileReader();
  r.onload=()=>{
    let d;
    try{d=JSON.parse(r.result)}catch(err){}
    if(!d||d.app!=='hunter-system'||!d.game||typeof d.game.exp!=='number'){toast('That file is not a Hunter System backup');return}
    openModal(`<div class="m-stamp">Restore backup</div><p class="m-text">Replace everything on this device with the backup from <b>${esc((d.exported||'').slice(0,10)||'unknown date')}</b>? Level ${d.game.level}, ${d.game.totalQuests||0} quests cleared.</p>
      <div class="m-btns"><button class="btn" id="doRestore">Restore</button><button class="btn ghost" data-act="closeModal">Cancel</button></div>`,'sys','upload');
    $('doRestore').addEventListener('click',()=>{
      S=migrate(d.game);S.lastChecked=S.lastChecked||todayStr();save();
      if(d.diet)saveDietState(Object.assign(dietState(),d.diet));
      closeModal();closeMenu();processMissedDays();renderAll();toast('Backup restored')
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
  <div class="m-btns"><button class="btn danger" data-act="resetAll">Delete everything</button><button class="btn ghost" data-act="closeModal">Cancel</button></div>`,'red','trash');
ACT.resetAll=()=>{
  try{localStorage.removeItem(KEY);localStorage.removeItem(DKEY)}catch(e){}
  S=fresh();closeModal();closeMenu();renderAll();startAwakening();
};
