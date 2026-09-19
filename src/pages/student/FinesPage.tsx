import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fineService } from '../../services/fineService';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { DollarSign, CheckCircle2, AlertCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { Fine } from '../../types';

export const FinesPage: React.FC = () => {
  const { fines, refreshData } = useLibrary();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [payingFine, setPayingFine] = useState<Fine | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Campus OneCard');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter fines for current student
  const userFines = fines.filter((f) => f.userId === user?.id);
  const unpaidFines = userFines.filter((f) => f.status === 'unpaid');
  const totalOutstanding = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
  const paidFines = userFines.filter((f) => f.status === 'paid');
  const totalPaid = paidFines.reduce((sum, f) => sum + f.amount, 0);

  const handleProcessPayment = async () => {
    if (!payingFine) return;
    setIsProcessing(true);
    try {
      await fineService.payFine(payingFine.id, paymentMethod);
      showToast(`Processed payment of $${payingFine.amount.toFixed(2)} via ${paymentMethod}!`, 'success');
      refreshData();
      setPayingFine(null);
    } catch (err: any) {
      showToast(err.message || 'Payment failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Library Fines & Financial Accounts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review overdue assessments ($0.50/day policy) and settle outstanding library account balances
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Outstanding Dues"
          value={`$${totalOutstanding.toFixed(2)}`}
          subtitle={totalOutstanding > 0 ? 'Payment required' : 'All clear'}
          icon={<DollarSign className="w-5 h-5" />}
          color={totalOutstanding > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Unpaid Assessments"
          value={unpaidFines.length}
          subtitle="Unsettled book items"
          icon={<AlertCircle className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Cumulative Paid"
          value={`$${totalPaid.toFixed(2)}`}
          subtitle="Lifetime cleared fines"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="brand"
        />
      </div>

      {/* Fine table */}
      {userFines.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-10 h-10 text-emerald-500" />}
          title="Account in Perfect Standing"
          description="You have zero recorded fines or overdue penalties on your academic library account."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Book Volume</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Days Overdue</th>
                  <th className="py-4 px-6">Fine Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {userFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        {fine.bookTitle}
                      </p>
                      {fine.paymentMethod && (
                        <p className="text-[11px] text-slate-400 mt-0.5">Paid via {fine.paymentMethod}</p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {fine.dueDate}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {fine.daysOverdue} days
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap font-bold text-slate-900 dark:text-slate-100">
                      ${fine.amount.toFixed(2)}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={fine.status} size="sm" />
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {fine.status === 'unpaid' ? (
                        <Button
                          size="sm"
                          onClick={() => setPayingFine(fine)}
                          leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Pay ${fine.amount.toFixed(2)}
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
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

      {/* Mock Payment Dialog */}
      <Modal
        isOpen={Boolean(payingFine)}
        onClose={() => setPayingFine(null)}
        title="Settle Library Overdue Assessment"
        maxWidth="sm"
      >
        {payingFine && (
          <div className="space-y-4 text-left">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block">Item</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                {payingFine.bookTitle}
              </h4>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500">Fine Assessment:</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  ${payingFine.amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                <option value="Campus OneCard">Campus OneCard (Student Balance)</option>
                <option value="Credit / Debit Card">Credit / Debit Card (Stripe Mock)</option>
                <option value="University Bursar Account">University Bursar Student Account</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Simulated UI Payment. No real financial transaction will occur.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setPayingFine(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleProcessPayment} isLoading={isProcessing}>
                Confirm & Settle ${payingFine.amount.toFixed(2)}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
