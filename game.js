'use strict';
/* Jimothy Timothy and the Hair Mob - original synthesized "cartoon mob" swing score + SFX (WebAudio, no samples).
   Music bus runs at HALF the usual level (0.21), same as the other Jimothy games. */
const AU=(function(){
const A={ctx:null,muted:false,cur:null,next:0,step:0,timer:null,song:null};
const mf=m=>440*Math.pow(2,(m-69)/12);
function imp(c,sec,dec){const r=c.sampleRate,n=r*sec|0,b=c.createBuffer(2,n,r);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,dec)}return b}
A.MUSIC_GAIN=0.21;
A.init=function(){if(this.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=this.ctx=new C();
 this.master=c.createGain();this.master.gain.value=this.muted?0:0.8;const comp=c.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=3.5;
 this.master.connect(comp);comp.connect(c.destination);
 this.rev=c.createConvolver();this.rev.buffer=imp(c,1.6,2.8);const rg=c.createGain();rg.gain.value=0.2;this.rev.connect(rg);rg.connect(this.master);
 this.mus=c.createGain();this.mus.gain.value=A.MUSIC_GAIN;this.mus.connect(this.master);const mr=c.createGain();mr.gain.value=0.45;this.mus.connect(mr);mr.connect(this.rev);
 this.sfx=c.createGain();this.sfx.gain.value=0.8;this.sfx.connect(this.master);
 const n=c.sampleRate;this.noise=c.createBuffer(1,n,n);const d=this.noise.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}catch(e){this.ctx=null}};
A.unlock=function(){this.init();if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume().catch(()=>{})};
A.setMuted=function(m){this.muted=m;if(this.master)this.master.gain.setTargetAtTime(m?0:0.8,this.ctx.currentTime,0.05)};
function env(g,t,a,peak,d){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d)}
function osc(type,f,t,dur,peak,out,a=0.004){const c=A.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);env(g,t,a,peak,dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+a+dur+0.05);return o}
/* voices: upright bass, piano comp, muted "trumpet", vibes, clarinet */
function upright(m,t,d,v,out){const c=A.ctx,o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o.type='triangle';o.frequency.value=mf(m);fl.type='lowpass';fl.frequency.value=600;env(g,t,0.006,0.5*v,d);o.connect(fl);fl.connect(g);g.connect(out);o.start(t);o.stop(t+d+0.1);osc('sine',mf(m),t,d*0.6,0.25*v,out,0.004)}
function piano(m,t,v,out){const f=mf(m);osc('triangle',f,t,0.35,0.09*v,out,0.003);osc('sine',f*2,t,0.18,0.04*v,out,0.003)}
function horn(m,t,d,v,out){const c=A.ctx,o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter(),lfo=c.createOscillator(),lg=c.createGain();o.type='square';o.frequency.value=mf(m);
 lfo.frequency.value=5.5;lg.gain.value=4;lfo.connect(lg);lg.connect(o.detune);fl.type='bandpass';fl.frequency.value=1100;fl.Q.value=1.6;
 g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.11*v,t+0.03);g.gain.setValueAtTime(0.11*v,t+d*0.7);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
 o.connect(fl);fl.connect(g);g.connect(out);o.start(t);lfo.start(t);o.stop(t+d+0.05);lfo.stop(t+d+0.05)}
function vibes(m,t,v,out){const f=mf(m);osc('sine',f,t,0.8,0.16*v,out,0.002);osc('sine',f*4,t,0.06,0.04*v,out)}
function clar(m,t,d,v,out){const c=A.ctx,o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o.type='square';o.frequency.value=mf(m);fl.type='lowpass';fl.frequency.value=1400;
 g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.07*v,t+0.05);g.gain.linearRampToValueAtTime(0.0001,t+d);o.connect(fl);fl.connect(g);g.connect(out);o.start(t);o.stop(t+d+0.05)}
function drum(t,f0,f1,d,v,out){const c=A.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(g,t,0.002,0.6*v,d);o.connect(g);g.connect(out);o.start(t);o.stop(t+d+0.05)}
function nz(t,d,v,fq,type,out,q=1){const c=A.ctx,s=c.createBufferSource(),g=c.createGain(),fl=c.createBiquadFilter();s.buffer=A.noise;fl.type=type||'highpass';fl.frequency.value=fq||6000;fl.Q.value=q;env(g,t,0.002,v,d);s.connect(fl);fl.connect(g);g.connect(out);s.start(t,Math.random()*0.5);s.stop(t+d+0.05)}
/* songs: bpm, root, 4 chords (7th chords as offsets), seed for the lead, lead voice, groove */
const SONGS={
 title:{bpm:132,root:57,ch:[[0,3,7,10],[5,8,12,15],[-2,2,5,9],[-5,-1,2,7]],seed:5,lead:'horn',gr:'swing'},
 w1:{bpm:140,root:60,ch:[[0,4,7,9],[-3,0,4,7],[2,5,9,12],[-5,-1,2,5]],seed:12,lead:'clar',gr:'swing'},
 w2:{bpm:150,root:58,ch:[[0,4,7,10],[5,9,12,15],[0,4,7,10],[-5,-1,2,5]],seed:27,lead:'horn',gr:'swing'},
 w3:{bpm:118,root:62,ch:[[0,4,7,11],[2,5,9,12],[-1,2,5,9],[0,4,7,11]],seed:33,lead:'vibes',gr:'chacha'},
 w4:{bpm:104,root:55,ch:[[0,3,7,10],[-2,2,5,9],[-4,0,3,7],[-5,-1,2,5]],seed:48,lead:'vibes',gr:'cool'},
 w5:{bpm:126,root:52,ch:[[0,3,7,10],[-4,0,3,7],[-2,2,5,9],[-5,-2,2,5]],seed:61,lead:'clar',gr:'swing'},
 drive:{bpm:156,root:59,ch:[[0,4,7,10],[0,4,7,10],[5,9,12,15],[7,11,14,17]],seed:73,lead:'horn',gr:'surf'},
 boss:{bpm:164,root:57,ch:[[0,3,7,10],[1,5,8,12],[0,3,7,10],[-1,3,6,9]],seed:89,lead:'horn',gr:'swing'},
 win:{bpm:128,root:60,ch:[[0,4,7,11],[5,9,12,16],[2,5,9,12],[7,11,14,17]],seed:9,lead:'vibes',gr:'swing'}};
function rngS(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function mkLead(S){const r=rngS(S.seed),bars=[];const sc=[0,2,3,5,7,9,10,12,14,15];for(let b=0;b<4;b++){const n=[];let p=3+(r()*3|0);for(let i=0;i<16;i++){const on=(i%4===0&&r()<0.85)||(i%2===0&&r()<0.4);if(on){p=Math.max(0,Math.min(9,p+((r()*5|0)-2)));n.push(sc[p])}else n.push(null)}bars.push(n)}return bars}
for(const k in SONGS)SONGS[k].mel=mkLead(SONGS[k]);
function tick(){const c=A.ctx;if(!c||!A.song)return;const S=A.song,sp=60/S.bpm/4;
 while(A.next<c.currentTime+0.15){let t=A.next;const i=A.step%16,bar=(A.step>>4)%4,ch=S.ch[bar],R=S.root,out=A.mus,big=(A.step>>6)%2;
  const swung=(S.gr==='swing'||S.gr==='cool')&&i%4===2;if(swung)t+=sp*0.34;
  /* walking bass on the beat */
  if(i%4===0){const walk=[ch[0],ch[1],ch[2],ch[1]+(bar%2?2:-1)];upright(R-24+walk[i>>2],t,sp*3.4,1,out)}
  if(S.gr==='surf'&&i%2===0&&i%4!==0)upright(R-24+ch[0]+12,t,sp*1.4,0.6,out);
  /* comping */
  if(S.gr==='swing'&&(i===4||i===10||i===12&&bar%2)){for(const n of ch)piano(R+n,t,0.9,out)}
  if(S.gr==='cool'&&i===0)for(const n of ch)piano(R+n,t,0.7,out);
  if(S.gr==='chacha'&&(i===0||i===6||i===8||i===10)){for(const n of ch)piano(R+n+12,t,0.8,out)}
  if(S.gr==='surf'&&(i%4===2)){for(const n of ch)piano(R+n,t,0.7,out)}
  /* lead */
  const m=S.mel[bar][i];if(m!==null&&(S.gr!=='cool'||i%4===0)){const mm=R+12+m;if(S.lead==='horn')horn(mm,t,sp*(big?1.8:1.2),1,out);else if(S.lead==='clar')clar(mm,t,sp*1.8,1,out);else vibes(mm,t,0.9,out);if(big&&i%8===0&&S.lead!=='vibes')vibes(mm+12,t+sp*0.5,0.4,out)}
  /* drums: ride, brush snare, kick */
  if(S.gr==='swing'||S.gr==='cool'){if(i%4===0||i%4===2)nz(t,0.05,i%8===0?0.05:0.08,7500,'highpass',out);if(i===4||i===12)nz(t,0.12,S.gr==='cool'?0.05:0.12,2500,'bandpass',out,0.7);if(i===0||i===8&&S.gr==='swing')drum(t,110,48,0.22,0.6,out)}
  else if(S.gr==='chacha'){if(i%2===0)nz(t,0.04,0.05,8000,'highpass',out);if(i===0||i===8)drum(t,120,50,0.2,0.7,out);if(i===6||i===14||i===12)drum(t,420,300,0.07,0.4,out)}
  else if(S.gr==='surf'){nz(t,0.03,i%2?0.04:0.08,8000,'highpass',out);if(i%8===0)drum(t,120,45,0.2,0.9,out);if(i===4||i===12)nz(t,0.12,0.18,2200,'bandpass',out,0.8)}
  A.next+=sp;A.step++}}
A.music=function(name){this.init();if(!this.ctx)return;if(this.cur===name)return;this.cur=name;this.song=SONGS[name]||null;this.step=0;this.next=this.ctx.currentTime+0.08;
 if(!this.timer)this.timer=setInterval(tick,40)};
A.stop=function(){this.cur=null;this.song=null};
const FX={
 jump(t,o){osc('square',360,t,0.09,0.07,o).frequency.exponentialRampToValueAtTime(720,t+0.09)},
 land(t,o){drum(t,120,60,0.08,0.3,o)},
 boing(t,o){osc('sine',200,t,0.25,0.25,o).frequency.exponentialRampToValueAtTime(600,t+0.2)},
 curl(t,o){vibes(91,t,0.8,o);vibes(96,t+0.05,0.6,o)},
 cap(t,o){[84,88,91,96,100].forEach((m,i)=>vibes(m,t+i*0.06,0.9,o))},
 bag(t,o){[72,76,79,84].forEach((m,i)=>piano(m,t+i*0.05,2.4,o))},
 pop(t,o){osc('sine',300,t,0.08,0.4,o).frequency.exponentialRampToValueAtTime(1200,t+0.06);nz(t,0.05,0.2,3000,'bandpass',o,2)},
 wiggle(t,o){for(let i=0;i<4;i++)osc('triangle',500+i*90,t+i*0.06,0.05,0.07,o)},
 giggle(t,o){for(let i=0;i<6;i++)osc('sine',900+(i%2)*260,t+i*0.07,0.05,0.09,o)},
 nope(t,o){osc('square',260,t,0.12,0.07,o);osc('square',200,t+0.13,0.16,0.07,o)},
 hurt(t,o){osc('square',300,t,0.22,0.1,o).frequency.exponentialRampToValueAtTime(110,t+0.22);nz(t,0.1,0.12,1500,'bandpass',o)},
 bump(t,o){drum(t,240,80,0.14,0.8,o);nz(t,0.08,0.15,1200,'bandpass',o)},
 clank(t,o){osc('square',880,t,0.06,0.06,o);osc('square',1320,t+0.01,0.08,0.04,o);drum(t,500,300,0.05,0.3,o)},
 splash(t,o){nz(t,0.35,0.25,1200,'lowpass',o)},
 spray(t,o){nz(t,0.5,0.15,4500,'bandpass',o,0.8)},
 poof(t,o){nz(t,0.4,0.35,900,'lowpass',o);osc('sine',180,t,0.3,0.3,o).frequency.exponentialRampToValueAtTime(60,t+0.3);[84,88,91].forEach((m,i)=>vibes(m,t+0.1+i*0.05,0.6,o))},
 sweep(t,o){nz(t,0.3,0.15,2200,'bandpass',o,0.6)},
 honk(t,o){osc('sawtooth',392,t,0.12,0.08,o);osc('sawtooth',494,t,0.12,0.06,o);osc('sawtooth',392,t+0.16,0.2,0.08,o);osc('sawtooth',494,t+0.16,0.2,0.06,o)},
 beep(t,o){osc('square',1000,t,0.08,0.06,o);osc('square',1000,t+0.18,0.08,0.06,o)},
 caw(t,o){const x=osc('sawtooth',700,t,0.18,0.1,o,0.01);x.frequency.exponentialRampToValueAtTime(420,t+0.18);nz(t,0.15,0.08,1800,'bandpass',o,2)},
 coo(t,o){osc('sine',420,t,0.12,0.18,o).frequency.exponentialRampToValueAtTime(330,t+0.12);osc('sine',420,t+0.16,0.16,0.15,o).frequency.exponentialRampToValueAtTime(300,t+0.3)},
 quack(t,o){for(let i=0;i<3;i++){const x=osc('sawtooth',380-i*20,t+i*0.12,0.08,0.1,o);x.frequency.exponentialRampToValueAtTime(250,t+i*0.12+0.08)}},
 meow(t,o){const x=osc('triangle',600,t,0.35,0.15,o,0.04);x.frequency.linearRampToValueAtTime(900,t+0.12);x.frequency.linearRampToValueAtTime(500,t+0.35)},
 purr(t,o){for(let i=0;i<8;i++)drum(t+i*0.05,60,40,0.04,0.3,o)},
 ching(t,o){nz(t,0.05,0.2,3000,'bandpass',o,2);[88,93,100].forEach((m,i)=>vibes(m,t+0.05+i*0.05,1,o))},
 wind(t,o){nz(t,1.2,0.12,500,'bandpass',o,0.6)},
 thunder(t,o){nz(t,1.2,0.35,200,'lowpass',o);drum(t,70,30,0.8,0.7,o)},
 charge(t,o){[72,79,84].forEach((m,i)=>vibes(m,t+i*0.05,0.6,o))},
 menu(t,o){vibes(84,t,0.5,o)},
 clear(t,o){[72,76,79,84,79,84,88].forEach((m,i)=>horn(m,t+i*0.1,0.12,1.2,o))},
 over(t,o){[67,63,60,55].forEach((m,i)=>horn(m,t+i*0.2,0.18,1,o))},
 life(t,o){[79,84,88,91,96].forEach((m,i)=>vibes(m,t+i*0.06,1,o))},
 bosshit(t,o){drum(t,300,90,0.2,0.9,o);[84,79].forEach((m,i)=>horn(m,t+0.05+i*0.1,0.1,1,o))}};
A.fx=function(n){if(typeof SIM!=='undefined'&&SIM||!this.ctx||this.muted)return;const f=FX[n];if(f)try{f(this.ctx.currentTime+0.005,this.sfx)}catch(e){}};
return A})();

/* ===== core: canvas, layout, input (swipe / keys / gamepad - no on-screen D-pad), art, helpers ===== */
const $=id=>document.getElementById(id);
const cv=$('cv'),c=cv.getContext('2d');
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a),sgn=v=>v<0?-1:1;
const TS=40,VH=400,GRAV=2200;
const QS=new URLSearchParams(location.search);
const SAVE_KEY='jthm_save';let save={};try{save=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch(e){save={}}
save.reached=save.reached||0;save.caps=save.caps||{};save.best=save.best||0;save.items=save.items||[];save.feather=!!save.feather;save.hints=save.hints!==false;
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){}}
AU.muted=!!save.muted;
let W=0,H=0,DPR=1,S=1,VV=400,viewW=800,gameH=400,portrait=false,SAFE={t:0,r:0,b:0,l:0};
let state='boot',G=null,frame=0,SIM=0;
function readSafe(){const p=$('sp');if(!p)return;const cs=getComputedStyle(p);SAFE={t:parseFloat(cs.paddingTop)||0,r:parseFloat(cs.paddingRight)||0,b:parseFloat(cs.paddingBottom)||0,l:parseFloat(cs.paddingLeft)||0}}
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);portrait=H>W*1.08;readSafe();
 if(portrait){const vw=clamp(W,380,470);S=W/vw;gameH=Math.round(H*0.62);VV=gameH/S}
 else{VV=VH;S=H/VH;gameH=H}
 viewW=W/S;layoutPad();document.body.classList.toggle('portrait',portrait)}
let PADR={act:null,jump:null};
function layoutPad(){const pad=$('pad'),ba=$('bAct'),bj=$('bJump'),hint=$('swipeHint');if(!pad)return;
 if(portrait){const top=gameH,ph=H-top;pad.style.top=top+'px';pad.style.height=ph+'px';
  const big=Math.round(clamp(ph*0.36,92,124)),sm=Math.round(big*0.84),bot=Math.round(clamp(ph*0.14,18,46))+SAFE.b;
  Object.assign(ba.style,{width:big+'px',height:big+'px',right:(16+SAFE.r)+'px',bottom:bot+'px'});
  Object.assign(bj.style,{width:sm+'px',height:sm+'px',right:(16+SAFE.r+big+14)+'px',bottom:(bot+big*0.42)+'px'});
  if(bot+big*0.42+sm>ph-8)bj.style.bottom=(ph-sm-8)+'px';
  hint.style.display='';Object.assign(hint.style,{top:'12px',left:(14+SAFE.l)+'px',right:'14px'})}
 else{pad.style.top='0';pad.style.height=H+'px';const big=Math.round(clamp(H*0.21,72,96)),sm=Math.round(big*0.82);
  Object.assign(ba.style,{width:big+'px',height:big+'px',right:(14+SAFE.r)+'px',bottom:(12+SAFE.b)+'px'});
  Object.assign(bj.style,{width:sm+'px',height:sm+'px',right:(14+SAFE.r+big+10)+'px',bottom:(12+SAFE.b+big*0.18)+'px'});
  hint.style.display='none'}
 requestAnimationFrame(()=>{const r=e=>{const b=e.getBoundingClientRect();return{x:b.left,y:b.top,w:b.width,h:b.height}};PADR.act=r(ba);PADR.jump=r(bj)})}
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,120));
if(window.visualViewport)visualViewport.addEventListener('resize',resize);
/* ---------- input ---------- */
const K={L:0,R:0,U:0,D:0,J:0,A:0,Y:0};const KP={J:0,A:0,Y:0};const VIRT={jump:0,act:0},VIRTP={jump:0,act:0};const TOUCH=new Map();let swipeJump=0;
const inp={L:0,R:0,U:0,D:0,jumpP:0,jump:0,actP:0,act:0,ramP:0};let lastJ=0,lastA=0,lastY=0;
const KEYMAP={ArrowLeft:'L',KeyA:'L',ArrowRight:'R',KeyD:'R',ArrowUp:'U',KeyW:'U',ArrowDown:'D',KeyS:'D',Space:'J',KeyZ:'J',KeyX:'A',KeyJ:'A',KeyC:'Y',KeyK:'Y'};
addEventListener('keydown',e=>{AU.unlock();if(e.target&&e.target.tagName==='INPUT')return;const k=KEYMAP[e.code];
 if(document.body.classList.contains('uiopen')){if(!e.repeat)uiKey(e);if(k||e.code==='Enter')e.preventDefault();return}
 if(k){if(!K[k]&&k in KP)KP[k]=1;K[k]=1;e.preventDefault()}
 if(e.code==='KeyP'||e.code==='Escape'){if(state==='play')pauseGame()}
 if(e.code==='KeyM')toggleMute()});
addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k)K[k]=0});
function swipeDir(t){const dx=t.x-t.ax,dy=t.y-t.ay,d=Math.hypot(dx,dy),o={};if(d<14)return o;if(d>44){t.ax=t.x-dx/d*44;t.ay=t.y-dy/d*44}
 const s=Math.round(Math.atan2(dy,dx)/(Math.PI/4));if(s===0||s===1||s===-1)o.R=1;if(s===4||s===-4||s===3||s===-3)o.L=1;if(s===2||s===1||s===3)o.D=1;if(s===-2||s===-1||s===-3)o.U=1;return o}
function tStart(id,x,y){AU.unlock();TOUCH.set(id,{x,y,ax:x,ay:y,z:{}})}
function tMove(id,x,y){const t=TOUCH.get(id);if(!t)return;t.x=x;t.y=y;const before=t.z.U;t.z=swipeDir(t);if(t.z.U&&!before)swipeJump=1}
function tEnd(id){TOUCH.delete(id)}
function clearInput(){TOUCH.clear();for(const k in K)K[k]=0;for(const k in KP)KP[k]=0;VIRT.jump=VIRT.act=VIRTP.jump=VIRTP.act=0;swipeJump=0;document.querySelectorAll('#pad .big.on').forEach(b=>b.classList.remove('on'))}
function bindSurface(el){el.addEventListener('touchstart',e=>{if(state!=='play')return;e.preventDefault();for(const t of e.changedTouches)tStart(t.identifier,t.clientX,t.clientY)},{passive:false});
 el.addEventListener('touchmove',e=>{if(state!=='play')return;e.preventDefault();for(const t of e.changedTouches)tMove(t.identifier,t.clientX,t.clientY)},{passive:false});
 el.addEventListener('touchend',e=>{for(const t of e.changedTouches)tEnd(t.identifier)},{passive:false});el.addEventListener('touchcancel',e=>{for(const t of e.changedTouches)tEnd(t.identifier)});
 let md=false;el.addEventListener('mousedown',e=>{if(state!=='play')return;md=true;tStart('m',e.clientX,e.clientY)});addEventListener('mousemove',e=>{if(md)tMove('m',e.clientX,e.clientY)});addEventListener('mouseup',()=>{if(md){md=false;tEnd('m')}})}
function bindBtn(el,k){const on=e=>{e.preventDefault();e.stopPropagation();AU.unlock();if(!VIRT[k])VIRTP[k]=1;VIRT[k]=1;el.classList.add('on')},off=e=>{e.preventDefault();e.stopPropagation();VIRT[k]=0;el.classList.remove('on')};
 el.addEventListener('touchstart',on,{passive:false});el.addEventListener('touchend',off,{passive:false});el.addEventListener('touchcancel',off,{passive:false});
 el.addEventListener('mousedown',on);el.addEventListener('mouseup',off);el.addEventListener('mouseleave',off);el.addEventListener('contextmenu',e=>e.preventDefault())}
addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(state==='play')pauseGame()}});
/* ---------- gamepad (standard mapping; USB or Bluetooth, desktop or phone) ---------- */
const GP={on:false,L:0,R:0,U:0,D:0,J:0,A:0,Y:0,id:'',prev:{}};let gpIdx=0,gpSeen=false;
function pollPad(){let pads=[];try{pads=navigator.getGamepads?navigator.getGamepads():[]}catch(e){}let p=null;for(const q of pads||[])if(q&&q.connected!==false&&q.buttons&&q.buttons.length){p=q;break}
 if(!p){if(GP.on){GP.on=false;toast('Controller disconnected')}GP.L=GP.R=GP.U=GP.D=GP.J=GP.A=GP.Y=0;return}
 if(!GP.on){GP.on=true;GP.id=p.id||'';if(!gpSeen){gpSeen=true}toast('🎮 Controller connected');refreshCtlHint()}
 const b=i=>!!(p.buttons[i]&&(p.buttons[i].pressed||p.buttons[i].value>0.5)),ax=i=>p.axes&&p.axes.length>i?p.axes[i]:0;
 const x=ax(0),y=ax(1);GP.L=b(14)||x<-0.4?1:0;GP.R=b(15)||x>0.4?1:0;GP.U=b(12)||y<-0.55?1:0;GP.D=b(13)||y>0.55?1:0;
 GP.J=b(0)?1:0;GP.A=(b(2)||b(1)||b(5)||b(7))?1:0;GP.Y=(b(3)||b(4)||b(6))?1:0;
 const now={st:b(9),bk:b(8),a:b(0),b:b(1),u:GP.U,d:GP.D,l:GP.L,r:GP.R},pr=GP.prev;const edge=k=>now[k]&&!pr[k];GP.prev=now;
 if(edge('st')){if(state==='play')pauseGame();else if(state==='pause')resumeGame()}
 if(edge('bk'))toggleMute();
 if(document.body.classList.contains('uiopen')){if(edge('u')||edge('l'))gpFocus(gpIdx-1);if(edge('d')||edge('r'))gpFocus(gpIdx+1);
  if(edge('a')){const t=document.querySelector('#ui .gpf')||document.querySelector('#ui [data-a]');if(t)t.click()}
  if(edge('b')){const bk=document.querySelector('#ui [data-a="back"],#ui [data-a="resume"]');if(bk)bk.click()}}}
addEventListener('gamepadconnected',()=>pollPad());
function gpFocus(i,ns){const bs=[...document.querySelectorAll('#ui [data-a]')];if(!bs.length)return;gpIdx=(i+bs.length)%bs.length;bs.forEach((b,j)=>b.classList.toggle('gpf',j===gpIdx));if(!ns){try{bs[gpIdx].scrollIntoView({block:'nearest'})}catch(e){}AU.fx('menu')}}
function uiKey(e){const nav={ArrowDown:1,ArrowRight:1,KeyS:1,KeyD:1,ArrowUp:-1,ArrowLeft:-1,KeyW:-1,KeyA:-1}[e.code];
 if(nav){gpFocus(gpIdx+(document.querySelector('#ui .gpf')?nav:0))}
 else if(e.code==='Enter'||e.code==='Space'||e.code==='KeyZ'){const t=document.querySelector('#ui .gpf')||document.querySelector('#ui [data-a]');if(t)t.click()}
 else if(e.code==='Escape'||e.code==='Backspace'||e.code==='KeyP'){const bk=document.querySelector('#ui [data-a="back"],#ui [data-a="resume"]');if(bk)bk.click()}}
function readInput(){pollPad();let L=K.L||GP.L,R=K.R||GP.R,U=K.U||GP.U,D=K.D||GP.D;for(const t of TOUCH.values()){if(t.z.L)L=1;if(t.z.R)R=1;if(t.z.U)U=1;if(t.z.D)D=1}
 if(window.__BOT&&G&&state==='play'){const b=botInput();L=b.L;R=b.R;U=b.U;D=b.D;b.J&&(KP.J=1);b.Jh&&(K.J=1);b.A&&(KP.A=1);b.Y&&(KP.Y=1);if(!b.Jh&&window.__BOTJ)K.J=0;window.__BOTJ=b.Jh}
 inp.L=L&&!R?1:0;inp.R=R&&!L?1:0;inp.U=U?1:0;inp.D=D?1:0;
 const j=!!(K.J||GP.J||VIRT.jump||VIRTP.jump||KP.J);inp.jumpP=((j&&!lastJ)||swipeJump||KP.J||VIRTP.jump)?1:0;inp.jump=j||swipeJump?1:0;lastJ=j;swipeJump=0;
 const a=!!(K.A||GP.A||VIRT.act||VIRTP.act||KP.A);inp.actP=(a&&!lastA)||KP.A||VIRTP.act?1:0;inp.act=a?1:0;lastA=a;
 const y=!!(K.Y||GP.Y||KP.Y);inp.ramP=(y&&!lastY)||KP.Y?1:0;lastY=y;
 VIRTP.jump=VIRTP.act=0;KP.J=KP.A=KP.Y=0}
/* ---------- art ---------- */
const IMG={},META={};
function loadArt(onp){return fetch('art/meta.json?v='+VERSION).then(r=>r.json()).then(m=>{Object.assign(META,m);const ns=Object.keys(m);let done=0;
 return Promise.all(ns.map(n=>new Promise(res=>{const im=new Image();im.onload=()=>{IMG[n]=im;done++;onp&&onp(done/ns.length);res()};im.onerror=()=>{done++;res()};im.src='art/'+n+'.webp?v='+VERSION})))}).catch(()=>{})}
/* draw sprite anchored bottom-center; art is authored at 2 image px per world unit */
function spr(n,x,y,sc=1,flip=false,alpha=1,rot=0,ay=1){const im=IMG[n];if(!im)return;const w=im.width*0.5*sc,h=im.height*0.5*sc;c.save();c.translate(x,y);if(rot)c.rotate(rot);if(flip)c.scale(-1,1);if(alpha<1)c.globalAlpha*=alpha;c.drawImage(im,-w/2,-h*ay,w,h);c.restore()}
function sprH(n,sc=1){const im=IMG[n];return im?im.height*0.5*sc:0}
const TINT={};function tinted(n,col){const k=n+col;if(TINT[k])return TINT[k];const im=IMG[n];if(!im)return null;const cc=document.createElement('canvas');cc.width=im.width;cc.height=im.height;const x=cc.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-atop';x.fillStyle=col;x.fillRect(0,0,cc.width,cc.height);return TINT[k]=cc}
function sprT(n,col,x,y,sc=1,flip=false,alpha=1){const im=tinted(n,col);if(!im)return;const w=im.width*0.5*sc,h=im.height*0.5*sc;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.globalAlpha*=alpha;c.drawImage(im,-w/2,-h,w,h);c.restore()}
/* ---------- fx ---------- */
function P(o){if(SIM)return o;if(G.parts.length<420)G.parts.push(o);return o}
function burst(x,y,n,cols,sp=240,life=0.6,size=3,grav=600){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=sp*(0.3+Math.random()*0.7);P({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*0.25,l:life*(0.5+Math.random()*0.7),m:life,s:size*(0.5+Math.random()),c:cols[i%cols.length],g:grav})}}
function dust(x,y,n=6,col='rgba(230,200,150,.8)'){for(let i=0;i<n;i++)P({x:x+rand(-12,12),y:y-rand(0,6),vx:rand(-60,60),vy:-rand(10,60),l:rand(0.35,0.7),m:0.7,s:rand(5,10),c:col,g:-30,puff:1})}
function ring(x,y,col,r=50,life=0.35,w=5){P({ring:1,x,y,l:life,m:life,s:r,c:col,w,vx:0,vy:0,g:0})}
function stars(x,y,n=6){burst(x,y,n,['#fff6a0','#ffd23a','#fff'],200,0.6,4,300)}
function ftxt(x,y,s,col='#fff',big=0){if(SIM)return;for(const t of G.texts)if(Math.abs(t.x-x)<120&&Math.abs(t.y-y)<26&&t.l>0.7)y-=26;G.texts.push({x,y,s,c:col,l:1.1,m:1.1,big})}
function shake(a){if(SIM)return;G.shake=Math.max(G.shake,a)}
function hitstop(t){if(SIM)return;G.hs=Math.max(G.hs,t)}
function flash(col,a=0.6){if(SIM)return;G.flash={c:col,a}}
let toastT=0;function toast(s,ms=1800){const t=$('toast');if(!t)return;t.textContent=s;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),ms)}
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const ovr=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function bx(o){return{x:o.x-o.w/2,y:o.y-o.h,w:o.w,h:o.h}}

/* ===== game data: worlds, cast, heists. To add a heist: add a STAGES entry (side | drive | boss) - nothing else needs to change. ===== */
const WORLDS=[
 {name:"Sal's Block",bg:'bg1',ter:'ter1',song:'w1',sky:['#8fd0ff','#d8f0ff'],plank:'#a0522d'},
 {name:'Trash Day',bg:'bg2',ter:'ter2',song:'w2',sky:['#ff9a70','#ffd8a8'],plank:'#7a4a2a'},
 {name:'Poodle Day',bg:'bg3',ter:'ter3',song:'w3',sky:['#ffc8dc','#fff0f6'],plank:'#e07aa0'},
 {name:'The Night Job',bg:'bg4',ter:'ter4',song:'w4',sky:['#3a2a6a','#7a5aa0'],plank:'#6a4a8a',night:1},
 {name:'The Big Storm',bg:'bg5',ter:'ter5',song:'w5',sky:['#5a6a80','#a0b0c0'],plank:'#6a4a2a',storm:1}];
/* cast: art key + name + a line. Bots/other writers can add more here. */
const CAST={
 jt:{n:'J.T.',art:'jt_idle'},noodles:{n:'Noodles',art:'nd_wink'},katie:{n:'Katie',art:'katie'},steve:{n:'Steve',art:'steve'},
 patty:{n:'Patty',art:'patty'},parrot:{n:'Peter',art:'parrot'},hoodie:{n:'Hoodie',art:'hoodie'},henry:{n:'Henry',art:'henry'},
 ducks:{n:'Bingo, Bongo & Bob',art:'ducks'},doves:{n:'Adam & Eve',art:'doves'},sal:{n:'Sal',art:'sal_laugh'},puff:{n:'Miss Puff',art:'puff'},
 gus:{n:'Big Gus',art:'gus'},mo:{n:'Mo',art:'mo_purr'},poodles:{n:'Fifi & Mimi',art:'poodles'}};
/* Found-It Book: trades the birds pay in. Earned at the end of each world. */
const TRADES={
 phone:{art:'phone',name:'Old cracked phone',from:'katie',does:'Plays music. Smooth!'},
 watch:{art:'watch',name:'Toy watch',from:'katie',does:'Beeps when time is almost up.'},
 panel:{art:'panel',name:'Bigger solar panel (a free one!)',from:'patty',does:'The Jeep holds more charge.'},
 wagon:{art:'hairbag',name:'Wagon',from:'ducks',does:'One more heart on every job.'},
 shades:{art:'jt_idle',name:'Spare shades',from:'parrot',does:'Zoom faster in the sun.'},
 lights:{art:'firefly',name:'Headlights',from:'hoodie',does:'Drive at night.'},
 horn:{art:'cap',name:'Music horn',from:'henry',does:'A big HONK. Pigeons hop out of the way from far off.'},
 feather:{art:'feather',name:'White friend feather',from:'doves',does:'Hint arrows show where hair is hiding!'}};
/* ----- side-level builder: tiny DSL -> 10-row ASCII map -----
   tiles: # ground  = plank (one-way)  X crate
   things (row 7 = standing on the ground): B bin  c gold curl  k bottle cap  f fish snack  g loose hair bag
     C rolling-can spot  S sprinkler  P hairspray cloud  M napping cat  D Sal's door (sweeps)  p Patty checkpoint
     K Katie / goal  b Mia's bow  F Mo's fish treat  T falling twigs  i sign  h Peter the parrot  s Steve  Q Quack Pack  w wind */
const ROWS=10;
function mk(){return Array.from({length:ROWS},()=>[])}
const SEG={
 flat(n,e='',top=''){const c=mk();for(let x=0;x<n;x++){for(let y=0;y<ROWS;y++)c[y].push(y>=8?'#':'.');}put(c,7,e);put(c,5,top);return c},
 gap(n,e=''){const c=mk();for(let x=0;x<n;x++)for(let y=0;y<ROWS;y++)c[y].push('.');put(c,5,e);return c},
 step(h,n,e='',top=''){const c=mk();for(let x=0;x<n;x++)for(let y=0;y<ROWS;y++)c[y].push(y>=8-h?'#':'.');put(c,7-h,e);put(c,5-h,top);return c},
 plat(n,row,eTop='',e='',from=1){const c=SEG.flat(n,e);for(let x=from;x<n-from;x++)c[row][x]='=';put(c,row-1,eTop);return c},
 crate(n,h=1,e='',eTop=''){const c=SEG.flat(n,e);const x0=(n>>1)-1;for(let x=x0;x<x0+2&&x<n;x++)for(let y=8-h;y<8;y++)c[y][x]='X';put(c,7-h,eTop,x0);return c},
 bridge(n,row,eTop=''){const c=SEG.gap(n);for(let x=0;x<n;x++)c[row][x]='=';put(c,row-1,eTop);return c}};
function put(c,row,s,off=0){if(!s||row<0)return;for(let i=0;i<s.length;i++){const ch=s[i];if(ch!=='.'&&ch!==' '&&c[row][i+off]!==undefined)c[row][i+off]=ch}}
function build(recipe){const rows=Array.from({length:ROWS},()=>'');for(const [k,...a] of recipe){const c=SEG[k](...a);for(let y=0;y<ROWS;y++)rows[y]+=c[y].join('')}return rows}
const ARENA=(n,extra)=>{const r=[['step',4,1],['flat',n]];if(extra)r.splice(1,1,...extra);r.push(['step',4,1]);return r};
/* clock helper: [h,m] -> minutes */
const HM=(h,m)=>h*60+m;
const STAGES=[
/* ================= WORLD 1: SAL'S BLOCK ================= */
{id:'1-1',w:0,kind:'side',name:'The Boss of the Bins',chapter:1,need:3,clock:{start:HM(8,40),end:HM(9,0),rate:8,what:'Big Gus and the truck come at 9:00!'},
 bins:[{stuck:1},null,null,null,null],meetNoodles:1,
 signs:['SWIPE & HOLD TO RUN','SWIPE UP OR TAP JUMP','TAP ACTION BY A BIN','HOLD JUMP TO GO HIGH'],
 plan:["Here's the plan. Sal's bins are full of soft cut hair.","Katie the crow needs soft hair for her nest. She pays in cool stuff!","Grab 3 bags of hair. Bring them to Katie. Beat the truck!"],
 done:["Katie's nest is soft at last!","Katie: \"Caw! Here, Boss. An old phone. It only plays music.\"","J.T.: \"A business is born. We're gonna need a crew.\""],
 map:[['flat',10,'..i...c.c.'],['flat',7,'...B...'],['flat',6,'.c.c.c'],['gap',2,'cc'],['flat',7,'i.c.c..'],['step',1,4,'.c.c'],['step',2,4,'c..k'],['step',1,3,'..c'],
  ['flat',10,'..D...c..c'],['flat',6,'..B..c'],['flat',4,'p...'],['plat',10,5,'..c.c.c...','..i.......'],['gap',2],['flat',6,'..f..c'],['crate',6,1,'','.k'],['flat',6,'.B..c.'],['gap',3,'.c.'],
  ['flat',8,'..C..c..'],['flat',6,'c.B..c'],['step',1,5,'.c.c.'],['plat',8,4,'..k.....','......c.'],['flat',10,'...B....c.'],['flat',10,'....K.....']],trade:['phone']},
{id:'1-2',w:0,kind:'drive',name:'The Getaway Car',chapter:3,
 plan:["Every mob needs wheels!","Patty: \"Word on the street... Mr. Lee has an old solar panel.\"","Mr. Lee: \"That old thing? Take it, J.T.!\" Now drive to Sal's. Stay in the sun!"],
 done:["The getaway car works!","Top speed: a fast walk.","Noodles: \"Ooh! Again! Again!\""],
 track:{len:7200,clock:{start:HM(8,30),end:HM(8,50),rate:4,what:'Get to Sal\'s by 8:50!'},seed:11,sun:0.55,clouds:0.25,cones:0.5,puddles:0.4,pigeons:0.3,bags:5,need:3,caps:3}},
{id:'1-B',w:0,kind:'boss',name:'The Great Broom Caper',chapter:5,boss:'sal',
 plan:["Sal keeps sweeping us away with that broom.","The plan: when Sal takes a break, Noodles hides the broom!","Jump over the dust. Tap ACTION by the broom when it shines."],
 done:["Uh oh. Noodles hid the broom SO well...","The shop filled up with hair! J.T. gave the broom back and helped sweep.","Sal: \"Okay, J.T. From now on, I'll leave the hair out for you.\""],
 map:ARENA(22),trade:['watch']},
/* ================= WORLD 2: TRASH DAY ================= */
{id:'2-1',w:1,kind:'side',name:'Beat the Truck',chapter:4,need:4,clock:{start:HM(6,50),end:HM(7,0),rate:7,what:'The truck comes at 7:00 sharp!'},
 bins:[null,null,{open:HM(6,53)},null,null,null],
 plan:["Big Gus and the trash truck come at 7:00 sharp.","Noodles in at 6:52. Hair out at 6:55. Gone by 6:58.","Get 4 bags to Katie before 7:00. Easy. What could go wrong?"],
 done:["They made it by a whisker. J.T.'s whisker was stuck in the lid!","Gus: \"Morning, little guys!\"","The whole crew froze and pretended to be a bush."],
 map:[['flat',8,'......c.'],['flat',6,'..B..c'],['flat',8,'.c.C..c.'],['gap',2,'cc'],['step',1,6,'.c.h.c'],['flat',6,'..B...'],['plat',8,5,'.c.c.c..','........'],['gap',2],
  ['flat',8,'p..s..c.'],['step',2,4,'.c.k'],['flat',6,'...B..'],['flat',8,'..C..c..'],['crate',6,1,'.c....','.k'],['flat',6,'.Q.B..'],['gap',3,'.c.'],['flat',6,'p....c'],
  ['plat',10,4,'...k......','..c.c.c...'],['flat',8,'...B..c.'],['step',1,4,'c.c.'],['flat',8,'..f.B...'],['flat',10,'.....K....']]},
{id:'2-2',w:1,kind:'drive',name:'Sweeper Chase',chapter:4,
 plan:["Uh oh. The street sweeper is up early too!","It sweeps up EVERYTHING. Even little guys in toy cars.","Stay ahead of it. Grab the bags Steve dropped. Sun = charge!"],
 done:["Phew! The sweeper went home for a nap.","Steve: \"Oops. I dropped it again.\"","Noodles: \"I love chases!\""],
 track:{len:8400,clock:{start:HM(6,30),end:HM(6,50),rate:4,what:'Back to the alley by 6:50!'},seed:23,sun:0.5,clouds:0.35,cones:0.6,puddles:0.5,pigeons:0.35,bags:6,need:4,caps:3,sweeper:1}},
{id:'2-B',w:1,kind:'boss',name:"Big Gus's Route",chapter:4,boss:'truck',
 plan:["Big Gus is on his route. The truck lifts every bin!","Get Noodles into each bin BEFORE the truck gets there.","Save 4 bags. Jump over the cans. Don't get beeped!"],
 done:["Gus waved: \"Morning, little guys!\"","He never even knew. ...Or did he?","Bingo, Bongo and Bob: \"Quack!\" \"Quack, quack!\" \"...Wait, what's the plan?\""],
 map:ARENA(26),trade:['panel','wagon']},
/* ================= WORLD 3: POODLE DAY ================= */
{id:'3-1',w:2,kind:'side',name:'The Bow With a Name',chapter:8,need:3,clock:{start:HM(9,56),end:HM(10,14),rate:7,what:'Fluff bags go out at 10:00!'},
 bins:[{open:HM(10,0)},null,{open:HM(10,2)},null,null],
 plan:["Patty, on her stool: \"Word on the street... Miss Puff's. Tuesday. Ten o'clock. Poodles.\"","The fluff bags go out at 10. Watch out for hairspray clouds. They slow you down!","Get 3 bags of fluff to Katie."],
 done:["Noodles found a pink bow. \"Ooh! This one has a name on it!\" It said MIA.","Katie: \"That would fetch a fortune in the Found-It Book!\" The Boss said no.","They gave it back to Mia at Miss Puff's. Her smile was the best pay yet."],
 map:[['flat',8,'..i..c.c'],['flat',6,'..B...'],['flat',8,'.c.P..c.'],['step',1,4,'.c.c'],['step',2,4,'k...'],['flat',6,'..S..c'],['flat',6,'..B..c'],['gap',2,'cc'],
  ['flat',6,'p.....'],['plat',10,5,'.c.c.c.c..','...P......'],['flat',6,'..b.B.'],['crate',6,2,'c....c','.k'],['flat',8,'..S..c..'],['flat',6,'.f..B.'],['gap',3,'.c.'],
  ['flat',6,'p..c..'],['plat',8,4,'..k.....','..c.c...'],['flat',8,'.P...B..'],['step',1,4,'c.c.'],['flat',10,'.....K....']],
 signs:['WAIT FOR 10:00!']},
{id:'3-2',w:2,kind:'drive',name:'Tuesday at Ten',chapter:6,
 plan:["Poodle Day is Tuesday at 10. It's 9:40!","Peter the parrot is in disguise. He will try to stay quiet.","Peter: \"SHHH! IT'S A SECRET MISSION!\" (Everyone heard.)"],
 done:["Made it! Miss Puff's door is right there.","Peter: \"WE ARE NOT HERE! WE ARE NOT HERE!\"","J.T.: \"Use your noodle, Noodles!\" Noodles: \"Which one?\""],
 track:{len:8400,clock:{start:HM(9,40),end:HM(10,0),rate:4,what:'Be at Miss Puff\'s by 10:00!'},seed:37,sun:0.45,clouds:0.4,cones:0.6,puddles:0.5,pigeons:0.5,bags:6,need:4,caps:3}},
{id:'3-B',w:2,kind:'boss',name:'Poodle Day',chapter:6,boss:'poodles',
 plan:["Fifi and Mimi spotted Noodles. The poodle chase is on!","Miss Puff sprays pink clouds of hairspray.","Get a poodle to run through a cloud. POOF!"],
 done:["POOF! Fluff everywhere! Even Peter got a pom-pom tail.","Miss Puff laughed so hard she cried.","Miss Puff: \"Next Tuesday, I'll bag the fluff for you, J.T.\""],
 map:ARENA(22),trade:['shades']},
/* ================= WORLD 4: THE NIGHT JOB ================= */
{id:'4-1',w:3,kind:'side',name:"Mo's Snack",chapter:7,need:3,clock:{start:HM(20,56),end:HM(21,16),rate:7,what:'The salon closes at 9 PM!'},
 bins:[{open:HM(21,0)},null,null,{open:HM(21,2)},null],
 plan:["Hoodie the owl: \"Who? Who's asking?\" He wants curly hair from the night salon.","The bins come out at 9. The alley cats are napping. Don't wake them!","Tip: if you swipe a snack, tap ACTION to give it back."],
 done:["The stinky fish treat made every cat on the block follow J.T.!","He gave it back. Mo purred.","Hoodie traded his headlights for the job. Who? Hoodie!"],
 map:[['flat',8,'..i..c.c'],['flat',6,'..B..M'],['flat',6,'.c....'],['step',1,4,'c.c.'],['flat',8,'..M..c.k'],['gap',2,'cc'],['flat',6,'..B...'],['flat',8,'p..F...c'],
  ['flat',8,'..M...c.'],['plat',10,5,'.c.c.c.c..','....M.....'],['gap',2],['flat',6,'.f..c.'],['crate',6,1,'.c...B','.k'],['flat',8,'..M..c..'],['gap',3,'.c.'],
  ['flat',6,'p..B..'],['plat',8,4,'..k.....','........'],['flat',8,'.M.B...c'],['step',1,4,'c.c.'],['flat',10,'.....K....']],
 signs:['SHHH! CATS NAPPING'],trade:['lights']},
{id:'4-2',w:3,kind:'drive',name:'Firefly Power',chapter:9,
 plan:["No sun means no charge!","J.T.'s plan: power the car with 100 fireflies.","Drive through the fireflies to charge up. Hurry, it's almost their bedtime!"],
 done:["The fireflies all went home at bedtime.","J.T. pushed the car the last bit.","Hoodie: \"Who needs fireflies? Take my headlights.\""],
 track:{len:8400,night:1,clock:{start:HM(21,20),end:HM(21,40),rate:4,what:'Home before 9:40 PM!'},seed:51,sun:0.6,clouds:0,cones:0.6,puddles:0.4,pigeons:0.2,bags:6,need:4,caps:3}},
{id:'4-B',w:3,kind:'boss',name:'Mo the Tough Guy',chapter:7,boss:'mo',
 plan:["Mo the cat guards the bins like a tough guy.","When he pounces, jump away. When he gets dizzy...","Tap ACTION. Noodles tickles him!"],
 done:["Mo giggled so hard he flopped over.","Mo: \"Okay, okay! Nobody touches these bins but you two.\"","Now Mo is the Hair Mob's bin security."],
 map:ARENA(22,[['flat',6],['crate',6,2],['flat',6]]),trade:['horn']},
/* ================= WORLD 5: THE BIG STORM ================= */
{id:'5-1',w:4,kind:'side',name:'The Big Storm',chapter:10,need:5,clock:{start:HM(17,0),end:HM(17,24),rate:7,what:'Line the nests before dark!'},
 bins:[null,null,null,null,null],
 plan:["A storm blew down every nest in the park!","For once there's no scheme. The whole Hair Mob helps.","Sal left extra bags out. Gus is holding the truck. Get 5 bags to the doves!"],
 done:["The whole Hair Mob worked all night.","J.T. brought the doves the softest hair first.","Adam and Eve: \"Thank you, Jimothy Timothy. Our eggs are safe and warm.\""],
 map:[['flat',8,'..i..c.c'],['flat',6,'..B..w'],['flat',8,'.g..T.c.'],['gap',2,'cc'],['step',1,6,'.c.T.c'],['flat',6,'..B...'],['plat',8,5,'.c.c.c..','...T....'],['gap',3,'.c.'],
  ['flat',8,'p..g..c.'],['step',2,4,'.c.k'],['flat',6,'..B..T'],['flat',8,'..f..c..'],['crate',6,1,'.c....','.k'],['flat',6,'.T.B..'],['gap',3,'.c.'],['flat',6,'p...g.'],
  ['plat',10,4,'...k......','..c.T.c...'],['flat',8,'...B..c.'],['step',1,4,'c.c.'],['flat',10,'.....K....']],
 signs:['THE WIND PUSHES!'],goal:'doves'},
{id:'5-2',w:4,kind:'drive',name:'All Hands',chapter:10,
 plan:["Everyone is helping!","Sal left bags. The poodles donated fluff. Gus is holding the truck.","Grab every bag on the road. Stay in the sun gaps!"],
 done:["The wagon is FULL.","The Quack Pack pushed the car up the last hill.","\"Quack!\" \"Quack, quack!\" \"...Wait, we did it?\""],
 track:{len:9000,clock:{start:HM(17,30),end:HM(17,50),rate:4,what:'Get the hair to the park by 5:50!'},seed:67,sun:0.35,clouds:0.55,cones:0.6,puddles:0.8,pigeons:0.3,bags:8,need:5,caps:3,rain:1}},
{id:'5-B',w:4,kind:'boss',name:'Fix the Nests',chapter:10,boss:'storm',
 plan:["The wind is wild! The nests are bare.","Grab the soft hair puffs as they blow in.","Jump up and fill each nest. The doves' nest first!"],
 done:["The storm blew away. The sun came out.","Adam and Eve's eggs hatched!","Everyone cheered: \"Hip, hip, hooray for Jimothy Timothy!\""],
 map:ARENA(22),trade:['feather'],finale:1}];
const STORY_INTRO=[
 {img:'intro1',t:"This is Jimothy Timothy. He's a raccoon with big plans and a tree in the park. <b>Word on the street, they call him J.T.!</b>"},
 {img:'intro2',t:"J.T. runs the <b>Hair Mob</b>. They get cut hair from the trash behind barber shops. The birds love it for soft nests. To them, hair is like <b>strands of gold</b>."},
 {img:'intro3',t:"Every job runs on a schedule: beat the trash truck, know when the poodles get groomed. And remember... <b>It's not stealing if it's in the trash.</b>"}];
const ENDING=[{img:'ending',t:"The doves gave J.T. a white feather. It means <b>friend</b>. Now any bird will show him where hair is hiding.<br>Noodles: <b>\"What's the plan tomorrow, Boss?\"</b>"}];
const PARENT_NOTE='Only raccoons and ferrets dig in bins! Kids, ask a grown-up.';

/* ===== side-scrolling heists: level build, J.T. physics, Noodles, bins on a schedule, hazards ===== */
const LVH=ROWS*TS;
const PH={w:30,h:60,spd:235,acc:1900,jv:640,hold:0.55};
function buildSide(st){const rows=build(st.map),cols=rows[0].length,T=[],ents=[];let bi=0,si=0,ci=0;
 for(let x=0;x<cols;x++){T.push(new Array(ROWS).fill(0));for(let y=0;y<ROWS;y++){const ch=rows[y][x],cx=x*TS+TS/2,by=(y+1)*TS;
  if(ch==='#')T[x][y]=1;else if(ch==='=')T[x][y]=2;else if(ch==='X')T[x][y]=3;
  else if(ch==='B'){const cfg=(st.bins&&st.bins[bi])||{};ents.push({k:'bin',x:cx,y:by,idx:bi,st:cfg.open!=null?'shut':'ready',open:cfg.open,stuck:cfg.stuck,w:44,h:56});bi++}
  else if(ch==='c')ents.push({k:'curl',x:cx,y:by-16});
  else if(ch==='k')ents.push({k:'cap',x:cx,y:by-16,id:ci++});
  else if(ch==='f')ents.push({k:'fish',x:cx,y:by-14});
  else if(ch==='g')ents.push({k:'bag',x:cx,y:by-20});
  else if(ch==='C')ents.push({k:'canspot',x:cx,y:by,t:1.2});
  else if(ch==='S')ents.push({k:'spr',x:cx,y:by,t:rand(0,3)});
  else if(ch==='P')ents.push({k:'cloud',x0:cx,x:cx,y:by-50,r:52,t:rand(0,6),live:1});
  else if(ch==='M')ents.push({k:'cat',x:cx,y:by,hx:cx,st:'nap',t:0,vx:0,vy:0});
  else if(ch==='D')ents.push({k:'door',x:cx,y:by,t:1.5});
  else if(ch==='p')ents.push({k:'patty',x:cx,y:by});
  else if(ch==='K')ents.push({k:'goal',x:cx,y:by});
  else if(ch==='b')ents.push({k:'bow',x:cx,y:by-16});
  else if(ch==='F')ents.push({k:'treat',x:cx,y:by-12,hx:cx,hy:by-12});
  else if(ch==='T')ents.push({k:'twig',x:cx,y:by,t:rand(0.5,2.5)});
  else if(ch==='i')ents.push({k:'sign',x:cx,y:by,text:(st.signs||[])[si++]||''});
  else if(ch==='h')ents.push({k:'gag',who:'parrot',x:cx,y:by});
  else if(ch==='s')ents.push({k:'gag',who:'steve',x:cx,y:by});
  else if(ch==='Q')ents.push({k:'gag',who:'ducks',x:cx,y:by});
  else if(ch==='w')ents.push({k:'windstart',x:cx,y:by})}}
 return{T,ents,cols,W:cols*TS,rows}}
function tileAt(tx,ty){if(tx<0)return 1;if(!G||!G.L||tx>=G.L.cols)return 1;if(ty<0||ty>=ROWS)return 0;return G.L.T[tx][ty]}
const solidK=k=>k===1||k===3;
function newPlayer(x,y){const hp=3+(has('wagon')?1:0);return{x,y,vx:0,vy:0,face:1,onG:false,hp,maxhp:hp,inv:0,coy:0,jbuf:0,holdJ:0,anim:0,phase:0,land:0,squash:0,dead:0,w:PH.w,h:PH.h,safe:{x,y},slow:0,act:0}}
function has(t){return save.items.indexOf(t)>=0}
function collideX(o){const b=bx(o),y0=Math.floor((b.y+2)/TS),y1=Math.floor((b.y+b.h-2)/TS);
 if(o.vx>0){const tx=Math.floor((b.x+b.w)/TS);for(let ty=y0;ty<=y1;ty++)if(solidK(tileAt(tx,ty))){o.x=tx*TS-o.w/2-0.01;return true}}
 else if(o.vx<0){const tx=Math.floor(b.x/TS);for(let ty=y0;ty<=y1;ty++)if(solidK(tileAt(tx,ty))){o.x=(tx+1)*TS+o.w/2+0.01;return true}}return false}
function collideY(o,py,drop){const b=bx(o),x0=Math.floor((b.x+3)/TS),x1=Math.floor((b.x+b.w-3)/TS);o.onG=false;
 if(o.vy>=0){const ty=Math.floor(o.y/TS);for(let tx=x0;tx<=x1;tx++){const k=tileAt(tx,ty);if(solidK(k)||(k===2&&!drop&&py<=ty*TS+1)){o.y=ty*TS;o.vy=0;o.onG=true;o.gk=k;return true}}}
 else{const ty=Math.floor(b.y/TS);for(let tx=x0;tx<=x1;tx++){if(solidK(tileAt(tx,ty))){o.y=(ty+1)*TS+o.h;o.vy=0;return true}}}return false}
/* pure movement step (used by the game AND by the QA look-ahead planner) */
function stepPlayer(p,dt,I){const slow=p.slow>0?0.5:1,spd=PH.spd*slow;
 const want=(I.R?1:0)-(I.L?1:0);
 if(p.cut){p.vx*=0.8}else if(want){p.vx+=want*PH.acc*(p.onG?1:0.8)*dt;if(Math.abs(p.vx)>spd)p.vx=sgn(p.vx)*spd;p.face=want}
 else{const f=(p.onG?2400:600)*dt;p.vx=Math.abs(p.vx)<=f?0:p.vx-sgn(p.vx)*f}
 if(p.push)p.vx+=p.push*dt;
 p.coy=p.onG?0.1:p.coy-dt;p.jbuf=I.jumpP?0.12:p.jbuf-dt;
 if(!p.cut&&p.jbuf>0&&p.coy>0){p.vy=-PH.jv*(p.slow>0?0.85:1);p.coy=0;p.jbuf=0;p.holdJ=1;p.jumped=1}
 if(!I.jump)p.holdJ=0;let g=GRAV;if(p.holdJ&&p.vy<0)g*=PH.hold;
 p.vy=Math.min(p.vy+g*dt,1100);
 p.x+=p.vx*dt;if(collideX(p))p.vx=0;
 const py=p.y;p.y+=p.vy*dt;const wasG=p.onG;collideY(p,py,I.D&&p.onG);p.landed=p.onG&&!wasG;
 if(p.x<p.w/2)p.x=p.w/2;if(G.arena){const a=G.arena;p.x=clamp(p.x,a.x0+p.w/2,a.x1-p.w/2)}
 if(G.L&&p.x>G.L.W-p.w/2)p.x=G.L.W-p.w/2}
function updatePlayer(p,dt){p.anim+=dt;p.inv=Math.max(0,p.inv-dt);p.squash=Math.max(0,p.squash-dt*4);p.slow=Math.max(0,p.slow-dt);p.act=Math.max(0,p.act-dt);
 if(p.dead){p.vy+=GRAV*dt;p.y+=p.vy*dt;return}
 p.jumped=0;stepPlayer(p,dt,p.cut?{}:inp);
 if(p.jumped){AU.fx('jump');dust(p.x,p.y,5);p.squash=0.6}
 if(p.landed){p.squash=0.5;AU.fx('land');dust(p.x,p.y,4)}
 p.phase+=Math.abs(p.vx)*dt/62;
 if(p.onG&&p.gk!==2){const tx=Math.floor(p.x/TS);if(solidK(tileAt(tx-1,Math.floor(p.y/TS)))&&solidK(tileAt(tx+1,Math.floor(p.y/TS))))p.safe={x:p.x,y:p.y}}
 if(p.y>LVH+90)fallPit(p)}
function pitBack(p,fx){/*respawn fix: back up off the pit edge onto solid ground*/const d=sgn(fx-p.safe.x)||p.face||1,row=Math.floor(p.safe.y/TS),sx=p.safe.x,ok=x=>{const a=Math.floor((x-PH.w/2)/TS),b=Math.floor((x+PH.w/2)/TS);return solidK(tileAt(a,row))&&solidK(tileAt(b,row))&&!solidK(tileAt(a,row-1))&&!solidK(tileAt(b,row-1))&&!solidK(tileAt(a,row-2))&&!solidK(tileAt(b,row-2))};let ex=sx;for(let i=0;i<60;i++){if(!ok(ex+d*4))break;ex+=d*4}const need=PH.w*1.5+PH.w/2,dist=Math.abs(ex-sx);if(dist>=need)return sx;for(let k=need-dist;k>0;k-=6){if(ok(sx-d*k))return sx-d*k}return sx}
function fallPit(p){if(p.dead)return;const bl=p.inv>0,fx=p.x;p.x=pitBack(p,fx);p.y=p.safe.y;p.vx=p.vy=0;if(bl){p.inv=Math.max(p.inv,1);return}/*blinking: free, silent*/AU.fx('hurt');say('jt','Oops!',1);p.inv=1.5;if(!window.__GOD){p.hp--;if(p.hp<=0)loseTry('Out of hearts!')}flash('#ffffff',0.3)}
function hurtPlayer(p,src,why){if(p.inv>0||p.dead||G.won||G.cut)return;if(window.__GOD){p.inv=0.4;return}p.hp--;p.inv=1.5;AU.fx('bump');shake(7);flash('#ff6040',0.25);hitstop(0.05);
 const d=src!=null?sgn(p.x-src):-p.face;p.vx=d*300;p.vy=-380;G.hits=(G.hits||0)+1;if(why)say('jt',why,1);
 if(p.hp<=0)loseTry('Out of hearts!')}
function loseTry(msg){const p=G.p;if(p.dead)return;p.dead=1;p.vy=-500;G.deadT=1.5;G.deadMsg=msg;G.deaths++}
/* ----- Noodles (follows J.T.; the only one small enough to get into the bins) ----- */
function newNoodles(x,y){return{x,y,vx:0,vy:0,face:1,st:'follow',t:0,task:null,trail:[],phase:0,giggle:0}}
function updNoodles(dt){const n=G.nd;if(!n)return;const p=G.p;n.t+=dt;n.giggle=Math.max(0,n.giggle-dt);
 if(n.st==='follow'){const tx=p.x-p.face*44,ty=p.y;const dx=tx-n.x;n.vx=Math.abs(dx)>6?clamp(dx*6,-420,420):0;n.x+=n.vx*dt;
  n.y+=(ty-n.y)*Math.min(1,dt*10);if(Math.abs(n.vx)>20)n.face=sgn(n.vx);else n.face=p.face}
 else if(n.st==='go'){const b=n.task.bin;const dx=b.x-24*sgn(b.x-p.x||1)-n.x;n.face=sgn(b.x-n.x)||1;n.x+=clamp(dx*8,-480,480)*dt;n.y+=(b.y-n.y)*Math.min(1,dt*12);if(Math.abs(dx)<6){n.st='dive';n.t=0;n.x=b.x;AU.fx('wiggle');n.stuck=b.stuck||(Math.random()<0.22&&G.st.w>0)?1:0;if(n.stuck&&!b.stuck)say('nd','Uh oh. I\'m stuck!',1.4)}}
 else if(n.st==='dive'){if(Math.random()<0.15)burst(n.x,n.y-30,2,['#c89a5a','#e8c890'],90,0.5,3,300);
  if(n.stuck){if(n.t>0.4&&(G.p.act>0||n.t>2.6)){n.stuck=0;n.t=0.6}}
  else if(n.t>0.8){n.st='pop';n.t=0;const b=n.task.bin;b.st='empty';AU.fx('pop');shake(3);ftxt(b.x,b.y-80,'POP!','#fff6c0',1);burst(b.x,b.y-60,16,['#c89a5a','#e8c890','#8a5a2a','#fff'],260,0.8,4,700);
   G.fly.push({x:b.x,y:b.y-70,t:0,tx:'jt'});n.vy=-520}}
 else if(n.st==='pop'){n.vy+=GRAV*0.8*dt;n.y+=n.vy*dt;const gy=n.task.bin.y;if(n.y>=gy&&n.vy>0){n.y=gy;n.st='follow';n.task=null}}
 else if(n.st==='tickle'||n.st==='broom'){const o=n.task;const dx=o.x-n.x;n.face=sgn(dx)||1;n.x+=clamp(dx*8,-520,520)*dt;n.y+=(o.y-n.y)*Math.min(1,dt*10);if(Math.abs(dx)<10||n.t>1.2){if(o.done)o.done();n.st='follow';n.task=null;n.giggle=0.8}}
 else if(n.st==='laugh'){}
 n.phase+=Math.abs(n.vx)*dt/34}
function sendNoodles(bin){const n=G.nd;if(!n||n.st!=='follow')return false;
 if(bin.st==='shut'){AU.fx('nope');say('nd','Not yet! Opens at '+fmtClock(bin.open)+'.',1.6);return true}
 if(bin.st!=='ready')return false;n.st='go';n.task={bin};n.t=0;bin.st='busy';if(G.raids++===0&&G.st.id==='1-1')say('jt','Noodles, we\'re goin\' in!',1.4);return true}
/* ----- speech bubbles ----- */
function say(who,text,dur=2){if(SIM||!G)return;G.talk=G.talk.filter(t=>t.who!==who);G.talk.push({who,text,t:dur,m:dur})}
function cutscene(lines,done){G.cutQ=lines.slice();G.cutDone=done;G.p.cut=1;nextCut()}
function nextCut(){const l=G.cutQ.shift();if(!l){G.p.cut=0;G.cutL=null;const d=G.cutDone;G.cutDone=null;if(d)d();return}G.cutL=l;G.cutT=l[2]||2.2;say(l[0],l[1],G.cutT)}
/* ----- clock ----- */
function fmtClock(m){m=Math.floor(m);let h=Math.floor(m/60)%24,mm=m%60;const pm=h>=12;h=h%12||12;return h+':'+(mm<10?'0':'')+mm}
/* ----- side entities ----- */
function updSide(dt){const p=G.p,st=G.st;
 /* clock */
 if(G.clock&&!G.won&&!p.cut&&!p.dead){const c=G.clock;c.now+=dt/c.rate;if(has('watch')&&c.end-c.now<1&&!c.warned){c.warned=1;AU.fx('beep');toast('⌚ Beep beep! One minute left!')}
  if(c.now>=c.end){c.now=c.end;timeUp()}}
 for(const e of G.ents){if(e.dead)continue;const dx=e.x-p.x,adx=Math.abs(dx);
  switch(e.k){
  case 'bin':if(e.st==='shut'&&G.clock&&G.clock.now>=e.open){e.st='ready';if(adx<500){AU.fx('charge');ftxt(e.x,e.y-80,'OPEN!','#a0ff80',1)}}
   if(e.stuck&&!G.nd&&adx<60&&!p.cut&&p.onG)meetNoodles(e);break;
  case 'curl':if(near(p,e,26)){e.dead=1;G.curls++;G.score+=10;AU.fx('curl');burst(e.x,e.y,5,['#ffe080','#ffb020'],120,0.4,3,200);if(G.curls%100===0){G.lives++;AU.fx('life');ftxt(e.x,e.y-20,'1UP!','#7aff7a',1)}}break;
  case 'cap':if(near(p,e,28)){e.dead=1;G.caps[e.id]=1;G.score+=500;AU.fx('cap');stars(e.x,e.y,12);ftxt(e.x,e.y-20,'BOTTLE CAP!','#ff8080',1)}break;
  case 'fish':if(near(p,e,28)){e.dead=1;if(p.hp<p.maxhp){p.hp++;ftxt(e.x,e.y-20,'+1 HEART','#ff9ab0')}else G.score+=100;AU.fx('charge')}break;
  case 'bag':if(e.fall){e.vy=(e.vy||0)+GRAV*0.5*dt;e.y+=e.vy*dt;const ty=Math.floor(e.y/TS);if(solidK(tileAt(Math.floor(e.x/TS),ty))||tileAt(Math.floor(e.x/TS),ty)===2){e.y=ty*TS-2;e.fall=0}if(e.y>LVH+50)e.dead=1}
   if(near(p,e,34)){e.dead=1;G.bags++;AU.fx('bag');ftxt(e.x,e.y-30,'+1 BAG','#ffe8a0',1)}break;
  case 'bow':if(near(p,e,30)){e.dead=1;G.bow=1;AU.fx('cap');say('nd','Ooh! This one has a name on it! MIA!',2.4)}break;
  case 'treat':if(!G.treat&&!e.home&&near(p,e,30)){e.dead=1;G.treat=1;AU.fx('meow');say('jt','A snack! ...Uh oh.',1.6);toast('Every cat wants that treat! Tap ACTION to give it back.',2600);for(const c of G.ents)if(c.k==='cat'&&Math.abs(c.x-p.x)<1200){c.st='chase';c.t=0}}break;
  case 'canspot':if(adx<760&&dx>-40){e.t-=dt;if(e.t<=0){e.t=3.4;G.shots.push({k:'can',x:e.x,y:e.y-14,vx:-rand(150,190),vy:0,r:14,rot:0})}}break;
  case 'spr':e.t+=dt;e.on=(e.t%3.6)<1.6;if(e.on&&Math.random()<0.5)P({x:e.x+rand(-20,20),y:e.y-rand(20,110),vx:rand(-40,40),vy:rand(-60,40),l:0.4,m:0.4,s:3,c:'#9ad8ff',g:500});
   if(e.on&&Math.abs(dx)<24&&p.y>e.y-120)hurtPlayer(p,e.x,'Splash!');break;
  case 'cloud':e.t+=dt;e.x=e.x0+Math.sin(e.t*0.8)*60;if(Math.random()<0.2)P({x:e.x+rand(-40,40),y:e.y+rand(-30,30),vx:rand(-20,20),vy:-10,l:1,m:1,s:rand(8,14),c:'rgba(255,170,210,.5)',g:0,puff:1});
   if(Math.hypot(e.x-p.x,e.y-(p.y-30))<e.r+12){if(p.slow<=0)say('jt','Sticky!',0.8);p.slow=0.4}break;
  case 'cat':updCat(e,dt);break;
  case 'door':if(adx<520&&dx>-60){e.t-=dt;if(e.t<=0){e.t=3.6;e.sweep=0.7;AU.fx('sweep');G.shots.push({k:'dust',x:e.x-30,y:e.y,vx:-230,life:2.4,r:18})}}if(e.sweep>0)e.sweep-=dt;break;
  case 'patty':if(!e.on&&p.x>e.x-10){e.on=1;G.cp={x:e.x,y:e.y,clock:G.clock?G.clock.now:0};AU.fx('coo');say('patty',PATTY_TIPS[(G.tip++)%PATTY_TIPS.length],2.6);p.hp=Math.max(p.hp,Math.min(p.maxhp,p.hp+1))}break;
  case 'goal':if(adx<44&&!G.won&&!p.cut){if(G.bags>=st.need){goalReached(e)}else if(!(e.cd>0)){e.cd=2.4;AU.fx(st.goal==='doves'?'coo':'caw');say(st.goal==='doves'?'doves':'katie','We need '+(st.need-G.bags)+' more bag'+(st.need-G.bags>1?'s':'')+', Boss!',2)}}if(e.cd>0)e.cd-=dt;break;
  case 'twig':if(adx<420){e.t-=dt;if(e.t<=0){e.t=rand(2.2,3.2);const x=p.x+rand(-30,120)+p.vx*0.5;G.shots.push({k:'twig',x,y:-60,vy:0,warn:0.75,r:16,gy:groundY(x)})}}break;
  case 'gag':if(!e.done&&p.x>e.x-120){e.done=1;gag(e)}break;
  case 'windstart':break}}
 /* flying bags (to J.T.) */
 for(const f of G.fly){f.t+=dt*1.8;const tx=p.x,ty=p.y-40;f.x+=(tx-f.x)*Math.min(1,f.t*0.5);f.y+=(ty-f.y)*Math.min(1,f.t*0.5)-Math.sin(f.t*3)*2;if(f.t>=1){f.done=1;G.bags++;AU.fx('bag');ftxt(p.x,p.y-90,'+1 BAG','#ffe8a0',1)}}
 G.fly=G.fly.filter(f=>!f.done);
 /* projectiles */
 for(const s of G.shots){if(s.k==='can'){s.vy+=GRAV*dt;s.x+=s.vx*dt;const py=s.y;s.y+=s.vy*dt;s.rot+=s.vx*dt/14;const ty=Math.floor((s.y+s.r)/TS);if(s.vy>0&&(solidK(tileAt(Math.floor(s.x/TS),ty))||tileAt(Math.floor(s.x/TS),ty)===2&&py+s.r<=ty*TS+2)){s.y=ty*TS-s.r;s.vy=s.stop?-200:0}
   if(solidK(tileAt(Math.floor((s.x-s.r)/TS),Math.floor(s.y/TS))))s.vx=Math.abs(s.vx)*(s.stop?1:-1);if(s.y>LVH+60||Math.abs(s.x-p.x)>1100)s.dead=1;
   if(!s.stop)canHit(s)}
  else if(s.k==='dust'){s.x+=s.vx*dt;s.life-=dt;if(Math.random()<0.6)P({x:s.x+rand(-10,10),y:s.y-rand(0,30),vx:rand(-30,30),vy:-rand(20,60),l:0.5,m:0.5,s:rand(6,12),c:'rgba(200,180,150,.7)',g:-20,puff:1});
   const gx=Math.floor(s.x/TS);if(!solidK(tileAt(gx,Math.floor(s.y/TS)))&&!solidK(tileAt(gx,Math.floor((s.y+4)/TS))))s.life=0;if(s.life<=0)s.dead=1;
   if(Math.abs(s.x-p.x)<s.r+10&&p.y>s.y-36)hurtPlayer(p,s.x,'Whoa!')}
  else if(s.k==='twig'){if(s.warn>0){s.warn-=dt;s.y=-60}else{s.vy+=GRAV*0.7*dt;s.y+=s.vy*dt;s.rot=(s.rot||0)+dt*6;if(s.y>=s.gy){s.dead=1;burst(s.x,s.gy,8,['#6a4a2a','#3a7a2a'],160,0.5,3,600);AU.fx('land')}
   if(Math.abs(s.x-p.x)<s.r+12&&s.y>p.y-p.h-4&&s.y<p.y+4)hurtPlayer(p,s.x,'Ouch, a twig!')}}}
 G.shots=G.shots.filter(s=>!s.dead);
 /* storm wind */
 if(G.world.storm&&!G.won){G.gust=G.gust||{t:4,on:0};const gs=G.gust;gs.t-=dt;if(gs.t<=0){if(gs.on){gs.on=0;gs.t=rand(3.5,5)}else{gs.on=1;gs.t=1.8;gs.dir=G.boss?(Math.random()<0.5?-1:1):-1;AU.fx('wind')}}
  p.push=gs.on?gs.dir*700:0;if(gs.on&&Math.random()<0.7)P({x:G.cam.x+(gs.dir<0?viewW+20:-20),y:G.cam.y+rand(0,VV),vx:gs.dir*rand(500,800),vy:rand(-40,40),l:1.6,m:1.6,s:rand(3,6),c:Math.random()<0.5?'#5a9a3a':'#a0c070',g:0,leaf:1})}else p.push=0;
 /* ACTION */
 if(inp.actP&&!p.cut&&!p.dead)doAction(p)}
function groundY(x){const tx=Math.floor(x/TS);for(let y=0;y<ROWS;y++){const k=tileAt(tx,y);if(solidK(k)||k===2)return y*TS}return LVH+100}
function near(p,e,r){return Math.abs(e.x-p.x)<r+p.w/2&&e.y>p.y-p.h-r&&e.y<p.y+r}
function canHit(s){const p=G.p;if(p.dead)return;const b=bx(p);if(s.x+s.r>b.x&&s.x-s.r<b.x+b.w&&s.y+s.r>b.y&&s.y-s.r<b.y+b.h){
 if(p.vy>60&&p.y-s.y<s.r+6){p.vy=-560;p.holdJ=inp.jump?1:0;s.stop=1;s.vx=sgn(s.vx||1)*-60;s.vy=-300;AU.fx('boing');G.score+=50;ftxt(s.x,s.y-30,'BOING!','#fff',0);p.squash=0.5}
 else hurtPlayer(p,s.x,'Bonk!')}}
function updCat(e,dt){const p=G.p,dx=p.x-e.x;e.t+=dt;
 if(e.st==='nap'){if(Math.random()<0.02)P({x:e.x+10,y:e.y-50,vx:10,vy:-20,l:1.2,m:1.2,s:0,c:'#fff',g:0,z:1});
  if(Math.abs(dx)<100&&p.onG&&Math.abs(p.vx)>60&&!G.treat){e.st='wake';e.t=0;AU.fx('meow');say('cat'+e.x,'MRROW!',0.8)}}
 else if(e.st==='wake'){if(e.t>0.35){e.st='pounce';e.t=0;e.vx=sgn(dx)*260;e.vy=-420;e.face=sgn(dx)}}
 else if(e.st==='pounce'){e.vy+=GRAV*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;const gy=groundY(e.x);if(e.y>=gy&&e.vy>0){e.y=gy;e.st='grump';e.t=0}}
 else if(e.st==='grump'){e.x+=(e.hx-e.x)*Math.min(1,dt*2);if(e.t>1.6){e.st='nap';e.x=e.hx;e.y=groundY(e.hx)}}
 else if(e.st==='chase'){if(!G.treat){e.st='grump';e.t=0}else{e.face=sgn(dx);e.vx=clamp(dx*3,-190,190);e.x+=e.vx*dt;e.y=groundY(e.x);if(e.y>LVH)e.y=LVH}}
 if((e.st==='pounce'||e.st==='chase')&&Math.abs(dx)<30&&p.y>e.y-60&&p.y<e.y+30)hurtPlayer(p,e.x,'Yikes, a cat!')}
const PATTY_TIPS=["Word on the street... jump ON a can to bounce!","Word on the street... hold JUMP to go higher.","Word on the street... caps are hiding up high.","Word on the street... a fish snack gives you a heart.","Word on the street... watch the clock, Boss!"];
function gag(e){if(e.who==='parrot'){G.npc.push({k:'parrot',x:G.cam.x+viewW+40,y:G.cam.y+60,vx:-260,t:0});AU.fx('caw');say('parrot','SHHH! THE TRUCK IS COMING!!',2.2);later(1.4,()=>say('jt','It\'s three blocks away, Peter.',1.8))}
 else if(e.who==='steve'){G.npc.push({k:'steve',x:G.cam.x-60,y:G.cam.y+70,vx:300,t:0,drop:G.p.x+160});AU.fx('caw')}
 else if(e.who==='ducks'){G.npc.push({k:'ducks',x:e.x+60,y:groundY(e.x+60),vx:0,t:0,stay:1});AU.fx('quack');say('ducks','Quack! Quack, quack! ...Wait, which bin?',2.2)}}
function updNpc(dt){for(const n of G.npc){n.t+=dt;n.x+=n.vx*dt;if(n.k==='steve'&&n.drop&&n.x>n.drop){n.drop=0;G.ents.push({k:'bag',x:n.x,y:n.y,fall:1,vy:0});say('steve','Oops. I dropped it again.',1.8)}if(!n.stay&&(n.x<G.cam.x-200||n.x>G.cam.x+viewW+300))n.dead=1}G.npc=G.npc.filter(n=>!n.dead)}
function doAction(p){p.act=0.25;
 if(G.treat){G.treat=0;const t=G.ents.find(e=>e.k==='treat');if(t){t.dead=0;t.home=1;t.x=t.hx;t.y=t.hy}AU.fx('purr');say('jt','Here, give it back. Sorry, guys!',1.8);for(const c of G.ents)if(c.k==='cat'){c.st='grump';c.t=0}G.score+=200;return}
 if(G.boss&&bossAction(p))return;
 if(G.nd&&G.nd.st==='dive'&&G.nd.stuck){AU.fx('wiggle');ftxt(G.nd.x,G.nd.y-60,'WIGGLE!','#fff',0);return}
 let best=null,bd=80;for(const e of G.ents)if(e.k==='bin'&&!e.dead&&(e.st==='ready'||e.st==='shut')){const d=Math.abs(e.x-p.x);if(d<bd&&Math.abs(e.y-p.y)<60){bd=d;best=e}}
 if(best&&sendNoodles(best))return;
 if(best&&!G.nd)return;
 /* nothing near: Noodles does a happy wiggle */
 if(G.nd&&G.nd.st==='follow'&&!(G.nd.giggle>0)){G.nd.giggle=0.8;AU.fx('giggle');if(Math.random()<0.3)say('nd',['Ooh! I love plans!','Which noodle?','Is it hair time?'][Math.random()*3|0],1.2)}}
function meetNoodles(bin){const p=G.p;p.vx=0;bin.st='busy';
 cutscene([['jt','Hmm. The hair is stuck at the bottom. Too heavy!',2],['pop','',0.6],['nd','Ooh! I love plans! I\'m Noodles!',2.2],['jt','Why do they call you Noodles?',1.8],['nd','Bendy body... or big brain? Nobody knows!',2.2],['jt','Okay, inside man. Only small, safe bins. And only with me watching!',2.6]],
 ()=>{toast('Noodles joined the Hair Mob! Tap ACTION by a bin.',2600);bin.st='empty';G.fly.push({x:bin.x,y:bin.y-70,t:0})});
 later(2.1,()=>{if(G.nd)return;G.nd=newNoodles(bin.x,bin.y);G.nd.vy=-500;G.nd.st='pop';G.nd.task={bin};AU.fx('pop');shake(4);burst(bin.x,bin.y-60,24,['#c89a5a','#e8c890','#fff'],300,0.9,4,700)})}
function timeUp(){if(G.won||G.p.dead)return;AU.fx('honk');const m=G.st.clock.what.indexOf('truck')>=0||G.world.name==='Trash Day'?'The truck got there first!':'Out of time!';loseTry(m)}
function goalReached(e){const st=G.st;G.won=1;G.wonT=2.4;AU.fx(st.goal==='doves'?'coo':'ching');later(0.4,()=>AU.fx('clear'));
 for(let i=0;i<Math.min(G.bags,8);i++)G.fly2.push({x:G.p.x,y:G.p.y-40,tx:e.x,ty:e.y-150,t:-i*0.12});
 say(st.goal==='doves'?'doves':'katie',st.goal==='doves'?'Thank you, Jimothy Timothy!':'Caw-CHING! Nice work, Boss!',2.2);if(G.nd){G.nd.st='laugh';AU.fx('giggle')}
 G.clockLeft=G.clock?G.clock.end-G.clock.now:0;G.score+=G.bags*250+Math.round(G.clockLeft*100)}

/* ===== boss showdowns (nobody gets hurt: you fluster them, out-time them, or make them laugh) ===== */
const GY=8*TS;
function startBoss(){const st=G.st,A=G.arena;const b={k:st.boss,t:0,st:'intro',prog:0,face:-1,hitT:0};G.boss=b;G.bossIntro=2.2;AU.music('boss');
 if(b.k==='sal'){b.need=3;b.label="SAL'S FLUSTER";b.x=A.x1-90;b.y=GY;b.st='sweep';b.t=-1.2;b.n=0}
 else if(b.k==='truck'){b.need=4;b.label='BAGS SAVED';b.round=0;newTruckRound(b)}
 else if(b.k==='poodles'){b.need=4;b.label='POOF-O-METER';b.dogs=[{n:'Fifi',x:A.x1-120,y:GY,st:'sit',t:0.8,face:-1},{n:'Mimi',x:A.x1-200,y:GY,st:'sit',t:2.4,face:-1}];b.clouds=[];b.sprayT=1.2;b.puffX=A.x0+40}
 else if(b.k==='mo'){b.need=4;b.label="MO'S GIGGLES";b.x=A.x1-120;b.y=GY;b.vx=0;b.vy=0;b.st='stalk';b.t=0;b.face=-1}
 else if(b.k==='storm'){b.need=5;b.label='NESTS LINED';const L=G.L;
  const plank=(x0,x1,row)=>{for(let x=x0;x<=x1;x++)L.T[x][row]=2};plank(3,7,5);plank(16,20,5);plank(9,14,2);
  b.nests=[{x:12*TS,y:2*TS,need:1,n:0,doves:1},{x:5*TS+20,y:5*TS,need:2,n:0},{x:18*TS+20,y:5*TS,need:2,n:0}];b.puffs=[];b.puffT=0.5;b.carry=0}
 const lines={sal:[['sal','J.T.! Get out of my shop!',1.8],['jt','Relax, Sal. I know a guy. ...I am the guy.',2.2]],truck:[['gus','Morning, little guys!',1.6],['jt','Act natural. We\'re a bush.',1.8]],
  poodles:[['puff','Who let a FERRET in my salon?!',1.8],['nd','Hi, poodles! ...Uh oh.',1.6]],mo:[['mo','These are MY bins, pal.',1.8],['jt','I\'m gonna make you an offer you can\'t refuse.',2.2]],
  storm:[['doves','Our eggs! The nest is bare!',1.8],['jt','No scheme this time. Let\'s go, crew!',2]]}[b.k];
 cutscene(lines,()=>{b.st=b.st==='intro'?'idle':b.st})}
function bossAction(p){const b=G.boss;if(!b||b.st==='done')return false;const n=G.nd;
 if(b.k==='sal'&&b.st==='break'&&b.broom&&Math.abs(b.broom.x-p.x)<80&&n&&n.st==='follow'){n.st='broom';n.t=0;n.task={x:b.broom.x,y:GY,done:()=>hideBroom(b)};AU.fx('wiggle');return true}
 if(b.k==='mo'&&b.st==='dizzy'&&Math.abs(b.x-p.x)<110&&n&&n.st==='follow'){n.st='tickle';n.t=0;n.task={x:b.x,y:GY,done:()=>tickleMo(b)};return true}
 if(b.k==='truck'){let best=null,bd=80;for(const bin of b.bins)if(bin.st==='ready'){const d=Math.abs(bin.x-p.x);if(d<bd){bd=d;best=bin}}if(best){if(sendNoodles(best)){best.boss=1;return true}}}
 return false}
function bossScore(b,txt){b.prog++;b.hitT=0.6;AU.fx('bosshit');G.score+=1000;shake(6);if(txt)ftxt(G.p.x,G.p.y-110,txt,'#ffe060',1);if(b.prog>=b.need)bossWin(b)}
function bossWin(b){b.st='done';G.shots.length=0;const p=G.p;
 const L={sal:[['sal','My broom! Where is my... HA! HA HA!',2],['jt','Here, Sal. Let me help you sweep.',2]],truck:[['gus','Have a good one, little guys!',2]],poodles:[['puff','HA HA HA! Look at you all!',2],['parrot','I HAVE A POM-POM TAIL!',1.8]],
  mo:[['mo','Okay, okay! Hee hee! You win!',2],['mo','Nobody touches these bins but you two.',2.2]],storm:[['doves','Thank you, Jimothy Timothy. Our eggs are safe and warm.',2.6]]}[b.k];
 if(G.nd){G.nd.st='laugh'}AU.music('win');cutscene(L,()=>{G.won=1;G.wonT=1.2;AU.fx('clear')})}
/* ---- Sal: dust waves, then a break; hide his broom 3 times ---- */
function hideBroom(b){if(b.st!=='break')return;b.broom.hid=1;const spots=['the lamp','the fish tank','a flower pot','the barber pole'];b.spot=spots[b.prog%spots.length];b.st='search';b.t=0;AU.fx('giggle');
 say('sal','J.T.! Where is my broom?!',1.6);later(1.2,()=>say('jt','What broom? I don\'t see a broom.',1.6));bossScore(b,'BROOM HIDDEN!')}
function updSal(b,dt){const p=G.p,A=G.arena;b.t+=dt;b.face=sgn(p.x-b.x)||-1;
 if(b.st==='sweep'){if(b.t>0){b.t=-(b.prog>=2?1.1:1.5);b.n++;AU.fx('sweep');b.anim=0.5;G.shots.push({k:'dust',x:b.x-40,y:GY,vx:-(240+b.prog*30),life:3.6,r:18});
   if(b.prog>=1&&b.n%3===0)later(0.45,()=>{if(b.st==='sweep')G.shots.push({k:'dust',x:b.x-40,y:GY,vx:-(240+b.prog*30),life:3.6,r:18})})}
  if(b.n>=4){b.n=0;b.st='break';b.t=0;const bx_=clamp(p.x+(p.x<(A.x0+A.x1)/2?220:-220),A.x0+80,A.x1-160);b.broom={x:bx_,y:GY};AU.fx('charge');say('sal','Break time. Where\'s my comb...',1.8)}}
 else if(b.st==='break'){if(b.t>5.5){b.st='sweep';b.t=-1;b.broom=null;say('sal','Back to work!',1.2)}}
 else if(b.st==='search'){if(b.t>3){b.st='sweep';b.t=-1.2;b.n=0;say('sal','In '+b.spot+'?! Hmph!',1.6);b.broom=null}}
 if(b.anim>0)b.anim-=dt;
 if(Math.abs(b.x-p.x)<46&&p.y>GY-40)hurtPlayer(p,b.x,'Shoo!')}
/* ---- Big Gus: the truck lifts every bin on its route. Get there first! ---- */
function newTruckRound(b){const A=G.arena;b.round++;b.bins=[6,13,20].map(c=>({k:'bin',x:A.x0+c*TS,y:GY,st:'ready',w:44,h:56}));b.tx=A.x1+200;b.tst='drive';b.tt=0;b.tsp=48+b.round*14;b.ci=0;b.canT=2}
function updTruck(b,dt){const p=G.p,A=G.arena;b.tt+=dt;
 if(b.tst==='drive'){b.tx-=b.tsp*dt;const nb=b.bins.find(x=>x.st!=='gone'&&x.st!=='lifted'&&Math.abs(x.x-(b.tx-60))<8);if(nb){if(nb.st==='busy'){/* Noodles inside: truck waits politely */b.tx+=b.tsp*dt;if(!b.waitSay){b.waitSay=1;say('gus','Huh. That bin is wiggling.',1.6)}}else{b.tst='lift';b.tt=0;b.lb=nb;AU.fx('beep')}}
  b.canT-=dt;if(b.canT<=0&&b.tx<A.x1+60){b.canT=rand(2.2,3.4)-b.round*0.3;G.shots.push({k:'can',x:b.tx-140,y:GY-14,vx:-rand(170,210),vy:-100,r:14,rot:0})}
  if(b.tx<A.x0-320){if(b.prog<b.need)newTruckRound(b)}}
 else if(b.tst==='lift'){if(b.tt>2){b.tst='drive';b.lb.st=b.lb.st==='empty'?'gone':'lifted';if(b.lb.st==='lifted'){ftxt(b.lb.x,GY-90,'GUS GOT IT!','#ffd0a0',0)}b.lb=null;b.waitSay=0}}
 for(const bin of b.bins)if(bin.boss&&bin.st==='empty'&&!bin.counted){bin.counted=1;bossScore(b,'BAG SAVED!')}
 /* the truck drives in the street lane behind the sidewalk: it never touches the crew */}
/* ---- Poodle Day: lure a dashing poodle through a hairspray cloud -> POOF ---- */
function updPoodles(b,dt){const p=G.p,A=G.arena;b.sprayT-=dt;
 if(b.sprayT<=0){b.sprayT=rand(2.6,3.4);const x=clamp(p.x+rand(-200,200),A.x0+120,A.x1-80);b.clouds.push({x,y:GY-40,r:50,t:0,life:5.5,from:b.puffX+40});AU.fx('spray');b.sprayAnim=0.5}
 if(b.sprayAnim>0)b.sprayAnim-=dt;
 for(const c of b.clouds){c.t+=dt;c.life-=dt;if(Math.random()<0.3)P({x:c.x+rand(-c.r,c.r)*0.8,y:c.y+rand(-30,30),vx:rand(-15,15),vy:-8,l:1,m:1,s:rand(8,15),c:'rgba(255,170,210,.55)',g:0,puff:1});
  if(Math.hypot(c.x-p.x,c.y-(p.y-30))<c.r+10)p.slow=0.3}
 b.clouds=b.clouds.filter(c=>c.life>0);
 for(const d of b.dogs){d.t-=dt;
  if(d.st==='sit'){d.face=sgn(p.x-d.x)||-1;if(d.t<=0){d.st='dash';d.vx=d.face*(360+b.prog*25);d.tgt=p.x+d.face*140;AU.fx('meow');if(Math.random()<0.5)say('dog'+d.n,'Yip yip!',0.7)}}
  else if(d.st==='dash'){d.x+=d.vx*dt;d.anim=(d.anim||0)+dt;if(Math.random()<0.4)dust(d.x,GY,1);
   const hit=b.clouds.find(c=>Math.abs(c.x-d.x)<c.r);
   if(hit){hit.life=0;d.st='fluff';d.t=2.4;AU.fx('poof');burst(d.x,GY-40,40,['#fff','#ffe0f0','#ffc0dc'],380,1.1,7,200);shake(8);b.puffs=(b.puffs||0)+1;G.ents.push({k:'bag',x:d.x,y:GY-60,fall:1,vy:-300});bossScore(b,'POOF!')}
   else if((d.vx>0&&(d.x>d.tgt||d.x>A.x1-40))||(d.vx<0&&(d.x<d.tgt||d.x<A.x0+90))){d.st='sit';d.t=rand(0.9,1.8);d.x=clamp(d.x,A.x0+90,A.x1-40)}
   if(Math.abs(d.x-p.x)<38&&p.y>GY-46)hurtPlayer(p,d.x,'Whoa, poodle!')}
  else if(d.st==='fluff'){if(d.t<=0){d.st='sit';d.t=1.5}}}
 if(Math.random()<0.002&&!G.npc.some(n=>n.k==='parrot')){G.npc.push({k:'parrot',x:G.cam.x+viewW+40,y:G.cam.y+60,vx:-240,t:0});say('parrot','SHHH! IT\'S A SECRET MISSION!',2)}}
/* ---- Mo: pounce -> dizzy -> Noodles tickles ---- */
function tickleMo(b){if(b.st!=='dizzy')return;b.st='giggle';b.t=0;AU.fx('giggle');say('mo','Hee hee! Stop it!',1.2);bossScore(b,'TICKLE!')}
function updMo(b,dt){const p=G.p,A=G.arena;b.t+=dt;
 const land=()=>{const gy=groundY(b.x);if(b.y>=gy&&b.vy>0){b.y=gy;return true}return false};
 if(b.st==='stalk'){b.face=sgn(p.x-b.x)||-1;b.x+=b.face*70*dt;b.y=groundY(b.x);if(b.t>1.3){b.st='crouch';b.t=0}}
 else if(b.st==='crouch'){if(b.t>0.65){b.st='pounce';b.t=0;b.face=sgn(p.x-b.x)||-1;const dx=clamp(p.x-b.x,-420,420);b.vx=dx/0.75;b.vy=-560;AU.fx('meow');b.pn=(b.pn||0)+1}}
 else if(b.st==='pounce'){b.vy+=GRAV*0.85*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.x=clamp(b.x,A.x0+40,A.x1-40);if(land()){shake(5);AU.fx('land');dust(b.x,b.y,8);
   if(b.prog>=2&&b.pn%2===1){b.st='crouch';b.t=0.15}else{b.st='dizzy';b.t=0;say('mo','Whoa... the room is spinning...',1.4)}}}
 else if(b.st==='dizzy'){if(b.t>2.2){b.st='stalk';b.t=0}}
 else if(b.st==='giggle'){if(b.t>1){b.st='hop';b.t=0;const to=b.x<(A.x0+A.x1)/2?A.x1-100:A.x0+100;b.vx=(to-b.x)/0.8;b.vy=-620}}
 else if(b.st==='hop'){b.vy+=GRAV*0.85*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.x=clamp(b.x,A.x0+40,A.x1-40);if(land()){b.st='stalk';b.t=-0.4}}
 if((b.st==='pounce'||b.st==='stalk')&&Math.abs(b.x-p.x)<46&&Math.abs((b.y-30)-(p.y-30))<54)hurtPlayer(p,b.x,'Mrrow!')}
/* ---- Big Storm: carry soft hair puffs to the nests (doves' nest first) ---- */
function updStorm(b,dt){const p=G.p,A=G.arena;b.puffT-=dt;
 if(b.puffT<=0&&b.puffs.length<3&&!b.carry){b.puffT=rand(1.2,2);const left=Math.random()<0.5;b.puffs.push({x:left?A.x0+20:A.x1-20,y:rand(GY-150,GY-30),vx:(left?1:-1)*rand(40,70),t:rand(0,6),soft:b.nests[0].n<b.nests[0].need})}
 const gs=G.gust;for(const f of b.puffs){f.t+=dt;f.x+=(f.vx+(gs&&gs.on?gs.dir*90:0))*dt;f.y+=Math.sin(f.t*2)*20*dt;if(f.x<A.x0+10||f.x>A.x1-10)f.vx*=-1;f.x=clamp(f.x,A.x0+10,A.x1-10);
  if(!b.carry&&Math.abs(f.x-p.x)<34&&f.y>p.y-p.h-20&&f.y<p.y+10){f.dead=1;b.carry=1;AU.fx('curl');ftxt(p.x,p.y-90,'SOFT HAIR!','#fff',0)}}
 b.puffs=b.puffs.filter(f=>!f.dead);
 const tgt=b.nests.find(n=>n.n<n.need);b.tgt=tgt;
 if(b.carry&&tgt&&Math.abs(tgt.x-p.x)<46&&Math.abs(tgt.y-p.y)<24&&p.onG){b.carry=0;tgt.n++;AU.fx('coo');burst(tgt.x,tgt.y-10,14,['#fff','#e8c890'],200,0.6,4,300);bossScore(b,tgt.doves?'SOFTEST HAIR FIRST!':'NEST LINED!')}
 if(b.carry&&b.nests.some(n=>n!==tgt&&n.n<n.need&&Math.abs(n.x-p.x)<46&&Math.abs(n.y-p.y)<24)&&!(b.hintCd>0)){b.hintCd=2.5;say('jt','The doves\' nest first!',1.4)}if(b.hintCd>0)b.hintCd-=dt;
 b.flashT=(b.flashT||rand(5,8))-dt;if(b.flashT<=0){b.flashT=rand(6,10);flash('#ffffff',0.35);later(0.3,()=>AU.fx('thunder'))}}
function updBoss(dt){const b=G.boss;if(!b||b.st==='done'||b.st==='intro'||G.p.cut){if(b&&b.k==='truck'&&b.st==='intro')return;return}b.hitT=Math.max(0,b.hitT-dt);
 ({sal:updSal,truck:updTruck,poodles:updPoodles,mo:updMo,storm:updStorm})[b.k](b,dt)}

/* ===== top-down Jeep runs: the red solar Power Wheels. Sun = charge. Top speed: a fast walk. ===== */
const RX0=178,RX1=542,RW=720;
function buildDrive(st){const T=st.track,r=rng(T.seed),o=[];let s=520;const L=T.len;
 /* guaranteed charge spots so every run is beatable on a fresh battery */
 const sunEvery=T.night?900:1100;for(let y=900;y<L-400;y+=sunEvery*(0.85+r()*0.3)){const w=rand2(r,150,260),x=rand2(r,RX0+w/2,RX1-w/2);o.push({k:T.night?'flies':'sun',s:y,x,w,h:rand2(r,220,320)})}
 const capAt=[0.28,0.55,0.82];capAt.forEach((f,i)=>o.push({k:'cap',s:L*f,x:rand2(r,RX0+30,RX1-30),id:i}));
 let bags=0;
 while(s<L-300){s+=rand2(r,150,240);const q=r();
  if(q<T.cones*0.35){const x=rand2(r,RX0+30,RX1-30);o.push({k:'cone',s,x});if(r()<0.4)o.push({k:'cone',s,x:clamp(x+(r()<0.5?-70:70),RX0+20,RX1-20)})}
  else if(q<T.cones*0.35+T.puddles*0.25)o.push({k:'puddle',s,x:rand2(r,RX0+40,RX1-40),w:rand2(r,70,120)});
  else if(q<T.cones*0.35+T.puddles*0.25+T.pigeons*0.25)o.push({k:'pigeon',s,x:r()<0.5?RX0-20:RX1+20,dir:0,t:0});
  else if(bags<T.bags&&r()<0.5){o.push({k:'bag',s,x:rand2(r,RX0+30,RX1-30)});bags++}
  else{const x=rand2(r,RX0+40,RX1-40);for(let i=0;i<4;i++)o.push({k:'curl',s:s+i*40,x})}}
 if(T.clouds>0)for(let y=1200;y<L;y+=rand2(r,900,1500)/T.clouds*0.4)o.push({k:'shade',s:y,x:rand2(r,RX0,RX1),w:rand2(r,240,380),h:rand2(r,260,420),vx:rand2(r,-30,30)});
 return o.sort((a,b)=>a.s-b.s)}
function rand2(r,a,b){return a+r()*(b-a)}
function startDrive(){const st=G.st,T=st.track;G.mode='drive';
 const D=G.D={s:0,x:360,vx:0,v:0,batt:0,bmax:has('panel')?130:100,hop:0,spin:0,slow:0,hp:3+(has('wagon')?1:0),inv:0,objs:buildDrive(st),len:T.len,night:!!T.night,rain:!!T.rain,sweep:T.sweeper?{s:-520}:null,charge:0,flies:0,honk:0,fin:0};
 D.batt=D.bmax;D.maxhp=D.hp;G.clock={now:T.clock.start,start:T.clock.start,end:T.clock.end,rate:T.clock.rate,what:T.clock.what}}
function driveSun(D){/* is the jeep on a charge spot (and not under a cloud)? */
 for(const o of D.objs){if(o.k!=='sun'&&o.k!=='flies')continue;if(o.gone||(o.k==='flies'&&D.bedtime&&!o.left))continue;if(Math.abs(o.s-D.s)<o.h/2&&Math.abs(o.x-D.x)<o.w/2){if(o.k==='flies')return o;for(const c of D.objs)if(c.k==='shade'&&Math.abs(c.s-D.s)<c.h/2&&Math.abs(c.x-D.x)<c.w/2)return null;return o}}return null}
function updDrive(dt){const D=G.D,c=G.clock;D.inv=Math.max(0,D.inv-dt);D.slow=Math.max(0,D.slow-dt);D.honk=Math.max(0,D.honk-dt);
 if(G.won||D.dead){D.v*=0.95;D.s+=D.v*dt;if(D.dead){D.deadT-=dt;if(D.deadT<=0)driveRetry()}return}
 if(G.p.cut)return;
 c.now+=dt/c.rate;if(has('watch')&&c.end-c.now<1&&!c.warned){c.warned=1;AU.fx('beep');toast('⌚ Beep beep! One minute left!')}
 if(c.now>=c.end){c.now=c.end;driveFail('Out of time!');return}
 const sun=driveSun(D);D.charge=sun?1:0;
 if(sun){D.batt=Math.min(D.bmax,D.batt+(sun.k==='flies'?38:30)*dt);if(frame%10===0)AU.fx('charge');if(sun.k==='flies'&&!sun.left){sun.left=1;D.flies++;if(D.flies===3)say('jt','Firefly power! ...Wait, where are you going?',2);
   if(D.flies>=4&&!D.bedtime){D.bedtime=1;say('nd','They went home. It\'s their bedtime!',2)}}}
 else D.batt=Math.max(0,D.batt-4.6*dt);
 const push=D.batt<=0;let top=push?105:(250*(sun&&has('shades')&&!D.night?1.15:1));if(D.slow>0)top*=0.5;
 D.v+=(top-D.v)*Math.min(1,dt*(D.v<top?1.6:4));
 const want=(inp.R?1:0)-(inp.L?1:0);D.vx+=((want*280)-D.vx)*Math.min(1,dt*(D.hop>0?2:8));if(D.spin>0){D.spin-=dt;D.vx*=0.9}
 D.x=clamp(D.x+D.vx*dt,RX0+22,RX1-22);D.s+=D.v*dt;
 if(push&&!D.pushSaid){D.pushSaid=1;say('jt','No charge! Push, Noodles, push!',1.8);AU.fx('nope')}if(!push)D.pushSaid=0;
 if(D.hop>0)D.hop-=dt;else if(inp.jumpP){D.hop=0.55;AU.fx('jump')}
 if(inp.actP){D.honk=0.4;AU.fx('honk');const R=has('horn')?520:300;for(const o of D.objs)if(o.k==='pigeon'&&!o.fly&&o.s>D.s&&o.s-D.s<R){o.fly=1;AU.fx('coo')}}
 for(const o of D.objs){const ds=o.s-D.s;if(ds<-400)continue;if(ds>900)break;
  if(o.k==='pigeon'&&!o.fly){if(ds<520){o.t+=dt;if(!o.dir)o.dir=o.x<360?1:-1;o.x+=o.dir*55*dt;if(o.x<RX0-40||o.x>RX1+40)o.dir*=-1}}
  if(o.k==='pigeon'&&o.fly){o.fy=(o.fy||0)+dt*200;o.x+=(o.x<360?-1:1)*160*dt}
  if(o.k==='shade')o.x+=o.vx*dt;
  if(o.gone||Math.abs(ds)>40||Math.abs(o.x-D.x)>(o.w?o.w/2:26))continue;
  const air=D.hop>0;
  if(o.k==='cone'&&!air&&Math.abs(ds)<34&&Math.abs(o.x-D.x)<30){o.gone=1;o.fly=1;AU.fx('bump');if(D.inv<=0){D.hp--;D.inv=1.2;D.slow=0.6;shake(6);say('jt','Bonk! Sorry, cone!',1.2);if(D.hp<=0)driveFail('Out of hearts!')}}
  else if(o.k==='puddle'&&!air&&Math.abs(ds)<30){if(D.spin<=0){D.spin=0.6;D.slow=0.5;AU.fx('splash');say('nd','Wheee! Splash!',1)}}
  else if(o.k==='pigeon'&&!o.fly&&!air&&Math.abs(ds)<30&&Math.abs(o.x-D.x)<34){o.fly=1;D.slow=0.4;AU.fx('coo');say('patty','Coo! Watch it, Boss!',1.2)}
  else if(o.k==='bag'&&Math.abs(ds)<36&&Math.abs(o.x-D.x)<40){o.gone=1;G.bags++;G.score+=250;AU.fx('bag');if(G.bags===1&&G.st.id==='2-2')say('steve','Oops. I dropped it again.',1.6)}
  else if(o.k==='cap'&&Math.abs(ds)<36&&Math.abs(o.x-D.x)<40){o.gone=1;G.caps[o.id]=1;G.score+=500;AU.fx('cap')}
  else if(o.k==='curl'&&Math.abs(ds)<30&&Math.abs(o.x-D.x)<34){o.gone=1;G.curls++;G.score+=10;AU.fx('curl')}}
 if(D.sweep){const w=D.sweep;w.s+=218*dt;if(w.s<D.s-700)w.s=D.s-700;if(w.s>D.s-70&&D.inv<=0){D.hp--;D.inv=1.4;w.s=D.s-420;AU.fx('bump');shake(8);say('jt','Hey! I\'m not trash!',1.4);if(D.hp<=0)driveFail('Swept up!')}}
 if(D.s>=D.len&&!G.won){G.won=1;G.wonT=2;AU.fx('ching');later(0.3,()=>AU.fx('clear'));G.clockLeft=c.end-c.now;G.score+=Math.round(G.clockLeft*100)+G.bags*100;say('jt','Made it! Smooth.',1.8)}}
function driveFail(msg){const D=G.D;if(D.dead)return;D.dead=1;D.deadT=1.6;G.deadMsg=msg;G.deaths++;AU.fx('over')}
function driveRetry(){G.lives--;SESSION.lives=G.lives;if(G.lives<=0){G.lives=0;overScreen();return}toast(G.deadMsg+' Try again!',1600);G.bags=0;startDrive();G.p.cut=0}

/* ===== rendering: painted backdrops, terrain, characters (J.T. run rig), bubbles, HUD, top-down drive ===== */
const PAT={};
function pat(n){if(PAT[n])return PAT[n];const im=IMG[n];if(!im)return '#6a6a6a';const p=c.createPattern(im,'repeat');try{p.setTransform(new DOMMatrix().scale(0.5))}catch(e){}return PAT[n]=p}
function hsh(x,y){let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296}
function rr(x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else{c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}}
function otext(s,x,y,size,col='#fff',al='left',font='"Lilita One"'){c.font=size+'px '+font+',sans-serif';c.textAlign=al;c.lineJoin='round';c.strokeStyle='rgba(0,0,0,.75)';c.lineWidth=Math.max(3,size/5);c.strokeText(s,x,y);c.fillStyle=col;c.fillText(s,x,y)}
function heart(x,y,s,full){c.save();c.translate(x,y);c.scale(s/20,s/20);c.beginPath();c.moveTo(0,6);c.bezierCurveTo(-10,-2,-10,-10,-5,-10);c.bezierCurveTo(-2,-10,0,-7,0,-5);c.bezierCurveTo(0,-7,2,-10,5,-10);c.bezierCurveTo(10,-10,10,-2,0,6);
 c.fillStyle=full?'#ff4d6d':'rgba(0,0,0,.35)';c.fill();c.lineWidth=2.2;c.strokeStyle='#fff';c.stroke();if(full){c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(-4.5,-6,2,0,TAU);c.fill()}c.restore()}
/* ---------- camera ---------- */
function camUpdate(dt,snap){const p=G.p,cm=G.cam;let tx=p.x-viewW*0.38+p.vx*0.3,ty=p.y-VV*0.66;
 if(G.arena){const a=G.arena,aw=a.x1-a.x0;tx=aw<=viewW?a.x0+aw/2-viewW/2:clamp(p.x-viewW/2,a.x0-20,a.x1-viewW+20)}
 tx=clamp(tx,0,Math.max(0,G.L.W-viewW));const ymax=LVH+40-VV,ymin=Math.min(-40,ymax);ty=clamp(ty,ymin,ymax);
 if(snap){cm.x=tx;cm.y=ty}else{cm.x+=(tx-cm.x)*Math.min(1,dt*6);cm.y+=(ty-cm.y)*Math.min(1,dt*4)}}
/* ---------- backdrop ---------- */
function drawBG(){const Wd=G.world,im=IMG[Wd.bg];const g=c.createLinearGradient(0,0,0,gameH);g.addColorStop(0,Wd.sky[0]);g.addColorStop(1,Wd.sky[1]);c.fillStyle=g;c.fillRect(0,0,W,gameH);if(!im)return;
 const camx=G.mode==='drive'?0:G.cam.x;const groundSy=(LVH-80-G.cam.y)*S;/* bottom 20% of the painting is plain ground: sit it on the level ground line */
 const h=Math.max(gameH*1.02,groundSy/0.86),w=h*im.width/im.height,off=-((camx*S*0.22)%(w*2)),y=groundSy-h*0.86;
 for(let i=0,x=off;x<W;i++,x+=w){c.save();if(i%2){c.translate(x+w,y);c.scale(-1,1);c.drawImage(im,0,0,w,h)}else c.drawImage(im,x,y,w,h);c.restore()}
 if(y>0){c.fillStyle=Wd.sky[0];c.globalAlpha=1;const gg=c.createLinearGradient(0,0,0,y+2);gg.addColorStop(0,Wd.sky[0]);gg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gg;c.fillRect(0,0,W,y+2)}
 c.fillStyle=Wd.night?'rgba(30,10,60,.12)':Wd.storm?'rgba(30,40,60,.18)':'rgba(255,255,255,.06)';c.fillRect(0,0,W,gameH)}
/* ---------- terrain ---------- */
function drawTiles(){const Wd=G.world,T=G.L.T,x0=Math.max(0,Math.floor(G.cam.x/TS)-1),x1=Math.min(G.L.cols-1,Math.ceil((G.cam.x+viewW)/TS)+1);const P=pat(Wd.ter);
 for(let tx=x0;tx<=x1;tx++){const col=T[tx];let y=0;while(y<ROWS){if(col[y]===1){let e=y;while(e<ROWS&&col[e]===1)e++;const Y=y*TS,X=tx*TS;c.save();c.translate(0,Y);c.fillStyle=P;c.fillRect(X,0,TS+0.6,(e-y)*TS+(e>=ROWS?140:0));c.restore();
   c.fillStyle='rgba(0,0,0,.3)';if(tx>0&&!solidK(T[tx-1][y]))c.fillRect(X,Y,5,(e-y)*TS+140);if(tx<G.L.cols-1&&!solidK(T[tx+1][y]))c.fillRect(X+TS-5,Y,5,(e-y)*TS+140);
   c.fillStyle='rgba(255,255,255,.18)';c.fillRect(X,Y,TS+0.6,2);y=e}else y++}}
 for(let tx=x0;tx<=x1;tx++){const col=T[tx];for(let ty=0;ty<ROWS;ty++){const k=col[ty],X=tx*TS,Y=ty*TS;
  if(k===2){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(X+2,Y+12,TS-4,6);c.fillStyle=Wd.plank;rr(X,Y,TS+0.5,14,4);c.fill();c.fillStyle='rgba(255,255,255,.25)';c.fillRect(X+3,Y+2,TS-6,3);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(X+TS-2,Y,2,14);
   if(col[ty]===2&&(tx===0||T[tx-1][ty]!==2)){c.fillStyle='rgba(60,40,20,.8)';c.fillRect(X+6,Y+14,4,TS*0.6)}if(tx<G.L.cols-1&&T[tx+1][ty]!==2){c.fillStyle='rgba(60,40,20,.8)';c.fillRect(X+TS-10,Y+14,4,TS*0.6)}}
  else if(k===3){c.fillStyle='#c0813e';c.fillRect(X,Y,TS,TS);c.fillStyle='#93582a';c.fillRect(X,Y,TS,4);c.fillRect(X,Y+TS-4,TS,4);c.fillRect(X,Y,4,TS);c.fillRect(X+TS-4,Y,4,TS);
   c.strokeStyle='#7a4420';c.lineWidth=4;c.beginPath();c.moveTo(X+4,Y+4);c.lineTo(X+TS-4,Y+TS-4);c.stroke();c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.strokeRect(X+0.5,Y+0.5,TS-1,TS-1)}}}}
/* ---------- characters ---------- */
function shadow(x,y,w){c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(x,y,w,5,0,0,TAU);c.fill()}
const JT_RUN=['jt_run1','jt_run2','jt_run3','jt_run4'];
function drawJT(p){if(p.inv>0&&Math.floor(p.inv*14)%2&&!p.dead&&p.inv<1.3)return;let n='jt_idle',bob=0,rot=0,sx=1,sy=1;
 const run=p.onG&&Math.abs(p.vx)>25;
 if(p.dead||p.inv>1.25)n='jt_dizzy';else if(!p.onG){n='jt_jump';rot=clamp(p.vy/2400,-0.12,0.18)*p.face}
 else if(p.act>0||(p.cut&&G.talk.some(t=>t.who==='jt')))n='jt_point';
 else{n='rig';if(!run){const br=Math.sin(G.t*3);sy=1+br*0.012;sx=1-br*0.008}}
 if(p.squash>0){sx*=1+p.squash*0.16;sy*=1-p.squash*0.14}
 if(p.onG)shadow(p.x,p.y,22);
 if(n==='rig'&&drawJTRig(p,p.x,p.y+3,p.face<0,sx,sy)){}else{if(n==='rig')n='jt_idle';if(p._ramt)p._ramt=0;c.save();c.translate(p.x,p.y+3+bob);c.rotate(rot);c.scale(sx,sy);spr(n,0,0,1.0,p.face<0);c.restore()}
 if(p.slow>0){c.globalAlpha=0.5;c.fillStyle='#ffb0d0';for(let i=0;i<3;i++){c.beginPath();c.arc(p.x+Math.sin(G.t*4+i*2)*16,p.y-30-i*14,9,0,TAU);c.fill()}c.globalAlpha=1}
 if(G.treat){spr('fish',p.x+p.face*14,p.y-58,0.8,p.face<0)}
 if(G.boss&&G.boss.k==='storm'&&G.boss.carry)fluffBall(p.x,p.y-p.h-18,14)}
function fluffBall(x,y,r){c.fillStyle='#fffaf0';for(let i=0;i<6;i++){const a=i/6*TAU+G.t;c.beginPath();c.arc(x+Math.cos(a)*r*0.5,y+Math.sin(a)*r*0.4,r*0.6,0,TAU);c.fill()}c.fillStyle='#f0dcb8';c.beginPath();c.arc(x,y,r*0.45,0,TAU);c.fill()}
function drawNoodles(n){if(!n)return;let name='nd_wink',x=n.x,y=n.y,rot=0,fl=n.face<0,sc=1,bob=0;
 if(n.st==='follow'||n.st==='go'||n.st==='tickle'||n.st==='broom'){if(Math.abs(n.vx)>30||n.st!=='follow'){name='rig'}else{bob=Math.sin(G.t*4)*1;n._rph=0;n._ramt=0}
  if(n.giggle>0){rot=Math.sin(G.t*30)*0.12}}
 else if(n.st==='dive'){name='nd_dive';rot=Math.sin(G.t*22)*0.08;fl=n.face<0;x=n.x-n.face*14}
 else if(n.st==='pop'){name='nd_hair'}
 else if(n.st==='laugh'){name='nd_laugh';rot=Math.sin(G.t*8)*0.06}
 shadow(x,y,14);if(name==='rig'){if(n._lx===undefined)n._lx=x;const v=Math.abs(x-n._lx)/Math.max(1/120,G.dtR||1/60);n._lx=x;c.save();c.translate(x,y+2);c.rotate(rot);drawNdRig(n,0,0,fl,Math.max(v,n.st!=='follow'?300:0));c.restore()}else{n._lx=x;c.save();c.translate(x,y+2+bob);c.rotate(rot);spr(name,0,0,sc,fl);c.restore()}
 if(n.st==='dive'&&n.stuck){otext('TAP ACTION!',n.x,n.y-62,14,'#fff6a0','center');}}
/* KneeRig (King Juju, Oct 30 2026): jointed limbs for single-pose art.
   Legs: thigh / shin / foot pieces cut from the art (capsules, image px) re-posed with 2-bone IK, so knees bend. The planted foot
   moves back at exactly ground speed (no foot slip); the swing foot kicks back, lifts and arcs forward.
   Cadence (Peter): walk ~1.5-2 steps/s, run ~2.5-3 steps/s; above that the stride gets longer (more air time), never faster legs.
   Arms: upper arm + forearm pieces, shoulder swings opposite the legs at the same rhythm, elbow bends more on the forward swing.
   Everything blends back to the art pose in ~150 ms when the character stops.
   Spec: {S stance sweep px, lift px, kick px (back-kick when running), s0 max stance fraction, vw walk speed / vr run speed (art px/s),
          bob px, kb knee side (+1/-1 image x; 0 = keep the art's bend),
          legs:[{h,k,a,f:[x0,y0,x1,y1],rt,rs,rf,o,far,sh,su}], arms:[{s,e,w,ru,rf,fp?:[[x,y]..] forearm+hand polygon,o,far,A,E}]} */
const KneeRig=(()=>{const C=new WeakMap(),PI=Math.PI,TAU=PI*2,K={clock:()=>performance.now()};
 function cap(x,a,b,r){const g=Math.atan2(b[1]-a[1],b[0]-a[0]);x.moveTo(a[0]+Math.sin(g)*r,a[1]-Math.cos(g)*r);x.arc(b[0],b[1],r,g-PI/2,g+PI/2);x.arc(a[0],a[1],r,g+PI/2,g+PI*1.5);x.closePath()}
 function poly(x,p){x.moveTo(p[0][0],p[0][1]);for(const q of p)x.lineTo(q[0],q[1]);x.closePath()}
 function cv(W,H){const o=document.createElement('canvas');o.width=W;o.height=H;return o}
 function piece(im,fn){const o=cv(im.width,im.height),x=o.getContext('2d');x.beginPath();fn(x);x.clip();x.drawImage(im,0,0);return o}
 function dark(src,W,H,clipY,al){const u=cv(W,H),x=u.getContext('2d');x.beginPath();x.rect(0,0,W,clipY);x.clip();x.drawImage(src,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(40,20,10,'+al+')';x.fillRect(0,0,W,H);return u}
 const ang=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]),dist=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
 function prep(im,R){let P=C.get(R);if(P&&P.im===im)return P;const W=im.width,H=im.height,body=cv(W,H),bx=body.getContext('2d');bx.drawImage(im,0,0);bx.globalCompositeOperation='destination-out';const U=[];
  const legs=(R.legs||[]).map(l=>{const f0=[l.f[0],l.f[1]],f1=[l.f[2],l.f[3]],e=l.e!==undefined?l.e:1;
   const ey=l.v?l.h[1]+(l.v.keep!==undefined?l.v.keep:0.5)*(l.k[1]-l.h[1]):l.h[1]+e;
   bx.save();bx.beginPath();bx.rect(0,ey,W,H);bx.clip();for(const q of[[l.h,l.k,l.rt],[l.k,l.a,l.rs],[f0,f1,l.rf]]){bx.beginPath();cap(bx,q[0],q[1],q[2]+(R.ep||0.6));bx.fill()}bx.restore();
   const L1=dist(l.h,l.k),L2=dist(l.k,l.a),t0=ang(l.h,l.k),s0=ang(l.k,l.a),b0=ang(l.h,l.a);let side=Math.atan2(Math.sin(t0-b0),Math.cos(t0-b0));side=Math.abs(side)>0.06?Math.sign(side):0;
   const th=piece(im,x=>{x.rect(0,l.h[1]-(l.ht!==undefined?l.ht:2),W,H);x.clip();x.beginPath();cap(x,l.h,l.k,l.rt)});
   if(l.sh!==0&&!l.v)U.push(dark(th,W,H,l.h[1]+(l.k[1]-l.h[1])*(l.su||1),l.sh||0.4));
   return{l,L1,L2,t0,s0,side,th,sh:piece(im,x=>cap(x,l.k,l.a,l.rs)),ft:piece(im,x=>cap(x,f0,f1,l.rf))}});
  const arms=(R.arms||[]).map(m=>{const up=piece(im,x=>cap(x,m.s,m.e,m.ru)),fo=piece(im,x=>m.fp?poly(x,m.fp):cap(x,m.e,m.w,m.rf));
   bx.beginPath();cap(bx,m.s,m.e,m.ru+0.6);bx.fill();bx.beginPath();if(m.fp)poly(bx,m.fp);else cap(bx,m.e,m.w,m.rf+0.6);bx.fill();
   U.push(dark(up,W,H,H,m.sh||0.35),dark(fo,W,H,H,m.sh||0.35));return{m,up,fo}});
  bx.globalCompositeOperation='destination-over';for(const u of U)bx.drawImage(u,0,0);
  let cr=0;for(const g of legs){const l=g.l,R2=0.97*(g.L1+g.L2);for(let c=0;c<40;c+=0.25){if(Math.hypot(R.S/2+Math.abs(l.a[0]-l.h[0]),l.a[1]-l.h[1]-c)<=R2){cr=Math.max(cr,c);break}}}
  P={im,body,legs,arms,cr};C.set(R,P);return P}
 /* cycles/s for a speed v (art px/s): ~0.85 (1.7 steps/s) walking at vw, ~1.4 (2.8 steps/s) running at vr and above */
 function cadence(R,v){const vw=R.vw||R.S*2,vr=R.vr||vw*3,r=Math.max(0,Math.min(1,(v-vw)/(vr-vw)));return (R.cw||0.85)+((R.cr||1.4)-(R.cw||0.85))*r}
 /* advance from world x (k = world px per art px, flip = art drawn mirrored, on = feet on the ground) */
 function step(o,x,k,flip,R,on){const n=K.clock(),dt=o._kt?Math.min(0.1,(n-o._kt)/1000):0;o._kt=n;let dx=o._kx===undefined?0:x-o._kx;o._kx=x;
  if(Math.abs(dx)>120||on===false)dx=0;const di=dx/k*(flip?-1:1),ad=Math.abs(di);if(ad>0.03){o._km=n;o._kd=Math.sign(di)}const mv=on!==false&&o._km&&n-o._km<90;
  if(dt>0)o._kv=(o._kv||0)+(ad/dt-(o._kv||0))*Math.min(1,dt*6);const v=o._kv||0,D=Math.max(R.S/R.s0,v/cadence(R,v));o._kD=D;o._ku=((o._ku||0)+ad/D)%1;
  const tg=mv?1:0,a=o._ka||0;o._ka=a+Math.sign(tg-a)*Math.min(Math.abs(tg-a),dt/(R.bl||0.15));return o}
 function pose(P,R,o){const a0=o._ka||0,A=a0*a0*(3-2*a0),S=R.S,s=Math.min(R.s0,S/(o._kD||S/R.s0)),u=o._ku||0,dir=o._kd||1,run=Math.max(0,Math.min(1,(R.s0-s)/(R.s0*0.7)));
  const by=A*(P.cr+(R.bob||0)*(0.5+0.5*Math.cos(TAU*u*2))*(1-run*0.5)-run*(R.bob||0)*0.6*Math.max(0,Math.sin(TAU*u*2)));
  const legs=P.legs.map(g=>{const l=g.l,q=((u+(l.o||0))%1+1)%1;let X,Y=0,sw=0;if(q<s)X=S/2-S*q/s;else{const v=(q-s)/(1-s),e=v*v*(3-2*v);sw=Math.sin(PI*v);
    X=-S/2+S*e-run*(R.kick||0)*Math.sin(PI*Math.min(1,v*1.6));Y=-(R.lift*(1+run*0.6))*sw}
   const ax=l.a[0]+dir*X*A,ay=l.a[1]+Y*A,hx=l.h[0],hy=l.h[1]+by;let d=Math.hypot(ax-hx,ay-hy);d=Math.min(Math.max(d,Math.abs(g.L1-g.L2)+0.01),g.L1+g.L2-0.01);
   const base=Math.atan2(ay-hy,ax-hx),off=Math.acos(Math.max(-1,Math.min(1,(g.L1*g.L1+d*d-g.L2*g.L2)/(2*g.L1*d))));let sd=g.side;
   if(!sd){const kb=(R.kb||1);sd=Math.cos(base+off)*kb>=Math.cos(base-off)*kb?1:-1}const t=base+sd*off,kx=hx+g.L1*Math.cos(t),ky=hy+g.L1*Math.sin(t),st=Math.atan2(ay-ky,ax-kx);
   return{g,hx,hy,kx,ky,ax,ay,tr:t-g.t0,sr:st-g.s0,fr:(st-g.s0)*(R.fk!==undefined?R.fk:0.5)*sw*A,stance:q<s}});
  const arms=P.arms.map(g=>{const m=g.m,w=Math.cos(TAU*(u+(m.o||0))),Am=(m.A||0.3)*(1+run*0.5),Em=(m.E||0.35)*(1+run*0.6);
   const sa=-dir*Am*w*A,ea=-dir*(Em*(0.5+0.5*w)+run*0.25)*A,ex=m.s[0]+(m.e[0]-m.s[0])*Math.cos(sa)-(m.e[1]-m.s[1])*Math.sin(sa),ey=m.s[1]+by+(m.e[0]-m.s[0])*Math.sin(sa)+(m.e[1]-m.s[1])*Math.cos(sa);
   return{g,sx:m.s[0],sy:m.s[1]+by,sa,ex,ey,fa:sa+ea}});
  return{A,by,legs,arms}}
 function blit(x,img,p0,px,py,r){x.save();x.translate(px,py);if(r)x.rotate(r);x.translate(-p0[0],-p0[1]);x.drawImage(img,0,0);x.restore()}
 function vleg(x,L){const v=L.g.l.v,ol=v.ol||1.6;x.save();x.lineCap='round';x.lineJoin='round';
  const seg=(w,c)=>{x.strokeStyle=c;x.lineWidth=w[0];x.beginPath();x.moveTo(L.hx,L.hy);x.lineTo(L.kx,L.ky);x.stroke();x.lineWidth=w[1];x.beginPath();x.moveTo(L.kx,L.ky);x.lineTo(L.ax,L.ay);x.stroke()};
  seg([v.wt+ol*2,v.ws+ol*2],v.line);seg([v.wt,v.ws],v.col);if(v.hi){x.globalAlpha=0.35;seg([v.wt*0.35,v.ws*0.35],v.hi)}x.restore();blit(x,L.g.ft,L.g.l.a,L.ax,L.ay,L.fr)}
 function leg(x,L){const l=L.g.l;if(l.v)return vleg(x,L);blit(x,L.g.ft,l.a,L.ax,L.ay,L.fr);blit(x,L.g.sh,l.k,L.kx,L.ky,L.sr);blit(x,L.g.th,l.h,L.hx,L.hy,L.tr)}
 function arm(x,M){const m=M.g.m;blit(x,M.g.fo,m.e,M.ex,M.ey,M.fa);blit(x,M.g.up,m.s,M.sx,M.sy,M.sa)}
 /* draw in art space (ctx transformed so 1 unit = 1 art px, art top-left at 0,0) */
 function draw(x,im,R,o){if(!im||!im.width)return;const a=o&&o._ka||0;if(a<0.002){x.drawImage(im,0,0);return}const P=prep(im,R),Q=pose(P,R,o);o._kf=Q.legs.map(L=>[L.ax,L.ay,L.stance]);
  for(const M of Q.arms)if(M.g.m.far)arm(x,M);for(const L of Q.legs)if(L.g.l.far)leg(x,L);x.drawImage(P.body,0,Q.by);for(const L of Q.legs)if(!L.g.l.far)leg(x,L);for(const M of Q.arms)if(!M.g.m.far)arm(x,M)}
 K.step=step;K.draw=draw;K.prep=prep;K.cadence=cadence;return K})();
const MO_RIG={"S":16,"lift":7,"kick":5,"s0":0.5,"vw":60,"vr":200,"bob":1.5,"kb":-1,"legs":[{"h":[64,143],"k":[62,151],"a":[61,160],"f":[49,164,74,164],"rt":14,"rs":13,"rf":8.5,"o":0,"v":{"wt":17,"ws":14,"col":"#f08c12","line":"#7a3410","hi":"#ffc070","keep":0.4}},{"h":[110,143],"k":[112,151],"a":[113,160],"f":[100,164,127,164],"rt":16,"rs":14,"rf":8.5,"o":0.5,"v":{"wt":18,"ws":15,"col":"#f08c12","line":"#7a3410","hi":"#ffc070","keep":0.4}}],"fk":0.25};
const POODLE_RIG={"S":20,"lift":6,"kick":3,"s0":0.5,"vw":150,"vr":700,"cw":1.0,"cr":2.6,"bob":3,"fk":0.3,"legs":[{"h":[20,97],"k":[14,104],"a":[9,111],"f":[9,111,2,120],"rt":4,"rs":4,"rf":7.5,"o":0.0,"far":1,"v":{"wt":6,"ws":5,"col":"#cdbcae","line":"#8a7468","keep":0.3}},{"h":[42,99],"k":[46,106],"a":[50,113],"f":[51,113,62,124],"rt":4.5,"rs":4.5,"rf":8,"o":0.55,"v":{"wt":7,"ws":6,"col":"#f8ecdc","line":"#9a8478","keep":0.3}},{"h":[57,100],"k":[61,105],"a":[66,110],"f":[66,110,74,118],"rt":4,"rs":4,"rf":6.5,"o":0.65,"far":1,"v":{"wt":6,"ws":5,"col":"#cdbcae","line":"#8a7468","keep":0.3}},{"h":[95,99],"k":[95,105],"a":[93,112],"f":[93,112,87,121],"rt":4,"rs":4,"rf":7.5,"o":0.25,"far":1,"v":{"wt":6,"ws":5,"col":"#cdbcae","line":"#8a7468","keep":0.3}},{"h":[120,100],"k":[124,107],"a":[129,115],"f":[129,115,139,124],"rt":4.5,"rs":4.5,"rf":8,"o":0.8,"v":{"wt":7,"ws":6,"col":"#f8ecdc","line":"#9a8478","keep":0.3}},{"h":[135,100],"k":[139,105],"a":[142,109],"f":[142,109,150,118],"rt":4,"rs":4,"rf":7,"o":0.9,"far":1,"v":{"wt":6,"ws":5,"col":"#cdbcae","line":"#8a7468","keep":0.3}}],"ep":1.8};
function kneeSpr(n,o,x,y,sc,flip,R,wx){const im=IMG[n];if(!im)return;const k=.5*sc;KneeRig.step(o,wx===undefined?x:wx,k,flip,R);c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.scale(k,k);c.translate(-im.width/2,-im.height);KneeRig.draw(c,im,R,o);c.restore()}
function drawBin(e){if(e.st==='gone'||e.st==='lifted')return;let wob=0;if(e.st==='busy'&&G.nd&&G.nd.st==='dive'&&G.nd.task&&G.nd.task.bin===e)wob=Math.sin(G.t*25)*0.05;
 c.save();c.translate(e.x,e.y+2);c.rotate(wob);spr(e.st==='ready'?'binopen':'bin',0,0,1);c.restore();
 if(e.st==='ready'&&Math.sin(G.t*4+e.x)>0.6){c.fillStyle='rgba(255,240,160,.9)';c.beginPath();c.arc(e.x+rand(-14,14),e.y-62+rand(-6,6),2.5,0,TAU);c.fill()}
 if(e.st==='shut'){c.fillStyle='rgba(30,20,10,.85)';rr(e.x-28,e.y-92,56,22,8);c.fill();otext('⏰'+fmtClock(e.open),e.x,e.y-75,13,'#ffe080','center','"Baloo 2"')}
 if(e.st==='ready'&&G.nd&&G.nd.st==='follow'&&Math.abs(e.x-G.p.x)<80){c.globalAlpha=0.6+0.4*Math.sin(G.t*8);otext('ACTION!',e.x,e.y-80,14,'#a0ff80','center');c.globalAlpha=1}}
function drawLamp(x,y,h){c.fillStyle='#2a2a32';c.fillRect(x-3,y-h,6,h);c.fillRect(x-10,y-6,20,6);c.beginPath();c.moveTo(x-12,y-h);c.lineTo(x+12,y-h);c.lineTo(x+8,y-h-16);c.lineTo(x-8,y-h-16);c.fill();
 c.fillStyle=G.world.night?'#ffe8a0':'#fff6d0';c.beginPath();c.arc(x,y-h-6,6,0,TAU);c.fill();if(G.world.night){c.globalAlpha=0.25;c.fillStyle='#ffe080';c.beginPath();c.arc(x,y-h-6,40,0,TAU);c.fill();c.globalAlpha=1}}
function drawEnt(e){if(e.dead)return;const t=G.t;switch(e.k){
 case 'bin':drawBin(e);break;
 case 'curl':spr('curl',e.x,e.y+11+Math.sin(t*3+e.x)*3,1,false,1,0);break;
 case 'cap':{c.save();c.translate(e.x,e.y+8+Math.sin(t*2+e.x)*3);c.scale(Math.cos(t*3),1);spr('cap',0,0,1.1);c.restore();c.globalAlpha=0.4+0.3*Math.sin(t*5);c.fillStyle='#fff6a0';c.beginPath();c.arc(e.x,e.y,16,0,TAU);c.fill();c.globalAlpha=1;break}
 case 'fish':spr('fish',e.x,e.y+11+Math.sin(t*3)*2,0.9);break;
 case 'bag':spr('hairbag',e.x,e.y+20,1);break;
 case 'bow':spr('bow',e.x,e.y+14+Math.sin(t*3)*2,0.9);break;
 case 'treat':{c.fillStyle='#d04a3a';c.beginPath();c.ellipse(e.x,e.y+10,18,6,0,0,TAU);c.fill();spr('fish',e.x,e.y+6,0.8);if(!e.home)otext('MO',e.x,e.y+22,11,'#fff','center');break}
 case 'spr':spr('sprinkler',e.x,e.y+2,0.8);if(e.on){c.fillStyle='rgba(150,210,255,.35)';c.beginPath();c.moveTo(e.x-6,e.y-20);c.lineTo(e.x-26,e.y-120);c.lineTo(e.x+26,e.y-120);c.lineTo(e.x+6,e.y-20);c.fill()}break;
 case 'cloud':c.globalAlpha=0.55;c.fillStyle='#ffb0d4';for(let i=0;i<7;i++){const a=i/7*TAU+t*0.6;c.beginPath();c.arc(e.x+Math.cos(a)*e.r*0.55,e.y+Math.sin(a)*e.r*0.35,e.r*0.5,0,TAU);c.fill()}c.globalAlpha=1;break;
 case 'cat':{const fl=(e.face||-1)>0;if(e.st==='nap'){spr('mo_purr',e.x,e.y+2,0.42,false);otext('z',e.x+18,e.y-50-Math.sin(t*2)*4,12,'#fff','center')}else if(e.st==='grump'||e.st==='chase'){kneeSpr('mo_tough',e,e.x,e.y+2,0.42,fl,MO_RIG)}else{e._ka=0;e._kx=undefined;spr('mo_pounce',e.x,e.y+2,0.42,fl)}break}
 case 'door':{c.fillStyle='#4a2a1a';rr(e.x-26,e.y-110,52,110,6);c.fill();c.fillStyle='#e04040';c.fillRect(e.x+30,e.y-104,10,70);c.fillStyle='#fff';for(let i=0;i<4;i++)c.fillRect(e.x+30,e.y-98+i*16+((t*20)%16),10,5);
  spr(e.sweep>0?'sal_sweep':'sal_search',e.x-6,e.y+2,0.42,true);break}
 case 'patty':spr('patty',e.x,e.y+2,0.62,!e.on);if(e.on){c.fillStyle='#ffe060';c.beginPath();c.arc(e.x+18,e.y-70,4,0,TAU);c.fill()}break;
 case 'goal':if(G.st.goal==='doves'){spr('nest',e.x,e.y-56,1);spr('doves',e.x,e.y-60,0.8);c.fillStyle='#6a4a2a';c.fillRect(e.x-4,e.y-60,8,60)}else{drawLamp(e.x,e.y,130);spr('katie',e.x+4,e.y-140,0.62,true)}
  if(G.bags>=G.st.need&&!G.won){c.globalAlpha=0.5+0.5*Math.sin(t*6);otext('BRING IT HERE!',e.x,e.y-200,15,'#a0ff80','center');c.globalAlpha=1}break;
 case 'sign':{c.fillStyle='#6a4a2a';c.fillRect(e.x-3,e.y-56,6,56);c.font='13px "Lilita One",sans-serif';const w=Math.max(70,c.measureText(e.text).width+18);c.fillStyle='#c89a5a';rr(e.x-w/2,e.y-84,w,30,6);c.fill();c.strokeStyle='#6a4a2a';c.lineWidth=2;c.stroke();c.fillStyle='#3a2210';c.textAlign='center';c.fillText(e.text,e.x,e.y-64);break}}}
function drawShot(s){if(s.k==='can'){c.save();c.translate(s.x,s.y);c.rotate(s.rot);spr('can',0,0,0.6,false,1,0,0.5);c.restore()}
 else if(s.k==='dust'){c.fillStyle='rgba(190,170,140,.75)';for(let i=0;i<4;i++){c.beginPath();c.arc(s.x+i*9-12,s.y-10-Math.abs(Math.sin(G.t*10+i))*12,10-i,0,TAU);c.fill()}}
 else if(s.k==='twig'){if(s.warn>0){c.globalAlpha=0.3+0.4*Math.sin(G.t*20);c.fillStyle='#000';c.beginPath();c.ellipse(s.x,s.gy,20,6,0,0,TAU);c.fill();c.globalAlpha=1}else{c.save();c.translate(s.x,s.y);c.rotate(s.rot);c.strokeStyle='#5a3a1a';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(-18,0);c.lineTo(18,0);c.moveTo(4,0);c.lineTo(12,-10);c.stroke();c.fillStyle='#4a8a2a';c.beginPath();c.ellipse(12,-12,6,3,0.5,0,TAU);c.fill();c.restore()}}}
function drawNpc(n){if(n.k==='parrot')spr('parrot',n.x,n.y+Math.sin(n.t*8)*8,0.5,true);else if(n.k==='steve')spr('steve',n.x,n.y+Math.sin(n.t*8)*8,0.5,false);else if(n.k==='ducks')spr('ducks',n.x,n.y+2,0.7,true)}
/* ---------- bosses ---------- */
function drawBoss(b){if(!b)return;const t=G.t;
 if(b.k==='sal'){const n=b.st==='search'?'sal_search':b.st==='break'||b.st==='done'?'sal_laugh':'sal_sweep';shadow(b.x,b.y,40);c.save();c.translate(b.x,b.y+2);if(b.anim>0)c.rotate(Math.sin(b.anim*20)*0.05);spr(n,0,0,0.62,b.face<0);c.restore();
  if(b.broom&&!b.broom.hid){const br=b.broom;c.globalAlpha=0.35+0.3*Math.sin(t*8);c.fillStyle='#fff6a0';c.beginPath();c.arc(br.x,br.y-34,34,0,TAU);c.fill();c.globalAlpha=1;spr('broom',br.x,br.y+2,0.7);otext('!',br.x,br.y-82+Math.sin(t*6)*3,26,'#ffe060','center')}}
 else if(b.k==='truck'){for(const bin of b.bins)if(bin!==b.lb)drawBin(bin);const lift=b.tst==='lift'?Math.sin(clamp(b.tt/2,0,1)*Math.PI):0;
  if(b.lb){c.save();c.translate(b.lb.x+(b.tx-60-b.lb.x)*lift*0.3,b.lb.y-lift*120);c.rotate(-lift*1.2);spr('bin',0,0,1);c.restore()}
  shadow(b.tx,GY,120);spr('truck_side',b.tx,GY+4,1,true)}
 else if(b.k==='poodles'){spr('puff',b.puffX,GY+2,0.52,false);if(b.sprayAnim>0){c.fillStyle='rgba(255,170,210,.6)';c.beginPath();c.arc(b.puffX+50+(0.5-b.sprayAnim)*80,GY-80,12,0,TAU);c.fill()}
  for(const cl of b.clouds){c.globalAlpha=Math.min(0.6,cl.life);c.fillStyle='#ffa8d0';for(let i=0;i<8;i++){const a=i/8*TAU+t*0.5;c.beginPath();c.arc(cl.x+Math.cos(a)*cl.r*0.55,cl.y+Math.sin(a)*cl.r*0.45,cl.r*0.52,0,TAU);c.fill()}c.globalAlpha=1}
  for(const d of b.dogs){shadow(d.x,GY,30);if(d.st==='fluff'){spr('poodles',d.x,GY+2,0.62,d.face<0);c.fillStyle='rgba(255,250,252,.95)';for(let i=0;i<9;i++){const a=i/9*TAU;c.beginPath();c.arc(d.x+Math.cos(a)*34,GY-44+Math.sin(a)*30,20+Math.sin(t*6+i)*2,0,TAU);c.fill()}c.fillStyle='#222';c.beginPath();c.arc(d.x-8,GY-48,3,0,TAU);c.arc(d.x+8,GY-48,3,0,TAU);c.fill()}
   else kneeSpr('poodles',d,d.x,GY+2,0.62,d.face<0,POODLE_RIG)}}
 else if(b.k==='mo'){const n=b.st==='dizzy'?'mo_dizzy':b.st==='giggle'||b.st==='done'?'mo_purr':b.st==='pounce'||b.st==='hop'?'mo_pounce':'mo_tough';shadow(b.x,groundY(b.x),34);
  c.save();c.translate(b.x,b.y+2);if(b.st==='crouch'){c.scale(1.08,0.88);c.rotate(Math.sin(t*30)*0.03)}if(n==='mo_tough')kneeSpr(n,b,0,0,0.62,b.face>0,MO_RIG,b.x);else{b._ka=0;b._kx=undefined;spr(n,0,0,0.62,b.face>0)}c.restore();
  if(b.st==='dizzy'&&G.nd&&Math.abs(b.x-G.p.x)<110){c.globalAlpha=0.6+0.4*Math.sin(t*8);otext('ACTION: TICKLE!',b.x,b.y-120,15,'#a0ff80','center');c.globalAlpha=1}}
 else if(b.k==='storm'){for(const n of b.nests){spr('nest',n.x,n.y+6,1.2);if(n.doves)spr('doves',n.x,n.y-14,0.7);const full=n.n>=n.need;if(full){fluffBall(n.x,n.y-8,12)}
   else if(b.tgt===n){c.globalAlpha=0.6+0.4*Math.sin(t*6);otext('▼',n.x,n.y-(n.doves?96:40)+Math.sin(t*5)*4,22,'#a0ff80','center');c.globalAlpha=1}}
  for(const f of b.puffs){fluffBall(f.x,f.y,f.soft?16:13)}}}
/* ---------- speech bubbles ---------- */
function speakerPos(who){const p=G.p;if(G.mode==='drive')return{x:G.D.x,y:G.D.s,drive:1};
 if(who==='jt')return{x:p.x,y:p.y-p.h-26};if(who==='nd'&&G.nd)return{x:G.nd.x,y:G.nd.y-54};
 const B=G.boss;if(B){if(who==='sal'&&B.k==='sal')return{x:B.x,y:B.y-170};if(who==='gus'&&B.k==='truck')return{x:B.tx,y:GY-160};if(who==='puff'&&B.k==='poodles')return{x:B.puffX+20,y:GY-150};if(who==='mo'&&B.k==='mo')return{x:B.x,y:B.y-120};if(who==='doves'&&B.k==='storm')return{x:B.nests[0].x,y:B.nests[0].y-90};if(who.startsWith('dog')){const d=B.dogs&&B.dogs.find(d=>'dog'+d.n===who);if(d)return{x:d.x,y:GY-90}}}
 let best=null,bd=1e9;for(const e of G.ents){let ok=false;if(who==='katie'&&e.k==='goal')ok=1;if(who==='doves'&&e.k==='goal')ok=1;if(who==='patty'&&e.k==='patty')ok=1;if(who==='sal'&&e.k==='door')ok=1;if(who.startsWith('cat')&&e.k==='cat'&&'cat'+e.x===who)ok=1;
  if(ok){const d=Math.abs(e.x-p.x);if(d<bd){bd=d;best={x:e.x,y:e.y-(e.k==='goal'?(G.st.goal==='doves'?120:220):e.k==='door'?130:90)}}}}
 for(const n of G.npc)if(n.k===who||(who==='ducks'&&n.k==='ducks'))best={x:n.x,y:n.y-(n.k==='ducks'?90:50)};
 return best||{x:G.cam.x+viewW/2,y:G.cam.y+60}}
const NAMES={jt:'J.T.',nd:'Noodles',katie:'Katie',patty:'Patty',sal:'Sal',gus:'Big Gus',puff:'Miss Puff',mo:'Mo',doves:'Adam & Eve',parrot:'Peter',steve:'Steve',ducks:'Quack Pack'};
function drawBubbles(){c.font='bold 15px "Baloo 2",sans-serif';let stack=0;
 for(const t of G.talk){if(!t.text)continue;const sp=speakerPos(t.who);let X,Y;
  if(sp.drive){X=W/2;Y=(portrait?gameH*0.18:gameH*0.2)+stack*70;stack++}else{X=(sp.x-G.cam.x)*S;Y=(sp.y-G.cam.y)*S}
  const maxW=Math.min(W*0.7,250),words=t.text.split(' '),lines=[];let cur='';for(const w of words){const tt=cur?cur+' '+w:w;if(c.measureText(tt).width>maxW-20&&cur){lines.push(cur);cur=w}else cur=tt}lines.push(cur);
  const bw=Math.min(maxW,Math.max(...lines.map(l=>c.measureText(l).width))+22),bh=lines.length*19+(NAMES[t.who]?26:12);
  X=clamp(X,bw/2+6,W-bw/2-6);Y=clamp(Y,bh+6+SAFE.t+(portrait?64:0),gameH-10);const a=Math.min(1,t.t*4,(t.m-t.t+0.2)*6);c.globalAlpha=clamp(a,0,1);
  c.fillStyle='rgba(0,0,0,.25)';rr(X-bw/2+3,Y-bh+3,bw,bh,12);c.fill();c.fillStyle='#fffdf4';rr(X-bw/2,Y-bh,bw,bh,12);c.fill();c.strokeStyle='#3a2a1a';c.lineWidth=2.5;c.stroke();
  c.beginPath();c.moveTo(X-8,Y-1);c.lineTo(X,Y+10);c.lineTo(X+8,Y-1);c.fillStyle='#fffdf4';c.fill();
  let ty=Y-bh+18;if(NAMES[t.who]){c.font='13px "Lilita One",sans-serif';c.fillStyle='#c0501a';c.textAlign='left';c.fillText(NAMES[t.who],X-bw/2+11,ty);ty+=18}
  c.font='bold 15px "Baloo 2",sans-serif';c.fillStyle='#2a1a0a';c.textAlign='left';for(const l of lines){c.fillText(l,X-bw/2+11,ty+1);ty+=19}c.globalAlpha=1}}
/* ---------- particles ---------- */
function drawParts(){for(const q of G.parts){const a=clamp(q.l/q.m,0,1);c.globalAlpha=a;if(q.z){otext('z',q.x,q.y,12,'#fff','center');continue}if(q.ring){c.strokeStyle=q.c;c.lineWidth=q.w*a;c.beginPath();c.arc(q.x,q.y,q.s*(1-a)+6,0,TAU);c.stroke()}
 else if(q.leaf){c.fillStyle=q.c;c.save();c.translate(q.x,q.y);c.rotate(q.l*6);c.fillRect(-q.s,-q.s/2,q.s*2,q.s);c.restore()}else{c.fillStyle=q.c;c.beginPath();c.arc(q.x,q.y,q.puff?q.s*(1.3-a*0.3):q.s,0,TAU);c.fill()}}c.globalAlpha=1;
 for(const tx of G.texts){const a=clamp(tx.l/tx.m*2,0,1);c.globalAlpha=a;otext(tx.s,tx.x,tx.y,tx.big?22:16,tx.c,'center')}c.globalAlpha=1}
/* ---------- side world ---------- */
function drawSide(){c.save();c.translate(-G.cam.x,-G.cam.y);drawTiles();
 for(const e of G.ents)if(e.k!=='bin')drawEnt(e);for(const e of G.ents)if(e.k==='bin')drawEnt(e);
 drawBoss(G.boss);for(const n of G.npc)drawNpc(n);
 drawNoodles(G.nd);if(!G.p.dead||G.p.y<LVH+200)drawJT(G.p);for(const s of G.shots)drawShot(s);
 for(const f of G.fly)spr('hairbag',f.x,f.y+18,0.7);for(const f of G.fly2)if(f.t>0&&f.t<1)spr('hairbag',lerp(f.x,f.tx,f.t),lerp(f.y,f.ty,f.t)-Math.sin(f.t*Math.PI)*80+18,0.6);
 drawParts();
 if(G.hints&&!G.boss&&!G.won){const tg=hintTarget();if(tg){const dx=tg.x-G.p.x;if(Math.abs(dx)>30){const ax=G.p.x+clamp(dx,-90,90),ay=G.p.y-G.p.h-40;c.save();c.translate(ax,ay);c.rotate(dx>0?0:Math.PI);c.globalAlpha=0.7+0.3*Math.sin(G.t*6);c.fillStyle='#fff';c.strokeStyle='#5a9a4a';c.lineWidth=3;c.beginPath();c.moveTo(16,0);c.lineTo(-4,-12);c.lineTo(-4,-5);c.lineTo(-16,-5);c.lineTo(-16,5);c.lineTo(-4,5);c.lineTo(-4,12);c.closePath();c.fill();c.stroke();c.restore()}}}
 c.restore()}
function hintTarget(){const p=G.p;if(G.bags+G.fly.length>=G.st.need)return G.ents.find(e=>e.k==='goal');let best=null,bd=1e9;for(const e of G.ents)if(e.k==='bin'&&(e.st==='ready'||e.st==='shut')){const d=Math.abs(e.x-p.x)+(e.x<p.x?300:0);if(d<bd){bd=d;best=e}}return best}
/* ---------- weather / ambience (screen space) ---------- */
let AMB=[];function ambient(dt){const Wd=G.world;const want=Wd.storm||(G.mode==='drive'&&G.D.rain)?80:Wd.night?24:G.st.w===2?14:0;while(AMB.length<want)AMB.push({x:rand(0,W),y:rand(0,gameH),v:rand(0.6,1),t:rand(0,9)});AMB.length=Math.min(AMB.length,want);
 for(const a of AMB){a.t+=dt;if(Wd.storm||(G.mode==='drive'&&G.D.rain)){a.y+=900*a.v*dt;a.x-=250*a.v*dt;if(a.y>gameH){a.y=-10;a.x=rand(0,W+200)}c.strokeStyle='rgba(200,220,255,.45)';c.lineWidth=1.5;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(a.x-6,a.y+18);c.stroke()}
  else if(Wd.night){a.x+=Math.sin(a.t*0.7)*20*dt;a.y+=Math.cos(a.t*0.5)*14*dt;const g=0.5+0.5*Math.sin(a.t*3);c.fillStyle='rgba(255,240,120,'+(0.4+g*0.5)+')';c.beginPath();c.arc(a.x,a.y,2+g*1.5,0,TAU);c.fill()}
  else{a.y+=18*a.v*dt;a.x+=Math.sin(a.t)*12*dt;if(a.y>gameH){a.y=-10;a.x=rand(0,W)}c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.arc(a.x,a.y,4,0,TAU);c.arc(a.x+4,a.y+2,3,0,TAU);c.fill()}}}
/* ---------- top-down drive ---------- */
let DS=1;function driveScale(){DS=portrait?W/540:gameH/560;return DS}
function drawDrive(){const D=G.D,ds=driveScale(),carY=gameH*0.74;const ox=W/2-360*ds;const toY=s=>carY-(s-D.s)*ds;
 c.fillStyle=G.world.night||D.night?'#1e3a1e':'#5aa03a';c.fillRect(0,0,W,gameH);
 const im=IMG.road;if(im){const th=im.height*ds;let y0=(toY(0)%th)-th;y0=((carY+D.s*ds)%th)-th;for(let y=y0;y<gameH;y+=th)c.drawImage(im,ox,y,RW*ds,th)}
 c.save();c.translate(ox,0);c.scale(ds,ds);const sy=s=>(carY-(s-D.s)*ds)/ds;
 /* finish */
 const fy=sy(D.len);if(fy>-100&&fy<gameH/ds+100){for(let i=0;i<12;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?'#fff':'#222';c.fillRect(RX0+i*(RX1-RX0)/12,fy+j*14,(RX1-RX0)/12,14)}
  c.fillStyle='#c0501a';rr(250,fy-90,220,56,12);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();otext(G.st.track.dest||'MADE IT!',360,fy-52,28,'#fff','center')}
 for(const o of D.objs){const y=sy(o.s);if(y<-300||y>gameH/ds+200)continue;
  if(o.k==='sun'){c.globalAlpha=0.32+0.08*Math.sin(G.t*3);const g=c.createLinearGradient(o.x-o.w/2,0,o.x+o.w/2,0);g.addColorStop(0,'rgba(255,230,120,0)');g.addColorStop(0.5,'#fff2a0');g.addColorStop(1,'rgba(255,230,120,0)');c.fillStyle=g;c.fillRect(o.x-o.w/2,y-o.h/2,o.w,o.h);c.globalAlpha=1;otext('☀',o.x,y+10,30,'#ffe060','center')}
  else if(o.k==='flies'){if(!(D.bedtime&&!o.left)){for(let i=0;i<10;i++){const a=G.t*2+i*1.7;const fx=o.x+Math.cos(a)*o.w*0.4*hsh(i,3),fy2=y+Math.sin(a*0.8)*o.h*0.4;c.fillStyle='rgba(255,240,120,.9)';c.beginPath();c.arc(fx,fy2,4+Math.sin(a*3)*1.5,0,TAU);c.fill()}}}}
 for(const o of D.objs){const y=sy(o.s);if(y<-300||y>gameH/ds+200||o.gone&&!o.fly)continue;
  if(o.k==='shade'){c.fillStyle='rgba(20,30,60,.28)';c.beginPath();c.ellipse(o.x,y,o.w/2,o.h/2,0,0,TAU);c.fill();c.beginPath();c.ellipse(o.x+o.w*0.25,y-o.h*0.2,o.w*0.3,o.h*0.3,0,0,TAU);c.fill()}
  else if(o.k==='puddle'){c.fillStyle='rgba(70,140,220,.75)';c.beginPath();c.ellipse(o.x,y,o.w/2,o.w/3.2,0,0,TAU);c.fill();c.fillStyle='rgba(220,240,255,.6)';c.beginPath();c.ellipse(o.x-o.w*0.15,y-o.w*0.08,o.w*0.15,o.w*0.05,0,0,TAU);c.fill()}
  else if(o.k==='cone'){if(o.fly){o.fy=(o.fy||0)+1;if(o.fy>40)continue;c.globalAlpha=1-o.fy/40}c.fillStyle='#ff7a1a';c.beginPath();c.arc(o.x,y-(o.fy||0)*3,16,0,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(o.x,y-(o.fy||0)*3,10,0,TAU);c.fill();c.fillStyle='#ff7a1a';c.beginPath();c.arc(o.x,y-(o.fy||0)*3,5,0,TAU);c.fill();c.globalAlpha=1}
  else if(o.k==='pigeon'){if(o.fly&&(o.fy||0)>300)continue;spr('patty',o.x,y+20-(o.fy||0),0.38,o.dir<0)}
  else if(o.k==='bag'&&!o.gone)spr('hairbag',o.x,y+18,0.8);else if(o.k==='cap'&&!o.gone)spr('cap',o.x,y+10,1.1);else if(o.k==='curl'&&!o.gone)spr('curl',o.x,y+10,0.9)}
 /* sweeper */
 if(D.sweep){const y=sy(D.sweep.s);if(y<gameH/ds+200){c.save();c.translate(360,y+80);spr('truck_top',0,0,0.7);c.restore();c.fillStyle='rgba(200,220,255,.5)';for(let i=0;i<6;i++){c.beginPath();c.arc(300+i*24,y-50+Math.sin(G.t*20+i)*4,6,0,TAU);c.fill()}}}
 /* jeep */
 const hop=D.hop>0?Math.sin((0.55-D.hop)/0.55*Math.PI):0;c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(D.x+6,sy(D.s)+8,28,44,0,0,TAU);c.fill();
 c.save();c.translate(D.x,sy(D.s)-hop*16);c.scale(1+hop*0.15,1+hop*0.15);c.rotate(D.spin>0?D.spin*10:D.vx/2200);if(D.inv>0&&Math.floor(D.inv*12)%2)c.globalAlpha=0.5;spr('jeep_top',0,45,0.86,false,1,0,1);c.restore();
 if(D.charge){c.globalAlpha=0.6+0.4*Math.sin(G.t*12);otext('⚡',D.x+30,sy(D.s)-40,22,'#ffe060','center');c.globalAlpha=1}
 if(D.batt<=0){otext('PUSH!',D.x,sy(D.s)+70,18,'#ffb0a0','center')}
 if(D.honk>0){c.strokeStyle='rgba(255,255,255,'+D.honk*2+')';c.lineWidth=4;c.beginPath();c.arc(D.x,sy(D.s)-50,(0.4-D.honk)*200+20,-2.4,-0.7);c.stroke()}
 c.restore();
 if(D.night){/* lamp-lit night: darken, cut light around the jeep and headlights */const g=c.createRadialGradient(W/2,(sy(D.s)-60)*ds,20,W/2,(sy(D.s)-60)*ds,(has('lights')?300:200)*ds);const cx=ox+D.x*ds;
  c.save();c.fillStyle='rgba(10,10,40,.55)';c.beginPath();c.rect(0,0,W,gameH);c.moveTo(cx+(has('lights')?260:170)*ds,carY-60*ds);c.ellipse(cx,carY-110*ds,(has('lights')?110:80)*ds,(has('lights')?260:170)*ds,0,0,TAU,true);c.fill('evenodd');c.restore()}}
/* ---------- HUD ---------- */
function drawHUD(){const x=10+SAFE.l,y=8+SAFE.t;const drive=G.mode==='drive';const hp=drive?G.D.hp:G.p.hp,mh=drive?G.D.maxhp:G.p.maxhp;
 const pw=Math.min(W-120-SAFE.r-x,portrait?260:300);c.fillStyle='rgba(20,12,4,.5)';rr(x,y,pw,64,16);c.fill();
 c.save();c.beginPath();c.arc(x+31,y+32,25,0,TAU);c.fillStyle='#ffd27a';c.fill();c.clip();const im=IMG.jt_idle;if(im)c.drawImage(im,im.width*0.12,0,im.width*0.76,im.width*0.76,x+6,y+5,50,50);c.restore();c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(x+31,y+32,25,0,TAU);c.stroke();
 for(let i=0;i<mh;i++)heart(x+70+i*21,y+20,17,i<hp);otext('x'+G.lives,x+72+mh*21,y+26,16);
 spr('hairbag',x+78,y+59,0.38);const need=drive?0:G.st.need||0;otext(G.boss?'':(need?G.bags+'/'+need:String(G.bags)),x+92,y+55,16,need&&G.bags>=need?'#a0ff80':'#fff');
 spr('curl',x+144,y+55,0.5);otext(String(G.curls),x+156,y+55,15);
 for(let i=0;i<3;i++){c.globalAlpha=G.caps[i]?1:0.3;spr('cap',x+200+i*18,y+56,0.55);c.globalAlpha=1}
 /* clock */
 if(G.clock&&!G.boss){const cl=G.clock,left=cl.end-cl.now,cx=portrait?x:x+pw+10,cy=portrait?y+72:y;const cw=150;c.fillStyle=left<2?'rgba(140,20,10,.75)':'rgba(20,12,4,.5)';rr(cx,cy,cw,34,12);c.fill();spr('watch',cx+18,cy+31,0.5);
  otext(fmtClock(cl.now),cx+34,cy+24,19,left<2&&Math.floor(G.t*4)%2?'#ffb0a0':'#fff');c.font='12px "Baloo 2",sans-serif';otext('⏰ '+fmtClock(cl.end),cx+92,cy+23,13,'#ffe080')}
 if(drive){const D=G.D,bx0=portrait?x+160:x+pw+170,by0=portrait?y+72:y,bw=portrait?Math.min(W-bx0-14-SAFE.r,170):170;c.fillStyle='rgba(20,12,4,.5)';rr(bx0,by0,bw,34,12);c.fill();
  const f=D.batt/D.bmax;c.fillStyle='#222';rr(bx0+30,by0+9,bw-44,16,5);c.fill();c.fillStyle=f<0.25?'#ff5a3a':f<0.5?'#ffc23a':'#5ad04a';rr(bx0+31,by0+10,(bw-46)*f,14,4);c.fill();otext(D.charge?'⚡':'🔋',bx0+15,by0+25,17,'#fff','center');
  const py=(portrait?y+112:y+42),pwd=Math.min(W-2*x-SAFE.r,portrait?W-24:360);c.fillStyle='rgba(0,0,0,.35)';rr(x,py,pwd,10,5);c.fill();c.fillStyle='#ffd23a';rr(x,py,pwd*clamp(D.s/D.len,0,1),10,5);c.fill();spr('jeep_side',x+pwd*clamp(D.s/D.len,0,1),py+14,0.16);
  if(D.sweep){const sp=clamp(D.sweep.s/D.len,0,1);spr('truck_side',x+pwd*sp,py+14,0.1,false)}}
 /* boss bar */
 if(G.boss&&G.boss.st!=='intro'){const b=G.boss,bw=Math.min(W-28,340),bx0=(W-bw)/2,by0=portrait?y+76:y+70;c.fillStyle='rgba(20,12,4,.6)';rr(bx0,by0,bw,36,12);c.fill();otext(b.label,bx0+12,by0+24,15,'#ffe060');
  const seg=b.need,sw=(bw-130)/seg;for(let i=0;i<seg;i++){c.fillStyle=i<b.prog?'#ffd23a':'rgba(255,255,255,.18)';rr(bx0+122+i*sw,by0+10,sw-5,16,5);c.fill()}}
 if(G.banner>0){const a=clamp(G.banner,0,1);c.globalAlpha=a;const by=gameH*0.38;c.fillStyle='rgba(20,12,4,.65)';c.fillRect(0,by-38,W,72);otext(G.st.id+'  '+G.st.name,W/2,by+2,portrait?24:30,'#ffd23a','center');otext(G.world.name,W/2,by+26,15,'#fff','center');c.globalAlpha=1}}
function drawPadBG(){if(!portrait)return;const g=c.createLinearGradient(0,gameH,0,H);g.addColorStop(0,'#252c4c');g.addColorStop(1,'#10132a');c.fillStyle=g;c.fillRect(0,gameH,W,H-gameH);
 c.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<14;i++){c.fillRect(hsh(i,1)*W,gameH+hsh(i,2)*(H-gameH),2+hsh(i,3)*3,2+hsh(i,3)*3)}
 c.fillStyle='#ffd23a';c.fillRect(0,gameH,W,3)}
function render(){c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,W,H);if(!G||!G.st){c.fillStyle='#10132a';c.fillRect(0,0,W,H);return}
 c.save();c.beginPath();c.rect(0,0,W,gameH);c.clip();
 const sx=G.shake>0?rand(-G.shake,G.shake):0,sy=G.shake>0?rand(-G.shake,G.shake):0;
 if(G.mode==='drive'){c.save();c.translate(sx,sy);drawDrive();c.restore()}else{drawBG();c.save();c.translate(sx,sy);c.scale(S,S);drawSide();c.restore()}
 ambient(G.dtR||0.016);if(G.flash&&G.flash.a>0){c.globalAlpha=Math.min(1,G.flash.a);c.fillStyle=G.flash.c;c.fillRect(0,0,W,gameH);c.globalAlpha=1}
 drawBubbles();c.restore();drawPadBG();if(state==='play'||state==='pause')drawHUD()}

/* ===== procedural leg rig (render-only): legless body art + vector legs with real alternating strides.
   Stride phase follows horizontal speed, legs ease back to standing when stopped. See /workspace/leg-check/GUIDE.md ===== */
function rigLimb(x,y,a,len,w,fill,line){const ex=x+Math.sin(a)*len,ey=y+Math.cos(a)*len;c.lineCap='round';
 c.strokeStyle=line;c.lineWidth=w+3.4;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();
 c.strokeStyle=fill;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();return[ex,ey]}
function rigStep(o,dt,moving,v,stride,spd){if(o._rph===undefined){o._rph=0;o._ramt=0}
 o._ramt+=((moving?1:0)-o._ramt)*Math.min(1,dt*12);
 if(moving)o._rph=(o._rph+v*dt/stride)%1;
 else{const t=o._rph%0.5;o._rph+=(t<0.25?-t:0.5-t)*Math.min(1,dt*10)}
 return o._ramt*clamp(v/spd,0.5,1)}
/* J.T.: two legs, sprite px, origin = feet centre on the ground */
function jtLeg(hx,hy,t,amp,back){const s=Math.sin(t),cs=Math.cos(t);
 const th=0.05+amp*0.62*s,kn=0.1+amp*(1.35*Math.pow(Math.max(0,cs),1.3)+0.12*Math.max(0,-cs));
 const F=back?'#6f6866':'#8e8885',L=back?'#262020':'#3a3232';
 const k=rigLimb(hx,hy,th,17,back?15:17,F,L);c.fillStyle=F;c.beginPath();c.arc(k[0],k[1],back?7.5:8.5,0,TAU);c.fill();
 const sa=th-kn,a=rigLimb(k[0],k[1],sa,14,back?12:14,F,L);
 const fa=-sa*0.6-amp*0.25*Math.max(0,cs);
 c.save();c.translate(a[0],a[1]);c.rotate(fa);c.fillStyle=L;c.beginPath();c.ellipse(5,1,12.5,6.6,0,0,TAU);c.fill();
 c.fillStyle=back?'#cfc3b8':'#efe4da';c.beginPath();c.ellipse(5,0.2,10.8,5.2,0,0,TAU);c.fill();c.restore()}
function drawJTRig(p,x,y,flip,sx,sy){const im=IMG.jt_torso;if(!im)return false;
 const amp=rigStep(p,G.dtR||1/60,p.onG&&Math.abs(p.vx)>25,Math.abs(p.vx),118,PH.spd),t=p._rph*TAU;
 const bob=amp*4*Math.cos(2*t),lean=amp*0.07;
 c.save();c.translate(x,y);c.scale((flip?-1:1)*0.5*sx,0.5*sy);
 const hy=-33+bob;
 jtLeg(2,hy,t+Math.PI,amp,true);
 c.save();c.translate(10,hy);c.rotate(lean);c.translate(-10,-hy);c.drawImage(im,-57,-150+bob+Math.min(0,amp*2));
 c.fillStyle='#8e8885';c.beginPath();c.ellipse(12,hy-1,25,9,0,0,TAU);c.fill();c.restore();
 jtLeg(20,hy+1,t,amp,false);c.restore();return true}
/* Noodles: ferret bound, four short legs under the long body */
function ndLeg(hx,hy,t,amp,front,back){const s=Math.sin(t),cs=Math.cos(t),lift=Math.pow(Math.max(0,cs),1.3);
 const F=back?'#e4d6c8':'#fbf3ea',L=back?'#7a6658':'#8a7466';
 const up=(front?-0.05:0.08)+amp*0.75*s,lo=front?up+0.15-amp*0.9*lift:up-0.25-amp*0.9*lift;
 const k=rigLimb(hx,hy,up,11,back?8:9.5,F,L);const a=rigLimb(k[0],k[1],lo,10,back?6.5:7.5,F,L);
 c.fillStyle=L;c.beginPath();c.ellipse(a[0]+3,a[1]+1,6.4,3.6,0,0,TAU);c.fill();c.fillStyle=back?'#f0c8c0':'#ffd8d0';c.beginPath();c.ellipse(a[0]+3,a[1]+0.4,5,2.6,0,0,TAU);c.fill()}
function drawNdRig(n,x,y,flip,v){const im=IMG.nd_body;if(!im)return false;
 const amp=rigStep(n,G.dtR||1/60,v>20,v,70,420),t=n._rph*TAU,bob=amp*3*Math.cos(2*t+0.6),pitch=amp*0.06*Math.sin(2*t);
 c.save();c.translate(x,y);c.scale((flip?-1:1)*0.5,0.5);c.translate(0,bob);c.rotate(pitch);
 const BH=-22,BX=-24,FX=22;
 ndLeg(BX+5,BH,t+0.5,amp,false,true);ndLeg(FX+5,BH,t+Math.PI+0.5,amp,true,true);
 c.drawImage(im,-55,-65);c.fillStyle='#fbf3ea';c.beginPath();c.ellipse(0,BH+1,34,7,0,0,TAU);c.fill();
 ndLeg(BX,BH+1,t,amp,false,false);ndLeg(FX,BH+1,t+Math.PI,amp,true,false);
 c.restore();return true}

/* ===== menus (DOM) ===== */
const ui=$('ui');
function show(html,cls=''){if(window.SkipBtn)SkipBtn.hide();ui.innerHTML='<div class="scr '+cls+'">'+html+'</div>';document.body.classList.add('uiopen');gpIdx=0;
 ui.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();AU.unlock();AU.fx('menu');act(b.dataset.a,b.dataset.v)}));
 if(GP.on||kbUsed)setTimeout(()=>gpFocus(0,1),30);$('bgart').hidden=!(cls.includes('title')||cls.includes('menu'))}
let kbUsed=false;addEventListener('keydown',()=>kbUsed=true,{once:true});
function hideUI(){if(window.SkipBtn)SkipBtn.hide();ui.innerHTML='';document.body.classList.remove('uiopen');$('bgart').hidden=true}
function ctlLine(){return GP.on?'🎮 Stick/D-pad move · A jump · X or B action · Start pause':'Swipe &amp; hold to move · swipe up to jump · tap ACTION'}
function refreshCtlHint(){const h=document.querySelector('#ui .ctl');if(h)h.innerHTML=ctlLine()}
const LOGO=`<div class="logo"><div class="l1">JIMOTHY TIMOTHY</div><div class="l2">AND THE HAIR MOB</div><div class="l3">WORD ON THE STREET, THEY CALL HIM J.T.!</div></div>`;
function titleScreen(){state='title';G=null;AU.music('title');const cont=save.reached>0;
 show(`${LOGO}<div class="tbot"><div class="tbtns"><button class="btn go" data-a="play">▶ ${cont?'CONTINUE':'PLAY'}</button>${cont?'<button class="btn alt" data-a="new">NEW GAME</button>':''}
 <button class="btn alt" data-a="levels">MAP BOARD</button><button class="btn alt2" data-a="book">FOUND-IT BOOK</button><button class="btn dim" data-a="how">HOW TO PLAY</button></div>
 <p class="tag">"Today's trash, tomorrow's treasure!"</p>${save.best?'<p class="sub">Best score: '+save.best.toLocaleString()+'</p>':''}<p class="ctl sub">${ctlLine()}</p></div>`,'title')}
function storyScreen(i){/* Oct 30: SKIP button; once the intro has been seen, new games go straight to the first job */
 if(i===0&&window.SkipBtn&&SkipBtn.seen('hairmob-intro')){planScreen(0);return}
 state='story';const s=STORY_INTRO[i];
 show(`<img class="story" src="art/${s.img}.webp?v=${VERSION}" alt=""><p class="big">${s.t}</p><button class="btn go" data-a="story" data-v="${i+1}">NEXT ▶</button>`,'menu');AU.music('title');if(window.SkipBtn)SkipBtn.show(()=>{SkipBtn.seen('hairmob-intro',1);planScreen(0)})}
function planScreen(i){state='plan';const st=STAGES[i],Wd=WORLDS[st.w];const icon=st.kind==='drive'?'jeep_side':st.kind==='boss'?'jt_point':'jt_point';
 show(`<div class="board"><div class="bh">${st.id} · ${Wd.name.toUpperCase()}</div><h2>${st.name}</h2><div class="chalk"><div class="ct">THE PLAN</div>${st.plan.map((l,k)=>'<p>'+(k+1)+'. '+l+'</p>').join('')}</div>
 ${st.clock||st.track?'<p class="sched">⏰ '+(st.clock||st.track.clock).what+'</p>':''}<img class="who" src="art/${icon}.webp?v=${VERSION}" alt=""></div>
 <button class="btn go" data-a="go" data-v="${i}">LET'S GO!</button>`,'menu plan');AU.music('title')}
function clearScreen(){state='clear';const st=G.st,i=G.si;const caps=G.caps.filter(Boolean).length;
 const prev=save.caps[st.id]||[];save.caps[st.id]=[0,1,2].map(k=>prev[k]||G.caps[k]?1:0);save.reached=Math.max(save.reached,Math.min(STAGES.length-1,i+1));
 let tr='';if(st.trade){for(const t of st.trade){if(save.items.indexOf(t)<0)save.items.push(t)}tr='<div class="trade"><div class="ct">FOUND-IT BOOK: NEW TRADE!</div>'+st.trade.map(t=>{const T=TRADES[t];return `<div class="ti"><img src="art/${T.art}.webp?v=${VERSION}" alt=""><div><b>${T.name}</b><br><small>From ${CAST[T.from].n}. ${T.does}</small></div></div>`}).join('')+'</div>'}
 if(st.trade&&st.trade.includes('feather')){save.feather=1}
 if(G.score>save.best)save.best=G.score;persist();
 const last=i>=STAGES.length-1;
 const cq=Math.random()<0.25?"We call it upcycling! Today's trash, tomorrow's treasure!":"Today's trash, tomorrow's treasure!";
 show(`<h2>${st.kind==='boss'?'SHOWDOWN WON!':'JOB DONE!'}</h2><p class="tag jtq">J.T.: "${cq}"</p>${st.done.map(l=>'<p>'+l+'</p>').join('')}
 <table class="st"><tr><td>Hair bags</td><td>${G.bags}</td></tr><tr><td>Gold curls</td><td>${G.curls}</td></tr><tr><td>Bottle caps</td><td>${'🔴'.repeat(caps)}${'⚪'.repeat(3-caps)}</td></tr>${G.clock&&!G.boss?'<tr><td>Time left</td><td>'+Math.max(0,Math.floor(G.clockLeft||0))+' min</td></tr>':''}<tr><td>Score</td><td>${G.score.toLocaleString()}</td></tr></table>${tr}
 <button class="btn go" data-a="${last?'ending':'next'}">${last?'THE END ▶':'NEXT JOB ▶'}</button>`,'menu');AU.music('win')}
function endingScreen(i=0){state='ending';const e=ENDING[i];
 show(`<img class="story" src="art/${e.img}.webp?v=${VERSION}" alt=""><p class="big">${e.t}</p><p class="sub">🪶 Hint arrows are now ON in every job (turn them off in the Found-It Book).</p><p class="sub">Parents: ${PARENT_NOTE}</p>
 <div class="tbtns"><button class="btn go" data-a="title">THE END ♥</button><button class="btn alt" data-a="levels">MAP BOARD</button></div>`,'menu');AU.music('win')}
function levelsScreen(){state='levels';let h='<h2>THE MAP BOARD</h2><div class="lvls">';
 STAGES.forEach((s,i)=>{const lock=i>save.reached;const cp=save.caps[s.id]||[];const sn=[0,1,2].map(k=>cp[k]?'●':'○').join('');const ic=s.kind==='drive'?'🚙':s.kind==='boss'?'⭐':'🗑️';
  h+=`<button class="btn lv ${lock?'dim':''}" data-a="${lock?'locked':'lvl'}" data-v="${i}"><span class="n">${ic} ${s.id}</span> ${s.name}<span class="st">${lock?'🔒':sn}</span></button>`});
 show(h+'</div><button class="btn alt" data-a="back">◀ BACK</button>','menu')}
function bookScreen(){state='book';let h='<h2>THE FOUND-IT BOOK</h2><p class="sub">The birds draw what they find. J.T. pays in hair!</p><div class="book">';
 for(const k in TRADES){const T=TRADES[k],got=save.items.indexOf(k)>=0;h+=`<div class="ti ${got?'':'locked'}"><img src="art/${T.art}.webp?v=${VERSION}" alt=""><div><b>${got?T.name:'???'}</b><br><small>${got?'From '+CAST[T.from].n+'. '+T.does:'Keep doing jobs!'}</small></div></div>`}
 let caps=0;for(const k in save.caps)caps+=save.caps[k].filter(Boolean).length;
 h+=`</div><p>Bottle caps found: <b>${caps}</b> / ${STAGES.length*3}</p>`;
 if(save.feather)h+=`<button class="btn alt2" data-a="hints">HINT ARROWS: ${save.hints?'ON':'OFF'}</button>`;
 show(h+'<button class="btn alt" data-a="back">◀ BACK</button>','menu')}
function howScreen(){state='how';show(`<h2>HOW TO PLAY</h2><ul class="how">
 <li><b>Move:</b> swipe and hold anywhere. Let go to stop.</li>
 <li><b>Jump:</b> swipe up, or tap <b>JUMP</b>. Hold it to go higher. Land on a can to bounce!</li>
 <li><b>ACTION:</b> by a bin, Noodles wiggles in and pops out the hair. If he gets stuck, tap again!</li>
 <li>Every job runs on a <b>clock</b>. Get the hair bags to the bird before time runs out.</li>
 <li><b>Jeep runs:</b> swipe left and right to steer. Drive over ☀ sun spots to charge. JUMP hops. ACTION honks.</li>
 <li><b>Showdowns:</b> nobody gets hurt. Fluster them, beat their schedule, or make them laugh!</li>
 <li>Find 3 red <b>bottle caps</b> in every job. 100 gold curls = 1 extra try.</li>
 <li>🎮 Controllers work too: stick moves, A jumps, X or B is ACTION, Start pauses.</li></ul>
 <p class="sub">J.T.'s rule: "Only small, safe bins. And only with me watching!"<br>Parents: ${PARENT_NOTE}</p>
 <button class="btn alt" data-a="back">◀ BACK</button>`,'menu')}
function overScreen(){state='over';AU.fx('over');AU.music('title');show(`<h2>OUT OF TRIES</h2><p class="big">${G.deadMsg||'Whoops!'}</p><p>J.T.: "Relax. I've got a new plan."</p>
 <div class="tbtns"><button class="btn go" data-a="retry">TRY AGAIN</button><button class="btn alt" data-a="levels">MAP BOARD</button></div>`,'menu')}
function pauseGame(){if(state!=='play')return;state='pause';clearInput();show(`<h2>PAUSED</h2><p class="sub">${G.st.id} · ${G.st.name}</p><div class="tbtns"><button class="btn go" data-a="resume">▶ RESUME</button><button class="btn alt" data-a="restart">RESTART JOB</button><button class="btn alt2" data-a="levels">MAP BOARD</button><button class="btn dim" data-a="title">TITLE</button></div><p class="ctl sub">${ctlLine()}</p>`,'menu')}
function resumeGame(){hideUI();state='play';clearInput();last=performance.now()}
function act(a,v){
 if(a==='play'){if(save.reached>0)planScreen(save.reached);else storyScreen(0)}
 else if(a==='new'){save.reached=0;save.items=[];persist();storyScreen(0)}
 else if(a==='story'){const n=+v;if(n<STORY_INTRO.length)storyScreen(n);else{if(window.SkipBtn)SkipBtn.seen('hairmob-intro',1);planScreen(0)}}
 else if(a==='go')startStage(+v);
 else if(a==='levels')levelsScreen();else if(a==='book')bookScreen();else if(a==='how')howScreen();
 else if(a==='hints'){save.hints=!save.hints;persist();bookScreen()}
 else if(a==='lvl')planScreen(+v);else if(a==='locked'){AU.fx('nope');toast('Finish the job before this one first!')}
 else if(a==='back'||a==='title')titleScreen();
 else if(a==='resume')resumeGame();else if(a==='restart'){SESSION.lives=5;startStage(G.si)}
 else if(a==='next'){planScreen(G.si+1)}else if(a==='ending')endingScreen(0);
 else if(a==='retry'){SESSION.lives=5;startStage(G.si)}}
function toggleMute(){AU.setMuted(!AU.muted);save.muted=AU.muted;persist();$('bMute').textContent=AU.muted?'🔇':'🔊';toast(AU.muted?'Sound off':'Sound on',900)}
$('bMute').addEventListener('click',e=>{e.stopPropagation();AU.unlock();toggleMute()});$('bPause').addEventListener('click',e=>{e.stopPropagation();pauseGame()});

/* ===== flow + loop ===== */
const SESSION={lives:5,score:0};
function later(t,fn){if(G)G.timers.push({t,fn})}
function startStage(i){const st=STAGES[i];const Wd=WORLDS[st.w];
 G={si:i,st,world:Wd,mode:st.kind==='drive'?'drive':'side',t:0,score:SESSION.score,lives:SESSION.lives,bags:0,curls:0,caps:[0,0,0],deaths:0,parts:[],texts:[],talk:[],shots:[],fly:[],fly2:[],npc:[],timers:[],
  cam:{x:0,y:0},shake:0,hs:0,flash:null,boss:null,arena:null,cp:null,won:0,banner:2.4,raids:0,tip:i%5,hints:save.feather&&save.hints,dtR:0.016};
 G.stageStart={score:SESSION.score};
 if(st.kind==='drive'){G.L={W:1e9,cols:1,T:[[0]]};G.p={x:0,y:0,vx:0,vy:0,cut:0,h:60,w:30};startDrive()}
 else{G.L=buildSide(st);G.ents=G.L.ents;
  if(st.kind==='boss'){G.arena={x0:TS,x1:(G.L.cols-1)*TS};G.bossPending=1.2}
  const sx=st.kind==='boss'?G.arena.x0+90:3*TS;G.p=newPlayer(sx,8*TS);
  if(!st.meetNoodles)G.nd=newNoodles(sx-40,8*TS);
  if(st.clock)G.clock={now:st.clock.start,start:st.clock.start,end:st.clock.end,rate:st.clock.rate,what:st.clock.what};
  camUpdate(0,true)}
 G.ents=G.ents||[];hideUI();state='play';clearInput();AU.music(st.kind==='drive'?(has('phone')||i>1?'drive':'w1'):Wd.song);last=performance.now()}
function respawn(){G.lives--;SESSION.lives=G.lives;if(G.lives<=0){G.lives=0;overScreen();return}
 const old=G.p,cp=G.cp;let np;
 if(G.boss){np=newPlayer(G.arena.x0+90,8*TS);G.shots.length=0;const b=G.boss;if(b.k==='mo'){b.x=G.arena.x1-120;b.y=GY;b.st='stalk';b.t=-1}if(b.k==='truck'){b.tx=Math.max(b.tx,G.arena.x1+120)}if(b.k==='poodles'){for(const d of b.dogs){d.st='sit';d.t=2}}}
 else{np=newPlayer(cp?cp.x:3*TS,cp?cp.y:8*TS);if(G.clock){const c=G.clock;c.now=Math.min(cp?cp.clock:c.start,c.end-4);c.warned=0}G.shots.length=0;G.treat=0;for(const e of G.ents){if(e.k==='cat'){e.st='nap';e.x=e.hx;e.y=groundY(e.hx)}if(e.k==='treat'){e.dead=0}}}
 np.inv=2;G.p=np;if(G.nd){G.nd.x=np.x-40;G.nd.y=np.y;G.nd.st='follow';if(G.nd.task&&G.nd.task.bin&&G.nd.task.bin.st==='busy')G.nd.task.bin.st='ready';G.nd.task=null}
 toast(G.deadMsg+' Try again!',1600);camUpdate(0,true)}
function update(dt){G.t+=dt;frame++;G.banner=Math.max(0,G.banner-dt);G.shake=Math.max(0,G.shake-dt*30);if(G.flash)G.flash.a-=dt*2;
 for(const t of G.timers){t.t-=dt;if(t.t<=0&&!t.done){t.done=1;t.fn()}}G.timers=G.timers.filter(t=>!t.done);
 for(const t of G.talk)t.t-=dt;G.talk=G.talk.filter(t=>t.t>0);
 if(G.cutL){G.cutT-=dt;if(G.cutT<=0||(inp.actP||inp.jumpP)&&G.cutT<G.cutL[2]-0.35){if(G.cutL)G.talk=G.talk.filter(t=>t.who!==G.cutL[0]);nextCut();inp.actP=inp.jumpP=0}}
 if(G.mode==='drive'){updDrive(dt)}
 else{const p=G.p;if(!G.won||G.wonT>0)updatePlayer(p,dt);
  if(p.dead){G.deadT-=dt;if(G.deadT<=0){respawn();if(state!=='play')return}}
  if(G.bossPending>0){G.bossPending-=dt;if(G.bossPending<=0)startBoss()}
  updNoodles(dt);updSide(dt);updBoss(dt);updNpc(dt);
  for(const f of G.fly2)f.t+=dt*1.6;
  camUpdate(dt)}
 for(const q of G.parts){q.l-=dt;q.vy+=q.g*dt;q.x+=q.vx*dt;q.y+=q.vy*dt}G.parts=G.parts.filter(q=>q.l>0);
 for(const t of G.texts){t.l-=dt;t.y-=40*dt}G.texts=G.texts.filter(t=>t.l>0);
 if(G.won){G.wonT-=dt;if(G.wonT<=0&&state==='play'){SESSION.score=G.score;SESSION.lives=G.lives;clearScreen()}}}
let last=performance.now();
function loop(now){requestAnimationFrame(loop);let dt=Math.min(0.05,(now-last)/1000);last=now;if(window.__FIXDT)dt=window.__FIXDT;
 if(state==='play'&&G){for(let k=0;k<(window.__SPEED||1)&&state==='play';k++){readInput();let d=dt;if(G.hs>0){G.hs-=dt;d=0}const n=d>1/60?2:1;for(let i=0;i<n;i++)update(d/n);G.dtR=dt}}else if(state!=='play')pollPad();
 render()}
/* ===== boot ===== */
resize();bindSurface(cv);bindSurface($('pad'));bindBtn($('bJump'),'jump');bindBtn($('bAct'),'act');
$('bMute').textContent=AU.muted?'🔇':'🔊';
loadArt(f=>{const b=document.querySelector('#load .bar i');if(b)b.style.width=Math.round(f*100)+'%'}).then(()=>{const l=$('load');if(l)l.remove();titleScreen()});
requestAnimationFrame(loop);
window.__G=()=>G;window.__STAGES=STAGES;window.__start=i=>{SESSION.lives=5;startStage(i)};

/* ===== QA autopilot (only runs when window.__BOT is set by the test harness; never in normal play) ===== */
const BOT={plan:null,pt:0,last:0,prog:{x:0,t:0},rnd:0,actCd:0};
const MACROS=(()=>{const m=[];for(const d of [-1,0,1]){m.push({d,j:0,h:0});if(d)m.push({d,j:0,h:0,sneak:1});for(const h of [0.02,0.14,0.28,0.5])m.push({d,j:1,h})}return m})();
function botHz(c,t){/* danger at sim time t for a simulated player c */let pen=0;const top=c.y-c.h;
 for(const s of G.shots){if(s.k==='can'&&!s.stop){const x=s.x+s.vx*t;if(Math.abs(x-c.x)<s.r+20&&s.y+s.r>top&&s.y-s.r<c.y+2&&!(c.vy>40&&c.y-s.y<s.r+4))pen+=1}
  else if(s.k==='dust'){const x=s.x+s.vx*t;if(t<s.life&&Math.abs(x-c.x)<s.r+18&&c.y>s.y-44)pen+=1}
  else if(s.k==='twig'){const land=(s.warn>0?s.warn:0)+0.55;if(Math.abs(t-land)<0.4&&Math.abs(s.x-c.x)<s.r+24)pen+=1}}
 for(const e of G.ents){if(e.dead)continue;const ax=Math.abs(e.x-c.x);if(ax>260)continue;
  if(e.k==='spr'){const on=((e.t+t)%3.6)<1.75||((e.t+t)%3.6)>3.5;if(on&&ax<36&&c.y>e.y-125)pen+=1}
  else if(e.k==='cat'){if(e.st==='nap'&&ax<112&&c.onG&&Math.abs(c.vx)>55&&!G.treat)pen+=0.03;if((e.st==='pounce'||e.st==='chase'||e.st==='wake')&&ax<60)pen+=1}
  else if(e.k==='cloud'){if(Math.hypot(e.x-c.x,e.y-(c.y-30))<e.r+16)pen+=0.05}}
 const b=G.boss;if(b&&b.st!=='done'){
  if(b.k==='sal'&&Math.abs(b.x-c.x)<70&&c.y>GY-60)pen+=1;
  if(b.k==='poodles')for(const d of b.dogs){let x=d.x;if(d.st==='dash')x=d.x+d.vx*Math.min(t,Math.abs((d.tgt-d.x)/(d.vx||1)));else if(d.st==='sit'&&d.t<t)x=d.x+(d.face||1)*360*(t-d.t);if(Math.abs(x-c.x)<52&&c.y>GY-56)pen+=1}
  if(b.k==='mo'){let x=b.x,y=b.y;if(b.st==='pounce'){const tt=t;x=clamp(b.x+b.vx*tt,G.arena.x0+40,G.arena.x1-40);y=b.y+b.vy*tt+GRAV*0.85*tt*tt/2;y=Math.min(y,groundY(x))}
   if((b.st==='pounce'||b.st==='stalk')&&Math.abs(x-c.x)<62&&Math.abs((y-30)-(c.y-30))<64)pen+=1;if(b.st==='crouch'&&t>0.6-b.t&&Math.abs(b.x-c.x)<80)pen+=0.5}
  if(b.k==='storm'){}}
 return pen}
function botSim(m,tgt,air){const p=G.p;const c={...p,safe:p.safe};const dt=1/60,N=56;let pen=0,minD=1e9,landed=0,fell=0,jumpedT=-1;
 SIM=1;try{for(let k=0;k<N;k++){const t=k*dt;let d=m.d;if(m.j&&landed)d=0;
  const I={R:d>0&&(!m.sneak||c.vx<20),L:d<0&&(!m.sneak||c.vx>-20),jumpP:m.j&&!air&&k===0,jump:!!m.j&&t<m.h,D:0};
  c.jumped=0;stepPlayer(c,dt,I);if(c.jumped)jumpedT=t;if(m.j&&jumpedT>=0&&c.onG&&t>jumpedT+0.1)landed=1;
  if(c.y>LVH+20){fell=1;break}
  const hz=botHz(c,t+dt);pen+=hz*(k<30?1:0.6);
  const dd=Math.abs(c.x-tgt.x)+1.6*Math.max(0,Math.abs(c.y-tgt.y)-(tgt.touch?14:8));if(dd<minD)minD=dd}}finally{SIM=0}
 const fd=Math.abs(c.x-tgt.x)+1.6*Math.max(0,Math.abs(c.y-tgt.y)-8);
 let sc=(tgt.touch?minD*0.8+fd*0.2:fd)+pen*400+(m.j?3:0)+(m.sneak?1:0)+(c.onG?0:6);
 if(fell)sc+=1e6;if(tgt.final&&!c.onG)sc+=4;return sc}
function botTarget(){const p=G.p,st=G.st,b=G.boss,n=G.nd,A=G.arena;const T=(x,y,o={})=>Object.assign({x,y:y==null?p.y:y},o);
 if(b&&b.st!=='done'){
  if(b.k==='sal'){if(b.st==='break'&&b.broom&&!b.broom.hid)return T(b.broom.x,GY,{act:n&&n.st==='follow'&&Math.abs(b.broom.x-p.x)<60});return T(A.x0+150,GY)}
  if(b.k==='truck'){let best=null;for(const bin of b.bins)if(bin.st==='ready'&&bin.x<b.tx-230&&(!best||bin.x>best.x))best=bin;
   if(n&&n.st!=='follow'){const bb=n.task&&n.task.bin;return T(bb?bb.x-30:p.x,GY)}
   if(best)return T(best.x-24,GY,{act:Math.abs(best.x-p.x)<55&&p.onG});return T(A.x0+100,GY)}
  if(b.k==='poodles'){const cl=b.clouds.filter(c=>c.life>1.2);const d=b.dogs.find(d=>d.st==='sit')||b.dogs[0];
   if(cl.length&&d){cl.sort((u,v)=>Math.abs(u.x-p.x)-Math.abs(v.x-p.x));const c=cl[0];const side=sgn(c.x-d.x)||1;let x=c.x+side*(c.r+70);if(x<A.x0+60||x>A.x1-60)x=c.x-side*(c.r+70);return T(clamp(x,A.x0+50,A.x1-50),GY)}
   return T((A.x0+A.x1)/2,GY)}
  if(b.k==='mo'){const mid=(A.x0+A.x1)/2;
   if(b.st==='dizzy')return T(b.x-sgn(b.x-p.x||1)*70,null,{act:Math.abs(b.x-p.x)<105&&n&&n.st==='follow'});
   if(b.st==='crouch'||b.st==='pounce'){const away=p.x<b.x?-1:1;let tx=p.x+away*300;if(tx<A.x0+60||tx>A.x1-60)tx=p.x-away*300;return T(clamp(tx,A.x0+40,A.x1-40),null)}
   const away=p.x<b.x?-1:1;let tx=b.x+away*230;if(tx<A.x0+50||tx>A.x1-50)tx=b.x-away*230;return T(clamp(tx,A.x0+40,A.x1-40),null)}
  if(b.k==='storm'){if(!b.carry){let f=null;for(const q of b.puffs)if(!f||Math.abs(q.x-p.x)+Math.abs(q.y-p.y)<Math.abs(f.x-p.x)+Math.abs(f.y-p.y))f=q;if(f)return T(f.x,f.y+18,{touch:1});return T(b.tgt?b.tgt.x:p.x,GY)}
   const t=b.tgt;return T(t.x,t.y,{final:1})}
  return T(p.x,null)}
 if(st.kind==='boss')return T(p.x,null);
 /* heists */
 const need=st.need,busy=n&&n.st!=='follow'&&n.st!=='laugh'?1:0,have=G.bags+G.fly.length+busy;
 if(n&&busy){const bb=n.task&&n.task.bin;return T(bb?bb.x-30:p.x,null)}
 if(have<need||!G.nd){const bins=G.ents.filter(e=>e.k==='bin'&&!e.dead&&(e.st==='ready'||e.st==='shut'));
  const loose=G.ents.filter(e=>e.k==='bag'&&!e.dead&&!e.fall);
  let cand=[];for(const e of bins){let cost=Math.abs(e.x-p.x)+(e.x<p.x-60?200:0);if(e.st==='shut'){const wait=(e.open-G.clock.now)*G.clock.rate;cost+=Math.max(0,wait*235-Math.abs(e.x-p.x))+150}cand.push({e,cost})}
  for(const e of loose)cand.push({e,cost:Math.abs(e.x-p.x)-50});
  if(!G.nd)cand=cand.filter(c=>c.e.stuck);
  cand.sort((a,b)=>a.cost-b.cost);const c=cand[0];
  if(c){const e=c.e;if(e.k==='bag')return T(e.x,e.y+10,{touch:1});return T(e.x-26,e.y,{act:G.nd&&e.st==='ready'&&Math.abs(e.x-p.x)<56&&Math.abs(e.y-p.y)<40&&p.onG})}}
 const goal=G.ents.find(e=>e.k==='goal');return T(goal.x,goal.y)}
function botInput(){const o={L:0,R:0,U:0,D:0,J:0,Jh:0,A:0,Y:0};if(!G||G.won)return o;
 if(G.mode==='drive')return botDrive(o);
 const p=G.p;if(G.cutL){if((frame&7)===0)o.A=1;return o}if(p.cut||p.dead)return o;
 if(G.treat||(G.nd&&G.nd.st==='dive'&&G.nd.stuck)){if((frame&3)===0)o.A=1}
 const tgt=botTarget();BOT.actCd-=1;if(tgt.act&&BOT.actCd<=0){o.A=1;BOT.actCd=20}
 /* progress watchdog: shake things up if stuck */
 if(Math.abs(p.x-BOT.prog.x)>30){BOT.prog.x=p.x;BOT.prog.t=G.t}else if(G.t-BOT.prog.t>6&&Math.abs(tgt.x-p.x)>80){BOT.rnd=0.6;BOT.prog.t=G.t}
 BOT.pt-=1/60;const air=!p.onG&&p.coy<=0;
 if(!BOT.plan||BOT.pt<=0||(p.onG&&BOT.plan.air)){let best=null,bs=1e18;const seen={};
  for(const m of MACROS){const mm=air?{d:m.d,j:p.holdJ?1:0,h:p.holdJ?m.h:0,sneak:m.sneak}:m;const key=mm.d+'|'+mm.j+'|'+mm.h+'|'+(mm.sneak||0);if(seen[key])continue;seen[key]=1;
   const sc=botSim(mm,tgt,air)+(BOT.rnd>0?Math.random()*300:0);if(sc<bs){bs=sc;best=mm}}
  BOT.rnd=Math.max(0,BOT.rnd-0.1);BOT.plan={...best,air,t0:G.t};BOT.pt=air?0.05:0.08;BOT.fresh=1}
 const m=BOT.plan,t=G.t-m.t0;
 if(m.d>0&&(!m.sneak||p.vx<20))o.R=1;if(m.d<0&&(!m.sneak||p.vx>-20))o.L=1;
 if(m.j){if(BOT.fresh&&!m.air)o.J=1;o.Jh=t<m.h?1:0}
 BOT.fresh=0;return o}
function botDrive(o){const D=G.D;if(D.dead||G.p.cut)return o;let best=D.x,bs=1e9;
 for(let x=RX0+26;x<=RX1-26;x+=12){let sc=Math.abs(x-D.x)*0.15;
  for(const q of D.objs){const ds=q.s-D.s;if(ds<-20)continue;if(ds>520)break;if(q.gone)continue;const reach=Math.abs(x-D.x)/280>ds/Math.max(120,D.v)+0.05;
   const w=q.k==='puddle'?q.w/2+30:q.k==='cone'?44:q.k==='pigeon'?50:0;
   if(w&&!(q.k==='pigeon'&&q.fly)&&Math.abs(q.x-x)<w)sc+=(q.k==='cone'?900:q.k==='pigeon'?500:500)*(1-ds/600);
   if(reach&&w)sc+=200;
   if((q.k==='sun'||q.k==='flies')&&!q.gone&&!(q.k==='flies'&&D.bedtime&&!q.left)&&D.batt<D.bmax*0.95&&ds<q.h/2+300&&Math.abs(q.x-x)<q.w/2-20){let shade=0;for(const c of D.objs)if(c.k==='shade'&&Math.abs(c.s-q.s)<c.h/2+60&&Math.abs(c.x-x)<c.w/2)shade=1;if(!shade||q.k==='flies')sc-=250*(1-D.batt/D.bmax)+60}
   if((q.k==='bag'||q.k==='cap')&&Math.abs(q.x-x)<34)sc-=140;if(q.k==='curl'&&Math.abs(q.x-x)<30)sc-=10}
  if(sc<bs){bs=sc;best=x}}
 if(best>D.x+8)o.R=1;else if(best<D.x-8)o.L=1;
 for(const q of D.objs){const ds=q.s-D.s;if(ds<0||ds>420)continue;if(ds>420)break;if(q.k==='pigeon'&&!q.fly&&ds<300&&!(D.honk>0))o.A=1;if(q.k==='cone'&&!q.gone&&ds<70&&ds>20&&Math.abs(q.x-D.x)<36&&!(D.hop>0))o.J=1}
 return o}

