import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bookmark,
  Volume2,
  CheckCheck,
  Filter
} from 'lucide-react';
import { NotificationType } from '../../types';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useLibrary();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'due_reminder':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'reservation_ready':
        return <Bookmark className="w-5 h-5 text-indigo-500" />;
      case 'book_returned':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'announcement':
      default:
        return <Volume2 className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time alerts, return receipts, reservation readiness, and library announcements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={markAllNotificationsAsRead}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setFilter('all')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            filter === 'all'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            filter === 'unread'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Unread Only ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notification items */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10 text-slate-400" />}
          title={filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
          description="Your notification inbox is currently clear."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 text-left ${
                !notif.read
                  ? 'bg-brand-50/40 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900/60 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700/60 shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    {new Date(notif.date).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notif.link && (
                  <Link to={notif.link}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View
                    </Button>
                  </Link>
                )}
                {!notif.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-500 hover:text-slate-800"
                    onClick={() => markNotificationAsRead(notif.id)}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
