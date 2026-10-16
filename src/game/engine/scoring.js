// 計分規則：每步固定上限；同一步重做時，每個評分項目取歷次最佳，不重複加分；
// 提示不扣分；對話、動畫與重播不計分。

import { LEVELS, STEP_MAX, PASS_SCORE } from '../data/levels.js';

export const TOTAL_MAX = STEP_MAX.reduce((a, b) => a + b, 0) * LEVELS.length;

// criteria: [{ key, label, max, earned, reason }]
export function mergeCriteria(prev = [], next = []) {
  const map = new Map(prev.map(c => [c.key, c]));
  for (const c of next) {
    const old = map.get(c.key);
    const earned = Math.min(c.max, Math.max(0, c.earned));
    if (!old || earned > old.earned) map.set(c.key, { ...c, earned });
    else if (old && earned === old.earned) map.set(c.key, { ...old, reason: c.reason ?? old.reason });
  }
  return [...map.values()];
}

export function stepScore(criteria = [], max = Infinity) {
  return Math.min(max, criteria.reduce((s, c) => s + c.earned, 0));
}

export function validateCriteria(criteria, max) {
  const total = criteria.reduce((s, c) => s + c.max, 0);
  if (total !== max) throw new Error(`評分項目總和 ${total} 不等於步驟上限 ${max}`);
}

// 回傳本次新增分數（重送只得到補上的差額）
export function applyAttempt(stepState = {}, criteria, max) {
  validateCriteria(criteria, max);
  const before = stepScore(stepState.criteria, max);
  const merged = mergeCriteria(stepState.criteria, criteria);
  const after = stepScore(merged, max);
  return {
    state: {
      ...stepState,
      criteria: merged,
      attempts: (stepState.attempts ?? 0) + 1,
      complete: after === max,
      lastAttempt: criteria,
    },
    gained: after - before,
    score: after,
  };
}

export function levelScore(levelState = {}) {
  const level = LEVELS.find(l => l.id === levelState.id);
  return (level?.steps ?? []).reduce((s, step) => s + stepScore(levelState.steps?.[step.index]?.criteria, step.max), 0);
}

// 單關過關：至少 80 分，且完成該關的資料與成果檢查（第 5 步查核、第 6 步保存皆已完成）
export function levelPassed(levelState = {}) {
  const steps = levelState.steps ?? {};
  return levelScore(levelState) >= PASS_SCORE && Boolean(steps[4]?.complete) && Boolean(steps[5]?.attempts);
}

export function totalScore(levelsState = {}) {
  return LEVELS.reduce((s, l) => s + levelScore({ id: l.id, ...(levelsState[l.id] ?? {}) }), 0);
}

// 布林判定轉評分項目
export const crit = (key, label, max, ok, reason = '') => ({ key, label, max, earned: ok ? max : 0, ok: Boolean(ok), reason });
