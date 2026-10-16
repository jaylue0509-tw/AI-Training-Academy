import React, { useState } from 'react';
import { TOOLS, isEntryOk } from '../data/tools.js';
import { EMAILS_A, TODO_A_ANSWER } from '../data/materials.js';
import { crit } from '../engine/scoring.js';
import { Btn, Choices, Field, Box, DataTable, Select } from '../components/ui.jsx';

export function EntryPick({ api, levelNo, question, okReason, badReason }) {
  const tool = api.profile.tool ?? 'claude';
  const [entry, setEntry] = useState(null);
  const ok = isEntryOk(levelNo, tool, entry);
  return (
    <div className="space-y-4">
      <Field label={question}>
        <Choices columns={3} value={entry} onChange={setEntry} label="選擇入口"
          options={TOOLS[tool].entries.map(e => ({ id: e.id, label: e.name, desc: e.use }))} />
      </Field>
      <Btn onClick={() => api.submit([crit('entry', '選到適合的入口', 10, ok, ok ? okReason : badReason)])} disabled={!entry}>開啟</Btn>
    </div>
  );
}

function Entry({ api }) {
  return <EntryPick api={api} levelNo={2} question="整理五封信，要用哪個入口？"
    okReason="這個入口能讀資料並整理文字。" badReason="這個入口不是用來整理文字的；選 Chat，或 Work／Cowork 類的工作入口。" />;
}

function MailList({ list, compact }) {
  return (
    <ul className="space-y-2">
      {list.map(m => (
        <li key={m.id} className="bg-white border border-gray-300 rounded-lg p-3">
          <div className="flex flex-wrap gap-x-3 text-sm text-gray-600"><b className="text-gray-900">{m.id}</b><span>{m.date}</span><span>{m.from}</span><span className="font-bold">{m.subject}</span></div>
          {!compact && <p className="mt-1">{m.body}</p>}
        </li>
      ))}
    </ul>
  );
}

function Load({ api }) {
  const [loaded, setLoaded] = useState(false);
  const [fields, setFields] = useState([]);
  const submit = () => api.submit([
    crit('load', '載入教學信件匯出檔', 6, loaded, '用匯出檔即可，不需要先設定信箱授權。'),
    crit('id', '確認有信件 ID', 3, fields.includes('id'), 'ID 讓待辦表能回查來源。'),
    crit('date', '確認有日期', 3, fields.includes('date'), '日期用來判斷哪封是最新的更正。'),
    crit('body', '確認有內文', 3, fields.includes('body'), '內文才有事項、負責人與期限。'),
  ], { emailsLoaded: true });
  return (
    <div className="space-y-4">
      {!loaded ? (
        <div className="flex flex-wrap gap-3 items-center">
          <Btn onClick={() => setLoaded(true)}>📎 載入「{EMAILS_A.file}」</Btn>
          <span className="text-sm text-gray-600">真實信箱連線是可選路徑，這關用匯出檔。</span>
        </div>
      ) : <MailList list={EMAILS_A.list} />}
      <Field label="每封信都有哪些欄位？（勾選你看到的）">
        <Choices multi columns={3} value={fields} onChange={setFields} label="欄位" options={[
          { id: 'id', label: '信件 ID' }, { id: 'date', label: '日期' }, { id: 'body', label: '內文' },
        ]} />
      </Field>
      <Btn onClick={submit} disabled={!loaded}>確認資料完整</Btn>
    </div>
  );
}

const COLS = [
  { id: 'task', label: '事項' }, { id: 'owner', label: '負責人' }, { id: 'due', label: '期限' },
  { id: 'source', label: '來源（信件 ID）' }, { id: 'mood', label: '寄件人語氣' }, { id: 'sign', label: '簽名檔' },
];

function Columns({ api }) {
  const [cols, setCols] = useState([]);
  const [rule, setRule] = useState(null);
  const submit = () => api.submit([
    ...['task', 'owner', 'due', 'source'].map(k => crit(k, `欄位：${COLS.find(c => c.id === k).label}`, 4, cols.includes(k), '')),
    crit('rule', '缺資料標「待確認」', 4, rule === 'tbd' && !cols.includes('mood') && !cols.includes('sign'),
      rule === 'tbd' ? (cols.includes('mood') || cols.includes('sign') ? '語氣、簽名檔不是待辦需要的欄位，請拿掉。' : '原信沒寫的就標待確認，不猜。') : 'AI 猜測負責人，會讓錯誤藏在表裡。'),
  ], { todoColumns: cols });
  return (
    <div className="space-y-4">
      <Field label="待辦表要哪些欄位？（選四個）">
        <Choices multi columns={3} value={cols} onChange={setCols} options={COLS} label="欄位" />
      </Field>
      <Field label="原信沒寫的資料怎麼處理？">
        <Choices value={rule} onChange={setRule} label="缺資料規則" options={[
          { id: 'tbd', label: '寫「待確認」，不要猜' },
          { id: 'guess', label: '依常理推測一個' },
          { id: 'skip', label: '整列刪掉' },
        ]} />
      </Field>
      <Box tone="blue" title="這次的整理要求">
        <p>請把附件五封信整理成待辦表，欄位為事項、負責人、期限與信件 ID。期限以後續更正信為準；原信沒有交代的內容寫待確認。本次只整理，不寄出或刪除信件。</p>
      </Box>
      <Btn onClick={submit} disabled={cols.length === 0 || !rule}>確定欄位</Btn>
    </div>
  );
}

const KIND = [{ id: 'todo', label: '待辦' }, { id: 'notice', label: '通知' }, { id: 'correction', label: '更正' }];

function Classify({ api }) {
  const [k, setK] = useState({});
  const submit = () => api.submit(EMAILS_A.list.map(m => crit(m.id, `${m.id} ${m.subject}`, 4, k[m.id] === m.kind,
    m.kind === 'notice' ? '這是通知，沒有要你做的事，不列入待辦。'
      : m.kind === 'correction' ? '這封更正 M03 的期限，併入 M03 那一列。' : '有事項與期限，是待辦。')));
  return (
    <div className="space-y-3">
      {EMAILS_A.list.map(m => (
        <div key={m.id} className="grid md:grid-cols-[1fr_auto] gap-2 items-center bg-white border border-gray-300 rounded-lg p-3">
          <div><b>{m.id}</b>・{m.subject}<p className="text-sm text-gray-700">{m.body}</p></div>
          <Choices columns={3} value={k[m.id]} onChange={v => setK(p => ({ ...p, [m.id]: v }))} options={KIND} label={`${m.id} 類型`} />
        </div>
      ))}
      <Btn onClick={submit} disabled={Object.keys(k).length < 5}>產出待辦表</Btn>
    </div>
  );
}

// AI 第一版待辦表：一筆期限過時、一筆負責人被猜測
const DRAFT = [
  { task: '場地合約簽回', owner: '陳怡君', due: '10/16', source: 'M01' },
  { task: '新品文宣初稿', owner: '張志明', due: '10/20', source: 'M03' },
  { task: '客戶報價單', owner: '陳怡君', due: '10/21', source: 'M05' },
];

function Fix({ api }) {
  const [due, setDue] = useState('10/20');
  const [owner, setOwner] = useState('陳怡君');
  const [peek, setPeek] = useState(false);
  const submit = () => {
    const table = DRAFT.map((r, i) => i === 1 ? { ...r, due, source: due === '10/17' ? 'M03、M04' : r.source } : i === 2 ? { ...r, owner } : r);
    api.submit([
      crit('due', '期限依最新更正信', 10, due === '10/17', due === '10/17' ? 'M04 更正期限提前到 10/17。' : '看 M04：更正後的期限是 10/17。'),
      crit('owner', '未知負責人不猜測', 10, owner === '待確認', owner === '待確認' ? 'M05 沒寫負責人，標待確認。' : 'M05 沒有寫負責人，AI 填的人名是猜的。'),
    ], { todoTable: table });
  };
  return (
    <div className="space-y-4">
      <DataTable
        columns={[
          { key: 'task', label: '事項' },
          { key: 'owner', label: '負責人', render: (r, i) => i === 2 ? <Select label="負責人" value={owner} onChange={setOwner} options={['陳怡君', '張志明', '待確認']} /> : r.owner },
          { key: 'due', label: '期限', render: (r, i) => i === 1 ? <Select label="期限" value={due} onChange={setDue} options={['10/17', '10/20', '10/21']} /> : r.due },
          { key: 'source', label: '來源' },
        ]}
        rows={DRAFT}
      />
      <Btn variant="secondary" onClick={() => setPeek(v => !v)}>{peek ? '收起原信' : '📨 查看原信'}</Btn>
      {peek && <MailList list={EMAILS_A.list} />}
      <Btn onClick={submit}>確認修正</Btn>
    </div>
  );
}

function Save({ api }) {
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState([]);
  const table = api.artifacts.todoTable ?? TODO_A_ANSWER;
  const submit = () => api.submit([
    crit('source', '每列都能回查來源', 5, checked, '每列都有信件 ID。'),
    crit('table', '保存待辦表', 5, saved.includes('table'), '待辦表是下一關週報的來源。'),
    crit('prompt', '保存整理要求', 5, saved.includes('prompt'), '整理要求下次換信件就能再用。'),
  ], { l2Saved: true, promptLibrary: [...(api.artifacts.promptLibrary ?? []).filter(e => e.level !== 2), { level: 2, name: '信件整理成待辦表', prompt: '請把附件信件整理成待辦表，欄位為事項、負責人、期限與信件 ID。期限以後續更正信為準；原信沒有交代的內容寫待確認。本次只整理，不寄出或刪除信件。', replace: '附件信件' }] });
  return (
    <div className="space-y-4">
      <DataTable columns={[{ key: 'task', label: '事項' }, { key: 'owner', label: '負責人' }, { key: 'due', label: '期限' }, { key: 'source', label: '來源' }]}
        rows={table} highlight={checked ? Object.fromEntries(table.map((_, i) => [`${i}:source`, 'bg-emerald-100 font-bold'])) : {}} />
      <Btn variant="secondary" onClick={() => setChecked(true)}>{checked ? '✓ 來源欄已檢查' : '檢查來源欄'}</Btn>
      <Field label="要保存哪些？（可複選）">
        <Choices multi columns={2} value={saved} onChange={setSaved} label="保存" options={[{ id: 'table', label: '待辦表' }, { id: 'prompt', label: '整理要求' }]} />
      </Field>
      <Btn onClick={submit}>保存</Btn>
    </div>
  );
}

function Result({ progress }) {
  return (
    <Box title="待辦看板">
      <DataTable columns={[{ key: 'task', label: '事項' }, { key: 'owner', label: '負責人' }, { key: 'due', label: '期限' }, { key: 'source', label: '來源' }]}
        rows={progress.artifacts.todoTable ?? TODO_A_ANSWER} />
    </Box>
  );
}

export { MailList };
export default { steps: [Entry, Load, Columns, Classify, Fix, Save], materials: [EMAILS_A], Result };
