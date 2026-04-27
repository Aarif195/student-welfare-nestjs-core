import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ProtectedRoute } from './pages/auth/ProtectedRoute';


import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';

import { SuperAdminDashboard } from './pages/dashboard/SuperAdminDashboard';
import { StudentDashboard } from './pages/dashboard/StudentDashboard';


import { HostelOwnerDashboard } from './pages/dashboard/HostelOwnerDashboard/HostelOwnerDashboard';
import { MyHostelsPage } from './pages/dashboard/HostelOwnerDashboard/MyHostelsPage';
import { HostelDetailsPage } from './pages/dashboard/HostelOwnerDashboard/HostelDetailsPage';
import { CreateHostelPage } from './pages/dashboard/HostelOwnerDashboard/CreateHostelPage';
import { CreateRoomPage } from './pages/dashboard/HostelOwnerDashboard/CreateRoomPage';
import { EditHostelPage } from './pages/dashboard/HostelOwnerDashboard/EditHostelPage';
import { EditRoomPage } from './pages/dashboard/HostelOwnerDashboard/EditRoomPage';
import { OwnerBookingsPage } from './pages/dashboard/HostelOwnerDashboard/OwnerBookingsPage';
import { NotificationsPage } from './pages/dashboard/HostelOwnerDashboard/NotificationsPage';
import { MaintenancePage } from './pages/dashboard/HostelOwnerDashboard/MaintenancePage';
import { ReviewsPage } from './pages/dashboard/HostelOwnerDashboard/ReviewsPage';
import { OwnerOverviewPage } from './pages/dashboard/HostelOwnerDashboard/OwnerOverviewPage';

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Onboarding Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/register" replace />} />

{/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/dashboard/student" element={<StudentDashboard />} />
        </Route>

{/* HostelOwner Routes */}
        <Route element={<ProtectedRoute allowedRoles={['hostelOwner']} />}>
          <Route path="/dashboard/owner" element={<HostelOwnerDashboard />}>

            {/* default page */}
            <Route index element={<OwnerOverviewPage />} />

            {/* nested routes */}
            <Route path="hostels" element={<MyHostelsPage />} />
            <Route path="hostels/:id" element={<HostelDetailsPage />} />
            <Route path="hostels/create" element={<CreateHostelPage />} />
            <Route path="hostels/:id/rooms/create" element={<CreateRoomPage />} />
            <Route path="hostels/:id/edit" element={<EditHostelPage />} />
            <Route path="hostels/:id/rooms/:roomId/edit" element={<EditRoomPage />} />

            <Route path="bookings" element={<OwnerBookingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="reviews" element={<ReviewsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/dashboard/admin" element={<SuperAdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;