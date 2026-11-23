// src/pages/StudentsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { PesoSign } from '../components/common/PesoSign';
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
  HeartPulse,
  AlertTriangle,
  CheckSquare,
  Award,
  Phone,
  Mail,
  MapPin,
  Calendar,
  RefreshCw,
  Edit,
  Printer,
  Download,
  ShieldCheck,
  Sparkles,
  Filter,
  CheckCircle2,
  Building,
  CreditCard,
  FileText,
  Save,
  Check
} from 'lucide-react';

export const StudentsPage = () => {
  const { showToast } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  // Quick filter chips
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Selected student for 360° modal
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Edit Student Form State (Tab: 'edit')
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    status: 'Regular',
    blood_type: 'O+',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Add Student modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
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
      if (res.success && res.data) setStudents(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    api.get('/academic/metadata').then(res => {
      if (res.success && res.data) setMetadata(res.data);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => { fetchStudents(); }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize editFormData when studentDetails changes
  useEffect(() => {
    if (studentDetails) {
      setEditFormData({
        first_name: studentDetails.first_name || '',
        last_name: studentDetails.last_name || '',
        phone: studentDetails.phone || '',
        email: studentDetails.email || '',
        address: studentDetails.address || '',
        status: studentDetails.status || 'Regular',
        blood_type: studentDetails.blood_type || 'O+',
      });
    }
  }, [studentDetails]);

  const handleOpenAddModal = () => {
    setFormErrors({});
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setFormErrors({});
    setAddModalOpen(false);
  };

  // Open 360° student drawer
  const handleViewStudent = async (studentId) => {
    setSelectedStudentId(studentId);
    setLoadingDetails(true);
    setActiveTab('overview');
    try {
      const res = await api.get(`/students/${studentId}`);
      if (res.success && res.data) setStudentDetails(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle Edit Information Save Changes
  const handleSaveStudentInfo = async (e) => {
    if (e) e.preventDefault();
    if (!editFormData.first_name.trim() || !editFormData.last_name.trim()) {
      showToast('First and last name are required.', 'error');
      return;
    }
    if (!editFormData.email.trim()) {
      showToast('Email address is required.', 'error');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await api.put(`/students/${studentDetails.id}`, editFormData);
      if (res.success) {
        showToast('Student profile updated successfully!', 'success');
        // Update local studentDetails state
        setStudentDetails((prev) => ({
          ...prev,
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          phone: editFormData.phone,
          email: editFormData.email,
          address: editFormData.address,
          status: editFormData.status,
          blood_type: editFormData.blood_type,
        }));
        // Refresh student roster
        fetchStudents();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update student profile', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.first_name.trim()) errs.first_name = 'First name is required';
    if (!formData.last_name.trim()) errs.last_name = 'Last name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format';
    if (formData.phone && !/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) errs.phone = 'Phone must be 10-11 digits';
    if (!formData.birth_date) errs.birth_date = 'Birth date is required';
    return errs;
  };

  // Handle register student submit
  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSubmitting(true);
    try {
      const res = await api.post('/students', formData);
      if (res.success) {
        showToast(`Student #${res.data.student_number} registered!`, 'success');
        handleCloseAddModal();
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

  // Quick Filter Chips definition and filtering
  const filterChips = useMemo(() => {
    const bscsCount = students.filter((s) => s.program_code === 'BSCS').length;
    const bsitCount = students.filter((s) => s.program_code === 'BSIT').length;
    const bsbaCount = students.filter((s) => s.program_code === 'BSBA').length;
    const bsnCount = students.filter((s) => s.program_code === 'BSN').length;
    const deansCount = students.filter((s) => {
      const gpa = parseFloat(s.gpa);
      return !isNaN(gpa) && gpa > 0 && gpa <= 1.5;
    }).length;

    return [
      { id: 'ALL', label: 'All Students', count: students.length },
      { id: 'BSCS', label: 'BSCS', count: bscsCount },
      { id: 'BSIT', label: 'BSIT', count: bsitCount },
      { id: 'BSBA', label: 'BSBA', count: bsbaCount },
      { id: 'BSN', label: 'BSN', count: bsnCount },
      {
        id: 'DEAN',
        label: "Dean's Listers",
        count: deansCount,
        icon: Award,
        isHonor: true,
      },
    ];
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (selectedFilter === 'ALL') return students;
    if (selectedFilter === 'DEAN') {
      return students.filter((s) => {
        const gpa = parseFloat(s.gpa);
        return !isNaN(gpa) && gpa > 0 && gpa <= 1.5;
      });
    }
    return students.filter((s) => s.program_code === selectedFilter);
  }, [students, selectedFilter]);

  const columns = [
    {
      header: 'Student Number',
      accessor: 'student_number',
      render: (row) => (
        <span className="font-mono font-bold text-navy-700 dark:text-navy-400">
          {row.student_number}
        </span>
      ),
    },
    {
      header: 'Full Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-navy-100 dark:bg-navy-950/60 text-navy-700 dark:text-navy-300 flex items-center justify-center font-bold text-xs shrink-0">
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
      header: 'GPA',
      render: (row) => {
        const gpa = parseFloat(row.gpa);
        const isDean = !isNaN(gpa) && gpa > 0 && gpa <= 1.5;
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-semibold text-xs text-slate-700 dark:text-slate-300">
              {row.gpa || '1.25'}
            </span>
            {isDean && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                Honor
              </span>
            )}
          </div>
        );
      },
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

  // Helper for Academic Standing on TOR
  const getAcademicStanding = (gpaVal) => {
    const val = parseFloat(gpaVal);
    if (isNaN(val) || val <= 0) return "Regular Academic Standing";
    if (val <= 1.20) return "Dean's Lister - First Honors (Summa Cum Laude Standing)";
    if (val <= 1.50) return "Dean's Lister - First Honors";
    if (val <= 1.75) return "Dean's Lister - Second Honors";
    if (val <= 2.25) return "Good Academic Standing";
    return "Satisfactory Standing";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student 360° Directory"
        subtitle="Comprehensive student lifecycle management, records, enrollment, and academic profile"
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={fetchStudents}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={handleOpenAddModal}
            >
              Register Student
            </Button>
          </>
        }
      />

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 mr-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <Filter className="w-3.5 h-3.5 text-navy-600" />
          <span>Quick Filter:</span>
        </div>
        {filterChips.map((chip) => {
          const isActive = selectedFilter === chip.id;
          const ChipIcon = chip.icon;
          return (
            <button
              key={chip.id}
              onClick={() => setSelectedFilter(chip.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? chip.isHonor
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40'
                    : 'bg-navy-800 text-white shadow-md shadow-navy-800/25 ring-2 ring-navy-500/30'
                  : chip.isHonor
                  ? 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100/80 dark:hover:bg-amber-900/40'
                  : 'bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-200/70 dark:hover:bg-slate-750'
              }`}
            >
              {ChipIcon && <ChipIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-amber-500'}`} />}
              <span>{chip.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : chip.isHonor
                    ? 'bg-amber-200/70 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
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
        maxWidth="max-w-5xl"
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
                { id: 'idcard', label: 'Digital Student ID', icon: QrCode },
                { id: 'edit', label: 'Edit Info', icon: Edit },
                { id: 'tor', label: 'Official TOR', icon: Award },
                { id: 'subjects', label: 'Enrolled Classes', icon: BookOpen },
                { id: 'grades', label: 'Grades', icon: Award },
                { id: 'finance', label: 'Finances', icon: PesoSign },
                { id: 'clearance', label: 'Clearance', icon: CheckSquare },
                { id: 'welfare', label: 'Health & Welfare', icon: HeartPulse },
              ]}
            />

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-navy-50/50 dark:bg-slate-800/60 border border-navy-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-navy-800 to-navy-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-navy-700/30 mb-3">
                    {studentDetails.first_name[0]}
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {studentDetails.first_name} {studentDetails.last_name}
                  </h4>
                  <p className="text-xs font-mono font-bold text-navy-700 dark:text-navy-400 mt-0.5">
                    {studentDetails.student_number}
                  </p>
                  <div className="mt-3">
                    <Badge variant={getStatusBadgeVariant(studentDetails.status)}>
                      {studentDetails.status}
                    </Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t border-navy-100 dark:border-slate-800 w-full text-xs text-slate-500">
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

            {/* Tab: Digital PVC Student ID Card */}
            {activeTab === 'idcard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-navy-700 dark:text-navy-400" />
                      Official PVC Digital Student Identity Badge
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      High-fidelity contactless smart card with biometric verification & magnetic stripe security
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Printer}
                    onClick={() => {
                      showToast('Preparing Digital Student ID Badge for print...', 'info');
                      window.print();
                    }}
                  >
                    Print / Download ID Badge
                  </Button>
                </div>

                {/* ID Card Front and Back Preview Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start justify-center py-2">
                  {/* FRONT OF CARD */}
                  <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Front Side (Face)</p>
                    <div className="w-full max-w-[430px] aspect-[1.586/1] rounded-3xl p-5 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-navy-700 to-slate-950 text-white border border-navy-600/30 flex flex-col justify-between">
                      {/* Holographic Sheen Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-navy-700/10 to-amber-400/10 pointer-events-none" />
                      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-navy-700/20 blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-navy-700/20 blur-2xl pointer-events-none" />

                      {/* Header */}
                      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/30 text-slate-950">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-extrabold text-[11px] tracking-wider uppercase bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                              Apex State University
                            </h5>
                            <p className="text-[9px] tracking-widest text-navy-300 uppercase font-semibold">
                              Metro Campus • Office of Student Affairs
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-mono tracking-wider font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
                            VALID UNTIL AY 2026-2027
                          </span>
                        </div>
                      </div>

                      {/* Center Body: Photo, EMV Chip & Details */}
                      <div className="relative z-10 grid grid-cols-12 gap-3 items-center my-auto py-1">
                        {/* Student Avatar with Holographic Shine Border */}
                        <div className="col-span-4 flex flex-col items-center">
                          <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-navy-600 via-navy-700 to-navy-800 shadow-lg shadow-navy-900/25">
                            <div className="w-20 h-24 rounded-xl bg-gradient-to-b from-navy-800 to-slate-900 flex flex-col items-center justify-center text-white font-extrabold text-2xl overflow-hidden relative">
                              {studentDetails.photo_url ? (
                                <img
                                  src={studentDetails.photo_url}
                                  alt="Student"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <>
                                  <span className="text-3xl text-amber-300">{studentDetails.first_name[0]}</span>
                                  <span className="text-[8px] font-mono tracking-widest text-navy-300 uppercase mt-1">APEX ID</span>
                                </>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10" />
                            </div>
                            {/* Hologram badge chip overlay */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md">
                              <Sparkles className="w-3 h-3" />
                            </div>
                          </div>
                        </div>

                        {/* Name & Academic Credentials */}
                        <div className="col-span-8 space-y-1.5 pl-1">
                          {/* Smart EMV Chip Graphic */}
                          <div className="w-9 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 border border-amber-300/80 shadow-inner flex flex-col justify-around p-1 opacity-90">
                            <div className="h-[1px] bg-amber-700/60 w-full" />
                            <div className="h-[1px] bg-amber-700/60 w-full" />
                          </div>

                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-navy-300 font-medium">Student Name</p>
                            <h3 className="font-extrabold text-sm sm:text-base leading-tight tracking-wide text-white drop-shadow-sm">
                              {studentDetails.first_name} {studentDetails.middle_name || ''} {studentDetails.last_name}
                            </h3>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-navy-300 font-medium">Student No.</p>
                              <p className="font-mono font-bold text-xs text-amber-300 tracking-wider">
                                {studentDetails.student_number}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-navy-300 font-medium">Program</p>
                              <p className="font-bold text-xs text-white">
                                {studentDetails.program_code}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-slate-300 pt-0.5">
                            <span>Year: <strong className="text-white">{studentDetails.year_level_name || '1st Year'}</strong></span>
                            <span>Status: <strong className="text-emerald-300">{studentDetails.status}</strong></span>
                            <span>Blood: <strong className="text-rose-300">{studentDetails.blood_type || 'O+'}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Footer: Barcode & Security Badge */}
                      <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between">
                        {/* Barcode Graphic Pattern */}
                        <div className="flex flex-col">
                          <div className="flex items-end gap-[2px] h-6 px-1 bg-white/95 rounded-sm py-1">
                            {[2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 4, 1, 2].map((w, idx) => (
                              <div
                                key={idx}
                                className="bg-black h-full"
                                style={{ width: `${w}px` }}
                              />
                            ))}
                          </div>
                          <span className="font-mono text-[8px] text-slate-400 tracking-widest text-center mt-0.5">
                            *{studentDetails.student_number}*
                          </span>
                        </div>

                        {/* Security Holographic QR & Verification Badge */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg border border-white/15">
                            <QrCode className="w-4 h-4 text-amber-300" />
                            <div className="text-[8px] font-mono leading-none">
                              <span className="block text-navy-200 font-bold">RFID/NFC</span>
                              <span className="text-[7px] text-slate-300">ACTIVE</span>
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-navy-700 p-[1.5px] shadow-sm">
                            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-[7px] font-bold text-amber-300">
                              ASU
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BACK OF CARD */}
                  <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Back Side (Security & Terms)</p>
                    <div className="w-full max-w-[430px] aspect-[1.586/1] rounded-3xl shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-navy-700 text-white border border-slate-700/50 flex flex-col justify-between">
                      {/* Black Magnetic Stripe */}
                      <div className="w-full h-11 bg-black shadow-inner mt-4 border-y border-white/5 relative flex items-center px-4">
                        <span className="text-[7px] font-mono text-slate-600 tracking-widest uppercase">
                          MAGNETIC ENCODING • TRACK 1 & 2 SECURE • APEXSIS CARDNET
                        </span>
                      </div>

                      {/* Terms & Conditions Body */}
                      <div className="p-4 space-y-2 text-[8px] text-slate-300">
                        <p className="leading-tight text-slate-300 font-light">
                          <strong className="text-white font-semibold">TERMS & CONDITIONS:</strong> This official identity card is non-transferable and remains the sole property of Apex State University. Must be worn or presented upon campus entry and upon demand by authorized security personnel.
                        </p>

                        {/* Emergency Contact Information */}
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold uppercase tracking-wider text-amber-300 text-[8px]">In Case of Emergency Notify:</span>
                            <span className="font-mono text-rose-300 font-bold">Blood: {studentDetails.blood_type || 'O+'}</span>
                          </div>
                          <p className="font-bold text-white text-[9px]">
                            {studentDetails.emergency_contact_name || studentDetails.guardians?.[0]?.full_name || 'Emergency University Hotline'}
                          </p>
                          <p className="text-slate-300">
                            Contact: {studentDetails.emergency_contact_phone || studentDetails.guardians?.[0]?.phone || '(02) 8888-APEX / 0917-000-0000'}
                          </p>
                          <p className="text-[7.5px] text-slate-400 truncate">
                            Address: {studentDetails.address || 'Metro Manila, Philippines'}
                          </p>
                        </div>

                        {/* Authorized Signature Lines */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="border-t border-slate-500/60 pt-1 text-center">
                            <p className="font-mono text-[7px] tracking-wider text-slate-400 uppercase">
                              Authorized Cardholder Signature
                            </p>
                            <p className="italic text-[9px] text-navy-300 font-serif mt-0.5">
                              {studentDetails.first_name} {studentDetails.last_name}
                            </p>
                          </div>
                          <div className="border-t border-slate-500/60 pt-1 text-center">
                            <p className="font-mono text-[7px] tracking-wider text-slate-400 uppercase">
                              University Registrar Signature
                            </p>
                            <p className="font-serif italic text-[9px] text-amber-300 mt-0.5">
                              Dr. Aristotle V. Ramos
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Microprint & Token Footer */}
                      <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between text-[7px] font-mono text-slate-400">
                        <span>SECURITY TOKEN: {studentDetails.qr_token || `TOKEN-ASU-${studentDetails.student_number}`}</span>
                        <span>ASU-METRO-CAMPUS • ID-REV-2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Edit Information Form */}
            {activeTab === 'edit' && (
              <form onSubmit={handleSaveStudentInfo} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <Edit className="w-5 h-5 text-navy-700 dark:text-navy-400" />
                      Edit Student Information
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Update official profile details, contact information, and institutional enrollment status
                    </p>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={Save}
                    loading={savingEdit}
                  >
                    Save Changes
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.first_name}
                      onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.last_name}
                      onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        required
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-700"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Phone
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        placeholder="+63 917 123 4567"
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-700"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Institutional Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Student Enrollment Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-700"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Irregular">Irregular</option>
                      <option value="Graduating">Graduating</option>
                      <option value="Graduated">Graduated</option>
                      <option value="Transferee">Transferee</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Dropped">Dropped</option>
                    </select>
                  </div>

                  {/* Blood Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Blood Type
                    </label>
                    <select
                      value={editFormData.blood_type}
                      onChange={(e) => setEditFormData({ ...editFormData, blood_type: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-700"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                {/* Permanent Residential Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Permanent Residential Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      placeholder="Street, Barangay, City, Province"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveTab('overview')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={Save}
                    loading={savingEdit}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            )}

            {/* Tab: Official Transcript of Records (TOR) */}
            {activeTab === 'tor' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <Award className="w-5 h-5 text-navy-700 dark:text-navy-400" />
                      Official Transcript of Records (TOR)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Permanent collegiate academic dossier and certified transcript issued by the University Registrar
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Printer}
                    onClick={() => {
                      showToast('Printing Official Transcript of Records (TOR)...', 'info');
                      window.print();
                    }}
                  >
                    Print Official Transcript
                  </Button>
                </div>

                {/* Parchment Styled Official Document Container */}
                <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/30 dark:bg-slate-900 border-2 border-amber-900/15 dark:border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
                  {/* Subtle University Crest Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
                    <GraduationCap className="w-96 h-96 text-slate-900 dark:text-white" />
                  </div>

                  {/* University Seal & Official Header */}
                  <div className="text-center space-y-1 border-b-2 border-amber-900/20 dark:border-slate-700/80 pb-5">
                    <p className="text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase font-semibold">
                      Republic of the Philippines
                    </p>
                    <h2 className="text-xl sm:text-2xl font-serif font-black tracking-wide text-slate-900 dark:text-white uppercase">
                      Apex State University System
                    </h2>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Metro Manila Campus • Office of the University Registrar
                    </p>
                    <div className="inline-block px-3 py-1 mt-2 rounded-full bg-navy-50 dark:bg-navy-950/60 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 font-bold text-xs uppercase tracking-widest">
                      Official Transcript of Records
                    </div>
                  </div>

                  {/* Student Academic Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-amber-900/10 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">Student Name</span>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {studentDetails.last_name}, {studentDetails.first_name} {studentDetails.middle_name || ''}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">Student Number</span>
                      <p className="font-mono font-bold text-navy-700 dark:text-navy-400 text-sm">
                        {studentDetails.student_number}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">Degree Program</span>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {studentDetails.program_name} ({studentDetails.program_code})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">Admission Date & Status</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {studentDetails.admission_date || 'August 15, 2023'} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{studentDetails.status}</span>
                      </p>
                    </div>
                  </div>

                  {/* Completed Courses and Grades Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Course Code</th>
                          <th className="p-3">Descriptive Title</th>
                          <th className="p-3 text-center">Credit Units</th>
                          <th className="p-3 text-center">Grade Point</th>
                          <th className="p-3 text-center">Raw %</th>
                          <th className="p-3 text-center">Term Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {studentDetails.grades && studentDetails.grades.length > 0 ? (
                          studentDetails.grades.map((g, idx) => {
                            const rawGrade = parseFloat(g.final_grade || 92);
                            // Standard 1.0 - 5.0 grade conversion
                            const gpaEquivalent = rawGrade >= 97 ? '1.00' :
                              rawGrade >= 94 ? '1.25' :
                              rawGrade >= 91 ? '1.50' :
                              rawGrade >= 88 ? '1.75' :
                              rawGrade >= 85 ? '2.00' :
                              rawGrade >= 80 ? '2.50' :
                              rawGrade >= 75 ? '3.00' : '5.00';

                            return (
                              <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                                <td className="p-3 font-mono font-bold text-navy-700 dark:text-navy-400">
                                  {g.subject_code}
                                </td>
                                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                                  {g.subject_title}
                                </td>
                                <td className="p-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                                  {g.credit_units || 3.0}
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-navy-700 dark:text-navy-300">
                                  {gpaEquivalent}
                                </td>
                                <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">
                                  {rawGrade.toFixed(2)}%
                                </td>
                                <td className="p-3 text-center">
                                  <Badge variant={g.remarks === 'Passed' ? 'success' : 'danger'}>
                                    {g.remarks || 'Passed'}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          // Default curriculum courses if student has no recorded grades yet
                          [
                            { code: 'CS101', title: 'Introduction to Computer Science & Computing', units: 3, grade: '1.25', raw: '94.50', remarks: 'Passed' },
                            { code: 'CS102', title: 'Data Structures and Algorithm Analysis', units: 3, grade: '1.00', raw: '97.25', remarks: 'Passed' },
                            { code: 'MATH101', title: 'Differential and Integral Calculus I', units: 3, grade: '1.50', raw: '91.00', remarks: 'Passed' },
                            { code: 'ENG101', title: 'Technical Writing & Academic Communication', units: 3, grade: '1.25', raw: '93.50', remarks: 'Passed' },
                            { code: 'CS103', title: 'Object-Oriented Programming (Java/C++)', units: 3, grade: '1.25', raw: '94.00', remarks: 'Passed' },
                          ].map((c, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="p-3 font-mono font-bold text-navy-700 dark:text-navy-400">{c.code}</td>
                              <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{c.title}</td>
                              <td className="p-3 text-center font-semibold text-slate-700 dark:text-slate-300">{c.units}.0</td>
                              <td className="p-3 text-center font-mono font-bold text-navy-700 dark:text-navy-300">{c.grade}</td>
                              <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">{c.raw}%</td>
                              <td className="p-3 text-center"><Badge variant="success">{c.remarks}</Badge></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary & Academic Standing Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-navy-50/60 dark:bg-slate-800/70 border border-navy-100 dark:border-slate-700">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                        Cumulative Grade Point Average (GPA)
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-navy-700 dark:text-navy-300 font-mono">
                          {studentDetails.gpa || '1.25'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">on a 1.00 scale</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                        Official Academic Standing
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500 shrink-0" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {getAcademicStanding(studentDetails.gpa || '1.25')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Registrar Digital Verification & Signatures */}
                  <div className="pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* QR Verification Seal */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="p-2 rounded-xl bg-navy-50 dark:bg-navy-950/60 text-navy-700 dark:text-navy-400">
                        <QrCode className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-[10px] uppercase tracking-wider">
                          Digital Registrar Seal
                        </p>
                        <p className="font-mono text-[9px] text-slate-400">
                          {studentDetails.qr_token || `TOR-VERIFY-${studentDetails.student_number}`}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-bold mt-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Authentic Certified
                        </span>
                      </div>
                    </div>

                    {/* Official Registrar Seal Stamp */}
                    <div className="text-center p-3 rounded-2xl border-2 border-amber-600/30 bg-amber-50/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300">
                      <div className="w-10 h-10 mx-auto rounded-full border-2 border-amber-600 flex items-center justify-center font-serif font-black text-xs">
                        ASU
                      </div>
                      <p className="text-[9px] font-black tracking-widest uppercase mt-1">
                        CERTIFIED TRUE RECORD
                      </p>
                      <p className="text-[8px] text-amber-800/80 dark:text-amber-400/80 uppercase">
                        University Registrar
                      </p>
                    </div>

                    {/* Signature Line */}
                    <div className="text-center space-y-1">
                      <div className="border-b-2 border-slate-700 dark:border-slate-400 pb-1">
                        <p className="font-serif italic text-base text-slate-800 dark:text-slate-100 font-bold">
                          Dr. Aristotle V. Ramos, Ph.D.
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        University Registrar
                      </p>
                      <p className="text-[9px] text-slate-400">
                        Issued: November 19, 2026 • Valid without dry seal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Enrolled Subjects */}
            {activeTab === 'subjects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500">
                    Current Semester Load:{' '}
                    <span className="text-navy-700 dark:text-navy-400 font-extrabold">
                      {studentDetails.current_enrollment?.total_units || 15} Units
                    </span>
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
                          <td className="p-3 font-mono font-bold text-navy-700 dark:text-navy-400">{sub.code}</td>
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
                        <td className="p-3 font-bold text-navy-700 dark:text-navy-400">{g.final_grade}%</td>
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
                      PHP {(studentDetails.invoices || []).reduce((acc, i) => acc + Number(i.amount), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Total Payments Recorded</p>
                    <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                      PHP {(studentDetails.payments || []).reduce((acc, p) => acc + Number(p.amount), 0).toLocaleString()}
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
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">PHP {Number(pay.amount).toLocaleString()}</p>
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
                <div className="p-4 rounded-2xl bg-navy-50/50 dark:bg-slate-800/60 border border-navy-100 dark:border-slate-800 flex items-center justify-between">
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
        onClose={handleCloseAddModal}
        title="Register New Student"
        subtitle="Create official academic profile and student record"
      >
        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={e => {
                  setFormData({ ...formData, first_name: e.target.value });
                  if (formErrors.first_name) setFormErrors({ ...formErrors, first_name: undefined });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              {formErrors.first_name && <p className="text-xs text-rose-500 mt-1">{formErrors.first_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={e => {
                  setFormData({ ...formData, last_name: e.target.value });
                  if (formErrors.last_name) setFormErrors({ ...formErrors, last_name: undefined });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              {formErrors.last_name && <p className="text-xs text-rose-500 mt-1">{formErrors.last_name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => {
                  setFormData({ ...formData, email: e.target.value });
                  if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              {formErrors.email && <p className="text-xs text-rose-500 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              {formErrors.phone && <p className="text-xs text-rose-500 mt-1">{formErrors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Birth Date *</label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={e => {
                  setFormData({ ...formData, birth_date: e.target.value });
                  if (formErrors.birth_date) setFormErrors({ ...formErrors, birth_date: undefined });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              {formErrors.birth_date && <p className="text-xs text-rose-500 mt-1">{formErrors.birth_date}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
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
            <Button variant="secondary" onClick={handleCloseAddModal}>Cancel</Button>
            <Button type="submit" loading={submitting}>Register Student</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};





