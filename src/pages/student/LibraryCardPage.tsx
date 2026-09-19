import React, { useEffect, useState } from 'react';
import { CreditCard, Printer, ShieldCheck, BookOpen, IndianRupee, MapPin, GraduationCap } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

type CardData = {
  name:string; email:string; studentId?:string; libraryCardId?:string; campus?:string; program?:string; section?:string;
  department?:string; year?:string; borrowedCount:number; finesOwed:number; borrowLimit:number; remainingBorrowSlots:number;
  outstandingFine:number; libraryStatus:string; membershipDate:string; avatar?:string;
};

export const LibraryCardPage: React.FC = () => {
  const [card,setCard]=useState<CardData|null>(null); const [loading,setLoading]=useState(true); const {showToast}=useToast();
  useEffect(()=>{apiRequest<CardData>('/members/me/library-card').then(setCard).catch(e=>showToast(e.message,'error')).finally(()=>setLoading(false));},[]);
  if(loading) return <div className="p-8 text-center text-slate-500">Loading library card...</div>;
  if(!card) return <div className="p-8 text-center text-slate-500">Unable to load library card.</div>;
  return <div className="max-w-4xl mx-auto space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div><h1 className="text-3xl font-extrabold tracking-tight">Digital Library Card</h1><p className="text-sm text-slate-500 mt-1">KLH University · Bachupally Campus</p></div>
      <Button leftIcon={<Printer className="w-4 h-4"/>} onClick={()=>window.print()}>Print Card</Button>
    </div>
    <div className="print-card rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="p-6 bg-gradient-to-r from-brand-700 to-brand-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-3"><CreditCard/><div><p className="text-xs uppercase tracking-widest opacity-80">Official Library Membership</p><h2 className="text-xl font-extrabold">KLH UNIVERSITY</h2><p className="text-xs opacity-90">Bachupally Campus Library</p></div></div>
        <ShieldCheck className="w-8 h-8 opacity-90"/>
      </div>
      <div className="p-6 sm:p-8 grid md:grid-cols-[120px_1fr] gap-7">
        <img src={card.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'} className="w-28 h-28 rounded-2xl object-cover border-4 border-slate-100 dark:border-slate-800"/>
        <div className="space-y-5">
          <div><h3 className="text-2xl font-extrabold">{card.name}</h3><p className="text-sm text-slate-500">{card.email}</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><span className="text-xs text-slate-400 block">University ID</span><b>{card.studentId || '—'}</b></div>
            <div><span className="text-xs text-slate-400 block">Library Card</span><b className="font-mono">{card.libraryCardId}</b></div>
            <div><span className="text-xs text-slate-400 block">Program</span><b>{card.program || card.department || '—'}</b></div>
            <div><span className="text-xs text-slate-400 block">Section / Year</span><b>{card.section || '—'} / {card.year || '—'}</b></div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-4 flex items-center gap-3"><MapPin className="w-4 h-4 text-brand-500"/><span className="text-sm"><b>{card.campus} Campus</b> · KLH University Library</span></div>
          <div className="font-mono tracking-[0.25em] text-center text-lg py-3 border-y border-dashed border-slate-300 dark:border-slate-700">{card.libraryCardId?.replace(/-/g,' · ')}</div>
        </div>
      </div>
    </div>
    <div className="grid sm:grid-cols-3 gap-4">
      <Stat icon={<BookOpen/>} label="Active Loans" value={`${card.borrowedCount} / ${card.borrowLimit}`} />
      <Stat icon={<GraduationCap/>} label="Available Loan Slots" value={String(card.remainingBorrowSlots)} />
      <Stat icon={<IndianRupee/>} label="Outstanding Fine" value={`₹${card.outstandingFine.toFixed(2)}`} />
    </div>
    <p className="text-xs text-slate-400">Membership status: <span className="font-semibold text-emerald-600">{card.libraryStatus}</span> · Member since {card.membershipDate}</p>
  </div>
};

const Stat=({icon,label,value}:{icon:React.ReactNode;label:string;value:string})=><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="flex items-center gap-2 text-brand-500 mb-2">{React.cloneElement(icon as React.ReactElement,{className:'w-4 h-4'})}<span className="text-xs text-slate-500">{label}</span></div><p className="text-xl font-extrabold">{value}</p></div>;
