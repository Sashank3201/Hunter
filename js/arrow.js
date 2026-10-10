/* Hunter System: Arrow, the app's chat companion.
   Arrow reads each message with its trained language model (arrow-nlu.js + models/arrow-nlu.bin),
   works out what you meant (one of 50 intents) and answers as a sassy friend: food logging and
   nutrition, your Hunter progress, coaching, and running the app. It learns your phrasing when you
   correct it, learns your usual meals from your log, and lives as a floating orb on every tab. */

const ARROW_LABEL={log_food:'Log food',food_info:'Nutrition facts',undo:'Undo last',remove_item:'Remove a food',correction:'Fix calories',summary:'Today so far',
  targets:'My targets',set_goal:'Change goal',suggest_meal:'What to eat',repeat_meal:'Repeat a meal',skipped_meal:'Skipped a meal',dont_know:'Don\'t remember',
  kitchen_add:'Add to kitchen',kitchen_remove:'Remove from kitchen',kitchen_show:'My kitchen',kitchen_cook:'What can I cook',reset_log:'Reset today\'s log',
  clear_chat:'Clear chat',greet:'Hi',bye:'Bye',thanks:'Thanks',praise:'Compliment',insult:'Complaint',how_are_you:'How are you',who_are_you:'Who is Arrow',help:'Help',
  joke:'Joke',laugh:'Haha',affirm:'Yes',deny:'No',out_of_scope:'Something else',ask_streak:'My streak',ask_level:'Level and rank',ask_quest:'Today\'s quest',
  ask_records:'My records',ask_shadows:'My shadows',ask_next_rank:'Next rank-up',ask_stats:'My stats',ask_items:'Inventory',ask_week:'This week',
  exercise_howto:'Exercise form',motivate:'Motivation',recovery:'Rest and soreness',pain:'Pain or injury',coach_tip:'Training tips',open_tab:'Open a page',
  start_workout:'Start workout',open_license:'Hunter License',open_settings:'Settings',theme:'Theme'};

/* ---------- voice: a sassy friend ---------- */
const SAY={
  intro:['Hey, I\'m Arrow. I count your food, judge your snacks, know your Hunter stats and can run this app for you. English, Telugu or Hindi, I get it. So... what did you eat?'],
  greet:['Hey you. Fed yet?','Oh look who remembered I exist. Hi.','Hi! Tell me what you ate. Don\'t lie, I can tell.','Yo, Hunter. Report your meals.','Hello hello. What are we eating today?'],
  morning:['Morning, sunshine. Breakfast first, excuses later.','Good morning! Log breakfast before you forget, like you always do.','Morning, Hunter. Water, breakfast, then greatness.'],
  bye:['Bye! Don\'t eat anything weird without telling me.','Later. Drink water. I\'m serious.','See ya, Hunter. I\'ll be here. Watching. Lovingly.'],
  night:['Good night, Hunter. Today: {k} of {tk} kcal and {p} of {tp} g protein. Sleep builds muscle too, so go.','Night night. You hit {p} g protein today. Dream of paneer.'],
  thanks:['Anytime. It\'s literally my only job.','You\'re welcome. Tip your bot.','Aww. Don\'t make it weird.','Obviously. I\'m great.'],
  praise:['I know. But say it again.','Finally, some recognition around here.','Stop, I\'m blushing. I can\'t blush. I\'m a ball. But still.','Correct. I am amazing. Now drink water.'],
  insult:['Wow. Rude. I\'ll remember that when you\'re begging for protein ideas.','I\'m a ball with eyes and I\'m still doing better than your squat form.','Noted. Your feedback has been filed under "ignore".','Mean. Accurate? No. Mean? Yes.'],
  howAreYou:['Running on zero calories and pure sarcasm. You?','Thriving. Unlike your water intake.','Great! No legs, so no leg day for me. Must be nice, right?'],
  whoAreYou:['I\'m Arrow. I count your food, roast your snacks, know your streak and run this app. Basically your sassy little System.','Arrow. Food tracker, coach, stat nerd and your most honest friend. Nice to meet you, again.'],
  jokes:['Why did the push-up go to therapy? It had too many issues with pressure.','I told my legs we\'re training today. They filed a complaint.','My favourite exercise is a cross between a lunge and a crunch. It\'s called lunch.','Why don\'t eggs tell jokes? They\'d crack up. Anyway, eat 3 of them.','Rest day: when your muscles grow and your excuses take a holiday.','I\'d do a joke about protein but it would need more reps to land.','Biryani is just rice that went to the gym and came back with gains.','Squats: the only time it\'s okay to drop it like it\'s hot and cry.'],
  laugh:['Glad I amuse you. Now log your lunch.','I\'m hilarious, I know.','Ha. Ha. Okay, did you drink water though?','Laughing burns calories. Barely. Keep going.'],
  yesNone:['Yes to... what exactly?','Okay! I have no idea what we just agreed to.'],
  noNone:['Fine. No it is.','Okay okay, I\'ll back off.'],
  outOfScope:['That\'s above my pay grade. I do food, workouts and your Hunter stats.','I\'m a fitness bot, not Google. Ask me about protein.','No idea. But I know your streak. Want that instead?','Can\'t help there. I can help you eat better though. Wild idea.'],
  logged:['Logged.','Noted. I see everything.','Added. Your stomach and I are in sync.','Got it, chef.','Recorded, for science.'],
  protein:['{p} g protein? Look at you, being responsible.','Protein! Finally, something your muscles actually asked for.','{p} g protein. That\'s how hunters eat.'],
  junk:['Sugar spotted. I\'m not mad, just disappointed.','Junk food logged. Your shadows are side-eyeing you.','Bold choice. Logged. Judged.','Delicious? Probably. Optimal? Absolutely not.'],
  big:['{k} kcal in one go? Were you feeding an army?','{k} kcal. Honestly? Respect.'],
  silly:['That\'s... a lot. Either you\'re lying or I need to call someone. Logged anyway.','Suspicious amount. Logged, but I\'m watching you.'],
  water:['Water! The bare minimum, and I\'m still proud.','Hydration logged. Your kidneys say thanks.','Glug glug. Noted.'],
  proteinHit:['Protein target reached: {p} g. Muscles fed. Me: proud.','{p} g protein. Target smashed. Okay, show-off.'],
  allHit:['Every target hit today. Calories, protein, water. I\'m emotional.','Flawless day. Screenshot this before you ruin it.'],
  over:['You\'re at {pct}% of today\'s calories. Even a bulk has limits, champ.','{pct}% of your calories. Put the spoon down. Gently.'],
  undo:['Poof. Removed {list}. We never speak of it again.','Deleted {list}. Like it never happened.'],
  undoNone:['Nothing to undo today. Clean slate. Suspicious.'],
  removed:['Removed {q}. Bye bye.','{q} is gone. You\'re welcome.'],
  removeNone:['I can\'t find that in today\'s log. Did you even eat it?'],
  resetAsk:['Delete everything you logged today? No take-backs.'],
  resetDone:['Today\'s log is wiped. Fresh start.'],
  cleared:['Chat wiped. I forgot everything... except that doughnut. Your food log is safe.','Clean slate. Your food log is still there, relax.'],
  skipped:['Skipped a meal on a bulk? Who hurt you? Eat something with protein.','Nothing logged. Your muscles are filing a complaint.'],
  dontKnow:['Can\'t remember what you ate? Iconic. Describe it roughly, like "rice and some curry" or "a few rotis", and I\'ll estimate. A rough log beats no log.'],
  whatAte:['Okay, but what did you eat? Give me food words.','What was on the plate, Hunter? Foods, please.'],
  unknown:['Never heard of "{w}". Teach me: how many calories in {u}? Not sure? Leave it blank and I\'ll estimate.','"{w}"? New one. How many calories in {u}? Blank is fine, I\'ll guess.'],
  motivate:['You don\'t have to feel like it. You just have to start. Five minutes. Go.','The Shadow Monarch didn\'t get strong by skipping. Probably.','Lazy today? Fine. Do the warm-up. Just the warm-up. (It\'s a trap.)','Future you is watching. Don\'t embarrass them.','Motivation is a myth. Discipline is a habit. Get up.'],
  pain:['Pain isn\'t a challenge, it\'s a stop sign. Stop that move. If it\'s sharp, swollen or still there in a couple of days, see a doctor or physio. I\'ll guard your streak, emotionally.',
    'Nope, we don\'t train through pain. Rest it, switch to an easier step, and get it checked if it doesn\'t settle. Muscles grow back, joints don\'t.'],
  clarify:['Not sure what you mean. Did you want to:','Hmm, my brain glitched. Is it one of these?'],
  wrong:['My bad. What did you mean?'],
  learned:['Got it. Next time I\'ll know.'],
  flavor:{te:['Super ra.','Keka.','Bagundi.'],hi:['Badhiya!','Shabaash.','Mast.']}
};
const arPick=a=>a[Math.floor(Math.random()*a.length)];
const arFill=(s,v)=>s.replace(/\{(\w+)\}/g,(_,k)=>v[k]!==undefined?v[k]:'');
const arSay=(k,v)=>arFill(arPick(SAY[k]),v||{});
/* Which language the Player is using, for a little local flavour. */
const AR_TE=new Set('tinna tinnanu nenu naaku ivala ninna ledu undi unnayi cheyyi chesa ra annam pappu perugu neellu emi enti ela entha vaddu avunu sare inka mariyu tho lo tarvata madhyanam rathri tiffin'.split(' '));
const AR_HI=new Set('khaya khayi khaye maine aaj kal nahi aur hai tha kya kaise kitna kitni karo mujhe mera meri bhai yaar chahiye paani doodh chawal dahi subah raat dopahar nashta'.split(' '));
function arLang(text){let te=0,hi=0;ArrowNLU.tokens(text).forEach(w=>{if(AR_TE.has(w))te++;if(AR_HI.has(w))hi++});return te>hi?'te':hi>te?'hi':'en'}
const arFlavor=(lang,s)=>lang!=='en'&&Math.random()<.4?arPick(SAY.flavor[lang])+' '+s:s;

/* ---------- memory: phrases the Player corrected, kept on this phone ---------- */
const ARROW_KEY='hunter_arrow_v1';
function arMem(){try{const m=JSON.parse(localStorage.getItem(ARROW_KEY));if(m&&typeof m==='object')return Object.assign({mem:[],nudgeAt:0},m)}catch(e){}return {mem:[],nudgeAt:0}}
function arMemSave(m){try{localStorage.setItem(ARROW_KEY,JSON.stringify(m))}catch(e){}}

/* ---------- the model ---------- */
const ArrowModel={m:null,lex:null,key:null,p:null};
function arrowLoad(){
  if(!ArrowModel.p)ArrowModel.p=fetch('models/arrow-nlu.bin').then(r=>r.ok?r.arrayBuffer():null).then(b=>{if(b)ArrowModel.m=ArrowNLU.load(b)}).catch(()=>{});
  return ArrowModel.p;
}
function arrowLex(ds){const k=Object.keys(ds.custom||{}).join('|');if(!ArrowModel.lex||ArrowModel.key!==k){ArrowModel.lex=ArrowNLU.appLexicon(ds.custom);ArrowModel.key=k}return ArrowModel.lex}
const arIds=(ds,text)=>[...new Set(ArrowNLU.featureIds(text,arrowLex(ds),ArrowModel.m?ArrowModel.m.B:16384,ArrowModel.m?ArrowModel.m.head.feat:null))];
function arJaccard(a,b){const B=new Set(b);let n=0;a.forEach(x=>{if(B.has(x))n++});return n/(a.length+b.length-n||1)}
/* Rough rules for the first second, before the model file has loaded. */
function arRules(low){
  const R=[[/^(undo|oops)\b/,'undo'],[/\bclear\b.*\bchat\b|\bchat\b.*\b(clear|delete|saaf)\b/,'clear_chat'],[/^(hi|hello|hey|yo|namaste)\b/,'greet'],[/\b(thanks|thank you|thx)\b/,'thanks'],
    [/^(lol|haha+|lmao)\b/,'laugh'],[/^(yes|yeah|ok|okay|sure|haan|avunu)\b/,'affirm'],[/^(no|nope|nah|vaddu|nahi)\b/,'deny'],[/\bhelp\b|what can you do/,'help'],
    [/\b(calories|protein|macros)\b.*\b(in|of)\b/,'food_info'],[/\bwhat should i eat\b|\bhungry\b/,'suggest_meal'],[/\bstreak\b/,'ask_streak'],[/\b(summary|so far|how am i doing)\b/,'summary'],
    [/\bstart\b.*\bworkout\b/,'start_workout'],[/\b(dark|light|night) mode\b/,'theme']];
  const m=R.find(([re])=>re.test(low));return m?m[1]:'log_food';
}
function arrowClassify(ds,text){
  const ids=arIds(ds,text),M=arMem();let best=null,bs=0;
  M.mem.forEach(e=>{const s=arJaccard(ids,e.f);if(s>bs){bs=s;best=e}});
  if(best&&bs>=.6)return {intent:best.i,p:.99,top:[],src:'memory'};
  if(ArrowModel.m){const r=ArrowNLU.predict(ArrowModel.m,text,arrowLex(ds));return {intent:r[0].intent,p:r[0].p,top:r.slice(0,5),src:'model'}}
  return {intent:arRules(text.toLowerCase()),p:.7,top:[],src:'rules'};
}
/* Remember that this phrasing means this intent (the Player told us). */
function arrowLearn(ds,text,intent){
  if(!text)return;const M=arMem(),f=arIds(ds,text);
  M.mem=M.mem.filter(e=>arJaccard(f,e.f)<.9);M.mem.push({f,i:intent,t:text.slice(0,120)});if(M.mem.length>300)M.mem=M.mem.slice(-300);arMemSave(M);
}

/* ---------- helpers ---------- */
const arMealOf=low=>(flTokens(low).find(t=>t.k==='meal')||{}).m||null;
const arList=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
function arSumLine(ds){const day=flDay(ds),T=foodTargets(ds),t=flTotals(day);return `Today: ${fmtK(t.k)} / ${fmtK(T.kcal)} kcal · protein ${Math.round(t.p)}/${T.p} g · water ${day.water}/${T.water}.`}
/* Usual meals, learned from the last 30 days: the same foods at the same meal at least twice. */
function arHabits(ds){
  const today=todayStr(),from=addDays(today,-30),cnt={};
  Object.entries(ds.food||{}).forEach(([d,day])=>{if(d===today||d<from)return;const by={};(day.items||[]).forEach(i=>{if(i.meal)(by[i.meal]=by[i.meal]||[]).push(i)});
    Object.entries(by).forEach(([m,its])=>{const sig=[...new Set(its.map(i=>i.n))].sort().join('+'),k=m+'|'+sig;
      if(!cnt[k])cnt[k]={m,sig,n:0,items:its,d};const c=cnt[k];c.n++;if(d>c.d){c.items=its;c.d=d}})});
  const out={};Object.values(cnt).forEach(c=>{if(c.n>=2&&(!out[c.m]||c.n>out[c.m].n))out[c.m]=c});return out;
}
const arCopy=its=>its.map(i=>{const c=Object.assign({},i);delete c.id;delete c.batch;delete c.t;return c});
/* Training-day timing for food advice. */
function arTiming(low){
  if(/\b(before|pre ?workout|pre-workout|mundu|pehle|pahle)\b/.test(low))return 'pre';
  if(/\b(after|post ?workout|post-workout|tarvata|taruvata|baad)\b/.test(low))return 'post';
  const h=flHour();if(h>=21||h<4)return 'late';
  if(todayRec().completed)return 'post';if(todaysSplit().rest)return 'rest';return 'normal';
}
/* Ingredients named in a kitchen message. */
const AR_KSTOP=new Set(('i we have has had got get bought buy at home in my the fridge kitchen pantry store from some is are there theres available add to stock stocked up on what can cook make using use '+
  'recipe recipes ideas right now ghar mein pe hai hain rakha le aaya aaya intlo inti lo undi unnayi konna tho emi vandali vandukovali kya banau se jo usse bana sakta hoon cheyochu vaatitho '+
  'remove delete out of no more finished over ran used up khatam ho gaya ayipoyindi ayipoyayi ledu nahi ab hatao teeseyi nunchi list groceries please pls bro yaar ra anna today aaj').split(' '));
function arIngredients(text){
  return text.toLowerCase().replace(/[^a-z\s,&+]/g,' ').split(FL_SPLIT).map(seg=>(seg||'').split(/\s+/).filter(w=>w&&!AR_KSTOP.has(w)&&!FL_FILL.has(w)&&!FL_COMMON.has(w)&&!(w in FL_NUM)).join(' ').trim()).filter(x=>x.length>1);
}
const arKey=n=>n.split(' ').map(flSing).join(' ');
/* Recipes you can make from what you have, best coverage first. */
function arCookable(ds,have){
  const ok=DIET_TYPES[ds.type].allow,m=mealNow(),hv=have.map(h=>arKey(h.toLowerCase()).split(' '));
  const match=name=>{const b=name.toLowerCase().replace(/\(.*?\)/g,' ').split(/[\s,/]+/).filter(Boolean);return hv.some(a=>a.every(x=>b.some(y=>flTokEq(x,y))))};
  return RECIPES.filter(r=>ok.includes(r.tag)).map(r=>{const key=r.ing.filter(i=>{const p=i.split('|');return p[3]!=='S'&&+p[0]!==0});
    const got=key.filter(i=>match(i.split('|')[2]));return {r,got:got.length,n:key.length||1,miss:key.filter(i=>!got.includes(i)).map(i=>i.split('|')[2].replace(/\s*\(.*?\)/g,''))}})
    .filter(x=>x.got>0).map(x=>Object.assign(x,{s:x.got+1.5*x.got/x.n+(x.r.meal===m?.3:0)+x.r.p/60}))
    .sort((a,b)=>b.s-a.s).filter((x,i,a)=>!a.slice(0,i).some(y=>y.r.n.split(' ')[0]===x.r.n.split(' ')[0])).slice(0,3); // more of what you have first, no near-duplicates
}
/* An exercise named in a message: an exact ladder step, or the Player's current step for a family. */
function arExercise(low){
  const toks=ArrowNLU.tokens(low);let best=null,bs=0;
  Object.entries(LADDERS).forEach(([k,L])=>L.steps.forEach((s,i)=>{const nt=ArrowNLU.tokens(s[0].replace(/\(.*?\)/g,''));const hit=nt.filter(w=>toks.some(t=>flTokEq(t,w))).length;
    const sc=hit/nt.length;if(hit&&sc>bs){bs=sc;best={k,i,name:s[0],cue:s[2]}}}));
  if(best&&bs>=.99)return best;
  const FAM=[[/push ?ups?|pushups?|dand|press ?ups?/,'push'],[/pull ?ups?|pullups?|chin ?ups?|\brows?\b/,'pull'],[/squats?|baithak|lunges?|pistol|\blegs?\b/,'legs'],
    [/plank|\babs\b|core|crunch|sit ?ups?|leg raise|hollow|dead bug/,'core'],[/burpees?|sprints?|high knees|fast feet/,'speed'],[/jumps?|hops?|crawl|shuffle/,'agility'],
    [/mobility|deep squat|cat cow|dislocates?|rotations?/,'mobility'],[/stretch|flexib|splits?|hamstring|pigeon|fold/,'flex']];
  const f=FAM.find(([re])=>re.test(low));
  if(f){const k=f[1],i=Math.min(S.ladders[k].step,LADDERS[k].steps.length-1),s=LADDERS[k].steps[i];return {k,i,name:s[0],cue:s[2],current:true}}
  return best&&bs>=.5?best:null;
}
const AR_PAGES=[[/armou?ry|weapons?/,'armory','the Armory'],[/shadows?|army/,'army','your shadow army'],[/history/,'history','History'],[/feats?|achievements?|badges?/,'feats','Feats'],
  [/\bplan\b/,'plan','your Plan'],[/skills?/,'skills','Skills'],[/grocery|shopping/,'grocery','your grocery list'],[/report/,'report','the weekly report'],[/gates?|dungeons?/,'gates','Gates'],
  [/quests?/,'quest','the Quest tab'],[/progress/,'progress','Progress'],[/diet|nutrition|food|recipes?/,'diet','Diet'],[/status|home|main/,'status','Status']];
function arGo(k){
  closeBot();
  if(['status','quest','gates','progress','diet'].includes(k))showTab(k);
  else if(['history','feats','plan','skills','army'].includes(k))ACT.goProg(k);
  else if(k==='armory'){showTab('gates');setTimeout(()=>{const a=document.querySelector('.armory');if(a)a.scrollIntoView({behavior:'smooth',block:'center'})},350)}
  else if(k==='grocery')ACT.grocery();else if(k==='report')ACT.report();
}
const chip=(l,a,arg)=>({l,a,arg:arg===undefined?'':String(arg)});

/* ---------- what Arrow does for each intent ---------- */
const AH={};
AH.log_food=c=>{
  const {ds,day,T}=c,r=c.parsed||flParse(c.text,ds.custom);
  if(!r.items.length&&!r.water){
    if(r.skipped.length)return AH.skipped_meal(c,r);
    if(!r.unknown.length){const m=arMealOf(c.low);return {say:m?`What did you have for ${m}? Tell me the foods.`:arSay('whatAte'),mood:m?'curious':'confused'}}
  }
  const meal=r.meal||mealNow(),batch=Date.now();
  r.items.forEach(it=>{it.meal=it.meal||meal});
  r.items.forEach((it,k)=>day.items.push(Object.assign({id:batch+'-'+k,batch,t:batch},it)));
  if(r.water)day.water=Math.max(0,flR1(day.water+r.water));
  const out={items:r.items.map((it,k)=>batch+'-'+k),mood:'happy'};
  const big=r.items.reduce((a,i)=>a+i.k,0),prot=r.items.reduce((a,i)=>a+i.p,0),sweet=r.items.some(i=>/junk|sweet/.test(i.tags||'')||(i.s>=40&&!/drink/.test(i.tags||'')));
  const silly=r.items.some(i=>i.units>=10&&!/ g /.test(' '+i.q+' '))||big>3000;
  const groups=[];r.items.forEach(it=>{let g=groups.find(x=>x.m===it.meal);if(!g)groups.push(g={m:it.meal,a:[]});g.a.push(it)});
  let say=r.items.length?`${arSay('logged')} ${groups.map(g=>`${MEAL_NAME[g.m]}: ${g.a.map(i=>`${i.q} (${i.est?'about ':''}${fmtK(i.k)} kcal, ${Math.round(i.p)} g protein)`).join(', ')}.`).join(' ')}`:'';
  if(r.water)say+=`${say?' ':''}+${r.water} glass${r.water===1?'':'es'} of water. ${r.items.length?'':arSay('water')}`;
  if(r.skipped&&r.skipped.length)say+=` Not logging ${arList(r.skipped)}.`;
  if(silly){out.mood='suspicious';say+=' '+arSay('silly')}
  else if(big>=900){out.mood='surprised';say+=' '+arSay('big',{k:fmtK(big)})}
  else if(sweet){out.mood='angry';say+=' '+arSay('junk')}
  else if(prot>=25){out.mood='excited';say=arFlavor(c.lang,say+' '+arSay('protein',{p:Math.round(prot)}))}
  else if(!r.items.length&&r.water)out.mood=day.water>=T.water?'proud':'happy';
  const t=flTotals(day);day.flags=day.flags||{};
  if(t.p>=T.p&&!day.flags.protein){day.flags.protein=true;out.after={mood:'proud',say:arSay('proteinHit',{p:Math.round(t.p)})}}
  if(t.k>=T.kcal*.9&&t.k<=T.kcal*1.1&&t.p>=T.p&&day.water>=T.water&&!day.flags.done){day.flags.done=true;out.after={mood:'celebrate',say:arSay('allHit')}}
  else if(t.k>T.kcal*1.3&&!day.flags.over){day.flags.over=true;out.after={mood:'scared',say:arSay('over',{pct:Math.round(t.k/T.kcal*100)})}}
  if(r.unknown.length){const u=r.unknown[0];ds.pending={phrase:u.phrase,qty:u.qty,unit:u.unit,meal:u.meal||meal};out.ask='teach';out.mood=r.items.length||r.water?out.mood:'confused';
    out.work='searching';say+=`${say?' ':''}${arSay('unknown',{w:u.phrase,u:FL_BYG.includes(u.unit)?'100 g':'one '+(u.unit||'serving')})}`}
  out.say=(say+(r.items.length||r.water?' '+arSumLine(ds):'')).replace(/\s+/g,' ').trim();
  return out;
};
AH.food_info=c=>{
  const {ds}=c,r=flParse(c.text,ds.custom);
  if(!r.items.length){
    if(r.unknown.length){const u=r.unknown[0],g=flGuess(u.phrase,u.unit);return {say:`"${u.phrase}" isn't in my records. Similar dishes run about ${g.k} kcal and ${g.p} g protein a serving${g.from.length?` (like ${arList(g.from)})`:''}.`,mood:'thinking',work:'searching'}}
    return {say:'Which food? Ask me like "calories in 2 dosas" or "protein in paneer".',mood:'confused'};
  }
  const lines=r.items.map(i=>`${i.q}: ${fmtK(i.k)} kcal, ${Math.round(i.p)} g protein, ${Math.round(i.c)} g carbs, ${Math.round(i.f)} g fat${i.fb>=1?`, ${Math.round(i.fb)} g fiber`:''}`);
  const k=r.items.reduce((a,i)=>a+i.k,0),p=r.items.reduce((a,i)=>a+i.p,0),junk=r.items.some(i=>/junk|sweet/.test(i.tags||''));
  const verdict=junk?'A treat, not a meal. You know that.':k&&p*4/k>=.25?'Protein-rich. I approve.':k&&p*4/k<.08?'Mostly carbs and fat, barely any protein.':'Decent. Not a protein hero, not a villain.';
  ds.arrowPending={kind:'log',items:r.items,at:Date.now()};
  return {say:`${lines.join('. ')}. ${verdict} Want me to log it?`,mood:junk?'suspicious':p>=20?'excited':'happy',work:'searching',chips:[chip('Log it','arrowYes'),chip('No','arrowNo')]};
};
AH.undo=c=>{
  const {ds,day}=c,last=day.items.length?day.items[day.items.length-1].batch:null;
  if(day.water>0&&/water|neellu|neeru|paani|pani/.test(c.low)){day.water=Math.max(0,flR1(day.water-1));return {say:'One glass of water removed. '+arSumLine(ds),mood:'sad'}}
  if(!last)return {say:arSay('undoNone'),mood:'confused'};
  const gone=day.items.filter(i=>i.batch===last);day.items=day.items.filter(i=>i.batch!==last);
  return {say:arSay('undo',{list:arList(gone.map(i=>i.q))})+' '+arSumLine(ds),mood:'sad'};
};
AH.remove_item=c=>{
  const {ds,day}=c,r=flParse(c.text,ds.custom),names=r.items.map(i=>i.n.toLowerCase()).concat(r.skipped||[]);
  const words=ArrowNLU.tokens(c.low).filter(w=>w.length>2&&!FL_COMMON.has(w)&&!/^(remove|delete|take|out|from|log|entry|teeseyi|hata|hatao|karo|nikal|list|cheyyi)$/.test(w));
  const it=[...day.items].reverse().find(x=>names.includes(x.n.toLowerCase())||words.some(w=>x.n.toLowerCase().split(' ').some(y=>flTokEq(w,y))));
  if(!it)return day.items.length?{say:arSay('removeNone'),mood:'confused'}:AH.undo(c);
  day.items=day.items.filter(x=>x!==it);return {say:arSay('removed',{q:it.q})+' '+arSumLine(ds),mood:'sad'};
};
AH.correction=c=>{
  const {ds}=c,m=c.low.match(/^(.+?)\s+(?:is|=|has|was|are|equals|untundi|hai|ki|mein)?\s*(?:about\s+|around\s+|roughly\s+|like\s+|approx\w*\s+|~\s*)?(\d+(?:\.\d+)?)\s*(?:kcal|cal|cals|calories|kcals)\b(?:.*?(\d+(?:\.\d+)?)\s*g?\s*(?:rams\s+)?(?:of\s+)?protein)?/);
  if(!m)return {say:'Tell me like "drumstick curry is 150 kcal" and I\'ll fix it.',mood:'confused'};
  const name=m[1].replace(/\b(bro|dude|man|ra|anna|yaar|bhai|arrow|hey|ok|okay|so|actually|that|this|my|the|correct|set|change|fix|please|pls|like|is|has|was|are|should be|calories to|to|ki|mein|one|each)\b/g,' ').replace(/\s+/g,' ').trim();
  const res=flCorrect(ds,name,+m[2],m[3]!==undefined?+m[3]:null);
  if(!res)return {say:'Which food is that? Try "drumstick curry is 150 kcal".',mood:'confused'};
  return {say:`Updated ${res.f.n.toLowerCase()}: ${fmtK(res.f.k)} kcal and ${Math.round(res.f.p)} g protein per ${flUnitWord(res.f)}.${res.fixed?` Fixed ${res.fixed} entr${res.fixed>1?'ies':'y'} from today. ${arSumLine(ds)}`:''} I\'ll remember that.`,mood:'proud'};
};
AH.summary=c=>({say:flSummary(c.ds),mood:'happy',work:'working'});
AH.targets=c=>{const T=c.T;return {say:`Your ${GOALS[c.ds.goal||'bulk'].n.toLowerCase()} targets: ${fmtK(T.kcal)} kcal, ${T.p} g protein, ${T.c} g carbs, ${T.f} g fat, ${T.fb} g fiber, sugar under ${T.s} g and ${T.water} glasses of water a day.${c.ds.body?'':' Set your height and age (tap the person icon) so I can make these exact.'}`,mood:'proud'}};
AH.set_goal=c=>{
  const l=c.low,g=/cut|lose|loss|fat|shred|lean down|taggali|kam|ghata/.test(l)&&!/gain/.test(l)?'cut':/bulk|gain|perugali|badhana|badha|muscle|bigger|mass/.test(l)?'bulk':/maint|same weight|recomp/.test(l)?'maintain':null;
  if(!g)return {say:'Which goal? Pick one.',mood:'curious',chips:Object.entries(GOALS).map(([k,v])=>chip(v.n,'arrowGoal',k))};
  c.ds.goal=g;const t=foodTargets(c.ds);return {say:`Goal set to ${GOALS[g].n}: ${fmtK(t.kcal)} kcal and ${t.p} g protein a day. Let's go.`,mood:'proud'};
};
AH.suggest_meal=c=>{
  const {ds,day,T}=c,t=flTotals(day),kl=Math.max(0,T.kcal-t.k),pl=Math.max(0,Math.round(T.p-t.p)),tm=arTiming(c.low),meal=arMealOf(c.low)||mealNow(),ok=DIET_TYPES[ds.type].allow;
  const have=(ds.kitchen||[]);
  let pool=RECIPES.filter(r=>ok.includes(r.tag)&&r.kcal<=Math.max(350,kl));
  if(tm==='pre')pool=pool.filter(r=>r.flags.includes('pre'));else if(tm==='post')pool=pool.filter(r=>r.flags.includes('post'));
  else if(tm==='late')pool=pool.filter(r=>r.kcal<=400&&r.p>=10&&(r.meal==='snack'||r.meal==='dinner'));else pool=pool.filter(r=>r.meal===meal);
  if(!pool.length)pool=RECIPES.filter(r=>ok.includes(r.tag)&&r.meal===meal);
  const cook=have.length?new Set(arCookable(ds,have).map(x=>x.r.id)):new Set();
  const picks=pool.map(r=>({r,s:r.p/r.kcal+(cook.has(r.id)?.2:0)+Math.random()*.03})).sort((a,b)=>b.s-a.s).slice(0,3).map(x=>x.r);
  const lead={pre:'Workout soon? Go light: carbs and a little protein, 30 to 60 minutes before.',post:'Post-workout: protein within the hour. Your muscles are waiting.',
    late:'Late night, so keep it light and high-protein.',rest:'Rest day: same protein, a little less rice.',normal:''}[tm];
  const u=arHabits(ds)[meal],usual=u&&!day.items.some(i=>i.meal===meal);
  const say=`${kl?`You have ${fmtK(kl)} kcal and ${pl} g protein left today.`:'Calories are done for today, so keep it light.'} ${lead} ${picks.length?`For ${tm==='pre'?'pre-workout':tm==='post'?'after training':meal}, try one of these:`:''}${usual?` Or your usual ${meal}: ${u.sig.replace(/\+/g,', ').toLowerCase()}.`:''}`;
  return {say:say.replace(/\s+/g,' ').trim(),recipes:picks.map(r=>r.id),mood:'happy',work:'thinking',chips:usual?[chip(`Log my usual ${meal}`,'arrowUsual',meal)]:null};
};
AH.repeat_meal=c=>{
  const {ds,day}=c,meal=arMealOf(c.low);
  if(/yesterday|ninna|\bkal\b|last night/.test(c.low)){const r=flYesterday(ds,c.low);if(!r.items.length)return {say:`Nothing was logged ${r.meal?`for ${r.meal} `:''}yesterday, so there's nothing to copy.`,mood:'confused'};return AH.log_food(Object.assign({},c,{parsed:r}))}
  const H=arHabits(ds),m=meal||mealNow(),u=H[m];
  if(!u)return {say:`You don't have a usual ${m} yet. Log it a few times and I'll learn it.`,mood:'curious'};
  const items=arCopy(u.items).map(i=>Object.assign(i,{meal:m}));
  return AH.log_food(Object.assign({},c,{parsed:{items,water:0,unknown:[],meal:m,skipped:[]}}));
};
AH.skipped_meal=(c,r)=>{const sk=r&&r.skipped&&r.skipped.length?`Okay, not logging ${arList(r.skipped)}. `:'';return {say:sk+arSay('skipped'),mood:'sad',chips:[chip('What should I eat?','arrowAsk','what should i eat')]}};
AH.dont_know=()=>({say:arSay('dontKnow'),mood:'curious'});
AH.kitchen_add=c=>{
  const {ds}=c,got=arIngredients(c.text);if(!got.length)return {say:'What do you have? Tell me like "I have eggs, paneer and spinach".',mood:'curious'};
  ds.kitchen=ds.kitchen||[];got.forEach(g=>{if(!ds.kitchen.some(k=>arKey(k)===arKey(g)))ds.kitchen.push(g)});
  return {say:`Added ${arList(got)} to your kitchen. You now have ${ds.kitchen.length} thing${ds.kitchen.length>1?'s':''} in there. Ask "what can I cook?" anytime.`,mood:'happy',chips:[chip('What can I cook?','arrowAsk','what can i cook')]};
};
AH.kitchen_remove=c=>{
  const {ds}=c,got=arIngredients(c.text);ds.kitchen=ds.kitchen||[];
  const gone=ds.kitchen.filter(k=>got.some(g=>arKey(g)===arKey(k)||arKey(k).split(' ').some(w=>arKey(g).split(' ').some(x=>flTokEq(x,w)))));
  if(!gone.length)return {say:got.length?`${arList(got)} wasn't in your kitchen anyway.`:'Remove what? Tell me like "out of eggs".',mood:'confused'};
  ds.kitchen=ds.kitchen.filter(k=>!gone.includes(k));return {say:`Removed ${arList(gone)} from your kitchen. Restock soon, Hunter.`,mood:'sad'};
};
AH.kitchen_show=c=>{const k=c.ds.kitchen||[];return k.length?{say:`In your kitchen: ${arList(k)}.`,mood:'happy',chips:[chip('What can I cook?','arrowAsk','what can i cook')]}
  :{say:'Your kitchen list is empty. Tell me what you have, like "I have eggs, rice and paneer".',mood:'curious'}};
AH.kitchen_cook=c=>{
  const {ds}=c,named=arIngredients(c.text),have=named.length?named:(ds.kitchen||[]);
  if(!have.length)return {say:'Tell me what you have first, like "I have eggs, onions and rice", then ask again.',mood:'curious'};
  const best=arCookable(ds,have);
  if(!best.length)return {say:`Nothing in your recipe book fits ${arList(have)}. Bold ingredients. Want ideas anyway?`,mood:'confused',chips:[chip('What should I eat?','arrowAsk','what should i eat')]};
  return {say:`With ${arList(have.slice(0,6))}, you can make:${best.map(x=>` ${x.r.n}${x.miss.length?` (missing ${arList(x.miss.slice(0,2))})`:' (you have everything)'}`).join(';')}.`,recipes:best.map(x=>x.r.id),mood:'excited',work:'searching'};
};
AH.reset_log=c=>{c.ds.arrowPending={kind:'reset',at:Date.now()};return {say:arSay('resetAsk'),mood:'scared',chips:[chip('Yes, reset','arrowYes'),chip('No','arrowNo')]}};
AH.clear_chat=()=>({say:arSay('cleared'),mood:'happy',clear:true});
AH.greet=c=>{const h=flHour();return {say:h<11&&/morning|subah|good/.test(c.low)?arSay('morning'):arSay('greet'),mood:'happy'}};
AH.bye=c=>{const h=flHour();if(/night|gn|sleep|sone|padukunta/.test(c.low)||h>=21){const t=flTotals(c.day);return {say:arSay('night',{k:fmtK(t.k),tk:fmtK(c.T.kcal),p:Math.round(t.p),tp:c.T.p}),mood:'drowsy'}}return {say:arSay('bye'),mood:'happy'}};
AH.thanks=()=>({say:arSay('thanks'),mood:'shy'});
AH.praise=()=>({say:arSay('praise'),mood:'shy'});
AH.insult=()=>({say:arSay('insult'),mood:'angry'});
AH.how_are_you=()=>({say:arSay('howAreYou'),mood:'playful'});
AH.who_are_you=()=>({say:arSay('whoAreYou'),mood:'proud'});
AH.help=()=>({say:'Here\'s what I can do: log food ("rendu idlis tinna", "2 rotis and dal"), tell you calories ("protein in paneer?"), suggest meals ("what should I eat?"), cook from your kitchen ("I have eggs and rice"), repeat meals ("same as yesterday"), answer Hunter questions ("what\'s my streak?", "who\'s my strongest shadow?"), coach you ("push-up form", "I\'m sore"), and run the app ("start my workout", "open Gates", "dark mode"). Got something wrong? Tap "not what I meant" and I learn.',mood:'curious'});
AH.joke=()=>({say:arSay('jokes'),mood:'laughing'});
AH.laugh=()=>({say:arSay('laugh'),mood:'laughing'});
AH.affirm=()=>({say:arSay('yesNone'),mood:'confused'});
AH.deny=()=>({say:arSay('noNone'),mood:'shy'});
AH.out_of_scope=()=>({say:arSay('outOfScope'),mood:'suspicious'});
/* ---- Hunter progress ---- */
AH.ask_streak=()=>({say:S.streak?`${S.streak}-day streak. Best ever: ${S.bestStreak}. ${S.streak>=S.bestStreak?'You\'re at your best ever. Don\'t you dare break it.':`${S.bestStreak-S.streak} more days to beat your record.`}`
  :`Streak: zero. Best ever: ${S.bestStreak}. Today is a great day to start one. Just saying.`,mood:S.streak>=7?'proud':S.streak?'happy':'sad'});
AH.ask_level=()=>{const lv=levelFromExp(),rk=currentRank();return {say:`Level ${S.level}, ${rk.r}-Rank (${rk.name}). ${lv.need-lv.into} EXP to level ${S.level+1}.`,mood:'proud'}};
AH.ask_quest=c=>{
  if(notStarted())return {say:`Your journey starts ${fmtDate(S.startDate)}. Patience, Hunter.`,mood:'curious'};
  const sp=todaysSplit(),rec=todayRec(),items=buildQuestItems().filter(i=>!i.warm),ex=arExercise(c.low);
  const left=items.filter(i=>((rec.sets||{})[i.id]||[]).length<i.sets);
  const it=ex&&items.find(i=>i.key===ex.k);
  if(it)return {say:`Today: ${it.sets} sets of ${it.amt}${it.timed?' seconds':''} ${dn(it.name).toLowerCase()}.${((rec.sets||{})[it.id]||[]).length?` You've done ${(rec.sets||{})[it.id].length} set${(rec.sets||{})[it.id].length>1?'s':''}.`:''}`,mood:'happy',chips:rec.completed?null:[chip('Start workout','arrowStart')]};
  const list=items.map(i=>`${dn(i.name)} ${i.sets}×${i.amt}${i.timed?'s':''}`).join(', ');
  return {say:`${sp.name}: ${sp.type}${sp.rest?' (recovery day)':''}. ${list}. ${rec.completed?'Already cleared. Show-off.':left.length<items.length?`${left.length} of ${items.length} moves left.`:'Not started yet.'}`,
    mood:rec.completed?'proud':'curious',chips:rec.completed?null:[chip('Start workout','arrowStart')]};
};
AH.ask_records=c=>{
  const prs=Object.entries(S.prs||{});if(!prs.length)return {say:'No records yet. Finish a quest and I\'ll start keeping score.',mood:'curious'};
  const ex=arExercise(c.low),one=ex&&prs.filter(([n])=>n===ex.name||LADDERS[ex.k].steps.some(s=>s[0]===n));
  const fmt=([n,r])=>`${dn(n)}: ${r.best}${/secs/.test(n)?' s':''} (${fmtDate(r.date)})`;
  if(one&&one.length)return {say:`Your records: ${one.map(fmt).join('; ')}.`,mood:'proud'};
  return {say:`Your latest records: ${prs.sort((a,b)=>b[1].date<a[1].date?-1:1).slice(0,5).map(fmt).join('; ')}.`,mood:'proud'};
};
AH.ask_shadows=c=>{
  if(!S.shadows.length)return {say:'No shadows yet. Beat one of your own records and I\'ll extract your first. ARISE.',mood:'curious'};
  const named=S.shadows.find(sh=>c.low.includes(sh.n.toLowerCase()));
  const line=sh=>`${sh.n}: Lv ${sh.lvl}, ${shadowRank(sh)}-grade, CP ${fmtK(shadowStats(sh).cp)}. ${skillText(sh,roleOf(sh))}`;
  if(named)return {say:line(named)+(roleOf(named)?` (${roleOf(named)==='captain'?'captain':'vice-captain'})`:'')+'.',mood:'proud',chips:[chip('Open army','arrowGo','army')]};
  const best=[...S.shadows].sort((a,b)=>shadowStats(b).cp-shadowStats(a).cp)[0],cap=S.shadows.find(s=>s.ex===S.army.captain),vice=S.shadows.find(s=>s.ex===S.army.vice);
  return {say:`${S.shadows.length} shadow${S.shadows.length>1?'s':''}. Strongest: ${best.n} (Lv ${best.lvl}, CP ${fmtK(shadowStats(best).cp)}). Captain: ${cap?cap.n:'none'}${vice?`, vice-captain: ${vice.n}`:''}.`,mood:'proud',chips:[chip('Open army','arrowGo','army')]};
};
AH.ask_next_rank=()=>{
  const nr=nextRank();if(!nr)return {say:'You\'re S-Rank. The Shadow Monarch. There\'s nothing above you but your ego.',mood:'proud'};
  const st=trialStatus(nr.r),bits=[];
  if(!st.lvOk)bits.push(`reach level ${st.t.level} (you're ${S.level})`);if(!st.wkOk)bits.push(`get to week ${st.t.week} (you're in week ${weekNumber()})`);
  if(st.retry)bits.push(`wait until ${fmtDate(st.retry)} after the last attempt`);
  return st.ready?{say:`The ${nr.r}-Rank trial is open. Clear it in Gates to become ${nr.r}-Rank (${nr.name}). Warm up first.`,mood:'excited',chips:[chip('Open Gates','arrowGo','gates')]}
    :{say:`Next: ${nr.r}-Rank (${nr.name}). To unlock the trial: ${arList(bits)}.`,mood:'curious'};
};
AH.ask_stats=()=>{const st=Object.entries(S.stats).sort((a,b)=>b[1]-a[1]);return {say:`${st.map(([k,v])=>`${k} ${v}`).join(', ')}. Highest: ${st[0][0]}.${S.statPoints?` You have ${S.statPoints} unspent point${S.statPoints>1?'s':''}.`:''}`,
  mood:'proud',chips:S.statPoints?[chip('Spend points','arrowAlloc')]:null}};
AH.ask_items=()=>{
  const inv=S.inv,keys=Object.entries(inv.keys).filter(([,n])=>n).map(([r,n])=>`${n} ${r}-key${n>1?'s':''}`),bits=[];
  if(keys.length)bits.push(arList(keys));if(inv.box)bits.push(`${inv.box} box${inv.box>1?'es':''}`);if(inv.potion)bits.push(`${inv.potion} healing potion${inv.potion>1?'s':''}`);
  if(inv.elixir)bits.push(`${inv.elixir} elixir${inv.elixir>1?'s':''}`);if(inv.holy)bits.push(`${inv.holy} holy water`);
  const w=equippedWeapon();
  return {say:`${bits.length?`You have ${arList(bits)}.`:'Your bag is empty.'} ${w?`Weapon: ${weaponOf(w).name}${refineOf(w)?` +${refineOf(w)}`:''}.`:'No weapon equipped.'}${S.titleEquipped?` Title: ${S.titleEquipped}.`:''}`,mood:'happy'};
};
AH.ask_week=()=>{
  const mon=mondayOf(todayStr());let reps=0;
  for(let i=0;i<7;i++){const r=S.log[addDays(mon,i)];if(r&&r.sets)Object.values(r.sets).forEach(a=>a.forEach(n=>reps+=n))}
  const gates=S.dungeons.filter(d=>d.ok&&d.date>=mon).length,days=trainedInWeek(mon);
  return {say:`This week: ${days} training day${days===1?'':'s'}, ${fmtK(reps)} reps${gates?`, ${gates} gate${gates>1?'s':''} cleared`:''}. All time: ${fmtK(S.totalReps)} reps over ${S.totalQuests} quests.`,mood:days>=4?'proud':'curious'};
};
/* ---- coaching ---- */
AH.exercise_howto=c=>{
  const ex=arExercise(c.low);if(!ex)return {say:'Which exercise? Ask like "push-up form" or "how to do a squat".',mood:'curious'};
  const L=LADDERS[ex.k],nx=L.steps[ex.i+1];
  return {say:`${dn(ex.name)}: ${ex.cue}${ex.current?` That's your current ${L.title.toLowerCase()} step.`:''}${nx&&ex.current?` Next up: ${dn(nx[0]).toLowerCase()}.`:''}`,demo:DEMOS[ex.name]?ex.name:null,mood:'happy'};
};
AH.motivate=()=>{
  const sp=todaysSplit(),rec=todayRec(),n=buildQuestItems().filter(i=>!i.warm).length;
  const tail=rec.completed?' Quest is already done today though, so rest, legend.':sp.rest?' It\'s a recovery day anyway: just stretch.':` Today is only ${n} moves. Start the warm-up and see.`;
  return {say:arSay('motivate')+tail+(S.streak?` Your streak is ${S.streak} days. Protect it.`:''),mood:'excited',chips:rec.completed||sp.rest?null:[chip('Start workout','arrowStart')]};
};
AH.recovery=c=>{
  const sp=todaysSplit(),sleep=/sleep|slept|nidra|neend/.test(c.low);
  return {say:`${sleep?'Short sleep hurts recovery more than skipping a set. Train lighter today and get 7 to 9 hours tonight.':'Soreness is normal and it fades. Move gently, drink water, eat your protein and sleep 7 to 9 hours.'} Today is ${sp.rest?'a recovery day, perfect timing':`${sp.type}: do the warm-up, then decide. If it's sharp pain rather than soreness, stop`}.${passUsedThisWeek()?'':' You also have a Rest Pass this week if you truly need the day.'}`,mood:'thinking'};
};
AH.pain=()=>({say:arSay('pain'),mood:'scared'});
const AR_TIPS=[[/\babs\b|six ?pack|belly|\bpet\b|tummy|stomach/,'Abs are built in the kitchen and revealed by the scale. Your core ladder trains them 3 times a week; a small calorie deficit shows them. Crunches alone won\'t.'],
  [/muscle|bigger|mass|size|arms|biceps|chest/,'Muscle needs three things: harder reps over time (your ladders do that), about 1.6 g of protein per kg, and sleep. Eat at a small surplus, which is your lean bulk.'],
  [/rest between|between sets|how long.*rest/,'60 to 90 seconds for strength moves, 30 seconds for stretches. Your workout timer already does it, by the way.'],
  [/increase|more (push|pull|reps)|improve|reps/,'Own your current step first: two clean sets at the graduate target and the ladder moves you up. Between workouts, do a few easy sets through the day, never to failure.'],
  [/stamina|endurance|cardio|\brun/,'Stamina comes from your speed days: short hard bursts, full rest. Add a 20-minute walk on recovery days. Boring, effective.'],
  [/flexib|splits|stretch/,'Stretch after training, when you\'re warm. Hold 30 to 60 seconds, breathe, never bounce. Your flex ladder does exactly this.'],
  [/fat|weight loss|lose/,'Fat loss is mostly food: a 20% calorie deficit with high protein. Say "goal cut" and I\'ll set it up. Keep training so the weight you lose is fat, not muscle.'],
  [/plateau|stuck|stall/,'Stuck? Sleep more, eat enough protein, and slow the reps down (3 seconds down). Plateaus break when recovery catches up.'],
  [/fast|speed|explosive/,'Speed is explosive reps with full rest. Quality over quantity: stop the set when you slow down.'],
  [/sets|how many/,'Three sets per move is the sweet spot here, four on boss days. More isn\'t better, better is better.']];
AH.coach_tip=c=>{const t=AR_TIPS.find(([re])=>re.test(c.low));return {say:t?t[1]:'Show up, add a rep or a few seconds each week, eat your protein and sleep. Boring is how strong people get strong.',mood:'thinking'}};
/* ---- running the app ---- */
AH.open_tab=c=>{const p=AR_PAGES.find(([re])=>re.test(c.low));
  if(!p)return {say:'Where to?',mood:'curious',chips:['status','quest','gates','progress','diet'].map(k=>chip(k[0].toUpperCase()+k.slice(1),'arrowGo',k))};
  return {say:`Opening ${p[2]}.`,mood:'happy',act:()=>arGo(p[1])}};
AH.start_workout=()=>{
  if(notStarted())return {say:`Your journey starts ${fmtDate(S.startDate)}. Patience, Hunter.`,mood:'curious'};
  if(todayRec().completed)return {say:'Today\'s quest is already cleared. Go flex in a mirror.',mood:'proud'};
  if(penaltyDue())return {say:'Penalty first. Clear it on the Quest tab, then we train.',mood:'angry',act:()=>arGo('quest')};
  return {say:'Let\'s go. Don\'t make me watch you skip sets.',mood:'excited',act:()=>{closeBot();ACT.workout()}};
};
AH.open_license=()=>({say:'Here\'s your license. Try not to look too proud.',mood:'proud',act:()=>{closeBot();openCard()}});
AH.open_settings=()=>({say:'Settings. Don\'t break anything.',mood:'happy',act:()=>{closeBot();openMenu()}});
AH.theme=c=>{
  const l=c.low,k=/\b(dark|night|black)\b|too bright/.test(l)?'dark':/\b(light|white|day)\b|too dark/.test(l)?'light':/auto|system|phone/.test(l)?'auto':null;
  if(!k)return {say:'Dark, light or follow your phone?',mood:'curious',chips:[['Dark','dark'],['Light','light'],['Auto','auto']].map(([a,b])=>chip(a,'arrowTheme',b))};
  S.profile=Object.assign(S.profile||{},{theme:k});save();applyTheme();
  return {say:{dark:'Lights off. Very mysterious.',light:'Lights on. My eyes!',auto:'Theme follows your phone now.'}[k],mood:'playful'};
};

/* ---------- one message in, one reply out ---------- */
function arrowReply(ds,text,force){
  const low=text.toLowerCase().trim();if(!low)return null;
  const c={ds,day:flDay(ds),T:foodTargets(ds),text,low,lang:arLang(text)};
  const pend=ds.arrowPending&&Date.now()-ds.arrowPending.at<15*60000?ds.arrowPending:null;
  const cls=force?{intent:force,p:1,top:[],src:'forced'}:arrowClassify(ds,text);
  ds.arrowLast={text,intent:cls.intent,top:(cls.top||[]).map(x=>x.intent)};
  /* a yes or no answers the open question, if there is one */
  if(pend&&(cls.intent==='affirm'||cls.intent==='deny')){
    delete ds.arrowPending;
    if(cls.intent==='deny')return {say:'Cancelled.',mood:'shy',intent:cls.intent};
    if(pend.kind==='reset'){c.day.items=[];c.day.water=0;c.day.flags={};return {say:arSay('resetDone'),mood:'sad',intent:'reset_log'}}
    if(pend.kind==='log')return Object.assign(AH.log_food(Object.assign({},c,{parsed:{items:pend.items,water:0,unknown:[],meal:arMealOf(low),skipped:[]}})),{intent:'log_food'});
  }
  /* Unsure, but it names a food and an eating verb: log it (undo is one tap away). */
  if(!force&&cls.src==='model'&&cls.p<.42&&/\b(had|ate|eaten|eating|drank|having|finished|tinn?a\w*|tine\w*|tinesa\w*|khay\w*|khaa?\s?li\w*|piy\w*|pi liya|taag\w*|tagaa?nu)\b/.test(low)&&!/\b(remove|delete|undo|cancel|teeseyi|hata\w*|wrong|mistake|didn'?t|not|how|what|calories|protein)\b/.test(low)&&flParse(text,ds.custom).items.length)cls.intent='log_food',cls.p=.5;
  if(!force&&cls.src==='model'&&cls.p<.42&&low.split(/\s+/).length>1){
    return {say:arSay('clarify'),mood:'confused',chips:cls.top.slice(0,3).map(x=>chip(ARROW_LABEL[x.intent]||x.intent,'arrowPick',x.intent)),intent:null};
  }
  const r=(AH[cls.intent]||AH.out_of_scope)(c);
  return Object.assign(r,{intent:cls.intent,conf:cls.p,src:cls.src});
}

/* ---------- the floating orb and nudges ---------- */
function arrowHome(){
  const fab=$('arrowFab');if(!fab)return;
  const tab=['status','quest','gates','progress','diet'].find(t=>$(t)&&!$(t).hidden),p=S.profile;
  const show=!!p&&p.arrowOrb!==false&&tab!=='diet'&&!FL.open;
  fab.hidden=!show;if(!show)$('arrowNudge').hidden=true;
  if(FL.open||BotGame.on)return;
  if(tab==='diet'){mountDietBot();return}
  if(show){fab.classList.toggle('raised',!!document.querySelector(`#${tab} .dock`));Bot.mount($('arrowFabStage'));Bot.setMood(baseMood());Bot.resume()}
  else Bot.pause();
}
function arrowNudgeText(){
  const ds=dietState(),day=flDay(ds),T=foodTargets(ds),t=flTotals(day),h=flHour(),rec=todayRec(),sp=todaysSplit(),has=m=>day.items.some(i=>i.meal===m);
  if(notStarted())return null;
  if(h>=18&&!rec.completed&&!sp.rest)return {say:'Your daily quest is still open. Penalty zone is real, Hunter.',mood:'suspicious'};
  if(h>=10&&h<15&&!day.items.length)return {say:'No breakfast logged. Did you eat, or are we photosynthesizing now?',mood:'curious'};
  if(h>=15&&h<20&&!has('lunch')&&day.items.length<3)return {say:'Lunch? Hello? Log it or I\'ll assume you ate air.',mood:'curious'};
  if(h>=12&&day.water<Math.floor((h-8)/14*T.water)-2)return {say:`Water check: ${day.water} of ${T.water} glasses. Drink. Now.`,mood:'angry'};
  if(h>=20&&day.items.length&&t.p<T.p*.6)return {say:`${Math.round(T.p-t.p)} g protein left today. Curd, eggs or paneer before bed?`,mood:'thinking'};
  if(rec.completed&&S.streak>=3)return {say:`${S.streak}-day streak. Okay, I'm impressed. A little.`,mood:'proud'};
  return null;
}
let arNudgeT=0;
function arrowNudge(){
  const p=S.profile||{},fab=$('arrowFab'),b=$('arrowNudge');if(!fab||fab.hidden||p.arrowNudge===false)return;
  if(!revealIdle()||REVEALQ.length||document.body.classList.contains('locked'))return; // never over a reward, modal or open layer
  const M=arMem();if(Date.now()-(M.nudgeAt||0)<90*60000)return;
  const n=arrowNudgeText();if(!n)return;
  M.nudgeAt=Date.now();arMemSave(M);
  b.innerHTML=`<button class="an-say" data-act="arrowNudgeOpen">${esc(n.say)}</button><button class="an-x" data-act="arrowNudgeX" aria-label="Dismiss">${ic('x')}</button>`;
  b.dataset.say=n.say;b.classList.toggle('raised',fab.classList.contains('raised'));b.hidden=false;b.classList.remove('in');void b.offsetWidth;b.classList.add('in');
  Bot.react(n.mood,3200);buzz('tap');clearTimeout(arNudgeT);arNudgeT=setTimeout(()=>{b.hidden=true},12000);
}
ACT.arrowOpen=()=>{$('arrowNudge').hidden=true;openBot(false)};
ACT.arrowNudgeX=()=>{$('arrowNudge').hidden=true};
ACT.arrowNudgeOpen=()=>{const say=$('arrowNudge').dataset.say;$('arrowNudge').hidden=true;const ds=dietState();if(say){flDay(ds).msgs.push({w:'bot',x:say,at:Date.now()});saveDietState(ds)}openBot(false)};
/* chips inside the chat */
ACT.arrowPick=intent=>{const ds=dietState(),last=ds.arrowLast;if(!last||!last.text)return;arrowLearn(ds,last.text,intent);flSend(last.text,true,intent,'learned')};
ACT.arrowWrong=()=>{const ds=dietState(),last=ds.arrowLast;if(!last)return;
  const alt=[...new Set([...(last.top||[]).filter(i=>i!==last.intent),'log_food','food_info','suggest_meal','summary','out_of_scope'])].filter(i=>i!==last.intent).slice(0,5);
  flDay(ds).msgs.push({w:'bot',x:arSay('wrong'),at:Date.now(),chips:alt.map(i=>chip(ARROW_LABEL[i]||i,'arrowPick',i))});saveDietState(ds);renderBot();Bot.react('shy',1800)};
ACT.arrowYes=()=>flSend('Yes',false,'affirm');
ACT.arrowNo=()=>flSend('No',false,'deny');
ACT.arrowAsk=q=>flSend(q);
ACT.arrowUsual=m=>flSend(`Usual ${m}`,false,'repeat_meal');
ACT.arrowStart=()=>flSend('Start my workout',false,'start_workout');
ACT.arrowGo=k=>arGo(k);
ACT.arrowAlloc=()=>{closeBot();ACT.allocate()};
ACT.arrowGoal=g=>{const ds=dietState();ds.goal=g;const t=foodTargets(ds);flDay(ds).msgs.push({w:'bot',x:`Goal set to ${GOALS[g].n}: ${fmtK(t.kcal)} kcal and ${t.p} g protein a day.`,at:Date.now()});saveDietState(ds);renderBot();Bot.react('proud',2400)};
ACT.arrowTheme=k=>flSend(k+' mode',false,'theme');
ACT.arrowForget=()=>{const M=arMem();M.mem=[];arMemSave(M);toast('Arrow forgot the phrases it learned');if(!$('menu').hidden)openMenu()};
arrowLoad();
