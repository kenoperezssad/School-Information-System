// src/components/common/GlassCard.jsx
import React from 'react';

export const GlassCard = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl transition-all duration-300 ${
        hover ? 'hover:-translate-y-1 hover:shadow-glass-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
