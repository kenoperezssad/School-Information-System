// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Tabs } from '../components/common/Tabs';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Award,
  Users,
  DollarSign,
  BookOpen
} from 'lucide-react';

export const ReportsPage = () => {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('masterlist');
  const [masterList, setMasterList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await api.get('/reports/masterlist');
        if (res.success) setMasterList(res.data);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Export table data to CSV format
  const handleExportCSV = () => {
    if (masterList.length === 0) return;
    const headers = ['Student Number', 'Last Name', 'First Name', 'Gender', 'Degree Program', 'Year Level', 'Status', 'GPA'];
    const rows = masterList.map(item => [
      item.student_number,
      item.last_name,
      item.first_name,
      item.gender,
      item.program_code,
      item.year_level,
      item.status,
      item.gpa
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ApexSIS_Master_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV exported successfully!', 'success');
  };

  const columns = [
    {
      header: 'Student Number',
      accessor: 'student_number',
      render: (row) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.student_number}</span>,
    },
    {
      header: 'Student Name',
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.last_name}, {row.first_name}
        </span>
      ),
    },
    {
      header: 'Gender',
      accessor: 'gender',
    },
    {
      header: 'Program',
      accessor: 'program_code',
      render: (row) => <Badge variant="purple">{row.program_code}</Badge>,
    },
    {
      header: 'Year Level',
      accessor: 'year_level',
    },
    {
      header: 'GPA',
      render: (row) => <span className="font-extrabold text-slate-900 dark:text-white">{row.gpa}</span>,
    },
    {
      header: 'Matriculation Status',
      render: (row) => <Badge variant={row.status === 'Regular' ? 'success' : 'warning'}>{row.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Reports & Analytical Exports"
        subtitle="Master demographic rosters, class standings, retention rates, and institutional auditing data"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Report
            </Button>
            <Button
              variant="primary"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'masterlist', label: 'Student Master List', icon: Users, count: masterList.length },
          { id: 'rankings', label: 'Dean’s List & Honor Rankings', icon: Award, count: 4 },
        ]}
      />

      <DataTable
        columns={columns}
        data={masterList}
        loading={loading}
        searchPlaceholder="Search master list by student number, name, or program..."
      />
    </div>
  );
};
