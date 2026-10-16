// 真實實作證據的自動核對（以固定答案為準）與排程計算。
// 自動核對通過只代表成果內容正確；成果檔不能單獨證明曾用哪個工具或 Skill，
// 必要時以操作紀錄或講師觀察補足。

import { WEEK1, WEEK2, WEEK_B, computeMetrics, TOOL_MODE_ORDER, REPORT_SECTIONS } from '../data/materials.js';

const norm = s => (s ?? '').replace(/[,，\s]/g, '').replace(/／/g, '/');

const hasNumber = (text, n) => {
  const t = (text ?? '').replace(/(\d),(?=\d{3})/g, '$1');
  return new RegExp(`(^|[^\\d])${n}([^\\d]|$)`).test(t);
};
const hasDate = (text, md) => {
  const [m, d] = md.split('/').map(Number);
  const t = norm(text);
  return [`${m}/${d}`, `${m}月${d}日`, `10-${String(d).padStart(2, '0')}`, `${m}/${String(d).padStart(2, '0')}`].some(p => t.includes(p));
};
const hasAny = (text, words) => words.some(w => (text ?? '').includes(w));

const check = (label, ok) => ({ label, ok: Boolean(ok) });

const sectionsCheck = text => {
  const keys = ['結論', '數字', '待確認', '下一步'];
  return check(`四段格式（${REPORT_SECTIONS.map(s => s.slice(2)).join('、')}）`, keys.every(k => (text ?? '').includes(k)));
};

const metricChecks = (text, rows, prefix = '') => {
  const m = computeMetrics(rows);
  const list = [
    check(`${prefix}完成數 ${m.done}`, hasNumber(text, m.done)),
    check(`${prefix}未完成數 ${m.undone}`, hasNumber(text, m.undone)),
    check(`${prefix}金額 ${m.amount.toLocaleString('en-US')}`, hasNumber(text, m.amount)),
  ];
  if (m.missing.length) list.push(check(`${prefix}空白金額（${m.missing.join('、')}）標待確認`, (text ?? '').includes('待確認')));
  return list;
};

export const EVIDENCE_RULES = {
  1: {
    prompt: '貼上真實工具產出的「修正後摘要」。',
    check: ({ text }) => [
      check('至少三點', (text ?? '').split(/\n/).filter(l => l.trim()).length >= 3),
      check('文宣標為進行中', /文宣[^\n]*進行中/.test(text ?? '')),
      check('報價單標為進行中', /報價[^\n]*進行中/.test(text ?? '')),
      check('沒有把文宣寫成已完成', !/文宣[^\n，。；;]{0,12}(已完成|完成了|定稿)/.test((text ?? '').replace(/文案完成/g, ''))),
    ],
  },
  2: {
    prompt: '貼上真實工具產出、已修正的待辦表（可直接複製表格文字）。',
    check: ({ text }) => [
      check('含 M01、M03、M05 來源', ['M01', 'M03', 'M05'].every(id => (text ?? '').includes(id))),
      check('文宣期限 10/17', hasDate(text, '10/17')),
      check('報價單負責人寫待確認', /報價[^\n]*待確認/.test(text ?? '')),
      check('沒有把消防演練列為待辦', !(text ?? '').includes('消防')),
    ],
  },
  3: {
    prompt: '貼上真實週報的內容，並填寫檔名。',
    check: ({ text, fileName }) => [
      ...metricChecks(text, WEEK1.rows),
      check('文宣期限 10/17', hasDate(text, '10/17')),
      check('已保存為檔案（填寫檔名）', Boolean((fileName ?? '').trim())),
    ],
  },
  4: {
    prompt: '分別貼上使用 Skill 產出的第一週與第二週週報，並填 Skill 名稱。',
    check: ({ text, text2, skillName }) => [
      check('第一週：四段格式', sectionsCheck(text).ok),
      ...metricChecks(text, WEEK1.rows, '第一週'),
      check('第二週：四段格式', sectionsCheck(text2).ok),
      ...metricChecks(text2, WEEK2.rows, '第二週'),
      check('填寫實際使用的 Skill 名稱', /週報|weekly/i.test(skillName ?? '')),
    ],
  },
  5: {
    prompt: '貼上排程設定（頻率、時間、時區、下次執行時間）與試跑結果。',
    check: ({ text, text2, paused }) => [
      check('每週五', hasAny(text, ['週五', '星期五', '周五', 'Friday', 'Fri'])),
      check('17 時', /17[:：]00|17\s*時|下午\s*5|5\s*PM|5:00\s*PM/i.test(text ?? '')),
      check('台北時區', hasAny(text, ['台北', '臺北', 'Taipei', 'GMT+8', 'UTC+8', 'GMT+08'])),
      check('有下次執行時間', hasAny(text, ['下次', 'Next', 'next'])),
      check('有試跑結果', (text2 ?? '').trim().length >= 20),
      check('已示範暫停', Boolean(paused)),
    ],
  },
  6: {
    prompt: '貼上最終成品內容（工具模式請貼待辦頁顯示的 ID 順序與測試結果），並填使用的 Skill 名稱。',
    check: ({ text, skillName, mode }) => mode === 'tool'
      ? [
        check(`五筆資料依期限排序（${TOOL_MODE_ORDER.join(' → ')}）`, idsInOrder(text, TOOL_MODE_ORDER)),
        check('空資料提示', hasAny(text, ['沒有符合', '無資料', '沒有資料', '空'])),
        check('填寫使用的 Skill 或工具', Boolean((skillName ?? '').trim())),
      ]
      : [
        ...metricChecks(text, WEEK_B.rows),
        check('參加人數期限 10/27', hasDate(text, '10/27')),
        check('聯絡窗口負責人待確認', /(窗口|聯絡)[^\n]*待確認/.test(text ?? '')),
        sectionsCheck(text),
        check('填寫實際使用的 Skill 名稱', /週報|weekly/i.test(skillName ?? '')),
      ],
  },
};

export function idsInOrder(text, ids) {
  const pos = ids.map(id => (text ?? '').indexOf(id));
  return pos.every(p => p >= 0) && pos.every((p, i) => i === 0 || p > pos[i - 1]);
}

export function runEvidence(level, evidence) {
  const rule = EVIDENCE_RULES[level];
  const checks = rule ? rule.check(evidence ?? {}) : [];
  return { checks, passed: checks.length > 0 && checks.every(c => c.ok) };
}

// ---- 排程 ----
const TZ_OFFSET = { 'Asia/Taipei': 8, UTC: 0, 'America/Los_Angeles': -7 };
const DAY_NAMES = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

// 計算下一次執行時間（回傳 UTC 毫秒），weekday 0=週日
export function nextWeeklyRun(now, { weekday, hour, minute = 0, tz }) {
  const off = (TZ_OFFSET[tz] ?? 0) * 3600e3;
  const local = new Date(now + off);
  const target = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), hour, minute));
  let add = (weekday - local.getUTCDay() + 7) % 7;
  if (add === 0 && target.getTime() <= local.getTime()) add = 7;
  return target.getTime() + add * 864e5 - off;
}

export function formatInTaipei(utcMs) {
  const d = new Date(utcMs + 8 * 3600e3);
  const p = n => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}/${p(d.getUTCMonth() + 1)}/${p(d.getUTCDate())}（${DAY_NAMES[d.getUTCDay()]}）${p(d.getUTCHours())}:${p(d.getUTCMinutes())} 台北時間`;
}

export { DAY_NAMES };
