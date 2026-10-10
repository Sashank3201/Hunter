/* Hunter System: static game data. Pure data, no logic. */

const RANKS=[
  {r:'E',name:'Weakest Hunter',lv:0},
  {r:'D',name:'Awakened',lv:4},
  {r:'C',name:'Iron Body',lv:8},
  {r:'B',name:'Elite',lv:12},
  {r:'A',name:'Monarch Candidate',lv:16},
  {r:'S',name:'Shadow Monarch',lv:20}
];
const STATS=['Strength','Speed','Agility','Mobility','Flexibility'];

/* Progression ladders. Each step: [name, target reps/secs at that step, unit]
   The Hunter climbs a ladder when they hit the "graduate" target twice. */
const LADDERS={
  push:{stat:'Strength',title:'Push',steps:[
    ['Wall push-up',15,'Stand an arm\'s length from a wall, hands on it at chest height. Bend your elbows to bring your chest to the wall, then push back.'],
    ['Incline push-up (hands on chair/table)',12,'Hands on a heavy table or chair seat, body in one straight line. Lower your chest to the edge, then push away.'],
    ['Knee push-up',12,'Knees on the floor, body straight from knees to head. Lower your chest to just above the floor, then push up.'],
    ['Full push-up',10,'Hands under shoulders, body like a plank. Lower until your chest is a fist above the floor, then push up without sagging your hips.'],
    ['Diamond push-up',10,'Hands close together under your chest, thumbs and index fingers forming a diamond. Keep your elbows tight to your body.'],
    ['Decline push-up (feet on chair)',10,'Feet on a chair, hands on the floor. Keep a straight body and lower your chest between your hands.'],
    ['Archer push-up',8,'Hands wide. Lower toward one hand while the other arm stays straight, push up, then switch sides.'],
    ['Pseudo-planche push-up',8,'Hands beside your lower ribs, fingers turned out. Lean forward so your shoulders are ahead of your hands, then push up.']]},
  pull:{stat:'Strength',title:'Pull',steps:[
    ['Prone Y-T-W raise',12,'Lie face down. Lift your arms into a Y, then a T, then a W, squeezing your shoulder blades. Go slow.'],
    ['Backpack row (hinged)',10,'Hold a backpack loaded with books. Hinge forward at the hips with a flat back, then pull the bag to your belly button and lower slowly.'],
    ['Table row, feet flat',10,'Lie under a very heavy, stable table and grip the edge. Keep your body straight and pull your chest up to your hands. Test the table first: if it slides or tips, skip this.'],
    ['Table row, feet elevated',10,'Same as the table row, but with your feet on a low chair. Body stays in one straight line. Only use a table that does not move.'],
    ['Archer table row',8,'Pull toward one hand while the other arm stays mostly straight, then switch sides. Only use a table that does not move.'],
    ['Tempo table row (3s up, 3s down)',6,'A table row, but take 3 seconds to pull up and 3 seconds to lower. Only use a table that does not move.']]},
  legs:{stat:'Strength',title:'Legs',steps:[
    ['Chair sit-to-stand',15,'Sit on the edge of a sturdy chair, feet flat. Stand up without using your hands, then sit down slowly.'],
    ['Bodyweight squat',15,'Feet shoulder-width apart. Sit your hips back and down, chest up, knees over your toes. Stand tall.'],
    ['Split squat',10,'One foot forward, one back. Drop your back knee toward the floor, keep your front heel down, then stand up.'],
    ['Bulgarian split squat',10,'Back foot on a chair behind you. Lower straight down and drive up through your front heel.'],
    ['Assisted pistol (hold support)',6,'Hold a door frame or table edge. Sit down on one leg with the other leg out front, and stand using as little help as you can.'],
    ['Shrimp squat',6,'Hold your back foot behind you. Lower your back knee toward the floor on one leg, then stand.'],
    ['Pistol squat',5,'A full single-leg squat with the other leg straight out in front and your heel down.']]},
  core:{stat:'Strength',title:'Core',steps:[
    ['Dead bug',10,'Lie on your back, arms up, knees bent over your hips. Lower the opposite arm and leg slowly and keep your lower back on the floor.'],
    ['Plank (secs)',30,'Forearms on the floor, body in one straight line. Squeeze your abs and glutes and do not let your hips sag.'],
    ['Hollow hold (secs)',20,'On your back, press your lower back into the floor and lift your shoulders and straight legs slightly. Hold it tight.'],
    ['Leg raise',12,'Lie flat with your hands under your hips. Lift straight legs to vertical, then lower slowly without arching your back.'],
    ['V-up (floor)',12,'Lie flat, arms overhead. Lift your legs and torso at the same time to reach your toes, then lower slowly.'],
    ['L-sit on floor (secs)',15,'Sit with legs straight, palms flat by your hips. Press down and lift your hips off the floor. Even a small lift counts.']]},
  speed:{stat:'Speed',title:'Speed',steps:[
    ['Fast feet in place (secs)',20,'Stand tall on the balls of your feet and tap them as fast as you can in tiny steps.'],
    ['High knees (secs)',30,'Run in place, drive your knees to hip height, and pump your arms.'],
    ['Skater hops',20,'Leap side to side from one foot to the other, landing softly and reaching across with the opposite hand.'],
    ['Burpee (no push-up)',10,'Squat, kick your feet back to a plank, jump your feet in, then stand and jump.'],
    ['Full burpee',10,'Same as a burpee, but do a push-up when you are in the plank.'],
    ['Sprint intervals (secs on/off)',20,'Sprint for the time shown, then walk for the same time. Only on a safe, flat surface, and only after a warm-up.']]},
  agility:{stat:'Agility',title:'Agility',steps:[
    ['Lateral shuffle (each side)',10,'Stay low and step side to side without crossing your feet.'],
    ['Line hops fwd/back',20,'Picture a line on the floor and hop forward and back over it on both feet, quick and light.'],
    ['Crab walk (secs)',30,'Sit with hands behind you, lift your hips, and walk on your hands and feet.'],
    ['Bear crawl (secs)',30,'On hands and toes with knees just off the floor, crawl forward moving opposite hand and foot together.'],
    ['Lunge-to-jump',12,'Lunge down, then jump up and switch legs in the air. Land softly.'],
    ['Tuck jump',10,'Jump straight up and pull your knees toward your chest. Land soft with bent knees.'],
    ['Broad jump + stick',8,'Swing your arms and jump forward as far as you can. Land on both feet and hold still for a second.']]},
  mobility:{stat:'Mobility',title:'Mobility',steps:[
    ['Cat-cow + hip circles',10,'On hands and knees, round your back up, then arch it down, slowly. Then draw big circles with each knee.'],
    ['World\'s greatest stretch',6,'Step into a deep lunge, put a hand inside your front foot, and rotate your chest up toward the ceiling. Switch sides.'],
    ['Deep squat hold (secs)',45,'Sink into the deepest comfortable squat, heels down, elbows pushing your knees out. Hold.'],
    ['Shoulder dislocates (towel)',12,'Hold a towel wide. Lift it over your head and behind you with straight arms. Go slow and only as far as it is pain-free.'],
    ['Thoracic rotations',10,'On hands and knees, put one hand behind your head and rotate that elbow up toward the ceiling, then back down.'],
    ['Full joint flow (secs)',60,'Slow circles through your neck, shoulders, wrists, hips, knees and ankles, in that order.']]},
  flex:{stat:'Flexibility',title:'Flexibility',steps:[
    ['Standing hamstring stretch (secs)',30,'Put one heel forward and hinge at the hips with a flat back. Stop when you feel a stretch, not pain.'],
    ['Seated forward fold (secs)',40,'Sit with legs straight and fold from the hips toward your feet. Bend your knees if you need to.'],
    ['Couch stretch (secs)',40,'Back knee on the floor, back foot up against a couch or wall. Tuck your tailbone and stand tall.'],
    ['Pigeon pose (secs)',45,'One shin forward on the floor, the other leg stretched back. Lean forward over your front shin, easing in slowly.'],
    ['Straddle stretch (secs)',60,'Sit with your legs wide apart and fold forward with a long back.'],
    ['Front-split progression (secs)',60,'Kneel in a lunge and slide your front heel forward until you feel a stretch, hands on the floor. Never force it.']]}
};

/* Weekly split. Each day has main quests (ladder keys) + a note.
   Daily quest = warm-up + 3 main + finisher, sized for 20-30 min. */
const SPLIT=[
  {name:'Sunday',  type:'Recovery',  quests:['mobility','flex'], note:'Light day. Breathe, stretch, walk 10 min. Recovery is where you grow.', rest:true},
  {name:'Monday',  type:'Push + Core', quests:['push','core','speed'], note:'Chest, shoulders, triceps, abs.'},
  {name:'Tuesday', type:'Legs + Agility', quests:['legs','agility','mobility'], note:'Legs and footwork.'},
  {name:'Wednesday',type:'Pull + Flex', quests:['pull','core','flex'], note:'Back, biceps, and stretch.'},
  {name:'Thursday',type:'Speed + Push', quests:['speed','push','agility'], note:'Fast and explosive day.'},
  {name:'Friday',  type:'Legs + Core', quests:['legs','core','mobility'], note:'Leg strength and trunk control.'},
  {name:'Saturday',type:'Full Body Boss Day', quests:['push','legs','speed','mobility'], note:'Weekly boss day. Longer session, all five stats. Push your limit on the last set of each move.', boss:true}
];

const WARMUP=[['Jumping jacks',30,'sec'],['Arm circles',10,'each way'],['Hip circles',10,'each way']];

/* 24-week phases */
const PHASES=[
  {name:'Phase 1: Foundation',weeks:[1,4],goal:'Learn form, build the habit. Nothing fancy.'},
  {name:'Phase 2: Awakening',weeks:[5,10],goal:'Real push-ups. First pull movements. Bigger volume.'},
  {name:'Phase 3: Iron Body',weeks:[11,16],goal:'Harder variations. Speed and agility get serious.'},
  {name:'Phase 4: Elite',weeks:[17,22],goal:'Skill work: archer, pistol, L-sit, splits.'},
  {name:'Phase 5: Monarch',weeks:[23,24],goal:'Test everything. Prove your rank.'}
];
const WEEKLY_FOCUS={
 1:'Learn the moves. Slow reps, full range.',2:'Same moves, cleaner form.',3:'Add 2 reps to everything.',4:'Rank test: E to D. Clean form beats big numbers.',
 5:'Volume up. Start climbing ladders.',6:'Push-ups should now be on knees or full.',7:'Introduce first table rows.',8:'Speed work gets timed.',9:'Push your limit sets.',10:'Rank test: D to C.',
 11:'Harder variations begin.',12:'Agility: add jumps.',13:'Core: hollow holds.',14:'Leg strength: split squats.',15:'Flexibility check-in.',16:'Rank test: C to B.',
 17:'Skill work begins.',18:'Archer and pistol progressions.',19:'L-sit attempts.',20:'Rank test: B to A.',21:'Splits and deep mobility.',22:'Endurance week: long, controlled sets.',
 23:'Peak week.',24:'Final trial: Monarch test.'
};

/* Rank-up trials (Hunter Association re-assessments). Each move: [name, target, demo, kind]
   kind: 'hold' = seconds held, a number = reps inside that many seconds, otherwise reps in one set.
   Every move must be hit; each has two attempts. */
const RANK_TESTS={
  D:{level:4,week:4,gate:'Double Dungeon',line:'Show the Association you are more than the weakest hunter.',
    tests:[['Push-ups, any style',10,'Knee push-up'],['Bodyweight squats',25,'Bodyweight squat'],['Plank',30,'Plank (secs)','hold']]},
  C:{level:8,week:10,gate:'Instant Dungeon',line:'Iron body. Prove that it holds.',
    tests:[['Full push-ups',10,'Full push-up'],['Table rows',10,'Table row, feet flat'],['Bodyweight squats',30,'Bodyweight squat'],['Plank',45,'Plank (secs)','hold']]},
  B:{level:12,week:16,gate:'Knight\'s Keep',line:'Elite hunters do not stall. Neither should you.',
    tests:[['Full push-ups',20,'Full push-up'],['Table rows, feet elevated',10,'Table row, feet elevated'],['Split squats, each leg',10,'Split squat'],['Hollow hold',30,'Hollow hold (secs)','hold']]},
  A:{level:16,week:20,gate:'Hall of Trials',line:'Few hunters reach this hall. Fewer leave it promoted.',
    tests:[['Diamond push-ups',15,'Diamond push-up'],['Archer table rows, each side',8,'Archer table row'],['Assisted pistols, each leg',5,'Assisted pistol (hold support)'],['L-sit',10,'L-sit on floor (secs)','hold']]},
  S:{level:20,week:24,gate:'The Monarch\'s Trial',line:'Everything you built, all at once.',
    tests:[['Full push-ups',40,'Full push-up'],['Pistol squats, each leg',3,'Pistol squat'],['L-sit',20,'L-sit on floor (secs)','hold'],['Burpees in 60 seconds',20,'Full burpee',60]]}
};
const TRIAL_REST=90, TRIAL_EXP=150;


/* Which food tags each diet type may eat. */
const DIET_TYPES={
  veg:{label:'Veg',sub:'No meat, no eggs',allow:['veg']},
  egg:{label:'Eggetarian',sub:'Veg plus eggs',allow:['veg','egg']},
  nonveg:{label:'Non-veg',sub:'Everything',allow:['veg','egg','nonveg']}
};

/* Rest between sets, in seconds. Stretches recover fast; boss strength sets get longer. */
const REST={stretch:30,normal:60,boss:90};

/* System briefing shown during the Awakening and from the System menu. */
const BRIEFING=[
  {h:'Daily Quest',lines:['Every day the System issues a quest: a short warm-up and 3 exercises.','About 20 to 30 minutes. Finish it to earn EXP and grow your stats.','Sunday is recovery. Light, and it never brings a penalty.']},
  {h:'Penalty',red:true,lines:['Miss a training day and your penalty level rises by 1.','You then owe extra reps: 10 times your penalty level. Clear them before your next quest.','Three clean days in a row lower the penalty by 1.']},
  {h:'Death',red:true,lines:['At penalty level 5 you die. Your run resets to Week 1.','Stay away 9 days or more and you die.','You keep a title. The first 3 days of any run are safe.']},
  {h:'Rank & Rest Pass',lines:['Levels alone never raise your rank. You must pass a rank test.','Really sick or injured? You get 1 Rest Pass each week. It saves your streak.','Your health matters more than any streak. Pain is not progress.']}
];

/* Sudden quests: short surprise tasks. [task, stat it trains] */
const SUDDEN=[['20 bodyweight squats','Strength'],['30 jumping jacks','Speed'],['10 push-ups, any style','Strength'],
  ['45-second plank','Strength'],['20 lunges, alternating','Agility'],['10 burpees','Speed'],
  ['15 squat jumps','Agility'],['60-second deep squat hold','Mobility'],['40-second forward fold','Flexibility']];
const SUDDEN_CHANCE=.4, SUDDEN_MINUTES=60, SUDDEN_EXP=25;

/* Job change: unlocked by passing the S-rank test. Each path is a 12-week program (weeks 25-36).
   days: ladder keys per weekday (1=Mon .. 6=Sat); Sunday stays recovery. */
const JOBS={
  fighter:{title:'Fighter',tag:'Strength path',desc:'Heavier pushing, pulling and legs. Four sets, higher targets.',stat:'Strength',rest:75,
    days:{1:['push','pull','core'],2:['legs','core','mobility'],3:['pull','push','flex'],4:['legs','push','speed'],5:['pull','legs','core'],6:['push','pull','legs','core']},
    focus:['Rebuild volume on your top steps.','Slow negatives on every push.','Pull day doubles: rows then holds.','Single-leg strength block.','Max-rep test week.','Deload: same moves, 3 sets.',
      'Heavy week: last set to the limit.','Pause reps at the bottom.','Pull volume peak.','Legs peak: pistols and shrimps.','Strength test week.','Final trial: Fighter exam.']},
  assassin:{title:'Assassin',tag:'Skill path',desc:'Agility, mobility and control. Fast feet, deep range, clean skills.',stat:'Agility',rest:60,
    days:{1:['agility','core','flex'],2:['speed','mobility','legs'],3:['agility','push','flex'],4:['speed','core','mobility'],5:['agility','legs','flex'],6:['agility','speed','mobility','core']},
    focus:['Footwork foundations, sharper.','Landing quality: stick every jump.','Range week: hold stretches longer.','L-sit and hollow control.','Speed under fatigue.','Deload: flow and mobility.',
      'Jump power block.','Split progressions.','Reaction drills: shuffles and hops.','Skill test: L-sit and splits.','Agility peak week.','Final trial: Assassin exam.']},
  ranger:{title:'Ranger',tag:'Endurance path',desc:'Speed and stamina. More volume, shorter rests, longer efforts.',stat:'Speed',rest:45,
    days:{1:['speed','legs','core'],2:['agility','push','mobility'],3:['speed','pull','flex'],4:['legs','speed','core'],5:['agility','push','legs'],6:['speed','agility','legs','push']},
    focus:['Build the base: steady pace.','Shorter rests, same reps.','Burpee volume week.','Sprint intervals extended.','Circuit week: minimal rest.','Deload: easy volume.',
      'Tempo endurance block.','Long sets, clean form.','Interval peak week.','Mixed circuits.','Conditioning test week.','Final trial: Ranger exam.']}
};

/* ---------- items ----------
   Earned by effort only: weekly goals, boss days, dungeons, achievements, boxes. */
const GRADES=['E','D','C','B','A','S'];
const ITEMS={
  key:{name:'Dungeon Key',icon:'key',desc:'Opens a Gate of its grade or lower. Use it from the Gates tab.'},
  box:{name:'Random Box',icon:'box',desc:'Open it for a random reward: EXP, a stat point, a potion, a key, or something rarer.'},
  potion:{name:'Healing Potion',icon:'flask',desc:'Lowers your penalty level by 1 and clears up to 20 owed reps.'},
  elixir:{name:'Elixir of Growth',icon:'elixir',desc:'Drink before training. Your next daily quest gives 1.5× EXP.'},
  holy:{name:'Holy Water of Life',icon:'drop',desc:'Passive. If you would die, it is consumed and you survive at penalty level 3.'}
};

/* ---------- gates (dungeons) ----------
   Each Gate is its own workout, themed on its world and harder by grade. Waves are done in
   order inside the time limit. A wave given as a list has alternatives: each run picks one,
   so a Gate never plays exactly the same twice. Every clear raises that Gate's level
   (+10% reps and EXP per level, up to Lv 6).
   WV(name, amount, demo, kind, boss, side): kind 'hold' = seconds held, 'time' = seconds of
   work, otherwise reps. side = the amount is per side (reps count double). */
const WV=(n,amt,demo,kind,boss,side)=>({n,amt,demo,hold:!!kind,work:kind==='time',boss:!!boss,side:!!side});
const GATE_MAX_LV=6;
const DUNGEONS=[
  {g:'E',name:'Goblin Cave',boss:'Hobgoblin',focus:'Full-body basics',limit:12,exp:60,title:'Goblin Hunter',drops:{box:1},waves:[
    [WV('Bodyweight squats',25,'Bodyweight squat'),WV('Sit-to-stands',25,'Chair sit-to-stand')],
    [WV('Incline push-ups',15,'Incline push-up (hands on chair/table)'),WV('Knee push-ups',15,'Knee push-up')],
    [WV('Dead bugs',16,'Dead bug'),WV('Fast feet',30,'Fast feet in place (secs)','time')],
    WV('Plank',40,'Plank (secs)','hold',1)]},
  {g:'D',name:'Kasaka\'s Den',boss:'Kasaka, the giant serpent',focus:'Core and agility: low, fast, twisting',limit:15,exp:90,title:'Serpent Slayer',drops:{box:1,potion:.4},waves:[
    [WV('Bear crawl',30,'Bear crawl (secs)','time'),WV('Crab walk',30,'Crab walk (secs)','time')],
    [WV('Leg raises',15,'Leg raise'),WV('Dead bugs',24,'Dead bug')],
    [WV('Lateral shuffles, each side',12,'Lateral shuffle (each side)',0,0,1),WV('Line hops',30,'Line hops fwd/back')],
    WV('Burpees',15,'Burpee (no push-up)',0,1)]},
  {g:'C',name:'Frozen Forest',boss:'Ice Elf Captain',focus:'Legs and endurance: march through the snow',limit:18,exp:130,title:'Frost Breaker',drops:{box:1,potion:1},waves:[
    WV('Split squats, each leg',12,'Split squat',0,0,1),
    [WV('Skater hops',20,'Skater hops'),WV('High knees',40,'High knees (secs)','time')],
    [WV('Push-ups',15,'Full push-up'),WV('Table rows',12,'Table row, feet flat')],
    WV('Deep squat hold',45,'Deep squat hold (secs)','hold'),
    WV('Broad jumps, stick the landing',12,'Broad jump + stick',0,1)]},
  {g:'B',name:'Red Gate',boss:'Baruka, the Ice Elf Lord',focus:'Survival conditioning: keep moving',limit:20,exp:180,title:'Red Gate Survivor',drops:{box:2,potion:1,elixir:.4},waves:[
    WV('Burpees',15,'Full burpee'),
    [WV('Jump lunges',16,'Lunge-to-jump'),WV('Tuck jumps',12,'Tuck jump')],
    [WV('Diamond push-ups',12,'Diamond push-up'),WV('Decline push-ups',12,'Decline push-up (feet on chair)')],
    [WV('Sprint intervals',60,'Sprint intervals (secs on/off)','time'),WV('High knees',60,'High knees (secs)','time')],
    WV('Hollow hold',45,'Hollow hold (secs)','hold',1)]},
  {g:'A',name:'Demon Castle',boss:'Vulcan, the Demon Monarch\'s gatekeeper',focus:'Strength: climb the tower',limit:25,exp:240,title:'Demon Castle Raider',drops:{box:2,potion:1,elixir:1,holy:.25},waves:[
    WV('Bulgarian split squats, each leg',12,'Bulgarian split squat',0,0,1),
    [WV('Archer push-ups, each side',8,'Archer push-up',0,0,1),WV('Decline push-ups',20,'Decline push-up (feet on chair)')],
    [WV('Table rows, feet elevated',15,'Table row, feet elevated'),WV('Archer table rows, each side',8,'Archer table row',0,0,1)],
    WV('V-ups',20,'V-up (floor)'),
    WV('Burpee gauntlet',30,'Full burpee',0,1)]},
  {g:'S',name:'Jeju Island',boss:'Beru, the Ant King',focus:'Everything at once: the swarm',limit:30,exp:350,title:'Ant King Slayer',drops:{box:3,elixir:1,holy:1},waves:[
    [WV('Pistol squats, each leg',5,'Pistol squat',0,0,1),WV('Shrimp squats, each leg',6,'Shrimp squat',0,0,1)],
    [WV('Pseudo-planche push-ups',10,'Pseudo-planche push-up'),WV('Archer push-ups, each side',10,'Archer push-up',0,0,1)],
    WV('Tuck jumps',25,'Tuck jump'),
    [WV('Archer table rows, each side',10,'Archer table row',0,0,1),WV('Tempo table rows',10,'Tempo table row (3s up, 3s down)')],
    WV('Burpees',30,'Full burpee'),
    WV('L-sit',20,'L-sit on floor (secs)','hold',1)]}
];

/* ---------- shadow army ----------
   Beating a personal record on a move extracts that move's shadow. Shadows earn
   XP from your training, level up, get promoted, and each carries a passive skill.
   The first ten shadows carry legendary names, looks and skills. */
const SHADOW_LEGENDS=[['Igris','Knight Commander'],['Iron','Elite Knight'],['Tank','Elite'],['Tusk','Elite Knight'],['Beru','Marshal'],
  ['Bellion','Grand Marshal'],['Kaisel','Elite'],['Greed','Elite Knight'],['Jima','Knight'],['Fangs','Knight']];
const SHADOW_GRADES=['Normal','Normal','Elite','Elite','Knight','Knight','Elite Knight','Elite Knight'];
/* Promotion ladder: a shadow moves up one grade at Lv 10, 20 and 30. */
const SHADOW_RANKS=['Normal','Elite','Knight','Elite Knight','Knight Commander','Marshal','Grand Marshal'];
const SHADOW_MAX_LV=40;
/* Base ATK/DEF/SPD and look. Legends use their own; soldiers use the ladder their move belongs to. */
const SHADOW_BODY={
  Igris:{atk:16,def:10,spd:14,look:'knight',epithet:'The Blood-Red Commander',art:{src:'img/igris.jpg',pos:'50% 24%',mini:'50% 12%',zoom:1.3,mzoom:1.5,origin:'50% 32%',morigin:'50% 48%'}},
  Iron:{atk:12,def:18,spd:6,look:'heavy',epithet:'The Iron Wall'},
  Tank:{atk:14,def:16,spd:6,look:'bear',epithet:'Ice Bear of the North'},
  Tusk:{atk:17,def:7,spd:9,look:'orc',epithet:'Great Shaman of the High Orcs'},
  Beru:{atk:18,def:12,spd:18,look:'ant',epithet:'The Ant King',art:{src:'img/beru.jpg',pos:'50% 0%',mini:'50% 4%'}},
  Bellion:{atk:20,def:16,spd:16,look:'marshal',epithet:'Grand Marshal of the Army'},
  Kaisel:{atk:10,def:8,spd:20,look:'wyvern',epithet:'Sky Wyvern'},
  Greed:{atk:15,def:11,spd:12,look:'horned',epithet:'The Fallen Knight'},
  Jima:{atk:12,def:14,spd:10,look:'naga',epithet:'Naga of the Deep'},
  Fangs:{atk:13,def:9,spd:12,look:'orc',epithet:'High Orc Pack Leader'},
  push:{atk:14,def:8,spd:8,look:'soldier'},pull:{atk:12,def:9,spd:9,look:'soldier'},legs:{atk:11,def:12,spd:7,look:'spiked'},
  core:{atk:8,def:14,spd:8,look:'spiked'},speed:{atk:8,def:7,spd:15,look:'hooded'},agility:{atk:9,def:7,spd:14,look:'hooded'},
  mobility:{atk:7,def:12,spd:11,look:'hooded'},flex:{atk:6,def:13,spd:11,look:'soldier'}
};
/* Passive skills. kind decides where the bonus applies; v is the base value in percent.
   Skills grow with the shadow's level (up to 2x at Lv 21). Captain doubles, vice-captain 1.5x. */
const SHADOW_SKILLS={
  Igris:{name:'Commander\'s Edge',kind:'expPush',v:5,text:v=>`+${v}% EXP on push days`},
  Iron:{name:'Iron Body',kind:'stat:Strength',v:8,text:v=>`+${v}% Strength gains`},
  Tank:{name:'Iron Hide',kind:'penalty',v:10,text:v=>`−${v}% penalty reps`},
  Tusk:{name:'Shaman\'s Blessing',kind:'expBoss',v:8,text:v=>`+${v}% EXP on boss days`},
  Beru:{name:'Hunger of the King',kind:'gateExp',v:10,text:v=>`+${v}% Gate EXP`},
  Bellion:{name:'Grand Marshal\'s Order',kind:'expAll',v:3,text:v=>`+${v}% EXP on every quest`},
  Kaisel:{name:'Wings of the Sky',kind:'gateTime',v:10,text:v=>`+${v}% Gate time limit`},
  Greed:{name:'Greed',kind:'luck',v:5,text:v=>`+${v}% luck on Random Boxes and daily chests`},
  Jima:{name:'Coils of the Deep',kind:'stat:Flexibility,Mobility',v:8,text:v=>`+${v}% Flexibility and Mobility gains`},
  Fangs:{name:'Pack Hunter',kind:'stat:Speed,Agility',v:8,text:v=>`+${v}% Speed and Agility gains`}
};
/* Soldiers: a small boost to the stat their move trains. */
const SOLDIER_SKILL=st=>({name:`${st} Drill`,kind:'stat:'+st,v:3,text:v=>`+${v}% ${st} gains`});
/* Caps on the combined army bonus, in percent. */
const SKILL_CAP={expPush:30,expBoss:30,expAll:20,gateExp:40,gateTime:40,penalty:50,luck:25,stat:40};

/* ---------- daily supply chest ----------
   One per day for opening the app. Day 7 of an unbroken run pays a Dungeon Key; missing a day restarts at day 1. */
const LOGIN_REWARDS=[['exp',10],['exp',15],['box',1],['exp',20],['elixir',1],['exp',30],['key',1]];

/* ---------- cool-down ----------
   Three stretches of 60 seconds after the last exercise. */
const COOLDOWN=['Standing hamstring stretch (secs)','Seated forward fold (secs)','Couch stretch (secs)','Pigeon pose (secs)',
  'Deep squat hold (secs)','Thoracic rotations','Cat-cow + hip circles','World\'s greatest stretch'];
const COOLDOWN_SECS=60, COOLDOWN_EXP=5;
