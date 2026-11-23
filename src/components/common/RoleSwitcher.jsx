// src/components/common/RoleSwitcher.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, ChevronDown, Check } from 'lucide-react';

export const RoleSwitcher = () => {
  const { user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const availableRoles = [
    { role: 'Super Administrator', label: 'Super Admin'          },
    { role: 'Registrar',           label: 'Registrar'            },
    { role: 'Teacher',             label: 'Faculty / Teacher'    },
    { role: 'Student',             label: 'Student'              },
    { role: 'Parent/Guardian',     label: 'Parent / Guardian'    },
    { role: 'Accountant',          label: 'Cashier / Accountant' },
    { role: 'Librarian',           label: 'Librarian'            },
    { role: 'Guidance Counselor',  label: 'Guidance Counselor'   },
    { role: 'School Nurse',        label: 'School Nurse'         },
  ];

  const currentRole = user?.role || 'Super Administrator';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100/90 dark:bg-gray-800/90 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-700 transition-all select-none shadow-sm"
        title="Quick Role Switcher for Live Demo & Capstone Evaluation"
      >
        {/* Navy shield icon */}
        <span className="flex items-center gap-1.5" style={{ color: '#132E72' }}>
          <Shield className="w-3.5 h-3.5" />
          <span>Role:</span>
        </span>
        <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
          {currentRole}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-dropdown p-2 z-50 border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800 mb-1">
              Switch Interactive Role
            </div>
            <div className="space-y-0.5 max-h-72 overflow-y-auto">
              {availableRoles.map((item) => {
                const isSelected = currentRole === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => { switchRole(item.role); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors text-left ${
                      isSelected
                        ? 'font-bold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                    }`}
                    style={isSelected ? { background: 'rgba(10,22,40,0.07)', color: '#132E72' } : {}}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Navy dot for selected, gray for others */}
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: isSelected ? '#132E72' : '#D1D5DB' }}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#132E72' }} />}
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
