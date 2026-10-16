import React from 'react';

export function Btn({ children, variant = 'primary', className = '', ...rest }) {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300',
    secondary: 'bg-white text-gray-800 border-2 border-gray-300 hover:border-indigo-400 disabled:text-gray-400',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300',
    ghost: 'text-indigo-700 hover:bg-indigo-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  };
  return (
    <button
      type="button"
      className={`px-4 py-2.5 rounded-xl font-bold text-base transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

// 單選或多選卡片：可用 Tab 與 Enter／空白鍵操作
export function Choices({ options, value, onChange, multi = false, columns = 1, marks = {}, disabled = false, label }) {
  const selected = multi ? (value ?? []) : [value];
  const toggle = id => {
    if (disabled) return;
    if (!multi) return onChange(id);
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };
  const cols = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-3' }[columns];
  return (
    <div role={multi ? 'group' : 'radiogroup'} aria-label={label} className={`grid gap-2 ${cols}`}>
      {options.map(o => {
        const on = selected.includes(o.id);
        const mark = marks[o.id];
        return (
          <button
            key={o.id}
            type="button"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            disabled={disabled}
            onClick={() => toggle(o.id)}
            className={`text-left px-4 py-3 rounded-xl border-2 text-base transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300
              ${on ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'}
              ${mark === 'bad' ? '!border-rose-500 !bg-rose-50' : ''} ${mark === 'good' ? '!border-emerald-500 !bg-emerald-50' : ''}`}
          >
            <span className="flex items-start gap-2">
              <span aria-hidden className={`mt-1 inline-block w-4 h-4 shrink-0 border-2 ${multi ? 'rounded' : 'rounded-full'} ${on ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`} />
              <span>
                <span className="font-bold">{o.label}</span>
                {o.desc && <span className="block text-sm text-gray-600 mt-0.5">{o.desc}</span>}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// 單一輸入框用 <label>；選項卡片群組用 <fieldset>，避免按鈕被整段標題當成名稱
export function Field({ label, children, hint }) {
  const control = React.isValidElement(children) && (['input', 'textarea', 'select'].includes(children.type) || children.type === Select);
  const Tag = control ? 'label' : 'fieldset';
  const Title = control ? 'span' : 'legend';
  return (
    <Tag className="block min-w-0">
      <Title className="block font-bold text-gray-800 mb-1">{label}</Title>
      {children}
      {hint && <span className="block text-sm text-gray-500 mt-1">{hint}</span>}
    </Tag>
  );
}

export const inputCls = 'w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:border-indigo-500';

export function Select({ value, onChange, options, label, className = '' }) {
  return (
    <select aria-label={label} value={value ?? ''} onChange={e => onChange(e.target.value)} className={`${inputCls} ${className}`}>
      <option value="" disabled>請選擇</option>
      {options.map(o => <option key={o.id ?? o} value={o.id ?? o}>{o.label ?? o}</option>)}
    </select>
  );
}

export function Box({ title, children, tone = 'gray', className = '' }) {
  const tones = {
    gray: 'border-gray-200 bg-white',
    blue: 'border-sky-200 bg-sky-50',
    amber: 'border-amber-300 bg-amber-50',
    green: 'border-emerald-300 bg-emerald-50',
    red: 'border-rose-300 bg-rose-50',
    practice: 'border-dashed border-indigo-300 bg-indigo-50/40',
  };
  return (
    <section className={`border-2 rounded-2xl p-4 ${tones[tone]} ${className}`}>
      {title && <h4 className="font-black text-gray-900 mb-2">{title}</h4>}
      {children}
    </section>
  );
}

export function PracticeTag() {
  return <span className="inline-block text-xs font-black tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded">練習畫面</span>;
}

export function Doc({ children, title }) {
  return (
    <article className="bg-white border border-gray-300 shadow-sm rounded-lg p-5 font-serif leading-relaxed text-gray-900">
      {title && <h3 className="text-lg font-black mb-3 font-sans">{title}</h3>}
      {children}
    </article>
  );
}

export function DataTable({ columns, rows, highlight = {} }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>{columns.map(c => <th key={c.key} className="text-left bg-gray-100 border border-gray-300 px-2 py-1.5 font-bold">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i}>
              {columns.map(c => (
                <td key={c.key} className={`border border-gray-300 px-2 py-1.5 align-top ${highlight[`${i}:${c.key}`] ?? ''}`}>
                  {c.render ? c.render(r, i) : (r[c.key] ?? <span className="text-gray-400">（空白）</span>)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DownloadLink({ href, children }) {
  return (
    <a href={href} download className="inline-flex items-center gap-1 text-indigo-700 font-bold underline underline-offset-2 hover:text-indigo-900">
      ⬇ {children}
    </a>
  );
}

// 可重新排序清單：上下按鈕（鍵盤）＋ 拖曳
export function Reorder({ items, onChange, render }) {
  const [drag, setDrag] = React.useState(null);
  const move = (from, to) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  };
  return (
    <ol className="space-y-2">
      {items.map((it, i) => (
        <li
          key={it}
          draggable
          onDragStart={() => setDrag(i)}
          onDragOver={e => e.preventDefault()}
          onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
          className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-3 py-2 cursor-grab"
        >
          <span className="text-gray-400 font-bold w-6">{i + 1}.</span>
          <span className="flex-1 font-bold">{render ? render(it) : it}</span>
          <button type="button" aria-label="上移" onClick={() => move(i, i - 1)} disabled={i === 0} className="px-2 py-1 rounded-lg border border-gray-300 disabled:opacity-30 focus-visible:ring-4 focus-visible:ring-indigo-300">▲</button>
          <button type="button" aria-label="下移" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} className="px-2 py-1 rounded-lg border border-gray-300 disabled:opacity-30 focus-visible:ring-4 focus-visible:ring-indigo-300">▼</button>
        </li>
      ))}
    </ol>
  );
}
