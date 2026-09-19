import { Reservation } from '../types';
import { apiRequest } from './api';
export const reservationService = {
  getReservations: (userId?:string) => apiRequest<Reservation[]>(`/reservations${userId?`?userId=${encodeURIComponent(userId)}`:''}`),
  reserveBook: (bookId:string,userId?:string) => apiRequest<Reservation>('/reservations',{method:'POST',body:JSON.stringify({bookId,userId})}),
  cancelReservation: async (reservationId:string) => { await apiRequest(`/reservations/${reservationId}/cancel`,{method:'POST'}); return true; },
  markReadyForPickup: (reservationId:string) => apiRequest<Reservation>(`/reservations/${reservationId}/ready`,{method:'POST'}),
};
