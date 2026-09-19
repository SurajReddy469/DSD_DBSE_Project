import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Book } from '../../types';
import { Calendar, AlertCircle, BookOpen } from 'lucide-react';

export interface BookBorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onConfirm: (book: Book) => Promise<void>;
}

export const BookBorrowModal: React.FC<BookBorrowModalProps> = ({
  isOpen,
  onClose,
  book,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!book) return null;

  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 21);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(book);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Book Loan" maxWidth="md">
      <div className="space-y-4 text-left">
        <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-16 h-24 object-cover rounded-lg shadow-sm shrink-0"
          />
          <div>
            <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
              {book.category}
            </span>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 line-clamp-1">
              {book.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">by {book.author}</p>
            <p className="text-xs text-slate-400 mt-1">ISBN: {book.isbn}</p>
            <p className="text-xs text-slate-400">Location: {book.shelfLocation}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-brand-50/60 dark:bg-brand-950/30 p-3.5 rounded-xl border border-brand-100 dark:border-brand-900/50">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Issue Date</span>
            <div className="flex items-center gap-1.5 mt-1 text-slate-900 dark:text-slate-100 font-semibold text-sm">
              <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              {formatDate(today)}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Return Due Date</span>
            <div className="flex items-center gap-1.5 mt-1 text-brand-700 dark:text-brand-300 font-bold text-sm">
              <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              {formatDate(dueDate)}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            Standard loan period is 21 days. Late returns accrue a fine of <strong>$0.50/day</strong>. You may renew online up to 2 times before the due date.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
            leftIcon={<BookOpen className="w-4 h-4" />}
          >
            Confirm & Borrow
          </Button>
        </div>
      </div>
    </Modal>
  );
};
