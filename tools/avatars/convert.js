/* Converts the supplied avatar definitions (schema bible-strong/avatar-definition v1) into the
   format the avatar runtime reads (the same shape as BOT_DATA in js/bot.js) and writes js/forms.js.
   Keeps only the expressions the animations use, plus 'neutral' (for measuring) and the still
   preview face, and adds fit (head box and reach) for framing.
   Usage: node convert.js   (reads kirby/cloudee/cubee.avatar.json next to this file) */
const fs=require('fs'),path=require('path');
const FORMS={kirby:'kirby',cloudee:'cloudee',cyber:'cubee'}; // form id -> file name
const ANIMS=['sleeping','waking','idle','listening','thinking','searching','working','excited','bored','suspicious','angry','drowsy','happy','curious','confused','surprised','proud','shy','sad','laughing','scared','playful','celebrate'];
const r2=n=>Math.round(n*100)/100;
/* The face previews show: both eyes open, looking at you (and, for Kirby, both arms in view). */
const STILL={kirby:'attentive-left',cloudee:'joyful-wide',cyber:'joyful-wide'};

function convert(def,id){
  if(def.schema!=='bible-strong/avatar-definition'||def.schemaVersion!==1)throw new Error(`${id}: unknown schema ${def.schema} v${def.schemaVersion}`);
  const missing=ANIMS.filter(a=>!def.animations[a]);
  if(missing.length)throw new Error(`${id}: missing animations ${missing.join(', ')}`);
  const used=new Set(['neutral',STILL[id]]);
  ANIMS.forEach(a=>def.animations[a].steps.forEach(s=>used.add(s.expression)));
  const expressions={};
  for(const k of used){
    const e=def.expressions[k];if(!e)throw new Error(`${id}: animation uses unknown expression ${k}`);
    const L=e.eyes.left,R=e.eyes.right;
    expressions[k]={id:k,headX:r2(e.head.x),headY:r2(e.head.y),headZ:r2(e.head.z),
      widthLeft:r2(L.width),widthRight:r2(R.width),heightLeft:r2(L.height),heightRight:r2(R.height),spacing:r2(e.eyes.spacing),
      positionXLeft:r2(L.x),positionXRight:r2(R.x),positionYLeft:r2(L.y),positionYRight:r2(R.y),leftAngle:r2(L.angle),rightAngle:r2(R.angle),
      perspective:e.perspective,eyeMotion:e.motion.eyes,bodyMotion:e.motion.body};
    if(e.colors&&e.colors.body)expressions[k].bodyColor=e.colors.body;
    if(e.colors&&e.colors.eyes)expressions[k].eyeColor=e.colors.eyes;
  }
  const surf=s=>Object.fromEntries(Object.entries(s).map(([k,v])=>[k,typeof v==='number'?r2(v):v]));
  const animations={};
  ANIMS.forEach(a=>{const A=def.animations[a];
    animations[a]={name:a,playbackMode:A.playbackMode,blink:A.blink,
      steps:A.steps.map(s=>({expressionId:s.expression,holdMs:s.holdMs,transitionMs:s.transitionMs,transition:s.transition}))}});
  return {version:1,avatar:{name:def.name,surface:surf(def.body.primary),
      bodyNodes:(def.body.nodes||[]).map((n,i)=>({id:`${id}-${i}`,surface:surf(n.surface),position:n.position.map(r2),rotation:n.rotation.map(r2)})),
      colors:{body:def.colors.body,eyes:def.colors.eyes}},
    expressions,animations,still:STILL[id]};
}

/* Where the head sits and how far the whole body reaches, in the runtime's -150..150 box, measured
   with the runtime itself: bot.js frames each body with it and puts the gear on the head. */
const vm=require('vm'),rt={window:{}};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../../js/vendor/avatar-runtime.js'),'utf8'),rt);
function bbox(paths){
  const b=[1e9,1e9,-1e9,-1e9],add=(x,y)=>{b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y)};
  paths.forEach(d=>{let x=0,y=0;
    for(const [,cmd,args] of d.matchAll(/([MCAZ])([^MCAZ]*)/g)){
      const n=(args.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
      if(cmd==='M'||cmd==='C'){for(let i=0;i<n.length;i+=2)add(n[i],n[i+1]);[x,y]=n.slice(-2)} // dense curves: control points hug the line
      else if(cmd==='A'){ // the engine draws round heads as two half-ellipses, start and end opposite
        const t=n[2]*Math.PI/180,cx=(x+n[5])/2,cy=(y+n[6])/2,hx=Math.hypot(n[0]*Math.cos(t),n[1]*Math.sin(t)),hy=Math.hypot(n[0]*Math.sin(t),n[1]*Math.cos(t));
        add(cx-hx,cy-hy);add(cx+hx,cy+hy);x=n[5];y=n[6]}
    }});
  return b.map(Math.round);
}
function fit(data){
  const at=id=>rt.window.AvatarRuntime.still(data,id),n=at('neutral');
  let ext=0;Object.keys(data.expressions).forEach(id=>{const g=at(id);bbox([g.headPath,...g.backPaths,...g.frontPaths]).forEach(v=>{ext=Math.max(ext,Math.abs(v))})});
  return {head:bbox([n.headPath]),ext};
}

const out={};
for(const [id,file] of Object.entries(FORMS)){out[id]=convert(JSON.parse(fs.readFileSync(path.join(__dirname,file+'.avatar.json'),'utf8')),id);out[id].fit=fit(out[id])}
/* The bodies share one animation timeline when it is the same, so it is written once. */
const shared=Object.values(out).every(d=>JSON.stringify(d.animations)===JSON.stringify(out.kirby.animations))?out.kirby.animations:null;
const body=Object.entries(out).map(([k,d])=>{const {animations,...rest}=d;
  return shared?`${JSON.stringify(k)}:Object.assign(${JSON.stringify(rest)},{animations:FORM_ANIMS})`:`${JSON.stringify(k)}:${JSON.stringify(d)}`}).join(',\n');
const js=`/* Hunter System: Arrow's other bodies. Generated by tools/avatars/convert.js from the supplied
   avatar definitions; edit those and re-run it rather than editing this file. Same animations as BOT_DATA. */
${shared?`const FORM_ANIMS=${JSON.stringify(shared)};\n`:''}const ARROW_FORM_DATA={
${body}
};
`;
fs.writeFileSync(path.resolve(__dirname,'../../js/forms.js'),js);
console.log(Object.entries(out).map(([k,d])=>`${k}: ${Object.keys(d.expressions).length} expressions, ${d.avatar.bodyNodes.length} nodes, head ${d.fit.head}, reach ${d.fit.ext}`).join('\n'),`\njs/forms.js ${(js.length/1024).toFixed(1)} KB`);
