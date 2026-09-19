import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { History, Calendar, CheckCircle2, Search } from 'lucide-react';

export const BorrowingHistoryPage: React.FC = () => {
  const { loans } = useLibrary();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');

  // Filter history loans for current user
  const historyLoans = useMemo(() => {
    return loans.filter((l) => {
      if (l.userId !== user?.id) return false;
      if (l.status !== 'returned') return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!l.bookTitle.toLowerCase().includes(q) && !l.bookAuthor.toLowerCase().includes(q)) {
          return false;
        }
      }

      // Date range filter
      if (dateRange === '2024') {
        if (!l.issueDate.startsWith('2024')) return false;
      } else if (dateRange === '2023') {
        if (!l.issueDate.startsWith('2023')) return false;
      }

      return true;
    });
  }, [loans, user?.id, search, dateRange]);

  const calculateDuration = (issueDate: string, returnDate?: string) => {
    if (!returnDate) return 'N/A';
    const start = new Date(issueDate);
    const end = new Date(returnDate);
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Borrowing History & Archives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete record of previously returned books and loan durations
          </p>
        </div>
      </div>

      {/* Search & Date Filter controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search history by title or author..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="text-xs font-semibold py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="all">All Academic Years</option>
            <option value="2024">Year 2024</option>
            <option value="2023">Year 2023</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      {historyLoans.length === 0 ? (
        <EmptyState
          icon={<History className="w-10 h-10 text-slate-400" />}
          title="No Historical Loans Found"
          description="You have no returned loan records matching the selected search query or date range."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Book</th>
                  <th className="py-4 px-6">Borrowed Date</th>
                  <th className="py-4 px-6">Returned Date</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {historyLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5 min-w-[200px]">
                        <img
                          src={loan.bookCover}
                          alt={loan.bookTitle}
                          className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0"
                        />
                        <div>
                          <Link
                            to={`/student/books/${loan.bookId}`}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 line-clamp-1 text-sm"
                          >
                            {loan.bookTitle}
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            by {loan.bookAuthor}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {loan.issueDate}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {loan.returnDate || 'Returned'}
                    </td>

                    <td className="py-4 px-6 text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {calculateDuration(loan.issueDate, loan.returnDate)}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status="returned" size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
