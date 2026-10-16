import React, { useState } from 'react';
import { EVIDENCE_RULES, runEvidence } from '../engine/checkers.js';
import { TOOLS, TOOL_IDS, PLATFORMS } from '../data/tools.js';
import { Btn, Field, inputCls, Box } from './ui.jsx';

const INSTRUCTOR_CODE = import.meta.env?.VITE_INSTRUCTOR_CODE || 'AIMASTER';

export const STATUS_LABEL = {
  none: '未驗證',
  failed: '已提交，核對未通過',
  auto: '證據核對通過',
  instructor: '講師已確認',
};

// 真實工具實作驗證：與練習分數分開標示，不另加分數
export default function EvidencePanel({ level, profile, evidence, mode, onSave }) {
  const rule = EVIDENCE_RULES[level];
  const [form, setForm] = useState(() => ({ tool: profile.tool ?? '', platform: profile.platform ?? 'web', ...evidence?.fields }));
  const [code, setCode] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const result = evidence?.result;
  const status = evidence?.status ?? 'none';

  const submit = () => {
    const r = runEvidence(level, { ...form, mode });
    onSave({ fields: form, result: r, status: r.passed ? 'auto' : 'failed', submittedAt: new Date().toISOString() });
  };
  const confirm = () => {
    if (code.trim().toUpperCase() !== INSTRUCTOR_CODE) return alert('確認碼不正確');
    onSave({ ...evidence, status: 'instructor', confirmedAt: new Date().toISOString() });
  };

  const two = level === 4 || level === 5;
  return (
    <Box title="真實工具驗證" tone="blue">
      <p className="text-sm text-gray-700 mb-3">
        在真實的 {TOOLS[profile.tool]?.name ?? '主要工具'} 完成同樣任務後提交成果。{rule?.prompt}
        <br />僅按「我完成了」不視為已驗證；成果檔不能單獨證明用過哪個工具或 Skill，必要時由講師觀察確認。
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="使用的工具">
          <select className={inputCls} value={form.tool} onChange={e => set('tool', e.target.value)}>
            <option value="">請選擇</option>
            {TOOL_IDS.map(id => <option key={id} value={id}>{TOOLS[id].name}</option>)}
          </select>
        </Field>
        <Field label="網頁或桌面">
          <select className={inputCls} value={form.platform} onChange={e => set('platform', e.target.value)}>
            {Object.values(PLATFORMS).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
      </div>
      <div className="mt-3 space-y-3">
        <Field label={level === 4 ? '第一週成果' : level === 5 ? '排程設定（含下次執行時間）' : '成果內容'}>
          <textarea className={`${inputCls} h-32`} value={form.text ?? ''} onChange={e => set('text', e.target.value)} />
        </Field>
        {two && (
          <Field label={level === 4 ? '第二週成果（新任務中再次使用 Skill）' : '試跑結果'}>
            <textarea className={`${inputCls} h-28`} value={form.text2 ?? ''} onChange={e => set('text2', e.target.value)} />
          </Field>
        )}
        {level === 3 && (
          <Field label="報告檔名"><input className={inputCls} value={form.fileName ?? ''} onChange={e => set('fileName', e.target.value)} placeholder="例：週報_秋季新品發表會_2026-10-12至10-16.docx" /></Field>
        )}
        {(level === 4 || level === 6) && (
          <Field label={mode === 'tool' ? '使用的工具或 Skill' : '實際使用的 Skill 名稱'}><input className={inputCls} value={form.skillName ?? ''} onChange={e => set('skillName', e.target.value)} /></Field>
        )}
        {level === 5 && (
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" className="w-5 h-5" checked={Boolean(form.paused)} onChange={e => set('paused', e.target.checked)} />
            我已在真實工具中找到排程管理位置並暫停過一次
          </label>
        )}
        <Field label="操作截圖（選填，僅記錄檔名供講師對照）">
          <input type="file" accept="image/*" onChange={e => set('screenshot', e.target.files?.[0]?.name ?? '')} className="text-sm" />
          {form.screenshot && <span className="text-sm text-gray-600 ml-2">{form.screenshot}</span>}
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <Btn onClick={submit} disabled={!form.tool || !(form.text ?? '').trim()}>提交並核對</Btn>
        <span className={`font-bold ${status === 'auto' || status === 'instructor' ? 'text-emerald-700' : status === 'failed' ? 'text-rose-700' : 'text-gray-500'}`}>狀態：{STATUS_LABEL[status]}</span>
      </div>
      {result && (
        <ul className="mt-3 space-y-1 text-sm">
          {result.checks.map(c => <li key={c.label} className={c.ok ? 'text-emerald-700' : 'text-rose-700'}>{c.ok ? '✓' : '✗'} {c.label}</li>)}
        </ul>
      )}
      {status === 'auto' && (
        <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
          <span className="text-gray-600">講師觀察確認：</span>
          <input className="border-2 border-gray-300 rounded-lg px-2 py-1 w-36" type="password" value={code} onChange={e => setCode(e.target.value)} aria-label="講師確認碼" placeholder="講師確認碼" />
          <Btn variant="secondary" className="!py-1 !text-sm" onClick={confirm}>講師確認</Btn>
        </div>
      )}
    </Box>
  );
}

export const isVerified = ev => ev?.status === 'auto' || ev?.status === 'instructor';
