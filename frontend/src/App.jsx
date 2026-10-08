import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './layout/AppLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportProblem from './pages/citizen/ReportProblem';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetails from './pages/citizen/ComplaintDetails';
import TrackComplaint from './pages/citizen/TrackComplaint';
import NotificationsPage from './pages/citizen/NotificationsPage';
import ProfilePage from './pages/citizen/ProfilePage';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import AssignedComplaints from './pages/officer/AssignedComplaints';

// Admin Pages
import AdminAnalyticsDashboard from './pages/admin/AdminAnalyticsDashboard';
import CityComplaintMap from './pages/admin/CityComplaintMap';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import UsersManagement from './pages/admin/UsersManagement';
import OfficersManagement from './pages/admin/OfficersManagement';
import DepartmentsManagement from './pages/admin/DepartmentsManagement';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import WardsManagement from './pages/admin/WardsManagement';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-civic-surface">
        <div className="w-8 h-8 border-4 border-civic border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'OFFICER') return <Navigate to="/officer/dashboard" replace />;
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Citizen Routes */}
        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN', 'OFFICER']}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/report"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN', 'OFFICER']}>
              <ReportProblem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/complaints"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN', 'OFFICER']}>
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN', 'OFFICER']}>
              <ComplaintDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/track"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN', 'OFFICER']}>
              <TrackComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/notifications"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN', 'OFFICER']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/profile"
          element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN', 'OFFICER']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Officer Routes */}
        <Route
          path="/officer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/assigned"
          element={
            <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
              <AssignedComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/profile"
          element={
            <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ComplaintManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/map"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CityComplaintMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UsersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/officers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <OfficersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DepartmentsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CategoriesManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/wards"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <WardsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
