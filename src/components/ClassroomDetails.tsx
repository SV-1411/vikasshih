import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  HelpCircle, 
  BarChart3, 
  MessageSquare, 
  Video,
  Plus,
  Copy,
  Check,
  Calendar,
  Clock
} from 'lucide-react';
import { classroomApi, assignmentApi, quizApi, pollApi, chatApi } from '../lib/educational-api';
import type { Classroom, Profile, Assignment, Quiz, Poll, ClassroomMember, ClassroomChat } from '../types';

interface ClassroomDetailsProps {
  classroom: Classroom;
  currentUser: Profile;
  onBack: () => void;
}

const ClassroomDetails: React.FC<ClassroomDetailsProps> = ({ classroom, currentUser, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'quizzes' | 'polls' | 'members' | 'chat'>('overview');
  const [classroomData, setClassroomData] = useState<{
    classroom: Classroom;
    members: ClassroomMember[];
    assignments: Assignment[];
    quizzes: Quiz[];
    polls: Poll[];
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<ClassroomChat[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadClassroomData();
    loadChatMessages();
  }, [classroom.id]);

  const loadClassroomData = async () => {
    try {
      setLoading(true);
      const result = await classroomApi.getClassroomDetails(classroom.id);
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setClassroomData(result.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async () => {
    try {
      const result = await chatApi.getMessages(classroom.id);
      if (result.data) {
        setChatMessages(result.data);
      }
    } catch (err: any) {
      console.error('Failed to load chat messages:', err);
    }
  };

  const copyClassroomCode = async () => {
    try {
      await navigator.clipboard.writeText(classroom.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const result = await chatApi.sendMessage(classroom.id, newMessage);
      if (result.data) {
        setChatMessages(prev => [...prev, result.data!]);
        setNewMessage('');
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classroom...</p>
        </div>
      </div>
    );
  }

  if (error || !classroomData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { members, assignments, quizzes, polls } = classroomData;
  const isTeacher = currentUser.role === 'teacher' && classroom.teacher_id === currentUser.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={onBack}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{classroom.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {classroom.subject && <span>Subject: {classroom.subject}</span>}
                    <span>•</span>
                    <span>{members.length} students</span>
                    <span>•</span>
                    <div className="flex items-center">
                      <span className="mr-2">Code: {classroom.code}</span>
                      <button
                        onClick={copyClassroomCode}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy classroom code"
                      >
                        {copiedCode ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {isTeacher && (
                <div className="flex items-center space-x-3">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                  </button>
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Video className="w-4 h-4 mr-2" />
                    Start Lecture
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'assignments', label: 'Assignments', icon: FileText, count: assignments.length },
              { id: 'quizzes', label: 'Quizzes', icon: HelpCircle, count: quizzes.length },
              { id: 'polls', label: 'Polls', icon: BarChart3, count: polls.length },
              { id: 'members', label: 'Members', icon: Users, count: members.length },
              { id: 'chat', label: 'Chat', icon: MessageSquare }
            ].map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
                {count !== undefined && (
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
                    <p className="text-gray-600">Assignments</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <HelpCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
                    <p className="text-gray-600">Quizzes</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{polls.length}</p>
                    <p className="text-gray-600">Polls</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                    <p className="text-gray-600">Students</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {assignments.slice(0, 3).map(assignment => (
                    <div key={assignment.id} className="flex items-center space-x-4">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{assignment.title}</p>
                        <p className="text-sm text-gray-600">
                          Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assignment.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  ))}
                  
                  {quizzes.slice(0, 2).map(quiz => (
                    <div key={quiz.id} className="flex items-center space-x-4">
                      <HelpCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{quiz.title}</p>
                        <p className="text-sm text-gray-600">
                          {quiz.questions.length} questions • {quiz.time_limit ? `${quiz.time_limit} min` : 'No time limit'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quiz.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quiz.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
              {isTeacher && (
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {assignments.map(assignment => (
                <div key={assignment.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assignment.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-sm text-gray-600">{assignment.max_points} points</span>
                    </div>
                  </div>
                  
                  {assignment.description && (
                    <p className="text-gray-600 mb-4">{assignment.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Created {new Date(assignment.created_at).toLocaleDateString()}</span>
                      </div>
                      {assignment.due_date && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Due {new Date(assignment.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <span>{assignment.submissions_count || 0} submissions</span>
                  </div>
                </div>
              ))}
              
              {assignments.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No assignments yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Class Members ({members.length})</h3>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map(member => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.student?.full_name}</div>
                            <div className="text-sm text-gray-500">@{member.student?.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.student?.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-sm h-96 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Classroom Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map(message => (
                <div key={message.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{message.sender?.full_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomDetails;
