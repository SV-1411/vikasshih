import React, { useState } from 'react';
import { BookOpen, Wifi, WifiOff } from 'lucide-react';
import { auth } from '../lib/auth';

interface AuthScreenProps {
  onAuthSuccess: () => void;
  isSignup?: boolean;
}

export default function AuthScreen({ onAuthSuccess, isSignup = false }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(!isSignup);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await auth.login(username, password);
      } else {
        result = await auth.register(username, password, role);
      }

      if (result.success) {
        onAuthSuccess();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const createDemoUser = async (demoRole: 'student' | 'teacher' | 'admin') => {
    const demoUsername = `demo_${demoRole}`;
    const demoPassword = 'demo123';
    
    setLoading(true);
    setError('');
    try {
      const result = await auth.register(demoUsername, demoPassword, demoRole);
      if (result.success) {
        onAuthSuccess();
      } else {
        // Try to login if user already exists
        const loginResult = await auth.login(demoUsername, demoPassword);
        if (loginResult.success) {
          onAuthSuccess();
        } else {
          setError(loginResult.error || 'Failed to create demo user');
        }
      }
    } catch (error) {
      setError('Failed to create demo user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-4">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vikas</h1>
          <p className="text-gray-600">Offline-first micro-learning platform</p>
          
          {/* Network Status */}
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm mt-4 ${
            isOffline ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
          }`}>
            {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span>{isOffline ? 'Offline Mode - Local auth only' : 'Online - Full sync available'}</span>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                  isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                  !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'student' | 'teacher' | 'admin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          {/* Demo Users */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Quick demo access:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => createDemoUser('student')}
                disabled={loading}
                className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
              >
                Demo Student
              </button>
              <button
                onClick={() => createDemoUser('teacher')}
                disabled={loading}
                className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
              >
                Demo Teacher
              </button>
              <button
                onClick={() => createDemoUser('admin')}
                disabled={loading}
                className="px-3 py-2 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>✓ Offline-first learning • ✓ Audio-first content • ✓ Progress sync</p>
        </div>
      </div>
    </div>
  );
}