/**
 * DataManager.js
 * Centralizes normalization, sync, and initialization logic for the AI Academy.
 */

export const normalizeTopic = (s) => String(s || '').replace(/[\s\u00A0\t\r\n]+/g, '').toLowerCase().trim();

export const normalizeDate = (d) => {
  if (!d) return '';
  const s = String(d);
  if (s.includes('T') && !isNaN(Date.parse(s))) {
    const dateObj = new Date(s);
    return `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
  }
  let m = s.match(/(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})/);
  if (m) return `${m[1]}-${parseInt(m[2], 10)}-${parseInt(m[3], 10)}`;
  m = s.match(/Date\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) return `${m[1]}-${parseInt(m[2], 10) + 1}-${parseInt(m[3], 10)}`;
  return s.trim();
};

export const DataManager = {
  /**
   * Fetches data from GAS and updates React state.
   */
  initialize: async ({ setCoursesData, setVideosData, showToast, silent = true, pendingEnrollmentsRef = { current: [] } }) => {
    const GAS_RELAY_URL = 'https://script.google.com/macros/s/AKfycbw2aAuDscj_nvWicPNaQDD3vwRCtNXvcCsvvjz-7y-4CugFZmOsdYnquLI_yio5Pt4oyg/exec';
    
    try {
      if (!silent && showToast) showToast('⏳ 正在同步雲端資料...');
      
      const resp = await fetch(`${GAS_RELAY_URL}?action=fetchAll&t=${Date.now()}`);
      if (!resp.ok) throw new Error('Network response was not ok');
      const res = await resp.json();
      if (res.error) throw new Error(res.error);

      // 1. Build Exact Mapping Keys for Enrollments
      const cloudExactKeys = new Set();
      (res.courses || []).forEach(c => {
        const tc = c['課程主題 / 類別'] || c['課程主題'] || '';
        const topic = tc.split('【')[0].trim();
        const dStr = normalizeDate(c['上課日期'] || '');
        if (topic && dStr) cloudExactKeys.add(`${normalizeTopic(topic)}_${dStr}`);
      });

      // 2. Map Enrollments
      const enrollMap = {};
      (res.enrollments || []).forEach(e => {
        if (!e || typeof e !== 'object') return;
        const tc = String(e['課程主題 / 類別'] || e['課程主題/類別'] || '');
        const topic = tc.split('【')[0].trim();
        const date = normalizeDate(e['上課日期']);
        const name = String(e['報名姓名'] || '').trim();
        const email = String(e['EMAIL'] || e['公司信箱'] || '').toLowerCase().trim();
        const org = String(e['事業體'] || '').trim();

        if (!name || !topic || !date) return;
        
        const key = `${normalizeTopic(topic)}_${date}`;
        if (!enrollMap[key]) enrollMap[key] = [];

        const existingIdx = enrollMap[key].findIndex(u => {
          if (email && u.email) return u.email === email;
          return u.name === name && u.org === org;
        });

        const statusLabel = String(e['報到是否成功'] || e['報到狀態'] || e['報到'] || e['attended'] || '');
        const isAttended = statusLabel.includes('已報到') || statusLabel.toLowerCase() === 'true';
        const isPracticalDone = String(e['實作完成'] || e['作業完成'] || e['practicalDone'] || e['實作狀態'] || '').includes('已完成') || !!e['實作完成'];
        const isSurveyDone = String(e['問卷完成'] || e['surveyDone'] || e['課後問卷'] || e['問卷狀態'] || '').includes('已完成') || !!e['問卷完成'];

        const enrollee = {
            org,
            title: String(e['職稱'] || '').trim(),
            name,
            email,
            attended: isAttended,
            practicalDone: isPracticalDone,
            surveyDone: isSurveyDone
        };

        if (existingIdx !== -1) {
          enrollMap[key][existingIdx] = { ...enrollMap[key][existingIdx], ...enrollee };
        } else {
          enrollMap[key].push(enrollee);
        }
      });

      // 3. Process courses and update state
      if (setCoursesData) {
        setCoursesData(prev => {
          const mergedMap = new Map();
          
          // Legacy/Cache items
          Object.keys(prev || {}).forEach(ds => {
            (prev[ds] || []).forEach(c => {
              const dateStr = normalizeDate(c.displayDate || ds);
              const key = `${normalizeTopic(c.topic)}_${dateStr}`;
              mergedMap.set(key, { ...c, dateStr });
            });
          });

          // Cloud Sync logic
          (res.courses || []).forEach(c => {
            const tc = String(c['課程主題 / 類別'] || c['課程主題'] || '');
            const topic = tc.split('【')[0].trim();
            const summary = String(c['課程類別'] || tc.match(/【.*】/)?.[0] || '【課程】').trim();
            const rawDate = c['上課日期'] || '';
            const dStr = normalizeDate(rawDate);
            if (!topic || !dStr) return;

            const key = `${normalizeTopic(topic)}_${dStr}`;
            
            // ✅ Default Value Logic (Requested by User)
            const statusRaw = String(c['狀態'] || '').trim();
            const status = statusRaw === 'DELETED' ? 'DELETED' : (statusRaw || '未發佈');
            
            if (status === 'DELETED') {
              mergedMap.delete(key);
              return;
            }

            const existing = mergedMap.get(key);
            const cloudVideo = String(c['影片連結'] || c['影片上傳'] || '').trim();
            
            const cloudEnrollees = enrollMap[key] || [];
            
            // Merge logic...
            mergedMap.set(key, {
              ...(existing || { id: Date.now() + Math.random(), enrollees: [] }),
              topic,
              summary,
              instructor: String(c['講師'] || '').trim() || '待確認',
              timeSlot: String(c['上課時間'] || '').trim() || '',
              videoUrl: cloudVideo || (existing?.videoUrl) || '未上傳', // ✅ Default to '未上傳'
              pdfUrl: String(c['教材講義'] || '').trim() || (existing?.pdfUrl) || '',
              outlineUrl: String(c['上課大綱'] || '').trim() || (existing?.outlineUrl) || '',
              surveyUrl: String(c['問卷連結'] || c['課後問卷'] || '').trim() || (existing?.surveyUrl) || '',
              maxCapacity: parseInt(c['人數上限']) || 350,
              enrollees: cloudEnrollees,
              enrolled: cloudEnrollees.length,
              dateStr: dStr,
              displayDate: String(rawDate).replace(/-/g, '/'),
              status: status // ✅ Use '未發佈' as default status
            });
          });

          const result = {};
          mergedMap.forEach(c => {
            if (!result[c.dateStr]) result[c.dateStr] = [];
            result[c.dateStr].push(c);
          });
          return result;
        });
      }

      if (!silent && showToast) showToast('✅ 雲端同步完成！');
    } catch (err) {
      console.error('Initialization failed:', err);
      if (!silent && showToast) showToast('⚠️ 雲端同步失敗');
    }
  },

  deleteItem: async (courseId, dateStr, topic, setCourses, syncToCloud) => {
    if (!window.confirm(`😱 確定要徹底刪除「${topic}」嗎？`)) return;

    setCourses(prev => {
      const newData = { ...prev };
      if (newData[dateStr]) {
        newData[dateStr] = newData[dateStr].filter(c => c.id !== courseId);
      }
      return newData;
    });

    if (syncToCloud) {
        syncToCloud({
            '課程主題 / 類別': topic,
            '狀態': 'DELETED',
            '同步時間': new Date().toLocaleString()
        });
    }
  }
};
