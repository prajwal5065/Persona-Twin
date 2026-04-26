import React from 'react';

export const WolfIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Geometric Wolf Head */}
    <path 
      d="M16 4L22 10L28 14L26 22L16 28L6 22L4 14L10 10L16 4Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M16 4V12M16 28V20M4 14H10M28 14H22M10 10L16 12L22 10M6 22L16 20L26 22" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      opacity="0.5"
    />
    <path 
      d="M13 15L15 17M19 15L17 17" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);
