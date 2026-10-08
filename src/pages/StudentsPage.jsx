// src/pages/StudentsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Tabs } from '../components/common/Tabs';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus,
  Eye,
  QrCode,
  GraduationCap,
  BookOpen,
  DollarSign,
  HeartPulse,
  AlertTriangle,
  CheckSquare,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';

export const StudentsPage = () => {
  const { showToast } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  // Selected student for 360° modal
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Add Student modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: 'Male',
    email: '',
    phone: '',
    birth_date: '2005-01-01',
    program_id: 1,
    year_level_id: 1,
    address: '',
    emergency_name: '',
    emergency_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch student roster
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students');
      if (res.success) setStudents(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    api.get('/academic/metadata').then(res => {
      if (res.success) setMetadata(res.data);
    });
  }, []);

  // Open 360° student drawer
  const handleViewStudent = async (studentId) => {
    setSelectedStudentId(studentId);
    setLoadingDetails(true);
    setActiveTab('overview');
    try {
      const res = await api.get(`/students/${studentId}`);
      if (res.success) setStudentDetails(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle register student submit
  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/students', formData);
      if (res.success) {
        showToast(`Student #${res.data.student_number} registered!`, 'success');
        setAddModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Regular': return 'success';
      case 'Irregular': return 'warning';
      case 'Graduating': return 'purple';
      case 'Graduated': return 'info';
      case 'Dropped':
      case 'Suspended': return 'danger';
      default: return 'default';
    }
  };

  const columns = [
    {
      header: 'Student Number',
      accessor: 'student_number',
      render: (row) => (
        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
          {row.student_number}
        </span>
      ),
    },
    {
      header: 'Full Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
            {row.first_name?.[0]}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white leading-tight">
              {row.last_name}, {row.first_name} {row.middle_name || ''}
            </p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Degree Program',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.program_code}
          </span>
          <span className="text-xs text-slate-400 block">{row.year_level_name}</span>
        </div>
      ),
    },
    {
      header: 'Section',
      accessor: 'section_name',
      render: (row) => row.section_name || 'Unassigned',
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>{row.status}</Badge>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <Button
          size="sm"
          variant="glass"
          icon={Eye}
          onClick={() => handleViewStudent(row.id)}
        >
          View 360°
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student 360° Directory"
        subtitle="Comprehensive student lifecycle management, records, enrollment, and academic profile"
        actions={
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setAddModalOpen(true)}
          >
            Register Student
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        searchPlaceholder="Search by student number, name, or email..."
      />

      {/* 360° Student Dossier Modal */}
      <Modal
        isOpen={!!selectedStudentId}
        onClose={() => {
          setSelectedStudentId(null);
          setStudentDetails(null);
        }}
        title={studentDetails ? `${studentDetails.first_name} ${studentDetails.last_name}` : 'Student Profile'}
        subtitle={studentDetails ? `Student ID: ${studentDetails.student_number} • ${studentDetails.program_name}` : 'Loading...'}
        maxWidth="max-w-4xl"
      >
        {loadingDetails || !studentDetails ? (
          <LoadingSpinner label="Compiling 360° student records..." />
        ) : (
          <div className="space-y-6">
            {/* Tab navigation */}
            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={[
                { id: 'overview', label: 'Overview', icon: GraduationCap },
                { id: 'subjects', label: 'Enrolled Classes', icon: BookOpen },
                { id: 'grades', label: 'Grades', icon: Award },
                { id: 'finance', label: 'Finances', icon: DollarSign },
                { id: 'clearance', label: 'Clearance', icon: CheckSquare },
                { id: 'welfare', label: 'Health & Welfare', icon: HeartPulse },
              ]}
            />

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
                    {studentDetails.first_name[0]}
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {studentDetails.first_name} {studentDetails.last_name}
                  </h4>
                  <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {studentDetails.student_number}
                  </p>
                  <div className="mt-3">
                    <Badge variant={getStatusBadgeVariant(studentDetails.status)}>
                      {studentDetails.status}
                    </Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-slate-800 w-full text-xs text-slate-500">
                    <p className="font-bold text-slate-700 dark:text-slate-300">GPA: {studentDetails.gpa || '1.25'}</p>
                    <p className="text-[11px] mt-0.5">Admitted: {studentDetails.admission_date}</p>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Contact & Demographic Information
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Email Address</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{studentDetails.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Mobile Phone</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{studentDetails.phone || 'None provided'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Gender & Blood Type</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{studentDetails.gender} • {studentDetails.blood_type || 'O+'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Address</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{studentDetails.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Parent / Guardian Information
                    </h5>
                    {studentDetails.guardians?.length > 0 ? (
                      studentDetails.guardians.map((g, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{g.full_name} ({g.relationship})</p>
                            <p className="text-slate-400">{g.occupation || 'Guardian'} • {g.phone}</p>
                          </div>
                          {g.is_authorized_pickup ? (
                            <Badge variant="success">Authorized Pickup</Badge>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No guardian registered.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Enrolled Subjects */}
            {activeTab === 'subjects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500">
                    Current Semester Load: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{studentDetails.current_enrollment?.total_units || 15} Units</span>
                  </p>
                  <Badge variant="success">
                    {studentDetails.current_enrollment?.status || 'Enrolled'}
                  </Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Course Code</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Units</th>
                        <th className="p-3">Day & Time</th>
                        <th className="p-3">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(studentDetails.enrolled_subjects || []).map((sub, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{sub.code}</td>
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{sub.title}</td>
                          <td className="p-3">{sub.credit_units || 3}</td>
                          <td className="p-3">{sub.day_of_week ? `${sub.day_of_week} ${sub.start_time}` : 'TBA'}</td>
                          <td className="p-3">{sub.room_number || 'Online'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Grades */}
            {activeTab === 'grades' && (
              <div className="space-y-4">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Written</th>
                      <th className="p-3">Performance</th>
                      <th className="p-3">Exam</th>
                      <th className="p-3 font-bold">Final Grade</th>
                      <th className="p-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(studentDetails.grades || []).map((g, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-slate-800 dark:text-white">{g.subject_code} - {g.subject_title}</td>
                        <td className="p-3">{g.written_works}%</td>
                        <td className="p-3">{g.performance_tasks}%</td>
                        <td className="p-3">{g.quarterly_exam}%</td>
                        <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{g.final_grade}%</td>
                        <td className="p-3">
                          <Badge variant={g.remarks === 'Passed' ? 'success' : 'danger'}>{g.remarks}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: Finances */}
            {activeTab === 'finance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-400">Total Invoiced</p>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                      ₱{(studentDetails.invoices || []).reduce((acc, i) => acc + Number(i.amount), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Total Payments Recorded</p>
                    <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                      ₱{(studentDetails.payments || []).reduce((acc, p) => acc + Number(p.amount), 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <h5 className="text-xs font-bold text-slate-400 uppercase mt-4">Payment Receipts</h5>
                <div className="space-y-2">
                  {(studentDetails.payments || []).map((pay, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{pay.or_number}</p>
                        <p className="text-slate-400">{pay.payment_method} • Ref: {pay.reference_no || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">₱{Number(pay.amount).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">{pay.payment_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Clearance */}
            {activeTab === 'clearance' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">Institutional Clearance Status</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Verification Token: {studentDetails.clearance?.clearance_token || 'TOKEN-CLR-2026'}</p>
                  </div>
                  <Badge variant={studentDetails.clearance?.overall_status === 'Cleared' ? 'success' : 'warning'}>
                    {studentDetails.clearance?.overall_status || 'Pending'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {['registrar', 'accounting', 'library', 'guidance', 'clinic', 'department'].map((dept) => {
                    const status = studentDetails.clearance ? studentDetails.clearance[`${dept}_status`] : 'Pending';
                    return (
                      <div key={dept} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{dept}</span>
                        <Badge variant={status === 'Cleared' ? 'success' : (status === 'Hold' ? 'danger' : 'warning')}>
                          {status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 6: Welfare & Clinic */}
            {activeTab === 'welfare' && (
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase">Clinic Visits & Medical Log</h5>
                {(studentDetails.clinic_records || []).map((visit, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{visit.diagnosis}</span>
                      <span className="text-slate-400">{visit.visit_date}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">Vitals: {visit.vital_signs}</p>
                    <p className="text-slate-600 dark:text-slate-300">Prescription: {visit.prescription || 'Rest only'}</p>
                    <p className="text-slate-400 text-[11px]">Attended by: {visit.attended_by}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Register Student Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Student"
        subtitle="Create official academic profile and student record"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Degree Program *</label>
              <select
                value={formData.program_id}
                onChange={e => setFormData({ ...formData, program_id: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {(metadata?.programs || []).map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Year Level *</label>
              <select
                value={formData.year_level_id}
                onChange={e => setFormData({ ...formData, year_level_id: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {(metadata?.yearLevels || []).map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Permanent Residential Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Register Student</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
