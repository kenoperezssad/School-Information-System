// src/pages/AuditLogsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Terminal, Clock, ShieldCheck } from 'lucide-react';

export const AuditLogsPage = () => {
  const { showToast } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit');
      if (res.success) setLogs(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'created_at',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.created_at}</span>
        </span>
      ),
    },
    {
      header: 'User Actor & Role',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.user_name}</p>
          <p className="text-[11px] text-slate-400">{row.role}</p>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Module',
      render: (row) => <Badge variant="purple">{row.module}</Badge>,
    },
    {
      header: 'Change / Audit Payload',
      render: (row) => (
        <div className="max-w-md font-mono text-xs text-slate-600 dark:text-slate-300 truncate">
          {row.new_values || 'No diff payload'}
        </div>
      ),
    },
    {
      header: 'Origin IP',
      accessor: 'ip_address',
      render: (row) => <span className="font-mono text-xs text-slate-400">{row.ip_address}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Security & Audit Trail"
        subtitle="Immutable ledger tracking every administrative transaction, grade alteration, payment acceptance, and clearance sign-off"
      />

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Search audit logs by actor, action, or module..."
      />
    </div>
  );
};
