/* Hunter System: the Hunter License, a rank card assessed from real progress.
   Drawn on a canvas so the same pixels show in the app and save or share as a PNG.
   The card is always printed on paper, whatever the app theme. */

/* ---------- assessment ----------
   Power blends everything the Player has actually done. The official rank comes
   only from rank tests; the assessed class is what the numbers say. */
const RANK_POWER={E:0,D:600,C:1500,B:3000,A:5000,S:8000};
const POWER_CLASSES=[[1200,'E'],[3500,'D'],[7000,'C'],[12000,'B'],[20000,'A'],[32000,'S'],[Infinity,'National']];
function hunterPower(){
  const statSum=STATS.reduce((a,x)=>a+S.stats[x],0);
  const days=Object.values(S.log).filter(r=>r.completed&&!r.rested).length;
  const prs=Object.keys(S.prs).length;
  const parts={
    level:S.level*120, stats:Math.round(statSum*12), rank:RANK_POWER[currentRank().r]||0,
    quests:S.totalQuests*15, streak:S.bestStreak*25, records:prs*30,
    volume:Math.round(S.totalReps*.4), job:S.job?2500:0,
    shadows:S.shadows.reduce((a,s)=>a+30+s.lvl*10,0), gates:S.dungeons.filter(d=>d.ok).reduce((a,d)=>a+150*(gi(d.g)+1),0),
    feats:Object.keys(S.feats).length*80, weapon:equippedWeapon()?weaponAtk(equippedWeapon())*8:0, deaths:-S.deaths*100
  };
  const total=Math.max(0,Object.values(parts).reduce((a,b)=>a+b,0));
  const cls=POWER_CLASSES.find(([t])=>total<t)[1];
  const next=POWER_CLASSES.find(([t])=>total<t)[0];
  return {total,cls,next,days,prs,statSum,parts};
}

/* Deterministic licence number and barcode from the Player's creation time and name. */
function hashStr(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
function licenceNo(){const h=hashStr(S.created+'|'+(S.profile?S.profile.name:''));return String(h%10000).padStart(4,'0')+'-'+String((h>>>14)%10000).padStart(4,'0')}

/* ---------- Hunter photo ----------
   A custom photo lives in its own key (as a small JPEG data URL); otherwise the default. */
const PHOTO_KEY='hunter_photo_v1',PHOTO_DEFAULT='img/hunter.jpg';
function hunterPhoto(){try{return localStorage.getItem(PHOTO_KEY)||PHOTO_DEFAULT}catch(e){return PHOTO_DEFAULT}}
function hasCustomPhoto(){try{return !!localStorage.getItem(PHOTO_KEY)}catch(e){return false}}
function loadImg(src){return new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src=src})}
/* Square-crop an uploaded image to 512px (biased up, where faces usually are) and store it. */
function setHunterPhoto(file){
  if(!file||!/^image\//.test(file.type))return;
  const url=URL.createObjectURL(file);
  loadImg(url).then(im=>{
    const s=Math.min(im.width,im.height),c=document.createElement('canvas');c.width=c.height=512;
    c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)*.3,s,s,0,0,512,512);
    try{localStorage.setItem(PHOTO_KEY,c.toDataURL('image/jpeg',.86));toast('Photo updated')}catch(e){toast('Could not save that photo')}
    URL.revokeObjectURL(url);renderAll();if(!$('menu').hidden)openMenu();
  }).catch(()=>{URL.revokeObjectURL(url);toast('Could not read that image')});
}
function resetHunterPhoto(){try{localStorage.removeItem(PHOTO_KEY)}catch(e){}renderAll();if(!$('menu').hidden)openMenu();toast('Photo reset')}
ACT.photoReset=resetHunterPhoto;
/* Draw img to cover a w x h box (like CSS object-fit: cover). */
function drawCover(ctx,img,x,y,w,h){const s=Math.max(w/img.width,h/img.height),sw=w/s,sh=h/s;ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h)}

/* ---------- drawing ---------- */
const CW=1080,CH=1440,M=54;
const C={paper:'#ECE7DD',paper2:'#E3DDD0',paper3:'#D6CFBF',ink:'#121110',ink2:'#55514A',ink3:'#8C867B',red:'#D7261E'};
const F={d:(w,px)=>`${w} extra-condensed ${px}px Archivo, Impact, sans-serif`,b:(w,px)=>`${w} ${px}px Archivo, Arial, sans-serif`,m:(px)=>`500 ${px}px "Plex Mono", monospace`};
async function cardFonts(){
  try{await Promise.all([document.fonts.load(F.d(900,100)),document.fonts.load(F.b(700,40)),document.fonts.load(F.m(24))])}catch(e){}
}
function fitText(ctx,text,font,max,start){let px=start;do{ctx.font=font(px);if(ctx.measureText(text).width<=max)break;px-=4}while(px>20);return px}
function spaced(ctx,text,x,y,track){ // letter-spaced mono labels
  for(const ch of text){ctx.fillText(ch,x,y);x+=ctx.measureText(ch).width+track}return x;
}

async function drawCard(canvas){
  await cardFonts();
  const ctx=canvas.getContext('2d'),P=hunterPower(),rk=currentRank(),lv=levelFromExp();
  const name=(S.profile?S.profile.name:'Hunter').toUpperCase();
  canvas.width=CW;canvas.height=CH;
  ctx.textBaseline='alphabetic';
  // paper + frame
  ctx.fillStyle=C.paper;ctx.fillRect(0,0,CW,CH);
  ctx.strokeStyle=C.ink;ctx.lineWidth=6;ctx.strokeRect(M/2,M/2,CW-M,CH-M);

  // header band
  ctx.fillStyle=C.ink;ctx.fillRect(M/2,M/2,CW-M,118);
  ctx.fillStyle=C.paper;ctx.font=F.m(26);spaced(ctx,'HUNTER ASSOCIATION',M+14,M/2+52,4);
  ctx.font=F.m(20);ctx.fillStyle=C.paper3;spaced(ctx,'SYSTEM-ISSUED PLAYER LICENCE',M+14,M/2+88,3);
  ctx.font=F.m(26);ctx.fillStyle=C.paper;const no='Nº '+licenceNo();ctx.textAlign='right';ctx.fillText(no,CW-M-14,M/2+52);
  ctx.font=F.m(20);ctx.fillStyle=C.paper3;ctx.fillText('WEEK '+weekNumber()+' · LV '+S.level,CW-M-14,M/2+88);ctx.textAlign='left';

  // ID photo with red offset, official rank stamped on its corner
  const bx=M+18,by=196,bs=330;
  ctx.fillStyle=C.red;ctx.fillRect(bx+22,by+22,bs,bs);
  ctx.fillStyle=C.ink;ctx.fillRect(bx,by,bs,bs);
  const photo=await loadImg(hunterPhoto()).catch(()=>null);
  if(photo){drawCover(ctx,photo,bx,by,bs,bs);ctx.strokeStyle=C.ink;ctx.lineWidth=6;ctx.strokeRect(bx+3,by+3,bs-6,bs-6)}
  else{ctx.fillStyle=C.paper;ctx.textAlign='center';ctx.font=F.d(900,380);ctx.fillText(rk.r,bx+bs/2,by+bs-34);ctx.textAlign='left'}
  if(photo){const rb=124,rx=bx+bs-rb+34,ry=by+bs-rb+34;
    ctx.fillStyle=C.paper;ctx.fillRect(rx-6,ry-6,rb+12,rb+12);ctx.fillStyle=C.ink;ctx.fillRect(rx,ry,rb,rb);
    ctx.fillStyle=C.paper;ctx.textAlign='center';ctx.font=F.d(900,140);ctx.fillText(rk.r,rx+rb/2,ry+rb-14);ctx.textAlign='left'}
  ctx.fillStyle=C.ink2;ctx.font=F.m(20);spaced(ctx,photo?'HOLDER · OFFICIAL RANK':'OFFICIAL RANK',bx,by+bs+64,3);

  // identity column
  const ix=bx+bs+70,iw=CW-M-18-ix;
  ctx.fillStyle=C.ink2;ctx.font=F.m(22);const nameEnd=spaced(ctx,'NAME',ix,by+24,4);
  if(S.titleEquipped){ // equipped title rides on the NAME line, right-aligned
    const t='« '+S.titleEquipped.toUpperCase()+' »',right=CW-M-18;let px=22,tw;
    do{ctx.font=F.m(px);tw=[...t].reduce((a,ch)=>a+ctx.measureText(ch).width+3,-3);px-=2}while(tw>right-nameEnd-24&&px>12);
    ctx.fillStyle=C.red;spaced(ctx,t,right-tw,by+24,3);
  }
  ctx.fillStyle=C.ink;const np=fitText(ctx,name,px=>F.d(900,px),iw,150);ctx.font=F.d(900,np);ctx.fillText(name,ix,by+24+np*.86);
  let y=by+24+np*.86+52;
  const kv=(k,v,big)=>{ctx.fillStyle=C.ink2;ctx.font=F.m(20);spaced(ctx,k,ix,y,3);ctx.fillStyle=C.ink;ctx.font=F.d(800,big||44);ctx.fillText(v,ix,y+(big||44)*.95);y+=(big||44)+44};
  kv('RANK',`${rk.r} · ${rk.name.toUpperCase()}`);
  kv('JOB',S.job?JOBS[S.job.path].title.toUpperCase():'NONE · UNAWAKENED');
  kv('STREAK',`${S.streak} DAYS · BEST ${S.bestStreak}`);

  // assessed power
  y=640;ctx.fillStyle=C.ink;ctx.fillRect(M/2,y,CW-M,4);
  ctx.fillStyle=C.ink2;ctx.font=F.m(22);spaced(ctx,'ASSESSED POWER',M+18,y+50,4);
  ctx.fillStyle=C.ink;const pw=fitText(ctx,P.total.toLocaleString('en-US'),px=>F.d(900,px),CW-M*2-330,210);ctx.font=F.d(900,pw);ctx.fillText(P.total.toLocaleString('en-US'),M+12,y+236);
  // assessed class box
  const cx=CW-M-18-250,cy=y+38;
  ctx.strokeStyle=C.ink;ctx.lineWidth=4;ctx.strokeRect(cx,cy,250,232);
  ctx.fillStyle=C.ink2;ctx.font=F.m(20);spaced(ctx,'ASSESSED CLASS',cx+18,cy+38,3);
  ctx.fillStyle=C.red;ctx.textAlign='center';
  const clsTxt=P.cls==='National'?'NAT.':P.cls;ctx.font=F.d(900,P.cls==='National'?120:170);ctx.fillText(clsTxt,cx+125,cy+200);ctx.textAlign='left';
  ctx.fillStyle=C.ink2;ctx.font=F.m(20);
  const toNext=P.next===Infinity?'PEAK CLASS':`${(P.next-P.total).toLocaleString('en-US')} TO NEXT CLASS`;
  spaced(ctx,toNext,M+18,y+292,2);

  // stats
  y=990;ctx.fillStyle=C.ink;ctx.fillRect(M/2,y-48,CW-M,2);
  const smax=Math.max(20,Math.ceil(Math.max(...STATS.map(x=>S.stats[x]))/10)*10);
  const colW=(CW-M*2-36)/5;
  STATS.forEach((x,i)=>{
    const sx=M+18+i*colW,v=S.stats[x];
    ctx.fillStyle=C.ink;ctx.font=F.d(900,96);ctx.fillText(String(Math.floor(v)).padStart(2,'0'),sx,y+56);
    ctx.fillStyle=C.paper3;ctx.fillRect(sx,y+78,colW-28,10);
    ctx.fillStyle=i===STATS.indexOf(topStat())?C.red:C.ink;ctx.fillRect(sx,y+78,(colW-28)*Math.min(1,v/smax),10);
    ctx.fillStyle=C.ink2;ctx.font=F.m(20);spaced(ctx,x.slice(0,3).toUpperCase(),sx,y+122,3);
  });

  // record grid
  y=1158;ctx.fillStyle=C.ink;ctx.fillRect(M/2,y-28,CW-M,2);
  const recs=[[S.totalQuests,'QUESTS'],[P.days,'DAYS TRAINED'],[S.totalReps.toLocaleString('en-US'),'TOTAL REPS'],[S.shadows.length,'SHADOWS'],[S.deaths,'DEATHS']];
  const rw=(CW-M*2-36)/recs.length;
  recs.forEach(([v,l],i)=>{const rx=M+18+i*rw;
    ctx.fillStyle=C.ink;ctx.font=F.d(900,64);ctx.fillText(String(v),rx,y+50);
    ctx.fillStyle=C.ink2;ctx.font=F.m(17);spaced(ctx,l,rx,y+84,2);
    if(i)ctx.fillRect(rx-14,y-6,1.5,100);});

  // footer: barcode, titles, issue line
  y=CH-M/2-118;ctx.fillStyle=C.ink;ctx.fillRect(M/2,y-6,CW-M,2);
  let h=hashStr(name+S.created),bx2=M+18;
  for(let i=0;i<46;i++){h=Math.imul(h^(h>>>13),2654435761)>>>0;const w=1+(h%4);if(h&1){ctx.fillRect(bx2,y+20,w*2,70)}bx2+=w*2+2}
  ctx.font=F.m(19);ctx.fillStyle=C.ink2;
  const wq=equippedWeapon(),titles=wq?`ARMED · ${WEAPONS[wq].name.toUpperCase()}${refineOf(wq)?' +'+refineOf(wq):''}`:S.titles.length?S.titles.slice(-3).join(' · ').toUpperCase():'NO TITLES YET';
  ctx.textAlign='right';
  ctx.fillText(titles.length>44?titles.slice(0,43)+'…':titles,CW-M-18,y+42);
  ctx.fillText('ISSUED '+fmtDate(todayStr()).toUpperCase()+' · '+todayStr().slice(0,4),CW-M-18,y+72);
  ctx.fillStyle=C.red;ctx.font=F.d(900,34);ctx.fillText('ARISE.',CW-M-18,y+108);ctx.textAlign='left';

  // verification stamp
  ctx.save();ctx.translate(CW-200,604);ctx.rotate(-.16);
  ctx.strokeStyle=C.red;ctx.fillStyle=C.red;ctx.globalAlpha=.85;ctx.lineWidth=5;
  ctx.strokeRect(-130,-40,260,80);ctx.lineWidth=2;ctx.strokeRect(-121,-31,242,62);
  ctx.textAlign='center';ctx.font=F.d(900,46);ctx.fillText(S.rankTestsPassed.length?'VERIFIED':'PROVISIONAL',0,16);
  ctx.restore();
  return P;
}
function topStat(){return STATS.reduce((a,x)=>S.stats[x]>S.stats[a]?x:a,STATS[0])}

/* ---------- screen ---------- */
async function openCard(){
  const L=$('cardLayer');
  L.innerHTML=`<div class="set-top"><h1 class="h1">Licence</h1><button class="icon-btn" data-act="cardClose" aria-label="Close">${ic('x')}</button></div>
    <div class="card-frame"><canvas id="cardCanvas" aria-label="Your Hunter License card"></canvas></div>
    <div class="card-actions"><button class="btn" data-act="cardShare">Share card</button><button class="btn ghost" data-act="cardSave">Save image</button></div>
    <div id="cardBreak"></div>`;
  L.hidden=false;L.classList.remove('show');void L.offsetWidth;L.classList.add('show');L.scrollTop=0;
  document.body.classList.add('locked');
  const P=await drawCard($('cardCanvas'));
  const rows=[['Level',P.parts.level],['Stats',P.parts.stats],['Official rank',P.parts.rank],['Quests cleared',P.parts.quests],
    ['Best streak',P.parts.streak],['Personal records',P.parts.records],['Total reps',P.parts.volume],['Job',P.parts.job],
    ['Shadow army',P.parts.shadows],['Gates cleared',P.parts.gates],['Achievements',P.parts.feats],['Weapon',P.parts.weapon],['Deaths',P.parts.deaths]];
  $('cardBreak').innerHTML=`<div class="sec-label"><span class="overline">How your power is assessed</span><span class="small">${P.total.toLocaleString('en-US')} total</span></div>
    <div class="card tight"><ul class="list plain">${rows.filter(r=>r[1]).map(([k,v])=>`<li class="lrow" style="min-height:44px"><span class="grow t">${k}</span><span class="target">${v>0?'+':''}${v.toLocaleString('en-US')}</span></li>`).join('')}</ul></div>
    <p class="faint small" style="padding:14px 0 40px">Official rank only rises by passing rank tests. Assessed class is what your training numbers say, and it can run ahead of your rank.</p>`;
}
function closeCard(){$('cardLayer').hidden=true;document.body.classList.remove('locked')}
function cardBlob(){return new Promise(r=>$('cardCanvas').toBlob(r,'image/png'))}
ACT.card=openCard;
ACT.cardClose=closeCard;
ACT.cardSave=async()=>{
  const b=await cardBlob(),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=`hunter-license-${todayStr()}.png`;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Card saved');
};
ACT.cardShare=async()=>{
  const b=await cardBlob(),file=new File([b],'hunter-license.png',{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'My Hunter License'})}catch(e){}}
  else ACT.cardSave();
};
