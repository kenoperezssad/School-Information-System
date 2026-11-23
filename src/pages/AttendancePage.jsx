// src/pages/AttendancePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Calendar,
  CheckCircle2,
  Clock,
  Scan,
  Users,
  CheckCheck,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Radio,
  Send,
  Smartphone,
  Volume2,
  Zap
} from 'lucide-react';

// Web Audio API feedback generator
const playBeep = (success = true) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (success) {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime); // Low buzz
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Audio not allowed or unavailable in this environment
  }
};

const PROGRAM_MAP = {
  '2026-10001': 'BS Computer Science (Software Eng)',
  '2026-10002': 'BS Computer Science (AI & Data Science)',
  '2026-10003': 'BS Information Technology (Cybersecurity)',
  '2026-10004': 'BS Computer Science (Systems)',
  '2026-10005': 'BS Nursing (Clinical Care)',
  '2026-10006': 'BS Business Administration',
};

export const AttendancePage = () => {
  const { user, showToast } = useAuth();
  const isStudent = user?.role === 'Student';
  const isParent = user?.role === 'Parent/Guardian';
  const isStaff = !isStudent && !isParent;
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Turnstile QR / RFID Scanner Modal
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrInput, setQrInput] = useState('2026-10001');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Parent SMS Simulation Modal
  const [smsModalOpen, setSmsModalOpen] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance?date=${selectedDate}`);
      if (res.success && res.data) setRecords(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  // KPI Analytics calculations
  const totalRoster = records.length;
  const presentCount = records.filter(r => r.status === 'Present').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;

  const presentRate = totalRoster > 0 ? Math.round((presentCount / totalRoster) * 100) : 0;
  const lateRate = totalRoster > 0 ? Math.round((lateCount / totalRoster) * 100) : 0;

  // Handle manual status toggle
  const handleSetStatus = async (record, newStatus) => {
    try {
      const res = await api.post('/attendance', {
        schedule_id: record.schedule_id,
        student_id: record.student_id,
        status: newStatus,
        method: 'Manual',
        date: selectedDate,
        remarks: `Updated to ${newStatus} by instructor`,
      });
      if (res.success) {
        if (newStatus === 'Present') {
          playBeep(true);
        } else if (newStatus === 'Absent') {
          playBeep(false);
        } else {
          playBeep(true);
        }
        showToast(`Marked ${record.first_name} as ${newStatus}`, 'success');
        fetchAttendance();
      }
    } catch (err) {
      playBeep(false);
      showToast(err.message, 'error');
    }
  };

  // Bulk action: Mark All Present
  const handleMarkAllPresent = async () => {
    if (!records || records.length === 0) {
      showToast('No student roster records found for this date.', 'warning');
      return;
    }
    const toUpdate = records.filter(r => r.status !== 'Present');
    if (toUpdate.length === 0) {
      showToast('All students on this roster are already marked Present.', 'info');
      return;
    }
    if (!window.confirm(`Mark all ${toUpdate.length} non-present student(s) as Present for ${selectedDate}?`)) {
      return;
    }
    setBulkUpdating(true);
    try {
      await Promise.all(
        toUpdate.map(rec =>
          api.post('/attendance', {
            schedule_id: rec.schedule_id || 1,
            student_id: rec.student_id,
            status: 'Present',
            method: 'Manual Bulk',
            date: selectedDate,
            remarks: 'Marked Present via Bulk Action'
          })
        )
      );
      playBeep(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      showToast(`Successfully marked all ${toUpdate.length} students as Present!`, 'success');
      await fetchAttendance();
    } catch (err) {
      playBeep(false);
      showToast(err.message || 'Failed to bulk mark attendance', 'error');
    } finally {
      setBulkUpdating(false);
    }
  };

  // QR / RFID Scanner Simulation
  const handleSimulateScan = async (tokenToScan) => {
    setScanning(true);
    setScanResult(null);
    const token = tokenToScan || qrInput;
    try {
      const res = await api.post('/attendance/qr-scan', {
        qr_token: token,
        schedule_id: 1,
      });
      if (res.success) {
        playBeep(true);
        const enriched = {
          ...res.data,
          degree_program: PROGRAM_MAP[res.data.student_number] || 'BS Computer Science',
          terminal_gate: 'GATE 1 NORTH TURNSTILE',
          standing: 'ACCESS GRANTED - VERIFIED REGULAR',
          timestamp: res.data.timestamp || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setScanResult(enriched);
        showToast(res.message || `Verified: ${res.data.student_name}`, 'success');
        fetchAttendance();
      }
    } catch (err) {
      playBeep(false);
      showToast(err.message || 'Scan verification failed', 'error');
    } finally {
      setScanning(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present': return <Badge variant="success">Present</Badge>;
      case 'Late': return <Badge variant="warning">Late</Badge>;
      case 'Excused': return <Badge variant="info">Excused</Badge>;
      case 'Absent': return <Badge variant="danger">Absent</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  // Students currently marked absent
  const absentStudents = records.filter(r => r.status === 'Absent');

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
      header: 'Subject & Class',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-navy-700 dark:text-navy-400">{row.subject_code}</span>
          <span className="text-xs text-slate-400 block">{row.day_of_week} ({row.start_time?.substring(0, 5)})</span>
        </div>
      ),
    },
    {
      header: 'Attendance Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Check-in Method',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          {row.method === 'QR Code' ? <QrCode className="w-3.5 h-3.5 text-navy-600" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
          <span>{row.method}</span>
        </span>
      ),
    },
    {
      header: 'Remarks / Timestamp',
      accessor: 'remarks',
    },
    {
      header: 'Quick Mark Status',
      className: 'text-right',
      render: (row) => (
        isStaff ? (
        <div className="flex items-center justify-end gap-1">
          {['Present', 'Late', 'Absent', 'Excused'].map((st) => (
            <button
              key={st}
              onClick={() => handleSetStatus(row, st)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                row.status === st
                  ? 'bg-navy-800 text-white border-navy-700 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        ) : (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
            row.status === 'Present' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' :
            row.status === 'Absent' ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300' :
            row.status === 'Late' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300' :
            'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>{row.status || 'No Record'}</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Inline Keyframes for Turnstile Scanner Sweep */}
      <style>{`
        @keyframes laserSweep {
          0% { top: 6%; opacity: 0.85; }
          50% { opacity: 1; }
          100% { top: 92%; opacity: 0.85; }
        }
        .laser-sweep-line {
          animation: laserSweep 2.4s ease-in-out infinite alternate;
        }
      `}</style>

      {/* Page Header with Action Buttons */}
      <PageHeader
        title={
          isStudent ? 'My Attendance Record' :
          isParent ? "Ward's Attendance Log" :
          'Attendance & QR Verification Check-in'
        }
        subtitle={
          isStudent ? 'View your daily class attendance, absences, tardiness, and QR check-in history for this semester' :
          isParent ? "Monitor your ward's attendance, absence notifications, and class attendance history" :
          'Daily class attendance rosters, real-time status logging, and contactless digital Student ID QR scanner'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-xs bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none"
              />
            </div>
            {isStaff && (
              <>
                <Button
                  variant="secondary"
                  icon={CheckCheck}
                  loading={bulkUpdating}
                  onClick={handleMarkAllPresent}
                  title="Quickly mark all students on this roster as Present"
                >
                  Mark All Present
                </Button>
                <Button
                  variant="secondary"
                  icon={MessageSquare}
                  onClick={() => setSmsModalOpen(true)}
                  className="relative"
                >
                  Parent SMS Alerts
                  {absentCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                      {absentCount}
                    </span>
                  )}
                </Button>
                <Button
                  variant="primary"
                  icon={Scan}
                  onClick={() => {
                    setScanResult(null);
                    setScannerOpen(true);
                  }}
                >
                  Launch QR Scanner
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* 4 Attendance KPI Analytics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Roster"
          value={totalRoster}
          icon={Users}
          trend={`${totalRoster} Students`}
          trendLabel="enrolled in session"
          iconBg="bg-navy-50 dark:bg-navy-950/50"
          iconColor="text-navy-700 dark:text-navy-400"
        />
        <StatCard
          title="Present Rate"
          value={`${presentRate}%`}
          icon={CheckCircle2}
          trend={`${presentCount} Present`}
          trendLabel="on-time attendance"
          iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Late Arrival Rate"
          value={`${lateRate}%`}
          icon={Clock}
          trend={`${lateCount} Late`}
          trendLabel="tardy check-ins"
          iconBg="bg-amber-50 dark:bg-amber-950/50"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Absence Alert Count"
          value={absentCount}
          icon={AlertTriangle}
          trend={absentCount > 0 ? `-${absentCount} Unexcused` : '0 Absences'}
          trendLabel={absentCount > 0 ? 'SMS dispatch queued' : 'Optimal attendance'}
          iconBg="bg-rose-50 dark:bg-rose-950/50"
          iconColor="text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* Attendance Records Table */}
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        searchPlaceholder="Search attendance by student or subject code..."
      />

      {/* Interactive Smart RFID / QR Turnstile Terminal Modal — Staff only */}
      {isStaff && (
      <Modal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title="Smart RFID / QR Turnstile Terminal"
        subtitle="Gate 01 • Real-time campus biometric & optical security turnstile gate"
      >
        <div className="space-y-6">
          {/* Turnstile Terminal Status HUD Bar */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="font-mono font-bold text-white tracking-wider">GATE 01 - NORTH TURNSTILE</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-navy-400">
              <span className="hidden sm:inline">NFC 13.56 MHz // OPTICAL 2D</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Volume2 className="w-3.5 h-3.5" /> AUDIO FEEDBACK ON
              </span>
            </div>
          </div>

          {/* Virtual Camera & Laser Scanner Viewport */}
          <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border-2 border-navy-700/50 flex flex-col items-center justify-center text-center p-6 shadow-[inset_0_0_40px_rgba(128,0,0,0.15)]">
            {/* Cyberpunk Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

            {/* Viewfinder Corner HUD Brackets */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-navy-500 shadow-[0_0_8px_rgba(128,0,0,0.6)]" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-navy-500 shadow-[0_0_8px_rgba(128,0,0,0.6)]" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-navy-500 shadow-[0_0_8px_rgba(128,0,0,0.6)]" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-navy-500 shadow-[0_0_8px_rgba(128,0,0,0.6)]" />

            {/* Center Aim Reticle */}
            <div className="absolute w-28 h-28 border border-navy-700/30 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-16 h-16 border border-dashed border-navy-500/40 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
            </div>

            {/* Glowing Cyan Laser Sweep Line */}
            <div className="absolute inset-x-6 h-0.5 bg-gradient-to-r from-transparent via-navy-700 to-transparent laser-sweep-line shadow-[0_0_15px_rgba(128,0,0,0.6),0_0_30px_rgba(128,0,0,0.5)] pointer-events-none" />

            {/* Scanner Central Icon & Status */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-navy-800 border border-navy-700/40 flex items-center justify-center mb-2 shadow-inner">
                <Scan className="w-6 h-6 text-navy-400 animate-pulse" />
              </div>
              <p className="text-xs font-mono font-bold text-navy-400 uppercase tracking-widest">
                Optical QR / RFID Turnstile Sensor Ready
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Present Student ID Badge, Digital Token, or Mobile QR
              </p>
            </div>

            {/* Live Terminal HUD Metadata */}
            <div className="absolute bottom-2 inset-x-4 flex justify-between text-[10px] font-mono text-slate-500">
              <span>APEX-SECURE v4.2</span>
              <span>LATENCY: 12ms • TURNSTILE: LOCKED</span>
            </div>
          </div>

          {/* Quick Tap Demo Chips */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Quick Tap Demo Chips (Simulate Turnstile RFID Tap):
              </label>
              <span className="text-[11px] text-slate-400 font-mono">One-click live check-in</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Keno Reyes', id: '2026-10001' },
                { name: 'Sophia Santos', id: '2026-10002' },
                { name: 'Marcus Chen', id: '2026-10003' },
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setQrInput(s.id);
                    handleSimulateScan(s.id);
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 text-navy-700 dark:text-navy-400 border border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-950/60 shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Radio className="w-3 h-3 text-navy-600 animate-pulse" />
                  Tap: {s.name} ({s.id})
                </button>
              ))}
            </div>

            {/* Manual QR / Token Input */}
            <div className="flex gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <input
                type="text"
                value={qrInput}
                onChange={e => setQrInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSimulateScan(qrInput)}
                placeholder="Enter Student Number or QR Token (e.g. 2026-10001)..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
              <Button
                variant="primary"
                loading={scanning}
                onClick={() => handleSimulateScan(qrInput)}
              >
                Scan Token
              </Button>
            </div>
          </div>

          {/* Digital Campus ID Passcard (Turnstile Verified Result) */}
          {scanResult && (
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/70 border-2 border-emerald-500/80 p-5 shadow-[0_0_25px_rgba(16,185,129,0.3)] text-white overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
              {/* Decorative Corner Watermark */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-mono font-bold tracking-wider text-emerald-300 uppercase">
                      APEX STATE UNIVERSITY • DIGITAL STUDENT ID
                    </h4>
                    <p className="text-[10px] text-slate-400">SMART ACCESS PASS // RFID ENCRYPTED</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-300 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  TURNSTILE UNLOCKED
                </div>
              </div>

              {/* Passcard Main Body */}
              <div className="mt-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* Student Avatar / Photo Frame */}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-navy-800 to-emerald-500 p-0.5 shadow-lg shrink-0">
                  <div className="w-full h-full rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                      {scanResult.student_name ? scanResult.student_name.split(' ').map(n => n[0]).join('') : 'ST'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 mt-0.5">REGULAR</span>
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Student Info Details */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    {scanResult.student_name}
                  </h3>
                  <p className="text-xs font-mono text-navy-400 font-semibold">
                    ID: {scanResult.student_number}
                  </p>
                  <p className="text-xs text-slate-300 font-medium">
                    {scanResult.degree_program || PROGRAM_MAP[scanResult.student_number] || 'BS Computer Science'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 pt-1">
                    TIMESTAMP: <span className="text-white font-bold">{scanResult.timestamp} - GATE 1 NORTH TURNSTILE</span>
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-4 pt-3 border-t border-emerald-500/30 flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span className="text-xs font-mono font-extrabold text-emerald-300 tracking-wider">
                    ACCESS GRANTED - VERIFIED REGULAR
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  LANE 03 • FLAP BARRIER OPENED
                </span>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setScannerOpen(false)}>
              Close Terminal
            </Button>
          </div>
        </div>
      </Modal>
      )}

      {/* Parent SMS & Email Notification Simulation Modal — Staff only */}
      {isStaff && (
      <Modal
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
        title="Parent SMS & Email Notification Simulation"
        subtitle="Automated real-time SMS dispatch sent to parents of students marked absent"
      >
        <div className="space-y-5">
          {/* Dispatch Gateway Overview Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-navy-50 dark:bg-navy-950/40 border border-navy-200 dark:border-navy-700 text-xs">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-navy-700 dark:text-navy-400" />
              <span className="font-bold text-navy-700 dark:text-navy-200">
                Gateway: ApexSIS Telecommunications Relay
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-navy-700 dark:text-navy-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>SMS ROUTE ACTIVE (100% DELIVERY RATE)</span>
            </div>
          </div>

          {/* Notification List or Empty State */}
          {absentStudents.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Outbound Absence Dispatch List ({absentStudents.length} Guardian{absentStudents.length > 1 ? 's' : ''} Contacted):
              </p>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {absentStudents.map((st) => (
                  <div
                    key={st.id || st.student_number}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-rose-500" />
                        Parent/Guardian of {st.first_name} {st.last_name}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        SMS Sent • Delivered
                      </span>
                    </div>

                    {/* Simulated iOS/Android Message Bubble */}
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-sans border-l-4 border-rose-500">
                      <p className="font-semibold text-rose-600 dark:text-rose-400 text-[11px] mb-0.5">
                        ApexSIS Official SMS Gateway
                      </p>
                      <p className="leading-relaxed">
                        "ApexSIS Alert: Your ward <strong>{st.first_name} {st.last_name}</strong> was marked Absent on {selectedDate} for class {st.subject_code || 'CS-301'}. Contact Registrar if excused."
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Optimal Attendance: Zero Absences Recorded for {selectedDate}</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  No unexcused absence alerts are required at this time. Below is a sample simulation preview of the parent SMS dispatched whenever an absence is flagged:
                </p>
              </div>

              {/* Sample Dispatch Preview */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-navy-600" />
                    Parent/Guardian of Marcus Chen (Sample Recipient)
                  </span>
                  <span className="text-[10px] font-mono text-navy-700 dark:text-navy-400 font-bold bg-navy-50 dark:bg-navy-950/50 px-2 py-0.5 rounded-md border border-navy-200 dark:border-navy-700">
                    Template Ready
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-sans border-l-4 border-navy-600">
                  <p className="font-semibold text-navy-700 dark:text-navy-400 text-[11px] mb-0.5">
                    ApexSIS Official SMS Gateway
                  </p>
                  <p className="leading-relaxed">
                    "ApexSIS Alert: Your ward <strong>Marcus Chen</strong> was marked Absent on {selectedDate} for class CS-301. Contact Registrar if excused."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="secondary"
              icon={Send}
              onClick={() => {
                playBeep(true);
                showToast(`Simulation: SMS alerts successfully broadcast to registered parent contacts.`, 'success');
              }}
            >
              Simulate Instant SMS Push
            </Button>
            <Button variant="primary" onClick={() => setSmsModalOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
      )}
    </div>
  );
};




