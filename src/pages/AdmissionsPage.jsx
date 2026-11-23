// src/pages/AdmissionsPage.jsx
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
  UserPlus,
  CheckCircle,
  FileText,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';

export const AdmissionsPage = () => {
  const { showToast } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  // New Application Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newApplicant, setNewApplicant] = useState({
    applicant_name: '',
    email: '',
    phone: '',
    program_id: 1,
    remarks: 'Online applicant inquiry',
  });
  const [submitting, setSubmitting] = useState(false);

  // Evaluate / Score Modal
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [evalForm, setEvalForm] = useState({
    status: 'Exam Passed',
    exam_score: 85,
    interview_notes: '',
    remarks: '',
  });

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admissions');
      if (res.success && res.data) setApplicants(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
    api.get('/academic/metadata').then(res => {
      if (res.success && res.data) setMetadata(res.data);
    });
  }, []);

  const handleCreateApplicant = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admissions', newApplicant);
      if (res.success) {
        showToast('Application filed successfully!', 'success');
        setAddModalOpen(false);
        fetchApplicants();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEval = (app) => {
    setSelectedApp(app);
    setEvalForm({
      status: app.status,
      exam_score: app.exam_score || 85,
      interview_notes: app.interview_notes || '',
      remarks: app.remarks || '',
    });
    setEvalModalOpen(true);
  };

  const handleUpdateEval = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/admissions/${selectedApp.id}`, evalForm);
      if (res.success) {
        showToast('Applicant evaluation recorded.', 'success');
        setEvalModalOpen(false);
        fetchApplicants();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertStudent = async (appId) => {
    if (!window.confirm('Approve this applicant and officially create their University Student Profile?')) return;
    try {
      const res = await api.post(`/admissions/${appId}/approve`);
      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast(`Student record officially created: #${res.data.student_number}!`, 'success');
        fetchApplicants();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Enrolled': return <Badge variant="success">Enrolled</Badge>;
      case 'Approved': return <Badge variant="purple">Approved</Badge>;
      case 'Interviewed': return <Badge variant="info">Interviewed</Badge>;
      case 'Exam Passed': return <Badge variant="warning">Exam Passed</Badge>;
      case 'Rejected': return <Badge variant="danger">Rejected</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Application No.',
      accessor: 'application_no',
      render: (row) => <span className="font-mono font-bold text-navy-700 dark:text-navy-400">{row.application_no}</span>,
    },
    {
      header: 'Applicant Name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.applicant_name}</p>
          <p className="text-[11px] text-slate-400">{row.email} • {row.phone}</p>
        </div>
      ),
    },
    {
      header: 'Target Degree',
      render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-300">{row.program_code}</span>,
    },
    {
      header: 'Exam Score',
      render: (row) => (
        row.exam_score ? (
          <span className="font-extrabold text-slate-900 dark:text-white">{row.exam_score}%</span>
        ) : (
          <span className="text-slate-400 text-xs italic">Pending Test</span>
        )
      ),
    },
    {
      header: 'Stage Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Workflow Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="glass"
            icon={ClipboardCheck}
            onClick={() => handleOpenEval(row)}
          >
            Review
          </Button>
          {row.status !== 'Enrolled' && (
            <Button
              size="sm"
              variant="success"
              icon={Sparkles}
              onClick={() => handleConvertStudent(row.id)}
            >
              Approve Student
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions & Application Pipeline"
        subtitle="Entrance examination evaluation, interview committee scoring, and matriculation approval workflow"
        actions={
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setAddModalOpen(true)}
          >
            New Applicant Form
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={applicants}
        loading={loading}
        searchPlaceholder="Search applicants by name, application number, or email..."
      />

      {/* New Applicant Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="New University Applicant Registration"
        subtitle="File candidate application into admissions queue"
      >
        <form onSubmit={handleCreateApplicant} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Applicant Name *</label>
            <input
              type="text"
              required
              value={newApplicant.applicant_name}
              onChange={e => setNewApplicant({ ...newApplicant, applicant_name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                value={newApplicant.email}
                onChange={e => setNewApplicant({ ...newApplicant, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={newApplicant.phone}
                onChange={e => setNewApplicant({ ...newApplicant, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Applying For Program *</label>
            <select
              value={newApplicant.program_id}
              onChange={e => setNewApplicant({ ...newApplicant, program_id: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              {(metadata?.programs || []).map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Submit Application</Button>
          </div>
        </form>
      </Modal>

      {/* Evaluate Applicant Modal */}
      <Modal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        title={`Evaluation: ${selectedApp?.applicant_name}`}
        subtitle={`Application #${selectedApp?.application_no}`}
      >
        <form onSubmit={handleUpdateEval} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pipeline Status</label>
              <select
                value={evalForm.status}
                onChange={e => setEvalForm({ ...evalForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Pending">Pending</option>
                <option value="Requirements Submitted">Requirements Submitted</option>
                <option value="Exam Scheduled">Exam Scheduled</option>
                <option value="Exam Passed">Exam Passed</option>
                <option value="Interviewed">Interviewed</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Entrance Exam Score (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={evalForm.exam_score}
                onChange={e => setEvalForm({ ...evalForm, exam_score: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Panel Interview Feedback</label>
            <textarea
              rows="3"
              value={evalForm.interview_notes}
              onChange={e => setEvalForm({ ...evalForm, interview_notes: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              placeholder="Candidate communications skills, problem solving aptitude..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setEvalModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save Evaluation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};



