import { Loan } from '../types';
import { apiRequest } from './api';
export const loanService = {
  getLoans: (userId?:string) => apiRequest<Loan[]>(`/loans${userId?`?userId=${encodeURIComponent(userId)}`:''}`),
  getActiveLoans: (userId?:string) => apiRequest<Loan[]>(`/loans/active${userId?`?userId=${encodeURIComponent(userId)}`:''}`),
  getLoanHistory: (userId?:string) => apiRequest<Loan[]>(`/loans/history${userId?`?userId=${encodeURIComponent(userId)}`:''}`),
  borrowBook: (bookId:string,userId?:string) => apiRequest<Loan>('/loans/borrow',{method:'POST',body:JSON.stringify({bookId,userId})}),
  renewLoan: (loanId:string) => apiRequest<Loan>(`/loans/${loanId}/renew`,{method:'POST'}),
  returnLoan: (loanId:string) => apiRequest<{loan:Loan;fine?:any}>(`/loans/${loanId}/return`,{method:'POST'}),
  issueBookDirectly: (bookId:string,userId:string,dueDateStr:string) => apiRequest<Loan>('/loans/issue',{method:'POST',body:JSON.stringify({bookId,userId,dueDate:dueDateStr})}),
};

export interface DashboardAnalytics {
  totalTitles:number; totalCopies:number; availableCopies:number; activeLoans:number; overdueLoans:number;
  reservations:number; outstandingFines:number; members:number;
  categories:{name:string;count:number}[]; popularBooks:{bookId:string;title:string;borrowCount:number}[];
}

export const circulationService = {
  lookupCopy: (code:string) => apiRequest<{copy:any;book:any}>(`/copies/lookup?code=${encodeURIComponent(code)}`),
  getCopySummary: (bookId:string) => apiRequest<any>(`/books/${bookId}/copies/summary`),
  updateCopyStatus: (copyId:string,status:'available'|'issued'|'lost'|'damaged'|'maintenance') => apiRequest<any>(`/copies/${copyId}/status`,{method:'POST',body:JSON.stringify({status})}),
  getAnalytics: () => apiRequest<DashboardAnalytics>('/dashboard/analytics'),
};
