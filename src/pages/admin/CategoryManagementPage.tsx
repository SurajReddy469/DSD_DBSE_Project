import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FolderTree, PlusCircle, Edit, Trash2, BookOpen } from 'lucide-react';
import { Category } from '../../types';

export const CategoryManagementPage: React.FC = () => {
  const { categories, books, refreshData } = useLibrary();
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await apiRequest<Category>('/categories', { method: 'POST', body: JSON.stringify({ name: name.trim(), description: description.trim() || 'Academic subject discipline.', status: 'active' }) });
      showToast(`Created category "${name.trim()}"!`, 'success');
      refreshData(); setIsAddModalOpen(false); setName(''); setDescription('');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Failed to create category', 'error'); }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await apiRequest<Category>(`/categories/${editingCategory.id}`, { method: 'PATCH', body: JSON.stringify({ name: editingCategory.name, description: editingCategory.description, status: editingCategory.status }) });
      showToast(`Updated category "${editingCategory.name}"!`, 'success'); refreshData(); setEditingCategory(null);
    } catch (error) { showToast(error instanceof Error ? error.message : 'Failed to update category', 'error'); }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await apiRequest(`/categories/${categoryToDelete.id}`, { method: 'DELETE' });
      showToast(`Deleted category "${categoryToDelete.name}".`, 'info'); refreshData(); setCategoryToDelete(null);
    } catch (error) { showToast(error instanceof Error ? error.message : 'Failed to delete category', 'error'); }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Academic Disciplinary Taxonomies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize catalog subject classification trees and circulation shelf sections
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          // Count live books in category
          const liveBookCount = books.filter((b) => b.category === cat.name).length;

          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <StatusBadge status={cat.status} size="sm" />
                </div>

                <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                  {liveBookCount || cat.bookCount} Catalog Titles
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5"
                    title="Edit Category"
                    onClick={() => setEditingCategory(cat)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Category"
                    onClick={() => setCategoryToDelete(cat)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Subject Category" maxWidth="sm">
        <form onSubmit={handleCreateCategory} className="space-y-4 text-left">
          <Input
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Environmental Science & Sustainability"
            required
          />
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope of textbooks and research volumes covered..."
              className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Create Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={Boolean(editingCategory)} onClose={() => setEditingCategory(null)} title="Edit Category" maxWidth="sm">
        {editingCategory && (
          <form onSubmit={handleUpdateCategory} className="space-y-4 text-left">
            <Input
              label="Category Name"
              value={editingCategory.name}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={editingCategory.description}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Subject Category"
        message={`Delete "${categoryToDelete?.name}"? Books in this category will need re-indexing.`}
        confirmText="Yes, Delete"
        variant="danger"
      />
    </div>
  );
};
