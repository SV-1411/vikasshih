import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import type { ApiResponse, ClassroomMember } from '../types';

interface JoinClassroomModalProps {
  onClose: () => void;
  onSubmit: (code: string) => Promise<ApiResponse<ClassroomMember>>;
}

const JoinClassroomModal: React.FC<JoinClassroomModalProps> = ({ onClose, onSubmit }) => {
  const [classroomCode, setClassroomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onSubmit(classroomCode.toUpperCase());
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Successfully joined the classroom!');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join classroom');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClassroomCode(e.target.value.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Join Classroom</h2>
              <p className="text-sm text-gray-600">Enter the classroom code to join</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          <div>
            <label htmlFor="classroomCode" className="block text-sm font-medium text-gray-700 mb-2">
              Classroom Code *
            </label>
            <input
              type="text"
              id="classroomCode"
              required
              value={classroomCode}
              onChange={handleCodeChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono tracking-wider uppercase"
              placeholder="CLS-ABC123"
              maxLength={10}
              style={{ textTransform: 'uppercase' }}
            />
            <p className="text-sm text-gray-500 mt-2">
              Get this code from your teacher or classroom invitation
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">After joining, you can:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Access assignments and submit your work</li>
              <li>• Take quizzes and participate in polls</li>
              <li>• Join live lectures and discussions</li>
              <li>• Chat with your teacher and classmates</li>
            </ul>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !classroomCode.trim()}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Joining...' : 'Join Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinClassroomModal;
