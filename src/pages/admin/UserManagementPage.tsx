import React, { useState, useEffect, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { SearchBar } from '../../components/common/SearchBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  PlusCircle,
  Edit,
  UserX,
  UserCheck,
  Shield,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { User, UserRole } from '../../types';

export const UserManagementPage: React.FC = () => {
  const { refreshData } = useLibrary();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [togglingUser, setTogglingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data for add / edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as UserRole,
    studentId: '',
    department: 'Computer Science & Engineering',
  });

  const loadAllUsers = async () => {
    const list = await userService.getUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadAllUsers();
    const handleSync = () => loadAllUsers();
    window.addEventListener('lms_data_change', handleSync);
    return () => window.removeEventListener('lms_data_change', handleSync);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q) &&
          !(u.studentId || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setIsSubmitting(true);

    try {
      await userService.createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        studentId: formData.studentId || `USR-${Math.floor(Math.random() * 9000 + 1000)}`,
        department: formData.department,
        status: 'active',
        membershipDate: new Date().toISOString().split('T')[0],
      });

      showToast(`Created account for ${formData.name} (${formData.role})`, 'success');
      loadAllUsers();
      refreshData();
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        role: 'student',
        studentId: '',
        department: 'Computer Science & Engineering',
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);

    try {
      await userService.updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        department: editingUser.department,
        studentId: editingUser.studentId,
      });

      showToast(`User ${editingUser.name} updated!`, 'success');
      loadAllUsers();
      refreshData();
      setEditingUser(null);
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!togglingUser) return;
    try {
      const res = await userService.toggleUserStatus(togglingUser.id);
      showToast(`Account for ${res.name} is now ${res.status}.`, 'info');
      loadAllUsers();
      refreshData();
      setTogglingUser(null);
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const roleBadgeStyle = (r: UserRole) => {
    if (r === 'admin') return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    if (r === 'librarian') return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    return 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800';
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            User Accounts & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage academic identities across Students, Circulation Librarians, and System Administrators
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Add User Account
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search users by name, email, or campus ID..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="librarian">Librarians</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10 text-slate-400" />}
          title="No Accounts Found"
          description="No user records match the query."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">User / Identity</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">ID / Matriculation</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${roleBadgeStyle(u.role)}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {u.studentId || 'N/A'}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-700 dark:text-slate-300">
                      {u.department}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={u.status} size="sm" />
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1.5"
                          title="Edit User Record"
                          onClick={() => setEditingUser(u)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-1.5 ${u.status === 'active' ? 'text-rose-500 hover:text-rose-700 hover:bg-rose-50' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
                          title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          onClick={() => setTogglingUser(u)}
                        >
                          {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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

      {/* Add User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create User Account" maxWidth="md">
        <form onSubmit={handleCreateUser} className="space-y-4 text-left">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Dr. Jane Doe"
            required
          />

          <Input
            label="University Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="j.doe@klh.edu.in"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              options={[
                { value: 'student', label: 'Student / Member' },
                { value: 'librarian', label: 'Librarian (Staff)' },
                { value: 'admin', label: 'Administrator' },
              ]}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            />

            <Input
              label="Card / Staff ID"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="e.g. LIB-091"
            />
          </div>

          <Input
            label="Department / Faculty"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={Boolean(editingUser)} onClose={() => setEditingUser(null)} title="Edit User Identity" maxWidth="md">
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4 text-left">
            <Input
              label="Full Name"
              value={editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              required
            />

            <Input
              label="University Email"
              type="email"
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Role"
                options={[
                  { value: 'student', label: 'Student / Member' },
                  { value: 'librarian', label: 'Librarian (Staff)' },
                  { value: 'admin', label: 'Administrator' },
                ]}
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
              />

              <Input
                label="Card / Staff ID"
                value={editingUser.studentId || ''}
                onChange={(e) => setEditingUser({ ...editingUser, studentId: e.target.value })}
              />
            </div>

            <Input
              label="Department / Faculty"
              value={editingUser.department || ''}
              onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Suspend Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(togglingUser)}
        onClose={() => setTogglingUser(null)}
        onConfirm={handleConfirmToggle}
        title={togglingUser?.status === 'active' ? 'Suspend Account' : 'Activate Account'}
        message={`Are you sure you want to ${togglingUser?.status === 'active' ? 'suspend' : 'activate'} ${togglingUser?.name}?`}
        confirmText={togglingUser?.status === 'active' ? 'Suspend' : 'Activate'}
        variant={togglingUser?.status === 'active' ? 'danger' : 'primary'}
      />
    </div>
  );
};
