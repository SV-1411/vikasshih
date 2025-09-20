require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

// Educational Platform data stores
let colleges = [];
let profiles = [];
let classrooms = [];
let classroomMembers = [];
let assignments = [];
let assignmentSubmissions = [];
let quizzes = [];
let quizAttempts = [];
let polls = [];
let pollResponses = [];
let liveLectures = [];
let lectureAttendees = [];
let classroomChat = [];
let notifications = [];

// API Routes

// Admin: Create Supabase user without email verification (service role)
app.post('/api/admin/auth/create-user', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Server auth not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
    }

    const { email, password, full_name, role, college_id, phone, setAsAdmin, collegeId } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    // Create user via Supabase Admin REST API
    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name || email,
          role: role || 'student',
          college_id: college_id || null,
          phone: phone || null
        }
      })
    });

    const created = await createRes.json();
    if (!createRes.ok) {
      return res.status(createRes.status).json({ error: created?.message || 'Failed to create user', details: created });
    }

    const userId = created?.user?.id || created?.id;

    // Optionally set college admin_id via Supabase PostgREST
    let updatedCollege = null;
    if (setAsAdmin && collegeId && userId) {
      const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/colleges?id=eq.${collegeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ admin_id: userId })
      });
      const updateJson = await updateRes.json();
      if (!updateRes.ok) {
        return res.status(updateRes.status).json({ error: 'Failed to set admin_id', details: updateJson });
      }
      updatedCollege = Array.isArray(updateJson) ? updateJson[0] : updateJson;
    }

    return res.json({ user: created?.user || created, college: updatedCollege });
  } catch (err) {
    console.error('Admin create user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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

// Auth endpoints using Supabase Admin API
app.post('/api/v1/auth/register-college', async (req, res) => {
  try {
    const { name, address, contact_email, contact_phone, admin_email, admin_password, admin_name } = req.body;

    // First create the college
    const { data: college, error: collegeError } = await supabaseAdmin
      .from('colleges')
      .insert({
        name,
        address,
        contact_email,
        contact_phone
      })
      .select()
      .single();

    if (collegeError) throw collegeError;

    // Create admin user with auto-confirmation
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: admin_email,
      password: admin_password,
      email_confirm: true, // Auto-confirm, no email verification needed
      user_metadata: {
        full_name: admin_name,
        role: 'admin',
        college_id: college.id
      }
    });

    if (authError) throw authError;

    // Ensure profile is created (fallback if trigger fails)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        username: admin_email,
        full_name: admin_name,
        role: 'admin',
        college_id: college.id
      });

    if (profileError) {
      console.warn('Profile creation warning:', profileError.message);
      // Don't throw error, profile might already exist from trigger
    }

    // Update college with admin_id
    const { error: updateError } = await supabaseAdmin
      .from('colleges')
      .update({ admin_id: authData.user.id })
      .eq('id', college.id);

    if (updateError) throw updateError;

    res.status(201).json({
      success: true,
      data: { ...college, admin_id: authData.user.id },
      user: authData.user
    });
  } catch (error) {
    console.error('College registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to register college' 
    });
  }
});

app.post('/api/v1/auth/register-user', async (req, res) => {
  try {
    const { email, password, full_name, role, college_code, phone } = req.body;

    // Verify college code exists
    const { data: college, error: collegeError } = await supabaseAdmin
      .from('colleges')
      .select('id')
      .eq('code', college_code)
      .single();

    if (collegeError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid college code' 
      });
    }

    // Create user with auto-confirmation
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm, no email verification needed
      user_metadata: {
        full_name,
        role,
        college_id: college.id,
        phone
      }
    });

    if (authError) throw authError;

    // Ensure profile is created (fallback if trigger fails)
    const { error: profileUpsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        username: email,
        full_name,
        role,
        college_id: college.id,
        phone
      });

    if (profileUpsertError) {
      console.warn('Profile creation warning:', profileUpsertError.message);
      // Don't throw error, profile might already exist from trigger
    }

    // Get the created profile
    const { data: profile, error: profileFetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileFetchError) throw profileFetchError;

    res.status(201).json({
      success: true,
      data: profile,
      user: authData.user
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to register user' 
    });
  }
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Vikas Educational Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Educational Platform API Routes

// College routes
app.post('/api/v1/colleges', (req, res) => {
  const college = {
    ...req.body,
    id: uuidv4(),
    code: generateCollegeCode(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  colleges.push(college);
  res.status(201).json(college);
});

app.get('/api/v1/colleges/:code', (req, res) => {
  const college = colleges.find(c => c.code === req.params.code);
  if (!college) {
    return res.status(404).json({ error: 'College not found' });
  }
  res.json(college);
});

// Profile routes
app.post('/api/v1/profiles', (req, res) => {
  const profile = {
    ...req.body,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  profiles.push(profile);
  res.status(201).json(profile);
});

app.get('/api/v1/profiles/:id', (req, res) => {
  const profile = profiles.find(p => p.id === req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json(profile);
});

// Classroom routes
app.post('/api/v1/classrooms', (req, res) => {
  const classroom = {
    ...req.body,
    id: uuidv4(),
    code: generateClassroomCode(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  classrooms.push(classroom);
  res.status(201).json(classroom);
});

app.get('/api/v1/classrooms/:code', (req, res) => {
  const classroom = classrooms.find(c => c.code === req.params.code);
  if (!classroom) {
    return res.status(404).json({ error: 'Classroom not found' });
  }
  res.json(classroom);
});

app.get('/api/v1/classrooms/user/:userId', (req, res) => {
  const userId = req.params.userId;
  
  // Get classrooms where user is teacher
  const teacherClassrooms = classrooms.filter(c => c.teacher_id === userId);
  
  // Get classrooms where user is student
  const studentMemberships = classroomMembers.filter(m => m.student_id === userId);
  const studentClassrooms = classrooms.filter(c => 
    studentMemberships.some(m => m.classroom_id === c.id)
  );
  
  const allClassrooms = [...teacherClassrooms, ...studentClassrooms];
  res.json(allClassrooms);
});

// Classroom membership routes
app.post('/api/v1/classroom-members', (req, res) => {
  const member = {
    ...req.body,
    id: uuidv4(),
    joined_at: new Date().toISOString()
  };
  classroomMembers.push(member);
  res.status(201).json(member);
});

app.get('/api/v1/classroom-members/:classroomId', (req, res) => {
  const members = classroomMembers.filter(m => m.classroom_id === req.params.classroomId);
  res.json(members);
});

// Assignment routes
app.post('/api/v1/assignments', (req, res) => {
  const assignment = {
    ...req.body,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  assignments.push(assignment);
  res.status(201).json(assignment);
});

app.get('/api/v1/assignments/classroom/:classroomId', (req, res) => {
  const classroomAssignments = assignments.filter(a => a.classroom_id === req.params.classroomId);
  res.json(classroomAssignments);
});

// Quiz routes
app.post('/api/v1/quizzes', (req, res) => {
  const quiz = {
    ...req.body,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  quizzes.push(quiz);
  res.status(201).json(quiz);
});

app.get('/api/v1/quizzes/classroom/:classroomId', (req, res) => {
  const classroomQuizzes = quizzes.filter(q => q.classroom_id === req.params.classroomId);
  res.json(classroomQuizzes);
});

// Poll routes
app.post('/api/v1/polls', (req, res) => {
  const poll = {
    ...req.body,
    id: uuidv4(),
    created_at: new Date().toISOString()
  };
  polls.push(poll);
  res.status(201).json(poll);
});

app.get('/api/v1/polls/classroom/:classroomId', (req, res) => {
  const classroomPolls = polls.filter(p => p.classroom_id === req.params.classroomId);
  res.json(classroomPolls);
});

// Live lecture routes
app.post('/api/v1/lectures', (req, res) => {
  const lecture = {
    ...req.body,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  liveLectures.push(lecture);
  res.status(201).json(lecture);
});

app.get('/api/v1/lectures/college/:collegeId', (req, res) => {
  const collegeLectures = liveLectures.filter(l => l.college_id === req.params.collegeId);
  res.json(collegeLectures);
});

// Chat routes
app.post('/api/v1/chat', (req, res) => {
  const message = {
    ...req.body,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  classroomChat.push(message);
  res.status(201).json(message);
});

app.get('/api/v1/chat/:classroomId', (req, res) => {
  const messages = classroomChat
    .filter(m => m.classroom_id === req.params.classroomId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  res.json(messages);
});

// Utility functions
function generateCollegeCode() {
  return 'COL-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function generateClassroomCode() {
  return 'CLS-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

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