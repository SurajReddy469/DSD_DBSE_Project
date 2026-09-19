import React, { useState, useEffect, useMemo } from 'react';
import { auditService } from '../../services/auditService';
import { SearchBar } from '../../components/common/SearchBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ShieldCheck, ShieldAlert, Clock, Filter, Download } from 'lucide-react';
import { AuditLog } from '../../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadLogs = async () => {
    const list = await auditService.getLogs();
    setLogs(list);
  };

  useEffect(() => {
    loadLogs();
    const handleSync = () => loadLogs();
    window.addEventListener('lms_data_change', handleSync);
    return () => window.removeEventListener('lms_data_change', handleSync);
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !l.userName.toLowerCase().includes(q) &&
          !l.action.toLowerCase().includes(q) &&
          !l.resource.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (actionFilter !== 'all' && l.action.toLowerCase() !== actionFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [logs, search, actionFilter]);

  const actionBadgeColor = (action: string) => {
    if (action.includes('SUSPEND') || action.includes('DELETE')) {
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
    if (action.includes('RETURN') || action.includes('PAID') || action.includes('CREATE')) {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    return 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800';
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Security & Circulation Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable log of circulation desk actions, administrative overrides, and catalog modifications
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by operator name, action, or affected resource..."
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs font-semibold py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="all">All Action Events</option>
          <option value="BOOK_ISSUED">BOOK_ISSUED</option>
          <option value="BOOK_RETURNED">BOOK_RETURNED</option>
          <option value="BOOK_ADDED">BOOK_ADDED</option>
          <option value="BOOK_DELETED">BOOK_DELETED</option>
          <option value="USER_SUSPENDED">USER_SUSPENDED</option>
          <option value="FINE_PAID">FINE_PAID</option>
          <option value="SETTINGS_MODIFIED">SETTINGS_MODIFIED</option>
        </select>
      </div>

      {/* Logs Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-10 h-10 text-slate-400" />}
          title="No Audit Records Found"
          description="No event logs match the query parameters."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Operator / User</th>
                  <th className="py-4 px-6">Action Event</th>
                  <th className="py-4 px-6">Affected Resource</th>
                  <th className="py-4 px-6">IP Address</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-4 px-6 font-sans">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{log.userName}</p>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{log.role}</span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${actionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-sans text-slate-700 dark:text-slate-300">
                      {log.resource}
                    </td>

                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {log.ipAddress}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap font-sans">
                      <StatusBadge status="active" customLabel={log.status} size="sm" />
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
