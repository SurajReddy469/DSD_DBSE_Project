import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { fineService } from '../../services/fineService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { DollarSign, CheckCircle2, Search } from 'lucide-react';
import { Fine } from '../../types';

export const LibrarianFinesPage: React.FC = () => {
  const { fines, refreshData } = useLibrary();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = fines.filter((f) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !f.userName.toLowerCase().includes(q) &&
        !f.bookTitle.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    return true;
  });

  const handleMarkPaid = async (fine: Fine) => {
    try {
      await fineService.payFine(fine.id, 'Cash at Circulation Desk');
      showToast(`Marked fine for ${fine.userName} as paid. Account balance updated.`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Payment update failed', 'error');
    }
  };

  const totalOutstanding = fines
    .filter((f) => f.status === 'unpaid')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Circulation Fine Collections & Reconciliation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track overdue liabilities across student members and record cash/campus card desk settlements
          </p>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-4 py-2 rounded-2xl flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-rose-500" />
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Total Uncollected</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">${totalOutstanding.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by student name or book title..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-semibold py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="all">All Assessments</option>
          <option value="unpaid">Unpaid Only</option>
          <option value="paid">Paid Only</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="w-10 h-10 text-slate-400" />}
          title="No Fine Records Found"
          description="No penalty assessments match the criteria."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Cardholder</th>
                  <th className="py-4 px-6">Book Volume</th>
                  <th className="py-4 px-6">Days Late</th>
                  <th className="py-4 px-6">Fine Amount</th>
                  <th className="py-4 px-6">Settlement Status</th>
                  <th className="py-4 px-6 text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((fine) => (
                  <tr key={fine.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="py-4 px-6 text-xs font-bold text-slate-900 dark:text-slate-100">
                      {fine.userName}
                    </td>

                    <td className="py-4 px-6 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {fine.bookTitle}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {fine.daysOverdue} days overdue
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100 text-xs">
                      ${fine.amount.toFixed(2)}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={fine.status} size="sm" />
                      {fine.paymentMethod && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">{fine.paymentMethod}</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {fine.status === 'unpaid' ? (
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaid(fine)}
                          className="text-xs"
                        >
                          Mark Paid (Cash Desk)
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Settle Cleared
                        </span>
                      )}
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
