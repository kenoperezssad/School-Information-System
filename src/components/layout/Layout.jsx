// src/components/layout/Layout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Toast } from '../common/Toast';
import { Bell, CheckCircle2, AlertTriangle, Info, X, ArrowUp, CheckCheck } from 'lucide-react';

const NOTIFICATIONS = [
  { id:1, title:'Enrollment Approved',   message:'Student Keno Reyes (2026-10001) has been officially enrolled in BSCS 3-A.',          time:'10 mins ago', icon:CheckCircle2, unread:true  },
  { id:2, title:'Payment Received',       message:'Official Receipt OR-2026-00501 (PHP 24,300.00) confirmed via GCash.',                    time:'45 mins ago', icon:Info,         unread:true  },
  { id:3, title:'Overdue Library Book',   message:'Introduction to Algorithms borrowed by Sophia Santos is now 5 days overdue.',         time:'2 hours ago', icon:AlertTriangle, unread:false },
  { id:4, title:'Clearance Signed Off',   message:'Clinic and Library have approved graduation clearance batch 2026.',                   time:'Yesterday',   icon:CheckCircle2, unread:false },
];

export const Layout = () => {
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications,     setNotifications]     = useState(NOTIFICATIONS);
  const [showScrollTop,     setShowScrollTop]     = useState(false);
  const [pageLoading,       setPageLoading]       = useState(false);
  const location = useLocation();
  const mainRef  = useRef(null);

  useEffect(() => {
    setPageLoading(true);
    const t = setTimeout(() => setPageLoading(false), 450);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const h = () => setShowScrollTop(el.scrollTop > 350);
    el.addEventListener('scroll', h, { passive: true });
    return () => el.removeEventListener('scroll', h);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, unread: false })));
  const scrollToTop = () => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {pageLoading && <div className="progress-bar" />}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleNotifications={() => setNotificationsOpen(o => !o)}
          unreadCount={unreadCount}
        />

        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl w-full mx-auto page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notifications drawer */}
      {notificationsOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setNotificationsOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-80 sm:w-[22rem] bg-white dark:bg-gray-900 z-50 flex flex-col border-l border-gray-100 dark:border-gray-800 shadow-2xl">

            {/* Navy-to-gold top stripe */}
            <div className="h-1 w-full shrink-0"
                 style={{ background: 'linear-gradient(90deg, #0F2258, #132E72 60%, #D4A817)' }} />

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: '#132E72' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead}
                    className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button onClick={() => setNotificationsOpen(false)}
                  className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notifications.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.id}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      item.unread
                        ? 'bg-navy-50 dark:bg-navy-950/20 border-navy-100 dark:border-navy-900/30'
                        : 'bg-white dark:bg-gray-900/60 border-gray-100 dark:border-gray-800'
                    } hover:border-gray-300 dark:hover:border-gray-600`}
                    style={item.unread ? { background: 'rgba(10,22,40,0.04)', borderColor: 'rgba(10,22,40,0.10)' } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                          {item.unread && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#D4A817' }} />}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{item.message}</p>
                        <span className="text-[10px] text-gray-400 mt-1.5 block">{item.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-center text-gray-400">
                {unreadCount === 0 ? 'All caught up!' : `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Back to top — Navy */}
      {showScrollTop && (
        <button onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-xl text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #0F2258, #132E72)', boxShadow: '0 4px 16px rgba(10,22,40,0.30)' }}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      <Toast />
    </div>
  );
};
