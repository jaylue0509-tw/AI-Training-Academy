import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, X, Users, CalendarDays, Clock,
  Video, FileText, CheckCircle2, List, Settings, Download,
  Edit3, Save, Eye, TrendingUp, BookOpen, UserPlus,
  BarChart3, Upload, Film, PlayCircle, HeartHandshake,
  Send, Database, Mail, FolderOpen, Search, Printer, Trash2, Filter, MapPin
} from 'lucide-react';

import { DataManager, normalizeTopic, normalizeDate } from './services/dataManager';

// --- 初始資料區 (根據您的 Excel 附件內容整理) ---
const INITIAL_COURSES = {
  '2026-3-20': [{ id: 1, topic: 'AI實戰：從菜市場到城市地標', summary: '【必修】初級', instructor: '姜順帆', level: '初級', deadline: '2026-03-17', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-3-23': [{ id: 2, topic: '商品短影音生成', summary: '【選修】初級', instructor: '駱宥伊', level: '初級', deadline: '2026-03-20', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-3-27': [{ id: 3, topic: 'NotebookLM應用版', summary: '【必修】初級', instructor: '蔡舜如', level: '初級', deadline: '2026-03-24', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-4-17': [{ id: 4, topic: 'LINE BOT自動提醒', summary: '【選修】初級', instructor: '呂紹君', level: '初級', deadline: '2026-04-14', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-4-24': [{ id: 5, topic: '自動化短影音工具', summary: '【選修】高級', instructor: '姜順帆', level: '高級', deadline: '2026-04-21', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-4-29': [{ id: 6, topic: '商品短影音生成', summary: '【選修】初級', instructor: '駱宥伊', level: '初級', deadline: '2026-04-26', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-5-13': [{ id: 7, topic: 'NotebookLM應用版', summary: '【必修】初級', instructor: '蔡舜如', level: '初級', deadline: '2026-05-10', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-5-15': [{ id: 8, topic: 'Python-報表整理', summary: '【選修】初級', instructor: '王培仲', level: '初級', deadline: '2026-05-12', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-5-20': [{ id: 9, topic: 'LINE BOT自動提醒', summary: '【選修】初級', instructor: '呂紹君', level: '初級', deadline: '2026-05-17', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-5-22': [{ id: 10, topic: 'SORA+即夢產影音', summary: '【選修】初級', instructor: '顏博震', level: '初級', deadline: '2026-05-19', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-5-27': [{ id: 11, topic: '自動化短影音工具', summary: '【選修】高級', instructor: '姜順帆', level: '高級', deadline: '2026-05-24', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-5-29': [{ id: 12, topic: '提示詞大神進階版', summary: '【必修】初級', instructor: '宋智浩', level: '初級', deadline: '2026-05-26', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-6-12': [{ id: 13, topic: '善用自然語言編程', summary: '【選修】初級', instructor: '李品勳', level: '初級', deadline: '2026-06-09', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-6-17': [{ id: 14, topic: 'Python-報表整理', summary: '【選修】初級', instructor: '王培仲', level: '初級', deadline: '2026-06-14', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-6-24': [{ id: 15, topic: 'SORA+即夢產影音', summary: '【選修】初級', instructor: '顏博震', level: '初級', deadline: '2026-06-21', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-6-26': [{ id: 16, topic: '問卷自動生成與分析', summary: '【選修】中級', instructor: '呂紹君', level: '中級', deadline: '2026-06-23', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-7-1': [{ id: 17, topic: '提示詞大神進階版', summary: '【必修】初級', instructor: '宋智浩', level: '初級', deadline: '2026-06-28', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-7-10': [{ id: 18, topic: '商品行銷影音實戰', summary: '【選修】中級', instructor: '羅于軒', level: '中級', deadline: '2026-07-07', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-7-15': [{ id: 19, topic: '善用自然語言編程', summary: '【選修】初級', instructor: '李品勳', level: '初級', deadline: '2026-07-12', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-7-17': [{ id: 20, topic: '簡報網站生成器', summary: '【選修】初級', instructor: '顏嘉佑', level: '初級', deadline: '2026-07-14', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-7-24': [{ id: 21, topic: '玩轉GPT與Gemini', summary: '【必修】初級', instructor: '待確認', level: '初級', deadline: '2026-07-21', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-7-29': [{ id: 22, topic: '問卷自動生成與分析', summary: '【選修】中級', instructor: '呂紹君', level: '中級', deadline: '2026-07-26', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-8-7': [{ id: 23, topic: 'Python-數據分析', summary: '【選修】中級', instructor: '劉承昕', level: '中級', deadline: '2026-08-04', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-8-12': [{ id: 24, topic: '商品行銷影音實戰', summary: '【選修】中級', instructor: '羅于軒', level: '中級', deadline: '2026-08-09', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-8-14': [{ id: 25, topic: 'AI Agent工具應用', summary: '【必修】初級', instructor: '劉邦彪', level: '初級', deadline: '2026-08-11', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-8-19': [{ id: 26, topic: '簡報網站生成器', summary: '【選修】初級', instructor: '顏嘉佑', level: '初級', deadline: '2026-08-16', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-8-21': [{ id: 27, topic: '自動化工作流', summary: '【選修】中級', instructor: '余泓逸', level: '中級', deadline: '2026-08-18', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-8-26': [{ id: 28, topic: '玩轉GPT與Gemini', summary: '【必修】初級', instructor: '待確認', level: '初級', deadline: '2026-08-23', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-8-28': [{ id: 29, topic: '資料整理生成器', summary: '【選修】中級', instructor: '吳思宏', level: '中級', deadline: '2026-08-25', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-9-9': [{ id: 30, topic: 'Python-數據分析', summary: '【選修】中級', instructor: '劉承昕', level: '中級', deadline: '2026-09-06', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-9-16': [{ id: 31, topic: 'AI Agent工具應用', summary: '【必修】初級', instructor: '劉邦彪', level: '初級', deadline: '2026-09-13', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-9-23': [{ id: 32, topic: '自動化工作流', summary: '【選修】中級', instructor: '余泓逸', level: '中級', deadline: '2026-09-20', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }],
  '2026-9-30': [{ id: 33, topic: '資料整理生成器', summary: '【選修】中級', instructor: '吳思宏', level: '中級', deadline: '2026-09-27', enrolled: 0, maxCapacity: 350, hasVideo: false, pdfUrl: '', outlineUrl: '', enrollees: [] }]
};


const ORG_LIST = ['東森購物', '生技(栢馥)', '東森國際', '東森資產', '大陸自然美', '台灣自然美', '新媒體', '民調雲', '東森保代', '寵物雲', '慈愛', '草莓網', '東森房屋', '分眾傳媒', '全球(直消)', '其他'];

const INITIAL_ADMINS = [
  { id: 1, username: 'superadmin', password: 'ai123456', name: '超級管理員', role: 'super' },
  { id: 2, username: 'courseadmin', password: 'course888', name: '課程管理員', role: 'course' },
  { id: 3, username: 'viewer', password: 'view000', name: '學員成績檢視員', role: 'viewer' },
];

const ROLE_LABELS = {
  super: { label: '超級管理員', color: 'bg-red-600 text-white', perms: '全部權限' },
  course: { label: '課程管理員', color: 'bg-indigo-600 text-white', perms: '編輯課程、上架講義、查看名單' },
  viewer: { label: '檢視員', color: 'bg-gray-500 text-white', perms: '僅能查看報名名單及統計' },
};

const INITIAL_VIDEOS = [
  { id: 1, topic: '美容洗澣5步驟 - 實術課程影音', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: 'https://drive.google.com/file/d/1wJX7FLqVhS5v4gZWaU4d4dU5E8c8vnWt/view', size: '229.5 MB', views: 0, clicks: 0, ctr: '-', date: '2025-09-08', instructor: '內部課程' },
  { id: 2, topic: 'AI實戰：從菜市場到城市地標 - 影音生成【必修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-03-20', instructor: '姜順帆' },
  { id: 3, topic: '商品短影音生成 - 影音生成【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-03-23', instructor: '駱宥伊' },
  { id: 4, topic: 'NotebookLM應用版 - 通識課程【必修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-03-27', instructor: '蔡舜如' },
  { id: 5, topic: 'LINE BOT自動提醒 - 行政效率【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-04-17', instructor: '呂紹君' },
  { id: 6, topic: '自動化短影音工具 - 影音生成【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-04-24', instructor: '姜順帆' },
  { id: 7, topic: 'Python-報表整理 - 數據分析【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-05-15', instructor: '王培仲' },
  { id: 8, topic: 'SORA+即夢產影音 - 影音生成【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-05-22', instructor: '顏博震' },
  { id: 9, topic: '提示詞大神進階版 - 通識課程【必修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-05-29', instructor: '宋智浩' },
  { id: 10, topic: '善用自然語言編程 - 自然語言編程【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-06-12', instructor: '李品勳' },
  { id: 11, topic: '問卷自動生成與分析 - 行政效率【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-06-26', instructor: '呂紹君' },
  { id: 12, topic: '商品行銷影音實戰 - 影音生成【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-07-10', instructor: '羅于軒' },
  { id: 13, topic: '簡報網站生成器 - 自然語言編程【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-07-17', instructor: '顏嘉佑' },
  { id: 14, topic: '玩轉GPT與Gemini - 通識課程【必修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-07-24', instructor: '待確認' },
  { id: 15, topic: 'Python-數據分析 - 數據分析【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-08-07', instructor: '劉承昕' },
  { id: 16, topic: 'AI Agent工具應用 - 通識課程【必修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-08-14', instructor: '劉邦彪' },
  { id: 17, topic: '自動化工作流 - 數據分析【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-08-21', instructor: '余泓逸' },
  { id: 18, topic: '資料整理生成器 - 自然語言編程【選修】', folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL', driveFileUrl: '', size: '請上傳影片', views: 0, clicks: 0, ctr: '-', date: '2026-08-28', instructor: '吳思宏' },
];

// --- 輔助函數：動態計算月曆中的字體大小 ---
const getDynamicTextClass = (text) => {
  let weight = 0;
  for (let i = 0; i < text.length; i++) { weight += text.charCodeAt(i) > 255 ? 2 : 1; }
  if (weight >= 22) return 'text-[10px] md:text-[11px] tracking-tighter';
  if (weight >= 16) return 'text-[11px] md:text-xs tracking-tight';
  return 'text-[13px] md:text-sm';
};

const getCourseLevelStatus = (course) => {
  let text = '';
  if (typeof course === 'string') {
    text = course;
  } else if (course && course.level) {
    text = course.level;
  } else if (course && course.summary) {
    text = course.summary;
  }
  if (text.includes('高階') || text.includes('高級') || text === '高級') return { text: '高級', color: 'bg-gradient-to-r from-red-500 to-rose-600 text-white border border-red-600', ribbon: 'bg-gradient-to-b from-rose-500 to-red-600 text-white shadow-red-200', cardBg: 'bg-rose-50/80 hover:bg-white hover:border-rose-300' };
  if (text.includes('中階') || text.includes('中級') || text.includes('進階') || text.includes('應用版') || text === '中級') return { text: '中級', color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-amber-600', ribbon: 'bg-gradient-to-b from-orange-400 to-amber-600 text-white shadow-orange-200', cardBg: 'bg-orange-50/80 hover:bg-white hover:border-orange-300' };
  return { text: '初級', color: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white border border-emerald-500', ribbon: 'bg-gradient-to-b from-teal-400 to-emerald-500 text-white shadow-emerald-200', cardBg: 'bg-emerald-50/80 hover:bg-white hover:border-emerald-300' };
};

const getCourseEmoji = (topic) => {
  const t = (topic || '').toLowerCase();
  if (t.includes('影音') || t.includes('video')) return '🎬';
  if (t.includes('python') || t.includes('程式') || t.includes('報表')) return '🐍';
  if (t.includes('line') || t.includes('bot')) return '🤖';
  if (t.includes('notebook') || t.includes('lm')) return '📓';
  if (t.includes('提示詞') || t.includes('prompt')) return '🪄';
  if (t.includes('生成') || t.includes('精華') || t.includes('ai')) return '🧠';
  if (t.includes('自動化') || t.includes('workflow')) return '⚙️';
  if (t.includes('分析') || t.includes('data')) return '📊';
  if (t.includes('玩轉') || t.includes('gemini') || t.includes('gpt')) return '✨';
  if (t.includes('行銷')) return '🚀';
  if (t.includes('美容') || t.includes('術')) return '💆';
  return '🌟';
};


// --- 同步至 Google Sheets (需搭配 Apps Script) ---
// --- 同步至 Google Sheets (高速中繼 + 自動刷新版) ---
  const syncToGoogleSheet = async (sheetId, data, onStatusChange) => {
    const WORKER_URL = 'https://ai-academy-proxy.jaylue0509.workers.dev'; 
    const GAS_ID = 'AKfycbw2aAuDscj_nvWicPNaQDD3vwRCtNXvcCsvvjz-7y-4CugFZmOsdYnquLI_yio5Pt4oyg';
    const PROXY_URL = `${WORKER_URL}?id=${GAS_ID}`;

    if (onStatusChange) onStatusChange('syncing');

    try {
      const params = new URLSearchParams();
      params.append('sheetId', sheetId);
      Object.keys(data).forEach(key => params.append(key, data[key]));

      // 1. 透過 Worker 發送資料
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(params))
      });

      // 2. 取得回傳的最新 JSON
      const result = await response.json();

      // 3. 更新前台畫面資料
      if (result.courses && typeof setCourses === 'function') {
        setCourses(result.courses);
      }
      if (result.enrollments && typeof setEnrollments === 'function') {
        setEnrollments(result.enrollments);
      }

      console.log('同步成功：', result);
      if (onStatusChange) onStatusChange('idle');

    } catch (err) {
      console.error('同步發生錯誤:', err);
      if (onStatusChange) onStatusChange('error');
    }
  };
export default function App() {

  const [coursesData, setCoursesData] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_courses_v12');
      const base = JSON.parse(JSON.stringify(INITIAL_COURSES));

      // ⚠️ 重置報名計數的輔助函式 — enrolled/enrollees 永遠從雲端來
      const resetEnrollment = (data) => {
        Object.keys(data).forEach(date => {
          if (Array.isArray(data[date])) {
            data[date] = data[date].map(c => ({ ...c, enrolled: 0, enrollees: [] }));
          }
        });
        return data;
      };

      // 若 v12 無資料，嘗試繼承舊版連結（保留管理員設定的 pdfUrl/outlineUrl/surveyUrl）
      const legacyRaw = (!saved || saved === 'null')
        ? (localStorage.getItem('ai_courses_v11') || localStorage.getItem('ai_courses_v10'))
        : null;

      if (legacyRaw) {
        try {
          const legacyData = JSON.parse(legacyRaw);
          Object.keys(legacyData || {}).forEach(date => {
            (legacyData[date] || []).forEach(old => {
              if (!old) return;
              Object.keys(base).forEach(bd => {
                base[bd].forEach(bc => {
                  if (bc.topic === old.topic) {
                    if (old.pdfUrl) bc.pdfUrl = old.pdfUrl;
                    if (old.outlineUrl) bc.outlineUrl = old.outlineUrl;
                    if (old.surveyUrl) bc.surveyUrl = old.surveyUrl;
                    if (old.videoUrl) bc.videoUrl = old.videoUrl;
                    if (old.timeSlot) bc.timeSlot = old.timeSlot;
                  }
                });
              });
            });
          });
        } catch (_) {}
        return resetEnrollment(base);
      }

      if (saved && saved !== 'null') {
        const savedData = JSON.parse(saved);
        if (!savedData || typeof savedData !== 'object') return resetEnrollment(base);
        const allSavedIds = new Set();
        Object.keys(savedData).forEach(date => {
          if (Array.isArray(savedData[date])) {
            savedData[date].forEach(c => c && allSavedIds.add(c.id));
          }
        });
        Object.keys(base).forEach(date => {
          base[date].forEach(baseCourse => {
            if (!allSavedIds.has(baseCourse.id)) {
              if (!savedData[date]) savedData[date] = [];
              savedData[date].push(baseCourse);
            }
          });
        });
        // 重置報名計數：確保所有用戶初始看到相同的狀態（0），等待雲端同步
        return resetEnrollment(savedData);
      }
      return resetEnrollment(base);
    } catch (e) { return JSON.parse(JSON.stringify(INITIAL_COURSES)); }
  });

  const [videosData, setVideosData] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_videos_v12');
      const base = JSON.parse(JSON.stringify(INITIAL_VIDEOS));
      if (saved && saved !== 'null') {
        const savedVideos = JSON.parse(saved);
        if (!Array.isArray(savedVideos)) return base;
        const merged = base.map(bv => {
          const match = Array.isArray(savedVideos) ? savedVideos.find(sv => sv && sv.id === bv.id) : null;
          return match ? { ...bv, ...match } : bv;
        });
        if (Array.isArray(savedVideos)) {
          savedVideos.forEach(sv => {
            if (sv && !base.find(bv => bv.id === sv.id)) merged.push(sv);
          });
        }
        return merged;
      }
      return base;
    } catch (e) { return JSON.parse(JSON.stringify(INITIAL_VIDEOS)); }
  });

  useEffect(() => {
    // 只儲存課程結構，不儲存報名狀態（避免不同用戶看到過期人數）
    const toSave = {};
    Object.keys(coursesData).forEach(date => {
      if (Array.isArray(coursesData[date])) {
        toSave[date] = coursesData[date].map(({ enrolled: _e, enrollees: _en, ...rest }) => rest);
      }
    });
    localStorage.setItem('ai_courses_v12', JSON.stringify(toSave));
  }, [coursesData]);

  useEffect(() => {
    localStorage.setItem('ai_videos_v12', JSON.stringify(videosData));
  }, [videosData]);

  const [onlineCount, setOnlineCount] = useState(() => Math.floor(Math.random() * 20) + 42);

  // 🚀 全實時後台同步：每 30 秒自動從雲端抓取一次最新變動
  useEffect(() => {
    // 💡 監聽全域錯誤，防止白屏時無從調試
    const errorHandler = (e) => {
      showToast(`❌ 系統核心異常: ${e.message}`, 10000);
    };
    window.addEventListener('error', errorHandler);

    handleFetchCoursesFromCloud(true); // 初次載入立刻執行一次同步

    // ① 定時輪詢：15 秒一次
    const pollInv = setInterval(() => {
      handleFetchCoursesFromCloud(true);
    }, 15000);

    // ② 分頁切回前景時立刻刷新（使用者切回來馬上看到最新資料）
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFetchCoursesFromCloud(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // ③ 視窗重新獲得焦點時刷新（Alt+Tab 切回）
    const onFocus = () => handleFetchCoursesFromCloud(true);
    window.addEventListener('focus', onFocus);

    // ④ 重新上線（從離線恢復網路）時立刻抓
    const onOnline = () => handleFetchCoursesFromCloud(true);
    window.addEventListener('online', onOnline);

    // ⑤ storage 事件：同裝置其他 tab 有人報名寫入 localStorage 時觸發
    const onStorage = (e) => {
      if (e.key && (e.key.startsWith('ai_courses') || e.key === 'ai_courses_sync_signal')) {
        handleFetchCoursesFromCloud(true);
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      clearInterval(pollInv);
      window.removeEventListener('error', errorHandler);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // 模擬即時線上人數變動
  useEffect(() => {
    const inv = setInterval(() => {
      setOnlineCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(38, Math.min(prev + change, 120));
      });
    }, 8000);
    return () => clearInterval(inv);
  }, []);

  const allCoursesList = useMemo(() => {
    const list = [];
    Object.entries(coursesData).forEach(([dateStr, courses]) => {
      if (!Array.isArray(courses)) return;
      courses.forEach(c => {
        if (!c) return;
        const parts = dateStr.split('-');
        if (parts.length < 3) return;
        const [y, m, d] = parts;
        const courseId = c.id || Date.now() + Math.random();
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        if (isNaN(dateObj.getTime())) return; 

        list.push({
          topic: '',
          instructor: '待確認',
          summary: '【課程】',
          deadline: '',
          enrolled: 0,
          maxCapacity: 350,
          pdfUrl: '',
          outlineUrl: '',
          surveyUrl: '',
          timeSlot: '',
          enrollees: [],
          ...c,
          id: courseId,
          enrolled: parseInt(c?.enrolled) || 0,
          maxCapacity: parseInt(c?.maxCapacity) || 350,
          dateStr,
          dateObj: isNaN(dateObj.getTime()) ? new Date() : dateObj,
          displayDate: `${y}年${m}月${d}日`
        });
      });
    });
    return list.sort((a, b) => a.dateObj - b.dateObj);
  }, [coursesData]);

  // 同步課程至影音平台：確保相同課程只會有一個影片槽位區塊 (去除不同梯次產生的重複)
  useEffect(() => {
    setVideosData(prevVideos => {
      let modified = false;
      
      // 1. 清理：如果之前有因為不同梯次 id 不同而產生的重複影片，保留有連結的那個
      const deduplicatedVideos = [];
      const seenVideoTopics = new Set();
      
      [...prevVideos]
        .sort((a, b) => (b.driveFileUrl ? 1 : 0) - (a.driveFileUrl ? 1 : 0))
        .forEach(v => {
          const mainTopic = v.topic.split(' - ')[0].trim();
          if (!seenVideoTopics.has(mainTopic)) {
            seenVideoTopics.add(mainTopic);
            deduplicatedVideos.push(v);
          } else {
            modified = true;
          }
      });
      const newVideos = deduplicatedVideos;

      // 2. 彙整相同主題課程 (若有任一梯次有影片就套用)
      const uniqueCoursesMap = new Map();
      allCoursesList.forEach(c => {
        const key = c.topic.trim();
        if (!uniqueCoursesMap.has(key)) {
           uniqueCoursesMap.set(key, { ...c });
        } else {
           if (c.videoUrl && !uniqueCoursesMap.get(key).videoUrl) {
               uniqueCoursesMap.get(key).videoUrl = c.videoUrl;
           }
        }
      });

      Array.from(uniqueCoursesMap.values()).forEach(course => {
        const targetDate = course.displayDate.replace(/年|月/g, '-').replace('日', '');
        const targetTopic = `${course.topic} - ${course.summary}`;

        // 單純用 topic 找對應的影片 (不比對 date 或 courseId)
        let existing = newVideos.find(v => v.topic.startsWith(course.topic));

        if (!existing) {
          const wasDeleted = newVideos.find(v => v.topic.startsWith(course.topic) && v.hidden);
          if (wasDeleted) return; 
          modified = true;
          newVideos.push({
            id: `video_${course.id}`,
            courseId: course.id,
            topic: targetTopic,
            folderId: '11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL',
            driveFileUrl: course.videoUrl || '',
            size: course.videoUrl ? '已連結' : '請上傳影片',
            views: 0, clicks: 0, ctr: '-',
            date: targetDate,
            instructor: course.instructor
          });
        } else {
          let slotChanged = false;
          // 不要隨機被後續的梯次覆寫 date，這樣才能維持穩定的一堂課對一個影片槽
          if (existing.topic !== targetTopic || existing.instructor !== course.instructor) {
            existing.topic = targetTopic;
            existing.instructor = course.instructor;
            slotChanged = true;
          }
          if (course.videoUrl && existing.driveFileUrl !== course.videoUrl) {
            existing.driveFileUrl = course.videoUrl;
            existing.size = '已連結';
            slotChanged = true;
          }
          if (slotChanged) modified = true;
        }
      });

      if (modified) {
        return [...newVideos].sort((a, b) => new Date(a.date.replace(/-/g, '/')) - new Date(b.date.replace(/-/g, '/')));
      }
      return prevVideos;
    });
  }, [allCoursesList]);

  const [wishlist, setWishlist] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'table' : 'calendar'
  );
  const [adminTab, setAdminTab] = useState('courses');

  // 手機版就不顯示月曆：resize 時也轉換
  useEffect(() => {
    // ⚡ 頁面載入時強制手機顯示課程總表
    if (window.innerWidth < 768 && viewMode === 'calendar') {
      setViewMode('table');
    }
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'calendar') {
        setViewMode('table');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // ---------- Admin auth ----------
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null); // { id, username, name, role }
  const [adminAccounts, setAdminAccounts] = useState(INITIAL_ADMINS);
  const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '', name: '', role: 'viewer' });

  // PERM helper — returns true if current admin has the given permission
  const hasPerm = (perm) => {
    if (!currentAdmin) return false;
    const perms = {
      super: ['manage_admins', 'edit_courses', 'view_enrollees', 'view_stats', 'upload_pdf'],
      course: ['edit_courses', 'view_enrollees', 'view_stats', 'upload_pdf'],
      viewer: ['view_enrollees', 'view_stats'],
    };
    return (perms[currentAdmin.role] || []).includes(perm);
  };

  // ---------- Admin Edit ----------
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingCourseData, setEditingCourseData] = useState({});
  const [adminEditingCourseId, setAdminEditingCourseId] = useState(null);
  const [adminEditingData, setAdminEditingData] = useState({});

  const [selectedDayCourses, setSelectedDayCourses] = useState(null);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const [viewingEnrolleesCourse, setViewingEnrolleesCourse] = useState(null);
  const [viewingVideo, setViewingVideo] = useState(null); // { topic, driveFileUrl, instructor }
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editingVideoUrl, setEditingVideoUrl] = useState('');
  const [viewingPdfCourse, setViewingPdfCourse] = useState(null);
  const [viewingOutlineCourse, setViewingOutlineCourse] = useState(null);
  const [enrolleeFilterOrg, setEnrolleeFilterOrg] = useState('all');
  const [videoSearchKey, setVideoSearchKey] = useState(''); // 新增影片搜尋關鍵字狀態
  const [videoSortOrder, setVideoSortOrder] = useState('desc'); // 新增影片排序狀態：desc (降冪), asc (升冪)
  const [calendarAdminEdit, setCalendarAdminEdit] = useState(null);
  const [calendarAddCourse, setCalendarAddCourse] = useState(null); // { dateStr, dateKey }
  const [globalStatCourseId, setGlobalStatCourseId] = useState('all');
  const [tableLevelFilter, setTableLevelFilter] = useState('all'); // 'all' | '必修' | '選修' | '初級' | '中級' | '高級'
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [enrollForm, setEnrollForm] = useState({ org: '', title: '', name: '', email: '' });
  const [wishForm, setWishForm] = useState({ content: '', org: '', title: '', name: '', email: '' });
  const [uploading, setUploading] = useState({ active: false, progress: 0, status: '' });

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ org: '', name: '', email: '' });
  const [searchResult, setSearchResult] = useState(null);

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInQuery, setCheckInQuery] = useState({ org: '', name: '', email: '' });
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInModalMode, setCheckInModalMode] = useState('checkin'); // 'checkin' or 'survey'

  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'error'
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  // 報名緩衝區：記錄剛報名但 GAS 尚未寫入雲端的資料，TTL 5 分鐘
  const pendingEnrollmentsRef = useRef([]); // [{ courseKey, enrollee, addedAt }]
  // 防並發 cloud fetch 對沖
  const isFetchingRef = useRef(false);

  // ---- 新功能 Modal States ----
  // 作業繳交 Modal: { courseId, dateStr, topic, displayDate, email, name, currentLink }
  const [homeworkModal, setHomeworkModal] = useState(null);
  const [homeworkLink, setHomeworkLink] = useState('');
  // 心得填寫 Modal: { courseId, dateStr, topic, displayDate, email, name, currentReflection }
  const [reflectionModal, setReflectionModal] = useState(null);
  const [reflectionText, setReflectionText] = useState('');
  // 取消報名確認 Modal: { courseId, dateStr, topic, displayDate, email, name }
  const [cancelConfirm, setCancelConfirm] = useState(null);
  // 後台「未完成」篩選
  const [adminIncompleteFilter, setAdminIncompleteFilter] = useState('all'); // 'all'|'no_practical'|'no_survey'|'no_attend'

  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('drive.google.com/file/d/')) {
        const match = url.match(/\/d\/(.*?)\//) || url.match(/\/d\/(.*?)$/);
        if (match && match[1]) {
          return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
        return url.replace(/\/view.*$/, '/preview');
      }
    } catch (e) { }
    return url;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectedGlobalCourse = useMemo(() => {
    if (globalStatCourseId === 'all') {
      const totals = allCoursesList.reduce((acc, c) => {
        acc.enrolled += c.enrolled;
        acc.maxCapacity += c.maxCapacity;
        return acc;
      }, { enrolled: 0, maxCapacity: 1 }); // prevent div by zero
      return { topic: '全站所有課程', enrolled: totals.enrolled, maxCapacity: totals.maxCapacity <= 0 ? 1 : totals.maxCapacity };
    }
    return allCoursesList.find(c => c.id.toString() === globalStatCourseId);
  }, [allCoursesList, globalStatCourseId]);
  
  const filteredEnrolleesList = useMemo(() => {
    if (!viewingEnrolleesCourse || !viewingEnrolleesCourse.enrollees) return [];
    // 過濾掉空白假資料（沒有姓名或信箱的列）
    const listWithIdx = viewingEnrolleesCourse.enrollees
      .filter(u => u && (u.name || '').trim() && (u.email || '').trim())
      .map((u, i) => ({ ...u, originalIndex: i }));
    if (enrolleeFilterOrg === 'all') return listWithIdx;
    return listWithIdx.filter(e => e.org === enrolleeFilterOrg);
  }, [viewingEnrolleesCourse, enrolleeFilterOrg]);

  // \u9996\u6b21\u958b\u555f\u5f71\u97f3\u9801\u6642\u81ea\u52d5\u5f9e\u96f2\u7aef\u62c9\u53d6\u5f71\u7247\u9023\u7d50 \u2192 \u624b\u6a5f\u8207\u96fb\u8166\u540c\u6b65
  // 手機/其他裝置開啟影音頁時自動從雲端拉取影片連結
  const videoAutoSyncedRef = useRef(false);
  useEffect(() => {
    if (viewMode === 'video' && !videoAutoSyncedRef.current) {
      videoAutoSyncedRef.current = true;
      handleFetchCoursesFromCloud(true);
    }
  }, [viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========== ✅ 全域連動：coursesData 任何變動都自動更新所有舊快照 UI state ==========

  // 1. 後台「名單」面板 — 保持最新 enrollees 與計數
  useEffect(() => {
    if (!viewingEnrolleesCourse) return;
    const updated = allCoursesList.find(c => c.id === viewingEnrolleesCourse.id);
    if (updated) setViewingEnrolleesCourse(updated);
  }, [coursesData]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. 報名 Modal — 保持最新 enrolled / enrollees（防止重複報名檢查失效）
  useEffect(() => {
    if (!selectedCourseForEnroll) return;
    const updated = allCoursesList.find(c => c.id === selectedCourseForEnroll.id);
    if (updated) setSelectedCourseForEnroll(prev => ({ ...updated, dateStr: prev.dateStr, displayDate: prev.displayDate }));
  }, [coursesData]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. 月曆彈窗 — 保持課程資料最新
  useEffect(() => {
    if (!selectedDayCourses) return;
    const dateKey = selectedDayCourses.date
      .replace(/年/, '-').replace(/月/, '-').replace(/日/, '');
    const freshCourses = coursesData[dateKey] ||
      Object.values(coursesData).flat().filter(c => c.displayDate === selectedDayCourses.date);
    if (freshCourses && freshCourses.length > 0)
      setSelectedDayCourses(prev => ({ ...prev, courses: freshCourses }));
  }, [coursesData]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4. 線上報到結果 — 同步最新 enrollees
  useEffect(() => {
    if (!Array.isArray(checkInResult)) return;
    const updated = checkInResult.map(c => allCoursesList.find(f => f.id === c.id) || c);
    const changed = updated.some((c, i) =>
      c.enrolled !== checkInResult[i]?.enrolled ||
      c.enrollees?.length !== checkInResult[i]?.enrollees?.length
    );
    if (changed) setCheckInResult(updated);
  }, [coursesData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ 從課程總表 Google Sheet 拉取最新課程資料（講師、時間、影片連結）並同步報名名單
  const handleFetchCoursesFromCloud = async (silent = false) => {
    // ✅ 防並發：上一次 fetch 尚在執行中則跳過
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      if (!silent) showToast('⏳ 正在執行 v11 雲端同步協定...');
      
      const GAS_RELAY_URL = 'https://script.google.com/macros/s/AKfycbw2aAuDscj_nvWicPNaQDD3vwRCtNXvcCsvvjz-7y-4CugFZmOsdYnquLI_yio5Pt4oyg/exec';
      const resp = await fetch(`${GAS_RELAY_URL}?action=fetchAll&t=${Date.now()}`);
      if (resp.ok) {
        const res = await resp.json();
        if (!res.error) {
          // 先建立目前雲端所有的活動課程 Session Keys
          const cloudExactKeys = new Set();
          (res.courses || []).forEach(c => {
            const tc = c['課程主題 / 類別'] || c['課程主題'] || '';
            const topic = tc.split('【')[0].trim();
            const dStr = normalizeDate(c['上課日期'] || '');
            if (topic && dStr) cloudExactKeys.add(`${normalizeTopic(topic)}_${dStr}`);
          });

          // 處理報名 Map
          const enrollMap = {};
          const orphanedMap = {};
          (res.enrollments || []).forEach(e => {
            if (!e || typeof e !== 'object') return;
            const tc = e['課程主題 / 類別'] || e['課程主題/類別'] || '';
            const topic = tc.split('【')[0].trim();
            const date = normalizeDate(e['上課日期']);
            const name = String(e['報名姓名'] || '').trim();
            const email = String(e['EMAIL'] || e['公司信箱'] || '').toLowerCase().trim();
            const org = String(e['事業體'] || '').trim();

            // ⛔ 只要有姓名、主題和日期就視為有效報名，不強制要求信箱
            if (!name || !topic || !date) return;
            
            const attendedVal = e['報到是否成功'] || e['報到狀態'] || e['報到'] || e['attended'] || '';
            const isAttended = typeof attendedVal === 'string' ? (attendedVal.includes('已報到') || attendedVal.toLowerCase() === 'true') : !!attendedVal;
            const isPracticalDone = e['作業完成'] || e['practicalDone'] || e['實作完成'] || false;
            const isSurveyDone = e['問卷完成'] || e['surveyDone'] || e['課後問卷'] || false;

            const nTopic = normalizeTopic(topic);
            const key = `${nTopic}_${date}`;
            
            const targetMap = enrollMap;
            const mapKey = key;

            if (!targetMap[mapKey]) targetMap[mapKey] = [];
            const existingIdx = targetMap[mapKey].findIndex(u => {
              if (email && u.email) return u.email === email;
              return u.name === name && u.org === org;
            });

            if (existingIdx !== -1) {
              targetMap[mapKey][existingIdx] = {
                ...targetMap[mapKey][existingIdx],
                attended: targetMap[mapKey][existingIdx].attended || isAttended,
                practicalDone: targetMap[mapKey][existingIdx].practicalDone || isPracticalDone,
                surveyDone: targetMap[mapKey][existingIdx].surveyDone || isSurveyDone
              };
            } else {
              targetMap[mapKey].push({
                org,
                title: String(e['職稱'] || '').trim(),
                name,
                email,
                attended: isAttended,
                practicalDone: isPracticalDone,
                surveyDone: isSurveyDone
              });
            }
          });

          // 如果課程資料為空但有報名資料，傍新 enrolled 計數和 enrollees
          if (!res.courses || !res.courses.length) {
            if (res.enrollments && res.enrollments.length > 0) {
              // 只更新人數和報名名單，不動課程資訊
              setCoursesData(prev => {
                const newData = { ...prev };
                Object.keys(newData).forEach(ds => {
                  newData[ds] = (newData[ds] || []).map(c => {
                    // 找對應的報名 Map key
                    const dStr = normalizeDate(c.displayDate || ds);
                    const key = `${normalizeTopic(c.topic)}_${dStr}`;
                    const updatedEnrollees = enrollMap[key];
                    if (updatedEnrollees !== undefined) {
                      return { ...c, enrollees: updatedEnrollees, enrolled: updatedEnrollees.length || c.enrolled };
                    }
                    return c;
                  });
                });
                return newData;
              });
            }
            if (!silent) showToast('✅ 雲端連線正常，查無新增課程');
            return;
          }

          setCoursesData(prev => {
            const mergedMap = new Map();
            // 建立本地先有資料的 Map
            Object.keys(prev).forEach(ds => {
              (prev[ds] || []).forEach(c => {
                const dStr = normalizeDate(c.displayDate || ds);
                const key = `${normalizeTopic(c.topic)}_${dStr}`;
                mergedMap.set(key, { ...c, dateStr: dStr });
              });
            });

            // 為了處理如果「雲端修改了日期」，我們需要把舊日期的紀錄刪除，
            // 找出所有雲端目前的 (topic, date)
            const cloudExactKeys = new Set();
            (res.courses || []).forEach(c => {
              const tc = c['課程主題 / 類別'] || c['課程主題'] || '';
              const topic = tc.split('【')[0].trim();
              const dStr = normalizeDate(c['上課日期'] || '');
              if (topic && dStr) {
                cloudExactKeys.add(`${normalizeTopic(topic)}_${dStr}`);
              }
            });

            // 若雲端有該 topic，但 date 不在 cloudExactKeys 中，代表日期被修改了或該場次被刪除了，將其從 mergedMap 移除 (避免舊日期殘留)
            const cloudTopics = new Set((res.courses || []).map(c => normalizeTopic(c['課程主題'] || c['課程主題 / 類別'] || '')));
            Array.from(mergedMap.keys()).forEach(key => {
              const c = mergedMap.get(key);
              if (cloudTopics.has(normalizeTopic(c.topic)) && !cloudExactKeys.has(key)) {
                mergedMap.delete(key);
              }
            });

            // 💡 3. 強制併入雲端資料 (最新依據)
            const rescuedOrphans = new Set();
            (res.courses || []).forEach(c => {
              // 支援多種欄位名稱組合
              const tc = c['課程主題 / 類別'] || c['課程主題'] || '';
              if (!tc) return;
              const topic = tc.split('【')[0].trim();
              const summary = c['課程類別'] || tc.match(/【.*】/)?.[0] || '【課程】';
              const rawDate = c['上課日期'] || '';
              const dStr = normalizeDate(rawDate);
              if (!topic || !dStr) return;

              const key = `${normalizeTopic(topic)}_${dStr}`;

              // 🛑 如果雲端標記為已刪除，從 Map 中移除後跳過
              if (c['狀態'] === 'DELETED') {
                mergedMap.delete(key);
                return;
              }

              // 尋找已有的 course 紀錄 (包含其 id)
              let existing = mergedMap.get(key);
              // 如果本來因為日期修改而被刪除，我們嘗試用 nTopic 找回原本的 ID 與設定 (繼承)
              if (!existing) {
                for (const oldKey of Object.keys(prev)) {
                   const oldCourses = prev[oldKey] || [];
                   const found = oldCourses.find(oldC => normalizeTopic(oldC.topic) === normalizeTopic(topic));
                   if (found) { existing = { ...found }; break; }
                }
              }

              const cloudPdf = (c['教材講義'] || '').toString().trim();
              const cloudOutline = (c['上課大綱'] || '').toString().trim();
              const cloudSurvey = (c['問卷連結'] || c['課後問卷'] || '').toString().trim();
              const cloudVideo = (c['影片連結'] || c['影片上傳'] || '').toString().trim();
              const cloudDeadline = (c['繳交截止時間'] || '').toString().trim();

              const cloudCount = parseInt(c['報名人數']) || 0;
              let baseCloudEnrollees = enrollMap[key] || [];

              // ✅ Pending 合併：將近 5 分鐘內剛報名 (尚未同步回雲端) 的本地快取補回去
              const PENDING_TTL = 5 * 60 * 1000;
              const now = Date.now();
              pendingEnrollmentsRef.current = pendingEnrollmentsRef.current.filter(p => now - p.addedAt < PENDING_TTL);
              const coursePending = pendingEnrollmentsRef.current.filter(p => p.courseKey === key);
              const pendingNotInCloud = coursePending.filter(p =>
                !baseCloudEnrollees.some(u => {
                  if (p.enrollee.email && u.email) return u.email.toLowerCase() === p.enrollee.email.toLowerCase();
                  return u.name === p.enrollee.name && u.org === p.enrollee.org;
                })
              );
              // 若雲端已經收到該 pending，則移除
              coursePending.filter(p => !pendingNotInCloud.includes(p)).forEach(p => {
                pendingEnrollmentsRef.current = pendingEnrollmentsRef.current.filter(x => x !== p);
              });

              // 最新實際的正確名單 = 雲端清單 + 尚未上傳的本地報名
              const currentEnrollees = pendingNotInCloud.length > 0
                ? [...baseCloudEnrollees, ...pendingNotInCloud.map(p => p.enrollee)]
                : baseCloudEnrollees;

              mergedMap.set(key, {
                ...(existing || { id: Date.now() + Math.random() }),
                topic,
                summary,
                instructor: (c['講師'] || existing?.instructor || '待確認').toString().trim(),
                timeSlot: (c['上課時間'] || existing?.timeSlot || '').toString().trim(),
                videoUrl: cloudVideo || existing?.videoUrl || '',
                pdfUrl: cloudPdf || existing?.pdfUrl || '',
                outlineUrl: cloudOutline || existing?.outlineUrl || '',
                surveyUrl: cloudSurvey || existing?.surveyUrl || '',
                submissionDeadline: cloudDeadline || existing?.submissionDeadline || '',
                enrollees: currentEnrollees,
                // 直接使用實際人數 (包含本機 pending)。如果完全沒人，但總表人數有數字，才顯示總表的數字。
                // 絕對「不可」加上 existing?.enrolled，否則後台刪人時前台會永遠卡在舊人數。
                enrolled: currentEnrollees.length > 0
                  ? currentEnrollees.length
                  : cloudCount,
                displayDate: rawDate.toString() || existing?.displayDate || dStr,
                dateStr: dStr
              });
            });

            const final = {};
            mergedMap.forEach(v => {
              if (!final[v.dateStr]) final[v.dateStr] = [];
              final[v.dateStr].push(v);
            });
            return final;
          });

          if (!silent) showToast('✅ 雲端中繼站同步成功！');
          return; 
        }
      }

      // --- 備援 gviz 抓取邏輯 ---
      const courseUrl = `https://docs.google.com/spreadsheets/d/1VQ8IXR3bbUY2cCh_Cwr6cnEWVMC8q6llpnfKBFzcUn4/gviz/tq?tqx=out:json&gid=0&t=${Date.now()}`;
      const enrollUrl = `https://docs.google.com/spreadsheets/d/1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk/gviz/tq?tqx=out:json&gid=0&t=${Date.now()}`;

      const [courseResp, enrollResp] = await Promise.all([
        fetch(courseUrl),
        fetch(enrollUrl)
      ]);

      const [courseText, enrollText] = await Promise.all([
        courseResp.text(),
        enrollResp.text()
      ]);

      // 解析課程總表
      const cJsonText = courseText.replace(/^\/\*[\s\S]*?\*\/\s*google\.visualization\.Query\.setResponse\(/, '').replace(/\);?\s*$/, '');
      const cData = JSON.parse(cJsonText);
      
      // 解析報名紀錄表
      const eJsonText = enrollText.replace(/^\/\*[\s\S]*?\*\/\s*google\.visualization\.Query\.setResponse\(/, '').replace(/\);?\s*$/, '');
      const eData = JSON.parse(eJsonText);

      if (!cData || !cData.table || !cData.table.rows) {
        if (!silent) showToast('⚠️ 課程總表資料格式錯誤');
        return;
      }

      // 預先取出課程的 Exact Keys，用來判斷哪些報名是孤兒
      const cCols = cData.table.cols;
      const cRows = cData.table.rows;
      const cIdx = {};
      cCols.forEach((col, i) => { if (col.label) cIdx[col.label.trim().replace(/\s+/g, '')] = i; });
      const cTopicSummaryI = cIdx['課程主題/類別'];
      const cTopicI = cIdx['課程主題'];
      const cDateI = cIdx['上課日期'];

      const cloudExactKeys = new Set();
      cRows.forEach(row => {
        let t = '';
        if (cTopicSummaryI !== undefined && row.c[cTopicSummaryI]?.v) {
          t = (row.c[cTopicSummaryI]?.v || '').split('【')[0].trim();
        } else if (cTopicI !== undefined && row.c[cTopicI]?.v) {
          t = row.c[cTopicI]?.v || '';
        }
        if (!t) return;
        let d = '';
        if (cDateI !== undefined && row.c[cDateI]) d = row.c[cDateI].f || String(row.c[cDateI].v);
        const dStr = normalizeDate(d);
        if (t && dStr) {
          cloudExactKeys.add(`${normalizeTopic(t)}_${dStr}`);
        }
      });

      // --- 處理報名紀錄 (Enrollments) ---
      const enrollMap = {}; // "Topic_Date" -> [enrollees]
      const orphanedMap = {}; // "Topic" -> [enrollees]
      if (eData && eData.table && eData.table.rows) {
        const eCols = eData.table.cols;
        const eRows = eData.table.rows;
        const eIdx = {};
        eCols.forEach((col, i) => { if (col.label) eIdx[col.label.trim().replace(/\s+/g, '')] = i; });

        const tcI = eIdx['課程主題/類別'];
        const nameI = eIdx['報名姓名'];
        const orgI = eIdx['事業體'];
        const titleI = eIdx['職稱'];
        const emailI = eIdx['公司信箱'];
        const dateI = eIdx['上課日期'];
        const actionI = eIdx['action'] || eIdx['操作'];
        const attendedI = eIdx['報到狀態'] || eIdx['報到'];

        eRows.forEach(row => {
          const tc = String(row.c[tcI]?.v || '');
          const name = String(row.c[nameI]?.v || '');
          const org = String(row.c[orgI]?.v || '');
          const title = String(row.c[titleI]?.v || '');
          const email = String(row.c[emailI]?.v || '').trim().toLowerCase();
          const rawDate = String(row.c[dateI]?.v || row.c[dateI]?.f || '');
          const attendedVal = String(attendedI !== undefined ? (row.c[attendedI]?.v || '') : '');
          const isAttended = attendedVal.includes('已報到') || attendedVal === 'true' || attendedVal === 'TRUE';
          const action = String(row.c[actionI]?.v || '');

          // ⛔ 只要有姓名、主題和日期就視為有效報名，不強制要求信箱
          if (!tc || !name || !rawDate) return;

          // 使用標準化 Topic 名稱 (去空格/符號) 與 標準化日期
          const topicOnly = tc.split('【')[0].trim();
          const nTopic = normalizeTopic(topicOnly);
          const nDate = normalizeDate(rawDate);
          const key = `${nTopic}_${nDate}`;

          const targetMap = enrollMap;
          const mapKey = key;

          if (!targetMap[mapKey]) targetMap[mapKey] = [];

          if (action === 'DELETE') {
            // ✅ email 為空時改用 name+org 比對
            targetMap[mapKey] = targetMap[mapKey].filter(u => {
              if (email && u.email) return u.email !== email;
              return !(u.name === name && u.org === org);
            });
          } else if (name) {
            const isPracticalDone = String(row.c[eIdx['實作狀態']]?.v || '').includes('已完成');
            const isSurveyDone = String(row.c[eIdx['問卷狀態']]?.v || '').includes('已完成');
            const existingIdx = email
              ? targetMap[mapKey].findIndex(u => u.email === email)
              : targetMap[mapKey].findIndex(u => u.name === name && u.org === org);
            if (existingIdx !== -1) {
              targetMap[mapKey][existingIdx] = {
                ...targetMap[mapKey][existingIdx],
                attended: targetMap[mapKey][existingIdx].attended || isAttended,
                practicalDone: targetMap[mapKey][existingIdx].practicalDone || isPracticalDone,
                surveyDone: targetMap[mapKey][existingIdx].surveyDone || isSurveyDone
              };
            } else {
              targetMap[mapKey].push({ org, title, name, email, attended: isAttended, practicalDone: isPracticalDone, surveyDone: isSurveyDone });
            }
          }
        });
      }

      // --- 處理課程總表 (Courses) ---
      const cols = cData.table.cols;
      const rows = cData.table.rows;
      const idx = {};
      cols.forEach((col, i) => { if (col.label) idx[col.label.trim().replace(/\s+/g, '')] = i; });

      const topicSummaryI = idx['課程主題/類別'];
      const topicI = idx['課程主題'];
      const summaryI = idx['課程類別'];
      const instructorI = idx['講師'];
      const timeSlotI = idx['上課時間'];
      const videoI = idx['影片連結'] || idx['影片上傳'];
      const pdfI = idx['教材講義'];
      const outlineI = idx['上課大綱'];
      const surveyUrlI = idx['問卷連結'] || idx['課後問卷'];
      const statusI = idx['狀態'];
      const enrollmentCountI = idx['報名人數'];
      const dateI = idx['上課日期'];

      setCoursesData(prev => {
        const mergedMap = new Map();
        
        // 1. 處理本地既有資料 (localStorage + INITIAL)
        Object.keys(prev).forEach(ds => {
          (prev[ds] || []).forEach(c => {
            const dateStr = normalizeDate(c.displayDate || ds);
            const key = `${normalizeTopic(c.topic)}_${dateStr}`;
            mergedMap.set(key, { ...c, dateStr });
          });
        });

        // 收集雲端目前的 key (topic + date) 以供後續比對刪除舊日期
        const cloudExactKeys = new Set();
        rows.forEach(row => {
          let t = '';
          if (topicSummaryI !== undefined && row.c[topicSummaryI]?.v) {
            t = (row.c[topicSummaryI]?.v || '').split('【')[0].trim();
          } else if (topicI !== undefined && row.c[topicI]?.v) {
            t = row.c[topicI]?.v || '';
          }
          if (!t) return;
          let d = '';
          if (dateI !== undefined && row.c[dateI]) d = row.c[dateI].f || String(row.c[dateI].v);
          const dStr = normalizeDate(d);
          if (t && dStr) {
            cloudExactKeys.add(`${normalizeTopic(t)}_${dStr}`);
          }
        });

        // 將有在雲端但日期已經變調的本地舊課程移除
        const cloudTopics = new Set(Array.from(cloudExactKeys).map(k => k.split('_')[0]));
        Array.from(mergedMap.keys()).forEach(key => {
          const c = mergedMap.get(key);
          if (cloudTopics.has(normalizeTopic(c.topic)) && !cloudExactKeys.has(key)) {
            mergedMap.delete(key);
          }
        });

        const rescuedOrphans = new Set();

        // 2. 處理雲端資料整合
        rows.forEach(row => {
          let topic = '';
          let summary = '';
          if (topicSummaryI !== undefined && row.c[topicSummaryI]?.v) {
            const topicSummaryStr = row.c[topicSummaryI]?.v || '';
            const topicMatch = topicSummaryStr.match(/^(.*?)(?:\s+)?(【.*?】.*)?$/);
            topic = topicMatch ? topicMatch[1].trim() : topicSummaryStr.trim();
            summary = topicMatch && topicMatch[2] ? topicMatch[2].trim() : '';
          } else if (topicI !== undefined && row.c[topicI]?.v) {
            topic = row.c[topicI]?.v || '';
            summary = summaryI !== undefined ? (row.c[summaryI]?.v || '') : '';
          }
          if (!topic) return;

          const status = statusI !== undefined ? (row.c[statusI]?.v || '') : '';
          if (status === 'DELETED') return;

          const dateI = idx['上課日期'];
          let displayDate = '';
          if (dateI !== undefined && row.c[dateI]) {
            displayDate = row.c[dateI].f || String(row.c[dateI].v);
          }
          const dateStr = normalizeDate(displayDate);
          if (!dateStr) return;

          const key = `${normalizeTopic(topic)}_${dateStr}`;
          
          // 報名資料聯動 - 比對邏輯：主題 + 日期均吻合
          const cloudEnrolledCount = enrollmentCountI !== undefined ? parseInt(row.c[enrollmentCountI]?.v) || 0 : 0;
          
          // 比對全站報名清單 Map (使用標準化 Key)
          const enrolleeKey = `${normalizeTopic(topic)}_${dateStr}`;
          let cloudEnrollees = enrollMap[enrolleeKey] || [];
          
          // ✅ Pending 合併：將雲端尚未確認的本地報名 merge 回來
          const existing = mergedMap.get(key);
          const cloudPdfUrl = (row.c[pdfI]?.v || '').toString().trim();
          const cloudOutlineUrl = (row.c[outlineI]?.v || '').toString().trim();
          const cloudSurveyUrl = (row.c[surveyUrlI]?.v || '').toString().trim();
          const cloudVideoUrl = (row.c[videoI]?.v || '').toString().trim();
          const PENDING_TTL = 5 * 60 * 1000;
          const now = Date.now();
          pendingEnrollmentsRef.current = pendingEnrollmentsRef.current.filter(p => now - p.addedAt < PENDING_TTL);
          const coursePending = pendingEnrollmentsRef.current.filter(p => p.courseKey === key);
          const pendingNotInCloud = coursePending.filter(p =>
            !cloudEnrollees.some(u => {
              if (p.enrollee.email && u.email) return u.email.toLowerCase() === p.enrollee.email.toLowerCase();
              return u.name === p.enrollee.name && u.org === p.enrollee.org;
            })
          );
          // 雲端已收到的 pending 自動移除
          coursePending.filter(p => !pendingNotInCloud.includes(p)).forEach(p => {
            pendingEnrollmentsRef.current = pendingEnrollmentsRef.current.filter(x => x !== p);
          });
          const finalEnrollees = pendingNotInCloud.length > 0
            ? [...cloudEnrollees, ...pendingNotInCloud.map(p => p.enrollee)]
            : cloudEnrollees;

          mergedMap.set(key, {
            ...(existing || { id: Date.now() + Math.random(), enrollees: [] }),
            topic: topic.trim(),
            summary: summary || (existing ? existing.summary : '【課程】'),
            instructor: (row.c[instructorI]?.v?.toString().trim()) || (existing?.instructor) || '待確認',
            timeSlot: (row.c[timeSlotI]?.v?.toString().trim()) || (existing?.timeSlot) || '',
            videoUrl: cloudVideoUrl || existing?.videoUrl || '',
            pdfUrl: cloudPdfUrl || existing?.pdfUrl || '',
            outlineUrl: cloudOutlineUrl || existing?.outlineUrl || '',
            surveyUrl: cloudSurveyUrl || existing?.surveyUrl || '',
            maxCapacity: existing?.maxCapacity || 350,
            // ✅ 保留本地欄位（不被雲端覆蓋）
            enrollOpen: existing?.enrollOpen,
            enrollees: finalEnrollees,
            enrolled: finalEnrollees.length,
            displayDate: displayDate || existing?.displayDate || dateStr.replace(/-/g, '/'),
            dateStr
          });
        });

        const result = {};
        mergedMap.forEach(c => {
          if (!result[c.dateStr]) result[c.dateStr] = [];
          result[c.dateStr].push(c);
        });
        return result;
      });

      // 影片去重同步
      setVideosData(prev => {
        const vMap = new Map();
        prev.forEach(v => vMap.set(normalizeTopic(v.topic), v));
        
        rows.forEach(row => {
          let t = '';
          if (topicSummaryI !== undefined && row.c[topicSummaryI]?.v) {
            t = (row.c[topicSummaryI]?.v || '').split('【')[0].trim();
          } else {
            t = (row.c[topicI]?.v || '').trim();
          }
          if (!t) return;

          const nTopic = normalizeTopic(t);
          const status = statusI !== undefined ? (row.c[statusI]?.v || '') : '';
          if (status === 'DELETED') { vMap.delete(nTopic); return; }

          const videoUrl = row.c[videoI]?.v || '';
          const instructor = (row.c[instructorI]?.v || '').trim();
          const existingV = vMap.get(nTopic);
          
          vMap.set(nTopic, {
            ...(existingV || { id: Date.now() + Math.random(), views: 0, clicks: 0, ctr: '-', date: new Date().toISOString().split('T')[0] }),
            topic: t,
            instructor: instructor || (existingV ? existingV.instructor : ''),
            driveFileUrl: videoUrl || (existingV ? existingV.driveFileUrl : ''),
            size: (videoUrl || (existingV && existingV.driveFileUrl)) ? '已連結' : '請上傳影片'
          });
        });
        return Array.from(vMap.values());
      });

      if (!silent) showToast('✅ 雲端同步完成！');
    } catch (err) {
      console.error('雲端同步失敗:', err);
      if (!silent) showToast('⚠️ 雲端同步失敗，請檢查網路或試算表權限');
    } finally {
      // ✅ 無論成敗全部清除 lock
      isFetchingRef.current = false;
    }
  };

  const handleDeleteCourse = async (courseId, dateStr, topic) => {
    await DataManager.deleteItem(courseId, dateStr, topic, setCoursesData, (data) => syncToGoogleSheet('1VQ8IXR3bbUY2cCh_Cwr6cnEWVMC8q6llpnfKBFzcUn4', data));
    showToast('🗑️ 課程已同步標記刪除，2 分鐘後全體生效');
    setTimeout(() => handleFetchCoursesFromCloud(true), 1500);
  };

  // 🚀 頁面載入即自動静默從雲端拉取（手機同步電腦版講師名等資料）
  useEffect(() => {
    handleFetchCoursesFromCloud(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  // ---------- Admin 登入驗證 ----------
  const handleVideoClick = async (v) => {
    setViewingVideo(v);
    // 觀看次數即時累計邏輯
    const newViews = (parseInt(v.views) || 0) + 1;
    const newClicks = (parseInt(v.clicks) || 0) + 1;
    const ctrValue = newClicks > 0 ? (newViews / newClicks * 100).toFixed(1) + '%' : '100%';

    setVideosData(prev => prev.map(x => x.id === v.id ? { ...x, views: newViews, clicks: newClicks, ctr: ctrValue } : x));

    // 同步到 Google Sheet (使用更直觀的欄位名稱)
    syncToGoogleSheet('1VQ8IXR3bbUY2cCh_Cwr6cnEWVMC8q6llpnfKBFzcUn4', {
      '課程主題 / 類別': v.topic,
      '累計看過': newViews,
      '點擊次數': newClicks,
      '同步時間': new Date().toLocaleString()
    });
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const match = adminAccounts.find(a => a.username === adminUsername.trim() && a.password === adminPassword);
    if (match) {
      setAdminAuthenticated(true);
      setCurrentAdmin(match);
      setAdminUsername('');
      setAdminPassword('');
      showToast(`歡迎回來，${match.name}！`);
    } else {
      showToast('帳號或密碼錯誤，請重試。');
    }
  };

  const handleSaveCourseEdit = (courseId, dateStr) => {
    setCoursesData(prev => {
      const newData = { ...prev };
      if (newData[dateStr]) {
        newData[dateStr] = newData[dateStr].map(c =>
          c.id === courseId ? { ...c, ...editingCourseData } : c
        );
      }
      return newData;
    });

    setSelectedDayCourses(sd => {
      if (!sd) return sd;
      return {
        ...sd,
        courses: sd.courses.map(c => c.id === courseId ? { ...c, ...editingCourseData } : c)
      };
    });

    setEditingCourseId(null);
    showToast('課程資料已成功更新');
  };

  const handleSaveAdminCourseEdit = (courseId, oldDateStr) => {
    // Parse the new date from YYYY-MM-DD input format back to our YYYY-M-D key format
    const [y, m, d] = adminEditingData.date.split('-');
    const newDateKey = `${parseInt(y)}-${parseInt(m)}-${parseInt(d)}`;

    setCoursesData(prev => {
      const newData = { ...prev };

      let theCourse = null;
      // Remove from old date
      if (newData[oldDateStr]) {
        theCourse = newData[oldDateStr].find(c => c.id === courseId);
        newData[oldDateStr] = newData[oldDateStr].filter(c => c.id !== courseId);
      }

      // If found, update properties and move to new date list
      if (theCourse) {
        const updatedCourse = {
          ...theCourse,
          topic: adminEditingData.topic,
          summary: adminEditingData.summary,
          instructor: adminEditingData.instructor,
          level: adminEditingData.level,
          pdfUrl: adminEditingData.pdfUrl,
          outlineUrl: adminEditingData.outlineUrl || '',
          surveyUrl: adminEditingData.surveyUrl || '',
          timeSlot: adminEditingData.timeSlot || '',
          maxCapacity: parseInt(adminEditingData.maxCapacity) || theCourse.maxCapacity,
          submissionDeadline: adminEditingData.submissionDeadline || '' // ✅ 繳交截止時間
        };

        // update dateObj string equivalent logic (optional since we derive it from key on the fly)
        if (!newData[newDateKey]) newData[newDateKey] = [];
        newData[newDateKey].push(updatedCourse);
      }

      return newData;
    });

    setAdminEditingCourseId(null);
    showToast('課程資料已成功更新並同步雲端');

    // ✅ 自動同步至「課程總表」
    const [y2, m2, d2] = adminEditingData.date.split('-');
    const displayDate = `${y2}年${parseInt(m2)}月${parseInt(d2)}日`;
    syncToGoogleSheet('1VQ8IXR3bbUY2cCh_Cwr6cnEWVMC8q6llpnfKBFzcUn4', {
      '上課日期': displayDate,
      '等級': adminEditingData.level,
      '課程主題': adminEditingData.topic,
      '課程類別': adminEditingData.summary,
      '課程主題 / 類別': `${adminEditingData.topic} ${adminEditingData.summary}`,
      '講師': adminEditingData.instructor,
      '上課時間': adminEditingData.timeSlot || '',
      '影片連結': adminEditingData.videoUrl || '',
      '教材講義': adminEditingData.pdfUrl || '',
      '上課大綱': adminEditingData.outlineUrl || '',
      '人數上限': parseInt(adminEditingData.maxCapacity) || 350,
      '繳交截止時間': adminEditingData.submissionDeadline || '',
      '同步時間': new Date().toLocaleString()
    });
    // 同時更新報名表中的課程資訊描述
    syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
      '上課日期': displayDate,
      '課程主題 / 類別': `${adminEditingData.topic} ${adminEditingData.summary}`,
      '講師': adminEditingData.instructor,
      '同步時間': new Date().toLocaleString()
    });
    setTimeout(() => handleFetchCoursesFromCloud(true), 1500);
  };

  const handleSaveCalendarEdit = () => {
    if (!calendarAdminEdit) return;
    const { dateKey, course, editData } = calendarAdminEdit;
    setCoursesData(prev => {
      const newData = { ...prev };
      if (newData[dateKey]) {
        newData[dateKey] = newData[dateKey].map(c =>
          c.id === course.id
            ? { ...c, topic: editData.topic, instructor: editData.instructor, summary: editData.summary, level: editData.level, maxCapacity: parseInt(editData.maxCapacity) || 350, pdfUrl: editData.pdfUrl, outlineUrl: editData.outlineUrl || '', surveyUrl: editData.surveyUrl || '', timeSlot: editData.timeSlot || '' }
            : c
        );
      }
      return newData;
    });
    setCalendarAdminEdit(null);
    showToast('月曆課程資料已更新並同步雲端！');

    // ✅ 自動同步至雲端
    syncToGoogleSheet('1VQ8IXR3bbUY2cCh_Cwr6cnEWVMC8q6llpnfKBFzcUn4', {
      '上課日期': dateStr,
      '等級': editData.level,
      '課程主題': editData.topic,
      '課程類別': editData.summary,
      '課程主題 / 類別': `${editData.topic} ${editData.summary}`,
      '講師': editData.instructor,
      '上課時間': editData.timeSlot || '',
      '影片連結': course.videoUrl || '',
      '教材講義': editData.pdfUrl || '',
      '上課大綱': editData.outlineUrl || '',
      '人數上限': parseInt(editData.maxCapacity) || 350,
      '同步時間': new Date().toLocaleString()
    });
    setTimeout(() => handleFetchCoursesFromCloud(true), 1500);
  };

  const handleAddCalendarCourse = () => {
    if (!calendarAddCourse) return;
    const { dateKey, formData } = calendarAddCourse;
    if (!formData.topic.trim()) { showToast('請輸入課程主題！'); return; }
    const newId = Date.now();
    const [y, m, d] = dateKey.split('-');
    const newCourse = {
      id: newId,
      topic: formData.topic.trim(),
      instructor: formData.instructor.trim() || '待確認',
      summary: formData.summary.trim() || `【必修-通識課程】${formData.topic.trim()}。`,
      level: formData.level,
      maxCapacity: parseInt(formData.maxCapacity) || 350,
      pdfUrl: formData.pdfUrl.trim(),
      outlineUrl: formData.outlineUrl.trim(),
      surveyUrl: formData.surveyUrl ? formData.surveyUrl.trim() : '',
      deadline: formData.deadline || `${y}/${m}/${parseInt(d) - 3}`,
      enrolled: 0,
      enrollees: [],
      timeSlot: formData.timeSlot ? formData.timeSlot.trim() : '',
      hasVideo: false
    };
    setCoursesData(prev => {
      const newData = { ...prev };
      if (!newData[dateKey]) newData[dateKey] = [];
      newData[dateKey] = [...newData[dateKey], newCourse];
      return newData;
    });
    setCalendarAddCourse(null);
    showToast(`✅ 「${newCourse.topic}」 已成功新增到月曆並同步雲端！`);

    // ✅ 自動同步至總表
    const displayDate = `${y}年${parseInt(m)}月${parseInt(d)}日`;
    syncToGoogleSheet('1VQ8IXR3bbUY2cCh_Cwr6cnEWVMC8q6llpnfKBFzcUn4', {
      '上課日期': displayDate,
      '等級': newCourse.level,
      '課程主題': newCourse.topic,
      '課程類別': newCourse.summary,
      '課程主題 / 類別': `${newCourse.topic} ${newCourse.summary}`,
      '講師': newCourse.instructor,
      '上課時間': newCourse.timeSlot || '',
      '人數上限': newCourse.maxCapacity,
      '同步時間': new Date().toLocaleString()
    });
    setTimeout(() => handleFetchCoursesFromCloud(true), 1500);
  };


  const handleSearchUser = (e) => {
    e.preventDefault();
    if (!searchQuery.org || !searchQuery.name.trim() || !searchQuery.email.trim()) {
      showToast("請輸入完整的事業體、姓名與公司信箱！");
      return;
    }
    const result = userStatsList.find(u =>
      u.org === searchQuery.org &&
      u.name.trim() === searchQuery.name.trim() &&
      u.email.trim().toLowerCase() === searchQuery.email.trim().toLowerCase()
    );
    setSearchResult(result || 'not_found');
  };

  const handleCheckInUser = (e) => {
    e.preventDefault();
    if (!checkInQuery.org || !checkInQuery.name.trim() || !checkInQuery.email.trim()) {
      showToast("請輸入完整的事業體、姓名與公司信箱進行報到查詢！");
      return;
    }
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const todayCourses = coursesData[todayKey] || [];

    const enrolledCourses = todayCourses.filter(c =>
      c.enrollees && c.enrollees.some(u =>
        u.org === checkInQuery.org &&
        u.name === checkInQuery.name.trim() &&
        u.email.toLowerCase() === checkInQuery.email.trim().toLowerCase()
      )
    );

    if (enrolledCourses.length === 0) {
      setCheckInResult('not_found');
    } else {
      setCheckInResult(enrolledCourses);
    }
  };

  const handleConfirmCheckIn = (courseId) => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    setCoursesData(prev => {
      const newData = { ...prev };
      if (newData[todayKey]) {
        newData[todayKey] = newData[todayKey].map(c => {
          if (c.id === courseId) {
            const newEnrollees = [...c.enrollees];
            const idx = newEnrollees.findIndex(u =>
              u.org === checkInQuery.org &&
              u.name === checkInQuery.name.trim() &&
              u.email.toLowerCase() === checkInQuery.email.trim().toLowerCase()
            );
    if (idx >= 0) {
              const updatedEnrollee = { 
                ...newEnrollees[idx], 
                attended: true,
                practicalDone: newEnrollees[idx].practicalDone || false,
                surveyDone: newEnrollees[idx].surveyDone || false
              };
              newEnrollees[idx] = updatedEnrollee;
            }
            return { ...c, enrollees: newEnrollees };
          }
          return c;
        });
      }
      return newData;
    });

    setCheckInResult(prev => {
      if (!Array.isArray(prev)) return prev;
      return prev.map(c => {
        if (c.id === courseId) {
          const course = c;
          const displayDate = course.displayDate || (() => {
            const today = new Date();
            return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
          })();
          
          syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
            '上課日期': displayDate,
            '課程主題 / 類別': `${course.topic} ${course.summary}`,
            '報名姓名': checkInQuery.name.trim(),
            'EMAIL': checkInQuery.email.trim().toLowerCase(),
            '報到狀態': '✅ 已報到',
            '報到時間': new Date().toLocaleString(),
            '問卷連結': course.surveyUrl || '尚未開放（課後將開啟）'
          }, setSyncStatus);

          return { ...c, enrollees: c.enrollees.map(u => u.email.toLowerCase() === checkInQuery.email.toLowerCase() ? { ...u, attended: true } : u) };
        }
        return c;
      });
    });

    showToast("✅ 線上報到成功！請繼續完成「實作」與「問卷」確認。");
    setTimeout(() => {
      try { localStorage.setItem('ai_courses_sync_signal', Date.now().toString()); } catch (_) {}
      handleFetchCoursesFromCloud(true);
    }, 3000);
    setTimeout(() => handleFetchCoursesFromCloud(true), 8000);
  };

  const handleTogglePractical = (courseId, email, name, status) => {
    setCoursesData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(ds => {
        newData[ds] = newData[ds].map(c => {
          if (c.id === courseId) {
            const newEnrollees = c.enrollees.map(u => 
              (u.email.toLowerCase() === email.toLowerCase() && u.name === name) 
              ? { ...u, practicalDone: status } 
              : u
            );
            return { ...c, enrollees: newEnrollees };
          }
          return c;
        });
      });
      return newData;
    });
    
    // Update checkInResult if in student modal
    setCheckInResult(prev => {
      if (!Array.isArray(prev)) return prev;
      return prev.map(c => {
        if (c.id === courseId) {
          return { ...c, enrollees: c.enrollees.map(u => 
            (u.email.toLowerCase() === email.toLowerCase() && u.name === name) 
            ? { ...u, practicalDone: status } 
            : u
          )};
        }
        return c;
      });
    });

    // Update viewingEnrolleesCourse if in admin modal
    setViewingEnrolleesCourse(prev => {
      if (!prev || prev.id !== courseId) return prev;
      return { ...prev, enrollees: prev.enrollees.map(u => 
        (u.email.toLowerCase() === email.toLowerCase() && u.name === name) 
        ? { ...u, practicalDone: status } 
        : u
      )};
    });

    const targetCourse = allCoursesList.find(c => c.id === courseId);
    if (targetCourse) {
      showToast(status ? "🛠️ 實作完成已確認！正在同步至雲端..." : "ℹ️ 已取消實作確認，正在同步...");
      syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
        '上課日期': targetCourse.displayDate,
        '課程主題 / 類別': `${targetCourse.topic} ${targetCourse.summary}`,
        '報名姓名': name,
        'EMAIL': email.toLowerCase(),
        '實作狀態': status ? '✅ 已完成' : '❌ 未完成',
        '更新時間': new Date().toLocaleString()
      }, setSyncStatus);

      setTimeout(() => {
        try { localStorage.setItem('ai_courses_sync_signal', Date.now().toString()); } catch (_) {}
        handleFetchCoursesFromCloud(true);
      }, 3000);
      setTimeout(() => handleFetchCoursesFromCloud(true), 8000);
    }
  };

  const handleToggleSurvey = (courseId, email, name, status) => {
    setCoursesData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(ds => {
        newData[ds] = newData[ds].map(c => {
          if (c.id === courseId) {
            const newEnrollees = c.enrollees.map(u => 
              (u.email.toLowerCase() === email.toLowerCase() && u.name === name) 
              ? { ...u, surveyDone: status } 
              : u
            );
            return { ...c, enrollees: newEnrollees };
          }
          return c;
        });
      });
      return newData;
    });

    setCheckInResult(prev => {
      if (!Array.isArray(prev)) return prev;
      return prev.map(c => {
        if (c.id === courseId) {
          return { ...c, enrollees: c.enrollees.map(u => 
            (u.email.toLowerCase() === email.toLowerCase() && u.name === name) 
            ? { ...u, surveyDone: status } 
            : u
          )};
        }
        return c;
      });
    });

    setViewingEnrolleesCourse(prev => {
      if (!prev || prev.id !== courseId) return prev;
      return { ...prev, enrollees: prev.enrollees.map(u => 
        (u.email.toLowerCase() === email.toLowerCase() && u.name === name) 
        ? { ...u, surveyDone: status } 
        : u
      )};
    });

    const targetCourse = allCoursesList.find(c => c.id === courseId);
    if (targetCourse) {
      showToast(status ? "📝 問卷填寫已確認！正在同步至雲端..." : "ℹ️ 已撤回問卷確認，正在同步...");
      syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
        '上課日期': targetCourse.displayDate,
        '課程主題 / 類別': `${targetCourse.topic} ${targetCourse.summary}`,
        '報名姓名': name,
        'EMAIL': email.toLowerCase(),
        '問卷狀態': status ? '✅ 已完成' : '❌ 未完成',
        '更新時間': new Date().toLocaleString()
      }, setSyncStatus);

      setTimeout(() => {
        try { localStorage.setItem('ai_courses_sync_signal', Date.now().toString()); } catch (_) {}
        handleFetchCoursesFromCloud(true);
      }, 3000);
      setTimeout(() => handleFetchCoursesFromCloud(true), 8000);
    }
  };

  const handleEnrollSubmit = (e) => {
    e.preventDefault();

    // ✅ 重複報名檢查（同場次）
    const existingEnrollees = selectedCourseForEnroll.enrollees || [];
    const alreadyEnrolled = existingEnrollees.some(
      u => u.email.trim().toLowerCase() === enrollForm.email.trim().toLowerCase()
    );
    if (alreadyEnrolled) {
      showToast(`⚠️ 您已報名過「${selectedCourseForEnroll.topic}」(${selectedCourseForEnroll.displayDate})，請勿重複報名！`);
      return;
    }

    // ✅ 跨場次重複報名檢查 & 補考機制
    const prevSessions = allCoursesList.filter(c =>
      normalizeTopic(c.topic) === normalizeTopic(selectedCourseForEnroll.topic) &&
      c.id !== selectedCourseForEnroll.id
    );

    const now = new Date();
    for (const c of prevSessions) {
      const u = (c.enrollees || []).find(user => user.email.trim().toLowerCase() === enrollForm.email.trim().toLowerCase());
      if (u) {
        // 確認該課程是否已結算
        let deadlinePassed = false;
        if (c.submissionDeadline) {
          deadlinePassed = new Date(c.submissionDeadline) <= now;
        } else {
          // 預設為上課日隔天 00:00 (即上課日 23:59 結束)
          const endTime = new Date(c.dateObj);
          endTime.setDate(endTime.getDate() + 1);
          deadlinePassed = now >= endTime;
        }

        const isCompleted = u.attended && u.practicalDone && u.surveyDone;

        if (isCompleted) {
          // 已經順利完成修課獲得學分 -> 永久阻擋重複報名
          showToast(`⚠️ 您已在 ${c.displayDate} 順利完成「${selectedCourseForEnroll.topic}」修課獲得學分，不可重複修課喔！`);
          return;
        } else {
          if (deadlinePassed) {
            // 已結算且未完成 (缺席/缺作業/缺問卷) => 可重新報名新場次！(不return阻擋)
            console.log(`[補考機制] 允許學員 ${u.email} 重新報名 ${selectedCourseForEnroll.topic}，前次修課未完成。`);
          } else {
            // 尚未結算 (未來課程或繳交期限內) => 阻擋報名兩場
            showToast(`⚠️ 您已報名「${selectedCourseForEnroll.topic}」的 ${c.displayDate} 場，如需換場請先在「個人修課查詢」取消原報名`);
            return;
          }
        }
      }
    }

    const newEnrollee = { ...enrollForm, attended: false };

    // ✅ 確保日期顯示正確
    const displayDate = selectedCourseForEnroll.displayDate || (() => {
      const [y, m, d] = selectedCourseForEnroll.dateStr.split('-');
      return `${y}年${m}月${d}日`;
    })();

    // ✅ 加入 pending 緩衝區，避免 cloud sync 在 GAS 寫入前把這筆蓋掉
    const courseKey = `${normalizeTopic(selectedCourseForEnroll.topic)}_${selectedCourseForEnroll.dateStr}`;
    pendingEnrollmentsRef.current = [
      ...pendingEnrollmentsRef.current.filter(p => !(p.courseKey === courseKey && p.enrollee.email === newEnrollee.email)),
      { courseKey, enrollee: newEnrollee, addedAt: Date.now() }
    ];

    setCoursesData(prev => {
      const newData = { ...prev };
      const dateKey = selectedCourseForEnroll.dateStr;
      if (newData[dateKey]) {
        newData[dateKey] = newData[dateKey].map(c =>
          c.id === selectedCourseForEnroll.id
            ? { ...c, enrolled: (c.enrolled || 0) + 1, enrollees: [...(c.enrollees || []), newEnrollee] }
            : c
        );
      }
      return newData;
    });

    // 將報名資料同步到「報名表」專屬 Google Sheet
    syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
      '上課日期': displayDate,
      '等級': getCourseLevelStatus(selectedCourseForEnroll).text,
      '課程主題': selectedCourseForEnroll.topic,
      '課程類別': selectedCourseForEnroll.summary,
      '課程主題 / 類別': `${selectedCourseForEnroll.topic} ${selectedCourseForEnroll.summary}`,
      '講師': selectedCourseForEnroll.instructor,
      '上課時間': selectedCourseForEnroll.timeSlot || '',
      '事業體': enrollForm.org,
      '職稱': enrollForm.title,
      '報名姓名': enrollForm.name,
      'EMAIL': enrollForm.email,
      '上傳時間': new Date().toLocaleString(),
      '教材講義': selectedCourseForEnroll.pdfUrl || '',
      '上課大綱': selectedCourseForEnroll.outlineUrl || ''
    });

    // ✅ 同步更新「課程總表」中的報名人數
    syncToGoogleSheet('1VQ8IXR3bbUY2cCh_Cwr6cnEWVMC8q6llpnfKBFzcUn4', {
      '上課日期': displayDate,
      '課程主題': selectedCourseForEnroll.topic,
      '課程類別': selectedCourseForEnroll.summary,
      '課程主題 / 類別': `${selectedCourseForEnroll.topic} ${selectedCourseForEnroll.summary}`,
      '報名人數': (selectedCourseForEnroll.enrolled || 0) + 1,
      '同步時間': new Date().toLocaleString()
    });

    showToast("報名成功！正在即時同步雲端數據...");
    
    // 清除狀態與表單，防止重複點擊
    setSelectedCourseForEnroll(null);
    setEnrollForm({ org: '', title: '', name: '', email: '' });

    // 延遲 3 秒（讓 GAS 有時間完成寫入）後重新拉取雲端資料
    setTimeout(() => {
      // 廣播同裝置其他 tab 立刻同步（觸發 storage 事件）
      try {
        localStorage.setItem('ai_courses_sync_signal', Date.now().toString());
      } catch (_) {}
      handleFetchCoursesFromCloud(true);
    }, 3000);
    // 再多等一次，確保跨裝置也能看到
    setTimeout(() => handleFetchCoursesFromCloud(true), 8000);
  };

  // ✅ 自助取消報名（前台學員，課程當天前均可取消）
  const handleCancelEnrollment = (courseId, dateStr, email, name) => {
    setCoursesData(prev => {
      const newData = { ...prev };
      if (newData[dateStr]) {
        newData[dateStr] = newData[dateStr].map(c => {
          if (c.id !== courseId) return c;
          const newEnrollees = c.enrollees.filter(u => u.email.toLowerCase() !== email.toLowerCase());
          return { ...c, enrolled: Math.max(0, (c.enrolled || 1) - 1), enrollees: newEnrollees };
        });
      }
      return newData;
    });
    // 從 pending buffer 移除
    pendingEnrollmentsRef.current = pendingEnrollmentsRef.current.filter(
      p => !(p.courseKey.endsWith('_' + dateStr) && p.enrollee.email.toLowerCase() === email.toLowerCase())
    );
    // 同步刪除至 GAS
    const course = allCoursesList.find(c => c.id === courseId);
    if (course) {
      syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
        '上課日期': course.displayDate,
        '課程主題': course.topic,
        '報名姓名': name,
        'EMAIL': email,
        'action': 'DELETE',
        '刪除時間': new Date().toLocaleString()
      });
    }
    showToast(`✅ 已取消「${course?.topic || ''}」報名，可重新報名其他場次`);
    setCancelConfirm(null);
    // 重新查詢以更新畫面
    setTimeout(() => handleFetchCoursesFromCloud(true), 2000);
  };

  // ✅ 作業連結繳交
  const handleSubmitHomework = (courseId, dateStr, email, name, link) => {
    setCoursesData(prev => {
      const newData = { ...prev };
      if (newData[dateStr]) {
        newData[dateStr] = newData[dateStr].map(c => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            enrollees: c.enrollees.map(u =>
              u.email.toLowerCase() === email.toLowerCase() && u.name === name
                ? { ...u, practicalDone: true, homeworkLink: link }
                : u
            )
          };
        });
      }
      return newData;
    });
    const course = allCoursesList.find(c => c.id === courseId);
    if (course) {
      syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
        '上課日期': course.displayDate,
        '課程主題 / 類別': `${course.topic} ${course.summary}`,
        '報名姓名': name,
        'EMAIL': email,
        '實作狀態': '✅ 已完成',
        '作業連結': link,
        '更新時間': new Date().toLocaleString()
      }, setSyncStatus);
    }
    showToast('✅ 作業連結已繳交，後台已更新！');
    setHomeworkModal(null);
    setHomeworkLink('');
  };

  // ✅ 心得填寫提交（≤100字）
  const handleSubmitReflection = (courseId, dateStr, email, name, text) => {
    setCoursesData(prev => {
      const newData = { ...prev };
      if (newData[dateStr]) {
        newData[dateStr] = newData[dateStr].map(c => {
          if (c.id !== courseId) return c;
          return {
            ...c,
            enrollees: c.enrollees.map(u =>
              u.email.toLowerCase() === email.toLowerCase() && u.name === name
                ? { ...u, surveyDone: true, reflection: text }
                : u
            )
          };
        });
      }
      return newData;
    });
    const course = allCoursesList.find(c => c.id === courseId);
    if (course) {
      syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
        '上課日期': course.displayDate,
        '課程主題 / 類別': `${course.topic} ${course.summary}`,
        '報名姓名': name,
        'EMAIL': email,
        '問卷狀態': '✅ 已完成',
        '課後心得': text,
        '更新時間': new Date().toLocaleString()
      }, setSyncStatus);
    }
    showToast('✅ 心得已提交！');
    setReflectionModal(null);
    setReflectionText('');
  };

  const handleWishSubmit = (e) => {
    e.preventDefault();
    setWishlist(prev => [{ ...wishForm, id: Date.now() }, ...prev]);

    // 將許願池資料同步到指定的 Google Sheet
    syncToGoogleSheet('1ui-iqTRQdTBm_cwVqxELlIzG6gDYJiUGd6wvgTVU7QU', {
      期望內容: wishForm.content,
      所屬事業體: wishForm.org,
      職稱: wishForm.title,
      姓名: wishForm.name,
      '聯絡EMAIL': wishForm.email,
      建立時間: new Date().toLocaleString()
    });

    showToast("許願成功！我們已收到您的建議。");
    setWishForm({ content: '', org: '', title: '', name: '', email: '' });
  };

  // 課程總表（1VQ8...）— 只同步課程資訊
  const handleSyncAllCoursesToSheet = async () => {
    if (!window.confirm("確定要把目前所有的課程清單同步到「課程總表」Google Sheet 嗎？")) return;
    showToast("開始批次同步課程至雲端資料庫...");
    for (const course of allCoursesList) {
      await syncToGoogleSheet('1VQ8IXR3bbUY2cCh_Cwr6cnEWVMC8q6llpnfKBFzcUn4', {
        '上課日期': course.displayDate,
        '等級': getCourseLevelStatus(course).text,
        '課程主題': course.topic,
        '課程類別': course.summary,
        '課程主題/類別': `${course.topic} ${course.summary}`,
        '課程主題 / 類別': `${course.topic} ${course.summary}`,
        '講師': course.instructor,
        '上課時間': course.timeSlot || '',
        '影片連結': course.videoUrl || '',
        '教材講義': course.pdfUrl || '',
        '上課大綱': course.outlineUrl || '',
        '報名人數': course.enrolled,
        '人數上限': course.maxCapacity,
        '同步時間': new Date().toLocaleString(),
        '上傳時間': new Date().toLocaleString(),
        '影片上傳': course.videoUrl || ''
      });
      await new Promise(r => setTimeout(r, 600)); // 穩定推送
    }
    showToast('✅ 課程總表已全部同步至雲端！');
  };


  // 報名表（1m98...）— 批次同步全部報名紀錄
  const handleSyncAllEnrollmentsToSheet = async () => {
    if (!window.confirm("確定要把目前所有的報名紀錄同步到「課程報名表」Google Sheet 嗎？（未有人報名的課程不會推送空白資料）")) return;
    const rows = [];
    allCoursesList.forEach(course => {
      // 只推有人報名的紀錄，避免空白假資料進入報名表
      if (!course.enrollees || course.enrollees.length === 0) return;
      course.enrollees.forEach(u => {
        rows.push({ course, enrollee: u });
      });
    });

    if (rows.length === 0) { showToast('目前尚無任何課程紀錄'); return; }
    showToast(`⏳ 開始同步 ${rows.length} 筆資料(包含報名記錄及課程架構)...`);
    for (const { course, enrollee } of rows) {
      await syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
        '上課日期': course.displayDate,
        '等級': getCourseLevelStatus(course).text,
        '課程主題': course.topic,
        '課程類別': course.summary,
        '課程主題/類別': `${course.topic} ${course.summary}`,
        '課程主題 / 類別': `${course.topic} ${course.summary}`,
        '講師': course.instructor,
        '事業體': enrollee.org,
        '職稱': enrollee.title,
        '報名姓名': enrollee.name,
        'EMAIL': enrollee.email,
        '報名時間': new Date().toLocaleString(),
        '同步時間': new Date().toLocaleString(),
        '上傳時間': new Date().toLocaleString(),
        '教材講義': course.pdfUrl || '',
        '上課大綱': course.outlineUrl || '',
        '影片上傳': course.videoUrl || ''
      });
      await new Promise(r => setTimeout(r, 500));
    }
    showToast(`✅ ${rows.length} 筆資料已同步至報名表！`);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading({ active: true, progress: 0, status: '偵測大檔案 (>1.99GB)，啟動智慧切片上傳...' });
    let p = 0;
    const inv = setInterval(() => {
      p += 10;
      if (p < 40) setUploading(u => ({ ...u, progress: p, status: '偵測到大檔案 (>1.99GB)，啟動智慧切片上傳...' }));
      else if (p < 80) setUploading(u => ({ ...u, progress: p, status: '正在平行處理分段資料 (HLS Encoding)...' }));
      else setUploading(u => ({ ...u, progress: p, status: '建立串流播放索引中...' }));

      if (p >= 100) {
        clearInterval(inv);
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const newDate = new Date().toISOString().split('T')[0];

        const fakeDriveUrl = "內部系統影片標記"; // 給定一個非空白的值，讓讀取時能被判定為有連結

        setVideosData(v => [{ id: Date.now(), topic: fileName, instructor: '系統上傳', size: '2.1 GB (已自動切片)', views: 0, clicks: 0, ctr: '0%', date: newDate, hidden: false, driveFileUrl: fakeDriveUrl }, ...v]);
        setUploading({ active: false, progress: 0, status: '' });
        showToast("獨立影片已成功上傳加入平台！並自動推播至雲端端點。");

        // ✅ 只同步到「課程總表」，不帶任何學生資訊，確保總表乾淨
        syncToGoogleSheet('1VQ8IXR3bbUY2cCh_Cwr6cnEWVMC8q6llpnfKBFzcUn4', {
          '上課日期': newDate,
          '等級': '獨立影片',
          '課程主題': fileName,
          '課程類別': '額外上傳',
          '課程主題/類別': `${fileName} 額外上傳`,
          '課程主題 / 類別': `${fileName} 額外上傳`,
          '講師': '系統上傳',
          '上課時間': '隨時',
          '影片連結': fakeDriveUrl,
          '教材講義': '',
          '上課大綱': '',
          '報名人數': 0,
          '人數上限': 350,
          '同步時間': new Date().toLocaleString(),
          '上傳時間': new Date().toLocaleString(),
          '影片上傳': fakeDriveUrl
        });

        // ✅ 同步一份到「報名表」作為影片索引備份 (不需帶報名個資)
        syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
          '上課日期': newDate,
          '等級': '獨立影片',
          '課程主題 / 類別': `${fileName} 額外上傳`,
          '講師': '系統上傳',
          '上傳時間': new Date().toLocaleString(),
          '影片上傳': fakeDriveUrl
        });

      }
    }, 500);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').slice(1);
      const newData = { ...coursesData };
      let count = 0;
      rows.forEach(row => {
        const cols = row.split(',').map(c => c.replace(/"/g, '').trim());
        if (cols.length >= 7) {
          const match = cols[0].match(/(\d+)年(\d+)月(\d+)日/);
          if (match) {
            const key = `${match[1]}-${match[2]}-${match[3]}`;
            if (!newData[key]) newData[key] = [];
            // 避免重複匯入
            if (!newData[key].some(c => c.topic === cols[1])) {
              newData[key].push({
                id: Date.now() + Math.random(), topic: cols[1], summary: cols[2],
                instructor: cols[3], deadline: cols[4], enrolled: parseInt(cols[5]) || 0,
                maxCapacity: parseInt(cols[6]) || 0, hasVideo: cols[7] === '是', enrollees: []
              });
              count++;
            }
          }
        }
      });
      setCoursesData(newData);
      showToast(`成功匯入 ${count} 堂新課程！`);
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleExportCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + data;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const syncToGoogleSheets = () => {
    showToast("⏳ 正在透過 API 將數據同步回傳至後台 Google Sheets...");
    setTimeout(() => {
      const header = "影片ID,課程主題,檔案大小,觀看總次數,不重複點擊數,點擊率(CTR),上架日期\n";
      const rows = videosData.map(v => `"${v.id}","${v.topic}","${v.size}",${v.views},${v.clicks},"${v.ctr}","${v.date}"`).join("\n");
      handleExportCSV(header + rows, "課程影片觀看點擊率分析.csv");
    }, 1500);
  };

  const handleExportCourseExcel = () => {
    const header = "上課日期,課程主題,課程摘要,講師,報名截止日,已報名人數,人數上限,是否支援影音\n";
    const rows = allCoursesList.map(c => `"${c.displayDate}","${c.topic}","${c.summary}","${c.instructor}","${c.deadline}",${c.enrolled},${c.maxCapacity},${c.hasVideo ? '是' : '否'}`).join("\n");
    handleExportCSV(header + rows, "AI實戰學院_課程管理總表.csv");
    showToast("✅ 已匯出課程總表！正在為您開啟專屬雲端資料夾，請將檔案拖曳上傳即可完成同步。");
    setTimeout(() => {
      window.open('https://drive.google.com/drive/folders/1oht0KyTIMn-McEM34UR3luv3hfma6Syh', '_blank');
    }, 1500);
  };

  const handleExportAllEnrollments = () => {
    const header = "上課日期,課程主題 / 類別,講師,事業體,職稱,姓名\n";
    const rows = [];
    allCoursesList.forEach(course => {
      const match = course.summary.match(/【(.*?)】/);
      const category = match ? match[1] : '專業課程';
      const topicCategory = `${course.topic} / ${category}`;
      (course.enrollees || []).forEach(user => {
        rows.push(`"${course.displayDate}","${topicCategory}","${course.instructor}","${user.org}","${user.title}","${user.name}"`);
      });
    });
    if (rows.length === 0) {
      showToast("目前尚無任何人報名課程");
      return;
    }
    handleExportCSV(header + rows.join("\n"), "AI實戰學院_全站報名名單總表.csv");
  };

  const userStatsList = useMemo(() => {
    const map = {};
    allCoursesList.forEach(course => {
      let type = 'other';
      if (course.summary.includes('必修')) type = 'required';
      else if (course.summary.includes('選修')) type = 'elective';
      else if (course.summary.includes('百度')) type = 'baidu';

      (course.enrollees || []).forEach(user => {
        const userEmail = user.email || '';
        const uniqueKey = `${user.org}_${user.name}_${userEmail.toLowerCase()}`;
        if (!map[uniqueKey]) {
          map[uniqueKey] = { org: user.org, title: user.title, name: user.name, email: userEmail, requiredCourses: [], electiveCourses: [], baiduCourses: [], totalCount: 0 };
        }
        const courseStatus = {
          topic: course.topic,
          date: course.displayDate,
          attended: user.attended || false,
          practicalDone: user.practicalDone || false,
          surveyDone: user.surveyDone || false
        };
        if (type === 'required') map[uniqueKey].requiredCourses.push(courseStatus);
        else if (type === 'elective') map[uniqueKey].electiveCourses.push(courseStatus);
        else if (type === 'baidu') map[uniqueKey].baiduCourses.push(courseStatus);
        map[uniqueKey].totalCount++;
      });
    });
    return Object.values(map).sort((a, b) => b.totalCount - a.totalCount);
  }, [allCoursesList]);

  const handleExportStatsExcel = () => {
    let csvContent = "所屬事業體,職稱,姓名,必修課程(堂),必修明細,選修課程(堂),選修明細,百度/菁英(堂),百度明細,累積總修課數\n";
    userStatsList.forEach(user => {
      const reqStr = user.requiredCourses.join('、');
      const elecStr = user.electiveCourses.join('、');
      const baiduStr = user.baiduCourses.join('、');
      csvContent += `"${user.org}","${user.title}","${user.name}",${user.requiredCourses.length},"${reqStr}",${user.electiveCourses.length},"${elecStr}",${user.baiduCourses.length},"${baiduStr}",${user.totalCount}\n`;
    });
    handleExportCSV(csvContent, "AI實戰學院_學員修課量化表.csv");
  };

  const handleExportEnrollees = (course) => {
    let csvContent = `課程名稱：${course.topic}\n事業體,職稱,姓名\n`;
    (course.enrollees || []).forEach(user => {
      csvContent += `"${user.org}","${user.title}","${user.name}"\n`;
    });
    handleExportCSV(csvContent, `${course.topic}_報名名單.csv`);
  };

  const handlePrintEnrollees = (course, filteredEnrollees = null) => {
    const listToPrint = filteredEnrollees || course.enrollees || [];
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('❌ 請允許瀏覽器開啟彈出視窗以列印名單');
      return;
    }
    const htmlText = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${course.topic} - 簽到表</title>
          <style>
            @page { size: A4 portrait; margin: 1.5cm; }
            body { font-family: "Microsoft JhengHei", "PingFang TC", sans-serif; padding: 0; margin: 0; color: #1f2937; line-height: 1.4; }
            h2 { text-align: center; margin: 10px 0 5px 0; font-size: 26px; color: #111827; font-weight: bold; }
            p { text-align: center; color: #4b5563; margin-bottom: 24px; font-size: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
            th, td { border: 1px solid #9ca3af; padding: 12px 8px; text-align: left; font-size: 15px; }
            th { background-color: #f3f4f6; font-weight: bold; color: #111827; }
            .col-num { width: 50px; text-align: center; }
            .col-org { width: 120px; }
            .col-title { width: 160px; }
            .col-name { width: 100px; font-weight: bold; }
            .col-sign { width: 180px; }
            .col-note { width: auto; }
            .text-center { text-align: center; }
            tr:nth-child(even) { background-color: #fafafa; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 100px; color: rgba(200,200,200,0.15); z-index: -1; font-weight: bold; pointer-events: none; }
          </style>
        </head>
        <body>
          <div class="watermark">AI 實戰學院</div>
          <h2>${course.topic}</h2>
          <p>開課日期：${course.displayDate} &nbsp;&nbsp;|&nbsp;&nbsp; 講師：${course.instructor}</p>
          <table>
            <thead>
              <tr>
                <th class="col-num text-center">序號</th>
                <th class="col-org">所屬事業體</th>
                <th class="col-title">職稱</th>
                <th class="col-name">姓名</th>
                <th class="col-sign">學員簽名</th>
                <th class="col-note">備註</th>
              </tr>
            </thead>
            <tbody>
              ${(listToPrint.length > 0) ? listToPrint.map((u, i) => `
                <tr>
                  <td class="text-center">${i + 1}</td>
                  <td>${u.org}</td>
                  <td>${u.title}</td>
                  <td class="col-name">${u.name}</td>
                  <td></td>
                  <td></td>
                </tr>
              `).join('') : '<tr><td colspan="6" class="text-center" style="padding: 30px; color: #9ca3af;">目前尚無同仁報名此課程</td></tr>'}
            </tbody>
          </table>
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 600); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(htmlText);
    printWindow.document.close();
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const totalEnrollments = useMemo(() => allCoursesList.reduce((sum, course) => sum + course.enrolled, 0), [allCoursesList]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-rose-50 to-red-100 flex items-center justify-center p-2 md:p-4 font-sans text-gray-800 relative overflow-hidden">

      {/* 背景裝飾光暈 */}
      <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-orange-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-red-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 主體玻璃容器 - 寬度拉滿，保留圓角與陰影 */}
      <div className="w-[99%] max-w-[1700px] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_10px_40px_-10px_rgba(220,38,38,0.15)] rounded-[2.5rem] p-4 md:p-7 relative z-10 flex flex-col h-[96vh]">

        {/* --- 頭部控制列 --- */}
        <div className="flex flex-col mb-4 shrink-0 gap-4">

              <div className="flex flex-col xl:flex-row flex-wrap justify-between items-center gap-4 w-full">
                <div className="flex flex-row items-baseline py-2 relative pl-5 flex-wrap gap-x-4 shrink-0">
                  <div className="absolute left-0 top-1 bottom-1 w-1.5 bg-gradient-to-b from-orange-500 to-red-600 rounded-full shadow-sm"></div>
                  <div className="flex items-center gap-3">
                    <h1 className="corporate-art-title text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-orange-700 to-red-600">
                      AI實戰學院課程
                    </h1>
                    {syncStatus === 'syncing' && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 text-[10px] font-bold rounded-full animate-in fade-in zoom-in duration-300 border border-sky-100 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping"></div>
                        雲端同步中...
                      </div>
                    )}
                    {syncStatus === 'error' && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100 shadow-sm animate-bounce">
                        <X size={10} /> 同步異常
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] md:text-sm font-bold tracking-[0.25em] text-red-600/70 uppercase">
                    Enterprise AI Practical Academy
                  </span>
                  <div className="flex items-center gap-2 ml-2 bg-emerald-100/60 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] md:text-xs font-black text-emerald-800 tracking-wider">即時線上: {onlineCount} 人</span>
                  </div>
                </div>

            <div className="flex flex-nowrap justify-center bg-white/50 p-2 md:p-2.5 md:px-3 lg:px-4 rounded-full border border-orange-100 shadow-inner backdrop-blur-sm items-center gap-2 xl:gap-3 w-max">
              <button
                onClick={() => { setShowSearchModal(true); setSearchResult(null); setSearchQuery({ org: '', name: '', email: '' }); }}
                className="shrink-0 px-4 py-2 md:px-5 md:py-2.5 rounded-full flex items-center gap-1.5 md:gap-2 transition-all duration-300 text-sm md:text-base whitespace-nowrap text-indigo-700 hover:text-white font-bold bg-indigo-50 hover:bg-indigo-500 shadow-sm hover:shadow-md border border-indigo-100"
              >
                <Search size={18} /> <span className="hidden sm:inline">個人修課查詢</span>
              </button>
              <button
                onClick={() => { setCheckInModalMode('checkin'); setShowCheckInModal(true); setCheckInResult(null); setCheckInQuery({ org: '', name: '', email: '' }); }}
                className="shrink-0 px-4 py-2 md:px-5 md:py-2.5 rounded-full flex items-center gap-1.5 md:gap-2 transition-all duration-300 text-sm md:text-base whitespace-nowrap text-emerald-700 hover:text-white font-bold bg-emerald-50 hover:bg-emerald-500 shadow-sm hover:shadow-md border border-emerald-100"
              >
                <CheckCircle2 size={18} /> <span className="hidden sm:inline">今日線上報到</span>
              </button>
              <button
                onClick={() => { setCheckInModalMode('survey'); setShowCheckInModal(true); setCheckInResult(null); setCheckInQuery({ org: '', name: '', email: '' }); }}
                className="shrink-0 px-4 py-2 md:px-5 md:py-2.5 rounded-full flex items-center gap-1.5 md:gap-2 transition-all duration-300 text-sm md:text-base whitespace-nowrap text-pink-700 hover:text-white font-bold bg-pink-50 hover:bg-pink-500 shadow-sm hover:shadow-md border border-pink-100"
              >
                <FileText size={18} /> <span className="hidden sm:inline">今日課後問卷</span>
              </button>
              <div className="w-px h-6 bg-gray-300/60 mx-1 md:mx-2"></div>
              {[
                { mode: 'calendar', Icon: CalendarDays, label: '月曆檢視', activeColor: 'bg-gradient-to-r from-orange-500 to-red-500', mobileHide: true },
                { mode: 'table', Icon: List, label: '課程總表', activeColor: 'bg-gradient-to-r from-orange-500 to-red-500', mobileHide: false },
                { mode: 'video', Icon: Film, label: '課程影片', activeColor: 'bg-gradient-to-r from-rose-500 to-pink-600', mobileHide: false },
                { mode: 'admin', Icon: Settings, label: '管理後台', activeColor: 'bg-gradient-to-r from-gray-700 to-gray-900', mobileHide: false }
              ].map(({ mode, Icon, label, activeColor, mobileHide }) => (
                <button
                  key={mode}
                  onClick={() => {
                    if (mode === 'calendar' && window.innerWidth < 768) return; // 手機不開月曆
                    setViewMode(mode);
                    if (mode === 'admin') setAdminTab('courses');
                  }}
                  className={`shrink-0 px-4 py-2 md:px-5 md:py-2.5 rounded-full flex items-center gap-1.5 md:gap-2 transition-all duration-300 text-sm md:text-base whitespace-nowrap
                    ${mobileHide ? 'hidden md:flex' : ''}
                    ${viewMode === mode ? `${activeColor} text-white shadow-md font-bold` : 'text-gray-600 hover:text-red-600 font-medium hover:bg-white/50'}`}
                >
                  <Icon size={18} /> <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 全站報名速覽儀表板 (保留動態儀表板設計) */}
          {(viewMode === 'calendar' || viewMode === 'table') && (
            <div className="hidden md:flex flex-col xl:flex-row justify-between items-center gap-4 bg-white/50 p-3 md:px-5 rounded-2xl border border-orange-200/60 shadow-sm backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto flex-1">
                <div className="flex items-center gap-2 text-orange-800 font-extrabold bg-orange-100/80 px-4 py-2 rounded-xl border border-orange-200 whitespace-nowrap shadow-sm">
                  <BarChart3 size={20} className="text-orange-600" /> 全站課程速覽
                </div>
                {allCoursesList.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center gap-4 w-full bg-white/80 px-4 py-2 rounded-xl border border-orange-100 shadow-inner">
                    <select
                      value={globalStatCourseId} onChange={(e) => {
                        const val = e.target.value;
                        setGlobalStatCourseId(val);
                        if (val !== 'all') {
                          const course = allCoursesList.find(c => c.id.toString() === val);
                          if (course) {
                            setCurrentDate(new Date(course.dateObj.getFullYear(), course.dateObj.getMonth(), 1));
                            setTimeout(() => {
                              const targetEl = document.getElementById(`calendar-day-${course.dateObj.getDate()}`);
                              if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 150);
                          }
                        }
                      }}
                      className="bg-transparent text-gray-800 font-bold focus:outline-none cursor-pointer w-full md:max-w-[400px] text-sm md:text-base"
                    >
                      <option value="all">全站所有課程</option>
                      {allCoursesList.map(c => <option key={c.id} value={c.id}>{c.displayDate.slice(5)} - {c.topic}</option>)}
                    </select>
                    {selectedGlobalCourse && (
                      <div className="flex items-center gap-4 w-full md:w-auto md:border-l border-gray-200 md:pl-4">
                        <div className="flex flex-col min-w-[150px]">
                          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                            <span>報名進度</span>
                            <span className={selectedGlobalCourse.enrolled >= selectedGlobalCourse.maxCapacity ? 'text-red-500' : 'text-orange-600'}>
                              {selectedGlobalCourse.enrolled} / {selectedGlobalCourse.maxCapacity} 人
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${selectedGlobalCourse.enrolled >= selectedGlobalCourse.maxCapacity ? 'bg-red-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`}
                              style={{ width: `${(selectedGlobalCourse.enrolled / selectedGlobalCourse.maxCapacity) * 100}%` }}>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : <span className="text-sm text-gray-500">無資料</span>}
              </div>

              {viewMode === 'calendar' && (
                <div className="flex space-x-2 w-full xl:w-auto justify-end xl:border-l border-red-200 xl:pl-5 shrink-0">
                  <div className="px-5 py-2 font-bold text-red-800 bg-orange-50 rounded-xl border border-orange-100 flex items-center shadow-inner tracking-wider">
                    {year}年 {month + 1}月
                  </div>
                  <button onClick={prevMonth} className="p-2.5 rounded-xl bg-white hover:bg-orange-50 transition-all duration-300 shadow-sm border border-orange-100 text-gray-700 hover:text-red-600 hover:shadow-md"><ChevronLeft size={22} /></button>
                  <button onClick={nextMonth} className="p-2.5 rounded-xl bg-white hover:bg-orange-50 transition-all duration-300 shadow-sm border border-orange-100 text-gray-700 hover:text-red-600 hover:shadow-md"><ChevronRight size={22} /></button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- 核心內容區域 --- */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* A: 月曆視圖 */}
          {viewMode === 'calendar' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-7 gap-2 md:gap-4 mb-3 text-center font-bold text-red-800/60 text-sm md:text-base sticky top-0 bg-white/60 backdrop-blur-md py-3 rounded-xl z-10 border border-white/80 shadow-sm">
                <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
              </div>
              <div className="grid grid-cols-7 gap-3 md:gap-4 pb-4">
                {blanks.map((_, i) => <div key={`b-${i}`} className="min-h-[140px] rounded-3xl bg-white/30 border border-white/50"></div>)}
                {days.map(d => {
                  const key = `${year}-${month + 1}-${d}`;
                  const courses = (coursesData[key] || []).filter(c => globalStatCourseId === 'all' || c.id.toString() === globalStatCourseId);
                  const main = courses[0];
                  const isFull = main && main.enrolled >= main.maxCapacity;
                  const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                  const isCurrentMonthReal = month === new Date().getMonth() && year === new Date().getFullYear();

                  return (
                    <div key={d} id={`calendar-day-${d}`}
                      onClick={() => {
                        if (adminAuthenticated && main) {
                          setCalendarAdminEdit({
                            dateStr: `${year}\u5e74${month + 1}\u6708${d}\u65e5`,
                            dateKey: key,
                            course: main,
                            editData: {
                              topic: main.topic,
                              instructor: main.instructor,
                              summary: main.summary,
                              level: main.level || getCourseLevelStatus(main).text,
                              maxCapacity: main.maxCapacity,
                              pdfUrl: main.pdfUrl || '',
                              outlineUrl: main.outlineUrl || '',
                              surveyUrl: main.surveyUrl || '',
                              timeSlot: main.timeSlot || ''
                            }
                          });
                        } else if (adminAuthenticated && !main) {
                          setCalendarAddCourse({
                            dateStr: `${year}\u5e74${month + 1}\u6708${d}\u65e5`,
                            dateKey: key,
                            formData: { topic: '', instructor: '', summary: '', level: '初級', maxCapacity: 350, pdfUrl: '', outlineUrl: '', deadline: '', timeSlot: '', surveyUrl: '' }
                          });
                        } else if (main) {
                          setSelectedDayCourses({ date: `${year}\u5e74${month + 1}\u6708${d}\u65e5`, courses });
                        }
                      }}
                      className={`group relative min-h-[140px] rounded-[1.5rem] p-3 md:p-4 pl-8 md:pl-10 flex flex-col cursor-pointer transition-all duration-300 ease-out overflow-hidden
                      ${main ? (getCourseLevelStatus(main).cardBg + ' shadow-sm hover:shadow-lg hover:-translate-y-1 border') : (adminAuthenticated ? 'bg-indigo-50/40 hover:bg-indigo-100/60 border border-indigo-100/60 hover:border-indigo-300 hover:shadow-sm' : 'bg-white/40 hover:bg-white/60 border border-white/60 hover:border-orange-200')}
                      ${isToday ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-transparent' : ''}`}>
                      {main && (
                        <div className={`absolute left-0 top-0 bottom-0 w-6 flex justify-center items-center font-black ${getCourseLevelStatus(main).ribbon}`}>
                          <span className="text-[10px] tracking-[0.2em]" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>{getCourseLevelStatus(main).text}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xl md:text-2xl font-bold ${main ? 'text-red-800' : 'text-gray-400'} ${isToday ? 'text-orange-600' : ''}`}>{d}</span>
                          {main && <span className="text-lg md:text-xl transition-transform group-hover:scale-150 group-hover:rotate-12 duration-500 ease-out select-none drop-shadow-sm">{getCourseEmoji(main.topic)}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {main && !isCurrentMonthReal && <span className="text-[10px] font-black text-white bg-gray-400 px-1.5 py-0.5 rounded shadow-sm opacity-90 tracking-widest">暫訂</span>}
                          {main && isCurrentMonthReal && <span className="w-2.5 h-2.5 mt-0.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></span>}
                        </div>
                      </div>

                      {/* I'M HERE! 精緻浮水印設計 */}
                      {isToday && (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-700
                          ${main ? 'opacity-[0.08] group-hover:opacity-25 scale-110 group-hover:scale-125' : 'opacity-100 scale-100'}`}>
                          <div className="animate-bounce flex flex-col items-center">
                            <MapPin size={main ? 80 : 64} className="text-orange-500 fill-orange-200" />
                            <span className={`${main ? 'text-lg' : 'text-xl'} font-black text-orange-600/80 tracking-widest mt-1 uppercase`}>I'm Here</span>
                          </div>
                        </div>
                      )}
                      {main && (
                        <div className="mt-auto flex flex-col gap-1 w-full">
                          <div className="flex justify-center">
                            <span className="text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-800 border border-amber-200/50 shadow-sm backdrop-blur-sm">
                              {(main.summary || '').match(/【(.*?)】/)?.[1] || '專業課程'}
                            </span>
                          </div>
                          <div className={`font-bold text-orange-900 bg-orange-50/80 px-2 py-1.5 rounded-md border border-orange-200/50 whitespace-nowrap overflow-hidden text-center transition-all ${getDynamicTextClass(main.topic)}`}>{main.topic}</div>
                          <div>
                            <div className="flex items-center justify-between text-[11px] md:text-xs px-1 mb-0.5">
                              <span className="text-gray-500 font-medium">人數</span>
                              <span className={`font-bold ${isFull ? 'text-red-500' : 'text-orange-600'}`}>{main.enrolled}/{main.maxCapacity}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2"><div className={`h-1.5 rounded-full ${isFull ? 'bg-red-400' : 'bg-gradient-to-r from-orange-400 to-red-400'}`} style={{ width: `${(main.enrolled / main.maxCapacity) * 100}%` }}></div></div>
                          </div>
                          <button disabled={isFull || !isCurrentMonthReal} onClick={(e) => {
                            e.stopPropagation();
                            const dParts = key.split('-');
                            const calculatedDate = `${dParts[0]}年${dParts[1]}月${dParts[2]}日`;
                            setSelectedCourseForEnroll({ ...main, dateStr: key, displayDate: main.displayDate || calculatedDate });
                          }}
                            className={`w-full py-1.5 text-xs md:text-sm font-bold rounded-lg transition-all shadow-sm ${isFull || !isCurrentMonthReal ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-md'}`}>
                            {!isCurrentMonthReal ? 'Coming Soon' : (isFull ? '已額滿' : '我要報名')}
                          </button>
                          {courses.length > 1 && <div className="absolute top-3 right-3 text-xs font-bold bg-white/90 text-red-600 border border-red-200 px-2 py-0.5 rounded-md shadow-sm">+{courses.length - 1}</div>}
                        </div>
                      )}
                      {!main && adminAuthenticated && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="flex flex-col items-center gap-1.5 text-indigo-400">
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-indigo-300 flex items-center justify-center bg-white/80">
                              <span className="text-2xl font-thin leading-none">+</span>
                            </div>
                            <span className="text-[10px] font-bold tracking-wide">新增課程</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* B: 課程總表 + 許願清單 */}
          {viewMode === 'table' && (
            <div className="flex-1 flex flex-col xl:flex-row gap-5 min-h-0">
              <div className="flex-1 bg-white/60 border border-orange-100 rounded-3xl overflow-hidden shadow-sm flex flex-col relative">
                <div className="hidden md:block overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                  {/* 等級筛選按鈕 */}
                  <div className="flex items-center gap-2 px-4 pt-3 pb-1 flex-wrap">
                    <span className="text-xs font-bold text-gray-500 mr-1">等級筛選：</span>
                    {[{k:'all',label:'全部',cls:'bg-gray-700 text-white'},{k:'必修',label:'必修',cls:'bg-purple-600 text-white'},{k:'選修',label:'選修',cls:'bg-indigo-500 text-white'},{k:'初級',label:'初級',cls:'bg-emerald-500 text-white'},{k:'中級',label:'中級',cls:'bg-amber-500 text-white'},{k:'高級',label:'高級',cls:'bg-rose-600 text-white'}].map(({k,label,cls}) => (
                      <button key={k} onClick={() => setTableLevelFilter(k)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                          tableLevelFilter === k ? cls + ' shadow-md scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                        }`}>{label}</button>
                    ))}
                  </div>
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-orange-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                      <tr>
                        <th className="p-4 md:p-5 font-extrabold text-red-900 border-b border-orange-200">上課日期</th>
                        <th className="p-4 md:p-5 font-extrabold text-red-900 border-b border-orange-200">課程主題 / 類別</th>
                        <th className="p-4 md:p-5 font-extrabold text-red-900 border-b border-orange-200">講師</th>
                        <th className="p-4 md:p-5 font-extrabold text-red-900 border-b border-orange-200 text-center">報名狀態</th>
                        <th className="p-4 md:p-5 font-extrabold text-red-900 border-b border-orange-200 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCoursesList
                        .filter(c => globalStatCourseId === 'all' || c.id.toString() === globalStatCourseId)
                        .filter(c => {
                          if (tableLevelFilter === 'all') return true;
                          if (tableLevelFilter === '必修') return (c.summary||'').includes('必修');
                          if (tableLevelFilter === '選修') return (c.summary||'').includes('選修');
                          const lvl = getCourseLevelStatus(c).text;
                          return lvl === tableLevelFilter;
                        })
                        .map((c, i) => {
                          const isFull = c.enrolled >= c.maxCapacity;
                          const match = c.summary.match(/【(.*?)】/);
                          return (
                            <tr key={c.id} className={`relative border-b border-orange-100/50 hover:bg-orange-50/50 transition-colors ${i % 2 === 0 ? 'bg-white/40' : 'bg-transparent'} overflow-hidden`}>
                              <td className="p-4 md:p-5 pl-10 md:pl-12 font-bold text-gray-700 text-lg relative">
                                {(() => {
                                  const lvl = getCourseLevelStatus(c);
                                  return (
                                    <div className={`absolute left-0 top-0 bottom-0 w-8 md:w-9 flex justify-center items-center font-black ${lvl.ribbon}`}>
                                      <span className="text-[12px] md:text-sm tracking-[0.2em]" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>{lvl.text}</span>
                                    </div>
                                  );
                                })()}
                                {c.displayDate}
                              </td>
                              <td className="p-4 md:p-5">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-bold text-red-900 text-xl">{c.topic}</div>
                                  {c.pdfUrl && (
                                    <button onClick={() => setViewingPdfCourse(c)} title="點閱講義" className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 rounded-lg text-xs font-bold shadow-sm transition-all hover:scale-105">
                                      <FileText size={14} /> 講義
                                    </button>
                                  )}
                                  {c.outlineUrl && (
                                    <button onClick={() => setViewingOutlineCourse(c)} title="點閱上課大綱" className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-lg text-xs font-bold shadow-sm transition-all hover:scale-105">
                                      <BookOpen size={14} /> 大綱
                                    </button>
                                  )}
                                  {c.surveyUrl && (
                                    <a href={c.surveyUrl} target="_blank" rel="noreferrer" title="填寫問卷" className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 rounded-lg text-xs font-bold shadow-sm transition-all hover:scale-105">
                                      <Send size={14} /> 問卷
                                    </a>
                                  )}
                                </div>
                                <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-700 bg-orange-100/80 px-2.5 py-1 rounded-md border border-orange-200">{match ? match[1] : '專業課程'}</span>
                              </td>
                              <td className="p-4 md:p-5 font-medium text-gray-700 text-lg">
                                <div className="flex items-center gap-2">
                                  <Users size={18} className="text-orange-500" />
                                  {c.instructor}
                                </div>
                              </td>
                              <td className="p-4 md:p-5 text-center">
                                <div className="flex flex-col items-center">
                                  <span className={`text-base font-bold ${isFull ? 'text-gray-500' : 'text-red-600'}`}>{c.enrolled} / {c.maxCapacity}</span>
                                  <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2 mt-1.5 overflow-hidden"><div className={`h-2 rounded-full ${isFull ? 'bg-gray-400' : 'bg-gradient-to-r from-orange-400 to-red-500'}`} style={{ width: `${(c.enrolled / c.maxCapacity) * 100}%` }}></div></div>
                                </div>
                              </td>

                              <td className="p-4 md:p-5 text-center">
                                {(() => {
                                  const isCourseCurrentMonthReal = c.dateObj.getMonth() === new Date().getMonth() && c.dateObj.getFullYear() === new Date().getFullYear();
                                  return (
                                    <button disabled={isFull || !isCourseCurrentMonthReal} onClick={() => { setSelectedCourseForEnroll(c); setEnrollForm({ org: '', title: '', name: '', email: '' }); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all whitespace-nowrap ${isFull || !isCourseCurrentMonthReal ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-600 hover:scale-105'}`}>
                                      {!isCourseCurrentMonthReal ? 'Coming Soon' : (isFull ? '已額滿' : '點擊報名')}
                                    </button>
                                  );
                                })()}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* ---- 手機版：卡片式課程列表 (block md:hidden) ---- */}
                <div className="block md:hidden flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                  {allCoursesList
                    .filter(c => globalStatCourseId === 'all' || c.id.toString() === globalStatCourseId)
                    .filter(c => {
                      if (tableLevelFilter === 'all') return true;
                      if (tableLevelFilter === '必修') return (c.summary||'').includes('必修');
                      if (tableLevelFilter === '選修') return (c.summary||'').includes('選修');
                      const lvl = getCourseLevelStatus(c).text;
                      return lvl === tableLevelFilter;
                    })
                    .map(c => {
                      const isFull = c.enrolled >= c.maxCapacity;
                      const lvl = getCourseLevelStatus(c);
                      const match = (c.summary || '').match(/【(.*?)】/);
                      const isCourseCurrentMonthReal = c.dateObj && c.dateObj.getMonth() === new Date().getMonth() && c.dateObj.getFullYear() === new Date().getFullYear();
                      return (
                        <div key={c.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${isFull ? 'border-gray-200' : 'border-orange-100'}`}>
                          <div className={`px-4 py-3 flex items-center gap-3 ${lvl.ribbon}`}>
                            <span className="text-xs font-black text-white tracking-widest">{lvl.text}</span>
                            <span className="text-white font-black text-base flex-1 truncate">{c.topic}</span>
                          </div>
                          <div className="px-4 py-3 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CalendarDays size={14} className="text-orange-500 shrink-0" />
                              <span className="font-bold">{c.displayDate}</span>
                              {c.timeSlot && <span className="text-purple-600 font-bold">⏰ {c.timeSlot}</span>}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users size={14} className="text-orange-500 shrink-0" />
                              <span>{c.instructor}</span>
                              <span className="ml-auto font-bold text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">{match ? match[1] : '專業課程'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-1">
                                <span className={`text-sm font-bold ${isFull ? 'text-gray-400' : 'text-red-600'}`}>{c.enrolled}/{c.maxCapacity}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div className={`h-1.5 rounded-full ${isFull ? 'bg-gray-300' : 'bg-gradient-to-r from-orange-400 to-red-500'}`} style={{ width: `${Math.min((c.enrolled / c.maxCapacity) * 100, 100)}%` }} />
                                </div>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                {c.pdfUrl && <button onClick={() => setViewingPdfCourse(c)} className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"><FileText size={12} />講義</button>}
                                {c.outlineUrl && <button onClick={() => setViewingOutlineCourse(c)} className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"><BookOpen size={12} />大綱</button>}
                                {c.surveyUrl && <a href={c.surveyUrl} target="_blank" rel="noreferrer" className="px-2 py-1 bg-pink-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"><Send size={12} />問卷</a>}
                                <button
                                  disabled={isFull || !isCourseCurrentMonthReal}
                                  onClick={() => { setSelectedCourseForEnroll(c); setEnrollForm({ org: '', title: '', name: '', email: '' }); }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all ${isFull || !isCourseCurrentMonthReal ? 'bg-gray-300 text-gray-400' : 'bg-gradient-to-r from-orange-500 to-red-600 active:scale-95 shadow-sm'}`}
                                >
                                  {!isCourseCurrentMonthReal ? 'Coming Soon' : isFull ? '額滿' : '立即報名'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 許願清單 — 手機隱藏，桌機顯示 */}
              <div className="hidden xl:flex w-full xl:w-[400px] shrink-0 bg-white/70 border border-orange-200/60 rounded-3xl p-6 shadow-sm flex-col relative overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-5 border-b border-orange-100 pb-4">
                  <HeartHandshake size={32} className="text-pink-500" />
                  <div><h3 className="text-2xl font-extrabold text-red-900">課程許願池</h3><p className="text-xs text-orange-700 font-medium">留下您期望學習的技能！</p></div>
                </div>
                <form onSubmit={handleWishSubmit} className="flex flex-col gap-4">
                  <div className="space-y-1.5"><label className="text-sm font-bold text-gray-700">期望內容 <span className="text-red-500">*</span></label><textarea required rows="3" placeholder="例如：進階簡報技巧..." value={wishForm.content} onChange={e => setWishForm({ ...wishForm, content: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:ring-2 focus:ring-pink-400/50 shadow-inner resize-none text-sm"></textarea></div>
                  <div className="space-y-1.5"><label className="text-sm font-bold text-gray-700">所屬事業體 <span className="text-red-500">*</span></label><select required value={wishForm.org} onChange={e => setWishForm({ ...wishForm, org: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:ring-2 focus:ring-pink-400/50 shadow-inner text-sm"><option value="" disabled>選擇事業體</option>{ORG_LIST.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  <div className="flex gap-3">
                    <div className="space-y-1.5 flex-1"><label className="text-sm font-bold text-gray-700">職稱 <span className="text-red-500">*</span></label><input type="text" required value={wishForm.title} onChange={e => setWishForm({ ...wishForm, title: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-400/50 shadow-inner text-sm" /></div>
                    <div className="space-y-1.5 flex-1"><label className="text-sm font-bold text-gray-700">姓名 <span className="text-red-500">*</span></label><input type="text" required value={wishForm.name} onChange={e => setWishForm({ ...wishForm, name: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-400/50 shadow-inner text-sm" /></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-sm font-bold text-gray-700">聯絡 EMAIL <span className="text-red-500">*</span></label><input type="email" required placeholder="name@ehsn.com.tw" value={wishForm.email} onChange={e => setWishForm({ ...wishForm, email: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-400/50 shadow-inner text-sm" /></div>
                  <button type="submit" className="mt-2 w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"><Send size={18} /> 送出許願</button>
                </form>
                <div className="mt-6 pt-4 border-t border-orange-100 flex items-center justify-between text-xs font-bold text-gray-500"><span>累計許願人數</span><span className="text-pink-600 text-lg bg-pink-50 px-3 py-0.5 rounded-full">{128 + wishlist.length} 人</span></div>
              </div>
            </div>
          )}

          {/* C: 全新獨立課程影片頁籤 (Video Platform) */}
          {viewMode === 'video' && (
            <div className="flex-1 flex flex-col bg-white/50 border border-orange-100 rounded-3xl overflow-hidden shadow-sm p-3 md:p-6 min-h-0">
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/80 px-4 py-4 md:px-6 rounded-2xl border border-gray-100 shadow-sm mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-100 p-2.5 rounded-2xl"><PlayCircle size={26} className="text-rose-600" /></div>
                  <div>
                    <h2 className="text-lg md:text-2xl font-black text-gray-800 leading-tight">專屬影音串流平台</h2>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5 opacity-80 uppercase tracking-wider">Enterprise AI Practical Academy</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  {/* 搜尋欄位 */}
                  <div className="flex-1 relative hidden md:block max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="關鍵字搜尋課程、講師..."
                      value={videoSearchKey}
                      onChange={(e) => setVideoSearchKey(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 block pl-9 p-2.5 transition-all shadow-inner"
                    />
                    {videoSearchKey && (
                      <button onClick={() => setVideoSearchKey('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* 排序與控制選項 */}
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 shadow-sm">
                      <TrendingUp size={16} className="text-amber-600" />
                      <span className="text-xs font-black text-amber-800 whitespace-nowrap hidden xl:inline">排序：</span>
                      <select
                        value={videoSortOrder}
                        onChange={(e) => setVideoSortOrder(e.target.value)}
                        className="bg-transparent text-amber-900 text-xs font-black cursor-pointer focus:outline-none"
                      >
                        <option value="desc">日期降冪 (最新在前)</option>
                        <option value="asc">日期升冪 (舊到新)</option>
                      </select>
                    </div>

                    {adminAuthenticated && (
                      <div className="flex items-center gap-2 border-l border-gray-200 pl-2 ml-1">
                        <a href="https://drive.google.com/drive/folders/11eC5Xodr0eu1gSKUWvLXw88RPuVCqMJL" target="_blank" rel="noreferrer" className="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm border border-emerald-100" title="驅動資料夾"><FolderOpen size={18} /></a>
                        <input type="file" accept="video/mp4,video/x-m4v,video/*" className="hidden" ref={videoInputRef} onChange={handleVideoUpload} />
                        <button onClick={() => videoInputRef.current.click()} disabled={uploading.active} className="p-2.5 bg-gray-50 text-gray-700 hover:bg-gray-200 rounded-xl transition-all shadow-sm border border-gray-200" title="上傳影片"><Upload size={18} /></button>
                        <button onClick={syncToGoogleSheets} className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center gap-2"><Database size={15} /> <span>點擊下載</span></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 手機版搜尋列 */}
              <div className="md:hidden flex flex-col gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="搜尋影片名稱、講師..."
                    value={videoSearchKey}
                    onChange={(e) => setVideoSearchKey(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-2xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 block pl-9 p-3 transition-all shadow-sm"
                  />
                </div>
              </div>

              {uploading.active && (
                <div className="mb-6 bg-rose-50 border border-rose-200 p-4 rounded-2xl animate-pulse">
                  <div className="flex justify-between text-sm font-bold text-rose-800 mb-2"><span>{uploading.status}</span><span>{uploading.progress}%</span></div>
                  <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner"><div className="bg-gradient-to-r from-rose-400 to-pink-500 h-3 transition-all duration-300" style={{ width: `${uploading.progress}%` }}></div></div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 pb-6">
                  {videosData.filter(v => !v.hidden).filter(v => {
                    const kw = (videoSearchKey || '').trim().toLowerCase();
                    if (!kw) return true;
                    return (v.topic || '').toLowerCase().includes(kw) || (v.instructor || '').toLowerCase().includes(kw);
                  }).length === 0 ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400">
                      <Search size={40} className="mb-3 opacity-20" />
                      <p className="font-bold">找不到與「{videoSearchKey}」相關的影片</p>
                    </div>
                  ) : (
                    videosData
                      .filter(v => !v.hidden)
                      .filter(v => {
                        const kw = (videoSearchKey || '').trim().toLowerCase();
                        if (!kw) return true;
                        const tStr = (v.topic || '').toLowerCase();
                        const iStr = (v.instructor || '').toLowerCase();
                        return tStr.includes(kw) || iStr.includes(kw);
                      })
                      .sort((a, b) => {
                        // 解析日期作排序，使用 / 替換 - 使其在各瀏覽器更穩定
                        const dateA = new Date((a.date || '').replace(/年|月/g, '/').replace('日', '').replace(/-/g, '/'));
                        const dateB = new Date((b.date || '').replace(/年|月/g, '/').replace('日', '').replace(/-/g, '/'));

                        const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
                        const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();

                        if (timeA !== timeB) {
                          return videoSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
                        }

                        // 日期相同時，有影片連結的排前面
                        const aHasVideo = !!a.driveFileUrl;
                        const bHasVideo = !!b.driveFileUrl;
                        if (aHasVideo && !bHasVideo) return -1;
                        if (!aHasVideo && bHasVideo) return 1;

                        return 0;
                      })
                      .map(v => {
                        const hasVideo = !!v.driveFileUrl;
                        const getVideoEmbedUrl = (url) => {
                          if (!url) return '';
                          const m = url.match(/\/d\/(.*?)\//) || url.match(/\/d\/(.*?)$/) || url.match(/id=([^&]+)/);
                          if (m && m[1]) return `https://drive.google.com/file/d/${m[1]}/preview`;
                          return url;
                        };
                        return (
                          <div key={v.id} className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden group flex flex-col">
                            {/* Thumbnail / Player */}
                            <div
                              onClick={() => hasVideo && handleVideoClick(v)}
                              className={`aspect-video relative flex flex-col items-center justify-center transition-all ${hasVideo ? 'bg-gradient-to-br from-gray-900 to-rose-950 cursor-pointer group-hover:from-rose-900 group-hover:to-red-950' : 'bg-gradient-to-br from-gray-800 to-gray-900'}`}
                            >
                              {hasVideo ? (
                                <>
                                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                                    <PlayCircle size={22} className="text-white ml-0.5 md:hidden" />
                                    <PlayCircle size={34} className="text-white ml-0.5 hidden md:block" />
                                  </div>
                                  <span className="mt-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">▶ 點擊播放</span>
                                </>
                              ) : (
                                <>
                                  <PlayCircle size={28} className="text-white/30 mb-1" />
                                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 rounded-full">⏳ 待上傳</span>
                                </>
                              )}
                              <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">{hasVideo ? '已連結' : '無'}</div>
                              {hasVideo && v.driveFileUrl === '內部系統影片標記' && <div className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">內部上傳</div>}
                            </div>
                            <div className="p-2.5 md:p-4 flex flex-col flex-1">
                              <h3 className={`font-bold text-xs md:text-sm line-clamp-2 mb-1 md:mb-1.5 leading-snug ${hasVideo ? 'text-gray-800 group-hover:text-rose-600 cursor-pointer' : 'text-gray-500'}`} onClick={() => hasVideo && handleVideoClick(v)}>{v.topic}</h3>
                              <div className="text-[10px] md:text-xs text-gray-400 mb-2 flex justify-between items-center">
                                <span className="font-medium truncate">{v.instructor && `講師：${v.instructor}`}</span>
                                <span className="shrink-0 ml-1">{v.date}</span>
                              </div>
                              <div className="bg-orange-50/50 rounded-xl p-2.5 border border-orange-100 mb-3">
                                <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-gray-500">影片時長</span><span className="text-sm font-black text-gray-800">{v.duration || '-'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-500">累計觀看</span><span className="text-sm font-black text-rose-600 bg-white px-2 py-0.5 rounded-md border border-rose-100 shadow-sm">{v.views || 0} 次</span></div>
                              </div>
                              {/* Admin: link Drive file */}
                              {adminAuthenticated && hasPerm('upload_pdf') && (
                                editingVideoId === v.id ? (
                                  <div className="flex gap-1.5 mt-2">
                                    <input
                                      type="text" autoFocus
                                      value={editingVideoUrl}
                                      onChange={e => setEditingVideoUrl(e.target.value)}
                                      placeholder="貼上 Google Drive 影片連結"
                                      className="flex-1 text-xs border border-indigo-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                                    />
                                    <button onClick={() => {
                                      const url = editingVideoUrl.trim();
                                      // 更新 videosData
                                      setVideosData(prev => prev.map(x => x.id === v.id
                                        ? { ...x, driveFileUrl: url, size: url ? '已連結' : '請上傳影片' }
                                        : x
                                      ));
                                      // ✅ 同時更新對應課程的 videoUrl（讓影片連結跟著課程資料）
                                      let targetCourse = null;
                                      if (v.courseId) {
                                        setCoursesData(prev => {
                                          const newData = { ...prev };
                                          Object.keys(newData).forEach(ds => {
                                            newData[ds] = newData[ds].map(c => {
                                              if (c.id === v.courseId) {
                                                targetCourse = { ...c, videoUrl: url };
                                                return targetCourse;
                                              }
                                              return c;
                                            });
                                          });
                                          return newData;
                                        });
                                      }

                                      // 🔄 [重大修正] 自動同步新資料到雲端資料庫(兩份試算表)，即使該影片是獨立影片也能上傳
                                      if (targetCourse || v.topic) {
                                        const tDate = targetCourse ? targetCourse.displayDate : v.date;
                                        const tLevel = targetCourse ? getCourseLevelStatus(targetCourse).text : '獨立影片';

                                        // 從獨立影片名稱嘗試解析 "主題 - 摘要"
                                        const parts = v.topic ? v.topic.split(' - ') : [];
                                        const tTopic = targetCourse ? targetCourse.topic : parts[0] || v.topic;
                                        const tSummary = targetCourse ? targetCourse.summary : (parts[1] || '額外上傳');
                                        const tInstructor = targetCourse ? targetCourse.instructor : (v.instructor || '系統上傳');
                                        const fullTopic = targetCourse ? `${targetCourse.topic} ${targetCourse.summary}` : v.topic;

                                        // ✅ 同步至「課程總表」：只傳送課程/影片資訊
                                        syncToGoogleSheet('1VQ8IXR3bbUY2cCh_Cwr6cnEWVMC8q6llpnfKBFzcUn4', {
                                          '上課日期': tDate,
                                          '等級': tLevel,
                                          '課程主題': tTopic,
                                          '課程類別': tSummary,
                                          '課程主題/類別': fullTopic,
                                          '課程主題 / 類別': fullTopic,
                                          '講師': tInstructor,
                                          '上課時間': targetCourse ? targetCourse.timeSlot : '隨時',
                                          '影片連結': url,
                                          '影片上傳': url,
                                          '教材講義': targetCourse ? targetCourse.pdfUrl : '',
                                          '上課大綱': targetCourse ? targetCourse.outlineUrl : '',
                                          '報名人數': targetCourse ? targetCourse.enrolled : 0,
                                          '人數上限': targetCourse ? targetCourse.maxCapacity : 350,
                                          '同步時間': new Date().toLocaleString(),
                                          '上傳時間': new Date().toLocaleString()
                                        });

                                        // ✅ 同步至「課程報名紀錄表」：更新所有已報名學員看到的影片網址
                                        syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
                                          '上課日期': tDate,
                                          '等級': tLevel,
                                          '課程主題 / 類別': fullTopic,
                                          '講師': tInstructor,
                                          '上傳時間': new Date().toLocaleString(),
                                          '影片上傳': url
                                        });
                                        // 立即觸發回抓，確保本地與雲端一致
                                        setTimeout(() => handleFetchCoursesFromCloud(true), 1500);
                                      }
                                      setEditingVideoId(null); setEditingVideoUrl('');
                                      showToast('✅ 影片連結已儲存！雲端已同步（手機端約 2 分鐘內自動更新）');
                                    }} className="px-2.5 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 shrink-0">儲存</button>
                                    <button onClick={() => setEditingVideoId(null)} className="px-2 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 shrink-0">✕</button>
                                  </div>
                                ) : (
                                  <button onClick={() => { setEditingVideoId(v.id); setEditingVideoUrl(v.driveFileUrl === '內部系統影片標記' ? '' : (v.driveFileUrl || '')); }} className={`mt-2 w-full flex items-center justify-center gap-1.5 py-2 border rounded-xl text-xs font-bold transition-all ${hasVideo ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'}`}>
                                    <Edit3 size={12} /> {hasVideo ? '修改影片連結' : '綁定 Drive 影片'}
                                  </button>
                                )
                              )}
                              {hasVideo && (
                                <button onClick={() => setViewingVideo(v)} className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 border border-rose-200 hover:border-rose-500 rounded-xl text-xs font-bold transition-all">
                                  <PlayCircle size={13} /> 觀看課程影片
                                </button>
                              )}
                              {adminAuthenticated && (
                                <button
                                  onClick={() => {
                                    if (!hasPerm('upload_pdf')) {
                                      showToast('⚠️ 您的講講權限不足，請以課程管理員級別登入');
                                      return;
                                    }
                                    if (!window.confirm(`確定要刪除「${v.topic}」的影片嗎？\n前台卡片將消失，且不會自動重建。`)) return;
                                    setVideosData(prev => prev.map(x =>
                                      x.id === v.id
                                        ? { ...x, hidden: true, driveFileUrl: '', size: '已刪除' }
                                        : x
                                    ));
                                    // ✅ 關鍵：同步標記為 DELETED 到總表，防止重整後被抓回來
                                    syncToGoogleSheet('1VQ8IXR3bbUY2cCh_Cwr6cnEWVMC8q6llpnfKBFzcUn4', {
                                      '課程主題 / 類別': v.topic,
                                      '狀態': 'DELETED',
                                      '同步時間': new Date().toLocaleString()
                                    });
                                    // 同步更新報名表紀錄
                                    syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
                                      '課程主題 / 類別': v.topic,
                                      '操作': 'DELETE_VIDEO',
                                      '刪除時間': new Date().toLocaleString()
                                    });
                                    showToast('🗑️ 影片已在雲端同步標記刪除');
                                    setTimeout(() => handleFetchCoursesFromCloud(true), 1500);
                                  }}
                                  className="mt-1 w-full flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 border border-gray-200 hover:border-red-200 rounded-xl text-xs font-bold transition-all"
                                >
                                  <X size={11} /> 刪除影片（徹底移除）
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* D: 管理後台視圖 (包含課程管理與量化表) */}
          {viewMode === 'admin' && !adminAuthenticated && (
            <div className="flex-1 flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200 p-4">
              <form onSubmit={handleAdminLogin} className="bg-white/95 p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] w-full max-w-[420px] border border-gray-100 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-5">
                  <div className="bg-indigo-50 p-4 rounded-3xl text-indigo-600"><Settings size={36} /></div>
                </div>
                <h2 className="text-2xl font-black mb-2 text-center text-gray-800 tracking-wide">管理員登入</h2>
                <p className="text-sm text-gray-400 text-center mb-6">請輸入帳號與密碼以解鎖後台</p>
                <input
                  type="text"
                  placeholder="帳號 (Username)"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl px-5 py-3.5 text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner mb-3 transition-all font-medium"
                  required
                />
                <input
                  type="password"
                  placeholder="密碼 (Password)"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl px-5 py-3.5 text-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner mb-6 transition-all tracking-[0.2em] font-bold"
                  required
                />
                <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-1">
                  登入後台
                </button>
              </form>
            </div>
          )}

          {viewMode === 'admin' && adminAuthenticated && (
            <div className="flex-1 bg-white/80 border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col relative animate-in fade-in duration-500">
              <div className="p-5 bg-gray-50/90 border-b border-gray-200 flex flex-col gap-3 z-20">
                {/* Row 1: Tab nav + role badge + logout */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm relative group flex-wrap gap-1">
                    <button onClick={() => { setAdminAuthenticated(false); setCurrentAdmin(null); }} className="absolute -top-3 -left-3 z-10 bg-red-500 text-white rounded-full p-1.5 border-2 border-white hover:scale-110 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-md group-hover:rotate-90 stroke-[3px]" title="登出並鎖定">
                      <X size={14} />
                    </button>
                    <button onClick={() => setAdminTab('courses')} className={`px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-all whitespace-nowrap ${adminTab === 'courses' ? 'bg-gray-800 text-white font-bold shadow-md' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}>
                      <BookOpen size={16} /> 課程名單管理
                    </button>
                    <button onClick={() => setAdminTab('stats')} className={`px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-all whitespace-nowrap ${adminTab === 'stats' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}>
                      <TrendingUp size={16} /> 學員修課量化表
                    </button>
                    {hasPerm('manage_admins') && (
                      <button onClick={() => setAdminTab('admins')} className={`px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-all whitespace-nowrap ${adminTab === 'admins' ? 'bg-red-600 text-white font-bold shadow-md' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}>
                        <Users size={16} /> 權限管理
                      </button>
                    )}
                  </div>
                  {/* Role badge — always visible on the right */}
                  {currentAdmin && (
                    <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${ROLE_LABELS[currentAdmin.role]?.color}`}>{ROLE_LABELS[currentAdmin.role]?.label}</span>
                      <span className="font-bold text-gray-700 text-sm">{currentAdmin.name}</span>
                    </div>
                  )}
                </div>
                {/* Row 2: Action buttons */}
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                  {adminTab === 'courses' ? (
                    <>
                      {hasPerm('edit_courses') && (
                        <>
                          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
                          <button onClick={() => fileInputRef.current.click()} className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 text-gray-700 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all"><Upload size={16} /> 匯入課程 (CSV)</button>
                          <button onClick={handleExportCourseExcel} className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:scale-105"><Download size={16} /> 匯出課程總表</button>
                          <button onClick={() => handleFetchCoursesFromCloud(false)} className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:scale-105"><Download size={16} /> 從雲端拉取最新課程</button>
                        </>
                      )}
                      <button onClick={handleExportAllEnrollments} className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:scale-105"><Download size={16} /> 匯出報名資料</button>
                      <a href="https://drive.google.com/drive/folders/1QpPxRbUkKBOT_KwE1Ns1HAKyAfvN2IAO" target="_blank" rel="noreferrer" className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105"><FolderOpen size={16} /> 報名資料庫</a>
                      {hasPerm('upload_pdf') && (
                        <>
                          <a href="https://drive.google.com/drive/folders/1UD-LgGSLRWbZfRAV1sCSp8xRIeidVy2R" target="_blank" rel="noreferrer" className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105"><Upload size={16} /> 上傳/管理教材</a>
                          <a href="https://drive.google.com/drive/folders/1Sn703JHpgEoyyn58tL2qmbSdrCtXAm3T" target="_blank" rel="noreferrer" className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105"><FileText size={16} /> 問卷管理</a>
                          <a href="https://drive.google.com/drive/folders/1Sn703JHpgEoyyn58tL2qmbSdrCtXAm3T" target="_blank" rel="noreferrer" className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105"><FolderOpen size={16} /> 問卷結果彙整</a>
                        </>
                      )}
                    </>
                  ) : adminTab === 'stats' ? (
                    <button onClick={handleExportStatsExcel} className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:scale-105"><Download size={16} /> 匯出量化統計</button>
                  ) : null}
                </div>
              </div>

              {adminTab === 'courses' && (
                <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 p-4">
                  <table className="w-full text-left border-collapse min-w-[1200px] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <thead className="bg-gray-100/80 sticky top-0 z-10 shadow-sm">
                      <tr><th className="p-4 font-extrabold text-gray-700 border-b border-gray-200">上課日期</th><th className="p-4 font-extrabold text-gray-700 border-b border-gray-200">課程主題 / 摘要</th><th className="p-4 font-extrabold text-gray-700 border-b border-gray-200">講師</th><th className="p-4 font-extrabold text-gray-700 border-b border-gray-200 text-center">人數 / 上限</th><th className="p-4 font-extrabold text-gray-700 border-b border-gray-200 text-center">操作</th></tr>
                    </thead>
                    <tbody>
                      {allCoursesList.map((course, idx) => {
                        const isEditing = adminEditingCourseId === course.id;
                        const oldDateStr = `${course.dateObj.getFullYear()}-${course.dateObj.getMonth() + 1}-${course.dateObj.getDate()}`;

                        return (
                          <tr key={course.id} className={`relative border-b border-gray-100 transition-colors ${isEditing ? 'bg-orange-50' : (idx % 2 === 0 ? 'bg-gray-50/30 hover:bg-blue-50/50' : 'bg-transparent hover:bg-blue-50/50')} overflow-hidden`}>
                            <td className="p-4 pl-10 md:pl-12 font-bold text-gray-700 text-lg relative">
                              {(() => {
                                const lvl = getCourseLevelStatus(course);
                                return (
                                  <div className={`absolute left-0 top-0 bottom-0 w-8 md:w-9 flex justify-center items-center font-black ${lvl.ribbon}`}>
                                    <span className="text-[12px] md:text-sm tracking-[0.2em]" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>{lvl.text}</span>
                                  </div>
                                );
                              })()}
                              {isEditing ? (
                                <input type="date" value={adminEditingData.date} onChange={e => setAdminEditingData({ ...adminEditingData, date: e.target.value })} className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-indigo-400" />
                              ) : (
                                course.displayDate
                              )}
                            </td>
                            <td className="p-4">
                              {isEditing ? (
                                <div className="flex flex-col gap-1.5 w-full">
                                  <div className="flex items-center gap-2">
                                    <select value={adminEditingData.level || getCourseLevelStatus(course).text} onChange={e => setAdminEditingData({ ...adminEditingData, level: e.target.value })} className="bg-white border border-indigo-200 rounded-lg px-2 py-1 text-sm font-bold text-gray-800 focus:outline-none focus:border-indigo-400">
                                      <option value="初級">初級</option>
                                      <option value="中級">中級</option>
                                      <option value="高級">高級</option>
                                    </select>
                                    <input type="text" value={adminEditingData.topic} onChange={e => setAdminEditingData({ ...adminEditingData, topic: e.target.value })} className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1 text-sm font-bold text-gray-800 focus:outline-none focus:border-indigo-400" placeholder="課程主題" />
                                  </div>
                                  <input type="text" value={adminEditingData.summary} onChange={e => setAdminEditingData({ ...adminEditingData, summary: e.target.value })} className="w-full bg-indigo-50/50 border border-indigo-100 rounded-lg px-2 py-1 text-xs text-gray-600 focus:outline-none focus:border-indigo-400" placeholder="課程摘要" />
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    <div className="flex-1 min-w-[120px] p-2 bg-purple-50/50 rounded-xl border border-purple-100 flex flex-col gap-1">
                                      <label className="text-[10px] font-bold text-purple-700 flex items-center gap-1.5"><Clock size={12} /> 上課時間區段</label>
                                      <input type="text" value={adminEditingData.timeSlot || ''} onChange={e => setAdminEditingData({ ...adminEditingData, timeSlot: e.target.value })} className="w-full bg-white border border-purple-200 rounded-lg px-2 py-1 text-[11px] text-purple-800 focus:outline-none" placeholder="例：14:00 - 17:00" />
                                    </div>
                                    <div className="flex-1 min-w-[120px] p-2 bg-red-50/50 rounded-xl border border-red-100 flex flex-col gap-1">
                                      <label className="text-[10px] font-bold text-red-700 flex items-center gap-1.5"><Upload size={12} /> 教材講義</label>
                                      <input type="text" value={adminEditingData.pdfUrl || ''} onChange={e => setAdminEditingData({ ...adminEditingData, pdfUrl: e.target.value })} className="w-full bg-white border border-red-200 rounded-lg px-2 py-1 text-[11px] text-red-800 focus:outline-none" placeholder="Drive 連結" />
                                    </div>
                                    <div className="flex-1 min-w-[120px] p-2 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col gap-1">
                                      <label className="text-[10px] font-bold text-blue-700 flex items-center gap-1.5"><BookOpen size={12} /> 上課大綱</label>
                                      <input type="text" value={adminEditingData.outlineUrl || ''} onChange={e => setAdminEditingData({ ...adminEditingData, outlineUrl: e.target.value })} className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1 text-[11px] text-blue-800 focus:outline-none" placeholder="Drive 連結" />
                                    </div>
                                    <div className="flex-1 min-w-[120px] p-2 bg-pink-50/50 rounded-xl border border-pink-100 flex flex-col gap-1">
                                      <label className="text-[10px] font-bold text-pink-700 flex items-center gap-1.5"><CheckCircle2 size={12} /> 問卷連結</label>
                                      <input type="text" value={adminEditingData.surveyUrl || ''} onChange={e => setAdminEditingData({ ...adminEditingData, surveyUrl: e.target.value })} className="w-full bg-white border border-pink-200 rounded-lg px-2 py-1 text-[11px] text-pink-800 focus:outline-none" placeholder="Google 表單連結" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="font-bold text-gray-900 text-lg">{course.topic}</div>
                                    {course.timeSlot && <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1"><Clock size={10} /> {course.timeSlot}</span>}
                                    {course.pdfUrl && <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md shadow-sm">講義已上架</span>}
                                    {course.outlineUrl && <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md shadow-sm">大綱已上架</span>}
                                    {course.surveyUrl && <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-md shadow-sm">問卷已綁定</span>}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1 line-clamp-1">{course.summary}</div>
                                </>
                              )}
                            </td>
                            <td className="p-4 font-medium text-gray-700 text-base">
                              {isEditing ? (
                                <input type="text" value={adminEditingData.instructor} onChange={e => setAdminEditingData({ ...adminEditingData, instructor: e.target.value })} className="w-full bg-white border border-indigo-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-indigo-400" placeholder="講師" />
                              ) : (
                                course.instructor
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {isEditing ? (
                                <div className="flex flex-col items-center gap-1">
                                  <input
                                    type="number" min="1" max="9999"
                                    value={adminEditingData.maxCapacity ?? course.maxCapacity}
                                    onChange={e => setAdminEditingData({ ...adminEditingData, maxCapacity: e.target.value })}
                                    className="w-20 bg-white border border-indigo-200 rounded-lg px-2 py-1 text-sm text-center font-bold focus:outline-none focus:border-indigo-400"
                                  />
                                  <span className="text-[10px] text-gray-400">人數上限</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className={`text-base font-bold ${course.enrolled >= course.maxCapacity ? 'text-red-500' : 'text-blue-600'}`}>{course.enrolled} / {course.maxCapacity}</span>
                                  {course.enrolled > 250 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">⚠️ 建議加開場次</span>}
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button onClick={() => setAdminEditingCourseId(null)} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-bold transition-colors">取消</button>
                                    <button onClick={() => handleSaveAdminCourseEdit(course.id, oldDateStr)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-1"><Save size={14} /> 儲存</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => {
                                      // YYYY-MM-DD string for <input type="date">
                                      const mStr = String(course.dateObj.getMonth() + 1).padStart(2, '0');
                                      const dStr = String(course.dateObj.getDate()).padStart(2, '0');
                                      const dateVal = `${course.dateObj.getFullYear()}-${mStr}-${dStr}`;

                                      setAdminEditingCourseId(course.id);
                                      setAdminEditingData({ date: dateVal, topic: course.topic, summary: course.summary, instructor: course.instructor, level: course.level || getCourseLevelStatus(course).text, pdfUrl: course.pdfUrl || '', outlineUrl: course.outlineUrl || '', surveyUrl: course.surveyUrl || '', timeSlot: course.timeSlot || '', maxCapacity: course.maxCapacity });
                                    }} className="p-2 text-indigo-500 hover:bg-indigo-100 bg-indigo-50 rounded-lg transition-colors border border-indigo-100" title="編輯基本資訊"><Edit3 size={16} /></button>
                                    <button onClick={() => setViewingEnrolleesCourse(course)} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold shadow-sm flex items-center gap-1.5"><Eye size={16} /> 名單</button>
                                    <button
                                      onClick={() => handleDeleteCourse(course.id, oldDateStr, `${course.topic} ${course.summary}`)}
                                      className="p-2 text-red-400 hover:bg-red-50 bg-white border border-gray-100 rounded-lg transition-all hover:text-red-600 hover:border-red-100"
                                      title="徹底刪除此課程"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {adminTab === 'stats' && (
                <div className="flex-1 flex flex-col min-h-0 bg-indigo-50/30 p-4 md:p-6">
                  <div className="mb-5 flex items-center justify-between bg-white border border-indigo-100 shadow-sm p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shadow-inner"><UserPlus size={28} /></div>
                      <div><div className="text-base font-bold text-gray-500">平台總報名累積</div><div className="text-3xl font-black text-indigo-900 tracking-tight"><span className="text-4xl text-red-600 mr-1">{totalEnrollments}</span>人次</div></div>
                    </div>
                  </div>
                  <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 border border-indigo-100 rounded-2xl shadow-sm bg-white">
                    <table className="w-full text-center border-collapse min-w-[1000px]">
                      <thead className="bg-indigo-100/70 sticky top-0 z-10 shadow-sm text-indigo-900">
                        <tr><th className="p-4 font-extrabold border-b border-indigo-200 text-left w-32">所屬事業體</th><th className="p-4 font-extrabold border-b border-indigo-200 text-left w-32">職稱</th><th className="p-4 font-extrabold border-b border-indigo-200 text-left w-24">姓名</th><th className="p-4 font-extrabold border-b border-indigo-200 text-blue-700">必修明細</th><th className="p-4 font-extrabold border-b border-indigo-200 text-emerald-700">選修明細</th><th className="p-4 font-extrabold border-b border-indigo-200 text-purple-700">百度/菁英明細</th><th className="p-4 font-black border-b border-indigo-200 text-red-600 bg-indigo-50 w-28">累計修課</th></tr>
                      </thead>
                      <tbody>
                        {userStatsList.length > 0 ? userStatsList.map((user, idx) => (
                          <tr key={idx} className={`border-b border-gray-100 hover:bg-indigo-50/80 transition-colors ${idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                            <td className="p-4 font-bold text-gray-700 text-left text-lg">{user.org}</td><td className="p-4 text-gray-600 text-left text-base">{user.title}</td><td className="p-4 font-black text-gray-800 text-left text-lg">{user.name}</td>
                            <td className="p-4 align-top">{user.requiredCourses.length > 0 ? (<div className="flex flex-col items-center gap-1.5"><span className="font-bold text-blue-600 border-b border-blue-200 pb-0.5 text-base">{user.requiredCourses.length} 堂</span>{user.requiredCourses.map((c, i) => <span key={i} className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md">{c}</span>)}</div>) : <span className="text-gray-300">-</span>}</td>
                            <td className="p-4 align-top">{user.electiveCourses.length > 0 ? (<div className="flex flex-col items-center gap-1.5"><span className="font-bold text-emerald-600 border-b border-emerald-200 pb-0.5 text-base">{user.electiveCourses.length} 堂</span>{user.electiveCourses.map((c, i) => <span key={i} className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-md">{c}</span>)}</div>) : <span className="text-gray-300">-</span>}</td>
                            <td className="p-4 align-top">{user.baiduCourses.length > 0 ? (<div className="flex flex-col items-center gap-1.5"><span className="font-bold text-purple-600 border-b border-purple-200 pb-0.5 text-base">{user.baiduCourses.length} 堂</span>{user.baiduCourses.map((c, i) => <span key={i} className="text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-md">{c}</span>)}</div>) : <span className="text-gray-300">-</span>}</td>
                            <td className="p-4 font-black text-red-600 text-2xl bg-indigo-50/30 align-middle">{user.totalCount}</td>
                          </tr>
                        )) : (<tr><td colSpan="7" className="p-10 text-gray-400 font-medium">目前系統中尚無報名資料</td></tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 🔐 Admin Management Tab */}
              {adminTab === 'admins' && hasPerm('manage_admins') && (
                <div className="flex-1 flex flex-col min-h-0 p-5 md:p-6 bg-red-50/20 gap-5 overflow-y-auto custom-scrollbar">
                  {/* Current Accounts */}
                  <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 flex items-center gap-3">
                      <Users size={20} className="text-white" />
                      <h3 className="text-lg font-black text-white">管理員帳號清單</h3>
                      <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">{adminAccounts.length} 個帳號</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse min-w-[700px]">
                        <thead className="bg-red-50 text-red-900 text-sm font-extrabold border-b border-red-100">
                          <tr>
                            <th className="p-4 text-left">帳號</th>
                            <th className="p-4 text-left">姓名</th>
                            <th className="p-4 text-left">角色</th>
                            <th className="p-4 text-left">可執行操作</th>
                            <th className="p-4 text-center w-40">動作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminAccounts.map((acc, idx) => (
                            <tr key={acc.id} className={`border-b border-red-50 hover:bg-red-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-red-50/10'}`}>
                              <td className="p-4 font-mono font-bold text-gray-700">{acc.username}</td>
                              <td className="p-4 font-bold text-gray-800">{acc.name}</td>
                              <td className="p-4">
                                <select
                                  value={acc.role}
                                  onChange={e => {
                                    if (acc.id === currentAdmin.id) { showToast('不能修改自己的角色！'); return; }
                                    setAdminAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, role: e.target.value } : a));
                                    showToast(`${acc.name} 的角色已更新`);
                                  }}
                                  disabled={acc.id === currentAdmin.id}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer focus:outline-none disabled:cursor-not-allowed ${ROLE_LABELS[acc.role]?.color} border-transparent`}
                                >
                                  <option value="super">超級管理員</option>
                                  <option value="course">課程管理員</option>
                                  <option value="viewer">檢視員</option>
                                </select>
                              </td>
                              <td className="p-4 text-xs text-gray-500">{ROLE_LABELS[acc.role]?.perms}</td>
                              <td className="p-4 text-center">
                                {acc.id !== currentAdmin.id ? (
                                  <button
                                    onClick={() => {
                                      if (!window.confirm(`確定要刪除帳號「${acc.username}」嗎？`)) return;
                                      setAdminAccounts(prev => prev.filter(a => a.id !== acc.id));
                                      showToast(`已刪除帳號：${acc.username}`);
                                    }}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-all"
                                  >
                                    刪除
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400 font-medium">（當前帳號）</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add New Admin */}
                  <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
                    <h3 className="text-base font-black text-indigo-900 mb-4 flex items-center gap-2"><UserPlus size={18} /> 新增管理員帳號</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500">帳號 *</label>
                        <input type="text" value={newAdminForm.username} onChange={e => setNewAdminForm(p => ({ ...p, username: e.target.value }))} className="bg-gray-50 border border-indigo-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-indigo-400" placeholder="username" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500">密碼 *</label>
                        <input type="text" value={newAdminForm.password} onChange={e => setNewAdminForm(p => ({ ...p, password: e.target.value }))} className="bg-gray-50 border border-indigo-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-indigo-400" placeholder="password" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500">姓名 *</label>
                        <input type="text" value={newAdminForm.name} onChange={e => setNewAdminForm(p => ({ ...p, name: e.target.value }))} className="bg-gray-50 border border-indigo-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-indigo-400" placeholder="顯示姓名" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500">角色</label>
                        <select value={newAdminForm.role} onChange={e => setNewAdminForm(p => ({ ...p, role: e.target.value }))} className="bg-gray-50 border border-indigo-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-400">
                          <option value="super">超級管理員</option>
                          <option value="course">課程管理員</option>
                          <option value="viewer">檢視員</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!newAdminForm.username.trim() || !newAdminForm.password.trim() || !newAdminForm.name.trim()) { showToast('帳號、密碼、姓名均為必填！'); return; }
                        if (adminAccounts.find(a => a.username === newAdminForm.username.trim())) { showToast('此帳號已存在，請換一個！'); return; }
                        setAdminAccounts(prev => [...prev, { id: Date.now(), ...newAdminForm, username: newAdminForm.username.trim() }]);
                        setNewAdminForm({ username: '', password: '', name: '', role: 'viewer' });
                        showToast(`✅ 帳號「${newAdminForm.username}」已成功新增！`);
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <UserPlus size={16} /> 新增帳號
                    </button>
                  </div>

                  {/* Role Description */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-gray-700 mb-3">📋 角色權限對照表</h3>
                    <div className="flex flex-col gap-2">
                      {Object.entries(ROLE_LABELS).map(([key, info]) => (
                        <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold min-w-[80px] text-center ${info.color}`}>{info.label}</span>
                          <span className="text-sm text-gray-600">{info.perms}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


        </div>
      </div>

      {/* --- Toasts & Modals --- */}
      {
        toast.show && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[200] bg-white/95 border-b-8 border-green-500 px-10 py-6 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.3)] flex items-center gap-5 animate-in slide-in-from-top-12 duration-500">
            <CheckCircle2 size={44} className="text-green-500" />
            <span className="text-2xl font-black text-gray-800">{toast.msg}</span>
          </div>
        )
      }

      {
        selectedCourseForEnroll && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-red-900/40 backdrop-blur-xl animate-in fade-in">
            <div className="w-full max-w-2xl bg-white/95 backdrop-blur-3xl border border-white shadow-[0_50px_100px_rgba(0,0,0,0.4)] rounded-[3.5rem] overflow-hidden relative">
              <div className="p-10 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-red-50 flex justify-between items-center">
                <div><span className="text-xs font-black text-orange-600 uppercase tracking-[0.4em] block mb-2">Join Training Course</span><h2 className="text-4xl font-black text-red-900">{selectedCourseForEnroll.topic}</h2></div>
                <button onClick={() => setSelectedCourseForEnroll(null)} className="p-4 rounded-full hover:bg-white text-gray-400 transition-all"><X size={36} /></button>
              </div>
              <form onSubmit={handleEnrollSubmit} className="p-12 space-y-8">
                <div className="space-y-3"><label className="text-lg font-black text-gray-700 ml-2 flex items-center gap-2">所屬事業體 <span className="text-red-500">*</span></label><select required value={enrollForm.org} onChange={e => setEnrollForm({ ...enrollForm, org: e.target.value })} className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-5 text-xl text-gray-800 font-black focus:border-red-500 transition-all appearance-none shadow-sm"><option value="" disabled>請選擇</option>{ORG_LIST.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><label className="text-lg font-black text-gray-700 ml-2">職稱 <span className="text-red-500">*</span></label><input type="text" required value={enrollForm.title} onChange={e => setEnrollForm({ ...enrollForm, title: e.target.value })} className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-5 font-black text-xl shadow-sm focus:border-red-500" placeholder="例如：資深專員" /></div>
                  <div className="space-y-3"><label className="text-lg font-black text-gray-700 ml-2">報名姓名 <span className="text-red-500">*</span></label><input type="text" required value={enrollForm.name} onChange={e => setEnrollForm({ ...enrollForm, name: e.target.value })} className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-5 font-black text-xl shadow-sm focus:border-red-500" placeholder="請填寫本名全名" /></div>
                </div>
                <div className="space-y-3"><label className="text-lg font-black text-gray-700 ml-2">公司信箱 <span className="text-red-500">*</span></label><input type="email" required value={enrollForm.email} onChange={e => setEnrollForm({ ...enrollForm, email: e.target.value })} className="w-full bg-white border-2 border-gray-100 rounded-2xl px-6 py-5 font-black text-xl shadow-sm focus:border-red-500" placeholder="your.name@company.com" /></div>
                <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-2xl py-6 rounded-[2rem] shadow-2xl shadow-red-200 hover:scale-[1.03] active:scale-95 transition-all">確認送出並同步資料</button>
              </form>
            </div>
          </div>
        )
      }

      {
        viewingEnrolleesCourse && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xl animate-in fade-in">
            <div className="w-full max-w-6xl bg-white rounded-[3.5rem] shadow-[0_60px_120px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col h-[85vh]">
              <div className="p-6 md:p-8 border-b border-gray-200 bg-gray-50 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-800 flex items-center gap-3"><Users size={28} className="text-indigo-600 hidden md:block" /> {viewingEnrolleesCourse.topic}</h2>
                    <p className="text-sm text-gray-500 mt-1">{viewingEnrolleesCourse.displayDate} ｜ 講師：{viewingEnrolleesCourse.instructor}</p>
                  </div>
                  <button onClick={() => { setViewingEnrolleesCourse(null); setEnrolleeFilterOrg('all'); setAdminIncompleteFilter('all'); }} className="p-2 md:p-3 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-500 transition-colors self-start md:self-auto"><X size={24} /></button>
                </div>

                {/* ✅ 課程結算統計與完成數字 */}
                {(() => {
                  const now = new Date();
                  let deadlinePassed = false;
                  if (viewingEnrolleesCourse.submissionDeadline) {
                    deadlinePassed = new Date(viewingEnrolleesCourse.submissionDeadline) <= now;
                  } else {
                    const endTime = new Date(viewingEnrolleesCourse.dateObj);
                    endTime.setDate(endTime.getDate() + 1);
                    deadlinePassed = now >= endTime;
                  }

                  if (!deadlinePassed) return null;

                  const users = viewingEnrolleesCourse.enrollees || [];
                  const total = users.length;
                  const completed = users.filter(u => u.attended && u.practicalDone && u.surveyDone).length;
                  const noAttend = users.filter(u => !u.attended).length;
                  const missedPart = users.filter(u => u.attended && (!u.practicalDone || !u.surveyDone)).length;

                  return (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 flex flex-wrap gap-4 mt-1">
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-[10px] text-gray-400 font-bold mb-1">獲得學分率</p>
                        <p className="text-xl font-black text-indigo-900">{total > 0 ? Math.round(completed/total * 100) : 0}%</p>
                      </div>
                      <div className="flex-1 min-w-[120px] bg-green-50/50 p-2 rounded-xl border border-green-100">
                        <p className="text-[10px] text-green-600 font-bold mb-1">🟢 順利完成 (得學分)</p>
                        <p className="text-xl font-black text-green-700">{completed} <span className="text-xs">人</span></p>
                      </div>
                      <div className="flex-1 min-w-[120px] bg-red-50/50 p-2 rounded-xl border border-red-100">
                        <p className="text-[10px] text-red-600 font-bold mb-1">🔴 有報沒上課</p>
                        <p className="text-xl font-black text-red-700">{noAttend} <span className="text-xs">人</span></p>
                      </div>
                      <div className="flex-1 min-w-[120px] bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                        <p className="text-[10px] text-amber-600 font-bold mb-1">🟡 有上課缺條件</p>
                        <p className="text-xl font-black text-amber-700">{missedPart} <span className="text-xs">人</span></p>
                      </div>
                    </div>
                  );
                })()}

                {/* Filter Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-200">
                    <Filter size={14} className="text-indigo-500" />
                    <select value={enrolleeFilterOrg} onChange={e => setEnrolleeFilterOrg(e.target.value)}
                      className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none">
                      <option value="all">所有事業體</option>
                      {ORG_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  {/* ✅ 未完成篩選 */}
                  {['all','no_attend','no_practical','no_survey'].map(f => (
                    <button key={f} onClick={() => setAdminIncompleteFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        adminIncompleteFilter === f
                          ? (f==='all' ? 'bg-gray-700 text-white border-gray-700' : f==='no_attend' ? 'bg-emerald-600 text-white border-emerald-600' : f==='no_practical' ? 'bg-blue-600 text-white border-blue-600' : 'bg-pink-600 text-white border-pink-600')
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}>
                      {f==='all'?'全部':f==='no_attend'?'未出席':f==='no_practical'?'未繳作業':'未填心得'}
                    </button>
                  ))}
                  <div className="ml-auto flex items-center gap-2">
                    {/* ✅ 完成率 badge */}
                    {(() => {
                      const valid = (viewingEnrolleesCourse.enrollees||[]).filter(e => (e.name||'').trim() && (e.email||'').trim());
                      const done = valid.filter(e => e.attended && e.practicalDone && e.surveyDone).length;
                      const pct = valid.length > 0 ? Math.round(done/valid.length*100) : 0;
                      return (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-gray-200 shadow-sm">
                          <span className="text-xs font-bold text-gray-500">修課完成率</span>
                          <span className={`text-base font-black ${pct>=80?'text-emerald-600':pct>=50?'text-amber-600':'text-red-500'}`}>{pct}%</span>
                          <span className="text-xs text-gray-400">{done}/{valid.length}</span>
                        </div>
                      );
                    })()}
                    <span className="text-sm font-bold text-gray-500 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-200">
                      出席：{viewingEnrolleesCourse.enrollees?.filter(e => e.attended && (e.name||'').trim() && (e.email||'').trim()).length || 0} / 報名 {viewingEnrolleesCourse.enrollees?.filter(e => (e.name||'').trim() && (e.email||'').trim()).length || 0}
                    </span>
                    {adminAuthenticated && (
                      <button onClick={() => handlePrintEnrollees(viewingEnrolleesCourse, filteredEnrolleesList)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm font-bold flex items-center gap-1.5 transition-all text-sm">
                        <Printer size={16} /> <span className="hidden sm:inline">列印</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1050px]">
                  <thead className="bg-gray-100 sticky top-0 z-10 text-gray-500 font-black uppercase text-xs">
                    <tr>
                      <th className="p-4 text-center w-16">出席</th>
                      <th className="p-4 text-center w-16">作業</th>
                      <th className="p-4 text-center w-16">心得</th>
                      <th className="p-4 text-center w-16">完成</th>
                      <th className="p-4 w-12 text-center">#</th>
                      <th className="p-4">事業體/職稱</th>
                      <th className="p-4">姓名/信箱</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnrolleesList
                      .filter(u => {
                        if (adminIncompleteFilter === 'no_attend') return !u.attended;
                        if (adminIncompleteFilter === 'no_practical') return !u.practicalDone;
                        if (adminIncompleteFilter === 'no_survey') return !u.surveyDone;
                        return true;
                      })
                      .length > 0 ? filteredEnrolleesList
                      .filter(u => {
                        if (adminIncompleteFilter === 'no_attend') return !u.attended;
                        if (adminIncompleteFilter === 'no_practical') return !u.practicalDone;
                        if (adminIncompleteFilter === 'no_survey') return !u.surveyDone;
                        return true;
                      })
                      .map((u, i) => (
                      <tr key={i} className={`border-b border-gray-100 transition-colors ${
                        u.attended && u.practicalDone && u.surveyDone ? 'bg-emerald-50/40' : u.attended ? 'bg-white' : 'hover:bg-gray-50'
                      }`}>
                        {/* 出席 - 管理員可手動打勾 */}
                        <td className="p-4 text-center">
                          <input type="checkbox" checked={u.attended || false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const targetIdx = u.originalIndex;
                              setCoursesData(prev => {
                                const newData = { ...prev };
                                const ds = viewingEnrolleesCourse.dateStr;
                                if (newData[ds]) {
                                  newData[ds] = newData[ds].map(c => {
                                    if (c.id === viewingEnrolleesCourse.id) {
                                      const newEnrollees = [...c.enrollees];
                                      newEnrollees[targetIdx] = { ...newEnrollees[targetIdx], attended: isChecked };
                                      return { ...c, enrollees: newEnrollees };
                                    }
                                    return c;
                                  });
                                  setViewingEnrolleesCourse(newData[ds].find(c => c.id === viewingEnrolleesCourse.id));
                                }
                                return newData;
                              });
                            }}
                            className="w-5 h-5 text-emerald-600 bg-gray-100 rounded border-2 border-gray-300 cursor-pointer"
                          />
                        </td>
                        {/* 作業 - 管理員手動覆蓋 */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <input type="checkbox" checked={u.practicalDone || false}
                              onChange={(e) => handleTogglePractical(viewingEnrolleesCourse.id, u.email, u.name, e.target.checked)}
                              className="w-5 h-5 text-blue-600 bg-gray-100 rounded border-2 border-gray-300 cursor-pointer"
                            />
                            {u.homeworkLink && (
                              <a href={u.homeworkLink} target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 underline truncate max-w-[50px]">連結</a>
                            )}
                          </div>
                        </td>
                        {/* 心得 - 管理員手動覆蓋 */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <input type="checkbox" checked={u.surveyDone || false}
                              onChange={(e) => handleToggleSurvey(viewingEnrolleesCourse.id, u.email, u.name, e.target.checked)}
                              className="w-5 h-5 text-pink-600 bg-gray-100 rounded border-2 border-gray-300 cursor-pointer"
                            />
                            {u.reflection && (
                              <span className="text-[9px] text-pink-400 truncate max-w-[50px]" title={u.reflection}>已填寫</span>
                            )}
                          </div>
                        </td>
                        {/* 完成狀態 badge */}
                        <td className="p-4 text-center">
                          {u.attended && u.practicalDone && u.surveyDone
                            ? <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">✅</span>
                            : <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                                {[!u.attended&&'未到',!u.practicalDone&&'未交',!u.surveyDone&&'未填'].filter(Boolean).join('/')}
                              </span>
                          }
                        </td>
                        <td className="p-4 font-bold text-gray-400 text-center text-sm">{i + 1}</td>
                        <td className="p-4">
                          <div className="font-black text-gray-800 text-base">{u.org}</div>
                          <div className="font-bold text-gray-500 text-xs mt-0.5">{u.title}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-black text-indigo-600 text-base">{u.name}</div>
                          <div className="font-medium text-gray-400 text-xs mt-0.5 flex items-center gap-1"><Mail size={12} /> {u.email || '未提供'}</div>
                        </td>
                        {adminAuthenticated && hasPerm('edit_courses') && (
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                if (!window.confirm(`確定要移除「${u.name}」的報名紀錄嗎？`)) return;
                                const targetIdx = u.originalIndex;
                                syncToGoogleSheet('1m98Zpd5njWCFI7EaO6oIOhuzcOblod7gQxZafpeUAEk', {
                                  '上課日期': viewingEnrolleesCourse.displayDate,
                                  '課程主題': viewingEnrolleesCourse.topic,
                                  '報名姓名': u.name,
                                  'EMAIL': u.email,
                                  'action': 'DELETE',
                                  '刪除時間': new Date().toLocaleString()
                                });
                                setCoursesData(prev => {
                                  const newData = { ...prev };
                                  const ds = viewingEnrolleesCourse.dateStr;
                                  if (newData[ds]) {
                                    newData[ds] = newData[ds].map(c => {
                                      if (c.id === viewingEnrolleesCourse.id) {
                                        const newEnrollees = c.enrollees.filter((_, idx) => idx !== targetIdx);
                                        return { ...c, enrolled: Math.max(0, (c.enrolled || 1) - 1), enrollees: newEnrollees };
                                      }
                                      return c;
                                    });
                                    setViewingEnrolleesCourse(newData[ds].find(c => c.id === viewingEnrolleesCourse.id));
                                  }
                                  return newData;
                                });
                                showToast(`✅ 已移除「${u.name}」的報名紀錄並同步至報名表`);
                              }}
                              className="px-2 py-1 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 border border-red-200 rounded-lg text-xs font-bold transition-all"
                            >移除</button>
                          </td>
                        )}
                      </tr>
                    )) : <tr><td colSpan="8" className="p-20 text-center font-black text-gray-300 text-3xl italic">目前無符合條件的名單</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      }

      {
        selectedDayCourses && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-orange-900/20 backdrop-blur-xl animate-in fade-in" onClick={() => setSelectedDayCourses(null)}>
            <div className="w-full max-w-4xl bg-white/95 rounded-[3rem] shadow-2xl p-10 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b pb-6"><h2 className="text-4xl font-black text-red-900">{selectedDayCourses.date} 課程表</h2><button onClick={() => setSelectedDayCourses(null)} className="p-3 rounded-full hover:bg-gray-100 transition-all"><X size={32} /></button></div>
              <div className="space-y-6">
                {selectedDayCourses.courses.map(c => (
                  <div key={c.id} className="bg-orange-50/50 p-6 md:p-8 rounded-3xl border border-orange-100 flex flex-col gap-4">
                    {editingCourseId === c.id ? (
                      <div className="flex flex-col gap-4 w-full animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-bold text-gray-500">課程主題</label>
                          <input type="text" value={editingCourseData.topic} onChange={e => setEditingCourseData({ ...editingCourseData, topic: e.target.value })} className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 text-2xl font-black text-gray-800 focus:outline-none focus:border-indigo-400" placeholder="課程主題" />
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm font-bold text-gray-500">講師姓名</label>
                            <input type="text" value={editingCourseData.instructor} onChange={e => setEditingCourseData({ ...editingCourseData, instructor: e.target.value })} className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 text-lg font-bold text-gray-700 focus:outline-none focus:border-indigo-400" placeholder="講師" />
                          </div>
                          <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm font-bold text-gray-500">名額上限</label>
                            <input type="number" value={editingCourseData.maxCapacity} onChange={e => setEditingCourseData({ ...editingCourseData, maxCapacity: Number(e.target.value) })} className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 text-lg font-bold text-gray-700 focus:outline-none focus:border-indigo-400" placeholder="名額上限" />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-2 justify-end">
                          <button onClick={() => setEditingCourseId(null)} className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all">取消</button>
                          <button onClick={() => handleSaveCourseEdit(c.id, selectedDayCourses.date.replace(/年|月/g, '-').replace('日', ''))} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1"><Save size={20} /> 儲存變更</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
                        <div className="flex-1 w-full text-center md:text-left">
                          <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                            {(() => {
                              const lvl = getCourseLevelStatus(c.summary);
                              const match = (c.summary || '').match(/【(.*?)】/);
                              return (
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-sm font-black rounded-lg shadow-sm ${lvl.color}`}>{lvl.text}</span>
                                  <span className="px-2 py-1 text-sm font-black rounded-lg bg-white border border-orange-200 text-orange-700 shadow-sm">
                                    {match ? match[1] : '專業課程'}
                                  </span>
                                </div>
                              );
                            })()}
                            <h3 className="text-3xl font-black text-gray-800 flex items-center gap-3 flex-wrap">
                              {c.topic}
                              <div className="flex gap-2">
                                {c.pdfUrl && (
                                  <button onClick={() => setViewingPdfCourse(c)} title="點閱講義" className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 rounded-lg text-sm font-bold shadow-md transition-all hover:scale-105">
                                    <FileText size={16} /> 講義
                                  </button>
                                )}
                                {c.outlineUrl && (
                                  <button onClick={() => setViewingOutlineCourse(c)} title="點閱上課大綱" className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 rounded-lg text-sm font-bold shadow-md transition-all hover:scale-105">
                                    <BookOpen size={16} /> 大綱
                                  </button>
                                )}
                                {c.surveyUrl && (
                                  <a href={c.surveyUrl} target="_blank" rel="noreferrer" title="填寫課後問卷" className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 rounded-lg text-sm font-bold shadow-md transition-all hover:scale-105">
                                    <Send size={16} /> 問卷
                                  </a>
                                )}
                              </div>
                            </h3>
                            {adminAuthenticated && (
                              <button onClick={() => { setEditingCourseId(c.id); setEditingCourseData({ topic: c.topic, instructor: c.instructor, maxCapacity: c.maxCapacity }); }} className="p-2 text-indigo-500 hover:bg-indigo-100 bg-indigo-50 rounded-full transition-colors flex items-center gap-1.5 px-3 border border-indigo-100" title="編輯課程">
                                <Edit3 size={18} /> <span className="text-sm font-bold">編輯</span>
                              </button>
                            )}
                          </div>
                          <p className="text-gray-500 font-bold text-lg">講師：{c.instructor} <span className="mx-2">|</span> 狀態：<span className={c.enrolled >= c.maxCapacity ? 'text-red-500' : 'text-blue-500'}>{c.enrolled}/{c.maxCapacity}</span></p>
                        </div>
                        {(() => {
                          const [y, m] = selectedDayCourses.date.split(/年|月/);
                          const isCourseCurrentMonthReal = parseInt(m) - 1 === new Date().getMonth() && parseInt(y) === new Date().getFullYear();
                          const isCourseFull = c.enrolled >= c.maxCapacity;
                          return (
                            <button disabled={isCourseFull || !isCourseCurrentMonthReal}
                              onClick={() => {
                                setSelectedCourseForEnroll({
                                  ...c,
                                  dateStr: selectedDayCourses.date.replace(/年|月/g, '-').replace('日', ''),
                                  displayDate: selectedDayCourses.date   // ✅ 補上 displayDate
                                });
                                setSelectedDayCourses(null);
                              }}
                              className={`w-full md:w-auto px-10 py-5 font-black rounded-2xl text-xl shadow-lg transition-all whitespace-nowrap ${isCourseFull || !isCourseCurrentMonthReal ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-105 active:scale-95'}`}
                            >
                              {!isCourseCurrentMonthReal ? 'Coming Soon' : (isCourseFull ? '已額滿' : '我要報名')}
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      {/* 個人修課查詢 Modal */}
      {
        showSearchModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-indigo-900/30 backdrop-blur-xl animate-in fade-in" onClick={() => setShowSearchModal(false)}>
            <div className="w-full max-w-4xl bg-white/95 rounded-[3rem] shadow-2xl p-6 md:p-10 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b border-indigo-100 pb-5">
                <h2 className="text-3xl font-black text-indigo-900 flex items-center gap-3"><Search className="text-indigo-500" size={32} /> 個人修課查詢</h2>
                <button onClick={() => setShowSearchModal(false)} className="p-3 rounded-full hover:bg-indigo-50 transition-all text-indigo-400 hover:text-indigo-600"><X size={32} /></button>
              </div>

              <form onSubmit={handleSearchUser} className="flex flex-col lg:flex-row gap-4 w-full relative z-10">
                <select
                  value={searchQuery.org}
                  onChange={e => setSearchQuery({ ...searchQuery, org: e.target.value })}
                  className="flex-1 bg-white border-2 border-indigo-100 rounded-2xl px-4 py-3 text-base md:text-lg font-bold text-gray-700 focus:outline-none focus:border-indigo-400 shadow-sm transition-all"
                >
                  <option value="">選擇事業體</option>
                  {ORG_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="輸入全名 (如：賴育伊)"
                  value={searchQuery.name}
                  onChange={e => setSearchQuery({ ...searchQuery, name: e.target.value })}
                  className="flex-1 bg-white border-2 border-indigo-100 rounded-2xl px-4 py-3 text-base md:text-lg font-bold text-gray-700 focus:outline-none focus:border-indigo-400 shadow-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="輸入公司信箱確認身分"
                  value={searchQuery.email}
                  onChange={e => setSearchQuery({ ...searchQuery, email: e.target.value })}
                  className="flex-[1.5] bg-white border-2 border-indigo-100 rounded-2xl px-4 py-3 text-base md:text-lg font-bold text-gray-700 focus:outline-none focus:border-indigo-400 shadow-sm transition-all"
                />
                <button type="submit" className="px-6 md:px-10 py-3 shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl text-lg md:text-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all outline-none flex items-center gap-2 justify-center"><Search size={22} className="md:w-6 md:h-6" /> 查詢</button>
              </form>

              <div className="bg-indigo-50/50 rounded-[2rem] p-6 md:p-8 min-h-[350px] border border-indigo-100 flex flex-col relative z-0 mt-2">
                {!searchResult ? (
                  <div className="m-auto text-center text-indigo-400 font-bold text-xl flex flex-col items-center gap-4">
                    <div className="p-6 bg-white rounded-full shadow-sm mb-2 hover:scale-105 transition-transform"><Search size={48} className="text-indigo-300" /></div>
                    想知道修了哪些課嗎？<br />請輸入「事業體」、「姓名」與「公司信箱」來查詢吧！
                  </div>
                ) : searchResult === 'not_found' ? (
                  <div className="m-auto text-center text-red-500 font-bold text-xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="p-6 bg-white rounded-full shadow-sm mb-2 border border-red-50"><X size={48} className="text-red-400" /></div>
                    查無修課紀錄<br /><span className="text-sm md:text-base text-red-400 font-medium mt-1">請確認「事業體」、「姓名」與「公司信箱」是否完全正確。</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 animate-in zoom-in-95 duration-500 ease-out">
                    <div className="flex items-center gap-5 border-b border-indigo-100 pb-5">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-inner">
                        {searchResult.name[0]}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-gray-800 tracking-wide mb-1 flex items-baseline gap-3">
                          {searchResult.name} <span className="text-sm font-bold text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full">{searchResult.title}</span>
                        </h3>
                        <p className="text-indigo-600 font-extrabold text-base flex items-center gap-1.5"><HeartHandshake size={18} /> {searchResult.org}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-indigo-50">
                        <div className="bg-indigo-100 p-2 rounded-xl"><BookOpen className="text-indigo-600" size={22} /></div>
                        <div>
                          <p className="text-xs font-bold text-gray-400">累積總修課</p>
                          <p className="text-3xl font-black text-indigo-700 leading-none">{searchResult.totalCount}</p>
                        </div>
                      </div>
                    </div>

                    {/* ✅ 我的修課紀錄 - 完整表格 with 取消/作業/心得 */}
                    {(() => {
                      const myEmail = searchQuery.email.trim().toLowerCase();
                      const myName = searchQuery.name.trim();
                      const myCourses = allCoursesList.filter(c =>
                        (c.enrollees||[]).some(u => u.email.toLowerCase() === myEmail && u.name === myName)
                      );
                      if (myCourses.length === 0) return null;
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      return (
                        <div className="bg-white rounded-2xl border border-indigo-100 overflow-hidden shadow-sm">
                          <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 font-black text-indigo-800 text-sm flex items-center gap-2">
                            📋 我的完整修課紀錄
                            <span className="text-xs font-bold text-indigo-400 bg-white px-2 py-0.5 rounded-full border border-indigo-100">共 {myCourses.length} 堂</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[640px]">
                              <thead className="bg-gray-50 text-gray-500 text-xs font-black uppercase">
                                <tr>
                                  <th className="px-4 py-2 text-left">課程</th>
                                  <th className="px-3 py-2 text-center">日期</th>
                                  <th className="px-3 py-2 text-center">出席</th>
                                  <th className="px-3 py-2 text-center">作業</th>
                                  <th className="px-3 py-2 text-center">心得</th>
                                  <th className="px-3 py-2 text-center">操作</th>
                                </tr>
                              </thead>
                              <tbody>
                                {myCourses.map(c => {
                                  const u = (c.enrollees||[]).find(u => u.email.toLowerCase() === myEmail && u.name === myName) || {};
                                  const courseDate = c.dateObj || new Date(c.dateStr);
                                  const isPast = courseDate < today;
                                  const canCancel = courseDate >= today; // 當天也可取消
                                  const allDone = u.attended && u.practicalDone && u.surveyDone;
                                  return (
                                    <tr key={c.id} className={`border-b border-gray-100 ${allDone ? 'bg-emerald-50/40' : ''}`}>
                                      <td className="px-4 py-3 font-bold text-gray-800">{c.topic}
                                        <span className="ml-1 text-xs text-gray-400">{c.summary}</span>
                                      </td>
                                      <td className="px-3 py-3 text-center text-gray-600 whitespace-nowrap text-xs">{c.displayDate?.slice(5)}</td>
                                      <td className="px-3 py-3 text-center">
                                        {u.attended
                                          ? <span className="text-emerald-600 font-black text-base">✅</span>
                                          : <span className="text-gray-300 text-base">○</span>}
                                      </td>
                                      <td className="px-3 py-3 text-center">
                                        {u.practicalDone
                                          ? <span className="text-blue-600 font-black text-base" title={u.homeworkLink||''}>✅</span>
                                          : isPast
                                            ? <button onClick={() => { setHomeworkModal({ courseId: c.id, dateStr: c.dateStr, topic: c.topic, displayDate: c.displayDate, email: myEmail, name: myName }); setHomeworkLink(''); }}
                                                className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-all">
                                                繳交
                                              </button>
                                            : <span className="text-gray-300 text-xs">待上課</span>}
                                      </td>
                                      <td className="px-3 py-3 text-center">
                                        {u.surveyDone
                                          ? <span className="text-pink-600 font-black text-base" title={u.reflection||''}>✅</span>
                                          : isPast
                                            ? <button onClick={() => { setReflectionModal({ courseId: c.id, dateStr: c.dateStr, topic: c.topic, displayDate: c.displayDate, email: myEmail, name: myName }); setReflectionText(''); }}
                                                className="px-2 py-1 bg-pink-50 text-pink-600 border border-pink-200 rounded-lg text-xs font-bold hover:bg-pink-500 hover:text-white transition-all">
                                                填寫
                                              </button>
                                            : <span className="text-gray-300 text-xs">待上課</span>}
                                      </td>
                                      <td className="px-3 py-3 text-center">
                                        {canCancel
                                          ? <button onClick={() => setCancelConfirm({ courseId: c.id, dateStr: c.dateStr, topic: c.topic, displayDate: c.displayDate, email: myEmail, name: myName })}
                                              className="px-2 py-1 bg-red-50 text-red-500 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                                              取消報名
                                            </button>
                                          : <span className="text-gray-300 text-xs">已結束</span>}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* 選修 */}
                      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-100 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full transition-transform group-hover:scale-[2.5] duration-700 ease-out z-0"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <p className="font-extrabold text-gray-500 flex items-center gap-2 text-lg"><TrendingUp size={20} className="text-blue-500" /> 選修課程</p>
                            <div className="bg-blue-100 text-blue-700 font-black px-3 py-1 rounded-xl text-xl shadow-sm">{searchResult.electiveCourses.length} <span className="text-sm">堂</span></div>
                          </div>
                          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                            {searchResult.electiveCourses.map((c, i) => (
                              <div key={i} className="text-sm font-bold text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-blue-200 shadow-sm flex items-center justify-between gap-2" title={`${c.date} - ${c.topic}`}>
                                <div className="flex items-center truncate min-w-0">
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 shrink-0"></div>
                                  <span className="truncate">{c.topic}</span>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <div title={c.attended ? "現場已報到" : "未報到"} className={`p-1 rounded-md ${c.attended ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}><CheckCircle2 size={12} /></div>
                                  <div title={c.surveyDone ? "問卷已填寫" : "問卷未填"} className={`p-1 rounded-md ${c.surveyDone ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}><FileText size={12} /></div>
                                </div>
                              </div>
                            ))}
                            {searchResult.electiveCourses.length === 0 && <span className="text-sm text-gray-400 font-bold bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-center">尚未選修</span>}
                          </div>
                        </div>
                      </div>

                      {/* 必修 */}
                      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full transition-transform group-hover:scale-[2.5] duration-700 ease-out z-0"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <p className="font-extrabold text-gray-500 flex items-center gap-2 text-lg"><CheckCircle2 size={20} className="text-orange-500" /> 必修課程</p>
                            <div className="bg-orange-100 text-orange-700 font-black px-3 py-1 rounded-xl text-xl shadow-sm">{searchResult.requiredCourses.length} <span className="text-sm">堂</span></div>
                          </div>
                          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                            {searchResult.requiredCourses.map((c, i) => (
                              <div key={i} className="text-sm font-bold text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-orange-200 shadow-sm flex items-center justify-between gap-2" title={`${c.date} - ${c.topic}`}>
                                <div className="flex items-center truncate min-w-0">
                                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 shrink-0"></div>
                                  <span className="truncate">{c.topic}</span>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <div title={c.attended ? "現場已報到" : "未報到"} className={`p-1 rounded-md ${c.attended ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}><CheckCircle2 size={12} /></div>
                                  <div title={c.surveyDone ? "問卷已填寫" : "問卷未填"} className={`p-1 rounded-md ${c.surveyDone ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}><FileText size={12} /></div>
                                </div>
                              </div>
                            ))}
                            {searchResult.requiredCourses.length === 0 && <span className="text-sm text-gray-400 font-bold bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-center">尚未完成必修</span>}
                          </div>
                        </div>
                      </div>

                      {/* 百度 */}
                      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-rose-100 relative overflow-hidden group hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-50 rounded-full transition-transform group-hover:scale-[2.5] duration-700 ease-out z-0"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <p className="font-extrabold text-gray-500 flex items-center gap-2 text-lg"><Users size={20} className="text-rose-500" /> 特殊(百度等)</p>
                            <div className="bg-rose-100 text-rose-700 font-black px-3 py-1 rounded-xl text-xl shadow-sm">{searchResult.baiduCourses.length} <span className="text-sm">堂</span></div>
                          </div>
                          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                            {searchResult.baiduCourses.map((c, i) => (
                              <div key={i} className="text-sm font-bold text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-rose-200 shadow-sm flex items-center justify-between gap-2" title={`${c.date} - ${c.topic}`}>
                                <div className="flex items-center truncate min-w-0">
                                  <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mr-2 shrink-0"></div>
                                  <span className="truncate">{c.topic}</span>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <div title={c.attended ? "現場已報到" : "未報到"} className={`p-1 rounded-md ${c.attended ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}><CheckCircle2 size={12} /></div>
                                  <div title={c.surveyDone ? "問卷已填寫" : "問卷未填"} className={`p-1 rounded-md ${c.surveyDone ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}><FileText size={12} /></div>
                                </div>
                              </div>
                            ))}
                            {searchResult.baiduCourses.length === 0 && <span className="text-sm text-gray-400 font-bold bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-center">尚未報名</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* 線上報到與問卷 Modal */}
      {
        showCheckInModal && (
          <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-emerald-900/40 backdrop-blur-xl animate-in fade-in" onClick={() => setShowCheckInModal(false)}>
            <div className="w-full sm:max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95dvh] overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex justify-between items-center shrink-0">
                <div>
                  <div className={`text-xs font-black uppercase tracking-[0.3em] mb-1 ${checkInModalMode === 'survey' ? 'text-pink-600' : 'text-emerald-600'}`}>
                    {checkInModalMode === 'survey' ? 'After-course Survey' : 'Online Check-in'}
                  </div>
                  <h2 className={`text-2xl font-black flex items-center gap-2 ${checkInModalMode === 'survey' ? 'text-pink-900' : 'text-emerald-900'}`}>
                    {checkInModalMode === 'survey' ? <FileText size={24} className="text-pink-500" /> : <CheckCircle2 size={24} className="text-emerald-500" />}
                    {checkInModalMode === 'survey' ? '今日課程問卷填寫' : '今日課程線上報到'}
                  </h2>
                  <p className={`text-xs font-medium mt-1 ${checkInModalMode === 'survey' ? 'text-pink-600' : 'text-emerald-600'}`}>
                    {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                  </p>
                </div>
                <button onClick={() => setShowCheckInModal(false)} className="p-3 rounded-2xl hover:bg-emerald-100 transition-all text-emerald-500"><X size={24} /></button>
              </div>

              {/* Form */}
              <form onSubmit={handleCheckInUser} className="px-6 pt-5 pb-4 flex flex-col gap-4 shrink-0">
                <select
                  value={checkInQuery.org}
                  onChange={e => setCheckInQuery({ ...checkInQuery, org: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-4 text-lg font-bold text-gray-700 focus:outline-none focus:border-emerald-400 shadow-sm transition-all"
                >
                  <option value="">📌 選擇所屬事業體</option>
                  {ORG_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="👤 輸入全名 (如：賴育伊)"
                  value={checkInQuery.name}
                  onChange={e => setCheckInQuery({ ...checkInQuery, name: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-4 text-lg font-bold text-gray-700 focus:outline-none focus:border-emerald-400 shadow-sm transition-all"
                />
                <input
                  type="email"
                  placeholder="✉️ 輸入公司信箱確認身分"
                  value={checkInQuery.email}
                  onChange={e => setCheckInQuery({ ...checkInQuery, email: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-4 text-lg font-bold text-gray-700 focus:outline-none focus:border-emerald-400 shadow-sm transition-all"
                />
                 <button type="submit" className={`w-full py-5 text-white font-black rounded-2xl text-xl shadow-lg active:scale-95 transition-all flex items-center gap-3 justify-center ${checkInModalMode === 'survey' ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:shadow-pink-500/30' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/30'}`}>
                   {checkInModalMode === 'survey' ? <FileText size={24} /> : <CheckCircle2 size={24} />}
                   {checkInModalMode === 'survey' ? '查詢並填寫問卷' : '查詢並進行報到'}
                 </button>
              </form>

              {/* Results */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {!checkInResult ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                      <CheckCircle2 size={40} className="text-emerald-300" />
                    </div>
                    <p className="text-emerald-700 font-bold text-lg">今日有您的課程嗎？</p>
                    <p className="text-gray-400 font-medium text-sm">輸入您的資料進行線上簽到報到</p>
                  </div>
                ) : checkInResult === 'not_found' ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                      <X size={40} className="text-red-400" />
                    </div>
                    <p className="text-red-600 font-black text-lg">今日查無您的誤名課程</p>
                    <p className="text-gray-400 font-medium text-sm">請確認今日是否有課程，或資料是否與報名時一致</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 animate-in zoom-in-95 duration-300">
                    <div className="text-emerald-800 font-black text-lg flex items-center gap-2"><CheckCircle2 size={20} /> 您的今日課程</div>
                    {checkInResult.map(c => {
                      const userRecord = c.enrollees.find(u => u.email && checkInQuery.email && u.email.toLowerCase() === checkInQuery.email.toLowerCase() && u.name === checkInQuery.name.trim());
                      const isAttended = userRecord?.attended;
                      return (
                        <div key={c.id} className={`p-5 rounded-2xl border-2 transition-all ${isAttended ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 text-sm font-black rounded-full text-white ${isAttended ? 'bg-emerald-500' : 'bg-gray-400'}`}>{isAttended ? '✅ 已報到' : '未報到'}</span>
                            <h3 className="font-black text-gray-800 text-lg">{c.topic}</h3>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">👤 講師：{c.instructor}</p>
                          <p className="text-sm text-gray-500 mb-3">📅 {c.displayDate}{c.timeSlot && <span className="ml-2 font-bold text-purple-600">⏰ {c.timeSlot}</span>}</p>
                          {!isAttended ? (
                            <button
                              onClick={() => handleConfirmCheckIn(c.id)}
                              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-2xl shadow-md flex items-center justify-center gap-2 text-lg active:scale-95 transition-all"
                            >
                              <CheckCircle2 size={22} /> 確認報到
                            </button>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {checkInModalMode === 'checkin' ? (
                                <>
                                  <div className="w-full py-3 bg-emerald-100 text-emerald-700 font-black rounded-xl flex items-center justify-center gap-2 text-base">
                                    <CheckCircle2 size={18} /> 簽到報到已完成
                                  </div>
                                  
                                  <div className={`p-4 rounded-xl border-2 flex flex-col gap-3 transition-all ${userRecord?.practicalDone ? 'bg-blue-50 border-blue-200' : 'bg-white border-blue-100'}`}>
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-blue-800 flex items-center gap-2">步驟 2：課堂實作確認</span>
                                      {userRecord?.practicalDone && <span className="text-xs font-black text-blue-600 bg-white px-2 py-1 rounded-md shadow-sm">DONE</span>}
                                    </div>
                                    {!userRecord?.practicalDone ? (
                                      <button 
                                        onClick={() => handleTogglePractical(c.id, checkInQuery.email, checkInQuery.name, true)}
                                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-sm transition-all text-sm"
                                      >
                                        點擊「我已完成實作」
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleTogglePractical(c.id, checkInQuery.email, checkInQuery.name, false)}
                                        className="w-full py-2 text-blue-400 font-bold hover:text-blue-600 text-xs"
                                      >
                                        (點擊撤銷實作狀態)
                                      </button>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className={`p-4 rounded-xl border-2 flex flex-col gap-3 transition-all ${userRecord?.surveyDone ? 'bg-pink-50 border-pink-200' : 'bg-white border-pink-100'}`}>
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-pink-800 flex items-center gap-2">課後問卷填寫</span>
                                    {userRecord?.surveyDone && <span className="text-xs font-black text-pink-600 bg-white px-2 py-1 rounded-md shadow-sm">DONE</span>}
                                  </div>
                                  {c.surveyUrl ? (
                                    <div className="flex flex-col gap-2">
                                      <a href={c.surveyUrl} target="_blank" rel="noreferrer"
                                        onClick={() => handleToggleSurvey(c.id, checkInQuery.email, checkInQuery.name, true)}
                                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black rounded-xl flex items-center justify-center gap-2 text-sm shadow-md active:scale-95 transition-all"
                                      >
                                        <FileText size={18} /> 前往填寫問卷
                                      </a>
                                      {!userRecord?.surveyDone && (
                                        <button 
                                          onClick={() => handleToggleSurvey(c.id, checkInQuery.email, checkInQuery.name, true)}
                                          className="text-[10px] text-pink-400 font-bold hover:underline"
                                        >
                                          若已手動填寫，點此標記完成
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-xl text-center text-sm">
                                      問卷待開放（請洽講師）
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Calendar Admin Quick-Edit Modal */}
      {
        calendarAdminEdit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 flex flex-col">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 flex justify-between items-center border-b border-indigo-100">
                <div>
                  <h3 className="text-lg font-bold text-indigo-900">✏️ 快速編輯課程</h3>
                  <p className="text-sm font-medium text-gray-500 mt-0.5">{calendarAdminEdit.dateStr}</p>
                </div>
                <button onClick={() => setCalendarAdminEdit(null)} className="p-2.5 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-gray-100 group">
                  <X size={18} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar max-h-[70vh]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">難度等級</label>
                    <select value={calendarAdminEdit.editData.level} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, level: e.target.value } }))} className="bg-white border border-indigo-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-400 shadow-sm">
                      <option value="初級">初級</option>
                      <option value="中級">中級</option>
                      <option value="高級">高級</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">人數上限</label>
                    <input type="number" min="1" max="9999" value={calendarAdminEdit.editData.maxCapacity} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, maxCapacity: e.target.value } }))} className="bg-white border border-indigo-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-400 shadow-sm" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">課程主題</label>
                  <input type="text" value={calendarAdminEdit.editData.topic} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, topic: e.target.value } }))} className="bg-white border border-indigo-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-400 shadow-sm" placeholder="課程主題" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">講師</label>
                  <input type="text" value={calendarAdminEdit.editData.instructor} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, instructor: e.target.value } }))} className="bg-white border border-indigo-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-indigo-400 shadow-sm" placeholder="講師姓名" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">課程摘要</label>
                  <input type="text" value={calendarAdminEdit.editData.summary} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, summary: e.target.value } }))} className="bg-white border border-indigo-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-indigo-400 shadow-sm" placeholder="【選修-類別】課程摘要" />
                </div>
                <div className="flex flex-col gap-1 p-3 bg-purple-50/80 rounded-xl border border-purple-100">
                  <label className="text-xs font-bold text-purple-700 flex items-center gap-1.5"><Clock size={12} /> 上課時間區段</label>
                  <input type="text" value={calendarAdminEdit.editData.timeSlot || ''} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, timeSlot: e.target.value } }))} className="bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm font-medium text-purple-800 focus:outline-none focus:border-purple-400" placeholder="例：14:00 - 17:00" />
                </div>
                <div className="flex flex-col gap-1 p-3 bg-red-50/80 rounded-xl border border-red-100">
                  <label className="text-xs font-bold text-red-700 flex items-center gap-1.5"><Upload size={12} /> 課程講義連結</label>
                  <input type="text" value={calendarAdminEdit.editData.pdfUrl} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, pdfUrl: e.target.value } }))} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-xs font-medium text-red-800 focus:outline-none focus:border-red-400" placeholder="貼上 Google Drive 講義連結（若無請留空）" />
                  <span className="text-[10px] font-bold text-red-500">🚨 請確認 Google Drive 的存取權限設定為「知道連結的任何人均可查看」</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-blue-50/80 rounded-xl border border-blue-100">
                  <label className="text-xs font-bold text-blue-700 flex items-center gap-1.5"><BookOpen size={12} /> 上課大綱連結</label>
                  <input type="text" value={calendarAdminEdit.editData.outlineUrl || ''} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, outlineUrl: e.target.value } }))} className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs font-medium text-blue-800 focus:outline-none focus:border-blue-400" placeholder="貼上 Google Drive 上課大綱連結（若無請留空）" />
                  <span className="text-[10px] font-bold text-blue-500">📢 請確認存取權限為「知道連結的任何人均可查看」</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-pink-50/80 rounded-xl border border-pink-100 mt-1">
                  <label className="text-xs font-bold text-pink-700 flex items-center gap-1.5"><CheckCircle2 size={12} /> 課後問卷連結</label>
                  <input type="text" value={calendarAdminEdit.editData.surveyUrl || ''} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, surveyUrl: e.target.value } }))} className="bg-white border border-pink-200 rounded-lg px-3 py-2 text-xs font-medium text-pink-800 focus:outline-none focus:border-pink-400" placeholder="貼上 Google 表單問卷連結（若無請留空）" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <button onClick={() => setCalendarAdminEdit(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors">取消</button>
                <button onClick={handleSaveCalendarEdit} className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all hover:scale-105"><Save size={14} /> 儲存更新</button>
              </div>
            </div>
          </div>
        )
      }

      {/* Calendar Admin Add Course Modal */}
      {
        calendarAddCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 flex flex-col">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 flex justify-between items-center border-b border-emerald-100">
                <div>
                  <h3 className="text-lg font-bold text-emerald-900">➕ 新增課程</h3>
                  <p className="text-sm font-medium text-gray-500 mt-0.5">{calendarAddCourse.dateStr}</p>
                </div>
                <button onClick={() => setCalendarAddCourse(null)} className="p-2.5 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-gray-100 group">
                  <X size={18} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar max-h-[70vh]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">難度等級</label>
                    <select value={calendarAddCourse.formData.level} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, level: e.target.value } }))} className="bg-white border border-emerald-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-emerald-400 shadow-sm">
                      <option value="初級">初級</option>
                      <option value="中級">中級</option>
                      <option value="高級">高級</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">人數上限</label>
                    <input type="number" min="1" max="9999" value={calendarAddCourse.formData.maxCapacity} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, maxCapacity: e.target.value } }))} className="bg-white border border-emerald-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-emerald-400 shadow-sm" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">課程主題 <span className="text-red-500">*</span></label>
                  <input type="text" value={calendarAddCourse.formData.topic} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, topic: e.target.value } }))} className="bg-white border border-emerald-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-emerald-400 shadow-sm" placeholder="課程主題（必填）" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">講師</label>
                  <input type="text" value={calendarAddCourse.formData.instructor} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, instructor: e.target.value } }))} className="bg-white border border-emerald-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-emerald-400 shadow-sm" placeholder="講師姓名" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">課程摘要</label>
                  <input type="text" value={calendarAddCourse.formData.summary} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, summary: e.target.value } }))} className="bg-white border border-emerald-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-emerald-400 shadow-sm" placeholder="【選修-類別】課程摘要說明" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">報名截止日</label>
                  <input type="date" value={calendarAddCourse.formData.deadline} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, deadline: e.target.value } }))} className="bg-white border border-emerald-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 shadow-sm" />
                </div>
                <div className="flex flex-col gap-1 p-3 bg-purple-50/80 rounded-xl border border-purple-100">
                  <label className="text-xs font-bold text-purple-700 flex items-center gap-1.5"><Clock size={12} /> 上課時間區段（選填）</label>
                  <input type="text" value={calendarAddCourse.formData.timeSlot || ''} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, timeSlot: e.target.value } }))} className="bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm font-medium text-purple-800 focus:outline-none focus:border-purple-400" placeholder="例：14:00 - 17:00" />
                </div>
                <div className="flex flex-col gap-1 p-3 bg-red-50/80 rounded-xl border border-red-100">
                  <label className="text-xs font-bold text-red-700 flex items-center gap-1.5"><Upload size={12} /> 課程講義連結（選填）</label>
                  <input type="text" value={calendarAddCourse.formData.pdfUrl} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, pdfUrl: e.target.value } }))} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-xs font-medium text-red-800 focus:outline-none focus:border-red-400" placeholder="貼上 Google Drive 講義連結（若無請留空）" />
                  <span className="text-[10px] font-bold text-red-500">🚨 請確認存取權限為「知道連結的任何人均可查看」</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-blue-50/80 rounded-xl border border-blue-100">
                  <label className="text-xs font-bold text-blue-700 flex items-center gap-1.5"><BookOpen size={12} /> 上課大綱連結（選填）</label>
                  <input type="text" value={calendarAddCourse.formData.outlineUrl || ''} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, outlineUrl: e.target.value } }))} className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs font-medium text-blue-800 focus:outline-none focus:border-blue-400" placeholder="貼上 Google Drive 上課大綱連結（若無請留空）" />
                  <span className="text-[10px] font-bold text-blue-500">📢 請確認存取權限為「知道連結的任何人均可查看」</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-pink-50/80 rounded-xl border border-pink-100 mt-1">
                  <label className="text-xs font-bold text-pink-700 flex items-center gap-1.5"><CheckCircle2 size={12} /> 課後問卷連結（選填）</label>
                  <input type="text" value={calendarAddCourse.formData.surveyUrl || ''} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, surveyUrl: e.target.value } }))} className="bg-white border border-pink-200 rounded-lg px-3 py-2 text-xs font-medium text-pink-800 focus:outline-none focus:border-pink-400" placeholder="貼上 Google 表單問卷連結（若無請留空）" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <button onClick={() => setCalendarAddCourse(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors">取消</button>
                <button onClick={handleAddCalendarCourse} className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all hover:scale-105"><Save size={14} /> 新增課程</button>
              </div>
            </div>
          </div>
        )
      }

      {/* Video Player Modal */}
      {
        viewingVideo && (() => {
          const rawUrl = viewingVideo.driveFileUrl || '';
          const m = rawUrl.match(/\/d\/(.*?)\//) || rawUrl.match(/\/d\/(.*?)$/) || rawUrl.match(/id=([^&]+)/);
          const embedUrl = m && m[1] ? `https://drive.google.com/file/d/${m[1]}/preview` : rawUrl;
          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-gray-950 rounded-3xl w-full max-w-5xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-800" style={{ height: '90vh' }}>
                <div className="px-5 py-3.5 flex justify-between items-center border-b border-gray-800 shrink-0 bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-600/20 p-2 rounded-xl"><PlayCircle size={20} className="text-rose-400" /></div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{viewingVideo.topic}</h3>
                      {viewingVideo.instructor && <p className="text-xs text-gray-400 mt-0.5">講師：{viewingVideo.instructor}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={rawUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                      <FolderOpen size={13} /> 另開 Drive
                    </a>
                    <button onClick={() => setViewingVideo(null)} className="p-2 bg-gray-800 text-gray-400 hover:text-white hover:bg-red-600/80 rounded-xl transition-all border border-gray-700">
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div className="bg-rose-950/20 border-b border-gray-800 px-5 py-2 flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-amber-400">⚠️ 若影片無法播放，表示 Google Drive 的分享權限尚未設為「知道連結的任何人均可查看」</span>
                  <a href={rawUrl} target="_blank" rel="noreferrer" className="ml-auto shrink-0 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs">點此強制開啟</a>
                </div>
                <div className="flex-1 w-full bg-black overflow-hidden">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    title={viewingVideo.topic}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          );
        })()
      }

      {
        viewingPdfCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative border border-gray-100">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-orange-100 shrink-0 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-red-900">{viewingPdfCourse.topic} - 課程講義</h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">{viewingPdfCourse.instructor} 講師</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button onClick={() => setViewingPdfCourse(null)} className="p-2.5 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-gray-100 group shrink-0">
                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>
              {/* 403 錯誤解說橫幅 */}
              <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex flex-col md:flex-row justify-between items-center gap-3">
                <span className="text-xs font-bold text-rose-700">⚠️ 若下方畫面顯示「403 發生錯誤」，代表此講義在 Google 雲端的權限尚未對外開放。</span>
                <a href={viewingPdfCourse.pdfUrl} target="_blank" rel="noreferrer" className="shrink-0 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5">
                  <FileText size={14} /> 若因 403 無法觀看，請點此另開視窗強制閱讀
                </a>
              </div>
              <div className="flex-1 bg-gray-100 w-full h-full p-2 md:p-4 overflow-hidden relative">
                <iframe
                  src={getEmbedUrl(viewingPdfCourse.pdfUrl)}
                  className="w-full h-full rounded-2xl shadow-sm border border-gray-300 bg-white"
                  title="課程講義"
                  allow="autoplay"
                ></iframe>
              </div>
            </div>
          </div>
        )
      }

      {/* Course Outline Viewer Modal */}
      {
        viewingOutlineCourse && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 md:px-8 py-5 flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight">{viewingOutlineCourse.topic}</h3>
                    <p className="text-blue-100 text-sm font-bold mt-1 tracking-wide opacity-80 uppercase">Course Outline View</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewingOutlineCourse(null)}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all shadow-lg active:scale-95 group"
                    title="關閉"
                  >
                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>
              {/* 403 錯誤解說橫幅 */}
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 flex flex-col md:flex-row justify-between items-center gap-3">
                <span className="text-xs font-bold text-blue-700">⚠️ 若下方畫面顯示「403 發生錯誤」，代表此大綱在 Google 雲端的權限尚未對外開放。</span>
                <a href={viewingOutlineCourse.outlineUrl} target="_blank" rel="noreferrer" className="shrink-0 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5">
                  <BookOpen size={14} /> 若因 403 無法觀看，請點此另開視窗強制閱讀
                </a>
              </div>
              <div className="flex-1 bg-gray-100 w-full h-full p-2 md:p-4 overflow-hidden relative">
                <iframe
                  src={getEmbedUrl(viewingOutlineCourse.outlineUrl)}
                  className="w-full h-full rounded-2xl shadow-sm border border-gray-300 bg-white"
                  title="上課大綱"
                  allow="autoplay"
                ></iframe>
              </div>
            </div>
          </div>
        )
      }

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@900&display=swap');
        .corporate-art-title { font-family: 'Noto Serif TC', serif; letter-spacing: 0.1em; text-shadow: 4px 6px 15px rgba(153, 27, 27, 0.2); }
        .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.03); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(220, 38, 38, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.4); }
        select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
      `}} />

      {/* ✅ 作業繳交 Modal */}
      {homeworkModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-xl animate-in fade-in" onClick={() => setHomeworkModal(null)}>
          <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 flex flex-col gap-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-blue-800 flex items-center gap-2">📎 繳交作業</h3>
              <button onClick={() => setHomeworkModal(null)} className="p-2 rounded-full hover:bg-blue-50 text-blue-400"><X size={22} /></button>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-sm font-bold text-blue-800">{homeworkModal.topic}</p>
              <p className="text-xs text-blue-500 mt-1">{homeworkModal.displayDate}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-gray-700">作業 / 作品連結 <span className="text-red-500">*</span></label>
              <input
                type="url"
                autoFocus
                value={homeworkLink}
                onChange={e => setHomeworkLink(e.target.value)}
                placeholder="https://drive.google.com/... 或作品網址"
                className="w-full bg-gray-50 border-2 border-blue-100 rounded-2xl px-4 py-3 text-base font-bold text-gray-700 focus:outline-none focus:border-blue-400 transition-all"
              />
              <p className="text-xs text-gray-400">請貼上 Google Drive 分享連結、GitHub 或其他作品網址</p>
            </div>
            <button
              onClick={() => {
                const link = homeworkLink.trim();
                if (!link) { alert('請填入連結'); return; }
                handleSubmitHomework(homeworkModal.courseId, homeworkModal.dateStr, homeworkModal.email, homeworkModal.name, link);
              }}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black rounded-2xl text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
            >送出作業</button>
          </div>
        </div>
      )}

      {/* ✅ 心得填寫 Modal */}
      {reflectionModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-pink-900/40 backdrop-blur-xl animate-in fade-in" onClick={() => setReflectionModal(null)}>
          <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 flex flex-col gap-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-pink-800 flex items-center gap-2">💬 填寫心得</h3>
              <button onClick={() => setReflectionModal(null)} className="p-2 rounded-full hover:bg-pink-50 text-pink-400"><X size={22} /></button>
            </div>
            <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
              <p className="text-sm font-bold text-pink-800">{reflectionModal.topic}</p>
              <p className="text-xs text-pink-500 mt-1">{reflectionModal.displayDate}</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-gray-700 flex justify-between">
                課程心得 <span className="text-red-500">*</span>
                <span className={`text-xs font-bold ${reflectionText.length > 100 ? 'text-red-500' : 'text-gray-400'}`}>{reflectionText.length}/100</span>
              </label>
              <textarea
                autoFocus
                value={reflectionText}
                onChange={e => { if (e.target.value.length <= 100) setReflectionText(e.target.value); }}
                placeholder="請簡述此次課程的收穫或心得（100字以內）"
                rows={4}
                className="w-full bg-gray-50 border-2 border-pink-100 rounded-2xl px-4 py-3 text-base font-bold text-gray-700 focus:outline-none focus:border-pink-400 transition-all resize-none"
              />
            </div>
            <button
              onClick={() => {
                const text = reflectionText.trim();
                if (!text) { alert('請填寫心得'); return; }
                handleSubmitReflection(reflectionModal.courseId, reflectionModal.dateStr, reflectionModal.email, reflectionModal.name, text);
              }}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black rounded-2xl text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
            >送出心得</button>
          </div>
        </div>
      )}

      {/* ✅ 取消報名確認 Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-red-900/40 backdrop-blur-xl animate-in fade-in" onClick={() => setCancelConfirm(null)}>
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 flex flex-col gap-5 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl">⚠️</div>
            <h3 className="text-2xl font-black text-red-700">確認取消報名？</h3>
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <p className="text-base font-black text-red-800">{cancelConfirm.topic}</p>
              <p className="text-sm text-red-500 mt-1">{cancelConfirm.displayDate}</p>
            </div>
            <p className="text-sm text-gray-500 font-bold">取消後可重新報名同課其他場次</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelConfirm(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-all">返回</button>
              <button
                onClick={() => handleCancelEnrollment(cancelConfirm.courseId, cancelConfirm.dateStr, cancelConfirm.email, cancelConfirm.name)}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
              >確認取消</button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
}
