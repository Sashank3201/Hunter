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
  profile:null       // {name, haptics} once awakened
}}

/* Older saves are upgraded in place: any missing field gets its default. */
function migrate(s){
  const f=fresh();
  Object.keys(f).forEach(k=>{if(s[k]===undefined)s[k]=f[k]});
  Object.keys(LADDERS).forEach(k=>{if(!s.ladders[k])s.ladders[k]={step:0,streak:0}});
  delete s.weeklyBonus;
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
  if(!d.eaten||typeof d.eaten!=='object')d.eaten={};
  return d;
}
function saveDietState(d){
  // keep two weeks of plate history at most
  const cut=addDays(todayStr(),-14);
  Object.keys(d.eaten).forEach(k=>{if(k<cut)delete d.eaten[k]});
  try{localStorage.setItem(DKEY,JSON.stringify(d))}catch(e){}
}

/* ---------- calendar ---------- */
function weekNumber(){return Math.min(24,Math.max(1,Math.floor(dayDiff(S.startDate,todayStr())/7)+1))}
function weekKey(){return 'w'+weekNumber()}
function notStarted(){return todayStr()<S.startDate}

/* ---------- progression ---------- */
function expForLevel(l){return 140+(l-1)*45}
function levelFromExp(){let l=1,e=S.exp;while(e>=expForLevel(l)){e-=expForLevel(l);l++;if(l>60)break}return {level:l,into:e,need:expForLevel(l)}}
function currentRank(){let r=RANKS[0];for(const x of RANKS)if(S.level>=x.lv&&(x.lv===0||S.rankTestsPassed.includes(x.r)))r=x;return r}
function nextRank(){const c=currentRank();const i=RANKS.findIndex(x=>x.r===c.r);return RANKS[i+1]||null}

/* Target reps scale with the week so you improve every week even without a ladder step. */
function targetFor(key){
  const L=LADDERS[key],st=L.steps[Math.min(S.ladders[key].step,L.steps.length-1)];
  const base=st[1],w=weekNumber();
  const bonus=Math.min(6,Math.floor((w-1)/2)); // grows slowly then plateaus until step up
  const isTimed=/secs|sec on|secs on/.test(st[0]);
  const val=isTimed?base+bonus*3:base+bonus;
  return {name:st[0],goal:base,sets:3,target:Math.max(3,Math.round(val*0.7)),graduate:base,timed:isTimed};
}

/* ---------- today ---------- */
function todayRec(){const k=todayStr();if(!S.log[k])S.log[k]={done:[],completed:false,penaltyDone:false};const r=S.log[k];if(!r.sets)r.sets={};return r}
function todaysSplit(){return SPLIT[dayIndex()]}
const dn=n=>n.replace(' (secs)','').replace('(secs on/off)','(on/off)');

function restFor(it){
  if(it.key==='mobility'||it.key==='flex')return REST.stretch;
  if(todaysSplit().boss&&it.stat==='Strength')return REST.boss;
  return REST.normal;
}

function buildQuestItems(){
  const sp=todaysSplit();
  const items=[];
  if(!sp.rest)WARMUP.forEach((w,i)=>items.push({id:'w'+i,name:w[0],amt:w[1]+' '+w[2],warm:true}));
  sp.quests.forEach(k=>{
    const L=LADDERS[k],t=targetFor(k);
    const sets=sp.rest?1:(sp.boss?4:3);
    const tg=sp.boss?Math.round(t.target*1.25):t.target;
    const st=L.steps[Math.min(S.ladders[k].step,L.steps.length-1)];
    items.push({id:k,key:k,name:t.name,sets,amt:tg,timed:t.timed,stat:L.stat,family:L.title,cue:st[2]||'',
      note:(sp.boss&&L.stat==='Strength')?'Last set to your limit':''});
  });
  return items;
}

/* Rest Pass: one per calendar week (Mon-Sun), kept across deaths. */
function passUsedThisWeek(){return !!S.passes[mondayOf(todayStr())]}
