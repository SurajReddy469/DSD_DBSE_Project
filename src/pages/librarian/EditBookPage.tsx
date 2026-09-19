import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { bookService } from '../../services/bookService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { ArrowLeft, Save } from 'lucide-react';
import { Book } from '../../types';

export const EditBookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { books, categories, refreshData } = useLibrary();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Book>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const found = books.find((b) => b.id === id);
    if (found) {
      setFormData(found);
    }
  }, [id, books]);

  if (!formData.title) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Volume Not Found</h3>
        <Link to="/librarian/books" className="mt-4 inline-block">
          <Button size="sm">Back to Inventory</Button>
        </Link>
      </div>
    );
  }

  const categoryOptions = categories.map((c) => ({ value: c.name, label: c.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);

    try {
      await bookService.updateBook(id, {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        publisher: formData.publisher,
        publicationYear: Number(formData.publicationYear),
        category: formData.category,
        totalCopies: Number(formData.totalCopies),
        availableCopies: Number(formData.availableCopies),
        shelfLocation: formData.shelfLocation,
        coverUrl: formData.coverUrl,
        description: formData.description,
      });

      showToast(`Updated catalog entry for "${formData.title}"`, 'success');
      refreshData();
      navigate('/librarian/books');
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Edit Catalog Entry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Modify accession details, shelf location, or total inventory copies
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Book Title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="Author"
              value={formData.author || ''}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
            <Input
              label="ISBN"
              value={formData.isbn || ''}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              required
            />
            <Input
              label="Publisher"
              value={formData.publisher || ''}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              required
            />
            <Input
              label="Publication Year"
              type="number"
              value={formData.publicationYear || 2020}
              onChange={(e) => setFormData({ ...formData, publicationYear: Number(e.target.value) })}
              required
            />
            <Select
              label="Category"
              options={categoryOptions}
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Input
              label="Total Copies"
              type="number"
              value={formData.totalCopies || 1}
              onChange={(e) => setFormData({ ...formData, totalCopies: Number(e.target.value) })}
              required
            />
            <Input
              label="Available Copies"
              type="number"
              value={formData.availableCopies || 0}
              onChange={(e) => setFormData({ ...formData, availableCopies: Number(e.target.value) })}
              required
            />
            <Input
              label="Shelf Location"
              value={formData.shelfLocation || ''}
              onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Input
              label="Cover Image URL"
              value={formData.coverUrl || ''}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Abstract
            </label>
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link to="/librarian/books">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Update Volume
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
