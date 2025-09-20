import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Video, 
  Calendar,
  TrendingUp,
  School,
  Clock,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { collegeApi, lectureApi } from '../lib/educational-api';
import LiveSlidesViewer from './LiveSlidesViewer';
import { localBus } from '../lib/local-bus';
import type { College, Profile, Classroom, LiveLecture } from '../types';

interface CollegeDashboardProps {
  college: College;
  currentUser: Profile;
  onLogout?: () => void;
}

const CollegeDashboard: React.FC<CollegeDashboardProps> = ({ college, currentUser, onLogout }) => {
  console.log('🏫 CollegeDashboard component rendered with:', { college, currentUser });
  
  const [dashboardData, setDashboardData] = useState<{
    college: College;
    teachers: Profile[];
    students: Profile[];
    classrooms: Classroom[];
    lectures: LiveLecture[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'students' | 'classrooms' | 'lectures'>('overview');
  const [viewerLectureId, setViewerLectureId] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 CollegeDashboard useEffect triggered, loading dashboard data...');
    loadDashboardData();
    // Subscribe to live lecture changes (intra-tab)
    const cleanup = localBus.on(`live_lecture_changed:${college.id}`, () => {
      loadDashboardData();
    });
    // Cross-tab updates via localStorage
    function onStorage(e: StorageEvent) {
      if (e.key === 'demo_live_lectures') {
        loadDashboardData();
      }
    }
    window.addEventListener('storage', onStorage);
    return () => {
      cleanup();
      window.removeEventListener('storage', onStorage);
    };
  }, [college.id]);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Starting to load dashboard data for college:', college.id);
      setLoading(true);
      setError(null);
      
      const result = await collegeApi.getDashboard(college.id);
      console.log('📊 Dashboard API result:', result);
      
      if (result.error) {
        console.error('❌ Dashboard loading error:', result.error);
        setError(result.error);
      } else if (result.data) {
        console.log('✅ Dashboard data loaded successfully:', result.data);
        setDashboardData(result.data);
      } else {
        console.warn('⚠️ No data returned from dashboard API');
        setError('No data returned');
      }
    } catch (err: any) {
      console.error('💥 Dashboard loading exception:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLectureStatusChange = async (lectureId: string, status: 'scheduled' | 'live' | 'ended' | 'cancelled') => {
    try {
      const result = await lectureApi.updateStatus(lectureId, status);
      if (result.data) {
        // Reload dashboard data to reflect changes
        loadDashboardData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Robust logout handler: call onLogout if provided, else clear demo auth; always redirect to home
  const handleLogoutClick = () => {
    try {
      console.log('🔴 Logout clicked');
      if (onLogout) {
        // Fire and forget; App.handleLogout will redirect
        onLogout();
      }
    } catch (e) {
      console.warn('onLogout handler threw:', e);
    }
    // Hard fallback in all cases after a short delay
    setTimeout(() => {
      try {
        console.log('🧹 Clearing demo auth and forcing reload');
        localStorage.removeItem('demo_current_user');
        localStorage.removeItem('demo_auth_token');
      } finally {
        window.location.replace('/');
      }
    }, 150);
  };

  if (loading) {
    console.log('🔄 CollegeDashboard is in loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading college dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">College: {college.name}</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <School className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error loading dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { teachers, students, classrooms, lectures } = dashboardData;
  const activeLectures = lectures.filter(l => l.status === 'live');
  const upcomingLectures = lectures.filter(l => l.status === 'scheduled' && new Date(l.scheduled_at) > new Date());

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const LectureCard = ({ lecture }: { lecture: LiveLecture }) => {
    const isLocalSlides = typeof lecture.id === 'string' && lecture.id.startsWith('lec_');
    return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{lecture.title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          lecture.status === 'live' ? 'bg-red-100 text-red-800' :
          lecture.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
          lecture.status === 'ended' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {lecture.status.toUpperCase()}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center">
          <GraduationCap className="w-4 h-4 mr-2" />
          <span>{lecture.teacher?.full_name}</span>
        </div>
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          <span>{lecture.classroom?.name}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          <span>{new Date(lecture.scheduled_at).toLocaleString()}</span>
        </div>
        {lecture.duration && (
          <div className="flex items-center">
            <Video className="w-4 h-4 mr-2" />
            <span>{lecture.duration} minutes</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        {currentUser.role === 'admin' && !isLocalSlides && (
          <>
            {lecture.status === 'scheduled' && (
              <button
                onClick={() => handleLectureStatusChange(lecture.id, 'live')}
                className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                <Play className="w-3 h-3 mr-1" />
                Start Live
              </button>
            )}
            {lecture.status === 'live' && (
              <button
                onClick={() => handleLectureStatusChange(lecture.id, 'ended')}
                className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                <Square className="w-3 h-3 mr-1" />
                End
              </button>
            )}
            {lecture.status === 'scheduled' && (
              <button
                onClick={() => handleLectureStatusChange(lecture.id, 'cancelled')}
                className="flex items-center px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                <Pause className="w-3 h-3 mr-1" />
                Cancel
              </button>
            )}
          </>
        )}
        {lecture.status === 'live' && (
          <button
            onClick={() => setViewerLectureId(lecture.id)}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Join
          </button>
        )}
      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{college.name}</h1>
                <p className="text-gray-600">College Code: <span className="font-mono font-semibold">{college.code}</span></p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Logged in as</p>
                  <p className="font-semibold text-gray-900">{currentUser.full_name}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <School className="w-5 h-5 text-blue-600" />
                </div>
                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 cursor-pointer"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'teachers', label: 'Teachers', icon: GraduationCap },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'classrooms', label: 'Classrooms', icon: BookOpen },
              { id: 'lectures', label: 'Live Lectures', icon: Video }
            ].map(({ id, label, icon: Icon }) => (
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
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={GraduationCap}
                title="Teachers"
                value={teachers.length}
                subtitle="Active faculty members"
                color="blue"
              />
              <StatCard
                icon={Users}
                title="Students"
                value={students.length}
                subtitle="Enrolled students"
                color="green"
              />
              <StatCard
                icon={BookOpen}
                title="Classrooms"
                value={classrooms.length}
                subtitle="Active classrooms"
                color="purple"
              />
              <StatCard
                icon={Video}
                title="Live Lectures"
                value={activeLectures.length}
                subtitle="Currently broadcasting"
                color="red"
              />
            </div>

            {/* Active Lectures */}
            {activeLectures.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔴 Live Lectures</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeLectures.map(lecture => (
                    <LectureCard key={lecture.id} lecture={lecture} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Lectures */}
            {upcomingLectures.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Upcoming Lectures</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingLectures.slice(0, 6).map(lecture => (
                    <LectureCard key={lecture.id} lecture={lecture} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'teachers' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Teachers ({teachers.length})</h3>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers.map(teacher => (
                    <tr key={teacher.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{teacher.full_name}</div>
                            <div className="text-sm text-gray-500">@{teacher.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          teacher.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(teacher.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Students ({students.length})</h3>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                            <div className="text-sm text-gray-500">@{student.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'classrooms' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Classrooms ({classrooms.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map(classroom => (
                <div key={classroom.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{classroom.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {classroom.code}
                    </span>
                  </div>
                  
                  {classroom.description && (
                    <p className="text-gray-600 text-sm mb-4">{classroom.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      <span>{classroom.teacher?.full_name}</span>
                    </div>
                    {classroom.subject && (
                      <div className="flex items-center text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>{classroom.subject}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{classroom.members_count || 0} students</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Created {new Date(classroom.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lectures' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">All Lectures ({lectures.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lectures.map(lecture => (
                <LectureCard key={lecture.id} lecture={lecture} />
              ))}
            </div>
          </div>
        )}

        {/* Live Slides Viewer Modal */}
        {viewerLectureId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="font-semibold">Live Slides</div>
                <button onClick={() => setViewerLectureId(null)} className="px-3 py-1 border rounded text-sm">Close</button>
              </div>
              <div className="h-[calc(80vh-48px)]">
                <LiveSlidesViewer lectureId={viewerLectureId} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeDashboard;
