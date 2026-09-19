import React from 'react';
import { Book } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { Star, BookOpen, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BookCardProps {
  book: Book;
  onBorrow?: (book: Book) => void;
  onReserve?: (book: Book) => void;
  viewMode?: 'grid' | 'list';
  basePath?: string;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onBorrow,
  onReserve,
  viewMode = 'grid',
  basePath = '/student/books',
}) => {
  const isAvailable = book.availableCopies > 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link to={`${basePath}/${book.id}`} className="shrink-0 group">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-16 h-22 sm:w-20 sm:h-28 object-cover rounded-xl shadow-sm group-hover:opacity-90 transition-opacity"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded-md">
                {book.category}
              </span>
              <StatusBadge status={book.status} size="sm" />
            </div>
            <Link
              to={`${basePath}/${book.id}`}
              className="font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-1 text-base"
            >
              {book.title}
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              by {book.author} ({book.publicationYear})
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{book.rating.toFixed(1)}</span>
                <span className="text-slate-400">({book.reviewCount})</span>
              </div>
              <span>•</span>
              <span>
                <strong className="text-slate-700 dark:text-slate-200">{book.availableCopies}</strong> of {book.totalCopies} copies
              </span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline text-slate-400">{book.shelfLocation}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <Link to={`${basePath}/${book.id}`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Details
            </Button>
          </Link>
          {isAvailable && onBorrow && (
            <Button size="sm" onClick={() => onBorrow(book)} className="w-full sm:w-auto">
              Borrow
            </Button>
          )}
          {!isAvailable && onReserve && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReserve(book)}
              leftIcon={<Bookmark className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto"
            >
              Reserve
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group text-left">
      <div>
        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3.5">
          <Link to={`${basePath}/${book.id}`}>
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <div className="absolute top-2.5 right-2.5">
            <StatusBadge status={book.status} size="sm" />
          </div>
          <div className="absolute bottom-2.5 left-2.5">
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
              {book.category}
            </span>
          </div>
        </div>

        <Link
          to={`${basePath}/${book.id}`}
          className="font-bold text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-2 text-sm leading-snug"
        >
          {book.title}
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
          {book.author}
        </p>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{book.rating.toFixed(1)}</span>
          </div>
          <span>
            <strong className="text-slate-700 dark:text-slate-200">{book.availableCopies}</strong> / {book.totalCopies} left
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-2">
        <Link to={`${basePath}/${book.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full text-xs">
            Details
          </Button>
        </Link>
        {isAvailable ? (
          <Button
            size="sm"
            onClick={() => onBorrow && onBorrow(book)}
            className="w-full text-xs"
          >
            Borrow
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onReserve && onReserve(book)}
            leftIcon={<Bookmark className="w-3.5 h-3.5" />}
            className="w-full text-xs"
          >
            Reserve
          </Button>
        )}
      </div>
    </div>
  );
};
