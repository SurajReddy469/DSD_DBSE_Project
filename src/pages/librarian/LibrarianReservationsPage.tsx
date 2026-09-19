import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { reservationService } from '../../services/reservationService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { Bookmark, CheckCircle, Bell, XCircle } from 'lucide-react';
import { Reservation } from '../../types';

export const LibrarianReservationsPage: React.FC = () => {
  const { reservations, refreshData } = useLibrary();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = reservations.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !r.bookTitle.toLowerCase().includes(q) &&
        !r.userName.toLowerCase().includes(q) &&
        !(r.studentId || '').toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const handleMarkReady = async (r: Reservation) => {
    try {
      await reservationService.markReadyForPickup(r.id);
      showToast(`Marked "${r.bookTitle}" ready for pickup by ${r.userName}. Alert sent!`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleCancel = async (r: Reservation) => {
    try {
      await reservationService.cancelReservation(r.id);
      showToast(`Cancelled reservation for ${r.userName}.`, 'info');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Reservation Queue Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage student holds, queue prioritization, and hold-shelf notifications
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by student name, card ID, or book title..."
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs font-semibold py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active In Queue</option>
          <option value="ready">Ready for Pickup</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-10 h-10 text-slate-400" />}
          title="No Reservations Found"
          description="No student holds match the current search filters."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Reserved Book</th>
                  <th className="py-4 px-6">Request Date</th>
                  <th className="py-4 px-6 text-center">Queue Pos</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Desk Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="py-4 px-6 text-xs">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{res.userName}</p>
                      <p className="text-slate-500">{res.studentId}</p>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={res.bookCover} alt={res.bookTitle} className="w-8 h-11 object-cover rounded shadow-xs" />
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm line-clamp-1">
                          {res.bookTitle}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {res.reservationDate}
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span className="font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        #{res.queuePosition}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={res.status} size="sm" />
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.status === 'active' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs"
                            leftIcon={<Bell className="w-3.5 h-3.5" />}
                            onClick={() => handleMarkReady(res)}
                          >
                            Ready for Pickup
                          </Button>
                        )}
                        {(res.status === 'active' || res.status === 'ready') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-rose-500 hover:text-rose-700"
                            onClick={() => handleCancel(res)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
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
