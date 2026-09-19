import React, { useState, useEffect, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';
import {
  Users,
  Eye,
  UserX,
  UserCheck,
  Search,
  Building,
  GraduationCap
} from 'lucide-react';
import { User } from '../../types';

export const MemberManagementPage: React.FC = () => {
  const { refreshData } = useLibrary();
  const { showToast } = useToast();

  const [members, setMembers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [togglingUser, setTogglingUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadMembers = async () => {
    const list = await userService.getUsers('student');
    setMembers(list);
  };

  useEffect(() => {
    loadMembers();
    const handleSync = () => loadMembers();
    window.addEventListener('lms_data_change', handleSync);
    return () => window.removeEventListener('lms_data_change', handleSync);
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.email.toLowerCase().includes(q) &&
          !(m.studentId || '').toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (departmentFilter !== 'all' && m.department !== departmentFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      return true;
    });
  }, [members, search, departmentFilter, statusFilter]);

  const handleConfirmToggleStatus = async () => {
    if (!togglingUser) return;
    setIsProcessing(true);
    try {
      const updated = await userService.toggleUserStatus(togglingUser.id);
      showToast(
        `Member ${updated.name} has been ${updated.status === 'suspended' ? 'suspended' : 're-activated'}.`,
        updated.status === 'suspended' ? 'warning' : 'success'
      );
      loadMembers();
      refreshData();
      setTogglingUser(null);
    } catch (err: any) {
      showToast(err.message || 'Status toggle failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Academic Member Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Student cardholders, active borrower statuses, and circulation eligibility
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by student name, email, or card ID..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="suspended">Suspended Members</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10 text-slate-400" />}
          title="No Members Found"
          description="No student accounts match the query."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Card ID</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-center">Active Loans</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {member.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                      {member.studentId || 'N/A'}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-700 dark:text-slate-300">
                      {member.department}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {member.membershipDate}
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span className="font-bold text-brand-600 dark:text-brand-400 text-xs bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded-full">
                        {member.borrowedCount || 0}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={member.status} size="sm" />
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/librarian/members/${member.id}`}>
                          <Button variant="ghost" size="sm" className="p-1.5" title="View Member Profile">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {member.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Suspend Borrowing Privileges"
                            onClick={() => setTogglingUser(member)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            title="Restore Active Status"
                            onClick={() => setTogglingUser(member)}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suspend / Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(togglingUser)}
        onClose={() => setTogglingUser(null)}
        onConfirm={handleConfirmToggleStatus}
        title={togglingUser?.status === 'active' ? 'Suspend Member Privileges' : 'Reactivate Member Privileges'}
        message={
          togglingUser?.status === 'active'
            ? `Suspend circulation borrowing privileges for ${togglingUser?.name}? The member will be barred from checking out new books until cleared.`
            : `Reactivate circulation privileges for ${togglingUser?.name}?`
        }
        confirmText={togglingUser?.status === 'active' ? 'Suspend Privileges' : 'Reactivate'}
        variant={togglingUser?.status === 'active' ? 'danger' : 'primary'}
        isLoading={isProcessing}
      />
    </div>
  );
};
