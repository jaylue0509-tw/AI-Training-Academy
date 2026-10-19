import React, { useState } from 'react';
import { CHARACTERS, EXPRESSION_LABEL } from '../data/characters.js';

// 暫用頭像：五種表情共用同一臉型、髮型與比例，正式素材提供後以 images 取代
const MOUTH = {
  explain: 'M38 66 Q50 72 62 66',
  encourage: 'M36 63 Q50 78 64 63',
  puzzled: 'M40 68 Q46 64 52 68 Q58 72 62 67',
  remind: 'M40 68 L60 68',
  success: 'M34 61 Q50 82 66 61 Z',
};
const BROWS = {
  explain: ['M30 38 L42 37', 'M58 37 L70 38'],
  encourage: ['M30 36 L42 34', 'M58 34 L70 36'],
  puzzled: ['M30 34 L42 38', 'M58 36 L70 33'],
  remind: ['M30 38 L42 35', 'M58 35 L70 38'],
  success: ['M30 34 L42 32', 'M58 32 L70 34'],
};

export function Avatar({ characterId, expression = 'explain', size = 72 }) {
  const c = CHARACTERS[characterId];
  if (!c) return null;
  const img = c.images?.[expression];
  // 頭像框只顯示頭與肩膀：圖放大後以上緣置中裁切
  if (img) return (
    <span className="relative inline-block shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size, background: `${c.color}1f` }}>
      <ImageOr src={img} alt={`${c.name}（${EXPRESSION_LABEL[expression]}）`} width={size * 1.5} height={size * 1.875}
        className="absolute max-w-none left-1/2 -translate-x-1/2" style={{ top: -size * 0.02 }}
        fallback={<Placeholder c={c} expression={expression} size={size} />} />
    </span>
  );
  return <Placeholder c={c} expression={expression} size={size} />;
}

// 圖檔載入失敗時改顯示 fallback
function ImageOr({ src, fallback, className = 'object-contain', ...rest }) {
  const [failed, setFailed] = useState(null);
  if (failed === src) return fallback;
  return <img key={src} src={src} className={className} onError={() => setFailed(src)} {...rest} />;
}

function Placeholder({ c, expression, size }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${c.name}（${EXPRESSION_LABEL[expression]}，暫用圖）`}>
        <circle cx="50" cy="50" r="48" fill={c.color} opacity="0.15" />
        <path d="M18 46 Q20 12 50 12 Q80 12 82 46 Q74 26 50 26 Q26 26 18 46" fill={c.color} />
        <circle cx="50" cy="52" r="30" fill="#fde7d4" />
        <path d="M22 46 Q28 22 50 22 Q72 22 78 46 Q70 32 50 32 Q30 32 22 46" fill={c.color} />
        {BROWS[expression].map(d => <path key={d} d={d} stroke="#333" strokeWidth="2.5" strokeLinecap="round" />)}
        {expression === 'success'
          ? <><path d="M32 47 Q37 42 42 47" stroke="#333" strokeWidth="3" fill="none" /><path d="M58 47 Q63 42 68 47" stroke="#333" strokeWidth="3" fill="none" /></>
          : <><circle cx="37" cy="47" r="3.5" fill="#333" /><circle cx="63" cy="47" r="3.5" fill="#333" /></>}
        <path d={MOUTH[expression]} stroke="#b4443b" strokeWidth="3" fill={expression === 'success' ? '#b4443b' : 'none'} strokeLinecap="round" />
        {expression === 'puzzled' && <text x="76" y="28" fontSize="20" fontWeight="bold" fill="#333">?</text>}
        {expression === 'remind' && <text x="78" y="28" fontSize="20" fontWeight="bold" fill="#d97706">!</text>}
      </svg>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-gray-800 text-white px-1 rounded whitespace-nowrap">暫用圖</span>
    </span>
  );
}

// 人物對話框：一句短話為主，可收合、可重播，不擋住主要按鈕
export function CharacterBubble({ line, onStart, onReplay, onClose, collapsed, onExpand }) {
  if (!line) return null;
  const c = CHARACTERS[line.character];
  if (collapsed) {
    return (
      <button type="button" onClick={onExpand} className="flex items-center gap-2 bg-white border-2 border-gray-200 shadow-lg rounded-full pl-1 pr-4 py-1 hover:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-300" aria-label={`展開${c.name}的說明`}>
        <Avatar characterId={line.character} expression={line.expression} size={40} />
        <span className="font-bold text-sm">{c.name}</span>
      </button>
    );
  }
  return (
    <div role="status" aria-live="polite" className="flex items-end gap-3 max-w-md">
      <Avatar characterId={line.character} expression={line.expression} size={84} />
      <div className="bg-white border-2 border-gray-200 shadow-xl rounded-2xl rounded-bl-none p-3">
        <div className="text-xs font-bold text-gray-500 mb-0.5">{c.role}・{c.name}</div>
        <p className="text-lg font-bold text-gray-900 leading-snug">{line.text}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {onStart && <button type="button" onClick={onStart} className="text-sm font-bold bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-300">開始做</button>}
          <button type="button" onClick={onReplay} className="text-sm font-bold border border-gray-300 px-3 py-1 rounded-lg hover:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-300">再看一次</button>
          <button type="button" onClick={onClose} className="text-sm font-bold text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100 focus-visible:ring-4 focus-visible:ring-indigo-300">收起說明</button>
        </div>
      </div>
    </div>
  );
}

// 地圖角色：依移動方向換正面／背面／左／右全身圖
export function MapSprite({ characterId, facing = 'down', size = 44, expression }) {
  const sprite = CHARACTERS[characterId]?.mapSprites?.[facing];
  const avatar = <Avatar characterId={characterId} expression={expression} size={size} />;
  if (!sprite) return avatar;
  return <ImageOr src={sprite} alt="" width={size * 1.2} height={size * 1.8} className="object-contain drop-shadow-sm" fallback={avatar} />;
}
