/* Hunter System: saved state, migration and progression math. */
const KEY='hunter_system_v1';
const DKEY='hunter_diet_v1';

function fresh(){return {
  created:Date.now(),startDate:todayStr(),
  exp:0,level:1,
  stats:{Strength:5,Speed:5,Agility:5,Mobility:5,Flexibility:5},
  ladders:Object.fromEntries(Object.keys(LADDERS).map(k=>[k,{step:0,streak:0}])),
  log:{},            // date -> {done:[ids], sets:{id:[reps]}, completed, penaltyDone, rested, exp}
  penaltyLevel:0,    // 0-5, at 5 = death
  penaltyReps:0,     // reps owed
  penaltyProgress:0, // reps logged toward the debt
  lastChecked:todayStr(),
  deaths:0,
  titles:[],
  rankTestsPassed:[],
  rankFails:{},      // rank -> date of last failed attempt
  streak:0,bestStreak:0,
  totalQuests:0,totalReps:0,
  weekDays:{},
  passes:{},         // monday (+'b', 'c', 'x') -> date a Rest Pass was used that week
  prs:{},            // exercise name -> {best, date}
  statPoints:0,      // unspent points from level-ups (3 per level)
  pointsInit:true,   // marks saves that already got back-dated points
  sudden:null,       // today's sudden quest, if any
  job:null,          // {path, date} after the S-rank job change
  inv:{keys:{E:0,D:0,C:0,B:0,A:0,S:0},box:0,potion:0,elixir:0,holy:0},
  elixirActive:false,// next quest gives 1.5x EXP
  feats:{},          // achievement id -> date unlocked
  shadows:[],        // [{ex, n, rank, best, timed, date, lvl}]
  dungeons:[],       // [{g, date, ok, secs}]
  dungeonRun:null,   // the gate in progress, survives reloads
  titleEquipped:null,
  suddenDone:0,
  weekSnaps:{},      // monday -> stats at the start of that week (weekly report)
  reportSeen:null,   // monday of the last weekly report shown
  huntInit:true,     // marks saves that already got retroactive feats and shadows
  army:{captain:null,vice:null}, // shadow ids (the move each shadow came from)
  trialRun:null,     // rank-up trial in progress
  login:{last:null,streak:0,shown:null}, // daily supply chest
  weapons:{},        // id -> {refine, date}
  weaponEquipped:null,
  events:null,       // story events: {anchor, runs:{n:{id, ch:[dates], raid, clears}}, seen, mission}
  skins:[],          // Arrow skins unlocked in story events
  gearSeen:[],       // Arrow's evolution pieces already announced (events.js)
  body:[],           // weight and measurements told to Arrow: [{d, kg, waist, chest, arm, thigh, fit}] (body.js)
  sleep:{},          // date -> hours slept the night before
  injuries:[],       // [{part, since, until, sev, asked, healed}]: pause the areas they load
  tree:{pts:0,got:[],reset:null}, // skill tree: points, perks learned, monday of the last free reset (tree.js)
  treeInit:true,     // marks saves that already got back-dated skill points
  expedition:null,   // shadows out on a Gate expedition: {g, squad, date, back, power} (expeditions.js)
  expeditions:[],    // finished expeditions: [{g, date, ok, n}]
  monthSnaps:{},     // 'YYYY-MM' -> {level, rank, stats, shadows} at the start of that month (chronicle.js)
  chronicleSeen:null,// last month whose chronicle was shown
  profile:null       // {name, haptics, theme, remindAt} once awakened
}}

/* Older saves are upgraded in place: any missing field gets its default. */
/* Total shadow XP needed to reach level L (Lv2 100, Lv3 300, Lv5 1000, Lv10 4500). */
const shadowXpAt=L=>50*L*(L-1);
function migrate(s){
  const legacy=s.pointsInit===undefined,legacyHunt=s.huntInit===undefined,legacyTree=s.treeInit===undefined;
  const f=fresh();
  Object.keys(f).forEach(k=>{if(s[k]===undefined)s[k]=f[k]});
  Object.keys(LADDERS).forEach(k=>{if(!s.ladders[k])s.ladders[k]={step:0,streak:0}});
  delete s.weeklyBonus;
  // saves from before stat points existed get the points their level already earned
  if(legacy){s.statPoints=Math.max(0,((s.level||1)-1)*3);s.pointsInit=true}
  // saves from before the skill tree get the skill points their level already earned
  if(legacyTree){s.tree={pts:Math.max(0,(s.level||1)-1),got:[],reset:null};s.treeInit=true}
  // saves from before items/feats/shadows get them retroactively on next start
  if(legacyHunt){s.huntPending=true;s.huntInit=true}
  if(!s.inv.keys)s.inv.keys={E:0,D:0,C:0,B:0,A:0,S:0};
  // shadows from before shadow XP existed keep their level
  s.shadows.forEach((sh,i)=>{if(sh.xp===undefined)sh.xp=shadowXpAt(sh.lvl||1);if(!sh.no)sh.no=i+1;
    if(sh.n==='Fangs')sh.n=`Soldier ${String(sh.no).padStart(2,'0')}`}); // Fangs left the legends; that shadow serves on as a soldier
  if(!s.army.captain&&s.shadows.length)s.army.captain=s.shadows[0].ex;
  return s;
}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==='object')return migrate(s)}catch(e){}return fresh()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
let S=load();

/* Diet data lives in its own key so diet edits can never touch game progress. */
function dietState(){
  let d;
  try{d=JSON.parse(localStorage.getItem(DKEY))}catch(e){}
  if(!d||typeof d!=='object')d={};
  if(typeof d.weight!=='number')d.weight=63;
  if(!DIET_TYPES[d.type])d.type='nonveg';
  delete d.eaten; // food logging was removed; drop any old log data
  if(!d.grocery||!Array.isArray(d.grocery.ids))d.grocery={ids:[],checked:{}};
  if(!d.grocery.checked)d.grocery.checked={};
  return d;
}
function saveDietState(d){
  try{localStorage.setItem(DKEY,JSON.stringify(d))}catch(e){}
}

/* ---------- calendar ---------- */
function maxWeek(){return S.job?36:24}
function inJobPhase(){return !!S.job&&weekNumber()>24}
function weekNumber(){return Math.min(maxWeek(),Math.max(1,Math.floor(dayDiff(S.startDate,todayStr())/7)+1))}
function weekKey(){return 'w'+weekNumber()}
function notStarted(){return todayStr()<S.startDate}

/* ---------- progression ---------- */
function expForLevel(l){return 140+(l-1)*45}
function levelFromExp(){let l=1,e=S.exp;while(e>=expForLevel(l)){e-=expForLevel(l);l++;if(l>60)break}return {level:l,into:e,need:expForLevel(l)}}
/* Recompute level from EXP. Each level gained grants 3 stat points and 1 skill point. Returns levels gained. */
const POINTS_PER_LEVEL=3;
function syncLevel(){
  const before=S.level;S.level=levelFromExp().level;
  const up=Math.max(0,S.level-before);S.statPoints+=up*POINTS_PER_LEVEL;S.tree.pts+=up;return up;
}
function currentRank(){let r=RANKS[0];for(const x of RANKS)if(S.level>=x.lv&&(x.lv===0||S.rankTestsPassed.includes(x.r)))r=x;return r}
function nextRank(){const c=currentRank();const i=RANKS.findIndex(x=>x.r===c.r);return RANKS[i+1]||null}

/* ---------- the program ----------
   Moves unlock by level, but a rank caps your level until its trial is passed,
   so passing a trial is what opens the next rank's moves. */
function effLevel(){const nr=nextRank();return Math.min(S.level,nr?nr.lv-1:99)}
/* The current move of a chain: the hardest one unlocked. */
function chainMove(a,c,lv=effLevel()){let m=null;CHAINS[a][c][1].forEach(x=>{if(x[1]<=lv)m=x});return m&&m[0]}
/* Moves that unlock when the capped level rises from a to b. */
function newMoves(a,b){return Object.keys(MOVES).filter(n=>MOVES[n].lv>a&&MOVES[n].lv<=b)}
const isTimed=n=>/secs|sec on|secs on/.test(n);
const moveId=n=>'m-'+n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
/* The best set of this move in its last session before today. Older saves logged sets by area,
   so with no history yet the record (a little under it) stands in. */
function lastBest(n){
  const id=moveId(n),today=todayStr();let d=null;
  for(const k in S.log)if(k<today&&S.log[k].sets&&S.log[k].sets[id]&&(!d||k>d))d=k;
  if(d)return Math.max(...S.log[d].sets[id]);
  const pr=S.prs[n];return pr?Math.round(pr.best*.85):0;
}
/* Today's target: one rep (or 3 s) past last time, from the move's start up to its cap. */
function moveGoal(n){
  const M=MOVES[n],t=isTimed(n),base=M?M.base:10,last=lastBest(n);
  const cap=t?base*2:base+8;
  return Math.max(t?10:3,Math.min(cap,last?last+(t?3:1):base));
}
/* An area's headline move and target, for story missions and raids. */
function targetFor(key){
  const name=chainMove(key,0)||LADDERS[key].steps[0][0],t=moveGoal(name);
  return {name,goal:t,sets:3,target:t,graduate:t,timed:isTimed(name)};
}
/* n moves for one block. Strength areas take the current move of n chains: the area's main chain
   (push-ups, rows, squats...) always, the others in rotation when there are more than n.
   Mobility and flexibility rotate through every move unlocked. */
function pickMoves(a,n,seed){
  const lv=effLevel(),day=dayDiff('2024-01-01',todayStr())+seed;
  if(AREAS[a].pool){
    const all=CHAINS[a].flatMap(c=>c[1]).filter(m=>m[1]<=lv).map(m=>m[0]);
    return all.map((m,i)=>all[(i+day)%all.length]).slice(0,Math.min(n,all.length));
  }
  const cur=CHAINS[a].map((c,i)=>[i,chainMove(a,i,lv)]).filter(x=>x[1]);
  if(cur.length<=n)return cur.map(x=>x[1]);
  const head=cur[0][0]===0?[cur[0]]:[],rest=cur.slice(head.length),off=day%rest.length;
  return [...head,...[...rest.slice(off),...rest.slice(0,off)].slice(0,n-head.length)].sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
}
function dayBlocks(sp){return sp.blocks||sp.quests.map((k,i)=>[k,i?2:3])}
/* Today's plan, fixed once made so a level-up or rank-up never changes it mid-day.
   A day begun before blocks existed keeps one move per area under the area's key. */
function planToday(){
  const rec=todayRec();if(rec.plan)return rec.plan;
  const sp=todaysSplit(),legacy=sp.quests.some(k=>rec.done.includes(k)||rec.sets[k]);
  rec.plan=legacy?sp.quests.map(k=>({id:k,a:k,n:chainMove(k,0)||LADDERS[k].steps[0][0],b:0}))
    :dayBlocks(sp).flatMap(([a,n],b)=>pickMoves(a,n,b*3).map(m=>({id:moveId(m),a,n:m,b})));
  return rec.plan;
}
/* Swap a move for the one before it in its chain (or back), for today only, before any set is logged. */
function swapMove(id){
  const rec=todayRec(),p=(rec.plan||[]).find(x=>x.id===id);
  if(!p||rec.sets[id]||rec.done.includes(id))return false;
  if(p.orig){p.n=p.orig;delete p.orig}
  else{const M=MOVES[p.n],prev=M&&CHAINS[M.a][M.c][1][M.i-1];if(!prev||AREAS[M.a].pool)return false;p.orig=p.n;p.n=prev[0]}
  p.id=moveId(p.n);save();return true;
}
function canEase(t){const M=MOVES[t.name];return !!(t.orig||M&&M.i>0&&!AREAS[M.a].pool)}
/* Challenger (tree.js): swap a move for the next one in its chain, for today only, before any set is logged. */
const nextInChain=n=>{const M=MOVES[n];return M&&!AREAS[M.a].pool?CHAINS[M.a][M.c][1][M.i+1]:null};
function canHarden(t){return perk('harder')&&!!nextInChain(t.name)}
function swapHarder(id){
  const rec=todayRec(),p=(rec.plan||[]).find(x=>x.id===id),nx=p&&nextInChain(p.n);
  if(!p||!nx||p.orig||!perk('harder')||rec.sets[id]||rec.done.includes(id))return false;
  p.orig=p.n;p.n=nx[0];p.id=moveId(p.n);save();return true;
}

/* ---------- today ---------- */
function todayRec(){const k=todayStr();if(!S.log[k])S.log[k]={done:[],completed:false,penaltyDone:false};const r=S.log[k];if(!r.sets)r.sets={};return r}
function todaysSplit(){
  const base=SPLIT[dayIndex()];
  if(!inJobPhase()||base.rest)return base;
  const J=JOBS[S.job.path],q=J.days[dayIndex()];
  return Object.assign({},base,{quests:q,blocks:q.map((k,i)=>[k,i?2:3]),type:(base.boss?'Boss Day: ':'')+q.map(k=>LADDERS[k].title).join(' + '),
    note:`${J.title} program, week ${weekNumber()-24} of 12. ${J.focus[weekNumber()-25]}`});
}
const dn=n=>n.replace(' (secs)','').replace('(secs on/off)','(on/off)');

function restFor(it){
  const more=perk('wind')?15:0; // Second Wind (tree.js)
  if(it.key==='mobility'||it.key==='flex')return REST.stretch+more;
  if(it.key==='core'&&!todaysSplit().boss)return REST.core+more;
  if(inJobPhase())return JOBS[S.job.path].rest+more;
  if(todaysSplit().boss&&it.stat==='Strength')return REST.boss+more;
  return REST.normal+more;
}

function buildQuestItems(){
  const sp=todaysSplit(),paused=pausedAreas(); // an injury rests the areas it would load (body.js)
  const items=[];
  if(!sp.rest)WARMUP.forEach((w,i)=>items.push({id:'w'+i,name:i===0&&paused.has('legs')?'March in place':w[0],amt:w[1]+' '+w[2],warm:true}));
  const add=(p,care)=>{
    const L=LADDERS[p.a],M=MOVES[p.n]||{};
    const sets=care?2:sp.rest?1:(sp.boss||inJobPhase()?4:3);
    const t=moveGoal(p.n),tg=sp.boss&&!care?Math.round(t*1.25):t;
    items.push({id:p.id,key:p.a,name:p.n,sets,amt:tg,timed:isTimed(p.n),stat:L.stat,family:L.title,cue:M.cue||'',block:p.b,orig:p.orig,
      fresh:!S.prs[p.n],care,note:care?'Injury care: gentle, no pain':(sp.boss&&L.stat==='Strength')?'Last set to your limit':''});
  };
  planToday().forEach(p=>{if(!paused.has(p.a))add(p)});
  // every area today is resting: a gentle mobility and stretching session instead
  if(paused.size&&!items.some(i=>!i.warm))['mobility','flex'].filter(a=>!paused.has(a)).forEach((a,b)=>pickMoves(a,2,90+b).forEach(n=>add({id:moveId(n),a,n,b:9+b},true)));
  return items;
}

/* Training days cleared in the calendar week (Mon-Sun) starting at monday. Rest Pass and recovery days don't count. */
function trainedInWeek(monday){
  let n=0;
  for(let i=0;i<7;i++){const d=addDays(monday,i),r=S.log[d];if(r&&r.completed&&!r.rested&&!SPLIT[dowOf(d)].rest)n++}
  return n;
}
/* Rest Pass: two per calendar week (Mon-Sun), for any reason, three with Spare Pass (tree.js),
   kept across deaths. S.passes[monday], [monday+'b'] and [monday+'c'] are the week's passes, and
   S.passes[monday+'x'] a one-off extra pass. Each day in EXTRA_PASS_DAYS gets one extra pass,
   usable that day only, on top of the weekly ones. If that day is missed with the pass unused,
   the day change (processMissedDays) uses it then instead of a penalty. */
const PASS_SLOTS=['','b','c'];
const EXTRA_PASS_DAYS=['2026-10-23','2026-10-30'];
const passesPerWeek=()=>perk('pass')?3:2;
const passesUsed=(m=mondayOf(todayStr()))=>PASS_SLOTS.filter(k=>S.passes[m+k]).length;
const extraPassLeft=()=>EXTRA_PASS_DAYS.includes(todayStr())&&!S.passes[mondayOf(todayStr())+'x'];
const passesLeft=()=>Math.max(0,passesPerWeek()-passesUsed())+(extraPassLeft()?1:0);
function passUsedThisWeek(){return passesLeft()<=0}
