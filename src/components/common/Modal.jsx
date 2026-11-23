// src/components/common/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZE_MAP = { 'max-w-sm':'max-w-sm','max-w-md':'max-w-md','max-w-lg':'max-w-lg','max-w-xl':'max-w-xl','max-w-2xl':'max-w-2xl','max-w-3xl':'max-w-3xl','max-w-4xl':'max-w-4xl' };

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="modal-backdrop fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className={`modal-panel w-full ${SIZE_MAP[maxWidth] || maxWidth} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative z-10`}
          onClick={e => e.stopPropagation()}
        >
          {/* Navy-to-gold gradient top accent */}
          <div className="h-1 w-full"
               style={{ background: 'linear-gradient(90deg, #0F2258, #132E72 60%, #D4A817)' }} />

          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
              {subtitle && <p className="mt-1 text-xs text-gray-500 leading-relaxed">{subtitle}</p>}
            </div>
            <button onClick={onClose}
              className="ml-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
};
