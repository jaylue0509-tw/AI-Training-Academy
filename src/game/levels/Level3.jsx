import React, { useState } from 'react';
import { WORK_LOG, EMAILS_A, WEEK1, TODO_A_ANSWER, computeMetrics, fmtAmount, PROJECT_A, METRIC_RULE, REPORT_SECTIONS } from '../data/materials.js';
import { crit } from '../engine/scoring.js';
import { Btn, Choices, Field, Box, DataTable, Reorder, Doc, Select } from '../components/ui.jsx';
import { EntryPick } from './Level2.jsx';
import { ThreeRunButtons } from './Level1.jsx';

export function WeeklyReport({ project, period, m, todos, pending = [], next = [], sources = [], fileName }) {
  return (
    <Doc title={`${project} 週報（${period}）`}>
      {fileName && <p className="text-xs text-gray-500 font-sans mb-2">📄 {fileName}</p>}
      <h4 className="font-black font-sans mt-2">{REPORT_SECTIONS[0]}</h4>
      <p>本週完成 {m.done} 項、未完成 {m.undone} 項，支出 {fmtAmount(m.amount)} 元{m.missing?.length ? `（${m.missing.join('、')} 金額待確認）` : ''}。{todos?.[0] ? `最近期限：${todos[0].task} ${todos[0].due}。` : ''}</p>
      <h4 className="font-black font-sans mt-3">{REPORT_SECTIONS[1]}</h4>
      <ul className="list-disc ml-5">
        <li>完成數：{m.done}</li><li>未完成數：{m.undone}</li><li>金額合計：{fmtAmount(m.amount)} 元</li>
      </ul>
      <h4 className="font-black font-sans mt-3">{REPORT_SECTIONS[2]}</h4>
      <ul className="list-disc ml-5">{pending.length ? pending.map(p => <li key={p}>{p}</li>) : <li>無</li>}</ul>
      <h4 className="font-black font-sans mt-3">{REPORT_SECTIONS[3]}</h4>
      <ul className="list-disc ml-5">{next.map(n => <li key={n}>{n}</li>)}</ul>
      {sources.length > 0 && <p className="text-xs text-gray-500 font-sans mt-3">資料來源：{sources.join('、')}</p>}
    </Doc>
  );
}

export function DataRows({ data }) {
  return (
    <DataTable columns={[{ key: 'id', label: 'ID' }, { key: 'task', label: '任務' }, { key: 'status', label: '狀態' }, { key: 'amount', label: '金額' }]} rows={data.rows} />
  );
}

function Entry({ api }) {
  return <EntryPick api={api} levelNo={3} question="這次要交出報告檔案，選哪個入口？"
    okReason="這個入口能產出並保存成品。" badReason="這次要交檔案；ChatGPT 選 Work、Claude 選 Cowork、Gemini 用 Chat 產出後匯出。" />;
}

const SOURCES = [
  { id: 'todo', label: '待辦表（第二關成果）' },
  { id: 'log', label: WORK_LOG.file },
  { id: 'csv', label: WEEK1.file },
  { id: 'old', label: '上月舊週報.docx' },
];

function Sources({ api }) {
  const [pick, setPick] = useState([]);
  const [period, setPeriod] = useState(null);
  const submit = () => api.submit([
    crit('todo', '加入待辦表', 3, pick.includes('todo')),
    crit('log', '加入工作紀錄', 3, pick.includes('log')),
    crit('csv', '加入本週數據', 3, pick.includes('csv')),
    crit('old', '不混入舊資料', 2, !pick.includes('old'), '上月舊週報的數字會混淆本週結果。'),
    crit('period', '資料期間正確', 4, period === 'w1', '本週是 2026-10-12 至 10-16。'),
  ]);
  return (
    <div className="space-y-4">
      <Field label="加入哪些來源？（可複選）"><Choices multi columns={2} value={pick} onChange={setPick} options={SOURCES} label="來源" /></Field>
      <Field label="資料期間">
        <Choices columns={3} value={period} onChange={setPeriod} label="期間" options={[
          { id: 'w1', label: WEEK1.period }, { id: 'month', label: '2026-10-01 至 10-31' }, { id: 'last', label: '2026-09-01 至 09-30' },
        ]} />
      </Field>
      <Btn onClick={submit} disabled={!pick.length || !period}>加入</Btn>
    </div>
  );
}

const ORDER = ['結論', '三個數字', '待確認', '下一步'];
const SHUFFLED = ['三個數字', '下一步', '結論', '待確認'];

function Structure({ api }) {
  const [items, setItems] = useState(SHUFFLED);
  const [pages, setPages] = useState(null);
  const [format, setFormat] = useState(null);
  const submit = () => api.submit([
    ...ORDER.map((s, i) => crit(`o${i}`, `第 ${i + 1} 段是「${s}」`, 3, items[i] === s, i === 0 ? '主管最先要看結論。' : '')),
    crit('page', '指定一頁範圍', 4, pages === 'one', '一頁讀得完，才會被看。'),
    crit('format', '指定輸出格式', 4, format === 'file', '要能開啟、能轉寄的檔案。'),
  ]);
  return (
    <div className="space-y-4">
      <Field label="報告拼圖：排出段落順序（可拖曳或用 ▲▼）"><Reorder items={items} onChange={setItems} /></Field>
      <Field label="篇幅"><Choices columns={3} value={pages} onChange={setPages} label="篇幅" options={[{ id: 'one', label: '一頁' }, { id: 'five', label: '五頁以上' }, { id: 'any', label: '不限' }]} /></Field>
      <Field label="輸出格式"><Choices columns={3} value={format} onChange={setFormat} label="格式" options={[{ id: 'file', label: '可開啟的文件檔' }, { id: 'chat', label: '聊天文字就好' }, { id: 'img', label: '一張截圖' }]} /></Field>
      <Btn onClick={submit}>完成結構</Btn>
    </div>
  );
}

const FORMATS = [
  { id: 'docx', label: 'DOCX（Word 文件）' }, { id: 'pdf', label: 'PDF' }, { id: 'doc', label: '可匯出的線上文件' }, { id: 'chat', label: '先留在聊天裡' },
];

function Produce({ api }) {
  const [done, setDone] = useState(api.stepState.complete ? 3 : 0);
  const [fmt, setFmt] = useState(null);
  const [warn, setWarn] = useState(false);
  const step = n => {
    if (n === 2 && (!fmt || fmt === 'chat')) { setWarn(true); return; }
    setWarn(false);
    setDone(n);
    if (n === 3) api.submit([
      crit('gen', '產出報告', 7, true),
      crit('save', '存成檔案或可匯出文件', 7, fmt && fmt !== 'chat', '只有聊天文字，還不是能交的成品。'),
      crit('open', '開啟並可閱讀', 6, true),
    ], { reportFormat: fmt });
  };
  return (
    <div className="space-y-4">
      <Field label="存成哪種格式？（依你的工具實際支援）"><Choices columns={2} value={fmt} onChange={setFmt} options={FORMATS} label="格式" /></Field>
      {warn && <p className="text-rose-700 font-bold">只有聊天文字還不是成品，請先選一種能開啟的檔案格式。</p>}
      <ThreeRunButtons labels={['產出報告', '存成檔案', '打開檔案']} done={done} onStep={step} />
      {done >= 3 && <p className="text-emerald-700 font-bold">報告已開啟，下一步核對數字。</p>}
    </div>
  );
}

// 第一版報告：完成數錯（9）、文宣期限過時（10/20）
const WRONG = { done: 9, undone: 3, amount: 42700, due: '10/20' };

function Verify({ api }) {
  const m = computeMetrics(WEEK1.rows);
  const [v, setV] = useState({ done: '', undone: '', amount: '', due: '' });
  const set = (k, x) => setV(p => ({ ...p, [k]: x }));
  const items = [
    { k: 'done', label: '完成數', shown: WRONG.done, answer: String(m.done), opts: ['8', '9', '11'], why: `數據表中狀態為「完成」的有 ${m.done} 列。` },
    { k: 'undone', label: '未完成數', shown: WRONG.undone, answer: String(m.undone), opts: ['2', '3', '4'], why: '進行中 2 列＋未開始 1 列。' },
    { k: 'amount', label: '金額合計', shown: fmtAmount(WRONG.amount), answer: String(m.amount), opts: ['42700', '45600', '41500'], why: '12,000＋8,500＋1,200＋15,000＋6,000。' },
    { k: 'due', label: '文宣期限', shown: WRONG.due, answer: '10/17', opts: ['10/17', '10/20'], why: 'M04 更正為 10/17。' },
  ];
  const submit = () => api.submit(items.map(it => crit(it.k, `${it.label}對回原始資料`, 5, v[it.k] === it.answer, it.why)),
    { report: { project: PROJECT_A, period: WEEK1.period, m, todos: TODO_A_ANSWER } });
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700">計算口徑：{METRIC_RULE}</p>
      <div className="grid md:grid-cols-2 gap-4">
        <Doc title="報告中的數字（第一版）">
          <ul className="space-y-1">{items.map(it => <li key={it.k}>{it.label}：<b>{it.shown}</b></li>)}</ul>
        </Doc>
        <Box title={`原始數據：${WEEK1.file}`}><DataRows data={WEEK1} /></Box>
      </div>
      <Box title="待辦表期限（回查來源）">
        <DataTable columns={[{ key: 'task', label: '事項' }, { key: 'due', label: '期限' }, { key: 'source', label: '來源' }]} rows={TODO_A_ANSWER} />
        <p className="text-sm text-gray-600 mt-1">{EMAILS_A.list[3].id}：{EMAILS_A.list[3].body}</p>
      </Box>
      <div className="grid sm:grid-cols-4 gap-3">
        {items.map(it => (
          <Field key={it.k} label={`正確的${it.label}`}><Select label={it.label} value={v[it.k]} onChange={x => set(it.k, x)} options={it.opts.map(o => ({ id: o, label: it.k === 'amount' ? fmtAmount(Number(o)) : o }))} /></Field>
        ))}
      </div>
      <Btn onClick={submit} disabled={Object.values(v).some(x => !x)}>核對完成</Btn>
    </div>
  );
}

const NAMES = [
  { id: 'good', label: `週報_${PROJECT_A}_2026-10-12至10-16` },
  { id: 'bad1', label: '新文件(1)' },
  { id: 'bad2', label: '週報final最終版' },
];

function Save({ api }) {
  const [name, setName] = useState(null);
  const [src, setSrc] = useState(false);
  const [reuse, setReuse] = useState(false);
  const ext = { docx: '.docx', pdf: '.pdf', doc: '' }[api.artifacts.reportFormat] ?? '.docx';
  const submit = () => api.submit([
    crit('name', '檔名含專案與期間', 5, name === 'good', '一眼看出是哪一週、哪個專案。'),
    crit('src', '附上資料來源', 5, src, '主管回查時知道數字從哪來。'),
    crit('reuse', '保存下週可重用的要求', 5, reuse, '下一關會把這套做法包成 Skill。'),
  ], { reportFile: `${NAMES[0].label}${ext}`, l3Saved: true });
  return (
    <div className="space-y-4">
      <Field label="檔名"><Choices value={name} onChange={setName} options={NAMES.map(n => ({ ...n, label: n.label + ext }))} label="檔名" /></Field>
      <label className="flex items-center gap-2 font-bold"><input type="checkbox" className="w-5 h-5" checked={src} onChange={e => setSrc(e.target.checked)} />在報告最後附上資料來源與期間</label>
      <label className="flex items-center gap-2 font-bold"><input type="checkbox" className="w-5 h-5" checked={reuse} onChange={e => setReuse(e.target.checked)} />把這次的週報要求存進指令庫</label>
      <Btn onClick={submit} disabled={!name}>保存</Btn>
    </div>
  );
}

function Result({ progress }) {
  const m = computeMetrics(WEEK1.rows);
  return <WeeklyReport project={PROJECT_A} period={WEEK1.period} m={m} todos={TODO_A_ANSWER}
    pending={['客戶報價單負責人待確認']} next={['10/17 前交文宣初稿', '指派報價單負責人']}
    sources={['待辦表', WORK_LOG.file, WEEK1.file]} fileName={progress.artifacts.reportFile} />;
}

export default { steps: [Entry, Sources, Structure, Produce, Verify, Save], materials: [WORK_LOG, WEEK1], Result };
