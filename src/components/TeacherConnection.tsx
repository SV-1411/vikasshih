import React, { useState } from 'react';
import { ArrowLeft, Users, Plus, Check, X, Search } from 'lucide-react';
import { db } from '../lib/database';
import { auth } from '../lib/auth';

interface TeacherConnectionProps {
  connectedTeachers: any[];
  onBack: () => void;
  onLogout: () => void;
  onTeacherConnect: () => void;
}

export default function TeacherConnection({ 
  connectedTeachers, 
  onBack, 
  onLogout, 
  onTeacherConnect 
}: TeacherConnectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTeachers, setAvailableTeachers] = useState([
    { id: 'teacher_1', username: 'prof_smith', name: 'Dr. Smith', subject: 'Physics', students: 45 },
    { id: 'teacher_2', username: 'ms_johnson', name: 'Ms. Johnson', subject: 'Mathematics', students: 32 },
    { id: 'teacher_3', username: 'mr_brown', name: 'Mr. Brown', subject: 'Chemistry', students: 28 }
  ]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);

  const user = auth.getCurrentUser();

  const handleConnectRequest = async (teacherId: string) => {
    if (!user) return;
    
    try {
      await db.connectStudentToTeacher(user.id, teacherId);
      setPendingRequests(prev => [...prev, teacherId]);
      
      // In a real app, this would send a notification to the teacher
      setTimeout(() => {
        setPendingRequests(prev => prev.filter(id => id !== teacherId));
        onTeacherConnect();
        alert('Connection request approved! You can now access this teacher\'s content.');
      }, 2000);
    } catch (error) {
      console.error('Failed to connect to teacher:', error);
    }
  };

  const filteredTeachers = availableTeachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isConnected = (teacherId: string) => 
    connectedTeachers.some(t => t.id === teacherId);
  
  const isPending = (teacherId: string) => 
    pendingRequests.includes(teacherId);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <button onClick={onLogout} className="text-gray-600 hover:text-gray-800">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect with Teachers</h1>
          <p className="text-gray-600">Find and connect with teachers to access their courses and content</p>
        </div>

        {/* Connected Teachers */}
        {connectedTeachers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Teachers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedTeachers.map((teacher) => (
                <div key={teacher.id} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{teacher.name || teacher.username}</div>
                      <div className="text-sm text-gray-600">{teacher.subject || 'General'}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Connected</span>
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      View Courses
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers by name, subject, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Available Teachers */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Teachers</h2>
          
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No teachers found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => (
                <div key={teacher.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{teacher.name}</div>
                      <div className="text-sm text-gray-600">@{teacher.username}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subject:</span>
                      <span className="font-medium">{teacher.subject}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{teacher.students}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {isConnected(teacher.id) ? (
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg cursor-not-allowed"
                      >
                        <Check size={16} />
                        <span>Connected</span>
                      </button>
                    ) : isPending(teacher.id) ? (
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg cursor-not-allowed"
                      >
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                        <span>Pending</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnectRequest(teacher.id)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        <Plus size={16} />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connection Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">How Teacher Connections Work</h3>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Send a connection request to teachers you want to learn from</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Teachers will approve your request and you'll get access to their courses</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>You can take their tests offline and sync when you're back online</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Teachers can track your progress and provide personalized feedback</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}