import React, { useState } from 'react';
import { TOOLS, TOOL_IDS, PLATFORMS } from '../data/tools.js';
import { getScreen } from '../data/screens.js';

// 真實產品畫面面板：可切換網頁／桌面、比較其他工具；未錄製時顯示待錄製與必要標示
export default function ScreenPanel({ level, kind, profile, onPlatform }) {
  const [tool, setTool] = useState(profile.tool ?? 'claude');
  const [zoom, setZoom] = useState(false);
  const platform = profile.platform ?? 'web';
  const shown = TOOLS[tool] ? tool : 'claude';
  const screen = getScreen(shown, platform, level, kind);

  return (
    <section className="border-2 border-gray-200 rounded-2xl bg-white overflow-hidden" aria-label="真實產品畫面">
      <header className="flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <span className="font-black text-gray-900">真實畫面・{screen.kindLabel}</span>
        <div className="flex gap-1 ml-auto" role="radiogroup" aria-label="網頁或桌面">
          {Object.values(PLATFORMS).map(p => (
            <button key={p.id} type="button" role="radio" aria-checked={platform === p.id} onClick={() => onPlatform(p.id)}
              className={`text-sm font-bold px-2.5 py-1 rounded-lg focus-visible:ring-4 focus-visible:ring-indigo-300 ${platform === p.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300'}`}>{p.name}</button>
          ))}
        </div>
        <div className="flex gap-1" role="radiogroup" aria-label="比較工具">
          {TOOL_IDS.map(id => (
            <button key={id} type="button" role="radio" aria-checked={shown === id} onClick={() => setTool(id)}
              className={`text-sm font-bold px-2.5 py-1 rounded-lg focus-visible:ring-4 focus-visible:ring-indigo-300 ${shown === id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300'}`}>
              {TOOLS[id].name}{id === profile.tool ? '（主要）' : ''}
            </button>
          ))}
        </div>
      </header>

      {screen.recorded ? (
        <figure className="p-3">
          <button type="button" onClick={() => setZoom(true)} className="relative block w-full focus-visible:ring-4 focus-visible:ring-indigo-300" aria-label="放大截圖">
            <img src={screen.src} alt={screen.caption ?? `${TOOLS[shown].name} ${screen.kindLabel}`} className="w-full rounded-lg border border-gray-200" />
            {screen.hotspot && (
              <span className="absolute border-4 border-rose-500 rounded-lg animate-pulse pointer-events-none"
                style={{ left: `${screen.hotspot.x}%`, top: `${screen.hotspot.y}%`, width: `${screen.hotspot.w}%`, height: `${screen.hotspot.h}%` }} />
            )}
          </button>
          <figcaption className="text-sm text-gray-700 mt-2">
            {screen.caption && <span className="font-bold block">👉 {screen.caption}</span>}
            <ScreenMeta tool={shown} platform={platform} screen={screen} />
            {screen.bridge && <span className="block text-amber-700 font-bold mt-1">轉接說明：{screen.bridge}</span>}
          </figcaption>
          {zoom && (
            <div role="dialog" aria-label="截圖放大" className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setZoom(false)}>
              <img src={screen.src} alt="" className="max-w-full max-h-full" />
            </div>
          )}
        </figure>
      ) : (
        <div className="p-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center bg-gray-50">
            <div className="text-lg font-black text-gray-700">真實畫面待錄製</div>
            <p className="text-sm text-gray-600 mt-1">
              此處將放 {TOOLS[shown].name} {PLATFORMS[platform].name}「{screen.kindLabel}」的實際產品畫面。
              教材不以自製介面代替產品畫面。
            </p>
            <ScreenMeta tool={shown} platform={platform} screen={screen} pending />
          </div>
          <p className="text-sm text-gray-700 mt-3">
            現在請在旁邊打開 <a href={TOOLS[shown].url} target="_blank" rel="noreferrer" className="font-bold text-indigo-700 underline">{TOOLS[shown].name}</a>，
            並排操作；下方練習畫面先帶你走一次。
          </p>
        </div>
      )}
    </section>
  );
}

function ScreenMeta({ tool, platform, screen, pending }) {
  const v = x => x ?? (pending ? '待填' : '—');
  return (
    <dl className={`grid grid-cols-2 sm:grid-cols-5 gap-x-3 gap-y-1 text-xs mt-2 ${pending ? 'text-gray-500' : 'text-gray-600'}`}>
      <div><dt className="inline font-bold">產品：</dt><dd className="inline">{TOOLS[tool].name}</dd></div>
      <div><dt className="inline font-bold">版本：</dt><dd className="inline">{PLATFORMS[platform].name}</dd></div>
      <div><dt className="inline font-bold">系統：</dt><dd className="inline">{v(screen.os)}</dd></div>
      <div><dt className="inline font-bold">軟體版本：</dt><dd className="inline">{v(screen.version)}</dd></div>
      <div><dt className="inline font-bold">錄製日期：</dt><dd className="inline">{v(screen.recordedAt)}</dd></div>
    </dl>
  );
}
