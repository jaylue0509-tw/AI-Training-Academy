import React, { useCallback, useEffect, useState } from 'react';
import { LEVELS, ACHIEVEMENTS, PASS_SCORE, getLevel } from './data/levels.js';
import { SKILL } from './data/materials.js';
import { TOOLS, PLATFORMS } from './data/tools.js';
import { loadProgress, saveProgress, clearProgress, emptyProgress } from './engine/progress.js';
import { levelScore, levelPassed, totalScore, TOTAL_MAX } from './engine/scoring.js';
import LevelShell from './components/LevelShell.jsx';
import StudioMap from './components/StudioMap.jsx';
import { STATUS_LABEL, isVerified } from './components/EvidencePanel.jsx';
import { Avatar } from './components/Character.jsx';
import { Btn, Box, DownloadLink } from './components/ui.jsx';
import Level1 from './levels/Level1.jsx';
import Level2 from './levels/Level2.jsx';
import Level3 from './levels/Level3.jsx';
import Level4 from './levels/Level4.jsx';
import Level5 from './levels/Level5.jsx';
import Level6 from './levels/Level6.jsx';

const MODULES = { 1: Level1, 2: Level2, 3: Level3, 4: Level4, 5: Level5, 6: Level6 };

const parseRoute = () => {
  const m = window.location.hash.match(/^#\/ai-master(?:\/(level|summary)(?:\/(\d))?)?/);
  return { view: m?.[1] ?? 'home', level: m?.[2] ? Number(m[2]) : null };
};

export default function GameApp() {
  const [progress, setProgress] = useState(loadProgress);
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => { saveProgress(progress); }, [progress]);
  useEffect(() => {
    const h = () => setRoute(parseRoute());
    window.addEventListener('hashchange', h);
    document.title = '邁向 AI 大師';
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const update = useCallback(fn => setProgress(p => fn(p)), []);
  const go = path => { window.location.hash = `#/ai-master${path}`; };
  const passed = id => levelPassed({ ...progress.levels[id], id });
  const unlocked = id => id === 1 || passed(id - 1);

  if (route.view === 'level' && getLevel(route.level) && unlocked(route.level)) {
    const level = getLevel(route.level);
    const next = getLevel(level.id + 1);
    return (
      <LevelShell key={level.id} level={level} module={MODULES[level.id]} progress={progress} update={update}
        onExit={() => go('')} onNext={() => go(next ? `/level/${next.id}` : '/summary')} />
    );
  }
  if (route.view === 'summary') return <Summary progress={progress} onBack={() => go('')} />;
  return <Home progress={progress} update={update} go={go} unlocked={unlocked} />;
}

function Home({ progress, update, go, unlocked }) {
  const total = totalScore(progress.levels);
  const started = Object.keys(progress.levels).length > 0;
  const last = progress.lastLevel && unlocked(progress.lastLevel) ? getLevel(progress.lastLevel) : null;
  const allDone = LEVELS.every(l => levelPassed({ ...progress.levels[l.id], id: l.id }));
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">
        <header className="flex flex-wrap items-center gap-4">
          <div>
            <a href="#/" className="text-sm font-bold text-gray-500 hover:text-gray-800">← AI 實戰學院課程</a>
            <h1 className="text-4xl font-black mt-1">邁向 AI 大師</h1>
            <p className="text-lg text-gray-700">六關辦公室任務，邊玩邊學：整理信件、列待辦、做週報、用 Skill、設排程，最後獨立交件。</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-black">{total} <span className="text-lg text-gray-500">/ {TOTAL_MAX}</span></div>
            <div className="text-sm text-gray-600">六關約 100 分鐘・每關 100 分・過關 {PASS_SCORE} 分</div>
          </div>
        </header>

        <Box tone="amber">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar characterId="guide" expression="explain" size={72} />
            <div className="flex-1 min-w-[240px]">
              <p className="text-lg font-bold">「把 AI 當成剛接手的新同事。告訴它要做什麼、看哪些資料、最後交什麼。」</p>
              <p className="text-sm text-gray-700 mt-1">
                主要工具：<b>{TOOLS[progress.profile.tool]?.name ?? '第一關選定'}</b>
                {progress.profile.tool && <>・{PLATFORMS[progress.profile.platform]?.name}・{progress.profile.os}</>}
                 建議電腦上把遊戲與真實工具並排操作。
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {last && started
                ? <Btn onClick={() => go(`/level/${last.id}`)}>繼續上次進度：第 {last.id} 關</Btn>
                : <Btn onClick={() => go('/level/1')}>開始第一關</Btn>}
              {allDone && <Btn variant="success" onClick={() => go('/summary')}>查看結業成果</Btn>}
            </div>
          </div>
        </Box>

        <StudioMap progress={progress} update={update} unlocked={unlocked} onEnter={id => go(`/level/${id}`)} />

        <section className="grid md:grid-cols-2 gap-4">
          <Box title="關卡進度">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500"><th className="py-1">關卡</th><th>分數</th><th>過關</th><th>真實驗證</th></tr></thead>
              <tbody>
                {LEVELS.map(l => {
                  const lv = { ...progress.levels[l.id], id: l.id };
                  return (
                    <tr key={l.id} className="border-t border-gray-100">
                      <td className="py-1.5 font-bold">{l.id}. {l.title}</td>
                      <td>{levelScore(lv)}</td>
                      <td>{levelPassed(lv) ? '✓' : '—'}</td>
                      <td className={isVerified(progress.evidence[l.id]) ? 'text-emerald-700 font-bold' : 'text-gray-500'}>{STATUS_LABEL[progress.evidence[l.id]?.status ?? 'none']}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
          <Box title="成就">
            <Achievements progress={progress} />
            <button type="button" className="text-sm text-gray-500 underline mt-4" onClick={() => {
              if (window.confirm('確定要清除所有進度重新開始？')) { clearProgress(); update(() => emptyProgress()); }
            }}>重置進度</button>
          </Box>
        </section>
      </div>
    </div>
  );
}

function Achievements({ progress }) {
  const v = verifiedStatus(progress);
  return (
    <ul className="space-y-2">
      {ACHIEVEMENTS.map(a => {
        const got = a.levels.every(id => levelPassed({ ...progress.levels[id], id }));
        return (
          <li key={a.id} className={`flex items-center gap-3 ${got ? '' : 'opacity-50'}`}>
            <span className="text-2xl">{got ? '🏅' : '⚪'}</span>
            <span><b>{a.name}</b><span className="block text-sm text-gray-600">{a.desc}</span></span>
          </li>
        );
      })}
      <li className="border-t pt-2 text-sm">
        <div>有效操作：<b className={v.effective ? 'text-emerald-700' : 'text-gray-500'}>{v.effective ? '已達成' : '未驗證'}</b></div>
        <div>自動化完成：<b className={v.automation ? 'text-emerald-700' : 'text-gray-500'}>{v.automation ? '已驗證' : '未驗證'}</b></div>
      </li>
    </ul>
  );
}

// 有效操作：真實工具完成第六關且 ≥80 分，成品與 Skill 使用、重用均有證據
export function verifiedStatus(progress) {
  const l6 = { ...progress.levels[6], id: 6 };
  const effective = levelScore(l6) >= PASS_SCORE && isVerified(progress.evidence[6]) && isVerified(progress.evidence[4]);
  const automation = isVerified(progress.evidence[5]);
  return { effective, automation };
}

function Summary({ progress, onBack }) {
  const tool = progress.profile.tool ?? 'claude';
  const v = verifiedStatus(progress);
  const Final = Level6.Result;
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-[1000px] mx-auto px-4 py-6 space-y-5">
        <Btn variant="ghost" onClick={onBack} className="print:hidden">← 回工作室</Btn>
        <header className="flex items-center gap-4">
          <Avatar characterId="guide" expression="success" size={84} />
          <div>
            <h1 className="text-3xl font-black">結業成果</h1>
            <p className="text-lg">總分 {totalScore(progress.levels)} / {TOTAL_MAX}・有效操作 {v.effective ? '已達成' : '未驗證'}・自動化 {v.automation ? '已驗證' : '未驗證'}</p>
          </div>
        </header>
        <Achievements progress={progress} />

        <h2 className="text-2xl font-black">帶走三件成果</h2>
        <section className="space-y-4">
          <div><h3 className="font-black text-lg mb-2">1. 一份工作成品</h3><Final progress={progress} /></div>
          <Box title="2. 一個可重用 Skill">
            <p>{SKILL.name}：{SKILL.purpose}</p>
            <p className="mt-1"><DownloadLink href={SKILL.packages[tool].href}>{SKILL.packages[tool].file}</DownloadLink>（{TOOLS[tool].name}・{TOOLS[tool].skillPath}）</p>
          </Box>
          <Box title="3. 操作與檢查小卡" tone="blue">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-black">交代需求四件事</h4>
                <ol className="list-decimal ml-5"><li>目標：給誰、交什麼</li><li>資料依據：看哪些附件</li><li>輸出格式：幾點、幾頁、什麼檔</li><li>限制：缺資料標待確認，不補寫</li></ol>
              </div>
              <div>
                <h4 className="font-black">交件前檢查</h4>
                <ol className="list-decimal ml-5"><li>成品打得開</li><li>數字對回原始資料</li><li>期限依最新更正信</li><li>未知資訊沒有被猜測</li><li>Skill 有點名使用</li></ol>
              </div>
            </div>
            <Btn variant="secondary" className="mt-3 print:hidden" onClick={() => window.print()}>列印小卡</Btn>
          </Box>
        </section>
        <Box tone="green" title="下一步：回到工作使用">
          <p>挑一件你每週都在做的事，換成自己的資料，用同樣的四件事交代、用 Skill 重複做、交件前照小卡檢查。</p>
        </Box>
      </div>
    </div>
  );
}
