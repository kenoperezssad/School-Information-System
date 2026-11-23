// src/pages/EnrollmentPage.jsx
import React, { useState, useEffect } from 'react';
import { PesoSign } from '../components/common/PesoSign';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  FileCheck,
  Printer,
  QrCode,
  BookOpen,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const EnrollmentPage = () => {
  const { showToast } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // View / Print COR Modal
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [loadingCor, setLoadingCor] = useState(false);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/enrollments');
      if (res.success && res.data) setEnrollments(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleOpenCor = async (id) => {
    setLoadingCor(true);
    try {
      const res = await api.get(`/enrollments/${id}`);
      if (res.success) {
        setSelectedEnrollment(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingCor(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.post(`/enrollments/${id}/status`, { status: newStatus });
      if (res.success) {
        showToast(`Enrollment transitioned to: ${newStatus}`, 'success');
        fetchEnrollments();
        if (selectedEnrollment) {
          setSelectedEnrollment({ ...selectedEnrollment, status: newStatus });
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Enrolled': return <Badge variant="success">Enrolled</Badge>;
      case 'Paid': return <Badge variant="info">Paid</Badge>;
      case 'For Payment': return <Badge variant="warning">For Payment</Badge>;
      case 'Assessed': return <Badge variant="purple">Assessed</Badge>;
      case 'Pending': return <Badge variant="default">Pending</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'COR Number',
      accessor: 'cor_number',
      render: (row) => <span className="font-mono font-bold text-navy-700 dark:text-navy-400">{row.cor_number}</span>,
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
      header: 'Program & Section',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{row.program_code}</span>
          <span className="text-xs text-slate-400 block">{row.section_name}</span>
        </div>
      ),
    },
    {
      header: 'Total Units',
      render: (row) => <span className="font-bold text-slate-700 dark:text-slate-300">{row.total_units} Units</span>,
    },
    {
      header: 'Net Assessment',
      render: (row) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          PHP {Number(row.net_amount).toLocaleString()}
        </span>
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
            icon={FileCheck}
            onClick={() => handleOpenCor(row.id)}
          >
            View COR
          </Button>
          {row.status !== 'Enrolled' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleUpdateStatus(row.id, 'Enrolled')}
            >
              Set Enrolled
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment & Registration Hub"
        subtitle="Manage student course loads, fee assessments, status progression, and Certificate of Registration (COR) generation"
      />

      <DataTable
        columns={columns}
        data={enrollments}
        loading={loading}
        searchPlaceholder="Search by student name, COR number, or student ID..."
      />

      {/* Official Printable COR Modal */}
      <Modal
        isOpen={!!selectedEnrollment}
        onClose={() => setSelectedEnrollment(null)}
        title="Official Certificate of Registration (COR)"
        subtitle="University Form 01 - Office of the University Registrar"
        maxWidth="max-w-4xl"
      >
        {selectedEnrollment && (
          <div className="space-y-6">
            {/* Printable Document Box */}
            <div className="p-6 sm:p-8 bg-white text-slate-900 rounded-2xl border border-slate-300 print-card shadow-sm space-y-6">
              {/* Document Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-navy-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-lg">
                    🎓
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold uppercase tracking-tight text-navy-700">
                      Apex State University System
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      Office of the Registrar • Main Metro Campus
                    </p>
                    <p className="text-[11px] font-bold text-navy-700">
                      CERTIFICATE OF REGISTRATION & MATRICULATION
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-slate-700">
                    COR NO: {selectedEnrollment.cor_number}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Date Issued: {new Date(selectedEnrollment.enrollment_date).toLocaleDateString()}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedEnrollment.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Student Bio Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Number</span>
                  <span className="font-mono font-bold text-navy-700">{selectedEnrollment.student_number}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name</span>
                  <span className="font-bold text-slate-900">{selectedEnrollment.last_name}, {selectedEnrollment.first_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Degree & Section</span>
                  <span className="font-semibold text-slate-900">{selectedEnrollment.program_code} • {selectedEnrollment.section_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Term</span>
                  <span className="font-semibold text-slate-900">{selectedEnrollment.academic_year} ({selectedEnrollment.semester_name})</span>
                </div>
              </div>

              {/* Enrolled Courses Schedule Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Officially Enrolled Subjects & Class Schedule
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                      <tr>
                        <th className="p-2.5">Code</th>
                        <th className="p-2.5">Course Description</th>
                        <th className="p-2.5 text-center">Lec</th>
                        <th className="p-2.5 text-center">Lab</th>
                        <th className="p-2.5 text-center">Units</th>
                        <th className="p-2.5">Day & Time</th>
                        <th className="p-2.5">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(selectedEnrollment.subjects || []).map((sub, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-mono font-bold text-navy-700">{sub.code}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{sub.title}</td>
                          <td className="p-2.5 text-center">{sub.lecture_units}</td>
                          <td className="p-2.5 text-center">{sub.lab_units}</td>
                          <td className="p-2.5 text-center font-bold">{sub.credit_units}</td>
                          <td className="p-2.5 text-slate-700">{sub.day_of_week ? `${sub.day_of_week} ${sub.start_time?.substring(0,5)}-${sub.end_time?.substring(0,5)}` : 'TBA'}</td>
                          <td className="p-2.5 text-slate-700">{sub.room_number || 'Room TBA'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="p-2.5 text-right uppercase">Total Academic Load Units:</td>
                        <td className="p-2.5 text-center text-navy-700 text-sm">{selectedEnrollment.total_units}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Assessment Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <span className="font-bold uppercase text-[10px] text-slate-500 block">Schedule of Fees Assessment</span>
                  <div className="flex justify-between">
                    <span>Tuition Fee Assessment:</span>
                    <span className="font-semibold">PHP {Number(selectedEnrollment.tuition_amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Laboratory & Misc Fees:</span>
                    <span className="font-semibold">PHP {Number(selectedEnrollment.misc_amount).toLocaleString()}</span>
                  </div>
                  {Number(selectedEnrollment.discount_amount) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Institutional Scholarship Grant:</span>
                      <span>-PHP {Number(selectedEnrollment.discount_amount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-navy-700">
                    <span>Net Amount Due:</span>
                    <span>PHP {Number(selectedEnrollment.net_amount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-navy-50/60 border border-navy-200 text-xs flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-12 h-12 text-navy-700" />
                    <div>
                      <p className="font-bold text-navy-700">Digital Document Seal</p>
                      <p className="text-[10px] text-navy-700">
                        Token: {selectedEnrollment.cor_number}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Cryptographically stamped by University Registrar
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-navy-200 text-center">
                    <p className="font-bold text-slate-800">DR. ELENA ROBLES, Ph.D.</p>
                    <p className="text-[10px] text-slate-500 uppercase">University Registrar</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Print & Action Footer */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedEnrollment.id, 'Assessed')}
                >
                  Mark Assessed
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedEnrollment.id, 'For Payment')}
                >
                  Mark For Payment
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedEnrollment.id, 'Enrolled')}
                >
                  Confirm Officially Enrolled
                </Button>
              </div>

              <Button
                variant="primary"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Official COR (PDF)
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};



