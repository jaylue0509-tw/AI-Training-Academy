import React, { useState } from 'react';
import { SKILL, WEEK1, WEEK2, TODO_A_ANSWER, computeMetrics, fmtAmount, PROJECT_A, REPORT_SECTIONS } from '../data/materials.js';
import { TOOLS } from '../data/tools.js';
import { crit } from '../engine/scoring.js';
import { Btn, Choices, Field, Box, Select, DownloadLink } from '../components/ui.jsx';
import { WeeklyReport, DataRows } from './Level3.jsx';

const EXAMPLES = [
  { id: 'e1', label: '幫我把這封信翻成英文', kind: 'once' },
  { id: 'e2', label: '每週依同一格式產出專案週報', kind: 'skill' },
  { id: 'e3', label: '每月把會議紀錄整理成固定格式', kind: 'skill' },
  { id: 'e4', label: '幫我想今天午餐吃什麼', kind: 'once' },
  { id: 'e5', label: '每次依公司規則檢查報銷單', kind: 'skill' },
];

function Distinguish({ api }) {
  const [k, setK] = useState({});
  const submit = () => api.submit(EXAMPLES.map(e => crit(e.id, e.label, 2, k[e.id] === e.kind,
    e.kind === 'skill' ? '同樣規則會一再重複，適合做成 Skill。' : '只做一次，直接下指令就好。')));
  return (
    <div className="space-y-3">
      <Box tone="blue"><p><b>Skill 是什麼？</b>交給 AI 的工作說明包，記下這件事要照哪些步驟、規則和範本完成。下次遇到相同工作，可以再次使用。</p></Box>
      {EXAMPLES.map(e => (
        <div key={e.id} className="grid md:grid-cols-[1fr_auto] gap-2 items-center bg-white border border-gray-300 rounded-lg p-3">
          <span className="font-bold">{e.label}</span>
          <Choices columns={2} value={k[e.id]} onChange={v => setK(p => ({ ...p, [e.id]: v }))} label={e.label}
            options={[{ id: 'once', label: '一次性指令' }, { id: 'skill', label: '可重用 Skill' }]} />
        </div>
      ))}
      <Btn onClick={submit} disabled={Object.keys(k).length < EXAMPLES.length}>確認</Btn>
    </div>
  );
}

export function SkillCard() {
  return (
    <Box title={`🧩 ${SKILL.name}`} tone="amber">
      <dl className="space-y-2">
        <div><dt className="font-black">用途</dt><dd>{SKILL.purpose}</dd></div>
        <div><dt className="font-black">必要資料</dt><dd><ul className="list-disc ml-5">{SKILL.needs.map(n => <li key={n}>{n}</li>)}</ul></dd></div>
        <div><dt className="font-black">輸出要求</dt><dd>{SKILL.output}</dd></div>
        <div><dt className="font-black">規則</dt><dd><ol className="list-decimal ml-5">{SKILL.rules.map(r => <li key={r}>{r}</li>)}</ol></dd></div>
        <div className="text-sm text-gray-700">{SKILL.noExternal}</div>
      </dl>
    </Box>
  );
}

function Read({ api }) {
  const [a, setA] = useState({});
  const set = (k, v) => setA(p => ({ ...p, [k]: v }));
  const submit = () => api.submit([
    crit('purpose', '找出用途', 5, a.purpose === 'ok'),
    crit('needs', '找出必要資料', 5, a.needs === 'ok', '待辦、工作紀錄與數據 CSV 三份。'),
    crit('output', '找出輸出要求', 5, a.output === 'ok', '固定四段，附來源與期間。'),
  ]);
  return (
    <div className="space-y-4">
      <SkillCard />
      <Field label="這個 Skill 的用途是？"><Choices value={a.purpose} onChange={v => set('purpose', v)} label="用途" options={[
        { id: 'ok', label: '把每週資料整理成固定格式的一頁週報' }, { id: 'mail', label: '自動幫你寄信給主管' }, { id: 'time', label: '每週五自動執行' },
      ]} /></Field>
      <Field label="使用前要準備哪些資料？"><Choices value={a.needs} onChange={v => set('needs', v)} label="必要資料" options={[
        { id: 'ok', label: '待辦表、工作紀錄、本週數據 CSV' }, { id: 'key', label: 'API 金鑰與信箱密碼' }, { id: 'none', label: '什麼都不用' },
      ]} /></Field>
      <Field label="輸出要求是？"><Choices value={a.output} onChange={v => set('output', v)} label="輸出" options={[
        { id: 'ok', label: `一頁週報：${REPORT_SECTIONS.map(s => s.slice(2)).join('、')}，附來源與期間` }, { id: 'free', label: '自由發揮' }, { id: 'long', label: '越長越好' },
      ]} /></Field>
      <Btn onClick={submit} disabled={Object.keys(a).length < 3}>讀完了</Btn>
    </div>
  );
}

const PATHS = {
  claude: { add: ['Customize', 'Skills', `上傳教學技能包 ${SKILL.packages.claude.file}`], enable: '開啟技能開關' },
  gemini: { add: ['Customize', 'Skills', '加入技能（貼上教學技能說明）'], enable: '確認技能已啟用' },
  chatgpt: { add: ['技能或外掛入口', '加入教學技能', `選擇 ${SKILL.packages.chatgpt.file}`], enable: '確認可在對話中選取' },
};
const TRAPS = ['貼上 API 金鑰', '下載來源不明的技能包', '撰寫 SKILL.md 程式'];

function Enable({ api }) {
  const tool = api.profile.tool ?? 'claude';
  const path = PATHS[tool];
  const [seq, setSeq] = useState([]);
  const [warn, setWarn] = useState('');
  const pool = [...path.add, path.enable, ...TRAPS].sort((x, y) => x.localeCompare(y, 'zh-Hant'));
  const click = n => {
    if (TRAPS.includes(n)) { setWarn(`「${n}」不需要：教學 Skill 已由教材團隊準備與驗證，不用金鑰也不用寫程式。`); return; }
    setWarn('');
    setSeq(s => s.includes(n) ? s : [...s, n]);
  };
  const addOk = path.add.every((n, i) => seq[i] === n);
  const enableOk = addOk && seq[path.add.length] === path.enable;
  const submit = () => api.submit([
    crit('add', '正確加入 Skill', 10, addOk, `順序：${path.add.join(' → ')}`),
    crit('enable', '啟用並確認可使用', 10, enableOk, enableOk ? '狀態顯示已啟用。' : `加入後還要「${path.enable}」。`),
  ], { skill: { tool, enabled: enableOk, name: SKILL.short } });
  return (
    <div className="space-y-4">
      <p>{TOOLS[tool].name} 的入口：<b>{TOOLS[tool].skillPath}</b> <DownloadLink href={SKILL.packages[tool].href}>{SKILL.packages[tool].file}</DownloadLink></p>
      <p className="text-sm text-gray-600">帳號方案不支援 Skill 時，可先在這裡練習；「Skill 實作已完成」會維持未驗證。</p>
      <div className="flex flex-wrap gap-2">
        {pool.map(n => (
          <Btn key={n} variant={seq.includes(n) ? 'success' : 'secondary'} onClick={() => click(n)}>{seq.includes(n) ? `${seq.indexOf(n) + 1}. ` : ''}{n}</Btn>
        ))}
      </div>
      {warn && <p className="text-rose-700 font-bold">{warn}</p>}
      <Box><span className="font-bold">你的操作順序：</span>{seq.length ? seq.join(' → ') : '（依序點選）'}
        {enableOk && <span className="ml-2 inline-block bg-emerald-600 text-white text-sm font-bold px-2 py-0.5 rounded">已啟用</span>}
      </Box>
      <div className="flex gap-2">
        <Btn variant="ghost" onClick={() => { setSeq([]); setWarn(''); }}>清除重來</Btn>
        <Btn onClick={submit} disabled={!seq.length}>完成</Btn>
      </div>
    </div>
  );
}

const PROMPTS = [
  { id: 'named', label: `請使用「${SKILL.short}」，依附件整理第一週（${WEEK1.period}）的週報。` },
  { id: 'vague', label: '幫我做週報。' },
  { id: 'copy', label: '照上次那樣做。' },
];

function Use1({ api }) {
  const [p, setP] = useState(null);
  const [run, setRun] = useState(false);
  const [sec, setSec] = useState([]);
  const m = computeMetrics(WEEK1.rows);
  const submit = () => api.submit([
    crit('named', '在要求中指定使用 Skill', 10, p === 'named', p === 'named' ? '點名 Skill，AI 才會套用規則。' : '沒有點名 Skill，AI 不一定會套用。'),
    crit('format', '檢查成果符合四段格式', 10, REPORT_SECTIONS.every(s => sec.includes(s)), '四段都在，格式才符合 Skill 規則。'),
  ], { skillRun1: { m, period: WEEK1.period } });
  return (
    <div className="space-y-4">
      <Field label="新對話中，要怎麼說？"><Choices value={p} onChange={setP} options={PROMPTS} label="要求" /></Field>
      <Btn onClick={() => setRun(true)} disabled={!p}>送出</Btn>
      {run && (
        <>
          <p className="text-sm text-gray-600">{p === 'named' ? `🧩 已套用：${SKILL.short}` : '（未顯示套用 Skill）'}</p>
          <WeeklyReport project={PROJECT_A} period={WEEK1.period} m={m} todos={TODO_A_ANSWER} pending={['客戶報價單負責人待確認']} next={['10/17 前交文宣初稿']} sources={['待辦表', WEEK1.file]} />
          <Field label="檢查：成果中出現了哪些段落？（勾選你確認看到的）">
            <Choices multi columns={2} value={sec} onChange={setSec} options={REPORT_SECTIONS.map(s => ({ id: s, label: s }))} label="段落" />
          </Field>
          <Btn onClick={submit}>檢查完成</Btn>
        </>
      )}
    </div>
  );
}

function Use2({ api }) {
  const right = computeMetrics(WEEK2.rows);
  const [v, setV] = useState({ done: '', amount: '' });
  const [rules, setRules] = useState([]);
  const stale = { ...right, done: 8 };
  const submit = () => api.submit([
    crit('data', '新資料數字正確', 10, v.done === String(right.done) && v.amount === String(right.amount),
      `第二週完成 ${right.done} 列；金額 ${fmtAmount(right.amount)}（T14 空白不計入）。`),
    crit('rules', '規則維持', 10, rules.includes('four') && rules.includes('tbd') && !rules.includes('guess'),
      '四段格式維持，T14 空白金額標待確認，不猜數字。'),
  ], { skillRun2: { m: right, period: WEEK2.period } });
  return (
    <div className="space-y-4">
      <Box tone="blue"><p>新任務：「請使用「{SKILL.short}」，依附件整理第二週（{WEEK2.period}）的週報。」</p></Box>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">🧩 已套用：{SKILL.short}（AI 第一版）</p>
          <WeeklyReport project={PROJECT_A} period={WEEK2.period} m={stale} pending={['T14 現場佈置金額待確認']} next={['確認 T14 金額', '完成交通接駁']} sources={[WEEK2.file]} />
        </div>
        <Box title={`原始數據：${WEEK2.file}`}><DataRows data={WEEK2} /></Box>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="正確的完成數"><Select label="完成數" value={v.done} onChange={x => setV(p => ({ ...p, done: x }))} options={['5', '7', '8']} /></Field>
        <Field label="正確的金額合計"><Select label="金額" value={v.amount} onChange={x => setV(p => ({ ...p, amount: x }))} options={[{ id: '17300', label: '17,300' }, { id: '17800', label: '17,800' }, { id: '42700', label: '42,700' }]} /></Field>
      </div>
      <Field label="規則有沒有維持？（勾選正確的）">
        <Choices multi value={rules} onChange={setRules} label="規則" options={[
          { id: 'four', label: '仍是固定四段格式' },
          { id: 'tbd', label: 'T14 空白金額標「待確認」' },
          { id: 'guess', label: 'T14 金額可以估一個數字補上' },
        ]} />
      </Field>
      <Btn onClick={submit} disabled={!v.done || !v.amount}>確認第二週結果</Btn>
    </div>
  );
}

function Manage({ api }) {
  const tool = api.profile.tool ?? 'claude';
  const [a, setA] = useState({});
  const set = (k, x) => setA(p => ({ ...p, [k]: x }));
  const submit = () => api.submit([
    crit('save', '保存兩次結果', 5, a.save === 'both'),
    crit('off', '找到停用位置', 5, a.off === 'list', `停用在 ${TOOLS[tool].skillPath.split('→').slice(0, 2).join('→')} 的開關。`),
    crit('reuse', '知道下次怎麼使用', 5, a.reuse === 'name', '新對話中點名 Skill，並附上新資料。'),
  ], { l4Saved: true });
  return (
    <div className="space-y-4">
      <Field label="要保存什麼？"><Choices value={a.save} onChange={x => set('save', x)} label="保存" options={[{ id: 'both', label: '第一週與第二週兩份結果' }, { id: 'last', label: '只留最後一份' }]} /></Field>
      <Field label="不想再套用時，去哪裡停用？"><Choices value={a.off} onChange={x => set('off', x)} label="停用" options={[{ id: 'list', label: `Skill 列表（${TOOLS[tool].skillPath}）中關閉或移除` }, { id: 'chat', label: '刪掉聊天紀錄' }, { id: 'none', label: '無法停用' }]} /></Field>
      <Field label="下次怎麼再用？"><Choices value={a.reuse} onChange={x => set('reuse', x)} label="再用" options={[{ id: 'name', label: '新對話中點名 Skill，附上新一週資料' }, { id: 'auto', label: '它會自己定時執行' }]} /></Field>
      <p className="text-sm text-gray-600">Skill 只保存做法，不會因此取得信箱權限或自動定時執行；排程在下一關。</p>
      <Btn onClick={submit} disabled={Object.keys(a).length < 3}>完成</Btn>
    </div>
  );
}

function Result({ progress }) {
  const s = progress.artifacts.skill;
  return (
    <Box title="Skill 裝備站">
      <p>已裝備：<b>{SKILL.name}</b>（{TOOLS[s?.tool]?.name ?? '—'}）{s?.enabled ? '・已啟用（練習）' : ''}</p>
      <p className="text-sm text-gray-600">第一週完成 {progress.artifacts.skillRun1?.m.done ?? '—'}；第二週完成 {progress.artifacts.skillRun2?.m.done ?? '—'}</p>
    </Box>
  );
}

export default {
  steps: [Distinguish, Read, Enable, Use1, Use2, Manage],
  materials: [WEEK1, WEEK2, ...Object.values(SKILL.packages)],
  Result,
};
