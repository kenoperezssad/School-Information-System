// src/pages/ReportsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Tabs } from '../components/common/Tabs';
import { GlassCard } from '../components/common/GlassCard';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Download,
  Printer,
  Award,
  Users,
  GraduationCap,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ReportsPage = () => {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('masterlist');
  const [masterList, setMasterList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Palette for charts
  const PIE_COLORS = ['#132E72', '#10b981', '#f59e0b', '#a3534a', '#c0847e'];

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await api.get('/reports/masterlist');
        if (res.success && res.data) setMasterList(res.data);
      } catch (err) {
        showToast(err.message || 'Failed to fetch reports', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [showToast]);

  // 1. Metric Calculations for 4 Summary Stat Cards
  const stats = useMemo(() => {
    const total = masterList.length;
    if (total === 0) {
      return {
        totalStudents: 0,
        passingRate: '0.0%',
        passingCount: 0,
        averageGpa: '0.00',
        honorsCount: 0,
      };
    }

    let gpaSum = 0;
    let gpaValidCount = 0;
    let passingCount = 0;
    let honorsCount = 0;

    masterList.forEach((item) => {
      const g = parseFloat(item.gpa);
      if (!isNaN(g) && g > 0) {
        gpaSum += g;
        gpaValidCount++;
        if (g <= 3.0) passingCount++;
        if (g <= 1.5) honorsCount++;
      }
    });

    const passingRate = ((passingCount / total) * 100).toFixed(1) + '%';
    const averageGpa = gpaValidCount > 0 ? (gpaSum / gpaValidCount).toFixed(2) : '0.00';

    return {
      totalStudents: total,
      passingRate,
      passingCount,
      averageGpa,
      honorsCount,
    };
  }, [masterList]);

  // 2. GPA Distribution Bar Chart Data
  const gpaBuckets = useMemo(() => {
    const buckets = [
      { range: '1.0-1.5', count: 0, label: 'Highest Honors (1.0 - 1.5)' },
      { range: '1.6-2.0', count: 0, label: 'Honors (1.6 - 2.0)' },
      { range: '2.1-2.5', count: 0, label: 'Good Standing (2.1 - 2.5)' },
      { range: '2.6-3.0', count: 0, label: 'Satisfactory (2.6 - 3.0)' },
      { range: '3.1+', count: 0, label: 'At Risk / Failed (3.1+)' },
    ];

    masterList.forEach((item) => {
      const g = parseFloat(item.gpa);
      if (isNaN(g) || g <= 0) return;
      if (g <= 1.5) buckets[0].count++;
      else if (g <= 2.0) buckets[1].count++;
      else if (g <= 2.5) buckets[2].count++;
      else if (g <= 3.0) buckets[3].count++;
      else buckets[4].count++;
    });

    return buckets;
  }, [masterList]);

  // 3. Program Distribution Pie Chart Data
  const programData = useMemo(() => {
    const counts = {};
    masterList.forEach((item) => {
      const prog = item.program_code || 'Other';
      counts[prog] = (counts[prog] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [masterList]);

  // 7. Gender Distribution Data
  const genderStats = useMemo(() => {
    const total = masterList.length;
    const male = masterList.filter((s) => (s.gender || '').toLowerCase() === 'male').length;
    const female = masterList.filter((s) => (s.gender || '').toLowerCase() === 'female').length;
    const malePct = total > 0 ? Math.round((male / total) * 100) : 0;
    const femalePct = total > 0 ? Math.round((female / total) * 100) : 0;

    return { male, female, malePct, femalePct, total };
  }, [masterList]);

  // 5. Dean's List (students with gpa <= 1.75)
  const deansList = useMemo(() => {
    return masterList
      .filter((s) => {
        const g = parseFloat(s.gpa);
        return !isNaN(g) && g > 0 && g <= 1.75;
      })
      .sort((a, b) => parseFloat(a.gpa) - parseFloat(b.gpa));
  }, [masterList]);

  // 4. Export table data to CSV format
  const handleExportCSV = () => {
    const isDeans = activeTab === 'deanslist' || activeTab === 'rankings';
    const dataToExport = isDeans ? deansList : masterList;
    if (dataToExport.length === 0) {
      showToast('No records available to export', 'warning');
      return;
    }

    const headers = [
      'Student Number',
      'Last Name',
      'First Name',
      'Gender',
      'Degree Program',
      'Year Level',
      'Status',
      'GPA',
      ...(isDeans ? ['Honor Distinction'] : [])
    ];

    const escapeCsv = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = dataToExport.map((item) => {
      const g = parseFloat(item.gpa);
      const row = [
        escapeCsv(item.student_number),
        escapeCsv(item.last_name),
        escapeCsv(item.first_name),
        escapeCsv(item.gender),
        escapeCsv(item.program_code),
        escapeCsv(item.year_level),
        escapeCsv(item.status),
        escapeCsv(item.gpa),
      ];
      if (isDeans) {
        row.push(escapeCsv(g <= 1.5 ? "President's List (Highest Honors)" : "Dean's List (High Honors)"));
      }
      return row.join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ApexSIS_${isDeans ? 'Deans_List' : 'Master_Report'}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${isDeans ? "Dean's List" : 'Report'} CSV exported successfully!`, 'success');
  };

  // 6. Master list columns with color-coded GPA column
  const masterColumns = [
    {
      header: 'Student Number',
      accessor: 'student_number',
      render: (row) => <span className="font-mono font-bold text-navy-700 dark:text-navy-400">{row.student_number}</span>,
    },
    {
      header: 'Student Name',
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.last_name}, {row.first_name}
        </span>
      ),
    },
    {
      header: 'Gender',
      accessor: 'gender',
    },
    {
      header: 'Program',
      accessor: 'program_code',
      render: (row) => <Badge variant="purple">{row.program_code}</Badge>,
    },
    {
      header: 'Year Level',
      accessor: 'year_level',
    },
    {
      header: 'GPA',
      accessor: 'gpa',
      render: (row) => {
        const g = parseFloat(row.gpa);
        if (isNaN(g)) {
          return <span className="font-medium text-slate-500">{row.gpa ?? 'N/A'}</span>;
        }
        if (g <= 1.5) {
          return (
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-extrabold">{row.gpa}</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                Highest Honors
              </span>
            </div>
          );
        }
        if (g <= 1.75) {
          return (
            <div className="flex items-center gap-1.5">
              <span className="text-navy-700 font-bold">{row.gpa}</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-navy-50 dark:bg-navy-950/50 text-navy-700 dark:text-navy-400 border border-navy-200 dark:border-navy-700">
                High Honors
              </span>
            </div>
          );
        }
        if (g <= 2.0) {
          return (
            <div className="flex items-center gap-1.5">
              <span className="text-navy-700 font-bold">{row.gpa}</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-navy-50 dark:bg-navy-950/50 text-navy-700 dark:text-navy-400 border border-navy-200 dark:border-navy-700">
                Honors
              </span>
            </div>
          );
        }
        if (g > 3.0) {
          return (
            <div className="flex items-center gap-1.5">
              <span className="text-rose-600 font-semibold">{row.gpa}</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                Failed/At Risk
              </span>
            </div>
          );
        }
        return <span className="text-slate-700 dark:text-slate-300 font-medium">{row.gpa}</span>;
      },
    },
    {
      header: 'Matriculation Status',
      render: (row) => <Badge variant={row.status === 'Regular' ? 'success' : 'warning'}>{row.status}</Badge>,
    },
  ];

  // 5. Dean's List columns with gold Award badges
  const deansListColumns = [
    {
      header: 'Honor Roll',
      render: (_, index) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
          #{index + 1}
        </span>
      ),
    },
    {
      header: 'Student Number',
      accessor: 'student_number',
      render: (row) => <span className="font-mono font-bold text-navy-700 dark:text-navy-400">{row.student_number}</span>,
    },
    {
      header: 'Student Name',
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.last_name}, {row.first_name}
        </span>
      ),
    },
    {
      header: 'Gender',
      accessor: 'gender',
    },
    {
      header: 'Program',
      accessor: 'program_code',
      render: (row) => <Badge variant="purple">{row.program_code}</Badge>,
    },
    {
      header: 'Year Level',
      accessor: 'year_level',
    },
    {
      header: 'GPA',
      accessor: 'gpa',
      render: (row) => {
        const g = parseFloat(row.gpa);
        return (
          <span className={g <= 1.5 ? 'text-emerald-600 font-extrabold' : 'text-navy-700 font-bold'}>
            {row.gpa}
          </span>
        );
      },
    },
    {
      header: 'Honor Distinction',
      render: (row) => {
        const g = parseFloat(row.gpa);
        const isHighest = g <= 1.5;
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 shadow-sm">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-400 dark:fill-amber-500" />
            {isHighest ? "President's List (Highest Honors)" : "Dean's List (High Honors)"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Reports & Analytical Exports"
        subtitle="Master demographic rosters, class standings, retention rates, and institutional auditing data"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Report
            </Button>
            <Button
              variant="primary"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* 1. Four Summary Stat Cards at the top (using GlassCard, not StatCard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Students */}
        <GlassCard className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Students
            </p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats.totalStudents}
            </p>
            <p className="text-[11px] text-slate-400">Enrolled institutional master list</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-navy-50 dark:bg-navy-950/50 flex items-center justify-center text-navy-700 dark:text-navy-400 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
        </GlassCard>

        {/* Passing Rate */}
        <GlassCard className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Passing Rate %
            </p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.passingRate}
            </p>
            <p className="text-[11px] text-slate-400">{stats.passingCount} students with GPA ≤ 3.0</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
        </GlassCard>

        {/* Average GPA */}
        <GlassCard className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Average GPA
            </p>
            <p className="text-3xl font-extrabold text-navy-700 dark:text-navy-400 tracking-tight">
              {stats.averageGpa}
            </p>
            <p className="text-[11px] text-slate-400">Institutional grade mean</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-navy-50 dark:bg-navy-950/50 flex items-center justify-center text-navy-700 dark:text-navy-400 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
        </GlassCard>

        {/* Honors Students */}
        <GlassCard className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Honors Students
            </p>
            <p className="text-3xl font-extrabold text-amber-500 dark:text-amber-400 tracking-tight">
              {stats.honorsCount}
            </p>
            <p className="text-[11px] text-slate-400">Students with GPA ≤ 1.5</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
            <Award className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* Analytics Charts Section in a 2-column grid on lg screens (using GlassCard containers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. GPA Distribution Bar Chart */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-navy-600" />
                  GPA Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Student distribution across academic performance brackets
                </p>
              </div>
              <Badge variant="purple">Grading Curve</Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gpaBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(val) => [`${val} Students`, 'Count']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Students" fill="#132E72" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            {gpaBuckets.map((b) => (
              <div key={b.range} className="px-1">
                <p className="text-[10px] text-slate-400 font-mono">{b.range}</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{b.count}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 3. Program Distribution Pie Chart */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-navy-600" />
                  Program Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enrollment breakdown across degree programs
                </p>
              </div>
              <Badge variant="info">Programs</Badge>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {programData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} Students`, name]}
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
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {programData.map((prog, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="font-semibold">{prog.name}</span>
                <span className="text-slate-400">({prog.value})</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 7. Gender Distribution Mini Chart */}
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-navy-600" />
                Gender Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Demographic gender proportion of enrolled student population
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-navy-700 dark:text-navy-400">
                <span className="w-2.5 h-2.5 rounded-full bg-navy-700" />
                Male: {genderStats.male} ({genderStats.malePct}%)
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Female: {genderStats.female} ({genderStats.femalePct}%)
              </span>
            </div>
          </div>

          {/* Simple horizontal bars with percentage, no recharts needed */}
          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-navy-700" />
                  Male Students
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {genderStats.male} students ({genderStats.malePct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-navy-700 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${genderStats.malePct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Female Students
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {genderStats.female} students ({genderStats.femalePct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${genderStats.femalePct}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 5. Tabs: Student Master List and Dean's List */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'masterlist', label: 'Student Master List', icon: Users, count: masterList.length },
          { id: 'deanslist', label: "Dean's List", icon: Award, count: deansList.length },
        ]}
      />

      {activeTab === 'masterlist' ? (
        <DataTable
          columns={masterColumns}
          data={masterList}
          loading={loading}
          searchPlaceholder="Search master list by student number, name, or program..."
        />
      ) : (
        <DataTable
          columns={deansListColumns}
          data={deansList}
          loading={loading}
          searchPlaceholder="Search Dean's List honor roll..."
        />
      )}
    </div>
  );
};




