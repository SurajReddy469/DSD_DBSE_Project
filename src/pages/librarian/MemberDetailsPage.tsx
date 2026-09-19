import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { userService } from '../../services/userService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { ArrowLeft, User, BookOpen, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '../../types';

export const MemberDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loans, fines } = useLibrary();
  const navigate = useNavigate();

  const [member, setMember] = useState<UserType | undefined>(undefined);

  useEffect(() => {
    const fetchMember = async () => {
      if (id) {
        const found = await userService.getUserById(id);
        setMember(found);
      }
    };
    fetchMember();
  }, [id]);

  if (!member) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Member Not Found</h3>
        <Link to="/librarian/members" className="mt-4 inline-block">
          <Button size="sm">Back to Members</Button>
        </Link>
      </div>
    );
  }

  const memberLoans = loans.filter((l) => l.userId === member.id);
  const activeLoans = memberLoans.filter((l) => l.status !== 'returned');
  const returnedLoans = memberLoans.filter((l) => l.status === 'returned');
  const memberFines = fines.filter((f) => f.userId === member.id);

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member Directory</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Member Circulation Record
        </h1>
      </div>

      {/* Member Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={member.avatar}
          alt={member.name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {member.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {member.department} • Card #{member.studentId}
              </p>
            </div>
            <StatusBadge status={member.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Email</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{member.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Phone</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{member.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Active Loans</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{activeLoans.length} books</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Account Dues</span>
              <span className={`font-bold ${member.finesOwed ? 'text-rose-600' : 'text-emerald-600'}`}>
                ${member.finesOwed.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Loans Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-500" />
          <span>Currently Checked Out Volumes ({activeLoans.length})</span>
        </h3>

        {activeLoans.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No active loans issued to this student.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeLoans.map((loan) => (
              <div key={loan.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={loan.bookCover} alt={loan.bookTitle} className="w-9 h-12 object-cover rounded shadow-xs" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{loan.bookTitle}</p>
                    <p className="text-[11px] text-slate-500">Issued: {loan.issueDate} • Due: {loan.dueDate}</p>
                  </div>
                </div>
                <StatusBadge status={loan.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fines Section */}
      {memberFines.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Fines & Financial Record</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {memberFines.map((fine) => (
              <div key={fine.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{fine.bookTitle}</p>
                  <p className="text-slate-500">{fine.daysOverdue} days overdue</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-slate-100">${fine.amount.toFixed(2)}</span>
                  <StatusBadge status={fine.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
