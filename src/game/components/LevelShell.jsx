import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { findLine, IDLE_HINT_MS } from '../data/dialogues.js';
import { PASS_SCORE } from '../data/levels.js';
import { applyAttempt, levelScore, levelPassed, stepScore } from '../engine/scoring.js';
import { Avatar, CharacterBubble } from './Character.jsx';
import ScreenPanel from './ScreenPanel.jsx';
import EvidencePanel, { STATUS_LABEL } from './EvidencePanel.jsx';
import { Btn, PracticeTag, DownloadLink, Box } from './ui.jsx';
import { CHARACTERS } from '../data/characters.js';

function useMediaQuery(q) {
  const [m, setM] = useState(() => window.matchMedia?.(q).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const h = e => setM(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [q]);
  return m;
}

export default function LevelShell({ level, module, progress, update, onExit, onNext }) {
  const lv = progress.levels[level.id] ?? { id: level.id, current: 0, steps: {}, hints: {} };
  const current = Math.min(lv.current ?? 0, 5);
  const [view, setView] = useState(lv.steps?.[5]?.attempts ? 'deliver' : 'step');
  const [feedback, setFeedback] = useState(null);
  // 進關：委託人物先提出任務；續玩時由引導人物說明目前步驟。已看過的內容預設收合
  const [bubble, setBubble] = useState(() => {
    if (current === 0 && !lv.steps?.[0]?.attempts) {
      const enter = findLine(level.id, null, 'enter');
      return { ...enter, next: findLine(level.id, 0, 'concept') };
    }
    return findLine(level.id, current, 'concept');
  });
  const [collapsed, setCollapsed] = useState(() => progress.seenDialogues.includes(bubble?.id));
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef(null);
  const wide = useMediaQuery('(min-width: 1280px)');
  const step = level.steps[current];
  const stepState = lv.steps?.[current] ?? {};
  const StepComp = module.steps[current];

  const patchLevel = useCallback((fn) => update(p => {
    const prev = p.levels[level.id] ?? { id: level.id, current: 0, steps: {}, hints: {} };
    return { ...p, lastLevel: level.id, levels: { ...p.levels, [level.id]: fn(prev) } };
  }), [update, level.id]);

  const show = (line, opts = {}) => {
    if (!line) return;
    setBubble(line);
    setCollapsed(Boolean(opts.respectSeen && progress.seenDialogues.includes(line.id)));
  };

  // 記錄已看過的對話（重播不計分，也不影響進度）
  const bubbleId = bubble?.id;
  useEffect(() => {
    if (bubbleId) update(p => p.seenDialogues.includes(bubbleId) ? p : { ...p, seenDialogues: [...p.seenDialogues, bubbleId] });
  }, [bubbleId, update]);

  // 停留約二十秒：出現可點選的小提示，不強制開啟整段對話
  useEffect(() => {
    const arm = () => { clearTimeout(idleTimer.current); idleTimer.current = setTimeout(() => setIdle(true), IDLE_HINT_MS); };
    const h = () => { setIdle(false); arm(); };
    arm();
    window.addEventListener('keydown', h);
    window.addEventListener('pointerdown', h);
    return () => { clearTimeout(idleTimer.current); window.removeEventListener('keydown', h); window.removeEventListener('pointerdown', h); };
  }, [current]);

  const goStep = (i) => {
    patchLevel(prev => ({ ...prev, current: i }));
    setFeedback(null);
    setView('step');
    show(findLine(level.id, i, 'concept'), { respectSeen: true });
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const askHint = () => {
    const used = lv.hints?.[current] ?? 0;
    const levelNo = Math.min(2, used + 1);
    patchLevel(prev => ({ ...prev, hints: { ...prev.hints, [current]: used + 1 } }));
    show(findLine(level.id, current, 'hint', levelNo));
    setIdle(false);
  };

  const submit = (criteria, artifactsPatch) => {
    const r = applyAttempt(stepState, criteria, step.max);
    update(p => {
      const prev = p.levels[level.id] ?? { id: level.id, current: 0, steps: {}, hints: {} };
      return {
        ...p,
        lastLevel: level.id,
        artifacts: artifactsPatch ? { ...p.artifacts, ...artifactsPatch } : p.artifacts,
        levels: { ...p.levels, [level.id]: { ...prev, steps: { ...prev.steps, [current]: r.state } } },
      };
    });
    const allOk = criteria.every(c => c.earned === c.max);
    setFeedback({ criteria, gained: r.gained, score: r.score, allOk, repeat: (stepState.attempts ?? 0) > 0 });
    show(findLine(level.id, current, allOk ? 'correct' : 'wrong'));
    return r;
  };

  const score = levelScore({ ...lv, id: level.id });
  const passed = levelPassed({ ...lv, id: level.id });
  const api = {
    level, step, stepState, profile: progress.profile, artifacts: progress.artifacts, submit,
    setArtifacts: patch => update(p => ({ ...p, artifacts: { ...p.artifacts, ...patch } })),
    setProfile: patch => update(p => ({ ...p, profile: { ...p.profile, ...patch } })),
  };

  const finishLevel = () => {
    setView('deliver');
    show(findLine(level.id, null, 'deliver'));
  };

  const stuckLine = useMemo(() => findLine(level.id, null, 'stuck'), [level.id]);

  const guide = (
    <div className="flex flex-col items-end gap-2">
      {idle && view === 'step' && (
        <button type="button" onClick={askHint} className="bg-cyan-600 text-white font-bold px-4 py-2 rounded-full shadow-lg animate-bounce focus-visible:ring-4 focus-visible:ring-cyan-300">
          💡 需要提示嗎？
        </button>
      )}
      {view === 'step' && !idle && (
        <button type="button" onClick={askHint} className="bg-white border-2 border-cyan-500 text-cyan-700 font-bold px-3 py-1.5 rounded-full shadow focus-visible:ring-4 focus-visible:ring-cyan-300">
          💡 我需要提示{lv.hints?.[current] ? `（已用 ${lv.hints[current]} 次）` : ''}
        </button>
      )}
      <CharacterBubble
        line={bubble}
        collapsed={collapsed}
        onExpand={() => setCollapsed(false)}
        onStart={bubble?.next ? () => show(bubble.next) : (bubble?.trigger === 'enter' || bubble?.trigger === 'concept' ? () => setCollapsed(true) : null)}
        onReplay={() => { setCollapsed(false); setBubble(b => b && { ...b, key: Date.now() }); }}
        onClose={() => setCollapsed(true)}
      />
      {!bubble && <button type="button" onClick={() => show(stuckLine)} className="text-sm underline">叫出引導</button>}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b-2 border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Btn variant="ghost" onClick={onExit}>← 回工作室</Btn>
          <div>
            <div className="text-sm font-bold text-indigo-600">第 {level.id} 關・{level.gameName}</div>
            <h1 className="text-2xl font-black">{level.title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-600">建議 {level.minutes} 分鐘・不設倒數</span>
            <span className={`text-xl font-black ${passed ? 'text-emerald-600' : 'text-gray-900'}`}>{score} / 100 分</span>
          </div>
        </div>
      </header>

      <div className={`max-w-[1600px] mx-auto px-4 py-5 grid gap-5 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_340px] ${wide ? '' : 'pb-72'}`}>
        <aside className="space-y-4">
          <Box tone="amber">
            <div className="flex items-start gap-3">
              <Avatar characterId="client" expression="explain" size={52} />
              <div>
                <div className="text-xs font-bold text-amber-800">{CHARACTERS.client.role}・{CHARACTERS.client.name}交辦</div>
                <p className="font-black text-lg leading-snug">「{level.request}」</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">{level.goal}</p>
          </Box>

          <nav aria-label="關卡步驟">
            <ol className="space-y-1.5">
              {level.steps.map((s, i) => {
                const st = lv.steps?.[i];
                const got = stepScore(st?.criteria, s.max);
                const active = view === 'step' && i === current;
                return (
                  <li key={s.id}>
                    <button type="button" onClick={() => goStep(i)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl border-2 focus-visible:ring-4 focus-visible:ring-indigo-300 ${active ? 'border-indigo-600 bg-indigo-50' : 'border-transparent hover:bg-gray-50'}`}>
                      <span className={`w-7 h-7 shrink-0 rounded-full grid place-items-center text-sm font-black ${st?.complete ? 'bg-emerald-600 text-white' : st?.attempts ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-700'}`}>{st?.complete ? '✓' : i + 1}</span>
                      <span className="flex-1 text-sm font-bold leading-tight">{s.title}</span>
                      <span className="text-xs font-black text-gray-600 whitespace-nowrap">{st?.attempts ? `${got}/` : '可得 '}{s.max}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <Btn variant={view === 'deliver' ? 'primary' : 'secondary'} className="w-full" onClick={() => setView('deliver')}>交件與真實驗證</Btn>

          {module.materials?.length > 0 && (
            <Box title="本關教學資料">
              <ul className="space-y-1 text-sm">
                {module.materials.map(m => <li key={m.href}><DownloadLink href={m.href}>{m.file}</DownloadLink></li>)}
              </ul>
            </Box>
          )}
        </aside>

        <main className="space-y-4 min-w-0">
          {view === 'step' ? (
            <>
              <div>
                <div className="text-sm font-bold text-gray-500">步驟 {current + 1} / 6・可得 {step.max} 分</div>
                <h2 className="text-2xl font-black">{step.title}</h2>
                <p className="text-lg text-gray-800 mt-1">{step.instruction}</p>
              </div>

              <ScreenPanel level={level.id} kind={step.screen} profile={progress.profile}
                onPlatform={pf => api.setProfile({ platform: pf })} />

              <section className="border-2 border-dashed border-indigo-300 rounded-2xl p-4 bg-indigo-50/30" aria-label="練習區">
                <div className="flex items-center gap-2 mb-3"><PracticeTag /><span className="text-sm text-gray-600">遊戲內練習，操作與真實工具相同順序</span></div>
                <StepComp key={`${level.id}-${current}`} api={api} />
              </section>

              {feedback && <Feedback fb={feedback} />}

              <div className="flex flex-wrap gap-3 justify-between">
                <Btn variant="secondary" onClick={() => goStep(Math.max(0, current - 1))} disabled={current === 0}>← 上一步</Btn>
                {current < 5
                  ? <Btn onClick={() => goStep(current + 1)} disabled={!stepState.attempts}>下一步 →</Btn>
                  : <Btn variant="success" onClick={finishLevel} disabled={!stepState.attempts}>交件 →</Btn>}
              </div>
            </>
          ) : (
            <Deliver level={level} lv={lv} score={score} passed={passed} module={module} progress={progress} update={update}
              onNext={onNext} goStep={goStep} />
          )}
        </main>
        {wide && <aside aria-label="人物引導"><div className="sticky top-24">{guide}</div></aside>}
      </div>

      {!wide && <div className="fixed bottom-4 right-4 left-4 z-40 flex justify-end pointer-events-none"><div className="pointer-events-auto">{guide}</div></div>}
    </div>
  );
}

function Feedback({ fb }) {
  return (
    <section aria-live="polite" className={`border-2 rounded-2xl p-4 ${fb.allOk ? 'border-emerald-400 bg-emerald-50' : 'border-amber-400 bg-amber-50'}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-2xl font-black ${fb.gained > 0 ? 'text-emerald-700' : 'text-gray-600'}`}>+{fb.gained} 分</span>
        <span className="font-bold">本步 {fb.score} 分{fb.repeat && fb.gained === 0 ? '（重做不重複加分）' : ''}</span>
      </div>
      <ul className="space-y-1">
        {fb.criteria.map(c => (
          <li key={c.key} className={c.earned === c.max ? 'text-emerald-800' : 'text-rose-700'}>
            <span className="font-bold">{c.earned === c.max ? '✓' : '✗'} {c.label}（{c.earned}/{c.max}）</span>
            {c.reason && <span className="block text-sm ml-5">{c.reason}</span>}
          </li>
        ))}
      </ul>
      {!fb.allOk && <p className="text-sm font-bold mt-2">可以在這一步重試補分，提示不扣分。</p>}
    </section>
  );
}

function Deliver({ level, lv, score, passed, module, progress, update, onNext, goStep }) {
  const ev = progress.evidence[level.id];
  const Result = module.Result;
  const firstIncomplete = level.steps.findIndex(s => !lv.steps?.[s.index]?.complete);
  return (
    <div className="space-y-4">
      <Box tone={passed ? 'green' : 'amber'}>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar characterId="client" expression={passed ? 'success' : 'remind'} size={72} />
          <div className="flex-1">
            <h2 className="text-2xl font-black">{passed ? '交件完成！' : '還差一點就能過關'}</h2>
            <p className="text-lg">本關 {score} / 100 分（過關需 {PASS_SCORE} 分，並完成資料與成果檢查）</p>
            <p className="text-sm text-gray-700 mt-1">過關成果：{level.deliverable}</p>
            <p className="text-sm font-bold mt-1">真實工具驗證：{STATUS_LABEL[ev?.status ?? 'none']}</p>
          </div>
          <div className="flex flex-col gap-2">
            {firstIncomplete >= 0 && <Btn variant="secondary" onClick={() => goStep(firstIncomplete)}>回到步驟 {firstIncomplete + 1} 補分</Btn>}
            {passed && onNext && <Btn variant="success" onClick={onNext}>前往下一站 →</Btn>}
          </div>
        </div>
      </Box>
      {Result && <Result progress={progress} />}
      <EvidencePanel level={level.id} profile={progress.profile} evidence={ev} mode={progress.artifacts.final?.mode}
        onSave={data => update(p => ({ ...p, evidence: { ...p.evidence, [level.id]: data } }))} />
    </div>
  );
}
