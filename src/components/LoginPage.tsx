import React from 'react';
import { Link } from 'react-router-dom';
import AuthScreen from './AuthScreen';

const LoginPage: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  return (
  <>
    <div className="p-6">
      <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
    </div>
    <AuthScreen onAuthSuccess={onAuthSuccess} />
  </>
);
};

export default LoginPage;
