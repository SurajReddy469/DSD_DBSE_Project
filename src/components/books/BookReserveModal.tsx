import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Book } from '../../types';
import { Bookmark, AlertCircle, Clock } from 'lucide-react';

export interface BookReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onConfirm: (book: Book) => Promise<void>;
}

export const BookReserveModal: React.FC<BookReserveModalProps> = ({
  isOpen,
  onClose,
  book,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!book) return null;

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
    <Modal isOpen={isOpen} onClose={onClose} title="Reserve Book (Hold Request)" maxWidth="md">
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
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
              All {book.totalCopies} copies are currently checked out.
            </p>
          </div>
        </div>

        <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-indigo-950 dark:text-indigo-200 block">
              Automated Queue System
            </span>
            <span className="text-indigo-800/80 dark:text-indigo-300">
              You will be notified via email and in-app alert as soon as the next copy is checked in at the desk.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Once available, reserved books are held at the circulation desk for <strong>3 business days</strong> before passing to the next member in queue.
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
            leftIcon={<Bookmark className="w-4 h-4" />}
          >
            Confirm Reservation
          </Button>
        </div>
      </div>
    </Modal>
  );
};
