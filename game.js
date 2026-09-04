const cars = [
  {name:'NEON RX-7', type:'ROTARY ICON', color:'#ff3da8', accel:3.2, launch:86, shift:92, grip:78, nitro:74, rarity:'STREET', note:'Balanced street build with a razor-fast launch.'},
  {name:'SPECTER R', type:'JDM COUPE', color:'#35e8ff', accel:3.0, launch:91, shift:84, grip:82, nitro:78, rarity:'ELITE', note:'High launch traction and forgiving shift window.'},
  {name:'VORTEX GT', type:'V8 MUSCLE', color:'#ff9b3d', accel:3.4, launch:95, shift:68, grip:66, nitro:88, rarity:'STREET', note:'Huge torque off the line. Keep the shifts clean.'},
  {name:'MIAMI XS', type:'SPORT COMPACT', color:'#c9ff4b', accel:3.5, launch:81, shift:96, grip:91, nitro:70, rarity:'ELITE', note:'Precise gearbox tuned for perfect-shift chains.'},
  {name:'NOVA S', type:'EURO STREET', color:'#a879ff', accel:3.1, launch:84, shift:89, grip:86, nitro:82, rarity:'ELITE', note:'Clean, planted and lethal once the nitrous hits.'},
  {name:'BLAZE X', type:'TWIN TURBO', color:'#ff5646', accel:2.9, launch:88, shift:80, grip:73, nitro:94, rarity:'EXOTIC', note:'Explosive nitrous delivery with a wild top end.'},
  {name:'MIDNIGHT CBR', type:'STREET SPEC', color:'#5f9bff', accel:3.3, launch:79, shift:94, grip:85, nitro:84, rarity:'ELITE', note:'Late-night specialist with a deep power band.'},
  {name:'PHANTOM 8', type:'V8 SUPERCAR', color:'#d7d9dd', accel:2.8, launch:92, shift:87, grip:79, nitro:91, rarity:'EXOTIC', note:'Serious power. Demands a confident right thumb.'},
  {name:'HEATWAVE', type:'STREET ROCKET', color:'#ffcf4a', accel:3.0, launch:87, shift:90, grip:81, nitro:86, rarity:'EXOTIC', note:'A Miami-built rocket with no interest in lifting.'},
  {name:'NIGHTFALL', type:'HYPER GT', color:'#8cf3d6', accel:2.6, launch:97, shift:93, grip:94, nitro:96, rarity:'LEGEND', note:'The final unlock. Fast enough to make daylight jealous.'}
];

const tracks = [
  ['OCEAN DRIVE SPRINT','Ocean Drive','Boardwalk'],['ART DECO RUN','South Beach','Art Deco'],['PALM ISLAND','Palm Island','Causeway'],['NEON CAUSEWAY','MacArthur','Express'],
  ['MIDNIGHT MARINA','Bayside','Marina'],['SUNSET BLVD','Sunset','Boulevard'],['VICE DISTRICT','Downtown','Vice'],['LITTLE HAVANA','SW 8th','Havana'],
  ['SKYLINE EXPRESS','Downtown','Skyline'],['COASTLINE CLASH','Oceanfront','Coast'],['NIGHT MARKET','Bay Road','Market'],['GOLD COAST','Brickell','Gold'],
  ['MIRROR LAKE','Coral','Lake'],['LAST CALL','Miami Beach','Last Call'],['AFTERGLOW','South Pointe','Afterglow'],['FINAL RUN','Neon City','Final']
];

const state = {car:0, level:1, credits:2500, gear:1, rpm:0, nitro:100, running:false, countdown:0, playerProgress:0, aiProgress:[0,0,0], elapsed:0, shiftCount:0, perfect:0, sound:true};
const $ = id => document.getElementById(id);

function renderCars(){
  $('carList').innerHTML = cars.map((c,i)=>`<div class="car-row ${i===state.car?'active':''}" data-car="${i}"><span class="car-number">${String(i+1).padStart(2,'0')}</span><div class="car-thumb"><span class="mini-car" style="--c:${c.color}"></span></div><div><h3>${c.name}</h3><small>${c.type}</small></div><span class="car-score">${c.accel.toFixed(1)}</span></div>`).join('');
  document.querySelectorAll('.car-row').forEach(row=>row.addEventListener('click',()=>selectCar(+row.dataset.car)));
}
function selectCar(i){
  state.car=i;
  document.querySelectorAll('.car-row').forEach((r,n)=>r.classList.toggle('active',n===i));
  const c=cars[i];
  $('selectedName').textContent=c.name; $('selectedRarity').textContent=c.rarity; $('carIndex').textContent=`${String(i+1).padStart(2,'0')} / 10`;
  $('statAccel').textContent=c.accel.toFixed(1);
  $('barLaunch').style.width=c.launch+'%'; $('barShift').style.width=c.shift+'%'; $('barGrip').style.width=c.grip+'%'; $('barNitro').style.width=c.nitro+'%';
  $('tuneNote').textContent=c.note;
  const art=$('carArt'); art.style.setProperty('--car',c.color); art.innerHTML='<div class="body"></div><div class="cabin"></div><div class="window"></div><div class="light l"></div><div class="light r"></div><div class="wheel l"></div><div class="wheel r"></div>';
}

function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active');}
function formatTime(v){return v.toFixed(2).padStart(5,'0')}

function raceSetup(){
  const t=tracks[(state.level-1)%tracks.length];
  $('eventName').textContent=`${t[0]} // LEVEL ${String(state.level).padStart(2,'0')}`;
  $('levelNo').textContent=String(state.level).padStart(2,'0'); $('trackName').textContent=t[0];
  $('distanceValue').textContent='0 M'; $('gearValue').textContent='1'; $('speedValue').textContent='000'; $('nitroBar').style.width='100%'; $('rpmBar').style.width='0%';
  $('ladder').innerHTML=`<div class="ladder-row player"><span>YOU — ${cars[state.car].name}</span><small>P1</small></div><div class="ladder-row"><span>RICO // GT-R</span><small>P2</small></div><div class="ladder-row"><span>JAX // COBRA</span><small>P3</small></div><div class="ladder-row"><span>MIKA // EVO</span><small>P4</small></div>`;
}

function startRace(){
  state.running=false; state.gear=1; state.rpm=0; state.nitro=100; state.playerProgress=0; state.aiProgress=[0,0,0]; state.elapsed=0; state.shiftCount=0; state.perfect=0; state.countdown=3;
  raceSetup(); show('race'); startCountdown();
}

function startCountdown(){
  const el=$('countdown'); el.style.opacity=1; el.textContent='3';
  const seq=['3','2','1','GO!']; let i=0;
  const timer=setInterval(()=>{i++; if(i<seq.length){el.textContent=seq[i]; if(seq[i]==='GO!') el.style.color='var(--lime)';}else{clearInterval(timer);el.style.opacity=0;el.style.color='white';state.running=true;state.startAt=performance.now();}},650);
}

function shift(){
  if(!state.running) return;
  const pct=state.rpm;
  let quality='OKAY'; let bonus=1;
  if(pct>=72 && pct<=81){quality='PERFECT SHIFT';bonus=1.38;state.perfect++;} else if(pct>=62&&pct<90){quality='GOOD SHIFT';bonus=1.13;} else if(pct>93){quality='BOUNCER';bonus=.72;}
  state.playerProgress += (9 + state.gear*2.6 + bonus*3.2) * (cars[state.car].launch/90);
  state.gear=Math.min(6,state.gear+1); state.rpm=25;
  $('gearValue').textContent=state.gear; toast(quality);
}
function useNitro(){if(!state.running||state.nitro<=5)return;state.nitro=Math.max(0,state.nitro-24);state.playerProgress+=18+cars[state.car].nitro/10;toast('NITRO +');}
function toast(txt){const el=$('raceToast');el.textContent=txt;el.style.opacity=1;el.animate([{transform:'translate(-50%,8px)',opacity:0},{transform:'translate(-50%,0)',opacity:1},{transform:'translate(-50%,0)',opacity:0}],{duration:850,easing:'ease-out'});}

let canvas,ctx,last=0;
function resizeCanvas(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);}
function drawRace(time){
  const w=innerWidth,h=innerHeight; ctx.clearRect(0,0,w,h);
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#03050b');g.addColorStop(.5,'#080713');g.addColorStop(1,'#160811');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  // skyline
  for(let x=0;x<w;x+=42){const bh=28+((x*13)%92);ctx.fillStyle='rgba(10,10,18,.95)';ctx.fillRect(x,h*.42-bh,30,bh);if(x%84===0){ctx.fillStyle='rgba(255,61,168,.18)';ctx.fillRect(x+7,h*.42-bh+10,3,13);}}
  // horizon glow
  const glow=ctx.createRadialGradient(w*.5,h*.52,5,w*.5,h*.52,w*.48);glow.addColorStop(0,'rgba(255,61,168,.35)');glow.addColorStop(1,'rgba(255,61,168,0)');ctx.fillStyle=glow;ctx.fillRect(0,h*.34,w,h*.35);
  // road perspective
  ctx.fillStyle='#0b0a10';ctx.beginPath();ctx.moveTo(w*.34,h*.47);ctx.lineTo(w*.66,h*.47);ctx.lineTo(w*.95,h);ctx.lineTo(w*.05,h);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(w*.34,h*.47);ctx.lineTo(w*.05,h);ctx.moveTo(w*.66,h*.47);ctx.lineTo(w*.95,h);ctx.stroke();
  // lane dashes
  const dashOffset=((time/7)%1)*120;for(let y=h*.52-dashOffset;y<h;y+=125){const f=(y-h*.47)/(h*.53);const ww=2+f*7;ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(w*.5-ww/2,y,ww,55+f*65)}
  // neon roadside bars
  for(let side of [-1,1]){for(let i=0;i<12;i++){const y=h*.48+i*55+((time/18)%55);const f=(y-h*.47)/(h*.53);const x=w*.5+side*(w*.16+f*w*.34);ctx.fillStyle=i%3===0?'rgba(53,232,255,.55)':'rgba(255,61,168,.32)';ctx.fillRect(x,y,4+f*8,3+f*6)}}
  // opponents silhouettes
  const ps=[...state.aiProgress].map(v=>v);ps.forEach((p,i)=>drawOpponent(w,h,p,i));
  drawPlayer(w,h);
}
function drawPlayer(w,h){
  const c=cars[state.car].color;const x=w*.5,y=h*.73;const bob=Math.sin(performance.now()/65)*2;
  ctx.save();ctx.translate(x,y+bob);ctx.shadowColor=c;ctx.shadowBlur=25;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-85,24);ctx.lineTo(-57,-1);ctx.lineTo(-16,-14);ctx.lineTo(45,-12);ctx.lineTo(89,10);ctx.lineTo(70,30);ctx.lineTo(-65,31);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#0a0c12';ctx.beginPath();ctx.moveTo(-40,-4);ctx.lineTo(-16,-25);ctx.lineTo(32,-23);ctx.lineTo(52,-6);ctx.closePath();ctx.fill();ctx.fillStyle='#e9feff';ctx.fillRect(66,10,16,4);ctx.fillRect(-83,11,16,4);ctx.fillStyle='#07070a';ctx.fillRect(-72,24,30,10);ctx.fillRect(42,24,30,10);ctx.restore();
}
function drawOpponent(w,h,p,i){const x=w*.5+(i-1.5)*48,y=h*.57+Math.min(120,p*.28);ctx.save();ctx.translate(x,y);ctx.globalAlpha=.76;ctx.fillStyle=['#8c4cff','#35e8ff','#ff9b3d'][i];ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=16;ctx.fillRect(-23,0,46,15);ctx.fillStyle='#101018';ctx.fillRect(-12,-9,24,10);ctx.restore();}

function loop(ts){requestAnimationFrame(loop);if(!$('race').classList.contains('active'))return;drawRace(ts);if(!state.running){last=ts;return;}const dt=Math.min(.035,(ts-last)/1000||0);last=ts;state.elapsed+=(dt);state.rpm=Math.min(100,state.rpm+dt*(33+state.gear*7));
  // Passive forward momentum, while shifts convert RPM into large gains.
  state.playerProgress += dt*(3.4+state.gear*.8+(state.nitro>0?0.35:0));
  state.aiProgress[0]+=dt*(4.15+state.level*.05);state.aiProgress[1]+=dt*(3.72+state.level*.06);state.aiProgress[2]+=dt*(3.4+state.level*.07);
  if(state.nitro>0)state.nitro=Math.max(0,state.nitro-dt*1.15);
  $('rpmValue').textContent=String(Math.round(4800+state.rpm*96));$('rpmBar').style.width=state.rpm+'%';$('nitroBar').style.width=state.nitro+'%';$('speedValue').textContent=String(Math.round(72+state.playerProgress*4.4)).padStart(3,'0');$('distanceValue').textContent=Math.min(400,Math.round(state.playerProgress*2.1))+' M';
  const finish=400;if(state.playerProgress>=finish||state.aiProgress.some(x=>x>=finish)){finishRace();}
}
function finishRace(){if(!state.running)return;state.running=false;const opponents=[state.playerProgress,...state.aiProgress];const place=1+opponents.slice(1).filter(x=>x>state.playerProgress).length;const reward=place===1?750:place===2?450:250;state.credits+=reward;$('credits').textContent=state.credits;$('resultKicker').textContent=place===1?'LEVEL COMPLETE':'RUN COMPLETE';$('resultTitle').innerHTML=place===1?'CLEAN<br><em>GETAWAY.</em>':'YOU<br><em>CAN DO BETTER.</em>';$('resultTime').textContent=formatTime(state.elapsed);$('resultPlace').textContent=place===1?'1ST':place===2?'2ND':place===3?'3RD':'4TH';$('resultReward').textContent='+'+reward+' CR';$('resultShift').textContent='PERFECT × '+state.perfect;show('result');}

$('raceBtn').addEventListener('click',startRace);$('garageBtn').addEventListener('click',()=>{show('garage');selectCar(state.car)});$('nextBtn').addEventListener('click',()=>{state.level=Math.min(16,state.level+1);if(state.level===16)toast('FINAL LEVEL');startRace();});$('soundBtn').addEventListener('click',()=>{state.sound=!state.sound;$('soundBtn').textContent=state.sound?'♫':'×';});$('nitroBtn').addEventListener('click',useNitro);document.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();shift()}if(e.key.toLowerCase()==='n')useNitro();});$('shiftZone').addEventListener('click',shift);

renderCars();selectCar(0);resizeCanvas();addEventListener('resize',resizeCanvas);requestAnimationFrame(loop);
