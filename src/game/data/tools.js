// 三大工具小卡與各關使用入口。入口名稱依規劃書；實際畫面依錄製當下的方案、權限與版本。

export const TOOLS = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    color: 'emerald',
    entries: [
      { id: 'chat', name: 'Chat', use: '對話交代需求、追問修正' },
      { id: 'work', name: 'Work', use: '交辦工作、產出報告、設定排程' },
      { id: 'codex', name: 'Codex', use: '製作小工具（工具模式示範）' },
    ],
    skillPath: '可用的技能或外掛入口 → 安裝或加入 → 對話中選取',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai/',
    color: 'orange',
    entries: [
      { id: 'chat', name: 'Chat', use: '討論需求、整理資料' },
      { id: 'cowork', name: 'Cowork', use: '完成交辦、產出檔案、設定排程' },
      { id: 'code', name: 'Claude Code', use: '製作小工具（工具模式示範）' },
    ],
    skillPath: 'Customize → Skills → 安裝或啟用',
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com/',
    color: 'sky',
    entries: [
      { id: 'chat', name: 'Chat', use: '整理文字、產出內容' },
      { id: 'gems', name: 'Gems', use: '認識專用助手概念' },
      { id: 'tasks', name: 'Spark／Tasks', use: '任務與排程' },
    ],
    skillPath: 'Customize → Skills → 加入或建立',
  },
};

export const TOOL_IDS = ['chatgpt', 'claude', 'gemini'];

export const PLATFORMS = {
  web: { id: 'web', name: '網頁版' },
  desktop: { id: 'desktop', name: '桌面應用程式' },
};

// 每關可接受的入口（第一個為建議入口）
export const LEVEL_ENTRIES = {
  1: { chatgpt: ['chat'], claude: ['chat'], gemini: ['chat'] },
  2: { chatgpt: ['chat', 'work'], claude: ['chat', 'cowork'], gemini: ['chat'] },
  3: { chatgpt: ['work'], claude: ['cowork'], gemini: ['chat'] },
  5: { chatgpt: ['work'], claude: ['cowork'], gemini: ['tasks'] },
  6: { chatgpt: ['chat', 'work'], claude: ['chat', 'cowork'], gemini: ['chat'] },
  tool: { chatgpt: ['codex'], claude: ['code'], gemini: [] },
};

export const isEntryOk = (level, tool, entry) => (LEVEL_ENTRIES[level]?.[tool] || []).includes(entry);

export const entryName = (tool, entry) => TOOLS[tool]?.entries.find(e => e.id === entry)?.name ?? entry;
