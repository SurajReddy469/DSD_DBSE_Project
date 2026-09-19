import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loanService } from '../../services/loanService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, RotateCcw, AlertTriangle, Eye } from 'lucide-react';
import { Loan } from '../../types';

export const MyBorrowedBooksPage: React.FC = () => {
  const { loans, refreshData } = useLibrary();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [renewingId, setRenewingId] = useState<string | null>(null);

  // Active loans for current student
  const activeLoans = loans.filter((l) => l.userId === user?.id && l.status !== 'returned');

  const calculateDaysRemaining = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRenew = async (loan: Loan) => {
    if (loan.renewalCount >= 2) {
      showToast('Maximum renewals (2) reached for this item.', 'warning');
      return;
    }
    setRenewingId(loan.id);
    try {
      await loanService.renewLoan(loan.id);
      showToast(`Renewed "${loan.bookTitle}". Due date extended by 14 days!`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Renewal failed', 'error');
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Currently Borrowed Books
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Active circulation loans currently in your possession ({activeLoans.length} of 5 max)
          </p>
        </div>
        <Link to="/student/books">
          <Button size="sm" leftIcon={<BookOpen className="w-4 h-4" />}>
            Browse More Books
          </Button>
        </Link>
      </div>

      {activeLoans.length === 0 ? (
        <EmptyState
          title="No Active Loans"
          description="You currently do not have any library books checked out. Explore the catalog to borrow academic titles."
          action={{
            label: 'Search Books',
            onClick: () => (window.location.href = '/student/books'),
          }}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Book</th>
                  <th className="py-4 px-6">Issue Date</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Days Left</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeLoans.map((loan) => {
                  const daysRemaining = calculateDaysRemaining(loan.dueDate);
                  const isOverdue = daysRemaining < 0;

                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Book */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5 min-w-[200px]">
                          <img
                            src={loan.bookCover}
                            alt={loan.bookTitle}
                            className="w-11 h-16 object-cover rounded-lg shadow-xs shrink-0"
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
                            <span className="text-[10px] text-slate-400">
                              Renewals: {loan.renewalCount} / 2
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Issue Date */}
                      <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {loan.issueDate}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`text-xs font-semibold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                          {loan.dueDate}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <StatusBadge status={loan.status} size="sm" />
                      </td>

                      {/* Days Remaining */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {isOverdue ? (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {Math.abs(daysRemaining)} days overdue
                          </span>
                        ) : daysRemaining <= 3 ? (
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            {daysRemaining} days left
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/student/books/${loan.bookId}`}>
                            <Button variant="ghost" size="sm" className="p-1.5" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRenew(loan)}
                            disabled={loan.renewalCount >= 2}
                            isLoading={renewingId === loan.id}
                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                            className="text-xs"
                          >
                            Renew {loan.renewalCount > 0 ? `(${loan.renewalCount}/2)` : ''}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
