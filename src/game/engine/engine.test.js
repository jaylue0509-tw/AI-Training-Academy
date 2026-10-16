import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, STEP_MAX } from '../data/levels.js';
import { applyAttempt, crit, levelScore, levelPassed, TOTAL_MAX } from './scoring.js';
import { nextWeeklyRun, formatInTaipei, runEvidence } from './checkers.js';
import { computeMetrics, WEEK1, WEEK2, WEEK_B } from '../data/materials.js';
import { DIALOGUES } from '../data/dialogues.js';

test('六關、三十六步、總分六百', () => {
  assert.equal(LEVELS.length, 6);
  assert.equal(LEVELS.flatMap(l => l.steps).length, 36);
  assert.deepEqual(STEP_MAX, [10, 15, 20, 20, 20, 15]);
  assert.equal(TOTAL_MAX, 600);
  LEVELS.forEach(l => assert.equal(l.steps.reduce((s, x) => s + x.max, 0), 100));
});

test('重送不刷分，重試可補分', () => {
  let r = applyAttempt({}, [crit('a', 'A', 10, true), crit('b', 'B', 10, false)], 20);
  assert.equal(r.gained, 10);
  r = applyAttempt(r.state, [crit('a', 'A', 10, true), crit('b', 'B', 10, false)], 20);
  assert.equal(r.gained, 0);
  r = applyAttempt(r.state, [crit('a', 'A', 10, false), crit('b', 'B', 10, true)], 20);
  assert.equal(r.gained, 10);
  assert.equal(r.score, 20);
  assert.equal(r.state.complete, true);
  assert.equal(r.state.attempts, 3);
});

test('評分項目總和必須等於步驟上限', () => {
  assert.throws(() => applyAttempt({}, [crit('a', 'A', 5, true)], 10));
});

test('過關需 80 分且完成查核與保存', () => {
  const full = i => ({ criteria: [crit('x', 'x', STEP_MAX[i], true)], complete: true, attempts: 1 });
  const steps = Object.fromEntries([0, 1, 2, 3, 4, 5].map(i => [i, full(i)]));
  assert.equal(levelScore({ id: 1, steps }), 100);
  assert.equal(levelPassed({ id: 1, steps }), true);
  const noCheck = { ...steps, 4: { criteria: [crit('x', 'x', 20, false)], complete: false, attempts: 1 } };
  assert.equal(levelScore({ id: 1, steps: noCheck }), 80);
  assert.equal(levelPassed({ id: 1, steps: noCheck }), false);
});

test('計算口徑', () => {
  assert.deepEqual(computeMetrics(WEEK1.rows), { done: 8, undone: 3, amount: 42700, missing: [] });
  assert.deepEqual(computeMetrics(WEEK2.rows), { done: 5, undone: 2, amount: 17300, missing: ['T14'] });
  assert.deepEqual(computeMetrics(WEEK_B.rows), { done: 4, undone: 3, amount: 2500, missing: ['B07'] });
});

test('下次執行時間：每週五 17:00 台北', () => {
  // 2026-10-16（週五）15:00 台北 → 當天 17:00
  const fri15 = Date.UTC(2026, 9, 16, 7, 0);
  const cfg = { weekday: 5, hour: 17, tz: 'Asia/Taipei' };
  assert.equal(formatInTaipei(nextWeeklyRun(fri15, cfg)), '2026/10/16（週五）17:00 台北時間');
  // 週五 18:00 → 下週五
  const fri18 = Date.UTC(2026, 9, 16, 10, 0);
  assert.equal(formatInTaipei(nextWeeklyRun(fri18, cfg)), '2026/10/23（週五）17:00 台北時間');
  // 選錯時區 UTC → 台北時間週六 01:00
  assert.equal(formatInTaipei(nextWeeklyRun(fri18, { ...cfg, tz: 'UTC' })), '2026/10/17（週六）01:00 台北時間');
});

test('證據核對：第四關兩週數字', () => {
  const w1 = '一、本週結論\n二、關鍵數字：完成 8、未完成 3、金額 42,700\n三、待確認事項：無\n四、下一步';
  const w2 = '一、本週結論\n二、關鍵數字：完成 5、未完成 2、金額 17,300（T14 待確認）\n三、待確認事項\n四、下一步';
  assert.equal(runEvidence(4, { text: w1, text2: w2, skillName: '週報 Skill' }).passed, true);
  assert.equal(runEvidence(4, { text: w1, text2: w1, skillName: '週報 Skill' }).passed, false);
});

test('證據核對：第一關不把文宣寫成完成', () => {
  const good = '1. 場地合約已完成\n2. 文宣初稿文案完成，設計進行中\n3. 報價單等待成本資料，進行中';
  const bad = '1. 場地合約已完成\n2. 文宣初稿已完成\n3. 報價單進行中';
  assert.equal(runEvidence(1, { text: good }).passed, true);
  assert.equal(runEvidence(1, { text: bad }).passed, false);
});

test('每步都有說明與兩層提示，文字長度適中', () => {
  for (const l of LEVELS) for (const s of l.steps) {
    for (const [trigger, hl] of [['concept', 0], ['hint', 1], ['hint', 2]]) {
      const d = DIALOGUES.find(x => x.level === l.id && x.step === s.index && x.trigger === trigger && x.hintLevel === hl);
      assert.ok(d, `L${l.id} S${s.index} ${trigger}${hl}`);
      assert.ok(d.text.length <= 40, `過長：${d.text}`);
    }
  }
});
