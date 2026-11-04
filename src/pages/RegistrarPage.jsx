// src/pages/RegistrarPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Printer,
  QrCode
} from 'lucide-react';

export const RegistrarPage = () => {
  const { showToast } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Document Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reqForm, setReqForm] = useState({
    student_id: 1,
    document_type: 'Transcript of Records (TOR)',
    purpose: 'Employment & Licensure Examination',
    copies: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  // Printable Document Certificate Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/registrar/documents');
      if (res.success) setDocuments(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/registrar/documents', reqForm);
      if (res.success) {
        showToast('Document request filed successfully!', 'success');
        setRequestModalOpen(false);
        fetchDocs();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/registrar/documents/${id}/status`, { status: newStatus });
      if (res.success) {
        showToast(`Document marked as: ${newStatus}`, 'success');
        fetchDocs();
        if (previewDoc) {
          setPreviewDoc({ ...previewDoc, status: newStatus });
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Released': return <Badge variant="success">Released</Badge>;
      case 'Ready for Release': return <Badge variant="purple">Ready for Release</Badge>;
      case 'Processing': return <Badge variant="warning">Processing</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Request No.',
      accessor: 'request_number',
      render: (row) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.request_number}</span>,
    },
    {
      header: 'Student Name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.last_name}, {row.first_name}</p>
          <p className="text-[11px] font-mono text-slate-400">{row.student_number} • {row.program_code}</p>
        </div>
      ),
    },
    {
      header: 'Document Requested',
      accessor: 'document_type',
      render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200">{row.document_type}</span>,
    },
    {
      header: 'Purpose & Copies',
      render: (row) => (
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-300">{row.purpose}</p>
          <p className="text-[10px] text-slate-400">{row.copies} Official Copy/Copies</p>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="glass"
            icon={Printer}
            onClick={() => setPreviewDoc(row)}
          >
            Certificate
          </Button>
          {row.status !== 'Released' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleUpdateStatus(row.id, 'Released')}
            >
              Release
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Office of the University Registrar"
        subtitle="Manage official academic credential requests, Transcripts of Record (TOR), Good Moral certifications, and verifiable digital releases"
        actions={
          <Button
            variant="primary"
            icon={FileText}
            onClick={() => setRequestModalOpen(true)}
          >
            File Document Request
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={documents}
        loading={loading}
        searchPlaceholder="Search by student name, request number, or credential type..."
      />

      {/* New Document Request Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="File Registrar Document Request"
        subtitle="Request official academic certifications or credentials"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
            <select
              value={reqForm.student_id}
              onChange={e => setReqForm({ ...reqForm, student_id: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="1">2026-10001 - Reyes, Keno (BSCS)</option>
              <option value="2">2026-10002 - Santos, Sophia (BSCS)</option>
              <option value="3">2026-10003 - Tan, Liam (BSCS)</option>
              <option value="4">2026-10004 - Del Rosario, Isabella (BSCS)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Document Type *</label>
            <select
              value={reqForm.document_type}
              onChange={e => setReqForm({ ...reqForm, document_type: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Transcript of Records (TOR)">Transcript of Records (TOR)</option>
              <option value="Certificate of Good Moral Character">Certificate of Good Moral Character</option>
              <option value="Certificate of Enrollment">Certificate of Enrollment</option>
              <option value="Transfer Credential / Honorable Dismissal">Transfer Credential / Honorable Dismissal</option>
              <option value="Clearance Certificate">Clearance Certificate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Purpose of Request *</label>
            <input
              type="text"
              required
              value={reqForm.purpose}
              onChange={e => setReqForm({ ...reqForm, purpose: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Number of Copies</label>
            <input
              type="number"
              min="1"
              max="5"
              value={reqForm.copies}
              onChange={e => setReqForm({ ...reqForm, copies: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setRequestModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>File Request</Button>
          </div>
        </form>
      </Modal>

      {/* Official Verifiable Certificate Printout Modal */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title="Official Academic Certification Preview"
        subtitle="Verifiable Credential Document with Security QR Seal"
        maxWidth="max-w-3xl"
      >
        {previewDoc && (
          <div className="space-y-6">
            <div className="p-8 sm:p-12 bg-white text-slate-900 rounded-3xl border-2 border-indigo-900 print-card shadow-lg relative overflow-hidden">
              {/* Subtle background seal watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none text-[220px]">
                🎓
              </div>

              {/* Certificate Header */}
              <div className="text-center pb-6 border-b-2 border-indigo-950">
                <div className="w-16 h-16 rounded-3xl bg-indigo-950 text-white flex items-center justify-center mx-auto text-3xl font-extrabold mb-2 shadow-md">
                  🎓
                </div>
                <h2 className="text-2xl font-serif font-extrabold uppercase tracking-widest text-indigo-950">
                  Apex State University
                </h2>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                  Republic of the Philippines • Office of the University Registrar
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  100 University Boulevard, Metro Manila • accreditation ISO 9001:2015
                </p>
              </div>

              {/* Title */}
              <div className="text-center my-8">
                <h3 className="text-xl sm:text-2xl font-serif font-bold uppercase text-indigo-900 tracking-wider">
                  {previewDoc.document_type}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Reference No: {previewDoc.request_number}
                </p>
              </div>

              {/* Body Text */}
              <div className="text-sm leading-relaxed text-slate-700 space-y-4 my-6 font-serif">
                <p>
                  <strong>TO WHOM IT MAY CONCERN:</strong>
                </p>
                <p className="text-justify indent-8">
                  This is to officially certify that <strong className="text-indigo-950 underline">{previewDoc.first_name} {previewDoc.last_name}</strong> (Student No. <span className="font-mono font-bold">{previewDoc.student_number}</span>) is a bona fide student of Apex State University, enrolled in the <strong className="text-indigo-950">{previewDoc.program_code}</strong> program.
                </p>
                <p className="text-justify indent-8">
                  Records on file in this office attest that the said student has maintained exemplary moral character, adheres to all university bylaws and codes of conduct, and has no recorded disciplinary infractions or suspensions.
                </p>
                <p className="text-justify indent-8">
                  This certification is issued upon the request of the interested party for the purpose of <strong>{previewDoc.purpose}</strong>.
                </p>
              </div>

              {/* Signatures & QR Code Token Footer */}
              <div className="mt-12 pt-6 border-t border-slate-300 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <QrCode className="w-16 h-16 text-indigo-950" />
                  <div className="text-left text-[10px] text-slate-500">
                    <p className="font-bold text-indigo-900">VERIFIABLE DIGITAL CREDENTIAL</p>
                    <p className="font-mono">Token: {previewDoc.tracking_token}</p>
                    <p>Verify online at: apexsis.edu/verify</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-serif font-bold text-sm text-indigo-950 border-b border-slate-900 pb-1 px-6">
                    DR. ELENA ROBLES, Ph.D.
                  </div>
                  <p className="text-[11px] font-sans font-semibold text-slate-500 uppercase mt-1">
                    University Registrar
                  </p>
                </div>
              </div>
            </div>

            {/* Print button */}
            <div className="flex justify-between items-center pt-2">
              <Badge variant={previewDoc.status === 'Released' ? 'success' : 'warning'}>
                Document Status: {previewDoc.status}
              </Badge>
              <Button
                variant="primary"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Certificate (PDF)
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
