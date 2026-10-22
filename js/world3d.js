/* Hunter System: 3D dungeon worlds (three.js), one per Gate grade.
   Loaded only when a Gate opens. Purely visual: dungeons.js owns the raid and
   tells the world what happened (wave progress, wave cleared, victory, defeat).
   Every world is built procedurally from simple shapes, so nothing is downloaded
   but this file and three.js. */
import * as THREE from './vendor/three.module.min.js';

const STEP=16;   // distance between wave stations
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const rngOf=seed=>()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

/* ---------- themes ----------
   sky: background gradient top/bottom. fog: color, density. hemi: sky, ground, intensity.
   mob/boss: kind of creature, body color, eye color, scale. */
const THEMES={
  E:{walls:'cave',sky:['#050302','#140b06'],fog:['#110a06',.06],hemi:['#ffb27a','#140904',.32],ground:'#3a2a1e',rock:'#3e2e22',light:'#ff8a3d',deco:'torch',
     parts:{kind:'ember',color:'#ffa860',n:150},mob:{kind:'goblin',body:'#1a120c',eye:'#ff6a2a',s:.95},boss:{kind:'brute',body:'#1c140e',eye:'#ff4a1a',s:1.9,club:true}},
  D:{walls:'cave',sky:['#010403','#04100b'],fog:['#04100b',.062],hemi:['#8dffd6','#020a07',.32],ground:'#0e2620',wet:true,rock:'#16302a',light:'#3dffb0',deco:'mushroom',
     parts:{kind:'mote',color:'#7dffd0',n:180},mob:{kind:'snake',body:'#0b1714',eye:'#7dffb8',s:1},boss:{kind:'serpent',body:'#0e1d17',eye:'#ffd23d',s:1}},
  C:{walls:'forest',sky:['#6f8aa2','#dbe6ee'],fog:['#b3c7d5',.04],hemi:['#eef8ff','#6d7f90',1.0],ground:'#e6eff4',rock:'#c6d4de',light:'#cfeeff',deco:'crystal',
     parts:{kind:'snow',color:'#ffffff',n:650},mob:{kind:'elf',body:'#141a24',eye:'#8fe3ff',s:1.05},boss:{kind:'lancer',body:'#111824',eye:'#9fe9ff',s:1.75}},
  B:{walls:'spires',sky:['#1c0201','#7a1206'],fog:['#3a0604',.05],hemi:['#ff7a5a','#120201',.55],ground:'#2e0e0b',rock:'#220907',light:'#ff3a20',deco:'crack',
     parts:{kind:'ember',color:'#ff5a30',n:260},mob:{kind:'beast',body:'#150605',eye:'#ffd23d',s:1.1},boss:{kind:'brute',body:'#170706',eye:'#ffe14a',s:2.1,horns:true}},
  A:{walls:'castle',sky:['#040208','#140a1c'],fog:['#170b24',.048],hemi:['#cfa8ff','#06030a',.38],ground:'#262130',rock:'#332c3e',light:'#b05cff',deco:'brazier',
     parts:{kind:'mote',color:'#c08aff',n:170},mob:{kind:'knight',body:'#130e1a',eye:'#ff3a3a',s:1.15},boss:{kind:'brute',body:'#160b14',eye:'#ff7a1a',s:2.3,horns:true,big:true}},
  S:{walls:'nest',sky:['#030502','#0b1407'],fog:['#0d1609',.058],hemi:['#c3ff8a','#060a03',.34],ground:'#28220f',rock:'#332a14',light:'#9dff4a',deco:'egg',
     parts:{kind:'spore',color:'#b6ff7a',n:220},mob:{kind:'ant',body:'#0f0d09',eye:'#c08dff',s:1},boss:{kind:'insect',body:'#110d16',eye:'#c08dff',s:1.8}},
  /* story event raids. cam: look heights and how far back the camera stands for big bosses. */
  temple:{walls:'temple',sky:['#040303','#120d0a'],fog:['#100c09',.05],hemi:['#ffd2a0','#0a0604',.34],ground:'#3a342d',tiles:['#3a342d','#15120f'],rock:'#4a443c',statue:'#5d584f',light:'#ffa04a',deco:'brazier',
     parts:{kind:'mote',color:'#ffd9a0',n:140},mob:{kind:'knight',stone:true,body:'#6a655c',eye:'#ff3b2f',s:1.25},boss:{kind:'colossus',body:'#77716a',eye:'#ff2a1a',s:2},
     cam:{bossLook:5.6,bossBack:3.2,bossHit:5.2,bossLight:9}},
  orc:{walls:'city',sky:['#060507','#2b0c05'],fog:['#1c0a05',.042],hemi:['#ff9a5a','#08040a',.42],ground:'#24211f',flat:true,road:'#d8c060',rock:'#2c2826',light:'#ff6a2a',deco:'fire',windows:'#ffb35a',
     parts:{kind:'ember',color:'#ff8a3d',n:240},mob:{kind:'brute',tusks:true,axe:true,noClaws:true,noCore:true,body:'#2f4a24',eye:'#ffcf3d',s:.72,ei:.025},
     boss:{kind:'brute',tusks:true,cleaver:true,horns:true,noClaws:true,noCore:true,body:'#33482a',eye:'#ff5a1a',s:2,ei:.04},cam:{bossLook:3.6,bossBack:1.2}},
  giant:{walls:'city',tall:true,sky:['#3b1d12','#e0884a'],fog:['#b8704a',.026],hemi:['#ffd6b0','#3a2418',.72],ground:'#4e443c',flat:true,road:'#cfc6b4',rock:'#4a3e36',light:'#ffb070',deco:'fire',windows:'#2a2420',
     parts:{kind:'ash',color:'#d9c9b8',n:420},mob:{kind:'brute',noClaws:true,noCore:true,bald:true,body:'#3d2c25',eye:'#ffe0a0',s:1.55},
     boss:{kind:'brute',noClaws:true,noCore:true,crown:true,bald:true,body:'#4a3020',eye:'#ffd23d',s:2.9},spread:1.55,cam:{mobLook:2.5,mobBack:4.5,bossLook:6.2,bossBack:4.2,bossHit:6,bossLight:10}},
  war:{walls:'sky',sky:['#08030c','#3d0b22'],fog:['#1d0a1c',.034],hemi:['#c890ff','#0a0410',.48],ground:'#1d1720',rock:'#2a2230',light:'#b05cff',deco:'crack',storm:true,
     parts:{kind:'ember',color:'#ff7a3a',n:280},mob:{kind:'knight',body:'#1a0f24',eye:'#c08aff',s:1.2},boss:{kind:'dragon',body:'#3a1a34',eye:'#ff7a1a',s:1.9},
     cam:{bossLook:6,bossBack:6.5,bossHit:5.6,bossLight:9}},
  /* an ice palace on the frozen river (banner, wall, sun: castle colours and light) */
  frost:{walls:'castle',sky:['#0a1a2c','#6f93b4'],fog:['#46688a',.04],hemi:['#e4f6ff','#1a2a3a',.8],sun:.7,ground:'#cfe2ee',tiles:['#c4dceb','#86a8c2'],rock:'#a9c6da',banner:'#2f6fae',wall:'#5d7f9c',
     light:'#9fe3ff',deco:'crystal',parts:{kind:'snow',color:'#ffffff',n:600},mob:{kind:'elf',body:'#1a2433',eye:'#8fe3ff',s:1.05},boss:{kind:'lancer',crown:true,body:'#22324a',eye:'#bff3ff',s:2.2},
     cam:{bossLook:4.4,bossBack:2,bossHit:4.2,bossLight:7}},
  /* the Fang King's mountain under a blood moon */
  beast:{walls:'spires',sky:['#07050a','#3a0d10'],fog:['#1a0a0c',.045],hemi:['#ff9a8a','#0a0406',.6],sun:.4,ground:'#2a2420',rock:'#2e2824',light:'#ff4a2a',deco:'crack',moon:'#ff3b2f',
     parts:{kind:'ash',color:'#c9b8a8',n:300},mob:{kind:'beast',body:'#2a2420',eye:'#ffb21a',s:1.25},boss:{kind:'beast',body:'#3a322c',eye:'#ff5a1a',s:3.2},spread:1.2,
     cam:{bossLook:2.8,bossBack:2.5,bossHit:3,bossLight:6}},
  /* the Plague Queen's hive in the old port */
  plague:{walls:'nest',sky:['#060602','#22220a'],fog:['#1c1c08',.055],hemi:['#eaff8a','#0a0a03',.36],ground:'#2c2a12',rock:'#3a3816',light:'#d8ff3a',deco:'egg',
     parts:{kind:'spore',color:'#e8ff6a',n:300},mob:{kind:'ant',body:'#17150a',eye:'#ffe14a',s:1.05},boss:{kind:'insect',body:'#1c1a0c',eye:'#f3ff6a',s:2.1},cam:{bossLook:3.8,bossBack:1.5}},
  /* a city of illusions: pink light, faceless copies in the street */
  mirror:{walls:'city',sky:['#0a0410','#2a0a2a'],fog:['#1a0a1e',.04],hemi:['#ff9ae0','#0a040c',.5],ground:'#1e1820',flat:true,road:'#ff4fb8',rock:'#2a2230',light:'#ff4fb8',deco:'crack',windows:'#ff9ae0',
     parts:{kind:'mote',color:'#ffb8ec',n:200},mob:{kind:'knight',body:'#4a4250',eye:'#ff4fb8',s:1},boss:{kind:'brute',horns:true,body:'#2a1838',eye:'#ff4fb8',s:2.2},cam:{bossLook:3.6,bossBack:1.4}}
};

/* ---------- textures ---------- */
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const glowTex=()=>canvasTex(64,64,(g,w)=>{const r=g.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,w)});
const skyTex=(top,bottom)=>canvasTex(4,256,(g,w,h)=>{const r=g.createLinearGradient(0,0,0,h);r.addColorStop(0,top);r.addColorStop(1,bottom);g.fillStyle=r;g.fillRect(0,0,w,h)});
const tileTex=(base,line)=>{const t=canvasTex(256,256,(g,w)=>{g.fillStyle=base;g.fillRect(0,0,w,w);g.strokeStyle=line;g.lineWidth=6;for(let i=0;i<=2;i++){g.beginPath();g.moveTo(i*128,0);g.lineTo(i*128,w);g.stroke();g.beginPath();g.moveTo(0,i*128);g.lineTo(w,i*128);g.stroke()}
  for(let i=0;i<220;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*.18})`;g.fillRect(Math.random()*w,Math.random()*w,3+Math.random()*8,2+Math.random()*5)}});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};
const swirlTex=color=>canvasTex(256,256,(g,w)=>{g.translate(w/2,w/2);const r=g.createRadialGradient(0,0,0,0,0,w/2);r.addColorStop(0,'#ffffff');r.addColorStop(.18,color);r.addColorStop(.75,'#14060a');r.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=r;g.beginPath();g.arc(0,0,w/2,0,7);g.fill();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,220,220,.35)';g.lineWidth=5;
  for(let a=0;a<6;a++){g.beginPath();for(let t=0;t<1;t+=.02){const ang=a*Math.PI/3+t*5,rad=t*w*.48;g.lineTo(Math.cos(ang)*rad,Math.sin(ang)*rad)}g.stroke()}});

/* ---------- the world ---------- */
export function createWorld(canvas,{grade='E',waves=4,bossWave=3,reduced=false,weapon=null}={}){
  const T=THEMES[grade]||THEMES.E,rnd=rngOf(grade.charCodeAt(0)*7919);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const camera=new THREE.PerspectiveCamera(62,1,.1,220);
  const GLOW=glowTex(),disposables=[GLOW];
  const keep=o=>{disposables.push(o);return o};
  const L=STEP*(waves+1)+30; // corridor length

  /* ----- dungeon scene ----- */
  const scene=new THREE.Scene();
  scene.background=keep(skyTex(T.sky[0],T.sky[1]));
  const fogBase=new THREE.Color(T.fog[0]);scene.fog=new THREE.FogExp2(fogBase.clone(),T.fog[1]);
  const hemi=new THREE.HemisphereLight(T.hemi[0],T.hemi[1],T.hemi[2]);scene.add(hemi);
  const sun=new THREE.DirectionalLight(T.hemi[0],T.sun!==undefined?T.sun:T.walls==='forest'||T.tall?.9:.25);sun.position.set(3,10,6);scene.add(sun);
  const C=Object.assign({mobLook:1.15,mobBack:0,bossLook:3.1,bossBack:0,bossHit:2.6,bossLight:4.6},T.cam||{}); // camera and light heights
  const lantern=new THREE.PointLight(T.light,16,14,1.5);scene.add(lantern); // follows the camera
  const stationLights=[0,1,2].map((_,k)=>{const l=new THREE.PointLight(T.light,k?14:46,k?12:20,1.5);scene.add(l);return l});
  const mat=(color,o={})=>keep(new THREE.MeshStandardMaterial(Object.assign({color,roughness:.92,metalness:.05,flatShading:true},o)));
  const basic=(color,o={})=>keep(new THREE.MeshBasicMaterial(Object.assign({color},o)));
  const sprite=(color,size,opacity=1)=>{const s=new THREE.Sprite(keep(new THREE.SpriteMaterial({map:GLOW,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false})));s.scale.set(size,size,1);return s};
  const geo=g=>keep(g);
  /* Many copies of one shape in a single draw call. */
  function instanced(g,m,list){
    const im=new THREE.InstancedMesh(geo(g),m,list.length),o=new THREE.Object3D();
    list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(p[3]||0,p[4]||0,p[5]||0);const s=p[6]||1;o.scale.set(s*(p[7]||1),s*(p[8]||1),s*(p[9]||1));o.updateMatrix();im.setMatrixAt(i,o.matrix)});
    im.instanceMatrix.needsUpdate=true;scene.add(im);return im;
  }

  // ground
  const gg=new THREE.PlaneGeometry(40,L+40,40,Math.round((L+40)/1.2));gg.rotateX(-Math.PI/2);
  const gp=gg.attributes.position;
  for(let i=0;i<gp.count;i++){const x=gp.getX(i),z=gp.getZ(i),edge=Math.max(0,Math.abs(x)-3);
    const h=T.wet||T.flat?0:(Math.sin(x*.9)*Math.cos(z*.6)*.12+Math.sin(z*.31+x)*.1+(rnd()-.5)*.08)+edge*edge*(T.walls==='forest'?.04:.12);gp.setY(i,h)}
  gg.computeVertexNormals();
  const groundMat=T.walls==='castle'||T.tiles?mat('#ffffff',{map:(()=>{const t=keep(tileTex(T.tiles?T.tiles[0]:T.ground,T.tiles?T.tiles[1]:'#120d18'));t.repeat.set(10,(L+40)/4);return t})(),flatShading:false,roughness:.7})
    :mat(T.ground,T.wet?{roughness:.34,metalness:.4,flatShading:false}:T.walls==='forest'?{flatShading:false,roughness:.85}:{});
  const ground=new THREE.Mesh(geo(gg),groundMat);ground.position.z=-(L/2)+14;scene.add(ground);

  // walls and props per theme
  const glows=[]; // flickering decorative lights (sprites)
  const rock=mat(T.rock);
  if(T.walls==='cave'){
    const R=[],C=[],G=[];
    for(let z=12;z>-L;z-=1.3){[-1,1].forEach(sd=>{R.push([sd*(3.7+rnd()*1.3),rnd()*3.2,z,rnd()*3,rnd()*3,0,1.1+rnd()*1.4,1,1.3,1])});
      R.push([(rnd()-.5)*6,4.6+rnd()*1.2,z,rnd()*3,rnd()*3,0,1.2+rnd()*1.2,1.3,.8,1]);
      if(rnd()<.55)C.push([(rnd()-.5)*5.5,4.4,z+rnd(),Math.PI,0,0,.6+rnd()*.7,1,1+rnd()*1.6,1]);
      if(rnd()<.35)G.push([(rnd()<.5?-1:1)*(2.4+rnd()*.8),0,z,0,rnd()*3,0,.4+rnd()*.5,1,1+rnd(),1])}
    instanced(new THREE.IcosahedronGeometry(1,0),rock,R);
    instanced(new THREE.ConeGeometry(.28,1.6,5),rock,C);
    instanced(new THREE.ConeGeometry(.3,1.3,5),rock,G);
  }else if(T.walls==='forest'){
    const tr=[],f=[],sn=[],cr=[];
    for(let z=12;z>-L;z-=2.1){[-1,1].forEach(sd=>{for(let k=0;k<3;k++){const x=sd*(4.2+k*3.4+rnd()*2.4),zz=z+rnd()*1.6,h=1+rnd()*.6;
      tr.push([x,.9*h,zz,0,0,0,1,1,h,1]);[0,1,2].forEach(j=>{f.push([x,(1.9+j*1.25)*h,zz,0,rnd()*3,0,(1.9-j*.45)*h,1,1,1]);sn.push([x,(2.25+j*1.25)*h,zz,0,rnd()*3,0,(1.15-j*.28)*h,1,.55,1])})}});
      if(rnd()<.3)cr.push([(rnd()<.5?-1:1)*(2.6+rnd()*1.2),.4,z,rnd()*.4,rnd()*3,rnd()*.4,.35+rnd()*.4,1,2.2,1])}
    instanced(new THREE.CylinderGeometry(.16,.24,1.8,6),mat('#2a2018'),tr);
    instanced(new THREE.ConeGeometry(1,1.6,7),mat('#1c3027'),f);
    instanced(new THREE.ConeGeometry(1,1.2,7),mat('#f2f7fa'),sn);
    instanced(new THREE.OctahedronGeometry(.5,0),mat('#bfe8ff',{emissive:'#5ab8ff',emissiveIntensity:.6,roughness:.2,metalness:.3}),cr);
  }else if(T.walls==='spires'){
    const sp=[],fl=[],ck=[];
    for(let z=12;z>-L;z-=1.6){[-1,1].forEach(sd=>{sp.push([sd*(4.5+rnd()*7),0,z+rnd(),(rnd()-.5)*.25,rnd()*3,(rnd()-.5)*.25,1+rnd()*1.4,1,3+rnd()*5,1])});
      if(rnd()<.25)fl.push([(rnd()-.5)*24,9+rnd()*7,z,rnd()*3,rnd()*3,0,.8+rnd()*1.8]);
      if(rnd()<.6)ck.push([(rnd()-.5)*5,.03,z+rnd(),0,rnd()*3,0,1,.08+rnd()*.06,.03,1.2+rnd()*2.5])}
    instanced(new THREE.ConeGeometry(1,2,5),rock,sp);
    instanced(new THREE.IcosahedronGeometry(1,0),rock,fl);
    instanced(new THREE.BoxGeometry(1,1,1),basic(T.light),ck);
  }else if(T.walls==='castle'){
    const pl=[],cap=[],ban=[],wall=[];
    for(let z=8;z>-L;z-=5){[-1,1].forEach(sd=>{pl.push([sd*3.9,3.5,z,0,0,0,1,.8,7,.8]);cap.push([sd*3.9,7.1,z,0,0,0,1,1.3,.5,1.3]);
      ban.push([sd*4.6,4.6,z-2.5,0,sd*Math.PI/2,0,1,1.3,3.2,1]);wall.push([sd*5.2,4,z-2.5,0,0,0,1,.6,8,5.2])});
      const arch=new THREE.Mesh(geo(new THREE.TorusGeometry(3.9,.32,5,14,Math.PI)),rock);arch.position.set(0,7.3,z);scene.add(arch)}
    instanced(new THREE.CylinderGeometry(.5,.55,1,8),rock,pl);
    instanced(new THREE.BoxGeometry(1,1,1),rock,cap);
    instanced(new THREE.PlaneGeometry(1,1),mat(T.banner||'#8a0f14',{side:THREE.DoubleSide,flatShading:false}),ban);
    instanced(new THREE.BoxGeometry(1,1,1),mat(T.wall||'#1d1824'),wall);
  }else if(T.walls==='temple'){
    /* Cartenon Temple: a hall of pillars with stone statues between them; some statues' eyes are lit. */
    const pl=[],ft=[],cp=[],ped=[],bd=[],hd=[],sw=[];
    for(let z=10;z>-L;z-=4.8){[-1,1].forEach(sd=>{
      pl.push([sd*4.3,4.6,z,0,0,0,1,1,9.2,1]);ft.push([sd*4.3,.3,z,0,0,0,1,1.8,.6,1.8]);cp.push([sd*4.3,9.3,z,0,0,0,1,1.9,.5,1.9]);
      const x=sd*5.7,zz=z-2.4,s=1+rnd()*.3,hy=1.1+3.25*s;
      ped.push([x,.55,zz,0,0,0,1,1.5,1.1,1.5]);bd.push([x,1.1+1.5*s,zz,0,0,0,1,.8*s,3*s,.6*s]);hd.push([x,hy,zz,0,0,0,.42*s]);
      sw.push([x-sd*.15,1.1+1.6*s,zz+.62*s,0,0,0,1,.16,3.3*s,.07]);
      if(rnd()<.5)[-1,1].forEach(e=>{const g=sprite('#ff3b2f',.24,.9);g.position.set(x-sd*.36*s,hy+.03,zz+e*.14*s);scene.add(g);glows.push({s:g,b:.24,ph:rnd()*10})})})}
    instanced(new THREE.CylinderGeometry(.55,.62,1,10),rock,pl);
    instanced(new THREE.BoxGeometry(1,1,1),rock,ft);instanced(new THREE.BoxGeometry(1,1,1),rock,cp);
    const stone=mat(T.statue);
    instanced(new THREE.BoxGeometry(1,1,1),stone,ped);instanced(new THREE.CylinderGeometry(.42,.55,1,7),stone,bd);
    instanced(new THREE.SphereGeometry(1,8,7),stone,hd);instanced(new THREE.BoxGeometry(1,1,1),stone,sw);
    [-1,1].forEach(sd=>{const w=new THREE.Mesh(geo(new THREE.BoxGeometry(1,16,L+40)),mat('#1a1713'));w.position.set(sd*7.6,7,-(L/2)+14);scene.add(w)});
  }else if(T.walls==='city'){
    /* A broken city street: towers on both sides, lit windows, wrecked cars and rubble. */
    const bl=[],win=[],rb=[],car=[],cab=[],ln=[];
    for(let z=16;z>-L-8;z-=6.5){[-1,1].forEach(sd=>{let x0=7.2;for(let k=0;k<2;k++){
      const w=4.5+rnd()*4,d=4.5+rnd()*2.5,h=(T.tall?12:6)+rnd()*(T.tall?24:14),x=sd*(x0+w/2),zz=z-rnd()*1.5,broken=rnd()<.3,hh=broken?h*.55:h;x0+=w+1.5+rnd()*3;
      bl.push([x,hh/2,zz,0,0,broken?(rnd()-.5)*.12:0,1,w,hh,d]);
      if(k===0)for(let f=1.6;f<hh-1;f+=1.8)for(let c=-d/2+.9;c<d/2-.5;c+=1.3)if(rnd()<(T.tall?.2:.3))win.push([x-sd*(w/2+.03),f,zz+c,0,Math.PI/2,0,1,.7,.95,1])}});
      for(let k=0;k<5;k++)rb.push([(rnd()<.5?-1:1)*(3+rnd()*3.4),.15,z-rnd()*6,rnd()*3,rnd()*3,rnd()*3,.25+rnd()*.6,1.3,.7,1]);
      if(rnd()<.55){const sd=rnd()<.5?-1:1,x=sd*(3.7+rnd()*1.5),zz=z-rnd()*5,r=(rnd()-.5)*1.2,flip=rnd()<.25;
        car.push([x,flip?.78:.45,zz,flip?Math.PI:0,r,0,1,1.7,.6,3.6]);cab.push([x,flip?.28:.95,zz-.2,0,r,0,1,1.4,.5,1.8])}
      for(let k=0;k<2;k++)ln.push([0,.02,z-k*3.25,0,0,0,1,.14,.02,1.4])}
    instanced(new THREE.BoxGeometry(1,1,1),mat(T.rock,{roughness:.95}),bl);
    if(win.length)instanced(new THREE.PlaneGeometry(1,1),basic(T.windows,{side:THREE.DoubleSide}),win);
    instanced(new THREE.IcosahedronGeometry(1,0),mat('#3a3633'),rb);
    if(car.length){instanced(new THREE.BoxGeometry(1,1,1),mat('#2b2a2c',{metalness:.5,roughness:.5}),car);instanced(new THREE.BoxGeometry(1,1,1),mat('#1c1b1d',{metalness:.5,roughness:.4}),cab)}
    instanced(new THREE.BoxGeometry(1,1,1),basic(T.road),ln);
  }else if(T.walls==='sky'){
    /* The last battlefield: the city lies broken far away, rocks hang in the air, dragons circle overhead. */
    const fr=[],sk=[],sp=[];
    for(let i=0;i<70;i++){const sd=rnd()<.5?-1:1;fr.push([sd*(6+rnd()*26),1.5+rnd()*15,12-rnd()*(L+20),rnd()*3,rnd()*3,rnd()*3,.5+rnd()*2.2,1.4,.6,1.1])}
    for(let i=0;i<70;i++){const sd=rnd()<.5?-1:1,h=10+rnd()*30;sk.push([sd*(24+rnd()*40),h/2-4,30-rnd()*(L+80),0,rnd()*3,0,1,3+rnd()*6,h,3+rnd()*6])}
    for(let z=12;z>-L;z-=1.7){[-1,1].forEach(sd=>sp.push([sd*(4+rnd()*2.5),0,z+rnd(),(rnd()-.5)*.4,rnd()*3,(rnd()-.5)*.4,.5+rnd()*.9,1,1.5+rnd()*2.5,1]))}
    instanced(new THREE.IcosahedronGeometry(1,0),rock,fr);
    instanced(new THREE.BoxGeometry(1,1,1),mat('#140a18'),sk);
    instanced(new THREE.ConeGeometry(1,2,5),rock,sp);
    const moon=sprite('#ff4a2a',30,.75);moon.position.set(-22,26,-L*.55);scene.add(moon);
  }else{ // nest
    const rb=[],bl=[],eg=[];
    for(let z=12;z>-L;z-=3.2)rb.push([0,2.4,z,0,0,rnd()*3,1,1.05,.82,1]);
    for(let z=12;z>-L;z-=1.1){[-1,1].forEach(sd=>bl.push([sd*(3.6+rnd()),.5+rnd()*3.6,z,0,0,0,.6+rnd()*.9,1,1.2,1]));
      if(rnd()<.4){const x=(rnd()<.5?-1:1)*(2.3+rnd()*.9);for(let k=0;k<3;k++)eg.push([x+(rnd()-.5)*.7,.3,z+(rnd()-.5)*.7,0,0,0,.32+rnd()*.12,1,1.35,1])}}
    instanced(new THREE.TorusGeometry(4.6,.95,6,16),rock,rb);
    instanced(new THREE.SphereGeometry(1,7,6),mat(T.ground),bl);
    instanced(new THREE.SphereGeometry(1,10,8),mat('#d7ff9a',{emissive:T.light,emissiveIntensity:.55,roughness:.3,transparent:true,opacity:.85,flatShading:false}),eg);
  }
  if(T.moon){const moon=sprite(T.moon,26,.7);moon.position.set(-18,22,-L*.5);scene.add(moon)}
  // decorative lights along the way
  for(let z=6;z>-L;z-=T.walls==='castle'?5:7){
    const sd=(Math.round(z/7)%2)?1:-1;
    if(T.deco==='torch'||T.deco==='brazier'){const x=T.deco==='brazier'?sd*3.2:sd*3.3,y=T.deco==='brazier'?1.25:2.3;
      const holder=new THREE.Mesh(geo(T.deco==='brazier'?new THREE.CylinderGeometry(.32,.18,.5,8):new THREE.BoxGeometry(.14,.5,.14)),mat('#20160f'));holder.position.set(x,y-.35,z);scene.add(holder);
      const s=sprite(T.light,1.6);s.position.set(x,y+.15,z);scene.add(s);glows.push({s,b:1.6,ph:rnd()*10})}
    else if(T.deco==='mushroom'){for(let k=0;k<3;k++){const x=sd*(2.6+rnd()),s=sprite(T.light,.7,.8);s.position.set(x,.25+rnd()*.3,z+rnd()*3);scene.add(s);glows.push({s,b:.7,ph:rnd()*10});
      const cap=new THREE.Mesh(geo(new THREE.SphereGeometry(.18,8,6,0,6.3,0,1.6)),mat(T.light,{emissive:T.light,emissiveIntensity:.8}));cap.position.copy(s.position);scene.add(cap)}}
    else if(T.deco==='crack'||T.deco==='egg'||T.deco==='crystal'){const s=sprite(T.light,T.deco==='crystal'?.9:1.3,.6);s.position.set(sd*(2.4+rnd()),.3,z);scene.add(s);glows.push({s,b:s.scale.x,ph:rnd()*10})}
    else if(T.deco==='fire'){const x=sd*(3.3+rnd()*1.3);[[T.light,1.6,.6],['#ffd27a',.7,.35]].forEach(([c,b,y])=>{const s=sprite(c,b,.9);s.position.set(x,y,z);scene.add(s);glows.push({s,b,ph:rnd()*10})})}
  }

  // floating particles
  const P=T.parts,pn=P.n,pp=new Float32Array(pn*3),pv=new Float32Array(pn);
  const falls=P.kind==='snow'||P.kind==='ash';
  for(let i=0;i<pn;i++){pp[i*3]=(rnd()-.5)*(falls?26:9);pp[i*3+1]=rnd()*7;pp[i*3+2]=10-rnd()*(L+10);pv[i]=.3+rnd()}
  const pgeo=geo(new THREE.BufferGeometry());pgeo.setAttribute('position',new THREE.BufferAttribute(pp,3));
  const points=new THREE.Points(pgeo,keep(new THREE.PointsMaterial({color:P.color,size:falls?.09:.07,map:GLOW,transparent:true,depthWrite:false,blending:falls?THREE.NormalBlending:THREE.AdditiveBlending,sizeAttenuation:true,opacity:falls?.85:1})));
  points.frustumCulled=false;scene.add(points);

  /* ----- creatures ----- */
  const eyeGeo=geo(new THREE.SphereGeometry(1,8,6));
  function eyes(g,color,y,z,gap,r){
    const m=basic(color),out=[];[-1,1].forEach(sd=>{const e=new THREE.Mesh(eyeGeo,m);e.scale.setScalar(r);e.position.set(sd*gap,y,z);g.add(e);
      const s=sprite(color,r*14,.9);s.position.copy(e.position);g.add(s);out.push(s)});return out;
  }
  const add=(g,geom,m,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(geo(geom),m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);g.add(o);return o};
  function makeCreature(spec,isBoss){
    const stone=spec.stone||spec.kind==='colossus',ei=spec.ei!==undefined?spec.ei:stone?.03:isBoss?.06:.09; // ei: the body's resting glow
    const g=new THREE.Group(),body=mat(spec.body,stone?{emissive:spec.eye,emissiveIntensity:ei,roughness:.96,metalness:0}:isBoss?{emissive:spec.eye,emissiveIntensity:ei,roughness:.85,metalness:.12}:{emissive:spec.eye,emissiveIntensity:ei,roughness:.6,metalness:.25}),eyeC=spec.eye;let glow=[];
    const k=spec.kind;
    if(k==='goblin'||k==='elf'||k==='knight'){
      const tall=k==='elf'?1.35:k==='knight'?1.15:.9;
      add(g,new THREE.CapsuleGeometry(.12,.55*tall,3,6),body,-.16,.38*tall,0);add(g,new THREE.CapsuleGeometry(.12,.55*tall,3,6),body,.16,.38*tall,0);
      add(g,k==='knight'?new THREE.CylinderGeometry(.42,.3,.9,6):new THREE.CapsuleGeometry(.3,.45*tall,4,8),body,0,1.05*tall,0,k==='goblin'?.22:0);
      add(g,new THREE.CapsuleGeometry(.09,.6*tall,3,6),body,-.42,1.0*tall,0,0,0,.25);add(g,new THREE.CapsuleGeometry(.09,.6*tall,3,6),body,.42,1.0*tall,0,0,0,-.25);
      const hy=1.62*tall+(k==='goblin'?-.05:0);add(g,new THREE.SphereGeometry(k==='elf'?.2:.27,8,7),body,0,hy,k==='goblin'?.08:0);
      if(k!=='knight'){add(g,new THREE.ConeGeometry(.07,.42,4),body,-.27,hy+.05,0,0,0,1.25);add(g,new THREE.ConeGeometry(.07,.42,4),body,.27,hy+.05,0,0,0,-1.25)}
      if(k==='knight'){add(g,new THREE.SphereGeometry(.2,8,6),body,-.42,1.45*tall,0);add(g,new THREE.SphereGeometry(.2,8,6),body,.42,1.45*tall,0);
        add(g,new THREE.ConeGeometry(.06,.45,5),body,-.2,hy+.3,0,0,0,.5);add(g,new THREE.ConeGeometry(.06,.45,5),body,.2,hy+.3,0,0,0,-.5);
        if(spec.stone){add(g,new THREE.BoxGeometry(.13,1.5,.05),body,.55,1.25,.3,.25,0,0);add(g,new THREE.BoxGeometry(.42,.07,.1),body,.55,.55,.14,.25,0,0)} // a stone greatsword
        else add(g,new THREE.BoxGeometry(.07,1.1,.02),mat('#4a4450',{metalness:.7,roughness:.35}),.55,1.1,.25,.3,0,0)}
      if(k==='goblin')add(g,new THREE.CylinderGeometry(.05,.12,.8,6),body,.5,.75,.18,.5,0,-.2);
      if(k==='elf'){add(g,new THREE.CylinderGeometry(.025,.025,2.6,5),mat('#3a3f4a'),.45,1.3,.1,.15);add(g,new THREE.ConeGeometry(.06,.3,4),mat('#bfe8ff',{emissive:'#7fd0ff',emissiveIntensity:1}),.45+.2,2.6,.3,.15)}
      glow=eyes(g,eyeC,hy+.02,k==='elf'?.17:.24,.09,.035);
    }else if(k==='beast'){
      add(g,new THREE.CapsuleGeometry(.36,.9,4,8),body,0,.8,0,Math.PI/2);
      [[-.25,.35],[.25,.35],[-.25,-.35],[.25,-.35]].forEach(([x,z])=>add(g,new THREE.CapsuleGeometry(.08,.5,3,5),body,x,.35,z));
      add(g,new THREE.SphereGeometry(.3,8,6),body,0,.95,.72);add(g,new THREE.ConeGeometry(.06,.5,4),body,-.18,1.25,.7,-.6,0,.4);add(g,new THREE.ConeGeometry(.06,.5,4),body,.18,1.25,.7,-.6,0,-.4);
      glow=eyes(g,eyeC,1.0,.98,.12,.04);
    }else if(k==='snake'){
      [[.5,.14],[.38,.38],[.26,.58]].forEach(([r,y])=>add(g,new THREE.TorusGeometry(r,.12,6,12),body,0,y,0,Math.PI/2));
      add(g,new THREE.CapsuleGeometry(.1,.7,3,6),body,0,1.05,.05,-.15);add(g,new THREE.SphereGeometry(.17,8,6),body,0,1.5,.12,0,0,0,1,.8,1.3);
      add(g,new THREE.SphereGeometry(.3,8,6),body,0,1.42,-.02,0,0,0,1,1.1,.25);
      glow=eyes(g,eyeC,1.53,.28,.07,.03);
    }else if(k==='ant'){
      add(g,new THREE.SphereGeometry(.38,8,7),body,0,.62,-.45,0,0,0,1,.85,1.25);add(g,new THREE.SphereGeometry(.2,8,6),body,0,.75,.05);add(g,new THREE.SphereGeometry(.24,8,6),body,0,.95,.38);
      for(let i=0;i<3;i++)[-1,1].forEach(sd=>add(g,new THREE.CylinderGeometry(.03,.02,.8,4),body,sd*.32,.38,.05-i*.22,(i-1)*.35,0,sd*.9));
      add(g,new THREE.CylinderGeometry(.015,.015,.6,4),body,-.12,1.25,.5,.6,0,.4);add(g,new THREE.CylinderGeometry(.015,.015,.6,4),body,.12,1.25,.5,.6,0,-.4);
      add(g,new THREE.ConeGeometry(.05,.3,4),body,-.1,.86,.6,1.9,0,-.4);add(g,new THREE.ConeGeometry(.05,.3,4),body,.1,.86,.6,1.9,0,.4);
      glow=eyes(g,eyeC,1.0,.56,.12,.045);
    }else if(k==='brute'||k==='lancer'){
      const lean=k==='lancer';
      add(g,new THREE.CapsuleGeometry(lean?.14:.22,1.0,4,8),body,-.32,.75,0);add(g,new THREE.CapsuleGeometry(lean?.14:.22,1.0,4,8),body,.32,.75,0);
      add(g,new THREE.CylinderGeometry(lean?.5:.82,lean?.32:.45,1.5,7),body,0,2.0,0);
      add(g,new THREE.SphereGeometry(lean?.3:.42,8,7),body,-(lean?.55:.85),2.6,0);add(g,new THREE.SphereGeometry(lean?.3:.42,8,7),body,(lean?.55:.85),2.6,0);
      if(!lean&&!spec.bald){add(g,new THREE.ConeGeometry(.12,.55,5),body,-.95,3.0,0,0,0,.5);add(g,new THREE.ConeGeometry(.12,.55,5),body,.95,3.0,0,0,0,-.5)}
      add(g,new THREE.CapsuleGeometry(lean?.11:.17,1.15,3,6),body,-(lean?.66:1.02),1.85,.05,0,0,.18);add(g,new THREE.CapsuleGeometry(lean?.11:.17,1.15,3,6),body,(lean?.66:1.02),1.85,.05,0,0,-.18);
      if(!spec.noClaws)for(let i=0;i<3;i++)[-1,1].forEach(sd=>add(g,new THREE.ConeGeometry(.04,.32,4),body,sd*((lean?.7:1.12)+(i-1)*.06),1.1,.12,Math.PI,0,0));
      else[-1,1].forEach(sd=>add(g,new THREE.SphereGeometry(spec.bald?.24:.18,8,6),body,sd*1.12,1.2,.1)); // fists
      add(g,new THREE.SphereGeometry(lean?.24:.3,8,7),body,0,3.0,.05);
      if(spec.horns||spec.big){const hs=spec.big?1.35:1;[-1,1].forEach(sd=>{add(g,new THREE.ConeGeometry(.11*hs,.62*hs,5),body,sd*.3,3.32,0,0,0,-sd*1.0);add(g,new THREE.ConeGeometry(.07*hs,.5*hs,5),body,sd*(.3+.5*hs),3.5+.2*hs,0,0,0,-sd*.25)})}
      if(spec.club)add(g,new THREE.CylinderGeometry(.08,.22,1.6,6),body,1.2,1.0,.25,.35,0,-.25);
      if(spec.tusks){const bone=mat('#e6dcc4',{roughness:.5});add(g,new THREE.BoxGeometry(.34,.14,.26),body,0,2.83,.14); // orc jaw, tusks and ears
        [-1,1].forEach(sd=>{add(g,new THREE.ConeGeometry(.045,.26,5),bone,sd*.12,2.95,.3,-.3,0,sd*.25);add(g,new THREE.ConeGeometry(.06,.32,4),body,sd*.33,3.06,0,0,0,sd*-1.35)})}
      if(spec.bald)add(g,new THREE.SphereGeometry(.62,10,8),body,0,1.75,.22,0,0,0,1,.9,.8); // a giant's belly
      if(spec.crown){const gold=mat('#d9a830',{metalness:.75,roughness:.3,emissive:'#ffb020',emissiveIntensity:.25});
        add(g,new THREE.TorusGeometry(.26,.045,6,16),gold,0,3.27,.05,Math.PI/2);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(g,new THREE.ConeGeometry(.05,.24,4),gold,Math.cos(a)*.26,3.42,.05+Math.sin(a)*.26)}
        add(g,new THREE.ConeGeometry(.2,.5,6),body,0,2.66,.2,Math.PI)} // and a beard
      if(spec.axe){const iron=mat('#57534e',{metalness:.7,roughness:.35});add(g,new THREE.CylinderGeometry(.03,.03,1.3,5),mat('#3a2614'),1.18,1.45,.32,.35);add(g,new THREE.BoxGeometry(.04,.36,.42),iron,1.18,2.02,.58,.35)}
      if(spec.cleaver){const iron=mat('#625d56',{metalness:.7,roughness:.35});add(g,new THREE.CylinderGeometry(.04,.04,.7,5),mat('#3a2614'),1.18,1.2,.3,.3);add(g,new THREE.BoxGeometry(.06,1.7,.6),iron,1.18,2.35,.62,.3)}
      if(lean){add(g,new THREE.CylinderGeometry(.035,.035,3.6,5),mat('#3a4250'),.8,1.9,.2,.12);add(g,new THREE.ConeGeometry(.09,.5,4),mat('#bfe8ff',{emissive:'#8fe3ff',emissiveIntensity:1.4}),.8+.22,3.8,.42,.12);
        [-.14,0,.14].forEach(x=>add(g,new THREE.ConeGeometry(.04,.3,4),body,x,3.3,0))}
      glow=eyes(g,eyeC,3.04,lean?.22:.27,.11,.045);
      if(!spec.noCore){const core=add(g,new THREE.SphereGeometry(.13,10,8),basic(eyeC),0,2.25,lean?.33:.62);const cs=sprite(eyeC,1.4,.9);cs.position.copy(core.position);g.add(cs);glow.push(cs)}
    }else if(k==='colossus'){
      // the Statue of God: a seated stone giant with a carved smile and burning eyes
      add(g,new THREE.BoxGeometry(2.8,1.2,1.9),body,0,.6,-.2);add(g,new THREE.BoxGeometry(2.8,3.2,.4),body,0,2.7,-1.05);
      add(g,new THREE.CylinderGeometry(.75,1.15,2.3,10),body,0,2.35,-.2);
      [-1,1].forEach(sd=>{add(g,new THREE.CapsuleGeometry(.3,.9,4,8),body,sd*.5,1.5,.5,Math.PI/2);add(g,new THREE.CapsuleGeometry(.24,.8,4,8),body,sd*.55,.75,1.05);
        add(g,new THREE.CapsuleGeometry(.2,1.2,4,8),body,sd*.95,2.4,.15,.5,0,sd*.25);add(g,new THREE.SphereGeometry(.26,8,6),body,sd*.85,1.75,.8)});
      add(g,new THREE.CylinderGeometry(.28,.34,.4,8),body,0,3.6,-.2);
      add(g,new THREE.SphereGeometry(.72,14,12),body,0,4.35,-.1,0,0,0,1,1.05,.95);
      const carve=basic('#140f0c');
      add(g,new THREE.TorusGeometry(.4,.045,6,24,Math.PI),carve,0,4.17,.56,-.25,0,Math.PI); // the smile
      [-1,1].forEach(sd=>add(g,new THREE.TorusGeometry(.14,.03,5,12,Math.PI),carve,sd*.24,4.56,.6,-.3));
      glow=eyes(g,eyeC,4.45,.63,.24,.065);
    }else if(k==='dragon'){
      // Antares: a dragon rearing up with its wings spread and fire in its jaws
      add(g,new THREE.CapsuleGeometry(.62,1.5,4,10),body,0,1.55,-.3,1.1);
      [[-.5,.55,.2],[.5,.55,.2],[-.45,.55,-1.0],[.45,.55,-1.0]].forEach(([x,y,z])=>add(g,new THREE.CapsuleGeometry(.17,.8,3,6),body,x,y,z));
      add(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0,2.1,.2),V(0,2.9,.6),V(0,3.6,.9),V(0,4.1,1.3)]),24,.3,8,false),body,0,0,0);
      add(g,new THREE.SphereGeometry(.42,10,8),body,0,4.2,1.45,0,0,0,1,.9,1.1);
      add(g,new THREE.ConeGeometry(.3,1.0,6),body,0,4.08,2.2,Math.PI/2);add(g,new THREE.BoxGeometry(.38,.1,.7),body,0,3.82,1.98,.3);
      [-1,1].forEach(sd=>{add(g,new THREE.ConeGeometry(.09,.9,5),body,sd*.25,4.62,1.05,-.9,0,sd*.4);add(g,new THREE.ConeGeometry(.06,.6,5),body,sd*.42,4.4,.98,-1.2,0,sd*.8)});
      const ws=new THREE.Shape();ws.moveTo(0,0);[[1.2,1.6],[3.4,2.3],[3.0,1.2],[2.6,.2],[2.0,.8],[1.6,-.4],[1.1,.3],[.5,-.6],[0,-.4]].forEach(([x,y])=>ws.lineTo(x,y));
      const wm=keep(new THREE.MeshStandardMaterial({color:spec.body,roughness:.8,side:THREE.DoubleSide,emissive:spec.eye,emissiveIntensity:.07,flatShading:true}));
      [-1,1].forEach(sd=>{const w=new THREE.Mesh(geo(new THREE.ShapeGeometry(ws)),wm);w.position.set(sd*.45,2.5,-.3);w.scale.set(sd*1.3,1.3,1);w.rotation.y=sd*-.5;w.userData.wing=sd;g.add(w)});
      add(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0,1.0,-1.1),V(.4,.5,-2.0),V(1.2,.3,-2.6),V(2.0,.4,-2.4)]),24,.2,6,false),body,0,0,0);
      const fire=sprite(eyeC,1.7,.9);fire.position.set(0,3.95,2.65);g.add(fire);
      glow=[...eyes(g,eyeC,4.3,1.75,.2,.06),fire];
    }else if(k==='serpent'){
      const pts=[V(-1.6,.3,.6),V(-.6,.35,1.4),V(.9,.4,.9),V(1.3,.6,-.4),V(.2,1.4,-.7),V(-.4,2.6,-.2),V(-.1,3.8,.4),V(.1,4.5,.9)];
      add(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),60,.42,8,false),body,0,0,0);
      add(g,new THREE.SphereGeometry(1.15,10,8),body,.05,4.45,.62,0,0,0,1,1.1,.22);
      add(g,new THREE.SphereGeometry(.45,10,8),body,.1,4.6,1.15,0,0,0,.85,.7,1.4);
      glow=eyes(g,eyeC,4.72,1.62,.18,.07);
    }else{ // insect: the Ant King
      add(g,new THREE.CapsuleGeometry(.15,1.0,4,6),body,-.3,.85,0,0,0,.08);add(g,new THREE.CapsuleGeometry(.15,1.0,4,6),body,.3,.85,0,0,0,-.08);
      add(g,new THREE.CapsuleGeometry(.36,.6,4,8),body,0,1.75,0);add(g,new THREE.CapsuleGeometry(.42,.5,4,8),body,0,2.45,.05);
      [-1,1].forEach(sd=>{add(g,new THREE.ConeGeometry(.16,.7,5),body,sd*.55,2.85,0,0,0,sd*-.7);
        add(g,new THREE.CapsuleGeometry(.1,1.2,3,6),body,sd*.72,2.0,.15,.2,0,sd*.25);add(g,new THREE.ConeGeometry(.07,.6,4),body,sd*.85,1.25,.4,2.6,0,0);
        const w=add(g,new THREE.PlaneGeometry(1.6,2.6),keep(new THREE.MeshBasicMaterial({color:eyeC,transparent:true,opacity:.16,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false})),sd*1.1,2.6,-.45,0,sd*.5,sd*-.5);w.userData.wing=sd;
        add(g,new THREE.CylinderGeometry(.02,.02,1.1,4),body,sd*.18,3.6,.2,.5,0,sd*.35);add(g,new THREE.ConeGeometry(.06,.45,4),body,sd*.14,2.85,.5,2.2,0,sd*.5)});
      add(g,new THREE.SphereGeometry(.3,8,7),body,0,3.08,.12,0,0,0,1,1.05,1.15);
      [-1,1].forEach(sd=>add(g,new THREE.ConeGeometry(.08,.9,4),body,sd*.32,3.7,0,0,0,sd*-.35));
      glow=eyes(g,eyeC,3.12,.38,.12,.05);
    }
    const s=(spec.s||1);g.scale.setScalar(s);
    g.userData={glow,mats:[body],base:s,ph:rnd()*10,alive:true,dying:0,boss:isBoss,wingy:k==='insect',flap:k==='dragon',ei};
    return g;
  }

  // creatures per wave: three monsters, or the boss on the boss wave
  const waveMobs=[];let boss=null,bossLight=null;
  for(let w=0;w<waves;w++){
    const list=[],zc=-w*STEP-4.8;
    if(w===bossWave){
      boss=makeCreature(T.boss,true);boss.position.set(0,-7,zc-3);boss.visible=false;scene.add(boss);
      bossLight=new THREE.PointLight(T.boss.eye,0,16*Math.max(1,T.boss.s/2),1.3);bossLight.position.set(0,C.bossLight,zc-5.8);scene.add(bossLight); // rim light from behind
    }else{
      [-2.3,0,2.3].forEach((x,i)=>{const m=makeCreature(T.mob,false);m.position.set(x*.9*(T.spread||1)+(rnd()-.5)*.4,0,zc-(i===1?1.1:0)+(rnd()-.5)*.5);m.rotation.y=(rnd()-.5)*.3;scene.add(m);list.push(m)});
    }
    waveMobs.push(list);
  }
  // dragons circling over the last battlefield
  const flyers=[];
  if(T.walls==='sky'){
    const fm=mat('#0d070f',{emissive:'#ff5a1a',emissiveIntensity:.08}),ws=new THREE.Shape();ws.moveTo(0,0);
    [[1.4,.5],[2.4,.1],[1.9,-.3],[1.5,-.1],[1.1,-.5],[.7,-.2],[.3,-.5],[0,-.3]].forEach(([x,y])=>ws.lineTo(x,y));
    const wg=geo(new THREE.ShapeGeometry(ws));wg.rotateX(Math.PI/2);
    const wm=keep(new THREE.MeshStandardMaterial({color:'#120a14',side:THREE.DoubleSide,roughness:.8,flatShading:true}));
    for(let k=0;k<6;k++){const f=new THREE.Group();
      add(f,new THREE.CapsuleGeometry(.22,1.3,3,6),fm,0,0,0,Math.PI/2);add(f,new THREE.ConeGeometry(.15,.6,5),fm,0,.05,1.05,Math.PI/2);add(f,new THREE.ConeGeometry(.1,1.2,4),fm,0,0,-1.3,-Math.PI/2);
      [-1,1].forEach(sd=>{const w=new THREE.Mesh(wg,wm);w.scale.set(sd,1,1);w.userData.wing=sd;f.add(w)});
      f.userData={r:16+k*5,h:9+rnd()*9,sp:(.12+rnd()*.12)*(rnd()<.5?-1:1),ph:rnd()*6.28,zc:-rnd()*L*.8};f.scale.setScalar(1.3+rnd()*.6);scene.add(f);flyers.push(f)}
  }

  // bursts of particles when something dies
  const bursts=[];
  function burst(pos,color,n=70,speed=3.5,size=.12){
    const arr=new Float32Array(n*3),vel=[];for(let i=0;i<n;i++){arr[i*3]=pos.x;arr[i*3+1]=pos.y;arr[i*3+2]=pos.z;const a=rnd()*6.28,b=rnd()*3.14;vel.push(V(Math.cos(a)*Math.sin(b),Math.abs(Math.cos(b))+.3,Math.sin(a)*Math.sin(b)).multiplyScalar(speed*(.4+rnd())))}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(arr,3));
    const m=new THREE.PointsMaterial({color,size,map:GLOW,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    const p=new THREE.Points(g,m);p.frustumCulled=false;scene.add(p);bursts.push({p,vel,t:0,life:1.2});
  }

  /* ----- portal scene (the way in) ----- */
  const pScene=new THREE.Scene();pScene.background=new THREE.Color('#050304');
  const portal=new THREE.Group();pScene.add(portal);
  const ring=new THREE.Mesh(geo(new THREE.TorusGeometry(2.3,.11,8,64)),basic('#ff3b2f'));portal.add(ring);
  const ring2=new THREE.Mesh(geo(new THREE.TorusGeometry(2.6,.03,6,64)),basic('#ffd9d4'));portal.add(ring2);
  const disc=new THREE.Mesh(geo(new THREE.CircleGeometry(2.25,48)),keep(new THREE.MeshBasicMaterial({map:keep(swirlTex(T.light)),transparent:true})));portal.add(disc);
  const halo=sprite('#ff3b2f',9,.55);portal.add(halo);
  const pn2=420,ppos=new Float32Array(pn2*3),pang=[];
  for(let i=0;i<pn2;i++)pang.push({a:rnd()*6.28,r:2.4+rnd()*4,z:(rnd()-.5)*2,s:.4+rnd()});
  const pgeo2=geo(new THREE.BufferGeometry());pgeo2.setAttribute('position',new THREE.BufferAttribute(ppos,3));
  const ppts=new THREE.Points(pgeo2,keep(new THREE.PointsMaterial({color:'#ff6a5a',size:.08,map:GLOW,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));ppts.frustumCulled=false;portal.add(ppts);
  portal.position.set(0,1.6,0);

  /* ----- first-person weapon: the equipped blade, held at the lower right ----- */
  scene.add(camera);
  const fp={hands:[],arcs:[],draw:0,flip:1};
  function bladeShape(shape,len,w){
    const s=new THREE.Shape();
    if(shape==='fang'){s.moveTo(-w/2,0);s.lineTo(w/2,0);s.quadraticCurveTo(w*1.3,len*.6,-w*.15,len);s.quadraticCurveTo(-w*.25,len*.5,-w/2,0)}
    else if(shape==='serrated'){s.moveTo(-w/2,0);s.lineTo(w/2,0);for(let i=1;i<=6;i++){s.lineTo(w*(i%2?.75:.45),len*(.12*i));}s.lineTo(w*.35,len*.82);s.lineTo(0,len);s.lineTo(-w/2,len*.8)}
    else if(shape==='cleaver'){s.moveTo(-w*.55,0);s.lineTo(w*.95,0);s.lineTo(w*1.25,len*.96);s.lineTo(-w*.95,len);s.lineTo(-w*.8,len*.15)}
    else if(shape==='claw'){s.moveTo(-w/2,0);s.lineTo(w/2,0);s.quadraticCurveTo(w*1.8,len*.55,w*.25,len);s.quadraticCurveTo(w*.15,len*.45,-w/2,0)}
    else if(shape==='stone'){s.moveTo(-w*.7,0);s.lineTo(w*.7,0);s.lineTo(w*.75,len*.85);s.lineTo(0,len);s.lineTo(-w*.75,len*.85)}
    else{s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,len*.8);s.lineTo(0,len);s.lineTo(-w/2,len*.8)}
    s.closePath();return s;
  }
  function makeBlade(look,type){
    const g=new THREE.Group(),spear=type==='spear',len=type==='sword'?.86:spear?.26:.46,w=type==='sword'?.072:spear?.07:.056;
    const bm=mat(look.blade,{metalness:.85,roughness:.26,flatShading:true,emissive:look.glow,emissiveIntensity:.32});
    const dm=mat(look.dark,{metalness:.55,roughness:.45}),gm=mat(look.grip,{roughness:.9});
    const bg=geo(new THREE.ExtrudeGeometry(bladeShape(spear?'straight':look.shape,len,w),{depth:.012,bevelEnabled:true,bevelThickness:.004,bevelSize:.005,bevelSegments:1}));bg.translate(0,0,-.006);
    const blade=new THREE.Mesh(bg,bm),y0=spear?.62:0;blade.position.y=y0;g.add(blade);
    const edge=new THREE.LineSegments(geo(new THREE.EdgesGeometry(bg)),keep(new THREE.LineBasicMaterial({color:look.edge,transparent:true,opacity:.85})));edge.position.y=y0;g.add(edge);
    const aura=sprite(look.glow,1,.5);aura.scale.set(w*5,len*1.6,1);aura.position.y=y0+len*.5;g.add(aura);
    if(spear){const sh=new THREE.Mesh(geo(new THREE.CylinderGeometry(.014,.016,1.2,8)),gm);sh.position.y=.02;g.add(sh);
      [.3,.0,-.3].forEach(y=>{const b=new THREE.Mesh(geo(new THREE.CylinderGeometry(.022,.022,.03,8)),dm);b.position.y=y;g.add(b)})}
    else{const guard=new THREE.Mesh(geo(new THREE.BoxGeometry(type==='sword'?.2:.15,.024,.036)),dm);g.add(guard);
      const grip=new THREE.Mesh(geo(new THREE.CylinderGeometry(.017,.019,.15,8)),gm);grip.position.y=-.088;g.add(grip);
      const pom=new THREE.Mesh(geo(new THREE.SphereGeometry(.024,8,6)),dm);pom.position.y=-.172;g.add(pom)}
    g.scale.setScalar(type==='dagger'||type==='twin'?.62:.5);
    g.userData={aura,swing:-1,spear};return g;
  }
  if(weapon){
    const hands=weapon.type==='twin'?[1,-1]:[1];
    hands.forEach(sd=>{const h=makeBlade(weapon.look,weapon.type);h.userData.sd=sd;h.visible=false;camera.add(h);fp.hands.push(h)});
  }
  // the slash: a glowing arc in front of the camera
  const arcGeo=geo(new THREE.RingGeometry(.29,.345,48,1,0,Math.PI*.9)),arcCore=geo(new THREE.RingGeometry(.312,.322,48,1,0,Math.PI*.9));
  function slash(big){
    const col=weapon?weapon.look.glow:T.light,grp=new THREE.Group();
    const m1=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthTest:false,depthWrite:false});
    const m2=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthTest:false,depthWrite:false});
    grp.add(new THREE.Mesh(arcGeo,m1),new THREE.Mesh(arcCore,m2));
    fp.flip=-fp.flip;grp.position.set(0,.07,-1);grp.rotation.z=-.47;grp.scale.set((big?1.45:1)*fp.flip,big?1.45:1,1); // mirrored every other cut
    grp.renderOrder=10;camera.add(grp);fp.arcs.push({grp,m:[m1,m2],t:0,big});
  }
  function swing(big){
    if(!fp.hands.length){slash(big);return}
    const h=fp.hands.length>1?fp.hands[(fp.next=(fp.next||0)+1)%2]:fp.hands[0];
    h.userData.swing=0;h.userData.big=big;setTimeout(()=>{if(!dead)slash(big)},70);
  }
  function updateWeapon(dt){
    if(fp.draw<1&&fp.hands.length&&fp.hands[0].visible)fp.draw=Math.min(1,fp.draw+dt/.55);
    const d=ease(fp.draw),bob=reduced?0:Math.sin(time*2.2)*.008;
    fp.hands.forEach(h=>{const u=h.userData,sd=u.sd;
      let a=0,px=0,py=0,pz=0;
      if(u.swing>=0){u.swing+=dt;const k=Math.min(1,u.swing/(u.big?.5:.34));
        if(u.spear){pz=-.45*Math.sin(k*Math.PI);py=.05*Math.sin(k*Math.PI);px=-.06*Math.sin(k*Math.PI)}
        else{a=k<.22?.45*ease(k/.22):k<.48?.45-2.2*ease((k-.22)/.26):-1.75+1.75*ease((k-.48)/.52);px=-.2*Math.sin(k*Math.PI)*sd;py=.03*Math.sin(k*Math.PI)}
        if(k>=1)u.swing=-1}
      h.position.set(sd*.2+px,-.13+(1-d)*-.45+bob+py,-1.15+pz);
      h.rotation.set(-.7,sd*-.85,sd*(.5+a));
      u.aura.material.opacity=.38+Math.sin(time*4)*.12+(u.swing>=0?.3:0);
    });
    for(let i=fp.arcs.length-1;i>=0;i--){const s=fp.arcs[i];s.t+=dt;const k=s.t/(s.big?.5:.32);
      const o=k<.15?k/.15:Math.max(0,1-(k-.15)/.85),sc=(s.big?1.45:1)*(.9+k*.25);s.m[0].opacity=o*.85;s.m[1].opacity=o;s.grp.scale.set(sc*Math.sign(s.grp.scale.x),sc,1);s.grp.rotation.z+=dt*(s.big?1.2:2)*Math.sign(s.grp.scale.x);
      if(k>=1){camera.remove(s.grp);s.m.forEach(m=>m.dispose());fp.arcs.splice(i,1)}}
  }
  const showWeapon=()=>fp.hands.forEach(h=>h.visible=true);

  /* ----- camera choreography ----- */
  let active='dungeon',tw=null,shake=0,cur=0,dead=false,defeatT=0,victoryT=0,flashT=0,par={x:0,y:0};
  const camPos=V(0,1.6,8),camLook=V(0,1.4,-10);
  const stationPos=i=>i===bossWave?V(0,1.5,-i*STEP+3.4+C.bossBack):V(0,1.6,-i*STEP+2.5+C.mobBack);
  const stationLook=i=>i===bossWave?V(0,C.bossLook,-i*STEP-7.8):V(0,C.mobLook,-i*STEP-8);
  function tween(toPos,toLook,dur){return new Promise(res=>{tw={p0:camPos.clone(),l0:camLook.clone(),p1:toPos,l1:toLook,t:0,dur:reduced?Math.min(dur,.35):dur,res}})}
  /* Backlight behind whoever you face (silhouettes against the glow), two soft side lights. */
  function placeLights(i){const zc=-i*STEP-4.8;
    stationLights[0].position.set(0,i===bossWave?Math.max(4.2,C.bossLook):2.4,zc-(i===bossWave?7:4.5));
    stationLights[1].position.set(-3,2.6,zc+2.6);stationLights[2].position.set(3,2.6,zc+2.6)}
  function showBoss(){if(!boss||boss.visible)return;boss.visible=true;boss.userData.rise=0;bossLight.intensity=40;shake=reduced?0:.6;burst(V(0,.4,boss.position.z),T.light,120,2.5,.16)}
  function kill(m){if(!m.userData.alive)return;m.userData.alive=false;m.userData.dying=.001}
  function showNear(i){waveMobs.forEach((l,w)=>l.forEach(m=>{if(m.userData.alive)m.visible=w>=i&&w<=i+1}))}
  showNear(0);

  /* ----- frame loop ----- */
  let raf=0,last=performance.now(),time=0,running=true;
  function resize(){const w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  resize();window.addEventListener('resize',resize);
  const onVis=()=>{running=document.visibilityState==='visible';if(running){last=performance.now();if(!raf)raf=requestAnimationFrame(frame)}};
  document.addEventListener('visibilitychange',onVis);
  function update(dt){
    time+=dt;
    if(tw){tw.t+=dt;const k=ease(Math.min(1,tw.t/tw.dur));camPos.lerpVectors(tw.p0,tw.p1,k);camLook.lerpVectors(tw.l0,tw.l1,k);if(tw.t>=tw.dur){const r=tw.res;tw=null;r()}}
    const sx=reduced?0:Math.sin(time*.6)*.06,sy=reduced?0:Math.sin(time*1.3)*.025;
    const sh=shake>0?(shake*=Math.pow(.02,dt),shake):0;
    camera.position.set(camPos.x+sx+(Math.random()-.5)*sh,camPos.y+sy+(Math.random()-.5)*sh,camPos.z);
    camera.lookAt(camLook.x+par.x*1.6,camLook.y-par.y*.8,camLook.z);
    lantern.position.set(camera.position.x,camera.position.y+.6,camera.position.z-1.5);
    // flicker
    glows.forEach(g=>{const f=1+Math.sin(time*9+g.ph)*.08+Math.sin(time*23+g.ph*3)*.05;g.s.scale.set(g.b*f,g.b*f,1)});
    stationLights.forEach((l,i)=>l.intensity=30*(1+Math.sin(time*7+i*2)*.08));
    // particles
    const a=pgeo.attributes.position.array,k=P.kind;
    for(let i=0;i<pn;i++){const j=i*3;
      if(falls){a[j+1]-=dt*pv[i]*(k==='ash'?.45:1.1);a[j]+=Math.sin(time+i)*dt*.3;if(a[j+1]<0)a[j+1]=7}
      else if(k==='ember'){a[j+1]+=dt*pv[i]*.9;a[j]+=Math.sin(time*2+i)*dt*.25;if(a[j+1]>7)a[j+1]=0}
      else{a[j+1]+=Math.sin(time*.8+i)*dt*.15;a[j]+=Math.cos(time*.6+i*1.7)*dt*.12}}
    pgeo.attributes.position.needsUpdate=true;
    // creatures
    const all=[...waveMobs.flat(),...(boss?[boss]:[])];
    all.forEach(m=>{const u=m.userData;if(!m.visible)return;
      if(u.dying){u.dying+=dt;const t=u.dying/(u.boss?1.5:.7);m.scale.set(u.base*Math.max(.01,1-t*.6),u.base*Math.max(.01,1-t*.95),u.base*Math.max(.01,1-t*.6));m.position.y-=dt*(u.boss?2.2:1.2);u.mats.forEach(x=>{x.emissive.set(u.boss?T.boss.eye:T.mob.eye);x.emissiveIntensity=Math.max(0,2.2-t*6)});
        if(t>=1){m.visible=false}return}
      m.position.y=(u.rise!==undefined&&u.rise<1)?(u.rise=Math.min(1,u.rise+dt/1.4),-7+7*ease(u.rise)):Math.sin(time*2+u.ph)*.04;
      m.rotation.y=Math.sin(time*.7+u.ph)*.12;
      const breathe=1+Math.sin(time*(u.boss?1.6:2.4)+u.ph)*.025;m.scale.set(u.base,u.base*breathe,u.base);
      u.glow.forEach((s,i)=>{s.material.opacity=.7+Math.sin(time*5+u.ph+i)*.25});
      if(u.flash>0){u.flash-=dt;u.mats.forEach(x=>{x.emissive.set('#ffffff');x.emissiveIntensity=u.flash*3})}else u.mats.forEach(x=>{x.emissive.set(u.boss?T.boss.eye:T.mob.eye);x.emissiveIntensity=u.ei})
      if(u.wingy)m.children.forEach(c=>{if(c.userData.wing)c.rotation.y=c.userData.wing*(.5+Math.sin(time*14)*.25)});
      if(u.flap)m.children.forEach(c=>{if(c.userData.wing)c.rotation.y=c.userData.wing*(-.5+Math.sin(time*2.2+u.ph)*.28)});
    });
    flyers.forEach(f=>{const u=f.userData,a=u.ph+time*u.sp;f.position.set(Math.cos(a)*u.r,u.h+Math.sin(time*.7+u.ph)*1.2,u.zc+Math.sin(a)*u.r*.6);
      f.rotation.y=Math.atan2(-Math.sin(a)*u.sp,Math.cos(a)*.6*u.sp);f.children.forEach(c=>{if(c.userData.wing)c.rotation.z=c.userData.wing*Math.sin(time*5+u.ph)*.55})});
    // lightning over the last battlefield (never with reduced motion)
    if(T.storm&&!reduced){if(flashT<=0&&Math.random()<dt*.15)flashT=.3;if(flashT>0){flashT-=dt;hemi.intensity=T.hemi[2]+Math.max(0,flashT)*4.5}else if(hemi.intensity!==T.hemi[2])hemi.intensity=T.hemi[2]}
    if(bossLight&&boss&&boss.visible)bossLight.intensity=boss.userData.alive?36+Math.sin(time*3)*8:Math.max(0,bossLight.intensity-dt*40);
    // bursts
    for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.t+=dt;const arr=b.p.geometry.attributes.position.array;
      b.vel.forEach((v,j)=>{v.y-=dt*2.2;arr[j*3]+=v.x*dt;arr[j*3+1]+=v.y*dt;arr[j*3+2]+=v.z*dt});b.p.geometry.attributes.position.needsUpdate=true;b.p.material.opacity=Math.max(0,1-b.t/b.life);
      if(b.t>=b.life){scene.remove(b.p);b.p.geometry.dispose();b.p.material.dispose();bursts.splice(i,1)}}
    // defeat: the dungeon closes in
    if(defeatT){defeatT+=dt;const k2=Math.min(1,defeatT/2);scene.fog.density=T.fog[1]*(1+k2*2.5);scene.fog.color.copy(fogBase).lerp(new THREE.Color('#3a0303'),k2);camPos.y=1.6-k2*.7}
    if(victoryT){victoryT+=dt}
    updateWeapon(dt);
    // portal
    if(active==='portal'){ring.rotation.z+=dt*.6;ring2.rotation.z-=dt*1.4;disc.rotation.z-=dt*(1.6+portalSpin*4);
      const pa=pgeo2.attributes.position.array;pang.forEach((p,i)=>{p.a+=dt*(.6+portalSpin*3)*p.s;p.r-=dt*(.5+portalSpin*3)*p.s;if(p.r<.3)p.r=2.4+rnd()*4;
        pa[i*3]=Math.cos(p.a)*p.r;pa[i*3+1]=Math.sin(p.a)*p.r;pa[i*3+2]=p.z});pgeo2.attributes.position.needsUpdate=true}
  }
  let portalSpin=0;
  function frame(now){
    raf=0;if(dead||!running)return;
    raf=requestAnimationFrame(frame);
    const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);
    renderer.render(active==='portal'?pScene:scene,camera);
  }
  placeLights(0);
  camPos.copy(stationPos(0));camLook.copy(stationLook(0));
  raf=requestAnimationFrame(frame);

  /* ----- API ----- */
  return {
    /* Fly through the Gate into the dungeon. onFlash fires as the camera passes the portal. */
    async enter(onFlash){
      if(reduced){onFlash&&onFlash();showWeapon();return}
      active='portal';portal.scale.setScalar(.01);camPos.set(0,1.6,13);camLook.set(0,1.6,0);
      const t0=performance.now();
      await new Promise(res=>{const grow=()=>{const k=Math.min(1,(performance.now()-t0)/700);portal.scale.setScalar(.01+ease(k)*.99);if(k<1&&!dead)requestAnimationFrame(grow);else res()};grow()});
      await tween(V(0,1.6,7.5),V(0,1.6,0),1.1);
      portalSpin=1;camera.fov=62;
      const t1=performance.now();
      await new Promise(res=>{const rush=()=>{const k=Math.min(1,(performance.now()-t1)/650);camPos.z=7.5-k*7.2;camera.fov=62+Math.sin(k*Math.PI)*38;camera.updateProjectionMatrix();if(k<1&&!dead)requestAnimationFrame(rush);else res()};rush()});
      onFlash&&onFlash();
      active='dungeon';camera.fov=62;camera.updateProjectionMatrix();
      camPos.copy(stationPos(0)).add(V(0,0,6));camLook.copy(stationLook(0));
      showWeapon();
      await tween(stationPos(0),stationLook(0),1.2);
    },
    /* Jump or walk to wave i. Waves before it are already cleared. */
    goto(i,instant){
      cur=i;placeLights(i);showWeapon();
      for(let w=0;w<i;w++)waveMobs[w].forEach(m=>{m.userData.alive=false;m.visible=false});
      showNear(i);
      if(i===bossWave)setTimeout(showBoss,instant?0:900);
      if(instant){camPos.copy(stationPos(i));camLook.copy(stationLook(i));return Promise.resolve()}
      return tween(stationPos(i),stationLook(i),1.9);
    },
    /* Fraction of the current wave done: monsters fall as you go. */
    progress(frac){
      const list=waveMobs[cur]||[];const n=list.length,down=Math.min(n,Math.floor(frac*n+1e-6));
      list.forEach((m,j)=>{if(j<down)kill(m)});
    },
    /* A logged effort: a flash on whoever you are fighting. */
    hit(){
      const target=cur===bossWave?boss:(waveMobs[cur]||[]).find(m=>m.userData.alive);
      swing(false);
      if(target){target.userData.flash=.18;if(cur===bossWave)shake=reduced?0:Math.max(shake,.15);
        setTimeout(()=>{if(!dead)burst(target.position.clone().add(V(0,cur===bossWave?C.bossHit:1.1*Math.max(1,T.mob.s),.4)),weapon?weapon.look.glow:T.light,26,2.2,.08)},90)}
    },
    /* Cleared the wave: the rest of its monsters die. */
    clearWave(){(waveMobs[cur]||[]).forEach((m,j)=>setTimeout(()=>{if(m.userData.alive){kill(m);burst(m.position.clone().add(V(0,1,0)),T.mob.eye,40,2.6)}},j*120))},
    victory(){
      swing(true);setTimeout(()=>{if(!dead)swing(true)},220);
      if(boss&&boss.userData.alive){kill(boss);const p=boss.position.clone().add(V(0,2.5*boss.userData.base/1.9,0));burst(p,T.boss.eye,260,6,.18);burst(p,'#ffffff',120,4,.1);shake=reduced?0:.9}
      victoryT=.001;tween(stationPos(bossWave).add(V(0,.3,-2.5)),stationLook(bossWave).add(V(0,-1,0)),2.4);
    },
    defeat(){defeatT=.001;shake=reduced?0:.4},
    /* Small look-around from the finger/mouse (-1..1). */
    look(x,y){par.x=x*.5;par.y=y*.5},
    state:()=>({cur,boss:boss&&{visible:boss.visible,y:+boss.position.y.toFixed(2),rise:boss.userData.rise,alive:boss.userData.alive},cam:camPos.toArray().map(v=>+v.toFixed(1))}), // for tests
    dispose(){
      dead=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',onVis);
      bursts.forEach(b=>{b.p.geometry.dispose();b.p.material.dispose()});
      disposables.forEach(d=>d&&d.dispose&&d.dispose());
      renderer.dispose();renderer.forceContextLoss(); // phones allow only a few live GL contexts
    }
  };
}
window.World3D={createWorld};
