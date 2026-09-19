import React from 'react';

export type BadgeStatus =
  | 'available'
  | 'low_stock'
  | 'out_of_stock'
  | 'reserved'
  | 'active'
  | 'due_soon'
  | 'overdue'
  | 'returned'
  | 'ready'
  | 'fulfilled'
  | 'cancelled'
  | 'paid'
  | 'unpaid'
  | 'suspended'
  | 'inactive';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  customLabel?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
  size = 'md',
}) => {
  const config: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    available: {
      label: 'Available',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    low_stock: {
      label: 'Low Stock',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    out_of_stock: {
      label: 'Out of Stock',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
    reserved: {
      label: 'Reserved',
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
      text: 'text-sky-700 dark:text-sky-300',
      dot: 'bg-sky-500',
    },
    active: {
      label: 'Active',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    due_soon: {
      label: 'Due Soon',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    overdue: {
      label: 'Overdue',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
    returned: {
      label: 'Returned',
      bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
      text: 'text-slate-600 dark:text-slate-300',
      dot: 'bg-slate-400',
    },
    ready: {
      label: 'Ready for Pickup',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-700 dark:text-indigo-300',
      dot: 'bg-indigo-500',
    },
    fulfilled: {
      label: 'Fulfilled',
      bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
      text: 'text-slate-600 dark:text-slate-400',
      dot: 'bg-slate-400',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-400',
      dot: 'bg-rose-400',
    },
    paid: {
      label: 'Paid',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    unpaid: {
      label: 'Unpaid',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
    suspended: {
      label: 'Suspended',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-400',
      dot: 'bg-rose-500',
    },
    inactive: {
      label: 'Inactive',
      bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
      text: 'text-slate-600 dark:text-slate-400',
      dot: 'bg-slate-400',
    },
  };

  const style = config[status] || {
    label: status,
    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    text: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-400',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${style.text} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {customLabel || style.label}
    </span>
  );
};
