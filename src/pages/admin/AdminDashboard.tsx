import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, BookOpen, CheckSquare, AlertTriangle, IndianRupee, Bookmark, ShieldCheck, FolderTree, RefreshCw, Download } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard } from '../../components/common/ChartCard';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { AdminAnalytics, downloadReport, getAdminAnalytics } from '../../services/reportService';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setLoading(true); setData(await getAdminAnalytics()); }
    catch (e: any) { showToast(e.message || 'Unable to load analytics', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const k = data?.kpis;
  const chartMonths = data?.monthlyCirculation.map(x => ({ label: x.label.slice(5), value: x.issued })) || [];
  const categories = data?.categoryDistribution || [];

  const exportInventory = async () => {
    try { await downloadReport('inventory'); showToast('Inventory report downloaded.', 'success'); }
    catch (e: any) { showToast(e.message || 'Export failed', 'error'); }
  };

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">KLH Bachupally Campus</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Library Command Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Live operational analytics, inventory health, circulation and governance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={load} leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}>Refresh</Button>
          <Button size="sm" variant="secondary" onClick={exportInventory} leftIcon={<Download className="w-4 h-4" />}>Inventory CSV</Button>
          <Link to="/admin/audit"><Button size="sm" variant="outline" leftIcon={<ShieldCheck className="w-4 h-4" />}>Audit</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        <StatCard title="Students" value={k?.students ?? '—'} subtitle="Registered members" icon={<Users className="w-4 h-4" />} color="brand" />
        <StatCard title="Librarians" value={k?.librarians ?? '—'} subtitle="Library staff" icon={<UserCheck className="w-4 h-4" />} color="purple" />
        <StatCard title="Catalog Titles" value={k?.titles ?? '—'} subtitle={`${k?.copies ?? '—'} physical copies`} icon={<BookOpen className="w-4 h-4" />} color="brand" />
        <StatCard title="Active Loans" value={k?.activeLoans ?? '—'} subtitle={`${k?.dueSoonLoans ?? 0} due soon`} icon={<CheckSquare className="w-4 h-4" />} color="emerald" />
        <StatCard title="Overdue" value={k?.overdueLoans ?? '—'} subtitle="Needs attention" icon={<AlertTriangle className="w-4 h-4" />} color="rose" />
        <StatCard title="Reservations" value={k?.reservations ?? '—'} subtitle="Active / ready" icon={<Bookmark className="w-4 h-4" />} color="amber" />
        <StatCard title="Outstanding" value={k ? `₹${k.outstandingFines.toFixed(2)}` : '—'} subtitle={`₹${(k?.paidFines ?? 0).toFixed(2)} paid`} icon={<IndianRupee className="w-4 h-4" />} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Circulation" subtitle="Issued items over the last six calendar months" type="line" data={chartMonths.length ? chartMonths : [{ label: '—', value: 0 }]} height={220} />
        <ChartCard title="Borrowing by Category" subtitle="Total loan activity by catalog subject" type="donut" data={categories.length ? categories : [{ label: 'No data', value: 0 }]} height={220} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4"><div><h3 className="text-sm font-bold">Most Borrowed Titles</h3><p className="text-xs text-slate-400 mt-1">Live circulation counts</p></div><Link to="/admin/reports" className="text-xs font-bold text-brand-600">Open reports →</Link></div>
          <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase"><th className="py-3 px-3">Title</th><th className="py-3 px-3">Author</th><th className="py-3 px-3 text-center">Loans</th><th className="py-3 px-3 text-right">Available</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{(data?.popularBooks || []).slice(0,6).map(b=><tr key={b.id}><td className="py-3 px-3 font-bold">{b.title}</td><td className="py-3 px-3 text-slate-500">{b.author}</td><td className="py-3 px-3 text-center font-bold text-brand-600">{b.loans}</td><td className="py-3 px-3 text-right">{b.available}/{b.total}</td></tr>)}</tbody></table></div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold">Inventory Health</h3><p className="text-xs text-slate-400 mt-1 mb-5">Physical collection status</p>
          <div className="space-y-4 text-xs">
            {[['Available', k?.availableCopies || 0], ['Issued', k?.issuedCopies || 0], ['Lost', k?.lostCopies || 0], ['Damaged', k?.damagedCopies || 0]].map(([label,value])=><div key={String(label)} className="flex items-center justify-between"><span className="text-slate-500">{label}</span><span className="font-bold">{value}</span></div>)}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"><span className="font-semibold">Utilization</span><span className="text-lg font-extrabold text-brand-600">{k?.circulationUtilization ?? 0}%</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/users" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md"><Users className="w-5 h-5 text-brand-600 mb-3" /><h4 className="font-bold text-sm">User Management</h4><p className="text-xs text-slate-500 mt-1">Manage members, roles and account status.</p></Link>
        <Link to="/admin/librarians" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md"><UserCheck className="w-5 h-5 text-emerald-600 mb-3" /><h4 className="font-bold text-sm">Librarian Staff</h4><p className="text-xs text-slate-500 mt-1">Manage circulation staff access.</p></Link>
        <Link to="/admin/categories" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md"><FolderTree className="w-5 h-5 text-purple-600 mb-3" /><h4 className="font-bold text-sm">Categories</h4><p className="text-xs text-slate-500 mt-1">Maintain catalog taxonomy.</p></Link>
        <Link to="/admin/settings" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md"><ShieldCheck className="w-5 h-5 text-amber-600 mb-3" /><h4 className="font-bold text-sm">System Governance</h4><p className="text-xs text-slate-500 mt-1">Policies, limits and notification controls.</p></Link>
      </div>
    </div>
  );
};
