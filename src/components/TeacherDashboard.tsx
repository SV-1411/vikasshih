import { useState, useEffect } from 'react';
import { Plus, Upload, Users, Settings, BookOpen, Mic, Video } from 'lucide-react';
import { Course, Module, Lesson } from '../types';
import { db } from '../lib/database';
import { auth } from '../lib/auth';
import { v4 as uuidv4 } from 'uuid';
import QuickMeaning from './QuickMeaning';

interface TeacherDashboardProps {
  onLogout: () => void;
}

export default function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [view, setView] = useState<'dashboard' | 'course' | 'create-lesson' | 'record-audio'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [connectedStudents, setConnectedStudents] = useState<any[]>([]);

  const user = auth.getCurrentUser();

  useEffect(() => {
    loadCourses();
    loadStudents();
    loadConnectedStudents();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesData = await db.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    // In a real app, this would load students connected to this teacher
    const mockStudents = [
      { id: '1', username: 'student1', name: 'Alice Johnson', progress: 75, lastActive: '2 hours ago' },
      { id: '2', username: 'student2', name: 'Bob Smith', progress: 45, lastActive: '1 day ago' },
      { id: '3', username: 'student3', name: 'Carol Davis', progress: 90, lastActive: '30 minutes ago' }
    ];
    setStudents(mockStudents);
  };

  const loadConnectedStudents = async () => {
    if (!user) return;
    try {
      const list = await db.getStudentsByTeacher(user.id);
      setConnectedStudents(list);
    } catch (error) {
      console.error('Failed to load connected students:', error);
    }
  };

  const handleCreateCourse = async () => {
    if (!user) return;

    const title = prompt('Enter course title:');
    if (!title) return;

    const description = prompt('Enter course description:') || '';

    const newCourse: Course = {
      _id: `course_${uuidv4()}`,
      id: uuidv4(),
      title,
      description,
      language: 'en',
      version: '1.0.0',
      channel_id: `channel_${uuidv4()}`,
      created_by: user.id,
      updated_at: new Date().toISOString()
    };

    try {
      await db.saveCourse(newCourse);
      setCourses(prev => [...prev, newCourse]);
      console.log('Course created successfully:', newCourse.title);
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course. Please try again.');
    }
  };

  const handleCreateTest = async () => {
    if (!selectedCourse || !user) return;

    const title = prompt('Enter test title:');
    if (!title) return;

    // Create a sample test
    const newTest = {
      _id: `test_${Date.now()}`,
      id: `test_${Date.now()}`,
      course_id: selectedCourse.id,
      title,
      duration: 1800, // 30 minutes
      questions: [
        {
          id: 'q1',
          question: 'What is the primary characteristic of fluids?',
          options: [
            'They maintain fixed shape',
            'They flow and take container shape',
            'They are always liquid',
            'They cannot be compressed'
          ],
          correctAnswer: 'They flow and take container shape'
        },
        {
          id: 'q2',
          question: 'Which property measures resistance to flow?',
          options: ['Density', 'Viscosity', 'Pressure', 'Temperature'],
          correctAnswer: 'Viscosity'
        }
      ],
      created_at: new Date().toISOString()
    };

    // In a real app, save to database
    console.log('Created test:', newTest);
    alert('Test created successfully!');
  };

  const handleCreateModule = async () => {
    if (!selectedCourse || !user) return;

    const title = prompt('Enter module title:');
    if (!title) return;

    const modules = await db.getModulesByCourse(selectedCourse.id);
    const order = modules.length;

    const newModule: Module = {
      _id: `module_${uuidv4()}`,
      id: uuidv4(),
      course_id: selectedCourse.id,
      title,
      description: '',
      order,
      created_at: new Date().toISOString()
    };

    try {
      await db.saveModule(newModule);
      alert('Module created successfully!');
      console.log('Module created:', newModule.title);
    } catch (error) {
      console.error('Failed to create module:', error);
      alert('Failed to create module. Please try again.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const saveAudioLesson = async () => {
    if (!audioBlob || !selectedCourse || !user) return;

    const title = prompt('Enter lesson title:');
    if (!title) return;

    const transcript = prompt('Enter transcript (optional):') || '';

    // In a real app, you would upload the audio blob to your server
    // For demo purposes, we'll create a blob URL
    const audioUrl = URL.createObjectURL(audioBlob);

    const modules = await db.getModulesByCourse(selectedCourse.id);
    if (modules.length === 0) {
      alert('Please create a module first');
      return;
    }

    const lessons = await db.getLessonsByModule(modules[0].id);
    const order = lessons.length;

    const newLesson: Lesson = {
      _id: `lesson_${uuidv4()}`,
      id: uuidv4(),
      module_id: modules[0].id,
      title,
      type: 'audio',
      content_ref: audioUrl,
      duration: 300, // Mock duration
      size: audioBlob.size,
      transcript,
      order,
      created_at: new Date().toISOString()
    };

    try {
      await db.saveLesson(newLesson);
      setAudioBlob(null);
      setView('course');
      alert('Audio lesson created successfully!');
      console.log('Audio lesson created:', newLesson.title);
    } catch (error) {
      console.error('Failed to create lesson:', error);
      alert('Failed to create audio lesson. Please try again.');
    }
  };

  const handleUploadVideo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedCourse) {
        const title = prompt('Enter video lesson title:');
        if (!title) return;

        // In a real app, upload to server
        const videoUrl = URL.createObjectURL(file);
        
        const modules = await db.getModulesByCourse(selectedCourse.id);
        if (modules.length === 0) {
          alert('Please create a module first');
          return;
        }

        const lessons = await db.getLessonsByModule(modules[0].id);
        const order = lessons.length;

        const newLesson: Lesson = {
          _id: `lesson_${uuidv4()}`,
          id: uuidv4(),
          module_id: modules[0].id,
          title,
          type: 'video',
          content_ref: videoUrl,
          duration: 600, // Mock duration
          size: file.size,
          order,
          created_at: new Date().toISOString()
        };

        try {
          await db.saveLesson(newLesson);
          alert('Video lesson uploaded successfully!');
          console.log('Video lesson created:', newLesson.title);
        } catch (error) {
          console.error('Failed to upload video:', error);
          alert('Failed to upload video lesson. Please try again.');
        }
      }
    };
    input.click();
  };

  const AudioRecorder = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Record Audio Lesson</h3>
      
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
          isRecording ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
        }`}>
          <Mic size={32} />
        </div>
        
        <p className="text-gray-600 mb-4">
          {isRecording ? 'Recording in progress...' : 'Ready to record'}
        </p>
        
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Stop Recording
          </button>
        )}
      </div>

      {audioBlob && (
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-3">Recording complete!</p>
          <audio controls className="w-full mb-4">
            <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
          </audio>
          <div className="flex space-x-2">
            <button
              onClick={saveAudioLesson}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save Lesson
            </button>
            <button
              onClick={() => setAudioBlob(null)}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );

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

  if (view === 'record-audio') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('course')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Course
            </button>
            <button onClick={onLogout} className="text-gray-600 hover:text-gray-800">
              Logout
            </button>
          </div>
        </div>
        <div className="py-8">
          <AudioRecorder />
        </div>
      </div>
    );
  }

  if (view === 'course' && selectedCourse) {
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

        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedCourse.title}</h1>
            <p className="text-gray-600">{selectedCourse.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={handleCreateModule}
              className="flex items-center space-x-2 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={20} />
              <span>Add Module</span>
            </button>
            
            <button
              onClick={() => setView('record-audio')}
              className="flex items-center space-x-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Mic size={20} />
              <span>Record Audio</span>
            </button>
            
            <button
              onClick={handleUploadVideo}
              className="flex items-center space-x-2 p-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              <Video size={20} />
              <span>Upload Video</span>
            </button>
            
            <button
              onClick={handleCreateTest}
              className="flex items-center space-x-2 p-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <Plus size={20} />
              <span>Create Test</span>
            </button>
            
            <button className="flex items-center space-x-2 p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
              <Upload size={20} />
              <span>Upload Content</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Content</h2>
            <p className="text-gray-600">Create modules and lessons to build your course content.</p>
          </div>

          {/* Student Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Student Progress</h2>
            <div className="space-y-4">
              {students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{student.name}</div>
                    <div className="text-sm text-gray-600">@{student.username} • {student.lastActive}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{student.progress}%</span>
                  </div>
                </div>
              ))}
              
              {students.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No students connected yet.</p>
                  <p className="text-sm text-gray-500">Students can send you connection requests to access your courses.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.username}!</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleCreateCourse}
              className="flex items-center space-x-2 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={20} />
              <span>New Course</span>
            </button>
            
            <button 
              onClick={() => setView('record-audio')}
              className="flex items-center space-x-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Mic size={20} />
              <span>Record Audio</span>
            </button>
            
            <button className="flex items-center space-x-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <Upload size={20} />
              <span>Import Channel</span>
            </button>
            
            <button className="flex items-center space-x-2 p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
              <Users size={20} />
              <span>Students ({connectedStudents.length})</span>
            </button>
          </div>
        </div>

        {/* Instant Help: Quick Meaning */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Instant Help</h2>
          <QuickMeaning />
        </div>

        {/* Courses */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Courses</h2>
          
          {courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-4">Create your first course to get started.</p>
              <button
                onClick={handleCreateCourse}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create Course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div 
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setView('course');
                  }}
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
                      <Settings className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Version {course.version}</span>
                      <span>{course.language.toUpperCase()}</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Course</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}