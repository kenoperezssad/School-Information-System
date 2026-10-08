// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  Calendar,
  Briefcase,
  QrCode,
  Award,
  FileText,
  DollarSign,
  CheckSquare,
  BookOpen,
  HeartPulse,
  Building2,
  BarChart3,
  ShieldAlert,
  Search,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navSections = [
    {
      title: 'CORE & LIFECYCLE',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/students', label: 'Student 360°', icon: Users },
        { to: '/admissions', label: 'Admissions & Applicants', icon: UserPlus },
        { to: '/enrollment', label: 'Enrollment & COR', icon: GraduationCap },
      ],
    },
    {
      title: 'ACADEMICS & FACULTY',
      items: [
        { to: '/schedules', label: 'Class Schedules', icon: Calendar },
        { to: '/faculty', label: 'Faculty & Load', icon: Briefcase },
        { to: '/attendance', label: 'Attendance & QR Scanner', icon: QrCode },
        { to: '/grades', label: 'Grading & Records', icon: Award },
        { to: '/registrar', label: 'Registrar Documents', icon: FileText },
      ],
    },
    {
      title: 'FINANCE & SERVICES',
      items: [
        { to: '/finance', label: 'Accounting & Cashier', icon: DollarSign },
        { to: '/clearance', label: 'Digital Clearance', icon: CheckSquare },
        { to: '/library', label: 'Library Circulation', icon: BookOpen },
        { to: '/welfare', label: 'Clinic & Guidance', icon: HeartPulse },
        { to: '/operations', label: 'Operations & HR', icon: Building2 },
      ],
    },
    {
      title: 'INTELLIGENCE & SECURITY',
      items: [
        { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
        { to: '/verify', label: 'QR Credential Verifier', icon: Search },
        { to: '/audit', label: 'Audit Trail Logs', icon: ShieldAlert },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 glass-panel border-r border-slate-200/80 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                ApexSIS
              </span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Enterprise Edition
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              <div className="px-3 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Institution Badge Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              AY
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 truncate">
                AY 2026-2027
              </p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
                1st Semester • Active
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
