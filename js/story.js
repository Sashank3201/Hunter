/* Hunter System: story events (data only).
   Four Solo Leveling arcs take turns, one live for 7 days at a time, then the next.
   After all four have run, they rerun in the same order.
   Each event has 5 daily chapters: a short story scene and a mission. Chapter n opens
   on day n, and missed chapters can be caught up later in the week. Clearing all 5
   opens the finale, a 3D boss raid.
   Scene lines: ['n', narration], ['sys', System window], ['v', speaker, words].
   Missions and raid waves are [ladder, multiplier, story label]. The exercise is the
   Player's current step on that ladder, and the amount is that step's daily target
   times the multiplier. So the same event fits an E-rank beginner and an S-rank veteran. */
const EVENT_DAYS=7, EVENT_CHAPTERS=5;
const STORY_EVENTS=[
{id:'dd',name:'Return to the Double Dungeon',short:'Double Dungeon',tag:'Cartenon Temple · where it all began',
 blurb:'The Gate that made you the Player has opened again. The statues remember you.',
 art:'<path class="em-s" d="M14 106h92M22 106V44M98 106V44M16 44h12M92 44h12M22 58h-6M98 58h6"/><circle class="em-f" cx="60" cy="56" r="30"/><path class="em-s" d="M40 50q7-8 14 0M66 50q7-8 14 0"/><path class="em-s" d="M41 66q19 20 38 0M45 69q15 10 30 0"/><circle class="em-r" cx="47" cy="47" r="3.4"/><circle class="em-r" cx="73" cy="47" r="3.4"/><path class="em-s" d="M44 90h32l6 16H38z"/>',
 chapters:[
  {t:'The Gate Reopens',exp:40,lines:[
    ['n','Rain on cracked tarmac. A D-rank Gate hums where the old one stood, the one that should never have existed.'],
    ['sys','A Gate has opened at the place where it all began.'],
    ['n','The Association calls it D-rank. You know better. Past the first chamber, a second door is waiting.'],
    ['v','Association officer','The readings keep climbing. Nobody goes in until we know what this is.'],
    ['n','You are already walking toward it.'],
    ['sys','Quest: Return to the Double Dungeon. Warm up before you enter.']],
   moves:[['legs',2,'Walk the long corridor'],['mobility',1,'Shake off the cold']],
   after:'The second door groans open. Somewhere inside, stone heads turn toward you.'},
  {t:'First Commandment',exp:40,loot:['potion'],lines:[
    ['n','The hall is enormous. Stone statues line the walls, each taller than a house, each gripping a weapon.'],
    ['n','At the far end, on a throne, sits the Statue of God. It is smiling.'],
    ['v','Stone tablet','First, worship God. Second, praise God. Third, prove your faith.'],
    ['sys','Those who do not worship will not be forgiven.'],
    ['n','Last time, the hunters who stood frozen were the first to die. Not this time.'],
    ['sys','Mission: Kneel before God. Do not stop until it is done.']],
   moves:[['legs',2,'Kneel and rise before the statue'],['core',1.5,'Bow and hold']],
   after:'The statues lower their weapons. One commandment kept.'},
  {t:'Second Commandment',exp:50,loot:['box'],lines:[
    ['n','Music. The statue with the harp has begun to play, and the whole hall hums along.'],
    ['n','One by one, the statues step down from their pedestals, moving in time with the song.'],
    ['sys','Praise God. Keep the rhythm, or be crushed by it.'],
    ['n','The Statue of God does not move. Only its smile grows wider.'],
    ['sys','Mission: Match the music. Every beat is a rep.']],
   moves:[['push',2,'Strike on every beat'],['speed',1.5,'Keep up with the song']],
   after:'The music stops mid-note. High above, stone cracks.'},
  {t:'Third Commandment',exp:50,loot:['elixir'],lines:[
    ['n','The eyes of the Statue of God begin to glow red.'],
    ['sys','Prove your faith.'],
    ['n','Light tears across the floor and cuts a pillar in half. Last time, you threw yourself onto the altar while everyone else ran. You were right.'],
    ['sys','Warning: the altar holds only those who do not break.'],
    ['sys','Mission: Hold your ground on the altar.']],
   moves:[['core',2,'Hold the altar'],['agility',2,'Dodge the burning light']],
   after:'The light dies. The altar sinks into the floor, and a door opens behind the throne.'},
  {t:'The Statue Rises',exp:60,lines:[
    ['n','Behind the throne lies a chamber older than the temple itself.'],
    ['v','Statue of God','You came back. Very few ever do.'],
    ['n','The voice comes from everywhere at once: the stone, the floor, your own chest.'],
    ['v','Statue of God','You were given power here. Show me what you made of it.'],
    ['sys','Final quest unlocked: Defeat the Statue of God.'],
    ['sys','Chapter reward: Arrow skin, Cartenon Stone.']],
   moves:[['push',1.5,'Shake off the dust'],['legs',1.5,'Climb to the throne'],['speed',1.5,'Charge']],
   after:'The ground shakes. For the first time in a thousand years, the Statue of God stands up.'}],
 raid:{name:'Cartenon Temple',boss:'The Statue of God',focus:'Everything the temple taught you',world:'temple',limit:25,exp:220,
  waves:[['legs',2.5,'Stone knights advance'],['push',2.5,'Shatter the statues'],['agility',2,'Dodge the hammers'],['core',2,'Endure its gaze'],['speed',3,'Break the Statue of God']]},
 weapon:'commandment',skin:'stone',shadow:'Granite'},

{id:'orc',name:'Orc Invasion',short:'Orc Invasion',tag:'Dungeon break · High Orcs in the city',
 blurb:'A Gate broke before the hunters arrived. War drums echo between the towers.',
 art:'<path class="em-w" d="M24 100 96 28M96 100 24 28"/><path class="em-f" d="M60 28c-16 0-26 10-26 27 0 9 3 17 9 22v15h34V77c6-5 9-13 9-22 0-17-10-27-26-27z"/><path class="em-s" d="M44 20l5 10 5-12 6 10 6-10 5 12 5-10"/><path class="em-f" d="M47 84l-6-16 10 11zM73 84l6-16-10 11z"/><circle class="em-r" cx="51" cy="56" r="3.6"/><circle class="em-r" cx="69" cy="56" r="3.6"/><path class="em-s" d="M50 72h20M54 92v-7M60 92v-7M66 92v-7"/>',
 chapters:[
  {t:'Dungeon Break',exp:40,lines:[
    ['sys','Emergency. A B-rank Gate has broken. Monsters are leaving the dungeon.'],
    ['n','Sirens. Car alarms. Then drums, deep enough to rattle the windows.'],
    ['n','The first orc steps onto the street: green skin, iron armour, tusks like knives.'],
    ['v','Association officer','Every hunter in range, hold the line until the strike team gets here!'],
    ['n','You are already in range.'],
    ['sys','Mission: Clear the street.']],
   moves:[['legs',2,'Brace the barricade'],['push',2,'Push them back']],
   after:'The street goes quiet for a moment. The drums do not.'},
  {t:'The War Drums',exp:40,loot:['potion'],lines:[
    ['n','The drums lead you to a square packed with orc warriors, painted for war.'],
    ['n','These are not ordinary orcs. They move like an army, and they are waiting for orders.'],
    ['v','High Orc','Human. You smell of the dead.'],
    ['sys','The High Orcs grow stronger while the drums play.'],
    ['sys','Mission: Silence the drummers.']],
   moves:[['speed',2,'Rush the drummers'],['core',1.5,'Take the hits']],
   after:'The last drum splits in two. Far away, a war horn answers.'},
  {t:'The Shaman\'s Curse',exp:50,loot:['box'],lines:[
    ['n','A green fog rolls down the streets. Wherever it touches, hunters slow to a crawl.'],
    ['sys','Debuff: Shaman\'s Curse. Movement speed −30%.'],
    ['n','On a rooftop, a High Orc shaman raises a staff of bone and sings.'],
    ['v','Hunter on the radio','I can\'t move... my legs feel like stone!'],
    ['sys','Mission: Break the curse. Keep moving until your body is yours again.']],
   moves:[['agility',2,'Fight through the fog'],['mobility',1.5,'Shake off the curse']],
   after:'The shaman\'s staff snaps. The fog thins. The war horn sounds again, closer.'},
  {t:'Hold the Bridge',exp:50,loot:['elixir'],lines:[
    ['n','The orcs regroup at the bridge. Behind you is a shelter full of people.'],
    ['v','Association officer','The strike team is ten minutes out. We need those ten minutes.'],
    ['sys','Mission: Hold the bridge.'],
    ['n','You plant your feet. The first wave hits like a truck.']],
   moves:[['push',2,'Shove them off the bridge'],['core',2,'Hold the line']],
   after:'Nine minutes. Eight. The bridge holds.'},
  {t:'The Warchief',exp:60,lines:[
    ['n','The horde parts. An orc twice the size of the others walks through, dragging a cleaver longer than a car.'],
    ['v','High Orc Warchief','I have killed a hundred of your hunters. You will be one more.'],
    ['n','His eyes drop to the shadows at your feet, and for the first time, he hesitates.'],
    ['sys','Final quest unlocked: Defeat the High Orc Warchief.'],
    ['sys','Chapter reward: Arrow skin, High Orc.']],
   moves:[['legs',1.5,'Stand your ground'],['pull',1.5,'Rip the cleaver away'],['speed',1.5,'Charge']],
   after:'The Warchief laughs and lifts his cleaver.'}],
 raid:{name:'The Broken Gate',boss:'The High Orc Warchief',focus:'Power: break the horde',world:'orc',limit:25,exp:220,
  waves:[['push',2.5,'Break the shield wall'],['legs',2.5,'Charge the war camp'],['speed',2,'Outrun the arrows'],['pull',2.5,'Tear down the banners'],['core',2.5,'Face the Warchief']]},
 weapon:'cleaver',skin:'orc',shadow:'Fury'},

{id:'giant',name:'Giants of Japan',short:'Giants of Japan',tag:'S-rank Gates · Tokyo',
 blurb:'Japan is falling. Giants walk through Tokyo, and their king is coming ashore.',
 art:'<path class="em-s" d="M8 104h104"/><path class="em-f" d="M26 104C26 74 38 58 60 56c22 2 34 18 34 48z"/><circle class="em-f" cx="60" cy="42" r="15"/><path class="em-f" d="M45 30l5-12 5 8 5-12 5 12 5-8 5 12z"/><circle class="em-r" cx="54" cy="43" r="2.6"/><circle class="em-r" cx="66" cy="43" r="2.6"/><path class="em-f" d="M12 104V80h10v24zM96 104V74h12v30zM30 104V90h8v14zM84 104V88h8v16z"/>',
 chapters:[
  {t:'S-Rank Alert',exp:40,lines:[
    ['sys','Urgent. Multiple S-rank Gates have broken in Japan.'],
    ['n','On every screen: Tokyo, and shapes taller than the buildings, walking through the smoke.'],
    ['v','Association chairman','Japan has asked for help. I cannot order anyone to go.'],
    ['n','You are already packing.'],
    ['sys','Mission: Get ready for the crossing.']],
   moves:[['legs',2,'Board the transport'],['push',2,'Gear up']],
   after:'The plane drops through grey clouds. Below, Tokyo is burning.'},
  {t:'City of Giants',exp:40,loot:['potion'],lines:[
    ['n','The streets shake with every footstep. A giant crouches over a highway and tears it apart like bread.'],
    ['n','They are slow. They are not weak.'],
    ['v','Japanese hunter','Thank you for coming. We lost our best this morning.'],
    ['sys','Mission: Bring down the first giant. Aim for the legs.']],
   moves:[['agility',2,'Run between its feet'],['legs',2,'Cut down the legs']],
   after:'The giant falls across three lanes of traffic. The ground does not stop shaking.'},
  {t:'The Leaning Tower',exp:50,loot:['box'],lines:[
    ['n','A tower leans over the street, held up by nothing but luck.'],
    ['n','There are still people inside.'],
    ['sys','Mission: Hold the building until everyone is out.'],
    ['n','You brace against the concrete. It is heavier than any monster.']],
   moves:[['core',2,'Hold it up'],['push',2,'Push it back']],
   after:'The last family runs past you. You let go, and the tower comes down behind you.'},
  {t:'Arise',exp:50,loot:['elixir'],lines:[
    ['n','So many giants fell today that their bodies form hills in the streets.'],
    ['n','Your shadow stretches toward them, hungry.'],
    ['sys','Shadow extraction available: giant-type.'],
    ['v','You','Arise.'],
    ['n','One by one, the giants stand up again. This time, they kneel to you.'],
    ['sys','Mission: Lead your new army across the city.']],
   moves:[['speed',2,'March'],['pull',2,'Haul the wounded out']],
   after:'Out in the bay, the sea begins to boil.'},
  {t:'The King of Giants',exp:60,lines:[
    ['n','Something rises from the bay. Water pours off its shoulders like rain.'],
    ['n','It wears a crown, and it is bigger than all the others put together.'],
    ['v','Legia','So. The Shadow has a new master.'],
    ['sys','Final quest unlocked: Defeat Legia, King of the Giants.'],
    ['sys','Chapter reward: Arrow skin, Giant King.']],
   moves:[['legs',1.5,'Climb the rubble'],['push',1.5,'Brace for the blow'],['core',1.5,'Hold on']],
   after:'The King of the Giants steps onto the shore, and Tokyo goes dark.'}],
 raid:{name:'Tokyo Bay',boss:'Legia, King of the Giants',focus:'Endurance: outlast the giants',world:'giant',limit:25,exp:240,
  waves:[['legs',2.5,'Cross the ruins'],['agility',2,'Dodge the falling stone'],['push',2.5,'Topple the giants'],['core',2,'Hold the line'],['legs',3,'Bring down the king']]},
 weapon:'giant-spear',skin:'giant',shadow:'Titan'},

{id:'war',name:'The Monarchs\' War',short:'Monarchs\' War',tag:'The final war · the Shadow against Destruction',
 blurb:'The Monarchs have come for the Shadow. The sky over the city turns red.',
 art:'<path class="em-f" d="M56 70C40 44 18 36 4 40c10 6 12 16 10 26 8-6 17-4 21 4 6-4 15-3 21 0zM64 70c16-26 38-34 52-30-10 6-12 16-10 26-8-6-17-4-21 4-6-4-15-3-21 0z"/><path class="em-f" d="M38 96l-6-34 16 14 12-24 12 24 16-14-6 34z"/><path class="em-s" d="M38 96h44"/><circle class="em-r" cx="60" cy="82" r="5"/><circle class="em-r" cx="44" cy="84" r="2.6"/><circle class="em-r" cx="76" cy="84" r="2.6"/>',
 chapters:[
  {t:'A Red Sky',exp:40,lines:[
    ['n','At noon, the sky over the city turns the colour of blood. Every Gate on earth opens at once.'],
    ['sys','Warning. Monarch-class signatures detected.'],
    ['v','Bellion','My king. They are coming for you. All of them.'],
    ['n','Behind you, your army forms ranks in the dark. Thousands of eyes open.'],
    ['sys','Mission: Prepare the army.']],
   moves:[['push',2,'Sharpen the blades'],['legs',2,'Form ranks']],
   after:'On the horizon: wings. Hundreds of them.'},
  {t:'Dragons on the Horizon',exp:40,loot:['potion'],lines:[
    ['n','Dragons. The sky is full of dragons, and every one of them breathes fire on the city.'],
    ['sys','The army of the Monarch of Destruction has arrived.'],
    ['n','Your shadows leap up to meet them. Kaisel carries you into the smoke.'],
    ['sys','Mission: Clear the sky.']],
   moves:[['speed',2,'Fly into the swarm'],['pull',2,'Drag them down']],
   after:'Burning dragons fall like meteors. The rest pull back. They are waiting for someone.'},
  {t:'Three Crowns',exp:50,loot:['box'],lines:[
    ['n','Three Monarchs walk out of the smoke. Frost spreads from the first. The second snarls like a wolf. The third keeps changing its face.'],
    ['v','Monarch','Kneel, Shadow, and we will make it quick.'],
    ['v','Igris','My king. Let us fight beside you.'],
    ['sys','Mission: Face the Monarchs.']],
   moves:[['push',2,'Clash with the beast'],['core',2,'Withstand the frost']],
   after:'Three crowns hit the ground. Only one Monarch is left.'},
  {t:'The Shadow Army',exp:50,loot:['elixir'],lines:[
    ['n','Every shadow you have ever raised stands with you now: knights, ants, orcs, giants. An army without end.'],
    ['sys','Shadow army at full strength.'],
    ['v','Beru','My king, the ants are hungry.'],
    ['n','Across the ruined city, the last Monarch\'s dragons gather for one final attack.'],
    ['sys','Mission: Lead the charge.']],
   moves:[['legs',2,'Lead the charge'],['speed',2,'Break their line'],['agility',1.5,'Cut through']],
   after:'The dragons scatter. The sky splits open, and something enormous comes through.'},
  {t:'The Monarch of Destruction',exp:60,lines:[
    ['n','The King of Dragons descends from the red sky, wrapped in black fire.'],
    ['v','Antares','Shadow Monarch. I have waited a long time for this.'],
    ['n','His wings blot out the sun. The whole city holds its breath.'],
    ['sys','Final quest unlocked: Defeat Antares, the Monarch of Destruction.'],
    ['sys','Chapter reward: Arrow skin, Monarch.']],
   moves:[['push',1.5,'Raise your blade'],['legs',1.5,'Stand firm'],['core',1.5,'Face the fire']],
   after:'Antares lands, and the ground melts beneath him.'}],
 raid:{name:'The Last Battlefield',boss:'Antares, Monarch of Destruction',focus:'Everything at once: end the war',world:'war',limit:28,exp:260,
  waves:[['speed',2.5,'Cut through the dragons'],['push',2.5,'Break the Monarch\'s guard'],['legs',2.5,'Hold the city'],['agility',2,'Dodge the black fire'],['core',2.5,'Slay the King of Dragons']]},
 weapon:'antares',skin:'monarch',shadow:'Ruin'}
];

/* Event shadows: extracted from each event's boss raid. Name -> event and starting grade.
   Their body, look and skill live with the other shadows in data.js. */
const EVENT_SHADOWS={Granite:{ev:'dd',rank:'Elite Knight'},Fury:{ev:'orc',rank:'Elite Knight'},Titan:{ev:'giant',rank:'Knight Commander'},Ruin:{ev:'war',rank:'Knight Commander'}};

/* Arrow skins: the orb's body and eye colours, unlocked by clearing an event's five chapters.
   Each colour is mid-toned so the orb reads on both the paper and the night theme. */
const ARROW_SKINS={
  stone:{n:'Cartenon Stone',ev:'dd',body:'#7d776d',eyes:'#ff3b2f'},
  orc:{n:'High Orc',ev:'orc',body:'#3e5a30',eyes:'#ffcf3d'},
  giant:{n:'Giant King',ev:'giant',body:'#a8743a',eyes:'#fff1d0'},
  monarch:{n:'Monarch',ev:'war',body:'#4a1a6e',eyes:'#ff8a2a'}
};
