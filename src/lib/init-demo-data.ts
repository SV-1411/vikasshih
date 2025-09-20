/**
 * Initialize demo data for testing
 */

import { safeLocalStorage } from './error-utils';

export function initializeDemoData() {
  console.log('🚀 Initializing demo data...');
  
  // Check if demo data already exists
  const existingColleges = safeLocalStorage.getJSON<any[]>('demo_colleges', []);
  
  if (existingColleges.length === 0) {
    console.log('📝 Creating initial demo college...');
    
    // Create a demo college
    const demoCollege = {
      id: 'college_demo_1',
      code: 'COL-DEMO01',
      name: 'Demo College',
      address: '123 Demo Street, Demo City',
      contact_email: 'contact@demo.college',
      contact_phone: '1234567890',
      admin_id: 'admin_demo_1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Create demo admin
    const demoAdmin = {
      id: 'admin_demo_1',
      username: 'admin@demo.college',
      full_name: 'Demo Admin',
      role: 'admin',
      college_id: 'college_demo_1',
      group_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      password: 'demo123'
    };
    
    // Create demo teacher
    const demoTeacher = {
      id: 'teacher_demo_1',
      username: 'teacher@demo.college',
      full_name: 'Demo Teacher',
      role: 'teacher',
      college_id: 'college_demo_1',
      group_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      password: 'demo123'
    };
    
    // Create demo student
    const demoStudent = {
      id: 'student_demo_1',
      username: 'student@demo.college',
      full_name: 'Demo Student',
      role: 'student',
      college_id: 'college_demo_1',
      group_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      password: 'demo123'
    };
    
    // Save to localStorage
    safeLocalStorage.setJSON('demo_colleges', [demoCollege]);
    safeLocalStorage.setJSON('demo_users', [demoAdmin, demoTeacher, demoStudent]);
    
    console.log('✅ Demo data initialized successfully!');
    console.log('📋 Demo College Code:', demoCollege.code);
    console.log('👤 Demo Users:');
    console.log('  - Admin: admin@demo.college / demo123');
    console.log('  - Teacher: teacher@demo.college / demo123');
    console.log('  - Student: student@demo.college / demo123');
    
    return {
      college: demoCollege,
      users: [demoAdmin, demoTeacher, demoStudent]
    };
  } else {
    console.log('✅ Demo data already exists');
    const existingUsers = safeLocalStorage.getJSON<any[]>('demo_users', []);
    return {
      colleges: existingColleges,
      users: existingUsers
    };
  }
}

export function clearDemoData() {
  console.log('🗑️ Clearing all demo data...');
  
  const keys = [
    'demo_current_user',
    'demo_auth_token',
    'demo_colleges',
    'demo_users',
    'demo_classrooms',
    'demo_polls',
    'demo_quizzes',
    'demo_live_lectures',
    'demo_chat'
  ];
  
  keys.forEach(key => safeLocalStorage.removeItem(key));
  
  console.log('✅ Demo data cleared');
}

export function loginAsDemo(role: 'admin' | 'teacher' | 'student') {
  console.log(`🔐 Logging in as demo ${role}...`);
  
  // Initialize demo data if needed
  initializeDemoData();
  
  const users = safeLocalStorage.getJSON<any[]>('demo_users', []);
  const user = users.find(u => u.role === role);
  
  if (user) {
    const { password, ...userProfile } = user;
    safeLocalStorage.setJSON('demo_current_user', userProfile);
    safeLocalStorage.setItem('demo_auth_token', 'demo_token_' + Date.now());
    
    console.log(`✅ Logged in as ${role}:`, userProfile);
    return userProfile;
  } else {
    console.error(`❌ No demo ${role} user found`);
    return null;
  }
}
