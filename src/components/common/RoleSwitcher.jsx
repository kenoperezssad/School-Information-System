// src/components/common/RoleSwitcher.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, ChevronDown, Check } from 'lucide-react';

export const RoleSwitcher = () => {
  const { user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const availableRoles = [
    { role: 'Super Administrator', label: 'Super Admin', color: 'bg-purple-500' },
    { role: 'Registrar', label: 'Registrar', color: 'bg-blue-500' },
    { role: 'Teacher', label: 'Faculty / Teacher', color: 'bg-emerald-500' },
    { role: 'Student', label: 'Student', color: 'bg-amber-500' },
    { role: 'Parent/Guardian', label: 'Parent / Guardian', color: 'bg-rose-500' },
    { role: 'Accountant', label: 'Cashier / Accountant', color: 'bg-teal-500' },
    { role: 'Librarian', label: 'Librarian', color: 'bg-indigo-500' },
    { role: 'Guidance Counselor', label: 'Guidance Counselor', color: 'bg-pink-500' },
    { role: 'School Nurse', label: 'School Nurse', color: 'bg-cyan-500' },
  ];

  const currentRole = user?.role || 'Super Administrator';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all select-none shadow-sm"
        title="Quick Role Switcher for Live Demo & Capstone Evaluation"
      >
        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Role:</span>
        </span>
        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
          {currentRole}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-dropdown p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
              Switch Interactive Role
            </div>
            <div className="mt-1 space-y-0.5 max-h-72 overflow-y-auto">
              {availableRoles.map((item) => {
                const isSelected = currentRole === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchRole(item.role);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors text-left ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
