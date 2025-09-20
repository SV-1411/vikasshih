// Demo accounts and data for quick testing
import { College, Profile, Classroom, Assignment, Quiz, QuizQuestion } from '../types';

export const DEMO_ACCOUNTS = {
  college: {
    email: 'admin@demo.college',
    password: 'demo123',
    name: 'Demo College Admin'
  },
  teacher: {
    email: 'teacher@demo.college',
    password: 'demo123',
    name: 'Aditya Turankar'
  },
  student: {
    email: 'student@demo.college', 
    password: 'demo123',
    name: 'Shivansh Verma'
  }
};

export const DEMO_COLLEGE: College = {
  id: 'demo_college_1',
  name: 'Demo University',
  code: 'DEMO001',
  address: '123 Education Street, Learning City',
  contact_email: 'contact@demo.college',
  contact_phone: '+1-555-0123',
  admin_id: 'demo_admin_1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const DEMO_PROFILES: Profile[] = [
  {
    id: 'demo_admin_1',
    username: 'admin@demo.college',
    full_name: 'Demo College Admin',
    role: 'admin',
    college_id: 'demo_college_1',
    phone: '+1-555-0100',
    is_active: true,
    group_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo_teacher_1',
    username: 'teacher@demo.college',
    full_name: 'Aditya Turankar',
    role: 'teacher',
    college_id: 'demo_college_1',
    phone: '+1-555-0101',
    is_active: true,
    group_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo_student_1',
    username: 'student@demo.college',
    full_name: 'Shivansh Verma',
    role: 'student',
    college_id: 'demo_college_1',
    phone: '+1-555-0102',
    is_active: true,
    group_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Very small SVG slides as data URLs to keep the repo light but still demo-ready
const SLIDE = (bg: string, text: string) =>
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='675'>` +
      `<rect width='100%' height='100%' fill='${bg}'/>` +
      `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='48' font-family='Arial' fill='#111'>${text}</text>` +
    `</svg>`
  );

export const DEMO_LIVE_SLIDES = [
  {
    id: 'lec_demo_1',
    classroom_id: 'demo_classroom_1',
    college_id: 'demo_college_1',
    teacher_id: 'demo_teacher_1',
    title: 'Intro to Programming – Live Slides',
    status: 'live',
    scheduled_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    slides: [
      SLIDE('#FDE68A', 'Slide 1 – Course Overview'),
      SLIDE('#BFDBFE', 'Slide 2 – What is a Program?'),
      SLIDE('#C7D2FE', 'Slide 3 – Hello, World!')
    ],
    current_index: 1
  },
  {
    id: 'lec_demo_2',
    classroom_id: 'demo_classroom_2',
    college_id: 'demo_college_1',
    teacher_id: 'demo_teacher_1',
    title: 'Calculus Recap – Live Slides',
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    slides: [
      SLIDE('#BBF7D0', 'Limits and Continuity'),
      SLIDE('#A7F3D0', 'Derivatives Basics'),
      SLIDE('#99F6E4', 'Applications of Derivatives')
    ],
    current_index: 0
  }
];

export const DEMO_CLASSROOMS: Classroom[] = [
  {
    id: 'demo_classroom_1',
    name: 'Computer Science 101',
    description: 'Introduction to Programming',
    subject: 'Computer Science',
    code: 'CS101',
    teacher_id: 'demo_teacher_1',
    college_id: 'demo_college_1',
    is_active: true,
    members_count: 1,
    member_ids: ['demo_student_1'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    teacher: DEMO_PROFILES[1]
  },
  {
    id: 'demo_classroom_2',
    name: 'Artificial Intelligence 202',
    description: 'Linear Regressions',
    subject: 'Artificial Intelligence',
    code: 'AI202',
    teacher_id: 'demo_teacher_1',
    college_id: 'demo_college_1',
    is_active: true,
    members_count: 1,
    member_ids: ['demo_student_1'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    teacher: DEMO_PROFILES[1]
  },
  {
    id: 'demo_classroom_3',
    name: 'VLSI 302',
    description: 'VLSI',
    subject: 'VLSI',
    code: 'VLSI303',
    teacher_id: 'demo_teacher_1',
    college_id: 'demo_college_1',
    is_active: true,
    members_count: 1,
    member_ids: ['demo_student_1'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    teacher: DEMO_PROFILES[1]
  }
];

export const DEMO_ASSIGNMENTS: Assignment[] = [
  {
    id: 'demo_assignment_1',
    classroom_id: 'demo_classroom_1',
    title: 'Hello World Program',
    description: 'Write your first program in Python',
    instructions: 'Create a Python script that prints "Hello, World!" to the console.',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    max_points: 10,
    is_published: true,
    created_by: 'demo_teacher_1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    submissions_count: 0
  },
  {
    id: 'demo_assignment_2',
    classroom_id: 'demo_classroom_2',
    title: 'Derivative Problems',
    description: 'Solve calculus derivative problems',
    instructions: 'Complete problems 1-10 from Chapter 3 of your textbook.',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    max_points: 20,
    is_published: true,
    created_by: 'demo_teacher_1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    submissions_count: 0
  }
];

export const DEMO_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'mcq',
    question: 'What is the output of print("Hello World") in Python?',
    options: ['Hello World', 'hello world', 'HELLO WORLD', 'Error'],
    correct_answer: 'Hello World',
    points: 5,
    explanation: 'Python print() function outputs exactly what is in the quotes.'
  },
  {
    id: 'q2',
    type: 'mcq',
    question: 'Which of the following is a valid Python variable name?',
    options: ['2variable', 'my-variable', 'my_variable', 'my variable'],
    correct_answer: 'my_variable',
    points: 5,
    explanation: 'Python variables can contain letters, numbers, and underscores, but cannot start with a number or contain spaces/hyphens.'
  }
];

export const DEMO_QUIZZES: Quiz[] = [
  {
    id: 'demo_quiz_1',
    classroom_id: 'demo_classroom_1',
    title: 'Python Basics Quiz',
    description: 'Test your knowledge of Python fundamentals',
    questions: DEMO_QUIZ_QUESTIONS,
    time_limit: 30, // 30 minutes
    max_attempts: 3,
    is_published: true,
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    created_by: 'demo_teacher_1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attempts_count: 0
  }
];

// Demo chat messages
export const DEMO_CHAT_MESSAGES = [
  {
    id: 'msg_1',
    classroom_id: 'demo_classroom_1',
    sender_id: 'demo_teacher_1',
    message: 'Welcome to Computer Science 101! 👋',
    message_type: 'text',
    file_urls: [],
    is_pinned: false,
    created_at: new Date(Date.now() - 60000).toISOString(),
    updated_at: new Date(Date.now() - 60000).toISOString(),
    sender: DEMO_PROFILES[1]
  },
  {
    id: 'msg_2',
    classroom_id: 'demo_classroom_1',
    sender_id: 'demo_teacher_1',
    message: 'Today we\'ll be learning about Python basics. Feel free to ask questions!',
    message_type: 'text',
    file_urls: [],
    is_pinned: false,
    created_at: new Date(Date.now() - 30000).toISOString(),
    updated_at: new Date(Date.now() - 30000).toISOString(),
    sender: DEMO_PROFILES[1]
  }
];

// Function to initialize demo data in localStorage
export function initializeDemoData() {
  // Store demo accounts with individual passwords
  const demoUsers = DEMO_PROFILES.map(profile => ({
    ...profile,
    password: profile.role === 'admin' ? DEMO_ACCOUNTS.college.password :
              profile.role === 'teacher' ? DEMO_ACCOUNTS.teacher.password :
              DEMO_ACCOUNTS.student.password
  }));
  
  localStorage.setItem('demo_users', JSON.stringify(demoUsers));
  localStorage.setItem('demo_colleges', JSON.stringify([DEMO_COLLEGE]));
  localStorage.setItem('demo_classrooms', JSON.stringify(DEMO_CLASSROOMS));
  localStorage.setItem('demo_assignments', JSON.stringify(DEMO_ASSIGNMENTS));
  localStorage.setItem('demo_quizzes', JSON.stringify(DEMO_QUIZZES));
  localStorage.setItem('demo_chat_demo_classroom_1', JSON.stringify(DEMO_CHAT_MESSAGES));
  localStorage.setItem('demo_polls', JSON.stringify([]));
  localStorage.setItem('demo_poll_responses', JSON.stringify([]));
  localStorage.setItem('demo_live_lectures', JSON.stringify(DEMO_LIVE_SLIDES));
  
  console.log('✅ Demo data initialized in localStorage');
}

// Function to login as specific demo user
export function loginAsDemoUser(userType: 'college' | 'teacher' | 'student') {
  // Always initialize demo data first
  initializeDemoData();
  
  let profile: Profile;
  
  switch (userType) {
    case 'college':
      profile = DEMO_PROFILES[0]; // admin
      break;
    case 'teacher':
      profile = DEMO_PROFILES[1];
      break;
    case 'student':
      profile = DEMO_PROFILES[2];
      break;
    default:
      throw new Error('Invalid user type');
  }
  
  // Set current user in localStorage
  localStorage.setItem('demo_current_user', JSON.stringify(profile));
  localStorage.setItem('demo_auth_token', `demo_token_${userType}_${Date.now()}`);
  
  console.log(`✅ Logged in as demo ${userType}:`, profile.full_name);
  console.log('📦 Demo data initialized:', {
    classrooms: JSON.parse(localStorage.getItem('demo_classrooms') || '[]').length,
    users: JSON.parse(localStorage.getItem('demo_users') || '[]').length,
    chatMessages: JSON.parse(localStorage.getItem('demo_chat_demo_classroom_1') || '[]').length
  });
  return profile;
}
