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

/* Final tests for each rank. Numbers are what you must hit in one attempt. */
const RANK_TESTS={
  D:{level:4,week:4, tests:[['Push-ups (any style, good form)',10],['Bodyweight squats',25],['Plank (secs)',30]]},
  C:{level:8,week:10,tests:[['Push-ups (full)',10],['Table rows',10],['Squats',30],['Plank (secs)',45]]},
  B:{level:12,week:16,tests:[['Full push-ups',20],['Table rows, feet elevated',10],['Split squats each leg',10],['Hollow hold (secs)',30]]},
  A:{level:16,week:20,tests:[['Diamond push-ups',15],['Archer table rows',8],['Assisted pistol each leg',5],['L-sit (secs)',10]]},
  S:{level:20,week:24,tests:[['Full push-ups',40],['Pistol squat each leg',3],['L-sit (secs)',20],['Burpees in 60s',20]]}
};


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
