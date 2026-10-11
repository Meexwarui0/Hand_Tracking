/* =========================================================
 * 1. HELPERS & CONFIG
 * ======================================================= */
const $  = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE_KEY = 'w2w-v2';

const CONFIG = {
  maxHearts: 3,
  xpPerLevel: 100,          // คะแนนที่ต้องใช้ = level * xpPerLevel
  levelUpBonus: 50,
  growTimeMs: 8000,
  decorCost: 50,
  points: {
    rescueCorrect: 10,
    compostPick: 5,
    compostDone: 20,
    plant: 5,
    harvest: 15,           // ต่อผัก 1 ต้น
    mission: 20
  }
};

/** ล้างแล้วสร้าง element ใหม่ใส่ใน container */
function render(container, items, build) {
  container.innerHTML = '';
  items.forEach((item, i) => container.appendChild(build(item, i)));
}

/** สร้าง element พร้อม class และ HTML */
function el(tag, className = '', html = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html) node.innerHTML = html;
  return node;
}

/** เล่นแอนิเมชันสั่นสั้น ๆ (ใช้ตอนตอบผิด) */
function shake(node) {
  node.classList.add('shake');
  setTimeout(() => node.classList.remove('shake'), 300);
}

/** แทนที่ <i data-icon="ชื่อ"> ทั้งหน้าด้วย SVG */
function hydrateIcons(root = document) {
  $$('[data-icon]', root).forEach(node => (node.innerHTML = icon(node.dataset.icon)));
}

/* =========================================================
 * 2. GAME DATA  (ค่า icon = ชื่อไอคอนใน icons.js)
 * ======================================================= */
const CHARACTERS = ['kid1', 'kid2', 'kid3', 'kid4'];

// action: 'compost' | 'store' | 'trash'
const FOODS = [
  { icon: 'banana',  name: 'กล้วยสุกช้ำ',     action: 'compost', desc: 'กล้วยสุกจนช้ำ กินไม่อร่อยแล้ว แต่ยังเป็นปุ๋ยได้' },
  { icon: 'lettuce', name: 'ผักเหี่ยว',        action: 'compost', desc: 'ผักใบที่เหี่ยวแล้ว ไม่มีรา นำไปทำปุ๋ยได้' },
  { icon: 'bread',   name: 'ขนมปังใหม่',       action: 'store',   desc: 'ขนมปังยังไม่ขึ้นรา เก็บไว้กินต่อได้' },
  { icon: 'apple',   name: 'แอปเปิ้ลสด',        action: 'store',   desc: 'ยังสดและกรอบอยู่ เก็บในตู้เย็นไว้กินได้' },
  { icon: 'carrot',  name: 'เปลือกแครอท',      action: 'compost', desc: 'เศษผักจากการปอก เหมาะกับการทำปุ๋ย' },
  { icon: 'milk',    name: 'นมบูด',            action: 'trash',   desc: 'นมเสียมีกลิ่นเปรี้ยว ไม่ควรกินหรือทำปุ๋ยในบ้าน' },
  { icon: 'fish',    name: 'ก้างปลา',          action: 'trash',   desc: 'เศษเนื้อสัตว์ทำให้เหม็นและเรียกแมลง ควรทิ้งให้ถูกวิธี' },
  { icon: 'dish',    name: 'กับข้าวมันเยิ้ม',   action: 'trash',   desc: 'น้ำมันมากเกินไปไม่เหมาะกับถังปุ๋ยบ้าน' }
];

const COMPOST_ITEMS = [
  { icon: 'banana',  name: 'เปลือกกล้วย', ok: true },
  { icon: 'lettuce', name: 'เศษผัก',      ok: true },
  { icon: 'egg',     name: 'เปลือกไข่',   ok: true },
  { icon: 'coffee',  name: 'กากกาแฟ',     ok: true },
  { icon: 'meat',    name: 'เนื้อสัตว์',   ok: false },
  { icon: 'oil',     name: 'น้ำมัน',      ok: false }
];
const COMPOST_PICKS_NEEDED = 3;
const COMPOST_YIELD = 2;

const CROPS       = ['carrot', 'tomato', 'lettuce', 'corn', 'eggplant'];
const DECORATIONS = ['flower', 'house', 'butterfly', 'bee', 'sun', 'tree'];
const BADGES      = ['Seedling', 'Compost Master', 'Green Thumb', 'Eco Hero', 'Garden Legend'];

const TEAM = [
  { name: 'Mint', avatar: 'kid3', points: 240 },
  { name: 'Aom',  avatar: 'kid2', points: 220 },
  { name: 'Beam', avatar: 'kid4', points: 180 }
];
const MISSIONS = [
  'วางแผนมื้ออาหารไม่ให้เหลือทิ้ง',
  'แยกเศษอาหารก่อนทิ้งทุกครั้ง',
  'เก็บเศษผักผลไม้ทำปุ๋ย',
  'ถ่ายรูปไอเดียนำของเหลือกลับมาใช้'
];

const LEADERBOARD = [
  { name: 'Mint', avatar: 'kid3', points: 420 },
  { name: 'Aom',  avatar: 'kid2', points: 390 },
  { name: 'Beam', avatar: 'kid4', points: 350 },
  { name: 'Luknat', avatar: 'kid1', points: 320 },
  { name: 'Fashai', avatar: 'kid3', points: 280 }
];

/* =========================================================
 * 3. STATE & PERSISTENCE
 * ======================================================= */
const DEFAULT_STATE = {
  score: 0,
  level: 1,
  hearts: CONFIG.maxHearts,
  character: CHARACTERS[0],
  compost: 0,
  harvest: 0,
  plots: Array(9).fill(null),   // null | { crop, grown }
  decos: [],
  missions: MISSIONS.map(() => false)
};

function loadState() {
  try {
    return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

const state = loadState();

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

/* =========================================================
 * 4. HUD, SCORE & LEVEL
 * ======================================================= */
const xpNeeded = level => level * CONFIG.xpPerLevel;

function updateHud() {
  const needed = xpNeeded(state.level);

  $('#score').textContent  = state.score;
  $('#level').textContent  = state.level;
  $('#level2').textContent = state.level;
  $('#hearts').innerHTML   = icon('heart').repeat(state.hearts) +
                             icon('heartEmpty').repeat(CONFIG.maxHearts - state.hearts);
  $('#compostCount').textContent = state.compost;
  $('#harvestCount').textContent = state.harvest;
  $('#xpFill').style.width = Math.min(100, (state.score / needed) * 100) + '%';
  $('#xpText').textContent = `${Math.min(state.score, needed)}/${needed}`;

  saveState();
}

function addScore(amount) {
  state.score += amount;

  while (state.score >= xpNeeded(state.level)) {
    state.level++;
    state.score += CONFIG.levelUpBonus;
    showLevelUp();
  }
  updateHud();
}

function showLevelUp() {
  $('#newLevel').textContent  = state.level;
  $('#badgeName').textContent = BADGES[Math.min(state.level - 1, BADGES.length - 1)];
  $('#levelModal').classList.remove('hidden');
}

$('#modalOk').onclick = () => $('#levelModal').classList.add('hidden');

/* =========================================================
 * 5. NAVIGATION
 * ======================================================= */
const GAME_SCREENS = ['rescue', 'compost', 'garden', 'friends'];

// ฟังก์ชันที่ต้องรันทุกครั้งที่เข้าหน้านั้น
const SCREEN_HOOKS = {
  rescue:      () => initRescue(),
  compost:     () => initCompost(),
  garden:      () => renderGarden(),
  friends:     () => renderFriends(),
  leaderboard: () => renderBoard()
};

function go(id) {
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  $('#hud').classList.toggle('hidden', !GAME_SCREENS.includes(id));
  SCREEN_HOOKS[id]?.();
  updateHud();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', e => {
  const target = e.target.closest('[data-go]');
  if (!target) return;
  e.preventDefault();
  go(target.dataset.go);
});

/* =========================================================
 * 6. SCREENS
 * ======================================================= */

/* ---------- 3. Character select ---------- */
function initCharacterSelect() {
  render($('#chars'), CHARACTERS, character => {
    const card = el('div', 'char' + (character === state.character ? ' selected' : ''), icon(character));
    card.onclick = () => {
      state.character = character;
      $$('.char').forEach(c => c.classList.toggle('selected', c === card));
      saveState();
    };
    return card;
  });

  $('#startGame').onclick = () => {
    state.hearts = CONFIG.maxHearts;
    saveState();
    go('rescue');
  };
}

/* ---------- 4. Food Rescue ---------- */
let selectedFood = null;

function initRescue() {
  selectedFood = null;
  $('#meRescue').innerHTML = icon(state.character);
  setRescueInfo('question', 'เลือกอาหาร', 'กดเลือกอาหารทางซ้าย');
  setRescueMessage('เลือกให้ถูกต้องเพื่อรับคะแนนนะ!');

  render($('#foodGrid'), FOODS, (food, i) => {
    const card = el('div', 'food', icon(food.icon));
    card.id = 'food' + i;
    card.onclick = () => selectFood(i);
    return card;
  });
}

function setRescueInfo(iconName, name, desc) {
  $('#infoIcon').innerHTML = icon(iconName);
  $('#infoName').textContent = name;
  $('#infoDesc').textContent = desc;
}

function setRescueMessage(text) {
  $('#rescueMsg').textContent = text;
}

function selectFood(index) {
  selectedFood = index;
  $$('.food').forEach((card, i) => card.classList.toggle('selected', i === index));
  const { icon: iconName, name, desc } = FOODS[index];
  setRescueInfo(iconName, name, desc);
}

function handleRescueAction(button) {
  if (selectedFood === null) {
    setRescueMessage('เลือกอาหารก่อนนะ 👈');
    return;
  }

  const food = FOODS[selectedFood];
  if (button.dataset.act === food.action) {
    rescueCorrect(food);
  } else {
    rescueWrong(food, button);
  }
}

function rescueCorrect(food) {
  const card = $('#food' + selectedFood);
  card.classList.remove('selected');
  card.classList.add('done');
  selectedFood = null;

  if (food.action === 'compost') state.compost++;
  setRescueMessage(`ถูกต้อง! +${CONFIG.points.rescueCorrect} คะแนน`);
  addScore(CONFIG.points.rescueCorrect);

  if ($$('.food.done').length === FOODS.length) {
    setTimeout(() => {
      alert('ผ่านด่าน Food Rescue แล้ว!');
      go('compost');
    }, 300);
  }
}

function rescueWrong(food, button) {
  setRescueMessage('ยังไม่ถูกนะ ลองคิดใหม่ — ' + food.desc);
  shake(button);

  state.hearts--;
  if (state.hearts <= 0) {
    state.hearts = CONFIG.maxHearts;
    setRescueMessage('หัวใจหมด! เริ่มหัวใจใหม่แล้ว สู้ ๆ นะ');
  }
  updateHud();
}

$$('.act').forEach(button => (button.onclick = () => handleRescueAction(button)));

/* ---------- 5. Compost Lab ---------- */
let binItems = [];

function initCompost() {
  binItems = [];
  updateCompostUi('ใส่เศษอาหารลงถังหมัก');
  $('#compostNext').disabled = true;

  render($('#compostOptions'), COMPOST_ITEMS, item => {
    const button = el('button', 'copt', `${icon(item.icon)}${item.name}`);
    button.onclick = () => pickCompostItem(item, button);
    return button;
  });
}

function updateCompostUi(message) {
  $('#cStep').textContent = Math.max(1, binItems.length);
  $('#binContent').innerHTML = binItems.map(icon).join('');
  $('#cMsg').textContent = message;
}

function pickCompostItem(item, button) {
  if (binItems.length >= COMPOST_PICKS_NEEDED) return;

  if (!item.ok) {
    $('#cMsg').textContent = `${item.name} ไม่เหมาะกับการทำปุ๋ยในบ้านนะ`;
    shake(button);
    return;
  }

  button.disabled = true;
  binItems.push(item.icon);
  addScore(CONFIG.points.compostPick);
  updateCompostUi(`เหมาะสม! +${CONFIG.points.compostPick} คะแนน`);

  if (binItems.length === COMPOST_PICKS_NEEDED) {
    updateCompostUi(`หมักเสร็จแล้ว ได้ปุ๋ย +${COMPOST_YIELD}!`);
    $('#compostNext').disabled = false;
  }
}

$('#compostNext').onclick = () => {
  state.compost += COMPOST_YIELD;
  addScore(CONFIG.points.compostDone);
  go('garden');
};

/* ---------- 6. My Garden ---------- */
const growTimers = {};

function renderGarden() {
  render($('#gardenGrid'), state.plots, (plot, i) => {
    const tile = el('div', 'plot' + (plot?.grown ? ' grown' : ''));
    if (plot) tile.innerHTML = icon(plot.grown ? plot.crop : 'sprout');
    tile.onclick = () => plant(i);

    if (plot && !plot.grown) startGrowing(i);
    return tile;
  });
  $('#decoRow').innerHTML = state.decos.map(icon).join(' ');
}

function startGrowing(index) {
  if (growTimers[index]) return;

  growTimers[index] = setTimeout(() => {
    delete growTimers[index];
    if (!state.plots[index]) return;

    state.plots[index].grown = true;
    saveState();
    if ($('#garden').classList.contains('active')) renderGarden();
  }, CONFIG.growTimeMs);
}

function plant(index) {
  if (state.plots[index]) return;

  if (state.compost < 1) {
    alert('ต้องมีปุ๋ยอย่างน้อย 1 หน่วย — ไปทำปุ๋ยที่ Compost Lab ก่อนนะ');
    return;
  }

  state.compost--;
  state.plots[index] = {
    crop: CROPS[Math.floor(Math.random() * CROPS.length)],
    grown: false
  };
  addScore(CONFIG.points.plant);
  renderGarden();
}

$('#harvestBtn').onclick = () => {
  const ready = state.plots.filter(p => p?.grown).length;
  if (!ready) {
    alert('ยังไม่มีผักที่โตเต็มที่ รอสักครู่นะ');
    return;
  }

  state.plots = state.plots.map(p => (p?.grown ? null : p));
  state.harvest += ready;
  addScore(ready * CONFIG.points.harvest);
  renderGarden();
};

$('#decorBtn').onclick = () => {
  if (state.score < CONFIG.decorCost) {
    alert(`ต้องมีคะแนนอย่างน้อย ${CONFIG.decorCost} แต้ม`);
    return;
  }

  const next = DECORATIONS.find(d => !state.decos.includes(d));
  if (!next) {
    alert('ปลดล็อกของตกแต่งครบแล้ว!');
    return;
  }

  state.score -= CONFIG.decorCost;
  state.decos.push(next);
  updateHud();
  renderGarden();
};

/* ---------- 7. Friends Challenge ---------- */
function renderFriends() {
  const team = $('#team');
  team.innerHTML = '';

  TEAM.forEach(m => team.appendChild(memberCard(m.avatar, m.name, m.points)));
  team.appendChild(memberCard(state.character, 'Me', state.score));

  const invite = el('div', 'member empty', '+');
  invite.onclick = () => alert('ส่งลิงก์เกมนี้ชวนเพื่อนเข้าทีมได้เลย!');
  team.appendChild(invite);

  $('#teamCount').textContent = TEAM.length + 1;

  render($('#missions'), MISSIONS, (text, i) => {
    const done = state.missions[i];
    const item = el('li', done ? 'done' : '',
      `<span class="check">${done ? '✓' : ''}</span><span>${text}</span>` +
      `<small style="margin-left:auto">+${CONFIG.points.mission}</small>`);
    item.onclick = () => {
      if (state.missions[i]) return;
      state.missions[i] = true;
      addScore(CONFIG.points.mission);
      renderFriends();
    };
    return item;
  });
}

function memberCard(avatar, name, points) {
  return el('div', 'member',
    `<div class="av">${icon(avatar)}</div><b>${name}</b><br><small>${points} pts</small>`);
}

/* ---------- 8. Leaderboard ---------- */
function renderBoard() {
  const rows = [
    ...LEADERBOARD,
    { name: 'Me', avatar: state.character, points: state.score, me: true }
  ].sort((a, b) => b.points - a.points);

  render($('#board'), rows, (row, i) => el('li', row.me ? 'me' : '',
    `<span class="rank">${i === 0 ? icon('crown') : i + 1}</span>` +
    `<span class="name">${icon(row.avatar)} ${row.name}</span>` +
    `<span class="pts">${row.points} pts</span>`));
}

/* =========================================================
 * 7. INIT
 * ======================================================= */
hydrateIcons();
initCharacterSelect();
updateHud();