/* Hunter System: the skill tree. Each perk has a short line for the tree (s) and a full one (d).
   Every level-up gives 1 skill point (S.tree.pts) on top of the 3 stat points. Points learn perks
   in three branches, top to bottom: each perk needs the one above it. Percent perks go through
   treeBonus(kind), which armyBonus (shadows.js) adds to the army's skills and the weapon; the rest
   are checked with perk(id) where they apply. The tree can be reset for free once a week.
   Like stats and levels, the tree is lost on death. */
const TREE=[
  {k:'body',n:'Body',icon:'shield',d:'Endure more, lose less',nodes:[
    {id:'wind',n:'Second Wind',s:'+15 s rest between sets',cost:1,d:'+15 seconds of rest between sets.'},
    {id:'will',n:'Iron Will',s:'−20% penalty reps',cost:2,d:'−20% penalty reps when you miss a day.',bonus:{penalty:20}},
    {id:'pass',n:'Spare Pass',s:'2 Rest Passes a week',cost:2,d:'A second Rest Pass every week.'},
    {id:'mend',n:'Fast Recovery',s:'Penalty drops every 2 clean days',cost:3,d:'Clean days lower your penalty level every 2 days instead of 3.'}]},
  {k:'growth',n:'Growth',icon:'zap',d:'Grow faster',nodes:[
    {id:'learn',n:'Quick Learner',s:'+5% EXP on every quest',cost:1,d:'+5% EXP on every quest.',bonus:{expAll:5}},
    {id:'drill',n:'Shadow Drill',s:'+25% shadow XP',cost:2,d:'Your shadows earn 25% more XP from training, quests, Gates and expeditions.'},
    {id:'surge',n:'Weekly Surge',s:'+50% weekly goal stats',cost:2,d:'Hitting the weekly goal gives 50% more stats and +20 EXP.'},
    {id:'luck',n:'Monarch\'s Luck',s:'+10% luck',cost:3,d:'+10% luck on Random Boxes, daily chests and expedition loot.',bonus:{luck:10}}]},
  {k:'mastery',n:'Mastery',icon:'sword',d:'Harder moves, bigger hunts',nodes:[
    {id:'harder',n:'Challenger',s:'Harder version of any move',cost:1,d:'A "Harder version" button on each move: try the next move in its chain today.'},
    {id:'boss',n:'Boss Hunter',s:'+15% boss day EXP',cost:2,d:'+15% EXP on boss days.',bonus:{expBoss:15}},
    {id:'gate',n:'Gate Runner',s:'+10% Gate EXP and time',cost:2,d:'+10% Gate EXP and +10% Gate time limit.',bonus:{gateExp:10,gateTime:10}},
    {id:'record',n:'Record Breaker',s:'+25 EXP per record',cost:3,d:'+25 EXP every time you set a new personal record.'}]}
];
const TREE_NODES=Object.fromEntries(TREE.flatMap(b=>b.nodes.map((x,i)=>[x.id,Object.assign({branch:b,tier:i},x)])));
const TREE_COST=TREE.reduce((a,b)=>a+b.nodes.reduce((x,n)=>x+n.cost,0),0);

/* ---------- model ---------- */
const treeGot=()=>(S.tree&&S.tree.got)||[];
const perk=id=>treeGot().includes(id);
function treeBonus(kind){return treeGot().reduce((a,id)=>a+((TREE_NODES[id]&&TREE_NODES[id].bonus||{})[kind]||0),0)}
/* Shadow XP multiplier from Shadow Drill. */
const shadowXpMult=()=>perk('drill')?1.25:1;
/* Why a perk can't be learned yet, or '' if it can. */
function treeBlock(id){
  const x=TREE_NODES[id];if(!x)return 'Unknown skill';
  if(perk(id))return 'Learned';
  const prev=x.branch.nodes[x.tier-1];
  if(prev&&!perk(prev.id))return `Learn ${prev.n} first`;
  if(S.tree.pts<x.cost)return `Needs ${x.cost} skill point${x.cost>1?'s':''} (you have ${S.tree.pts})`;
  return '';
}
function learnPerk(id){
  if(treeBlock(id))return false;
  S.tree.pts-=TREE_NODES[id].cost;S.tree.got=[...treeGot(),id];save();
  return true;
}
/* The next perk worth saving for: the cheapest one you could learn next in any branch. */
function treeNext(){
  return TREE.map(b=>b.nodes.find(x=>!perk(x.id))).filter(Boolean).sort((a,b)=>a.cost-b.cost)[0]||null;
}
const treeResetFree=()=>S.tree.reset!==mondayOf(todayStr());
function resetTree(){
  if(!treeGot().length||!treeResetFree())return false;
  S.tree.pts+=treeGot().reduce((a,id)=>a+TREE_NODES[id].cost,0);S.tree.got=[];S.tree.reset=mondayOf(todayStr());save();
  return true;
}

/* ---------- screen ---------- */
function openTree(){
  const L=$('treeLayer');
  if(L.hidden){L.hidden=false;L.classList.remove('show');void L.offsetWidth;L.classList.add('show');L.scrollTop=0}
  document.body.classList.add('locked');
  renderTree();
}
function renderTree(){
  const L=$('treeLayer'),pts=S.tree.pts,got=treeGot();
  L.innerHTML=`<div class="set-top"><h1 class="h1">Skill tree</h1><button class="icon-btn" data-act="treeClose" aria-label="Close">${ic('x')}</button></div>
    <div class="tree-head"><div><p class="overline">Skill points</p><p class="tree-pts">${pts}</p></div>
      <p class="muted small grow">You get 1 skill point every level, on top of your stat points. Learn a branch from the top down. ${got.length?`${got.length} of ${Object.keys(TREE_NODES).length} learned.`:''}</p></div>
    <div class="tree">${TREE.map(b=>`<section class="tr-br" aria-label="${esc(b.n)} branch"><header>${ic(b.icon)}<b>${esc(b.n)}</b><span>${esc(b.d)}</span></header>
      ${b.nodes.map((x,i)=>{const own=perk(x.id),open=!own&&(!i||perk(b.nodes[i-1].id)),afford=open&&pts>=x.cost;
        return `<button class="tr-node${own?' got':open?' open':' locked'}${afford?' afford':''}" data-act="treeNode" data-arg="${x.id}" aria-label="${esc(x.n)}, ${own?'learned':`${x.cost} point${x.cost>1?'s':''}${open?'':', locked'}`}">
          <span class="tr-cost">${own?ic('check'):open?x.cost:ic('lock')}</span><b>${esc(x.n)}</b><span class="tr-d">${esc(x.s)}</span></button>`}).join('<i class="tr-link" aria-hidden="true"></i>')}</section>`).join('')}</div>
    <p class="faint small tree-foot">${got.length?(treeResetFree()?`<button class="btn sm ghost" data-act="treeReset">Reset the tree</button> Free once a week. All points come back.`:`Reset used this week. Next free reset ${fmtDate(addDays(mondayOf(todayStr()),7))}.`):`Every perk together costs ${TREE_COST} points.`}</p>`;
}
function closeTree(){$('treeLayer').hidden=true;document.body.classList.remove('locked');renderAll();if(REVEALQ.length)setTimeout(()=>{if(revealIdle())nextReveal()},180)}
ACT.tree=openTree;
ACT.treeClose=closeTree;
ACT.treeNode=id=>{
  const x=TREE_NODES[id];if(!x)return;const why=treeBlock(id);buzz('tap');
  openModal(`<div class="m-stamp">${esc(x.branch.n)} · tier ${x.tier+1}</div><p class="h2">${esc(x.n)}</p><p class="m-text">${esc(x.d)}</p>
    <p class="m-text dim">${perk(id)?'Learned. It is always active.':`Cost: ${x.cost} skill point${x.cost>1?'s':''}. You have ${S.tree.pts}.`}</p>
    <div class="m-btns">${perk(id)?'':why?`<button class="btn" disabled>${esc(why)}</button>`:`<button class="btn" data-act="treeLearn" data-arg="${id}">Learn ${esc(x.n)}</button>`}
      <button class="btn ghost" data-act="closeModal">Close</button></div>`,'sys',x.branch.icon);
};
ACT.treeLearn=id=>{if(!learnPerk(id))return;closeModal();buzz('level');toast(`${TREE_NODES[id].n} learned`);renderTree();checkFeats()};
ACT.treeReset=()=>openModal(`<div class="m-stamp">Reset the skill tree?</div><p class="m-text">Every perk is unlearned and all ${treeGot().reduce((a,id)=>a+TREE_NODES[id].cost,0)} points come back. You can do this once a week.</p>
  <div class="m-btns"><button class="btn" data-act="treeResetOk">Reset</button><button class="btn ghost" data-act="closeModal">Keep my perks</button></div>`,'sys','undo');
ACT.treeResetOk=()=>{if(resetTree()){closeModal();buzz('done');toast('Skill tree reset');renderTree()}};
