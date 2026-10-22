/* Hunter System: the Hunter's Chronicle.
   Each month becomes a chapter, written from what the Player actually did: quests, reps, levels,
   rank trials, records, shadows, Gates, expeditions, story chapters, body check-ins and sleep.
   On the first visit of a new month the System presents last month's chapter once; any month can
   be reopened from Progress → History. Level and rank changes come from a snapshot taken at the
   start of each month (S.monthSnaps); a month without one just leaves them out. */
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const ymOf=ds=>ds.slice(0,7);
const ymAdd=(ym,n)=>{const [y,m]=ym.split('-').map(Number),t=y*12+m-1+n;return `${Math.floor(t/12)}-${String(t%12+1).padStart(2,'0')}`};
const ymName=ym=>MONTHS[+ym.slice(5)-1];
const ymDays=ym=>{const out=[];for(let d=ym+'-01';ymOf(d)===ym;d=addDays(d,1))out.push(d);return out};

function ensureMonthSnap(){
  const ym=ymOf(todayStr());
  if(S.monthSnaps[ym])return;
  S.monthSnaps[ym]={level:S.level,rank:currentRank().r,stats:Object.assign({},S.stats),shadows:S.shadows.length};
  Object.keys(S.monthSnaps).sort().slice(0,-14).forEach(k=>delete S.monthSnaps[k]);
  save();
}

/* ---------- the numbers ---------- */
function monthReport(ym){
  const today=todayStr(),days=ymDays(ym).filter(d=>d<=today),inM=d=>!!d&&ymOf(d)===ym,live=ym===ymOf(today);
  const recs=days.map(d=>S.log[d]).filter(Boolean),done=recs.filter(r=>r.completed&&!r.rested);
  // longest run of cleared days; rest days left open don't break it, a missed day does
  let run=0,best=0;days.forEach(d=>{const r=S.log[d];if(r&&r.completed&&!r.rested){run++;best=Math.max(best,run)}else if(r&&r.missed)run=0});
  const a=S.monthSnaps[ym],b=S.monthSnaps[ymAdd(ym,1)]||(live?{level:S.level,rank:currentRank().r,stats:S.stats}:null);
  const prs=Object.entries(S.prs).filter(([,p])=>inM(p.date)).map(([n,p])=>({n,best:p.best,timed:p.timed})).sort((x,y)=>(!!x.timed-!!y.timed)||(y.best-x.best)); // reps before holds, biggest first
  const shadows=S.shadows.filter(sh=>inM(sh.date));
  const kg=(S.body||[]).filter(x=>inM(x.d)&&typeof x.kg==='number'),waist=(S.body||[]).filter(x=>inM(x.d)&&typeof x.waist==='number');
  const nights=Object.entries(S.sleep||{}).filter(([d,h])=>inM(d)&&h>=0).map(([,h])=>h);
  const runs=S.events&&S.events.runs?Object.values(S.events.runs):[];
  const R={ym,live,name:ymName(ym),year:ym.slice(0,4),chapter:Math.max(1,(+ym.slice(0,4)-+S.startDate.slice(0,4))*12+(+ym.slice(5))-(+S.startDate.slice(5,7))+1),
    days:done.length,reps:done.reduce((x,r)=>x+setsReps(r),0),mins:recs.reduce((x,r)=>x+(r.duration||0),0),exp:recs.reduce((x,r)=>x+(r.exp||0),0),
    streak:best,missed:recs.filter(r=>r.missed).length,died:recs.some(r=>r.died),passes:recs.filter(r=>r.rested).length,
    lvFrom:a?a.level:null,lvTo:b?b.level:null,rankFrom:a?a.rank:null,rankTo:b?b.rank:null,
    prs,shadows,legend:shadows.find(sh=>SHADOW_BODY[sh.n]&&SHADOW_BODY[sh.n].epithet),
    gates:S.dungeons.filter(d=>d.ok&&inM(d.date)).length,feats:Object.values(S.feats).filter(inM).length,
    exps:S.expeditions.filter(x=>inM(x.date)),chapters:runs.reduce((x,r)=>x+(r.ch||[]).filter(inM).length,0),raids:runs.filter(r=>inM(r.raid)).length,
    kg:kg.length>1?[kg[0].kg,kg[kg.length-1].kg]:null,waist:waist.length>1?[waist[0].waist,waist[waist.length-1].waist]:null,
    sleep:nights.length>=3?Math.round(nights.reduce((x,h)=>x+h,0)/nights.length*10)/10:null};
  // grade on training days, scaled to the part of the month that has passed (about 5 days a week is the goal)
  const goal=Math.max(1,Math.round(days.length*5/7)),pct=R.days/goal,extra=R.prs.length+R.gates+R.shadows.length;
  R.grade=pct>=.95&&extra?'S':pct>=.8?'A':pct>=.6?'B':pct>=.4?'C':pct>=.2?'D':'E';
  R.title=chronicleTitle(R);R.story=chronicleStory(R);
  return R;
}

/* ---------- the words ---------- */
function chronicleTitle(R){
  if(R.died)return 'Death and Return';
  if(R.rankFrom&&R.rankTo&&R.rankFrom!==R.rankTo)return `The ${R.rankTo}-Rank Gate`;
  if(R.legend)return `${R.legend.n} Rises`;
  if(R.streak>=21)return 'The Unbroken';
  if(R.gates>=3)return 'Gate Breaker';
  if(R.days>=20)return 'The Relentless';
  if(R.raids)return 'The Raid';
  if(R.days<=3)return R.live?'The First Steps':'The Quiet Month';
  return `The ${R.name} Hunt`;
}
const nOf=(n,w,pl)=>`${n} ${n===1?w:(pl||w+'s')}`;
function chronicleStory(R){
  const who=S.profile?S.profile.name:'The Hunter',out=[];
  const hrs=R.mins>=60?`${Math.round(R.mins/60)} hours`:R.mins?`${R.mins} minutes`:'';
  if(!R.days)out.push(R.live?`${R.name} has only just begun. ${who} has not cleared a quest yet, and the System is watching.`:`${R.name} was quiet. ${who} did not clear a single quest, and the Gates went unanswered.`);
  else out.push(`${R.live?'So far in':'In'} ${R.name}, ${who} cleared ${nOf(R.days,'quest')}${R.reps?` and moved ${R.reps.toLocaleString('en-US')} reps`:''}${hrs?` across ${hrs} of training`:''}.`);
  if(R.lvFrom!==null&&R.lvTo!==null&&R.lvTo>R.lvFrom)out.push(`The System raised ${who} from Level ${R.lvFrom} to Level ${R.lvTo}${R.rankFrom!==R.rankTo?`, and the ${R.rankTo}-Rank trial fell`:''}.`);
  else if(R.rankFrom&&R.rankTo&&R.rankFrom!==R.rankTo)out.push(`The ${R.rankTo}-Rank trial fell.`);
  if(R.streak>=5)out.push(`The longest streak ran ${R.streak} days without a break.`);
  if(R.prs.length){const p=R.prs[0];out.push(`${nOf(R.prs.length,'record')} fell${R.prs.length>1?', the biggest':':'} ${p.best}${p.timed?' seconds':''} on ${dn(p.n).toLowerCase()}.`)}
  if(R.shadows.length)out.push(`${nOf(R.shadows.length,'shadow')} answered the call to ARISE${R.legend?`, among them ${R.legend.n}, ${SHADOW_BODY[R.legend.n].epithet.replace(/^The /,'the ')}`:''}.`);
  const war=[R.gates&&`${nOf(R.gates,'Gate')} fell`,R.exps.length&&`the shadows came back from ${nOf(R.exps.length,'expedition')}${R.exps.filter(x=>x.ok).length<R.exps.length?` (${R.exps.filter(x=>x.ok).length} won)`:''}`,
    R.chapters&&`${nOf(R.chapters,'story chapter')} ${R.chapters===1?'was':'were'} written`,R.raids&&`${nOf(R.raids,'boss raid')} ended in victory`].filter(Boolean);
  if(war.length)out.push(arCap(arList(war))+'.');
  if(R.kg){const d=Math.round((R.kg[1]-R.kg[0])*10)/10;out.push(d?`On the scale, ${R.kg[0]} became ${R.kg[1]} kg (${d>0?'+':''}${d}).`:`The scale held steady at ${R.kg[1]} kg.`)}
  else if(R.waist){const d=Math.round((R.waist[1]-R.waist[0])*10)/10;if(d)out.push(`The waist tape moved ${d>0?'+':''}${d} cm.`)}
  if(R.sleep)out.push(R.sleep<6.5?`Sleep averaged ${R.sleep} hours, too little for the work being asked.`:`Sleep averaged ${R.sleep} hours.`);
  if(R.missed||R.died)out.push(`${R.missed?`${nOf(R.missed,'day')} ${R.missed===1?'was':'were'} missed`:''}${R.missed&&R.died?', and ':''}${R.died?'death came, and the run began again':''}.`.replace(/^./,c=>c.toUpperCase()));
  out.push({S:'The System records this chapter as exceptional. The path ahead is open.',A:'A strong chapter. The System expects the next to be stronger.',
    B:'A solid chapter, with room to rise.',C:'Half the work was done. The other half is waiting.',D:'A thin chapter. The penalty zone is closer than it looks.',
    E:R.live?'The chapter is still unwritten. Make it worth reading.':'An empty chapter. Rise, or be left behind.'}[R.grade]);
  return out;
}

/* ---------- the card ---------- */
async function drawChronicle(canvas,R){
  await cardFonts();
  const ctx=canvas.getContext('2d'),W=1080,H=1350,name=(S.profile?S.profile.name:'Hunter').toUpperCase();
  canvas.width=W;canvas.height=H;
  ctx.fillStyle=C.paper;ctx.fillRect(0,0,W,H);ctx.strokeStyle=C.ink;ctx.lineWidth=6;ctx.strokeRect(M/2,M/2,W-M,H-M);
  ctx.fillStyle=C.ink;ctx.fillRect(M/2,M/2,W-M,118);
  ctx.fillStyle=C.paper;ctx.font=F.m(26);spaced(ctx,"HUNTER'S CHRONICLE",M+14,M/2+52,5);
  ctx.font=F.m(20);ctx.fillStyle=C.paper3;spaced(ctx,name,M+14,M/2+88,3);
  ctx.textAlign='right';ctx.font=F.m(24);ctx.fillStyle=C.paper;ctx.fillText(`CHAPTER ${R.chapter}`,W-M-14,M/2+52);
  ctx.font=F.m(20);ctx.fillStyle=C.paper3;ctx.fillText(`${R.name.toUpperCase()} ${R.year}${R.live?' · SO FAR':''}`,W-M-14,M/2+88);ctx.textAlign='left';
  // title
  let y=270;const tw=W-M*2-36;
  ctx.fillStyle=C.red;ctx.font=F.d(900,fitText(ctx,R.title.toUpperCase(),px=>F.d(900,px),tw,150));ctx.fillText(R.title.toUpperCase(),M+18,y);
  // numbers
  y=330;ctx.fillStyle=C.ink;ctx.fillRect(M/2,y,W-M,4);
  const nums=[['QUESTS',String(R.days)],['REPS',R.reps.toLocaleString('en-US')],['LEVEL',R.lvFrom!==null&&R.lvTo!==null&&R.lvTo!==R.lvFrom?`${R.lvFrom}→${R.lvTo}`:R.lvTo!==null?String(R.lvTo):'—'],['GRADE',R.grade]];
  const cw=(W-M*2-36)/nums.length;
  nums.forEach(([k,v],i)=>{const x=M+18+i*cw;ctx.fillStyle=i===3?C.red:C.ink;ctx.font=F.d(900,fitText(ctx,v,px=>F.d(900,px),cw-24,96));ctx.fillText(v,x,y+120);
    ctx.fillStyle=C.ink2;ctx.font=F.m(19);spaced(ctx,k,x,y+160,3);if(i){ctx.fillStyle=C.ink;ctx.fillRect(x-14,y+40,1.5,130)}});
  // the chapter
  y=540;ctx.fillStyle=C.ink;ctx.fillRect(M/2,y,W-M,2);
  ctx.fillStyle=C.ink2;ctx.font=F.m(20);spaced(ctx,'[ THE CHAPTER ]',M+18,y+50,4);
  let size=46;const text=R.story.join(' '),maxY=H-M/2-110; // as big as fits
  const lines=s=>{ctx.font=F.b(500,s);const out=[];let line='';text.split(' ').forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>tw){out.push(line);line=w}else line=t});if(line)out.push(line);return out};
  let L=lines(size);while(y+90+L.length*size*1.32>maxY&&size>24){size-=2;L=lines(size)}
  ctx.fillStyle=C.ink;ctx.font=F.b(500,size);L.forEach((l,i)=>ctx.fillText(l,M+18,y+100+i*size*1.32));
  ctx.fillStyle=C.red;ctx.textAlign='right';ctx.font=F.d(900,40);ctx.fillText('ARISE.',W-M-18,H-M/2-30);ctx.textAlign='left';
  ctx.fillStyle=C.ink3;ctx.font=F.m(18);spaced(ctx,'HUNTER SYSTEM',M+18,H-M/2-34,3);
}

/* ---------- screen ---------- */
let chronYm=null;
async function openChronicle(ym){
  chronYm=ym||ymAdd(ymOf(todayStr()),-1);
  const first=ymOf(S.startDate),cur=ymOf(todayStr());
  if(chronYm<first)chronYm=first;if(chronYm>cur)chronYm=cur;
  const R=monthReport(chronYm),L=$('chronicleLayer');
  L.innerHTML=`<div class="set-top"><h1 class="h1">Chronicle</h1><button class="icon-btn" data-act="chronicleClose" aria-label="Close">${ic('x')}</button></div>
    <div class="rep-nav"><button class="icon-btn" data-act="chronicleMonth" data-arg="-1" aria-label="Previous month" ${chronYm>first?'':'disabled'}>${ic('left')}</button>
      <span class="overline">Chapter ${R.chapter} · ${R.name} ${R.year}${R.live?' · so far':''}</span>
      <button class="icon-btn" data-act="chronicleMonth" data-arg="1" aria-label="Next month" ${chronYm<cur?'':'disabled'}>${ic('right')}</button></div>
    <div class="card-frame"><canvas id="chronicleCanvas" aria-label="Hunter's Chronicle card"></canvas></div>
    <div class="card-actions"><button class="btn" data-act="chronicleShare">Share</button><button class="btn ghost" data-act="chronicleSave">Save image</button></div>
    <article class="chron-text"><p class="overline">Chapter ${R.chapter}</p><h2 class="h2">${esc(R.title)}</h2>${R.story.map(p=>`<p>${esc(p)}</p>`).join('')}</article>`;
  if(L.hidden){L.hidden=false;L.classList.remove('show');void L.offsetWidth;L.classList.add('show');L.scrollTop=0}
  document.body.classList.add('locked');
  await drawChronicle($('chronicleCanvas'),R);
}
function closeChronicle(){$('chronicleLayer').hidden=true;document.body.classList.remove('locked');if(REVEALQ.length)setTimeout(()=>{if(revealIdle())nextReveal()},180)}
/* Present last month's chapter once, on the first visit of a new month, if anything happened in it. */
function maybeChronicle(){
  if(!S.profile)return;
  const last=ymAdd(ymOf(todayStr()),-1);
  if(S.chronicleSeen&&S.chronicleSeen>=last)return;
  S.chronicleSeen=last;save();
  const had=last>=ymOf(S.startDate)&&Object.keys(S.log).some(d=>ymOf(d)===last);
  if(had)setTimeout(()=>afterReveals(()=>openChronicle(last)),1100);
}
ACT.chronicle=ym=>openChronicle(ym||undefined);
ACT.chronicleClose=closeChronicle;
ACT.chronicleMonth=d=>openChronicle(ymAdd(chronYm,+d));
ACT.chronicleSave=async()=>{const b=await new Promise(r=>$('chronicleCanvas').toBlob(r,'image/png')),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=`hunter-chronicle-${chronYm}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Chapter saved')};
ACT.chronicleShare=async()=>{const b=await new Promise(r=>$('chronicleCanvas').toBlob(r,'image/png')),file=new File([b],'hunter-chronicle.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:"My Hunter's Chronicle"})}catch(e){}}else ACT.chronicleSave()};
