const MAX_HEALTH=200, MAX_ATTEMPTS=5, MAX_DMG=50, MIN_DMG=15;
const OUTER_TH=20*Math.PI/180, SPIN_SPEED=0.04, SEGMENTS=5;
const SEG_WF=1.5, TOTAL_ARC=2*OUTER_TH*SEG_WF, SEG_ARC=TOTAL_ARC/SEGMENTS;
const DEBOUNCE_MS=300;

let dragonHealth, attempt, wheelAngle, targetAngle, gameOver, animId;
let lastKeyTime=0, soundsOn=false;
const c=document.getElementById('gameCanvas'), ctx=c.getContext('2d');
const CX=c.width/2, CY=c.height/2, R=120;
const healthEl=document.getElementById('health');
const attEl=document.getElementById('attempt');
const hitEl=document.getElementById('hitAmt');
const overlay=document.getElementById('overlay');
const msg=document.getElementById('message');
const btn=document.getElementById('restart');
const bossBar=document.getElementById('bossBar');
const bedImg=document.getElementById('bed');
const explImg=document.getElementById('explosion');
const flapSfx=document.getElementById('flap');
const explodeSfx=document.getElementById('explode');
const muteBtn=document.getElementById('muteToggle');

const SEG_COLORS=Array.from({length:SEGMENTS},(_,i)=>{
const t=i/(SEGMENTS-1),g=Math.round(255*(1-t));
return `rgb(255,${g},0)`;
});

function randAngle(){ return Math.random()*2*Math.PI; }
function updateBossBar(){ bossBar.style.width=(dragonHealth/MAX_HEALTH*100)+'%'; }

function init(){
cancelAnimationFrame(animId);
dragonHealth=MAX_HEALTH; attempt=0; wheelAngle=0;
targetAngle=randAngle(); gameOver=false; lastKeyTime=0;
healthEl.textContent=dragonHealth;
attEl.textContent=attempt;
hitEl.textContent='—'; overlay.className='';
updateBossBar(); bedImg.style.visibility='visible'; explImg.style.opacity=0;
if(soundsOn){ flapSfx.currentTime=0; flapSfx.muted=false; flapSfx.play(); }
c.focus(); loop();
}

function draw(){
ctx.clearRect(0,0,c.width,c.height);
ctx.beginPath();ctx.arc(CX,CY,R,0,2*Math.PI);ctx.fillStyle='#444';ctx.fill();
ctx.beginPath();ctx.arc(CX,CY,R+8,0,2*Math.PI);
ctx.strokeStyle='#555';ctx.lineWidth=16;ctx.stroke();
for(let i=0;i<SEGMENTS;i++){
    const s=targetAngle-TOTAL_ARC/2+i*SEG_ARC;
    ctx.beginPath();ctx.arc(CX,CY,R+8,s,s+SEG_ARC);
    ctx.strokeStyle=SEG_COLORS[i];ctx.lineWidth=16;ctx.stroke();
}
ctx.strokeStyle='#0f0';ctx.lineWidth=4;
ctx.beginPath();ctx.moveTo(CX,CY);
ctx.lineTo(CX+Math.cos(wheelAngle)*R,CY+Math.sin(wheelAngle)*R);
ctx.stroke();
}

function loop(){
wheelAngle=(wheelAngle+SPIN_SPEED)%(2*Math.PI);
draw();animId=requestAnimationFrame(loop);
}

function end(won){
gameOver=true; cancelAnimationFrame(animId);
if(soundsOn) flapSfx.pause();
overlay.className='show '+(won?'win':'lose');
msg.textContent=won?'🎉 You Win!':'❌ Game Over';
}

window.addEventListener('keydown',e=>{
if(!(e.code==='Space'||e.key===' '||e.keyCode===32))return;
const now=Date.now();if(now-lastKeyTime<DEBOUNCE_MS)return;
lastKeyTime=now;
if(gameOver)return init();
if(attempt>=MAX_ATTEMPTS)return;
if(soundsOn){ explodeSfx.currentTime=0; explodeSfx.play(); }
bedImg.style.visibility='hidden'; explImg.style.opacity=1;
setTimeout(()=>{explImg.style.opacity=0;bedImg.style.visibility='visible';},100);
attempt++;attEl.textContent=attempt;
let rel=(wheelAngle-(targetAngle-TOTAL_ARC/2))%(2*Math.PI);
rel=(rel+2*Math.PI)%(2*Math.PI);
let dmg=0;if(rel<TOTAL_ARC){
    const idx=Math.min(SEGMENTS-1,Math.floor(rel/SEG_ARC));
    dmg=Math.round(MIN_DMG+(MAX_DMG-MIN_DMG)*(idx/(SEGMENTS-1)));
}
dragonHealth=Math.max(0,dragonHealth-dmg);
healthEl.textContent=dragonHealth;hitEl.textContent=dmg;
updateBossBar();if(dragonHealth===0)return end(true);
if(attempt===MAX_ATTEMPTS)return end(false);
targetAngle=randAngle();
});

btn.addEventListener('click',()=>init());

muteBtn.addEventListener('click', () => {
soundsOn = !soundsOn;
muteBtn.textContent = soundsOn ? '🔊' : '🔇';
flapSfx.muted = !soundsOn;
explodeSfx.muted = !soundsOn;
if (soundsOn && !gameOver) flapSfx.play();
muteBtn.blur();   // remove focus so Space won’t hit it
});

init();