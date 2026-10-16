// 進度保存：中斷可續玩。只存在此瀏覽器；清除網站資料會重置進度。

const KEY = 'ai-master-progress-v1';

export const emptyProgress = () => ({
  version: 1,
  profile: { tool: null, platform: 'web', os: 'Windows', name: '' },
  levels: {},          // { [levelId]: { id, current, steps: { [i]: stepState }, hints: { [i]: n } } }
  artifacts: {},       // 各關成果：promptLibrary、todoTable、report、skill、schedule、final
  evidence: {},        // { [levelId]: { ...fields, result, status, submittedAt } }
  seenDialogues: [],
  position: { x: 3, y: 3 },
  lastLevel: null,
  updatedAt: null,
});

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw);
    return { ...emptyProgress(), ...data, profile: { ...emptyProgress().profile, ...data.profile } };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...p, updatedAt: new Date().toISOString() }));
  } catch {
    // 無痕或封鎖儲存時，只保留本次頁面中的進度
  }
}

export function clearProgress() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
