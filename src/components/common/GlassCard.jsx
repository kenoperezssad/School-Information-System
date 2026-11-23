// src/components/common/GlassCard.jsx
import React from 'react';

export const GlassCard = ({ children, className = '', hover = false, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm transition-all duration-200 ${
      hover ? 'hover:-translate-y-1 hover:shadow-md cursor-pointer' : ''
    } ${className}`}
  >
    {children}
  </div>
);
