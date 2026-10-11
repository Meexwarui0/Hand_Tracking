/**
 * Waste to Wonder — hand-drawn style icons (inline SVG)
 * Thick dark outline, flat pastel fills, tiny smiling faces.
 * Usage: icon('carrot')  → returns an <svg> string sized 1em
 */
'use strict';

const INK = '#2b2b2b';

const wrapSvg = inner =>
  `<svg class="ic" viewBox="0 0 64 64" fill="none" stroke="${INK}" stroke-width="3" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

/** ใบหน้ายิ้ม (x,y = ตำแหน่งกึ่งกลางระหว่างตา, s = ขนาด) */
const face = (x, y, s = 1, cheeks = true) =>
  (cheeks
    ? `<circle cx="${x - 10 * s}" cy="${y + 4 * s}" r="${3 * s}" fill="#ff9fb2" stroke="none" opacity=".75"/>` +
      `<circle cx="${x + 10 * s}" cy="${y + 4 * s}" r="${3 * s}" fill="#ff9fb2" stroke="none" opacity=".75"/>`
    : '') +
  `<circle cx="${x - 6 * s}" cy="${y}" r="${Math.max(1.5, 2 * s)}" fill="${INK}" stroke="none"/>` +
  `<circle cx="${x + 6 * s}" cy="${y}" r="${Math.max(1.5, 2 * s)}" fill="${INK}" stroke="none"/>` +
  `<path d="M${x - 4 * s} ${y + 4 * s}Q${x} ${y + 8 * s} ${x + 4 * s} ${y + 4 * s}" stroke-width="${Math.max(1.8, 2.4 * s)}"/>`;

/* ---------- ตัวละคร ---------- */
const SKIN = '#ffe3c8';
const KIDS = {
  kid1: () =>
    `<circle cx="13" cy="42" r="8" fill="#8a5a30"/><circle cx="51" cy="42" r="8" fill="#8a5a30"/>` +
    `<circle cx="32" cy="40" r="19" fill="${SKIN}"/>` +
    `<ellipse cx="32" cy="27" rx="27" ry="7" fill="#ffe27a"/>` +
    `<path d="M18 27 C18 7 46 7 46 27Z" fill="#ffe27a"/>` +
    `<path d="M18.5 22 H45.5" stroke="#e58a8a" stroke-width="4"/>` + face(32, 41),
  kid2: () =>
    `<circle cx="32" cy="40" r="19" fill="${SKIN}"/>` +
    `<path d="M14 31 C14 9 50 9 50 31Z" fill="#7bb4ee"/>` +
    `<path d="M32 31 H60 C60 37 46 37 32 33Z" fill="#5f97d6"/>` + face(32, 42),
  kid3: () =>
    `<circle cx="32" cy="10" r="7" fill="#ffb0c8"/>` +
    `<circle cx="32" cy="41" r="19" fill="${SKIN}"/>` +
    `<path d="M12 41 C8 11 56 11 52 41 C50 29 14 29 12 41Z" fill="#ffb0c8"/>` + face(32, 43),
  kid4: () =>
    `<circle cx="32" cy="40" r="19" fill="${SKIN}"/>` +
    `<path d="M14 31 C14 9 50 9 50 31Z" fill="#9ad46c"/>` +
    `<path d="M32 31 H60 C60 37 46 37 32 33Z" fill="#7dba52"/>` + face(32, 42)
};

/* ---------- ไอคอนทั้งหมด ---------- */
const SHAPES = {
  ...Object.fromEntries(Object.entries(KIDS).map(([k, fn]) => [k, fn()])),

  friends:
    `<g transform="translate(-6 10) scale(.62)" stroke-width="4.5">${KIDS.kid1()}</g>` +
    `<g transform="translate(28 10) scale(.62)" stroke-width="4.5">${KIDS.kid3()}</g>`,

  dog:
    `<path d="M12 18 C2 20 4 42 14 44Z" fill="#d9a066"/><path d="M52 18 C62 20 60 42 50 44Z" fill="#d9a066"/>` +
    `<circle cx="32" cy="36" r="20" fill="#fff"/><ellipse cx="32" cy="45" rx="9" ry="7" fill="#fff"/>` +
    `<circle cx="24" cy="31" r="2.2" fill="${INK}" stroke="none"/><circle cx="40" cy="31" r="2.2" fill="${INK}" stroke="none"/>` +
    `<ellipse cx="32" cy="41" rx="3.2" ry="2.4" fill="${INK}"/><path d="M27 47 Q32 51 37 47" stroke-width="2.4"/>`,

  /* อาหาร */
  banana:
    `<path d="M8 46 C10 22 28 10 52 10 C44 16 40 24 38 34 C36 44 24 50 8 46Z" fill="#ffe27a"/>` +
    `<path d="M52 10 L57 5"/>` + face(27, 33, .8),
  lettuce:
    `<path d="M32 10 C46 8 58 20 52 36 C50 50 36 56 28 54 C14 52 6 38 12 24 C16 14 24 10 32 10Z" fill="#b7e08c"/>` +
    `<path d="M30 54 C30 46 28 40 24 34 M30 54 C34 46 36 40 40 34" stroke-width="2"/>` + face(32, 30, .85),
  bread:
    `<path d="M12 28 C6 12 22 6 32 9 C42 6 58 12 52 28 L50 54 H14Z" fill="#ffd59a"/>` + face(32, 36, .9),
  apple:
    `<path d="M32 20 C20 12 8 22 12 38 C15 52 26 57 32 52 C38 57 49 52 52 38 C56 22 44 12 32 20Z" fill="#ff7b6b"/>` +
    `<path d="M32 20 Q32 12 36 7"/><path d="M36 12 Q44 7 47 13 Q41 16 36 12Z" fill="#9ad46c"/>` + face(32, 37, .9),
  carrot:
    `<path d="M22 20 C22 13 42 13 42 20 L35 58 C34 61 30 61 29 58Z" fill="#ffab40"/>` +
    `<path d="M32 15 C26 8 22 5 19 7 C21 12 26 14 32 15Z" fill="#9ad46c"/>` +
    `<path d="M32 15 C31 6 33 2 36 2 C38 8 36 12 32 15Z" fill="#9ad46c"/>` +
    `<path d="M32 15 C38 9 44 7 47 9 C44 13 40 15 32 15Z" fill="#9ad46c"/>` +
    `<path d="M26 44 H29 M36 38 H39" stroke-width="2"/>` + face(32, 29, .75),
  milk:
    `<path d="M16 22 H42 V58 H16Z" fill="#dff0ff"/><path d="M42 22 L50 10 V46 L42 58Z" fill="#bfe3ff"/>` +
    `<path d="M16 22 L24 10 H50 L42 22Z" fill="#fff"/><path d="M40 12 L48 3" stroke-width="3"/>` +
    `<circle cx="22" cy="46" r="1.4" fill="${INK}" stroke="none"/>` + face(29, 38, .8),
  fish:
    `<path d="M12 32 H48"/><path d="M20 32 L26 22 M20 32 L26 42 M30 32 L36 22 M30 32 L36 42 M40 32 L45 25 M40 32 L45 39"/>` +
    `<path d="M12 32 L4 22 V42Z" fill="#fff"/><path d="M48 32 C48 22 60 22 60 32 C60 42 48 42 48 32Z" fill="#fff"/>` +
    `<circle cx="55" cy="30" r="1.8" fill="${INK}" stroke="none"/>`,
  dish:
    `<path d="M22 22 Q18 16 22 10 M32 22 Q28 16 32 10 M42 22 Q38 16 42 10" stroke-width="2.4"/>` +
    `<path d="M12 32 C12 20 52 20 52 32Z" fill="#fff"/>` +
    `<path d="M8 32 H56 C56 48 46 57 32 57 C18 57 8 48 8 32Z" fill="#ffc2cf"/>` + face(32, 42, .85),

  /* ทำปุ๋ย */
  egg:
    `<path d="M32 10 C50 8 58 22 54 36 C52 52 38 57 28 55 C12 53 6 38 10 26 C14 14 22 10 32 10Z" fill="#fff"/>` +
    `<circle cx="32" cy="32" r="11" fill="#ffcf4a"/>` + face(32, 31, .65, false),
  coffee:
    `<path d="M12 22 H44 V42 C44 54 12 54 12 42Z" fill="#ffc2cf"/><path d="M44 26 C56 26 56 40 44 40"/>` +
    `<path d="M20 16 Q17 11 20 6 M30 16 Q27 11 30 6" stroke-width="2.4"/>` + face(28, 35, .85),
  meat:
    `<path d="M28 40 C14 36 12 16 28 12 C44 8 56 24 46 36 C42 41 34 42 28 40Z" fill="#e8935a"/>` +
    `<path d="M30 40 L16 53"/><circle cx="13" cy="53" r="4" fill="#fff"/><circle cx="18" cy="57" r="4" fill="#fff"/>` + face(36, 24, .7),
  oil:
    `<path d="M26 6 H38 V16 C46 20 48 28 48 36 V54 C48 58 44 60 40 60 H24 C20 60 16 58 16 54 V36 C16 28 18 20 26 16Z" fill="#ffe27a"/>` +
    `<path d="M20 33 H44 V51 H20Z" fill="#fff" stroke-width="2.2"/>` + face(32, 41, .7, false),
  bin:
    `<path d="M10 26 H54 V58 H10Z" fill="#e0b27a"/><path d="M6 18 H58 V26 H6Z" fill="#c8915a"/>` + face(32, 42, .85),

  /* พืชผัก */
  tomato:
    `<path d="M32 18 C14 14 6 34 12 46 C18 59 46 59 52 46 C58 34 50 14 32 18Z" fill="#ff7b6b"/>` +
    `<path d="M32 18 L23 12 L30 15 L32 7 L34 15 L41 12Z" fill="#9ad46c"/>` + face(32, 38, .95),
  corn:
    `<path d="M32 6 C42 10 44 30 40 44 C38 56 26 56 24 44 C20 30 22 10 32 6Z" fill="#ffe27a"/>` +
    `<path d="M32 60 C16 56 10 34 20 22 C22 38 26 50 32 60Z" fill="#9ad46c"/>` +
    `<path d="M32 60 C48 56 54 34 44 22 C42 38 38 50 32 60Z" fill="#9ad46c"/>` + face(32, 26, .7),
  eggplant:
    `<path d="M36 16 C50 16 56 34 46 48 C38 58 16 60 12 50 C8 40 22 34 28 24 C30 18 32 16 36 16Z" fill="#c8a2ff"/>` +
    `<path d="M34 18 L26 8 L36 12 L44 6 L42 18Z" fill="#9ad46c"/>` + face(32, 45, .8),
  sprout:
    `<path d="M32 58 V32"/>` +
    `<path d="M32 36 C18 36 12 28 12 18 C24 18 32 25 32 36Z" fill="#b7e08c"/>` +
    `<path d="M32 32 C32 20 40 13 52 13 C52 25 44 32 32 32Z" fill="#8fd16a"/>` +
    `<path d="M18 58 Q32 48 46 58Z" fill="#c9a06a"/>`,

  /* ของตกแต่ง */
  flower:
    `<circle cx="32" cy="16" r="9" fill="#ffb0c8"/><circle cx="49" cy="28" r="9" fill="#ffb0c8"/>` +
    `<circle cx="43" cy="48" r="9" fill="#ffb0c8"/><circle cx="21" cy="48" r="9" fill="#ffb0c8"/>` +
    `<circle cx="15" cy="28" r="9" fill="#ffb0c8"/><circle cx="32" cy="34" r="11" fill="#ffe27a"/>` + face(32, 33, .6, false),
  house:
    `<path d="M16 30 H48 V57 H16Z" fill="#fff3d6"/><path d="M8 32 L32 10 L56 32Z" fill="#ff8f7f"/>` +
    `<path d="M27 42 H37 V57 H27Z" fill="#ffc2cf"/>`,
  butterfly:
    `<path d="M32 30 C14 8 4 24 14 34 C6 44 22 54 32 38Z" fill="#ffb0c8"/>` +
    `<path d="M32 30 C50 8 60 24 50 34 C58 44 42 54 32 38Z" fill="#bfe3ff"/>` +
    `<path d="M32 22 V46"/><path d="M32 22 Q28 14 24 14 M32 22 Q36 14 40 14" stroke-width="2.2"/>`,
  bee:
    `<ellipse cx="22" cy="20" rx="8" ry="6" fill="#fff"/><ellipse cx="42" cy="20" rx="8" ry="6" fill="#fff"/>` +
    `<ellipse cx="32" cy="38" rx="20" ry="15" fill="#ffe27a"/>` +
    `<path d="M18 29 V47 M46 29 V47"/><path d="M52 38 L58 38" stroke-width="3"/>` + face(32, 37, .75),
  sun:
    `<path d="M32 5 V13 M32 51 V59 M5 32 H13 M51 32 H59 M13 13 L19 19 M51 13 L45 19 M13 51 L19 45 M51 51 L45 45"/>` +
    `<circle cx="32" cy="32" r="14" fill="#ffe27a"/>` + face(32, 31, .8),
  tree:
    `<path d="M28 40 H36 V58 H28Z" fill="#c9a06a"/>` +
    `<path d="M32 5 C44 3 55 14 50 26 C55 37 44 46 32 42 C20 46 9 37 14 26 C9 14 20 3 32 5Z" fill="#b7e08c"/>` + face(32, 24, .85),
  cloud:
    `<path d="M16 48 C5 48 3 33 14 31 C14 18 30 14 37 24 C47 18 60 27 53 39 C60 45 53 52 46 48Z" fill="#fff"/>` + face(32, 36, .8),

  /* ทั่วไป */
  heart:      `<path d="M32 55 C10 39 6 22 18 14 C26 10 32 16 32 21 C32 16 38 10 46 14 C58 22 54 39 32 55Z" fill="#ff7b8a"/>`,
  heartEmpty: `<path d="M32 55 C10 39 6 22 18 14 C26 10 32 16 32 21 C32 16 38 10 46 14 C58 22 54 39 32 55Z" fill="#fff"/>`,
  star:       `<path d="M32 6 L39 24 L58 25 L43 37 L48 56 L32 45 L16 56 L21 37 L6 25 L25 24Z" fill="#ffe27a"/>`,
  crown:      `<path d="M8 46 L12 18 L24 32 L32 14 L40 32 L52 18 L56 46Z" fill="#ffe27a"/><path d="M8 52 H56"/>`,
  fridge:
    `<path d="M18 6 H46 V58 H18Z" fill="#dff0ff"/><path d="M18 24 H46"/><path d="M24 12 V18 M24 30 V38" stroke-width="2.6"/>` + face(34, 44, .6, false),
  trash:
    `<path d="M16 22 H48 L44 58 H20Z" fill="#e4dcf7"/><path d="M11 22 H53 M26 22 V14 H38 V22"/><path d="M27 31 V50 M37 31 V50" stroke-width="2.4"/>`,
  question:
    `<circle cx="32" cy="32" r="23" fill="#fff3d6"/><path d="M24 27 C24 15 41 15 41 26 C41 33 32 33 32 41"/><path d="M32 49 V50"/>`
};

/** คืนค่า SVG ของไอคอนตามชื่อ (ไม่พบชื่อ → เครื่องหมายคำถาม) */
function icon(name) {
  return wrapSvg(SHAPES[name] || SHAPES.question);
}