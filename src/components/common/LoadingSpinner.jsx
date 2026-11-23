// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading...', size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizes[size]} animate-spin text-navy-700 dark:text-navy-400`} />
      {label && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
};

