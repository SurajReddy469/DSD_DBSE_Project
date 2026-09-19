import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  BookmarkCheck,
  History,
  Bookmark,
  DollarSign,
  Bell,
  User,
  CreditCard,
  Settings,
  Users,
  UserCheck,
  PlusCircle,
  FileText,
  RotateCcw,
  CheckSquare,
  ShieldCheck,
  Layers,
  FolderTree,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Library,
  GraduationCap,
  ScanLine
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/student/books', label: 'Browse Books', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/student/borrowed', label: 'Borrowed Books', icon: <BookmarkCheck className="w-4 h-4" /> },
    { to: '/student/history', label: 'Borrowing History', icon: <History className="w-4 h-4" /> },
    { to: '/student/reservations', label: 'Reservations', icon: <Bookmark className="w-4 h-4" /> },
    { to: '/student/fines', label: 'Fines & Dues', icon: <DollarSign className="w-4 h-4" /> },
    { to: '/student/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { to: '/student/profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { to: '/student/library-card', label: 'Library Card', icon: <CreditCard className="w-4 h-4" /> },
    { to: '/student/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const librarianLinks = [
    { to: '/librarian/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/librarian/books', label: 'Book Management', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/librarian/books/add', label: 'Add New Book', icon: <PlusCircle className="w-4 h-4" /> },
    { to: '/librarian/members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { to: '/librarian/circulation', label: 'Smart Circulation', icon: <ScanLine className="w-4 h-4" /> },
    { to: '/librarian/issue', label: 'Issue Book', icon: <CheckSquare className="w-4 h-4" /> },
    { to: '/librarian/return', label: 'Return Book', icon: <RotateCcw className="w-4 h-4" /> },
    { to: '/librarian/reservations', label: 'Reservations', icon: <Bookmark className="w-4 h-4" /> },
    { to: '/librarian/fines', label: 'Fine Collection', icon: <DollarSign className="w-4 h-4" /> },
    { to: '/librarian/reports', label: 'Reports & Analytics', icon: <FileText className="w-4 h-4" /> },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/librarians', label: 'Librarians', icon: <UserCheck className="w-4 h-4" /> },
    { to: '/admin/books', label: 'Catalog Control', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/admin/categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
    { to: '/admin/reports', label: 'System Reports', icon: <FileText className="w-4 h-4" /> },
    { to: '/admin/audit', label: 'Audit Logs', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/admin/settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const links = role === 'admin' ? adminLinks : role === 'librarian' ? librarianLinks : studentLinks;

  const roleLabels = {
    student: 'Student Portal',
    librarian: 'Librarian Desk',
    admin: 'Administration',
  };

  const roleColors = {
    student: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20',
    librarian: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    admin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
            <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
                <Library className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="text-left min-w-0">
                  <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 truncate">
                    KLH UNIVERSITY
                  </h1>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wider font-semibold uppercase block">
                    Library System
                  </span>
                </div>
              )}
            </NavLink>

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Role Badge Indicator */}
          {!isCollapsed && (
            <div className="px-4 pt-3 pb-1 text-left">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${roleColors[role]}`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{roleLabels[role]}</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? link.label : undefined}
              >
                <span className="shrink-0">{link.icon}</span>
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 ${
              isCollapsed ? 'justify-center p-1.5' : ''
            }`}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-full object-cover border border-white dark:border-slate-700 shrink-0 shadow-xs"
            />
            {!isCollapsed && (
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'Academic User'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate capitalize">
                  {role} • {user?.studentId || 'Online'}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
