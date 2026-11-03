/*
 * Quadra Quest — som do jogo
 * Tudo é gerado na hora com Web Audio (sem arquivos e sem internet):
 * uma música animada que acelera quando o tempo da jogada está acabando,
 * efeitos de chute, passe, gol, acerto, erro, tropeço, apito e torcida.
 * QQAudio.unlock() precisa ser chamado num toque do usuário (regra dos navegadores).
 */
(function(){
'use strict';
const AC=window.AudioContext||window.webkitAudioContext;
if(!AC){window.QQAudio={unlock(){},sfx(){},startMusic(){},stopMusic(){},setUrgency(){},setMuted(){},setMusic(){},get musicOn(){return false}};return}

let ctx=null,master,musicBus,sfxBus,noiseBuf,crowdGain=null,muted=false,musicOn=true;
try{musicOn=localStorage.getItem('quadraQuest.music')!=='off'}catch(e){}

function init(){
 if(ctx)return;
 ctx=new AC();
 const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(ctx.destination);
 master=ctx.createGain();master.gain.value=muted?0:.9;master.connect(comp);
 musicBus=ctx.createGain();musicBus.gain.value=0;musicBus.connect(master);
 sfxBus=ctx.createGain();sfxBus.gain.value=.85;sfxBus.connect(master);
 noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
}
const midi=n=>440*Math.pow(2,(n-69)/12);
const now=()=>ctx.currentTime;

/* ---------- peças básicas ---------- */
function env(g,t,a,peak,dur){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+dur)}
function tone(bus,{f,t=now(),dur=.15,type='sine',vol=.3,slide=null,attack=.005,filter=null,detune=0}){
 const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.detune.value=detune;
 if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);
 env(g,t,attack,vol,dur);
 let out=o;if(filter){const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=filter;o.connect(fl);out=fl}
 out.connect(g);g.connect(bus);o.start(t);o.stop(t+dur+.05);return o;
}
function noise(bus,{t=now(),dur=.1,vol=.3,type='bandpass',f=1000,q=1,sweep=null,attack=.003}){
 const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf;s.loop=true;
 fl.type=type;fl.frequency.setValueAtTime(f,t);fl.Q.value=q;if(sweep)fl.frequency.exponentialRampToValueAtTime(sweep,t+dur);
 env(g,t,attack,vol,dur);s.connect(fl);fl.connect(g);g.connect(bus);s.start(t,Math.random()*.5);s.stop(t+dur+.05);
}
// marimba: fundamental suave + brilho curto no ataque — combina com o público infantil
function mallet(bus,n,t,vol=.22,dur=.32){tone(bus,{f:midi(n),t,dur,type:'sine',vol});tone(bus,{f:midi(n)*4,t,dur:.05,type:'sine',vol:vol*.35})}

/* ---------- efeitos ---------- */
const SFX={
 tap(){tone(sfxBus,{f:520,slide:880,dur:.08,vol:.18,type:'sine'})},
 kick(o={}){const t=now(),p=o.power||.6;tone(sfxBus,{f:150,slide:48,t,dur:.16,vol:.55*p+.2});noise(sfxBus,{t,dur:.05,vol:.25,f:2500,q:.8});noise(sfxBus,{t:t+.03,dur:.28,vol:.08+.1*p,f:600,sweep:2400,q:1.2})},
 catch(){const t=now();tone(sfxBus,{f:110,slide:70,t,dur:.12,vol:.35});noise(sfxBus,{t,dur:.04,vol:.12,f:1800})},
 run(){const t=now();for(let i=0;i<5;i++)noise(sfxBus,{t:t+i*.11,dur:.05,vol:.09,f:900+Math.random()*300,q:2})},
 whoosh(){noise(sfxBus,{dur:.35,vol:.18,f:300,sweep:2600,q:1.5})},
 correct(){const t=now();[72,76,79,84].forEach((n,i)=>mallet(sfxBus,n,t+i*.07,.26,.45));[96,100,103].forEach((n,i)=>tone(sfxBus,{f:midi(n),t:t+.3+i*.05,dur:.18,vol:.05,type:'triangle'}))},
 wrong(){const t=now();tone(sfxBus,{f:392,slide:370,t,dur:.22,type:'triangle',vol:.22});tone(sfxBus,{f:330,slide:262,t:t+.24,dur:.45,type:'triangle',vol:.22})},
 trip(){const t=now(),o=tone(sfxBus,{f:180,t,dur:.55,type:'sine',vol:.3});const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=18;lg.gain.value=70;lfo.connect(lg);lg.connect(o.frequency);o.frequency.linearRampToValueAtTime(420,t+.55);lfo.start(t);lfo.stop(t+.6);
  [0,1,2].forEach(i=>tone(sfxBus,{f:midi(95+i*2),t:t+.35+i*.12,dur:.12,vol:.05,type:'sine'}))},
 steal(){const t=now();noise(sfxBus,{t,dur:.25,vol:.12,f:1500,sweep:400});tone(sfxBus,{f:midi(67),t:t+.05,dur:.14,type:'triangle',vol:.14});tone(sfxBus,{f:midi(63),t:t+.2,dur:.26,type:'triangle',vol:.14})},
 whistle(o={}){const t=now(),len=o.long?.55:.22;const w=tone(sfxBus,{f:2850,t,dur:len,type:'square',vol:.06,filter:4200,attack:.01});const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=32;lg.gain.value=110;lfo.connect(lg);lg.connect(w.frequency);lfo.start(t);lfo.stop(t+len+.05);
  if(o.double){const w2=tone(sfxBus,{f:2850,t:t+len+.08,dur:len,type:'square',vol:.06,filter:4200,attack:.01});const l2=ctx.createOscillator(),g2=ctx.createGain();l2.frequency.value=32;g2.gain.value=110;l2.connect(g2);g2.connect(w2.frequency);l2.start(t+len+.08);l2.stop(t+len*2+.15)}},
 tick(o={}){tone(sfxBus,{f:o.urgent?1500:1150,dur:.05,vol:o.urgent?.2:.13,type:'sine'});tone(sfxBus,{f:o.urgent?3000:2300,dur:.02,vol:.05,type:'square',filter:5000})},
 cheer(o={}){const t=now(),len=o.big?2.2:1.3;noise(sfxBus,{t,dur:len,vol:o.big?.16:.09,f:1100,q:.6,attack:.25});noise(sfxBus,{t:t+.05,dur:len*.8,vol:o.big?.08:.05,f:2400,q:.8,attack:.3});
  for(let i=0;i<(o.big?10:5);i++)noise(sfxBus,{t:t+.1+Math.random()*len*.6,dur:.03,vol:.06,f:3000,q:3})},
 goal(){const t=now();SFX.whistle({double:true});SFX.cheer({big:true});[60,64,67,72,76].forEach((n,i)=>mallet(sfxBus,n,t+.15+i*.09,.24,.5));tone(sfxBus,{f:110,slide:60,t,dur:.3,vol:.4})},
 net(){noise(sfxBus,{dur:.3,vol:.14,f:700,sweep:300,q:.7})},
 dive(){noise(sfxBus,{dur:.3,vol:.12,f:500,sweep:1800});tone(sfxBus,{f:90,slide:55,t:now()+.25,dur:.15,vol:.3})},
 out(){const t=now();tone(sfxBus,{f:midi(76),slide:midi(64),t:t+.1,dur:.5,type:'triangle',vol:.16});SFX.whistle({long:true})},
 sparkle(){const t=now();for(let i=0;i<6;i++)tone(sfxBus,{f:midi(88+Math.floor(Math.random()*10)),t:t+i*.06,dur:.1,vol:.04,type:'sine'})},
 start(){SFX.whistle({});},
 fanfare(){const t=now(),seq=[[60,64,67],[60,64,67],[60,64,67],[65,69,72],[67,71,74],[72,76,79]],at=[0,.14,.28,.5,.8,1.1],len=[.12,.12,.2,.28,.28,.9];
  seq.forEach((ch,i)=>ch.forEach(n=>{tone(sfxBus,{f:midi(n),t:t+at[i],dur:len[i],type:'sawtooth',vol:.06,filter:2400,attack:.02});mallet(sfxBus,n+12,t+at[i],.08,len[i])}));SFX.cheer({big:true})}
};

/* ---------- música de fundo ---------- */
// I–vi–IV–V em Dó maior, 4 compassos de 16 semicolcheias; acelera com a "pressa".
const CHORDS=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]],ROOTS=[48,45,41,43];
const MELODY=[
 72,null,76,79, 81,79,76,null,
 76,null,72,76, 74,72,69,null,
 77,null,81,84, 81,79,77,null,
 79,81,79,77, 74,76,79,null];
const ALARM=[84,null,83,null,84,null,86,null];
let playing=false,step=0,nextTime=0,schedTimer=null,urgency=0,tempo=120,duck=1;
function drumKick(t,v=.5){tone(musicBus,{f:140,slide:45,t,dur:.18,vol:v})}
function drumSnare(t,v=.22){noise(musicBus,{t,dur:.14,vol:v,f:1800,q:.7});tone(musicBus,{f:210,slide:160,t,dur:.08,vol:v*.6,type:'triangle'})}
function drumHat(t,v=.06){noise(musicBus,{t,dur:.03,vol:v,type:'highpass',f:7000,q:.5})}
function playStep(s,t){
 const bar=Math.floor(s/16),i=s%16,spb=60/tempo/4,u=urgency;
 // bateria
 if(i%4===0)drumKick(t,.42);
 if(i===4||i===12)drumSnare(t);
 if(bar===3&&i>=12&&u>.3)drumSnare(t,.12+i*.006);
 if(i%2===0||u>.45)drumHat(t,i%2?.035:.06);
 // baixo saltitante
 if(i%2===0){const n=ROOTS[bar]+(i%4===2?12:0);tone(musicBus,{f:midi(n),t,dur:spb*1.6,type:'triangle',vol:.3,filter:900})}
 // acordes no contratempo
 if(i%4===2)CHORDS[bar].forEach(n=>tone(musicBus,{f:midi(n),t,dur:spb*1.3,type:'square',vol:.035,filter:1800}));
 // melodia de marimba
 if(i%2===0){const n=MELODY[bar*8+i/2];if(n)mallet(musicBus,n,t,.16,spb*3)}
 // "alarme" divertido nos últimos segundos
 if(u>.72&&i%2===0){const n=ALARM[(i/2)%8];if(n)tone(musicBus,{f:midi(n+12),t,dur:spb*.9,type:'square',vol:.03,filter:3000})}
}
function scheduler(){
 if(!playing)return;
 const target=120+urgency*36;
 while(nextTime<now()+.14){playStep(step,nextTime);tempo+=(target-tempo)*.08;nextTime+=60/tempo/4;step=(step+1)%64}
 // abaixa a música enquanto o técnico fala
 const speaking=!!window.QQVoiceSpeaking||('speechSynthesis'in window&&speechSynthesis.speaking),want=(musicOn?1:0)*(speaking?.4:1)*.5;
 if(Math.abs(want-duck)>.01){duck=want;musicBus.gain.cancelScheduledValues(now());musicBus.gain.setTargetAtTime(want,now(),.18)}
}

/* ---------- torcida ambiente ---------- */
function startCrowd(){if(crowdGain)return;const s=ctx.createBufferSource(),f=ctx.createBiquadFilter();s.buffer=noiseBuf;s.loop=true;f.type='bandpass';f.frequency.value=900;f.Q.value=.5;crowdGain=ctx.createGain();crowdGain.gain.value=0;s.connect(f);f.connect(crowdGain);crowdGain.connect(sfxBus);s.start();crowdGain.gain.setTargetAtTime(.025,now(),1)}
function stopCrowd(){if(crowdGain)crowdGain.gain.setTargetAtTime(0,now(),.4)}

window.QQAudio={
 unlock(){init();if(ctx.state==='suspended')ctx.resume()},
 sfx(name,o){if(!ctx||muted||!SFX[name])return;try{SFX[name](o||{})}catch(e){}},
 startMusic(){init();startCrowd();if(crowdGain)crowdGain.gain.setTargetAtTime(.025,now(),1);if(playing)return;playing=true;step=0;tempo=120;duck=-1;nextTime=now()+.08;schedTimer=setInterval(scheduler,25);scheduler()},
 stopMusic(){if(!ctx)return;playing=false;clearInterval(schedTimer);musicBus.gain.setTargetAtTime(0,now(),.15);stopCrowd()},
 setUrgency(u){urgency=Math.max(0,Math.min(1,u))},
 setMuted(m){muted=m;if(ctx)master.gain.setTargetAtTime(m?0:.9,now(),.05)},
 setMusic(on){musicOn=on;duck=-1;try{localStorage.setItem('quadraQuest.music',on?'on':'off')}catch(e){}},
 get musicOn(){return musicOn}
};
})();
