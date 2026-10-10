/* Hunter System: the weekly System report.
   Each Monday the System reports on the previous week (Mon-Sun): days trained,
   time, reps, EXP, stat gains, records, shadows, gates and achievements, with a
   grade. Stat gains come from snapshots taken at the start of each week. */
function ensureWeekSnap(){
  const m=mondayOf(todayStr());
  if(!S.weekSnaps[m]){
    S.weekSnaps[m]=Object.assign({},S.stats);
    Object.keys(S.weekSnaps).sort().slice(0,-10).forEach(k=>delete S.weekSnaps[k]);
    save();
  }
}
function setsReps(r){return r.reps!=null?r.reps:Object.entries(r.sets||{}).filter(([k])=>!k.startsWith('w')).reduce((a,[,v])=>a+v.reduce((x,y)=>x+y,0),0)}
function weekReport(m){
  const days=Array.from({length:7},(_,i)=>addDays(m,i)),end=days[6],recs=days.map(d=>S.log[d]).filter(Boolean);
  const done=recs.filter(r=>r.completed&&!r.rested);
  const inWeek=d=>d&&d>=m&&d<=end;
  const a=S.weekSnaps[m],b=S.weekSnaps[addDays(m,7)]||(mondayOf(todayStr())===m?S.stats:null);
  const gains=a&&b?STATS.map(x=>Math.max(0,(b[x]||0)-(a[x]||0))):null;
  const R={m,end,days:trainedInWeek(m),
    mins:recs.reduce((x,r)=>x+(r.duration||0),0),reps:done.reduce((x,r)=>x+setsReps(r),0),exp:recs.reduce((x,r)=>x+(r.exp||0),0),
    gains,records:Object.values(S.prs).filter(p=>inWeek(p.date)).length,shadows:S.shadows.filter(s=>inWeek(s.date)).length,
    gates:S.dungeons.filter(d=>d.ok&&inWeek(d.date)).length,feats:Object.values(S.feats).filter(inWeek).length,
    cools:recs.filter(r=>r.cooled).length,missed:recs.filter(r=>r.missed).length,passes:recs.filter(r=>r.rested).length};
  const extra=R.records+R.gates+R.shadows;
  R.grade=R.days>=5&&extra?'S':R.days>=5?'A':R.days===4?'B':R.days===3?'C':R.days===2?'D':'E';
  R.line={S:'Exceptional. The System acknowledges your growth.',A:'Weekly goal achieved. Keep the pace.',B:'Close. One more day next week.',
    C:'Half-hearted. The System expects more.',D:'Weak showing. The penalty zone is near.',E:'Unacceptable. Rise, or be left behind.'}[R.grade];
  return R;
}

/* Show last week's report once, on the first visit of a new week. */
function maybeReport(){
  if(!S.profile)return;
  const thisMon=mondayOf(todayStr()),last=addDays(thisMon,-7);
  if(S.reportSeen===thisMon)return;
  S.reportSeen=thisMon;save();
  const hadWeek=S.startDate<=addDays(last,6)&&Object.keys(S.log).some(d=>d>=last&&d<thisMon);
  if(hadWeek)setTimeout(()=>afterReveals(()=>openReport(last)),900);
}

/* ---------- card ---------- */
async function drawReport(canvas,R){
  await cardFonts();
  const ctx=canvas.getContext('2d'),W=1080,H=1350,name=(S.profile?S.profile.name:'Hunter').toUpperCase();
  canvas.width=W;canvas.height=H;
  ctx.fillStyle=C.paper;ctx.fillRect(0,0,W,H);ctx.strokeStyle=C.ink;ctx.lineWidth=6;ctx.strokeRect(M/2,M/2,W-M,H-M);
  ctx.fillStyle=C.ink;ctx.fillRect(M/2,M/2,W-M,118);
  ctx.fillStyle=C.paper;ctx.font=F.m(26);spaced(ctx,'SYSTEM REPORT',M+14,M/2+52,5);
  ctx.font=F.m(20);ctx.fillStyle=C.paper3;spaced(ctx,name,M+14,M/2+88,3);
  ctx.textAlign='right';ctx.font=F.m(24);ctx.fillStyle=C.paper;ctx.fillText(`${fmtDate(R.m).toUpperCase()} – ${fmtDate(R.end).toUpperCase()}`,W-M-14,M/2+52);
  ctx.font=F.m(20);ctx.fillStyle=C.paper3;ctx.fillText('WEEKLY ASSESSMENT',W-M-14,M/2+88);ctx.textAlign='left';
  // grade block
  const bx=M+18,by=196,bs=300;
  ctx.fillStyle=C.red;ctx.fillRect(bx+20,by+20,bs,bs);ctx.fillStyle=C.ink;ctx.fillRect(bx,by,bs,bs);
  ctx.fillStyle=C.paper;ctx.textAlign='center';ctx.font=F.d(900,340);ctx.fillText(R.grade,bx+bs/2,by+bs-30);ctx.textAlign='left';
  ctx.fillStyle=C.ink2;ctx.font=F.m(20);spaced(ctx,'WEEK GRADE',bx,by+bs+60,3);
  // headline numbers
  const ix=bx+bs+70;let y=by+20;
  ctx.fillStyle=C.ink2;ctx.font=F.m(22);spaced(ctx,'DAYS TRAINED',ix,y,4);
  ctx.fillStyle=C.ink;ctx.font=F.d(900,170);ctx.fillText(String(R.days),ix,y+150);
  const dx=ix+ctx.measureText(String(R.days)).width+26,met=R.days>=5;
  ctx.fillStyle=met?C.red:C.ink2;ctx.font=F.m(22);spaced(ctx,met?'GOAL MET':'GOAL 5',dx,y+92,3);
  ctx.fillStyle=C.ink2;spaced(ctx,'OF 7 DAYS',dx,y+128,3);
  y+=200;
  [['TIME',R.mins>=60?`${Math.floor(R.mins/60)}H ${R.mins%60}M`:`${R.mins} MIN`],['REPS',R.reps.toLocaleString('en-US')],['EXP',`+${R.exp}`]].forEach(([k,v],i)=>{
    const x=ix+i*200;ctx.fillStyle=C.ink2;ctx.font=F.m(18);spaced(ctx,k,x,y,3);ctx.fillStyle=C.ink;ctx.font=F.d(900,60);ctx.fillText(v,x,y+62)});
  // stat gains
  y=640;ctx.fillStyle=C.ink;ctx.fillRect(M/2,y,W-M,4);
  ctx.fillStyle=C.ink2;ctx.font=F.m(22);spaced(ctx,'STAT GAINS',M+18,y+50,4);
  const colW=(W-M*2-36)/5;
  STATS.forEach((x,i)=>{const sx=M+18+i*colW,g=R.gains?R.gains[i]:0;
    ctx.fillStyle=g>0?C.red:C.ink3;ctx.font=F.d(900,84);ctx.fillText(R.gains?`+${g.toFixed(1)}`:'—',sx,y+150);
    ctx.fillStyle=C.ink2;ctx.font=F.m(20);spaced(ctx,x.slice(0,3).toUpperCase(),sx,y+190,3)});
  // highlights
  y=900;ctx.fillStyle=C.ink;ctx.fillRect(M/2,y,W-M,2);
  const hl=[[R.records,'RECORDS'],[R.shadows,'SHADOWS'],[R.gates,'GATES'],[R.feats,'FEATS'],[R.cools,'COOL-DOWNS']];
  const rw=(W-M*2-36)/hl.length;
  hl.forEach(([v,l],i)=>{const rx=M+18+i*rw;ctx.fillStyle=C.ink;ctx.font=F.d(900,90);ctx.fillText(String(v),rx,y+110);
    ctx.fillStyle=C.ink2;ctx.font=F.m(17);spaced(ctx,l,rx,y+146,2);if(i)ctx.fillRect(rx-14,y+30,1.5,130)});
  // verdict
  y=1110;ctx.fillStyle=C.ink;ctx.fillRect(M/2,y,W-M,2);
  ctx.fillStyle=C.ink2;ctx.font=F.m(20);spaced(ctx,'[ SYSTEM ]',M+18,y+50,4);
  ctx.fillStyle=C.ink;ctx.font=F.d(800,52);
  const words=R.line.toUpperCase().split(' ');let line='',ly=y+110;
  words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>W-M*2-40){ctx.fillText(line,M+18,ly);line=w;ly+=56}else line=t});ctx.fillText(line,M+18,ly);
  ctx.fillStyle=C.red;ctx.textAlign='right';ctx.font=F.d(900,40);ctx.fillText('ARISE.',W-M-18,H-M/2-30);ctx.textAlign='left';
}

/* ---------- screen ---------- */
let reportWeek=null;
async function openReport(m){
  reportWeek=m||addDays(mondayOf(todayStr()),-7);
  const R=weekReport(reportWeek),L=$('reportLayer'),newer=addDays(reportWeek,7)<mondayOf(todayStr());
  L.innerHTML=`<div class="set-top"><h1 class="h1">Report</h1><button class="icon-btn" data-act="reportClose" aria-label="Close">${ic('x')}</button></div>
    <div class="rep-nav"><button class="icon-btn" data-act="reportWeek" data-arg="-7" aria-label="Previous week">${ic('left')}</button>
      <span class="overline">Week of ${fmtDate(reportWeek)}</span>
      <button class="icon-btn" data-act="reportWeek" data-arg="7" aria-label="Next week" ${newer?'':'disabled'}>${ic('right')}</button></div>
    <div class="card-frame"><canvas id="reportCanvas" aria-label="Weekly System report card"></canvas></div>
    <div class="card-actions"><button class="btn" data-act="reportShare">Share report</button><button class="btn ghost" data-act="reportSave">Save image</button></div>
    <p class="faint small" style="padding:10px 0 40px">${R.missed?`${R.missed} missed day${R.missed>1?'s':''}. `:''}${R.passes?`${R.passes} Rest Pass used. `:''}Grades: S = 5+ days and a record, gate or new shadow · A = 5 days · B = 4 · C = 3 · D = 2 · E = 0–1.</p>`;
  if(L.hidden){L.hidden=false;L.classList.remove('show');void L.offsetWidth;L.classList.add('show');L.scrollTop=0}
  document.body.classList.add('locked');
  await drawReport($('reportCanvas'),R);
}
function closeReport(){$('reportLayer').hidden=true;document.body.classList.remove('locked');if(REVEALQ.length)setTimeout(()=>{if(revealIdle())nextReveal()},180)}
ACT.report=()=>openReport();
ACT.reportClose=closeReport;
ACT.reportWeek=d=>openReport(addDays(reportWeek,+d));
ACT.reportSave=async()=>{const b=await new Promise(r=>$('reportCanvas').toBlob(r,'image/png')),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=`hunter-report-${reportWeek}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Report saved')};
ACT.reportShare=async()=>{const b=await new Promise(r=>$('reportCanvas').toBlob(r,'image/png')),file=new File([b],'hunter-report.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'My weekly System report'})}catch(e){}}else ACT.reportSave()};
