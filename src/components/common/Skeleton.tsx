import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
    />
  );
};

export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      <Skeleton className="w-full h-48 rounded-xl" />
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-1/2 h-4" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="w-20 h-6 rounded-full" />
        <Skeleton className="w-16 h-8 rounded-lg" />
      </div>
    </div>
  );
};
