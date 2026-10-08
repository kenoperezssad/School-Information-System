// src/components/common/Toast.jsx
import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Toast = () => {
  const { toast } = useAuth();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30',
    error: 'border-rose-500/30',
    info: 'border-sky-500/30',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-bounce-in">
      <div className={`flex items-center gap-3 p-4 rounded-2xl glass-dropdown border ${borders[toast.type] || borders.info} shadow-2xl`}>
        {icons[toast.type] || icons.info}
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1">
          {toast.message}
        </p>
      </div>
    </div>
  );
};
