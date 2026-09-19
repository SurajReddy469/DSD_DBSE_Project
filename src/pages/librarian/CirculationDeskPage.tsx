import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Barcode, BookOpen, CheckCircle2, CreditCard, LogOut, RefreshCw, ScanLine, UserRound } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { circulationDeskService } from '../../services/circulationService';
import { useToast } from '../../context/ToastContext';
import { useLibrary } from '../../context/LibraryContext';

export const CirculationDeskPage: React.FC = () => {
  const { refreshData } = useLibrary();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'issue'|'return'>('issue');
  const [cardCode, setCardCode] = useState('');
  const [bookCode, setBookCode] = useState('');
  const [member, setMember] = useState<any>(null);
  const [book, setBook] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLInputElement>(null);
  const bookRef = useRef<HTMLInputElement>(null);

  useEffect(() => { cardRef.current?.focus(); }, []);

  const lookupCard = async () => {
    if (!cardCode.trim()) return;
    try { const r = await circulationDeskService.lookupCard(cardCode.trim()); setMember(r); bookRef.current?.focus(); }
    catch (e:any) { setMember(null); showToast(e.message || 'Card not found', 'error'); }
  };
  const lookupBook = async () => {
    if (!bookCode.trim()) return;
    try { setBook(await circulationDeskService.lookupBook(bookCode.trim())); }
    catch (e:any) { setBook(null); showToast(e.message || 'Barcode not found', 'error'); }
  };
  const process = async () => {
    if (!member?.user || !book?.copy) return;
    setBusy(true);
    try {
      const r = await circulationDeskService.scan(mode, cardCode.trim(), bookCode.trim());
      showToast(r.fine ? `${r.message}. Fine ₹${r.fine.amount.toFixed(2)} recorded.` : r.message, r.fine ? 'warning' : 'success');
      refreshData(); setMember(null); setBook(null); setCardCode(''); setBookCode(''); cardRef.current?.focus();
    } catch (e:any) { showToast(e.message || 'Circulation operation failed', 'error'); }
    finally { setBusy(false); }
  };
  const reset = () => { setMember(null); setBook(null); setCardCode(''); setBookCode(''); cardRef.current?.focus(); };

  return <div className="space-y-6 max-w-6xl mx-auto text-left">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Smart Circulation Desk</h1><p className="text-sm text-slate-500 mt-1">Scan a KLH library card and book barcode to issue or return a physical copy.</p></div>
      <div className="flex gap-2"><Button variant={mode==='issue'?'primary':'outline'} onClick={()=>setMode('issue')} leftIcon={<BookOpen className="w-4 h-4"/>}>Issue</Button><Button variant={mode==='return'?'primary':'outline'} onClick={()=>setMode('return')} leftIcon={<LogOut className="w-4 h-4"/>}>Return</Button></div>
    </div>

    <div className="grid lg:grid-cols-2 gap-5">
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2"><ScanLine className="w-5 h-5 text-brand-500"/><h2 className="font-bold">1. Scan Student Card</h2></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase">Library Card / University ID</label><div className="flex gap-2 mt-2"><div className="relative flex-1"><CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input ref={cardRef} value={cardCode} onChange={e=>setCardCode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&lookupCard()} placeholder="KLH-BP-252003XXXX" className="w-full pl-10 pr-3 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"/></div><Button onClick={lookupCard}>Scan</Button></div></div>
        {member && <div className="p-4 rounded-2xl border border-brand-200 bg-brand-50/60 dark:bg-brand-950/30 dark:border-brand-900"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center"><UserRound className="w-5 h-5"/></div><div><p className="font-bold">{member.user.name}</p><p className="text-xs text-slate-500">{member.user.studentId} • {member.user.department || member.user.program || 'Student'}</p></div><div className="ml-auto"><StatusBadge status={member.user.status} size="sm"/></div></div><div className="grid grid-cols-3 gap-3 mt-4 text-center"><div><p className="text-lg font-extrabold">{member.activeLoans.length}</p><p className="text-[10px] text-slate-500">ACTIVE</p></div><div><p className="text-lg font-extrabold">{member.borrowLimit}</p><p className="text-[10px] text-slate-500">LIMIT</p></div><div><p className="text-lg font-extrabold">₹{member.outstandingFine.toFixed(2)}</p><p className="text-[10px] text-slate-500">DUE</p></div></div></div>}
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2"><Barcode className="w-5 h-5 text-brand-500"/><h2 className="font-bold">2. Scan Book Copy</h2></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase">Barcode / Accession Number</label><div className="flex gap-2 mt-2"><div className="relative flex-1"><Barcode className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input ref={bookRef} value={bookCode} onChange={e=>setBookCode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&lookupBook()} placeholder="KLH-BK-0001-001" className="w-full pl-10 pr-3 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"/></div><Button onClick={lookupBook}>Scan</Button></div></div>
        {book && <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700"><div className="flex gap-3"><img src={book.book?.coverUrl} className="w-12 h-16 rounded object-cover"/><div className="min-w-0"><p className="font-bold truncate">{book.book?.title}</p><p className="text-xs text-slate-500">{book.book?.author}</p><p className="text-xs font-mono mt-2">{book.copy?.barcode}</p><p className="text-xs text-slate-500">Accession: {book.copy?.accessionNumber}</p></div><div className="ml-auto"><StatusBadge status={book.copy?.status} size="sm"/></div></div></div>}
      </section>
    </div>

    <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-slate-400">Ready for transaction</p><h2 className="text-xl font-extrabold mt-1">{mode==='issue'?'Issue physical copy':'Return physical copy'}</h2><p className="text-sm text-slate-400 mt-1">{member?.user?.name || 'Scan student card'} → {book?.book?.title || 'Scan book barcode'}</p></div><div className="flex gap-2"><Button variant="outline" onClick={reset} leftIcon={<RefreshCw className="w-4 h-4"/>}>Reset</Button><Button disabled={busy || !member?.user || !book?.copy} onClick={process} leftIcon={<CheckCircle2 className="w-4 h-4"/>}>{busy?'Processing...':mode==='issue'?'Confirm Issue':'Confirm Return'}</Button></div></div></section>

    {member?.activeLoans?.length>0 && <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"><h2 className="font-bold mb-4">Current loans</h2><div className="grid md:grid-cols-2 gap-3">{member.activeLoans.map((l:any)=><div key={l.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><p className="font-semibold text-sm">{l.bookTitle}</p><p className="text-xs text-slate-500">Due {l.dueDate} • {l.status}</p></div>)}</div></section>}
    {member?.outstandingFine>0 && <div className="flex items-center gap-2 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm"><AlertTriangle className="w-5 h-5"/> Outstanding fines: ₹{member.outstandingFine.toFixed(2)}. Final borrowing restrictions are enforced by the backend rules.</div>}
  </div>;
};
