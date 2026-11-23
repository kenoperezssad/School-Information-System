// src/pages/GradingPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { GlassCard } from '../components/common/GlassCard';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Edit,
  CheckCircle,
  FileCheck,
  TrendingUp,
  Percent,
  Sliders,
  Calculator,
  Printer,
  CheckCheck,
  Trophy,
  Sparkles,
  RotateCcw,
  GraduationCap,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';

// CHED & DepEd Academic Transmutation & Honors Descriptor Helper
export const getGradeScaleDetails = (score) => {
  const num = Math.round(Number(score) * 10) / 10;
  if (num >= 97) {
    return {
      point: '1.00',
      letter: 'A+',
      assessment: 'Outstanding',
      honor: 'Summa Cum Laude Eligible',
      badgeVariant: 'primary',
      colorClass: 'text-navy-700 dark:text-navy-700',
      bgClass: 'bg-navy-800 dark:bg-navy-800 border-navy-200 dark:border-navy-800',
      isPassing: true,
    };
  }
  if (num >= 94) {
    return {
      point: '1.25',
      letter: 'A',
      assessment: 'Outstanding',
      honor: 'Magna Cum Laude Eligible',
      badgeVariant: 'primary',
      colorClass: 'text-navy-700 dark:text-navy-400',
      bgClass: 'bg-navy-50 dark:bg-navy-950/40 border-navy-200 dark:border-navy-700',
      isPassing: true,
    };
  }
  if (num >= 91) {
    return {
      point: '1.50',
      letter: 'A-',
      assessment: 'Outstanding',
      honor: 'Cum Laude Eligible',
      badgeVariant: 'primary',
      colorClass: 'text-navy-700 dark:text-navy-400',
      bgClass: 'bg-navy-50 dark:bg-navy-950/40 border-navy-200 dark:border-navy-700',
      isPassing: true,
    };
  }
  if (num >= 88) {
    return {
      point: '1.75',
      letter: 'B+',
      assessment: 'Very Satisfactory',
      honor: 'Dean\'s List Eligible',
      badgeVariant: 'info',
      colorClass: 'text-slate-500 dark:text-slate-500',
      bgClass: 'bg-slate-500 dark:bg-slate-500 border-navy-200 dark:border-navy-200',
      isPassing: true,
    };
  }
  if (num >= 85) {
    return {
      point: '2.00',
      letter: 'B',
      assessment: 'Very Satisfactory',
      honor: 'Regular Academic Standing',
      badgeVariant: 'success',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      isPassing: true,
    };
  }
  if (num >= 82) {
    return {
      point: '2.25',
      letter: 'B-',
      assessment: 'Satisfactory',
      honor: 'Regular Academic Standing',
      badgeVariant: 'success',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      isPassing: true,
    };
  }
  if (num >= 79) {
    return {
      point: '2.50',
      letter: 'C+',
      assessment: 'Satisfactory',
      honor: 'Regular Academic Standing',
      badgeVariant: 'warning',
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      isPassing: true,
    };
  }
  if (num >= 76) {
    return {
      point: '2.75',
      letter: 'C',
      assessment: 'Fairly Satisfactory',
      honor: 'Regular Academic Standing',
      badgeVariant: 'warning',
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      isPassing: true,
    };
  }
  if (num >= 75) {
    return {
      point: '3.00',
      letter: 'C-',
      assessment: 'Passed',
      honor: 'Regular Academic Standing',
      badgeVariant: 'warning',
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      isPassing: true,
    };
  }
  return {
    point: '5.00',
    letter: 'F',
    assessment: 'Did Not Meet Expectations',
    honor: 'Academic Warning / Ineligible',
    badgeVariant: 'danger',
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    isPassing: false,
  };
};

export const GradingPage = () => {
  const { user, showToast } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'passing' | 'deans_list' | 'pending'

  // Confetti helper
  const triggerConfetti = () => {
    try {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.warn('Confetti trigger skipped:', err);
    }
  };

  // Edit Grade Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [form, setForm] = useState({
    written_works: 90,
    performance_tasks: 90,
    quarterly_exam: 90,
    status: 'Submitted',
  });
  const [submitting, setSubmitting] = useState(false);

  // Grade Simulator Modal State
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simForm, setSimForm] = useState({
    written_works: 85,
    performance_tasks: 88,
    quarterly_exam: 82,
  });

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await api.get('/grades');
      if (res.success && res.data) setGrades(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleOpenEdit = (grade) => {
    setSelectedGrade(grade);
    setForm({
      written_works: Number(grade.written_works) || 0,
      performance_tasks: Number(grade.performance_tasks) || 0,
      quarterly_exam: Number(grade.quarterly_exam) || 0,
      status: grade.status || 'Submitted',
    });
    setEditModalOpen(true);
  };

  // Real-time computed score for Encode Modal (Written 30%, Performance 50%, Exam 20%)
  const computedScore = Math.round(
    (Number(form.written_works || 0) * 0.3) +
    (Number(form.performance_tasks || 0) * 0.5) +
    (Number(form.quarterly_exam || 0) * 0.2)
  );
  const computedDetails = getGradeScaleDetails(computedScore);

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/grades/${selectedGrade.id}`, form);
      if (res.success) {
        triggerConfetti();
        showToast(`Grade updated: ${res.data.final_grade}% (${res.data.remarks})`, 'success');
        setEditModalOpen(false);
        fetchGrades();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Dean's Endorsement Handler
  const handleBulkEndorsement = async () => {
    const pending = grades.filter(g => g.status === 'Draft' || g.status === 'Submitted');
    if (pending.length === 0) {
      showToast('All student grades have already been approved and finalized!', 'info');
      return;
    }

    const confirmed = window.confirm(
      `Dean Endorsement Confirmation:\n\nAre you sure you want to endorse and approve all ${pending.length} pending grade sheets? This officially records Registrar sign-off.`
    );
    if (!confirmed) return;

    setBulkLoading(true);
    try {
      const updatePromises = pending.map(g =>
        api.put(`/grades/${g.id}`, {
          written_works: Number(g.written_works),
          performance_tasks: Number(g.performance_tasks),
          quarterly_exam: Number(g.quarterly_exam),
          status: 'Approved',
        })
      );
      await Promise.all(updatePromises);
      triggerConfetti();
      showToast(`Successfully endorsed and approved ${pending.length} grade sheets!`, 'success');
      await fetchGrades();
    } catch (err) {
      showToast(err.message || 'Error occurred during bulk endorsement', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  // Grade Simulator computations
  const simScore = Math.round(
    ((Number(simForm.written_works || 0) * 0.3) +
    (Number(simForm.performance_tasks || 0) * 0.5) +
    (Number(simForm.quarterly_exam || 0) * 0.2)) * 10
  ) / 10;
  const simDetails = getGradeScaleDetails(simScore);

  // Presets for quick simulator exploration
  const applySimPreset = (ww, pt, qe) => {
    setSimForm({
      written_works: ww,
      performance_tasks: pt,
      quarterly_exam: qe,
    });
  };

  // KPI Calculations
  const totalRecords = grades.length;
  const classAverage = totalRecords > 0
    ? (grades.reduce((acc, curr) => acc + (parseFloat(curr.final_grade) || 0), 0) / totalRecords).toFixed(1)
    : '0.0';

  const passingList = useMemo(() => {
    return grades.filter(g => (parseFloat(g.final_grade) || 0) >= 75);
  }, [grades]);
  const passingRate = totalRecords > 0
    ? ((passingList.length / totalRecords) * 100).toFixed(1)
    : '0.0';

  const deansList = useMemo(() => {
    return grades.filter(g => (parseFloat(g.final_grade) || 0) >= 92);
  }, [grades]);

  const pendingList = useMemo(() => {
    return grades.filter(g => g.status === 'Draft' || g.status === 'Submitted');
  }, [grades]);

  // Filtered grades based on KPI interaction
  const filteredGrades = useMemo(() => {
    if (activeFilter === 'passing') return passingList;
    if (activeFilter === 'deans_list') return deansList;
    if (activeFilter === 'pending') return pendingList;
    return grades;
  }, [grades, activeFilter, passingList, deansList, pendingList]);

  const isStudent = user?.role === 'Student';
  const isParent = user?.role === 'Parent/Guardian';
  const isStaff = !isStudent && !isParent;

  const columns = useMemo(() => {
    const cols = [];
    if (isStaff) {
      cols.push({
        header: 'Student',
        render: (row) => (
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{row.last_name}, {row.first_name}</p>
            <p className="text-[11px] font-mono text-slate-400">{row.student_number}</p>
          </div>
        ),
      });
    }

    cols.push(
      {
        header: 'Subject Course',
        render: (row) => (
          <div>
            <span className="font-mono font-bold text-navy-700 dark:text-navy-400">{row.subject_code}</span>
            <span className="text-xs text-slate-400 block truncate max-w-xs">{row.subject_title}</span>
          </div>
        ),
      },
      {
        header: 'Written (30%)',
        render: (row) => (
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{row.written_works}%</span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {(row.written_works * 0.3).toFixed(1)} pts
            </span>
          </div>
        ),
      },
      {
        header: 'Performance (50%)',
        render: (row) => (
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{row.performance_tasks}%</span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {(row.performance_tasks * 0.5).toFixed(1)} pts
            </span>
          </div>
        ),
      },
      {
        header: 'Exam (20%)',
        render: (row) => (
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{row.quarterly_exam}%</span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {(row.quarterly_exam * 0.2).toFixed(1)} pts
            </span>
          </div>
        ),
      },
      {
        header: 'Final Grade',
        render: (row) => {
          const details = getGradeScaleDetails(row.final_grade);
          return (
            <div>
              <span className="font-extrabold text-base text-navy-700 dark:text-navy-400">
                {row.final_grade}%
              </span>
              <span className="text-[11px] font-mono text-slate-400 block">
                Equiv: {details.point} ({details.letter})
              </span>
            </div>
          );
        },
      },
      {
        header: 'Remarks & Honors',
        render: (row) => {
          const isPass = row.remarks === 'Passed';
          const isDeans = parseFloat(row.final_grade) >= 92;
          return (
            <div className="space-y-1">
              <Badge variant={isPass ? 'success' : 'danger'}>
                {row.remarks}
              </Badge>
              {isDeans && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Dean's List</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: 'Status',
        render: (row) => (
          <Badge
            variant={
              row.status === 'Approved'
                ? 'success'
                : row.status === 'Submitted'
                ? 'purple'
                : 'default'
            }
          >
            {row.status}
          </Badge>
        ),
      }
    );

    if (isStaff) {
      cols.push({
        header: 'Actions',
        className: 'text-right print:hidden',
        render: (row) => (
          <Button
            size="sm"
            variant="glass"
            icon={Edit}
            onClick={() => handleOpenEdit(row)}
          >
            Encode
          </Button>
        ),
      });
    }

    return cols;
  }, [isStaff]);

  return (
    <div className="space-y-6">
      {/* Official Print Header (Visible only on print preview / paper export) */}
      <div className="hidden print:block pb-5 mb-5 border-b border-slate-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              APEXSIS INSTITUTION OF ACADEMIC EXCELLENCE
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Office of the University Registrar â€¢ Official Grading & Transmutation Master Sheet
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              DepEd/CHED Standard Percentage Weights (Written 30%, Performance 50%, Periodical Exam 20%)
            </p>
          </div>
          <div className="text-right text-xs text-slate-700">
            <p className="font-bold">Date Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Class Average: <span className="font-bold text-slate-900">{classAverage}%</span></p>
            <p>Overall Passing Rate: <span className="font-bold text-slate-900">{passingRate}%</span></p>
          </div>
        </div>
      </div>

      {/* Screen Page Header with Actions */}
      <div className="print:hidden">
        <PageHeader
          title={isStudent ? "My Academic Performance & Grades" : isParent ? "Ward Academic Performance & Report Card" : "Grading & Academic Records Encoding"}
          subtitle={
            isStudent
              ? "Official semestral grade components, transmuted points (DepEd/CHED 1.00-5.00), and academic standing"
              : isParent
              ? "Ward official quarterly grade components, transmuted points, and term evaluation remarks"
              : "Configurable percentage component grading (Written 30%, Performance 50%, Exam 20%), live GPA calculation, and Registrar sign-off"
          }
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="glass"
                icon={Sliders}
                onClick={() => setSimulatorOpen(true)}
              >
                Open Grade Simulator
              </Button>
              {isStaff && (
                <Button
                  variant="primary"
                  icon={CheckCheck}
                  loading={bulkLoading}
                  onClick={handleBulkEndorsement}
                >
                  Bulk Dean's Endorsement {pendingList.length > 0 && `(${pendingList.length})`}
                </Button>
              )}
              <Button
                variant="secondary"
                icon={Printer}
                onClick={() => window.print()}
              >
                Grade Sheet Print / Export
              </Button>
            </div>
          }
        />
      </div>

      {/* 4 Interactive KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {isStudent ? (
          <>
            <GlassCard className="p-5 border border-navy-100 dark:border-navy-700 bg-navy-50/20 dark:bg-navy-950/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                My General Average (GPA)
              </p>
              <h3 className="text-2xl font-extrabold text-navy-700 dark:text-navy-400 mt-1.5 tracking-tight">
                {classAverage ? (classAverage >= 90 ? '1.25' : '1.75') : '1.25'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Point Scale: 1.00 - 5.00</p>
            </GlassCard>
            <GlassCard className="p-5 border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Passed Subjects
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5 tracking-tight">
                {passingList.length} of {totalRecords}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">100% Course Clearance</p>
            </GlassCard>
            <GlassCard className="p-5 border border-amber-100 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Dean's List Qualification
              </p>
              <h3 className="text-2xl font-extrabold text-amber-500 mt-1.5 tracking-tight">
                First Honors
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">{deansList.length} Subjects with Grade â‰¥ 92%</p>
            </GlassCard>
            <GlassCard className="p-5 border border-navy-200 dark:border-navy-700 bg-navy-50/30 dark:bg-navy-950/30">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Term Academic Status
              </p>
              <h3 className="text-2xl font-extrabold text-navy-700 dark:text-navy-400 mt-1.5 tracking-tight">
                Regular Enrolled
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">{totalRecords} Enrolled Courses</p>
            </GlassCard>
          </>
        ) : (
        <>
        {/* 1. Class Average Card */}
        <GlassCard
          hover
          onClick={() => setActiveFilter('all')}
          className={`p-5 relative overflow-hidden transition-all duration-300 border ${
            activeFilter === 'all'
              ? 'ring-2 ring-navy-700 shadow-md bg-navy-50/20 dark:bg-navy-950/20'
              : 'hover:border-navy-700 dark:hover:border-navy-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Class Average
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                {classAverage}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-navy-50 dark:bg-navy-950/50 text-navy-700 dark:text-navy-400 shadow-inner group-hover:scale-110 transition-transform">
              <Percent className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="font-medium">Across {totalRecords} student grades</span>
            <span className="font-bold text-navy-700 dark:text-navy-400 hover:underline">
              {activeFilter === 'all' ? 'â— Showing All' : 'Show All'}
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-navy-800 to-navy-700 opacity-5 dark:opacity-10 rounded-full blur-xl pointer-events-none" />
        </GlassCard>

        {/* 2. Passing Rate Card */}
        <GlassCard
          hover
          onClick={() => setActiveFilter(activeFilter === 'passing' ? 'all' : 'passing')}
          className={`p-5 relative overflow-hidden transition-all duration-300 border ${
            activeFilter === 'passing'
              ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-50/20 dark:bg-emerald-950/20'
              : 'hover:border-emerald-300 dark:hover:border-emerald-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Passing Rate
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5 tracking-tight">
                {passingRate}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="font-medium">{passingList.length} of {totalRecords} passing</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              {activeFilter === 'passing' ? 'â— Active Filter' : 'Filter Passing'}
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-5 dark:opacity-10 rounded-full blur-xl pointer-events-none" />
        </GlassCard>

        {/* 3. Dean's List Contenders Card (Gold Trophy) */}
        <GlassCard
          hover
          onClick={() => setActiveFilter(activeFilter === 'deans_list' ? 'all' : 'deans_list')}
          className={`p-5 relative overflow-hidden transition-all duration-300 border ${
            activeFilter === 'deans_list'
              ? 'ring-2 ring-amber-500 shadow-md bg-amber-50/20 dark:bg-amber-950/20'
              : 'hover:border-amber-300 dark:hover:border-amber-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Dean's List Contenders
              </p>
              <h3 className="text-2xl font-extrabold text-amber-500 dark:text-amber-400 mt-1.5 tracking-tight flex items-center gap-1.5">
                {deansList.length}
                <span className="text-xs font-normal text-slate-400">students</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/50 text-amber-500 shadow-inner group-hover:scale-110 transition-transform border border-amber-200/40 dark:border-amber-800/40">
              <Trophy className="w-6 h-6 text-amber-500 fill-amber-400/20" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="font-medium">Grade â‰¥ 92.0% (Honors)</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 hover:underline">
              {activeFilter === 'deans_list' ? 'â— Active Filter' : 'Filter Contenders'}
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-600 opacity-5 dark:opacity-10 rounded-full blur-xl pointer-events-none" />
        </GlassCard>

        {/* 4. Pending Endorsements Card */}
        <GlassCard
          hover
          onClick={() => setActiveFilter(activeFilter === 'pending' ? 'all' : 'pending')}
          className={`p-5 relative overflow-hidden transition-all duration-300 border ${
            activeFilter === 'pending'
              ? 'ring-2 ring-navy-500 shadow-md bg-navy-800 dark:bg-navy-800'
              : 'hover:border-navy-300 dark:hover:border-navy-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pending Endorsements
              </p>
              <h3 className="text-2xl font-extrabold text-navy-700 dark:text-navy-400 mt-1.5 tracking-tight">
                {pendingList.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-navy-800 dark:bg-navy-800 text-navy-700 dark:text-navy-700 shadow-inner group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="font-medium">Draft or Submitted status</span>
            <span className="font-bold text-navy-700 dark:text-navy-700 hover:underline">
              {activeFilter === 'pending' ? 'â— Active Filter' : 'Filter Pending'}
            </span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-navy-800 to-navy-700 opacity-5 dark:opacity-10 rounded-full blur-xl pointer-events-none" />
        </GlassCard>
        </>
        )}
      </div>

      {/* Active Filter Pill indicator if filtered */}
      {activeFilter !== 'all' && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-navy-50 dark:bg-navy-950/30 border border-navy-200 dark:border-navy-700 text-xs font-medium print:hidden">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-navy-700 dark:text-navy-400" />
            <span className="text-slate-700 dark:text-slate-300">
              Active Table Filter: <strong className="text-navy-700 dark:text-navy-400 capitalize">
                {activeFilter === 'deans_list' ? "Dean's List Contenders (Grade â‰¥ 92%)" : activeFilter === 'passing' ? "Passing Students (Grade â‰¥ 75%)" : "Pending Sign-off (Draft & Submitted)"}
              </strong> ({filteredGrades.length} records)
            </span>
          </div>
          <button
            onClick={() => setActiveFilter('all')}
            className="text-xs font-bold text-navy-700 hover:text-navy-700 dark:text-navy-400 hover:underline"
          >
            Clear Filter (Show All {totalRecords})
          </button>
        </div>
      )}

      {/* Main Grade Records Table */}
      <DataTable
        columns={columns}
        data={filteredGrades}
        loading={loading}
        searchPlaceholder="Search grades by student name, student number, or subject..."
      />

      {/* Official Print Sign-off Footer */}
      <div className="hidden print:grid grid-cols-3 gap-8 pt-10 mt-10 border-t border-slate-300 text-center text-xs">
        <div>
          <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-800">Faculty In-Charge</div>
          <p className="text-slate-500">Instructor Signature & Date</p>
        </div>
        <div>
          <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-800">Department Chairperson</div>
          <p className="text-slate-500">Academic Department Review</p>
        </div>
        <div>
          <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-800">Dean of Academic Affairs / Registrar</div>
          <p className="text-slate-500">Official Institutional Sign-Off</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE GRADE SIMULATOR MODAL                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        title="Interactive Grade & Latin Honors Simulator"
        subtitle="Simulate weighted components, live university transmutation, DepEd/CHED assessment, and academic honors"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6">
          {/* Quick Scenario Preset Pills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Simulation Scenarios
              </span>
              <button
                onClick={() => applySimPreset(85, 88, 82)}
                className="text-xs font-medium text-navy-700 dark:text-navy-400 flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applySimPreset(98, 97, 96)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-navy-800 text-navy-700 dark:bg-navy-800 dark:text-navy-700 border border-navy-200 dark:border-navy-800 hover:scale-105 transition-all"
              >
                ðŸ† Summa Cum Laude (97.1%)
              </button>
              <button
                type="button"
                onClick={() => applySimPreset(94, 95, 93)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-navy-50 text-navy-700 dark:bg-navy-950/40 dark:text-navy-300 border border-navy-200 dark:border-navy-700 hover:scale-105 transition-all"
              >
                â­ Magna Cum Laude (94.3%)
              </button>
              <button
                type="button"
                onClick={() => applySimPreset(91, 93, 90)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-500 text-slate-500 dark:bg-slate-500 dark:text-slate-500 border border-navy-200 dark:border-navy-200 hover:scale-105 transition-all"
              >
                ðŸŽ–ï¸ Cum Laude (91.8%)
              </button>
              <button
                type="button"
                onClick={() => applySimPreset(84, 86, 80)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:scale-105 transition-all"
              >
                ðŸ“— Solid Satisfactory (84.2%)
              </button>
              <button
                type="button"
                onClick={() => applySimPreset(74, 76, 73)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:scale-105 transition-all"
              >
                âš ï¸ Borderline / At Risk (74.8%)
              </button>
            </div>
          </div>

          {/* Interactive Sliders for the 3 Components */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-5">
            {/* 1. Written Works Slider (30%) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <label className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-navy-700" />
                  Written Works (Weight: 30%)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-navy-700 dark:text-navy-400 font-bold">
                    {(simForm.written_works * 0.3).toFixed(2)} pts
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={simForm.written_works}
                    onChange={(e) =>
                      setSimForm({
                        ...simForm,
                        written_works: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-16 px-2 py-0.5 text-center text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={simForm.written_works}
                onChange={(e) =>
                  setSimForm({ ...simForm, written_works: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-navy-800 dark:accent-navy-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (0.0 pts)</span>
                <span>Current: {simForm.written_works}%</span>
                <span>100% (30.0 pts max)</span>
              </div>
            </div>

            {/* 2. Performance Tasks Slider (50%) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <label className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-navy-700" />
                  Performance Tasks (Weight: 50%)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-navy-700 dark:text-navy-700 font-bold">
                    {(simForm.performance_tasks * 0.5).toFixed(2)} pts
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={simForm.performance_tasks}
                    onChange={(e) =>
                      setSimForm({
                        ...simForm,
                        performance_tasks: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-16 px-2 py-0.5 text-center text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={simForm.performance_tasks}
                onChange={(e) =>
                  setSimForm({ ...simForm, performance_tasks: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#132E72] dark:accent-[#1A3F8F]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (0.0 pts)</span>
                <span>Current: {simForm.performance_tasks}%</span>
                <span>100% (50.0 pts max)</span>
              </div>
            </div>

            {/* 3. Quarterly Exam Slider (20%) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <label className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Quarterly Exam (Weight: 20%)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {(simForm.quarterly_exam * 0.2).toFixed(2)} pts
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={simForm.quarterly_exam}
                    onChange={(e) =>
                      setSimForm({
                        ...simForm,
                        quarterly_exam: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-16 px-2 py-0.5 text-center text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={simForm.quarterly_exam}
                onChange={(e) =>
                  setSimForm({ ...simForm, quarterly_exam: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (0.0 pts)</span>
                <span>Current: {simForm.quarterly_exam}%</span>
                <span>100% (20.0 pts max)</span>
              </div>
            </div>
          </div>

          {/* Real-Time Animated Score Meter & Assessment Banner */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${simDetails.bgClass}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 block">
                  Simulated Final Weighted Grade
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className={`text-4xl sm:text-5xl font-black tracking-tight ${simDetails.colorClass}`}>
                    {simScore.toFixed(1)}%
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    Univ Point: <strong className="text-slate-900 dark:text-white text-base">{simDetails.point}</strong>
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    Letter: <strong className="text-slate-900 dark:text-white text-base">{simDetails.letter}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-1.5">
                <Badge variant={simDetails.badgeVariant} className="text-sm px-3.5 py-1">
                  {simDetails.assessment}
                </Badge>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-900/80 shadow-sm border border-slate-200 dark:border-slate-800">
                  <GraduationCap className="w-3.5 h-3.5 text-navy-700 dark:text-navy-400" />
                  <span>{simDetails.honor}</span>
                </div>
              </div>
            </div>

            {/* Score Progress Gauge Bar */}
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Passing Benchmark (75.0%)</span>
                <span>Dean's List Threshold (92.0%)</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    simScore >= 92
                      ? 'bg-gradient-to-r from-amber-400 via-navy-700 to-navy-700'
                      : simScore >= 75
                      ? 'bg-gradient-to-r from-emerald-400 to-navy-700'
                      : 'bg-gradient-to-r from-rose-500 to-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, simScore))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setSimulatorOpen(false)}>
              Close Simulator
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 5. ENHANCED ENCODE GRADE MODAL                                            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Encode Grades: ${selectedGrade?.last_name}, ${selectedGrade?.first_name}`}
        subtitle={`${selectedGrade?.subject_code} â€¢ ${selectedGrade?.subject_title} (${selectedGrade?.student_number})`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveGrade} className="space-y-5">
          <div className="space-y-4">
            {/* Written Works (30%) with visual slider and numeric input */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Written Works (Weight: 30%)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-navy-700 dark:text-navy-400 font-bold">
                    {(Number(form.written_works || 0) * 0.3).toFixed(2)} pts
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={form.written_works}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        written_works: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-16 px-2 py-1 text-center text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={form.written_works}
                onChange={(e) =>
                  setForm({ ...form, written_works: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-navy-800 dark:accent-navy-700"
              />
            </div>

            {/* Performance Tasks (50%) with visual slider and numeric input */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Performance Tasks (Weight: 50%)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-navy-700 dark:text-navy-400 font-bold">
                    {(Number(form.performance_tasks || 0) * 0.5).toFixed(2)} pts
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={form.performance_tasks}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        performance_tasks: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-16 px-2 py-1 text-center text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={form.performance_tasks}
                onChange={(e) =>
                  setForm({ ...form, performance_tasks: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-navy-800 dark:accent-navy-700"
              />
            </div>

            {/* Periodical Exam (20%) with visual slider and numeric input */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Periodical Exam (Weight: 20%)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-navy-700 dark:text-navy-400 font-bold">
                    {(Number(form.quarterly_exam || 0) * 0.2).toFixed(2)} pts
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={form.quarterly_exam}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quarterly_exam: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-16 px-2 py-1 text-center text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={form.quarterly_exam}
                onChange={(e) =>
                  setForm({ ...form, quarterly_exam: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-navy-800 dark:accent-navy-700"
              />
            </div>
          </div>

          {/* Live Calculated Final Score Banner with real-time pass/fail color badge and point equivalent */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
              computedScore >= 75
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50'
                : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50'
            }`}
          >
            <div>
              <span className="text-xs uppercase font-extrabold text-slate-600 dark:text-slate-300 block">
                Calculated Final Weighted Grade
              </span>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <p
                  className={`text-3xl font-black ${
                    computedScore >= 75
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {computedScore}%
                </p>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Equivalent: {computedDetails.point} ({computedDetails.letter})
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                DepEd/CHED: {computedDetails.assessment} â€¢ {computedDetails.honor}
              </span>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-xs uppercase font-bold text-slate-400">Assessment</span>
              <Badge
                variant={computedScore >= 75 ? 'success' : 'danger'}
                className="text-sm px-3.5 py-1"
              >
                {computedScore >= 75 ? 'Passed' : 'Failed'}
              </Badge>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Submission Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
            >
              <option value="Draft">Draft (Faculty Working Copy)</option>
              <option value="Submitted">Submitted (For Dean Endorsement)</option>
              <option value="Approved">Approved (Registrar Master Grade)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Commit Grade Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};






