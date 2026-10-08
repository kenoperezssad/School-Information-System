// src/pages/AttendancePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  QrCode,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Scan,
  Sparkles,
  Camera
} from 'lucide-react';

export const AttendancePage = () => {
  const { showToast } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR Scanner Modal
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrInput, setQrInput] = useState('2026-10001');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance?date=${selectedDate}`);
      if (res.success) setRecords(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

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
        showToast(`Marked ${record.first_name} as ${newStatus}`, 'success');
        fetchAttendance();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle QR Scanner Simulation
  const handleSimulateScan = async (tokenToScan) => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await api.post('/attendance/qr-scan', {
        qr_token: tokenToScan || qrInput,
        schedule_id: 1,
      });
      if (res.success) {
        setScanResult(res.data);
        showToast(res.message, 'success');
        fetchAttendance();
      }
    } catch (err) {
      showToast(err.message, 'error');
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
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.subject_code}</span>
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
          {row.method === 'QR Code' ? <QrCode className="w-3.5 h-3.5 text-indigo-500" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
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
        <div className="flex items-center justify-end gap-1">
          {['Present', 'Late', 'Absent', 'Excused'].map((st) => (
            <button
              key={st}
              onClick={() => handleSetStatus(row, st)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                row.status === st
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance & QR Verification Check-in"
        subtitle="Daily class attendance rosters, real-time status logging, and contactless digital Student ID QR scanner"
        actions={
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs font-medium"
            />
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
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        searchPlaceholder="Search attendance by student or subject code..."
      />

      {/* QR Scanner Simulator Modal */}
      <Modal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title="Interactive QR Attendance Scanner"
        subtitle="Real-time contactless terminal simulator for student tap & check-in"
      >
        <div className="space-y-6">
          {/* Virtual Camera Viewport */}
          <div className="relative w-full h-56 bg-slate-950 rounded-2xl overflow-hidden border-2 border-indigo-500/40 flex flex-col items-center justify-center text-center p-6 shadow-inner">
            {/* Viewfinder corners */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-400"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-400"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-400"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-400"></div>

            {/* Scanning Laser Line Animation */}
            <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-[0_0_12px_#38bdf8]"></div>

            <Camera className="w-10 h-10 text-indigo-400 mb-2 opacity-60" />
            <p className="text-xs font-mono text-indigo-200 uppercase tracking-widest">
              Camera Feed Ready • Point QR Code
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Terminal: Building A Turnstile Gateway 01
            </p>
          </div>

          {/* Quick Simulated Student Barcodes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select or Type Student ID / Token to Simulate Scan:
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { label: 'Keno Reyes (2026-10001)', token: '2026-10001' },
                { label: 'Sophia Santos (2026-10002)', token: '2026-10002' },
                { label: 'Liam Tan (2026-10003)', token: '2026-10003' },
              ].map(s => (
                <button
                  key={s.token}
                  type="button"
                  onClick={() => {
                    setQrInput(s.token);
                    handleSimulateScan(s.token);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                >
                  Tap {s.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={qrInput}
                onChange={e => setQrInput(e.target.value)}
                placeholder="Enter Student Number or QR Token..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
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

          {/* Verification Badge */}
          {scanResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-sm">Attendance Verified & Registered!</span>
              </div>
              <div className="text-xs space-y-0.5 pl-7">
                <p>Student: <strong>{scanResult.student_name}</strong> ({scanResult.student_number})</p>
                <p>Status: <span className="font-bold text-emerald-700 dark:text-emerald-300">{scanResult.status}</span> at {scanResult.timestamp}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setScannerOpen(false)}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
