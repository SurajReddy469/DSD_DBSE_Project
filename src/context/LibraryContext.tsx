import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Book, Loan, Reservation, Fine, Notification, Category } from '../types';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

interface LibraryStats { currentlyBorrowed:number; dueSoon:number; overdue:number; activeReservations:number; currentFine:number; totalBooks:number; totalMembers:number; totalLoansIssued:number; totalPendingReservations:number; totalOutstandingFines:number; }
interface LibraryContextType { books:Book[]; loans:Loan[]; reservations:Reservation[]; fines:Fine[]; notifications:Notification[]; categories:Category[]; unreadCount:number; stats:LibraryStats; markNotificationAsRead:(id:string)=>void; markAllNotificationsAsRead:()=>void; refreshData:()=>void; }
const LibraryContext=createContext<LibraryContextType|undefined>(undefined);

export const LibraryProvider:React.FC<{children:React.ReactNode}>=({children})=>{
 const {user,isAuthenticated}=useAuth();
 const [books,setBooks]=useState<Book[]>([]),[loans,setLoans]=useState<Loan[]>([]),[reservations,setReservations]=useState<Reservation[]>([]),[fines,setFines]=useState<Fine[]>([]),[notifications,setNotifications]=useState<Notification[]>([]),[categories,setCategories]=useState<Category[]>([]),[stats,setStats]=useState<LibraryStats>({currentlyBorrowed:0,dueSoon:0,overdue:0,activeReservations:0,currentFine:0,totalBooks:0,totalMembers:0,totalLoansIssued:0,totalPendingReservations:0,totalOutstandingFines:0});
 const loadAll=useCallback(async()=>{ try{ const [b,c]=await Promise.all([apiRequest<any>('/books?limit=100'),apiRequest<Category[]>('/categories')]); setBooks(b.books); setCategories(c); if(!isAuthenticated)return; const uid=user?.role==='student'?user.id:undefined; const [l,r,f,n,s]=await Promise.all([apiRequest<Loan[]>(`/loans${uid?`?userId=${uid}`:''}`),apiRequest<Reservation[]>(`/reservations${uid?`?userId=${uid}`:''}`),apiRequest<Fine[]>(`/fines${uid?`?userId=${uid}`:''}`),apiRequest<Notification[]>('/notifications'),apiRequest<LibraryStats>('/dashboard/stats')]); setLoans(l);setReservations(r);setFines(f);setNotifications(n);setStats(s);}catch(e){console.error(e);}},[isAuthenticated,user?.id,user?.role]);
 useEffect(()=>{loadAll();},[loadAll]);
 const markNotificationAsRead=(id:string)=>{apiRequest(`/notifications/${id}/read`,{method:'POST'}).then(loadAll).catch(console.error)};
 const markAllNotificationsAsRead=()=>{apiRequest('/notifications/read-all',{method:'POST'}).then(loadAll).catch(console.error)};
 const userNotifications=notifications.filter(n=>!user||n.userId===user.id); const unreadCount=userNotifications.filter(n=>!n.read).length;
 return <LibraryContext.Provider value={{books,loans,reservations,fines,notifications:userNotifications,categories,unreadCount,stats,markNotificationAsRead,markAllNotificationsAsRead,refreshData:()=>{loadAll()}}}>{children}</LibraryContext.Provider>;
};
export const useLibrary=():LibraryContextType=>{const context=useContext(LibraryContext);if(!context)throw new Error('useLibrary must be used within an LibraryProvider');return context;};
