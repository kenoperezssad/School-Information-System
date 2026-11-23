// src/pages/WelfarePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Tabs } from '../components/common/Tabs';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse,
  Brain,
  ShieldAlert,
  AlertTriangle,
  Stethoscope,
  Lock,
  UserCheck
} from 'lucide-react';

export const WelfarePage = () => {
  const { user, showToast } = useAuth();
  const isStudent = user?.role === 'Student';
  const isNurse = user?.role === 'School Nurse';
  const isGuidance = user?.role === 'Guidance Counselor';
  // Default tab based on role
  const defaultTab = isNurse ? 'clinic' : isGuidance ? 'guidance' : 'clinic';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [clinicRecords, setClinicRecords] = useState([]);
  const [guidanceRecords, setGuidanceRecords] = useState([]);
  const [disciplineRecords, setDisciplineRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWelfareData = async () => {
    setLoading(true);
    try {
      const [cRes, gRes, dRes] = await Promise.all([
        api.get('/clinic'),
        api.get('/guidance'),
        api.get('/discipline'),
      ]);
      if (cRes.success) setClinicRecords(cRes.data);
      if (gRes.success) setGuidanceRecords(gRes.data);
      if (dRes.success) setDisciplineRecords(dRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWelfareData();
  }, []);

  const clinicColumns = [
    {
      header: 'Student',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.last_name}, {row.first_name}</p>
          <p className="text-[11px] font-mono text-slate-400">{row.student_number} â€¢ {row.program_code}</p>
        </div>
      ),
    },
    {
      header: 'Diagnosis',
      accessor: 'diagnosis',
      render: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.diagnosis}</span>,
    },
    {
      header: 'Vital Signs',
      accessor: 'vital_signs',
    },
    {
      header: 'Treatment & Prescription',
      render: (row) => (
        <div>
          <p className="text-xs text-slate-700 dark:text-slate-300">{row.treatment_given}</p>
          <p className="text-[10px] text-slate-400">Rx: {row.prescription || 'None'}</p>
        </div>
      ),
    },
    {
      header: 'Known Allergies',
      render: (row) => (
        row.allergies ? (
          <Badge variant="danger">{row.allergies}</Badge>
        ) : <Badge variant="success">None known</Badge>
      ),
    },
    {
      header: 'Attended By',
      accessor: 'attended_by',
    },
  ];

  const guidanceColumns = [
    {
      header: 'Case No.',
      accessor: 'case_number',
      render: (row) => <span className="font-mono font-bold text-navy-700 dark:text-navy-400">{row.case_number}</span>,
    },
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
      header: 'Concern Category',
      render: (row) => <Badge variant="purple">{row.concern_type}</Badge>,
    },
    {
      header: 'Counselor Notes',
      render: (row) => (
        <div className="max-w-xs">
          <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{row.notes}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Rec: {row.recommendations}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Resolved' ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Confidentiality',
      render: () => (
        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
          <Lock className="w-3 h-3" />
          <span>Restricted</span>
        </span>
      ),
    },
  ];

  const disciplineColumns = [
    {
      header: 'Case No.',
      accessor: 'case_no',
      render: (row) => <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{row.case_no}</span>,
    },
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
      header: 'Violation Type',
      accessor: 'violation_type',
      render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200">{row.violation_type}</span>,
    },
    {
      header: 'Imposed Sanction',
      render: (row) => <Badge variant="danger">{row.sanction}</Badge>,
    },
    {
      header: 'Resolution Status',
      render: (row) => (
        <Badge variant={row.status === 'Resolved' ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isStudent ? 'My Health & Counseling Records' :
          isNurse ? 'University Infirmary â€” Medical Records' :
          isGuidance ? 'Guidance & Counseling Case Management' :
          'Student Health, Counseling & Welfare'
        }
        subtitle={
          isStudent ? 'View your personal clinic visit history and confidential counseling sessions (read-only)' :
          isNurse ? 'Manage student medical records, vital signs, and campus clinic visits' :
          isGuidance ? 'Manage confidential counseling case notes and student behavioral tracking' :
          'Role-protected medical records, confidential psychological guidance case notes, and student affairs disciplinary hearings'
        }
      />

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          ...((!isGuidance) ? [{ id: 'clinic', label: isStudent ? 'My Clinic Visits' : 'University Infirmary & Clinic', icon: HeartPulse, count: clinicRecords.length }] : []),
          ...((!isNurse) ? [{ id: 'guidance', label: isStudent ? 'My Counseling Sessions' : 'Guidance & Counseling', icon: Brain, count: guidanceRecords.length }] : []),
          ...(!isStudent && !isNurse && !isGuidance ? [{ id: 'discipline', label: 'Discipline & Student Affairs', icon: ShieldAlert, count: disciplineRecords.length }] : []),
        ]}
      />

      {activeTab === 'clinic' && (
        <DataTable
          columns={clinicColumns}
          data={clinicRecords}
          loading={loading}
          searchPlaceholder="Search clinic records by diagnosis or student..."
        />
      )}

      {activeTab === 'guidance' && (
        <DataTable
          columns={guidanceColumns}
          data={guidanceRecords}
          loading={loading}
          searchPlaceholder="Search counseling cases by student or case number..."
        />
      )}

      {activeTab === 'discipline' && (
        <DataTable
          columns={disciplineColumns}
          data={disciplineRecords}
          loading={loading}
          searchPlaceholder="Search discipline records by violation or student..."
        />
      )}
    </div>
  );
};



