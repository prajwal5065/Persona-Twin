import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/layout/Hero';
import { AuthForm } from '../components/auth/AuthForm';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful login
    navigate('/dashboard');
  };

  return (
    <Hero showDefaultContent={false}>
      <AuthForm onSuccess={handleAuthSuccess} />
    </Hero>
  );
};

export default AuthPage;
