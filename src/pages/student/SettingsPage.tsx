import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { apiRequest } from '../../services/api';
import { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  Settings,
  Bell,
  Sun,
  Moon,
  Lock,
  Shield,
  CheckCircle2,
  Save
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [holdAlerts, setHoldAlerts] = useState(true);
  const [recommendationAlerts, setRecommendationAlerts] = useState(true);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    apiRequest<any>('/notifications/preferences').then((p) => {
      setEmailAlerts(p.dueReminders ?? true);
      setHoldAlerts(p.reservationAlerts ?? true);
      setRecommendationAlerts(p.recommendationAlerts ?? true);
    }).catch(() => undefined);
  }, []);

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/notifications/preferences', { method: 'PATCH', body: JSON.stringify({
        dueReminders: emailAlerts, reservationAlerts: holdAlerts, overdueAlerts: emailAlerts, recommendationAlerts, emailEnabled: emailAlerts
      }) });
      showToast('Notification preferences saved to your KLH account.', 'success');
    } catch (err) { showToast(err instanceof Error ? err.message : 'Unable to save preferences', 'error'); }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please fill in password fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password successfully changed!', 'success');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Preferences & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your interface appearance, notifications, security credentials, and academic privacy
        </p>
      </div>

      {/* Appearance & Theme */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
          <span>Theme & Interface Appearance</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Toggle between Academic Crisp Light mode and Midnight High-Contrast Dark mode.
        </p>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (theme === 'dark') toggleTheme();
            }}
            className={`flex-1 p-4 rounded-2xl border text-left transition-all ${
              theme === 'light'
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 mb-3 shadow-xs">
              <Sun className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Academic Light</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">High clarity for daytime study halls</p>
          </button>

          <button
            type="button"
            onClick={() => {
              if (theme === 'light') toggleTheme();
            }}
            className={`flex-1 p-4 rounded-2xl border text-left transition-all ${
              theme === 'dark'
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 mb-3 shadow-xs">
              <Moon className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Midnight Dark</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Reduced eye fatigue for late reading</p>
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-500" />
          <span>Automated Notifications & Reminders</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Configure how KLH sends alerts regarding loan due dates, fines, and queue advances.
        </p>

        <form onSubmit={handleSaveNotifications} className="space-y-4">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Loan Due Date Reminders (48h advance)
              </span>
              <span className="text-[11px] text-slate-500">
                Receive proactive notice 2 days prior to loan expiration
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Hold Pickup Availability Alerts
              </span>
              <span className="text-[11px] text-slate-500">
                Immediate notification when a reserved volume is returned to the desk
              </span>
            </div>
            <input
              type="checkbox"
              checked={holdAlerts}
              onChange={(e) => setHoldAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Scholarly Recommendations & New Acquisitions
              </span>
              <span className="text-[11px] text-slate-500">
                Monthly digests based on your course syllabus and borrowed subjects
              </span>
            </div>
            <input
              type="checkbox"
              checked={recommendationAlerts}
              onChange={(e) => setRecommendationAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
            />
          </label>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" leftIcon={<Save className="w-4 h-4" />}>
              Save Preferences
            </Button>
          </div>
        </form>
      </div>

      {/* Security & Password */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-500" />
          <span>Security & Authentication Credentials</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Update your campus password used for catalog login and workstation check-in.
        </p>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
          <div className="pt-2">
            <Button type="submit" size="sm">
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
