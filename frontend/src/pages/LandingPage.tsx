import React from 'react';
import { Hero } from '../components/layout/Hero';

export const LandingPage: React.FC = () => {
  return (
    <main className="bg-[#0d150e] min-h-screen">
      <Hero />
      {/* Potential further sections could go here */}
    </main>
  );
};

export default LandingPage;
