import React from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeDemoData, loginAsDemoUser, DEMO_ACCOUNTS } from '../lib/demo-data';

const DemoAccess: React.FC = () => {
  const navigate = useNavigate();

  const handleDemoLogin = (userType: 'college' | 'teacher' | 'student') => {
    try {
      // Initialize demo data if not already present
      initializeDemoData();
      
      // Login as the selected user type
      const profile = loginAsDemoUser(userType);
      
      // Navigate to appropriate dashboard
      switch (userType) {
        case 'college':
          navigate('/college-dashboard');
          break;
        case 'teacher':
          navigate('/teacher-dashboard');
          break;
        case 'student':
          navigate('/student-dashboard');
          break;
      }
      
      // Reload to ensure auth state is updated
      window.location.reload();
    } catch (error) {
      console.error('Demo login failed:', error);
      alert('Demo login failed. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🚀 Quick Demo Access</h2>
        <p className="text-gray-600">
          Jump directly to any dashboard with pre-loaded demo data
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* College Admin Demo */}
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🏛️</span>
            </div>
            <h3 className="font-semibold text-gray-900">College Admin</h3>
            <p className="text-sm text-gray-600 mt-1">Manage college, view all data</p>
          </div>
          
          <div className="space-y-2 text-xs text-gray-500 mb-4">
            <div><strong>Email:</strong> {DEMO_ACCOUNTS.college.email}</div>
            <div><strong>Password:</strong> {DEMO_ACCOUNTS.college.password}</div>
            <div><strong>Features:</strong> College overview, user management</div>
          </div>
          
          <button
            onClick={() => handleDemoLogin('college')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Login as Admin
          </button>
        </div>

        {/* Teacher Demo */}
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <h3 className="font-semibold text-gray-900">Teacher</h3>
            <p className="text-sm text-gray-600 mt-1">Manage classrooms & assignments</p>
          </div>
          
          <div className="space-y-2 text-xs text-gray-500 mb-4">
            <div><strong>Email:</strong> {DEMO_ACCOUNTS.teacher.email}</div>
            <div><strong>Password:</strong> {DEMO_ACCOUNTS.teacher.password}</div>
            <div><strong>Features:</strong> 2 classrooms, assignments, quizzes</div>
          </div>
          
          <button
            onClick={() => handleDemoLogin('teacher')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Login as Teacher
          </button>
        </div>

        {/* Student Demo */}
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎓</span>
            </div>
            <h3 className="font-semibold text-gray-900">Student</h3>
            <p className="text-sm text-gray-600 mt-1">View assignments & take quizzes</p>
          </div>
          
          <div className="space-y-2 text-xs text-gray-500 mb-4">
            <div><strong>Email:</strong> {DEMO_ACCOUNTS.student.email}</div>
            <div><strong>Password:</strong> {DEMO_ACCOUNTS.student.password}</div>
            <div><strong>Features:</strong> Enrolled in 2 classes, pending assignments</div>
          </div>
          
          <button
            onClick={() => handleDemoLogin('student')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium"
          >
            Login as Student
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">📋 Demo Data Includes:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Demo University with 3 user accounts</li>
          <li>• 2 Active classrooms (CS101, MATH201)</li>
          <li>• 2 Sample assignments with due dates</li>
          <li>• 1 Interactive quiz with multiple choice questions</li>
          <li>• All data persists in browser localStorage</li>
        </ul>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          💡 Tip: You can switch between accounts anytime by clicking these buttons
        </p>
      </div>
    </div>
  );
};

export default DemoAccess;
