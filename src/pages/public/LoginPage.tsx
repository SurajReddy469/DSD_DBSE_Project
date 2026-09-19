import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Library, GraduationCap, Briefcase, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('student@klh.edu.in');
  const [password, setPassword] = useState('password');
  const [roleSelection, setRoleSelection] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSelectDemo = (selectedRole: UserRole, demoEmail: string) => {
    setRoleSelection(selectedRole);
    setEmail(demoEmail);
    setPassword('password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) newErrors.email = 'Please enter your university ID or academic email';
    if (!password) newErrors.password = 'Please enter your password';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login(email, roleSelection, password);
      showToast(`Welcome back! Signed in as ${roleSelection}.`, 'success');

      if (roleSelection === 'admin') navigate('/admin/dashboard');
      else if (roleSelection === 'librarian') navigate('/librarian/dashboard');
      else navigate('/student/dashboard');
    } catch {
      showToast('Authentication failed. Please check credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-left">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-4">
            <Library className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Sign In to KLH University
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your university library card and scholarly dashboard
          </p>
        </div>

        {/* Demo Roles Shortcut Card */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Demo Accounts (development)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelectDemo('student', 'student@klh.edu.in')}
              className={`p-2 rounded-xl text-center border transition-all ${
                roleSelection === 'student'
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4 mx-auto mb-1 text-brand-500" />
              <span className="text-[11px] block truncate">Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo('librarian', 'librarian@klh.edu.in')}
              className={`p-2 rounded-xl text-center border transition-all ${
                roleSelection === 'librarian'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
              <span className="text-[11px] block truncate">Librarian</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo('admin', 'admin@klh.edu.in')}
              className={`p-2 rounded-xl text-center border transition-all ${
                roleSelection === 'admin'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-purple-500" />
              <span className="text-[11px] block truncate">Admin</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="University ID or Academic Email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="e.g. 2520030001 or student@klh.edu.in"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span>Remember this workstation</span>
            </label>
            <Link to="/forgot-password" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            size="md"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Portal
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          Not yet registered as an academic member?{' '}
          <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Register for a library card
          </Link>
        </div>
      </div>
    </div>
  );
};
