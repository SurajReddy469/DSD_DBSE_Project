import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loanService } from '../../services/loanService';
import { reservationService } from '../../services/reservationService';
import { BookCard } from '../../components/books/BookCard';
import { BookBorrowModal } from '../../components/books/BookBorrowModal';
import { BookReserveModal } from '../../components/books/BookReserveModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Book } from '../../types';
import {
  Star,
  BookOpen,
  Bookmark,
  MapPin,
  Calendar,
  Building2,
  Barcode,
  Layers,
  ArrowLeft,
  MessageSquare,
  Send,
  User,
  CheckCircle2,
  Share2,
  LocateFixed
} from 'lucide-react';

export const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { books, refreshData } = useLibrary();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | undefined>(undefined);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);

  // Review state
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  useEffect(() => {
    const found = books.find((b) => b.id === id);
    setBook(found);
    if (found?.reviews) {
      setReviewsList(found.reviews);
    }
  }, [id, books]);

  if (!book) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Book Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested volume does not exist in the catalog.</p>
        <Link to="/student/books" className="mt-4 inline-block">
          <Button size="sm">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;
  const similarBooks = books.filter((b) => b.category === book.category && b.id !== book.id).slice(0, 3);

  const handleBorrow = async () => {
    try {
      await loanService.borrowBook(book.id, user.id);
      showToast(`Successfully borrowed "${book.title}".`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error borrowing book', 'error');
    }
  };

  const handleReserve = async () => {
    try {
      await reservationService.reserveBook(book.id, user.id);
      showToast(`Hold requested for "${book.title}".`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Error reserving book', 'error');
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      bookId: book.id,
      userName: user?.name || 'Academic Scholar',
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewComment('');
    showToast('Scholarly review submitted successfully!', 'success');
  };

  return (
    <div className="space-y-10 text-left">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
      </div>

      {/* Main Book Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cover image & quick actions */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start">
            <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3">
                <StatusBadge status={book.status} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full max-w-[280px] space-y-2.5 mt-6">
              {isAvailable ? (
                <Button
                  size="md"
                  className="w-full text-sm font-bold shadow-md shadow-brand-500/20"
                  onClick={() => setBorrowModalOpen(true)}
                  leftIcon={<BookOpen className="w-4 h-4" />}
                >
                  Borrow This Volume
                </Button>
              ) : (
                <Button
                  size="md"
                  variant="secondary"
                  className="w-full text-sm font-bold"
                  onClick={() => setReserveModalOpen(true)}
                  leftIcon={<Bookmark className="w-4 h-4" />}
                >
                  Place a Hold (Reserve)
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast('Catalog link copied to clipboard!', 'info');
                }}
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
              >
                Share Call Reference
              </Button>
            </div>
          </div>

          {/* Detailed Metadata & Info */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-md">
                  {book.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">ISBN {book.isbn}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {book.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
                By <strong className="text-slate-800 dark:text-slate-200">{book.author}</strong>
              </p>

              {/* Rating and copies banner */}
              <div className="flex items-center gap-6 py-4 my-4 border-y border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{book.rating.toFixed(1)}</span>
                  <span className="text-slate-400">({book.reviewCount} reviews)</span>
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{book.availableCopies}</span>
                  <span className="text-slate-400"> of {book.totalCopies} available</span>
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{book.shelfLocation}</span>
                </div>
              </div>

              {/* Physical location */}
              <div className="mt-5 rounded-2xl border border-brand-100 dark:border-brand-900/40 bg-brand-50/60 dark:bg-brand-950/20 p-4">
                <div className="flex items-center gap-2 mb-3"><LocateFixed className="w-4 h-4 text-brand-600" /><h3 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">Find this book in the library</h3></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <Location label="Floor" value={book.floor || 'Main Floor'} />
                  <Location label="Section" value={book.section || book.category} />
                  <Location label="Rack" value={book.rack || 'Assigned Stack'} />
                  <Location label="Shelf" value={book.shelfLocation || 'See circulation desk'} />
                </div>
                {book.ddcClass && <p className="text-[11px] text-slate-500 mt-3">DDC 23 classification: <b>{book.ddcClass}</b></p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Scholarly Abstract & Overview
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-4">
                  {book.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Technical Metadata Table */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Publisher</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{book.publisher}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Publication Year</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{book.publicationYear}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Language</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{book.language}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Circulation Status</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {book.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Scholarly Feedback */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-500" />
            <span>Academic Reviews & Annotations ({reviewsList.length})</span>
          </h3>
        </div>

        {/* Add review form */}
        <form onSubmit={handleAddReview} className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Leave a Peer Annotation or Review
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-500">Your Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`p-0.5 ${star <= reviewRating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={2}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your academic assessment of this textbook or research text..."
            className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <div className="flex justify-end mt-2">
            <Button size="sm" type="submit" rightIcon={<Send className="w-3.5 h-3.5" />}>
              Submit Annotation
            </Button>
          </div>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsList.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No reviews written yet. Be the first scholar to annotate this volume.
            </p>
          ) : (
            reviewsList.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                      {rev.userName[0]}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.userName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-semibold">{rev.rating}</span>
                    <span className="text-[11px] text-slate-400 ml-2">{rev.date}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Similar Books Section */}
      {similarBooks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Related Volumes in {book.category}
            </h3>
            <Link
              to={`/student/books?category=${encodeURIComponent(book.category)}`}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Browse Category →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {similarBooks.map((simBook) => (
              <BookCard key={simBook.id} book={simBook} basePath="/student/books" />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <BookBorrowModal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        book={book}
        onConfirm={handleBorrow}
      />

      <BookReserveModal
        isOpen={reserveModalOpen}
        onClose={() => setReserveModalOpen(false)}
        book={book}
        onConfirm={handleReserve}
      />
    </div>
  );
};

const Location = ({label,value}:{label:string;value:string}) => <div><span className="text-[10px] text-slate-400 block mb-0.5">{label}</span><span className="font-bold text-slate-800 dark:text-slate-200">{value}</span></div>;
