// src/components/common/Toast.jsx
import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Toast = ({ toasts: propToasts, onClose }) => {
  const auth = useAuth();
  const [dismissedIds, setDismissedIds] = useState(() => new Set());

  // Support array prop, context toasts array, or single toast fallback
  const rawList = propToasts !== undefined ? propToasts : (auth?.toasts ?? (auth?.toast ? [auth.toast] : []));
  const toastList = Array.isArray(rawList) ? rawList : (rawList ? [rawList] : []);

  const activeToasts = toastList.filter((t) => t && !dismissedIds.has(t.id));

  if (!activeToasts.length) return null;

  const handleClose = (id) => {
    setDismissedIds((prev) => new Set(prev).add(id));
    if (typeof onClose === 'function') {
      onClose(id);
    }
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-slate-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30',
    error: 'border-rose-500/30',
    warning: 'border-amber-500/30',
    info: 'border-slate-400/30',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <style>{`
        @keyframes toastFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-toast-in {
          animation: toastFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl glass-dropdown border ${borders[toast.type] || borders.info} shadow-2xl animate-toast-in`}
        >
          {icons[toast.type] || icons.info}
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1 break-words">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => handleClose(toast.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
