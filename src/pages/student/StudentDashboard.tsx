import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { loanService } from '../../services/loanService';
import { studentService, StudentInsights } from '../../services/studentService';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard } from '../../components/common/ChartCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { BookBorrowModal } from '../../components/books/BookBorrowModal';
import { BookReserveModal } from '../../components/books/BookReserveModal';
import { Book } from '../../types';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  AlertTriangle,
  Bookmark,
  DollarSign,
  Calendar,
  RotateCcw,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Bell,
  MapPin,
  TrendingUp
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, loans, books, notifications, refreshData } = useLibrary();
  const { showToast } = useToast();

  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [selectedBookForReserve, setSelectedBookForReserve] = useState<Book | null>(null);
  const [renewingLoanId, setRenewingLoanId] = useState<string | null>(null);

  // Filter current user's active loans
  const userActiveLoans = loans.filter((l) => l.userId === user?.id && l.status !== 'returned');
  const userDueSoonLoans = userActiveLoans.filter((l) => l.status === 'due_soon' || l.status === 'overdue');
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [insights, setInsights] = useState<StudentInsights | null>(null);

  React.useEffect(() => {
    Promise.all([studentService.getRecommendations(3), studentService.getInsights()])
      .then(([recommendations, data]) => { setRecommendedBooks(recommendations); setInsights(data); })
      .catch(() => { setRecommendedBooks(books.slice(0, 3)); });
  }, [books]);

  const handleRenew = async (loanId: string) => {
    setRenewingLoanId(loanId);
    try {
      await loanService.renewLoan(loanId);
      showToast('Book renewed successfully! Due date extended by 14 days.', 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Unable to renew book', 'error');
    } finally {
      setRenewingLoanId(null);
    }
  };

  const handleConfirmBorrow = async (book: Book) => {
    try {
      await loanService.borrowBook(book.id, user.id);
      showToast(`Checked out "${book.title}". Happy reading!`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Could not borrow book', 'error');
    }
  };

  const readingActivityData = insights?.monthlyActivity?.length ? insights.monthlyActivity : [{ label: '—', value: 0 }];

  return (
    <div className="space-y-8 text-left">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-200 uppercase tracking-wide mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Term 2024–2025</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good morning, {user?.name.split(' ')[0] || 'Scholar'}
          </h1>
          <p className="text-brand-100 text-xs sm:text-sm mt-1 max-w-xl">
            {user?.department || 'Undergraduate'} • Library Card #{user?.studentId || 'STU-000'}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-brand-100"><MapPin className="w-3.5 h-3.5" /> KLH Bachupally Campus Library</div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link to="/student/books">
            <Button
              size="sm"
              className="bg-white text-brand-700 hover:bg-slate-100 font-bold border-none shadow-md"
              leftIcon={<BookOpen className="w-4 h-4" />}
            >
              Browse Catalog
            </Button>
          </Link>
          <Link to="/student/borrowed">
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              My Loans
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Currently Borrowed"
          value={stats.currentlyBorrowed}
          subtitle="Max allowance: 5"
          icon={<BookOpen className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Due Soon"
          value={stats.dueSoon}
          subtitle="Within 3 days"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          subtitle="Requires attention"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="Active Holds"
          value={stats.activeReservations}
          subtitle="Queue position #1"
          icon={<Bookmark className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Current Fine"
          value={`$${stats.currentFine.toFixed(2)}`}
          subtitle={stats.currentFine > 0 ? 'Payment required' : 'No outstanding dues'}
          icon={<DollarSign className="w-5 h-5" />}
          color={stats.currentFine > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Main Grid: Reading Activity & Due Soon alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reading Activity Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Reading & Borrowing Velocity"
            subtitle="Your actual borrowing activity from the library system"
            type="line"
            data={readingActivityData}
            height={200}
            action={
              <Link to="/student/history" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                View Full History →
              </Link>
            }
          />
        </div>

        {/* Upcoming Due Dates Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Upcoming Due Dates</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400">{userDueSoonLoans.length} items</span>
            </div>

            {userDueSoonLoans.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                All borrowed books are up to date. No imminent due dates.
              </div>
            ) : (
              <div className="space-y-3">
                {userDueSoonLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {loan.bookTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={loan.status} size="sm" />
                        <span className="text-[11px] text-slate-400">Due: {loan.dueDate}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs shrink-0"
                      onClick={() => handleRenew(loan.id)}
                      isLoading={renewingLoanId === loan.id}
                    >
                      Renew
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link to="/student/borrowed" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Manage All Borrowed Books ({userActiveLoans.length}) →
            </Link>
          </div>
        </div>
      </div>

      {/* Smart insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-sm font-bold">Your Reading Profile</h3><p className="text-xs text-slate-500 mt-0.5">Based on your library borrowing history</p></div>
            <TrendingUp className="w-4 h-4 text-brand-500" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <Insight label="Total Loans" value={insights?.totalLoans ?? loans.length} />
            <Insight label="Completed" value={insights?.completedLoans ?? loans.filter(l => l.status === 'returned').length} />
            <Insight label="Active" value={insights?.activeLoans ?? userActiveLoans.length} />
            <Insight label="Top Interest" value={insights?.preferredCategories?.[0]?.name || 'Explore'} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(insights?.preferredCategories || []).map(c => <span key={c.name} className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-[11px] font-semibold">{c.name} · {c.count}</span>)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold mb-1">Find Books in the Library</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Open any book to see its floor, section, rack and shelf location before you walk to the stack.</p>
          <Link to="/student/books" className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-brand-600 dark:text-brand-400">Open Catalog <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
      </div>

      {/* Bottom Row: Currently Borrowed & Recommended Books */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currently Borrowed Table Preview */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Currently Borrowed Volumes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active loans issued to your account
              </p>
            </div>
            <Link to="/student/borrowed" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              View All →
            </Link>
          </div>

          {userActiveLoans.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">You have no active loans checked out.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {userActiveLoans.slice(0, 3).map((loan) => (
                <div key={loan.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={loan.bookCover}
                      alt={loan.bookTitle}
                      className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {loan.bookTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        by {loan.bookAuthor}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={loan.status} size="sm" />
                        <span className="text-[11px] text-slate-400">Due {loan.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs shrink-0"
                    onClick={() => handleRenew(loan.id)}
                    isLoading={renewingLoanId === loan.id}
                  >
                    Renew
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Books */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Recommended For You
              </h3>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>

            <div className="space-y-3">
              {recommendedBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/student/books/${book.id}`}
                      className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 truncate block"
                    >
                      {book.title}
                    </Link>
                    <p className="text-[11px] text-slate-500 truncate">by {book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-950/50 px-1.5 py-0.5 rounded">
                        {book.category.split('&')[0]}
                      </span>
                      <span className="text-[10px] text-slate-400">{book.availableCopies} left</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link to="/student/books" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Explore All Recommended Titles →
            </Link>
          </div>
        </div>
      </div>

      {/* Borrow / Reserve Modals */}
      <BookBorrowModal
        isOpen={Boolean(selectedBookForBorrow)}
        onClose={() => setSelectedBookForBorrow(null)}
        book={selectedBookForBorrow}
        onConfirm={handleConfirmBorrow}
      />
    </div>
  );
};

const Insight = ({label,value}:{label:string;value:string|number}) => <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3"><p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p><p className="text-sm font-extrabold mt-1 truncate">{value}</p></div>;
