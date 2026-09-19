import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';

const Protected: React.FC<{ roles?: Array<'student'|'librarian'|'admin'>; children: React.ReactNode }> = ({ roles, children }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to={`/${role}/dashboard`} replace />;
  return <>{children}</>;
};

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { BrowseBooksPage } from '../pages/student/BrowseBooksPage';
import { BookDetailsPage } from '../pages/student/BookDetailsPage';
import { MyBorrowedBooksPage } from '../pages/student/MyBorrowedBooksPage';
import { BorrowingHistoryPage } from '../pages/student/BorrowingHistoryPage';
import { ReservationsPage } from '../pages/student/ReservationsPage';
import { FinesPage } from '../pages/student/FinesPage';
import { NotificationsPage } from '../pages/student/NotificationsPage';
import { ProfilePage } from '../pages/student/ProfilePage';
import { SettingsPage } from '../pages/student/SettingsPage';
import { LibraryCardPage } from '../pages/student/LibraryCardPage';

// Librarian Pages
import { LibrarianDashboard } from '../pages/librarian/LibrarianDashboard';
import { BookManagementPage } from '../pages/librarian/BookManagementPage';
import { AddBookPage } from '../pages/librarian/AddBookPage';
import { EditBookPage } from '../pages/librarian/EditBookPage';
import { MemberManagementPage } from '../pages/librarian/MemberManagementPage';
import { MemberDetailsPage } from '../pages/librarian/MemberDetailsPage';
import { IssueBookPage } from '../pages/librarian/IssueBookPage';
import { CirculationDeskPage } from '../pages/librarian/CirculationDeskPage';
import { ReturnBookPage } from '../pages/librarian/ReturnBookPage';
import { LibrarianReservationsPage } from '../pages/librarian/LibrarianReservationsPage';
import { LibrarianFinesPage } from '../pages/librarian/LibrarianFinesPage';
import { LibrarianReportsPage } from '../pages/librarian/LibrarianReportsPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { LibrarianManagementPage } from '../pages/admin/LibrarianManagementPage';
import { CategoryManagementPage } from '../pages/admin/CategoryManagementPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { SystemSettingsPage } from '../pages/admin/SystemSettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes with Header and Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Student Portal Routes */}
      <Route path="/student" element={<Protected roles={['student']}><AppLayout /></Protected>}>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="books" element={<BrowseBooksPage />} />
        <Route path="books/:id" element={<BookDetailsPage />} />
        <Route path="borrowed" element={<MyBorrowedBooksPage />} />
        <Route path="history" element={<BorrowingHistoryPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="fines" element={<FinesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="library-card" element={<LibraryCardPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Librarian Desk Routes */}
      <Route path="/librarian" element={<Protected roles={['librarian']}><AppLayout /></Protected>}>
        <Route index element={<Navigate to="/librarian/dashboard" replace />} />
        <Route path="dashboard" element={<LibrarianDashboard />} />
        <Route path="books" element={<BookManagementPage />} />
        <Route path="books/add" element={<AddBookPage />} />
        <Route path="books/edit/:id" element={<EditBookPage />} />
        <Route path="members" element={<MemberManagementPage />} />
        <Route path="members/:id" element={<MemberDetailsPage />} />
        <Route path="issue" element={<IssueBookPage />} />
        <Route path="circulation" element={<CirculationDeskPage />} />
        <Route path="return" element={<ReturnBookPage />} />
        <Route path="reservations" element={<LibrarianReservationsPage />} />
        <Route path="fines" element={<LibrarianFinesPage />} />
        <Route path="reports" element={<LibrarianReportsPage />} />
      </Route>

      {/* Administrator Portal Routes */}
      <Route path="/admin" element={<Protected roles={['admin']}><AppLayout /></Protected>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="librarians" element={<LibrarianManagementPage />} />
        <Route path="books" element={<BookManagementPage />} />
        <Route path="categories" element={<CategoryManagementPage />} />
        <Route path="reports" element={<LibrarianReportsPage />} />
        <Route path="audit" element={<AuditLogsPage />} />
        <Route path="settings" element={<SystemSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
