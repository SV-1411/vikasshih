import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Plus,
  UserPlus,
  MessageSquare,
  FileText,
  HelpCircle,
  Calendar,
  Copy,
  Check,
  Timer,
  Download
} from 'lucide-react';
import { classroomApi } from '../lib/educational-api';
import { localBus, demoEvents } from '../lib/local-bus';
import type { Classroom, Profile } from '../types';
import { safeLocalStorage, safeCopyToClipboard, safeNavigate } from '../lib/error-utils';
import Chat from './Chat';
import Polls from './Polls';
import Quizzes from './QuizzesNew';
import LiveSlidesHost from './LiveSlidesHost';
import LiveSlidesViewer from './LiveSlidesViewer';
import LiveSlidesEnhanced from './LiveSlidesEnhanced';
import SessionHistory from './SessionHistory';
import QuickMeaning from './QuickMeaning';
import PomodoroFocus from './PomodoroFocus';

// Inline modal components
const CreateClassroomModal = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => Promise<any> }) => {
  const [formData, setFormData] = useState({ name: '', description: '', subject: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating classroom:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-amber-100/20 pointer-events-none"></div>
        <div className="p-8 md:p-10 relative">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <BookOpen className="w-8 h-8 text-amber-700" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Create Classroom</h2>
            <p className="text-slate-600">Establish a new academic space</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Classroom Name</label>
              <input
                type="text"
                placeholder="Enter classroom name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-5 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Subject</label>
              <input
                type="text"
                placeholder="Enter subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-5 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Description</label>
              <textarea
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-5 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none bg-white shadow-sm"
                rows={3}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 w-full px-8 py-4 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 w-full px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? 'Creating...' : 'Create Classroom'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const JoinClassroomModal = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: (code: string) => Promise<any> }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(code);
      onClose();
    } catch (error) {
      console.error('Error joining classroom:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-emerald-100/20 pointer-events-none"></div>
        <div className="p-8 md:p-10 relative">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <UserPlus className="w-8 h-8 text-emerald-700" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Join Classroom</h2>
            <p className="text-slate-600">Enter your classroom code</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Classroom Code</label>
              <input
                type="text"
                placeholder="Enter classroom code (e.g., CLS-ABC123)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-5 py-4 border border-slate-300 rounded-xl text-center font-mono text-lg tracking-wider focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white shadow-sm"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 w-full px-8 py-4 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !code}
                className="flex-1 w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? 'Joining...' : 'Join Classroom'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ClassroomDetails = ({ classroom, currentUser, onBack }: { classroom: any; currentUser: any; onBack: () => void }) => {
  const [tab, setTab] = useState<'chat' | 'polls' | 'quizzes' | 'live' | 'history' | 'dictionary' | 'focus'>('chat');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col md:flex-row">
        <div className="w-full md:w-80 bg-white border-r border-slate-200 shadow-lg">
          <div className="p-8 border-b border-slate-200">
            <button
              onClick={onBack}
              className="w-full px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 font-semibold mb-6 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ← Back to Dashboard
            </button>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200 shadow-inner">
              <h2 className="text-2xl font-bold text-slate-800 mb-3">{classroom.name}</h2>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-sm font-semibold text-slate-600">Code:</span>
                <span className="text-sm font-mono bg-white px-3 py-1 rounded-lg border border-amber-300 text-slate-800 shadow-sm">{classroom.code}</span>
              </div>
              {classroom.subject && (
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-amber-200 text-amber-800 text-sm font-semibold rounded-full border border-amber-300">
                    {classroom.subject}
                  </span>
                </div>
              )}
            </div>
          </div>
          <nav className="p-6 space-y-3">
            <button
              onClick={()=>setTab('chat')}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-4 ${
                tab==='chat'? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg transform -translate-y-0.5':'hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <MessageSquare size={20} />
              <span>Chat</span>
            </button>
            <button
              onClick={()=>setTab('polls')}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-4 ${
                tab==='polls'? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg transform -translate-y-0.5':'hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <HelpCircle size={20} />
              <span>Polls</span>
            </button>
            <button
              onClick={()=>setTab('quizzes')}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-4 ${
                tab==='quizzes'? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg transform -translate-y-0.5':'hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <FileText size={20} />
              <span>Quizzes</span>
            </button>
            <button
              onClick={()=>setTab('live')}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-4 ${
                tab==='live'? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg transform -translate-y-0.5':'hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <BookOpen size={20} />
              <span>Live Slides</span>
            </button>
            <button
              onClick={()=>setTab('history')}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-4 ${
                tab==='history'? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg transform -translate-y-0.5':'hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Download size={20} />
              <span>Session History</span>
            </button>
            <button
              onClick={()=>setTab('dictionary')}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-4 ${
                tab==='dictionary'? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg transform -translate-y-0.5':'hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <HelpCircle size={20} />
              <span>Dictionary</span>
            </button>
            <button
              onClick={()=>setTab('focus')}
              data-tab="focus"
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-4 ${
                tab==='focus'? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg transform -translate-y-0.5':'hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Timer size={20} />
              <span>Focus Timer</span>
            </button>
          </nav>
        </div>
        <div className="flex-1 bg-white">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 md:px-10 py-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-3">{classroom.name}</h1>
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <span>Classroom Code: <span className="font-mono font-semibold text-slate-800">{classroom.code}</span></span>
              {classroom.subject && (
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                  {classroom.subject}
                </span>
              )}
            </div>
          </div>
          <div className="p-6 md:p-10">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg min-h-[60vh] md:h-[calc(100vh-280px)]">
              {tab==='chat' && <Chat classroom={classroom} currentUser={currentUser} />}
              {tab==='polls' && <Polls classroom={classroom} currentUser={currentUser} />}
              {tab==='quizzes' && <Quizzes classroom={classroom} currentUser={currentUser} />}
              {tab==='live' && (
                <LiveSlidesEnhanced
                  classroom={classroom}
                  currentUser={currentUser}
                  isHost={currentUser.role === 'teacher'}
                />
              )}
              {tab==='history' && (
                <SessionHistory currentUser={currentUser} />
              )}
              {tab==='dictionary' && (
                <div className="p-6 md:p-10">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-slate-800 mb-3">Instant Dictionary</h2>
                      <p className="text-slate-600">Look up word meanings instantly - works offline with built-in academic vocabulary</p>
                    </div>
                    <QuickMeaning isOnline={navigator.onLine} />
                  </div>
                </div>
              )}
              {tab==='focus' && (
                <div className="h-full">
                  <PomodoroFocus
                    onBack={() => setTab('chat')}
                    onLogout={() => {}}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

interface ClassroomDashboardProps {
  currentUser: Profile;
  onLogout?: () => void;
}

const ClassroomDashboard: React.FC<ClassroomDashboardProps> = ({ currentUser, onLogout }) => {
  console.log('🎓 ClassroomDashboard component rendered with user:', currentUser);

  const handleLogoutClick = () => {
    try {
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Logout callback failed:', error);
    } finally {
      // Fallback to ensure logout in demo mode
      safeLocalStorage.removeItem('demo_current_user');
      safeLocalStorage.removeItem('demo_auth_token');
      safeNavigate('/', '/');
    }
  };
  console.log('🎓 ClassroomDashboard component rendered with user:', currentUser);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadClassrooms();
    
    // Subscribe to classroom join events to refresh the list
    const cleanupJoin = localBus.on('classroom_joined', () => {
      loadClassrooms();
    });
    
    return cleanupJoin;
  }, []);

  const loadClassrooms = async () => {
    try {
      console.log('📚 Loading classrooms for user:', currentUser);
      setLoading(true);
      setError(null);
      
      const result = await classroomApi.getMyClassrooms();
      console.log('📚 Classrooms API result:', result);
      
      if (result.error) {
        console.error('❌ Classrooms loading error:', result.error);
        setError(result.error);
      } else if (result.data) {
        console.log('✅ Classrooms loaded successfully:', result.data);
        setClassrooms(result.data);
      } else {
        console.warn('⚠️ No classroom data returned');
        setClassrooms([]);
      }
    } catch (err: any) {
      console.error('💥 Classrooms loading exception:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async (classroomData: any) => {
    try {
      const result = await classroomApi.create(classroomData);
      if (result.data) {
        setClassrooms(prev => [...prev, result.data!]);
        setShowCreateModal(false);
      } else if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err: any) {
      console.error('Create classroom error:', err);
      setError(err.message || 'Failed to create classroom');
      return { error: err.message };
    }
  };

  const handleJoinClassroom = async (code: string) => {
    try {
      console.log('🔄 Attempting to join classroom with code:', code);
      const result = await classroomApi.joinClassroom(code);
      console.log('📋 Join result:', result);
      
      if (result.data) {
        console.log('✅ Join successful, reloading classrooms...');
        await loadClassrooms(); // Reload to get the new classroom
        setShowJoinModal(false);
        return { data: result.data };
      } else if (result.error) {
        console.error('❌ Join failed:', result.error);
        setError(result.error);
        return result;
      }
    } catch (err: any) {
      console.error('❌ Join classroom error:', err);
      setError(err.message || 'Failed to join classroom');
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const copyClassroomCode = async (code: string) => {
    const success = await safeCopyToClipboard(code);
    if (success) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  if (selectedClassroom) {
    return (
      <ClassroomDetails
        classroom={selectedClassroom}
        currentUser={currentUser}
        onBack={() => setSelectedClassroom(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg">Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="py-8 sm:py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-4xl font-bold text-slate-800 mb-3">My Classrooms</h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  {currentUser.role === 'teacher'
                    ? 'Manage your classrooms and engage with students in an elegant academic environment'
                    : 'Access your enrolled classrooms and learning materials with timeless sophistication'
                  }
                </p>
              </div>
              <div className="flex items-stretch md:items-center flex-wrap gap-4">
                {currentUser.role === 'teacher' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center px-8 sm:px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold w-full sm:w-auto transform hover:-translate-y-1"
                  >
                    <Plus className="w-6 h-6 mr-3" />
                    Create Classroom
                  </button>
                )}
                {currentUser.role === 'student' && (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="flex items-center justify-center px-8 sm:px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold w-full sm:w-auto transform hover:-translate-y-1"
                  >
                    <UserPlus className="w-6 h-6 mr-3" />
                    Join Classroom
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-lg font-semibold w-full sm:w-auto transform hover:-translate-y-1"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
        {error && (
          <div className="mb-10 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
            <p className="text-red-700 font-semibold text-lg">{error}</p>
          </div>
        )}

        {classrooms.length === 0 ? (
          <div className="space-y-12">
            {/* Quick Dictionary Access */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <HelpCircle className="w-10 h-10 text-purple-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Instant Dictionary</h3>
                <p className="text-slate-600 text-lg">Look up word meanings while you study - works offline too!</p>
              </div>
              <QuickMeaning isOnline={navigator.onLine} />
            </div>

            {/* Empty State */}
            <div className="text-center py-20">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-16 max-w-lg mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <BookOpen className="w-12 h-12 text-amber-700" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  {currentUser.role === 'teacher' ? 'No classrooms created yet' : 'No classrooms joined yet'}
                </h3>
                <p className="text-slate-600 mb-10 leading-relaxed text-lg">
                  {currentUser.role === 'teacher'
                    ? 'Create your first classroom to start teaching and managing students in an elegant academic environment.'
                    : 'Join a classroom using the classroom code provided by your teacher for timeless learning.'
                  }
                </p>
                {currentUser.role === 'teacher' ? (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-10 py-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl mx-auto font-semibold transform hover:-translate-y-1"
                  >
                    <Plus className="w-6 h-6 mr-4" />
                    Create Your First Classroom
                  </button>
                ) : (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="flex items-center px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl mx-auto font-semibold transform hover:-translate-y-1"
                  >
                    <UserPlus className="w-6 h-6 mr-4" />
                    Join a Classroom
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Quick Dictionary Access */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <HelpCircle className="w-10 h-10 text-purple-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Instant Dictionary</h3>
                <p className="text-slate-600 text-lg">Look up word meanings while you study - works offline too!</p>
              </div>
              <QuickMeaning isOnline={navigator.onLine} />
            </div>

            {/* Classrooms Grid */}
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-8">Your Classrooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
                {classrooms.map(classroom => (
                  <div
                    key={classroom.id}
                    className="group bg-white rounded-3xl shadow-xl border border-slate-200 hover:shadow-2xl hover:border-amber-300 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
                    onClick={() => setSelectedClassroom(classroom)}
                  >
                    <div className="p-8 md:p-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-300 transition-all duration-300 shadow-inner">
                          <BookOpen className="w-10 h-10 text-amber-700" />
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="px-4 py-2 bg-slate-100 text-slate-700 text-sm sm:text-base font-mono rounded-xl border border-slate-200 shadow-sm">
                            {classroom.code}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyClassroomCode(classroom.code);
                            }}
                            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 shadow-sm"
                            title="Copy classroom code"
                          >
                            {copiedCode === classroom.code ? (
                              <Check className="w-6 h-6 text-emerald-500" />
                            ) : (
                              <Copy className="w-6 h-6" />
                            )}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 group-hover:text-amber-700 transition-colors duration-300">{classroom.name}</h3>

                      {classroom.description && (
                        <p className="text-slate-600 text-base mb-8 line-clamp-2 leading-relaxed">{classroom.description}</p>
                      )}

                      <div className="space-y-4 text-base">
                        {classroom.subject && (
                          <div className="flex items-center text-slate-700">
                            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                              <BookOpen className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="font-semibold">{classroom.subject}</span>
                          </div>
                        )}

                        {currentUser.role === 'student' && classroom.teacher && (
                          <div className="flex items-center text-slate-700">
                            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                              <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="font-semibold">{classroom.teacher.full_name}</span>
                          </div>
                        )}

                        {currentUser.role === 'teacher' && (
                          <div className="flex items-center text-slate-700">
                            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                              <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="font-semibold">{classroom.members_count || 0} students</span>
                          </div>
                        )}

                        <div className="flex items-center text-slate-600">
                          <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                            <Calendar className="w-5 h-5 text-slate-500" />
                          </div>
                          <span>Created {new Date(classroom.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-8 md:mt-10 pt-8 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-8">
                            <div className="flex items-center text-slate-500">
                              <FileText className="w-5 h-5 mr-2" />
                              <span className="text-sm font-medium">Assignments</span>
                            </div>
                            <div className="flex items-center text-slate-500">
                              <HelpCircle className="w-5 h-5 mr-2" />
                              <span className="text-sm font-medium">Quizzes</span>
                            </div>
                            <div className="flex items-center text-slate-500">
                              <MessageSquare className="w-5 h-5 mr-2" />
                              <span className="text-sm font-medium">Chat</span>
                            </div>
                          </div>

                          <div className="flex items-center text-amber-600 group-hover:text-amber-700">
                            <span className="text-base font-semibold">Enter Classroom</span>
                            <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateClassroomModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateClassroom}
        />
      )}

      {showJoinModal && (
        <JoinClassroomModal
          onClose={() => setShowJoinModal(false)}
          onSubmit={handleJoinClassroom}
        />
      )}
    </div>
  );
};

export default ClassroomDashboard;
