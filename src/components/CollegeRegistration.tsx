import React, { useState } from 'react';
import { School, Mail, Phone, MapPin, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { collegeApi } from '../lib/educational-api';
import type { CollegeRegistrationForm } from '../types';

interface CollegeRegistrationProps {
  onSuccess: (college: any) => void;
  onBack: () => void;
}

const CollegeRegistration: React.FC<CollegeRegistrationProps> = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState<CollegeRegistrationForm>({
    name: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    admin_name: '',
    admin_email: '',
    admin_password: ''
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

    console.log('🏫 Starting college registration...', formData);

    try {
      // Try Supabase registration first
      const result = await collegeApi.register(formData);

      console.log('Registration result:', result);

      if (result.error) {
        console.error('Registration error:', result.error);
        setError(result.error);
      } else if (result.data) {
        console.log('Registration successful:', result.data);
        setSuccess(`College registered successfully! College Code: ${result.data.code}`);
        setTimeout(() => {
          onSuccess(result.data);
          // Navigate directly without reload
          window.location.href = '/college-dashboard';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <School className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your College</h1>
          <p className="text-gray-600">Create an educational platform for your institution</p>
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
          {/* College Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">College Information</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                College Name *
              </label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter college name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter complete address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    required
                    value={formData.contact_email}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="college@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="contact_phone"
                    name="contact_phone"
                    required
                    value={formData.contact_phone}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Administrator Account</h3>
            
            <div>
              <label htmlFor="admin_name" className="block text-sm font-medium text-gray-700 mb-1">
                Administrator Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="admin_name"
                  name="admin_name"
                  required
                  value={formData.admin_name}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter admin full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700 mb-1">
                Administrator Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="admin_email"
                  name="admin_email"
                  required
                  value={formData.admin_email}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700 mb-1">
                Administrator Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="admin_password"
                  name="admin_password"
                  required
                  value={formData.admin_password}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a strong password"
                  minLength={6}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>
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
              {loading ? 'Registering...' : 'Register College'}
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your college will receive a unique college code</li>
            <li>• Teachers and students can register using this code</li>
            <li>• You'll have access to the college dashboard</li>
            <li>• Start creating classrooms and managing lectures</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CollegeRegistration;
