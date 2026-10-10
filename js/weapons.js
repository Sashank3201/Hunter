/* Hunter System: weapons.
   Gate bosses drop weapons (see WEAPONS in data.js). The equipped weapon adds its
   effect to the shadow army's skills, its ATK to the Hunter License, and it is the
   blade you swing inside 3D Gates. Duplicates refine a weapon up to +5. */

/* ---------- model ---------- */
const weaponOf=id=>WEAPONS[id];
const ownedWeapon=id=>S.weapons[id];
const equippedWeapon=()=>S.weaponEquipped&&S.weapons[S.weaponEquipped]?S.weaponEquipped:null;
const refineOf=id=>(S.weapons[id]||{}).refine||0;
function weaponAtk(id){return Math.round(weaponOf(id).atk*(1+.1*refineOf(id)))}
/* Effects with the refine bonus applied (+20% per level). */
function weaponFx(id){const k=1+.2*refineOf(id);return weaponOf(id).fx.map(f=>({kind:f.kind,v:Math.round(f.v*k*10)/10}))}
const FX_TEXT={expAll:v=>`+${v}% EXP on every quest`,expPush:v=>`+${v}% EXP on push days`,expBoss:v=>`+${v}% EXP on boss days`,gateExp:v=>`+${v}% Gate EXP`,
  gateTime:v=>`+${v}% Gate time limit`,penalty:v=>`−${v}% penalty reps`,luck:v=>`+${v}% luck on boxes and chests`};
const fxText=f=>(FX_TEXT[f.kind]||(v=>`+${v}% ${f.kind.slice(5).replace(',',' and ')} gains`))(f.v);
/* The equipped weapon's bonus for one effect kind, in percent. */
function weaponBonus(kind){
  const id=equippedWeapon();if(!id)return 0;const st=kind.startsWith('stat:')?kind.slice(5):null;
  return weaponFx(id).reduce((a,f)=>a+(f.kind===kind||(st&&f.kind.startsWith('stat:')&&f.kind.slice(5).split(',').includes(st))?f.v:0),0);
}

/* Give a weapon: new, or a refine if already owned. Returns a label for reward lists. */
function grantWeapon(id,quiet){
  const w=weaponOf(id);if(!w)return '';
  const had=S.weapons[id];let label;
  if(!had){S.weapons[id]={refine:0,date:todayStr()};if(!equippedWeapon())S.weaponEquipped=id;label=w.name}
  else if(had.refine<WEAPON_MAX_REFINE){had.refine++;label=`${w.name} +${had.refine}`}
  else{S.exp+=50;syncLevel();label=`${w.name} (max) → +50 EXP`}
  save();
  if(!quiet&&!window.__NO_WEAPON_FX)afterReveals(()=>weaponReveal(id,!had)); // __NO_WEAPON_FX: test hook
  return label;
}
function equipWeapon(id){if(!S.weapons[id])return;S.weaponEquipped=id;save();renderAll()}

/* Saves from before weapons: the starter dagger for anyone past their first quest. */
function armoryCatchUp(){
  if(S.armoryInit)return;S.armoryInit=true;save();
  if(S.feats['first-quest']&&!S.weapons.rusty)grantWeapon('rusty');
}

/* ---------- art: each blade drawn as SVG (blade up, hilt down) ---------- */
let wsvgN=0;
function bladeParts(L,uid){
  const g=`url(#wb${uid})`,e=L.edge,dk=L.dark;
  const grip=(y0,y1,w=10)=>`<rect x="${60-w/2}" y="${y0}" width="${w}" height="${y1-y0}" fill="${L.grip}"/>`+Array.from({length:Math.floor((y1-y0)/9)},(_,i)=>`<path d="M${60-w/2} ${y0+4+i*9}l${w} 5" stroke="${dk}" stroke-width="1.6" opacity=".7"/>`).join('');
  switch(L.shape){
    case 'rusty':return {blade:`<path d="M60 92 72 122 70 150 74 170 69 200 72 252H48l3-52-5-25 3-25-1-30z" fill="${g}"/><path d="M60 100V246" stroke="${dk}" stroke-width="1.5" opacity=".6"/><path d="M66 160l5 4M52 210l-4 3M68 228l4-2" stroke="${dk}" stroke-width="2"/>`,
      hilt:`<rect x="36" y="250" width="48" height="11" rx="2" fill="${dk}"/>${grip(261,318)}<circle cx="60" cy="327" r="9" fill="${dk}"/>`};
    case 'straight':return {blade:`<path d="M60 40 73 70V252H47V70z" fill="${g}"/><path d="M60 76V244" stroke="${dk}" stroke-width="2.4" opacity=".55"/>`,
      hilt:`<path d="M24 250H96l-6 12H30z" fill="${dk}"/><circle cx="24" cy="256" r="4" fill="${dk}"/><circle cx="96" cy="256" r="4" fill="${dk}"/>${grip(262,320)}<path d="M60 318 70 330 60 344 50 330z" fill="${dk}"/>`};
    case 'fang':return {blade:`<path d="M66 34C94 92 86 186 74 252H47C52 188 52 116 66 34z" fill="${g}"/><path d="M68 60C80 110 76 190 66 246" stroke="${dk}" stroke-width="2" fill="none" opacity=".5"/>
      <circle cx="69" cy="44" r="3" fill="${L.edge}"/><path d="M70 50q3 8 0 11q-3-3 0-11z" fill="${L.edge}"/>`,
      hilt:`<path d="M30 250q30-10 60 0l-4 12q-26-8-52 0z" fill="${dk}"/>${grip(262,318,11)}<path d="M50 318h20l-4 18h-12z" fill="${dk}"/>`};
    case 'crystal':return {blade:`<path d="M60 14 80 68 67 128H53L40 68z" fill="${g}"/><path d="M60 14V128M40 68H80M60 14 53 128M60 14 67 128" stroke="${dk}" stroke-width="1.2" opacity=".55"/>
      <path d="M40 74 30 92 44 96zM80 74 90 92 76 96z" fill="${g}"/>`,
      hilt:`<rect x="56" y="126" width="8" height="226" fill="${L.grip}"/>${[150,200,250,300].map(y=>`<rect x="53" y="${y}" width="14" height="7" fill="${dk}"/>`).join('')}<path d="M54 352h12l-6 8z" fill="${dk}"/>`};
    case 'serrated':return {blade:`<path d="M60 40 76 74 70 88 77 102 70 116 77 130 70 144 77 158 70 172 74 252H46l1-90C46 120 50 80 60 40z" fill="${g}"/><path d="M58 70C55 120 54 190 55 246" stroke="${e}" stroke-width="1.6" opacity=".8" fill="none"/>`,
      hilt:`<path d="M28 248 60 256 92 248 86 264H34z" fill="${dk}"/>${grip(264,320)}<path d="M52 320h16l-8 16z" fill="${dk}"/>`};
    case 'demon':return {blade:`<path d="M60 4 76 40V248H44V40z" fill="${g}"/><path d="M60 46V240" stroke="${dk}" stroke-width="3" opacity=".6"/>
      <g fill="none" stroke="${e}" stroke-width="2" opacity=".9"><path d="M54 70h12M57 66v10M55 104l10 6M64 104l-9 6M54 140h12l-6 9zM56 176h8M60 172v12M55 208l5 7 5-7"/></g>`,
      hilt:`<path d="M20 238C34 236 46 244 60 248 74 244 86 236 100 238L92 262H28z" fill="${dk}"/><path d="M20 238 10 222 28 244zM100 238 110 222 92 244z" fill="${dk}"/>${grip(262,322,11)}<path d="M60 320 72 334 60 350 48 334z" fill="${dk}"/><circle cx="60" cy="334" r="3" fill="${e}"/>`};
    case 'dragon':{const one=`<path d="M60 40C71 76 73 140 71 236H49C47 140 49 76 60 40z" fill="${g}"/><path d="M60 52V228" stroke="${dk}" stroke-width="1.6" opacity=".55"/>
      ${[80,110,140,170,200].map(y=>`<path d="M52 ${y}q8 6 16 0" stroke="${dk}" stroke-width="1.4" fill="none" opacity=".55"/>`).join('')}
      <path d="M30 236q30-12 60 0l-6 12q-24-8-48 0z" fill="${dk}"/>${grip(248,300,10)}<circle cx="60" cy="306" r="7" fill="${dk}"/><circle cx="60" cy="306" r="3" fill="${e}"/>`;
      return {blade:`<g transform="rotate(-21 60 190)">${one}</g><g transform="rotate(21 60 190)">${one}</g>`,hilt:''}}
  }
  return {blade:'',hilt:''};
}
function weaponSVG(id,cls=''){
  const w=weaponOf(id),L=w.look,uid=++wsvgN,p=bladeParts(L,uid);
  return `<svg class="wsvg ${cls}" viewBox="0 0 120 360" aria-hidden="true"><defs>
      <linearGradient id="wb${uid}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${L.edge}"/><stop offset=".45" stop-color="${L.blade}"/><stop offset="1" stop-color="${L.dark}"/></linearGradient>
      <filter id="wg${uid}" x="-60%" y="-20%" width="220%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <g class="w-glow" filter="url(#wg${uid})">${p.blade}</g>${p.hilt}</svg>`;
}

/* ---------- Armory (Gates tab) ---------- */
function armoryHTML(){
  const owned=WEAPON_ORDER.filter(id=>S.weapons[id]).length,eq=equippedWeapon();
  let h=`<div class="sec-label"><span class="overline">Armory</span><span class="small">${owned}/${WEAPON_ORDER.length} weapons</span></div><div class="armory">`;
  h+=WEAPON_ORDER.map(id=>{const w=weaponOf(id),o=S.weapons[id],r=RARITY[w.rarity];
    return o?`<button class="wtile${eq===id?' eq':''}" style="--rc:${r.c}" data-act="weaponOpen" data-arg="${id}" aria-label="${esc(w.name)}">
        <span class="wt-art">${weaponSVG(id,'tilt')}</span>${eq===id?'<span class="wt-eq">Equipped</span>':''}
        <span class="wt-rar">${r.n}${o.refine?` · +${o.refine}`:''}</span><b class="wt-name">${esc(w.name)}</b><span class="wt-atk">ATK ${weaponAtk(id)}</span></button>`
      :`<div class="wtile locked" style="--rc:${r.c}"><span class="wt-art">${weaponSVG(id,'tilt')}</span><span class="wt-rar">${r.n}</span><b class="wt-name">???</b><span class="wt-atk">${esc(w.src)}</span></div>`}).join('');
  return h+'</div>';
}

/* ---------- weapon viewer ---------- */
let wvList=[],wvI=0;
function weaponCard(id){
  const w=weaponOf(id),r=RARITY[w.rarity],rf=refineOf(id),eq=equippedWeapon()===id;
  return `<article class="wcard r-${w.rarity}${eq?' eq':''}" style="--rc:${r.c};--gl:${w.look.glow}">
    <header class="wc-head"><span class="wc-rar">${r.n}</span><span>${w.type==='twin'?'Twin daggers':w.type[0].toUpperCase()+w.type.slice(1)}</span></header>
    <div class="wc-art"><svg class="sc-rune" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="78" class="d"/></svg>
      <span class="wc-spin">${weaponSVG(id,'big')}</span>${eq?'<span class="wc-eqtag">Equipped</span>':''}</div>
    <h2 class="wc-name">${esc(w.name)}${rf?` <em>+${rf}</em>`:''}</h2>
    <div class="wc-stats"><div><span>Attack</span><b>${weaponAtk(id)}</b></div><div><span>Refine</span><i class="wc-pips">${Array.from({length:WEAPON_MAX_REFINE},(_,k)=>`<i class="${k<rf?'on':''}"></i>`).join('')}</i></div></div>
    <ul class="wc-fx">${weaponFx(id).map(f=>`<li>${ic('zap')}${esc(fxText(f))}</li>`).join('')}</ul>
    <p class="wc-lore">“${esc(w.lore)}”</p>
    <footer class="wc-foot"><span>Source</span><span>${esc(w.src)}</span></footer>
    <div class="sc-holo"></div>
  </article>`;
}
function openWeapon(id){
  wvList=WEAPON_ORDER.filter(x=>S.weapons[x]);wvI=Math.max(0,wvList.indexOf(id));
  const L=$('weaponLayer');L.hidden=false;document.body.classList.add('locked');renderWeapon('summon');
}
function renderWeapon(anim,slash){
  const id=wvList[wvI];if(!id){closeWeapon();return}
  const n=wvList.length,eq=equippedWeapon()===id,L=$('weaponLayer');
  L.style.setProperty('--rc',RARITY[weaponOf(id).rarity].c);
  L.innerHTML=`<div class="set-top"><button class="icon-btn" data-act="weaponClose" aria-label="Back">${ic('x')}</button>
      <div class="sc-pager"><button class="icon-btn" data-act="weaponStep" data-arg="-1" aria-label="Previous weapon" ${n>1?'':'disabled'}>${ic('left')}</button>
      <span class="overline">${wvI+1} / ${n}</span><button class="icon-btn" data-act="weaponStep" data-arg="1" aria-label="Next weapon" ${n>1?'':'disabled'}>${ic('right')}</button></div></div>
    <div class="sc-stage"><div class="sc-wrap ${anim||''}${slash?' slam':''}">${weaponCard(id)}${slash?'<div class="w-slashfx"></div><div class="sc-stamp">Equipped</div>':''}</div></div>
    <div class="sc-acts">${eq?`<button class="btn ghost" disabled>Equipped</button>`:`<button class="btn" data-act="weaponEquip">Equip</button>`}</div>
    <p class="sc-note">The equipped weapon adds its effect to your army's skills, its attack to your Hunter License, and it is the blade you swing inside 3D Gates. Clear its Gate again for a chance to refine it (+1, up to +5).</p>`;
  if(slash)buzz('level');
  const stage=L.querySelector('.sc-stage');let sx=null;
  stage.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  stage.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>60)stepWeapon(dx<0?1:-1)},{passive:true});
}
function closeWeapon(){$('weaponLayer').hidden=true;document.body.classList.remove('locked');renderAll()}
function stepWeapon(d){if(wvList.length<2)return;wvI=(wvI+(+d)+wvList.length)%wvList.length;renderWeapon(+d>0?'from-r':'from-l');buzz('tap')}
ACT.weaponOpen=openWeapon;ACT.weaponClose=closeWeapon;ACT.weaponStep=stepWeapon;
ACT.weaponEquip=()=>{const id=wvList[wvI];equipWeapon(id);renderWeapon('',true);toast(`${weaponOf(id).name} equipped`)};

/* ---------- WEAPON OBTAINED ---------- */
let wfxId=null;
function weaponReveal(id,isNew){
  wfxId=id;const w=weaponOf(id),r=RARITY[w.rarity],rf=refineOf(id),a=$('weaponFx');
  a.style.setProperty('--rc',r.c);a.style.setProperty('--gl',w.look.glow);
  a.className='wfx r-'+w.rarity;
  a.innerHTML=`<div class="wfx-rays"></div><div class="wfx-ring"></div>
    <div class="wfx-sparks">${Array.from({length:16},(_,i)=>`<i style="--a:${i*22.5}deg;--d:${90+(i%4)*30}px"></i>`).join('')}</div>
    <p class="wfx-sub">${isNew?'Weapon obtained':`Weapon refined · +${rf}`}</p>
    <div class="wfx-art">${weaponSVG(id,'big')}</div><div class="wfx-slash"></div>
    <div class="wfx-info"><span class="wfx-rar">${r.n}</span><h2>${esc(w.name)}${rf?` +${rf}`:''}</h2>
      <p>ATK ${weaponAtk(id)} · ${weaponFx(id).map(fxText).map(esc).join(' · ')}</p></div>
    <div class="wfx-btns">${equippedWeapon()===id?`<button class="btn" data-act="wfxClose">Continue</button>`:`<button class="btn" data-act="wfxEquip">Equip</button><button class="btn quiet" data-act="wfxClose">Later</button>`}</div>`;
  a.hidden=false;a.classList.remove('go');void a.offsetWidth;a.classList.add('go');
  buzz('level');setTimeout(()=>buzz('done'),900);
}
function wfxClose(){const a=$('weaponFx');if(a.hidden)return;a.hidden=true;renderAll();if(REVEALQ.length)setTimeout(()=>{if(revealIdle())nextReveal()},180)}
const wfxOpen=()=>{const a=$('weaponFx');return a&&!a.hidden};
ACT.wfxClose=wfxClose;
ACT.wfxEquip=()=>{equipWeapon(wfxId);toast(`${weaponOf(wfxId).name} equipped`);wfxClose()};
