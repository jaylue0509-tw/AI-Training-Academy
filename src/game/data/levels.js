// 六關、每關六步（10、15、20、20、20、15 分），共 36 個計分步驟、600 分。

export const STEP_MAX = [10, 15, 20, 20, 20, 15];
export const PASS_SCORE = 80;

export const STATIONS = {
  prompt: { id: 'prompt', name: '指令組裝站', x: 1, y: 1, icon: '🧱' },
  mail: { id: 'mail', name: '信件站', x: 5, y: 1, icon: '📨' },
  report: { id: 'report', name: '報告桌', x: 9, y: 1, icon: '📊' },
  skill: { id: 'skill', name: 'Skill 裝備站', x: 9, y: 4, icon: '🧩' },
  auto: { id: 'auto', name: '自動化控制台', x: 5, y: 4, icon: '⏰' },
  studio: { id: 'studio', name: '工作室實戰', x: 1, y: 4, icon: '🏢' },
};

const steps = (list) => list.map((s, i) => ({ ...s, index: i, max: STEP_MAX[i] }));

export const LEVELS = [
  {
    id: 1,
    title: '選對工具說清楚',
    gameName: '指令組裝站',
    station: 'prompt',
    skill: '說清楚需求並追問',
    minutes: 10,
    request: '幫我整理這些資料。',
    goal: '把模糊需求變成可執行要求：補足資料範圍、用途與完成格式。',
    deliverable: '一份完整指令與一份修正後摘要',
    steps: steps([
      { id: 'pick-tool', title: '選主要工具與版本', instruction: '看三張工具小卡，選一套主要產品，以及網頁版或桌面版；再找到第一次任務的開始位置。', screen: 'entry' },
      { id: 'add-data', title: '開新對話並加入資料', instruction: '開新對話，加入教學工作資料「工作紀錄」，並確認 AI 有收到檔案內容。', screen: 'attach' },
      { id: 'compose', title: '補上目標、依據、格式與限制', instruction: '從需求卡中各選一張：目標、資料依據、輸出格式、限制（各 5 分），再自己輸入一次完整要求。', screen: 'prompt' },
      { id: 'send', title: '送出並取得第一份結果', instruction: '送出要求，等待產出，並打開結果確認能閱讀、內容對應任務。', screen: 'run' },
      { id: 'refine', title: '追問修正一項缺漏', instruction: '對照原始工作紀錄，找出結果中錯誤的一點，選出能說清楚「要改哪裡」的追問。', screen: 'result' },
      { id: 'save', title: '保存好用指令與成果', instruction: '把這次的指令存進指令庫，標出下次要替換的部分，並保存修正後摘要。', screen: 'save' },
    ]),
  },
  {
    id: 2,
    title: '信件變成待辦',
    gameName: '信件偵探',
    station: 'mail',
    skill: '整理信件並回查依據',
    minutes: 15,
    request: '這五封信裡，今天有哪些事要做？',
    goal: '把五封信整理成有事項、負責人、期限與來源的待辦表，並回查原信修正錯誤。',
    deliverable: '可直接處理、能回查來源的待辦表',
    steps: steps([
      { id: 'entry', title: '開啟信件整理入口', instruction: '在主要工具中，選一個適合整理文字或執行任務的入口。', screen: 'entry' },
      { id: 'load', title: '載入五封教學信件', instruction: '載入教學信件匯出檔，確認每封信都有 ID、日期與內文。', screen: 'attach' },
      { id: 'columns', title: '指定四個欄位', instruction: '指定待辦表欄位：事項、負責人、期限、來源；並要求缺資料時標「待確認」。', screen: 'prompt' },
      { id: 'classify', title: '產出待辦表', instruction: '逐封檢視五封信，分辨哪些是待辦、通知或更正，不把通知當成待辦。', screen: 'run' },
      { id: 'fix', title: '回查原信並修正', instruction: '待辦表裡有一筆期限過時、一筆負責人被猜測。回查原信，改正這兩處。', screen: 'result' },
      { id: 'save', title: '保存待辦表與整理要求', instruction: '確認每一列都能回查信件來源，保存待辦表與這次的整理要求。', screen: 'save' },
    ]),
  },
  {
    id: 3,
    title: '做出可用報告',
    gameName: '報告拼圖',
    station: 'report',
    skill: '製作與查核報告',
    minutes: 20,
    request: '把剛剛的待辦，加上本週數字，做成一頁週報。',
    goal: '整合待辦表、工作紀錄與數據，交出一份可開啟、數字正確的一頁週報。',
    deliverable: '一份能交給主管閱讀的週報檔案',
    steps: steps([
      { id: 'entry', title: '開啟工作或報告入口', instruction: '這次要交出成品，選主要工具中能產出檔案的工作入口。', screen: 'entry' },
      { id: 'sources', title: '加入三份來源', instruction: '加入待辦表、工作紀錄與本週數據，並確認資料期間。', screen: 'attach' },
      { id: 'structure', title: '排好報告結構', instruction: '把報告段落排成：先結論、三個數字、待確認、下一步，並指定一頁與輸出格式。', screen: 'prompt' },
      { id: 'produce', title: '產出並開啟報告', instruction: '產出報告、存成檔案或可匯出文件，並打開確認可閱讀。', screen: 'run' },
      { id: 'verify', title: '核對三個數字與一個期限', instruction: '把報告中的完成數、未完成數、金額與文宣期限，逐一對回原始資料，錯的要改正。', screen: 'result' },
      { id: 'save', title: '保存報告與重用要求', instruction: '取一個看得出期間的檔名，附上資料來源，並保存下週可重用的要求。', screen: 'save' },
    ]),
  },
  {
    id: 4,
    title: '第一次使用 Skill',
    gameName: 'Skill 裝備站',
    station: 'skill',
    skill: '啟用與重用 Skill',
    minutes: 20,
    request: '每週都要做同樣的週報，能不能讓 AI 每次照同一套規則做？',
    goal: '讀懂、啟用一個教學週報 Skill，並用兩週不同資料各使用一次。',
    deliverable: '兩份依 Skill 規則產出的週報',
    steps: steps([
      { id: 'distinguish', title: '分辨一次性指令與 Skill', instruction: '看五個工作例子，分辨哪些適合做成可重用的 Skill。', screen: 'entry' },
      { id: 'read', title: '讀取 Skill 說明', instruction: '打開 Skill 列表，讀教學週報 Skill 的說明，找出用途、必要資料與輸出要求。', screen: 'skill-list' },
      { id: 'enable', title: '加入並啟用 Skill', instruction: '依主要平台的入口加入教學 Skill（10 分），再確認已啟用（10 分），不需寫程式。', screen: 'skill-enable' },
      { id: 'use1', title: '指定使用 Skill 做第一週', instruction: '在要求中明確指定使用週報 Skill（10 分），檢查成果是否符合四段格式（10 分）。', screen: 'skill-use' },
      { id: 'use2', title: '換第二週資料再用一次', instruction: '開新任務、換第二週資料再用一次：數字要更新正確（10 分），規則要維持（10 分）。', screen: 'result' },
      { id: 'manage', title: '保存結果並找到管理位置', instruction: '保存兩次結果，找到下次使用與停用 Skill 的位置。', screen: 'save' },
    ]),
  },
  {
    id: 5,
    title: '讓工作定期完成',
    gameName: '自動化控制台',
    station: 'auto',
    skill: '設定、驗證及暫停排程',
    minutes: 15,
    request: '下週開始，每週五幫我整理同樣格式的摘要。',
    goal: '設定一次時間排程，試跑、核對下次執行時間，並知道怎麼暫停。',
    deliverable: '一個試跑過、可暫停的每週排程',
    steps: steps([
      { id: 'entry', title: '找到排程入口', instruction: '在主要工具中找到實際可用的排程入口（Work、Cowork 或 Tasks）。', screen: 'entry' },
      { id: 'source', title: '指定來源、期間與輸出位置', instruction: '選排程執行時仍能存取的來源、收集期間與輸出位置。', screen: 'attach' },
      { id: 'time', title: '設定每週五 17 時、台北時區', instruction: '設定頻率、星期、時間與時區，從預覽確認下一次執行時間。', screen: 'prompt' },
      { id: 'test', title: '建立任務並立即試跑', instruction: '建立排程後立刻試跑一次，打開試跑結果。', screen: 'run' },
      { id: 'check', title: '核對下次時間與執行條件', instruction: '核對下次執行時間、試跑內容，並確認來源是否依賴本機上線。', screen: 'result' },
      { id: 'pause', title: '保存設定並示範暫停', instruction: '保存排程，找到管理位置，並示範暫停一次。', screen: 'save' },
    ]),
  },
  {
    id: 6,
    title: '獨立完成交辦',
    gameName: '工作室實戰',
    station: 'studio',
    skill: '獨立有效操作',
    minutes: 20,
    request: '將第二個專案的五封信與本週資料，整理成待辦及一頁週報，並使用已啟用的週報 Skill。',
    goal: '只看需求與完成條件，自己選工具、用 Skill、查核並交件。',
    deliverable: '一份以新資料完成的工作成品',
    steps: steps([
      { id: 'choose', title: '自己判斷入口並選工具', instruction: '選擇辦公任務或工具模式，選入口，並說明這個選擇對應的完成目標。', screen: 'entry' },
      { id: 'data', title: '選新資料並找出缺漏', instruction: '選對這次的新資料，先找出一項原始資料的缺漏。', screen: 'attach' },
      { id: 'request', title: '下達完整要求並指定 Skill', instruction: '自己寫出完整要求：明確指定 Skill、資料來源、輸出內容與限制。', screen: 'prompt' },
      { id: 'run', title: '執行並開啟成品', instruction: '執行並打開成品，確認不只是顯示「完成」訊息。', screen: 'run' },
      { id: 'check', title: '檢查並修正', instruction: '對照原始資料或指定測試，檢查並修正數字、期限與缺漏。', screen: 'result' },
      { id: 'submit', title: '提交成品與重用方式', instruction: '提交成品，記下下次重用方式，完成交件前自我檢查。', screen: 'save' },
    ]),
  },
];

export const getLevel = id => LEVELS.find(l => l.id === Number(id));

export const ACHIEVEMENTS = [
  { id: 'operate', name: '會操作', desc: '第一到第三關皆達 80 分', levels: [1, 2, 3] },
  { id: 'skill', name: '會用 Skill', desc: '第四關達 80 分', levels: [4] },
  { id: 'deliver', name: '能獨立交件', desc: '第六關達 80 分', levels: [6] },
];
