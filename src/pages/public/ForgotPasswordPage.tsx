import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { apiRequest } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Library, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoToken, setDemoToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const result = await apiRequest<{message:string;demoToken?:string}>('/auth/forgot-password',{method:'POST',body:JSON.stringify({email})});
      setDemoToken(result.demoToken || '');
      setSubmitted(true);
    } finally { setIsLoading(false); }
  };

  const handleReset = async () => {
    if (!demoToken || !newPassword) return;
    setIsLoading(true);
    try {
      await apiRequest('/auth/reset-password',{method:'POST',body:JSON.stringify({token:demoToken,password:newPassword})});
      setResetDone(true);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-left">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-3">
            <Library className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Reset Account Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter your university email to receive a password reset token
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              {resetDone ? 'Password Updated' : 'Reset Instructions Dispatched'}
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
              {resetDone ? 'Your password has been updated. You can sign in now.' : <>Recovery was requested for <strong>{email}</strong>. In this local development build, a demo reset token is shown below.</>}
            </p>
            {!resetDone && demoToken && <div className="space-y-3 pt-2"><div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[10px] break-all text-left"><strong>Demo reset token:</strong> {demoToken}</div><Input label="New Password" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="8+ characters with letters and numbers" /><Button onClick={handleReset} type="button" size="sm" className="w-full" isLoading={isLoading}>Set New Password</Button></div>}
            <div className="pt-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-emerald-300 dark:border-emerald-700 text-xs">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Academic Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.vance@klh.edu.in"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Must match your registered student or staff email"
            />

            <Button type="submit" size="md" className="w-full" isLoading={isLoading}>
              Send Recovery Link
            </Button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
