/* Hunter System: items, inventory and the reward reveal queue.
   Rewards from several sources can land at once (quest, achievement, shadow),
   so reward notices go through reveal(): they show one after another instead
   of replacing each other. */

/* ---------- reveal queue ---------- */
const REVEALQ=[];
const revealIdle=()=>!$('modal').classList.contains('open')&&!ariseOpen()&&!wfxOpen()&&$('dungeon').hidden; // never over a raid
function reveal(html,tone,icon){REVEALQ.push([html,tone,icon]);if(revealIdle())nextReveal()}
/* Run fn (e.g. open a full-screen layer) once every queued notice has been seen. */
function afterReveals(fn){REVEALQ.push(fn);if(revealIdle())nextReveal()}
function nextReveal(){const n=REVEALQ.shift();if(!n)return;if(typeof n==='function')n();else openModal(...n)}

/* ---------- inventory ---------- */
function rankGrade(){return currentRank().r}
function keyCount(){return GRADES.reduce((a,g)=>a+S.inv.keys[g],0)}
function itemCount(){return keyCount()+S.inv.box+S.inv.potion+S.inv.elixir+S.inv.holy}
/* Add items. kind: 'key' (with grade) | 'box' | 'potion' | 'elixir' | 'holy'. Returns a label for reward lists. */
function grantItem(kind,n=1,grade){
  if(kind==='weapon')return grantWeapon(grade); // grade carries the weapon id
  if(kind==='key'){const g=grade||rankGrade();S.inv.keys[g]+=n;return `${n>1?n+'× ':''}${g}-grade Dungeon Key`}
  S.inv[kind]+=n;return `${n>1?n+'× ':''}${ITEMS[kind].name}`;
}
/* Item tile used in reward notices: pops in with a short stagger. */
function lootHTML(labels){
  return `<ul class="loot">${labels.map((l,i)=>{const kind=Object.keys(ITEMS).find(k=>l.includes(ITEMS[k].name))||'',wid=WEAPON_ORDER.find(id=>l.startsWith(WEAPONS[id].name));
    return `<li class="${wid?'loot-w':''}" style="animation-delay:${.25+i*.18}s${wid?`;--rc:${RARITY[WEAPONS[wid].rarity].c}`:''}"><span class="loot-ic">${ic(wid?'sword':kind?ITEMS[kind].icon:'zap')}</span><b>${esc(l)}</b>${wid?`<em>${RARITY[WEAPONS[wid].rarity].n}</em>`:''}</li>`}).join('')}</ul>`;
}

/* ---------- random box ----------
   40% EXP, 20% stat point, 15% potion, 10% elixir, 10% key, 5% holy water. */
function rollBox(){
  const r=Math.min(.999,Math.random()+armyBonus('luck')/100); // Greed's luck pushes rolls toward the rarer end
  if(r<.40){const x=30+Math.floor(Math.random()*6)*10;S.exp+=x;syncLevel();return `+${x} EXP`}
  if(r<.60){S.statPoints++;return '+1 stat point'}
  if(r<.75)return grantItem('potion');
  if(r<.85)return grantItem('elixir');
  if(r<.95)return grantItem('key');
  return grantItem('holy');
}
function openBox(){
  if(S.inv.box<=0)return;
  S.inv.box--;const got=rollBox();save();renderAll();buzz('level');
  openModal(`<div class="m-stamp">Random Box</div><div class="box-open">${ic('box')}</div>
    <p class="overline">You obtained</p>${lootHTML([got])}
    <div class="m-btns">${S.inv.box?`<button class="btn" data-act="openBox">Open another (${S.inv.box})</button>`:''}<button class="btn ${S.inv.box?'ghost':''}" data-act="closeModal">Continue</button></div>`,'sys','box');
}

/* ---------- using items ---------- */
function usePotion(){
  if(S.inv.potion<=0)return;
  if(S.penaltyLevel<=0&&S.penaltyReps<=0){toast('No penalty to heal');return}
  S.inv.potion--;
  if(S.penaltyLevel>0)S.penaltyLevel--;
  if(S.penaltyReps>0){const cut=Math.min(20,S.penaltyReps-S.penaltyProgress);S.penaltyReps-=cut;if(S.penaltyProgress>=S.penaltyReps){S.penaltyReps=0;S.penaltyProgress=0}}
  save();renderAll();buzz('done');
  openModal(`<div class="m-stamp">Healing Potion</div><div class="box-open heal">${ic('flask')}</div>
    <p class="m-text">Penalty level is now <b>${S.penaltyLevel} of 5</b>.${S.penaltyReps?` You owe ${S.penaltyReps-S.penaltyProgress} reps.`:' Your debt is cleared.'}</p>
    <button class="btn" data-act="closeModal">Continue</button>`,'sys','flask');
}
function useElixir(){
  if(S.inv.elixir<=0||S.elixirActive)return;
  S.inv.elixir--;S.elixirActive=true;save();renderAll();buzz('done');
  openModal(`<div class="m-stamp">Elixir of Growth</div><div class="box-open">${ic('elixir')}</div>
    <p class="m-text">Your body burns with energy. Your next daily quest gives <b>1.5× EXP</b>.</p>
    <button class="btn" data-act="closeModal">Continue</button>`,'sys','elixir');
}
/* Holy Water is passive: called by the engine when the Player would die. */
function holyWaterSaves(){
  if(S.inv.holy<=0)return false;
  S.inv.holy--;S.penaltyLevel=3;S.lastChecked=todayStr();save();
  reveal(`<div class="m-stamp">Revived</div><div class="box-open heal">${ic('drop')}</div>
    <p class="m-text">The <b>Holy Water of Life</b> was consumed. You survived at penalty level 3. Your run continues.</p>
    <button class="btn" data-act="closeModal">Rise</button>`,'red','drop');
  buzz('level');
  return true;
}
ACT.openBox=openBox;
ACT.usePotion=usePotion;
ACT.useElixir=useElixir;
ACT.itemInfo=k=>{const it=ITEMS[k];openModal(`<div class="m-stamp">${it.name}</div><div class="box-open">${ic(it.icon)}</div><p class="m-text">${it.desc}</p><button class="btn" data-act="closeModal">Close</button>`,'sys',it.icon)};

/* ---------- inventory view (Gates tab) ---------- */
function inventoryHTML(){
  const tiles=[];
  GRADES.forEach(g=>{if(S.inv.keys[g])tiles.push(`<button class="inv-tile" data-act="goGate" data-arg="${g}"><span class="inv-ic">${ic('key')}<i>${g}</i></span><b>${g}-grade key</b><span class="inv-n">×${S.inv.keys[g]}</span></button>`)});
  [['box','openBox','Open'],['potion','usePotion','Use'],['elixir','useElixir','Drink'],['holy','','Passive']].forEach(([k,act,verb])=>{
    if(!S.inv[k])return;const it=ITEMS[k],active=k==='elixir'&&S.elixirActive;
    tiles.push(`<div class="inv-tile${k==='holy'?' rare':''}"><button class="inv-ic" data-act="itemInfo" data-arg="${k}" aria-label="About ${it.name}">${ic(it.icon)}</button><b>${it.name}</b><span class="inv-n">×${S.inv[k]}</span>
      ${act?`<button class="fchip" data-act="${act}" ${active?'disabled':''}>${active?'Active':verb}</button>`:`<span class="fchip ghosted">${verb}</span>`}</div>`);
  });
  if(S.elixirActive&&!S.inv.elixir)tiles.push(`<div class="inv-tile"><span class="inv-ic">${ic('elixir')}</span><b>Elixir active</b><span class="inv-n">1.5× EXP</span></div>`);
  return tiles.length?`<div class="inv-grid">${tiles.join('')}</div>`
    :`<div class="card state-card" style="border-top:0"><div class="state-ic">${ic('box')}</div><div><p class="h3">Inventory empty</p><p class="muted small">Hit your weekly goal, clear boss days and earn achievements to collect keys and items.</p></div></div>`;
}
