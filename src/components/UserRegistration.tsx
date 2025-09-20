import React, { useState } from 'react';
import { User, Mail, Lock, Phone, GraduationCap, Users, AlertCircle, CheckCircle, School } from 'lucide-react';
import { userApi } from '../lib/educational-api';
import type { UserRegistrationForm } from '../types';

interface UserRegistrationProps {
  onSuccess: (user: any) => void;
  onBack: () => void;
}

const UserRegistration: React.FC<UserRegistrationProps> = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState<UserRegistrationForm>({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    college_code: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper to wrap a promise with a timeout while preserving the promise type
  const withTimeout = async <T,>(promise: Promise<T>, ms: number, message = 'Operation timed out'): Promise<T> => {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms))
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    console.log('Starting user registration...', formData);

    try {
      // Try Supabase registration first
      const result = await userApi.register(formData);

      console.log('Registration result:', result);

      if (result.error) {
        console.error('Registration error:', result.error);
        setError(result.error);
      } else if (result.data) {
        console.log('Registration successful:', result.data);
        setSuccess(`Registration successful! Welcome ${result.data.full_name}!`);
        setTimeout(() => {
          onSuccess(result.data);
          // Redirect to main app route to ensure UI updates after auth state change
          window.location.href = '/classrooms';
        }, 1500);
      } else {
        setError('Registration failed - no data returned');
      }
    } catch (err: any) {
      console.error('Registration exception:', err);
      setError(err.message || 'Registration failed - please check your connection');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Your College</h1>
          <p className="text-gray-600">Create your account to access classrooms and lectures</p>
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
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">I am a *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                  formData.role === 'student'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-6 h-6" />
                <span className="font-medium">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
                className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                  formData.role === 'teacher'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <GraduationCap className="w-6 h-6" />
                <span className="font-medium">Teacher</span>
              </button>
            </div>
          </div>

          {/* College Code */}
          <div>
            <label htmlFor="college_code" className="block text-sm font-medium text-gray-700 mb-1">
              College Code *
            </label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="college_code"
                name="college_code"
                required
                value={formData.college_code}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="Enter college code (e.g., COL-ABC123)"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Get this code from your college administration</p>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="full_name"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
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

          {/* Phone (Optional) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
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
                placeholder="Create a strong password"
                minLength={6}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Password must be at least 6 characters long</p>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            {formData.role === 'teacher' ? 'As a Teacher, you can:' : 'As a Student, you can:'}
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {formData.role === 'teacher' ? (
              <>
                <li>• Create and manage classrooms</li>
                <li>• Conduct live lectures</li>
                <li>• Create assignments, quizzes, and polls</li>
                <li>• Chat with students</li>
              </>
            ) : (
              <>
                <li>• Join classrooms with codes</li>
                <li>• Attend live lectures</li>
                <li>• Submit assignments and take quizzes</li>
                <li>• Participate in polls and discussions</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
