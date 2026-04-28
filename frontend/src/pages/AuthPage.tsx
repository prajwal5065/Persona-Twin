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
    <div className="min-h-screen bg-[#0A0A0A]">
      <Hero showDefaultContent={false}>
        <div className="w-full flex justify-center items-center py-12 md:py-20">
          <AuthForm onSuccess={handleAuthSuccess} />
        </div>
      </Hero>
    </div>
  );
};

export default AuthPage;
