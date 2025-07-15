  // —— New Currency & Menu Logic ——
  const COIN_KEY = 'gold';
  let gold = parseInt(localStorage.getItem(COIN_KEY)) || 0;
  function updateGoldDisplay() {
    document.getElementById('goldCount').textContent = gold;
    localStorage.setItem(COIN_KEY, gold);
  }
  function awardGold(amount) {
    gold += amount;
    updateGoldDisplay();
  }
  updateGoldDisplay();

  // Menu open/close & tab switching
  const menuBtn = document.getElementById('menuToggle'),
        menuModal = document.getElementById('menuModal'),
        closeMenuBtn = document.getElementById('closeMenu'),
        menuTabs = document.querySelectorAll('.menuButtons button'),
        panels = document.querySelectorAll('.panel');

  menuBtn.addEventListener('click', () => menuModal.style.display = 'flex');
  closeMenuBtn.addEventListener('click', () => menuModal.style.display = 'none');
  menuTabs.forEach(btn => btn.addEventListener('click', () => {
    menuTabs.forEach(b=>b.classList.remove('active'));
    panels.forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.panel).classList.add('active');
  }));

  // Volume control
  const volumeInput = document.getElementById('volume'),
        volLabel    = document.getElementById('volLabel');
  volumeInput.addEventListener('input', e => {
    const v = e.target.value;
    volLabel.textContent = v + '%';
    document.getElementById('flap').volume = v/100;
    document.getElementById('explode').volume = v/100;
  });
  function weightedRandomIndex(arr) {
    const total = arr.reduce((sum, i) => sum + i.weight, 0);
    let r = Math.random() * total;
    for (let i = 0; i < arr.length; i++) {
        if (r < arr[i].weight) return i;
        r -= arr[i].weight;
    }
    return arr.length - 1;
  }
  let isSpinning = false;
  let isBuyingPet = false;

  // Roulette spin
  const spinBtn    = document.querySelector('.spinBtn'),
        spinResult = document.getElementById('spinResult');
  const items = [
  { name: 'Gold Nugget',   value: 50,  img: 'src/nugget.png', weight: 40 },
  { name: 'Gold Bar',      value: 200, img: 'src/bar.png',    weight: 40 },
  { name: 'Gold Block',    value: 500, img: 'src/block.png',  weight: 19 },
  { name: 'Nether Star',   value: 10000, img: 'src/star.png',   weight:  1 }
];
  let winnerIndex; // store this in outer scope
  const BLOCKS = 9;
  const SINGLE_W = 64 + 8; // image width + margin
  const CONTAINER_W = 200;
const reel     = document.getElementById('reel');
const spinRes  = document.getElementById('spinResult');
const SPIN_DUR = 1.8; // seconds, tweak for speed
spinBtn.addEventListener('click', () => {
  if (gold < 100) {
    spinResult.textContent = 'Not enough gold!';
    return;
  }
  if(isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;

  gold -= 100; updateGoldDisplay();

  // reset
  reel.style.transition = 'none';
  reel.style.transform  = 'translateX(0)';
  void reel.offsetWidth;

  // build a longer strip
  reel.innerHTML = '';
  const sequence = [];
  for (let i = 0; i < BLOCKS; i++) sequence.push(...items);
  sequence.forEach(item => {
    const img = new Image();
    img.src = item.img;
    img.alt = item.name;
    reel.appendChild(img);
  });

  // pick weighted winner
  const winnerIdx         = weightedRandomIndex(items);
  const midBlockIndex     = Math.floor(BLOCKS / 2);
  const absoluteWinnerIdx = midBlockIndex * items.length + winnerIdx;
  const targetPos         = absoluteWinnerIdx * SINGLE_W - (CONTAINER_W/2 - SINGLE_W/2);

  // spin
  setTimeout(() => {
    reel.style.transition = `transform ${SPIN_DUR}s ease-out`;
    reel.style.transform  = `translateX(-${targetPos}px)`;
  }, 50);

  // on stop, award
  reel.addEventListener('transitionend', () => {
    const prize = items[winnerIdx];
    awardGold(prize.value);
    isSpinning = false;
    spinBtn.disabled = false;
    spinResult.innerHTML =
      `You got <strong>${prize.name}</strong>!<br>Value: ${prize.value}`;
  }, { once: true });
});
//================================================================================================================
// ─── Pet Shop & Selector Logic ───

// 1) Pet definitions & storage
const PET_KEY    = 'ownedPets';
let ownedPets    = JSON.parse(localStorage.getItem(PET_KEY)) || [];
let currentPetId = localStorage.getItem('currentPet') || null;

const pets = [
  { id: 'none',        name: 'none',    img: 'src/placeholder.png',        weight: 0 },
  { id: 'dog',        name: 'Walter',    img: 'src/wolf.png',        weight: 20 },
  { id: 'sheep',      name: 'Sheep',  img: 'src/sheep.jpg',      weight: 40 },
  { id: 'cat',      name: 'Spoingus',  img: 'src/cat.png',      weight: 10 },
  { id: 'pig', name: 'Pig',  img: 'src/pig.jpg', weight: 30 }
];

function savePets() {
  localStorage.setItem(PET_KEY, JSON.stringify(ownedPets));
  if (currentPetId) {
    localStorage.setItem('currentPet', currentPetId);
  } else {
    localStorage.setItem('currentPet', "none");
  }
}

// 2) Shop reel hookup
const buyBtn     = document.querySelector('.buyBtn');
const shopReel   = document.getElementById('shopReel');
const shopResult = document.getElementById('shopResult');
const SHOP_BLOCKS   = 7;
const SHOP_ITEM_W   = 64 + 8;   // image width + margin
const SHOP_CONT_W   = 200;
const SHOP_SPIN_DUR = 1.5;      // seconds

buyBtn.addEventListener('click', () => {
  if (gold < 2000) {
    shopResult.textContent = 'Not enough gold!';
    return;
  }
  if( isBuyingPet) return;
    isBuyingPet = true;
    buyBtn.disabled = true;
  gold -= 2000; updateGoldDisplay();

  // reset reel
  shopReel.style.transition = 'none';
  shopReel.style.transform  = 'translateX(0)';
  void shopReel.offsetWidth;

  // build pet strip
  shopReel.innerHTML = '';
  const spinPool = pets.filter(p => p.id !== 'none');
  const seq = [];
  for (let i = 0; i < SHOP_BLOCKS; i++) seq.push(...spinPool);
  seq.forEach(p => {
    const img = new Image();
    img.src = p.img;
    img.alt = p.name;
    shopReel.appendChild(img);
  });

  // pick winner
  const winnerIdx         = weightedRandomIndex(spinPool);
  const midBlock          = Math.floor(SHOP_BLOCKS / 2);
  const absoluteWinnerIdx = midBlock * spinPool.length + winnerIdx;
  const target = absoluteWinnerIdx * SHOP_ITEM_W
               - (SHOP_CONT_W/2 - SHOP_ITEM_W/2);

  // spin
  setTimeout(() => {
    shopReel.style.transition = `transform ${SHOP_SPIN_DUR}s ease-out`;
    shopReel.style.transform  = `translateX(-${target}px)`;
  }, 50);

  // on finish → award pet
  shopReel.addEventListener('transitionend', () => {
    const pet = spinPool[winnerIdx];
    if (!ownedPets.includes(pet.id)) {
      ownedPets.push(pet.id);
      savePets();
      updatePetList();
      shopResult.innerHTML = `You found <strong>${pet.name}</strong>!`;
    } else {
      shopResult.innerHTML = `You already have <strong>${pet.name}</strong>.`;
    }
    isBuyingPet = false;
    buyBtn.disabled = false;
  }, { once: true });
});

// 3) Current‐pet icon & modal
const currentIcon    = document.getElementById('currentPetIcon');
const petToggle      = document.getElementById('petToggle');
const petModal       = document.getElementById('petModal');
const closePetModal  = document.getElementById('closePetModal');
const petList        = document.getElementById('petList');

const petSounds = {
  none:    { clip: new Audio('src/silence.mp3'),    interval: null, delay: 0 },
  cat:  { clip: new Audio('src/meow.mp3'),       interval: null, delay: 30000 },
  dog:    { clip: new Audio('src/bark.mp3'),      interval: null, delay: 45000 },
  sheep:  { clip: new Audio('src/baa.mp3'),     interval: null, delay: 20000 },
  pig: { clip: new Audio('src/oink.mp3'),   interval: null, delay: 60000 }
};

function scheduleNextPetSound() {
  const key = currentPetId || 'none';
  const ps  = petSounds[key];
  if (!ps || !ps.clip || ps.delay === 0) return;

  // play now
  ps.clip.currentTime = 0;
  ps.clip.play().catch(() => {});

  // pick a new random delay within ±20% of base delay
  const variance    = 0.2;           // 20%
  const base        = ps.delay;
  const minDelay    = base * (1 - variance);
  const maxDelay    = base * (1 + variance);
  const nextDelay   = Math.random() * (maxDelay - minDelay) + minDelay;

  // schedule the next play
  ps.timeoutId = setTimeout(scheduleNextPetSound, nextDelay);
}

function stopPetSound() {
  const key = currentPetId || 'none';
  const ps  = petSounds[key];
  if (ps && ps.timeoutId) {
    clearTimeout(ps.timeoutId);
    ps.timeoutId = null;
  }
}

function startPetSound() {
  stopPetSound();
  // immediate schedule (will also play immediately)
  scheduleNextPetSound();
}
function refreshCurrentPet() {
  // look up the pet object (will be undefined if none or bad id)
  const pet = pets.find(p => p.id === currentPetId);

  if (!pet) {
    // either “None” or invalid → show placeholder
    currentIcon.src = 'src/placeholder.png';
    currentIcon.alt = 'No Pet';
  } else {
    // valid pet
    currentIcon.src = pet.img;
    currentIcon.alt = pet.name;
  }

  // restart sound loop for whatever is now active
  startPetSound();
}
function updatePetList() {
  // Clear out any existing entries
  petList.innerHTML = '';

  // 1) “None” option
  const nonePet = pets.find(p => p.id === 'none');
  const noneBtn = document.createElement('button');
  noneBtn.style.border = 'none';
  noneBtn.style.padding = '0';
  noneBtn.style.background = 'none';
  noneBtn.style.cursor = 'pointer';
  noneBtn.innerHTML = `
    <div style="
      width:48px; height:48px;
      display:flex; align-items:center; justify-content:center;
      background:#333; border-radius:8px; border:2px solid #666;
      color:#aaa; font-size:12px;">
      ${nonePet.name}
    </div>
  `;
  noneBtn.addEventListener('click', () => {
    currentPetId = null;
    savePets();
    refreshCurrentPet();
    petModal.style.display = 'none';
  });
  petList.appendChild(noneBtn);

  // 2) Owned pets (exclude 'none' from this list)
  ownedPets
    .filter(id => id !== 'none')
    .forEach(id => {
      const pet = pets.find(p => p.id === id);
      if (!pet) return;  // safety check

      const btn = document.createElement('button');
      btn.style.border = 'none';
      btn.style.padding = '0';
      btn.style.background = 'none';
      btn.style.cursor = 'pointer';
      btn.innerHTML = `
        <img src="${pet.img}" alt="${pet.name}"
             style="width:48px;height:48px;border-radius:8px;border:2px solid #666;">
      `;
      btn.addEventListener('click', () => {
        currentPetId = id;
        savePets();
        refreshCurrentPet();
        petModal.style.display = 'none';
      });
      petList.appendChild(btn);
    });
}


petToggle.addEventListener('click', () => {
  updatePetList();
  petModal.style.display = 'flex';
});
closePetModal.addEventListener('click', () => {
  petModal.style.display = 'none';
});

// initialize icon on load
refreshCurrentPet();
updatePetList();

// map pet‑id → audio clip + interval ref

//*******************************************************************************************************************************

  // —— Original Game Logic ——
  const MAX_HEALTH=200, MAX_ATTEMPTS=5, MAX_DMG=50, MIN_DMG=15;
  const OUTER_TH=20*Math.PI/180, SPIN_SPEED=0.08, SEGMENTS=5;
  const SEG_WF=1.5, TOTAL_ARC=2*OUTER_TH*SEG_WF, SEG_ARC=TOTAL_ARC/SEGMENTS;
  const DEBOUNCE_MS=300;

  let dragonHealth, attempt, wheelAngle, targetAngle, gameOver, animId;
  let lastKeyTime=0, soundsOn=false, justRestarted=false, lastTime=performance.now();
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
const attackBtn=document.getElementById('attackBtn');
const now = performance.now();

const SEG_COLORS=Array.from({length:SEGMENTS},(_,i)=>{
  const t=i/(SEGMENTS-1),g=Math.round(255*(1-t));
  return `rgb(255,${g},0)`;
});

function randAngle(){ return Math.random()*2*Math.PI; }
function updateBossBar(){ bossBar.style.width=(dragonHealth/MAX_HEALTH*100)+'%'; }

function doAttack(fromKey=false){
  const now = performance.now();

  // Only debounce key input
  if (fromKey && now - lastKeyTime < DEBOUNCE_MS) return;

  lastKeyTime = now;

  if (justRestarted) return;

  if (gameOver) {
    init();
    justRestarted = true;
    setTimeout(() => justRestarted = false, 100);
    return;
  }

  if (attempt >= MAX_ATTEMPTS) return;

  if (soundsOn) {
    explodeSfx.currentTime = 0;
    explodeSfx.play();
  }

  bedImg.style.visibility = 'hidden';
  explImg.style.opacity = 1;
  setTimeout(() => {
    explImg.style.opacity = 0;
    bedImg.style.visibility = 'visible';
  }, 100);

  attempt++;
  attEl.textContent = attempt;

  let rel = wheelAngle - (targetAngle - TOTAL_ARC/2);
  rel = (rel % (2*Math.PI) + 2*Math.PI) % (2*Math.PI);

  let dmg = 0;
  if (rel < TOTAL_ARC) {
    const idx = Math.min(SEGMENTS - 1, Math.floor(rel / SEG_ARC));
    dmg = Math.round(MIN_DMG + (MAX_DMG - MIN_DMG) * (idx / (SEGMENTS - 1)));
  }

  dragonHealth = Math.max(0, dragonHealth - dmg);
  healthEl.textContent = dragonHealth;
  hitEl.textContent = dmg;
  updateBossBar();

  if (dragonHealth === 0) return end(true);
  if (attempt === MAX_ATTEMPTS) return end(false);

  targetAngle = randAngle();
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
  wheelAngle += SPIN_SPEED * (60 / (1000 / (performance.now() - lastTime)));
  wheelAngle %= 2 * Math.PI;
  lastTime = performance.now();
  draw();
  animId = requestAnimationFrame(loop);
}

function end(won) {
  gameOver = true;
  cancelAnimationFrame(animId);

  if (soundsOn) flapSfx.pause();

  overlay.className = 'show ' + (won ? 'win' : 'lose');
  msg.textContent    = won ? '🎉 You Win!' : '❌ Game Over';

  // ← award 100 gold on win
  if (won) awardGold(100);
}


window.addEventListener('keydown', e => {
  if (!(e.code === 'Space' || e.key === ' ' || e.keyCode === 32)) return;
  doAttack(true); // key input — debounce applies
});

attackBtn.addEventListener('click', e => {
  e.preventDefault();
  e.stopImmediatePropagation();
  doAttack(false); // mouse input — debounce skipped
});
attackBtn.addEventListener('touchstart', e => {
  e.preventDefault();
  e.stopImmediatePropagation();
  doAttack(false); // touch input — debounce skipped
});

btn.addEventListener('click', () => init());
muteBtn.addEventListener('click', () => {
  soundsOn = !soundsOn;
  muteBtn.textContent = soundsOn ? '🔊' : '🔇';
  flapSfx.muted = !soundsOn;
  explodeSfx.muted = !soundsOn;
  if (soundsOn && !gameOver) flapSfx.play();
  muteBtn.blur();
});

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

init();
  // Then your existing init()/restart(), animation loop, input handlers, etc.