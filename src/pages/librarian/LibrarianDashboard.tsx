import React, { useEffect, useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard } from '../../components/common/ChartCard';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import { circulationService, DashboardAnalytics } from '../../services/loanService';
import {
  BookOpen,
  Users,
  CheckSquare,
  RotateCcw,
  AlertTriangle,
  Bookmark,
  DollarSign,
  PlusCircle,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';

export const LibrarianDashboard: React.FC = () => {
  const { stats, loans, books, refreshData } = useLibrary();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);

  useEffect(() => {
    circulationService.getAnalytics().then(setAnalytics).catch(() => undefined);
  }, []);

  // Statistics for librarian
  const totalBooksCount = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const activeLoansCount = loans.filter((l) => l.status !== 'returned').length;
  const returnedLoansCount = loans.filter((l) => l.status === 'returned').length;
  const overdueLoansCount = loans.filter((l) => l.status === 'overdue').length;

  const monthlyActivityData = [
    { label: 'Oct', value: 42, secondaryValue: 38 },
    { label: 'Nov', value: 65, secondaryValue: 54 },
    { label: 'Dec', value: 31, secondaryValue: 36 },
    { label: 'Jan', value: 78, secondaryValue: 69 },
    { label: 'Feb', value: 92, secondaryValue: 84 },
    { label: 'Mar', value: 85, secondaryValue: 71 },
  ];

  const popularCategoriesData = (analytics?.categories || []).slice(0, 5).map((item) => ({ label: item.name, value: item.count }));

  const recentActivity = [
    {
      id: 'act-1',
      action: 'Book Checked In',
      target: 'Clean Architecture (Alex Vance)',
      time: '12 mins ago',
      type: 'return',
    },
    {
      id: 'act-2',
      action: 'New Hold Placed',
      target: 'Principles of Quantum Mechanics (Marcus Thorne)',
      time: '45 mins ago',
      type: 'hold',
    },
    {
      id: 'act-3',
      action: 'Loan Issued',
      target: 'Designing Data-Intensive Applications (Sophia Chen)',
      time: '2 hours ago',
      type: 'issue',
    },
    {
      id: 'act-4',
      action: 'Fine Settled',
      target: '₹2.00 paid via Campus Card (Alex Vance)',
      time: '4 hours ago',
      type: 'fine',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Circulation & Catalog Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time library metrics, desk operations, inventory levels, and reader services
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/librarian/issue">
            <Button size="sm" leftIcon={<CheckSquare className="w-4 h-4" />}>
              Issue Book
            </Button>
          </Link>
          <Link to="/librarian/return">
            <Button size="sm" variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />}>
              Check-In / Return
            </Button>
          </Link>
          <Link to="/librarian/books/add">
            <Button size="sm" variant="secondary" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Add Book
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        <StatCard
          title="Total Titles"
          value={analytics?.totalTitles ?? books.length}
          subtitle={`${analytics?.totalCopies ?? totalBooksCount} copies`}
          icon={<BookOpen className="w-4 h-4" />}
          color="brand"
        />
        <StatCard
          title="Members"
          value={analytics?.members ?? stats.totalMembers}
          subtitle="Active scholars"
          icon={<Users className="w-4 h-4" />}
          color="purple"
        />
        <StatCard
          title="Active Loans"
          value={analytics?.activeLoans ?? activeLoansCount}
          subtitle="Currently out"
          icon={<CheckSquare className="w-4 h-4" />}
          color="brand"
        />
        <StatCard
          title="Books Returned"
          value={returnedLoansCount}
          subtitle="This semester"
          icon={<RotateCcw className="w-4 h-4" />}
          color="emerald"
        />
        <StatCard
          title="Overdue Items"
          value={analytics?.overdueLoans ?? overdueLoansCount}
          subtitle="Fines accruing"
          icon={<AlertTriangle className="w-4 h-4" />}
          color="rose"
        />
        <StatCard
          title="Pending Holds"
          value={analytics?.reservations ?? stats.totalPendingReservations}
          subtitle="Queue holds"
          icon={<Bookmark className="w-4 h-4" />}
          color="amber"
        />
        <StatCard
          title="Unpaid Dues"
          value={`₹${(analytics?.outstandingFines ?? stats.totalOutstandingFines).toFixed(2)}`}
          subtitle="Total balance"
          icon={<DollarSign className="w-4 h-4" />}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Activity (Issues vs Returns) */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Circulation Overview"
            subtitle="Live circulation and inventory signals for KLH Bachupally Library"
            type="bar"
            data={monthlyActivityData}
            height={220}
            legend={[
              { label: 'Books Issued', color: '#0c87eb' },
              { label: 'Books Returned', color: '#10b981' },
            ]}
            action={
              <Link to="/librarian/reports" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Reports →
              </Link>
            }
          />
        </div>

        {/* Popular Categories */}
        <div>
          <ChartCard
            title="Active Circulation by Category"
            subtitle="Most engaged academic subject areas"
            type="progress"
            data={popularCategoriesData}
            height={220}
          />
        </div>
      </div>

      {/* Bottom Row: Circulation Desk Quick Operations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Operations Guide */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-500" />
            <span>Circulation Desk Quick Operations</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/librarian/issue"
              className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition-colors block"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-3">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Issue Book</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Guided 4-step wizard to issue books to student cardholders.
              </p>
            </Link>

            <Link
              to="/librarian/return"
              className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors block"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Check-In / Return</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Calculate overdue assessments and return volumes to shelf inventory.
              </p>
            </Link>

            <Link
              to="/librarian/reservations"
              className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors block"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3">
                <Bookmark className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Hold Queue</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dispatch hold notifications and mark returned books ready for pickup.
              </p>
            </Link>
          </div>
        </div>

        {/* Live Desk Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                <span>Recent Desk Activity</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              {recentActivity.map((act) => (
                <div key={act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{act.action}</span>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 truncate">{act.target}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link to="/librarian/reports" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Download Audit Reports →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
