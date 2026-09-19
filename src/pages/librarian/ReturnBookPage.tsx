import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { loanService } from '../../services/loanService';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Loan } from '../../types';

export const ReturnBookPage: React.FC = () => {
  const { loans, refreshData } = useLibrary();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Active loans available for return
  const activeLoans = loans.filter((l) => l.status !== 'returned');

  const filteredLoans = activeLoans.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.bookTitle.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      (l.studentId || '').toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q)
    );
  });

  const calculateOverdueInfo = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);

    const diff = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    const fineAmount = parseFloat((daysOverdue * 0.50).toFixed(2));

    return { daysOverdue, fineAmount };
  };

  const handleConfirmReturn = async () => {
    if (!selectedLoan) return;
    setIsProcessing(true);

    try {
      const result = await loanService.returnLoan(selectedLoan.id);
      if (result.fine) {
        showToast(
          `Book returned with fine! Overdue fine of $${result.fine.amount.toFixed(2)} recorded for ${selectedLoan.userName}.`,
          'warning'
        );
      } else {
        showToast(`Book checked in successfully! "${selectedLoan.bookTitle}" returned in good order.`, 'success');
      }
      refreshData();
      setSelectedLoan(null);
    } catch (err: any) {
      showToast(err.message || 'Error processing return', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Book Check-In & Returns Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Process volume returns, assess automatic overdue calculations, and return items to active shelf circulation
        </p>
      </div>

      {/* Search active loans */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search active loan by book title, student name, or card ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Loans Table */}
      {filteredLoans.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-10 h-10 text-emerald-500" />}
          title="No Active Loans Matching Query"
          description="All active loans matching this search query have already been checked in."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Book Volume</th>
                  <th className="py-4 px-6">Borrower</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Overdue Assessment</th>
                  <th className="py-4 px-6 text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLoans.map((loan) => {
                  const { daysOverdue, fineAmount } = calculateOverdueInfo(loan.dueDate);

                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={loan.bookCover}
                            alt={loan.bookTitle}
                            className="w-9 h-13 object-cover rounded shadow-xs shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm line-clamp-1">
                              {loan.bookTitle}
                            </p>
                            <p className="text-[11px] text-slate-500">by {loan.bookAuthor}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{loan.userName}</p>
                        <p className="text-slate-400 font-mono">{loan.studentId || 'ID'}</p>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {loan.dueDate}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <StatusBadge status={loan.status} size="sm" />
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {daysOverdue > 0 ? (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {daysOverdue} days late (${fineAmount.toFixed(2)})
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> On Time ($0.00)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          onClick={() => setSelectedLoan(loan)}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Check In
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal with Overdue / Fine Calculation */}
      <Modal
        isOpen={Boolean(selectedLoan)}
        onClose={() => setSelectedLoan(null)}
        title="Confirm Book Check-In"
        maxWidth="md"
      >
        {selectedLoan && (() => {
          const { daysOverdue, fineAmount } = calculateOverdueInfo(selectedLoan.dueDate);

          return (
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex gap-4">
                <img
                  src={selectedLoan.bookCover}
                  alt={selectedLoan.bookTitle}
                  className="w-14 h-20 object-cover rounded-lg shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {selectedLoan.bookTitle}
                  </h4>
                  <p className="text-xs text-slate-500">Borrower: <strong>{selectedLoan.userName}</strong> ({selectedLoan.studentId})</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Issue Date: {selectedLoan.issueDate} • Due Date: {selectedLoan.dueDate}
                  </p>
                </div>
              </div>

              {/* Fine Calculation breakdown card */}
              <div
                className={`p-4 rounded-2xl border ${
                  daysOverdue > 0
                    ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
                    : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Overdue Days:</span>
                  <span className={`font-bold ${daysOverdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                    {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs mt-1.5">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Policy Rate:</span>
                  <span className="text-slate-500">$0.50 / calendar day</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Calculated Assessment:</span>
                  <span className={`text-base font-black ${daysOverdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    ${fineAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setSelectedLoan(null)} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleConfirmReturn} isLoading={isProcessing}>
                  Confirm Return & Restock Copy
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
