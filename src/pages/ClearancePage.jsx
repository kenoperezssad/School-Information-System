// src/pages/ClearancePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { GlassCard } from '../components/common/GlassCard';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Building,
  UserCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export const ClearancePage = () => {
  const { user, showToast } = useAuth();
  const isStudent = user?.role === 'Student';
  const isParent = user?.role === 'Parent/Guardian';

  // Department-specific sign-off roles
  const deptRole = {
    'School Nurse': 'clinic',
    'Librarian': 'library',
    'Guidance Counselor': 'guidance',
    'Registrar': 'registrar',
    'Accountant': 'accounting',
  }[user?.role];
  const isDeptHead = !!deptRole;
  const isFullAdmin = user?.role === 'Super Administrator' || user?.role === 'Registrar';
  const [clearances, setClearances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchClearances = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clearances');
      if (res.success && res.data) setClearances(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClearances();
  }, []);

  const handleSignDepartment = async (clearanceId, dept, newStatus) => {
    try {
      const res = await api.post(`/clearances/${clearanceId}/department`, {
        department: dept,
        status: newStatus,
      });
      if (res.success) {
        if (res.data.overall_status === 'Cleared') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          showToast('Student is 100% Cleared across all university departments!', 'success');
        } else {
          showToast(`${dept.toUpperCase()} clearance marked as ${newStatus}`, 'success');
        }
        fetchClearances();
        if (selectedRecord) {
          setSelectedRecord({
            ...selectedRecord,
            [`${dept}_status`]: newStatus,
            overall_status: res.data.overall_status,
          });
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Cleared': return <Badge variant="success">Cleared</Badge>;
      case 'Hold': return <Badge variant="danger">Hold</Badge>;
      default: return <Badge variant="warning">Pending</Badge>;
    }
  };

  const departments = [
    { key: 'registrar', label: 'Registrar' },
    { key: 'accounting', label: 'Accounting' },
    { key: 'library', label: 'Library' },
    { key: 'guidance', label: 'Guidance' },
    { key: 'clinic', label: 'Clinic' },
    { key: 'department', label: 'Dept Head' },
  ];

  const columns = [
    {
      header: 'Student',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.last_name}, {row.first_name}</p>
          <p className="text-[11px] font-mono text-slate-400">{row.student_number} • {row.program_code}</p>
        </div>
      ),
    },
    ...departments.map(d => ({
      header: d.label,
      render: (row) => getStatusBadge(row[`${d.key}_status`]),
    })),
    {
      header: 'Overall State',
      render: (row) => (
        <span className="font-extrabold text-sm">
          {getStatusBadge(row.overall_status)}
        </span>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (row) => (
        <Button
          size="sm"
          variant="glass"
          icon={CheckSquare}
          onClick={() => setSelectedRecord(row)}
        >
          Signatures
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isStudent ? 'My Clearance Status' :
          isParent ? "Ward's Clearance Status" :
          isDeptHead ? `${user?.role} Clearance Sign-off` :
          'Digital Clearance & Departmental Sign-off'
        }
        subtitle={
          isStudent ? 'Track your end-of-term clearance across all university departments. All departments must sign before enrollment.' :
          isParent ? "Monitor your ward's clearance progress across all university departments." :
          isDeptHead ? `Review and process clearance requests for the ${user?.role} department` :
          'End-of-term digital clearance workflow across Registrar, Accounting, Library, Guidance, Clinic, and Academic College'
        }
      />

      {/* Student / Parent: Personal clearance status card */}
      {(isStudent || isParent) && clearances.length > 0 && (
        <div className="space-y-4">
          {clearances.slice(0, 1).map(record => (
            <div key={record.id} className="space-y-4">
              {/* Overall Status Banner */}
              <div className={`p-5 rounded-2xl border-2 flex items-center justify-between ${
                record.overall_status === 'Cleared'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
              }`}>
                <div className="flex items-center gap-3">
                  {record.overall_status === 'Cleared'
                    ? <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    : <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  }
                  <div>
                    <p className="font-extrabold text-base text-slate-900 dark:text-white">
                      {record.overall_status === 'Cleared' ? '🎉 You are fully cleared!' : 'Clearance In Progress'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Clearance Token: <span className="font-mono font-bold">{record.clearance_token || 'CLR-2026'}</span>
                    </p>
                  </div>
                </div>
                <Badge variant={record.overall_status === 'Cleared' ? 'success' : 'warning'} className="text-sm px-4 py-1.5">
                  {record.overall_status.toUpperCase()}
                </Badge>
              </div>

              {/* Department checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {departments.map(dept => {
                  const status = record[`${dept.key}_status`];
                  return (
                    <GlassCard key={dept.key} className={`p-4 border ${
                      status === 'Cleared' ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20' :
                      status === 'Hold' ? 'border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20' :
                      'border-slate-200 dark:border-slate-700'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{dept.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {status === 'Cleared' ? 'Signed & cleared' : status === 'Hold' ? 'Hold — see office' : 'Awaiting signature'}
                          </p>
                        </div>
                        {status === 'Cleared'
                          ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          : status === 'Hold'
                          ? <XCircle className="w-6 h-6 text-rose-500" />
                          : <Clock className="w-6 h-6 text-amber-500" />
                        }
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff / Admin: Full table */}
      {!isStudent && !isParent && (
        <DataTable
          columns={columns}
          data={isDeptHead
            ? clearances.filter(r => r[`${deptRole}_status`] !== 'Cleared')
            : clearances
          }
          loading={loading}
          searchPlaceholder="Search clearance by student name or student number..."
        />
      )}

      {/* Interactive Clearance Signatory Matrix Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={`Clearance Sign-off: ${selectedRecord?.last_name}, ${selectedRecord?.first_name}`}
        subtitle={`Clearance Token: ${selectedRecord?.clearance_token || 'CLR-2026'}`}
        maxWidth="max-w-2xl"
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-navy-50/60 dark:bg-slate-800 border border-navy-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">Current Academic Standing</p>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Overall Status: {selectedRecord.overall_status}
                </h4>
              </div>
              <Badge variant={selectedRecord.overall_status === 'Cleared' ? 'success' : 'warning'} className="text-sm px-3 py-1">
                {selectedRecord.overall_status.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Departmental Signatory Approvals
              </h5>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {departments.map((dept) => {
                  const currentStatus = selectedRecord[`${dept.key}_status`];
                  return (
                    <div key={dept.key} className="p-4 flex items-center justify-between bg-white dark:bg-slate-900/50">
                      <div>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{dept.label} Department</p>
                        <p className="text-xs text-slate-400">Authorized personnel signature required</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(currentStatus)}
                        {/* Show sign buttons only if full admin OR this is the dept head's own department */}
                        {(isFullAdmin || (isDeptHead && deptRole === dept.key)) && (
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleSignDepartment(selectedRecord.id, dept.key, 'Cleared')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                              currentStatus === 'Cleared'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            Sign Clear
                          </button>
                          <button
                            onClick={() => handleSignDepartment(selectedRecord.id, dept.key, 'Hold')}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                              currentStatus === 'Hold'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            Hold
                          </button>
                        </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setSelectedRecord(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};



