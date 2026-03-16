require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- 環境變數 ----------
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_academy';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ai123456'; // 預設密碼

// ---------- MongoDB 連線 ----------
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB 連線成功'))
    .catch(err => console.error('❌ MongoDB 連線失敗', err));

// ---------- Schema ----------
const CourseSchema = new mongoose.Schema({
    id: Number,
    topic: String,
    instructor: String,
    summary: String,
    enrolled: Number,
    maxCapacity: Number,
    deadline: String,
    hasVideo: Boolean,
    enrollees: [{ org: String, title: String, name: String }],
    date: String,
});
const Course = mongoose.model('Course', CourseSchema);

const VideoSchema = new mongoose.Schema({
    id: Number,
    title: String,
    url: String,
    views: Number,
    likes: Number,
    uploadedAt: String,
});
const Video = mongoose.model('Video', VideoSchema);

// ---------- 密碼保護中介軟體 ----------
function adminAuth(req, res, next) {
    // 支援三種方式：query、header、basic auth
    const password = req.query.password || req.headers['x-admin-password'];
    if (password === ADMIN_PASSWORD) {
        return next();
    }
    // 若使用 Basic Auth
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Basic ')) {
        const base64 = authHeader.split(' ')[1];
        const decoded = Buffer.from(base64, 'base64').toString('utf8'); // format: user:pass
        const pass = decoded.split(':')[1];
        if (pass === ADMIN_PASSWORD) return next();
    }
    res.status(401).json({ error: 'Unauthorized – admin password required' });
}

// ---------- 公開 API ----------
app.get('/api/courses', async (req, res) => {
    const courses = await Course.find();
    const grouped = {};
    courses.forEach(c => {
        const key = c.date;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(c);
    });
    res.json(grouped);
});

app.post('/api/courses', async (req, res) => {
    const created = await Course.create(req.body);
    res.status(201).json(created);
});

app.post('/api/courses/:id/enroll', async (req, res) => {
    const { id } = req.params;
    const { org, title, name } = req.body;
    const course = await Course.findOne({ id: Number(id) });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    course.enrollees.push({ org, title, name });
    course.enrolled = (course.enrolled || 0) + 1;
    await course.save();
    res.json(course);
});

app.get('/api/videos', async (req, res) => {
    const videos = await Video.find();
    res.json(videos);
});

app.post('/api/videos', async (req, res) => {
    const created = await Video.create(req.body);
    res.status(201).json(created);
});

app.post('/api/wishes', async (req, res) => {
    const Wish = mongoose.model('Wish', new mongoose.Schema({
        content: String,
        org: String,
        title: String,
        name: String,
        email: String,
        createdAt: { type: Date, default: Date.now },
    }));
    const created = await Wish.create(req.body);
    res.status(201).json(created);
});

// ---------- 管理後台保護路由 ----------
app.use('/admin', adminAuth);

// 下載所有課程資料（CSV）
app.get('/admin/download/courses', async (req, res) => {
    const courses = await Course.find();
    const header = 'id,topic,instructor,summary,enrolled,maxCapacity,deadline,hasVideo,date\n';
    const rows = courses.map(c =>
        `${c.id},"${c.topic}","${c.instructor}","${c.summary}",${c.enrolled},${c.maxCapacity},${c.deadline},${c.hasVideo},${c.date}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="courses.csv"');
    res.send(header + rows);
});

// 下載所有影片資料（CSV）
app.get('/admin/download/videos', async (req, res) => {
    const videos = await Video.find();
    const header = 'id,title,url,views,likes,uploadedAt\n';
    const rows = videos.map(v =>
        `${v.id},"${v.title}","${v.url}",${v.views},${v.likes},${v.uploadedAt}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="videos.csv"');
    res.send(header + rows);
});

// ---------- 啟動伺服器 ----------
app.listen(PORT, () => console.log(`🚀 API server listening at http://localhost:${PORT}`));
