import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import LandingPage from './components/LandingPage';
import AboutPage from './components/AboutPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import { auth } from './lib/auth';
import { db } from './lib/database';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database indexes
      await db.initializeIndexes();
      
      // Check if user is already logged in
      const currentUser = auth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      
      // Load sample data if no courses exist
      await loadSampleData();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = async () => {
    try {
      await db.getCourses();
      
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

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Vikas...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {user ? (
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
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  );
}

export default App;