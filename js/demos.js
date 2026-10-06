/* Hunter System: animated exercise demos.
   Each move is a few keyframe poses of a side-view (or front-view) stick figure.
   A pose fixes the hip position and torso angle; arms and legs either reach a
   target point (two-bone IK, so elbows and knees bend naturally) or take fixed
   angles. Frames are interpolated, so one small table describes every move.
   Coordinates: 200x140 box, y grows down, floor at y=120. Angles in degrees,
   0 = right, 90 = down, -90 = up. The figure faces right. */
const DL={torso:36,neck:13,head:7,ua:17,fa:16,th:23,sh:23,foot:6};
const FLOOR=120;

/* ---------- limb + pose helpers ---------- */
const ik=(x,y,b=1)=>({ik:[x,y],b});      // reach a point; b picks which way the joint bends
const ang=(a,b)=>({ang:[a,b]});           // fixed absolute angles for both bones
const P=(hip,t,o={})=>Object.assign({hip,t},o); // o: a1,a2 (near/far arm), l1,l2 (near/far leg), arch, hd, tl

/* Shared poses */
const STAND=(x=100,o={})=>P([x,72],-90,Object.assign({a1:ang(96,92),a2:ang(84,88),l1:ik(x+4,117,1),l2:ik(x,117,1)},o));
const FSTAND=(x=100,o={})=>P([x,72],-90,Object.assign({a1:ang(80,88),a2:ang(100,92),l1:ik(x+7,117,-1),l2:ik(x-7,117,1)},o));

/* ---------- the move library ----------
   f: frames, mode: 'pp' ping-pong (default) | 'loop' cycle | 'cut' cycle with a jump-cut back to start
   dur: seconds per frame step, front: front view (both sides dark), props: static scenery */
const DEMOS={
  /* warm-up */
  'Jumping jacks':{front:1,dur:.45,f:[
    FSTAND(100,{a1:ang(70,84),a2:ang(110,96)}),
    P([100,66],-90,{a1:ang(-40,-70),a2:ang(-140,-110),l1:ik(122,113,-1),l2:ik(78,113,1)})]},
  'Arm circles':{front:1,dur:.35,mode:'loop',f:[
    FSTAND(100,{a1:ang(-8,-8),a2:ang(188,188)}),FSTAND(100,{a1:ang(-2,-12),a2:ang(182,192)}),
    FSTAND(100,{a1:ang(6,4),a2:ang(174,176)}),FSTAND(100,{a1:ang(2,12),a2:ang(178,168)})]},
  'Hip circles':{front:1,dur:.55,mode:'loop',f:[
    P([96,76],-86,{a1:ik(106,78,1),a2:ik(86,78,-1),l1:ik(112,117,-1),l2:ik(88,117,1)}),
    P([100,74],-90,{a1:ik(110,76,1),a2:ik(90,76,-1),l1:ik(112,117,-1),l2:ik(88,117,1)}),
    P([104,76],-94,{a1:ik(114,78,1),a2:ik(94,78,-1),l1:ik(112,117,-1),l2:ik(88,117,1)}),
    P([100,78],-90,{a1:ik(110,80,1),a2:ik(90,80,-1),l1:ik(112,117,-1),l2:ik(88,117,1)})]},

  /* push */
  'Wall push-up':{props:['wall:150'],f:[
    P([110,74],-74,{a1:ik(150,44,-1),a2:ik(150,48,-1),l1:ik(94,117,1),l2:ik(90,117,1)}),
    P([116,77],-58,{a1:ik(150,44,-1),a2:ik(150,48,-1),l1:ik(94,117,1),l2:ik(90,117,1)})]},
  'Incline push-up (hands on chair/table)':{props:['bench:138:178:96'],f:[
    P([119,87],-41,{a1:ik(146,96,-1),a2:ik(150,96,-1),l1:ik(84,117,1),l2:ik(88,117,1)}),
    P([124,95],-26,{a1:ik(146,96,-1),a2:ik(150,96,-1),l1:ik(84,117,1),l2:ik(88,117,1)})]},
  'Knee push-up':{f:[
    P([80,105],-29,{a1:ik(112,119,-1),a2:ik(116,119,-1),l1:ang(150,196),l2:ang(150,200)}),
    P([82,111],-12,{a1:ik(112,119,-1),a2:ik(116,119,-1),l1:ang(166,200),l2:ang(166,204)})]},
  'Full push-up':{f:[
    P([83,100],-22,{a1:ik(116,119,-1),a2:ik(120,119,-1),l1:ik(40,117,1),l2:ik(44,117,1)}),
    P([86,111],-7,{a1:ik(116,119,-1),a2:ik(120,119,-1),l1:ik(40,117,1),l2:ik(44,117,1)})]},
  'Diamond push-up':{f:[
    P([83,100],-22,{a1:ik(119,119,-1),a2:ik(121,119,-1),l1:ik(40,117,1),l2:ik(44,117,1)}),
    P([86,111],-7,{a1:ik(119,119,-1),a2:ik(121,119,-1),l1:ik(40,117,1),l2:ik(44,117,1)})]},
  'Decline push-up (feet on chair)':{props:['bench:22:58:92'],f:[
    P([86,88],-3,{a1:ik(122,119,-1),a2:ik(126,119,-1),l1:ik(40,90,1),l2:ik(44,90,1)}),
    P([85,98],10,{a1:ik(122,119,-1),a2:ik(126,119,-1),l1:ik(40,90,1),l2:ik(44,90,1)})]},
  'Archer push-up':{f:[
    P([83,100],-22,{a1:ik(116,119,-1),a2:ik(132,119,-1),l1:ik(40,117,1),l2:ik(44,117,1)}),
    P([88,110],-8,{a1:ik(116,119,-1),a2:ik(134,119,-1),l1:ik(40,117,1),l2:ik(44,117,1)})]},
  'Pseudo-planche push-up':{f:[
    P([86,99],-20,{a1:ik(104,119,-1),a2:ik(108,119,-1),l1:ik(42,117,1),l2:ik(46,117,1)}),
    P([92,109],-6,{a1:ik(104,119,-1),a2:ik(108,119,-1),l1:ik(46,117,1),l2:ik(50,117,1)})]},

  /* pull */
  'Prone Y-T-W raise':{dur:.8,f:[
    P([82,113],0,{a1:ang(170,172),a2:ang(168,170),l1:ang(180,180),l2:ang(182,182)}),
    P([82,113],-6,{a1:ang(-12,-14),a2:ang(-16,-18),l1:ang(180,180),l2:ang(182,182)})]},
  'Backpack row (hinged)':{props:['bag'],f:[
    P([90,72],-22,{a1:ik(124,94,1),a2:ik(128,94,1),l1:ik(100,117,-1),l2:ik(96,117,-1)}),
    P([90,72],-22,{a1:ik(108,76,1),a2:ik(112,76,1),l1:ik(100,117,-1),l2:ik(96,117,-1)})]},
  'Table row, feet flat':{props:['table:60:142:62'],f:[
    P([106,104],-10,{a1:ik(140,65,1),a2:ik(136,65,1),l1:ik(72,117,-1),l2:ik(76,117,-1)}),
    P([106,89],-28,{a1:ik(140,65,1),a2:ik(136,65,1),l1:ik(72,117,-1),l2:ik(76,117,-1)})]},
  'Table row, feet elevated':{props:['table:60:142:62','bench:28:66:98'],f:[
    P([104,97],0,{a1:ik(140,65,1),a2:ik(136,65,1),l1:ik(58,96,1),l2:ik(62,96,1)}),
    P([102,83],-17,{a1:ik(140,65,1),a2:ik(136,65,1),l1:ik(58,96,1),l2:ik(62,96,1)})]},
  'Archer table row':{props:['table:60:142:62','bench:28:66:98'],f:[
    P([104,97],0,{a1:ik(140,65,1),a2:ik(124,65,1),l1:ik(58,96,1),l2:ik(62,96,1)}),
    P([102,83],-17,{a1:ik(140,65,1),a2:ik(118,65,1),l1:ik(58,96,1),l2:ik(62,96,1)})]},
  'Tempo table row (3s up, 3s down)':{dur:3,props:['table:60:142:62','bench:28:66:98'],f:[
    P([104,97],0,{a1:ik(140,65,1),a2:ik(136,65,1),l1:ik(58,96,1),l2:ik(62,96,1)}),
    P([102,83],-17,{a1:ik(140,65,1),a2:ik(136,65,1),l1:ik(58,96,1),l2:ik(62,96,1)})]},

  /* legs */
  'Chair sit-to-stand':{props:['chair:62:96:88'],f:[
    P([88,86],-82,{a1:ang(20,10),a2:ang(24,14),l1:ik(114,117,-1),l2:ik(110,117,-1)}),
    P([104,72],-90,{a1:ang(20,10),a2:ang(24,14),l1:ik(114,117,-1),l2:ik(110,117,-1)})]},
  'Bodyweight squat':{f:[
    STAND(100,{a1:ang(96,92),a2:ang(84,88)}),
    P([84,96],-58,{a1:ang(2,0),a2:ang(6,4),l1:ik(106,117,-1),l2:ik(102,117,-1)})]},
  'Split squat':{f:[
    P([96,74],-90,{a1:ang(94,92),a2:ang(86,88),l1:ik(122,117,-1),l2:ik(72,115,-1)}),
    P([96,97],-88,{a1:ang(94,92),a2:ang(86,88),l1:ik(122,117,-1),l2:ik(72,115,-1)})]},
  'Bulgarian split squat':{props:['bench:28:62:92'],f:[
    P([100,76],-88,{a1:ang(94,92),a2:ang(86,88),l1:ik(124,117,-1),l2:ik(52,90,-1)}),
    P([98,98],-80,{a1:ang(94,92),a2:ang(86,88),l1:ik(124,117,-1),l2:ik(52,90,-1)})]},
  'Assisted pistol (hold support)':{props:['wall:156'],f:[
    P([100,72],-90,{a1:ik(154,60,1),a2:ik(154,64,1),l1:ik(104,117,-1),l2:ik(128,100,-1)}),
    P([90,104],-60,{a1:ik(154,80,1),a2:ik(154,84,1),l1:ik(106,117,-1),l2:ik(138,104,-1)})]},
  'Shrimp squat':{f:[
    P([100,72],-88,{a1:ang(20,10),a2:ik(80,90,1),l1:ik(104,117,-1),l2:ik(78,92,1)}),
    P([98,100],-62,{a1:ang(10,0),a2:ik(72,108,1),l1:ik(106,117,-1),l2:ik(70,112,1)})]},
  'Pistol squat':{f:[
    P([100,72],-90,{a1:ang(10,4),a2:ang(14,8),l1:ik(104,117,-1),l2:ik(126,100,-1)}),
    P([88,104],-58,{a1:ang(0,-4),a2:ang(4,0),l1:ik(106,117,-1),l2:ik(138,104,-1)})]},

  /* core */
  'Dead bug':{dur:.9,f:[
    P([82,113],0,{a1:ang(-90,-90),a2:ang(-92,-92),l1:ang(-88,180),l2:ang(-92,182)}),
    P([82,113],0,{a1:ang(-14,-10),a2:ang(-92,-92),l1:ang(-88,180),l2:ang(178,180)})]},
  'Plank (secs)':{dur:1.6,f:[
    P([85,108],-11,{a1:ang(90,0),a2:ang(92,2),l1:ik(40,117,1),l2:ik(44,117,1)}),
    P([85,107],-12,{a1:ang(90,0),a2:ang(92,2),l1:ik(40,117,1),l2:ik(44,117,1)})]},
  'Hollow hold (secs)':{dur:1.6,f:[
    P([96,113],-12,{a1:ang(-22,-22),a2:ang(-20,-20),l1:ang(194,194),l2:ang(192,192),hd:-6}),
    P([96,113],-14,{a1:ang(-24,-24),a2:ang(-22,-22),l1:ang(196,196),l2:ang(194,194),hd:-6})]},
  'Leg raise':{dur:.9,f:[
    P([84,113],0,{a1:ang(172,174),a2:ang(170,172),l1:ang(180,180),l2:ang(182,182)}),
    P([84,113],0,{a1:ang(172,174),a2:ang(170,172),l1:ang(-92,-92),l2:ang(-90,-90)})]},
  'V-up (floor)':{dur:.8,f:[
    P([90,113],0,{a1:ang(2,2),a2:ang(4,4),l1:ang(180,180),l2:ang(182,182)}),
    P([90,112],-52,{a1:ang(-128,-132),a2:ang(-126,-130),l1:ang(-128,-128),l2:ang(-126,-126)})]},
  'L-sit on floor (secs)':{dur:1.6,f:[
    P([92,110],-90,{a1:ik(94,119,1),a2:ik(90,119,1),l1:ang(0,0),l2:ang(2,2)}),
    P([92,107],-90,{a1:ik(94,119,1),a2:ik(90,119,1),l1:ang(-2,-2),l2:ang(0,0)})]},

  /* speed */
  'Fast feet in place (secs)':{dur:.14,f:[
    P([100,72],-86,{a1:ang(60,-40),a2:ang(120,-20),l1:ik(106,114,-1),l2:ik(98,117,-1)}),
    P([100,72],-86,{a1:ang(120,-20),a2:ang(60,-40),l1:ik(106,117,-1),l2:ik(98,114,-1)})]},
  'High knees (secs)':{dur:.25,f:[
    P([100,70],-88,{a1:ang(130,-60),a2:ang(40,-80),l1:ang(-4,90),l2:ik(100,117,-1)}),
    P([100,70],-88,{a1:ang(40,-80),a2:ang(130,-60),l1:ik(104,117,-1),l2:ang(-4,90)})]},
  'Skater hops':{front:1,dur:.45,f:[
    P([78,82],-80,{a1:ang(20,40),a2:ang(150,120),l1:ik(70,117,1),l2:ik(96,112,-1)}),
    P([122,82],-100,{a1:ang(30,60),a2:ang(160,140),l1:ik(104,112,1),l2:ik(130,117,-1)})]},
  'Burpee (no push-up)':{mode:'loop',dur:.45,f:[
    STAND(100),
    P([92,100],-60,{a1:ik(116,119,-1),a2:ik(120,119,-1),l1:ik(104,117,-1),l2:ik(100,117,-1)}),
    P([83,100],-22,{a1:ik(116,119,-1),a2:ik(120,119,-1),l1:ik(40,117,1),l2:ik(44,117,1)}),
    P([92,100],-60,{a1:ik(116,119,-1),a2:ik(120,119,-1),l1:ik(104,117,-1),l2:ik(100,117,-1)}),
    P([100,56],-90,{a1:ang(-80,-90),a2:ang(-100,-90),l1:ik(104,101,-1),l2:ik(100,101,-1)})]},
  'Full burpee':{mode:'loop',dur:.42,f:[
    STAND(100),
    P([92,100],-60,{a1:ik(116,119,-1),a2:ik(120,119,-1),l1:ik(104,117,-1),l2:ik(100,117,-1)}),
    P([83,100],-22,{a1:ik(116,119,-1),a2:ik(120,119,-1),l1:ik(40,117,1),l2:ik(44,117,1)}),
    P([86,111],-7,{a1:ik(116,119,-1),a2:ik(120,119,-1),l1:ik(40,117,1),l2:ik(44,117,1)}),
    P([83,100],-22,{a1:ik(116,119,-1),a2:ik(120,119,-1),l1:ik(40,117,1),l2:ik(44,117,1)}),
    P([92,100],-60,{a1:ik(116,119,-1),a2:ik(120,119,-1),l1:ik(104,117,-1),l2:ik(100,117,-1)}),
    P([100,56],-90,{a1:ang(-80,-90),a2:ang(-100,-90),l1:ik(104,101,-1),l2:ik(100,101,-1)})]},
  'Sprint intervals (secs on/off)':{dur:.2,f:[
    P([100,70],-74,{a1:ang(140,-150),a2:ang(30,-60),l1:ang(-10,70),l2:ang(120,170)}),
    P([100,70],-74,{a1:ang(30,-60),a2:ang(140,-150),l1:ang(120,170),l2:ang(-10,70)})]},

  /* agility */
  'Lateral shuffle (each side)':{front:1,dur:.4,f:[
    P([82,88],-86,{a1:ang(40,10),a2:ang(140,170),l1:ik(100,117,-1),l2:ik(62,117,1)}),
    P([118,88],-94,{a1:ang(40,10),a2:ang(140,170),l1:ik(138,117,-1),l2:ik(100,117,1)})]},
  'Line hops fwd/back':{props:['mark:100'],dur:.35,f:[
    P([86,78],-84,{a1:ang(110,60),a2:ang(100,60),l1:ik(90,117,-1),l2:ik(86,117,-1)}),
    P([100,62],-88,{a1:ang(60,20),a2:ang(70,30),l1:ik(104,106,-1),l2:ik(100,106,-1)}),
    P([114,78],-92,{a1:ang(110,60),a2:ang(100,60),l1:ik(118,117,-1),l2:ik(114,117,-1)})]},
  'Crab walk (secs)':{dur:.5,f:[
    P([96,96],196,{a1:ik(62,119,1),a2:ik(68,119,1),l1:ik(124,117,-1),l2:ik(118,117,-1),hd:10}),
    P([104,96],196,{a1:ik(70,119,1),a2:ik(66,119,1),l1:ik(126,117,-1),l2:ik(132,117,-1),hd:10})]},
  'Bear crawl (secs)':{dur:.45,f:[
    P([80,86],-4,{a1:ik(116,119,-1),a2:ik(124,119,-1),l1:ik(62,117,-1),l2:ik(54,117,-1),hd:20}),
    P([86,86],-4,{a1:ik(130,119,-1),a2:ik(122,119,-1),l1:ik(62,117,-1),l2:ik(70,117,-1),hd:20})]},
  'Lunge-to-jump':{mode:'loop',dur:.4,f:[
    P([96,97],-88,{a1:ang(60,20),a2:ang(120,160),l1:ik(122,117,-1),l2:ik(72,115,-1)}),
    P([98,56],-90,{a1:ang(-60,-80),a2:ang(-120,-100),l1:ik(110,100,-1),l2:ik(88,100,-1)}),
    P([96,97],-88,{a1:ang(120,160),a2:ang(60,20),l1:ik(72,115,-1),l2:ik(122,117,-1)}),
    P([98,56],-90,{a1:ang(-120,-100),a2:ang(-60,-80),l1:ik(88,100,-1),l2:ik(110,100,-1)})]},
  'Tuck jump':{dur:.4,f:[
    P([96,90],-70,{a1:ang(130,110),a2:ang(126,106),l1:ik(106,117,-1),l2:ik(102,117,-1)}),
    P([100,62],-86,{a1:ang(20,-10),a2:ang(24,-6),l1:ang(-30,100),l2:ang(-26,104)})]},
  'Broad jump + stick':{mode:'cut',dur:.5,f:[
    P([46,92],-62,{a1:ang(160,170),a2:ang(156,166),l1:ik(62,117,-1),l2:ik(58,117,-1)}),
    P([98,62],-60,{a1:ang(-30,-30),a2:ang(-34,-34),l1:ang(150,110),l2:ang(146,106)}),
    P([142,94],-62,{a1:ang(10,0),a2:ang(14,4),l1:ik(160,117,-1),l2:ik(156,117,-1)}),
    P([142,94],-62,{a1:ang(10,0),a2:ang(14,4),l1:ik(160,117,-1),l2:ik(156,117,-1)})]},

  /* mobility */
  'Cat-cow + hip circles':{dur:1.1,f:[
    P([78,93],-10,{a1:ik(115,119,1),a2:ik(119,119,1),l1:ang(90,180),l2:ang(92,182),arch:9,hd:40}),
    P([78,93],-10,{a1:ik(115,119,1),a2:ik(119,119,1),l1:ang(90,180),l2:ang(92,182),arch:-6,hd:-30})]},
  'World\'s greatest stretch':{dur:1.1,f:[
    P([98,98],-24,{a1:ik(124,119,-1),a2:ik(127,119,-1),l1:ik(130,117,-1),l2:ik(50,114,1)}),
    P([98,98],-34,{a1:ang(-88,-90),a2:ik(127,119,-1),l1:ik(130,117,-1),l2:ik(50,114,1)})]},
  'Deep squat hold (secs)':{dur:1.6,f:[
    P([92,104],-72,{a1:ik(110,90,1),a2:ik(112,92,1),l1:ik(104,117,-1),l2:ik(100,117,-1)}),
    P([92,102],-76,{a1:ik(110,88,1),a2:ik(112,90,1),l1:ik(104,117,-1),l2:ik(100,117,-1)})]},
  'Shoulder dislocates (towel)':{front:1,props:['towel'],dur:1,f:[
    FSTAND(100,{a1:ang(40,40),a2:ang(140,140)}),
    FSTAND(100,{a1:ang(-40,-40),a2:ang(-140,-140)})]},
  'Thoracic rotations':{dur:.9,f:[
    P([78,93],-10,{a1:ang(100,-160),a2:ik(119,119,1),l1:ang(90,180),l2:ang(92,182),hd:30}),
    P([78,93],-10,{a1:ang(-80,-150),a2:ik(119,119,1),l1:ang(90,180),l2:ang(92,182),hd:-50})]},
  'Full joint flow (secs)':{mode:'loop',dur:.5,f:[
    STAND(100,{a1:ang(90,90),a2:ang(270,270)}),STAND(100,{a1:ang(0,0),a2:ang(180,180)}),
    STAND(100,{a1:ang(-90,-90),a2:ang(90,90)}),STAND(100,{a1:ang(180,180),a2:ang(0,0)})]},

  /* flexibility */
  'Standing hamstring stretch (secs)':{dur:1.4,f:[
    P([100,74],-86,{a1:ang(92,90),a2:ang(88,90),l1:ik(128,117,1),l2:ik(96,117,-1)}),
    P([98,76],-28,{a1:ik(118,96,1),a2:ik(120,98,1),l1:ik(128,117,1),l2:ik(96,117,-1)})]},
  'Seated forward fold (secs)':{dur:1.4,f:[
    P([70,113],-86,{a1:ang(-80,-82),a2:ang(-84,-86),l1:ang(0,0),l2:ang(2,2)}),
    P([70,113],-22,{a1:ang(6,6),a2:ang(8,8),l1:ang(0,0),l2:ang(2,2),hd:20})]},
  'Couch stretch (secs)':{props:['couch'],dur:1.4,f:[
    P([78,92],-78,{a1:ang(60,40),a2:ang(64,44),l1:ik(112,117,-1),l2:ang(126,-118)}),
    P([80,92],-94,{a1:ang(96,92),a2:ang(92,88),l1:ik(112,117,-1),l2:ang(128,-116)})]},
  'Pigeon pose (secs)':{dur:1.4,f:[
    P([88,106],-80,{a1:ik(110,119,1),a2:ik(112,119,1),l1:ang(14,180),l2:ik(36,116,1)}),
    P([88,108],-14,{a1:ang(0,0),a2:ang(2,2),l1:ang(14,180),l2:ik(36,116,1),hd:10})]},
  'Straddle stretch (secs)':{front:1,dur:1.4,f:[
    P([100,112],-90,{a1:ang(-70,-80),a2:ang(-110,-100),l1:ang(8,8),l2:ang(172,172)}),
    P([100,112],-90,{tl:.55,a1:ang(40,10),a2:ang(140,170),l1:ang(8,8),l2:ang(172,172)})]},
  'Front-split progression (secs)':{dur:1.4,f:[
    P([96,100],-88,{a1:ik(104,119,1),a2:ik(88,119,1),l1:ik(150,117,1),l2:ik(42,116,1)}),
    P([96,110],-88,{a1:ik(106,119,1),a2:ik(86,119,1),l1:ik(158,117,1),l2:ik(34,116,1)})]}
};

/* ---------- geometry ---------- */
const rad=d=>d*Math.PI/180;
const dirv=(a,l)=>[Math.cos(rad(a))*l,Math.sin(rad(a))*l];
const add=(p,v)=>[p[0]+v[0],p[1]+v[1]];
function solve(root,limb,L1,L2){
  if(limb.ang){const m=add(root,dirv(limb.ang[0],L1));return [m,add(m,dirv(limb.ang[1],L2))]}
  const [tx,ty]=limb.ik,dx=tx-root[0],dy=ty-root[1];
  let d=Math.hypot(dx,dy);d=Math.max(Math.abs(L1-L2)+.01,Math.min(L1+L2-.01,d));
  const a0=Math.atan2(dy,dx),al=Math.acos((L1*L1+d*d-L2*L2)/(2*L1*d));
  const m=[root[0]+Math.cos(a0+limb.b*al)*L1,root[1]+Math.sin(a0+limb.b*al)*L1];
  const e=[root[0]+Math.cos(a0)*d,root[1]+Math.sin(a0)*d];
  return [m,e];
}
function joints(p){
  const tl=p.tl||1,sh=add(p.hip,dirv(p.t,DL.torso*tl));
  const head=add(sh,dirv(p.t+(p.hd||0),DL.neck));
  const [e1,w1]=solve(sh,p.a1,DL.ua,DL.fa),[e2,w2]=solve(sh,p.a2,DL.ua,DL.fa);
  const [k1,f1]=solve(p.hip,p.l1,DL.th,DL.sh),[k2,f2]=solve(p.hip,p.l2,DL.th,DL.sh);
  return {hip:p.hip,sh,head,e1,w1,e2,w2,k1,f1,k2,f2,arch:p.arch||0,t:p.t};
}

/* ---------- interpolation ---------- */
const lerp=(a,b,u)=>a+(b-a)*u;
const lerpA=(a,b,u)=>{let d=((b-a+540)%360)-180;return a+d*u};
function mixLimb(a,b,u){
  if(a.ik&&b.ik)return {ik:[lerp(a.ik[0],b.ik[0],u),lerp(a.ik[1],b.ik[1],u)],b:u<.5?a.b:b.b};
  if(a.ang&&b.ang)return {ang:[lerpA(a.ang[0],b.ang[0],u),lerpA(a.ang[1],b.ang[1],u)]};
  return u<.5?a:b;
}
function mixPose(a,b,u){
  return {hip:[lerp(a.hip[0],b.hip[0],u),lerp(a.hip[1],b.hip[1],u)],t:lerpA(a.t,b.t,u),
    hd:lerp(a.hd||0,b.hd||0,u),arch:lerp(a.arch||0,b.arch||0,u),tl:lerp(a.tl||1,b.tl||1,u),
    a1:mixLimb(a.a1,b.a1,u),a2:mixLimb(a.a2,b.a2,u),l1:mixLimb(a.l1,b.l1,u),l2:mixLimb(a.l2,b.l2,u)};
}
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
/* Pose of a demo at time t (seconds). Each step eases, then holds briefly. */
function poseAt(d,t){
  const f=d.f,n=f.length;if(n===1)return f[0];
  const step=d.dur||.7,mode=d.mode||'pp';
  const seq=mode==='pp'?[...f.keys(),...[...f.keys()].slice(1,-1).reverse()]:[...f.keys()];
  const k=Math.floor(t/step)%seq.length,u=(t/step)%1;
  const a=seq[k],b=seq[(k+1)%seq.length];
  if(mode==='cut'&&b===0)return f[a];
  const m=Math.min(1,u/.78);
  return mixPose(f[a],f[b],ease(m));
}

/* ---------- drawing ---------- */
function propSVG(p){
  const [k,...v]=p.split(':').map((x,i)=>i?+x:x);
  if(k==='wall')return `<path class="dp" d="M${v[0]} 14V${FLOOR}M${v[0]} 20l6-6M${v[0]} 40l6-6M${v[0]} 60l6-6M${v[0]} 80l6-6M${v[0]} 100l6-6"/>`;
  if(k==='bench')return `<path class="dp" d="M${v[0]} ${v[2]}H${v[1]}M${v[0]+3} ${v[2]}V${FLOOR}M${v[1]-3} ${v[2]}V${FLOOR}"/>`;
  if(k==='chair')return `<path class="dp" d="M${v[0]} ${v[2]}H${v[1]}M${v[0]+3} ${v[2]}V${FLOOR}M${v[1]-3} ${v[2]}V${FLOOR}M${v[0]} ${v[2]}V${v[2]-34}"/>`;
  if(k==='table')return `<path class="dp" d="M${v[0]} ${v[2]}H${v[1]}M${v[0]} ${v[2]+5}H${v[1]}M${v[0]+4} ${v[2]+5}V${FLOOR}M${v[1]-4} ${v[2]+5}V${FLOOR}"/>`;
  if(k==='couch')return `<path class="dp" d="M14 88H50V${FLOOR}M14 88V54H22V88"/>`;
  if(k==='mark')return `<path class="dr" d="M${v[0]-8} ${FLOOR+3}H${v[0]+8}"/>`;
  return '';
}
const pts=a=>a.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
function drawPose(svg,d,p){
  const j=joints(p),q=svg._parts;
  // spine: a curve so cat/cow can round or sag
  const mx=(j.hip[0]+j.sh[0])/2,my=(j.hip[1]+j.sh[1])/2,nx=Math.cos(rad(j.t-90)),ny=Math.sin(rad(j.t-90));
  q.spine.setAttribute('d',`M${j.hip[0].toFixed(1)} ${j.hip[1].toFixed(1)}Q${(mx+nx*j.arch*2).toFixed(1)} ${(my+ny*j.arch*2).toFixed(1)} ${j.sh[0].toFixed(1)} ${j.sh[1].toFixed(1)}`);
  q.head.setAttribute('cx',j.head[0].toFixed(1));q.head.setAttribute('cy',j.head[1].toFixed(1));
  q.a1.setAttribute('points',pts([j.sh,j.e1,j.w1]));q.a2.setAttribute('points',pts([j.sh,j.e2,j.w2]));
  const toe1=d.front?add(j.f1,[3,0]):add(j.f1,[DL.foot,0]),toe2=d.front?add(j.f2,[-3,0]):add(j.f2,[DL.foot,0]);
  q.l1.setAttribute('points',pts([j.hip,j.k1,j.f1,toe1]));q.l2.setAttribute('points',pts([j.hip,j.k2,j.f2,toe2]));
  if(q.towel)q.towel.setAttribute('d',`M${j.w1[0].toFixed(1)} ${j.w1[1].toFixed(1)}L${j.w2[0].toFixed(1)} ${j.w2[1].toFixed(1)}`);
  if(q.bag){q.bag.setAttribute('x',(j.w1[0]-6).toFixed(1));q.bag.setAttribute('y',(j.w1[1]-1).toFixed(1))}
}
function demoHTML(name){
  const d=DEMOS[name];if(!d)return '';
  const props=(d.props||[]).filter(p=>!['towel','bag'].includes(p)).map(propSVG).join('');
  return `<div class="demo" data-demo="${esc(name)}"><svg viewBox="0 0 200 132" role="img" aria-label="Animated demonstration: ${esc(dn(name))}">
    <path class="dfloor" d="M6 ${FLOOR}H194"/>${props}
    <g class="dfig${d.front?' front':''}"><polyline class="far" data-p="a2"/><polyline class="far" data-p="l2"/>
    ${(d.props||[]).includes('towel')?'<path class="dtowel" data-p="towel"/>':''}
    <path data-p="spine"/><polyline data-p="l1"/><polyline data-p="a1"/><circle data-p="head" r="${DL.head}"/>
    ${(d.props||[]).includes('bag')?'<rect class="dbag" data-p="bag" width="12" height="11"/>':''}</g></svg></div>`;
}

/* One animation loop drives every demo on screen. */
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let demoRAF=0;
function tickDemos(now){
  demoRAF=0;
  const els=document.querySelectorAll('.demo svg');
  let live=0;
  els.forEach(svg=>{
    if(!svg.isConnected||svg.getClientRects().length===0)return;
    const d=DEMOS[svg.parentNode.dataset.demo];if(!d)return;
    if(!svg._parts){svg._parts={};svg.querySelectorAll('[data-p]').forEach(e=>svg._parts[e.dataset.p]=e);svg._t0=now}
    const t=reduceMotion.matches?(d.f.length>1?(d.dur||.7):0):(now-svg._t0)/1000;
    drawPose(svg,d,reduceMotion.matches&&d.f.length>1?d.f[Math.min(1,d.f.length-1)]:poseAt(d,t));
    live++;
  });
  if(live&&!reduceMotion.matches)demoRAF=requestAnimationFrame(tickDemos);
}
function startDemos(){if(!demoRAF)demoRAF=requestAnimationFrame(tickDemos)}
