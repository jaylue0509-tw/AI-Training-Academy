#!/usr/bin/env python3
import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix PDF label in admin edit form
content = content.replace(
    '將雲端教材連結關聯至本課程：',
    '課程講義連結：'
)

# 2. Add outlineUrl input block after pdfUrl input block inside admin edit form
old_pdf_block = '''                                   </div>
                                 </div>
                               ) : (
                                 <>
                                   <div className="flex items-center gap-2">
                                     <div className="font-bold text-gray-900 text-lg">{course.topic}</div>
                                     {course.pdfUrl && <a href={course.pdfUrl} target="_blank" rel="noreferrer" title="點閱講義" className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-md hover:bg-red-500 hover:text-white transition-all shadow-sm">講義已上架</a>}'''

new_pdf_block = '''                                   </div>
                                   <div className="mt-1 p-2.5 bg-blue-50/80 rounded-xl border border-blue-100 flex flex-col gap-1.5">
                                     <label className="text-xs font-bold text-blue-700 flex items-center gap-1.5"><BookOpen size={14} /> 上課大綱連結：</label>
                                     <input type="text" value={adminEditingData.outlineUrl || ''} onChange={e => setAdminEditingData({ ...adminEditingData, outlineUrl: e.target.value })} className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-800 focus:outline-none focus:border-blue-400 font-medium" placeholder="請貼上上課大綱 Google Drive 連結..." />
                                     <span className="text-[10px] font-bold text-blue-500">📢 請確認檔案權限為「知道連結的任何人均可查看」</span>
                                   </div>
                                 </div>
                               ) : (
                                 <>
                                   <div className="flex items-center gap-2">
                                     <div className="font-bold text-gray-900 text-lg">{course.topic}</div>
                                     {course.pdfUrl && <a href={course.pdfUrl} target="_blank" rel="noreferrer" title="點閱講義" className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-md hover:bg-red-500 hover:text-white transition-all shadow-sm">講義已上架</a>}
                                     {course.outlineUrl && <a href={course.outlineUrl} target="_blank" rel="noreferrer" title="點閱大綱" className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md hover:bg-blue-500 hover:text-white transition-all shadow-sm">大綱已上架</a>}'''

if old_pdf_block in content:
    content = content.replace(old_pdf_block, new_pdf_block, 1)
    print("Step 2: Admin edit block updated OK")
else:
    print("Step 2: WARN - old_pdf_block not found")

# 3. Calendar edit modal - add outlineUrl field after pdfUrl field
# Look for the calendar edit pdfUrl input field and add outlineUrl after
old_cal_edit = '''                <div className="flex flex-col gap-1 p-3 bg-red-50/80 rounded-xl border border-red-100">
                <label className="text-xs font-bold text-red-700 flex items-center gap-1.5"><Upload size={12} /> 課程講義連結（選填）</label>
                <input type="text" value={calendarAdminEdit.editData.pdfUrl} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, pdfUrl: e.target.value } }))} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-xs font-medium text-red-800 focus:outline-none focus:border-red-400" placeholder="貼上 Google Drive 講義連結（若無請留空）" />
                <span className="text-[10px] font-bold text-red-500">🚨 請確認存取權限為「知道連結的任何人均可查看」</span>
              </div>'''

new_cal_edit = '''                <div className="flex flex-col gap-1 p-3 bg-red-50/80 rounded-xl border border-red-100">
                <label className="text-xs font-bold text-red-700 flex items-center gap-1.5"><Upload size={12} /> 課程講義連結（選填）</label>
                <input type="text" value={calendarAdminEdit.editData.pdfUrl} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, pdfUrl: e.target.value } }))} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-xs font-medium text-red-800 focus:outline-none focus:border-red-400" placeholder="貼上 Google Drive 講義連結（若無請留空）" />
                <span className="text-[10px] font-bold text-red-500">🚨 請確認存取權限為「知道連結的任何人均可查看」</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-blue-50/80 rounded-xl border border-blue-100">
                <label className="text-xs font-bold text-blue-700 flex items-center gap-1.5"><BookOpen size={12} /> 上課大綱連結（選填）</label>
                <input type="text" value={calendarAdminEdit.editData.outlineUrl || ''} onChange={e => setCalendarAdminEdit(p => ({ ...p, editData: { ...p.editData, outlineUrl: e.target.value } }))} className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs font-medium text-blue-800 focus:outline-none focus:border-blue-400" placeholder="貼上 Google Drive 上課大綱連結（若無請留空）" />
                <span className="text-[10px] font-bold text-blue-500">📢 請確認存取權限為「知道連結的任何人均可查看」</span>
              </div>'''

if old_cal_edit in content:
    content = content.replace(old_cal_edit, new_cal_edit, 1)
    print("Step 3: Calendar edit modal updated OK")
else:
    print("Step 3: WARN - cal edit block not found")

# 4. Calendar add modal - add outlineUrl field
old_cal_add = '''              <div className="flex flex-col gap-1 p-3 bg-red-50/80 rounded-xl border border-red-100">
                <label className="text-xs font-bold text-red-700 flex items-center gap-1.5"><Upload size={12} /> 課程講義連結（選填）</label>
                <input type="text" value={calendarAddCourse.formData.pdfUrl} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, pdfUrl: e.target.value } }))} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-xs font-medium text-red-800 focus:outline-none focus:border-red-400" placeholder="貼上 Google Drive 講義連結（若無請留空）" />
                <span className="text-[10px] font-bold text-red-500">🚨 請確認存取權限為「知道連結的任何人均可查看」</span>
              </div>'''

new_cal_add = '''              <div className="flex flex-col gap-1 p-3 bg-red-50/80 rounded-xl border border-red-100">
                <label className="text-xs font-bold text-red-700 flex items-center gap-1.5"><Upload size={12} /> 課程講義連結（選填）</label>
                <input type="text" value={calendarAddCourse.formData.pdfUrl} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, pdfUrl: e.target.value } }))} className="bg-white border border-red-200 rounded-lg px-3 py-2 text-xs font-medium text-red-800 focus:outline-none focus:border-red-400" placeholder="貼上 Google Drive 講義連結（若無請留空）" />
                <span className="text-[10px] font-bold text-red-500">🚨 請確認存取權限為「知道連結的任何人均可查看」</span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-blue-50/80 rounded-xl border border-blue-100">
                <label className="text-xs font-bold text-blue-700 flex items-center gap-1.5"><BookOpen size={12} /> 上課大綱連結（選填）</label>
                <input type="text" value={calendarAddCourse.formData.outlineUrl || ''} onChange={e => setCalendarAddCourse(p => ({ ...p, formData: { ...p.formData, outlineUrl: e.target.value } }))} className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs font-medium text-blue-800 focus:outline-none focus:border-blue-400" placeholder="貼上 Google Drive 上課大綱連結（若無請留空）" />
                <span className="text-[10px] font-bold text-blue-500">📢 請確認存取權限為「知道連結的任何人均可查看」</span>
              </div>'''

if old_cal_add in content:
    content = content.replace(old_cal_add, new_cal_add, 1)
    print("Step 4: Calendar add modal updated OK")
else:
    print("Step 4: WARN - cal add block not found")

# 5. Also need to update calendarAdminEdit to include outlineUrl in edit data
old_cal_edit_data = '''                            editData: {
                              topic: main.topic,
                              instructor: main.instructor,
                              summary: main.summary,
                              level: main.level || getCourseLevelStatus(main).text,
                              maxCapacity: main.maxCapacity,
                              pdfUrl: main.pdfUrl || ''
                            }'''
new_cal_edit_data = '''                            editData: {
                              topic: main.topic,
                              instructor: main.instructor,
                              summary: main.summary,
                              level: main.level || getCourseLevelStatus(main).text,
                              maxCapacity: main.maxCapacity,
                              pdfUrl: main.pdfUrl || '',
                              outlineUrl: main.outlineUrl || ''
                            }'''
if old_cal_edit_data in content:
    content = content.replace(old_cal_edit_data, new_cal_edit_data, 1)
    print("Step 5: Calendar editData outlineUrl added OK")
else:
    print("Step 5: WARN - cal editData not found")

# 6. Add calendar add formData outlineUrl
old_form = "formData: { topic: '', instructor: '', summary: '', level: '\\u521d\\u7d1a', maxCapacity: 350, pdfUrl: '', deadline: '' }"
# Try the actual string
old_form2 = "formData: { topic: '', instructor: '', summary: '', level: '初級', maxCapacity: 350, pdfUrl: '', deadline: '' }"
new_form = "formData: { topic: '', instructor: '', summary: '', level: '初級', maxCapacity: 350, pdfUrl: '', outlineUrl: '', deadline: '' }"
if old_form2 in content:
    content = content.replace(old_form2, new_form, 1)
    print("Step 6: formData outlineUrl added OK")
else:
    print("Step 6: WARN - formData not found")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE - file written")
