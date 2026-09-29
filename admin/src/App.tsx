import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ApprovalsPage from './pages/approvals/ApprovalsPage';
import ApprovalHistoryPage from './pages/approvals/ApprovalHistoryPage';
import UsersPage from './pages/users/UsersPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import CreateBroadcastPage from './pages/notifications/CreateBroadcastPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProfileEditPage from './pages/profile/ProfileEditPage';

/** Shell layout: sidebar + main content area */
function AdminShell() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" role="main">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected — wrapped in shell layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AdminShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="approvals/history" element={<ApprovalHistoryPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="notifications/create" element={<CreateBroadcastPage />} />
              {/* `key` remounts the form when switching between create and edit */}
              <Route path="notifications/:id/edit" element={<CreateBroadcastPage key="edit" />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/edit" element={<ProfileEditPage />} />
              {/* Settings was replaced by My Profile */}
              <Route path="settings" element={<Navigate to="/profile" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
