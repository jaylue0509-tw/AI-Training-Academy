import React, { useEffect, useRef, useState } from 'react';
import { LEVELS, STATIONS } from '../data/levels.js';
import { levelScore, levelPassed } from '../engine/scoring.js';
import { MapSprite } from './Character.jsx';
import { TOOLS } from '../data/tools.js';

const W = 11, H = 6;

// 工作室地圖：方向鍵／WASD 移動，Enter 進入工作站；也可直接點選工作站
export default function StudioMap({ progress, update, onEnter, unlocked }) {
  const [pos, setPos] = useState(progress.position ?? { x: 5, y: 3 });
  const [walking, setWalking] = useState(null);
  const [facing, setFacing] = useState('down');
  const ref = useRef(null);

  const stationAt = (x, y) => LEVELS.find(l => Math.abs(STATIONS[l.station].x - x) <= 1 && STATIONS[l.station].y === y);
  const near = LEVELS.find(l => Math.abs(STATIONS[l.station].x - pos.x) <= 1 && Math.abs(STATIONS[l.station].y - pos.y) === 1);

  useEffect(() => { update(p => ({ ...p, position: pos })); }, [pos, update]);

  // 點選工作站：角色走過去後進入
  useEffect(() => {
    if (!walking) return;
    const st = STATIONS[walking.station];
    const target = { x: st.x, y: st.y + 1 };
    const t = setTimeout(() => {
      if (pos.x === target.x && pos.y === target.y) { setWalking(null); onEnter(walking.id); return; }
      const dx = Math.sign(target.x - pos.x);
      setFacing(dx > 0 ? 'right' : dx < 0 ? 'left' : target.y > pos.y ? 'down' : 'up');
      setPos(p => ({
        x: p.x + Math.sign(target.x - p.x),
        y: p.x === target.x ? p.y + Math.sign(target.y - p.y) : p.y,
      }));
    }, 90);
    return () => clearTimeout(t);
  }, [walking, pos, onEnter]);

  const onKey = e => {
    const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[e.key];
    if (d) {
      e.preventDefault();
      setFacing(d[0] > 0 ? 'right' : d[0] < 0 ? 'left' : d[1] > 0 ? 'down' : 'up');
      setPos(p => {
        const n = { x: Math.max(0, Math.min(W - 1, p.x + d[0])), y: Math.max(0, Math.min(H - 1, p.y + d[1])) };
        return stationAt(n.x, n.y) ? p : n;
      });
    } else if ((e.key === 'Enter' || e.key === ' ') && near && unlocked(near.id)) {
      e.preventDefault();
      onEnter(near.id);
    }
  };

  return (
    <div>
      <div ref={ref} tabIndex={0} onKeyDown={onKey} role="application" aria-label="工作室地圖：方向鍵移動，Enter 進入工作站"
        className="relative bg-gradient-to-br from-slate-50 to-indigo-50 border-2 border-gray-200 rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 select-none"
        style={{ aspectRatio: `${W} / ${H}` }}>
        <div aria-hidden className="absolute inset-x-[4%] rounded-full bg-indigo-100/70" style={{ top: `${(2.25 / H) * 100}%`, height: `${(1.5 / H) * 100}%` }} />
        <span aria-hidden className="absolute text-2xl sm:text-4xl" style={{ left: '29%', top: '3%' }}>🪴</span>
        <span aria-hidden className="absolute text-2xl sm:text-4xl" style={{ left: '66%', top: '3%' }}>☕</span>
        {LEVELS.map(l => {
          const st = STATIONS[l.station];
          const lv = progress.levels[l.id];
          const passed = levelPassed({ ...lv, id: l.id });
          const open = unlocked(l.id);
          return (
            <button key={l.id} type="button" disabled={!open}
              onClick={() => setWalking(l)}
              className={`absolute rounded-2xl border-2 p-1 sm:p-2 text-center shadow-sm transition focus-visible:ring-4 focus-visible:ring-indigo-300
                ${passed ? 'bg-emerald-50 border-emerald-400' : open ? 'bg-white border-indigo-300 hover:border-indigo-600' : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'}
                ${near?.id === l.id ? 'ring-4 ring-amber-300' : ''}`}
              style={{ left: `${((st.x - 1) / W) * 100}%`, top: `${(st.y / H) * 100}%`, width: `${(3 / W) * 100}%`, height: `${(1 / H) * 100}%` }}>
              <div className="text-[10px] sm:text-xs font-bold text-gray-500">第 {l.id} 關</div>
              <div className="text-xs sm:text-base font-black leading-tight"><span aria-hidden className="mr-1">{st.icon}</span>{l.gameName}</div>
              <div className="text-[10px] sm:text-xs font-bold">{open ? (lv ? `${levelScore({ ...lv, id: l.id })}/100` : '開始') : '🔒'}</div>
              <StationResult level={l.id} progress={progress} />
            </button>
          );
        })}
        <div className="absolute transition-all duration-100 flex items-center justify-center pointer-events-none"
          style={{ left: `${(pos.x / W) * 100}%`, top: `${(pos.y / H) * 100}%`, width: `${100 / W}%`, height: `${100 / H}%` }}>
          <MapSprite characterId="guide" facing={facing} expression={near ? 'encourage' : 'explain'} size={44} />
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        點選工作站，或點地圖後用方向鍵移動、靠近工作站按 Enter 進入。
        {near && unlocked(near.id) && <b className="text-indigo-700"> 按 Enter 進入「{near.gameName}」</b>}
      </p>
    </div>
  );
}

// 任務完成後，工作站顯示玩家成果
function StationResult({ level, progress }) {
  const a = progress.artifacts;
  const tag = {
    1: a.l1Saved && '📋 指令已存',
    2: a.l2Saved && `🗂 待辦 ${a.todoTable?.length ?? 3} 筆`,
    3: a.l3Saved && '📄 週報完成',
    4: a.skill?.enabled && `🧩 ${TOOLS[a.skill.tool]?.name ?? ''} Skill`,
    5: a.schedule?.saved && (a.schedule.paused ? '⏸ 排程已暫停' : '⏰ 週五 17:00'),
    6: a.final?.submitted && '🏆 已交件',
  }[level];
  return tag ? <div className="hidden sm:block text-[10px] font-bold text-emerald-700 truncate">{tag}</div> : null;
}
