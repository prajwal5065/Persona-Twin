import React from 'react';

export const CustomSpinner = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <svg className="absolute inset-0 animate-[spin_1s_linear_infinite]" viewBox="0 0 32 32">
      <circle 
        cx="16" 
        cy="16" 
        r="14" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeDasharray="40 60" 
        strokeLinecap="round" 
        className="text-primary"
        fill="none" 
      />
    </svg>
    <svg className="absolute inset-0 animate-[spin_1.5s_linear_infinite_reverse]" viewBox="0 0 32 32">
      <circle 
        cx="16" 
        cy="16" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeDasharray="30 40" 
        strokeLinecap="round" 
        className="text-[#00B3B3]"
        fill="none" 
      />
    </svg>
  </div>
);
