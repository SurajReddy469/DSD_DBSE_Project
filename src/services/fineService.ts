import { Fine } from '../types';
import { apiRequest } from './api';
export const fineService = {
  getFines: (userId?:string) => apiRequest<Fine[]>(`/fines${userId?`?userId=${encodeURIComponent(userId)}`:''}`),
  payFine: (fineId:string,paymentMethod='Campus Card (Mock Pay)') => apiRequest<Fine>(`/fines/${fineId}/pay`,{method:'POST',body:JSON.stringify({paymentMethod})}),
  getFineStats: (userId?:string) => apiRequest<{totalOutstanding:number;totalPaid:number;unpaidCount:number}>(`/fines/stats${userId?`?userId=${encodeURIComponent(userId)}`:''}`),
};
