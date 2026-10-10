/* Hunter System: the System menu. Player settings, rules, backup and reset. */
function openMenu(){
  const p=S.profile||{name:'Hunter',haptics:true},rk=currentRank(),lv=levelFromExp();
  const passNext=fmtDate(addDays(mondayOf(todayStr()),7));
  const acc=(icn,title,lines,red)=>`<li><details class="acc"><summary class="lrow"><span class="lead"${red?' style="color:var(--bad);background:var(--bad-soft)"':''}>${ic(icn)}</span><span class="grow t">${title}</span><span class="chev">${ic('right')}</span></summary><div class="acc-body">${lines.map(l=>`<p>${l}</p>`).join('')}</div></details></li>`;
  $('menu').innerHTML=`<div class="set-top"><h1 class="h1">Profile</h1><button class="icon-btn" data-act="menuClose" aria-label="Close">${ic('x')}</button></div>
  <div class="card"><div class="profile"><label class="avatar photo" title="Change photo"><img src="${hunterPhoto()}" alt="Hunter photo"><b>${rk.r}</b><input type="file" id="mPhoto2" accept="image/*" hidden></label><div class="grow"><p class="h2">${esc(p.name)}</p><p class="muted small">Level ${S.level} · ${rk.name} · ${S.totalQuests} quests</p></div></div>
    <div class="prog" style="margin-top:16px"><i style="width:${lv.into/lv.need*100}%"></i></div>
    <button class="btn block" style="margin-top:16px" data-act="cardFromMenu">View Hunter License</button></div>

  <div class="sec-label"><span class="overline">Player</span></div>
  <div class="card tight"><ul class="list">
    <li><form id="nameForm" class="lrow"><span class="lead">${ic('user')}</span><input id="mName" class="text-in" maxlength="20" value="${esc(p.name)}" aria-label="Player name"><button class="btn sm ghost" type="submit">Save</button></form></li>
    <li class="lrow photo-row"><span class="ph-thumb"><img src="${hunterPhoto()}" alt=""></span><div class="grow"><p class="t">Hunter photo</p><p class="s">Shown on your Hunter License</p></div>
      <label class="btn sm ghost file-btn">Change<input type="file" id="mPhoto" accept="image/*" hidden></label>${hasCustomPhoto()?`<button class="btn sm quiet" data-act="photoReset">Reset</button>`:''}</li>
    <li class="lrow"><span class="lead">${ic('moon')}</span><span class="grow t">Theme</span>
      <span class="seg mini" role="radiogroup" aria-label="Theme">${[['auto','Auto'],['light','Light'],['dark','Night']].map(([k,l])=>`<button role="radio" aria-checked="${(p.theme||'auto')===k}" data-act="theme" data-arg="${k}">${l}</button>`).join('')}</span></li>
    <li><label class="lrow" for="mWorld" style="cursor:pointer"><span class="lead">${ic('gate')}</span><span class="grow"><span class="t" style="display:block">3D dungeons</span><span class="s" style="display:block">Enter Gates as 3D worlds. Turn off to save battery.</span></span><span class="switch"><input type="checkbox" id="mWorld" ${p.world3d!==false?'checked':''}><i></i></span></label></li>
    <li><label class="lrow" for="mHaptics" style="cursor:pointer"><span class="lead">${ic('vibrate')}</span><span class="grow t">Vibration</span><span class="switch"><input type="checkbox" id="mHaptics" ${p.haptics!==false?'checked':''}><i></i></span></label></li>
    <li><form id="remForm" class="rem"><div class="lrow" style="padding-bottom:4px"><span class="lead">${ic('timer')}</span><div class="grow"><p class="t">Daily reminder</p><p class="s">A repeating alarm in your phone's calendar, plus a 9 pm penalty warning</p></div></div>
      <div class="rem-row"><input id="mRemind" type="time" class="text-in" value="${p.remindAt||'18:00'}" aria-label="Reminder time"><button class="btn sm" type="submit">Add to calendar</button></div></form></li>
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
  $('mWorld').addEventListener('change',e=>{S.profile=Object.assign(S.profile||{},{world3d:e.target.checked});save();toast(e.target.checked?'Gates open as 3D worlds':'3D dungeons off')});
  $('mImport').addEventListener('change',importData);
  ['mPhoto','mPhoto2'].forEach(id=>$(id).addEventListener('change',e=>{setHunterPhoto(e.target.files[0]);e.target.value=''}));
  $('remForm').addEventListener('submit',e=>{e.preventDefault();const v=$('mRemind').value||'18:00';
    S.profile=Object.assign(S.profile||{},{remindAt:v});save();downloadReminder(v)});
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
ACT.cardFromMenu=()=>{closeMenu();openCard()};
ACT.theme=k=>{S.profile=Object.assign(S.profile||{},{theme:k});save();applyTheme();openMenu()};
ACT.menuClose=closeMenu;
ACT.exportData=exportData;
ACT.replayBrief=()=>{closeMenu();startAwakening(true)};
ACT.resetAsk=()=>openModal(`<div class="m-stamp">Reset everything?</div><p class="m-text">All progress, titles, records and diet settings will be deleted. This cannot be undone.</p>
  <div class="m-btns"><button class="btn danger" data-act="resetAll">Delete everything</button><button class="btn ghost" data-act="closeModal">Cancel</button></div>`,'red','trash');
ACT.resetAll=()=>{
  try{localStorage.removeItem(KEY);localStorage.removeItem(DKEY)}catch(e){}
  S=fresh();closeModal();closeMenu();renderAll();startAwakening();
};

/* ---------- daily reminder ----------
   A static site can't push notifications to a closed app, so the reminder is a
   calendar file: a daily "quest" alarm at the chosen time, plus a penalty warning
   three hours before midnight. Phones import .ics files into their calendar app. */
const icsText=t=>t.replace(/\\/g,'\\\\').replace(/([,;])/g,'\\$1');
const icsFold=l=>l.length<=74?l:l.match(/.{1,73}/g).join('\r\n ');
function downloadReminder(hhmm){
  const [h,m]=hhmm.split(':').map(Number),pad=n=>String(n).padStart(2,'0');
  const day=todayStr().replace(/-/g,''),url=location.origin+location.pathname;
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const warnH=h>=21?23:21,warnM=0;
  const ev=(uid,hh,mm,title,body)=>['BEGIN:VEVENT',`UID:${uid}-${S.created}@hunter-system`,`DTSTAMP:${stamp}`,
    `DTSTART:${day}T${pad(hh)}${pad(mm)}00`,'DURATION:PT15M','RRULE:FREQ=DAILY',`SUMMARY:${icsText(title)}`,
    `DESCRIPTION:${icsText(body+' '+url)}`,`URL:${url}`,'BEGIN:VALARM','ACTION:DISPLAY',`DESCRIPTION:${icsText(title)}`,'TRIGGER:PT0M','END:VALARM','END:VEVENT'];
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Hunter System//Daily Quest//EN','CALSCALE:GREGORIAN',
    ...ev('daily-quest',h,m,'Daily Quest has arrived','[SYSTEM] Your Daily Quest is ready. Open Hunter System:'),
    ...ev('penalty-warning',warnH,warnM,'Penalty warning: quest due at midnight','[SYSTEM] If today\'s quest is not done, a penalty is issued at midnight.'),
    'END:VCALENDAR'].map(icsFold).join('\r\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='hunter-daily-quest.ics';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  toast(`Reminder at ${hhmm} saved. Open the file to add it to your calendar`);
}
