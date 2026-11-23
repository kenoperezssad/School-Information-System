// src/components/layout/Sidebar.jsx
import React from 'react';
import { PesoSign } from '../common/PesoSign';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  CheckSquare,
  BookOpen,
  HeartPulse,
  Building2,
  BarChart3,
  ShieldAlert,
  Search,
  X,
  CreditCard,
  ClipboardList
} from 'lucide-react';

export const ROLE_CONFIG = {
  'Super Administrator': {
    badge: 'Super Administrator',
    allowed: ['*'],
  },
  'Student': {
    badge: 'Student Portal',
    allowed: ['/dashboard', '/schedules', '/grades', '/finance', '/clearance', '/registrar'],
    sections: [
      {
        title: 'MY ACADEMICS',
        items: [
          { to: '/dashboard', label: 'Student Portal',      icon: LayoutDashboard },
          { to: '/schedules', label: 'My Class Timetable',  icon: Calendar },
          { to: '/grades',    label: 'My Academic Grades',  icon: Award },
        ],
      },
      {
        title: 'STUDENT SERVICES',
        items: [
          { to: '/finance',   label: 'My Tuition & Billing',  icon: PesoSign },
          { to: '/clearance', label: 'My Clearance Status',   icon: CheckSquare },
          { to: '/registrar', label: 'Request Documents',     icon: FileText },
        ],
      },
    ],
  },
  'Teacher': {
    badge: 'Faculty Center',
    allowed: ['/dashboard', '/schedules', '/grades', '/attendance', '/students'],
    sections: [
      {
        title: 'INSTRUCTION & SCHEDULE',
        items: [
          { to: '/dashboard', label: 'Faculty Command',        icon: LayoutDashboard },
          { to: '/schedules', label: 'My Teaching Schedules', icon: Calendar },
          { to: '/students',  label: 'My Class Rosters',      icon: Users },
        ],
      },
      {
        title: 'ASSESSMENT & ATTENDANCE',
        items: [
          { to: '/attendance', label: 'Class Attendance & QR', icon: QrCode },
          { to: '/grades',     label: 'Encode Class Grades',   icon: Award },
        ],
      },
    ],
  },
  'Parent/Guardian': {
    badge: 'Parent Portal',
    allowed: ['/dashboard', '/schedules', '/grades', '/attendance', '/finance'],
    sections: [
      {
        title: 'WARD MONITORING',
        items: [
          { to: '/dashboard',  label: 'Ward Overview',         icon: LayoutDashboard },
          { to: '/schedules',  label: 'Ward Timetable',        icon: Calendar },
          { to: '/grades',     label: 'Ward Report Card',      icon: Award },
          { to: '/attendance', label: 'Ward Attendance Logs',  icon: QrCode },
        ],
      },
      {
        title: 'FINANCIALS',
        items: [
          { to: '/finance', label: 'Tuition & Receipts', icon: PesoSign },
        ],
      },
    ],
  },
  'Accountant': {
    badge: 'Finance & Cashier',
    allowed: ['/dashboard', '/finance', '/students', '/enrollment', '/clearance', '/reports'],
    sections: [
      {
        title: 'CASHIER & BILLING',
        items: [
          { to: '/dashboard',  label: 'Finance Command',       icon: LayoutDashboard },
          { to: '/finance',    label: 'Accounting & Cashier',  icon: PesoSign },
          { to: '/enrollment', label: 'Tuition Assessment',    icon: GraduationCap },
          { to: '/students',   label: 'Student Balances',      icon: Users },
        ],
      },
      {
        title: 'CLEARANCE & REPORTS',
        items: [
          { to: '/clearance', label: 'Financial Clearance', icon: CheckSquare },
          { to: '/reports',   label: 'Financial Reports',   icon: BarChart3 },
        ],
      },
    ],
  },
  'Registrar': {
    badge: 'Office of the Registrar',
    allowed: ['/dashboard', '/students', '/admissions', '/enrollment', '/registrar', '/schedules', '/reports', '/verify', '/audit'],
    sections: [
      {
        title: 'STUDENT LIFECYCLE',
        items: [
          { to: '/dashboard',   label: 'Registrar Command',   icon: LayoutDashboard },
          { to: '/students',    label: 'Student Matriculation',icon: Users },
          { to: '/admissions',  label: 'Admissions Pipeline',  icon: UserPlus },
          { to: '/enrollment',  label: 'Enrollment & COR',    icon: GraduationCap },
        ],
      },
      {
        title: 'ACADEMIC RECORDS',
        items: [
          { to: '/registrar', label: 'Official Documents (TOR)', icon: FileText },
          { to: '/schedules', label: 'Master Schedules',         icon: Calendar },
          { to: '/reports',   label: 'Masterlist & Honors',      icon: BarChart3 },
          { to: '/verify',    label: 'QR Credential Verifier',   icon: Search },
        ],
      },
    ],
  },
  'Librarian': {
    badge: 'Library Services',
    allowed: ['/dashboard', '/library', '/students', '/clearance'],
    sections: [
      {
        title: 'CIRCULATION & CATALOG',
        items: [
          { to: '/dashboard', label: 'Library Command',      icon: LayoutDashboard },
          { to: '/library',   label: 'Library Circulation',  icon: BookOpen },
          { to: '/students',  label: 'Student Borrowers',    icon: Users },
          { to: '/clearance', label: 'Library Clearance',    icon: CheckSquare },
        ],
      },
    ],
  },
  'Guidance Counselor': {
    badge: 'Guidance Center',
    allowed: ['/dashboard', '/welfare', '/students', '/attendance', '/clearance'],
    sections: [
      {
        title: 'COUNSELING & WELFARE',
        items: [
          { to: '/dashboard',  label: 'Guidance Command',        icon: LayoutDashboard },
          { to: '/welfare',    label: 'Counseling & Cases',      icon: HeartPulse },
          { to: '/students',   label: 'Student Dossiers',        icon: Users },
          { to: '/attendance', label: 'Truancy & Attendance',    icon: QrCode },
          { to: '/clearance',  label: 'Guidance Clearance',      icon: CheckSquare },
        ],
      },
    ],
  },
  'School Nurse': {
    badge: 'School Clinic',
    allowed: ['/dashboard', '/welfare', '/students', '/clearance'],
    sections: [
      {
        title: 'CLINIC & HEALTHCARE',
        items: [
          { to: '/dashboard', label: 'Clinic Command',           icon: LayoutDashboard },
          { to: '/welfare',   label: 'Medical Logs & Vitals',    icon: HeartPulse },
          { to: '/students',  label: 'Student Health Profiles',  icon: Users },
          { to: '/clearance', label: 'Medical Clearance',        icon: CheckSquare },
        ],
      },
    ],
  },
};

const DEFAULT_ADMIN_SECTIONS = [
  {
    title: 'CORE & LIFECYCLE',
    items: [
      { to: '/dashboard',   label: 'Command Center',          icon: LayoutDashboard },
      { to: '/students',    label: 'Student 360°',            icon: Users },
      { to: '/admissions',  label: 'Admissions & Applicants', icon: UserPlus },
      { to: '/enrollment',  label: 'Enrollment & COR',        icon: GraduationCap },
    ],
  },
  {
    title: 'ACADEMICS & FACULTY',
    items: [
      { to: '/schedules',  label: 'Class Schedules',          icon: Calendar },
      { to: '/faculty',    label: 'Faculty & Load',           icon: Briefcase },
      { to: '/attendance', label: 'Attendance & QR Scanner',  icon: QrCode },
      { to: '/grades',     label: 'Grading & Records',        icon: Award },
      { to: '/registrar',  label: 'Registrar Documents',      icon: FileText },
    ],
  },
  {
    title: 'FINANCE & SERVICES',
    items: [
      { to: '/finance',     label: 'Accounting & Cashier',   icon: PesoSign },
      { to: '/clearance',   label: 'Digital Clearance',      icon: CheckSquare },
      { to: '/library',     label: 'Library Circulation',    icon: BookOpen },
      { to: '/welfare',     label: 'Clinic & Guidance',      icon: HeartPulse },
      { to: '/operations',  label: 'Operations & HR',        icon: Building2 },
    ],
  },
  {
    title: 'INTELLIGENCE & SECURITY',
    items: [
      { to: '/reports', label: 'Reports & Analytics',    icon: BarChart3 },
      { to: '/verify',  label: 'QR Credential Verifier', icon: Search },
      { to: '/audit',   label: 'Audit Trail Logs',       icon: ShieldAlert },
    ],
  },
];

// Role abbreviation map
const ROLE_ABBR = {
  'Student':             'ST',
  'Teacher':             'FA',
  'Registrar':           'RG',
  'Accountant':          'AC',
  'Librarian':           'LB',
  'School Nurse':        'SN',
  'Guidance Counselor':  'GC',
  'Parent/Guardian':     'PG',
  'Super Administrator': 'SA',
};

export const Sidebar = ({ isOpen, onClose, academicYear }) => {
  const { user } = useAuth();
  const currentRole   = user?.role || 'Super Administrator';
  const roleCfg       = ROLE_CONFIG[currentRole];
  const activeSections = roleCfg?.sections || DEFAULT_ADMIN_SECTIONS;
  const badgeText      = roleCfg?.badge || currentRole;
  const abbr           = ROLE_ABBR[currentRole] || 'AD';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel — Deep Navy */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col
          transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'linear-gradient(180deg, #060D1A 0%, #0A1628 30%, #0F2258 70%, #132E72 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.35)',
        }}
      >
        {/* ── Brand Header ───────────────────────────────────────── */}
        <div className="h-[57px] flex items-center justify-between px-5 shrink-0"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            {/* Logo mark with gold ring */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(212,168,23,0.15)',
                border: '1px solid rgba(212,168,23,0.35)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <GraduationCap className="w-5 h-5" style={{ color: '#D4A817' }} />
            </div>
            <div>
              <span className="text-white font-extrabold text-base tracking-tight leading-none block">
                ApexSIS
              </span>
              <span
                className="text-[9px] font-bold uppercase tracking-widest block mt-0.5 truncate max-w-[130px]"
                style={{ color: 'rgba(212,168,23,0.65)' }}
              >
                {badgeText}
              </span>
            </div>
          </div>

          {/* Gold version badge */}
          <div className="hidden lg:flex items-center">
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(212,168,23,0.15)', color: '#D4A817', border: '1px solid rgba(212,168,23,0.25)' }}
            >
              v2.0
            </span>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Navigation Items ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
          {activeSections.map((section, sIdx) => (
            <div key={sIdx}>
              {/* Section label */}
              <div
                className="px-3 mb-2 text-[9.5px] font-bold tracking-widest uppercase"
                style={{ color: 'rgba(212,168,23,0.50)' }}
              >
                {section.title}
              </div>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200`
                      }
                      style={({ isActive }) => isActive
                        ? {
                            background: 'rgba(212,168,23,0.14)',
                            color: '#F5DF6B',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.20)',
                            borderLeft: '3px solid #D4A817',
                            paddingLeft: '0.625rem',
                          }
                        : {
                            color: 'rgba(255,255,255,0.60)',
                            borderLeft: '3px solid transparent',
                          }
                      }
                      onMouseEnter={e => {
                        if (!e.currentTarget.style.boxShadow) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.92)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!e.currentTarget.style.boxShadow) {
                          e.currentTarget.style.background = '';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
                        }
                      }}
                    >
                      <Icon className="w-4 h-4 shrink-0 opacity-80" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer: User info ──────────────────────────────────────── */}
        <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div
            className="p-3 rounded-2xl flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Avatar — Gold */}
            <div className="relative shrink-0">
              <div
                className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-xs"
                style={{
                  background: 'linear-gradient(135deg, #C49210, #D4A817)',
                  boxShadow: '0 2px 10px rgba(212,168,23,0.35)',
                  color: '#060D1A',
                }}
              >
                {abbr}
              </div>
              {/* Online dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: '#34d399', borderColor: '#0A1628' }}
              />
            </div>

            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : currentRole}
              </p>
              <p className="text-[10px] font-medium truncate" style={{ color: 'rgba(212,168,23,0.60)' }}>
                {academicYear || 'AY 2026-2027 • 1st Sem'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
