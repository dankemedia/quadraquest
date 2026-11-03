/*
 * Quadra Quest — quadra 3D
 * Desenha a mesma jogada 5 contra 5 com Three.js, num estilo cartoon:
 * quadra de madeira, jogadores-bichinhos, torcida e o técnico Rafa (capivara).
 * Coordenadas das jogadas (1000 × 600) viram unidades de cena: x→X, y→Z.
 * Se o aparelho não tiver WebGL, Court3D.supported fica false e o jogo usa o SVG.
 */
(function(){
'use strict';
function webglOK(){try{const c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')))}catch(e){return false}}
if(!window.THREE||!webglOK()){window.Court3D={supported:false};return}
const T=THREE;
T.ColorManagement.legacyMode=false;

/* ---------- medidas e utilidades ---------- */
const S=50,HALF_X=9,HALF_Z=5.04,FLOOR_X=10.2,FLOOR_Z=6.2,GOAL_W=1.1,GOAL_H=1.3,GOAL_D=.8,AREA_R=2.66,BALL_R=.28,ACTOR=1.15;
const C={navy:'#101b2d',lime:'#c9f45a',orange:'#ff7a3d',sky:'#56c8e8',cream:'#fff8eb'};
const world=(p,y=0)=>new T.Vector3((p.x-500)/S,y,(p.y-300)/S);
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerpAngle=(a,b,k)=>{const d=((b-a+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;return a+d*k};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const mats={};
function mat(color,extra){const key=color+(extra?JSON.stringify(extra):'');return mats[key]||(mats[key]=new T.MeshStandardMaterial({color,roughness:.72,metalness:0,...extra}))}
function mesh(geo,material,{x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0,shadow=true}={}){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);m.castShadow=shadow;m.receiveShadow=true;return m}
const G={sphere:new T.SphereGeometry(1,24,18),low:new T.SphereGeometry(1,12,9),cyl:new T.CylinderGeometry(1,1,1,18),cone:new T.ConeGeometry(1,1,16),box:new T.BoxGeometry(1,1,1),star:new T.OctahedronGeometry(1,0)};
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=8;return t}
function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
const FONT='system-ui,-apple-system,"Trebuchet MS",Arial,sans-serif';

/* ---------- texturas desenhadas em canvas ---------- */
function floorTexture(){
 const P=100,W=FLOOR_X*2*P,H=FLOOR_Z*2*P,X=x=>(x+FLOOR_X)*P,Z=z=>(z+FLOOR_Z)*P,rnd=rng(11);
 return canvasTex(W,H,g=>{
  g.fillStyle='#2f86a6';g.fillRect(0,0,W,H);
  g.fillStyle='#3593b3';for(let y=0;y<H;y+=60)g.fillRect(0,y,W,30);
  const wx0=X(-HALF_X-.3),wx1=X(HALF_X+.3),wz0=Z(-HALF_Z-.3),wz1=Z(HALF_Z+.3),row=34;
  const tones=['#9c5f33','#a8693a','#92562d','#b07243','#a0623a','#8c522b'];
  for(let y=wz0;y<wz1;y+=row){
   const h=Math.min(row,wz1-y);let x=wx0-rnd()*240;
   while(x<wx1){const len=170+rnd()*280,a=Math.max(x,wx0),b=Math.min(x+len,wx1);
    if(b>a){g.fillStyle=tones[Math.floor(rnd()*tones.length)];g.fillRect(a,y,b-a,h);
     g.fillStyle='rgba(50,24,8,.16)';for(let k=0;k<3;k++)g.fillRect(a,y+4+rnd()*(row-8),b-a,1.6);
     g.fillStyle='rgba(40,18,6,.38)';if(x>=wx0)g.fillRect(x,y,2.2,h)}
    x+=len}
   g.fillStyle='rgba(40,18,6,.30)';g.fillRect(wx0,y,wx1-wx0,2)}
  const area=side=>{const cx=X(side*HALF_X),r=AREA_R*P;g.beginPath();g.moveTo(cx,Z(-GOAL_W-AREA_R));
   if(side>0){g.arc(cx,Z(-GOAL_W),r,-Math.PI/2,-Math.PI,true);g.lineTo(cx-r,Z(GOAL_W));g.arc(cx,Z(GOAL_W),r,Math.PI,Math.PI/2,true)}
   else{g.arc(cx,Z(-GOAL_W),r,-Math.PI/2,0,false);g.lineTo(cx+r,Z(GOAL_W));g.arc(cx,Z(GOAL_W),r,0,Math.PI/2,false)}
   g.closePath()};
  g.fillStyle='rgba(40,140,205,.72)';area(1);g.fill();area(-1);g.fill();
  g.fillStyle='rgba(214,170,60,.55)';g.beginPath();g.arc(X(0),Z(0),1.64*P,0,Math.PI*2);g.fill();
  g.strokeStyle='#fffaf0';g.lineWidth=8;g.lineCap='round';
  g.strokeRect(X(-HALF_X),Z(-HALF_Z),HALF_X*2*P,HALF_Z*2*P);
  g.beginPath();g.moveTo(X(0),Z(-HALF_Z));g.lineTo(X(0),Z(HALF_Z));g.stroke();
  g.beginPath();g.arc(X(0),Z(0),1.64*P,0,Math.PI*2);g.stroke();
  area(1);g.stroke();area(-1);g.stroke();
  g.fillStyle='#fffaf0';[[0,0,9],[HALF_X-2.7,0,7],[-HALF_X+2.7,0,7],[HALF_X-4.5,0,7],[-HALF_X+4.5,0,7]].forEach(([x,z,r])=>{g.beginPath();g.arc(X(x),Z(z),r,0,Math.PI*2);g.fill()});
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>{g.beginPath();g.arc(X(sx*HALF_X),Z(sz*HALF_Z),.25*P,sx>0?(sz>0?Math.PI:Math.PI/2):(sz>0?-Math.PI/2:0),sx>0?(sz>0?Math.PI*1.5:Math.PI):(sz>0?0:Math.PI/2));g.stroke()});
  g.font=`900 ${0.55*P}px ${FONT}`;g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(255,250,240,.5)';
  g.save();g.translate(X(0),Z(HALF_Z+.62));g.fillText('QUADRA QUEST',0,0);g.restore();
 });
}
function ballTexture(){return canvasTex(512,256,(g,w,h)=>{g.fillStyle='#fffdf3';g.fillRect(0,0,w,h);g.fillStyle='#1c2a35';
 const spots=[[.1,.5],[.35,.5],[.6,.5],[.85,.5],[.22,.15],[.72,.15],[.22,.85],[.72,.85],[.47,.1],[.97,.12],[.47,.9],[.97,.88]];
 spots.forEach(([u,v])=>{g.beginPath();for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;g.lineTo(u*w+Math.cos(a)*30,v*h+Math.sin(a)*30*(v===.5?1:.7))}g.closePath();g.fill()});
 g.fillStyle='#c9f45a';g.fillRect(0,h*.47,w,h*.06)})}
function stripeTexture(a,b){const t=canvasTex(32,128,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?b:a;g.fillRect(0,i*h/8,w,h/8)}});t.wrapS=t.wrapT=T.RepeatWrapping;return t}
function netTexture(){const t=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#ffffff';g.lineWidth=5;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*w/4,0);g.lineTo(i*w/4,h);g.stroke();g.beginPath();g.moveTo(0,i*h/4);g.lineTo(w,i*h/4);g.stroke()}});t.wrapS=t.wrapT=T.RepeatWrapping;return t}
function textTexture(text,{w=512,h=128,bg=null,fg='#fff',size=64,stroke=null,radius=40,arrow=false}={}){
 return canvasTex(w,h,g=>{g.clearRect(0,0,w,h);if(bg){g.fillStyle=bg;roundRect(g,6,6,w-12,(arrow?h*.72:h)-12,radius);g.fill();
  if(arrow){g.beginPath();g.moveTo(w/2-26,h*.72-8);g.lineTo(w/2+26,h*.72-8);g.lineTo(w/2,h-6);g.closePath();g.fill()}}
  g.font=`900 ${size}px ${FONT}`;g.textAlign='center';g.textBaseline='middle';const y=(arrow?h*.72:h)/2+2;
  if(stroke){g.lineWidth=size*.18;g.strokeStyle=stroke;g.lineJoin='round';g.strokeText(text,w/2,y)}g.fillStyle=fg;g.fillText(text,w/2,y)})}
const texCache={};
function cachedText(key,make){return texCache[key]||(texCache[key]=make())}
function numberTex(n){return cachedText('n'+n,()=>textTexture(n,{w:128,h:128,size:86,fg:'#ffffff',stroke:'#14243a'}))}
function labelTex(text,user){return cachedText('l'+text+user,()=>user?textTexture(text,{w:512,h:150,bg:C.lime,fg:C.navy,size:54,arrow:true}):textTexture(text,{w:320,h:96,bg:'rgba(16,27,45,.86)',fg:'#fff',size:44,radius:34}))}

/* ---------- bichinhos jogadores (personagens originais) ---------- */
const SPECIES={
 'h-gk':{fur:'#8b5a3c',muzzle:'#d9b08c',ear:'round',inner:'#d9b08c',tail:'puff',tuft:true},
 'h-fixo':{fur:'#e3b47c',muzzle:'#fff1dc',ear:'floppy',earColor:'#9a6a3f',tail:'wag',tuft:true,spot:'#9a6a3f'},
 'h-ala1':{fur:'#f2a04e',muzzle:'#fff1dc',ear:'pointy',inner:'#ffc9b3',tail:'long',whisk:true,stripes:'#d97a2b'},
 'h-ala2':{fur:'#f4f1ea',muzzle:'#ffffff',ear:'long',inner:'#ffb8c6',tail:'puff',whisk:true,teeth:true},
 'h-pivo':{fur:'#e8742e',muzzle:'#ffffff',ear:'pointy',inner:'#3b2418',earColor:'#e8742e',tail:'bushy',whisk:true},
 'a-gk':{fur:'#f7f7f2',muzzle:'#ffffff',ear:'round',earColor:'#25252b',inner:'#25252b',patch:'#25252b',tail:'puff',tailColor:'#25252b',limb:'#25252b'},
 'a-fixo':{fur:'#8f96a3',muzzle:'#e7e9ee',ear:'pointy',inner:'#4a4f5a',patch:'#3d414b',tail:'ringed',whisk:true},
 'a-ala1':{fur:'#f6a9bb',muzzle:'#ff8aa6',ear:'small',inner:'#ff8aa6',snout:'pig',tail:'curly'},
 'a-ala2':{fur:'#a7a1b8',muzzle:'#d8d3e4',ear:'big',inner:'#f4b6c8',tail:'thin',whisk:true,teeth:true},
 'a-pivo':{fur:'#9c86b8',muzzle:'#c4b3db',ear:'round',inner:'#c4b3db',snout:'big',tail:'wag',tuft:true}
};
const shade=(hex,k)=>{const c=new T.Color(hex);c.multiplyScalar(k);return '#'+c.getHexString()};
const G2={torus:new T.TorusGeometry(1,.22,8,28),arc:new T.TorusGeometry(1,.2,6,18,Math.PI),capsule:new T.CylinderGeometry(1,1,1,10)};
// Uniformes pensados para a criança reconhecer o time de longe:
// seu time = verde-limão com laterais azul-marinho; rival = laranja com listras brancas; goleiros com estampa própria.
const KITS={
 home:{base:'#b4ee38',pattern:'sides',accent:'#14243a',trim:'#ffffff',num:'#14243a',numLine:'#ffffff',sleeve:'#14243a',cuff:'#b4ee38',shorts:'#14243a',stripe:'#b4ee38',sock:'#b4ee38',band:'#14243a',shoe:'#14243a',sole:'#b4ee38',floor:'#c9f45a'},
 away:{base:'#ff6436',pattern:'stripes',accent:'#ffffff',trim:'#ffffff',num:'#14243a',numLine:'#ffffff',numPatch:'#ffffff',sleeve:'#ffffff',cuff:'#ff6436',shorts:'#ffffff',stripe:'#ff6436',sock:'#ffffff',band:'#ff6436',shoe:'#ffffff',sole:'#ff6436',floor:'#ff7a3d'},
 homeGK:{base:'#2fb8ec',pattern:'diamonds',accent:'#1b78b4',trim:'#ffffff',num:'#ffffff',numLine:'#14243a',sleeve:'#2fb8ec',cuff:'#ffffff',shorts:'#14243a',stripe:'#2fb8ec',sock:'#2fb8ec',band:'#ffffff',shoe:'#14243a',sole:'#ffffff',gloves:'#ffffff',palm:'#b4ee38',long:true,floor:'#c9f45a'},
 awayGK:{base:'#ffd23a',pattern:'zigzag',accent:'#14243a',trim:'#14243a',num:'#14243a',numLine:'#ffffff',sleeve:'#ffd23a',cuff:'#14243a',shorts:'#14243a',stripe:'#ffd23a',sock:'#ffd23a',band:'#14243a',shoe:'#14243a',sole:'#ffd23a',gloves:'#14243a',palm:'#ffd23a',long:true,floor:'#ff7a3d'}
};
// camisa desenhada em canvas e "vestida" na esfera do tronco (u=.25 frente, u=.75 costas)
function jerseyTex(k,num){return cachedText('j'+JSON.stringify(k)+num,()=>canvasTex(512,256,(g,w,h)=>{
 g.fillStyle=k.base;g.fillRect(0,0,w,h);
 if(k.pattern==='stripes'){g.fillStyle=k.accent;for(let i=0;i<10;i++)g.fillRect((i/10+.03)*w,0,w*.04,h)}
 else if(k.pattern==='sides'){[0,.5,1].forEach(c=>{g.fillStyle=k.accent;g.fillRect((c-.07)*w,0,w*.14,h);g.fillStyle=k.trim;g.fillRect((c-.075)*w,0,5,h);g.fillRect((c+.075)*w-5,0,5,h)});
  g.fillStyle=k.accent;g.fillRect(0,h*.6,w,h*.06);g.fillStyle=k.trim;g.fillRect(0,h*.6,w,3);g.fillRect(0,h*.66-3,w,3)}
 else if(k.pattern==='diamonds'){g.fillStyle=k.accent;for(let x=0;x<16;x++)for(let y=0;y<8;y++)if((x+y)%2===0){const cx=(x+.5)*w/16,cy=(y+.5)*h/8;g.beginPath();g.moveTo(cx,cy-13);g.lineTo(cx+13,cy);g.lineTo(cx,cy+13);g.lineTo(cx-13,cy);g.fill()}}
 else if(k.pattern==='zigzag'){g.strokeStyle=k.accent;g.lineWidth=11;g.lineJoin='round';[.3,.62].forEach(v=>{g.beginPath();for(let x=0,i=0;x<=w+32;x+=32,i++)g.lineTo(x,h*v+(i%2?15:-15));g.stroke()})}
 if(num){const bx=.75*w,by=.42*h;g.font='900 112px '+FONT;g.textAlign='center';g.textBaseline='middle';
  if(k.numPatch){g.fillStyle=k.numPatch;roundRect(g,bx-62,by-58,124,116,26);g.fill()}
  g.lineJoin='round';g.lineWidth=16;g.strokeStyle=k.numLine;g.strokeText(num,bx,by+4);g.fillStyle=k.num;g.fillText(num,bx,by+4);
  // na frente: escudo com estrela e número pequeno
  const sx=.31*w,sy=.33*h;g.fillStyle=k.trim;g.beginPath();g.arc(sx,sy,21,0,Math.PI*2);g.fill();g.fillStyle=k.pattern==='stripes'?k.base:k.accent;g.beginPath();
  for(let i=0;i<10;i++){const r=i%2?7:15,a=-Math.PI/2+i*Math.PI/5;g.lineTo(sx+Math.cos(a)*r,sy+Math.sin(a)*r)}g.fill();
  g.font='900 46px '+FONT;g.lineWidth=8;g.strokeStyle=k.numLine;g.strokeText(num,.19*w,.36*h);g.fillStyle=k.num;g.fillText(num,.19*w,.36*h)}
}))}
function buildAnimal(sp,{kit,shorts,shoe,num,keeper,cap,style}){
 const k=style||{base:kit,pattern:'plain',accent:shade(kit,.8),trim:C.navy,num:C.navy,numLine:'#ffffff',sleeve:kit,cuff:C.navy,shorts,stripe:'#ffffff',sock:'#ffffff',band:C.navy,shoe,sole:'#ffffff',gloves:keeper||null,palm:C.lime};
 const root=new T.Group(),body=new T.Group();root.add(body);
 const fur=mat(sp.fur),furDark=mat(shade(sp.fur,.72)),limb=mat(sp.limb||sp.fur),dark=mat('#1a1a22',{roughness:.3}),white=mat('#ffffff'),inner=mat(sp.inner||sp.muzzle),earM=mat(sp.earColor||sp.fur);
 const trim=mat(k.trim),baseM=mat(k.base);
 // pernas: meião com faixa e chuteira com sola colorida
 const legs=[-1,1].map(s=>{const leg=new T.Group();leg.position.set(s*.13,.37,0);
  leg.add(mesh(G.cyl,limb,{y:-.08,sx:.085,sy:.14,sz:.085}),mesh(G.cyl,mat(k.sock),{y:-.2,sx:.094,sy:.16,sz:.094}),mesh(G.cyl,mat(k.band),{y:-.14,sx:.097,sy:.04,sz:.097}),
   mesh(G.sphere,mat(k.shoe),{y:-.3,z:.06,sx:.11,sy:.07,sz:.17}),mesh(G.sphere,mat(k.sole),{y:-.345,z:.06,sx:.115,sy:.03,sz:.175,shadow:false}),mesh(G.low,white,{y:-.25,z:.15,sx:.04,sy:.02,sz:.04,shadow:false}));
  body.add(leg);return leg});
 // calção com faixa lateral larga e camisa estampada
 const torso=new T.Group();body.add(torso);
 torso.add(mesh(G.cyl,mat(k.shorts),{y:.45,sx:.27,sy:.18,sz:.24}));
 [-1,1].forEach(s=>torso.add(mesh(G.box,mat(k.stripe),{x:s*.266,y:.45,sx:.016,sy:.17,sz:.09,shadow:false})));
 torso.add(mesh(G.sphere,num||k.pattern!=='plain'?new T.MeshStandardMaterial({map:jerseyTex(k,num),roughness:.6}):baseM,{y:.67,sx:.32,sy:.34,sz:.27}));
 torso.add(mesh(G2.torus,mat(shade(k.base,.78)),{y:.5,sx:.29,sy:.29,sz:.25,rx:Math.PI/2,shadow:false}));
 torso.add(mesh(G2.torus,trim,{y:.97,sx:.13,sy:.13,sz:.11,rx:Math.PI/2,shadow:false}));
 // braços: manga colorida com punho; goleiro de manga comprida e luvas grandes
 const arms=[-1,1].map(s=>{const arm=new T.Group();arm.position.set(s*.3,.86,0);
  arm.add(mesh(G.sphere,mat(k.sleeve),{sx:.105,sy:.105,sz:.105}),mesh(G2.torus,mat(k.cuff),{y:-.07,sx:.078,sy:.078,sz:.078,rx:Math.PI/2,shadow:false}),mesh(G.cyl,k.long?baseM:limb,{y:-.16,sx:.062,sy:.22,sz:.062}));
  if(k.gloves){arm.add(mesh(G.sphere,mat(k.gloves),{y:-.3,sx:.125,sy:.115,sz:.105}),mesh(G.cyl,mat(k.palm),{y:-.22,sx:.078,sy:.045,sz:.078}))}
  else{arm.add(mesh(G.sphere,limb,{y:-.3,sx:.08,sy:.08,sz:.08}));arm.add(mesh(G.low,limb,{x:s*-.05,y:-.28,z:.04,sx:.035,sy:.035,sz:.035,shadow:false}))}
  body.add(arm);return arm});
 // cabeça
 const head=new T.Group();head.position.y=1.2;body.add(head);
 head.add(mesh(G.sphere,fur,{sx:.34,sy:.32,sz:.32}));
 if(sp.stripes)[-.09,0,.09].forEach((x,i)=>head.add(mesh(G.sphere,mat(sp.stripes),{x,y:.27,z:.1,sx:.025,sy:.06,sz:.04,rx:-.5,rz:(i-1)*-.35,shadow:false})));
 if(sp.spot)head.add(mesh(G.sphere,mat(sp.spot),{x:.15,y:.12,z:.22,sx:.1,sy:.09,sz:.08,shadow:false}));
 if(sp.tuft)[-.05,.02,.08].forEach((x,i)=>head.add(mesh(G.cone,furDark,{x,y:.31,z:.04,sx:.04,sy:.12,sz:.04,rz:(i-1)*-.45,rx:-.2})));
 if(sp.patch)[-1,1].forEach(s=>head.add(mesh(G.sphere,mat(sp.patch),{x:s*.12,y:.03,z:.255,sx:.1,sy:.12,sz:.05,rz:s*.45,shadow:false})));
 const big=sp.snout==='big';
 head.add(mesh(G.sphere,mat(sp.muzzle),{y:big?-.1:-.08,z:big?.24:.27,sx:big?.22:.15,sy:big?.15:.11,sz:big?.14:.1}));
 if(sp.snout==='pig'){head.add(mesh(G.cyl,mat('#ff7a99'),{y:-.06,z:.37,sx:.09,sy:.05,sz:.07,rx:Math.PI/2}));[-1,1].forEach(s=>head.add(mesh(G.low,dark,{x:s*.03,y:-.06,z:.4,sx:.016,sy:.022,sz:.01,shadow:false})))}
 else{head.add(mesh(G.sphere,dark,{y:big?-.04:-.03,z:.37,sx:.06,sy:.045,sz:.04}));head.add(mesh(G.low,white,{x:.018,y:big?-.02:-.012,z:.405,sx:.015,sy:.01,sz:.008,shadow:false}))}
 if(big)[-1,1].forEach(s=>head.add(mesh(G.low,mat(shade(sp.muzzle,.6)),{x:s*.08,y:-.06,z:.375,sx:.02,sy:.025,sz:.01,shadow:false})));
 // olhos grandes: branco, pupila que olha para a bola e brilho
 const pupils=[],eyes=[-1,1].map(s=>{const e=new T.Group();e.position.set(s*.12,.06,.27);
  e.add(mesh(G.sphere,white,{sx:.07,sy:.08,sz:.045,shadow:false}));
  const pu=new T.Group();pu.position.z=.03;pu.add(mesh(G.sphere,dark,{sx:.045,sy:.055,sz:.025,shadow:false}),mesh(G.low,white,{x:.014,y:.022,z:.02,sx:.016,sy:.016,sz:.008,shadow:false}),mesh(G.low,white,{x:-.014,y:-.018,z:.02,sx:.007,sy:.007,sz:.005,shadow:false}));
  e.add(pu);pupils.push(pu);head.add(e);return e});
 const brows=[-1,1].map(s=>{const b=mesh(G2.capsule,mat(sp.patch?'#111':shade(sp.fur,.45)),{x:s*.12,y:.165,z:.285,sx:.012,sy:.07,sz:.012,rz:Math.PI/2,shadow:false});head.add(b);return b});
 // boca: sorriso, boca aberta feliz e boquinha de "ó"
 const mouthY=big?-.15:-.13,mouthZ=big?.37:.355;
 const smile=mesh(G2.arc,dark,{y:mouthY,z:mouthZ,sx:.05,sy:.04,sz:.03,rz:Math.PI,shadow:false});head.add(smile);
 const open=new T.Group();open.position.set(0,mouthY-.01,mouthZ-.01);open.add(mesh(G.sphere,mat('#5a1f2a'),{sx:.055,sy:.045,sz:.02,shadow:false}),mesh(G.sphere,mat('#ff7a8a'),{y:-.02,z:.008,sx:.032,sy:.018,sz:.012,shadow:false}));
 if(sp.teeth)open.add(mesh(G.box,white,{y:.03,z:.012,sx:.04,sy:.022,sz:.006,shadow:false}));
 open.visible=false;head.add(open);
 const oh=mesh(G.sphere,mat('#5a1f2a'),{y:mouthY-.005,z:mouthZ,sx:.025,sy:.03,sz:.015,shadow:false});oh.visible=false;head.add(oh);
 [-1,1].forEach(s=>head.add(mesh(G.low,mat('#ff8fa3',{transparent:true,opacity:.7}),{x:s*.21,y:-.07,z:.24,sx:.065,sy:.038,sz:.02,ry:s*.6,shadow:false})));
 if(sp.whisk)[-1,1].forEach(s=>[-.02,.015].forEach((y,i)=>head.add(mesh(G.cyl,mat('#3a2a22'),{x:s*.2,y:-.08+y,z:.3,sx:.004,sy:.15,sz:.004,rz:Math.PI/2+s*(i?.15:-.12),ry:s*.35,shadow:false}))));
 // orelhas em grupos (para mexer)
 const ears=[-1,1].map(s=>{const g=new T.Group();head.add(g);
  if(sp.ear==='round'){g.add(mesh(G.sphere,earM,{x:s*.23,y:.25,z:-.02,sx:.11,sy:.11,sz:.07}),mesh(G.sphere,inner,{x:s*.23,y:.25,z:.03,sx:.065,sy:.065,sz:.03,shadow:false}))}
  else if(sp.ear==='big'){g.add(mesh(G.sphere,earM,{x:s*.28,y:.22,z:-.02,sx:.17,sy:.17,sz:.06}),mesh(G.sphere,inner,{x:s*.28,y:.22,z:.025,sx:.11,sy:.11,sz:.03,shadow:false}))}
  else if(sp.ear==='pointy'){g.add(mesh(G.cone,earM,{x:s*.19,y:.33,sx:.11,sy:.24,sz:.07,rz:-s*.35}),mesh(G.cone,inner,{x:s*.185,y:.31,z:.03,sx:.06,sy:.15,sz:.03,rz:-s*.35,shadow:false}))}
  else if(sp.ear==='long'){g.add(mesh(G.sphere,earM,{x:s*.12,y:.5,z:-.02,sx:.08,sy:.26,sz:.05,rz:-s*.14}),mesh(G.sphere,inner,{x:s*.123,y:.49,z:.02,sx:.045,sy:.19,sz:.03,rz:-s*.14,shadow:false}))}
  else if(sp.ear==='floppy'){g.add(mesh(G.sphere,earM,{x:s*.33,y:-.02,sx:.09,sy:.21,sz:.07,rz:s*.35}))}
  else if(sp.ear==='small'){g.add(mesh(G.cone,earM,{x:s*.19,y:.3,z:.06,sx:.075,sy:.13,sz:.05,rz:-s*.3,rx:.4}))}
  return g});
 if(cap){head.add(mesh(G.sphere,mat(cap),{y:.12,sx:.35,sy:.24,sz:.34}),mesh(G.cyl,mat(C.lime),{y:.13,z:.3,sx:.2,sy:.025,sz:.16}),mesh(G.low,mat(C.lime),{y:.36,sx:.04,sy:.03,sz:.04}))}
 // cauda
 let tail=null;if(sp.tail){tail=new T.Group();tail.position.set(0,.47,-.24);body.add(tail);const tm=mat(sp.tailColor||sp.fur);
  if(sp.tail==='puff')tail.add(mesh(G.sphere,tm,{z:-.04,sx:.09,sy:.09,sz:.09}));
  else if(sp.tail==='wag')tail.add(mesh(G.capsule,tm,{y:.08,z:-.05,sx:.04,sy:.2,sz:.04,rx:-.6}),mesh(G.sphere,tm,{y:.17,z:-.11,sx:.045,sy:.045,sz:.045}));
  else if(sp.tail==='long'||sp.tail==='thin'){const th=sp.tail==='thin'?.022:.04,tc=sp.tail==='thin'?mat('#f4b6c8'):tm;tail.add(mesh(G.capsule,tc,{y:.05,z:-.12,sx:th,sy:.26,sz:th,rx:-1.1}),mesh(G.capsule,tc,{y:.24,z:-.25,sx:th,sy:.24,sz:th,rx:-.2}),mesh(G.sphere,tc,{y:.36,z:-.26,sx:th,sy:th,sz:th}))}
  else if(sp.tail==='bushy'){tail.add(mesh(G.sphere,tm,{y:.06,z:-.2,sx:.11,sy:.11,sz:.24,rx:.5}),mesh(G.sphere,white,{y:.16,z:-.38,sx:.07,sy:.07,sz:.08}))}
  else if(sp.tail==='ringed'){for(let i=0;i<4;i++)tail.add(mesh(G.sphere,mat(i%2?'#3d414b':sp.fur),{y:.03+i*.07,z:-.08-i*.08,sx:.075,sy:.075,sz:.08}))}
  else if(sp.tail==='curly')tail.add(mesh(G2.torus,tm,{y:.02,z:-.06,sx:.05,sy:.05,sz:.05,ry:Math.PI/2}))}
 return {root,body,head,legs,arms,eyes,pupils,brows,mouth:{smile,open,oh},ears,tail,torso};
}

// expressões: sorriso normal, alegria (boca aberta e sobrancelhas para cima), tontura e esforço
function animateFace(a,dt,time){
 const e=a.emote,type=e&&e.type,moving=!!a.move;
 const mood=type==='jump'?'joy':type==='trip'?'dizzy':type==='kick'||type==='diveL'||type==='diveR'?'effort':moving?'run':'calm';
 a.mouth.smile.visible=mood==='calm'||mood==='run';a.mouth.open.visible=mood==='joy'||mood==='effort';a.mouth.oh.visible=mood==='dizzy';
 const browY={joy:.19,dizzy:.17,effort:.155,run:.16,calm:.165}[mood],browR={joy:.18,dizzy:-.35,effort:.3,run:.1,calm:0}[mood];
 a.brows.forEach((b,i)=>{const s=i?1:-1;b.position.y+=(browY-b.position.y)*.25;b.rotation.z=Math.PI/2+s*browR});
 // a cabeça e as pupilas seguem a bola
 const r=a.root,target=ball.mesh.position;let yaw=0,pitch=0;
 if(mood!=='dizzy'){const d=target.clone().sub(r.position),local=Math.atan2(d.x,d.z)-r.rotation.y;yaw=clamp(((local+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,-.7,.7);pitch=clamp(-Math.atan2(1.3,Math.hypot(d.x,d.z))*.35,-.35,0)}
 const k=1-Math.exp(-dt*6);a.head.rotation.y+=(yaw-a.head.rotation.y)*k;a.head.rotation.x+=(-pitch*.6-a.head.rotation.x)*k;
 a.head.rotation.z=mood==='calm'?Math.sin(time*1.3+a.phase*.1)*.05:0;
 a.pupils.forEach(p=>{if(mood==='dizzy'){p.position.x=Math.cos(time*12)*.012;p.position.y=Math.sin(time*12)*.012}else{p.position.x+=(yaw*.02-p.position.x)*k;p.position.y+=(-.004-p.position.y)*k}});
 // respiração, orelhas e cauda
 const breathe=mood==='calm'?1+Math.sin(time*2.2+a.phase*.2)*.02:mood==='joy'?1+Math.abs(Math.sin(time*9))*.05:1;a.torso.scale.set(1/Math.sqrt(breathe),breathe,1/Math.sqrt(breathe));
 const twitch=Math.sin(time*.9+a.phase)>.96?Math.sin(time*40)*.12:0;a.ears.forEach((g,i)=>g.rotation.z=(i?-1:1)*twitch);
 if(a.tail){const speed=mood==='joy'?16:moving?10:4;a.tail.rotation.y=Math.sin(time*speed+a.phase)*(mood==='joy'?.7:.35);a.tail.rotation.x=mood==='dizzy'?.6:0}
}

/* ---------- cena ---------- */
let renderer,scene,camera,container,clock,ro,mounted=false;
const actors={},crowd=[],confetti=[],stars=[];
let scoreBoard=null,ball,ballTex,current=null,cueGroup=null,cueTex=null,userRing,goals={},coach=null,camMode='aerial',firstShow=true,shake=0,showCue=false;
const cam={pos:new T.Vector3(0,18,14),look:new T.Vector3(),fov:36};

function build(){
 renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.outputEncoding=T.sRGBEncoding;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:manipulation';
 scene=new T.Scene();scene.background=new T.Color('#16304a');scene.fog=new T.Fog('#16304a',34,70);
 camera=new T.PerspectiveCamera(36,1,.1,200);
 scene.add(new T.HemisphereLight('#e6f6ff','#8a6440',.95));
 const sun=new T.DirectionalLight('#fff1d6',1.35);sun.position.set(-7,16,9);sun.castShadow=true;
 Object.assign(sun.shadow.camera,{left:-14,right:14,top:10,bottom:-10,near:1,far:50});sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0006;sun.shadow.normalBias=.02;scene.add(sun);
 const fill=new T.DirectionalLight('#9fd8ff',.35);fill.position.set(8,6,-10);scene.add(fill);

 const ground=mesh(new T.PlaneGeometry(90,90),mat('#1d3a58'),{rx:-Math.PI/2,y:-.02,shadow:false});scene.add(ground);
 const floorMat=new T.MeshStandardMaterial({map:floorTexture(),roughness:.55});
 const floor=mesh(new T.PlaneGeometry(FLOOR_X*2,FLOOR_Z*2),floorMat,{rx:-Math.PI/2,shadow:false});scene.add(floor);
 ballTex=ballTexture();
 buildBoards();buildGoals();buildStands();buildCoach();buildDecor();

 ball={mesh:mesh(new T.SphereGeometry(BALL_R,28,20),new T.MeshStandardMaterial({map:ballTex,roughness:.45})),tween:null,follow:null,visible:true};
 ball.mesh.position.set(0,BALL_R,0);scene.add(ball.mesh);
 // contorno da bola visível através dos bichinhos, e um anel no chão para achar a bola
 const ghost=new T.Mesh(ball.mesh.geometry,new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.45,depthTest:false}));ghost.renderOrder=7;ball.mesh.add(ghost);
 ball.marker=mesh(new T.RingGeometry(.38,.47,32),new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.85,depthWrite:false}),{rx:-Math.PI/2,shadow:false});scene.add(ball.marker);

 userRing=new T.Group();
 userRing.add(mesh(new T.RingGeometry(.42,.54,40),new T.MeshBasicMaterial({color:C.lime,transparent:true,opacity:.95,depthWrite:false}),{rx:-Math.PI/2,y:.015,shadow:false}));
 userRing.add(mesh(new T.CircleGeometry(.42,40),new T.MeshBasicMaterial({color:'#e8ff9a',transparent:true,opacity:.28,depthWrite:false}),{rx:-Math.PI/2,y:.012,shadow:false}));
 scene.add(userRing);

 for(let i=0;i<90;i++){const m=new T.Mesh(new T.PlaneGeometry(.09,.06),new T.MeshBasicMaterial({color:[C.lime,C.orange,C.sky,'#ffd35b','#ff8fd0','#ffffff'][i%6],side:T.DoubleSide}));m.visible=false;scene.add(m);confetti.push({m,v:new T.Vector3(),life:0,spin:new T.Vector3()})}
 for(let i=0;i<3;i++){const s=mesh(G.star,mat('#ffd35b',{emissive:'#8a6a00'}),{sx:.11,sy:.11,sz:.11,shadow:false});s.visible=false;scene.add(s);stars.push(s)}
 clock=new T.Clock();
}
function buildBoards(){
 const colors=[C.navy,'#1f6fd1',C.orange,'#7fb81f',C.sky],ads=['QUADRA QUEST','⚽ BORA!','FUTSAL','TIME DO RAFA','CRAQUE!'];let i=0;
 const segment=(len,x,z,ry)=>{const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;const col=colors[i%colors.length];
  g.add(mesh(G.box,mat(col),{y:.3,sx:len-.05,sy:.6,sz:.26}),mesh(G.box,mat('#ffffff'),{y:.63,sx:len-.05,sy:.07,sz:.3}));
  if(i%2===0){const ad=new T.Mesh(new T.PlaneGeometry(len*.85,.42),new T.MeshBasicMaterial({map:cachedText('ad'+i%ads.length,()=>textTexture(ads[(i/2|0)%ads.length],{w:512,h:128,fg:'#ffffff',size:62})),transparent:true}));ad.position.set(0,.3,.135);g.add(ad)}
  scene.add(g);i++};
 const n=10,len=(FLOOR_X*2+.6)/n;for(let k=0;k<n;k++){const x=-FLOOR_X-.3+len*(k+.5);segment(len,x,-FLOOR_Z-.15,0);segment(len,x,FLOOR_Z+.15,Math.PI)}
 const m=6,lz=(FLOOR_Z*2)/m;for(let k=0;k<m;k++){const z=-FLOOR_Z+lz*(k+.5);segment(lz,-FLOOR_X-.15,z,Math.PI/2);segment(lz,FLOOR_X+.15,z,-Math.PI/2)}
}
function buildGoals(){
 const net=netTexture(),post=stripeTexture('#e8453c','#ffffff');
 [1,-1].forEach(side=>{
  const g=new T.Group();g.position.x=side*HALF_X;g.rotation.y=side>0?0:Math.PI;
  const pm=new T.MeshStandardMaterial({map:post,roughness:.4});
  [-1,1].forEach(s=>g.add(mesh(new T.CylinderGeometry(.06,.06,GOAL_H,14),pm,{x:.03,y:GOAL_H/2,z:s*GOAL_W})));
  g.add(mesh(new T.CylinderGeometry(.06,.06,GOAL_W*2+.12,14),pm,{x:.03,y:GOAL_H,rx:Math.PI/2}));
  const frame=mat('#e9eef2');
  [-1,1].forEach(s=>{g.add(mesh(G.cyl,frame,{x:GOAL_D/2,y:.03,z:s*GOAL_W,sx:.025,sy:GOAL_D,sz:.025,rz:Math.PI/2}),mesh(G.cyl,frame,{x:GOAL_D/2,y:GOAL_H,z:s*GOAL_W,sx:.025,sy:GOAL_D,sz:.025,rz:Math.PI/2}),mesh(G.cyl,frame,{x:GOAL_D,y:GOAL_H/2,z:s*GOAL_W,sx:.025,sy:GOAL_H,sz:.025}))});
  const nm=(rx,ry)=>{const t=net.clone();t.needsUpdate=true;t.repeat.set(rx,ry);return new T.MeshStandardMaterial({map:t,transparent:true,alphaTest:.4,side:T.DoubleSide,roughness:.9})};
  const back=mesh(new T.PlaneGeometry(GOAL_W*2,GOAL_H,8,6),nm(6,4),{x:GOAL_D,y:GOAL_H/2,ry:Math.PI/2,shadow:false});g.add(back);
  [-1,1].forEach(s=>g.add(mesh(new T.PlaneGeometry(GOAL_D,GOAL_H),nm(2.5,4),{x:GOAL_D/2,y:GOAL_H/2,z:s*GOAL_W,shadow:false})));
  g.add(mesh(new T.PlaneGeometry(GOAL_D,GOAL_W*2),nm(2.5,6),{x:GOAL_D/2,y:GOAL_H,rx:Math.PI/2,shadow:false}));
  scene.add(g);goals[side]={group:g,back,ripple:0};
 });
}
function buildStands(){
 const rnd=rng(5),shirts=[C.lime,C.orange,C.sky,'#ffd35b','#ff8fd0','#ffffff','#7b6cff'],furs=['#8b5a3c','#e3b47c','#f2a04e','#f4f1ea','#8f96a3','#f6a9bb','#a7a1b8','#5c4033'];
 for(let t=0;t<3;t++){const z=-FLOOR_Z-.85-t*.75,h=(t+1)*.42;
  scene.add(mesh(G.box,mat(t%2?'#2a4f78':'#335d8a'),{y:h/2,z,sx:20.5,sy:h,sz:.75}));
  scene.add(mesh(G.box,mat(t%2?C.orange:C.sky),{y:h+.02,z:z+.3,sx:20.5,sy:.05,sz:.1,shadow:false}));
  for(let x=-9.6;x<=9.6;x+=.82){if(rnd()<.28)continue;
   const g=new T.Group();g.position.set(x+(rnd()-.5)*.2,h,z);const furM=mat(furs[Math.floor(rnd()*furs.length)]);
   g.add(mesh(G.low,mat(shirts[Math.floor(rnd()*shirts.length)]),{y:.26,sx:.22,sy:.26,sz:.18,shadow:false}));
   const head=new T.Group();head.position.y=.64;g.add(head);
   head.add(mesh(G.low,furM,{sx:.19,sy:.18,sz:.18,shadow:false}));[-1,1].forEach(s=>{head.add(mesh(G.low,furM,{x:s*.13,y:.14,sx:.06,sy:.07,sz:.04,shadow:false}),mesh(G.low,mat('#1a1a22'),{x:s*.06,y:.02,z:.16,sx:.025,sy:.032,sz:.02,shadow:false}))});
   const arms=[-1,1].map(s=>{const a=new T.Group();a.position.set(s*.2,.38,0);a.add(mesh(G.low,furM,{y:.12,sx:.05,sy:.14,sz:.05,shadow:false}));a.rotation.z=s*2.6;g.add(a);return a});
   scene.add(g);crowd.push({g,arms,phase:rnd()*6,waver:rnd()<.35,base:h})}
 }
 // parede do ginásio com faixas e varal de luzes
 const wall=(w,x,z,ry,text)=>{const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;g.add(mesh(new T.PlaneGeometry(w,6),mat('#1f3d60'),{y:3,shadow:false}));
  if(text){const b=new T.Mesh(new T.PlaneGeometry(6.5,1.2),new T.MeshBasicMaterial({map:textTexture(text,{w:1024,h:190,bg:C.lime,fg:C.navy,size:110,radius:60}),transparent:true}));b.position.set(0,3.3,.02);g.add(b)}
  for(let k=0;k<Math.floor(w/1.1);k++){const bulb=mesh(G.low,new T.MeshBasicMaterial({color:['#ffe28a','#c9f45a','#ff9b6b','#7fe0ff'][k%4]}),{x:-w/2+.55+k*1.1,y:4.6+Math.sin(k*.9)*.12,z:.05,sx:.07,sy:.07,sz:.07,shadow:false});g.add(bulb)}
  scene.add(g)};
 wall(26,0,-FLOOR_Z-3.2,0,'BORA PRA QUADRA!');
 wall(16,FLOOR_X+2.6,0,-Math.PI/2,null);wall(16,-FLOOR_X-2.6,0,Math.PI/2,null);
 const board=scoreBoard=new T.Mesh(new T.PlaneGeometry(4.6,1.6),new T.MeshBasicMaterial({map:scoreTexture(0,0)}));
 board.position.set(FLOOR_X+2.55,3.1,0);board.rotation.y=-Math.PI/2;scene.add(board);
}
function scoreTexture(h,a){return textTexture('SEU TIME  '+h+' × '+a+'  RIVAL',{w:1024,h:300,bg:'#0b1524',fg:'#ffffff',size:92,radius:40})}
function setScore(sc){if(!scoreBoard)return;const old=scoreBoard.material.map;scoreBoard.material.map=scoreTexture(sc.home,sc.away);scoreBoard.material.needsUpdate=true;if(old)old.dispose()}
function buildCoach(){
 const a=buildAnimal({fur:'#a8754a',muzzle:'#7d5233',ear:'round',inner:'#7d5233',snout:'big'},{kit:'#ffffff',shorts:C.navy,shoe:C.navy,cap:C.navy});
 a.root.position.set(-2.6,0,FLOOR_Z+.95);a.root.rotation.y=Math.PI;a.root.scale.setScalar(1.15);scene.add(a.root);coach=a;
 const bench=new T.Group();bench.position.set(1.4,0,FLOOR_Z+1);bench.add(mesh(G.box,mat(C.orange),{y:.34,sx:2.6,sy:.1,sz:.45}),mesh(G.box,mat(C.navy),{x:-1.1,y:.16,sx:.1,sy:.32,sz:.4}),mesh(G.box,mat(C.navy),{x:1.1,y:.16,sx:.1,sy:.32,sz:.4}));
 [-.6,.1,.8].forEach((x,k)=>bench.add(mesh(G.cyl,mat([C.sky,C.lime,C.orange][k]),{x,y:.5,sx:.06,sy:.22,sz:.06})));scene.add(bench);
}
function buildDecor(){
 [[-FLOOR_X+.35,-FLOOR_Z+.35],[FLOOR_X-.35,-FLOOR_Z+.35],[-FLOOR_X+.35,FLOOR_Z-.35],[FLOOR_X-.35,FLOOR_Z-.35]].forEach(([x,z])=>{scene.add(mesh(G.cone,mat(C.orange),{x,y:.17,z,sx:.13,sy:.34,sz:.13}),mesh(G.cyl,mat('#ffffff'),{x,y:.2,z,sx:.085,sy:.05,sz:.085}))});
 const bag=new T.Group();bag.position.set(4.6,0,FLOOR_Z+1);bag.add(mesh(G.cyl,mat('#14243a'),{y:.25,sx:.32,sy:.5,sz:.32}));
 [[-.12,.55,.05],[.12,.57,-.06],[0,.62,.12]].forEach(([x,y,z])=>bag.add(mesh(new T.SphereGeometry(.13,16,12),new T.MeshStandardMaterial({map:ballTex,roughness:.5}),{x,y,z})));scene.add(bag);
}

/* ---------- atores da jogada ---------- */
function actorFor(p){
 let a=actors[p.id];if(a)return a;
 const home=p.team==='home';
 const style=p.keeper?(home?KITS.homeGK:KITS.awayGK):(home?KITS.home:KITS.away),parts=buildAnimal(SPECIES[p.id]||SPECIES['h-ala1'],{num:p.n,style});
 parts.root.add(mesh(new T.RingGeometry(.3,.4,32),new T.MeshBasicMaterial({color:style.floor,transparent:true,opacity:.8,depthWrite:false}),{rx:-Math.PI/2,y:.014,shadow:false}));
 const label=new T.Sprite(new T.SpriteMaterial({depthTest:false,transparent:true}));label.renderOrder=10;parts.root.add(label);
 a={...parts,id:p.id,keeper:!!p.keeper,label,move:null,emote:null,phase:Math.random()*6,lookAt:null,role:''};
 parts.root.scale.setScalar(ACTOR);scene.add(parts.root);actors[p.id]=a;return a;
}
function setLabel(a,p){const text=p.user?'VOCÊ · '+p.role:p.role,key=text+!!p.user;if(a.labelKey===key)return;a.labelKey=key;a.label.material.map=labelTex(text,!!p.user);a.label.material.needsUpdate=true;
 if(p.user){a.labelW=1.25;a.labelH=.37}else{a.labelW=.8;a.labelH=.24}}
function moveActor(a,to,dur){const from=a.root.position.clone();if(dur<=0||from.distanceTo(to)<.02){a.root.position.copy(to);a.move=null;return}a.move={from,to:to.clone(),t:0,dur}}
function emote(a,type,dur){a.emote={type,t:0,dur}}
function ballTo(to,{dur=.7,height=.3,onDone=null,delay=0}={}){ball.follow=null;ball.tween={from:ball.mesh.position.clone(),to:to.clone(),t:-delay,dur,height,onDone}}
// Os bichinhos são grandes: abrimos um pouco de espaço entre eles e deixamos a bola
// no pé de quem a tem, na direção da jogada. Só muda o desenho, não a jogada.
const layouts=new WeakMap(),SPACING=1.05,BALL_GAP=.62;
function layout(p){
 if(layouts.has(p))return layouts.get(p);
 const all=[...p.home,...p.away],pos={};all.forEach(pl=>pos[pl.id]=world(pl));
 const fixed=id=>id===p.user.id;
 for(let it=0;it<8;it++)for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
  const a=pos[all[i].id],b=pos[all[j].id],d=b.clone().sub(a),len=d.length();if(len>=SPACING)continue;
  if(len<.01)d.set(0,0,1);const push=d.setLength((SPACING-len)/2),fa=fixed(all[i].id),fb=fixed(all[j].id);
  if(fa&&fb)continue;if(fa)b.add(push.multiplyScalar(2));else if(fb)a.sub(push.multiplyScalar(2));else{a.sub(push);b.add(push)}}
 let ballP=world(p.ball);const holderId=p.holder||(ballP.distanceTo(pos[p.user.id])<1?p.user.id:null),h=holderId&&pos[holderId];
 if(h){const mine=holderId===p.user.id,t=mine?(p.target==='goal'?world({x:950,y:300}):p.target==='space'&&p.cue?world(p.cue):pos[p.target]):null;
  const dir=(t?t.clone().sub(h):new T.Vector3(holderId[0]==='h'?1:-1,0,0)).setY(0);if(dir.lengthSq()<.01)dir.set(1,0,0);ballP=h.clone().add(dir.setLength(BALL_GAP))}
 all.forEach(pl=>{if(fixed(pl.id)||pl.id===holderId)return;const q=pos[pl.id],d=q.clone().sub(ballP).setY(0),len=d.length();if(len<BALL_GAP){if(len<.01)d.set(pl.team==='home'?-1:1,0,0);q.copy(ballP).add(d.setLength(BALL_GAP))}});
 const out={players:pos,ball:ballP,holder:holderId};layouts.set(p,out);return out}
function ballSpot(p,y=BALL_R){return layout(p).ball.clone().setY(y)}
function targetPoint(p){if(!p||!p.target)return null;if(p.target==='goal')return world({x:950,y:300});if(p.target==='space')return p.cue?world(p.cue):null;const t=layout(p).players[p.target];return t?t.clone():null}

function clearCue(){if(cueGroup){scene.remove(cueGroup);cueGroup.traverse(o=>{if(o.geometry&&o.geometry!==G.sphere)o.geometry.dispose()});cueGroup=null}}
function buildCue(p){
 clearCue();const to=targetPoint(p);if(!to)return;
 const from=layout(p).holder===p.user.id?ballSpot(p,.12):layout(p).players[p.user.id].clone().setY(.12),end=to.clone().setY(.12),dir=end.clone().sub(from),len=dir.length();if(len<.3)return;
 const mid=from.clone().lerp(end,.5).setY(p.target==='goal'?.9:.55);
 const curve=new T.QuadraticBezierCurve3(from,mid,end.clone().sub(dir.clone().normalize().multiplyScalar(.35)));
 if(!cueTex){cueTex=canvasTex(128,32,(g,w,h)=>{g.fillStyle='rgba(255,255,255,.55)';g.fillRect(0,0,w,h);g.fillStyle='#ffffff';roundRect(g,4,2,w*.6,h-4,10);g.fill()});cueTex.wrapS=T.RepeatWrapping}
 const tex=cueTex.clone();tex.needsUpdate=true;tex.repeat.set(Math.max(2,len/.45),1);
 cueGroup=new T.Group();
 const tube=new T.Mesh(new T.TubeGeometry(curve,60,.12,10,false),new T.MeshBasicMaterial({color:'#ffd21f',map:tex,transparent:true,alphaTest:.3,depthWrite:false,depthTest:false}));
 const tip=new T.Mesh(new T.ConeGeometry(.3,.6,18),new T.MeshBasicMaterial({color:'#ffd21f',depthTest:false,transparent:true}));
 const tEnd=curve.getPoint(1),tan=curve.getTangent(1);tip.position.copy(tEnd).add(tan.clone().multiplyScalar(.28));tip.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),tan.normalize());
 const ring=new T.Mesh(new T.RingGeometry(.35,.48,36),new T.MeshBasicMaterial({color:'#ffd21f',transparent:true,opacity:.95,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.copy(end).setY(.02);
 const outline=new T.Mesh(new T.TubeGeometry(curve,60,.17,10,false),new T.MeshBasicMaterial({color:'#14243a',transparent:true,opacity:.6,depthWrite:false,depthTest:false}));outline.renderOrder=5;
 tube.renderOrder=tip.renderOrder=6;cueGroup.add(outline,tube,tip,ring);cueGroup.userData={tex,ring};scene.add(cueGroup);
}

function show(p,opts={}){
 if(!mounted)return;
 if(opts.camera)camMode=opts.camera;
 const fresh=p!==current;
 if(fresh){
  current=p;
  const snap=firstShow;firstShow=false;
  const all=[...p.home,...p.away];
  Object.values(actors).forEach(a=>{a.root.visible=false});
  all.forEach(pl=>{const a=actorFor(pl);a.root.visible=true;setLabel(a,pl);a.emote=null;a.body.rotation.set(0,0,0);a.body.position.set(0,0,0);a.isUser=!!pl.user;
   const to=layout(p).players[pl.id].clone(),d=a.root.position.distanceTo(to);moveActor(a,to,snap?0:clamp(d/5.5,.45,1.15));a.lookAt=ballSpot(p,0)});
  const bt=ballSpot(p);ball.visible=true;ball.mesh.visible=true;
  if(snap){ball.tween=null;ball.mesh.position.copy(bt)}else ballTo(bt,{dur:.55,height:.25});
  stars.forEach(s=>s.visible=false);
  if(snap){cam.pos.copy(camGoal().pos);cam.look.copy(camGoal().look)}
 }
 showCue=!!opts.cue;
 if(showCue&&(fresh||!cueGroup))buildCue(p);else if(!showCue)clearCue();
}
function userActor(){return current&&actors[current.user.id]}
function nearestRival(pt){let best=null,bd=1e9;current.away.forEach(r=>{const a=actors[r.id],d=a.root.position.distanceTo(pt);if(!r.keeper&&d<bd){bd=d;best=a}});return best}
function burst(pos,n=70){let k=0;for(const c of confetti){if(c.life>0)continue;c.m.visible=true;c.m.position.copy(pos).add(new T.Vector3(0,1.3,0));c.v.set((Math.random()-.5)*4,3+Math.random()*3,(Math.random()-.5)*4);c.spin.set(Math.random()*8,Math.random()*8,Math.random()*8);c.life=1.8+Math.random()*.6;if(++k>=n)break}}

// avisa o som do jogo (audio.js) sobre o que acontece na quadra
const emit=(name,o)=>{const f=window.Court3D&&window.Court3D.onSound;if(f)f(name,o)};
const later=(ms,fn)=>setTimeout(fn,ms);
const KICKS={pass:.3,throw:1.4,kickin:.35,corner:1.1,freeKick:.9};
function outcome(action,correct){
 const p=current,u=userActor();if(!p||!u)return;clearCue();
 const tgt=targetPoint(p),ballPos=ball.mesh.position.clone(),up=u.root.position;
 const forward=(dist)=>up.clone().add(new T.Vector3(dist,0,-up.z*.15));
 if(!correct){
  if(action==='timeout')emit('whistle',{long:true});else{emote(u,'trip',2.4);emit('trip')}
  const thief=nearestRival(ballPos),spot=thief?ballPos.clone().lerp(thief.root.position,.55).setY(BALL_R):ballPos.clone().add(new T.Vector3(-1.5,0,1));
  ballTo(spot,{dur:.9,height:.15,delay:.2,onDone:()=>{emit('steal');if(thief){moveActor(thief,spot.clone().setY(0).add(new T.Vector3(.3,0,0)),.45);}}});
  return}
 // comemoração do jogador: só na defesa do goleiro (o gol é comemorado em finale)
 const celebrate=(delay)=>setTimeout(()=>{if(current!==p)return;emote(u,'jump',1.5);burst(u.root.position);emit('sparkle');emit('cheer')},delay);
 if(KICKS[action]!==undefined){
  emote(u,'kick',.4);later(150,()=>emit('kick',{power:KICKS[action]>.8?.9:.5}));
  const to=(tgt||forward(4)).clone().setY(BALL_R),receiver=p.target&&actors[p.target];
  ballTo(to,{dur:clamp(to.distanceTo(ballPos)/9,.45,1.1),height:KICKS[action],delay:.15,onDone:()=>{emit('catch');if(receiver&&current===p){receiver.lookAt=u.root.position.clone();emote(receiver,'kick',.35)}}});
  
 }else if(action==='shoot'){
  emote(u,'kick',.4);later(150,()=>emit('kick',{power:1}));
  const z=clamp(up.z*.25+(Math.random()-.5)*.8,-.75,.75),to=new T.Vector3(HALF_X+.55,.45,z);
  const gk=current.away.find(r=>r.keeper);if(gk){const a=actors[gk.id];setTimeout(()=>{if(current===p){emote(a,z>a.root.position.z?'diveL':'diveR',1.3);emit('dive')}},200)}
  ballTo(to,{dur:.6,height:.5,delay:.15,onDone:()=>{goals[1].ripple=1;shake=.25;emit('goal');emit('net');ballTo(new T.Vector3(HALF_X+.6,BALL_R,z),{dur:.35,height:.1})}});
 }else if((action==='advance'||action==='dribble')&&layout(p).holder===p.user.id){
  const to=(tgt&&p.target==='space'?tgt:forward(2.6)).setY(0);moveActor(u,to,1.1);ball.tween=null;ball.follow=u;emit('run');
  setTimeout(()=>{if(ball.follow===u)ball.follow=null},1100);
 }else if(action==='control'){
  ballTo(up.clone().add(new T.Vector3(.35,BALL_R,0)),{dur:.45,height:.6,onDone:()=>emit('catch')});
 }else if(action==='defend'&&u.keeper){
  const to=tgt?up.clone().lerp(tgt,.3).setY(0):up.clone();moveActor(u,to,.4);
  setTimeout(()=>{if(current!==p)return;emote(u,ballPos.z>up.z?'diveL':'diveR',1.2);emit('dive');later(250,()=>emit('kick',{power:.7}));ballTo(up.clone().add(new T.Vector3(-2.2,BALL_R,(Math.random()-.5)*3)),{dur:.7,height:.8,delay:.25})},380);
  celebrate(1600);
 }else{
  const aim=(tgt||ballPos).clone().setY(0),dir=aim.clone().sub(up),dist=dir.length(),to=dist>.8?up.clone().add(dir.normalize().multiplyScalar(dist-.7)):up.clone();
  moveActor(u,to,clamp(dist/5,.4,1.1));u.lookAt=aim;if(dist>.8)emit('run');
 }
}
function teamParty(team,delay){const p=current;later(delay,()=>{if(current!==p)return;const mates=(team==='home'?p.home:p.away).map(pl=>actors[pl.id]).filter(Boolean);mates.forEach((a,i)=>later(i*90,()=>{if(current===p&&!a.keeper)emote(a,'jump',1.6)}));if(team==='home'){const u=userActor();if(u){emote(u,'jump',1.6);burst(u.root.position)}emit('sparkle');emit('cheer',{big:true})}})}
function finale(type,o={}){
 const p=current;if(!p)return;const u=userActor(),bp=ball.mesh.position.clone();
 if(type==='goal'&&!o.shot){const z=clamp(bp.z*.3,-.7,.7);emit('kick',{power:1});
  ballTo(new T.Vector3(HALF_X+.55,.45,z),{dur:.7,height:.6,onDone:()=>{goals[1].ripple=1;shake=.25;emit('goal');emit('net');ballTo(new T.Vector3(HALF_X+.6,BALL_R,z),{dur:.3,height:.1})}});
  teamParty('home',800)}
 else if(type==='goal')teamParty('home',0);
 else if(type==='conceded'){const z=clamp(bp.z*.3,-.7,.7),gk=actors['h-gk'];emit('kick',{power:1});
  if(gk)later(250,()=>{if(current===p)emote(gk,z>gk.root.position.z?'diveL':'diveR',1.2)});
  ballTo(new T.Vector3(-HALF_X-.55,.45,z),{dur:.75,height:.6,onDone:()=>{goals[-1].ripple=1;emit('net');emit('steal')}});teamParty('away',850)}
 else if(type==='saved'){const gk=actors['a-gk'];if(gk){emote(gk,'jump',1);ballTo(gk.root.position.clone().add(new T.Vector3(-.4,.9,0)),{dur:.5,height:.4,onDone:()=>emit('catch')})}}
 else if(type==='safe'||type==='keep')emit('cheer');
}
function kickOut(){
 const u=userActor();if(!u)return;clearCue();emote(u,'kick',.4);later(150,()=>emit('kick',{power:1}));later(500,()=>emit('out'));
 const side=u.root.position.z>0?1:-1,to=new T.Vector3(clamp(u.root.position.x+5,-8,9.5),2.6,side*(FLOOR_Z+2.5));
 ballTo(to,{dur:1.1,height:2.2,delay:.15,onDone:()=>{ball.mesh.visible=false}});
}

/* ---------- câmeras ---------- */
function camGoal(){
 const aspect=camera.aspect||1.6;
 if(camMode==='pov'&&current){
  const u=userActor(),at=u?u.root.position:layout(current).players[current.user.id];
  // olha entre o gol rival e o lugar da jogada (bola ou alvo), para a criança ver para onde jogar
  const toGoal=new T.Vector3(HALF_X,0,0).sub(at).setY(0).normalize(),focus=(targetPoint(current)||ball.mesh.position.clone()).setY(0).sub(at);
  const dir=focus.length()>1.5?toGoal.multiplyScalar(.4).add(focus.normalize().multiplyScalar(.6)).normalize():toGoal;
  return {pos:at.clone().sub(dir.clone().multiplyScalar(4.2)).setY(3.3),look:at.clone().add(dir.multiplyScalar(4.5)).setY(.2),fov:aspect<1?66:54};
 }
 const fov=34,elev=54*Math.PI/180,v=Math.tan(fov*Math.PI/360),h=v*aspect;
 const d=Math.max(10.2/h,6.1/v);
 const look=new T.Vector3(0,0,.55);
 return {pos:look.clone().add(new T.Vector3(0,Math.sin(elev)*d,Math.cos(elev)*d)),look,fov};
}

/* ---------- animação ---------- */
function animateActor(a,dt,time){
 const r=a.root,b=a.body;
 if(a.move){a.move.t+=dt/a.move.dur;const k=Math.min(1,a.move.t);r.position.lerpVectors(a.move.from,a.move.to,ease(k));if(k>=1)a.move=null}
 const moving=!!a.move;a.phase+=dt*(moving?14:3.2);
 let face=null;if(moving)face=a.move.to.clone().sub(a.move.from);else if(a.lookAt)face=a.lookAt.clone().sub(r.position);
 if(face&&face.x*face.x+face.z*face.z>.01)r.rotation.y=lerpAngle(r.rotation.y,Math.atan2(face.x,face.z),1-Math.exp(-dt*9));
 const [legL,legR]=a.legs,[armL,armR]=a.arms,s=Math.sin(a.phase);
 let ly=0,lx=0,rx=0,alx=0,arx=0,alz=-.15,arz=.15,tilt=0,side=0,bob=0;
 if(moving){lx=s*.9;rx=-s*.9;alx=-s*.8;arx=s*.8;bob=Math.abs(s)*.08;tilt=.14}
 else{bob=Math.sin(a.phase)*.018;alx=Math.sin(a.phase*.8)*.06;arx=-alx;if(a.keeper){alz=-.95;arz=.95;bob-=.03;lx=-.12;rx=-.12}}
 if(a.emote){const e=a.emote;e.t+=dt;const k=Math.min(1,e.t/e.dur);
  if(e.type==='jump'){bob=Math.abs(Math.sin(e.t*Math.PI*2.6))*.38*(1-k*.6);alz=-2.7;arz=2.7;alx=arx=0}
  else if(e.type==='kick'){rx=-Math.sin(k*Math.PI)*1.5;arz=.7;alz=-.7;tilt=-.1}
  else if(e.type==='trip'){const fall=k<.12?ease(k/.12):k<.72?1:1-ease((k-.72)/.28);tilt=fall*1.42;lx=rx=-fall*.4;alx=arx=-fall*2.6;
   const hy=(1.35*Math.cos(tilt)+.25)*ACTOR,hz=1.35*Math.sin(tilt)*ACTOR;
   stars.forEach((st,i)=>{st.visible=k>.1&&k<.75;const ang=time*5+i*2.1,local=new T.Vector3(Math.cos(ang)*.5,hy+.2,hz+Math.sin(ang)*.5).applyAxisAngle(new T.Vector3(0,1,0),r.rotation.y);st.position.copy(r.position).add(local);st.rotation.y=time*6})}
  else if(e.type==='diveL'||e.type==='diveR'){const dir=e.type==='diveL'?-1:1,f=k<.3?ease(k/.3):k<.7?1:1-ease((k-.7)/.3);side=dir*f*1.25;bob=f*.25;alz=-2.6;arz=2.6}
  if(e.t>=e.dur){if(e.type==='trip')stars.forEach(st=>st.visible=false);a.emote=null}}
 const kk=1-Math.exp(-dt*18);
 legL.rotation.x+=(lx-legL.rotation.x)*kk;legR.rotation.x+=(rx-legR.rotation.x)*kk;
 armL.rotation.x+=(alx-armL.rotation.x)*kk;armR.rotation.x+=(arx-armR.rotation.x)*kk;
 armL.rotation.z+=(alz-armL.rotation.z)*kk;armR.rotation.z+=(arz-armR.rotation.z)*kk;
 b.rotation.x+=(tilt-b.rotation.x)*kk;b.rotation.z+=(side-b.rotation.z)*kk;b.position.y+=(bob+ly-b.position.y)*Math.min(1,kk*1.6);
 const blink=(time+a.phase*.3)%3.7<.12?.15:1;a.eyes.forEach(e=>e.scale.y=blink);
 if(a.label.visible){a.label.position.y=(a.isUser?2.1:1.95)+(a.isUser?Math.sin(time*4)*.06:0)}
 animateFace(a,dt,time);
}
let elapsed=0;
function tick(){
 requestAnimationFrame(tick);
 const dt=Math.min(.05,clock.getDelta());
 if(!mounted||document.hidden||!container||!container.offsetWidth)return;
 step(dt);renderer.render(scene,camera);
}
function step(dt){
 elapsed+=dt;const time=elapsed;
 Object.values(actors).forEach(a=>{if(a.root.visible)animateActor(a,dt,time)});
 if(coach){coach.phase=(coach.phase||0)+dt;const w=Math.sin(time*.7)>.6;coach.arms[1].rotation.z+=((w?2.5+Math.sin(time*9)*.35:.15)-coach.arms[1].rotation.z)*.15;coach.body.position.y=Math.sin(time*2.4)*.02;coach.head.rotation.y=Math.sin(time*.5)*.35}
 crowd.forEach(c=>{const s=Math.sin(time*3+c.phase);c.g.position.y=c.base+Math.max(0,s)*.08;if(c.waver){const w=Math.sin(time*6+c.phase)*.35;c.arms[0].rotation.z=.45+w;c.arms[1].rotation.z=-.45-w}else{c.arms[0].rotation.z=2.7;c.arms[1].rotation.z=-2.7}});
 // bola
 const bm=ball.mesh;
 if(ball.follow){const f=ball.follow.root,dir=new T.Vector3(Math.sin(f.rotation.y),0,Math.cos(f.rotation.y));const target=f.position.clone().add(dir.multiplyScalar(.55)).setY(BALL_R+Math.abs(Math.sin(time*9))*.05);const prev=bm.position.clone();bm.position.lerp(target,.35);const mv=bm.position.clone().sub(prev);bm.rotation.x+=mv.z/BALL_R;bm.rotation.z-=mv.x/BALL_R}
 else if(ball.tween){const tw=ball.tween;tw.t+=dt;if(tw.t>=0){const k=Math.min(1,tw.t/tw.dur),prev=bm.position.clone();bm.position.lerpVectors(tw.from,tw.to,k);bm.position.y+=Math.sin(k*Math.PI)*tw.height;const mv=bm.position.clone().sub(prev);bm.rotation.x+=mv.z/BALL_R;bm.rotation.z-=mv.x/BALL_R;if(k>=1){ball.tween=null;if(tw.onDone)tw.onDone()}}}
 ball.marker.visible=bm.visible;ball.marker.position.set(bm.position.x,.016,bm.position.z);const bs=1+Math.sin(time*6)*.1;ball.marker.scale.set(bs,bs,1);
 // rede balançando
 Object.values(goals).forEach(g=>{if(g.ripple>0){g.ripple=Math.max(0,g.ripple-dt*1.4);g.back.position.x=GOAL_D+Math.sin(g.ripple*20)*g.ripple*.18}});
 // anel do jogador
 const u=userActor();if(u){userRing.visible=true;userRing.position.set(u.root.position.x,0,u.root.position.z);const pl=ACTOR*(1+Math.sin(time*4)*.06);userRing.scale.set(pl,1,pl)}else userRing.visible=false;
 Object.values(actors).forEach(a=>{a.label.visible=a.root.visible&&!(camMode==='pov'&&(a.isUser||a.root.position.distanceTo(camera.position)<4.2));const ls=camMode==='pov'?.6:1;a.label.scale.set(a.labelW*ls,a.labelH*ls,1)});
 if(cueGroup){cueGroup.userData.tex.offset.x-=dt*1.6;const s=1+Math.sin(time*5)*.12;cueGroup.userData.ring.scale.set(s,s,s)}
 confetti.forEach(c=>{if(c.life<=0)return;c.life-=dt;c.v.y-=7*dt;c.v.multiplyScalar(.985);c.m.position.addScaledVector(c.v,dt);c.m.rotation.x+=c.spin.x*dt;c.m.rotation.y+=c.spin.y*dt;if(c.m.position.y<.02){c.m.position.y=.02;c.v.set(0,0,0)}if(c.life<=0)c.m.visible=false});
 // câmera suave
 const goal=camGoal(),k=1-Math.exp(-dt*3.2);cam.pos.lerp(goal.pos,k);cam.look.lerp(goal.look,k);cam.fov+=(goal.fov-cam.fov)*k;
 camera.position.copy(cam.pos);if(shake>0){shake=Math.max(0,shake-dt);camera.position.x+=(Math.random()-.5)*shake*.5;camera.position.y+=(Math.random()-.5)*shake*.5}
 camera.lookAt(cam.look);if(Math.abs(camera.fov-cam.fov)>.01){camera.fov=cam.fov;camera.updateProjectionMatrix()}
}
function resize(){if(!container)return;const w=container.clientWidth||1,h=container.clientHeight||1;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}

function mount(box){
 if(!renderer){build();requestAnimationFrame(tick)}
 if(container!==box||renderer.domElement.parentNode!==box){container=box;box.innerHTML='';box.appendChild(renderer.domElement);
  if(ro)ro.disconnect();if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe(box)}else window.addEventListener('resize',resize)}
 mounted=true;resize();
}
/* ---------- tela inicial: ilha 3D com o time de bichinhos ---------- */
let hero=null;
function heroMount(box){
 if(hero){if(hero.r.domElement.parentNode!==box){box.innerHTML='';box.appendChild(hero.r.domElement)}return}
 const r=new T.WebGLRenderer({antialias:true,alpha:true});r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));r.outputEncoding=T.sRGBEncoding;
 r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.setClearColor(0x000000,0);r.domElement.style.cssText='display:block;width:100%;height:100%';
 const hs=new T.Scene(),cam=new T.PerspectiveCamera(30,1,.1,120);
 hs.add(new T.HemisphereLight('#e6f6ff','#8a6440',.95));
 const sun=new T.DirectionalLight('#fff1d6',1.35);sun.position.set(-6,14,8);sun.castShadow=true;
 Object.assign(sun.shadow.camera,{left:-9,right:9,top:7,bottom:-7,near:1,far:40});sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-.0006;sun.shadow.normalBias=.02;hs.add(sun);
 // a quadra flutua como uma ilha, com as mesmas placas e traves do jogo
 hs.add(mesh(G.box,mat('#0b1524'),{y:-.53,sx:21.6,sy:1,sz:13.6,shadow:false}),mesh(G.box,mat('#1f6fd1'),{y:-1.05,sx:20.6,sy:.25,sz:12.6,shadow:false}));
 hs.add(mesh(new T.PlaneGeometry(FLOOR_X*2,FLOOR_Z*2),new T.MeshStandardMaterial({map:floorTexture(),roughness:.55}),{rx:-Math.PI/2,shadow:false}));
 if(!ballTex)ballTex=ballTexture();
 const prevScene=scene,prevGoals=goals;scene=hs;goals={};buildBoards();buildGoals();scene=prevScene;goals=prevGoals;
 
 const cast=[
  {id:'h-ala1',num:'7',x:0,z:.4,ry:.35,act:'juggle'},
  {id:'h-pivo',num:'9',x:2.3,z:-1.5,ry:-.45,act:'jump'},
  {id:'h-ala2',num:'11',x:-2.4,z:-1.3,ry:.5,act:'cheer'},
  {id:'h-fixo',num:'4',x:-1.9,z:2,ry:.2,act:'wave'},
  {id:'h-gk',num:'1',x:2,z:2,ry:-.3,act:'ready',keeper:true}
 ].map(o=>{const a=buildAnimal(SPECIES[o.id],{num:o.num,style:o.keeper?KITS.homeGK:KITS.home});a.root.position.set(o.x,0,o.z);a.root.rotation.y=o.ry;a.root.scale.setScalar(ACTOR);hs.add(a.root);return {...a,...o,seed:Math.random()*6}});
 const coachA=buildAnimal({fur:'#a8754a',muzzle:'#7d5233',ear:'round',inner:'#7d5233',snout:'big'},{kit:'#ffffff',shorts:C.navy,shoe:C.navy,cap:C.navy});
 coachA.root.position.set(4.3,0,.7);coachA.root.rotation.y=-.55;coachA.root.scale.setScalar(ACTOR*1.12);hs.add(coachA.root);cast.push({...coachA,act:'coach',seed:1});
 const heroBall=mesh(new T.SphereGeometry(BALL_R,28,20),new T.MeshStandardMaterial({map:ballTex,roughness:.45}));hs.add(heroBall);
 const clk=new T.Clock();let t=0;
 function pose(a,t){
  const s=Math.sin(t*3+a.seed),[lL,lR]=a.legs,[aL,aR]=a.arms;let bob=Math.abs(s)*.03,alz=-.15,arz=.15,alx=0,arx=0,lx=0,rx=0,happy=false;
  if(a.act==='juggle'){const k=(t%1)/1;rx=k<.18?-Math.sin(k/.18*Math.PI)*1.1:0;alz=-.6;arz=.6;a.head.rotation.x=-.35*Math.sin(k*Math.PI)}
  else if(a.act==='jump'){const j=Math.abs(Math.sin(t*3.4+a.seed));bob=j*.45;alz=-2.7;arz=2.7;lx=rx=-j*.4;happy=true}
  else if(a.act==='cheer'){bob=Math.abs(Math.sin(t*5))*.12;alz=-2.4-Math.sin(t*7)*.3;arz=2.4+Math.sin(t*7+1)*.3;happy=true}
  else if(a.act==='wave'||a.act==='coach'){arz=2.5+Math.sin(t*(a.act==='coach'?6:8))*.4;a.head.rotation.z=Math.sin(t*2)*.08}
  else if(a.act==='ready'){bob=-.04+Math.sin(t*2.4)*.02;alz=-.95;arz=.95;lx=rx=-.12;a.root.position.x=2+Math.sin(t*1.6)*.25}
  a.body.position.y=bob;lL.rotation.x=lx;lR.rotation.x=rx;aL.rotation.z=alz;aR.rotation.z=arz;aL.rotation.x=alx;aR.rotation.x=arx;
  const blink=(t+a.seed)%3.4<.12?.15:1;a.eyes.forEach(e=>e.scale.y=blink);
  a.mouth.smile.visible=!happy;a.mouth.open.visible=happy;
  if(a.tail)a.tail.rotation.y=Math.sin(t*(happy?14:5)+a.seed)*(happy?.7:.35);
  const br=1+Math.sin(t*2.2+a.seed)*.02;a.torso.scale.set(1/Math.sqrt(br),br,1/Math.sqrt(br));
 }
 function fit(){const w=box.clientWidth||1,h=box.clientHeight||1;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
 function loop(){requestAnimationFrame(loop);const dt=Math.min(.05,clk.getDelta());if(document.hidden||!box.offsetWidth)return;t+=dt;
  cast.forEach(a=>pose(a,t));
  // o gato faz embaixadinhas
  const cat=cast[0],k=(t%1)/1,fw=new T.Vector3(Math.sin(cat.root.rotation.y),0,Math.cos(cat.root.rotation.y));
  heroBall.position.copy(cat.root.position).add(fw.multiplyScalar(.5)).setY(BALL_R+.35+Math.sin(k*Math.PI)*1.25);heroBall.rotation.x+=dt*6;heroBall.rotation.z+=dt*3;
  // câmera balança devagar em volta da quadra
  const v=Math.tan(cam.fov*Math.PI/360),hh=v*cam.aspect,d=Math.max(7.2/hh,4.1/v),yaw=Math.sin(t*.18)*.32,el=.58,look=new T.Vector3(.6,.55,.3);
  cam.position.set(look.x+Math.sin(yaw)*Math.cos(el)*d,look.y+Math.sin(el)*d,look.z+Math.cos(yaw)*Math.cos(el)*d);cam.lookAt(look);
  r.render(hs,cam)}
 box.innerHTML='';box.appendChild(r.domElement);fit();if(window.ResizeObserver)new ResizeObserver(fit).observe(box);else window.addEventListener('resize',fit);
 hero={r};requestAnimationFrame(loop);
}
window.Court3D={supported:true,hero:heroMount,mount,show,outcome,kickOut,finale,setScore,setCamera:m=>{camMode=m}};
})();
