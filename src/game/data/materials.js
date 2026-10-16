// 教學資料包與標準答案（虛構資料，僅供教學）
// 資料與答案集中於此，評分以固定答案為準，AI 評語僅作補充。

const BASE = `${import.meta.env?.BASE_URL ?? '/'}game/materials/`;

export const PROJECT_A = '秋季新品發表會';
export const PROJECT_B = '員工旅遊專案';

// 第一關：五項工作紀錄
export const WORK_LOG = {
  file: '工作紀錄_2026-10-12至10-16.txt',
  href: `${BASE}worklog-2026-10-12.txt`,
  items: [
    { id: 'W1', text: '場地合約：已與場地方確認條款，已完成。', status: '已完成' },
    { id: 'W2', text: '文宣初稿：文案完成，設計進行中。', status: '進行中' },
    { id: 'W3', text: '客戶報價單：等待成本資料，進行中。', status: '進行中' },
    { id: 'W4', text: '來賓名單：已整理 120 位，已完成。', status: '已完成' },
    { id: 'W5', text: '直播設備：已預約，已完成。', status: '已完成' },
  ],
};

// 第二關：專案 A 的五封信（一封通知、一封更正、一筆缺負責人）
export const EMAILS_A = {
  file: '教學信件匯出_秋季新品發表會.csv',
  href: `${BASE}emails-project-a.csv`,
  list: [
    { id: 'M01', date: '2026-10-12', from: '王經理', subject: '場地合約', body: '請在 10/16 前完成場地合約簽回，負責人：陳怡君。', kind: 'todo' },
    { id: 'M02', date: '2026-10-12', from: '行政部', subject: '消防演練通知', body: '本週五下午 3 點辦公室進行消防演練，請大家留意。', kind: 'notice' },
    { id: 'M03', date: '2026-10-13', from: '林主任', subject: '新品文宣', body: '新品文宣初稿請於 10/20 前交給我，負責：張志明。', kind: 'todo' },
    { id: 'M04', date: '2026-10-14', from: '林主任', subject: '更正：文宣期限', body: '更正：M03 的文宣初稿期限提前至 10/17。', kind: 'correction' },
    { id: 'M05', date: '2026-10-15', from: '客戶 黃小姐', subject: '報價單', body: '請提供報價單，最晚 10/21 寄出。', kind: 'todo' },
  ],
};

export const TODO_A_ANSWER = [
  { task: '場地合約簽回', owner: '陳怡君', due: '10/16', source: 'M01' },
  { task: '新品文宣初稿', owner: '張志明', due: '10/17', source: 'M03、M04' },
  { task: '客戶報價單', owner: '待確認', due: '10/21', source: 'M05' },
];

// 第三、四關：兩週教學數據（列層級，指標需計算）
export const WEEK1 = {
  file: '本週數據_2026-10-12至10-16.csv',
  href: `${BASE}week1-2026-10-12.csv`,
  period: '2026-10-12 至 2026-10-16',
  rows: [
    { id: 'T01', task: '場地合約簽回', status: '完成', amount: 12000 },
    { id: 'T02', task: '來賓名單整理', status: '完成', amount: 0 },
    { id: 'T03', task: '直播設備預約', status: '完成', amount: 8500 },
    { id: 'T04', task: '邀請函寄送', status: '完成', amount: 1200 },
    { id: 'T05', task: '媒體名單更新', status: '完成', amount: 0 },
    { id: 'T06', task: '餐點詢價', status: '完成', amount: 0 },
    { id: 'T07', task: '舞台設計確認', status: '完成', amount: 15000 },
    { id: 'T08', task: '攝影師預約', status: '完成', amount: 6000 },
    { id: 'T09', task: '文宣初稿', status: '進行中', amount: 0 },
    { id: 'T10', task: '客戶報價單', status: '進行中', amount: 0 },
    { id: 'T11', task: '贈品採購', status: '未開始', amount: 0 },
  ],
};

export const WEEK2 = {
  file: '本週數據_2026-10-19至10-23.csv',
  href: `${BASE}week2-2026-10-19.csv`,
  period: '2026-10-19 至 2026-10-23',
  rows: [
    { id: 'T09', task: '文宣初稿', status: '完成', amount: 3000 },
    { id: 'T10', task: '客戶報價單', status: '完成', amount: 0 },
    { id: 'T11', task: '贈品採購', status: '完成', amount: 9800 },
    { id: 'T12', task: '彩排安排', status: '完成', amount: 0 },
    { id: 'T13', task: '交通接駁', status: '進行中', amount: 4500 },
    { id: 'T14', task: '現場佈置', status: '進行中', amount: null },
    { id: 'T15', task: '新聞稿', status: '完成', amount: 0 },
  ],
};

// 第六關：專案 B 新資料
export const EMAILS_B = {
  file: '教學信件匯出_員工旅遊專案.csv',
  href: `${BASE}emails-project-b.csv`,
  list: [
    { id: 'N01', date: '2026-10-19', from: '人資 周小姐', subject: '旅行社合約', body: '請於 10/23 前確認旅行社合約，負責人：李佳蓉。', kind: 'todo', due: '10/23' },
    { id: 'N02', date: '2026-10-19', from: '總務', subject: '停車場整修通知', body: '10/22 停車場整修，當日請改搭大眾運輸。', kind: 'notice', due: '' },
    { id: 'N03', date: '2026-10-20', from: '部門主管', subject: '參加人數', body: '請在 10/30 前統計參加人數，負責：吳俊宏。', kind: 'todo', due: '10/30' },
    { id: 'N04', date: '2026-10-21', from: '旅行社', subject: '聯絡窗口', body: '請於 10/24 前回覆貴司聯絡窗口，以便提供行程報價。', kind: 'todo', due: '10/24' },
    { id: 'N05', date: '2026-10-22', from: '部門主管', subject: '更正：人數統計期限', body: '更正：N03 參加人數統計提前到 10/27。', kind: 'correction', due: '10/27' },
  ],
};

export const WEEK_B = {
  file: '本週數據_員工旅遊_2026-10-19至10-23.csv',
  href: `${BASE}week-project-b.csv`,
  period: '2026-10-19 至 2026-10-23',
  rows: [
    { id: 'B01', task: '旅行社比價', status: '完成', amount: 0 },
    { id: 'B02', task: '預算申請', status: '完成', amount: 0 },
    { id: 'B03', task: '保險詢價', status: '完成', amount: 2500 },
    { id: 'B04', task: '報名表製作', status: '完成', amount: 0 },
    { id: 'B05', task: '旅行社合約確認', status: '進行中', amount: 0 },
    { id: 'B06', task: '參加人數統計', status: '進行中', amount: 0 },
    { id: 'B07', task: '紀念品設計', status: '未開始', amount: null },
  ],
};

export const TODO_B_ANSWER = [
  { task: '旅行社合約確認', owner: '李佳蓉', due: '10/23', source: 'N01' },
  { task: '回覆旅行社聯絡窗口', owner: '待確認', due: '10/24', source: 'N04' },
  { task: '參加人數統計', owner: '吳俊宏', due: '10/27', source: 'N03、N05' },
];

// 工具模式：待辦頁依期限排序（空期限排最後）
export const TOOL_MODE_ORDER = ['N01', 'N04', 'N05', 'N03', 'N02'];

export const TOOL_STARTER = {
  file: '工具模式教學專案_信件待辦頁.zip',
  href: `${BASE}todo-tool-starter.zip`,
};

// 計算口徑：完成數＝狀態為「完成」的列數；未完成數＝其他狀態列數；
// 金額＝金額欄加總，空白不計入並標示待確認。
export function computeMetrics(rows) {
  const done = rows.filter(r => r.status === '完成').length;
  const undone = rows.length - done;
  const missing = rows.filter(r => r.amount === null || r.amount === undefined).map(r => r.id);
  const amount = rows.reduce((s, r) => s + (typeof r.amount === 'number' ? r.amount : 0), 0);
  return { done, undone, amount, missing };
}

export const METRIC_RULE = '完成數＝狀態為「完成」的列數；未完成數＝其餘列數；金額＝金額欄加總，空白不計入並標「待確認」。';

export const REPORT_SECTIONS = ['一、本週結論', '二、關鍵數字', '三、待確認事項', '四、下一步'];

export const SKILL = {
  name: '週報 Skill（weekly-report）',
  short: '週報 Skill',
  purpose: '把每週的待辦、工作紀錄與數據，整理成固定四段格式的一頁週報。',
  needs: ['待辦表或信件整理結果', '工作紀錄', '本週數據 CSV（任務、狀態、金額）'],
  output: '一頁週報：本週結論、三項關鍵數字、待確認事項、下一步；並附資料來源與期間。',
  rules: [
    '先讀資料並確認資料期間。',
    '使用固定四段格式。',
    '計算三項指標：完成數、未完成數、金額合計。',
    '未知資訊標「待確認」，不猜測、不補寫。',
    '交件前回查來源，數字與期限對回原始資料。',
  ],
  noExternal: '本 Skill 只保存工作做法，不寄信、不刪除、不連線外部服務，也不會自動定時執行。',
  packages: {
    chatgpt: { file: 'weekly-report-chatgpt.zip', href: `${import.meta.env?.BASE_URL ?? '/'}game/skills/weekly-report-chatgpt.zip` },
    claude: { file: 'weekly-report-claude.zip', href: `${import.meta.env?.BASE_URL ?? '/'}game/skills/weekly-report-claude.zip` },
    gemini: { file: 'weekly-report-gemini.md', href: `${import.meta.env?.BASE_URL ?? '/'}game/skills/weekly-report-gemini.md` },
  },
};

export const fmtAmount = n => n.toLocaleString('en-US');
