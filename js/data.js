/* Hunter System: static game data. Pure data, no logic. */

const RANKS=[
  {r:'E',name:'Weakest Hunter',lv:0},
  {r:'D',name:'Awakened',lv:4},
  {r:'C',name:'Iron Body',lv:8},
  {r:'B',name:'Elite',lv:12},
  {r:'A',name:'Monarch Candidate',lv:16},
  {r:'S',name:'Shadow Monarch',lv:20},
  // the Monarch's Path: past S, two trials at the edge of what a human body can do
  {r:'SS',name:'Ruler',lv:25},
  {r:'SSS',name:'Absolute Being',lv:30}
];
const STATS=['Strength','Speed','Agility','Mobility','Flexibility'];

/* ---------- the exercise library ----------
   Each training area holds a few chains, one movement pattern each, from easiest to hardest.
   A move is [name, unlock level, starting target, how-to, demo it shares].
   - A move unlocks at its level, but your rank caps that level until you pass the next
     rank trial, so the big jumps (archer, pistol, handstand) wait for the rank that proves you ready.
   - Targets are reps, or seconds when the name says (secs). Each session aims one rep (or 3 s)
     past your last best, up to a cap; then the next move in the chain takes over as you level.
   - A move without its own animation names the demo of a close variation.
   Names are the moves' identities (records, shadows, demos), so never rename one.
   Mobility and flexibility are pools: a session rotates through every move unlocked. */
const AREAS={
  push:{stat:'Strength',title:'Push'},pull:{stat:'Strength',title:'Pull'},legs:{stat:'Strength',title:'Legs'},core:{stat:'Strength',title:'Core'},
  speed:{stat:'Speed',title:'Speed'},agility:{stat:'Agility',title:'Agility'},mobility:{stat:'Mobility',title:'Mobility',pool:true},flex:{stat:'Flexibility',title:'Flexibility',pool:true}
};
const CHAINS={
  push:[
    ['Chest',[
      ['Wall push-up',1,10,'Stand an arm\'s length from a wall, hands on it at chest height. Bend your elbows to bring your chest to the wall, then push back.'],
      ['Incline push-up (hands on chair/table)',2,10,'Hands on a heavy table, box or chair seat, body in one straight line. Lower your chest to the edge, then push away.'],
      ['Knee push-up',3,8,'Knees on the floor, body straight from knees to head. Lower your chest to just above the floor, then push up.'],
      ['Full push-up',5,6,'Hands under shoulders, body like a plank. Lower until your chest is a fist above the floor, then push up without sagging your hips.'],
      ['Wide push-up',6,8,'Hands wider than your shoulders, elbows out at about 45 degrees. Lower your chest between your hands, then press up.','Full push-up'],
      ['Tempo push-up (3s down)',7,6,'Take three full seconds to lower, touch the floor lightly, then push up fast. The slow lowering builds muscle.','Full push-up'],
      ['Decline push-up (feet on chair)',9,8,'Feet on a box or chair, hands on the floor. Keep a straight body and lower your chest between your hands.'],
      ['Pause push-up',10,8,'A full push-up with a two-second stop just above the floor. No bouncing out of the bottom.','Full push-up'],
      ['Archer push-up',12,5,'Hands wide. Lower toward one hand while the other arm stays straight, push up, then switch sides.'],
      ['Clap push-up',14,5,'Lower under control, then push up hard enough for your hands to leave the floor. Clap, and land with soft elbows.'],
      ['Pseudo-planche push-up',16,6,'Hands beside your lower ribs, fingers turned out. Lean forward so your shoulders are ahead of your hands, then push up.'],
      ['One-arm push-up (hand on box)',18,4,'One hand on a box or chair, the other behind your back, feet wide. Lower your chest to the box and press up. Count each arm.'],
      ['One-arm push-up',20,3,'Feet wide, one hand under your chest, the other behind your back. Lower until your chest nearly touches the floor, then press up. Count each arm.']]],
    ['Shoulders',[
      ['Plank shoulder taps',1,10,'High plank, feet a little wide. Tap one shoulder with the opposite hand without letting your hips rock. Each tap is one rep.'],
      ['Incline pike push-up (hands on box)',3,8,'Hands on a box or chair, hips high so your body makes an upside-down V. Bend your elbows to bring your head toward the box, then press back up.'],
      ['Pike push-up',5,6,'Hands and feet on the floor, hips high. Lower the top of your head toward the floor just in front of your hands, then press up.'],
      ['Elevated pike push-up (feet on box)',9,6,'Feet on a box or chair, hands on the floor, hips stacked over your shoulders. Lower your head toward the floor and press up.'],
      ['Wall handstand hold (secs)',12,15,'Walk your feet up the wall until your chest faces it, hands a forearm\'s length away. Stay straight, push the floor away and breathe.'],
      ['Wall handstand push-up negative',16,3,'From a wall handstand, take 3 to 5 seconds to lower your head to a folded towel. Come down, then walk back up.'],
      ['Wall handstand push-up',20,3,'From a wall handstand, lower your head to a folded towel and press all the way back up.','Wall handstand push-up negative']]],
    ['Triceps',[
      ['Bench dip (knees bent)',1,8,'Hands on the edge of a box or bench behind you, knees bent at 90 degrees. Lower until your elbows reach 90 degrees, then press up. Keep your shoulders down.'],
      ['Bench dip (legs straight)',4,10,'The same dip with your legs straight and heels on the floor. Elbows point straight back.'],
      ['Diamond push-up',8,8,'Hands close together under your chest, thumbs and index fingers forming a diamond. Keep your elbows tight to your body.'],
      ['Bench dip (feet elevated)',11,10,'Hands on one box, heels on a chair in front of you. Lower until your elbows reach 90 degrees and press up.'],
      ['Bodyweight triceps extension (hands on box)',14,8,'Hands on a box edge, body straight like a plank. Bend only your elbows so your forehead drops toward the box, then straighten your arms.'],
      ['Decline diamond push-up',17,8,'A diamond push-up with your feet on a box or chair. Elbows stay tight to your ribs.','Diamond push-up']]]],
  pull:[
    ['Rows',[
      ['Backpack row (hinged)',1,10,'Hold a backpack loaded with books. Hinge forward at the hips with a flat back, then pull the bag to your belly button and lower slowly.'],
      ['Doorframe row (each arm)',2,8,'Stand in a doorway and hold the frame with one hand at chest height, feet close to it. Lean back on a straight arm, then pull your chest to the frame.'],
      ['One-arm backpack row (each arm)',3,10,'One hand on a box or chair, back flat. Row a loaded backpack up to your hip, pause, and lower slowly.'],
      ['Table row, feet flat',4,6,'Lie under a very heavy, stable table and grip the edge. Keep your body straight and pull your chest up to your hands. Test the table first: if it slides or tips, skip this.'],
      ['Table row, legs straight',6,6,'Under a very heavy table, legs straight and heels on the floor. Keep your body in one line and pull your chest to the edge.'],
      ['Table row, feet elevated',8,6,'Same as the table row, but with your feet on a low chair. Body stays in one straight line. Only use a table that does not move.'],
      ['Archer table row',12,5,'Pull toward one hand while the other arm stays mostly straight, then switch sides. Only use a table that does not move.'],
      ['Tempo table row (3s up, 3s down)',14,5,'A table row, but take 3 seconds to pull up and 3 seconds to lower. Only use a table that does not move.'],
      ['One-arm table row (each arm)',18,3,'Under a heavy table, grip the edge with one hand, body straight, and pull your chest up. Only use a table that does not move.','Archer table row']]],
    ['Upper back',[
      ['Prone Y-T-W raise',1,6,'Lie face down. Lift your arms into a Y, then a T, then a W, squeezing your shoulder blades. Go slow.'],
      ['Superman hold (secs)',3,20,'Lie face down, arms reaching overhead. Lift your arms, chest and legs a little off the floor and hold, looking at the floor.'],
      ['Wide table row',10,8,'Under a heavy table with your hands wide on the edge. Pull your upper chest up, squeezing your shoulder blades together.','Table row, feet flat']]],
    ['Biceps',[
      ['Backpack curl',1,12,'Hold a loaded backpack by its top handle, elbows at your sides. Curl it up to your chest and lower slowly.'],
      ['Underhand table row',6,6,'A table row with your palms facing you. Pull your chest up to the edge and lower slowly. It works your biceps hard.','Table row, feet flat'],
      ['Doorframe curl (each arm)',9,8,'Hold a doorframe with an underhand grip and lean back on a straight arm. Curl yourself in using only your biceps.','Doorframe row (each arm)'],
      ['Bodyweight curl (table edge)',13,6,'Under a heavy table, palms up on the edge, body straight. Curl your forehead toward your hands while your elbows stay still.','Table row, feet elevated'],
      ['Tempo backpack curl (4s down)',17,10,'A backpack curl where you take four seconds to lower. No swinging.','Backpack curl']]]],
  legs:[
    ['Squat',[
      ['Chair sit-to-stand',1,12,'Sit on the edge of a sturdy chair, feet flat. Stand up without using your hands, then sit down slowly.'],
      ['Bodyweight squat',2,15,'Feet shoulder-width apart. Sit your hips back and down, chest up, knees over your toes. Stand tall.'],
      ['Wall sit (secs)',3,30,'Back flat against a wall, slide down until your thighs are level, knees over your ankles. Hold.'],
      ['Pause squat (2s at the bottom)',4,12,'A full squat with a two-second stop at the bottom. Stay tight, then stand up.','Bodyweight squat'],
      ['Tempo squat (3s down)',6,12,'Take three seconds to sit down into the squat, then stand up fast.','Bodyweight squat'],
      ['Cossack squat (each side)',8,6,'Wide stance. Sit down over one bent leg while the other stays straight, toes up. Keep your chest up, then switch sides.'],
      ['Box pistol (each leg)',11,5,'Stand in front of a box or chair on one leg, the other leg out front. Sit down slowly to the box, then stand up on one leg.'],
      ['Assisted pistol (hold support)',13,6,'Hold a door frame or table edge. Sit down on one leg with the other leg out front, and stand using as little help as you can.'],
      ['Shrimp squat',16,5,'Hold your back foot behind you. Lower your back knee toward the floor on one leg, then stand.'],
      ['Pistol squat',18,4,'A full single-leg squat with the other leg straight out in front and your heel down.']]],
    ['Lunge',[
      ['Step-up (each leg)',1,10,'Step onto a stair or low box with your whole foot, stand up tall, then step down slowly.'],
      ['Reverse lunge (each leg)',2,8,'Step one foot back and lower your back knee toward the floor, front shin upright. Push through your front heel to stand.'],
      ['Split squat',4,10,'One foot forward, one back. Drop your back knee toward the floor, keep your front heel down, then stand up.'],
      ['Walking lunge (each leg)',6,10,'Lunge forward, then bring your back foot through into the next lunge. Torso tall, front knee over your foot.','Split squat'],
      ['Lateral lunge (each side)',7,8,'Step wide to one side and sit your hips back over that foot, the other leg straight. Push back to standing.','Cossack squat (each side)'],
      ['Bulgarian split squat',8,8,'Back foot on a box or chair behind you. Lower straight down and drive up through your front heel.'],
      ['Deficit reverse lunge (each leg)',10,8,'Stand on a low step and lunge back off it, so your back knee can travel lower.','Reverse lunge (each leg)'],
      ['High step-up (each leg)',12,8,'Foot on a knee-high box. Drive up through that heel without pushing off the back foot, then lower slowly.','Step-up (each leg)'],
      ['Bulgarian split squat, tempo (3s down)',14,8,'A Bulgarian split squat with a three-second lowering on every rep.','Bulgarian split squat'],
      ['Skater squat (each leg)',17,5,'Stand on one leg, the other knee bent behind you. Lower until your back knee nearly touches the floor, arms reaching forward, then stand.','Shrimp squat']]],
    ['Glutes and hamstrings',[
      ['Glute bridge',1,12,'On your back, knees bent, feet flat. Drive through your heels to lift your hips until knees, hips and shoulders line up. Squeeze, then lower slowly.'],
      ['Good morning',2,12,'Feet hip-width, hands behind your head, knees soft. Push your hips back with a flat back until you feel your hamstrings, then stand tall.'],
      ['Single-leg glute bridge (each leg)',4,10,'A glute bridge on one foot, the other leg straight. Keep your hips level.'],
      ['Hip thrust (shoulders on box)',6,12,'Upper back against a box, bench or couch, feet flat. Drive your hips up to a straight line, pause, and lower.'],
      ['Single-leg Romanian deadlift (each leg)',8,8,'Stand on one leg. Hinge forward with a flat back as the other leg reaches back, hands toward the floor, then stand tall.'],
      ['Sliding leg curl (towel)',10,8,'On your back, heels on a towel on a smooth floor, hips up. Slide your heels in toward you and back out slowly, hips up the whole time.'],
      ['Single-leg hip thrust (each leg)',12,8,'A hip thrust on one foot, the other knee pulled up. Keep your hips level.','Hip thrust (shoulders on box)'],
      ['Nordic curl negative',15,3,'Kneel with your heels hooked under a heavy couch. Keep a straight line from knees to head and lower forward as slowly as you can. Catch yourself with your hands.'],
      ['Single-leg sliding leg curl (each leg)',18,6,'A sliding leg curl with one heel on the towel and the other leg raised.','Sliding leg curl (towel)']]],
    ['Calves',[
      ['Calf raise',1,15,'Stand tall, rise onto the balls of your feet, pause at the top, and lower slowly.'],
      ['Calf raise on a step',4,15,'Balls of your feet on a stair edge, heels hanging. Lower your heels below the step, then rise all the way up.'],
      ['Single-leg calf raise (each leg)',8,12,'A calf raise on one foot, a hand on the wall for balance.','Calf raise'],
      ['Single-leg calf raise on a step (each leg)',12,12,'A single-leg calf raise off a stair edge for the full range.','Calf raise on a step']]]],
  core:[
    ['Upper abs',[
      ['Crunch',1,12,'On your back, knees bent, fingertips by your ears. Curl your shoulders off the floor by squeezing your abs, then lower slowly. Do not pull on your head.'],
      ['Leg-extended crunch',3,12,'Legs straight up toward the ceiling, hands behind your head. Crunch up toward your feet and lower slowly.'],
      ['Tuck-up',6,10,'Sit balanced on your bottom, leaning back a little. Pull your knees and chest together, then extend out without touching the floor.'],
      ['V-up (floor)',9,10,'Lie flat, arms overhead. Lift your legs and torso at the same time to reach your toes, then lower slowly.'],
      ['Dragon flag negative',16,3,'Lie on a bench and grip it behind your head. Lift your body to vertical, then lower it as one straight line as slowly as you can.'],
      ['Dragon flag',20,4,'Lower your straight body from vertical and raise it again, moving only at the shoulders.','Dragon flag negative']]],
    ['Lower abs',[
      ['Dead bug',1,8,'Lie on your back, arms up, knees bent over your hips. Lower the opposite arm and leg slowly and keep your lower back on the floor.'],
      ['Reverse crunch',2,10,'On your back, knees bent over your hips. Curl your hips off the floor toward your chest, then lower slowly. No swinging.'],
      ['Seated leg raise',4,10,'Sit leaning back on your hands, legs straight. Lift both legs up, then lower them without touching the floor.'],
      ['Leg raise',6,10,'Lie flat with your hands under your hips. Lift straight legs to vertical, then lower slowly without arching your back.'],
      ['Flutter kicks (secs)',8,25,'On your back, legs straight and low, lower back pressed into the floor. Kick small and fast.'],
      ['Bench leg raise',11,10,'Lie on a bench holding it behind your head. Raise straight legs to vertical, then lower them below the bench edge under control.'],
      ['Tuck L-sit (secs)',13,10,'Hands on the floor beside your hips. Press down to lift your bottom off the floor with your knees tucked to your chest. Hold.'],
      ['L-sit on floor (secs)',16,10,'Sit with legs straight, palms flat by your hips. Press down and lift your hips off the floor. Even a small lift counts.']]],
    ['Obliques',[
      ['Knee side plank (secs)',1,20,'On your side, knees bent, elbow under your shoulder. Lift your hips so your body is straight from head to knees. Hold, then switch sides.'],
      ['Bicycle crunch',3,12,'On your back, hands by your ears. Bring one elbow toward the opposite knee as the other leg straightens, then switch. Each side is one rep.'],
      ['Side plank (secs)',5,25,'On your side, legs straight, elbow under your shoulder. Lift your hips into a straight line and hold, then switch sides.'],
      ['Russian twist',7,12,'Sit leaning back with your knees bent and your feet light on the floor. Turn your chest and hands to one side, then the other. Each side is one rep.'],
      ['Side plank hip dips',10,10,'In a side plank, lower your hip toward the floor and lift it back up. Count each side.','Side plank (secs)'],
      ['Star side plank (secs)',15,15,'A side plank with your top arm and leg raised. Hold, then switch sides.','Side plank (secs)']]],
    ['Stability',[
      ['Plank (secs)',1,20,'Forearms on the floor, body in one straight line. Squeeze your abs and glutes and do not let your hips sag.'],
      ['Bird dog',2,8,'On hands and knees, reach one arm forward and the opposite leg back until both are straight. Pause, return, and switch sides. Each side is one rep.'],
      ['Hollow hold (secs)',6,20,'On your back, press your lower back into the floor and lift your shoulders and straight legs slightly. Hold it tight.'],
      ['Hollow rocks',9,12,'Hold the hollow shape and rock from your shoulders to your hips without breaking it.'],
      ['Body saw (towel)',12,10,'Forearm plank with your feet on a towel on a smooth floor. Slide your body back and forth from the shoulders, hips level.'],
      ['Kneeling towel rollout',14,8,'Kneel with your hands on a towel on a smooth floor. Slide your hands forward as far as you can keep a flat back, then pull back.']]]],
  speed:[
    ['Drills',[
      ['Fast feet in place (secs)',1,15,'Stand tall on the balls of your feet and tap them as fast as you can in tiny steps.'],
      ['A-march (secs)',2,20,'March in place: drive one knee up to hip height, toes pulled up, opposite arm forward. Stand tall.'],
      ['High knees (secs)',3,20,'Run in place, drive your knees to hip height, and pump your arms.'],
      ['Butt kicks (secs)',4,20,'Jog in place and flick your heels up to your bottom, staying on the balls of your feet.'],
      ['Skater hops',6,16,'Leap side to side from one foot to the other, landing softly and reaching across with the opposite hand.'],
      ['Sprint intervals (secs on/off)',8,15,'Sprint for the time shown, then walk for the same time. Only on a safe, flat surface, and only after a warm-up.'],
      ['Wall drill (secs)',11,15,'Lean into a wall at 45 degrees, hands on it. Drive one knee up, then switch legs fast while holding the lean.'],
      ['Shuttle run (secs)',14,20,'In a corridor or on a terrace, sprint 5 m, touch the line, turn and sprint back. Stay low on the turns.','Sprint intervals (secs on/off)']]],
    ['Conditioning',[
      ['Incline burpee (hands on box)',1,6,'Hands on a box or chair, step your feet back to a plank, step them in, and stand up.'],
      ['Mountain climbers (secs)',3,20,'High plank. Drive your knees toward your chest one after the other, fast, hips low.'],
      ['Burpee (no push-up)',5,8,'Squat, kick your feet back to a plank, jump your feet in, then stand and jump.'],
      ['Full burpee',8,8,'Same as a burpee, but do a push-up when you are in the plank.'],
      ['Burpee tuck jump',12,8,'A full burpee that finishes with a tuck jump instead of a normal jump.','Full burpee'],
      ['Burpee box jump',16,6,'A full burpee, then jump onto a box and step down.','Full burpee']]]],
  agility:[
    ['Jumps',[
      ['Snap-down + stick',1,6,'Rise onto your toes with your arms up, then snap down into a quarter squat and freeze. Chest up, knees over toes. This teaches you to land.'],
      ['Pogo hops',2,20,'Small, quick bounces on the balls of your feet, knees almost straight, heels just off the floor.'],
      ['Squat jump',4,8,'Squat down, then jump straight up. Land softly back into the squat and reset before the next jump.'],
      ['Box jump (step down)',6,6,'Swing your arms and jump onto a stable box or stair. Land soft in a squat, stand up, then step down. Never jump down.'],
      ['Broad jump + stick',8,6,'Swing your arms and jump forward as far as you can. Land on both feet and hold still for a second.'],
      ['Tuck jump',10,8,'Jump straight up and pull your knees toward your chest. Land soft with bent knees.'],
      ['Hurdle hops',12,8,'Jump forward over a backpack or rolled towel, land soft and quiet, turn around and jump back.'],
      ['Depth drop + stick',14,5,'Step off a low box, land on both feet and freeze in a quarter squat. Quiet landing, knees over toes.'],
      ['Depth jump',17,5,'Step off a low box and jump straight up the moment your feet touch the floor.']]],
    ['Footwork',[
      ['Lateral shuffle (each side)',1,10,'Stay low and step side to side without crossing your feet.'],
      ['Line hops fwd/back',2,20,'Picture a line on the floor and hop forward and back over it on both feet, quick and light.'],
      ['Lateral bound + stick (each side)',5,6,'Bound sideways off one leg, land on the other and hold still for a second before the next bound.','Skater hops'],
      ['Lunge-to-jump',9,10,'Lunge down, then jump up and switch legs in the air. Land softly.'],
      ['Single-leg hops (each leg)',15,8,'Hop forward on one leg, landing soft and quiet, then hop back.','Pogo hops']]],
    ['Crawls',[
      ['Crab walk (secs)',1,20,'Sit with hands behind you, lift your hips, and walk on your hands and feet.'],
      ['Bear crawl (secs)',3,20,'On hands and toes with knees just off the floor, crawl forward moving opposite hand and foot together.']]]],
  mobility:[
    ['Mobility',[
      ['Cat-cow + hip circles',1,8,'On hands and knees, round your back up, then arch it down, slowly. Then draw big circles with each knee.'],
      ['Deep squat hold (secs)',1,30,'Sink into the deepest comfortable squat, heels down, elbows pushing your knees out. Hold.'],
      ['World\'s greatest stretch',2,6,'Step into a deep lunge, put a hand inside your front foot, and rotate your chest up toward the ceiling. Switch sides.'],
      ['Shoulder dislocates (towel)',3,10,'Hold a towel wide. Lift it over your head and behind you with straight arms. Go slow and only as far as it is pain-free.'],
      ['Thoracic rotations',4,8,'On hands and knees, put one hand behind your head and rotate that elbow up toward the ceiling, then back down.'],
      ['Full joint flow (secs)',6,45,'Slow circles through your neck, shoulders, wrists, hips, knees and ankles, in that order.']]]],
  flex:[
    ['Flexibility',[
      ['Standing quad stretch (secs)',1,30,'Stand on one leg, hold the other ankle behind you and pull the heel to your bottom, knees together. Switch sides halfway.'],
      ['Standing hamstring stretch (secs)',1,30,'Put one heel forward and hinge at the hips with a flat back. Stop when you feel a stretch, not pain.'],
      ['Kneeling hip flexor stretch (secs)',1,30,'Half-kneel, back knee on a cushion. Tuck your tailbone and shift your hips forward until the front of the back hip stretches. Switch sides halfway.'],
      ['Calf stretch (wall) (secs)',1,30,'Hands on a wall, one foot far back with the heel down and the leg straight. Lean in. Switch sides halfway.'],
      ['Doorway chest stretch (secs)',1,30,'Forearm on a door frame at shoulder height. Step through until your chest stretches. Switch sides halfway.'],
      ['Child\'s pose (secs)',1,30,'Kneel, sit back on your heels and reach your arms forward on the floor. Breathe into your back.'],
      ['Figure-4 glute stretch (secs)',2,30,'On your back, cross one ankle over the other knee and pull that leg toward your chest. Switch sides halfway.'],
      ['Butterfly stretch (secs)',2,30,'Sit with the soles of your feet together and knees out. Hold your feet and lean forward gently with a long back.'],
      ['Overhead triceps stretch (secs)',2,30,'Reach one hand down your back and gently press that elbow with the other hand. Switch sides halfway.'],
      ['Cobra stretch (secs)',3,30,'Lie face down, hands under your shoulders. Press your chest up, hips on the floor, shoulders down.'],
      ['Seated forward fold (secs)',4,40,'Sit with legs straight and fold from the hips toward your feet. Bend your knees if you need to.'],
      ['Couch stretch (secs)',5,40,'Back knee on the floor, back foot up against a couch or wall. Tuck your tailbone and stand tall.'],
      ['Pigeon pose (secs)',8,45,'One shin forward on the floor, the other leg stretched back. Lean forward over your front shin, easing in slowly.'],
      ['Straddle stretch (secs)',12,60,'Sit with your legs wide apart and fold forward with a long back.'],
      ['Front-split progression (secs)',16,60,'Kneel in a lunge and slide your front heel forward until you feel a stretch, hands on the floor. Never force it.']]]]
};
/* Every move by name: {a: area, c: chain, i: place in the chain, lv, base, cue, demo}. */
const MOVES={};
Object.entries(CHAINS).forEach(([a,cs])=>cs.forEach(([,ms],c)=>ms.forEach((m,i)=>{MOVES[m[0]]={a,c,i,lv:m[1],base:m[2],cue:m[3],demo:m[4]||m[0]}})));
/* The areas as the rest of the app knows them: title, stat, and every move in unlock order. */
const LADDERS=Object.fromEntries(Object.entries(AREAS).map(([k,A])=>[k,{stat:A.stat,title:A.title,
  steps:CHAINS[k].flatMap(c=>c[1]).sort((x,y)=>x[1]-y[1]).map(m=>[m[0],m[2],m[3]])}]));

/* Weekly split. Each day is a list of blocks, [area, moves]: speed and jumps come first while you
   are fresh. With the warm-up and cool-down a session takes about 45 minutes. */
const SPLIT=[
  {name:'Sunday',  type:'Recovery', blocks:[['mobility',3],['flex',3]], note:'Light day. Breathe, stretch, walk 10 min. Recovery is where you grow.', rest:true},
  {name:'Monday',  type:'Push + Abs', blocks:[['push',3],['core',3],['speed',1]], note:'Chest, shoulders and triceps, then abs. A burst of speed to finish.'},
  {name:'Tuesday', type:'Legs + Plyometrics', blocks:[['agility',2],['legs',4]], note:'Jumps first while you are fresh, then a full leg block.'},
  {name:'Wednesday',type:'Pull + Core', blocks:[['pull',3],['core',3]], note:'Back, rear shoulders and biceps, then core.'},
  {name:'Thursday',type:'Speed + Upper Body', blocks:[['speed',2],['push',2],['pull',2]], note:'Fast feet and conditioning, then push and pull.'},
  {name:'Friday',  type:'Legs + Abs', blocks:[['legs',3],['core',3],['mobility',1]], note:'Single-leg strength, abs, then mobility.'},
  {name:'Saturday',type:'Full Body Boss Day', blocks:[['agility',1],['push',1],['pull',1],['legs',1],['core',1]], note:'Weekly boss day. Four sets of every move. Push your limit on the last set.', boss:true}
];
SPLIT.forEach(d=>{d.quests=[...new Set(d.blocks.map(b=>b[0]))]});

const WARMUP=[['Jumping jacks',30,'sec'],['Arm circles',10,'each way'],['Hip circles',10,'each way']];

/* 24-week phases */
const PHASES=[
  {name:'Phase 1: Foundation',weeks:[1,4],goal:'E-Rank moves: wall and knee push-ups, squats, bridges, crunches, step-ups. Learn every move with clean form.'},
  {name:'Phase 2: Awakening',weeks:[5,10],goal:'D-Rank opens full and pike push-ups, table rows, split squats, seated leg raises, squat jumps and box jumps.'},
  {name:'Phase 3: Iron Body',weeks:[11,16],goal:'C-Rank opens decline and diamond push-ups, Bulgarian split squats, cossack squats, V-ups and full burpees.'},
  {name:'Phase 4: Elite',weeks:[17,22],goal:'B and A ranks open archer and clap push-ups, wall handstands, pistols, Nordic curls and dragon flags.'},
  {name:'Phase 5: Monarch',weeks:[23,24],goal:'Test everything. Prove your rank.'}
];
const WEEKLY_FOCUS={
 1:'Learn the moves. Slow reps, full range.',2:'Same moves, cleaner form. Beat last time by one rep.',3:'New moves arrive as you level up. Read each How-to first.',4:'Rank test: E to D. Clean form beats big numbers.',
 5:'Full push-ups and table rows join your quest.',6:'Jumps: land soft and quiet, every time.',7:'Tempo week: three seconds down on every rep.',8:'Box jumps and squat jumps: quality over speed.',9:'Push your limit sets.',10:'Rank test: D to C.',
 11:'Harder variations begin: decline and diamond push-ups.',12:'Single-leg week: Bulgarian split squats and cossack squats.',13:'Core: hollow rocks and V-ups.',14:'Glutes and hamstrings: sliding leg curls.',15:'Flexibility check-in: pigeon and couch stretches.',16:'Rank test: C to B.',
 17:'Skill work begins: wall handstand holds.',18:'Archer push-ups and archer rows.',19:'Explosive week: clap push-ups and hurdle hops.',20:'Rank test: B to A.',21:'Pistols, shrimps and Nordic curls.',22:'Endurance week: long, controlled sets.',
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
    tests:[['Full push-ups',40,'Full push-up'],['Pistol squats, each leg',3,'Pistol squat'],['L-sit',20,'L-sit on floor (secs)','hold'],['Burpees in 60 seconds',20,'Full burpee',60]]},
  // the Monarch's Path: the S-rank Hunter keeps the rank and chases these. Level is the only gate.
  SS:{level:25,week:24,exp:300,gate:'The Rulers\' Judgment',line:'The Rulers do not test hunters. They test what a human body can become.',
    tests:[['Full push-ups',50,'Full push-up'],['Pistol squats, each leg',8,'Pistol squat'],['Wall handstand hold',60,'Wall handstand hold (secs)','hold'],
      ['L-sit',30,'L-sit on floor (secs)','hold'],['Burpees in 60 seconds',25,'Full burpee',60]]},
  SSS:{level:30,week:24,exp:500,gate:'Throne of the Absolute',line:'Beyond this trial there is no rank. Only what you are.',
    tests:[['One-arm push-ups, each arm',5,'One-arm push-up'],['Wall handstand push-ups',8,'Wall handstand push-up'],['Pistol squats, each leg',15,'Pistol squat'],
      ['Dragon flags',8,'Dragon flag'],['L-sit',45,'L-sit on floor (secs)','hold'],['Burpees in 60 seconds',30,'Full burpee',60]]}
};
const TRIAL_REST=90, TRIAL_EXP=150;


/* Which food tags each diet type may eat. */
const DIET_TYPES={
  veg:{label:'Veg',sub:'No meat, no eggs',allow:['veg']},
  egg:{label:'Eggetarian',sub:'Veg plus eggs',allow:['veg','egg']},
  nonveg:{label:'Non-veg',sub:'Everything',allow:['veg','egg','nonveg']}
};

/* Rest between sets, in seconds. Stretches recover fast, abs a little slower; boss strength sets get longer. */
const REST={stretch:30,core:45,normal:60,boss:90};

/* System briefing shown during the Awakening and from the System menu. */
const BRIEFING=[
  {h:'Daily Quest',lines:['Every day the System issues a quest: a warm-up, 6 or 7 moves in blocks, and a short stretch.','About 45 minutes. Finish it to earn EXP and grow your stats. New, harder moves unlock as you level up and rank up.','Sunday is recovery. Light, and it never brings a penalty.']},
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
   The first nine shadows carry legendary names, looks and skills. */
const SHADOW_LEGENDS=[['Igris','Knight Commander'],['Iron','Elite Knight'],['Tank','Elite'],['Tusk','Elite Knight'],['Beru','Marshal'],
  ['Bellion','Grand Marshal'],['Kaisel','Elite'],['Greed','Elite Knight'],['Jima','Knight']];
const SHADOW_GRADES=['Normal','Normal','Elite','Elite','Knight','Knight','Elite Knight','Elite Knight'];
/* Promotion ladder: a shadow moves up one grade at Lv 10, 20 and 30. */
const SHADOW_RANKS=['Normal','Elite','Knight','Elite Knight','Knight Commander','Marshal','Grand Marshal'];
const SHADOW_MAX_LV=40;
/* Base ATK/DEF/SPD and look. Legends use their own; soldiers use the ladder their move belongs to. */
const SHADOW_BODY={
  Igris:{atk:16,def:10,spd:14,look:'knight',epithet:'The Blood-Red Commander',art:{src:'img/igris.jpg',pos:'50% 24%',mini:'50% 12%',zoom:1.3,mzoom:1.5,origin:'50% 32%',morigin:'50% 48%'}},
  Iron:{atk:12,def:18,spd:6,look:'heavy',epithet:'The Iron Wall',art:{src:'img/iron.jpg',pos:'50% 50%',mini:'50% 0%',mzoom:1.25,morigin:'42% 22%'}},
  Tank:{atk:14,def:16,spd:6,look:'bear',epithet:'Ice Bear of the North',art:{src:'img/tank.jpg',pos:'50% 50%',mini:'50% 6%'}},
  Tusk:{atk:17,def:7,spd:9,look:'orc',epithet:'Great Shaman of the High Orcs',art:{src:'img/tusk.jpg',pos:'50% 50%',mini:'50% 0%',credit:'Kirt Victor'}},
  Beru:{atk:18,def:12,spd:18,look:'ant',epithet:'The Ant King',art:{src:'img/beru.jpg',pos:'50% 50%',mini:'50% 0%',mzoom:1.2,morigin:'50% 25%'}},
  Bellion:{atk:20,def:16,spd:16,look:'marshal',epithet:'Grand Marshal of the Army',art:{src:'img/bellion.jpg',pos:'50% 50%',mini:'50% 0%',mzoom:1.15,morigin:'50% 30%'}},
  Kaisel:{atk:10,def:8,spd:20,look:'wyvern',epithet:'Sky Wyvern',art:{src:'img/kaisel.jpg',pos:'50% 50%',ty:'-22%',mini:'50% 82%',mzoom:1.25,morigin:'52% 62%'}},
  Greed:{atk:15,def:11,spd:12,look:'horned',epithet:'The Fallen Knight',art:{src:'img/greed.jpg',pos:'50% 50%',mini:'50% 4%',mzoom:1.15,morigin:'50% 40%'}},
  Jima:{atk:12,def:14,spd:10,look:'naga',epithet:'Naga of the Deep',art:{src:'img/jima.jpg',pos:'50% 50%',mini:'50% 0%',mzoom:1.3,morigin:'26% 40%'}},
  push:{atk:14,def:8,spd:8,look:'soldier'},pull:{atk:12,def:9,spd:9,look:'soldier'},legs:{atk:11,def:12,spd:7,look:'spiked'},
  core:{atk:8,def:14,spd:8,look:'spiked'},speed:{atk:8,def:7,spd:15,look:'hooded'},agility:{atk:9,def:7,spd:14,look:'hooded'},
  mobility:{atk:7,def:12,spd:11,look:'hooded'},flex:{atk:6,def:13,spd:11,look:'soldier'},
  // event shadows, extracted from story event raids (see story.js)
  Granite:{atk:13,def:19,spd:7,look:'statue',epithet:'Stone Knight of Cartenon'},
  Fury:{atk:19,def:12,spd:9,look:'warlord',epithet:'High Orc Warchief'},
  Titan:{atk:18,def:17,spd:5,look:'giant',epithet:'Giant of Tokyo Bay'},
  Ruin:{atk:20,def:12,spd:17,look:'dragon',epithet:'Black Dragon of the Last War'},
  Rime:{atk:15,def:13,spd:16,look:'frost',epithet:'Ice Elf of the Long Winter'},
  Howl:{atk:17,def:9,spd:19,look:'wolf',epithet:'Dire Wolf of the Fang King'},
  Blight:{atk:16,def:15,spd:12,look:'mantis',epithet:'Swarm Knight of the Plague Queen'},
  Mirage:{atk:15,def:11,spd:18,look:'masked',epithet:'The Thousand-Faced'}
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
  Granite:{name:'Stone Skin',kind:'penalty',v:8,text:v=>`−${v}% penalty reps`},
  Fury:{name:'Plunder',kind:'gateExp',v:6,text:v=>`+${v}% Gate EXP`},
  Titan:{name:'Long Stride',kind:'gateTime',v:6,text:v=>`+${v}% Gate time limit`},
  Ruin:{name:'Black Flame',kind:'expAll',v:3,text:v=>`+${v}% EXP on every quest`},
  Rime:{name:'Hoarfrost',kind:'stat:Flexibility,Mobility',v:6,text:v=>`+${v}% Flexibility and Mobility gains`},
  Howl:{name:'Pack Hunter',kind:'stat:Speed,Agility',v:6,text:v=>`+${v}% Speed and Agility gains`},
  Blight:{name:'Hive Mind',kind:'luck',v:4,text:v=>`+${v}% luck on Random Boxes and daily chests`},
  Mirage:{name:'False Faces',kind:'expBoss',v:6,text:v=>`+${v}% EXP on boss days`}
};
/* Soldiers: a small boost to the stat their move trains. */
const SOLDIER_SKILL=st=>({name:`${st} Drill`,kind:'stat:'+st,v:3,text:v=>`+${v}% ${st} gains`});
/* Caps on the combined army bonus, in percent. */
const SKILL_CAP={expPush:30,expBoss:30,expAll:20,gateExp:40,gateTime:40,penalty:50,luck:25,stat:40};

/* ---------- weapons ----------
   Gate bosses drop weapons: the first clear of a Gate always drops its weapon, later clears
   have a 30% chance, and a duplicate refines the weapon (+1, up to +5: +20% effect, +10% ATK
   each). The equipped weapon's effect stacks with the shadow army's skills, its ATK adds to
   the Hunter License's assessed power, and it is the blade you swing inside 3D Gates.
   look: how the blade is drawn (2D cards and the 3D first-person model). */
const RARITY={common:{n:'Common',c:'#a49e93'},rare:{n:'Rare',c:'#4f95ea'},epic:{n:'Epic',c:'#a35cff'},legendary:{n:'Legendary',c:'#e8b44c'},mythic:{n:'Mythic',c:'#ff3b2f'}};
const WEAPON_MAX_REFINE=5, WEAPON_DROP=.3;
const WEAPONS={
  rusty:{name:'Rusted Dagger',type:'dagger',rarity:'common',atk:12,fx:[{kind:'expAll',v:2}],src:'Your first daily quest',
    lore:'A cheap blade from the Association store. Every hunter starts somewhere.',look:{blade:'#9a7a58',dark:'#4a3626',edge:'#c9a27a',glow:'#c98a4a',grip:'#3a2a1e',shape:'rusty'}},
  'knight-killer':{name:'Knight Killer',type:'dagger',rarity:'rare',atk:30,fx:[{kind:'gateExp',v:8}],src:'Goblin Cave · E',
    lore:'Made to slip between plates of armour. Gates pay more.',look:{blade:'#e8eef5',dark:'#7c8794',edge:'#ffffff',glow:'#7fb6ff',grip:'#1d2430',shape:'straight'}},
  'venom-fang':{name:'Kasaka\'s Venom Fang',type:'dagger',rarity:'rare',atk:48,fx:[{kind:'expBoss',v:10}],src:'Kasaka\'s Den · D',
    lore:'Cut from the giant serpent. Its venom still drips from the tip.',look:{blade:'#f1ecd8',dark:'#8fae6a',edge:'#c8ff9a',glow:'#5dff8a',grip:'#16301f',shape:'fang'}},
  'frost-spear':{name:'Frost Elf Spear',type:'spear',rarity:'epic',atk:70,fx:[{kind:'stat:Strength',v:8}],src:'Frozen Forest · C',
    lore:'Carried by the Ice Elf Captain. The cold in it never fades.',look:{blade:'#effcff',dark:'#5ab8ff',edge:'#ffffff',glow:'#8fe3ff',grip:'#2a3a4a',shape:'crystal'}},
  baruka:{name:'Baruka\'s Dagger',type:'dagger',rarity:'epic',atk:95,fx:[{kind:'stat:Speed,Agility',v:8}],src:'Red Gate · B',
    lore:'The Ice Elf Lord\'s blade. Light, fast and merciless.',look:{blade:'#2b3346',dark:'#0e1220',edge:'#9fd8ff',glow:'#6fc3ff',grip:'#0b0e16',shape:'serrated'}},
  'demon-sword':{name:'Demon King\'s Longsword',type:'sword',rarity:'legendary',atk:130,fx:[{kind:'expAll',v:6}],src:'Demon Castle · A',
    lore:'Taken from the throne room of the Demon Castle. It hungers.',look:{blade:'#2a1216',dark:'#0e0507',edge:'#ff5a3d',glow:'#ff3b2f',grip:'#1a0a0c',shape:'demon'}},
  kamish:{name:'Kamish\'s Wrath',type:'twin',rarity:'mythic',atk:200,fx:[{kind:'expAll',v:10},{kind:'gateTime',v:10}],src:'Jeju Island · S',
    lore:'Twin daggers forged from the bones of the dragon Kamish. The strongest blades on earth.',look:{blade:'#ffe6a8',dark:'#d7261e',edge:'#fff4d6',glow:'#ff7a2a',grip:'#2a0e08',shape:'dragon'}},
  // story event weapons: the first clear of an event's boss raid drops it; later clears and reruns can refine it
  commandment:{name:'Blade of the Commandments',type:'sword',rarity:'epic',atk:85,fx:[{kind:'penalty',v:10}],src:'Story event · Double Dungeon',ev:'dd',
    lore:'Cut from the altar stone of the Cartenon Temple. It remembers every hunter who broke the rules.',look:{blade:'#bdb6a9',dark:'#5d574e',edge:'#ffd9d4',glow:'#ff3b2f',grip:'#2a2622',shape:'stone'}},
  cleaver:{name:'Warchief\'s Cleaver',type:'sword',rarity:'epic',atk:105,fx:[{kind:'stat:Strength',v:10}],src:'Story event · Orc Invasion',ev:'orc',
    lore:'Too heavy for any human to lift, the orcs said. They were wrong.',look:{blade:'#a29d93',dark:'#3a352d',edge:'#f0e9dc',glow:'#ff8a2a',grip:'#3a2614',shape:'cleaver'}},
  'giant-spear':{name:'Spear of the Giant King',type:'spear',rarity:'legendary',atk:150,fx:[{kind:'expBoss',v:12}],src:'Story event · Giants of Japan',ev:'giant',
    lore:'Carved from the tusk of a giant that walked out of Tokyo Bay. It still smells of the sea.',look:{blade:'#efe2c2',dark:'#8a6a3a',edge:'#fff6dc',glow:'#ffb347',grip:'#3a2614',shape:'harpoon'}},
  antares:{name:'Fang of Antares',type:'dagger',rarity:'mythic',atk:220,fx:[{kind:'expAll',v:8},{kind:'expBoss',v:10}],src:'Story event · Monarchs\' War',ev:'war',
    lore:'Broken from the jaw of the Monarch of Destruction. Black fire still runs along the edge.',look:{blade:'#3a2444',dark:'#0c0710',edge:'#ff9a4a',glow:'#b05cff',grip:'#140b18',shape:'claw'}},
  frostbrand:{name:'Frostbrand of Sillad',type:'sword',rarity:'legendary',atk:140,fx:[{kind:'stat:Flexibility,Mobility',v:10}],src:'Story event · Frost Monarch',ev:'frost',
    lore:'The Frost Monarch\'s own blade. Frost creeps up your arm when you hold it, and never quite reaches your heart.',look:{blade:'#e6f6ff',dark:'#5c8fb8',edge:'#ffffff',glow:'#8fe3ff',grip:'#1e2a3a',shape:'demon'}},
  'fang-king':{name:'Claw of the Fang King',type:'dagger',rarity:'legendary',atk:160,fx:[{kind:'stat:Speed,Agility',v:10}],src:'Story event · Fang King',ev:'beast',
    lore:'Torn from Rakan\'s right hand. It still twitches when something runs.',look:{blade:'#d8d0c4',dark:'#4a423c',edge:'#fff4e0',glow:'#ffb21a',grip:'#2a1e16',shape:'claw'}},
  stinger:{name:'Stinger of the Plague Queen',type:'dagger',rarity:'epic',atk:110,fx:[{kind:'gateExp',v:12}],src:'Story event · Plague Queen',ev:'plague',
    lore:'A single barb from Querehsha\'s tail. Wipe it clean before you put it away.',look:{blade:'#e2e07a',dark:'#55561a',edge:'#fbff9a',glow:'#d8ff3a',grip:'#1a1a06',shape:'fang'}},
  mirrorblade:{name:'Mirrorblade',type:'sword',rarity:'mythic',atk:210,fx:[{kind:'expAll',v:6},{kind:'luck',v:8}],src:'Story event · Faceless Monarch',ev:'mirror',
    lore:'Its surface shows every face Yogumunt ever stole. Yours is not among them, and that is how you know it is yours.',look:{blade:'#f1e8f4',dark:'#6e5a78',edge:'#ffffff',glow:'#ff4fb8',grip:'#1e1222',shape:'straight'}}
};
const WEAPON_ORDER=['rusty','knight-killer','venom-fang','frost-spear','baruka','demon-sword','kamish','commandment','cleaver','giant-spear','frostbrand','fang-king','stinger','mirrorblade','antares'];
const GATE_WEAPON={E:'knight-killer',D:'venom-fang',C:'frost-spear',B:'baruka',A:'demon-sword',S:'kamish'};

/* ---------- daily supply chest ----------
   One per day for opening the app. Day 7 of an unbroken run pays a Dungeon Key; missing a day restarts at day 1. */
const LOGIN_REWARDS=[['exp',10],['exp',15],['box',1],['exp',20],['elixir',1],['exp',30],['key',1]];

/* ---------- cool-down ----------
   Four stretches after the last exercise, picked for the muscles the day trained:
   legs and jumps get lower-body stretches, push and pull days upper-body ones. */
const COOL_LOWER=['Standing quad stretch (secs)','Standing hamstring stretch (secs)','Kneeling hip flexor stretch (secs)','Calf stretch (wall) (secs)','Figure-4 glute stretch (secs)','Butterfly stretch (secs)'];
const COOL_UPPER=['Doorway chest stretch (secs)','Overhead triceps stretch (secs)','Child\'s pose (secs)','Cobra stretch (secs)','Thoracic rotations','Shoulder dislocates (towel)'];
const COOLDOWN=[...COOL_LOWER,...COOL_UPPER];
const COOLDOWN_SECS=40, COOLDOWN_EXP=5;
