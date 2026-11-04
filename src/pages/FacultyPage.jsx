// src/pages/FacultyPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  UserPlus,
  Mail,
  Phone,
  BookOpen,
  Award,
  GraduationCap
} from 'lucide-react';

export const FacultyPage = () => {
  const { showToast } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: 1,
    rank: 'Assistant Professor',
    employment_type: 'Full-Time',
    specialization: 'Software Engineering',
    qualification: 'Master of Science in Computer Science',
    max_load_units: 24,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFaculty = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/faculty');
      if (res.success) setFaculty(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFaculty();
    api.get('/academic/metadata').then(res => {
      if (res.success) setMetadata(res.data);
    });
  }, [fetchFaculty]);

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/faculty', form);
      if (res.success) {
        showToast(`Faculty member ${res.data.employee_no} added!`, 'success');
        setAddModalOpen(false);
        fetchFaculty();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employee_no',
      render: (row) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.employee_no}</span>,
    },
    {
      header: 'Faculty Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
            {row.first_name[0]}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white leading-tight">
              Prof. {row.first_name} {row.last_name}
            </p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'College / Dept',
      render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-300">{row.department_code}</span>,
    },
    {
      header: 'Academic Rank',
      render: (row) => <Badge variant="purple">{row.rank}</Badge>,
    },
    {
      header: 'Specialization',
      accessor: 'specialization',
    },
    {
      header: 'Teaching Load',
      render: (row) => {
        const units = Number(row.current_load_units || 0);
        const max = Number(row.max_load_units || 24);
        const pct = Math.min(100, Math.round((units / max) * 100));

        return (
          <div className="w-28 space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span>{units} / {max} u</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${pct >= 100 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Academic Personnel"
        subtitle="Instructional roster, academic rank qualifications, teaching load allocations, and department assignments"
        actions={
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setAddModalOpen(true)}
          >
            Add Faculty Member
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={faculty}
        loading={loading}
        searchPlaceholder="Search by professor name, employee ID, or specialization..."
      />

      {/* Add Faculty Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register Faculty Member"
        subtitle="Create academic instructional profile"
      >
        <form onSubmit={handleCreateFaculty} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department *</label>
              <select
                value={form.department_id}
                onChange={e => setForm({ ...form, department_id: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {(metadata?.departments || []).map(d => (
                  <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Rank</label>
              <select
                value={form.rank}
                onChange={e => setForm({ ...form, rank: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Instructor I">Instructor I</option>
                <option value="Instructor II">Instructor II</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Full Professor">Full Professor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Employment Type</label>
              <select
                value={form.employment_type}
                onChange={e => setForm({ ...form, employment_type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contractual">Contractual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Specialization</label>
              <input
                type="text"
                value={form.specialization}
                onChange={e => setForm({ ...form, specialization: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Register Faculty</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
