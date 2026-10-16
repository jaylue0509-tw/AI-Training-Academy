// 由 src/game/data/materials.js 產生可下載的教學資料包與 Skill 套件，確保教材與標準答案同源。
// 用法：npm run game:materials
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';
import {
  WORK_LOG, EMAILS_A, EMAILS_B, WEEK1, WEEK2, WEEK_B, SKILL, METRIC_RULE, REPORT_SECTIONS, PROJECT_B, TOOL_MODE_ORDER,
} from '../src/game/data/materials.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'game');
const out = (rel, content) => {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
};

const BOM = '﻿'; // 讓 Excel 正確顯示中文
const csv = (header, rows) => BOM + [header, ...rows].map(r => r.map(c => {
  const s = c === null || c === undefined ? '' : String(c);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}).join(',')).join('\r\n') + '\r\n';

// ---- 教學資料 ----
out('materials/worklog-2026-10-12.txt', `工作紀錄（2026-10-12 至 2026-10-16）\n\n${WORK_LOG.items.map((i, n) => `${n + 1}. ${i.text}`).join('\n')}\n`);
out('materials/emails-project-a.csv', csv(['信件ID', '日期', '寄件人', '主旨', '內文'], EMAILS_A.list.map(m => [m.id, m.date, m.from, m.subject, m.body])));
out('materials/emails-project-b.csv', csv(['信件ID', '日期', '寄件人', '主旨', '內文', '期限'], EMAILS_B.list.map(m => [m.id, m.date, m.from, m.subject, m.body, m.due])));
for (const [file, data] of [['week1-2026-10-12.csv', WEEK1], ['week2-2026-10-19.csv', WEEK2], ['week-project-b.csv', WEEK_B]]) {
  out(`materials/${file}`, csv(['任務ID', '任務', '狀態', '金額'], data.rows.map(r => [r.id, r.task, r.status, r.amount])));
}

// ---- 週報 Skill ----
const skillBody = `# 週報 Skill

${SKILL.purpose}

## 何時使用
使用者要求製作週報、提到「週報 Skill」，或提供一週的待辦、工作紀錄與數據並要求整理成報告時。

## 必要資料
${SKILL.needs.map(n => `- ${n}`).join('\n')}

缺少任何一份時，先告知使用者缺哪一份，不要自行補資料。

## 步驟與規則
${SKILL.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 計算口徑
${METRIC_RULE}

## 輸出格式（固定四段，一頁以內）
${REPORT_SECTIONS.map(s => `### ${s}`).join('\n')}

- 「本週結論」用一到兩句說明本週狀況與最近的期限。
- 「關鍵數字」列出完成數、未完成數、金額合計。
- 「待確認事項」列出所有原始資料沒有交代的資訊（例如沒有負責人、空白金額），不得猜測。
- 「下一步」列出有期限的後續工作，期限以最新的更正信為準。
- 最後一行附上「資料來源」與「資料期間」。

## 限制
${SKILL.noExternal}
`;

const skillMd = `---
name: weekly-report
description: 把每週的待辦表、工作紀錄與數據 CSV 整理成固定四段格式（本週結論、關鍵數字、待確認事項、下一步）的一頁週報。當使用者要求製作週報、提到「週報 Skill」，或提供一週資料要整理成報告時使用。
---

${skillBody}`;

out('skills/weekly-report-gemini.md', `# Gemini 技能設定：週報 Skill

在 Gemini 的 Customize → Skills 中加入或建立技能時，依欄位貼上以下內容。
（實際欄位名稱依錄製當下的畫面為準。）

## 名稱
週報 Skill

## 說明
把每週的待辦表、工作紀錄與數據 CSV 整理成固定四段格式的一頁週報。

## 指示
${skillBody}`);

// ---- 工具模式教學專案 ----
const starterReadme = `# 工具模式：信件待辦頁

用 Codex 或 Claude Code，在這個資料夾中把 \`emails.js\` 的五封信做成一個可篩選的待辦頁（\`index.html\`）。
不需要連接真實信箱，也不需要部署網站，直接用瀏覽器打開 \`index.html\` 即可。

## 完成條件
1. 五筆資料都顯示（ID、事項、期限）。
2. 可依關鍵字篩選。
3. 依「期限」由近到遠排序，沒有期限的排最後。
4. 篩選沒有結果時，顯示「沒有符合的待辦」。

## 指定測試（交件前逐項檢查）
- [ ] 打開頁面，看到 5 筆資料。
- [ ] 順序為：${TOOL_MODE_ORDER.join(' → ')}。
- [ ] 篩選框輸入「不存在的字」，出現「沒有符合的待辦」。

交件時，把頁面上的 ID 順序與三項測試結果貼到遊戲的「真實工具驗證」。
`;
const starterData = `// ${PROJECT_B} 教學信件（虛構資料）\nwindow.EMAILS = ${JSON.stringify(EMAILS_B.list.map(({ kind, ...m }) => m), null, 2)};\n`;
const starterHtml = `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>信件待辦頁</title>
</head>
<body>
  <h1>信件待辦頁</h1>
  <!-- 請在這裡完成：篩選框、待辦清單、空資料提示 -->
  <div id="app"></div>
  <script src="emails.js"></script>
  <script>
    // window.EMAILS 已載入五封信
  </script>
</body>
</html>
`;

// ---- 最小 ZIP 產生器（deflate） ----
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = buf => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const DOS_DATE = ((2026 - 1980) << 9) | (10 << 5) | 16;
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const [name, content] of files) {
    const data = Buffer.from(content, 'utf8');
    const comp = deflateRawSync(data);
    const nameBuf = Buffer.from(name, 'utf8');
    const crc = crc32(data);
    const head = Buffer.alloc(30);
    head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4); head.writeUInt16LE(0x0800, 6); head.writeUInt16LE(8, 8);
    head.writeUInt16LE(0, 10); head.writeUInt16LE(DOS_DATE, 12); head.writeUInt32LE(crc, 14); head.writeUInt32LE(comp.length, 18); head.writeUInt32LE(data.length, 22);
    head.writeUInt16LE(nameBuf.length, 26); head.writeUInt16LE(0, 28);
    locals.push(head, nameBuf, comp);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8); cen.writeUInt16LE(8, 10);
    cen.writeUInt16LE(0, 12); cen.writeUInt16LE(DOS_DATE, 14); cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(comp.length, 20); cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(nameBuf.length, 28); cen.writeUInt32LE(offset, 42);
    centrals.push(cen, nameBuf);
    offset += 30 + nameBuf.length + comp.length;
  }
  const cenSize = centrals.reduce((s, b) => s + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cenSize, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}

out('skills/weekly-report-claude.zip', zip([['weekly-report/SKILL.md', skillMd]]));
out('skills/weekly-report-chatgpt.zip', zip([['weekly-report/SKILL.md', skillMd]]));
out('materials/todo-tool-starter.zip', zip([
  ['todo-tool-starter/README.md', starterReadme],
  ['todo-tool-starter/emails.js', starterData],
  ['todo-tool-starter/index.html', starterHtml],
]));

console.log('教學資料包已產生於 public/game/');
