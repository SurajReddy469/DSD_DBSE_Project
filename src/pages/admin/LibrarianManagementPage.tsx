import React, { useState, useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { SearchBar } from '../../components/common/SearchBar';
import { UserCheck, PlusCircle, Edit, UserX, Shield, Mail, Phone } from 'lucide-react';
import { User } from '../../types';

export const LibrarianManagementPage: React.FC = () => {
  const { refreshData } = useLibrary();
  const { showToast } = useToast();

  const [librarians, setLibrarians] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLibrarian, setEditingLibrarian] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'Main Academic Library - Cataloging & Circulation',
    phone: '',
  });

  const loadLibrarians = async () => {
    const list = await userService.getUsers('librarian');
    setLibrarians(list);
  };

  useEffect(() => {
    loadLibrarians();
  }, []);

  const filtered = librarians.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddLibrarian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      await userService.createUser({
        name: formData.name,
        email: formData.email,
        role: 'librarian',
        studentId: formData.studentId || `LIB-${Math.floor(Math.random() * 900 + 100)}`,
        department: formData.department,
        phone: formData.phone || '+1 (555) 300-0000',
        status: 'active',
        membershipDate: new Date().toISOString().split('T')[0],
      });

      showToast(`Added librarian officer ${formData.name}!`, 'success');
      loadLibrarians();
      refreshData();
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        studentId: '',
        department: 'Main Academic Library - Cataloging & Circulation',
        phone: '',
      });
    } catch (err: any) {
      showToast(err.message || 'Error creating librarian', 'error');
    }
  };

  const handleToggleStatus = async (lib: User) => {
    try {
      const updated = await userService.toggleUserStatus(lib.id);
      showToast(`Librarian account ${updated.status}.`, 'info');
      loadLibrarians();
      refreshData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Circulation Staff & Librarian Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authorize catalog management privileges and desk circulation credentials
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Appoint Librarian
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search librarians by name or email..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((lib) => (
          <div
            key={lib.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <img
                  src={lib.avatar}
                  alt={lib.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 shadow-sm"
                />
                <StatusBadge status={lib.status} size="sm" />
              </div>

              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{lib.name}</h4>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                Staff ID: {lib.studentId}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{lib.department}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{lib.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lib.phone || 'Desk Ext. 402'}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Joined {lib.membershipDate}</span>
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs ${lib.status === 'active' ? 'text-rose-500' : 'text-emerald-500'}`}
                onClick={() => handleToggleStatus(lib)}
              >
                {lib.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Appoint New Staff Librarian" maxWidth="md">
        <form onSubmit={handleAddLibrarian} className="space-y-4 text-left">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Dr. Robert Vance"
            required
          />
          <Input
            label="Staff Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="r.vance@klh.edu.in"
            required
          />
          <Input
            label="Staff ID"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            placeholder="LIB-STAFF-120"
          />
          <Input
            label="Assigned Section / Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          <Input
            label="Contact Extension / Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 345-0000"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Appoint Officer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
