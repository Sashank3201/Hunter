/* Hunter System: "Catch the System", a rest-period mini game.
   The bot hops around a small arena while you rest. Tap it to catch it; quick
   catches build a combo and make it hop faster. Miss and it teases you; tap like
   mad and it gets angry; leave it alone and it gets bored, then falls asleep.
   Five seconds before the rest ends it stops, faces you and gets you ready.
   Every reaction is one of the bot's own animations. */
const BG_SIZE=78;
const BotGame=(()=>{
  const G={on:false,arena:null,box:null,hop:null,left:null,x:0,y:0,score:0,combo:0,miss:0,last:0,taps:[],t:0,idleT:0,state:'',best:0,newBest:false};
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const hud=()=>{
    const b=G.arena&&G.arena.querySelector('.bg-hud');if(!b)return;
    b.innerHTML=`<span>Caught <b>${G.score}</b></span><span class="${G.combo>1?'hot':''}">Combo <b>×${Math.max(1,G.combo)}</b></span><span>Best <b>${Math.max(G.best,G.score)}</b></span>`;
  };
  const say=(t,cls)=>{const e=G.arena&&G.arena.querySelector('.bg-say');if(!e)return;e.textContent=t;e.className='bg-say'+(cls?' '+cls:'');e.classList.remove('in');void e.offsetWidth;e.classList.add('in')};
  /* Where the bot is right now, even mid-hop. */
  function pos(){
    if(!G.box)return {x:G.x,y:G.y};
    const t=getComputedStyle(G.box).transform;
    if(!t||t==='none')return {x:G.x,y:G.y};
    const m=new DOMMatrixReadOnly(t);return {x:m.m41,y:m.m42};
  }
  /* The bot's top-left corner stays inside the arena, below the score line. */
  function bounds(){const r=G.arena.getBoundingClientRect();return {w:Math.max(0,r.width-BG_SIZE),y0:30,y1:Math.max(40,r.height-BG_SIZE-4)}}
  /* A hop is a real arc: x moves evenly, y follows a parabola, with a squash on take-off and landing. */
  function hopTo(x,y,ms,height){
    const p=pos(),pts=[],n=12,h=height===undefined?Math.min(90,40+Math.hypot(x-p.x,y-p.y)*.35):height;
    for(let i=0;i<=n;i++){const k=i/n,ax=p.x+(x-p.x)*k,ay=p.y+(y-p.y)*k-4*h*k*(1-k);pts.push({transform:`translate(${ax}px,${ay}px)`})}
    if(G.hop)G.hop.cancel();
    G.x=x;G.y=y;
    if(!G.box.animate){G.box.style.transform=`translate(${x}px,${y}px)`;return}
    G.box.style.transform=`translate(${x}px,${y}px)`;
    G.hop=G.box.animate(pts,{duration:ms,easing:'cubic-bezier(.45,.05,.55,.95)'});
    const sq=G.box.firstElementChild;
    if(sq&&sq.animate)sq.animate([{transform:'scale(1.12,.86)'},{transform:'scale(.9,1.12)',offset:.25},{transform:'scale(1,1)',offset:.8},{transform:'scale(1.14,.84)',offset:.92},{transform:'scale(1,1)'}],{duration:ms+160,easing:'ease-out'});
  }
  function randomSpot(){const b=bounds(),p=pos();let x,y,k=0;do{x=rnd(0,b.w);y=rnd(b.y0,b.y1)}while(Math.hypot(x-p.x,y-p.y)<b.w*.3&&++k<8);return {x,y}}
  /* The loop: hop, wait, hop. Faster with a higher combo. */
  function tick(){
    clearTimeout(G.t);if(!G.on)return;
    const ms=G.left();
    if(ms<=5200&&G.state!=='ready'){ready();return}
    if(G.state==='ready'){if(ms>5600){G.state='play';Bot.setMood('playful');say('Back to it.')}else{G.t=setTimeout(tick,400);return}}
    if(G.state==='sleep'){G.t=setTimeout(tick,600);return}
    const s=randomSpot(),speed=Math.max(.5,1-G.combo*.06);
    hopTo(s.x,s.y,Math.round(560*speed+60));
    G.t=setTimeout(tick,Math.round(rnd(780,1300)*speed)+560*speed);
  }
  function ready(){
    G.state='ready';const b=bounds();
    hopTo(b.w/2,(b.y0+b.y1)/2,620,70);Bot.setMood('excited');Bot.react('excited',1200);say('Get ready! Next set.','hot');buzz('set');
    G.t=setTimeout(tick,400);
  }
  /* Nothing for 9 s: bored. 18 s: asleep. */
  function idleWatch(){
    clearTimeout(G.idleT);
    G.idleT=setTimeout(()=>{if(!G.on||G.state==='ready')return;Bot.setMood('bored');say('…bored now.');
      G.idleT=setTimeout(()=>{if(!G.on||G.state==='ready')return;G.state='sleep';Bot.setMood('sleeping');say('Zz. Tap to wake it.')},9000)},9000);
  }
  function wake(){G.state='play';Bot.setMood('playful');Bot.react('waking',1300);say('Awake. Catch me!');clearTimeout(G.t);G.t=setTimeout(tick,900)}
  function onTap(e){
    if(!G.on)return;
    const now=Date.now();G.taps=G.taps.filter(t=>now-t<1200);G.taps.push(now);idleWatch();
    if(G.state==='sleep'){Bot.squish();wake();buzz('tap');return}
    if(G.state==='ready'){Bot.squish();Bot.react('happy',900);return}
    if(G.taps.length>=7){Bot.react('angry',1600);say('Stop spamming!','bad');buzz('bad');G.combo=0;hud();return}
    const r=G.box.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,hit=Math.hypot(e.clientX-cx,e.clientY-cy)<=BG_SIZE*.62;
    if(hit)catchIt(now,e);else missIt(e);
  }
  function catchIt(now,e){
    G.combo=now-G.last<2600?G.combo+1:1;G.last=now;G.miss=0;G.score+=1;
    if(G.score>G.best&&!G.newBest&&G.best>0){G.newBest=true;Bot.react('proud',1500);say('New best!','hot');buzz('level')}
    else{const c=G.combo;const r=c>=8?'celebrate':c>=5?'excited':c===3?'laughing':c===2?'happy':['surprised','scared','shy','surprised'][Math.floor(Math.random()*4)];
      Bot.react(r,c>=8?1600:1100);say(c>=8?`×${c} combo! Unreal.`:c>=5?`×${c} combo!`:c>=2?`×${c}`:['Caught!','Hey!','Got me.','Eep!'][Math.floor(Math.random()*4)],c>=5?'hot':'');buzz('tap')}
    Bot.squish();pop(e,'+1');hud();
    clearTimeout(G.t);G.t=setTimeout(()=>{if(G.on&&G.state==='play'){const s=randomSpot();hopTo(s.x,s.y,420,70);G.t=setTimeout(tick,900)}},260);
  }
  function missIt(e){
    G.combo=0;G.miss++;hud();pop(e,'miss','m');
    if(G.miss>=3){Bot.react('suspicious',1500);say('Are you even trying?');G.miss=0}
    else{Bot.react(Math.random()<.5?'laughing':'playful',1100);say(['Too slow!','Missed!','Nope.','Over here!'][Math.floor(Math.random()*4)])}
  }
  function pop(e,t,cls){
    const a=G.arena.getBoundingClientRect(),p=document.createElement('span');p.className='bg-pop'+(cls?' '+cls:'');p.textContent=t;
    p.style.left=(e.clientX-a.left)+'px';p.style.top=(e.clientY-a.top)+'px';G.arena.appendChild(p);setTimeout(()=>p.remove(),800);
  }
  function start(arena,left){
    stop(true);
    G.on=true;G.arena=arena;G.left=left;G.score=0;G.combo=0;G.miss=0;G.last=0;G.taps=[];G.state='play';G.newBest=false;G.best=S.botBest||0;
    G.box=arena.querySelector('.bg-bot');
    Bot.mount(G.box.querySelector('.bg-sq'));Bot.setMood('playful');Bot.resume();
    const b=bounds();G.x=b.w/2;G.y=-BG_SIZE;G.box.style.transform=`translate(${G.x}px,${G.y}px)`;
    hopTo(b.w/2,(b.y0+b.y1)/2,700,0);Bot.react('surprised',900); // drops in
    arena.addEventListener('pointerdown',onTap);
    hud();say('Catch me while you rest!');idleWatch();
    G.t=setTimeout(tick,1300);
  }
  function stop(silent){
    if(!G.on)return;
    G.on=false;clearTimeout(G.t);clearTimeout(G.idleT);if(G.hop)G.hop.cancel();
    if(G.arena)G.arena.removeEventListener('pointerdown',onTap);
    if(G.score>(S.botBest||0)){S.botBest=G.score;save()}
    if(!silent&&G.score)toast(`Caught ×${G.score}${G.score>G.best?' · new best':''}`);
    G.arena=null;G.box=null;Bot.pause();
  }
  return {
    get on(){return G.on},
    start,stop,
    /* Call after rendering a screen: starts the game if an arena is showing, stops it if not. */
    sync(left){const a=document.querySelector('.bg-arena');if(a&&!a.offsetParent)return stop();if(a&&a!==G.arena)start(a,left);else if(!a)stop()}
  };
})();
function botGameHTML(){
  return `<div class="bg-arena" aria-label="Mini game: tap Arrow to catch it"><div class="bg-hud"></div><p class="bg-say" aria-live="polite"></p>
    <div class="bg-bot"><div class="bg-sq"></div></div></div>`;
}
