// 人物設定：內建原創向量圖（scripts/build-game-characters.mjs 產生）；
// 放入同名 PNG（透明背景半身圖，建議 ≥1000px 高）即可替換，不需改程式。

export const EXPRESSIONS = ['explain', 'encourage', 'puzzled', 'remind', 'success'];

export const EXPRESSION_LABEL = {
  explain: '說明',
  encourage: '鼓勵',
  puzzled: '疑惑',
  remind: '提醒',
  success: '成功',
};

// 建置時掃描 src/game/assets/characters/：同名檔案以 PNG 優先，其次內建 SVG；都沒有時用暫用頭像
const FILES = import.meta.glob('../assets/characters/*.{png,svg}', { eager: true, query: '?url', import: 'default' });
const candidates = name => FILES[`../assets/characters/${name}.png`] ?? FILES[`../assets/characters/${name}.svg`] ?? null;
const expressionFiles = id => Object.fromEntries(EXPRESSIONS.map(e => [e, candidates(`${id}-${e}`)]));

export const CHARACTERS = {
  guide: {
    id: 'guide',
    role: '引導人物',
    name: '艾達',
    color: '#6366f1',
    images: expressionFiles('guide'),
    // 地圖用全身角色四方向（正面、背面、左、右）
    mapSprites: { down: candidates('guide-front'), up: candidates('guide-back'), left: candidates('guide-left'), right: candidates('guide-right') },
  },
  client: {
    id: 'client',
    role: '委託人物',
    name: '林主任',
    color: '#ea580c',
    images: expressionFiles('client'),
  },
  helper: {
    id: 'helper',
    role: '提示小幫手',
    name: '小點',
    color: '#0891b2',
    images: expressionFiles('helper'),
  },
};
