// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
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
  DollarSign,
  TrendingUp,
  UserCheck,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertCircle
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.role]);

  if (loading) {
    return <LoadingSpinner label="Loading dashboard metrics..." size="lg" />;
  }

  const counters = data?.counters || {};
  const charts = data?.charts || {};
  const currentRole = user?.role || 'Super Administrator';

  // Palette for charts
  const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`Welcome back, ${user?.first_name || user?.username}!`}
        subtitle={`System role: ${currentRole} • Academic Year 2026-2027 (1st Semester)`}
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

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={counters.totalStudents ?? 0}
          icon={Users}
          trend="+12.5%"
          trendLabel="vs last semester"
          gradient="from-indigo-500 to-indigo-600"
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950/50"
        />
        <StatCard
          title="Enrolled This Term"
          value={counters.enrolledStudents ?? 0}
          icon={GraduationCap}
          trend="+8.2%"
          trendLabel="regular load"
          gradient="from-emerald-500 to-teal-600"
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/50"
        />
        <StatCard
          title="Total Collections"
          value={`₱${Number(counters.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          trend="+15.3%"
          trendLabel="tuition & lab"
          gradient="from-cyan-500 to-blue-600"
          iconColor="text-cyan-600 dark:text-cyan-400"
          iconBg="bg-cyan-50 dark:bg-cyan-950/50"
        />
        <StatCard
          title="Faculty Members"
          value={counters.totalFaculty ?? 0}
          icon={Briefcase}
          trend="100%"
          trendLabel="teaching capacity"
          gradient="from-amber-500 to-orange-600"
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/50"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Collection Trend Chart */}
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
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `₱${val / 1000}k`} />
                <Tooltip
                  formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="collected" fill="#6366f1" radius={[6, 6, 0, 0]} name="Actual Collections" />
                <Bar dataKey="target" fill="#cbd5e1" radius={[6, 6, 0, 0]} opacity={0.4} name="Target Budget" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Student Enrollment Distribution Pie Chart */}
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

      {/* Operations Quick Shortcuts & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Cards */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Frequent Actions</span>
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/admissions')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Review Applicant Queue</p>
                  <p className="text-[10px] text-slate-400">Manage entrance test results</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/attendance')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Launch QR Scanner</p>
                  <p className="text-[10px] text-slate-400">Mark student & faculty taps</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/finance')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Cashier & Payment Drawer</p>
                  <p className="text-[10px] text-slate-400">Issue official receipts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/clearance')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Digital Clearance Matrix</p>
                  <p className="text-[10px] text-slate-400">Sign off departmental holds</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </GlassCard>

        {/* Live System Activity Feed */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Real-Time Institutional Audit Trail</span>
            </h3>
            <button
              onClick={() => navigate('/audit')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View Full Logs →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {(data?.recentLogs || []).slice(0, 5).map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {log.user_name ? log.user_name[0] : 'S'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {log.user_name} <span className="font-normal text-slate-500">performed</span> {log.action}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Module: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{log.module}</span> • {log.new_values ? String(log.new_values).substring(0, 60) : 'Operation recorded'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
