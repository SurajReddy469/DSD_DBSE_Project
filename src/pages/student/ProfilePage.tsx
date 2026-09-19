import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  GraduationCap,
  Save,
  CheckCircle2,
  Camera
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [year, setYear] = useState(user?.year || 'Senior (Year 4)');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const departments = [
    { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering' },
    { value: 'Mathematics & Statistics', label: 'Mathematics & Statistics' },
    { value: 'Physics & Astronomy', label: 'Physics & Astronomy' },
    { value: 'Medicine & Health Sciences', label: 'Medicine & Health Sciences' },
    { value: 'Business & Economics', label: 'Business & Economics' },
    { value: 'Literature & Philosophy', label: 'Literature & Philosophy' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      updateCurrentUser({
        name,
        email,
        phone,
        department,
        year,
        avatar,
      });
      setIsSaving(false);
      showToast('Profile information successfully saved!', 'success');
    }, 400);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Academic Member Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review and maintain your official university library card information
        </p>
      </div>

      {/* Header Profile Identity Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group">
          <img
            src={avatar || user?.avatar}
            alt={user?.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {user?.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.department} • {user?.year}
              </p>
            </div>
            <div>
              <StatusBadge status={user?.status || 'active'} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Card Number</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                {user?.studentId || 'STU-2024-8891'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Member Since</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {user?.membershipDate || '2022-09-01'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Active Loans</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">
                {user?.borrowedCount || 3} books
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Financial Dues</span>
              <span className={`font-bold ${user?.finesOwed ? 'text-rose-600' : 'text-emerald-600'}`}>
                ${(user?.finesOwed || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-500" />
          <span>Edit Profile Details</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="University Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
            <Input
              label="Avatar Image URL"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Academic Department"
              options={departments}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <Input
              label="Academic Year / Standing"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. Senior (Year 4)"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="submit"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
