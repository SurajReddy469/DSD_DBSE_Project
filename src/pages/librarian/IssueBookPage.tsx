import React, { useState, useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { loanService } from '../../services/loanService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  CheckSquare,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search
} from 'lucide-react';
import { User, Book } from '../../types';

export const IssueBookPage: React.FC = () => {
  const { books, refreshData } = useLibrary();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 21);
  const defaultDueStr = defaultDue.toISOString().split('T')[0];

  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDueStr);

  const [memberSearch, setMemberSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const u = await userService.getUsers('student');
      setMembers(u);
    };
    load();
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.studentId || '').toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.isbn.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const handleSetLoanPeriodDays = (days: number) => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + days);
    setDueDate(date.toISOString().split('T')[0]);
  };

  const handleConfirmIssue = async () => {
    if (!selectedMember || !selectedBook) return;
    setIsSubmitting(true);

    try {
      await loanService.issueBookDirectly(selectedBook.id, selectedMember.id, dueDate);
      showToast(`Book issued! "${selectedBook.title}" checked out to ${selectedMember.name}.`, 'success');
      refreshData();
      // Reset form
      setStep(1);
      setSelectedMember(null);
      setSelectedBook(null);
    } catch (err: any) {
      showToast(err.message || 'Error issuing book', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Circulation Desk: Issue Book
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Step-by-step wizard to verify student credentials and check out physical volumes
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        {[
          { num: 1, label: 'Select Member' },
          { num: 2, label: 'Select Volume' },
          { num: 3, label: 'Choose Dates' },
          { num: 4, label: 'Review & Confirm' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step === s.num
                  ? 'bg-brand-600 text-white ring-4 ring-brand-500/20'
                  : step > s.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Select Member */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />
            <span>Step 1: Select Student Cardholder</span>
          </h3>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member by name, student ID, or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pt-2">
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMember(m)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedMember?.id === m.id
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {m.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {m.studentId} • {m.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={m.status} size="sm" />
                  <span className="text-xs text-slate-400">{m.borrowedCount} loans</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              size="md"
              disabled={!selectedMember || selectedMember.status === 'suspended'}
              onClick={() => setStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Book Selection
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Book */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-500" />
              <span>Step 2: Select Volume to Issue</span>
            </h3>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
              Member: {selectedMember?.name}
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalog by title, author, ISBN..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pt-2">
            {filteredBooks.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  if (b.availableCopies > 0) setSelectedBook(b);
                }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  b.availableCopies === 0 ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'
                } ${
                  selectedBook?.id === b.id
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={b.coverUrl} alt={b.title} className="w-10 h-14 object-cover rounded-lg shadow-xs" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {b.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      by {b.author} • Location: {b.shelfLocation}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={b.status} size="sm" />
                  <span className="text-xs text-slate-400 block mt-1">
                    {b.availableCopies} of {b.totalCopies} left
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="md" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              size="md"
              disabled={!selectedBook}
              onClick={() => setStep(3)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Choose Dates
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Choose Dates */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-500" />
            <span>Step 3: Loan & Due Date Scheduling</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Issue / Checkout Date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            />
            <Input
              label="Return Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
              Preset Circulation Duration
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSetLoanPeriodDays(14)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                14 Days (Short Loan)
              </button>
              <button
                type="button"
                onClick={() => handleSetLoanPeriodDays(21)}
                className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold"
              >
                21 Days (Standard)
              </button>
              <button
                type="button"
                onClick={() => handleSetLoanPeriodDays(28)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                28 Days (Faculty Extension)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="md" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button size="md" onClick={() => setStep(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Review Summary
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review Summary & Confirm */}
      {step === 4 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-500" />
            <span>Step 4: Confirm Book Issue Summary</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Member Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Cardholder
              </span>
              <div className="flex items-center gap-3">
                <img src={selectedMember?.avatar} alt={selectedMember?.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedMember?.name}</h4>
                  <p className="text-xs text-slate-500">{selectedMember?.studentId}</p>
                  <p className="text-xs text-slate-500">{selectedMember?.department}</p>
                </div>
              </div>
            </div>

            {/* Book Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Accessioned Volume
              </span>
              <div className="flex items-center gap-3">
                <img src={selectedBook?.coverUrl} alt={selectedBook?.title} className="w-10 h-14 object-cover rounded shadow-xs" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{selectedBook?.title}</h4>
                  <p className="text-xs text-slate-500">{selectedBook?.author}</p>
                  <p className="text-xs text-slate-400">Call: {selectedBook?.shelfLocation}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Checkout: <strong className="text-slate-800 dark:text-slate-200">{issueDate}</strong></span>
            </div>
            <div>
              <span className="text-slate-500">Due Date: <strong className="text-brand-700 dark:text-brand-300 font-bold">{dueDate}</strong></span>
            </div>
            <div>
              <span className="text-slate-500">Overdue Rate: <strong>$0.50 / day</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="md" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              size="md"
              onClick={handleConfirmIssue}
              isLoading={isSubmitting}
              leftIcon={<CheckSquare className="w-4 h-4" />}
            >
              Confirm & Issue Loan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
