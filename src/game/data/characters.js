// 人物設定：造型素材由使用者提供，未提供前使用標示「暫用圖」的佔位頭像。
// 換人物只需改這裡的 image 路徑（透明背景半身圖，建議 ≥1000px 高）。

export const EXPRESSIONS = ['explain', 'encourage', 'puzzled', 'remind', 'success'];

export const EXPRESSION_LABEL = {
  explain: '說明',
  encourage: '鼓勵',
  puzzled: '疑惑',
  remind: '提醒',
  success: '成功',
};

export const CHARACTER_BASE = `${import.meta.env?.BASE_URL ?? '/'}game/characters/`;

export const CHARACTERS = {
  guide: {
    id: 'guide',
    role: '引導人物',
    name: '艾達',
    placeholder: true,
    color: '#6366f1',
    // 例：images: { explain: 'guide-explain.png', ... }（檔案放在 public/game/characters/）
    images: {},
    // 地圖用全身角色四方向（正面、背面、左、右），未提供時用頭像
    mapSprites: {},
  },
  client: {
    id: 'client',
    role: '委託人物',
    name: '林主任',
    placeholder: true,
    color: '#ea580c',
    images: {},
  },
  helper: {
    id: 'helper',
    role: '提示小幫手',
    name: '小點',
    placeholder: true,
    color: '#0891b2',
    images: {},
  },
};
