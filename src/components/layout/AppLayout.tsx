import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Generate page title from route
  const getPageTitle = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return 'Library Portal';
    const last = parts[parts.length - 1];
    if (last === 'dashboard') return 'Dashboard Overview';
    if (last === 'books') return 'Library Catalog';
    if (last === 'borrowed') return 'My Borrowed Books';
    if (last === 'history') return 'Circulation History';
    if (last === 'reservations') return 'Holds & Reservations';
    if (last === 'fines') return 'Fines & Accounts';
    if (last === 'notifications') return 'Notification Center';
    if (last === 'profile') return 'Academic Profile';
    if (last === 'library-card') return 'Digital Library Card';
    if (last === 'settings') return 'Preferences & Settings';
    if (last === 'members') return 'Member Directory';
    if (last === 'issue') return 'Issue Circulation Desk';
    if (last === 'return') return 'Book Check-In & Returns';
    if (last === 'reports') return 'Analytics & Reports';
    if (last === 'users') return 'User & Staff Management';
    if (last === 'librarians') return 'Librarian Roster';
    if (last === 'categories') return 'Category Taxonomy';
    if (last === 'audit') return 'System Audit Logs';
    if (last === 'add') return 'Add Catalog Volume';
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <TopNavbar
          title={getPageTitle(location.pathname)}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
