// 人物設定：造型素材由使用者提供，未提供前使用標示「暫用圖」的佔位頭像。
// 換人物只需放入對應檔名的圖檔（透明背景半身圖，建議 ≥1000px 高）。

export const EXPRESSIONS = ['explain', 'encourage', 'puzzled', 'remind', 'success'];

export const EXPRESSION_LABEL = {
  explain: '說明',
  encourage: '鼓勵',
  puzzled: '疑惑',
  remind: '提醒',
  success: '成功',
};

export const CHARACTER_BASE = `${import.meta.env?.BASE_URL ?? '/'}game/characters/`;

// 圖檔放在 public/game/characters/，檔名：<人物ID>-<表情>.png；找不到檔案時自動改用暫用頭像
const expressionFiles = id => Object.fromEntries(EXPRESSIONS.map(e => [e, `${id}-${e}.png`]));

export const CHARACTERS = {
  guide: {
    id: 'guide',
    role: '引導人物',
    name: '艾達',
    color: '#6366f1',
    images: expressionFiles('guide'),
    // 地圖用全身角色四方向（正面、背面、左、右）
    mapSprites: { down: 'guide-front.png', up: 'guide-back.png', left: 'guide-left.png', right: 'guide-right.png' },
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
