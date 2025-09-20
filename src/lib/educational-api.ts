import { supabase } from './supabase';
import { DEMO_MODE } from './config';
import { safeLocalStorage } from './error-utils';
import type {
  College,
  Profile,
  Classroom,
  ClassroomMember,
  Assignment,
  AssignmentSubmission,
  Quiz,
  QuizAttempt,
  Poll,
  PollResponse,
  LiveLecture,
  LectureAttendee,
  ClassroomChat,
  Notification,
  CollegeRegistrationForm,
  UserRegistrationForm,
  ClassroomForm,
  AssignmentForm,
  QuizForm,
  PollForm,
  LiveLectureForm,
  ApiResponse,
  // PaginatedResponse // Reserved for future use
} from '../types';

// College Management
export const collegeApi = {
  async register(data: CollegeRegistrationForm): Promise<ApiResponse<College>> {
    try {
      console.log('📝 Starting college registration with data:', data);
      
      // Skip backend for now - go straight to localStorage for demo
      // This ensures immediate success for your presentation

      console.log('📦 Using localStorage for registration');
      
      const collegeId = `college_${Date.now()}`;
      const collegeCode = `COL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const adminId = `admin_${Date.now()}`;
      
      const college: College = {
        id: collegeId,
        code: collegeCode,
        name: data.name,
        address: data.address,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        admin_id: adminId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const adminProfile = {
        id: adminId,
        username: data.admin_email,
        full_name: data.admin_name,
        role: 'admin' as const,
        college_id: collegeId,
        phone: undefined,
        is_active: true,
        group_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to localStorage
      const colleges = safeLocalStorage.getJSON<any[]>('demo_colleges', []);
      colleges.push(college);
      safeLocalStorage.setJSON('demo_colleges', colleges);

      const users = safeLocalStorage.getJSON<any[]>('demo_users', []);
      users.push({ ...adminProfile, password: data.admin_password });
      safeLocalStorage.setJSON('demo_users', users);

      safeLocalStorage.setJSON('demo_current_user', adminProfile);
      safeLocalStorage.setItem('demo_auth_token', 'demo_token_' + Date.now());

      console.log('✅ College registered successfully in localStorage:', college);
      console.log('🎯 College Code:', college.code);
      console.log('👤 Admin credentials:', data.admin_email, '/', data.admin_password);

      return { data: college };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getByCode(code: string): Promise<ApiResponse<College>> {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('code', code)
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getById(id: string): Promise<ApiResponse<College>> {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getDashboard(collegeId: string): Promise<ApiResponse<{
    college: College;
    teachers: Profile[];
    students: Profile[];
    classrooms: Classroom[];
    lectures: LiveLecture[];
  }>> {
    console.log('🔍 getDashboard called with collegeId:', collegeId);
    
    try {
      // Skip Supabase entirely and go straight to localStorage for demo
      console.log('📊 Loading dashboard data from localStorage...');
      
      const colleges = JSON.parse(localStorage.getItem('demo_colleges') || '[]');
      const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
      const demoClassrooms: Classroom[] = JSON.parse(localStorage.getItem('demo_classrooms') || '[]');
      const demoLecturesRaw = JSON.parse(localStorage.getItem('demo_live_lectures') || '[]');
      
      console.log('📊 Found in localStorage:', { 
        colleges: colleges.length, 
        users: users.length,
        targetCollegeId: collegeId 
      });
      
      const college = colleges.find((c: any) => c.id === collegeId);
      if (!college) {
        console.error('❌ College not found in localStorage for ID:', collegeId);
        console.log('Available colleges:', colleges.map((c: any) => ({ id: c.id, name: c.name })));
        throw new Error(`College not found with ID: ${collegeId}`);
      }

      const teachers = users.filter((u: any) => u.college_id === collegeId && u.role === 'teacher');
      const students = users.filter((u: any) => u.college_id === collegeId && u.role === 'student');
      
      console.log('📊 Filtered users:', { 
        teachers: teachers.length, 
        students: students.length,
        allUsers: users.map((u: any) => ({ id: u.id, role: u.role, college_id: u.college_id }))
      });
      
      // For demo purposes: load classrooms and live lectures from localStorage
      const classrooms: Classroom[] = demoClassrooms.filter((c: any) => c.college_id === collegeId);
      const lectures: LiveLecture[] = (demoLecturesRaw || [])
        .filter((s: any) => s.college_id === collegeId)
        .map((s: any) => ({
          id: s.id,
          classroom_id: s.classroom_id,
          college_id: s.college_id,
          title: s.title || 'Live Slides Session',
          description: 'Live slides (low bandwidth)',
          teacher_id: s.teacher_id,
          scheduled_at: s.scheduled_at,
          duration: undefined,
          status: s.status,
          meeting_url: undefined,
          recording_url: undefined,
          created_at: s.created_at,
          updated_at: s.updated_at,
          teacher: users.find((u: any) => u.id === s.teacher_id),
          classroom: demoClassrooms.find((c: any) => c.id === s.classroom_id)
        }));

      const dashboardData = {
        college,
        teachers,
        students,
        classrooms,
        lectures
      };

      console.log('✅ Dashboard data prepared:', dashboardData);

      return { data: dashboardData };
    } catch (error: any) {
      console.error('💥 getDashboard error:', error);
      return { error: error.message };
    }
  }
};

// User Management
export const userApi = {
  async register(data: UserRegistrationForm): Promise<ApiResponse<Profile>> {
    try {
      console.log('👤 Starting user registration with data:', data);
      
      // First check if college exists in localStorage
      const storedColleges = safeLocalStorage.getJSON<any[]>('demo_colleges', []);
      const targetCollege = storedColleges.find((c: any) => c.code === data.college_code);
      
      if (!targetCollege) {
        console.error('❌ Invalid college code:', data.college_code);
        return { error: `Invalid college code: ${data.college_code}. Please check with your college administration.` };
      }

      // Skip backend - go straight to localStorage for demo
      console.log('📦 Using localStorage for user registration');
      
      const userId = `user_${Date.now()}`;
      const userProfile: Profile = {
        id: userId,
        username: data.email,
        full_name: data.full_name,
        role: data.role as 'student' | 'teacher',
        college_id: targetCollege.id,
        phone: data.phone || undefined,
        is_active: true,
        group_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Profile;

      const users = safeLocalStorage.getJSON<any[]>('demo_users', []);
      users.push({ ...userProfile, password: data.password });
      safeLocalStorage.setJSON('demo_users', users);
      safeLocalStorage.setJSON('demo_current_user', userProfile);
      safeLocalStorage.setItem('demo_auth_token', 'demo_token_' + Date.now());

      console.log('✅ User registered successfully in localStorage:', userProfile);
      console.log('👤 User credentials:', data.email, '/', data.password);

      return { data: userProfile };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getCurrentProfile(): Promise<ApiResponse<Profile>> {
    try {
      // Try Supabase first
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            return { data };
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase not available, checking localStorage');
      }

      // Demo fallback to localStorage only if DEMO_MODE
      if (!DEMO_MODE) {
        throw new Error('Not authenticated');
      }
      const currentUser = localStorage.getItem('demo_current_user');
      const authToken = localStorage.getItem('demo_auth_token');
      
      if (!currentUser || !authToken) {
        throw new Error('Not authenticated');
      }

      const profile = JSON.parse(currentUser);
      return { data: profile };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async updateProfile(updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};

// Classroom Management
export const classroomApi = {
  async create(data: ClassroomForm): Promise<ApiResponse<Classroom>> {
    // Demo mode fallback using localStorage when a demo auth token is present
    const demoToken = localStorage.getItem('demo_auth_token');
    if (demoToken) {
      try {
        const demoUserRaw = localStorage.getItem('demo_current_user');
        if (!demoUserRaw) throw new Error('No demo user found');
        const demoUser: any = JSON.parse(demoUserRaw);

        // Ensure only teachers can create a classroom in demo mode
        if (demoUser.role !== 'teacher') {
          throw new Error('Only teachers can create classrooms');
        }

        // Prepare a classroom object
        const classroomId = `classroom_${Date.now()}`;
        const classroomCode = `CLS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const newClassroom: Classroom = {
          id: classroomId,
          code: classroomCode,
          name: data.name,
          subject: data.subject || '',
          description: data.description || '',
          teacher_id: demoUser.id,
          college_id: demoUser.college_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          members_count: 0,
          member_ids: [],
          // teacher object will be populated in UI using demoUser
          teacher: demoUser,
        } as unknown as Classroom; // Cast as Classroom to satisfy TS

        // Persist to localStorage
        const stored: Classroom[] = JSON.parse(localStorage.getItem('demo_classrooms') || '[]');
        stored.push(newClassroom);
        localStorage.setItem('demo_classrooms', JSON.stringify(stored));

        console.log('🆕 Classroom created in demo mode:', newClassroom);
        return { data: newClassroom };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('college_id')
        .eq('id', user.id)
        .single();

      if (!profile?.college_id) throw new Error('User not associated with a college');

      const { data: classroom, error } = await supabase
        .from('classrooms')
        .insert({
          ...data,
          teacher_id: user.id,
          college_id: profile.college_id
        })
        .select()
        .single();

      if (error) throw error;
      return { data: classroom };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getByCode(code: string): Promise<ApiResponse<Classroom>> {
    const demoToken = localStorage.getItem('demo_auth_token');
    if (demoToken) {
      try {
        const classrooms: Classroom[] = JSON.parse(localStorage.getItem('demo_classrooms') || '[]');
        const normalized = code.trim().toUpperCase();
        const classroom = classrooms.find((c: any) => (c.code || '').toUpperCase() === normalized);
        if (!classroom) {
          return { error: 'Classroom not found' };
        }
        return { data: classroom };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    // Supabase fallback
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*, teacher:profiles!teacher_id(*)')
        .eq('code', code)
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async joinClassroom(classroomCode: string): Promise<ApiResponse<ClassroomMember>> {
    // 🚀 LocalStorage join path (works for all demo accounts / offline)
    try {
      console.log('🔍 Checking localStorage for demo data...');
      const demoUserRaw = localStorage.getItem('demo_current_user');
      const classroomsRaw = localStorage.getItem('demo_classrooms');
      console.log('👤 Demo user found:', !!demoUserRaw);
      console.log('🏫 Demo classrooms found:', !!classroomsRaw);
      
      if (demoUserRaw && classroomsRaw) {
        const demoUser: any = JSON.parse(demoUserRaw);
        const classrooms: Classroom[] = JSON.parse(classroomsRaw);
        console.log('📚 Available classrooms:', classrooms.map(c => ({ id: c.id, code: c.code, name: c.name })));
        
        const normalizedCode = classroomCode.trim().toUpperCase();
        console.log('🔤 Looking for code:', normalizedCode);
        console.log('🔍 Detailed comparison:');
        classrooms.forEach(c => {
          const cCode = (c.code || '').toUpperCase();
          console.log(`  - "${cCode}" === "${normalizedCode}" ? ${cCode === normalizedCode}`);
        });
        
        const classroom = classrooms.find(c => (c.code || '').toUpperCase() === normalizedCode);
        console.log('🎯 Found classroom:', !!classroom, classroom?.name);
        
        if (classroom) {
          if (!classroom.member_ids) classroom.member_ids = [];
          if (!classroom.member_ids.includes(demoUser.id)) {
            classroom.member_ids.push(demoUser.id);
            classroom.members_count = (classroom.members_count || 0) + 1;
          }
          localStorage.setItem('demo_classrooms', JSON.stringify(classrooms));
          const classroomMember: ClassroomMember = {
            id: `cm_${Date.now()}`,
            classroom_id: classroom.id,
            student_id: demoUser.id,
            joined_at: new Date().toISOString(),
            is_active: true,
            student: demoUser
          } as any;
          // Emit event for real-time updates
          const { localBus } = await import('./local-bus');
          localBus.emit('classroom_joined', { classroom, member: classroomMember });
          
          return { data: classroomMember };
        } else {
          console.log('❌ No matching classroom found for code:', classroomCode);
          return { error: `Classroom with code ${classroomCode} not found` };
        }
      } else {
        console.log('❌ Missing demo data - user:', !!demoUserRaw, 'classrooms:', !!classroomsRaw);
        return { error: 'Demo data not available' };
      }
    } catch (err: any) {
      console.error('💥 LocalStorage join error:', err);
      console.warn('LocalStorage join failed, will try Supabase fallback:', err.message);
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get classroom by code
      const { data: classroom, error: classroomError } = await supabase
        .from('classrooms')
        .select('id')
        .eq('code', classroomCode)
        .single();

      if (!classroom) {
        return { error: 'Invalid classroom code - classroom not found' };
      }

      // Join classroom
      const { data, error } = await supabase
        .from('classroom_members')
        .insert({
          classroom_id: classroom.id,
          student_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getMyClassrooms(): Promise<ApiResponse<Classroom[]>> {
    // Fast-path: Demo mode localStorage authentication
    const demoToken = localStorage.getItem('demo_auth_token');
    if (demoToken) {
      console.log('🟢 Demo token detected – returning classrooms from localStorage');
      try {
        const demoUserRaw = localStorage.getItem('demo_current_user');
        if (!demoUserRaw) throw new Error('No demo user');
        const demoUser = JSON.parse(demoUserRaw);
        // For now we store no classrooms in demo; return empty list
        const demoClassrooms: Classroom[] = JSON.parse(localStorage.getItem('demo_classrooms') || '[]');
        const myClassrooms = demoClassrooms.filter((c:any)=> c.teacher_id===demoUser.id || (c.member_ids||[]).includes(demoUser.id));
        return { data: myClassrooms };
      } catch (e:any) {
        return { error: e.message };
      }
    }
    console.log('🔍 getMyClassrooms called');
    
    try {
      // Try Supabase first
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          let query;
          if (profile?.role === 'teacher') {
            query = supabase
              .from('classrooms')
              .select('*, teacher:profiles!teacher_id(*)')
              .eq('teacher_id', user.id);
          } else {
            query = supabase
              .from('classrooms')
              .select('*, teacher:profiles!teacher_id(*)')
              .in('id', 
                supabase
                  .from('classroom_members')
                  .select('classroom_id')
                  .eq('student_id', user.id)
              );
          }

          const { data, error } = await query;
          if (!error) {
            return { data: data || [] };
          }
        }
      } catch (supabaseError) {
        console.warn('🔄 Supabase classrooms query failed, using localStorage fallback:', supabaseError);
      }

      // Fallback: Use localStorage data for demo mode
      console.log('📚 Loading classrooms from localStorage...');
      
      const currentUser = localStorage.getItem('demo_current_user');
      if (!currentUser) {
        throw new Error('Not authenticated - no demo user found');
      }

      const userProfile = JSON.parse(currentUser);
      console.log('👤 Current user profile:', userProfile);

      // Load classrooms stored in localStorage for demo mode
      const demoClassrooms: Classroom[] = JSON.parse(localStorage.getItem('demo_classrooms') || '[]');
      const myClassrooms = demoClassrooms.filter((c:any)=> c.teacher_id===userProfile.id || (c.member_ids||[]).includes(userProfile.id));

      console.log('📚 Demo classrooms loaded:', myClassrooms);
      return { data: myClassrooms };
      
    } catch (error: any) {
      console.error('💥 getMyClassrooms error:', error);
      return { error: error.message };
    }
  },

  async getClassroomDetails(classroomId: string): Promise<ApiResponse<{
    classroom: Classroom;
    members: ClassroomMember[];
    assignments: Assignment[];
    quizzes: Quiz[];
    polls: Poll[];
  }>> {
    try {
      const [classroomRes, membersRes, assignmentsRes, quizzesRes, pollsRes] = await Promise.all([
        supabase.from('classrooms').select('*, teacher:profiles!teacher_id(*)').eq('id', classroomId).single(),
        supabase.from('classroom_members').select('*, student:profiles!student_id(*)').eq('classroom_id', classroomId),
        supabase.from('assignments').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false }),
        supabase.from('quizzes').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false }),
        supabase.from('polls').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false })
      ]);

      if (classroomRes.error) throw classroomRes.error;
      if (membersRes.error) throw membersRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;
      if (quizzesRes.error) throw quizzesRes.error;
      if (pollsRes.error) throw pollsRes.error;

      return {
        data: {
          classroom: classroomRes.data,
          members: membersRes.data,
          assignments: assignmentsRes.data,
          quizzes: quizzesRes.data,
          polls: pollsRes.data
        }
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};

// Assignment Management
export const assignmentApi = {
  async create(classroomId: string, data: AssignmentForm): Promise<ApiResponse<Assignment>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: assignment, error } = await supabase
        .from('assignments')
        .insert({
          ...data,
          classroom_id: classroomId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { data: assignment };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async submit(assignmentId: string, content: string, fileUrls: string[] = []): Promise<ApiResponse<AssignmentSubmission>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: user.id,
          content,
          file_urls: fileUrls
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async grade(submissionId: string, grade: number, feedback?: string): Promise<ApiResponse<AssignmentSubmission>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('assignment_submissions')
        .update({
          grade,
          feedback,
          graded_by: user.id,
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};

// Quiz Management
export const quizApi = {
  async create(classroomId: string, data: QuizForm): Promise<ApiResponse<Quiz>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: quiz, error } = await supabase
        .from('quizzes')
        .insert({
          ...data,
          classroom_id: classroomId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { data: quiz };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async startAttempt(quizId: string): Promise<ApiResponse<QuizAttempt>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check existing attempts
      const { data: existingAttempts } = await supabase
        .from('quiz_attempts')
        .select('attempt_number')
        .eq('quiz_id', quizId)
        .eq('student_id', user.id)
        .order('attempt_number', { ascending: false })
        .limit(1);

      const attemptNumber = (existingAttempts?.[0]?.attempt_number || 0) + 1;

      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          student_id: user.id,
          answers: {},
          attempt_number: attemptNumber
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async submitAttempt(attemptId: string, answers: Record<string, any>): Promise<ApiResponse<QuizAttempt>> {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
          answers,
          submitted_at: new Date().toISOString()
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};

// Poll Management
export const pollApi = {
  async create(classroomId: string, data: PollForm): Promise<ApiResponse<Poll>> {
    // Demo localStorage fallback
    const demoToken = localStorage.getItem('demo_auth_token');
    if (demoToken) {
      try {
        const demoUserRaw = localStorage.getItem('demo_current_user');
        if (!demoUserRaw) throw new Error('No demo user');
        const demoUser: any = JSON.parse(demoUserRaw);
        
        const poll: Poll = {
          id: `poll_${Date.now()}`,
          classroom_id: classroomId,
          question: data.question,
          options: data.options.map((text, index) => ({ id: index.toString(), text })),
          is_active: true,
          is_anonymous: data.is_anonymous,
          multiple_choice: data.multiple_choice,
          created_by: demoUser.id,
          created_at: new Date().toISOString(),
          ends_at: data.ends_at,
          responses_count: 0,
        } as unknown as Poll;
        
        const stored: Poll[] = JSON.parse(localStorage.getItem('demo_polls') || '[]');
        stored.push(poll);
        localStorage.setItem('demo_polls', JSON.stringify(stored));
        
        // Emit event for real-time updates
        const { localBus, demoEvents } = await import('./local-bus');
        localBus.emit(demoEvents.pollCreated(classroomId), poll);
        
        return { data: poll };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const options = data.options.map((text, index) => ({ id: index.toString(), text }));

      const { data: poll, error } = await supabase
        .from('polls')
        .insert({
          classroom_id: classroomId,
          question: data.question,
          options,
          is_anonymous: data.is_anonymous,
          multiple_choice: data.multiple_choice,
          ends_at: data.ends_at,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { data: poll };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getPolls(classroomId: string): Promise<ApiResponse<Poll[]>> {
    const demoToken = localStorage.getItem('demo_auth_token');
    if (demoToken) {
      try {
        const polls: Poll[] = JSON.parse(localStorage.getItem('demo_polls') || '[]');
        const classroomPolls = polls.filter((p: any) => p.classroom_id === classroomId);
        return { data: classroomPolls };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    // Supabase fallback would go here
    return { data: [] };
  },

  async respond(pollId: string, selectedOptions: number[]): Promise<ApiResponse<PollResponse>> {
    const demoToken = localStorage.getItem('demo_auth_token');
    if (demoToken) {
      try {
        const demoUserRaw = localStorage.getItem('demo_current_user');
        if (!demoUserRaw) throw new Error('No demo user');
        const demoUser: any = JSON.parse(demoUserRaw);
        
        const response: PollResponse = {
          id: `response_${Date.now()}`,
          poll_id: pollId,
          student_id: demoUser.id,
          selected_options: selectedOptions,
          created_at: new Date().toISOString(),
        } as unknown as PollResponse;
        
        const stored: PollResponse[] = JSON.parse(localStorage.getItem('demo_poll_responses') || '[]');
        stored.push(response);
        localStorage.setItem('demo_poll_responses', JSON.stringify(stored));
        
        // Emit event for real-time updates
        const { localBus, demoEvents } = await import('./local-bus');
        localBus.emit(demoEvents.pollResponse(pollId), response);
        
        return { data: response };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('poll_responses')
        .upsert({
          poll_id: pollId,
          student_id: user.id,
          selected_options: selectedOptions
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getResults(pollId: string): Promise<ApiResponse<{
    poll: Poll;
    responses: PollResponse[];
    results: { optionIndex: number; votes: number }[];
  }>> {
    try {
      const [pollRes, responsesRes] = await Promise.all([
        supabase.from('polls').select('*').eq('id', pollId).single(),
        supabase.from('poll_responses').select('*').eq('poll_id', pollId)
      ]);

      if (pollRes.error) throw pollRes.error;
      if (responsesRes.error) throw responsesRes.error;

      // Calculate results
      const results: { optionIndex: number; votes: number }[] = [];
      const poll = pollRes.data;
      
      poll.options.forEach((_: any, index: number) => {
        const votes = responsesRes.data.filter((response: any) => 
          response.selected_options && response.selected_options.includes(index)
        ).length;
        results.push({ optionIndex: index, votes });
      });

      return {
        data: {
          poll,
          responses: responsesRes.data,
          results
        }
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};

// Live Lecture Management
export const lectureApi = {
  async create(classroomId: string, data: LiveLectureForm): Promise<ApiResponse<LiveLecture>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('college_id')
        .eq('id', user.id)
        .single();

      if (!profile?.college_id) throw new Error('User not associated with a college');

      const { data: lecture, error } = await supabase
        .from('live_lectures')
        .insert({
          ...data,
          classroom_id: classroomId,
          college_id: profile.college_id,
          teacher_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { data: lecture };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async joinLecture(lectureId: string): Promise<ApiResponse<LectureAttendee>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lecture_attendees')
        .upsert({
          lecture_id: lectureId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async updateStatus(lectureId: string, status: 'scheduled' | 'live' | 'ended' | 'cancelled'): Promise<ApiResponse<LiveLecture>> {
    try {
      const { data, error } = await supabase
        .from('live_lectures')
        .update({ status })
        .eq('id', lectureId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};

// Chat Management
export const chatApi = {
  async getMessages(classroomId: string): Promise<ApiResponse<ClassroomChat[]>> {
    const demoToken = localStorage.getItem('demo_auth_token');
    if (demoToken) {
      try {
        const messages = JSON.parse(localStorage.getItem(`demo_chat_${classroomId}`) || '[]');
        return { data: messages };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    // Supabase fallback would go here
    return { data: [] };
  },

  async sendMessage(classroomId: string, message: string): Promise<ApiResponse<ClassroomChat>> {
    const demoToken = localStorage.getItem('demo_auth_token');
    if (demoToken) {
      try {
        const demoUserRaw = localStorage.getItem('demo_current_user');
        if (!demoUserRaw) throw new Error('No demo user');
        const demoUser: any = JSON.parse(demoUserRaw);
        
        const chatMessage: ClassroomChat = {
          id: `msg_${Date.now()}`,
          classroom_id: classroomId,
          sender_id: demoUser.id,
          message: message,
          message_type: 'text',
          file_urls: [],
          is_pinned: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: demoUser
        };
        
        const messages = JSON.parse(localStorage.getItem(`demo_chat_${classroomId}`) || '[]');
        messages.push(chatMessage);
        localStorage.setItem(`demo_chat_${classroomId}`, JSON.stringify(messages));
        
        // Emit event for real-time updates
        const { localBus, demoEvents } = await import('./local-bus');
        localBus.emit(demoEvents.chatMessage(classroomId), chatMessage);
        
        return { data: chatMessage };
      } catch (e: any) {
        return { error: e.message };
      }
    }
    // Supabase fallback would go here
    return { error: 'Not implemented' };
  }
};

// Notification Management
export const notificationApi = {
  async getMyNotifications(): Promise<ApiResponse<Notification[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return { data: data || [] };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async markAllAsRead(): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return { data: true };
    } catch (error: any) {
      return { error: error.message };
    }
  }
};
