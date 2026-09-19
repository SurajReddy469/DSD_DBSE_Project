import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Library, User, Mail, Lock, Building, CheckSquare, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    department: 'Computer Science & Engineering',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const departments = [
    { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering' },
    { value: 'Computer Science & Information Technology', label: 'Computer Science & Information Technology' },
    { value: 'Electronics & Communication Engineering', label: 'Electronics & Communication Engineering' },
    { value: 'Electronics Engineering', label: 'Electronics Engineering' },
    { value: 'Computer Science & Applications', label: 'Computer Science & Applications' },
    { value: 'Business / MBA', label: 'Business / MBA' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.studentId.trim()) newErrors.studentId = 'Campus ID is required';
    if (!formData.email.trim()) newErrors.email = 'University email is required';
    else if (!/^[^\s@]+@(klh\.edu\.in|kluniversity\.in)$/i.test(formData.email.trim())) newErrors.email = 'Use your @klh.edu.in or @kluniversity.in email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8 || !/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) newErrors.password = 'Use 8+ characters with letters and numbers';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreed) newErrors.agreed = 'You must agree to the Library Circulation Policy';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // Create user via userService
      const result = await userService.registerUser({
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId,
        department: formData.department,
        year: 'Undergraduate',
        phone: '+1 (555) 000-0000',
        password: formData.password,
      });

      await login(result.user.email, 'student', formData.password);
      showToast('Registration successful! Welcome to the KLH Library.', 'success');
      navigate('/student/dashboard');
    } catch {
      showToast('Failed to register. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-left">
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-3">
            <Library className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Register Member Card
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Join KLH University KLH Bachupally Library for borrowing, reservations, and research access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Eleanor Vance"
              error={errors.name}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Student / Staff ID"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="e.g. 2520030001"
              error={errors.studentId}
            />
          </div>

          <Select
            label="Academic Department"
            options={departments}
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />

          <Input
            label="University Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="yourid@klh.edu.in"
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              error={errors.password}
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              error={errors.confirmPassword}
              leftIcon={<Lock className="w-4 h-4" />}
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={formData.agreed}
                onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                I agree to the Library Circulation Policy, loan periods, and responsible care of borrowed university materials.
              </span>
            </label>
            {errors.agreed && <p className="text-xs text-rose-500 mt-1">{errors.agreed}</p>}
          </div>

          <Button
            type="submit"
            size="md"
            className="w-full mt-3"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Academic Account
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          Already have an active library card?{' '}
          <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
