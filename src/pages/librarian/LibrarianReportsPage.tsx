import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, FileText, BookOpen, Users, IndianRupee, ArrowUpRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ChartCard } from '../../components/common/ChartCard';
import { useToast } from '../../context/ToastContext';
import { AdminAnalytics, downloadReport, getAdminAnalytics } from '../../services/reportService';

export const LibrarianReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const load = async () => { try { setLoading(true); setData(await getAdminAnalytics()); } catch (e:any) { showToast(e.message || 'Unable to load reports', 'error'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const exportType = async (type: 'circulation'|'members'|'fines'|'inventory') => { try { await downloadReport(type); showToast(`${type[0].toUpperCase()+type.slice(1)} report downloaded.`, 'success'); } catch(e:any) { showToast(e.message || 'Export failed', 'error'); } };
  const k=data?.kpis;
  return <div className="space-y-7 text-left">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-brand-600">KLH Bachupally Campus</p><h1 className="text-2xl sm:text-3xl font-extrabold">Reports & Analytics</h1><p className="text-sm text-slate-500 mt-1">Operational reporting for circulation, members, fines and inventory.</p></div><Button size="sm" variant="outline" onClick={load} leftIcon={<RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`} />}>Refresh</Button></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        ['Circulation','Loan activity and returns','circulation',<BookOpen className="w-5 h-5" />],
        ['Members','Student and staff directory','members',<Users className="w-5 h-5" />],
        ['Fines','Outstanding and paid dues','fines',<IndianRupee className="w-5 h-5" />],
        ['Inventory','Catalog and physical copies','inventory',<FileText className="w-5 h-5" />],
      ].map(([title,desc,type,icon])=><div key={String(type)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="flex items-center justify-between"><span className="p-2.5 rounded-xl bg-brand-50 text-brand-600">{icon}</span><ArrowUpRight className="w-4 h-4 text-slate-400" /></div><h3 className="font-bold mt-4">{title}</h3><p className="text-xs text-slate-500 mt-1">{desc}</p><Button className="mt-4 w-full" size="sm" variant="outline" onClick={()=>exportType(type as any)} leftIcon={<Download className="w-4 h-4" />}>Export CSV</Button></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Six-Month Circulation" subtitle="Issued books by calendar month" type="line" data={data?.monthlyCirculation.map(x=>({label:x.label.slice(5),value:x.issued})) || [{label:'—',value:0}]} height={230}/>
      <ChartCard title="Borrowing by Department" subtitle="Circulation grouped by member department" type="progress" data={data?.departmentBorrowing.length?data.departmentBorrowing:[{label:'No data',value:0}]} height={230}/>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5"><span className="text-xs text-slate-500">Active loans</span><div className="text-2xl font-bold mt-1">{k?.activeLoans ?? '—'}</div></div>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5"><span className="text-xs text-slate-500">Overdue</span><div className="text-2xl font-bold mt-1">{k?.overdueLoans ?? '—'}</div></div>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5"><span className="text-xs text-slate-500">Outstanding fines</span><div className="text-2xl font-bold mt-1">₹{(k?.outstandingFines ?? 0).toFixed(2)}</div></div>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5"><span className="text-xs text-slate-500">Inventory utilization</span><div className="text-2xl font-bold mt-1">{k?.circulationUtilization ?? 0}%</div></div>
    </div>
  </div>;
};
