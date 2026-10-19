// 產生遊戲人物的向量圖（原創 Q 版造型）：三位人物各五種表情半身圖，引導人物另有地圖四方向全身圖。
// 用法：npm run game:characters
// 同名 PNG 放進 src/game/assets/characters/ 時，遊戲會優先使用 PNG。
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'game', 'assets', 'characters');
mkdirSync(OUT, { recursive: true });

const SKIN = '#fde3cf', SKIN_LINE = '#d9a98a', SHIRT = '#f6efe1', SHIRT_LINE = '#cbbfa8', PANTS = '#4b4a53', SHOES = '#8a4b25';

const PALETTES = {
  guide: { hair: '#aab6d3', hairLine: '#6b7896', vest: '#3e5f9f', vestLine: '#283f70', tie: '#1d2b55', iris: '#c88a1a', style: 'messy', prop: 'crystal' },
  helper: { hair: '#b48d69', hairLine: '#7a5a3d', vest: '#bc9330', vestLine: '#8a6a1c', tie: '#5b3a22', iris: '#c88a1a', style: 'messy', prop: 'openbook' },
  client: { hair: '#34333a', hairLine: '#1c1b20', vest: '#2d3f68', vestLine: '#1b2847', tie: '#a3333a', iris: '#6b4527', style: 'neat', prop: 'clipboard', glasses: true, jacket: true },
};

// 每種表情：眉、眼、嘴與姿勢
const EXPRESSIONS = {
  explain: { brows: 'calm', eyes: 'open', mouth: 'smile', pose: 'hold' },
  encourage: { brows: 'up', eyes: 'open', mouth: 'grin', pose: 'thumb', fx: 'spark' },
  puzzled: { brows: 'tilt', eyes: 'open', mouth: 'wave', pose: 'chin', fx: 'question', tilt: -7 },
  remind: { brows: 'firm', eyes: 'open', mouth: 'flat', pose: 'point', fx: 'bang' },
  success: { brows: 'up', eyes: 'happy', mouth: 'open', pose: 'raise', fx: 'stars' },
};

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>\n`;
const g = (inner, attrs = '') => `<g ${attrs}>${inner}</g>`;

// ---- 頭部 ----
function hairBack(p) {
  if (p.style === 'neat') return `<path d="M48 110 C36 26 164 26 152 110 L150 124 L50 124 Z" fill="${p.hair}" stroke="${p.hairLine}" stroke-width="2.5"/>`;
  return SPIKES.map(d => `<path d="${d}" fill="${p.hair}" stroke="${p.hairLine}" stroke-width="2.5" stroke-linejoin="round"/>`).join('')
    + `<path d="M44 108 C24 22 176 22 156 108 L164 136 Q150 124 146 140 L140 116 L60 116 L54 140 Q50 124 36 136 Z" fill="${p.hair}" stroke="${p.hairLine}" stroke-width="2.5" stroke-linejoin="round"/>`;
}

const SPIKES = [
  'M66 50 Q48 30 44 16 Q66 26 86 38 Z',
  'M88 40 Q86 20 94 4 Q104 22 110 38 Z',
  'M112 40 Q126 18 142 10 Q138 30 132 48 Z',
  'M134 56 Q156 46 170 48 Q158 62 148 76 Z',
  'M54 70 Q36 62 26 64 Q38 76 50 90 Z',
];

function hairFront(p) {
  if (p.style === 'neat') {
    return `<path d="M50 102 C42 30 158 30 150 100 Q140 80 118 78 Q106 70 94 82 Q70 78 50 102 Z" fill="${p.hair}" stroke="${p.hairLine}" stroke-width="2.5" stroke-linejoin="round"/>`
      + `<path d="M104 48 Q98 62 94 80" stroke="#55545c" stroke-width="2.4" fill="none"/><path d="M118 52 Q126 62 130 76" stroke="#55545c" stroke-width="1.8" fill="none" opacity=".7"/>`;
  }
  const fringe = 'M50 104 Q54 88 58 80 Q60 92 64 98 Q68 82 74 74 Q76 88 82 94 Q86 78 92 70 Q94 84 100 92 Q104 78 110 70 Q114 84 118 94 Q122 82 128 74 Q132 88 136 98 Q140 86 144 80 Q148 92 150 104 C168 22 32 22 50 104 Z';
  const strands = ['M78 44 Q86 60 82 80', 'M102 38 Q108 58 104 78', 'M126 46 Q124 64 128 82'];
  return `<path d="${fringe}" fill="${p.hair}" stroke="${p.hairLine}" stroke-width="2.5" stroke-linejoin="round"/>`
    + strands.map(d => `<path d="${d}" stroke="${p.hairLine}" stroke-width="1.6" fill="none" opacity=".6"/>`).join('');
}

function eye(x, y, p, kind) {
  if (kind === 'happy') return `<path d="M${x - 9} ${y + 3} Q${x} ${y - 9} ${x + 9} ${y + 3}" stroke="#3a2a22" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  return `<ellipse cx="${x}" cy="${y}" rx="9.5" ry="11.5" fill="#fff" stroke="#3a2a22" stroke-width="2"/>`
    + `<ellipse cx="${x}" cy="${y + 1.5}" rx="7.2" ry="9" fill="${p.iris}"/>`
    + `<ellipse cx="${x}" cy="${y + 2.5}" rx="3.6" ry="4.8" fill="#2a1a10"/>`
    + `<circle cx="${x - 2.6}" cy="${y - 3}" r="2.6" fill="#fff"/><circle cx="${x + 2.8}" cy="${y + 5}" r="1.2" fill="#fff"/>`
    + `<path d="M${x - 11} ${y - 9} Q${x} ${y - 15} ${x + 11} ${y - 9}" stroke="#2a1a10" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

const BROWS = {
  calm: ['M70 92 Q80 88 90 91', 'M110 91 Q120 88 130 92'],
  up: ['M70 88 Q80 82 90 86', 'M110 86 Q120 82 130 88'],
  tilt: ['M70 86 Q80 82 90 88', 'M110 93 Q120 94 130 92'],
  firm: ['M70 88 L90 94', 'M110 94 L130 88'],
};

const MOUTHS = {
  smile: '<path d="M92 129 Q100 135 108 129" stroke="#9c3b32" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
  grin: '<path d="M89 126 Q100 141 111 126 Z" fill="#8f2f2a"/><path d="M93 132 Q100 138 107 132 Q100 135 93 132" fill="#e8807a"/>',
  wave: '<path d="M93 131 Q96.5 127 100 131 Q103.5 135 107 131" stroke="#9c3b32" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
  flat: '<path d="M93 131 L107 131" stroke="#9c3b32" stroke-width="2.8" stroke-linecap="round"/>',
  open: '<path d="M87 124 Q100 147 113 124 Z" fill="#8f2f2a"/><path d="M92 134 Q100 142 108 134 Q100 137 92 134" fill="#e8807a"/>',
};

function face(p, ex) {
  const e = EXPRESSIONS[ex];
  return `<ellipse cx="100" cy="104" rx="45" ry="42" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="2"/>`
    + `<ellipse cx="74" cy="122" rx="7" ry="4" fill="#f4a3a0" opacity=".55"/><ellipse cx="126" cy="122" rx="7" ry="4" fill="#f4a3a0" opacity=".55"/>`
    + eye(80, 109, p, e.eyes) + eye(120, 109, p, e.eyes)
    + (p.glasses ? `<g fill="none" stroke="#2b2b30" stroke-width="2.4"><rect x="66" y="96" width="28" height="24" rx="8"/><rect x="106" y="96" width="28" height="24" rx="8"/><path d="M94 106 L106 106"/></g>` : '')
    + BROWS[e.brows].map(d => `<path d="${d}" stroke="${p.hairLine}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`).join('')
    + MOUTHS[e.mouth];
}

function head(p, ex) {
  return hairBack(p) + `<ellipse cx="56" cy="110" rx="6" ry="9" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="2"/><ellipse cx="144" cy="110" rx="6" ry="9" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="2"/>`
    + face(p, ex) + hairFront(p);
}

// ---- 身體與道具 ----
function torso(p, bottom = 250) {
  const shirt = `<path d="M60 160 Q100 146 140 160 L150 ${bottom} L50 ${bottom} Z" fill="${SHIRT}" stroke="${SHIRT_LINE}" stroke-width="2"/>`;
  const collar = `<path d="M86 150 L100 166 L114 150 L108 146 L100 156 L92 146 Z" fill="#fff" stroke="${SHIRT_LINE}" stroke-width="1.8"/>`;
  const tie = `<path d="M96 160 L104 160 L106 166 L102 206 L100 210 L98 206 L94 166 Z" fill="${p.tie}"/>`;
  const vestL = `<path d="M62 160 Q76 156 86 154 L98 196 L98 ${bottom} L52 ${bottom} Z" fill="${p.vest}" stroke="${p.vestLine}" stroke-width="2"/>`;
  const vestR = `<path d="M138 160 Q124 156 114 154 L102 196 L102 ${bottom} L148 ${bottom} Z" fill="${p.vest}" stroke="${p.vestLine}" stroke-width="2"/>`;
  const buttons = [204, 220, 236].filter(y => y < bottom - 4).map(y => `<circle cx="108" cy="${y}" r="2.6" fill="#d8b25a"/>`).join('');
  const neck = `<rect x="90" y="138" width="20" height="16" fill="${SKIN}"/>`;
  return neck + shirt + tie + vestL + vestR + collar + buttons + (p.jacket ? `<path d="M52 ${bottom} L56 170 Q70 160 84 156 L98 214 L96 ${bottom} Z M148 ${bottom} L144 170 Q130 160 116 156 L102 214 L104 ${bottom} Z" fill="${p.vest}" stroke="${p.vestLine}" stroke-width="2.2" opacity=".96"/>` : '');
}

const hand = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="2"/>`;
const sleeve = (d) => `<path d="${d}" stroke="${SHIRT_LINE}" stroke-width="22" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${SHIRT}" stroke-width="18" stroke-linecap="round" fill="none"/>`;

function book(x, y, w = 46, h = 56, rot = 0) {
  return g(`<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="4" fill="#7a4a2a" stroke="#4e2e18" stroke-width="2.2"/>`
    + `<rect x="${-w / 2 + 4}" y="${-h / 2 + 3}" width="${w - 6}" height="${h - 6}" rx="2" fill="none" stroke="#c49a5e" stroke-width="1.4"/>`
    + `<rect x="${-w / 2}" y="${-h / 2}" width="7" height="${h}" rx="3" fill="#5b331c"/>`, `transform="translate(${x} ${y}) rotate(${rot})"`);
}
function openBook(x, y, rot = 0) {
  return g(`<path d="M-34 -18 Q-16 -26 0 -18 Q16 -26 34 -18 L34 22 Q16 14 0 22 Q-16 14 -34 22 Z" fill="#7a4a2a" stroke="#4e2e18" stroke-width="2.2"/>`
    + `<path d="M-30 -16 Q-14 -22 0 -15 L0 18 Q-14 11 -30 17 Z M30 -16 Q14 -22 0 -15 L0 18 Q14 11 30 17 Z" fill="#fbf3df" stroke="#cdb98f" stroke-width="1.4"/>`
    + `<path d="M-24 -8 L-6 -10 M-24 -1 L-6 -3 M-24 6 L-8 4 M6 -10 L24 -8 M6 -3 L24 -1 M8 4 L24 6" stroke="#b9a37a" stroke-width="1.4"/>`, `transform="translate(${x} ${y}) rotate(${rot})"`);
}
function crystal(x, y, s = 1) {
  return g(`<circle r="22" fill="#b98cff" opacity=".28"/><circle r="13" fill="#d8bfff" opacity=".4"/>`
    + `<path d="M0 -20 L11 -4 L6 16 L-6 16 L-11 -4 Z" fill="#8a5cf0" stroke="#5a32b8" stroke-width="2"/><path d="M0 -20 L4 -4 L0 16 L-4 -4 Z" fill="#c4a6ff" opacity=".85"/>`, `transform="translate(${x} ${y}) scale(${s})"`);
}
function clipboard(x, y, rot = 0) {
  return g(`<rect x="-22" y="-28" width="44" height="56" rx="4" fill="#b98b52" stroke="#7d5a30" stroke-width="2"/><rect x="-17" y="-20" width="34" height="44" fill="#fff"/>`
    + `<rect x="-9" y="-32" width="18" height="9" rx="2" fill="#9aa0a8"/><path d="M-12 -10 H12 M-12 -2 H12 M-12 6 H8 M-12 14 H4" stroke="#8a93a5" stroke-width="2"/>`, `transform="translate(${x} ${y}) rotate(${rot})"`);
}
function heldProp(p, x, y, rot) {
  if (p.prop === 'openbook') return openBook(x, y, rot);
  if (p.prop === 'clipboard') return clipboard(x, y, rot);
  return book(x, y, 46, 56, rot);
}

// 姿勢：回傳 [頭部之下, 頭部之上] 兩層
function pose(p, kind) {
  switch (kind) {
    case 'hold':
      return ['', sleeve('M64 172 Q66 206 84 214') + sleeve('M136 172 Q134 206 116 214') + heldProp(p, 100, 206, 0) + hand(80, 214) + hand(120, 214)];
    case 'thumb':
      return ['', sleeve('M64 172 Q62 210 70 236') + heldProp(p, 60, 226, -8) + sleeve('M136 172 Q150 200 136 202')
        + `<path d="M126 204 a11 11 0 1 1 18 0 Z" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="2"/>`
        + `<rect x="128" y="182" width="8" height="18" rx="4" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="2"/>`];
    case 'chin':
      return ['', sleeve('M64 172 Q62 210 70 236') + heldProp(p, 60, 226, -8) + sleeve('M136 172 Q152 176 128 150') + hand(124, 146, 9)];
    case 'point':
      return ['', sleeve('M64 172 Q62 210 70 236') + heldProp(p, 60, 226, -8) + sleeve('M136 172 Q160 160 166 128')
        + hand(166, 124, 9) + `<rect x="162" y="96" width="8" height="24" rx="4" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="2"/>`
        + (p.prop === 'crystal' ? crystal(166, 82, 0.7) : '')];
    case 'raise':
      return [sleeve('M136 172 Q160 140 162 92'), sleeve('M64 172 Q62 210 70 236') + (p.prop === 'crystal' ? book(60, 226, 40, 48, -8) : '')
        + hand(162, 86, 10) + (p.prop === 'crystal' ? crystal(164, 56, 1.1) : heldProp(p, 162, 54, 8))];
    default:
      return ['', ''];
  }
}

function fx(kind) {
  if (kind === 'question') return '<text x="152" y="52" font-family="Arial Black, sans-serif" font-size="40" font-weight="900" fill="#f59e0b" stroke="#fff" stroke-width="3" paint-order="stroke">?</text>';
  if (kind === 'bang') return '<text x="34" y="54" font-family="Arial Black, sans-serif" font-size="40" font-weight="900" fill="#ef4444" stroke="#fff" stroke-width="3" paint-order="stroke">!</text>';
  const star = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z" fill="${c}"/>`;
  if (kind === 'stars') return star(36, 60, 1.4, '#fbbf24') + star(48, 36, 0.9, '#a78bfa') + star(184, 120, 1, '#fbbf24');
  if (kind === 'spark') return star(36, 64, 1.1, '#fbbf24') + star(170, 70, 0.8, '#60a5fa');
  return '';
}

function bust(id, ex) {
  const p = PALETTES[id];
  const e = EXPRESSIONS[ex];
  const [under, over] = pose(p, e.pose);
  const headG = g(head(p, ex), e.tilt ? `transform="rotate(${e.tilt} 100 140)"` : '');
  return svg(200, 250, under + torso(p) + headG + over + fx(e.fx));
}

// ---- 地圖全身圖 ----
function legs(spread = 14) {
  return `<rect x="${100 - spread - 13}" y="236" width="26" height="40" rx="8" fill="${PANTS}"/><rect x="${100 + spread - 13}" y="236" width="26" height="40" rx="8" fill="${PANTS}"/>`
    + `<ellipse cx="${100 - spread - 2}" cy="280" rx="18" ry="9" fill="${SHOES}"/><ellipse cx="${100 + spread + 2}" cy="280" rx="18" ry="9" fill="${SHOES}"/>`;
}
const shadow = '<ellipse cx="100" cy="288" rx="52" ry="8" fill="#000" opacity=".12"/>';

function mapFront(id) {
  const p = PALETTES[id];
  return svg(200, 300, shadow + legs() + torso(p, 244) + sleeve('M64 172 Q58 206 62 230') + sleeve('M136 172 Q142 206 138 230')
    + hand(62, 234) + hand(138, 234) + book(150, 222, 30, 38, 8) + head(p, 'explain'));
}

function mapBack(id) {
  const p = PALETTES[id];
  const back = `<path d="M60 160 Q100 146 140 160 L148 244 L52 244 Z" fill="${p.vest}" stroke="${p.vestLine}" stroke-width="2"/>`;
  const hairFull = `<path d="M42 110 C22 18 178 18 158 110 L166 160 Q150 150 146 168 Q128 158 118 172 Q106 160 100 174 Q94 160 82 172 Q72 158 54 168 Q50 150 34 160 Z" fill="${p.hair}" stroke="${p.hairLine}" stroke-width="2.5" stroke-linejoin="round"/>`;
  const spikes = SPIKES.slice(0, 4)
    .map(d => `<path d="${d}" fill="${p.hair}" stroke="${p.hairLine}" stroke-width="2.5" stroke-linejoin="round"/>`).join('');
  const strands = ['M80 70 Q86 110 78 150', 'M100 64 Q104 110 100 160', 'M120 70 Q116 110 122 150'].map(d => `<path d="${d}" stroke="${p.hairLine}" stroke-width="1.8" fill="none" opacity=".55"/>`).join('');
  return svg(200, 300, shadow + legs() + back + sleeve('M64 172 Q58 206 62 230') + sleeve('M136 172 Q142 206 138 230')
    + hand(62, 234) + hand(138, 234) + spikes + hairFull + strands);
}

function mapLeft(id) {
  const p = PALETTES[id];
  const body = `<path d="M74 160 Q100 150 126 160 L130 244 L70 244 Z" fill="${SHIRT}" stroke="${SHIRT_LINE}" stroke-width="2"/>`
    + `<path d="M74 160 Q92 154 104 156 L108 244 L70 244 Z" fill="${p.vest}" stroke="${p.vestLine}" stroke-width="2"/>`;
  const legsSide = `<rect x="80" y="236" width="24" height="40" rx="8" fill="${PANTS}"/><rect x="96" y="236" width="24" height="40" rx="8" fill="#3d3c44"/>`
    + `<ellipse cx="86" cy="280" rx="20" ry="9" fill="${SHOES}"/><ellipse cx="104" cy="280" rx="18" ry="8" fill="#743e1e"/>`;
  const headSide = ['M86 44 Q78 20 84 6 Q98 22 106 38 Z', 'M110 42 Q124 20 140 12 Q136 32 130 50 Z', 'M132 60 Q154 50 168 52 Q156 66 146 80 Z'].map(d => `<path d="${d}" fill="${p.hair}" stroke="${p.hairLine}" stroke-width="2.5" stroke-linejoin="round"/>`).join('')
    + `<path d="M60 108 C44 24 170 22 156 110 L164 150 Q148 142 142 156 L128 132 Z" fill="${p.hair}" stroke="${p.hairLine}" stroke-width="2.5" stroke-linejoin="round"/>`
    + `<ellipse cx="94" cy="106" rx="40" ry="41" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="2"/>`
    + `<ellipse cx="120" cy="112" rx="6" ry="9" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="2"/>`
    + eye(76, 110, p, 'open') + `<ellipse cx="72" cy="124" rx="6" ry="3.6" fill="#f4a3a0" opacity=".55"/>`
    + `<path d="M62 92 Q72 88 84 92" stroke="${p.hairLine}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`
    + `<path d="M64 130 Q70 133 76 130" stroke="#9c3b32" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    + `<path d="M58 104 Q62 88 66 78 Q68 90 72 96 Q76 80 82 72 Q84 86 90 92 Q94 76 100 68 Q102 82 108 90 Q112 76 118 70 Q120 86 124 96 Q130 84 136 78 L140 110 C164 24 40 22 58 104 Z" fill="${p.hair}" stroke="${p.hairLine}" stroke-width="2.5" stroke-linejoin="round"/>`;
  return svg(200, 300, shadow + legsSide + body + sleeve('M100 172 Q90 206 82 226') + hand(80, 230) + book(70, 214, 26, 34, -10) + headSide);
}

function mapRight(id) {
  return mapLeft(id).replace(/<svg([^>]*)>/, '<svg$1><g transform="translate(200 0) scale(-1 1)">').replace('</svg>', '</g></svg>');
}

// ---- 輸出 ----
for (const id of Object.keys(PALETTES)) {
  for (const ex of Object.keys(EXPRESSIONS)) writeFileSync(join(OUT, `${id}-${ex}.svg`), bust(id, ex));
}
writeFileSync(join(OUT, 'guide-front.svg'), mapFront('guide'));
writeFileSync(join(OUT, 'guide-back.svg'), mapBack('guide'));
writeFileSync(join(OUT, 'guide-left.svg'), mapLeft('guide'));
writeFileSync(join(OUT, 'guide-right.svg'), mapRight('guide'));
console.log('人物向量圖已產生於 src/game/assets/characters/');
