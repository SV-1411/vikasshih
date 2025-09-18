const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// In-memory data store (in production, use CouchDB)
let courses = [];
let modules = [];
let lessons = [];
let activities = [];
let users = [];
let progress = [];

// API Routes

// Course routes
app.get('/api/v1/courses', (req, res) => {
  res.json(courses);
});

app.post('/api/v1/courses', (req, res) => {
  const course = {
    ...req.body,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  courses.push(course);
  res.status(201).json(course);
});

// Module routes
app.get('/api/v1/modules/:courseId', (req, res) => {
  const courseModules = modules.filter(m => m.course_id === req.params.courseId);
  res.json(courseModules.sort((a, b) => a.order - b.order));
});

app.post('/api/v1/modules', (req, res) => {
  const module = {
    ...req.body,
    id: uuidv4(),
    created_at: new Date().toISOString()
  };
  modules.push(module);
  res.status(201).json(module);
});

// Lesson routes
app.get('/api/v1/lessons/:moduleId', (req, res) => {
  const moduleLessons = lessons.filter(l => l.module_id === req.params.moduleId);
  res.json(moduleLessons.sort((a, b) => a.order - b.order));
});

app.get('/api/v1/lessons/single/:id', (req, res) => {
  const lesson = lessons.find(l => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  res.json(lesson);
});

app.post('/api/v1/lessons', (req, res) => {
  const lesson = {
    ...req.body,
    id: uuidv4(),
    created_at: new Date().toISOString()
  };
  lessons.push(lesson);
  res.status(201).json(lesson);
});

// Activity routes
app.get('/api/v1/activities/:lessonId', (req, res) => {
  const lessonActivities = activities.filter(a => a.lesson_id === req.params.lessonId);
  res.json(lessonActivities.sort((a, b) => a.order - b.order));
});

app.post('/api/v1/activities', (req, res) => {
  const activity = {
    ...req.body,
    id: uuidv4()
  };
  activities.push(activity);
  res.status(201).json(activity);
});

// Progress routes
app.post('/api/v1/progress', (req, res) => {
  const progressEvent = {
    ...req.body,
    id: uuidv4(),
    timestamp: new Date().toISOString()
  };
  progress.push(progressEvent);
  res.status(201).json(progressEvent);
});

app.get('/api/v1/progress/:userId', (req, res) => {
  const userProgress = progress.filter(p => p.user_id === req.params.userId);
  res.json(userProgress);
});

// File upload routes
app.post('/api/v1/upload/audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In production, process and store the file properly
    const fileId = uuidv4();
    const fileName = `${fileId}.webm`;
    const filePath = path.join('uploads', fileName);
    
    // Move file to permanent location
    await fs.rename(req.file.path, filePath);
    
    res.json({
      file_id: fileId,
      url: `/uploads/${fileName}`,
      size: req.file.size
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Channel import/export routes
app.post('/api/v1/import-channel', upload.single('channel'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No channel file uploaded' });
    }

    // In production, extract and validate the zip file
    console.log('Channel import requested:', req.file.originalname);
    
    res.json({
      message: 'Channel import started',
      file: req.file.originalname,
      status: 'processing'
    });
  } catch (error) {
    console.error('Channel import error:', error);
    res.status(500).json({ error: 'Channel import failed' });
  }
});

app.get('/api/v1/export-channel/:courseId', (req, res) => {
  const course = courses.find(c => c.id === req.params.courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // In production, create and return a zip file
  const manifest = {
    channel_id: course.channel_id,
    version: course.version,
    title: course.title,
    created_at: new Date().toISOString(),
    resources: []
  };

  res.json({ manifest, message: 'Export would be created here' });
});

// Sync endpoints
app.post('/api/v1/sync', (req, res) => {
  // In production, trigger replication with CouchDB
  console.log('Sync requested');
  res.json({ 
    status: 'success', 
    message: 'Sync completed',
    timestamp: new Date().toISOString()
  });
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Vikas server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});