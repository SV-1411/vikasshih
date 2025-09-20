import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, ArrowLeft, CheckCircle, Users, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { userApi } from '../lib/educational-api';

interface UserLoginProps {
  onSuccess: (profile: any) => void;
  onBack: () => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Starting user login...');
      
      // Try Supabase first
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (!signInError && signInData) {
          console.log('Supabase sign in successful, fetching profile...');
          const profileResult = await userApi.getCurrentProfile();
          if (profileResult.data) {
            console.log('User login successful:', profileResult.data);
            setSuccess(`Welcome back, ${profileResult.data.full_name}!`);
            
            setTimeout(() => {
              onSuccess(profileResult.data);
              window.location.href = '/classrooms';
            }, 1500);
            return;
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase login failed, trying localStorage:', supabaseError);
      }

      // Fallback: Check localStorage for demo users
      const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
      console.log('Available demo users:', users.map((u: any) => ({ username: u.username, role: u.role })));
      
      const user = users.find((u: any) => u.username === formData.email && u.password === formData.password);
      
      if (!user) {
        // Initialize demo data if not found
        const { initializeDemoData } = await import('../lib/demo-data');
        initializeDemoData();
        const refreshedUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
        const refreshedUser = refreshedUsers.find((u: any) => u.username === formData.email && u.password === formData.password);
        
        if (!refreshedUser) {
          throw new Error('Invalid email or password');
        }
        
        const { password, ...userProfile } = refreshedUser;
        localStorage.setItem('demo_current_user', JSON.stringify(userProfile));
        localStorage.setItem('demo_auth_token', 'demo_token_' + Date.now());
        onSuccess(userProfile);
        window.location.href = '/classrooms';
        return;
      }

      // Set current user in localStorage
      const { password, ...userProfile } = user;
      localStorage.setItem('demo_current_user', JSON.stringify(userProfile));
      localStorage.setItem('demo_auth_token', 'demo_token_' + Date.now());

      console.log('Demo login successful:', userProfile);
      setSuccess(`Welcome back, ${userProfile.full_name}!`);
      
      setTimeout(() => {
        onSuccess(userProfile);
        window.location.href = '/classrooms';
      }, 1500);

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student & Teacher Login</h1>
          <p className="text-gray-600">Sign in to access your classrooms</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => window.location.href = '/register-user'}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Register as Student/Teacher
            </button>
          </p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3 text-center">Who can use this login?</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-800">Students</p>
              <p className="text-xs text-blue-600">Join classrooms & attend lectures</p>
            </div>
            <div className="text-center">
              <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-800">Teachers</p>
              <p className="text-xs text-blue-600">Create & manage classrooms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
