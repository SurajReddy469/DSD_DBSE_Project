import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { bookService } from '../../services/bookService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { BookOpen, ArrowLeft, PlusCircle, Check } from 'lucide-react';

export const AddBookPage: React.FC = () => {
  const { categories, refreshData } = useLibrary();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    category: categories[0]?.name || 'Computer Science & AI',
    language: 'English',
    description: '',
    totalCopies: 5,
    availableCopies: 5,
    shelfLocation: 'Stack 4, Shelf A-01',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    tags: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = categories.map((c) => ({ value: c.name, label: c.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Book title is mandatory';
    if (!formData.author.trim()) newErrors.author = 'Author name is mandatory';
    if (!formData.isbn.trim()) newErrors.isbn = 'ISBN identifier is mandatory';
    if (!formData.publisher.trim()) newErrors.publisher = 'Publisher is mandatory';
    if (!formData.shelfLocation.trim()) newErrors.shelfLocation = 'Physical shelf location is mandatory';
    if (formData.totalCopies <= 0) newErrors.totalCopies = 'Must accession at least 1 copy';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please rectify the highlighted validation fields.', 'error');
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await bookService.createBook({
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim(),
        publisher: formData.publisher.trim(),
        publicationYear: Number(formData.publicationYear),
        category: formData.category,
        language: formData.language,
        description: formData.description.trim() || 'Scholarly university library text available for circulation and course reserves.',
        totalCopies: Number(formData.totalCopies),
        availableCopies: Number(formData.availableCopies),
        shelfLocation: formData.shelfLocation.trim(),
        coverUrl: formData.coverUrl || 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600',
        status: Number(formData.availableCopies) > 0 ? 'available' : 'out_of_stock',
        tags: tagsArray.length > 0 ? tagsArray : [formData.category],
      });

      showToast(`Successfully added "${formData.title}" to the catalog!`, 'success');
      refreshData();
      navigate('/librarian/books');
    } catch (err: any) {
      showToast(err.message || 'Error creating book', 'error');
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
          <span>Back to Inventory</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Add New Book to Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Catalog a new academic monograph, reference textbook, or serial publication
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Primary Metadata */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              Bibliographic Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Book Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Introduction to Electrodynamics"
                error={errors.title}
                required
              />

              <Input
                label="Author(s)"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. David J. Griffiths"
                error={errors.author}
                required
              />

              <Input
                label="ISBN (10 or 13)"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="e.g. 978-1108420419"
                error={errors.isbn}
                required
              />

              <Input
                label="Publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="e.g. Cambridge University Press"
                error={errors.publisher}
                required
              />

              <Input
                label="Publication Year"
                type="number"
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: Number(e.target.value) })}
                required
              />

              <Select
                label="Category & Discipline"
                options={categoryOptions}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />

              <Input
                label="Language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              />

              <Input
                label="Keywords / Tags (comma separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Physics, Electromagnetism, Griffiths"
              />
            </div>
          </div>

          {/* Section: Inventory & Shelving */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              Circulation & Inventory Copies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Total Copies Accessioned"
                type="number"
                min={1}
                value={formData.totalCopies}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({
                    ...formData,
                    totalCopies: val,
                    availableCopies: val,
                  });
                }}
                error={errors.totalCopies}
                required
              />

              <Input
                label="Initial Available Copies"
                type="number"
                min={0}
                max={formData.totalCopies}
                value={formData.availableCopies}
                onChange={(e) => setFormData({ ...formData, availableCopies: Number(e.target.value) })}
                required
              />

              <Input
                label="Shelf Location / Call Number"
                value={formData.shelfLocation}
                onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                placeholder="Stack 2, Shelf B-04"
                error={errors.shelfLocation}
                required
              />
            </div>
          </div>

          {/* Section: Cover & Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              Cover Image & Abstract
            </h3>
            <div className="space-y-4">
              <Input
                label="Cover Image URL (Direct Link)"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Book Abstract & Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive explanation of textbook topics, target academic level, and syllabus prerequisites..."
                  className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Accession Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
