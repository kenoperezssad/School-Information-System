// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { EnrollmentPage } from './pages/EnrollmentPage';
import { RegistrarPage } from './pages/RegistrarPage';
import { FacultyPage } from './pages/FacultyPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { AttendancePage } from './pages/AttendancePage';
import { GradingPage } from './pages/GradingPage';
import { FinancePage } from './pages/FinancePage';
import { ClearancePage } from './pages/ClearancePage';
import { LibraryPage } from './pages/LibraryPage';
import { WelfarePage } from './pages/WelfarePage';
import { OperationsPage } from './pages/OperationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { VerifyPage } from './pages/VerifyPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner label="Authenticating session..." size="lg" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes wrapped in Glassmorphic Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="admissions" element={<AdmissionsPage />} />
            <Route path="enrollment" element={<EnrollmentPage />} />
            <Route path="registrar" element={<RegistrarPage />} />
            <Route path="faculty" element={<FacultyPage />} />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="grades" element={<GradingPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="clearance" element={<ClearancePage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="welfare" element={<WelfarePage />} />
            <Route path="operations" element={<OperationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="verify" element={<VerifyPage />} />
            <Route path="audit" element={<AuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
