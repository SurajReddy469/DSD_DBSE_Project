import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { bookService } from '../../services/bookService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Filter,
  RotateCcw
} from 'lucide-react';
import { Book } from '../../types';

export const BookManagementPage: React.FC = () => {
  const { books, categories, refreshData } = useLibrary();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 7;

  // Filter books
  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !b.title.toLowerCase().includes(q) &&
          !b.author.toLowerCase().includes(q) &&
          !b.isbn.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && b.status !== selectedStatus) return false;
      return true;
    });
  }, [books, search, selectedCategory, selectedStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedBooks = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      await bookService.deleteBook(bookToDelete.id);
      showToast(`Removed "${bookToDelete.title}" from library catalog.`, 'info');
      refreshData();
      setBookToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Error deleting book', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Book Inventory & Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain accession records, copy availability, shelf tags, and catalog listings
          </p>
        </div>

        <Link to="/librarian/books/add">
          <Button size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Add New Book
          </Button>
        </Link>
      </div>

      {/* Filter and Search row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setCurrentPage(1);
            }}
            placeholder="Search by title, author, or ISBN..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-semibold py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-semibold py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Book Management Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-10 h-10 text-slate-400" />}
          title="No Books Found"
          description="No volumes match your search parameters. Try changing your filters or add a new book to the catalog."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Book / Accession</th>
                  <th className="py-4 px-6">ISBN</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-center">Copies (Avail / Tot)</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5 min-w-[200px]">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">
                            {book.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            by {book.author} ({book.publicationYear})
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {book.shelfLocation}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                      {book.isbn}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-700 dark:text-slate-300">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[11px] font-medium">
                        {book.category}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center text-xs whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {book.availableCopies}
                      </span>{' '}
                      / {book.totalCopies}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={book.status} size="sm" />
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/student/books/${book.id}`}>
                          <Button variant="ghost" size="sm" className="p-1.5 text-slate-500 hover:text-slate-800" title="View Catalog Card">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/librarian/books/edit/${book.id}`}>
                          <Button variant="ghost" size="sm" className="p-1.5 text-slate-500 hover:text-slate-800" title="Edit Metadata">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Volume"
                          onClick={() => setBookToDelete(book)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
        pageSize={pageSize}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(bookToDelete)}
        onClose={() => setBookToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Book from Catalog"
        message={`Are you sure you want to permanently delete "${bookToDelete?.title}" (ISBN: ${bookToDelete?.isbn})? This action will remove all catalog metadata.`}
        confirmText="Yes, Delete Volume"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
