// src/pages/ClearancePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Building,
  UserCheck,
  Sparkles
} from 'lucide-react';

export const ClearancePage = () => {
  const { showToast } = useAuth();
  const [clearances, setClearances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchClearances = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clearances');
      if (res.success) setClearances(res.data);
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
        title="Digital Clearance & Departmental Sign-off"
        subtitle="End-of-term digital clearance workflow across Registrar, Accounting, Library, Guidance, Clinic, and Academic College"
      />

      <DataTable
        columns={columns}
        data={clearances}
        loading={loading}
        searchPlaceholder="Search clearance by student name or student number..."
      />

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
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-between">
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
