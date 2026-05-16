import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ProtectedRoute } from './pages/auth/ProtectedRoute';

import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';


// HostelOwnerDashboard
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
import { OwnerProfilePage } from './pages/dashboard/HostelOwnerDashboard/OwnerProfilePage';

// StudentDashboard
import { StudentDashboardLayout } from './pages/dashboard/StudentDashboard/StudentDashboardLayout';
import { StudentDiscoveryPage } from './pages/dashboard/StudentDashboard/StudentDashboard';
import { StudentStudySpacesPage } from './pages/dashboard/StudentDashboard/StudentStudySpacesPage';
import { PaymentSuccessPage } from './pages/dashboard/StudentDashboard/PaymentSuccess';
import { StudentBookingsPage } from './pages/dashboard/StudentDashboard/StudentBookingsPage';
import { StudentMaintenancePage } from './pages/dashboard/StudentDashboard/StudentMaintenancePage';
import { StudentNotificationsPage } from './pages/dashboard/StudentDashboard/StudentNotificationsPage';
import { StudentReviewsPage } from './pages/dashboard/StudentDashboard/StudentReviewsPage';
import { StudentProfilePage } from './pages/dashboard/StudentDashboard/StudentProfilePage';

import { SuperAdminDashboardLayout } from './pages/dashboard/SuperAdminDashboard/SuperAdminDashboardLayout';
import { AdminHostelsPage } from './pages/dashboard/SuperAdminDashboard/AdminHostelsPage';


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
          <Route element={<StudentDashboardLayout />}>
            <Route path="/dashboard/student" element={<StudentDiscoveryPage />} />
            <Route path="/dashboard/student/study-spaces" element={<StudentStudySpacesPage />} />
            <Route path="/dashboard/student/bookings" element={<StudentBookingsPage />} />
            <Route path="/dashboard/student/maintenance" element={<StudentMaintenancePage />} />
            <Route path="/dashboard/student/notifications" element={<StudentNotificationsPage />} />
            <Route path="/dashboard/student/reviews" element={<StudentReviewsPage />} />
            <Route path="/dashboard/student/profile" element={<StudentProfilePage />} />
          </Route>
           <Route path="/payment/success" element={<PaymentSuccessPage />} />
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
            <Route path="profile" element={<OwnerProfilePage />} />
          </Route>
          
        </Route>

       {/* SuperAdmin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route element={<SuperAdminDashboardLayout />}>
            <Route path="/dashboard/admin" element={<p className="p-8 text-primary-700">Overview Panel Coming Soon</p>} />
            <Route path="/dashboard/admin/hostels" element={<AdminHostelsPage />} />
          </Route>
        </Route>
        
      </Routes>
    </>
  );
}

export default App;