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
// import CreateClassroomModal from './CreateClassroomModal';
// import JoinClassroomModal from './JoinClassroomModal';
// import ClassroomDetails from './ClassroomDetails';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 h-screen md:h-auto">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Classroom</h2>
          <form onSubmit={handleSubmit} className="space-y-5 h-full">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Classroom Name</label>
              <input
                type="text"
                placeholder="Enter classroom name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                placeholder="Enter subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={3}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Join Classroom</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Classroom Code</label>
              <input
                type="text"
                placeholder="Enter classroom code (e.g., CLS-ABC123)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center font-mono text-lg tracking-wider focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !code} 
                className="flex-1 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <div className="w-full md:w-72 bg-white border-r border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <button 
              onClick={onBack} 
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium mb-4"
            >
              ← Back to Dashboard
            </button>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{classroom.name}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Code:</span>
                <span className="text-sm font-mono bg-white px-2 py-1 rounded border text-gray-800">{classroom.code}</span>
              </div>
              {classroom.subject && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {classroom.subject}
                  </span>
                </div>
              )}
            </div>
          </div>
          <nav className="p-4 space-y-2">
            <button 
              onClick={()=>setTab('chat')} 
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                tab==='chat'? 'bg-blue-100 text-blue-700 border border-blue-200':'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <MessageSquare size={18} />
              <span>Chat</span>
            </button>
            <button 
              onClick={()=>setTab('polls')} 
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                tab==='polls'? 'bg-blue-100 text-blue-700 border border-blue-200':'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <HelpCircle size={18} />
              <span>Polls</span>
            </button>
            <button 
              onClick={()=>setTab('quizzes')} 
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                tab==='quizzes'? 'bg-blue-100 text-blue-700 border border-blue-200':'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FileText size={18} />
              <span>Quizzes</span>
            </button>
            <button 
              onClick={()=>setTab('live')} 
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                tab==='live'? 'bg-blue-100 text-blue-700 border border-blue-200':'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <BookOpen size={18} />
              <span>Live Slides</span>
            </button>
            <button 
              onClick={()=>setTab('history')} 
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                tab==='history'? 'bg-blue-100 text-blue-700 border border-blue-200':'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Download size={18} />
              <span>Session History</span>
            </button>
            <button 
              onClick={()=>setTab('dictionary')} 
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                tab==='dictionary'? 'bg-blue-100 text-blue-700 border border-blue-200':'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <HelpCircle size={18} />
              <span>Dictionary</span>
            </button>
            <button 
              onClick={()=>setTab('focus')} 
              data-tab="focus"
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                tab==='focus'? 'bg-blue-100 text-blue-700 border border-blue-200':'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Timer size={18} />
              <span>Focus Timer</span>
            </button>
          </nav>
        </div>
        <div className="flex-1 bg-white">
          <div className="border-b border-gray-200 bg-white px-4 md:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{classroom.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Classroom Code: <span className="font-mono font-medium">{classroom.code}</span></span>
              {classroom.subject && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                  {classroom.subject}
                </span>
              )}
            </div>
          </div>
          <div className="p-4 md:p-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[60vh] md:h-[calc(100vh-280px)]">
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
                <div className="p-4 md:p-8">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">Instant Dictionary</h2>
                      <p className="text-gray-600">Look up word meanings instantly - works offline with built-in academic vocabulary</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Classrooms</h1>
                <p className="text-lg text-gray-600">
                  {currentUser.role === 'teacher' 
                    ? 'Manage your classrooms and engage with students' 
                    : 'Access your enrolled classrooms and learning materials'
                  }
                </p>
              </div>
              <div className="flex items-stretch md:items-center flex-wrap gap-3">
                {currentUser.role === 'teacher' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center px-5 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium w-full sm:w-auto"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Classroom
                  </button>
                )}
                {currentUser.role === 'student' && (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="flex items-center justify-center px-5 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium w-full sm:w-auto"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Join Classroom
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md font-medium w-full sm:w-auto"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {classrooms.length === 0 ? (
          <div className="space-y-8">
            {/* Quick Dictionary Access */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Dictionary</h3>
                <p className="text-gray-600">Look up word meanings while you study - works offline too!</p>
              </div>
              <QuickMeaning isOnline={navigator.onLine} />
            </div>

            {/* Empty State */}
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {currentUser.role === 'teacher' ? 'No classrooms created yet' : 'No classrooms joined yet'}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {currentUser.role === 'teacher' 
                    ? 'Create your first classroom to start teaching and managing students.'
                    : 'Join a classroom using the classroom code provided by your teacher.'
                  }
                </p>
                {currentUser.role === 'teacher' ? (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg mx-auto font-medium"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Create Your First Classroom
                  </button>
                ) : (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="flex items-center px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg mx-auto font-medium"
                  >
                    <UserPlus className="w-5 h-5 mr-3" />
                    Join a Classroom
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Dictionary Access */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Dictionary</h3>
                <p className="text-gray-600">Look up word meanings while you study - works offline too!</p>
              </div>
              <QuickMeaning isOnline={navigator.onLine} />
            </div>

            {/* Classrooms Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Classrooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {classrooms.map(classroom => (
              <div
                key={classroom.id}
                className="group bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => setSelectedClassroom(classroom)}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-2 bg-gray-100 text-gray-800 text-xs sm:text-sm font-mono rounded-lg border">
                        {classroom.code}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyClassroomCode(classroom.code);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        title="Copy classroom code"
                      >
                        {copiedCode === classroom.code ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{classroom.name}</h3>
                  
                  {classroom.description && (
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">{classroom.description}</p>
                  )}

                  <div className="space-y-3 text-sm">
                    {classroom.subject && (
                      <div className="flex items-center text-gray-700">
                        <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{classroom.subject}</span>
                      </div>
                    )}
                    
                    {currentUser.role === 'student' && classroom.teacher && (
                      <div className="flex items-center text-gray-700">
                        <div className="w-6 h-6 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-medium">{classroom.teacher.full_name}</span>
                      </div>
                    )}
                    
                    {currentUser.role === 'teacher' && (
                      <div className="flex items-center text-gray-700">
                        <div className="w-6 h-6 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-medium">{classroom.members_count || 0} students</span>
                      </div>
                    )}

                    <div className="flex items-center text-gray-600">
                      <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                      </div>
                      <span>Created {new Date(classroom.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center text-gray-500">
                          <FileText className="w-4 h-4 mr-2" />
                          <span className="text-xs font-medium">Assignments</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <HelpCircle className="w-4 h-4 mr-2" />
                          <span className="text-xs font-medium">Quizzes</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          <span className="text-xs font-medium">Chat</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                        <span className="text-sm font-semibold">Enter Classroom</span>
                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
