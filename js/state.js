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
  passes:{},         // monday date -> date the weekly Rest Pass was used
  prs:{},            // exercise name -> {best, date}
  statPoints:0,      // unspent points from level-ups (3 per level)
  pointsInit:true,   // marks saves that already got back-dated points
  sudden:null,       // today's sudden quest, if any
  job:null,          // {path, date} after the S-rank job change
  profile:null       // {name, haptics, theme, remindAt} once awakened
}}

/* Older saves are upgraded in place: any missing field gets its default. */
function migrate(s){
  const legacy=s.pointsInit===undefined;
  const f=fresh();
  Object.keys(f).forEach(k=>{if(s[k]===undefined)s[k]=f[k]});
  Object.keys(LADDERS).forEach(k=>{if(!s.ladders[k])s.ladders[k]={step:0,streak:0}});
  delete s.weeklyBonus;
  // saves from before stat points existed get the points their level already earned
  if(legacy){s.statPoints=Math.max(0,((s.level||1)-1)*3);s.pointsInit=true}
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
/* Recompute level from EXP. Each level gained grants 3 stat points. Returns levels gained. */
const POINTS_PER_LEVEL=3;
function syncLevel(){
  const before=S.level;S.level=levelFromExp().level;
  const up=Math.max(0,S.level-before);S.statPoints+=up*POINTS_PER_LEVEL;return up;
}
function currentRank(){let r=RANKS[0];for(const x of RANKS)if(S.level>=x.lv&&(x.lv===0||S.rankTestsPassed.includes(x.r)))r=x;return r}
function nextRank(){const c=currentRank();const i=RANKS.findIndex(x=>x.r===c.r);return RANKS[i+1]||null}

/* Target reps scale with the week so you improve every week even without a ladder step. */
function targetFor(key){
  const L=LADDERS[key],st=L.steps[Math.min(S.ladders[key].step,L.steps.length-1)];
  const base=st[1],w=weekNumber();
  // grows slowly then plateaus until step up; the job phase keeps raising it
  const bonus=w>24?Math.min(12,6+Math.floor((w-24)/2)):Math.min(6,Math.floor((w-1)/2));
  const isTimed=/secs|sec on|secs on/.test(st[0]);
  const val=isTimed?base+bonus*3:base+bonus;
  return {name:st[0],goal:base,sets:3,target:Math.max(3,Math.round(val*0.7)),graduate:base,timed:isTimed};
}

/* ---------- today ---------- */
function todayRec(){const k=todayStr();if(!S.log[k])S.log[k]={done:[],completed:false,penaltyDone:false};const r=S.log[k];if(!r.sets)r.sets={};return r}
function todaysSplit(){
  const base=SPLIT[dayIndex()];
  if(!inJobPhase()||base.rest)return base;
  const J=JOBS[S.job.path],q=J.days[dayIndex()];
  return Object.assign({},base,{quests:q,type:(base.boss?'Boss Day: ':'')+q.map(k=>LADDERS[k].title).join(' + '),
    note:`${J.title} program, week ${weekNumber()-24} of 12. ${J.focus[weekNumber()-25]}`});
}
const dn=n=>n.replace(' (secs)','').replace('(secs on/off)','(on/off)');

function restFor(it){
  if(it.key==='mobility'||it.key==='flex')return REST.stretch;
  if(inJobPhase())return JOBS[S.job.path].rest;
  if(todaysSplit().boss&&it.stat==='Strength')return REST.boss;
  return REST.normal;
}

function buildQuestItems(){
  const sp=todaysSplit();
  const items=[];
  if(!sp.rest)WARMUP.forEach((w,i)=>items.push({id:'w'+i,name:w[0],amt:w[1]+' '+w[2],warm:true}));
  sp.quests.forEach(k=>{
    const L=LADDERS[k],t=targetFor(k);
    const sets=sp.rest?1:(sp.boss||inJobPhase()?4:3);
    const tg=sp.boss?Math.round(t.target*1.25):t.target;
    const st=L.steps[Math.min(S.ladders[k].step,L.steps.length-1)];
    items.push({id:k,key:k,name:t.name,sets,amt:tg,timed:t.timed,stat:L.stat,family:L.title,cue:st[2]||'',
      note:(sp.boss&&L.stat==='Strength')?'Last set to your limit':''});
  });
  return items;
}

/* Training days cleared in the calendar week (Mon-Sun) starting at monday. Rest Pass and recovery days don't count. */
function trainedInWeek(monday){
  let n=0;
  for(let i=0;i<7;i++){const d=addDays(monday,i),r=S.log[d];if(r&&r.completed&&!r.rested&&!SPLIT[dowOf(d)].rest)n++}
  return n;
}
/* Rest Pass: one per calendar week (Mon-Sun), kept across deaths. */
function passUsedThisWeek(){return !!S.passes[mondayOf(todayStr())]}
