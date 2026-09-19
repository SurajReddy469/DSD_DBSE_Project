import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loanService } from '../../services/loanService';
import { reservationService } from '../../services/reservationService';
import { BookCard } from '../../components/books/BookCard';
import { BookBorrowModal } from '../../components/books/BookBorrowModal';
import { BookReserveModal } from '../../components/books/BookReserveModal';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Book } from '../../types';
import {
  LayoutGrid,
  List,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  X
} from 'lucide-react';

export const BrowseBooksPage: React.FC = () => {
  const { books, categories, refreshData } = useLibrary();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'year' | 'availableCopies'>('title');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const [borrowModalBook, setBorrowModalBook] = useState<Book | null>(null);
  const [reserveModalBook, setReserveModalBook] = useState<Book | null>(null);

  const pageSize = 8;

  // Sync URL search query if passed
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== search) {
      setSearch(q);
    }
  }, [searchParams]);

  // Extract unique authors
  const authors = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      // Split multiple authors
      b.author.split(',').forEach((a) => set.add(a.trim()));
    });
    return Array.from(set).sort();
  }, [books]);

  // Filter & Sort books
  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        // Search query
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchAuthor = b.author.toLowerCase().includes(q);
          const matchIsbn = b.isbn.toLowerCase().includes(q);
          const matchTags = b.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchAuthor && !matchIsbn && !matchTags) return false;
        }

        // Category
        if (selectedCategory !== 'all' && b.category !== selectedCategory) {
          return false;
        }

        // Availability
        if (selectedAvailability === 'available' && b.availableCopies <= 0) return false;
        if (selectedAvailability === 'low_stock' && (b.availableCopies <= 0 || b.availableCopies > 2)) return false;
        if (selectedAvailability === 'out_of_stock' && b.availableCopies > 0) return false;

        // Rating
        if (selectedRating !== 'all') {
          const min = parseFloat(selectedRating);
          if (b.rating < min) return false;
        }

        // Publication Year
        if (selectedYear !== 'all') {
          const yearNum = parseInt(selectedYear, 10);
          if (b.publicationYear < yearNum) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'year') return b.publicationYear - a.publicationYear;
        if (sortBy === 'availableCopies') return b.availableCopies - a.availableCopies;
        return a.title.localeCompare(b.title);
      });
  }, [books, search, selectedCategory, selectedAvailability, selectedRating, selectedYear, sortBy]);

  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedAvailability('all');
    setSelectedRating('all');
    setSelectedYear('all');
    setSortBy('title');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleBorrowConfirm = async (book: Book) => {
    try {
      await loanService.borrowBook(book.id, user.id);
      showToast(`Successfully borrowed "${book.title}". Due date is in 21 days.`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Unable to borrow book', 'error');
    }
  };

  const handleReserveConfirm = async (book: Book) => {
    try {
      await reservationService.reserveBook(book.id, user.id);
      showToast(`Hold requested for "${book.title}". You will be notified when available.`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Unable to reserve book', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Library Catalog & Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search across {books.length} physical volumes, monographs, and reserve copies
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFiltersMobile((prev) => !prev)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search by title, author, ISBN, or topic keywords..."
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold py-2.5 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full md:w-auto"
            >
              <option value="title">Sort: Title (A-Z)</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="year">Sort: Publication Year</option>
              <option value="availableCopies">Sort: Most Copies Available</option>
            </select>

            {(search || selectedCategory !== 'all' || selectedAvailability !== 'all' || selectedRating !== 'all' || selectedYear !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Multi-facet Filter Bar (Always visible on desktop, toggle on mobile) */}
        <div className={`${showFiltersMobile ? 'block' : 'hidden'} md:block pt-3 border-t border-slate-100 dark:border-slate-800`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Category Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Availability
              </label>
              <select
                value={selectedAvailability}
                onChange={(e) => {
                  setSelectedAvailability(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Availability</option>
                <option value="available">Available Now</option>
                <option value="low_stock">Low Stock (≤ 2 left)</option>
                <option value="out_of_stock">Checked Out (Hold required)</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Scholarly Rating
              </label>
              <select
                value={selectedRating}
                onChange={(e) => {
                  setSelectedRating(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Any Rating</option>
                <option value="4.8">4.8 & above ★★★★★</option>
                <option value="4.5">4.5 & above ★★★★☆</option>
                <option value="4.0">4.0 & above ★★★★☆</option>
              </select>
            </div>

            {/* Publication Year Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Publication Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Any Year</option>
                <option value="2020">2020 & Newer</option>
                <option value="2015">2015 & Newer</option>
                <option value="2000">2000 & Newer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Found <strong className="text-slate-800 dark:text-slate-200">{filteredBooks.length}</strong> books matching criteria
        </span>
        {selectedCategory !== 'all' && (
          <span className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-md font-medium">
            Category: {selectedCategory}
            <button onClick={() => setSelectedCategory('all')} className="hover:text-brand-900">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
      </div>

      {/* Book listing (Grid or List) */}
      {filteredBooks.length === 0 ? (
        <EmptyState
          title="No Books Found"
          description="We couldn't find any books matching your current search terms or filter combinations."
          action={{
            label: 'Reset Filters',
            onClick: handleResetFilters,
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={(b) => setBorrowModalBook(b)}
              onReserve={(b) => setReserveModalBook(b)}
              viewMode="grid"
              basePath="/student/books"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={(b) => setBorrowModalBook(b)}
              onReserve={(b) => setReserveModalBook(b)}
              viewMode="list"
              basePath="/student/books"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        totalItems={filteredBooks.length}
        pageSize={pageSize}
      />

      {/* Modals */}
      <BookBorrowModal
        isOpen={Boolean(borrowModalBook)}
        onClose={() => setBorrowModalBook(null)}
        book={borrowModalBook}
        onConfirm={handleBorrowConfirm}
      />

      <BookReserveModal
        isOpen={Boolean(reserveModalBook)}
        onClose={() => setReserveModalBook(null)}
        book={reserveModalBook}
        onConfirm={handleReserveConfirm}
      />
    </div>
  );
};
