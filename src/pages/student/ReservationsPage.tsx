import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reservationService } from '../../services/reservationService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Reservation } from '../../types';

export const ReservationsPage: React.FC = () => {
  const { reservations, refreshData } = useLibrary();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [cancellingRes, setCancellingRes] = useState<Reservation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter reservations for current user
  const userReservations = reservations.filter((r) => r.userId === user?.id);
  const activeHolds = userReservations.filter((r) => r.status === 'active' || r.status === 'ready');
  const pastHolds = userReservations.filter((r) => r.status === 'fulfilled' || r.status === 'cancelled');

  const handleConfirmCancel = async () => {
    if (!cancellingRes) return;
    setIsProcessing(true);
    try {
      await reservationService.cancelReservation(cancellingRes.id);
      showToast(`Cancelled reservation for "${cancellingRes.bookTitle}".`, 'info');
      refreshData();
      setCancellingRes(null);
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Book Holds & Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated queue positioning for checked-out library volumes
          </p>
        </div>
        <Link to="/student/books">
          <Button size="sm" leftIcon={<Bookmark className="w-4 h-4" />}>
            Request New Hold
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Active Holds</span>
          <span className="bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs px-2 py-0.5 rounded-full">
            {activeHolds.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Hold History</span>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">
            {pastHolds.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'active' ? (
        activeHolds.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="w-10 h-10 text-slate-400" />}
            title="No Active Hold Requests"
            description="You do not have any pending holds in the automated queue. You can reserve any book currently on loan to other members."
            action={{
              label: 'Browse Catalog',
              onClick: () => (window.location.href = '/student/books'),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeHolds.map((res) => (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div className="flex gap-4 items-start">
                  <img
                    src={res.bookCover}
                    alt={res.bookTitle}
                    className="w-16 h-22 object-cover rounded-xl shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StatusBadge status={res.status} size="sm" />
                      <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md">
                        Queue Position #{res.queuePosition}
                      </span>
                    </div>

                    <Link
                      to={`/student/books/${res.bookId}`}
                      className="font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 text-sm line-clamp-1 block"
                    >
                      {res.bookTitle}
                    </Link>

                    <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <p>Requested: <span className="font-semibold text-slate-700 dark:text-slate-300">{res.reservationDate}</span></p>
                      <p>Expires: <span className="font-semibold text-slate-700 dark:text-slate-300">{res.expiryDate}</span></p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {res.status === 'ready' ? 'Ready for desk pickup!' : 'Automatic email on return'}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    onClick={() => setCancellingRes(res)}
                  >
                    Cancel Hold
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : pastHolds.length === 0 ? (
        <EmptyState
          title="No Hold History"
          description="Your previous hold and reservation fulfillments will be listed here."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Book</th>
                  <th className="py-4 px-6">Reserved Date</th>
                  <th className="py-4 px-6">Queue Pos</th>
                  <th className="py-4 px-6">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pastHolds.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={res.bookCover}
                          alt={res.bookTitle}
                          className="w-9 h-12 object-cover rounded shadow-xs shrink-0"
                        />
                        <Link
                          to={`/student/books/${res.bookId}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:underline text-xs line-clamp-1"
                        >
                          {res.bookTitle}
                        </Link>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {res.reservationDate}
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      #{res.queuePosition}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={res.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Cancellation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancellingRes)}
        onClose={() => setCancellingRes(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Book Hold Request"
        message={`Are you sure you want to surrender your queue position for "${cancellingRes?.bookTitle}"? Other waiting scholars will advance in the hold queue.`}
        confirmText="Yes, Release Hold"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
};
