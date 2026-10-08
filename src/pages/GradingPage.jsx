// src/pages/GradingPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Edit,
  CheckCircle,
  FileCheck,
  TrendingUp,
  Percent,
  Sliders
} from 'lucide-react';

export const GradingPage = () => {
  const { showToast } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Grade Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [form, setForm] = useState({
    written_works: 90,
    performance_tasks: 90,
    quarterly_exam: 90,
    status: 'Submitted',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await api.get('/grades');
      if (res.success) setGrades(res.data);
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
      written_works: Number(grade.written_works),
      performance_tasks: Number(grade.performance_tasks),
      quarterly_exam: Number(grade.quarterly_exam),
      status: grade.status,
    });
    setEditModalOpen(true);
  };

  // Real-time computed score
  const computedScore = Math.round(
    (Number(form.written_works) * 0.3) +
    (Number(form.performance_tasks) * 0.5) +
    (Number(form.quarterly_exam) * 0.2)
  );
  const computedRemarks = computedScore >= 75 ? 'Passed' : 'Failed';

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/grades/${selectedGrade.id}`, form);
      if (res.success) {
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

  const columns = [
    {
      header: 'Student',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.last_name}, {row.first_name}</p>
          <p className="text-[11px] font-mono text-slate-400">{row.student_number}</p>
        </div>
      ),
    },
    {
      header: 'Subject Course',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.subject_code}</span>
          <span className="text-xs text-slate-400 block">{row.subject_title}</span>
        </div>
      ),
    },
    {
      header: 'Written (30%)',
      render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-300">{row.written_works}%</span>,
    },
    {
      header: 'Performance (50%)',
      render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-300">{row.performance_tasks}%</span>,
    },
    {
      header: 'Exam (20%)',
      render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-300">{row.quarterly_exam}%</span>,
    },
    {
      header: 'Final Grade',
      render: (row) => (
        <span className="font-extrabold text-base text-indigo-600 dark:text-indigo-400">
          {row.final_grade}%
        </span>
      ),
    },
    {
      header: 'Remarks',
      render: (row) => (
        <Badge variant={row.remarks === 'Passed' ? 'success' : 'danger'}>
          {row.remarks}
        </Badge>
      ),
    },
    {
      header: 'Status',
      render: (row) => <Badge variant="purple">{row.status}</Badge>,
    },
    {
      header: 'Actions',
      className: 'text-right',
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
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grading & Academic Records Encoding"
        subtitle="Configurable percentage component grading (Written 30%, Performance 50%, Exam 20%), live GPA calculation, and Registrar sign-off"
      />

      <DataTable
        columns={columns}
        data={grades}
        loading={loading}
        searchPlaceholder="Search grades by student name, student number, or subject..."
      />

      {/* Encode Grade Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Encode Grades: ${selectedGrade?.last_name}, ${selectedGrade?.first_name}`}
        subtitle={`${selectedGrade?.subject_code} • ${selectedGrade?.subject_title}`}
      >
        <form onSubmit={handleSaveGrade} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Written Works (30%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={form.written_works}
                onChange={e => setForm({ ...form, written_works: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Performance Tasks (50%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={form.performance_tasks}
                onChange={e => setForm({ ...form, performance_tasks: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Periodical Exam (20%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={form.quarterly_exam}
                onChange={e => setForm({ ...form, quarterly_exam: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          {/* Live Calculated Final Score Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-900 dark:text-indigo-300 block">
                Calculated Final Weighted Grade
              </span>
              <p className="text-2xl font-extrabold text-indigo-950 dark:text-white mt-0.5">
                {computedScore}%
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold text-slate-500 block">Assessment</span>
              <Badge variant={computedRemarks === 'Passed' ? 'success' : 'danger'} className="text-sm px-3 py-1 mt-1">
                {computedRemarks}
              </Badge>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Submission Status
            </label>
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Draft">Draft (Faculty Working Copy)</option>
              <option value="Submitted">Submitted (For Dean Endorsement)</option>
              <option value="Approved">Approved (Registrar Master Grade)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Commit Grade Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
