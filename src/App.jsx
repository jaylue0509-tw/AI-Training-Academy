import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, X, Users, CalendarDays, Clock,
  Video, FileText, CheckCircle2, List, Settings, Download,
  Edit3, Save, Eye, TrendingUp, BookOpen, UserPlus,
  BarChart3, Upload, Film, PlayCircle, HeartHandshake,
  Send, Database, Mail
} from 'lucide-react';

// --- 初始資料區 (包含完整課程與模擬報名名單) ---
const INITIAL_COURSES = {
  '2026-3-13': [{ id: 1, topic: '商品短影音生成', instructor: '駱育伊', summary: '【選修-影音生成】學習商品短影音生成技術與實作。', enrolled: 45, maxCapacity: 60, deadline: '2026-03-06', hasVideo: true, enrollees: [{ org: '東森購物', title: '經理', name: '王大明' }] }],
  '2026-3-20': [{ id: 2, topic: 'NotebookLM應用版', instructor: '蔡舜如', summary: '【必修-通識課程】學習 NotebookLM 的應用與實作技巧。', enrolled: 92, maxCapacity: 100, deadline: '2026-03-13', hasVideo: true, enrollees: [{ org: '新媒體', title: '專員', name: '李小華' }] }],
  '2026-3-27': [{ id: 3, topic: 'LINE BOT自動提醒', instructor: '呂紹君', summary: '【選修-行政效率】利用 LINE BOT 提升行政效率，打造自動提醒工具。', enrolled: 60, maxCapacity: 60, deadline: '2026-03-20', hasVideo: false, enrollees: [] }],
  '2026-4-10': [{ id: 4, topic: '自動化短影音工具', instructor: '姜順帆', summary: '【選修-影音生成】自動化短影音工具（高階）與商品行銷影音實戰。', enrolled: 12, maxCapacity: 80, deadline: '2026-04-03', hasVideo: true, enrollees: [] }],
  '2026-4-17': [{ id: 5, topic: 'Python-報表整理', instructor: '王培仲', summary: '【選修-數據分析】使用 Python 進行數據報表整理（初階）。', enrolled: 8, maxCapacity: 100, deadline: '2026-04-10', hasVideo: true, enrollees: [] }],
  '2026-5-8': [{ id: 7, topic: '提示詞大神進階版', instructor: '宋智浩', summary: '【必修-通識課程】進階提示詞(Prompt)撰寫技巧與實戰應用。', enrolled: 0, maxCapacity: 150, deadline: '2026-05-01', hasVideo: true, enrollees: [] }],
  '2026-6-19': [{ id: 10, topic: '數據思維與商業分析', instructor: '外聘講師', summary: '【百度-菁英/資訊】建立全方位的數字化運營與商業數據思維。', enrolled: 1, maxCapacity: 40, deadline: '2026-06-12', hasVideo: false, enrollees: [{ org: '東森購物', title: '經理', name: '王大明' }] }]
};

const ORG_LIST = ['東森購物', '生技(栢馥)', '東森國際', '東森資產', '大陸自然美', '台灣自然美', '新媒體', '民調雲', '東森保代', '寵物雲', '慈愛', '草莓網', '東森房屋', '分眾傳媒', '全球(直消)'];

const INITIAL_VIDEOS = [
  { id: 1, topic: '2026 AI 企業轉型展望', size: '2.4 GB (已自動切片)', views: 1250, clicks: 980, ctr: '78.4%', date: '2026-02-15' },
  { id: 2, topic: 'NotebookLM 應用實作錄影', size: '1.1 GB', views: 420, clicks: 310, ctr: '73.8%', date: '2026-03-21' }
];

// --- 輔助函數：動態計算字體 ---
const getDynamicTextClass = (text) => {
  let weight = 0;
  for (let i = 0; i < text.length; i++) { weight += text.charCodeAt(i) > 255 ? 2 : 1; }
  if (weight >= 22) return 'text-[10px] md:text-[11px] tracking-tighter';
  if (weight >= 16) return 'text-[11px] md:text-xs tracking-tight';
  return 'text-[13px] md:text-sm';
};

export default function App() {
  const [coursesData, setCoursesData] = useState(INITIAL_COURSES);
  const [videosData, setVideosData] = useState(INITIAL_VIDEOS);
  const [wishlist, setWishlist] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
  const [viewMode, setViewMode] = useState('calendar');
  const [adminTab, setAdminTab] = useState('courses');

  const [selectedDayCourses, setSelectedDayCourses] = useState(null);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const [viewingEnrolleesCourse, setViewingEnrolleesCourse] = useState(null);
  const [globalStatCourseId, setGlobalStatCourseId] = useState('');
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [enrollForm, setEnrollForm] = useState({ org: '', title: '', name: '' });
  const [wishForm, setWishForm] = useState({ content: '', org: '', title: '', name: '', email: '' });
  const [uploading, setUploading] = useState({ active: false, progress: 0, status: '' });

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const allCoursesList = useMemo(() => {
    const list = [];
    Object.entries(coursesData).forEach(([dateStr, courses]) => {
      courses.forEach(c => {
        const [y, m, d] = dateStr.split('-');
        list.push({ ...c, dateStr, dateObj: new Date(y, m - 1, d), displayDate: `${y}年${m}月${d}日` });
      });
    });
    return list.sort((a, b) => a.dateObj - b.dateObj);
  }, [coursesData]);

  const selectedGlobalCourse = useMemo(() =>
    allCoursesList.find(c => c.id.toString() === globalStatCourseId),
    [allCoursesList, globalStatCourseId]
  );

  useEffect(() => {
    if (allCoursesList.length > 0 && !globalStatCourseId) {
      setGlobalStatCourseId(allCoursesList[0].id.toString());
    }
  }, [allCoursesList]);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    setCoursesData(prev => {
      const newData = { ...prev };
      const dateKey = selectedCourseForEnroll.dateStr;
      newData[dateKey] = newData[dateKey].map(c =>
        c.id === selectedCourseForEnroll.id
          ? { ...c, enrolled: c.enrolled + 1, enrollees: [...(c.enrollees || []), enrollForm] }
          : c
      );
      return newData;
    });
    showToast("報名成功！資料已同步後端系統。");
    setSelectedCourseForEnroll(null);
  };

  const handleWishSubmit = (e) => {
    e.preventDefault();
    setWishlist(prev => [{ ...wishForm, id: Date.now() }, ...prev]);
    showToast("許願成功！我們已收到您的建議。");
    setWishForm({ content: '', org: '', title: '', name: '', email: '' });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading({ active: true, progress: 0, status: '偵測大檔案 (>1.99GB)，自動切片處理中...' });
    let p = 0;
    const inv = setInterval(() => {
      p += 10;
      setUploading(u => ({ ...u, progress: p }));
      if (p >= 100) {
        clearInterval(inv);
        setVideosData(v => [{ id: Date.now(), topic: file.name.split('.')[0], size: '2.0 GB (自動分段)', views: 0, clicks: 0, ctr: '0%', date: new Date().toISOString().split('T')[0] }, ...v]);
        setUploading({ active: false, progress: 0, status: '' });
        showToast("影片上傳並自動完成 HLS 切片！");
      }
    }, 500);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      showToast("解析 CSV 中並整合資料庫...");
      // 此處為模擬匯入邏輯
      setCoursesData(prev => ({ ...prev }));
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const userStats = useMemo(() => {
    const map = {};
    allCoursesList.forEach(course => {
      let type = '選修';
      if (course.summary.includes('必修')) type = '必修';
      if (course.summary.includes('百度')) type = '百度';
      (course.enrollees || []).forEach(u => {
        const key = `${u.org}-${u.title}-${u.name}`;
        if (!map[key]) map[key] = { ...u, required: [], elective: [], baidu: [], total: 0 };
        if (type === '必修') map[key].required.push(course.topic);
        else if (type === '百度') map[key].baidu.push(course.topic);
        else map[key].elective.push(course.topic);
        map[key].total++;
      });
    });
    return Object.values(map);
  }, [allCoursesList]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-red-100 flex items-center justify-center p-2 md:p-4 font-sans text-gray-800 relative overflow-hidden">
      <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-orange-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-[99%] max-w-[1750px] bg-white/60 backdrop-blur-3xl border border-white/80 shadow-[0_20px_50px_rgba(220,38,38,0.1)] rounded-[3rem] p-4 md:p-8 relative z-10 flex flex-col h-[96vh]">

        {/* --- Header --- */}
        <div className="flex flex-col gap-6 mb-6 shrink-0">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-row items-baseline py-2 relative pl-5 flex-wrap gap-x-6">
              <div className="absolute left-0 top-1 bottom-1 w-2 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
              <h1 className="corporate-art-title text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-orange-700 to-red-600">AI實戰學院</h1>
              <span className="text-sm md:text-lg font-bold tracking-[0.3em] text-red-700/60 uppercase">Enterprise AI Academy</span>
            </div>

            <div className="flex bg-white/50 p-1.5 rounded-full border border-orange-100 shadow-inner backdrop-blur-md overflow-x-auto">
              {[
                { m: 'calendar', i: CalendarDays, l: '月曆檢視', c: 'from-orange-500 to-red-500' },
                { m: 'table', i: List, l: '課程總表', c: 'from-orange-500 to-red-500' },
                { m: 'video', i: Film, l: '課程影片', c: 'from-rose-500 to-pink-600' },
                { m: 'admin', i: Settings, l: '管理後台', c: 'from-gray-700 to-gray-900' }
              ].map(btn => (
                <button
                  key={btn.m} onClick={() => setViewMode(btn.m)}
                  className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 whitespace-nowrap text-base
                  ${viewMode === btn.m ? `bg-gradient-to-r ${btn.c} text-white shadow-lg font-bold scale-105` : 'text-gray-600 hover:text-red-600 font-medium hover:bg-white/40'}`}
                >
                  <btn.i size={20} /> {btn.l}
                </button>
              ))}
            </div>
          </div>

          {/* 速覽儀表板 */}
          {(viewMode === 'calendar' || viewMode === 'table') && (
            <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white/50 p-4 rounded-3xl border border-orange-200/60 shadow-sm backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-center gap-6 w-full flex-1">
                <div className="flex items-center gap-2 text-orange-900 font-black bg-orange-100/80 px-5 py-2.5 rounded-2xl border border-orange-200 shadow-sm">
                  <BarChart3 size={24} className="text-orange-600" /> 全站報名統計
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6 w-full bg-white/80 px-6 py-2.5 rounded-2xl border border-orange-100 shadow-inner">
                  <select
                    value={globalStatCourseId} onChange={(e) => setGlobalStatCourseId(e.target.value)}
                    className="bg-transparent text-gray-800 font-black focus:outline-none cursor-pointer w-full md:max-w-[500px] text-lg"
                  >
                    {allCoursesList.map(c => <option key={c.id} value={c.id}>{c.displayDate.slice(5)} - {c.topic}</option>)}
                  </select>
                  {selectedGlobalCourse && (
                    <div className="flex items-center gap-6 w-full md:w-auto md:border-l border-gray-200 md:pl-6">
                      <div className="flex flex-col min-w-[200px]">
                        <div className="flex justify-between text-xs font-black text-gray-500 mb-1"><span>報名進度</span><span className="text-red-600">{selectedGlobalCourse.enrolled}/{selectedGlobalCourse.maxCapacity}人</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-400 to-red-500" style={{ width: `${(selectedGlobalCourse.enrolled / selectedGlobalCourse.maxCapacity) * 100}%` }}></div></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {viewMode === 'calendar' && (
                <div className="flex space-x-3 w-full xl:w-auto justify-end xl:border-l border-red-200 xl:pl-6">
                  <div className="px-6 py-2.5 font-black text-red-800 bg-orange-50 rounded-2xl border border-orange-100 flex items-center shadow-inner text-lg">{year}年 {month + 1}月</div>
                  <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-3 rounded-2xl bg-white shadow-sm border border-orange-100 text-gray-700 hover:text-red-600"><ChevronLeft size={24} /></button>
                  <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-3 rounded-2xl bg-white shadow-sm border border-orange-100 text-gray-700 hover:text-red-600"><ChevronRight size={24} /></button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- 主內容區 --- */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {viewMode === 'calendar' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-7 gap-4 mb-4 text-center font-black text-red-800/60 text-lg sticky top-0 bg-white/60 backdrop-blur-md py-4 rounded-3xl z-10">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-4 pb-6">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`b-${i}`} className="min-h-[160px] rounded-[2.5rem] bg-white/20 border border-white/40"></div>)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1;
                  const key = `${year}-${month + 1}-${d}`;
                  const c = coursesData[key] || [];
                  const main = c[0];
                  return (
                    <div key={d} onClick={() => main && setSelectedDayCourses({ date: `${year}年${month + 1}月${d}日`, courses: c })}
                      className={`group relative min-h-[160px] rounded-[2.5rem] p-5 flex flex-col cursor-pointer transition-all ${main ? 'bg-white/80 hover:bg-white border border-orange-100 shadow-sm hover:shadow-2xl' : 'bg-white/30 border border-white/50'}`}>
                      <span className={`text-2xl font-black ${main ? 'text-red-800' : 'text-gray-400'}`}>{d}</span>
                      {main && (
                        <div className="mt-auto flex flex-col gap-3 w-full">
                          <div className={`font-black text-orange-900 bg-orange-50/90 px-3 py-2 rounded-xl border border-orange-200/50 whitespace-nowrap overflow-hidden text-center transition-all ${getDynamicTextClass(main.topic)}`}>{main.topic}</div>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedCourseForEnroll({ ...main, dateStr: key }); }}
                            className="w-full py-2.5 text-sm font-black rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md">報名</button>
                        </div>
                      )
                      }
                    </div >
                  );
                })}
              </div >
            </div >
          )
          }

          {
            viewMode === 'table' && (
              <div className="flex-1 flex flex-col xl:flex-row gap-8 min-h-0">
                <div className="flex-1 bg-white/70 border border-orange-100 rounded-[3rem] overflow-hidden flex flex-col relative">
                  <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead className="bg-orange-50/90 backdrop-blur-md sticky top-0 z-20 font-black text-red-900">
                        <tr><th className="p-6">日期</th><th className="p-6">課程主題</th><th className="p-6">講師</th><th className="p-6 text-center">報名人數</th><th className="p-6 text-center">操作</th></tr>
                      </thead>
                      <tbody>
                        {allCoursesList.map((c, i) => (
                          <tr key={c.id} className={`border-b border-orange-100/50 hover:bg-orange-50/40 ${i % 2 === 0 ? 'bg-white/40' : ''}`}>
                            <td className="p-6 font-black text-gray-700 text-xl">{c.displayDate}</td>
                            <td className="p-6 font-black text-red-900 text-2xl">{c.topic}</td>
                            <td className="p-6 font-bold text-gray-700 text-xl flex items-center gap-3 mt-4"><Users size={24} className="text-orange-500" /> {c.instructor}</td>
                            <td className="p-6 text-center"><span className="text-xl font-black">{c.enrolled}/{c.maxCapacity}</span></td>
                            <td className="p-6 text-center"><button onClick={() => setSelectedCourseForEnroll(c)} className="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-black">點擊報名</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="w-full xl:w-[450px] shrink-0 bg-white/80 border border-orange-200 rounded-[3rem] p-10 flex flex-col relative overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-4 mb-8 border-b border-orange-100 pb-6"><HeartHandshake size={44} className="text-pink-600" /><div><h3 className="text-3xl font-black text-red-900">課程許願池</h3><p className="text-sm text-orange-700 font-black">留下想學的內容，我們開課！</p></div></div>
                  <form onSubmit={handleWishSubmit} className="flex flex-col gap-6">
                    <textarea required rows="4" placeholder="想學什麼？" value={wishForm.content} onChange={e => setWishForm({ ...wishForm, content: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-gray-800 font-bold text-lg"></textarea>
                    <select required value={wishForm.org} onChange={e => setWishForm({ ...wishForm, org: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold">{ORG_LIST.map(o => <option key={o} value={o}>{o}</option>)}</select>
                    <input type="text" required placeholder="職稱" value={wishForm.title} onChange={e => setWishForm({ ...wishForm, title: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold" />
                    <input type="text" required placeholder="姓名" value={wishForm.name} onChange={e => setWishForm({ ...wishForm, name: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold" />
                    <input type="email" required placeholder="EMAIL" value={wishForm.email} onChange={e => setWishForm({ ...wishForm, email: e.target.value })} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 font-bold" />
                    <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black py-5 rounded-2xl shadow-xl">送出許願</button>
                  </form>
                </div>
              </div >
            )
          }

          {
            viewMode === 'video' && (
              <div className="flex-1 flex flex-col bg-white/40 border border-orange-100 rounded-[3rem] p-10 overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white/90 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 shrink-0">
                  <div className="flex items-center gap-5"><div className="bg-rose-100 p-5 rounded-3xl"><Film size={40} className="text-rose-600" /></div><div><h2 className="text-3xl font-black">影音知識館</h2><p className="text-base text-gray-500 font-bold">自動切片處理大檔案 (&gt;1.99GB)</p></div></div>
                  <div className="flex gap-5">
                    <input type="file" className="hidden" ref={videoInputRef} onChange={handleVideoUpload} />
                    <button onClick={() => videoInputRef.current.click()} disabled={uploading.active} className="px-8 py-4 bg-white border-2 border-rose-500 text-rose-600 rounded-2xl font-black">上架影片</button>
                    <button onClick={() => showToast("正在同步觀看數據至 Google Sheets...")} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black">同步數據</button>
                  </div>
                </div>
                {uploading.active && <div className="mb-10 p-8 bg-rose-50 rounded-3xl animate-pulse font-black text-rose-800">{uploading.status} {uploading.progress}%</div>}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {videosData.map(v => (
                      <div key={v.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl overflow-hidden group border-b-8 border-b-rose-500">
                        <div className="aspect-video bg-gray-900 flex items-center justify-center cursor-pointer relative"><PlayCircle size={72} className="text-white/80 group-hover:scale-125 transition-transform" /></div>
                        <div className="p-8"><h3 className="font-black text-2xl mb-3">{v.topic}</h3><div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100 space-y-2"><div className="flex justify-between"><span>觀看數</span><span>{v.views}</span></div><div className="flex justify-between font-black text-rose-600"><span>CTR</span><span>{v.ctr}</span></div></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          }

          {
            viewMode === 'admin' && (
              <div className="flex-1 bg-white/80 border border-gray-200 rounded-[3rem] overflow-hidden flex flex-col relative backdrop-blur-3xl">
                <div className="p-8 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200">
                    <button onClick={() => setAdminTab('courses')} className={`px-8 py-3 rounded-xl font-black transition-all ${adminTab === 'courses' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500'}`}>課程管理</button>
                    <button onClick={() => setAdminTab('stats')} className={`px-8 py-3 rounded-xl font-black transition-all ${adminTab === 'stats' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500'}`}>量化統計表</button>
                  </div>
                  <div className="flex gap-4">
                    <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
                    <button onClick={() => fileInputRef.current.click()} className="px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-2xl font-black">匯入課程總表</button>
                  </div>
                </div >
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                  {adminTab === 'stats' ? (
                    <table className="w-full text-center border-collapse bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-indigo-100">
                      <thead className="bg-indigo-100 text-indigo-900 font-black"><tr><th className="p-6 text-left">姓名</th><th className="p-6">必修</th><th className="p-6">選修</th><th className="p-6">百度</th><th className="p-6 bg-indigo-200 text-red-600">累積</th></tr></thead>
                      <tbody>
                        {userStats.map((u, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="p-6 text-left font-black text-2xl">{u.name}<div className="text-xs text-gray-400 font-bold">{u.org} | {u.title}</div></td>
                            <td className="p-6 align-top"><span className="font-black text-blue-600 text-xl block mb-2">{u.required.length}堂</span>{u.required.map(t => <div key={t} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded mb-1">{t}</div>)}</td>
                            <td className="p-6 align-top"><span className="font-black text-emerald-600 text-xl block mb-2">{u.elective.length}堂</span>{u.elective.map(t => <div key={t} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded mb-1">{t}</div>)}</td>
                            <td className="p-6 align-top"><span className="font-black text-purple-600 text-xl block mb-2">{u.baidu.length}堂</span>{u.baidu.map(t => <div key={t} className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded mb-1">{t}</div>)}</td>
                            <td className="p-6 font-black text-red-600 text-5xl align-middle bg-indigo-50/40">{u.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left border-collapse bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100">
                      <thead className="bg-gray-100 text-gray-600 font-black uppercase text-sm"><tr><th className="p-6">課程</th><th className="p-6 text-center">人數</th><th className="p-6 text-center">操作</th></tr></thead>
                      <tbody>
                        {allCoursesList.map(c => (
                          <tr key={c.id} className="border-b border-gray-100">
                            <td className="p-6 font-black text-2xl">{c.topic}<div className="text-xs text-gray-400">{c.displayDate}</div></td>
                            <td className="p-6 text-center font-black text-blue-600 text-3xl">{c.enrolled}</td>
                            <td className="p-6 text-center"><button onClick={() => setViewingEnrolleesCourse(c)} className="px-8 py-3 bg-indigo-50 border-2 border-indigo-200 text-indigo-700 rounded-2xl font-black">名單</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div >
            )
          }
        </div >
      </div >

      {/* --- Toasts & Modals --- */}
      {toast.show && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[200] bg-white border-b-8 border-green-500 px-10 py-6 rounded-3xl shadow-2xl font-black text-2xl animate-bounce">{toast.msg}</div>}

      {
        selectedCourseForEnroll && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-red-900/40 backdrop-blur-xl">
            <div className="bg-white rounded-[3.5rem] p-12 w-full max-w-xl shadow-2xl">
              <h2 className="text-4xl font-black text-red-900 mb-8">{selectedCourseForEnroll.topic}</h2>
              <form onSubmit={handleEnrollSubmit} className="space-y-6">
                <select required className="w-full p-5 border-2 rounded-2xl font-bold" onChange={e => setEnrollForm({ ...enrollForm, org: e.target.value })}><option>選擇事業體</option>{ORG_LIST.map(o => <option key={o}>{o}</option>)}</select>
                <input type="text" placeholder="職稱" required className="w-full p-5 border-2 rounded-2xl font-bold" onChange={e => setEnrollForm({ ...enrollForm, title: e.target.value })} />
                <input type="text" placeholder="姓名" required className="w-full p-5 border-2 rounded-2xl font-bold" onChange={e => setEnrollForm({ ...enrollForm, name: e.target.value })} />
                <button type="submit" className="w-full py-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-2xl rounded-[2rem]">確認報名</button>
              </form>
              <button onClick={() => setSelectedCourseForEnroll(null)} className="mt-4 text-gray-400 font-bold w-full">取消</button>
            </div>
          </div>
        )
      }

      {
        viewingEnrolleesCourse && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center bg-gray-900/60 backdrop-blur-xl">
            <div className="w-full max-w-4xl bg-white rounded-[3.5rem] shadow-2xl p-10 flex flex-col h-[80vh]">
              <div className="flex justify-between items-center border-b pb-8 mb-8"><h2 className="text-4xl font-black text-indigo-900">{viewingEnrolleesCourse.topic} 名單</h2><button onClick={() => setViewingEnrolleesCourse(null)} className="p-4 rounded-full hover:bg-gray-100"><X size={44} /></button></div>
              <div className="flex-1 overflow-y-auto"><table className="w-full text-left"><thead><tr className="text-gray-400 font-black"><th>事業體</th><th>姓名</th></tr></thead>
                <tbody>{viewingEnrolleesCourse.enrollees?.map((u, i) => (<tr key={i} className="border-b h-16 font-black text-xl"><td>{u.org}</td><td>{u.name}</td></tr>))}</tbody></table></div>
            </div>
          </div>
        )
      }

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@900&display=swap');
        .corporate-art-title { font-family: 'Noto Serif TC', serif; letter-spacing: 0.1em; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(220, 38, 38, 0.2); border-radius: 10px; }
      `}} />
    </div>
  );
}
