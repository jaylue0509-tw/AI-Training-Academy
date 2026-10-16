// 真實產品畫面清單。教材不以遊戲自製介面或官方說明網頁代替產品操作畫面；
// 尚未錄製的畫面會顯示「真實畫面待錄製」與必要標示欄位。
//
// 新增截圖：把圖放到 public/game/screens/<tool>/<platform>/L<關>-<類型>.png，
// 再在 RECORDED 填入標示資料（產品、網頁或桌面、Windows 或 Mac、版本、錄製日期、點選位置）。

export const SCREEN_KINDS = {
  entry: '入口',
  attach: '加入資料',
  prompt: '輸入要求',
  run: '執行',
  result: '結果',
  save: '檢查或保存',
  'skill-list': 'Skill 列表',
  'skill-info': 'Skill 說明',
  'skill-enable': '啟用或安裝',
  'skill-use': '新對話中使用',
};

// key 格式：`${tool}/${platform}/L${level}-${kind}`
// 值範例：
// 'claude/web/L1-entry': {
//   src: 'claude/web/L1-entry.png', os: 'Windows 11', version: 'Chrome 141 / claude.ai',
//   recordedAt: '2026-10-20', caption: '從左側「新對話」開始', hotspot: { x: 4, y: 12, w: 14, h: 6 },
//   bridge: '' // 桌面功能需轉網頁時，寫明完整轉接說明
// },
export const RECORDED = {};

const BASE = `${import.meta.env?.BASE_URL ?? '/'}game/screens/`;

export function getScreen(tool, platform, level, kind) {
  const key = `${tool}/${platform}/L${level}-${kind}`;
  const rec = RECORDED[key];
  return {
    key,
    kindLabel: SCREEN_KINDS[kind] ?? kind,
    recorded: Boolean(rec?.src),
    ...rec,
    src: rec?.src ? `${BASE}${rec.src}` : null,
  };
}
