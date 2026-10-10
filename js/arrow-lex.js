/* Arrow's word lists for Telugu and Hindi written in English letters ("rendu idlis tinna",
   "do roti khayi"). The food parser merges these into its English tables, and the language
   model uses them for its placeholders, so both understand the same words. */
const AX_NUM={oka:1,okati:1,okka:1,okkati:1,rendu:2,remdu:2,moodu:3,mudu:3,muudu:3,naalugu:4,nalugu:4,naalgu:4,aidu:5,ayidu:5,aaru:6,aru:6,edu:7,eedu:7,
  enimidi:8,enmidi:8,tommidi:9,padi:10,sagam:.5,sagamu:.5,
  ek:1,do:2,teen:3,char:4,chaar:4,paanch:5,panch:5,chhe:6,chhah:6,che:6,saat:7,aath:8,aat:8,nau:9,das:10,aadha:.5,adha:.5,aadhi:.5,adhi:.5,dedh:1.5,dhai:2.5,dhaai:2.5,sava:1.25};
const AX_UNIT={bowl:'katori katoris katoriyan katori ginne ginna gina ginnelu ginnalu',plate:'pleatu plateu',glass:'glassu gilaas gilas glasu',cup:'kappu',
  tsp:'chamcha chammach chamach spoonu',piece:'mukka mukkalu mukkal tukda tukde tukdaa',bottle:'botal'};
const AX_SIZE={pedda:1.4,peddha:1.4,chinna:.7,bada:1.4,badi:1.4,bade:1.4,chhota:.7,chhoti:.7,chota:.7,choti:.7,konchem:.5,koncham:.5,kontha:.5,
  thoda:.5,thodi:.5,thora:.5,chala:1.5,chaala:1.5,zyada:1.5,jyada:1.5,jaada:1.5};
const AX_MEAL={tiffin:'breakfast',tiffinu:'breakfast',nashta:'breakfast',naashta:'breakfast',nasta:'breakfast',nashte:'breakfast',poddunna:'breakfast',podduna:'breakfast',
  poddune:'breakfast',udayam:'breakfast',subah:'breakfast',subha:'breakfast',savere:'breakfast',sawere:'breakfast',madhyanam:'lunch',madhyaanam:'lunch',madhyahnam:'lunch',
  dopahar:'lunch',dopeher:'lunch',dophar:'lunch',dupahar:'lunch',ratri:'dinner',raatri:'dinner',rathri:'dinner',rathiri:'dinner',raat:'dinner',raath:'dinner',
  sayantram:'snack',saayantram:'snack',saayankalam:'snack',shaam:'snack',sham:'snack'};
/* Words that carry no food meaning: pronouns, "today", eat/drink verbs, particles. */
const AX_FILL=('nenu naaku naa memu manam ivala ivvala eeroju ee roju ippude ippudu lo ki ni ga gaa kuda kooda konni anni undi unnayi unnai '+
  'tinna tinnanu tinnaanu tinnam tinnamu tinesa tinesanu tinestha tintunna tintunnanu tinnadu tinindi tinnav tinnava taaganu tagaanu taagina thaaganu thaganu taagesa '+
  'taagesanu tagina chesa chesanu chesukunna tisukunna teesukunna tiskunna vachindi kada ra ri andi anna akka mama bhojanam koodu '+
  'maine mene mainne mai main mein me mera meri mere mujhe humne hum aaj ne ko ka ke se par pe hain tha thi the hu hoon hun liya liye lia gaya gayi gaye '+
  'kiya kia khaya khaayi khayi khaye khaaya khaa kha khane khana khaana piya piye pee peeya raha rahi rahe bhi toh yaar bhai ji sirf bas wala wali wale kuch sab').split(' ');
/* Words that join foods: "annam mariyu pappu", "roti aur dal", "pappu tho annam". */
const AX_SEP=['aur','mariyu','kani','lekin','magar','inka','tho','saath','sath','phir','fir','taruvata','tarvata','tarvatha','taruvatha','baad','baadme','baadmein'];
/* Not eaten: "tinaledu", "nahi khaya". */
const AX_NEG=['tinaledu','tinledu','tinala','tinaledhu','tinnaledu','taagaledu','thagaledu','ledu','nahi','nahin','nhi','mat'];
/* Exercises, app pages, shadows and kitchen words, for Arrow's language model. */
const AX_EX=('push up|pushup|push ups|pushups|push-up|pull up|pullup|pull ups|pullups|chin up|squat|squats|lunge|lunges|plank|planks|burpee|burpees|dip|dips|crunch|crunches|'+
  'sit up|situp|sit ups|jumping jack|jumping jacks|mountain climber|mountain climbers|glute bridge|bridge|row|rows|pike push up|handstand|wall sit|calf raise|calf raises|'+
  'stretch|stretches|stretching|sprint|sprints|high knees|skipping|hollow hold|leg raise|leg raises|superman|bear crawl|deep squat|cobra|yoga|dand|baithak|'+
  'diamond push up|archer push up|wall push up|knee push up|incline push up|decline push up|table row|y t w raise|step up|step ups|jump squat|box jump|warm up|cool down|'+
  'muscle up|muscle ups|handstand push up|l sit|front lever|back lever|planche|pistol squat|dragon flag|human flag|nordic curl|skin the cat|tuck planche|hanging leg raise|'+
  'australian row|bench dip|wall walk|frog stand|crow pose').split('|');
const AX_TAB=('status|home|home page|main page|quest|quests|quest tab|gates|gate|dungeon|dungeons|progress|diet|nutrition|recipes|recipe book|history|feats|achievements|badges|'+
  'plan|skills|army|armory|armoury|weapons|weapon|grocery|grocery list|shopping list|report|weekly report|settings|profile|license|licence|card|page|tab|screen').split('|');
const AX_SHADOW=['igris','iron','tank','tusk','beru','bellion','kaisel','greed','jima','shadow','shadows','captain','vice captain','soldier'];
const AX_KITCHEN=['kitchen','fridge','pantry','refrigerator','intlo','inti lo','ghar','ghar mein','ghar pe','store','stock'];
