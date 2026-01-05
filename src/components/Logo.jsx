import React from 'react';

const Logo = ({ className = "w-8 h-8" }) => {
  return (
    <svg className={className} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* S Letter */}
      <path d="M5 10 L25 10 L25 15 L15 15 L15 20 L25 20 L25 25 L15 25 L15 30 L25 30 L25 35 L5 35 L5 30 L15 30 L15 25 L5 25 L5 20 L15 20 L15 15 L5 15 Z" fill="white"/>
      
      {/* I Letter */}
      <rect x="30" y="10" width="10" height="25" fill="white"/>
      
      {/* Blue curved swoosh */}
      <path d="M50 15 Q75 8 95 25 Q105 35 95 45 Q80 50 65 40 Q55 30 50 15" fill="#6366f1"/>
      
      {/* White curved swoosh */}
      <path d="M55 20 Q80 12 100 30 Q110 40 100 50 Q85 55 70 45" stroke="white" strokeWidth="3" fill="none"/>
    </svg>
  );
};

export default Logo;