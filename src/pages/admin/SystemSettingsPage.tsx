import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { SystemSettings } from '../../types';
import { Settings, Save, ShieldAlert, Sliders, Mail, DollarSign } from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const s = await userService.getSettings();
      setSettings(s);
    };
    fetch();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);

    try {
      await userService.updateSettings(settings);
      showToast('System configuration saved and live policy applied.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Institutional Policies & System Parameters
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Global circulation rules, fine accrual parameters, borrowing limits, and notification triggers
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Institutional Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-500" />
            <span>Library Identification & Desk Contacts</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Library Facility Name"
              value={settings.libraryName}
              onChange={(e) => setSettings({ ...settings, libraryName: e.target.value })}
              required
            />
            <Input
              label="Parent Institution"
              value={settings.institutionName}
              onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
              required
            />
            <Input
              label="Circulation Contact Email"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              required
            />
            <Input
              label="Circulation Phone Desk"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Circulation Policies */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Circulation Limits & Fine Rates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Standard Loan Duration (Days)"
              type="number"
              min={7}
              max={60}
              value={settings.maxLoanDurationDays}
              onChange={(e) => setSettings({ ...settings, maxLoanDurationDays: Number(e.target.value) })}
              required
            />

            <Input
              label="Maximum Allowed Renewals"
              type="number"
              min={0}
              max={5}
              value={settings.maxRenewals}
              onChange={(e) => setSettings({ ...settings, maxRenewals: Number(e.target.value) })}
              required
            />

            <Input
              label="Overdue Fine Rate ($ / day)"
              type="number"
              step="0.05"
              min={0}
              value={settings.fineRatePerDay}
              onChange={(e) => setSettings({ ...settings, fineRatePerDay: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Max Concurrent Loans (Undergraduate)"
              type="number"
              min={1}
              value={settings.maxLoansStudent}
              onChange={(e) => setSettings({ ...settings, maxLoansStudent: Number(e.target.value) })}
              required
            />

            <Input
              label="Max Concurrent Loans (Faculty / Postgrad)"
              type="number"
              min={1}
              value={settings.maxLoansFaculty}
              onChange={(e) => setSettings({ ...settings, maxLoansFaculty: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        {/* Automation & Safety Toggles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-500" />
            <span>Automated System Services</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Automated Overdue Fine Calculation Engine
                </span>
                <span className="text-[11px] text-slate-500">
                  Accrue daily overdue fines automatically upon late return check-in
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableAutoOverdueFines}
                onChange={(e) => setSettings({ ...settings, enableAutoOverdueFines: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Campus SMTP Email Notifications & Dispatch
                </span>
                <span className="text-[11px] text-slate-500">
                  Deliver 48-hour due date notices and hold pickup availability emails
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            size="md"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save System Policies
          </Button>
        </div>
      </form>
    </div>
  );
};
