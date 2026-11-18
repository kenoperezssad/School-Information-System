// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import {
  Search,
  Users,
  Briefcase,
  GraduationCap,
  BarChart3,
  DollarSign,
  X,
  ArrowRight,
} from 'lucide-react';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { EnrollmentPage } from './pages/EnrollmentPage';
import { RegistrarPage } from './pages/RegistrarPage';
import { FacultyPage } from './pages/FacultyPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { AttendancePage } from './pages/AttendancePage';
import { GradingPage } from './pages/GradingPage';
import { FinancePage } from './pages/FinancePage';
import { ClearancePage } from './pages/ClearancePage';
import { LibraryPage } from './pages/LibraryPage';
import { WelfarePage } from './pages/WelfarePage';
import { OperationsPage } from './pages/OperationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { VerifyPage } from './pages/VerifyPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner label="Authenticating session..." size="lg" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Global Search (Ctrl+K / Cmd+K)
const QUICK_LINKS = [
  { label: 'Students', path: '/students', icon: 'Users', desc: 'View all students' },
  { label: 'Faculty', path: '/faculty', icon: 'Briefcase', desc: 'View all faculty' },
  { label: 'Enrollment', path: '/enrollment', icon: 'GraduationCap', desc: 'Manage enrollment' },
  { label: 'Reports', path: '/reports', icon: 'BarChart3', desc: 'View analytics' },
  { label: 'Finance', path: '/finance', icon: 'DollarSign', desc: 'Payments & receipts' },
];

const SAMPLE_STUDENTS = [
  { label: 'Keno Reyes', path: '/students', icon: 'Users', desc: 'BSCS 3-A • Student ID: 2026-10001' },
  { label: 'Sophia Santos', path: '/students', icon: 'Users', desc: 'BSIT 2-B • Student ID: 2026-10042' },
  { label: 'Juan Dela Cruz', path: '/students', icon: 'Users', desc: 'BSEMC 1-A • Student ID: 2026-10103' },
  { label: 'Maria Clara', path: '/students', icon: 'Users', desc: 'BSCS 4-A • Student ID: 2026-10015' },
];

const SAMPLE_FACULTY = [
  { label: 'Dr. Alan Turing', path: '/faculty', icon: 'Briefcase', desc: 'Professor • Computer Science Dept' },
  { label: 'Prof. Grace Hopper', path: '/faculty', icon: 'Briefcase', desc: 'Dean • College of Engineering' },
  { label: 'Dr. Katherine Johnson', path: '/faculty', icon: 'Briefcase', desc: 'Head • Mathematics & Statistics' },
];

const ICON_MAP = {
  Users,
  Briefcase,
  GraduationCap,
  BarChart3,
  DollarSign,
};

function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const isLoginPage = location.pathname === '/login';

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
  };

  // Toggle or close on keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsOpen((prev) => {
          if (prev) setQuery('');
          return !prev;
        });
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSelect = (path) => {
    handleClose();
    navigate(path);
  };

  const q = query.trim().toLowerCase();
  const filteredLinks = QUICK_LINKS.filter(
    (item) => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
  );
  const filteredStudents = SAMPLE_STUDENTS.filter(
    (item) => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
  );
  const filteredFaculty = SAMPLE_FACULTY.filter(
    (item) => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
  );

  const hasResults = filteredLinks.length > 0 || filteredStudents.length > 0 || filteredFaculty.length > 0;

  return (
    <>
      {/* Small keyboard hint in the Navbar area when logged in */}
      {token && !isLoginPage && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed top-5 left-1/2 -translate-x-1/2 lg:left-[calc(50%+9rem)] lg:-translate-x-1/2 z-30 hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs text-slate-400 transition-all cursor-pointer"
          title="Search system (Ctrl+K)"
          aria-label="Global search shortcut"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-400 hidden md:inline">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
            Ctrl K
          </kbd>
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
          onClick={handleClose}
        >
          <div
            className="max-w-xl mx-auto mt-24 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students, faculty, subjects..."
                className="w-full text-sm bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                Ctrl K
              </kbd>
            </div>

            {/* Results / Navigation Area */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-4">
              {q.length < 2 ? (
                <div>
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Navigation
                  </p>
                  <div className="space-y-1">
                    {QUICK_LINKS.map((item) => {
                      const Icon = ICON_MAP[item.icon] || Search;
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => handleSelect(item.path)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {item.label}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : hasResults ? (
                <div className="space-y-4">
                  {filteredLinks.length > 0 && (
                    <div>
                      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Quick Navigation
                      </p>
                      <div className="space-y-1">
                        {filteredLinks.map((item) => {
                          const Icon = ICON_MAP[item.icon] || Search;
                          return (
                            <button
                              key={item.path}
                              type="button"
                              onClick={() => handleSelect(item.path)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                    {item.label}
                                  </p>
                                  <p className="text-[11px] text-slate-400 truncate">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filteredStudents.length > 0 && (
                    <div>
                      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Students
                      </p>
                      <div className="space-y-1">
                        {filteredStudents.map((item, idx) => {
                          const Icon = ICON_MAP[item.icon] || Users;
                          return (
                            <button
                              key={`student-${idx}`}
                              type="button"
                              onClick={() => handleSelect(item.path)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                    {item.label}
                                  </p>
                                  <p className="text-[11px] text-slate-400 truncate">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filteredFaculty.length > 0 && (
                    <div>
                      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Faculty
                      </p>
                      <div className="space-y-1">
                        {filteredFaculty.map((item, idx) => {
                          const Icon = ICON_MAP[item.icon] || Briefcase;
                          return (
                            <button
                              key={`faculty-${idx}`}
                              type="button"
                              onClick={() => handleSelect(item.path)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                    {item.label}
                                  </p>
                                  <p className="text-[11px] text-slate-400 truncate">
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    No results found for "{query}"
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Try searching for "students", "faculty", "enrollment", or "finance"
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Press Esc to close</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                ESC
              </kbd>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GlobalSearch />
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes wrapped in Glassmorphic Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="admissions" element={<AdmissionsPage />} />
            <Route path="enrollment" element={<EnrollmentPage />} />
            <Route path="registrar" element={<RegistrarPage />} />
            <Route path="faculty" element={<FacultyPage />} />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="grades" element={<GradingPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="clearance" element={<ClearancePage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="welfare" element={<WelfarePage />} />
            <Route path="operations" element={<OperationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="verify" element={<VerifyPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
