// src/components/layout/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Toast } from '../common/Toast';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Enrollment Approved',
      message: 'Student Keno Reyes (2026-10001) has been officially enrolled in BSCS 3-A.',
      time: '10 mins ago',
      type: 'success',
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    {
      id: 2,
      title: 'Payment Received',
      message: 'Official Receipt OR-2026-00501 (₱24,300.00) confirmed via GCash.',
      time: '45 mins ago',
      type: 'info',
      icon: Info,
      color: 'text-sky-500',
    },
    {
      id: 3,
      title: 'Overdue Library Book',
      message: 'Introduction to Algorithms borrowed by Sophia Santos is now overdue.',
      time: '2 hours ago',
      type: 'warning',
      icon: AlertTriangle,
      color: 'text-amber-500',
    },
    {
      id: 4,
      title: 'Clearance Signatory Completed',
      message: 'Clinic and Library have signed off on graduation clearance batch 2026.',
      time: 'Yesterday',
      type: 'success',
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        <Navbar 
          onOpenSidebar={() => setSidebarOpen(true)} 
          onToggleNotifications={() => setNotificationsOpen(!notificationsOpen)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Notifications Slide-over Drawer */}
      {notificationsOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setNotificationsOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 glass-panel z-50 p-6 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Notifications</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {notifications.length}
                </span>
              </div>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-3">
              {notifications.map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.id} 
                    className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 ${item.color} shrink-0`} />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Global Toast */}
      <Toast />
    </div>
  );
};
