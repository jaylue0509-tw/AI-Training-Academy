import React, { useState } from 'react';
import { SKILL, WEEK1, computeMetrics, PROJECT_A } from '../data/materials.js';
import { TOOLS } from '../data/tools.js';
import { crit } from '../engine/scoring.js';
import { nextWeeklyRun, formatInTaipei, DAY_NAMES } from '../engine/checkers.js';
import { Btn, Choices, Field, Box, Select, inputCls } from '../components/ui.jsx';
import { EntryPick } from './Level2.jsx';
import { WeeklyReport } from './Level3.jsx';

const CORRECT = { freq: 'weekly', weekday: '5', time: '17:00', tz: 'Asia/Taipei' };

function Entry({ api }) {
  return <EntryPick api={api} levelNo={5} question="定期工作，要用哪個入口設排程？"
    okReason="這個入口有排程功能。" badReason="聊天入口不能定時；ChatGPT 用 Work、Claude 用 Cowork、Gemini 用 Tasks。" />;
}

function Source({ api }) {
  const [a, setA] = useState({});
  const set = (k, x) => setA(p => ({ ...p, [k]: x }));
  const submit = () => api.submit([
    crit('src', '排程時仍能存取的來源', 5, a.src === 'cloud', a.src === 'local' ? '本機檔案要電腦開機上線才讀得到。' : a.src === 'paste' ? '聊天中暫貼的文字，排程執行時拿不到。' : '雲端教學資料夾排程時也能存取。'),
    crit('period', '收集期間', 5, a.period === 'week', '每週整理一次，就收集當週週一到週五。'),
    crit('out', '輸出位置', 5, a.out === 'folder', a.out === 'all' ? '寄給全公司是外部動作，第一版不做。' : '存到指定資料夾，方便查看。'),
  ], { schedule: { ...api.artifacts.schedule, source: a.src, out: a.out } });
  return (
    <div className="space-y-4">
      <Field label="資料來源"><Choices value={a.src} onChange={x => set('src', x)} label="來源" options={[
        { id: 'cloud', label: '雲端「教學資料夾」（排程時可存取）' },
        { id: 'local', label: '我的電腦桌面暫存檔' },
        { id: 'paste', label: '在聊天中暫貼的文字' },
      ]} /></Field>
      <Field label="收集期間"><Choices columns={3} value={a.period} onChange={x => set('period', x)} label="期間" options={[
        { id: 'week', label: '當週週一至週五' }, { id: 'all', label: '全部歷史資料' }, { id: 'day', label: '只有當天' },
      ]} /></Field>
      <Field label="輸出位置"><Choices value={a.out} onChange={x => set('out', x)} label="輸出" options={[
        { id: 'folder', label: '存到「週報」資料夾' }, { id: 'all', label: '直接寄給全公司' },
      ]} /></Field>
      <Btn onClick={submit} disabled={Object.keys(a).length < 3}>確定</Btn>
    </div>
  );
}

function Time({ api }) {
  const [now] = useState(() => Date.now());
  const [c, setC] = useState({ freq: 'daily', weekday: '1', time: '09:00', tz: 'UTC', ...api.artifacts.schedule?.cfg });
  const set = (k, x) => setC(p => ({ ...p, [k]: x }));
  const [h, m] = c.time.split(':').map(Number);
  const next = c.freq === 'weekly' ? formatInTaipei(nextWeeklyRun(now, { weekday: Number(c.weekday), hour: h, minute: m, tz: c.tz })) : '（請選每週）';
  const freqOk = c.freq === 'weekly' && c.weekday === CORRECT.weekday;
  const submit = () => api.submit([
    crit('freq', '頻率：每週五', 7, freqOk, freqOk ? '' : '交辦是「每週五」。'),
    crit('time', '時間：17:00', 7, c.time === CORRECT.time, ''),
    crit('tz', '時區：台北', 6, c.tz === CORRECT.tz, c.tz === CORRECT.tz ? '' : `選 ${c.tz} 時，台北時間會變成 ${next}。`),
  ], { schedule: { ...api.artifacts.schedule, cfg: c } });
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-4 gap-3">
        <Field label="頻率"><Select label="頻率" value={c.freq} onChange={x => set('freq', x)} options={[{ id: 'daily', label: '每天' }, { id: 'weekly', label: '每週' }, { id: 'monthly', label: '每月' }]} /></Field>
        <Field label="星期"><Select label="星期" value={c.weekday} onChange={x => set('weekday', x)} options={DAY_NAMES.map((d, i) => ({ id: String(i), label: d }))} /></Field>
        <Field label="時間"><input type="time" className={inputCls} value={c.time} onChange={e => set('time', e.target.value)} aria-label="時間" /></Field>
        <Field label="時區"><Select label="時區" value={c.tz} onChange={x => set('tz', x)} options={[{ id: 'Asia/Taipei', label: '台北（UTC+8）' }, { id: 'UTC', label: 'UTC' }, { id: 'America/Los_Angeles', label: '洛杉磯' }]} /></Field>
      </div>
      <Box tone={freqOk && c.time === CORRECT.time && c.tz === CORRECT.tz ? 'green' : 'red'} title="預覽：下次執行時間">
        <p className="text-lg font-bold">{next}</p>
      </Box>
      <Btn onClick={submit}>套用設定</Btn>
    </div>
  );
}

function Test({ api }) {
  const [state, setState] = useState(api.stepState.complete ? 3 : 0);
  const [skillPath, setSkillPath] = useState(api.artifacts.schedule?.skillPath ?? null);
  const go = n => {
    setState(n);
    if (n === 3) api.submit([
      crit('create', '建立排程任務', 7, true),
      crit('run', '立即試跑一次', 7, true),
      crit('open', '打開試跑結果', 6, true, '有可開啟的試跑結果，才知道排程真的會做對。'),
    ], { schedule: { ...api.artifacts.schedule, skillPath, tested: true } });
  };
  return (
    <div className="space-y-4">
      <Field label={`${TOOLS[api.profile.tool ?? 'claude'].name} 的排程畫面中，能不能直接指定 Skill？（依真實畫面選）`}>
        <Choices value={skillPath} onChange={setSkillPath} label="Skill 路徑" options={[
          { id: 'skill', label: `可以：排程中指定「${SKILL.short}」` },
          { id: 'prompt', label: '不行：改用已驗證的同等工作要求（這條路徑沒有直接呼叫 Skill）' },
        ]} />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Btn variant={state >= 1 ? 'success' : 'primary'} disabled={state !== 0 || !skillPath} onClick={() => go(1)}>{state >= 1 ? '✓ ' : ''}建立任務</Btn>
        <Btn variant={state >= 2 ? 'success' : 'primary'} disabled={state !== 1} onClick={() => go(2)}>{state >= 2 ? '✓ ' : ''}立即試跑</Btn>
        <Btn variant={state >= 3 ? 'success' : 'primary'} disabled={state !== 2} onClick={() => go(3)}>{state >= 3 ? '✓ ' : ''}打開試跑結果</Btn>
      </div>
      {state >= 3 && (
        <WeeklyReport project={PROJECT_A} period={WEEK1.period} m={computeMetrics(WEEK1.rows)} pending={['客戶報價單負責人待確認']} next={['10/17 前交文宣初稿']} sources={['教學資料夾']} fileName="試跑結果_週報.docx" />
      )}
    </div>
  );
}

function Check({ api }) {
  const cfg = api.artifacts.schedule?.cfg ?? CORRECT;
  const [h, m] = (cfg.time ?? '17:00').split(':').map(Number);
  const [now] = useState(() => Date.now());
  const right = formatInTaipei(nextWeeklyRun(now, { weekday: 5, hour: 17, tz: 'Asia/Taipei' }));
  const wrong1 = formatInTaipei(nextWeeklyRun(now, { weekday: 5, hour: 17, tz: 'UTC' }));
  const wrong2 = formatInTaipei(nextWeeklyRun(now, { weekday: 5, hour: 9, tz: 'Asia/Taipei' }));
  const configured = cfg.freq === 'weekly' ? formatInTaipei(nextWeeklyRun(now, { weekday: Number(cfg.weekday), hour: h, minute: m, tz: cfg.tz })) : '（未設每週）';
  const [a, setA] = useState({});
  const set = (k, x) => setA(p => ({ ...p, [k]: x }));
  const opts = [right, wrong1, wrong2].sort();
  const submit = () => api.submit([
    crit('next', '下次執行時間正確', 7, a.next === right && configured === right, configured !== right ? `你的設定算出 ${configured}，請回上一步修正。` : '週五 17:00 台北時間。'),
    crit('content', '試跑內容符合格式', 7, a.content === 'ok', '四段格式、數字對得上。'),
    crit('cond', '知道執行條件', 6, a.cond === 'off', '本機來源需要電腦開機上線；雲端來源不受影響。'),
  ], { schedule: { ...api.artifacts.schedule, next: configured } });
  return (
    <div className="space-y-4">
      <Box title="你的排程">目前設定的下次執行時間：<b>{configured}</b></Box>
      <Field label="正確的下次執行時間應該是？"><Choices value={a.next} onChange={x => set('next', x)} options={opts.map(o => ({ id: o, label: o }))} label="下次時間" /></Field>
      <Field label="試跑結果的內容？"><Choices value={a.content} onChange={x => set('content', x)} label="內容" options={[{ id: 'ok', label: '四段齊全，完成 8、未完成 3、金額 42,700' }, { id: 'bad', label: '只有一句「已完成」' }]} /></Field>
      <Field label="如果來源放在你的電腦裡，排程時電腦關機會怎樣？"><Choices value={a.cond} onChange={x => set('cond', x)} label="執行條件" options={[{ id: 'off', label: '讀不到資料，這次可能無法執行' }, { id: 'fine', label: '沒影響，照樣執行' }]} /></Field>
      <p className="text-sm text-gray-600">本關「自動化」是到指定時間執行，和「收到新信就立即觸發」不同。</p>
      <Btn onClick={submit} disabled={Object.keys(a).length < 3}>核對完成</Btn>
    </div>
  );
}

function Pause({ api }) {
  const [saved, setSaved] = useState(false);
  const [found, setFound] = useState(null);
  const [paused, setPaused] = useState(api.artifacts.schedule?.paused ?? false);
  const submit = () => api.submit([
    crit('save', '保存排程', 5, saved),
    crit('find', '找到管理位置', 5, found === 'list', '排程列表就是管理位置。'),
    crit('pause', '示範暫停', 5, paused, '狀態變成「已暫停」。'),
  ], { schedule: { ...api.artifacts.schedule, saved, paused } });
  return (
    <div className="space-y-4">
      <Btn variant={saved ? 'success' : 'primary'} onClick={() => setSaved(true)}>{saved ? '✓ 已保存' : '保存排程'}</Btn>
      <Field label="之後要修改或暫停，要去哪裡？"><Choices value={found} onChange={setFound} label="管理位置" options={[{ id: 'list', label: '排程（或任務）列表' }, { id: 'chat', label: '重新開一個聊天' }, { id: 'none', label: '設好就改不了' }]} /></Field>
      {found === 'list' && (
        <Box title="排程列表">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold">每週五 17:00 週報摘要</span>
            <span className={`text-sm font-bold px-2 py-0.5 rounded ${paused ? 'bg-gray-300' : 'bg-emerald-600 text-white'}`}>{paused ? '已暫停' : '啟用中'}</span>
            <Btn variant="secondary" onClick={() => setPaused(p => !p)}>{paused ? '恢復' : '暫停'}</Btn>
          </div>
        </Box>
      )}
      <Btn onClick={submit}>完成</Btn>
    </div>
  );
}

function Result({ progress }) {
  const s = progress.artifacts.schedule;
  return (
    <Box title="自動化控制台">
      <p>下次執行：<b>{s?.next ?? '—'}</b> 狀態：{s?.paused ? '已暫停' : s?.saved ? '啟用中' : '未保存'}</p>
      <p className="text-sm text-gray-600">{s?.skillPath === 'skill' ? `排程指定 ${SKILL.short}` : s?.skillPath === 'prompt' ? '排程使用同等工作要求（未直接呼叫 Skill）' : ''}</p>
      <p className="text-sm text-gray-600">真實自動化須有實際設定、試跑紀錄及下次執行時間，請在下方提交。</p>
    </Box>
  );
}

export default { steps: [Entry, Source, Time, Test, Check, Pause], materials: [WEEK1], Result };
