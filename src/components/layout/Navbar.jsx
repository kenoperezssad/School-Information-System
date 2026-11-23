// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleSwitcher } from '../common/RoleSwitcher';
import { Menu, Sun, Moon, Bell, LogOut, ChevronDown, ShieldCheck, Clock, Settings, ChevronRight } from 'lucide-react';

const ROUTE_LABELS = {
  '/dashboard':  'Dashboard',
  '/students':   'Student Records',
  '/admissions': 'Admissions',
  '/enrollment': 'Enrollment',
  '/registrar':  'Registrar',
  '/faculty':    'Faculty',
  '/schedules':  'Schedules',
  '/attendance': 'Attendance',
  '/grades':     'Grading',
  '/finance':    'Finance',
  '/clearance':  'Clearance',
  '/library':    'Library',
  '/welfare':    'Health & Welfare',
  '/operations': 'Operations',
  '/reports':    'Reports & Analytics',
  '/verify':     'Verify Credential',
  '/audit':      'Audit Logs',
};

function useClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export const Navbar = ({ onOpenSidebar, onToggleNotifications, unreadCount = 0 }) => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const location   = useLocation();
  const time       = useClock();

  const routeLabel  = ROUTE_LABELS[location.pathname] || 'Portal';
  const initials    = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
    : (user?.username?.[0]?.toUpperCase() || 'U');
  const displayName = user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username;

  const iconBtn = 'p-2 rounded-xl transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800';

  return (
    <header className="sticky top-0 z-30 h-14 glass-panel border-b border-gray-200/80 dark:border-gray-800 shadow-sm">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onOpenSidebar} className={`lg:hidden ${iconBtn}`} aria-label="Open sidebar">
            <Menu className="w-5 h-5" />
          </button>
          <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
            <span className="text-gray-400 dark:text-gray-500 font-medium shrink-0">Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
            <span className="font-semibold text-gray-700 dark:text-gray-200 truncate">{routeLabel}</span>
          </nav>
          <span className="sm:hidden font-semibold text-gray-700 dark:text-gray-200 text-sm truncate">{routeLabel}</span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{time}</span>
          </div>

          <RoleSwitcher />

          {/* Dark mode */}
          <button onClick={toggleDarkMode} className={iconBtn} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
            {darkMode ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Bell */}
          <button onClick={onToggleNotifications} className={`relative ${iconBtn}`} title="Notifications">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-gray-950"
                    style={{ background: '#D4A817' }} />
            )}
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                   style={{ background: 'linear-gradient(135deg, #0F2258, #132E72)', color: '#D4A817' }}>
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight max-w-[90px] truncate">{displayName}</p>
                <p className="text-[10px] text-gray-400 font-medium leading-tight max-w-[90px] truncate">{user?.role}</p>
              </div>
              <ChevronDown className="hidden sm:block w-3 h-3 text-gray-400 shrink-0" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl glass-dropdown border border-gray-200 dark:border-gray-700 shadow-2xl z-50 overflow-hidden">

                  {/* Header */}
                  <div className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800"
                       style={{ background: 'rgba(10,22,40,0.04)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                           style={{ background: 'linear-gradient(135deg, #0F2258, #132E72)', color: '#D4A817' }}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy-50 dark:bg-gray-800 text-navy-700 dark:text-gray-300"
                              style={{ background: 'rgba(10,22,40,0.07)', color: '#132E72' }}>
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <div className="px-3 py-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="font-medium">Secure Session Active</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0" />
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                    <button
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-400" />
                      <span>Profile & Settings</span>
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                    <button
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
