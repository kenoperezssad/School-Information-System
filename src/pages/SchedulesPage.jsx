// src/pages/SchedulesPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const SchedulesPage = () => {
  const { showToast } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  // Add Schedule Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    subject_id: 1,
    faculty_id: 1,
    section_id: 1,
    room_id: 1,
    day_of_week: 'Monday',
    start_time: '13:00:00',
    end_time: '16:00:00',
    schedule_type: 'Lecture',
  });
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictResult, setConflictResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/schedules');
      if (res.success) setSchedules(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    api.get('/academic/metadata').then(res => {
      if (res.success) setMetadata(res.data);
    });
  }, []);

  // Run Real-Time Conflict Detection Engine
  const handleCheckConflict = async () => {
    setCheckingConflict(true);
    setConflictResult(null);
    try {
      const res = await api.post('/schedules/check-conflict', form);
      if (res.success) {
        setConflictResult(res.data);
        if (!res.data.has_conflict) {
          showToast('No schedule conflict detected! Slot is available.', 'success');
        } else {
          showToast('Warning: Timetable conflict detected!', 'error');
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/schedules', form);
      if (res.success) {
        showToast('Class schedule slot created successfully!', 'success');
        setAddModalOpen(false);
        setConflictResult(null);
        fetchSchedules();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Course Subject',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.subject_code}</span>
          <span className="text-xs font-semibold text-slate-900 dark:text-white block">{row.subject_title}</span>
        </div>
      ),
    },
    {
      header: 'Section',
      accessor: 'section_name',
      render: (row) => <Badge variant="default">{row.section_name}</Badge>,
    },
    {
      header: 'Day & Time Slot',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-200">{row.day_of_week}</p>
          <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{row.start_time?.substring(0, 5)} - {row.end_time?.substring(0, 5)}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Room & Facility',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-200">{row.room_number}</p>
          <p className="text-[11px] text-slate-400">{row.building_name}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Professor',
      render: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Prof. {row.prof_first} {row.prof_last}
        </span>
      ),
    },
    {
      header: 'Type',
      render: (row) => (
        <Badge variant={row.schedule_type === 'Laboratory' ? 'purple' : 'info'}>
          {row.schedule_type}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Schedules & Timetable Master"
        subtitle="Master timetable management with automated triple-conflict detection (Teacher, Room, and Section collisions)"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setConflictResult(null);
              setAddModalOpen(true);
            }}
          >
            Assign Class Slot
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={schedules}
        loading={loading}
        searchPlaceholder="Search schedules by subject, section, day, or professor..."
      />

      {/* Add Schedule Modal with Conflict Detection Engine */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Assign Class Schedule Slot"
        subtitle="Automated clash prevention engine will verify room, professor, and section availability"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Course *</label>
              <select
                value={form.subject_id}
                onChange={e => setForm({ ...form, subject_id: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {(metadata?.subjects || []).map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class Section *</label>
              <select
                value={form.section_id}
                onChange={e => setForm({ ...form, section_id: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {(metadata?.sections || []).map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Faculty *</label>
              <select
                value={form.faculty_id}
                onChange={e => setForm({ ...form, faculty_id: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {(metadata?.faculty || []).map(f => (
                  <option key={f.id} value={f.id}>Prof. {f.first_name} {f.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room Assignment *</label>
              <select
                value={form.room_id}
                onChange={e => setForm({ ...form, room_id: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {(metadata?.rooms || []).map(r => (
                  <option key={r.id} value={r.id}>{r.room_number} ({r.room_type})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Day of Week</label>
              <select
                value={form.day_of_week}
                onChange={e => setForm({ ...form, day_of_week: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                value={form.start_time}
                onChange={e => setForm({ ...form, start_time: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                value={form.end_time}
                onChange={e => setForm({ ...form, end_time: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Automated Conflict Checker Panel */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Automated Conflict Engine</span>
              </span>
              <Button
                size="sm"
                variant="glass"
                loading={checkingConflict}
                onClick={handleCheckConflict}
              >
                Test Conflict
              </Button>
            </div>

            {conflictResult && (
              <div className={`p-3 rounded-xl text-xs font-medium border ${
                conflictResult.has_conflict
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              }`}>
                {conflictResult.has_conflict ? (
                  <div className="space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Conflict Detected! Cannot allocate this slot:</span>
                    </p>
                    <ul className="list-disc list-inside text-[11px] pl-1">
                      {conflictResult.conflicts.map((c, i) => (
                        <li key={i}>{c.message}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Slot is 100% free! No faculty, room, or section clashes.</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={conflictResult?.has_conflict}
            >
              Confirm Schedule Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
