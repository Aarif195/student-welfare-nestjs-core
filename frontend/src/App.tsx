import { Routes, Route, Navigate } from 'react-router-dom';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SuperAdminDashboard } from './pages/dashboard/SuperAdminDashboard';
import { HostelOwnerDashboard } from './pages/dashboard/HostelOwnerDashboard/HostelOwnerDashboard';
import { StudentDashboard } from './pages/dashboard/StudentDashboard';
import { ProtectedRoute } from './pages/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/register" replace />} />

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/dashboard/student" element={<StudentDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['hostel_owner']} />}>
          <Route path="/dashboard/owner" element={<HostelOwnerDashboard />} />
          {/* <Route index element={<OwnerOverviewPage />} /> */}
          {/* <Route path="hostels" element={<MyHostelsPage />} /> */}
          {/* <Route path="maintenance" element={<MaintenancePage />} /> */}
          {/* <Route path="notifications" element={<NotificationsPage />} /> */}
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/dashboard/admin" element={<SuperAdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;