import React, { useMemo, useState } from 'react';
import { EMAILS_A, EMAILS_B, WEEK1, WEEK_B, TODO_B_ANSWER, TOOL_MODE_ORDER, TOOL_STARTER, SKILL, computeMetrics, PROJECT_B, fmtAmount } from '../data/materials.js';
import { TOOLS, isEntryOk } from '../data/tools.js';
import { crit } from '../engine/scoring.js';
import { idsInOrder } from '../engine/checkers.js';
import { Btn, Choices, Field, Box, DataTable, Select, inputCls } from '../components/ui.jsx';
import { MailList } from './Level2.jsx';
import { WeeklyReport, DataRows } from './Level3.jsx';
import { ThreeRunButtons } from './Level1.jsx';

const mode = api => api.artifacts.final?.mode ?? 'office';

function Choose({ api }) {
  const tool = api.profile.tool ?? 'claude';
  const [m, setM] = useState(api.artifacts.final?.mode ?? null);
  const [entry, setEntry] = useState(null);
  const [why, setWhy] = useState(null);
  const ok = m === 'tool' ? isEntryOk('tool', tool, entry) : isEntryOk(6, tool, entry);
  const whyOk = (m === 'office' && why === 'report') || (m === 'tool' && why === 'page');
  const submit = () => api.submit([
    crit('entry', '入口對應這次的工作', 5, ok, ok ? '' : m === 'tool' ? '工具模式要用 Codex 或 Claude Code。' : '辦公任務用能整理與產出的入口。'),
    crit('why', '說明選擇對應的完成目標', 5, whyOk, whyOk ? '' : '辦公任務交待辦與週報；工具模式交可篩選的待辦頁。'),
  ], { final: { ...api.artifacts.final, mode: m, entry } });
  return (
    <div className="space-y-4">
      <Field label="這次要交什麼？">
        <Choices columns={2} value={m} onChange={x => { setM(x); setEntry(null); }} label="模式" options={[
          { id: 'office', label: '辦公任務（必修）', desc: '待辦表＋一頁週報，使用週報 Skill' },
          { id: 'tool', label: '工具模式（同關選項）', desc: '用 Codex 或 Claude Code 做可篩選的信件待辦頁' },
        ]} />
      </Field>
      {m === 'tool' && tool === 'gemini' && <p className="text-amber-700 font-bold">工具模式示範使用 Codex 或 Claude Code；Gemini 為主要工具時，建議選辦公任務。</p>}
      {m && (
        <Field label="選哪個入口？">
          <Choices columns={3} value={entry} onChange={setEntry} label="入口" options={TOOLS[tool].entries.map(e => ({ id: e.id, label: e.name, desc: e.use }))} />
        </Field>
      )}
      {m && (
        <Field label="這個選擇是為了完成什麼？">
          <Choices value={why} onChange={setWhy} label="完成目標" options={[
            { id: 'report', label: '交出新專案的待辦表與一頁週報' },
            { id: 'page', label: '交出能篩選、依期限排序的待辦頁' },
            { id: 'chat', label: '先跟 AI 聊聊看' },
          ]} />
        </Field>
      )}
      <Btn onClick={submit} disabled={!m || !entry || !why}>決定</Btn>
    </div>
  );
}

const FILES = [
  { id: 'eb', label: EMAILS_B.file }, { id: 'wb', label: WEEK_B.file },
  { id: 'ea', label: EMAILS_A.file }, { id: 'wa', label: WEEK1.file },
];

function Data({ api }) {
  const tool = mode(api) === 'tool';
  const [pick, setPick] = useState([]);
  const [gap, setGap] = useState(null);
  const need = tool ? ['eb'] : ['eb', 'wb'];
  const dataOk = need.every(x => pick.includes(x)) && !pick.includes('ea') && !pick.includes('wa');
  const submit = () => api.submit([
    crit('data', '選對新資料', 8, dataOk, dataOk ? '' : `這次是${PROJECT_B}的新資料，不要混入上一個專案。`),
    crit('gap', '找出缺漏', 7, gap === 'N04', gap === 'N04' ? 'N04 沒有交代由誰回覆，負責人待確認。' : '再看一次每封信是否都有負責人。'),
  ]);
  return (
    <div className="space-y-4">
      <Field label="選這次的資料（可複選）"><Choices multi columns={2} value={pick} onChange={setPick} options={FILES} label="資料" /></Field>
      <MailList list={EMAILS_B.list} />
      <Field label="哪一封信缺了負責人？">
        <Choices columns={3} value={gap} onChange={setGap} label="缺漏" options={EMAILS_B.list.map(m => ({ id: m.id, label: m.id }))} />
      </Field>
      <Btn onClick={submit} disabled={!pick.length || !gap}>確認資料</Btn>
    </div>
  );
}

export function checkRequest(text, isTool) {
  const t = text ?? '';
  if (isTool) {
    return [
      { key: 'skill', label: '指定工具或 Skill', ok: /Codex|Claude\s*Code|Skill/i.test(t), miss: '還沒寫要用哪個工具或 Skill。' },
      { key: 'src', label: '資料來源', ok: /CSV|信件|N0\d|附件|資料夾/i.test(t), miss: '還沒說資料從哪裡來。' },
      { key: 'out', label: '輸出內容', ok: /(待辦|頁)/.test(t) && /篩選/.test(t), miss: '還沒說要做出什麼（例如可篩選的頁面）。' },
      { key: 'limit', label: '限制與檢查', ok: /期限/.test(t) && /排序/.test(t) && /(空|沒有符合|無資料)/.test(t), miss: '還沒寫排序規則或沒有資料時怎麼顯示。' },
    ];
  }
  return [
    { key: 'skill', label: '明確指定 Skill', ok: /週報\s*Skill|weekly-report|Skill/i.test(t), miss: '還沒點名要使用的 Skill。' },
    { key: 'src', label: '資料來源', ok: /(信|N0\d|附件)/.test(t) && /(數據|CSV|資料)/i.test(t), miss: '還沒寫清楚要看哪些信件與數據。' },
    { key: 'out', label: '輸出內容', ok: /待辦/.test(t) && /週報/.test(t), miss: '還沒說要交出待辦表與週報。' },
    { key: 'limit', label: '限制', ok: /待確認/.test(t) && /(不(要)?猜|不編造|不補寫|不寄|不刪)/.test(t), miss: '還沒寫缺資料怎麼處理，或哪些事不能做。' },
  ];
}

function Request({ api }) {
  const isTool = mode(api) === 'tool';
  const [text, setText] = useState(api.artifacts.final?.request ?? '');
  const submit = () => api.submit(
    checkRequest(text, isTool).map(c => crit(c.key, c.label, 5, c.ok, c.ok ? '' : c.miss)),
    { final: { ...api.artifacts.final, request: text } },
  );
  return (
    <div className="space-y-4">
      <Box tone="amber" title="完成條件">
        {isTool
          ? <ul className="list-disc ml-5"><li>用 {EMAILS_B.file} 產生信件待辦頁</li><li>五筆資料都顯示，可依關鍵字篩選</li><li>依期限排序（沒有期限的排最後）</li><li>篩選沒有結果時顯示提示</li><li>不連真實信箱、不部署網站</li></ul>
          : <ul className="list-disc ml-5"><li>整理成待辦表與一頁週報</li><li>使用已啟用的 {SKILL.short}</li><li>數字與期限對得回原始資料</li><li>缺資料不編造</li></ul>}
      </Box>
      <Field label="自己寫完整要求（這關不提供範例句）">
        <textarea className={`${inputCls} h-36`} value={text} onChange={e => setText(e.target.value)} />
      </Field>
      <Btn onClick={submit} disabled={text.trim().length < 20}>檢查要求</Btn>
    </div>
  );
}

function Run({ api }) {
  const isTool = mode(api) === 'tool';
  const [done, setDone] = useState(api.stepState.complete ? 3 : 0);
  const step = n => {
    setDone(n);
    if (n === 3) api.submit([
      crit('run', '執行', 7, true),
      crit('make', '產出成品', 7, true),
      crit('open', '打開成品確認可用', 6, true, '不只看到「完成」訊息，而是真的打開。'),
    ]);
  };
  return (
    <div className="space-y-4">
      <ThreeRunButtons labels={['執行', '產出成品', isTool ? '打開待辦頁' : '打開週報']} done={done} onStep={step} />
      {done === 2 && <p className="font-bold text-gray-700">AI 顯示：「已完成！」——還沒打開成品前，不算交件。</p>}
      {done >= 3 && (isTool ? <TodoPage buggy /> : <DraftB />)}
    </div>
  );
}

// 工具模式：可篩選的信件待辦頁（buggy 版依寄信日期排序）
export function TodoPage({ buggy }) {
  const [q, setQ] = useState('');
  const rows = useMemo(() => {
    const list = EMAILS_B.list.filter(m => !q || `${m.id}${m.subject}${m.body}`.includes(q));
    const key = m => (m.due ? m.due.split('/').map(n => n.padStart(2, '0')).join('') : '9999');
    return [...list].sort((a, b) => buggy ? a.date.localeCompare(b.date) : key(a).localeCompare(key(b)));
  }, [q, buggy]);
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4" aria-label="待辦頁預覽">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="font-black">信件待辦頁</h4>
        <input className="border-2 border-gray-300 rounded-lg px-2 py-1 ml-auto" placeholder="篩選關鍵字" value={q} onChange={e => setQ(e.target.value)} aria-label="篩選" />
      </div>
      {rows.length === 0 ? <p className="text-gray-600 font-bold">沒有符合的待辦</p> : (
        <DataTable columns={[{ key: 'id', label: 'ID' }, { key: 'subject', label: '事項' }, { key: 'due', label: '期限', render: r => r.due || '無期限' }]} rows={rows} />
      )}
    </div>
  );
}

export function runToolTests(buggy) {
  const key = m => (m.due ? m.due.split('/').map(n => n.padStart(2, '0')).join('') : '9999');
  const order = [...EMAILS_B.list].sort((a, b) => buggy ? a.date.localeCompare(b.date) : key(a).localeCompare(key(b))).map(m => m.id);
  return [
    { id: 'count', label: '顯示五筆資料', ok: order.length === 5 },
    { id: 'sort', label: '依期限排序（無期限排最後）', ok: idsInOrder(order.join(' '), TOOL_MODE_ORDER) },
    { id: 'empty', label: '篩選無結果時顯示提示', ok: true },
  ];
}

const DRAFT_B = { done: 5, due: '10/30', owner: '李佳蓉' };

function DraftB({ fixed }) {
  const m = computeMetrics(WEEK_B.rows);
  const todos = fixed ? TODO_B_ANSWER : TODO_B_ANSWER.map(r => r.source === 'N04' ? { ...r, owner: DRAFT_B.owner } : r.source.startsWith('N03') ? { ...r, due: DRAFT_B.due, source: 'N03' } : r);
  return (
    <div className="space-y-3">
      <DataTable columns={[{ key: 'task', label: '事項' }, { key: 'owner', label: '負責人' }, { key: 'due', label: '期限' }, { key: 'source', label: '來源' }]} rows={todos} />
      <WeeklyReport project={PROJECT_B} period={WEEK_B.period} m={fixed ? m : { ...m, done: DRAFT_B.done }} todos={todos}
        pending={['B07 紀念品設計金額待確認', ...(fixed ? ['旅行社聯絡窗口負責人待確認'] : [])]} next={['10/23 前確認旅行社合約', '10/24 前回覆聯絡窗口']} sources={[EMAILS_B.file, WEEK_B.file]} />
    </div>
  );
}

function Check({ api }) {
  return mode(api) === 'tool' ? <ToolCheck api={api} /> : <OfficeCheck api={api} />;
}

function OfficeCheck({ api }) {
  const m = computeMetrics(WEEK_B.rows);
  const [v, setV] = useState({});
  const set = (k, x) => setV(p => ({ ...p, [k]: x }));
  const [fixed, setFixed] = useState(api.stepState.complete);
  const submit = () => {
    const r = api.submit([
      crit('done', '完成數對回數據', 5, v.done === String(m.done), `狀態為完成的有 ${m.done} 列。`),
      crit('amount', '金額對回數據', 5, v.amount === String(m.amount), `只有 B03 有金額 ${fmtAmount(m.amount)}，B07 空白待確認。`),
      crit('due', '期限依最新信件', 5, v.due === '10/27', 'N05 更正為 10/27。'),
      crit('gap', '缺漏未被編造', 5, v.owner === '待確認', 'N04 沒有負責人，AI 填的人名是猜的。'),
    ], { final: { ...api.artifacts.final, metrics: m, todos: TODO_B_ANSWER } });
    setFixed(r.state.complete);
  };
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <div><p className="text-sm font-bold text-gray-600 mb-1">AI 成品（第一版）</p><DraftB /></div>
        <div className="space-y-3"><Box title={WEEK_B.file}><DataRows data={WEEK_B} /></Box><MailList list={EMAILS_B.list} /></div>
      </div>
      <div className="grid sm:grid-cols-4 gap-3">
        <Field label="完成數"><Select label="完成數" value={v.done} onChange={x => set('done', x)} options={['4', '5', '7']} /></Field>
        <Field label="金額合計"><Select label="金額" value={v.amount} onChange={x => set('amount', x)} options={[{ id: '2500', label: '2,500' }, { id: '0', label: '0' }, { id: '5000', label: '5,000' }]} /></Field>
        <Field label="參加人數期限"><Select label="期限" value={v.due} onChange={x => set('due', x)} options={['10/27', '10/30']} /></Field>
        <Field label="聯絡窗口負責人"><Select label="負責人" value={v.owner} onChange={x => set('owner', x)} options={['李佳蓉', '吳俊宏', '待確認']} /></Field>
      </div>
      <Btn onClick={submit} disabled={Object.keys(v).length < 4}>確認修正</Btn>
      {fixed && <div><p className="font-bold text-emerald-700 mb-1">修正後成品</p><DraftB fixed /></div>}
    </div>
  );
}

const FIXES = [
  { id: 'good', label: '排序請改用「期限」欄由近到遠，沒有期限的排最後；再跑一次三項測試。' },
  { id: 'date', label: '排序改用寄信日期。' },
  { id: 'vague', label: '頁面怪怪的，修一下。' },
];

function ToolCheck({ api }) {
  const [ran, setRan] = useState(false);
  const [fail, setFail] = useState(null);
  const [fix, setFix] = useState(null);
  const [rerun, setRerun] = useState(false);
  const before = runToolTests(true);
  const after = runToolTests(fix !== 'good');
  const submit = () => api.submit([
    crit('run', '執行指定測試', 5, ran),
    crit('find', '找出失敗的測試', 5, fail === 'sort', '頁面依寄信日期排序，不是依期限。'),
    crit('fix', '提出明確修正', 5, fix === 'good', '說清楚用哪個欄位、怎麼排、要重跑測試。'),
    crit('pass', '重跑後全部通過', 5, rerun && after.every(t => t.ok)),
  ], { final: { ...api.artifacts.final, order: TOOL_MODE_ORDER } });
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <TodoPage buggy={!(rerun && fix === 'good')} />
        <Box title="指定測試">
          <Btn variant="secondary" onClick={() => setRan(true)}>▶ 執行測試</Btn>
          {ran && <ul className="mt-2 space-y-1">{(rerun ? after : before).map(t => <li key={t.id} className={t.ok ? 'text-emerald-700' : 'text-rose-700 font-bold'}>{t.ok ? '✓' : '✗'} {t.label}</li>)}</ul>}
        </Box>
      </div>
      {ran && (
        <>
          <Field label="哪一項測試失敗？"><Choices columns={3} value={fail} onChange={setFail} label="失敗測試" options={before.map(t => ({ id: t.id, label: t.label }))} /></Field>
          <Field label="給 AI 的修正要求"><Choices value={fix} onChange={x => { setFix(x); setRerun(false); }} label="修正" options={FIXES} /></Field>
          <Btn variant="secondary" disabled={!fix} onClick={() => setRerun(true)}>修正後重跑測試</Btn>
        </>
      )}
      <Btn onClick={submit} disabled={!ran}>完成檢查</Btn>
    </div>
  );
}

const SELF_CHECK = ['成品打得開', '數字或測試對回原始資料', '缺漏標待確認，沒有編造', '確實使用了 Skill 或指定工具'];

function Submit({ api }) {
  const [submitted, setSubmitted] = useState(Boolean(api.artifacts.final?.submitted));
  const [reuse, setReuse] = useState(null);
  const [checks, setChecks] = useState([]);
  const submit = () => api.submit([
    crit('submit', '提交成品', 5, submitted),
    crit('reuse', '記下下次重用方式', 5, reuse === 'all', '保存指令、Skill 名稱與資料位置，下次換資料就能做。'),
    crit('self', '完成交件前自我檢查', 5, checks.length === SELF_CHECK.length),
  ], { final: { ...api.artifacts.final, submitted, reuse: '保存的指令＋Skill 名稱＋資料位置' } });
  return (
    <div className="space-y-4">
      <Field label="交件前自我檢查"><Choices multi columns={2} value={checks} onChange={setChecks} label="自我檢查" options={SELF_CHECK.map(s => ({ id: s, label: s }))} /></Field>
      <Field label="下次怎麼重用？"><Choices value={reuse} onChange={setReuse} label="重用方式" options={[
        { id: 'all', label: '保存的指令＋Skill 名稱＋資料位置' }, { id: 'memory', label: '靠記憶再打一次' }, { id: 'none', label: '不需要重用' },
      ]} /></Field>
      <Btn variant={submitted ? 'success' : 'primary'} onClick={() => setSubmitted(true)}>{submitted ? '✓ 成品已提交' : '提交成品'}</Btn>
      <Btn onClick={submit}>完成交件</Btn>
    </div>
  );
}

function Result({ progress }) {
  return progress.artifacts.final?.mode === 'tool'
    ? <Box title="工作室成果：信件待辦頁"><TodoPage /><p className="text-sm text-gray-600 mt-2">工具模式教學專案：<a className="underline font-bold" href={TOOL_STARTER.href} download>{TOOL_STARTER.file}</a></p></Box>
    : <Box title="工作室成果"><DraftB fixed /></Box>;
}

export default { steps: [Choose, Data, Request, Run, Check, Submit], materials: [EMAILS_B, WEEK_B, TOOL_STARTER], Result };
