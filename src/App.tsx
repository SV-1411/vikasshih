import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import LandingPage from './components/LandingPage';
import AboutPage from './components/AboutPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import UserLogin from './components/UserLogin';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import CollegeRegistration from './components/CollegeRegistration';
import CollegeLogin from './components/CollegeLogin';
import UserRegistration from './components/UserRegistration';
import CollegeDashboard from './components/CollegeDashboard';
import ClassroomDashboard from './components/ClassroomDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { auth } from './lib/auth';
import { db } from './lib/database';
import { userApi } from './lib/educational-api';
import { supabase } from './lib/supabase';
import { User, Profile, College } from './types';
import { DEMO_MODE } from './lib/config';
import { initializeDemoData } from './lib/init-demo-data';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [appMode, setAppMode] = useState<'legacy' | 'educational'>('educational');
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize demo data first if in demo mode
    if (DEMO_MODE) {
      import('./lib/demo-data').then(({ initializeDemoData }) => {
        initializeDemoData();
        // Small delay to ensure localStorage is written
        setTimeout(() => {
          initializeApp();
        }, 100);
      });
    } else {
      initializeApp();
    }
  }, []);

  // Auto-redirect when profile is set
  useEffect(() => {
    if (appMode !== 'educational') return;
    if (!profile) return;
    // If admin and college known, go to college dashboard; else to classrooms
    if (profile.role === 'admin') {
      if (college) {
        navigate('/college-dashboard', { replace: true });
      }
    } else {
      navigate('/classrooms', { replace: true });
    }
  }, [appMode, profile, college, navigate]);

  // When an admin logs in (demo mode), ensure we load their college from localStorage
  useEffect(() => {
    if (appMode !== 'educational') return;
    if (!profile || profile.role !== 'admin') return;
    if (college) return;
    
    console.log('🔍 Admin profile detected, looking for college...', { 
      profile_college_id: profile.college_id,
      profile_role: profile.role 
    });
    
    try {
      const colleges = JSON.parse(localStorage.getItem('demo_colleges') || '[]');
      console.log('📋 Available colleges in localStorage:', colleges);
      
      const found = colleges.find((c: any) => c.id === profile.college_id);
      if (found) {
        setCollege(found);
        console.log('🏫 Loaded college for admin from localStorage:', found);
      } else {
        console.warn('⚠️ No college found for admin college_id:', profile.college_id);
        // If no college found but we have colleges, use the first one
        if (colleges.length > 0) {
          setCollege(colleges[0]);
          console.log('🏫 Using first available college as fallback:', colleges[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load college from localStorage:', e);
    }
  }, [appMode, profile, college]);

  // Listen for Supabase auth state changes to update UI immediately after sign-in/registration
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      try {
        // If running in demo (localStorage) auth mode, ignore Supabase events
        const demoToken = localStorage.getItem('demo_auth_token');
        if (demoToken) {
          return;
        }
        if (session?.user) {
          const profileResult = await userApi.getCurrentProfile();
          if (profileResult.data) {
            setProfile(profileResult.data);
            setAppMode('educational');
          }
        } else {
          // Signed out
          setProfile(null);
          setCollege(null);
        }
      } catch (err) {
        console.warn('Auth state change handling error:', err);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log('🚀 App initializing...');
    
    // Initialize demo data if in demo mode
    if (DEMO_MODE) {
      initializeDemoData();
    }
    
    // Initialize app
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing app...');
      
      // Set a shorter timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ App initialization timeout, proceeding anyway');
        setLoading(false);
      }, 5000); // 5 second timeout

      // 1) Check demo mode first (faster than Supabase)
      if (DEMO_MODE) {
        console.log('🎯 DEMO_MODE enabled, checking localStorage auth...');
        const demoUser = localStorage.getItem('demo_current_user');
        const demoToken = localStorage.getItem('demo_auth_token');
        
        if (demoUser && demoToken) {
          console.log('✅ Demo auth found, loading profile...');
          const profileData = JSON.parse(demoUser);
          setProfile(profileData);
          setAppMode('educational');
          
          // Load college data if user is admin
          if (profileData.role === 'admin' && profileData.college_id) {
            const colleges = JSON.parse(localStorage.getItem('demo_colleges') || '[]');
            const userCollege = colleges.find((c: any) => c.id === profileData.college_id);
            if (userCollege) {
              setCollege(userCollege);
              console.log('🏫 College data loaded for admin:', userCollege.name);
            }
          }
          
          clearTimeout(timeoutId);
          setLoading(false);
          return;
        } else {
          console.log('📱 No demo auth found in localStorage');
        }
      }

      // 2) Supabase authentication
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Found Supabase session, loading profile...');
          const profileResult = await userApi.getCurrentProfile();
          if (profileResult.data) {
            setProfile(profileResult.data);
            setAppMode('educational');
            console.log('Profile loaded successfully');
            
            // Load college data if user has college_id
            if (profileResult.data.college_id) {
              // Load college data here if needed
            }
            clearTimeout(timeoutId);
            setLoading(false);
            return;
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase session check failed:', supabaseError);
      }

      // 3) Fallback to legacy (non-educational) demo only if DEMO_MODE
      if (DEMO_MODE) {
        console.log('📱 Checking legacy auth...');
        try {
          await db.initializeIndexes();
          const currentUser = auth.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setAppMode('legacy');
            console.log('Legacy user found');
          } else {
            console.log('No legacy user, loading sample data...');
            await loadSampleData();
          }
        } catch (legacyError) {
          console.warn('Legacy system failed, continuing without it:', legacyError);
        }
      }
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = async () => {
    try {
      console.log('Loading sample data...');
      
      // Add timeout for sample data loading
      const sampleDataTimeout = setTimeout(() => {
        console.warn('Sample data loading timeout');
      }, 5000);
      
      await db.getCourses();
      clearTimeout(sampleDataTimeout);
      
      // Always check if sample course exists, regardless of user's enrolled courses
      const existingCourse = await db.getCourse('course_fluid_mechanics');
      if (!existingCourse) {
        // Create sample course
        const sampleCourse = {
          _id: 'course_fluid_mechanics',
          id: uuidv4(),
          title: 'Fluid Mechanics Fundamentals',
          description: 'Learn the basics of fluid mechanics with interactive audio lessons and practical exercises.',
          language: 'en',
          version: '1.0.0',
          channel_id: uuidv4(),
          created_by: 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        try {
          await db.saveCourse(sampleCourse);
        } catch (error: any) {
          if (error?.name === 'conflict') {
            return; // Course already exists
          }
          throw error;
        }

        // Create sample module
        const sampleModule = {
          _id: 'module_introduction',
          id: uuidv4(),
          course_id: sampleCourse.id,
          title: 'Introduction to Fluids',
          description: 'Basic concepts and properties of fluids',
          order: 0,
          created_at: new Date().toISOString()
        };

        try {
          await db.saveModule(sampleModule);
        } catch (error: any) {
          if (error?.name === 'conflict') {
            return; // Module already exists
          }
          throw error;
        }

        // Create sample lessons
        const sampleLessons = [
          {
            _id: 'lesson_1',
            id: uuidv4(),
            module_id: sampleModule.id,
            title: 'What are Fluids?',
            type: 'audio' as const,
            content_ref: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Sample audio
            duration: 300,
            size: 2048000,
            transcript: 'In this lesson, we explore the fundamental definition of fluids and their unique properties. Fluids are substances that flow and take the shape of their container. Unlike solids, fluids cannot maintain a fixed shape and will deform under stress. The two main categories of fluids are liquids and gases, each with distinct characteristics that affect how they behave in different situations.',
            order: 0,
            created_at: new Date().toISOString()
          },
          {
            _id: 'lesson_2',
            id: uuidv4(),
            module_id: sampleModule.id,
            title: 'Properties of Fluids',
            type: 'audio' as const,
            content_ref: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Sample audio
            duration: 450,
            size: 3072000,
            transcript: 'Fluid properties are essential characteristics that determine how fluids behave in different conditions. Key properties include density, viscosity, compressibility, and surface tension. Density measures mass per unit volume, while viscosity indicates resistance to flow. Understanding these properties helps engineers design systems that work efficiently with different types of fluids.',
            order: 1,
            created_at: new Date().toISOString()
          }
        ];

        for (const lesson of sampleLessons) {
          try {
            await db.saveLesson(lesson);
          } catch (error: any) {
            if (error?.name !== 'conflict') {
              throw error;
            }
          }
        }

        // Create sample activities
        const sampleActivities = [
          {
            _id: 'activity_1',
            id: uuidv4(),
            lesson_id: sampleLessons[0].id,
            type: 'quiz' as const,
            title: 'What are Fluids? - Quiz',
            schema: {
              type: 'mcq' as const,
              question: 'Which of the following is NOT a characteristic of fluids?',
              options: [
                'They flow and take the shape of their container',
                'They maintain a fixed shape under stress', 
                'They can be liquids or gases',
                'They deform under applied stress'
              ],
              correctAnswer: 'They maintain a fixed shape under stress',
              explanation: 'Fluids cannot maintain a fixed shape and will deform under stress, unlike solids.',
              points: 10
            },
            order: 0,
            created_at: new Date().toISOString()
          },
          {
            _id: 'activity_2', 
            id: uuidv4(),
            lesson_id: sampleLessons[1].id,
            type: 'quiz' as const,
            title: 'Fluid Properties - Quiz',
            schema: {
              type: 'multi-select' as const,
              question: 'Select all the key properties of fluids mentioned in the lesson:',
              options: [
                'Density',
                'Viscosity', 
                'Hardness',
                'Compressibility',
                'Surface tension',
                'Magnetism'
              ],
              correctAnswer: ['Density', 'Viscosity', 'Compressibility', 'Surface tension'],
              explanation: 'The key fluid properties covered were density, viscosity, compressibility, and surface tension.',
              points: 15
            },
            order: 0,
            created_at: new Date().toISOString()
          }
        ];

        for (const activity of sampleActivities) {
          try {
            await db.saveActivity(activity);
          } catch (error: any) {
            if (error?.name !== 'conflict') {
              throw error;
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load sample data:', error);
    }
  };

  const handleAuthSuccess = () => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
  };

  const handleEducationalAuthSuccess = (userData: any) => {
    setProfile(userData);
    setAppMode('educational');
  };

  const handleCollegeRegistrationSuccess = (collegeData: College) => {
    console.log('🎉 College registration success callback:', collegeData);
    setCollege(collegeData);
    
    // Also need to set the profile and app mode
    const currentUser = localStorage.getItem('demo_current_user');
    if (currentUser) {
      const profileData = JSON.parse(currentUser);
      console.log('📝 Setting profile from registration success:', profileData);
      setProfile(profileData);
      setAppMode('educational');
    }
  };

  const handleLogout = async () => {
    try {
      if (appMode === 'educational') {
        // Attempt Supabase sign out (may be a mock in offline mode)
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('Supabase signOut skipped or failed (likely offline mode):', e);
        }
        // Clear demo/localStorage auth
        localStorage.removeItem('demo_current_user');
        localStorage.removeItem('demo_auth_token');
        setProfile(null);
        setCollege(null);
      } else {
        await auth.logout();
        setUser(null);
      }
    } finally {
      // Navigate to home to ensure routes reset
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Educational Platform...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 Rendering routes:', { 
    appMode, 
    profile: !!profile, 
    college: !!college, 
    profileRole: profile?.role 
  });

  return (
    <ErrorBoundary>
        <Routes>
          {/* Educational Platform Routes */}
          {appMode === 'educational' && profile ? (
            <>
              {profile.role === 'admin' && college ? (
                <>
                  {console.log('🏫 Rendering college dashboard routes for admin with college')}
                  <Route path="/college-dashboard" element={
                    <CollegeDashboard college={college} currentUser={profile} onLogout={handleLogout} />
                  } />
                  <Route path="*" element={<Navigate to="/college-dashboard" />} />
                </>
              ) : profile.role === 'admin' && !college ? (
                <>
                  {console.log('⏳ Admin without college - showing loading or redirect to auth')}
                  <Route path="*" element={<Navigate to="/college-login" />} />
                </>
              ) : (
                <>
                  {console.log('🎓 Rendering classroom dashboard routes for non-admin user')}
                  <Route path="/classrooms" element={
                    <ClassroomDashboard currentUser={profile} onLogout={handleLogout} />
                  } />
                  <Route path="*" element={<Navigate to="/classrooms" />} />
                </>
              )}
            </>
          ) : appMode === 'educational' && !profile ? (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/register-college" element={
                <CollegeRegistration 
                  onSuccess={handleCollegeRegistrationSuccess}
                  onBack={() => window.location.href = '/'}
                />
              } />
              <Route path="/college-login" element={
                <CollegeLogin 
                  onSuccess={handleEducationalAuthSuccess}
                  onBack={() => window.location.href = '/'}
                />
              } />
              <Route path="/register-user" element={
                <UserRegistration 
                  onSuccess={handleEducationalAuthSuccess}
                  onBack={() => window.location.href = '/'}
                />
              } />
              <Route path="/user-login" element={
                <UserLogin 
                  onSuccess={handleEducationalAuthSuccess}
                  onBack={() => window.location.href = '/'}
                />
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : 
          
          /* Legacy Routes */
          user ? (
            <>
              <Route path="/dashboard" element={
                <>
                  {user.role === 'student' && <StudentDashboard onLogout={handleLogout} />}
                  {user.role === 'teacher' && <TeacherDashboard onLogout={handleLogout} />}
                  {user.role === 'admin' && <AdminDashboard onLogout={handleLogout} />}
                </>
              } />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage onAuthSuccess={handleAuthSuccess} />} />
              <Route path="/signup" element={<SignupPage onAuthSuccess={handleAuthSuccess} />} />
              <Route path="/register-college" element={
                <CollegeRegistration 
                  onSuccess={handleCollegeRegistrationSuccess}
                  onBack={() => window.location.href = '/'}
                />
              } />
              <Route path="/college-login" element={
                <CollegeLogin 
                  onSuccess={handleEducationalAuthSuccess}
                  onBack={() => window.location.href = '/'}
                />
              } />
              <Route path="/register-user" element={
                <UserRegistration 
                  onSuccess={handleEducationalAuthSuccess}
                  onBack={() => window.location.href = '/'}
                />
              } />
              <Route path="/user-login" element={
                <UserLogin 
                  onSuccess={handleEducationalAuthSuccess}
                  onBack={() => window.location.href = '/'}
                />
              } />
              <Route path="/debug" element={
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
                  <div className="space-y-4">
                    <div>
                      <strong>App Mode:</strong> {appMode}
                    </div>
                    <div>
                      <strong>Profile:</strong> {profile ? JSON.stringify(profile, null, 2) : 'null'}
                    </div>
                    <div>
                      <strong>College:</strong> {college ? JSON.stringify(college, null, 2) : 'null'}
                    </div>
                    <div>
                      <strong>localStorage demo_current_user:</strong> 
                      <pre>{localStorage.getItem('demo_current_user') || 'null'}</pre>
                    </div>
                    <div>
                      <strong>localStorage demo_auth_token:</strong> 
                      <pre>{localStorage.getItem('demo_auth_token') || 'null'}</pre>
                    </div>
                    <div>
                      <strong>localStorage demo_colleges:</strong> 
                      <pre>{localStorage.getItem('demo_colleges') || 'null'}</pre>
                    </div>
                  </div>
                </div>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
    </ErrorBoundary>
  );
}

export default App;