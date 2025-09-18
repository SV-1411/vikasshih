import { FC } from 'react';
import AuthScreen from './AuthScreen';

const SignupPage: FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  return <AuthScreen onAuthSuccess={onAuthSuccess} isSignup={true} />;
};

export default SignupPage;
