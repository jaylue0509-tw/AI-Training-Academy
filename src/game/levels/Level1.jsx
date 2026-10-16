import React, { useState } from 'react';
import { TOOLS, TOOL_IDS, PLATFORMS, isEntryOk } from '../data/tools.js';
import { WORK_LOG } from '../data/materials.js';
import { crit } from '../engine/scoring.js';
import { Btn, Choices, Field, inputCls, Box, Doc } from '../components/ui.jsx';

export function ToolCards({ value, onChange }) {
  return (
    <div className="grid sm:grid-cols-3 gap-3" role="radiogroup" aria-label="選擇主要工具">
      {TOOL_IDS.map(id => {
        const t = TOOLS[id];
        const on = value === id;
        return (
          <button key={id} type="button" role="radio" aria-checked={on} onClick={() => onChange(id)}
            className={`text-left rounded-2xl border-2 p-4 focus-visible:ring-4 focus-visible:ring-indigo-300 ${on ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'}`}>
            <div className="text-xl font-black">{t.name}</div>
            <ul className="mt-2 space-y-1 text-sm">
              {t.entries.map(e => <li key={e.id}><span className="font-bold">{e.name}</span>：{e.use}</li>)}
            </ul>
          </button>
        );
      })}
    </div>
  );
}

function PickTool({ api }) {
  const [tool, setTool] = useState(api.profile.tool);
  const [platform, setPlatform] = useState(api.profile.platform ?? 'web');
  const [os, setOs] = useState(api.profile.os ?? 'Windows');
  const [entry, setEntry] = useState(null);
  const submit = () => {
    api.setProfile({ tool, platform, os });
    api.submit([
      crit('tool', '選定主要產品與版本', 5, tool && platform, '之後五關都用這套工具操作；隨時可在畫面上方切換網頁或桌面教學。'),
      crit('entry', '找到第一次任務的開始位置', 5, isEntryOk(1, tool, entry), isEntryOk(1, tool, entry) ? '第一次交代需求，從 Chat 開始最直接。' : '第一次交代需求，請從 Chat 開始；其他入口後面幾關會用到。'),
    ]);
  };
  return (
    <div className="space-y-4">
      <ToolCards value={tool} onChange={t => { setTool(t); setEntry(null); }} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="網頁或桌面">
          <Choices columns={2} value={platform} onChange={setPlatform} options={Object.values(PLATFORMS).map(p => ({ id: p.id, label: p.name }))} label="網頁或桌面" />
        </Field>
        <Field label="電腦系統">
          <Choices columns={2} value={os} onChange={setOs} options={[{ id: 'Windows', label: 'Windows' }, { id: 'Mac', label: 'Mac' }]} label="電腦系統" />
        </Field>
      </div>
      {tool && (
        <Field label={`第一次任務，要從 ${TOOLS[tool].name} 的哪個入口開始？`}>
          <Choices columns={3} value={entry} onChange={setEntry} options={TOOLS[tool].entries.map(e => ({ id: e.id, label: e.name, desc: e.use }))} label="開始位置" />
        </Field>
      )}
      <Btn onClick={submit} disabled={!tool || !entry}>確認選擇</Btn>
    </div>
  );
}

const FILES = [
  { id: 'log', label: WORK_LOG.file, desc: '本週五項工作紀錄' },
  { id: 'photo', label: '去年尾牙照片.jpg', desc: '活動照片' },
  { id: 'pay', label: '個人薪資單_10月.pdf', desc: '個人敏感資料' },
];

function AddData({ api }) {
  const [file, setFile] = useState(null);
  const [sign, setSign] = useState(null);
  const submit = () => api.submit([
    crit('file', '加入正確檔案', 10, file === 'log', file === 'pay' ? '薪資單是個人敏感資料，與任務無關，不要上傳。' : file === 'photo' ? '照片與這次整理工作紀錄的任務無關。' : '工作紀錄就是這次要整理的資料。'),
    crit('received', '確認 AI 有收到', 5, sign === 'reply', sign === 'reply' ? 'AI 回覆提到檔名或內容，才確定讀到了。' : '進度條跑完不代表讀到內容；請 AI 先說出檔名或第一項內容。'),
  ]);
  return (
    <div className="space-y-4">
      <Field label="新對話中，按「加入檔案」後要選哪一份？">
        <Choices value={file} onChange={setFile} options={FILES} label="選擇檔案" />
      </Field>
      {file === 'log' && (
        <Box title={`📎 ${WORK_LOG.file}`}>
          <ol className="list-decimal ml-5 space-y-0.5">{WORK_LOG.items.map(i => <li key={i.id}>{i.text}</li>)}</ol>
        </Box>
      )}
      <Field label="怎麼確認 AI 真的收到檔案？">
        <Choices value={sign} onChange={setSign} label="確認方式" options={[
          { id: 'bar', label: '看到上傳進度條跑完就好' },
          { id: 'reply', label: '請 AI 先回覆檔名與第一項內容，對得上才算收到' },
          { id: 'none', label: '不用確認，直接送出' },
        ]} />
      </Field>
      <Btn onClick={submit} disabled={!file || !sign}>確認</Btn>
    </div>
  );
}

const SLOTS = [
  { key: 'goal', label: '目標', ok: 'g1', options: [
    { id: 'g1', label: '整理成給主管看的三點摘要' }, { id: 'g2', label: '幫我整理一下' }, { id: 'g3', label: '寫得專業一點' }] },
  { key: 'source', label: '資料依據', ok: 's1', options: [
    { id: 's1', label: '依附件的五項工作紀錄' }, { id: 's2', label: '依你知道的資訊' }, { id: 's3', label: '上網找相關資料補充' }] },
  { key: 'format', label: '輸出格式', ok: 'f1', options: [
    { id: 'f1', label: '三點，每點不超過五十字' }, { id: 'f2', label: '越詳細越好' }, { id: 'f3', label: '格式不限' }] },
  { key: 'limit', label: '限制', ok: 'l1', options: [
    { id: 'l1', label: '沒有完成的事情標為進行中，不補寫成果' }, { id: 'l2', label: '可以自行補充成果讓內容好看' }, { id: 'l3', label: '不需要限制' }] },
];

const REASONS = {
  goal: '目標要說清楚給誰看、交出什麼。', source: '要指定看附件，AI 才不會自己補資料。',
  format: '格式要具體，例如幾點、每點多長。', limit: '限制讓 AI 不把進行中的事寫成完成。',
};

export const EXAMPLE_PROMPT = '請依附件的五項工作紀錄，整理成給主管看的三點摘要。每點不超過五十字；沒有完成的事情標為進行中，不補寫成果。';

function Compose({ api }) {
  const [pick, setPick] = useState({});
  const [typed, setTyped] = useState(api.artifacts.l1Prompt ?? '');
  const assembled = SLOTS.map(s => s.options.find(o => o.id === pick[s.key])?.label).filter(Boolean).join('；');
  const submit = () => api.submit(
    SLOTS.map(s => crit(s.key, s.label, 5, pick[s.key] === s.ok, REASONS[s.key])),
    { l1Prompt: typed },
  );
  return (
    <div className="space-y-4">
      {SLOTS.map(s => (
        <Field key={s.key} label={`${s.label}（5 分）`}>
          <Choices columns={3} value={pick[s.key]} onChange={v => setPick(p => ({ ...p, [s.key]: v }))} options={s.options} label={s.label} />
        </Field>
      ))}
      <Box title="卡片組出的要求" tone="blue"><p>{assembled || '（還沒選卡片）'}</p></Box>
      <Field label="自己輸入一次完整要求（之後可在真實工具中直接貼上）" hint={`參考：${EXAMPLE_PROMPT}`}>
        <textarea className={`${inputCls} h-24`} value={typed} onChange={e => setTyped(e.target.value)} />
      </Field>
      <Btn onClick={submit} disabled={SLOTS.some(s => !pick[s.key]) || typed.trim().length < 15}>組好了，檢查要求</Btn>
    </div>
  );
}

export const L1_DRAFT = [
  '場地合約已確認條款並完成；來賓名單 120 位整理完畢。',
  '文宣初稿已完成，設計同步定稿。',
  '報價單等待成本資料，進行中；直播設備已預約完成。',
];
export const L1_FIXED = [
  '場地合約已確認條款並完成；來賓名單 120 位整理完畢。',
  '文宣初稿：文案完成，設計仍在進行中。',
  '報價單等待成本資料，進行中；直播設備已預約完成。',
];

export function ThreeRunButtons({ labels, done, onStep }) {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((l, i) => (
        <Btn key={l} variant={done > i ? 'success' : 'primary'} disabled={done !== i} onClick={() => onStep(i + 1)}>
          {done > i ? '✓ ' : ''}{l}
        </Btn>
      ))}
    </div>
  );
}

function Send({ api }) {
  const [done, setDone] = useState(api.stepState.complete ? 3 : 0);
  const step = n => {
    setDone(n);
    if (n === 3) api.submit([
      crit('send', '送出要求', 7, true, '要求已送出。'),
      crit('produce', '取得產出', 7, true, 'AI 依附件產出三點摘要。'),
      crit('open', '打開並閱讀結果', 6, true, '結果能閱讀，內容對應任務；下一步檢查細節。'),
    ], { l1Draft: L1_DRAFT });
  };
  return (
    <div className="space-y-4">
      <Box tone="blue"><p className="text-sm text-gray-600">你的要求</p><p>{api.artifacts.l1Prompt || EXAMPLE_PROMPT}</p></Box>
      <ThreeRunButtons labels={['送出', '取得產出', '打開結果']} done={done} onStep={step} />
      {done >= 2 && (
        <Doc title="AI 的第一份結果">
          <ol className="list-decimal ml-5 space-y-1">{L1_DRAFT.map(l => <li key={l}>{l}</li>)}</ol>
        </Doc>
      )}
    </div>
  );
}

const FOLLOWUPS = [
  { id: 'good', label: '第 2 點不對：文宣初稿的設計仍在進行中，請改為「進行中」，不要補寫成果，其他兩點不變。' },
  { id: 'redo', label: '重寫一次。' },
  { id: 'better', label: '寫得更好一點。' },
];

function Refine({ api }) {
  const [line, setLine] = useState(null);
  const [follow, setFollow] = useState(null);
  const [fixed, setFixed] = useState(api.stepState.complete);
  const submit = () => {
    const r = api.submit([
      crit('locate', '找出錯誤的一點', 10, line === 1, line === 1 ? '工作紀錄寫「設計進行中」，AI 卻寫成已完成。' : '對照工作紀錄 W2：文宣是「文案完成，設計進行中」。'),
      crit('ask', '說明要改哪裡並取得修正版', 10, follow === 'good', follow === 'good' ? '指出位置、正確內容與不要改的部分，修正最精準。' : '「重寫」「更好一點」沒說要改哪裡，結果可能更糟。'),
    ], { l1Fixed: L1_FIXED });
    setFixed(r.state.criteria.every(c => c.earned === c.max));
  };
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Box title="原始工作紀錄">
          <ol className="list-decimal ml-5 text-sm space-y-0.5">{WORK_LOG.items.map(i => <li key={i.id}>{i.text}</li>)}</ol>
        </Box>
        <Doc title="AI 結果：點一下有問題的那一點">
          <ol className="space-y-1">
            {L1_DRAFT.map((l, i) => (
              <li key={l}>
                <button type="button" onClick={() => setLine(i)} aria-pressed={line === i}
                  className={`w-full text-left px-2 py-1 rounded-lg border-2 focus-visible:ring-4 focus-visible:ring-indigo-300 ${line === i ? 'border-rose-500 bg-rose-50' : 'border-transparent hover:bg-gray-50'}`}>
                  {i + 1}. {l}
                </button>
              </li>
            ))}
          </ol>
        </Doc>
      </div>
      <Field label="選一句追問">
        <Choices value={follow} onChange={setFollow} options={FOLLOWUPS} label="追問" />
      </Field>
      <Btn onClick={submit} disabled={line === null || !follow}>送出追問</Btn>
      {fixed && (
        <Doc title="修正版摘要">
          <ol className="list-decimal ml-5 space-y-1">{L1_FIXED.map(l => <li key={l}>{l}</li>)}</ol>
        </Doc>
      )}
    </div>
  );
}

function Save({ api }) {
  const [name, setName] = useState(api.artifacts.promptLibrary?.[0]?.name ?? '');
  const [part, setPart] = useState(null);
  const [both, setBoth] = useState([]);
  const submit = () => {
    const entry = { name: name.trim(), prompt: api.artifacts.l1Prompt || EXAMPLE_PROMPT, replace: '附件資料', level: 1 };
    const lib = [entry, ...(api.artifacts.promptLibrary ?? []).filter(e => e.level !== 1)];
    api.submit([
      crit('name', '替指令取一個找得到的名字', 5, name.trim().length >= 2, '例如「主管三點摘要」，下次搜尋得到。'),
      crit('replace', '標出下次要替換的部分', 5, part === 'data', part === 'data' ? '下次只要換附件，其餘規則照用。' : '要換的是附件資料；目標、格式、限制都能沿用。'),
      crit('keep', '保存指令與修正後摘要', 5, both.includes('prompt') && both.includes('result'), '指令和成果都存，下次才能對照。'),
    ], { promptLibrary: lib, l1Saved: true });
  };
  return (
    <div className="space-y-4">
      <Field label="指令名稱"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="例：主管三點摘要" /></Field>
      <Field label="下次換新資料時，要替換哪個部分？">
        <Choices value={part} onChange={setPart} label="替換部分" options={[
          { id: 'data', label: '附件資料（換成新的工作紀錄）' },
          { id: 'format', label: '輸出格式' },
          { id: 'all', label: '整段重寫' },
        ]} />
      </Field>
      <Field label="要保存哪些東西？（可複選）">
        <Choices multi value={both} onChange={setBoth} label="保存項目" options={[
          { id: 'prompt', label: '這次的完整指令' },
          { id: 'result', label: '修正後的摘要' },
          { id: 'draft', label: '有錯的第一版（不必保存）' },
        ]} />
      </Field>
      <Btn onClick={submit} disabled={!part}>保存</Btn>
    </div>
  );
}

function Result({ progress }) {
  const a = progress.artifacts;
  return (
    <Box title="這關的成果">
      <p className="font-bold">指令：</p><p className="mb-2">{a.l1Prompt || EXAMPLE_PROMPT}</p>
      <p className="font-bold">修正後摘要：</p>
      <ol className="list-decimal ml-5">{(a.l1Fixed ?? L1_FIXED).map(l => <li key={l}>{l}</li>)}</ol>
    </Box>
  );
}

export default {
  steps: [PickTool, AddData, Compose, Send, Refine, Save],
  materials: [WORK_LOG],
  Result,
};
