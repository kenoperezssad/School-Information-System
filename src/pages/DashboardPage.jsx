// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { PesoSign } from '../components/common/PesoSign';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Briefcase,
  TrendingUp,
  UserCheck,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertCircle,
  QrCode,
  FileText,
  CheckCircle2,
  Bell,
  HeartPulse,
  Sparkles,
  MapPin,
  ChevronRight,
  Printer,
  CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.success && res.data) setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <LoadingSpinner label="Loading customized role dashboard..." size="lg" />;
  }

  const counters = data?.counters || {};
  const charts = data?.charts || {};
  const currentRole = user?.role || 'Super Administrator';
  const PIE_COLORS = ['#132E72', '#10b981', '#f59e0b', '#a3534a', '#c0847e'];

  // ===========================================================================
  // 1. STUDENT ROLE PORTAL DASHBOARD
  // ===========================================================================
  if (currentRole === 'Student') {
    const student = data?.student || {};
    const enrolledSubjects = data?.enrolledSubjects || [];
    const todayClasses = data?.todayClasses || [];
    const announcements = data?.announcements || [];
    const totalUnits = enrolledSubjects.reduce((acc, curr) => acc + (Number(curr.credit_units) || 3), 0);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Student Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-800 via-navy-700 to-navy-700 p-6 sm:p-8 text-white shadow-2xl border border-navy-700">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-navy-700/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-navy-600 via-navy-700 to-navy-800 p-1 shrink-0 shadow-lg shadow-navy-900/40">
                <div className="w-full h-full rounded-[14px] bg-gray-900 flex items-center justify-center font-extrabold text-2xl text-gold-400">
                  {student.first_name ? student.first_name[0] : (user?.first_name?.[0] || 'S')}
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-navy-700/30 border border-navy-400/30 text-navy-200">
                    ID: {student.student_number || '2026-10001'}
                  </span>
                  <Badge variant="success">Active Enrolled</Badge>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-gold-400 border border-amber-400/30">
                    Dean's Lister
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {student.first_name ? `${student.first_name} ${student.last_name}` : (user?.first_name ? `${user.first_name} ${user.last_name}` : 'Keno Reyes')}
                </h1>
                <p className="text-xs sm:text-sm text-navy-200/80 mt-1 font-medium">
                  {student.program_name || 'Bachelor of Science in Computer Science'} ({student.program_code || 'BSCS'}) â€¢ {student.year_level || '3rd Year'}
                </p>
              </div>
            </div>

            {/* Quick Student Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                icon={Calendar}
                onClick={() => navigate('/schedules')}
                className="shadow-md shadow-navy-800/25"
              >
                My Schedule
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Award}
                onClick={() => navigate('/grades')}
              >
                View Grades
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={PesoSign}
                onClick={() => navigate('/finance')}
              >
                My Balance
              </Button>
            </div>
          </div>
        </div>

        {/* Student 360 KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Cumulative GPA"
            value={counters.myCurrentGpa || '1.25'}
            icon={Award}
            gradient="from-amber-500 to-amber-600"
            iconColor="text-amber-500"
            iconBg="bg-amber-50 dark:bg-amber-950/50"
            trend="Dean's List"
            trendLabel="First Honors"
          />
          <StatCard
            title="Enrolled Load"
            value={`${totalUnits || 15} Units`}
            icon={GraduationCap}
            gradient="from-navy-800 to-navy-700"
            iconColor="text-navy-600"
            iconBg="bg-navy-50 dark:bg-navy-950/50"
            trend={`${enrolledSubjects.length} Courses`}
            trendLabel="Regular Term"
          />
          <StatCard
            title="Attendance Punctuality"
            value={counters.myAttendanceRate || '96%'}
            icon={UserCheck}
            gradient="from-emerald-500 to-teal-600"
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50 dark:bg-emerald-950/50"
            trend="Verified"
            trendLabel="Good Standing"
          />
          <StatCard
            title="Outstanding Balance"
            value={counters.myBalance ? `PHP ${Number(counters.myBalance).toLocaleString()}` : 'PHP 0.00'}
            icon={PesoSign}
            gradient="from-navy-800 to-navy-700"
            iconColor="text-teal-500"
            iconBg="bg-teal-50 dark:bg-teal-950/50"
            trend={counters.myBalance ? 'Payment Due' : 'Fully Cleared'}
            trendLabel="1st Sem AY 26-27"
          />
        </div>

        {/* Two-Column Detail: Today's Classes & Interactive ID Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule Timeline */}
          <GlassCard className="lg:col-span-2 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-navy-50 dark:bg-navy-950/50 text-navy-700 dark:text-navy-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Today's Classes & Timetable
                  </h3>
                  <p className="text-xs text-slate-400">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <Badge variant="purple">{todayClasses.length} Scheduled</Badge>
            </div>

            {todayClasses.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {todayClasses.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-950/60 text-navy-700 dark:text-navy-400 flex flex-col items-center justify-center font-bold text-[11px] shrink-0 border border-navy-100 dark:border-navy-700">
                        <span>{item.code?.substring(0, 4)}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title || item.code}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Prof. {item.prof_first} {item.prof_last} â€¢ Room {item.room_number || 'Lab 3'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-navy-700 dark:text-navy-400 block font-mono">
                        {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Classes Scheduled Today
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You have no lecture or laboratory sessions today. Perfect time for study, research at the library, or project work!
                </p>
              </div>
            )}
          </GlassCard>

          {/* Digital PVC Student ID Quick View */}
          <GlassCard className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-navy-600" />
                  <span>Digital Student ID</span>
                </h3>
                <Badge variant="success">Verified Active</Badge>
              </div>

              {/* Realistic PVC Card Miniature */}
              <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-navy-700 to-slate-900 border border-navy-600/30 text-white shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400">
                      APEX STATE UNIVERSITY
                    </p>
                    <p className="text-[8px] text-slate-400">STUDENT IDENTIFICATION CARD</p>
                  </div>
                  <GraduationCap className="w-5 h-5 text-navy-400" />
                </div>

                <div className="py-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-navy-800 to-navy-700 flex items-center justify-center font-bold text-base shadow-md">
                    {student.first_name ? student.first_name[0] : 'S'}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-gold-400 mt-0.5">
                      {student.student_number || '2026-10001'}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {student.program_code || 'BSCS'} â€¢ 3rd Year
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[8px] font-mono text-slate-400">
                  <span>VALID: AY 2026-2027</span>
                  <span className="text-emerald-400 font-bold">â— RFID ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => navigate('/clearance')}
              >
                View Clearance Status ({counters.myClearanceStatus || 'Cleared'})
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => navigate('/registrar')}
              >
                Request Official Transcript
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Enrolled Courses Complete Roster */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                My Enrolled Courses & Faculty Instructors
              </h3>
              <p className="text-xs text-slate-400">
                Current active semester study load
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Study Load
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold border-y border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Course Code</th>
                  <th className="py-3 px-4">Subject Title</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Timetable Schedule</th>
                  <th className="py-3 px-4">Assigned Room</th>
                  <th className="py-3 px-4">Course Professor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {enrolledSubjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-navy-50/30 dark:hover:bg-navy-950/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-navy-700 dark:text-navy-400">
                      {sub.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {sub.title}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {sub.credit_units || 3}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {sub.day_of_week ? `${sub.day_of_week} ${sub.start_time?.substring(0, 5)} - ${sub.end_time?.substring(0, 5)}` : 'TBA'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {sub.room_number || 'Lab 3'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      Prof. {sub.prof_first} {sub.prof_last}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ===========================================================================
  // 2. FACULTY / TEACHER ROLE DASHBOARD
  // ===========================================================================
  if (currentRole === 'Teacher') {
    const schedules = data?.schedules || [];
    const todayClasses = data?.todayClasses || [];
    const faculty = data?.faculty || {};

    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title={`Welcome, Prof. ${faculty.first_name || user?.first_name || 'Faculty'}!`}
          subtitle={`${faculty.department_name || 'Computer Science Department'} â€¢ Teaching Load AY 2026-2027`}
          badge={<Badge variant="purple">Faculty Center</Badge>}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={Award}
                onClick={() => navigate('/grades')}
              >
                Encode Grades
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={QrCode}
                onClick={() => navigate('/attendance')}
              >
                QR Roll Call
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Assigned Classes"
            value={counters.assignedClasses ?? schedules.length}
            icon={BookOpen}
            gradient="from-navy-800 to-navy-700"
            iconColor="text-navy-600"
            iconBg="bg-navy-50 dark:bg-navy-950/50"
          />
          <StatCard
            title="Total Students"
            value={counters.totalStudentsInClasses ?? 142}
            icon={Users}
            gradient="from-emerald-500 to-teal-600"
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          />
          <StatCard
            title="Classes Today"
            value={todayClasses.length}
            icon={Calendar}
            gradient="from-amber-500 to-orange-600"
            iconColor="text-amber-500"
            iconBg="bg-amber-50 dark:bg-amber-950/50"
          />
          <StatCard
            title="Pending Grade Sheets"
            value={counters.pendingGradeSheets ?? 2}
            icon={Award}
            gradient="from-navy-700 to-navy-800"
            iconColor="text-navy-600"
            iconBg="bg-navy-800 dark:bg-navy-800"
          />
        </div>

        {/* Faculty Schedule Matrix */}
        <GlassCard className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-navy-600" />
            <span>My Teaching Timetable & Class Sections</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Day & Time</th>
                  <th className="py-3 px-4">Facility / Room</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schedules.map((sch, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {sch.subject_code} - {sch.subject_title}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="purple">{sch.section_name || 'Section A'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {sch.day_of_week} ({sch.start_time?.substring(0, 5)} - {sch.end_time?.substring(0, 5)})
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {sch.room_number} â€¢ {sch.building_name}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button size="xs" variant="primary" onClick={() => navigate('/grades')}>
                        Encode
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ===========================================================================
  // 3. ACCOUNTANT / CASHIER DASHBOARD
  // ===========================================================================
  if (currentRole === 'Accountant') {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="Cashier & Financial Operations Command"
          subtitle="Tuition fee collections, official receipt drawer, and accounts receivable tracking"
          badge={<Badge variant="purple">Finance & Cashier</Badge>}
          actions={
            <Button variant="primary" size="sm" icon={PesoSign} onClick={() => navigate('/finance')}>
              Open Cashier Drawer
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Total Term Collections"
            value={`PHP ${Number(counters.totalCollected || 1240000).toLocaleString()}`}
            icon={PesoSign}
            gradient="from-emerald-500 to-teal-600"
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          />
          <StatCard
            title="Outstanding Receivables"
            value={`PHP ${Number(counters.outstandingBalance || 312000).toLocaleString()}`}
            icon={CreditCard}
            gradient="from-amber-500 to-orange-600"
            iconColor="text-amber-500"
            iconBg="bg-amber-50 dark:bg-amber-950/50"
          />
          <StatCard
            title="Unpaid Student Invoices"
            value={counters.unpaidInvoices ?? 18}
            icon={AlertCircle}
            gradient="from-rose-500 to-rose-600"
            iconColor="text-rose-500"
            iconBg="bg-rose-50 dark:bg-rose-950/50"
          />
        </div>

        <GlassCard className="p-8 text-center space-y-4">
          <PesoSign className="w-12 h-12 text-navy-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Daily Cashier Terminal Ready
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Process on-counter tuition payments, issue official computerized receipts (OR#), and sign off student clearance.
          </p>
          <Button variant="primary" onClick={() => navigate('/finance')}>
            Launch Accounting & Cashier Drawer â†’
          </Button>
        </GlassCard>
      </div>
    );
  }

  // ===========================================================================
  // 4. REGISTRAR DASHBOARD
  // ===========================================================================
  if (currentRole === 'Registrar') {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="Office of the University Registrar"
          subtitle="Admissions conversion, student matriculation, and credential releases"
          badge={<Badge variant="purple">Registrar Center</Badge>}
          actions={
            <Button variant="primary" size="sm" icon={FileText} onClick={() => navigate('/registrar')}>
              Release Documents
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Applicant Inquiries"
            value={counters.pendingApplicants ?? 5}
            icon={Users}
            gradient="from-navy-800 to-navy-700"
            iconColor="text-navy-600"
            iconBg="bg-navy-50 dark:bg-navy-950/50"
          />
          <StatCard
            title="Enrollments to Confirm"
            value={counters.pendingEnrollments ?? 12}
            icon={GraduationCap}
            gradient="from-emerald-500 to-teal-600"
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          />
          <StatCard
            title="Document Requests (TOR)"
            value={counters.documentRequests ?? 8}
            icon={FileText}
            gradient="from-amber-500 to-orange-600"
            iconColor="text-amber-500"
            iconBg="bg-amber-50 dark:bg-amber-950/50"
          />
          <StatCard
            title="Graduation Candidates"
            value={counters.graduationCandidates ?? 44}
            icon={Award}
            gradient="from-navy-700 to-navy-800"
            iconColor="text-navy-600"
            iconBg="bg-navy-800 dark:bg-navy-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Admissions & Matriculation</h4>
            <p className="text-xs text-slate-400">Review entrance examination qualifiers and convert to students with auto-generated ID numbers.</p>
            <Button size="sm" variant="primary" onClick={() => navigate('/admissions')}>Admissions Pipeline â†’</Button>
          </GlassCard>
          <GlassCard className="p-6 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Official Credential Issuance</h4>
            <p className="text-xs text-slate-400">Print certified Transcript of Records (TOR), Certificates of Good Moral, and Honorable Dismissal.</p>
            <Button size="sm" variant="secondary" onClick={() => navigate('/registrar')}>Document Processing â†’</Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 5. PARENT / GUARDIAN DASHBOARD
  // ===========================================================================
  if (currentRole === 'Parent/Guardian') {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title={`Ward Academic Oversight Portal`}
          subtitle={`Monitoring learner performance and university attendance records`}
          badge={<Badge variant="purple">Parent Portal</Badge>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <StatCard
            title="Ward Name"
            value={counters.childName || 'Keno Reyes'}
            icon={Users}
            gradient="from-navy-800 to-navy-700"
            iconColor="text-navy-600"
            iconBg="bg-navy-50 dark:bg-navy-950/50"
          />
          <StatCard
            title="Current GPA"
            value={counters.childGpa || '1.25'}
            icon={Award}
            gradient="from-amber-500 to-amber-600"
            iconColor="text-amber-500"
            iconBg="bg-amber-50 dark:bg-amber-950/50"
          />
          <StatCard
            title="Campus Attendance"
            value={counters.childAttendance || '96%'}
            icon={UserCheck}
            gradient="from-emerald-500 to-teal-600"
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          />
          <StatCard
            title="Outstanding Tuition"
            value={counters.outstandingTuition ? `PHP ${Number(counters.outstandingTuition).toLocaleString()}` : 'PHP 0.00'}
            icon={PesoSign}
            gradient="from-navy-800 to-navy-700"
            iconColor="text-teal-500"
            iconBg="bg-teal-50 dark:bg-teal-950/50"
          />
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 6. DEFAULT: SUPER ADMINISTRATOR EXECUTIVE COMMAND
  // ===========================================================================
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`Welcome back, ${user?.first_name || user?.username}!`}
        subtitle={`System role: ${currentRole} â€¢ ${data?.academic_year ?? 'AY 2026-2027'} (${data?.semester ?? '1st Semester'})`}
        badge={<Badge variant="purple">{currentRole}</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={GraduationCap}
              onClick={() => navigate('/students')}
            >
              Student Portal
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Calendar}
              onClick={() => navigate('/schedules')}
            >
              Class Timetable
            </Button>
          </div>
        }
      />

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">Dashboard data could not be loaded</p>
            <p className="text-xs opacity-75">{error}</p>
          </div>
          <button onClick={fetchStats} className="text-xs font-bold underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={counters.totalStudents ?? 0}
          icon={Users}
          gradient="from-navy-800 to-navy-700"
          iconColor="text-navy-700 dark:text-navy-400"
          iconBg="bg-navy-50 dark:bg-navy-950/50"
        />
        <StatCard
          title="Enrolled This Term"
          value={counters.enrolledStudents ?? 0}
          icon={GraduationCap}
          gradient="from-emerald-500 to-teal-600"
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          title="Total Collections"
          value={`PHP ${Number(counters.totalRevenue || 0).toLocaleString()}`}
          icon={PesoSign}
          gradient="from-navy-800 to-navy-700"
          iconColor="text-navy-400 dark:text-navy-400"
          iconBg="bg-navy-800 dark:bg-navy-800"
        />
        <StatCard
          title="Faculty Members"
          value={counters.totalFaculty ?? 0}
          icon={Briefcase}
          gradient="from-amber-500 to-orange-600"
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/50"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Institutional Revenue & Collection Trajectory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly actual payments recorded vs financial targets (in PHP)
              </p>
            </div>
            <Badge variant="success">Active Fiscal Year</Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueTrend || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `PHP ${val / 1000}k`} />
                <Tooltip
                  formatter={(value) => [`PHP ${Number(value).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="collected" fill="#132E72" radius={[6, 6, 0, 0]} name="Actual Collections" />
                <Bar dataKey="target" fill="#cbd5e1" radius={[6, 6, 0, 0]} opacity={0.4} name="Target Budget" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enrollment by Degree Program
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Active student distribution per college
            </p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.programEnrollments || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {(charts.programEnrollments || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {(charts.programEnrollments || []).map((prog, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="font-semibold">{prog.name}</span>
                <span className="text-slate-400">({prog.value})</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};






