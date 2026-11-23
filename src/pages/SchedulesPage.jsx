// src/pages/SchedulesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { GlassCard } from '../components/common/GlassCard';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldAlert,
  UserCheck,
  BookOpen,
  User,
  School,
  Layers
} from 'lucide-react';

export const SchedulesPage = () => {
  const { user, showToast } = useAuth();
  const isStudent = user?.role === 'Student';
  const isParent = user?.role === 'Parent/Guardian';
  const isTeacher = user?.role === 'Teacher';
  const isAdmin = !isStudent && !isParent && !isTeacher;
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  // Timetable day grouping for student view
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_COLORS = {
    Monday: 'navy', Tuesday: 'navy', Wednesday: 'emerald',
    Thursday: 'amber', Friday: 'rose', Saturday: 'navy'
  };

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
      if (res.success && res.data) setSchedules(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    api.get('/academic/metadata').then(res => {
      if (res.success && res.data) setMetadata(res.data);
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
          <span className="font-mono font-bold text-navy-700 dark:text-navy-400">{row.subject_code}</span>
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
        title={
          isStudent ? 'My Class Timetable' :
          isParent ? 'Ward Class Timetable' :
          isTeacher ? 'My Teaching Schedule' :
          'Class Schedules & Timetable Master'
        }
        subtitle={
          isStudent ? 'Your weekly class schedule, assigned rooms, and faculty instructors for this semester' :
          isParent ? "Your ward's weekly class schedule and room assignments" :
          isTeacher ? 'Your assigned teaching loads, sections, and classroom allocations for this term' :
          'Master timetable management with automated triple-conflict detection (Teacher, Room, and Section collisions)'
        }
        actions={
          isAdmin ? (
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
          ) : null
        }
      />

      {/* Visual Timetable Card for Student / Parent / Teacher */}
      {(isStudent || isParent || isTeacher) && !loading && schedules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS.map(day => {
            const daySlots = schedules.filter(s => s.day_of_week === day);
            if (!daySlots.length) return null;
            const color = DAY_COLORS[day];
            return (
              <GlassCard key={day} className={`p-5 border border-${color}-100 dark:border-${color}-900/40`}>
                <div className={`flex items-center gap-2 mb-3 pb-3 border-b border-${color}-100 dark:border-${color}-800/40`}>
                  <div className={`w-8 h-8 rounded-xl bg-${color}-50 dark:bg-${color}-950/50 flex items-center justify-center`}>
                    <Calendar className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">{day}</p>
                    <p className="text-[10px] text-slate-400">{daySlots.length} class{daySlots.length > 1 ? 'es' : ''}</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {daySlots.map((s, i) => (
                    <div key={i} className={`p-3 rounded-xl bg-${color}-50/50 dark:bg-${color}-950/20 border border-${color}-100 dark:border-${color}-900/30`}>
                      <p className={`font-mono font-bold text-xs text-${color}-600 dark:text-${color}-400`}>{s.subject_code}</p>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight">{s.subject_title}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.start_time?.substring(0,5)} – {s.end_time?.substring(0,5)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {s.room_number}
                        </span>
                      </div>
                      {!isStudent && !isParent && (
                        <p className="text-[10px] text-slate-400 mt-1">Section: {s.section_name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Summary KPI row for teacher */}
      {isTeacher && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Loads', value: schedules.length, icon: BookOpen, color: 'navy' },
            { label: 'Unique Subjects', value: [...new Set(schedules.map(s => s.subject_code))].length, icon: Layers, color: 'purple' },
            { label: 'Sections Handled', value: [...new Set(schedules.map(s => s.section_name))].length, icon: School, color: 'emerald' },
            { label: 'Days Active', value: [...new Set(schedules.map(s => s.day_of_week))].length, icon: Calendar, color: 'amber' },
          ].map(({ label, value, icon: Icon, color }) => (
            <GlassCard key={label} className={`p-4 border border-${color}-100 dark:border-${color}-900/40`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
              <p className={`text-2xl font-extrabold text-${color}-600 dark:text-${color}-400 mt-1`}>{value}</p>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Admin / Registrar master table */}
      {isAdmin && (
        <DataTable
          columns={columns}
          data={schedules}
          loading={loading}
          searchPlaceholder="Search schedules by subject, section, day, or professor..."
        />
      )}

      {/* Teacher: also show flat table below cards */}
      {isTeacher && !loading && (
        <DataTable
          columns={columns}
          data={schedules}
          loading={loading}
          searchPlaceholder="Search your teaching schedules..."
        />
      )}

      {/* Student / Parent: flat table as backup */}
      {(isStudent || isParent) && !loading && (
        <DataTable
          columns={columns.filter(c => c.header !== 'Assigned Professor' || isParent)}
          data={schedules}
          loading={loading}
          searchPlaceholder="Search your class schedule..."
        />
      )}

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
          <div className="p-4 rounded-2xl bg-navy-50/60 dark:bg-slate-800/60 border border-navy-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-700 dark:text-navy-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-navy-700 dark:text-navy-400" />
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



