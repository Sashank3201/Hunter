/* Hunter System: Arrow, the app's chat companion.
   Arrow reads each message with its trained language model (arrow-nlu.js + models/arrow-nlu.bin),
   works out what you meant (one of 60 intents) and answers as a sassy friend: food logging and
   nutrition, your Hunter progress, coaching from your own numbers, and running the app. It keeps
   the thread of the chat ("tell me more"), learns your phrasing when you correct it, learns your
   usual meals from your log, and lives as a floating orb on every tab. */

const ARROW_LABEL={log_food:'Log food',food_info:'Nutrition facts',undo:'Undo last',remove_item:'Remove a food',correction:'Fix calories',summary:'Today so far',
  targets:'My targets',set_goal:'Change goal',suggest_meal:'What to eat',repeat_meal:'Repeat a meal',skipped_meal:'Skipped a meal',dont_know:'Don\'t remember',
  kitchen_add:'Add to kitchen',kitchen_remove:'Remove from kitchen',kitchen_show:'My kitchen',kitchen_cook:'What can I cook',reset_log:'Reset today\'s log',
  clear_chat:'Clear chat',greet:'Hi',bye:'Bye',thanks:'Thanks',praise:'Compliment',insult:'Complaint',how_are_you:'How are you',who_are_you:'Who is Arrow',help:'Help',
  joke:'Joke',laugh:'Haha',affirm:'Yes',deny:'No',out_of_scope:'Something else',ask_streak:'My streak',ask_level:'Level and rank',ask_quest:'Today\'s quest',
  ask_records:'My records',ask_shadows:'My shadows',ask_next_rank:'Next rank-up',ask_stats:'My stats',ask_items:'Inventory',ask_week:'This week',
  exercise_howto:'Exercise form',motivate:'Motivation',recovery:'Rest and soreness',pain:'Pain or injury',coach_tip:'Training tips',open_tab:'Open a page',
  start_workout:'Start workout',open_license:'Hunter License',open_settings:'Settings',theme:'Theme',ask_event:'Story event',
  ask_advice:'Coach me',ask_progress:'Am I improving?',daily_plan:'Plan my day',nutrition_tip:'Diet advice',feeling_down:'Feeling low',more:'Tell me more',
  fun_fact:'Fun fact',arrow_skin:'Arrow skins',about_me:'About me'};

/* ---------- voice: a sassy friend ---------- */
const SAY={
  intro:['Hey, I\'m Arrow. I count your food, judge your snacks, know your Hunter stats, coach you from your own numbers and can run this app for you. English, Telugu or Hindi, I get it. So... what did you eat?'],
  greet:['Hey {nm}. Fed yet?','Oh look who remembered I exist. Hi, {nm}.','Hi {nm}! Tell me what you ate. Don\'t lie, I can tell.','Yo, {nm}. Report your meals.','Hello hello, {nm}. What are we eating today?'],
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
    [/\bstart\b.*\bworkout\b/,'start_workout'],[/\b(dark|light|night) mode\b/,'theme'],[/\b(event|chapter|story)\b/,'ask_event'],
    [/\b(advice|what should i improve|coach me)\b/,'ask_advice'],[/\bplan my day\b|what should i do today/,'daily_plan'],[/\bskins?\b/,'arrow_skin'],
    [/\b(fun )?fact\b/,'fun_fact'],[/^(more|tell me more|another one|why)\b/,'more']];
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
  if(f){const k=f[1],nm=(planToday().find(p=>p.a===k)||{}).n||chainMove(k,0)||LADDERS[k].steps[0][0];return {k,i:LADDERS[k].steps.findIndex(s=>s[0]===nm),name:nm,cue:(MOVES[nm]||{}).cue||'',current:true}}
  return best&&bs>=.5?best:null;
}
const AR_PAGES=[[/\bskins?\b/,'skins','your Arrow skins'],[/\bevents?\b|\bstory\b|chapters?/,'event','the story event'],[/armou?ry|weapons?/,'armory','the Armory'],[/shadows?|army/,'army','your shadow army'],[/history/,'history','History'],[/feats?|achievements?|badges?/,'feats','Feats'],
  [/\bplan\b/,'plan','your Plan'],[/skills?/,'skills','Skills'],[/grocery|shopping/,'grocery','your grocery list'],[/report/,'report','the weekly report'],[/gates?|dungeons?/,'gates','Gates'],
  [/quests?/,'quest','the Quest tab'],[/progress/,'progress','Progress'],[/diet|nutrition|food|recipes?/,'diet','Diet'],[/status|home|main/,'status','Status']];
function arGo(k){
  closeBot();
  if(['status','quest','gates','progress','diet'].includes(k))showTab(k);
  else if(['history','feats','plan','skills','army'].includes(k))ACT.goProg(k);
  else if(k==='armory'){showTab('gates');setTimeout(()=>{const a=document.querySelector('.armory');if(a)a.scrollIntoView({behavior:'smooth',block:'center'})},350)}
  else if(k==='grocery')ACT.grocery();else if(k==='report')ACT.report();else if(k==='event')openEvent();
  else if(k==='skins'){openMenu();setTimeout(()=>{const s=document.querySelector('.skin-wrap');if(s)s.scrollIntoView({behavior:'smooth',block:'center'})},300)}
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
/* One line on where the day stands, so a hello is never empty. */
function arStatusLine(){
  if(!S.profile||notStarted())return '';
  if(penaltyDue())return ' Heads up: a penalty quest is waiting.';
  const rec=todayRec();if(rec.completed)return ' Quest already cleared today. Respect.';
  return !todaysSplit().rest&&flHour()>=12?' Your quest is still open, by the way.':'';
}
AH.greet=c=>{const h=flHour();return {say:(h<11&&/morning|subah|good/.test(c.low)?arSay('morning'):arSay('greet',{nm:arName()||'Hunter'}))+arStatusLine(),mood:'happy'}};
AH.bye=c=>{const h=flHour();if(/night|gn|sleep|sone|padukunta/.test(c.low)||h>=21){const t=flTotals(c.day);return {say:arSay('night',{k:fmtK(t.k),tk:fmtK(c.T.kcal),p:Math.round(t.p),tp:c.T.p}),mood:'drowsy'}}return {say:arSay('bye'),mood:'happy'}};
AH.thanks=()=>({say:arSay('thanks'),mood:'shy'});
AH.praise=()=>({say:arSay('praise'),mood:'shy'});
AH.insult=()=>({say:arSay('insult'),mood:'angry'});
AH.how_are_you=()=>{
  const why=S.streak>=3?` Your streak is ${S.streak} days and I'm living for it.`:todayRec().completed?' You cleared your quest, so my day is made.':'';
  return {say:why?`${arPick(['Great, actually.','Thriving.','Pretty good.'])}${why} How about you?`:arSay('howAreYou'),mood:'playful'};
};
AH.who_are_you=()=>({say:arSay('whoAreYou'),mood:'proud'});
AH.help=()=>({say:'Here\'s what I can do: log food ("rendu idlis tinna", "2 rotis and dal"), tell you calories ("protein in paneer?"), suggest meals ("what should I eat?"), cook from your kitchen ("I have eggs and rice"), repeat meals ("same as yesterday"), answer Hunter questions ("what\'s my streak?", "who\'s my strongest shadow?"), coach you from your own numbers ("give me advice", "am I improving?", "plan my day"), answer diet questions ("is creatine safe?"), teach form ("push-up form"), change my look ("wear the Monarch skin"), and run the app ("start my workout", "open Gates", "dark mode"). Say "tell me more" after any tip. Got something wrong? Tap "not what I meant" and I learn.',mood:'curious',
  chips:[chip('Give me advice','arrowAsk','give me advice'),chip('Plan my day','arrowAsk','plan my day'),chip('Fun fact','arrowAsk','tell me a fun fact')]});
AH.joke=c=>({say:arFresh(c.ds,'joke',SAY.jokes),mood:'laughing',chips:[chip('Another one','arrowAsk','another one')]});
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
  const inArea=ex?items.filter(i=>i.key===ex.k):[],it=ex&&(items.find(i=>i.name===ex.name)||(inArea.length===1?inArea[0]:null));
  if(!it&&inArea.length>1)return {say:`Today's ${LADDERS[ex.k].title.toLowerCase()} block: ${inArea.map(i=>`${dn(i.name)} ${i.sets}×${i.amt}${i.timed?'s':''}`).join(', ')}.`,mood:'happy',chips:rec.completed?null:[chip('Start workout','arrowStart')]};
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
/* The live story event: where you are, what is open, what you win. */
AH.ask_event=c=>{
  const cur=evNow(),ev=cur.ev,R=evRun(cur.n),done=evDone(cur),nx=evOf(cur.n+1),open=chip('Open the event','arrowGo','event');
  if(/\b(next|agla|agli)\b/.test(c.low))return {say:`Next up: ${nx.name}, starting ${fmtDate(cur.end)}. ${nx.blurb}`,mood:'curious',chips:[open]};
  /* another event by name or boss: when it comes round */
  const flat=s=>s.toLowerCase().replace(/['’]/g,'').replace(/^the /,''),low=flat(c.low);
  const named=STORY_EVENTS.find(e=>e.id!==ev.id&&[e.name,e.short,e.raid.boss.split(',')[0]].some(n=>low.includes(flat(n))));
  if(named){const k=[...Array(STORY_EVENTS.length)].map((_,i)=>i+1).find(i=>evOf(cur.n+i).id===named.id)||STORY_EVENTS.length;
    return {say:`${named.name} starts ${fmtDate(addDays(cur.start,k*EVENT_DAYS))}${k===1?', next week':`, in ${k} weeks`}. ${named.blurb} Rewards: ${WEAPONS[named.weapon].name}, the shadow ${named.shadow} and the ${ARROW_SKINS[named.skin].n} skin. Right now it's ${ev.name}.`,mood:'curious',chips:[open]}}
  const ready=ev.chapters.findIndex((x,i)=>evChapter(cur,i)==='ready'),M=evMission();
  let say=`${ev.name} is live for another ${evLeft(cur)}. You've cleared ${done} of ${EVENT_CHAPTERS} chapters.`;
  if(M)say+=` Your chapter ${M.i+1} mission is half done, finish it.`;
  else if(R.raid)say+=` You already beat ${ev.raid.boss}. Show-off. Replay the raid for more loot.`;
  else if(evRaidOpen(cur))say+=` The boss raid is open and ${ev.raid.boss} is waiting.`;
  else if(ready>=0)say+=` Chapter ${ready+1}, "${ev.chapters[ready].t}", is ready right now.`;
  else say+=' The next chapter opens tomorrow.';
  say+=` Rewards: ${WEAPONS[ev.weapon].name}, the shadow ${ev.shadow}, and the ${ARROW_SKINS[ev.skin].n} skin for me.`;
  if(S.skins.includes(ev.skin)&&S.profile.arrowSkin!==ev.skin)say+=' Which you already own. And I\'m still in ink? Rude.';
  return {say,mood:R.raid?'proud':evRaidOpen(cur)||ready>=0?'excited':'curious',chips:[open]};
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
  const L=LADDERS[ex.k],M=MOVES[ex.name],nx=M&&CHAINS[M.a][M.c][1][M.i+1];
  return {say:`${dn(ex.name)}: ${ex.cue}${ex.current?` That's on today's ${L.title.toLowerCase()} block.`:''}${nx&&ex.current?` Next in line: ${dn(nx[0]).toLowerCase()}, at level ${nx[1]}.`:''}`,demo:demoOf(ex.name)?ex.name:null,mood:'happy'};
};
AH.motivate=()=>{
  const sp=todaysSplit(),rec=todayRec(),n=buildQuestItems().filter(i=>!i.warm).length;
  const tail=rec.completed?' Quest is already done today though, so rest, legend.':sp.rest?' It\'s a recovery day anyway: just stretch.':` Today is only ${n} moves. Start the warm-up and see.`;
  const past=S.totalReps>=200?` You've already done ${fmtK(S.totalReps)} reps since ${fmtDate(S.startDate)}. That person doesn't quit.`:'';
  return {say:arSay('motivate')+tail+(S.streak?` Your streak is ${S.streak} days. Protect it.`:past),mood:'excited',chips:rec.completed||sp.rest?null:[chip('Start workout','arrowStart')]};
};
AH.pain=()=>({say:arSay('pain'),mood:'scared'});
/* ---------- what Arrow knows: training, food and rest ----------
   Each tip: id, category, what it answers, the answer, and a deeper follow-up for "tell me more".
   Answers read the Player's own numbers (c.T targets, c.ds diet, S progress) where they matter. */
const arProteinFoods=ds=>({veg:'curd, paneer, dal, chana, soya chunks and milk',egg:'eggs, curd, paneer, dal and soya chunks',nonveg:'eggs, chicken, fish, curd and paneer'})[ds.type]||'eggs, curd, paneer and dal';
const TIP=(id,cat,re,say,more)=>({id,cat,re,say:typeof say==='function'?say:()=>say,more:more&&(typeof more==='function'?more:()=>more)});
const AR_KB=[
  // training
  TIP('abs','train',/\babs\b|six ?pack|belly|\bpet\b|tummy|stomach|love handles/,'Abs are built in the kitchen and revealed by the scale. Your core ladder trains them 3 times a week; a small calorie deficit shows them. Crunches alone won\'t.',
    'You can\'t burn fat from one spot. Belly fat goes when overall body fat goes: a steady deficit, high protein, and your core block for strength. Most people see the top abs first and the lower ones last.'),
  TIP('muscle','train',/muscle|bigger|mass|size|arms|biceps|triceps|chest|shoulders/,c=>`Muscle needs three things: harder reps over time (your ladders do that), about ${c.T.p} g of protein a day for you, and 7 to 9 hours of sleep. Eat at a small surplus, which is your lean bulk.`,
    'Harder over time is the key word. When a step feels easy, the ladder moves you to a harder version: more lean, less support, slower reps. That is how bodyweight training keeps building muscle without weights.'),
  TIP('rest-sets','train',/rest between|between sets|how long.*rest|rest time/,'60 to 90 seconds for strength moves, 30 seconds for stretches. Your workout timer already does it, by the way.',
    'Short rest feels harder, but full rest lets you do better reps. For strength, quality wins. Rest until your breathing settles, then go.'),
  TIP('reps','train',/increase|more (push|pull|reps)|improve my (push|pull|squat|dip|plank)|\breps\b|first (push|pull) ?up|can'?t do (a |one )?(push|pull)/,'Own your current step first: two clean sets at the graduate target and the ladder moves you up. Between workouts, do a few easy sets through the day, never to failure.',
    'Can\'t do your first push-up or pull-up yet? Go easier, not harder: wall or table push-ups, table rows, and slow lowering (5 seconds down). Lowering builds strength fastest. You\'ll get the full rep sooner than you think.'),
  TIP('stamina','train',/stamina|endurance|cardio|\brun(ning)?\b|breathless|out of breath|steps|walk(ing)?/,'Stamina comes from your speed days: short hard bursts, full rest. Add a 20-minute walk on recovery days and aim for 7,000 to 10,000 steps a day. Boring, effective.',
    'Two engines: short hard intervals (your speed block) raise your ceiling, and easy walking or jogging where you can still talk builds the base. Mostly easy, a little hard.'),
  TIP('flex','train',/flexib|splits|stretch|tight|stiff/,'Stretch after training, when you\'re warm. Hold 30 to 60 seconds, breathe, never bounce. Your flex ladder does exactly this.',
    'Flexibility comes from doing it often, not hard. Five minutes every day beats an hour once a week. Breathe out and relax into the stretch; never push into pain.'),
  TIP('plateau','train',/plateau|stuck|stall|not improving|no progress/,'Stuck? Sleep more, eat enough protein, and slow the reps down (3 seconds down). Plateaus break when recovery catches up.',
    'Check the boring stuff first: sleep under 7 hours, protein under target, or training while wrecked. Then change one thing: slower reps, a harder variation, or a lighter week to recover.'),
  TIP('speed','train',/\bfast(er)?\b|speed|explosive|quick/,'Speed is explosive reps with full rest. Quality over quantity: stop the set when you slow down.',
    'Fast work trains your nerves, not just muscles. Do it fresh, early in the workout, and stop before you get sloppy. Jumps and sprints done tired just teach you to move slowly.'),
  TIP('sets','train',/\bsets\b|how many (sets|exercises)|how much should i train|how long should i (train|work ?out)/,'Three sets per move is the sweet spot here, four on boss days. More isn\'t better, better is better.',
    'Around 10 hard sets per muscle a week is plenty for most people, and your plan sits right there. If you want more, add a set to your weakest area, not to everything.'),
  TIP('warmup','train',/warm ?up|warming up|before (a |my |the )?workout/,'Warm up every time: 5 minutes of joint circles and easy reps of your first move. Your quest starts with one for a reason. Warm muscles perform, cold ones strain.',
    'A good warm-up goes from easy to specific: get warm, move the joints you\'ll use, then do a couple of easy sets of the first exercise. Long static stretches are for after.'),
  TIP('breathing','train',/breath(e|ing)|hold my breath/,'Breathe out on the hard part (pushing up, standing up) and in on the way down. Never hold your breath through a whole set.'),
  TIP('form','train',/\bform\b|technique|proper(ly)?|correct way|slow reps|half reps/,'Slow, full reps beat fast half reps every time. If your form breaks, the set is over, even if the number isn\'t.',
    'Film yourself from the side once a week. Hips sagging, elbows flaring and half range of motion are the usual mistakes, and they are easy to spot on video.'),
  TIP('time','train',/morning or (evening|night)|best time|what time.*(train|work ?out)|empty stomach/,'The best time to train is the one you\'ll keep. Mornings make it a habit before excuses wake up; evenings you\'re a little stronger. Pick one and protect it.',
    'Training on an empty stomach in the morning is fine for a short session. If you feel weak or dizzy, have a banana or a glass of milk first.'),
  TIP('sick','train',/\bsick\b|fever|\bcold\b|cough|\bflu\b|unwell|not well|\bill\b/,'Sick? Only a runny nose: light movement is fine. Fever, chest cold, or body aches: rest completely and use your Rest Pass. Training sick just makes it last longer.'),
  TIP('missed','train',/missed (a |my |the )?(day|workout|quest)|skipped (a |my |the )?(day|workout)|make up|double workout/,'Missed a day? Don\'t double up tomorrow, just do the next quest. Consistency beats intensity. Clear any penalty, then move on.'),
  TIP('height','train',/taller|shorter|height|grow tall|stunt/,'Training won\'t stunt your growth, and it won\'t add height either. Genes and sleep decide that. Good posture and enough sleep help you stand at your full height.'),
  TIP('posture','train',/posture|hunch|slouch|rounded shoulders|desk/,'Desk all day? Do your mobility block, chin tucks and wall slides, and stand up every 30 minutes. Pulling exercises (rows) fix rounded shoulders better than stretching alone.'),
  TIP('gym','train',/\bgym\b|weights|dumbbell|calisthenics|bodyweight|no equipment|at home/,'Bodyweight training builds real strength as long as the reps get harder over time, and your ladders make sure they do. A gym is great later, especially for legs. You don\'t need one to start.'),
  TIP('wrist','train',/(wrists?|knees?|elbows?|lower back) (hurt|hurts|pain|ache|aches)|joint pain|joints/,'Joints complaining? Warm them up first, shorten the range, and take an easier step on the ladder. If it\'s sharp pain or swelling, stop and get it checked.'),
  // food: specific topics first, the general ones (protein, fat loss, eating healthy) last
  TIP('veg','food',/\bveg(etarian|an)?\b|without (meat|egg)|no (meat|egg)/,'Vegetarian protein that works: soya chunks (about 50 g per 100 g dry), paneer, curd and Greek yogurt, dal, chana and rajma, tofu, milk and peanuts. Mix grains with dal for complete protein.',
    'Vegetarians: ask a doctor to check B12 and vitamin D once in a while. They are the two most commonly low, and both cause tiredness.'),
  TIP('whey','food',/whey|protein (powder|shake)|shake/,'Whey is just milk protein as a powder. Handy if you can\'t reach your protein from food; not magic. One scoop is about 20 to 25 g. Food first, shake if you\'re short.'),
  TIP('creatine','food',/creatine/,'Creatine monohydrate is the most studied supplement there is: 3 to 5 g every day, with water. It\'s safe for healthy adults and helps strength a little. You don\'t need it to progress. Under 18, or with any kidney problem, ask a doctor first.'),
  TIP('supps','food',/supplement|vitamin|multivitamin|pre ?workout|fat burner|steroid/,'Most supplements are a waste of money. Food, sleep and training do 95% of the work. Skip fat burners and never touch steroids. If you\'re always tired, a doctor can check vitamin D, B12 and iron.'),
  TIP('carbs','food',/\brice\b|carbs?|roti|chapati|bread|chawal|annam/,'Rice isn\'t the enemy. Carbs fuel your training. Watch the portion and pair it with protein: rice with dal and curd, roti with paneer or eggs.'),
  TIP('sugar','food',/sugar|sweets?|dessert|chocolate|mithai|junk|fast food|pizza|burger/,c=>`One sweet doesn\'t ruin anything; the daily habit does. Keep added sugar under ${c.T.s} g a day, have treats after a real meal, and log them honestly.`),
  TIP('cheat','food',/cheat (meal|day)|treat meal|party|wedding|eating out|restaurant/,'Plan it, enjoy it, log it, move on. One meal can\'t undo a week, but a whole weekend can. Pick the protein dish first and you\'ll eat less of the rest.'),
  TIP('water','food',/water|hydrat|thirst/,c=>`${c.T.water} glasses a day for you, more on training days and hot days. Pale yellow means you\'re good. Dark yellow means drink now.`),
  TIP('timing','food',/(before|after) (the |my |a )?(gym|training|workout)|pre ?workout meal|post ?workout|meal timing|when (should|to) i eat/,'Before training: something light with carbs 30 to 60 minutes earlier, like a banana or toast. After: a proper meal with protein within a couple of hours. Total protein for the day matters more than exact timing.'),
  TIP('fasting','food',/fasting|intermittent|breakfast|one meal a day|omad/,'Intermittent fasting works only if it helps you eat less overall. It\'s not magic. The catch: hitting your protein in a short eating window is harder. Skipping breakfast is fine if your totals are fine.'),
  TIP('late','food',/late (night|at night)|eat(ing)? at night|after (9|10|11)|before bed/,'Calories count the same at 10 pm as at 10 am. A heavy, spicy meal right before bed can hurt sleep, though. Late and hungry? Curd, milk or a few eggs.'),
  TIP('gain','food',/gain weight|too (thin|skinny)|underweight|hard ?gainer|bulk/,c=>`To gain: eat about 300 to 500 kcal above maintenance (your lean bulk target is ${fmtK(c.T.kcal)} kcal), hit ${c.T.p} g protein, and keep training. Liquid calories help: milk, banana shakes, peanut butter.`),
  TIP('fat','food',/\bfat\b|weight loss|lose weight|cut|deficit|slim|lean/,'Fat loss is mostly food: about a 20% calorie deficit with high protein. Say "goal cut" and I\'ll set it up. Keep training so the weight you lose is fat, not muscle.',
    'Aim to lose about 0.5 to 1% of your body weight a week. Faster than that and you lose muscle and energy. Weigh yourself in the morning, a few times a week, and watch the trend, not one day.'),
  TIP('fiber','food',/fib(er|re)|vegetables|veggies|salad|fruit|constipat/,c=>`Aim for ${c.T.fb} g of fiber: vegetables at two meals, a fruit or two, dal and oats. It keeps you full and your gut happy. Drink water with it.`),
  TIP('fats','food',/\bghee\b|\boil\b|butter|healthy fats|nuts/,'Fats aren\'t bad, they\'re just dense: a spoon of ghee or oil is about 100 kcal. A little at each meal is good for you. Measure the oil once and you\'ll be shocked.'),
  TIP('eggs','food',/\beggs?\b|yolk|anda|guddu/,'Eggs are great: about 6 g protein and 70 kcal each. The yolk is fine for most people and holds most of the vitamins. 2 to 4 a day is normal.'),
  TIP('caffeine','food',/coffee|caffeine|\btea\b|chai|energy drink/,'Coffee before training can help a bit. Keep it moderate, skip it after mid-afternoon so you can sleep, and skip energy drinks: they\'re sugar and noise.'),
  TIP('alcohol','food',/alcohol|beer|drink(ing)? (alcohol|beer)|daru|wine/,'Alcohol slows recovery, hurts sleep and adds empty calories. If you drink, keep it rare and small, and never on a training day before the workout.'),
  TIP('protein','food',/protein/,c=>`Your protein target is ${c.T.p} g a day, about 1.6 g per kg of body weight. Spread it over 3 or 4 meals: ${arProteinFoods(c.ds)}.`,
    c=>`Easy wins: a bowl of curd is about 10 g, 100 g of paneer about 18 g, a katori of dal about 7 g, 50 g of dry soya chunks about 26 g${c.ds.type!=='veg'?', and each egg about 6 g':''}. Add one of these to every meal and you\'re most of the way there.`),
  TIP('healthy','food',/eat healthy|healthy diet|clean eating|balanced diet|what is healthy/,c=>`Simple plate: half vegetables, a quarter protein, a quarter carbs. Protein at every meal (${c.T.p} g a day for you), water all day, treats after real food. Boring and it works.`),
  // rest
  TIP('sleep','rest',/sleep|slept|nidra|neend|insomnia|tired in the morning|bed ?time/,'7 to 9 hours. Sleep is when your muscles actually get rebuilt. Same bedtime every night, screens away 30 minutes before, a dark, cool room.',
    'Can\'t fall asleep? No caffeine after 2 pm, train earlier in the day, keep the phone out of the bed, and get morning sunlight. If you wake up tired every day for weeks, see a doctor.'),
  TIP('sore','rest',/\bsore\b|soreness|doms|muscles? (hurt|ache)|body pain/,'Soreness is normal and fades in 1 to 3 days. Move gently, drink water, eat your protein and sleep. Sore muscles can still train lightly; sharp pain can\'t.'),
  TIP('restdays','rest',/rest days?|day off|how often|every day|train daily/,'Your plan already has a recovery day each week. Most people do best with 1 or 2 easy days a week. Training hard 7 days in a row just makes you slower.'),
  TIP('overtrain','rest',/overtrain|burn(ed)? ?out|always tired|exhausted|no energy/,'Tired all the time, worse reps, bad sleep and constant soreness are signs you need 2 or 3 easy days. Eat more, sleep more, then come back. Rest is training too.')
];
/* The best tip for a message: the first in its own category, else any category. */
function arTip(c,cat){const hits=AR_KB.filter(t=>t.re.test(c.low));return hits.find(t=>t.cat===cat)||hits[0]||null}
const arTipReply=(c,t,mood)=>({say:t.say(c),mood:mood||'thinking',ctx:{tip:t.id,seen:[t.id]},chips:t.more?[chip('Tell me more','arrowAsk','tell me more')]:null});
AH.coach_tip=c=>{const t=arTip(c,'train');return t?arTipReply(c,t):{say:'Show up, add a rep or a few seconds each week, eat your protein and sleep. Boring is how strong people get strong.',mood:'thinking'}};
/* A food named without a topic: a one-line verdict on what it is good for. */
function arFoodVerdict(c){
  const r=flParse(c.text,c.ds.custom);if(!r.items.length)return null;
  return r.items.slice(0,3).map(i=>{const pr=i.k?i.p*4/i.k:0,junk=/junk|sweet/.test(i.tags||'');
    return `${i.q}: ${fmtK(i.k)} kcal, ${Math.round(i.p)} g protein. ${junk?'A treat. Fine sometimes, not daily.':pr>=.25?'Great protein for the calories.':pr>=.12?'Decent, add a protein side.':'Mostly carbs and fat, so pair it with protein.'}`}).join(' ');
}
AH.nutrition_tip=c=>{
  const t=arTip(c,'food');if(t)return arTipReply(c,t);
  const v=arFoodVerdict(c);if(v)return {say:v,mood:'thinking',work:'searching'};
  return {say:`Keep it simple: protein at every meal (${c.T.p} g a day for you), half your plate vegetables, water all day, treats after real food. Ask me something specific: whey, creatine, rice, sugar, cheat meals, eating late.`,mood:'thinking'};
};
AH.recovery=c=>{
  const t=arTip(c,'rest'),sp=todaysSplit();
  if(t&&t.cat==='rest'&&t.id!=='sore')return arTipReply(c,t);
  const sleep=/sleep|slept|nidra|neend/.test(c.low);
  return {say:`${sleep?'Short sleep hurts recovery more than skipping a set. Train lighter today and get 7 to 9 hours tonight.':'Soreness is normal and it fades. Move gently, drink water, eat your protein and sleep 7 to 9 hours.'} Today is ${sp.rest?'a recovery day, perfect timing':`${sp.type}: do the warm-up, then decide. If it's sharp pain rather than soreness, stop`}.${passUsedThisWeek()?'':' You also have a Rest Pass this week if you truly need the day.'}`,mood:'thinking',ctx:{tip:'sore',seen:['sore']}};
};

/* ---------- your numbers, read like a coach ---------- */
/* Food days before today that have something logged, newest first. */
function arFoodDays(ds,n){const out=[];for(let i=1;i<=n;i++){const d=addDays(todayStr(),-i),day=(ds.food||{})[d];if(day&&day.items&&day.items.length)out.push(Object.assign({d,water:day.water||0},flTotals(day)))}return out}
/* Training days and reps from day `from` up to (not including) `to`. */
function arTrained(from,to){let n=0,reps=0;for(let d=from;d<to;d=addDays(d,1)){const r=S.log[d];if(r&&r.completed&&!r.rested)n++;if(r&&r.sets)Object.values(r.sets).forEach(a=>a.forEach(x=>reps+=x))}return {n,reps}}
const arAvg=(a,k)=>a.length?a.reduce((s,x)=>s+x[k],0)/a.length:0;
const arName=()=>{const n=S.profile&&S.profile.name;return n&&n!=='Hunter'?n:''};
/* Everything worth saying about the Player's training and food right now, most important first. */
function arInsights(c){
  const {ds,T}=c,out=[],add=(p,say,ch)=>out.push({p,say,ch}),today=todayStr(),h=flHour(),rec=todayRec(),sp=todaysSplit();
  if(penaltyDue())add(100,`Clear your penalty quest first: ${Math.max(0,S.penaltyReps-S.penaltyProgress)} reps owed. It only grows if you wait.`,chip('Open Quest','arrowGo','quest'));
  if(!rec.completed&&!sp.rest)add(h>=17?90:30,h>=17?`Today's quest is still open and it's evening. Even a quick, honest session beats a penalty.`:`Today is ${sp.type}. Start before lunch and it won't follow you around all day.`,chip('Start workout','arrowStart'));
  const two=arTrained(addDays(today,-14),today);
  if(dayDiff(S.startDate,today)>=10&&two.n<6)add(80,`You trained ${two.n} of the last 14 days. Aim for at least 4 a week. A short quest beats a skipped one, every time.`);
  const wk=arTrained(addDays(today,-7),today);if(wk.n>=7)add(60,'Seven training days in a row. Respect, but take your recovery day seriously. Muscles grow on rest days.');
  if(S.streak&&S.bestStreak-S.streak>0&&S.bestStreak-S.streak<=3)add(55,`You're ${S.bestStreak-S.streak} day${S.bestStreak-S.streak>1?'s':''} away from beating your best streak of ${S.bestStreak}. Go get it.`);
  const st=nextRank()&&trialStatus(nextRank().r);if(st&&st.ready)add(75,`Your ${nextRank().r}-Rank trial is open. Go take it in Gates.`,chip('Open Gates','arrowGo','gates'));
  if(S.statPoints)add(65,`You have ${S.statPoints} unspent stat point${S.statPoints>1?'s':''}. Free power, just sitting there.`,chip('Spend points','arrowAlloc'));
  const fd=arFoodDays(ds,7);
  if(!fd.length)add(50,'You haven\'t logged food all week. I can\'t coach what I can\'t see. Log just your meals for 3 days and I\'ll tell you exactly what to fix.');
  else{
    const p=arAvg(fd,'p'),k=arAvg(fd,'k'),w=arAvg(fd,'water'),g=ds.goal||'bulk';
    if(p<T.p*.8)add(85,`Protein averages ${Math.round(p)} g on the days you log, against a target of ${T.p} g. Add one of these to every meal: ${arProteinFoods(ds)}.`,chip('What should I eat?','arrowAsk','what should i eat'));
    if(g==='bulk'&&k<T.kcal*.85)add(70,`For a lean bulk you're eating ${fmtK(Math.round(k))} kcal a day on average, ${fmtK(Math.round(T.kcal-k))} short. No surplus, no new muscle. Add a snack: milk and a banana, or peanut chikki.`);
    if(g==='cut'&&k>T.kcal*1.1)add(70,`For fat loss you're averaging ${fmtK(Math.round(k))} kcal, above your ${fmtK(T.kcal)} target. Trim the oil and the evening snack first.`);
    if(w<T.water*.7)add(55,`Water averages ${Math.round(w)} of ${T.water} glasses. Keep a bottle where you can see it.`);
    if(fd.length<4)add(35,`You logged food on ${fd.length} of the last 7 days. More logging, better advice.`);
  }
  const done=Object.entries(S.log).filter(([d,r])=>d>=addDays(today,-14)&&d<today&&r.completed&&!r.rested);
  if(done.length>=4&&done.filter(([,r])=>r.cooled).length/done.length<.5)add(50,'You skip the cool-down most days. It\'s four stretches and it\'s where Flexibility grows.');
  const ss=Object.entries(S.stats).sort((a,b)=>a[1]-b[1]);if(ss[ss.length-1][1]-ss[0][1]>=4)add(45,`${ss[0][0]} is your weakest stat (${Math.round(ss[0][1])} against ${Math.round(ss[ss.length-1][1])} ${ss[ss.length-1][0]}). Give its block your full effort, and put your next stat points there.`);
  if(!ds.body)add(40,'Tell me your height, age and sex so your food targets are exact, not guesses.',chip('Set my targets','botSetup'));
  if(typeof evNow==='function'){const cur=evNow(),R=evRun(cur.n);if(!R.raid&&evRaidOpen(cur))add(35,`The ${cur.ev.raid.boss} raid is open. That weapon won't win itself.`,chip('Open the event','arrowGo','event'));
    else if(cur.ev.chapters.some((x,i)=>evChapter(cur,i)==='ready'))add(25,`A ${cur.ev.short} chapter is ready. A little story, then you sweat.`,chip('Open the event','arrowGo','event'))}
  return out.sort((a,b)=>b.p-a.p);
}
const arNumbered=a=>a.map((x,i)=>`${i+1}) ${x.say}`).join(' ');
AH.ask_advice=c=>{
  /* "how can I improve my stamina" is a topic question, not a review of your numbers */
  const t=!/\b(advice|feedback|honest|weak\w*|wrong|fix|focus|routine|data|stats|numbers|lacking|holding|differently|enough|tips for me|coach me)\b/.test(c.low)&&arTip(c,'train');
  if(t)return arTipReply(c,t);
  if(notStarted())return {say:`Your journey starts ${fmtDate(S.startDate)}. Until then: sleep well, eat your protein, and get your height and age into your targets.`,mood:'curious'};
  const all=arInsights(c),top=all.slice(0,3),nm=arName();
  if(!top.length||top[0].p<30)return {say:`Honestly${nm?', '+nm:''}? You're doing well. Training is steady, food is on track. Keep the streak alive and add a rep where it feels easy.`,mood:'proud'};
  return {say:`Here's my honest read${nm?', '+nm:''}: ${arNumbered(top)}`,mood:'thinking',work:'searching',ctx:{rest:all.slice(3)},
    chips:[...top.map(x=>x.ch).filter(Boolean).slice(0,2),...(all.length>3?[chip('What else?','arrowAsk','what else')]:[])]};
};
AH.ask_progress=c=>{
  const today=todayStr(),now=arTrained(addDays(today,-7),addDays(today,1)),then=arTrained(addDays(today,-14),addDays(today,-7)),bits=[];
  const wks=Math.max(1,Math.ceil(dayDiff(S.startDate,today)/7));
  bits.push(`Week ${weekNumber()}: you're Level ${S.level}, ${currentRank().r}-Rank, with ${S.totalQuests} quest${S.totalQuests===1?'':'s'} and ${fmtK(S.totalReps)} reps in total.`);
  if(then.n||now.n){const d=then.reps?Math.round((now.reps-then.reps)/then.reps*100):null;
    bits.push(`Last 7 days: ${now.n} training day${now.n===1?'':'s'} and ${fmtK(now.reps)} reps${then.n?`, against ${then.n} and ${fmtK(then.reps)} the week before${d?` (${d>0?'+':''}${d}%)`:''}`:''}.`)}
  const prs=Object.entries(S.prs||{}).filter(([,r])=>r.date>=addDays(today,-30));
  if(prs.length){const b=prs.sort((a,b)=>b[1].date.localeCompare(a[1].date))[0];bits.push(`${prs.length} new record${prs.length>1?'s':''} this month, the latest ${dn(b[0]).toLowerCase()} at ${b[1].best}.`)}
  const up=now.reps>then.reps*1.05||prs.length>=2,down=then.n&&now.n<then.n-1;
  bits.push(up?'Verdict: you are getting stronger. The numbers don\'t lie.':down?'Verdict: you slipped a little this week. One good week fixes it.':wks<2?'Verdict: too early to tell. Give me two weeks of data.':'Verdict: steady. Steady is how strong people are built.');
  return {say:bits.join(' '),mood:up?'proud':down?'thinking':'happy',chips:[chip('How do I improve?','arrowAsk','give me advice')]};
};
AH.daily_plan=c=>{
  if(notStarted())return {say:`Your journey starts ${fmtDate(S.startDate)}. Today's plan: rest, eat well and get excited.`,mood:'curious'};
  const {day,T}=c,t=flTotals(day),rec=todayRec(),sp=todaysSplit(),h=flHour(),steps=[],chips=[];
  if(penaltyDue())steps.push(`Clear the penalty quest first (${Math.max(0,S.penaltyReps-S.penaltyProgress)} reps owed).`);
  if(rec.completed)steps.push('Quest: done. Nice.');
  else if(sp.rest)steps.push('Quest: recovery day. Stretch and take a walk.');
  else{steps.push(`Quest: ${sp.name}, ${sp.type.toLowerCase()}, ${buildQuestItems().filter(i=>!i.warm).length} moves.${h>=17?' Do it before dinner.':''}`);chips.push(chip('Start workout','arrowStart'))}
  const q=suddenActive();if(q)steps.push(`Sudden quest: ${q.task}. It expires soon.`);
  if(typeof evNow==='function'){const cur=evNow(),R=evRun(cur.n),M=evMission(),ready=cur.ev.chapters.findIndex((x,i)=>evChapter(cur,i)==='ready');
    if(M)steps.push(`Story: finish your chapter ${M.i+1} mission.`);else if(!R.raid&&evRaidOpen(cur))steps.push(`Story: the raid against ${cur.ev.raid.boss} is open.`);
    else if(ready>=0)steps.push(`Story: chapter ${ready+1} of ${cur.ev.short} is ready.`);if(M||ready>=0||(!R.raid&&evRaidOpen(cur)))chips.push(chip('Open the event','arrowGo','event'))}
  const kl=Math.max(0,T.kcal-t.k),pl=Math.max(0,Math.round(T.p-t.p)),wl=Math.max(0,T.water-day.water);
  steps.push(pl?`Food: ${fmtK(kl)} kcal and ${pl} g protein to go. Next up: ${mealNow()}.`:'Food: protein done. Eat to your calories and you\'re finished.');
  if(wl)steps.push(`Water: ${wl} more glass${wl>1?'es':''}.`);
  steps.push(h>=21?'Sleep: lights out soon. 7 to 9 hours is part of the plan.':'Sleep: aim for 7 to 9 hours tonight.');
  chips.push(chip('What should I eat?','arrowAsk','what should i eat'));
  return {say:`Today's plan${arName()?', '+arName():''}: ${steps.map((s,i)=>`${i+1}) ${s}`).join(' ')}`,mood:'curious',chips:chips.slice(0,3)};
};

/* ---------- feelings: no sass here ---------- */
const AR_CRISIS=/\b(kill(ing)? my ?self|suicid\w*|end(ing)? (it all|my life)|want(ed)? to die|wanna die|don'?t want to (live|be alive|wake up)|no reason to live|better off dead|self[- ]?harm|cut(ting)? my ?self|hurt(ing)? my ?self|chachipovalani|chanipovalani|chavalani undi|marna chah\w*|mar jana chah\w*|jeena nahi chah\w*)\b/;
const AR_FEEL=[
  [/stress|anxious|anxiety|panic|overwhelm|pressure|tension|exam|deadline|can'?t handle|too much/,'That sounds heavy. Try this right now: breathe in for 4 seconds, hold for 4, out for 4, hold for 4. Four rounds. Then pick the single smallest next step and do only that. A 10-minute walk helps more than it should.'],
  [/lonely|alone|nobody|no one|no friends|akela|ontari/,'I\'m here, and I\'m not going anywhere. I literally live in your phone. But you deserve more than a ball with eyes: message one person today, even just "hey". Most people are glad to hear from you.'],
  [/fail|useless|worthless|not good enough|hate myself|loser|waste|bekaar|bekar|pathetic/,'Hey. You\'re not a failure, you\'re mid-story. Jinwoo started as the weakest hunter alive. You showed up here today, which already beats most people. Talk to yourself the way you\'d talk to a friend.'],
  [/ugly|fat|hate my body|my body|look bad|insecure/,'Your body isn\'t a before photo. It carries you through every quest. Progress shows up first in what you can do, and the mirror catches up later.'],
  [/break ?up|heart ?broken|heartbreak|dumped|dil toot|miss (him|her)/,'Heartbreak is real pain. Let it hurt, but keep eating, keep sleeping and keep moving. Training is one of the best things you can do for a heavy heart. One day at a time.'],
  [/angry|frustrated|irritated|annoyed|gussa|kopam/,'Angry is fuel. Put it somewhere useful: 20 hard push-ups, a fast walk, then decide what to do. Never send the text while you\'re still hot.']
];
AH.feeling_down=c=>{
  const f=AR_FEEL.find(([re])=>re.test(c.low)),long=/depress|weeks|months|always|every ?day|for a long time|nothing helps/.test(c.low);
  const base=f?f[1]:long?'That sounds like a lot to carry, and I\'m glad you said it out loud. Be gentle with yourself today: water, food, some fresh air, and the warm-up only if you feel like it.'
    :'Rough day? That\'s allowed. You don\'t have to fix everything tonight. Drink some water, get some fresh air, and if you feel like it, just do the warm-up. Moving changes your mood more than you\'d think.';
  const say=base+(long?' If it\'s been heavy for weeks, please talk to someone you trust or a counsellor. That\'s strength, not weakness.':/I'm here/.test(base)?'':' I\'m right here.');
  return {say,mood:'sad',chips:[chip('Tell me a joke','arrowAsk','tell me a joke'),chip('Plan an easy day','arrowAsk','plan my day')]};
};
function arCrisis(){return {say:'I\'m really glad you told me, and I\'m taking it seriously. I\'m only an app, so please reach a real person right now: someone you trust, or a helpline. In India, Tele-MANAS is free and open day and night: call 14416. If you\'re in danger right now, call 112 in India, or your local emergency number anywhere else. You matter far more than any streak.',mood:'sad',chips:[],intent:'feeling_down',src:'safety'}}

/* ---------- fun facts and follow-ups ---------- */
const AR_FACTS=['Your heart is a muscle that never gets a rest day. Show it some respect with your speed block.',
  'Muscle is rebuilt while you sleep. Growth hormone peaks in deep sleep, early in the night.',
  'Soreness isn\'t proof of a good workout, just of a new one. Your best sessions might not hurt at all the next day.',
  'Muscle memory is real: getting back strength you once had is much faster than building it the first time.',
  'Soya chunks are about half protein by dry weight. That\'s more than chicken breast.',
  'More than half the protein in an egg is in the white, but most of the vitamins are in the yolk. Eat both.',
  'It takes very roughly 7,700 kcal of extra food to gain a kilo of fat. One big biryani can\'t do that overnight. Relax.',
  'Water is around 60% of your body. A small drop in hydration already makes workouts feel harder.',
  'Grip strength predicts long-term health surprisingly well in big studies. Dead hangs count.',
  'In Solo Leveling, Jinwoo\'s daily quest was 100 push-ups, 100 sit-ups, 100 squats and a 10 km run. Yours grows with you instead.',
  'Sung Jinwoo started as the weakest E-rank hunter alive. Everybody starts at level 1.',
  'Beru was the Ant King of Jeju Island before he knelt to the Shadow Monarch.',
  'Static stretching before training doesn\'t prevent soreness. A proper warm-up does more to prevent injuries.',
  'Short, hard bursts of effort, like your speed days, build fitness in less time than long, slow cardio.',
  'Laughing works your abs. A tiny bit. It does not replace the core block.',
  'Your body has over 600 muscles. A push-up uses a whole team of them at once.'];
/* Pick a line not used recently (remembered per list in the diet store). */
function arFresh(ds,key,list){ds.arrowSeen=ds.arrowSeen||{};let s=(ds.arrowSeen[key]||[]).filter(i=>i<list.length);if(s.length>=list.length)s=[];
  const free=list.map((_,i)=>i).filter(i=>!s.includes(i)),i=free[Math.floor(Math.random()*free.length)];ds.arrowSeen[key]=[...s,i];return list[i]}
AH.fun_fact=c=>({say:arFresh(c.ds,'fact',AR_FACTS),mood:'playful',chips:[chip('Another one','arrowAsk','another one')]});
/* "Tell me more", "another one", "why?": continue whatever Arrow said last. */
AH.more=c=>{
  const x=c.ctx||{};
  if(x.tip){const t=AR_KB.find(k=>k.id===x.tip),seen=x.seen||[x.tip];
    if(t&&t.more&&!x.deep)return {say:t.more(c),mood:'thinking',ctx:{tip:t.id,seen,deep:true}};
    const nx=t&&AR_KB.find(k=>k.cat===t.cat&&!seen.includes(k.id));
    if(nx)return {say:`${/another|one more|next|inkoti|ek aur/.test(c.low)?'Another one':'Related'}: ${nx.say(c)}`,mood:'thinking',ctx:{tip:nx.id,seen:[...seen,nx.id]},chips:nx.more?[chip('Tell me more','arrowAsk','tell me more')]:null}}
  if(x.rest&&x.rest.length)return {say:`Also: ${arNumbered(x.rest.slice(0,2))}`,mood:'thinking',ctx:{rest:x.rest.slice(2)},chips:x.rest.slice(0,2).map(i=>i.ch).filter(Boolean)};
  if(x.rest)return {say:'That\'s everything on my list. Go fix the first one, then come back.',mood:'proud'};
  const again={joke:AH.joke,fun_fact:AH.fun_fact,motivate:AH.motivate,feeling_down:AH.feeling_down,ask_advice:AH.ask_advice}[x.i];
  if(again)return again(c);
  return {say:'More about what? I can go deeper on training, food, sleep or your stats.',mood:'curious',
    chips:[chip('Give me advice','arrowAsk','give me advice'),chip('Plan my day','arrowAsk','plan my day'),chip('Fun fact','arrowAsk','tell me a fun fact')]};
};

/* ---------- Arrow's own look ---------- */
const AR_SKIN_NAME=[[/\bink\b|default|normal|original|\bblack\b|plain|classic/,''],[/cartenon|stone|statue/,'stone'],[/\borcs?\b/,'orc'],[/giant/,'giant'],[/frost|\bice\b|snow/,'frost'],
  [/fang|wolf|beast|rakan/,'fang'],[/plague|insect|\bbug\b|queen/,'plague'],[/faceless|mask|mirror|yogumunt/,'faceless'],[/system|\bblue\b/,'system'],[/flame|fire|undying/,'flame'],
  [/sovereign/,'sovereign'],[/monarch|purple|antares/,'monarch']];
const arSkinName=k=>k?ARROW_SKINS[k].n:'Ink';
AH.arrow_skin=c=>{
  const hit=AR_SKIN_NAME.find(([re])=>re.test(c.low)),id=hit?hit[1]:null,p=S.profile||{},cur=p.arrowSkin&&S.skins.includes(p.arrowSkin)?p.arrowSkin:'';
  const owned=S.skins.filter(k=>ARROW_SKINS[k]),asking=/\b(how|unlock|get|earn|where|kaise|ela|ekkada)\b/.test(c.low);
  const wear=k=>chip(`Wear ${arSkinName(k)}`,'arrowWear',k);
  if(id!==null){
    if(id&&!S.skins.includes(id))return {say:`I don't have ${arSkinName(id)} yet. To unlock it: ${skinHow(id).todo.replace(/^./,m=>m.toLowerCase())}. The second you do, I'm wearing it.`,mood:'sad',chips:owned.filter(k=>k!==cur).slice(0,3).map(wear)};
    if(asking)return {say:`You already have ${arSkinName(id)}${id===cur?' and I\'m wearing it':''}.${id===cur?'':' Want me to put it on?'}`,mood:'happy',chips:id===cur?null:[wear(id)]};
    if(id===cur)return {say:`I'm already wearing ${arSkinName(id)}. Keep up.`,mood:'playful'};
    equipSkin(id);return {say:id?`${arSkinName(id)} on. How do I look? Be nice.`:'Back in classic ink. Timeless.',mood:'proud'};
  }
  const locked=Object.keys(ARROW_SKINS).filter(k=>!S.skins.includes(k)),nxt=locked.find(k=>ARROW_SKINS[k].how)||locked[0];
  let say=`I'm wearing ${arSkinName(cur)}. ${owned.length?`You've unlocked ${owned.length} of ${Object.keys(ARROW_SKINS).length}: ${arList(owned.map(arSkinName))}.`:'You haven\'t unlocked any skins yet.'}`;
  if(nxt)say+=` Closest one to earn: ${arSkinName(nxt)}. ${skinHow(nxt).todo}.`;
  say+=' To see them all, tap your avatar at the top right of the main screen and scroll to Arrow skin, or just tell me "wear" and a name.';
  return {say,mood:'happy',chips:[...owned.filter(k=>k!==cur).slice(0,2).map(wear),chip('Show all skins','arrowGo','skins')]};
};
AH.about_me=c=>{
  const p=S.profile||{},ds=c.ds,st=Object.entries(S.stats).sort((a,b)=>b[1]-a[1]),H=arHabits(ds),usual=Object.entries(H).map(([m,u])=>`${m} is ${u.sig.replace(/\+/g,', ').toLowerCase()}`);
  const bits=[`You're ${p.name||'a Hunter'}: Level ${S.level}, ${currentRank().r}-Rank, training since ${fmtDate(S.startDate)} (week ${weekNumber()}).`,
    `Goal: ${GOALS[ds.goal||'bulk'].n.toLowerCase()} on a ${DIET_TYPES[ds.type].label.toLowerCase()} diet, ${fmtK(c.T.kcal)} kcal and ${c.T.p} g protein a day${ds.body?'':' (estimated until you tell me your height and age)'}.`,
    `Best streak: ${S.bestStreak} day${S.bestStreak===1?'':'s'}. Strongest stat: ${st[0][0]}. Weakest: ${st[st.length-1][0]}.`];
  if(usual.length)bits.push(`Your usual ${arList(usual.slice(0,2))}.`);
  const L=arMem().mem.length;if(L)bits.push(`I've learned ${L} of your phrasings.`);
  bits.push('All of it stays on this phone.');
  return {say:bits.join(' '),mood:'proud'};
};
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
  if(AR_CRISIS.test(low))return arCrisis(); // safety first, whatever the model thinks
  const ctx=ds.arrowCtx&&Date.now()-ds.arrowCtx.at<15*60000?ds.arrowCtx:null; // what Arrow said last, for "tell me more"
  const c={ds,day:flDay(ds),T:foodTargets(ds),text,low,lang:arLang(text),ctx};
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
  /* Unsure between advice topics, but a tip clearly matches: answer it. */
  if(!force&&cls.src==='model'&&cls.p<.42&&cls.top.slice(0,2).some(x=>/^(coach_tip|nutrition_tip|recovery|ask_advice)$/.test(x.intent))){
    const t=arTip(c,'train');if(t){cls.intent={train:'coach_tip',food:'nutrition_tip',rest:'recovery'}[t.cat];cls.p=.5}}
  if(!force&&cls.src==='model'&&cls.p<.42&&low.split(/\s+/).length>1){
    return {say:arSay('clarify'),mood:'confused',chips:cls.top.slice(0,3).map(x=>chip(ARROW_LABEL[x.intent]||x.intent,'arrowPick',x.intent)),intent:null};
  }
  const r=(AH[cls.intent]||AH.out_of_scope)(c);
  if(cls.intent!=='more'||r.ctx)ds.arrowCtx=Object.assign({i:cls.intent,at:Date.now()},r.ctx||{});
  delete r.ctx;
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
  const ev=evNudge();if(ev)return ev; // the story event, at most once a day
  if(h>=10&&h<15&&!day.items.length)return {say:'No breakfast logged. Did you eat, or are we photosynthesizing now?',mood:'curious'};
  if(h>=15&&h<20&&!has('lunch')&&day.items.length<3)return {say:'Lunch? Hello? Log it or I\'ll assume you ate air.',mood:'curious'};
  if(h>=12&&day.water<Math.floor((h-8)/14*T.water)-2)return {say:`Water check: ${day.water} of ${T.water} glasses. Drink. Now.`,mood:'angry'};
  if(h>=20&&day.items.length&&t.p<T.p*.6)return {say:`${Math.round(T.p-t.p)} g protein left today. Curd, eggs or paneer before bed?`,mood:'thinking'};
  if(rec.completed&&S.streak>=3)return {say:`${S.streak}-day streak. Okay, I'm impressed. A little.`,mood:'proud'};
  return null;
}
let arNudgeT=0;
/* Nothing covers the orb: no reward card, no ARISE, no raid, no open layer. */
const arIdle=()=>revealIdle()&&!REVEALQ.length&&!document.body.classList.contains('locked');
/* One line in the bubble beside the orb; tapping it opens the chat with that line. */
function arBubble(say,ms){
  const b=$('arrowNudge');
  b.innerHTML=`<button class="an-say" data-act="arrowNudgeOpen">${esc(say)}</button><button class="an-x" data-act="arrowNudgeX" aria-label="Dismiss">${ic('x')}</button>`;
  b.dataset.say=say;b.classList.toggle('raised',$('arrowFab').classList.contains('raised'));b.hidden=false;b.classList.remove('in');void b.offsetWidth;b.classList.add('in');
  clearTimeout(arNudgeT);arNudgeT=setTimeout(()=>{b.hidden=true},ms);
}
function arrowNudge(){
  const p=S.profile||{},fab=$('arrowFab');if(!fab||fab.hidden||p.arrowNudge===false)return;
  if(!arIdle())return; // never over a reward, modal or open layer
  if(Date.now()-arReactAt<20000)return; // never talks over a big moment it just reacted to
  const M=arMem();if(Date.now()-(M.nudgeAt||0)<90*60000)return;
  const n=arrowNudgeText();if(!n)return;
  M.nudgeAt=Date.now();if(n.ev)M.evDay=todayStr();arMemSave(M);
  arBubble(n.say,12000);Bot.react(n.mood,3200);buzz('tap');
}

/* ---------- Arrow reacts to the big moments ----------
   Arrow watches the numbers that only move at a big moment. When one moves, it reacts
   with that moment's mood (two in turn for the biggest) once nothing covers it, and says
   one line if nudges are on. These lines don't count against the nudge limit. A death
   resets most numbers, so only a number going up is a moment. */
function arSnap(){
  const runs=S.events&&S.events.runs?S.events.runs:{};
  return {rank:RANKS.indexOf(currentRank()),deaths:S.deaths,level:S.level,quest:S.totalQuests,sudden:S.suddenDone,pen:S.penaltyLevel,
    gate:S.dungeons.filter(d=>d.ok).length,fail:S.dungeons.filter(d=>!d.ok).length,shadow:S.shadows.length,
    feats:Object.keys(S.feats),weapons:Object.keys(S.weapons),chest:S.login&&S.login.last,
    prs:Object.fromEntries(Object.entries(S.prs).map(([k,p])=>[k,p.best])),
    raids:Object.fromEntries(Object.entries(runs).map(([n,R])=>[n,R.clears||0])),
    chapters:Object.values(runs).reduce((a,R)=>a+(R.ch||[]).filter(Boolean).length,0)};
}
const arNew=(a,b)=>b.find(x=>!a.includes(x));
const arUp=(a,b)=>Object.keys(b).find(k=>b[k]>(a[k]||0));
const arPR=(a,b)=>Object.keys(b.prs).find(k=>a.prs[k]!==undefined&&b.prs[k]>a.prs[k]); // a first log is a baseline, not a record
/* [moment, moods, did it happen, what Arrow says], most important first: when several land together, the first plays. */
const AR_MOMENTS=[
  ['death',['sad'],(a,b)=>b.deaths>a.deaths,()=>'You died. I\'m not crying. You\'re crying.'],
  ['rank',['surprised','celebrate'],(a,b)=>b.rank>a.rank,()=>`${currentRank().r}-Rank?! Okay, Hunter. I need a minute.`],
  ['raid',['surprised','celebrate'],(a,b)=>!!arUp(a.raids,b.raids),(a,b)=>{const R=S.events.runs[arUp(a.raids,b.raids)],ev=R&&evById(R.id);return `${ev?ev.raid.boss:'The boss'} is down. Tell me you saw that.`}],
  ['gate',['excited'],(a,b)=>b.gate>a.gate,()=>'Gate cleared. Those monsters had no idea.'],
  ['arise',['surprised','excited'],(a,b)=>b.shadow>a.shadow,()=>`${S.shadows[S.shadows.length-1].n} answered your call. ARISE never gets old.`],
  ['level',['proud'],(a,b)=>b.level>a.level,()=>`Level ${S.level}. You're getting dangerous.`],
  ['quest',['celebrate'],(a,b)=>b.quest>a.quest,()=>'Daily quest cleared. Penalty zone avoided. Proud of you. A little.'],
  ['fail',['sad'],(a,b)=>b.fail>a.fail,()=>'That Gate won this round. Rest, then run it back.'],
  ['sudden',['laughing'],(a,b)=>b.sudden>a.sudden,()=>'Sudden quest? Handled. Too easy.'],
  ['feat',['happy'],(a,b)=>!!arNew(a.feats,b.feats),(a,b)=>{const f=FEATS.find(x=>x.id===arNew(a.feats,b.feats));return `${f?f.title:'New achievement'}. Show-off.`}],
  ['weapon',['playful'],(a,b)=>!!arNew(a.weapons,b.weapons),(a,b)=>{const w=WEAPONS[arNew(a.weapons,b.weapons)];return `${w?w.name:'A new weapon'}? Try not to cut yourself.`}],
  ['chapter',['happy'],(a,b)=>b.chapters>a.chapters,()=>'Chapter cleared. The story moves on.'],
  ['pr',['proud'],(a,b)=>!!arPR(a,b),(a,b)=>`New record on ${arPR(a,b)}. Who even are you?`],
  ['penalty',['scared'],(a,b)=>b.pen>a.pen,()=>`Penalty level ${S.penaltyLevel} of 5. I'd start running.`],
  ['chest',['playful'],(a,b)=>!!b.chest&&b.chest!==a.chest,()=>'Free loot. The System spoils you.'],
];
let arWas=S.profile?arSnap():null,arPend=null,arChainT=0,arReactAt=0,arLast=''; // the first look happens before startup applies missed days
function arrowWatch(){
  if(!S.profile){arWas=null;return} // before the Awakening
  const now=arSnap();
  if(arWas){
    const i=AR_MOMENTS.findIndex(m=>m[2](arWas,now));
    if(i>=0&&(!arPend||i<=arPend.i)){const [k,moods,,say]=AR_MOMENTS[i];arPend={i,k,moods,say:say(arWas,now),at:Date.now()}}
  }
  arWas=now;
  arrowReact();
}
/* Play the waiting moment where the bot can be seen: the orb, or the Diet card when the orb is off. */
function arrowReact(){
  const m=arPend;if(!m||window.__NO_REACT)return; // __NO_REACT: test hook
  if(Date.now()-m.at>10*60000){arPend=null;return} // the moment has passed
  if(!arIdle()||FL.open||BotGame.on)return;
  const orb=!$('arrowFab').hidden;if(!orb&&$('diet').hidden)return;
  arPend=null;arReactAt=Date.now();clearTimeout(arChainT);
  Bot.react(m.moods[0],m.moods[1]?1600:3400);
  if(m.moods[1])arChainT=setTimeout(()=>Bot.react(m.moods[1],3200),1500);
  if(orb&&S.profile.arrowNudge!==false)arBubble(m.say,7000);
  arLast=m.k;
}
setInterval(arrowWatch,1000);
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
ACT.arrowWear=k=>{const ds=dietState();equipSkin(k);flSay(ds,k?`${arSkinName(k)} on. How do I look?`:'Back in classic ink.');saveDietState(ds);renderBot();Bot.react('proud',2400)};
ACT.arrowAlloc=()=>{closeBot();ACT.allocate()};
ACT.arrowGoal=g=>{const ds=dietState();ds.goal=g;const t=foodTargets(ds);flDay(ds).msgs.push({w:'bot',x:`Goal set to ${GOALS[g].n}: ${fmtK(t.kcal)} kcal and ${t.p} g protein a day.`,at:Date.now()});saveDietState(ds);renderBot();Bot.react('proud',2400)};
ACT.arrowTheme=k=>flSend(k+' mode',false,'theme');
ACT.arrowForget=()=>{const M=arMem();M.mem=[];arMemSave(M);toast('Arrow forgot the phrases it learned');if(!$('menu').hidden)openMenu()};
arrowLoad();
