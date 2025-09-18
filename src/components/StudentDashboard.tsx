import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Award, Flame, Star, Users, Settings, Brain, Timer } from 'lucide-react';
import SkillTree from './SkillTree';
import LessonView from './LessonView';
import OfflineTestTaker from './OfflineTestTaker';
import AdaptiveLearningPath from './AdaptiveLearningPath';
import TeacherConnection from './TeacherConnection';
import PomodoroFocus from './PomodoroFocus';
import { Course, Module, Lesson, UserProgress } from '../types';
import { db } from '../lib/database';
import { auth } from '../lib/auth';

interface StudentDashboardProps {
  onLogout: () => void;
}

export default function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [view, setView] = useState<'dashboard' | 'course' | 'lesson' | 'test' | 'adaptive' | 'teachers' | 'settings' | 'pomodoro'>('dashboard');
  const [learningMode, setLearningMode] = useState<'adaptive' | 'teacher_content' | 'mixed'>('mixed');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectedTeachers, setConnectedTeachers] = useState<any[]>([]);

  const user = auth.getCurrentUser();

  useEffect(() => {
    loadInitialData();
    loadConnectedTeachers();
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadConnectedTeachers = async () => {
    if (!user) return;
    try {
      const teachers = await db.getTeachersByStudent(user.id);
      setConnectedTeachers(teachers);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
  };

  const syncOfflineData = async () => {
    try {
      const queueItems = await db.getOfflineQueue();
      console.log('Syncing offline data:', queueItems.length, 'items');
      for (const item of queueItems) {
        // Sync test submissions, progress, etc.
        if (item.action === 'submit_test') {
          // Submit to server
          console.log('Syncing test submission:', item.data);
          await db.markQueueItemSynced(item._id);
        } else if (item.action === 'save_progress') {
          console.log('Syncing progress:', item.data);
          await db.markQueueItemSynced(item._id);
        } else if (item.action === 'update_user_progress') {
          console.log('Syncing user progress:', item.data);
          await db.markQueueItemSynced(item._id);
        }
      }
      console.log('Offline sync completed');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      // Ensure student is enrolled in sample courses
      if (user && user.role === 'student') {
        try {
          // Check if we have any courses, if not, auto-enroll in sample course
          const existingCourses = await db.getCourses();
          if (existingCourses.length === 0) {
            // Try to find and enroll in the sample course
            const sampleCourse = await db.getCourse('course_fluid_mechanics');
            if (sampleCourse) {
              await db.enrollStudentInCourse(user.id, sampleCourse.id);
            }
          }
        } catch (error) {
          console.error('Failed to auto-enroll student:', error);
        }
      }
      
      const [coursesData, progressData] = await Promise.all([
        db.getCourses(),
        user ? db.getUserProgressSummary(user.id) : []
      ]);
      
      setCourses(coursesData);
      setUserProgress(progressData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentProgress = (courseId: string): UserProgress => {
    return userProgress.find(p => p.course_id === courseId) || {
      user_id: user?.id || '',
      course_id: courseId,
      total_xp: 0,
      current_level: 1,
      streak_days: 0,
      last_activity: new Date().toISOString(),
      completed_lessons: [],
      skill_levels: {}
    };
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setView('course');
  };

  const handleSkillNodeClick = async (nodeId: string) => {
    if (!selectedCourse) return;
    
    // In a real app, this would navigate to specific lessons for that skill
    const modules = await db.getModulesByCourse(selectedCourse.id);
    if (modules.length > 0) {
      const lessons = await db.getLessonsByModule(modules[0].id);
      if (lessons.length > 0) {
        setSelectedLesson(lessons[0]);
        setView('lesson');
      }
    }
  };

  const handleLessonComplete = async () => {
    // Update user progress
    if (user && selectedCourse && selectedLesson) {
      // Award XP and update progress
      await db.updateUserXP(user.id, selectedCourse.id, 25);
      
      // Reload progress
      const updatedProgress = await db.getUserProgressSummary(user.id);
      setUserProgress(updatedProgress);
      
      // Show success message
      console.log('Lesson completed! +25 XP awarded');
    }
    
    setView('course');
    setSelectedLesson(null);
  };

  const handleTestComplete = async (testId: string, answers: Record<string, any>, score: number) => {
    if (!user) return;
    
    const submission = {
      id: `submission_${Date.now()}`,
      user_id: user.id,
      test_id: testId,
      answers,
      score,
      submitted_at: new Date().toISOString(),
      synced: isOnline
    };

    if (isOnline) {
      // Submit immediately
      console.log('Submitting test online:', submission);
    } else {
      // Queue for later sync
      await db.addToOfflineQueue('submit_test', submission);
    }

    // Award XP for test completion
    if (selectedCourse) {
      await db.updateUserXP(user.id, selectedCourse.id, Math.floor(score / 10));
      const updatedProgress = await db.getUserProgressSummary(user.id);
      setUserProgress(updatedProgress);
      
      console.log(`Test completed! Score: ${score}%, XP awarded: ${Math.floor(score / 10)}`);
    }

    setView('course');
    setSelectedTest(null);
  };

  const handleLearningModeChange = (mode: 'adaptive' | 'teacher_content' | 'mixed') => {
    setLearningMode(mode);
    // Save preference to user profile
    if (user) {
      const updatedUser = {
        ...user,
        learning_preference: mode
      };
      db.saveUser(updatedUser);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (view === 'adaptive') {
    return (
      <AdaptiveLearningPath
        onBack={() => setView('dashboard')}
        onLogout={onLogout}
      />
    );
  }

  if (view === 'pomodoro') {
    return (
      <PomodoroFocus
        onBack={() => setView('dashboard')}
        onLogout={onLogout}
      />
    );
  }

  if (view === 'teachers') {
    return (
      <TeacherConnection
        connectedTeachers={connectedTeachers}
        onBack={() => setView('dashboard')}
        onLogout={onLogout}
        onTeacherConnect={loadConnectedTeachers}
      />
    );
  }

  if (view === 'settings') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </button>
            <button onClick={onLogout} className="text-gray-600 hover:text-gray-800">
              Logout
            </button>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Learning Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Choose Your Learning Style</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="learning_mode"
                      value="adaptive"
                      checked={learningMode === 'adaptive'}
                      onChange={(e) => handleLearningModeChange(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-800">Adaptive Learning (Duolingo Style)</div>
                      <div className="text-sm text-gray-600">AI-powered personalized learning path with spaced repetition</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="learning_mode"
                      value="teacher_content"
                      checked={learningMode === 'teacher_content'}
                      onChange={(e) => handleLearningModeChange(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-800">Teacher Content Only</div>
                      <div className="text-sm text-gray-600">Follow courses and materials created by your teachers</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="learning_mode"
                      value="mixed"
                      checked={learningMode === 'mixed'}
                      onChange={(e) => handleLearningModeChange(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-800">Mixed Mode (Recommended)</div>
                      <div className="text-sm text-gray-600">Combine adaptive learning with teacher content</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'test' && selectedTest) {
    return (
      <OfflineTestTaker
        test={selectedTest}
        onBack={() => setView('course')}
        onComplete={handleTestComplete}
        isOnline={isOnline}
      />
    );
  }

  if (view === 'lesson' && selectedLesson) {
    return (
      <LessonView
        lesson={selectedLesson}
        onBack={() => setView('course')}
        onComplete={handleLessonComplete}
      />
    );
  }

  if (view === 'course' && selectedCourse) {
    const progress = getCurrentProgress(selectedCourse.id);
    
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto py-8 px-4">
          <SkillTree 
            course={selectedCourse}
            userProgress={progress}
            onNodeClick={handleSkillNodeClick}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.username}!</h1>
            <p className="text-gray-600">Continue your learning journey • Mode: {learningMode.replace('_', ' ')}</p>
            {!isOnline && (
              <div className="flex items-center space-x-2 text-orange-600 text-sm mt-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Offline mode - Progress will sync when online</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setView('settings')}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Learning Mode Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setView('adaptive')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            <Brain size={24} />
            <div className="text-left">
              <div className="font-semibold">Adaptive Learning</div>
              <div className="text-sm opacity-90">Personalized AI-powered lessons</div>
            </div>
          </button>
          
          <button
            onClick={() => setView('teachers')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            <Users size={24} />
            <div className="text-left">
              <div className="font-semibold">My Teachers</div>
              <div className="text-sm opacity-90">{connectedTeachers.length} connected</div>
            </div>
          </button>
          
          <button
            onClick={() => setView('pomodoro')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all"
          >
            <Timer size={24} />
            <div className="text-left">
              <div className="font-semibold">Focus Timer</div>
              <div className="text-sm opacity-90">Pomodoro study sessions</div>
            </div>
          </button>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total XP</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {userProgress.reduce((sum, p) => sum + p.total_xp, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {userProgress.reduce((sum, p) => sum + p.completed_lessons.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Streak</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.max(...userProgress.map(p => p.streak_days), 0)} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Courses */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {learningMode === 'teacher_content' ? 'Teacher Courses' : 
             learningMode === 'adaptive' ? 'Recommended Courses' : 'Your Courses'}
          </h2>
          
          {courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
              <p className="text-gray-600 mb-4">
                {learningMode === 'teacher_content' 
                  ? 'Connect with teachers to access their courses.'
                  : 'Ask your teacher or administrator to add some courses.'}
              </p>
              {learningMode !== 'adaptive' && (
                <button
                  onClick={() => setView('teachers')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Connect with Teachers
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const progress = getCurrentProgress(course.id);
                const completionRate = progress.completed_lessons.length > 0 ? 75 : 0; // Mock calculation
                
                return (
                  <div 
                    key={course.id}
                    onClick={() => handleCourseSelect(course)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        <Play className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Level {progress.current_level}</span>
                          <span>{progress.total_xp} XP</span>
                          {learningMode === 'mixed' && (
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                              Mixed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}