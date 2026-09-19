import { apiRequest } from './api';

export interface CirculationLookup {
  user: any;
  borrowLimit: number;
  activeLoans: any[];
  outstandingFine: number;
}

export const circulationDeskService = {
  lookupCard: (code: string) => apiRequest<CirculationLookup>(`/circulation/card/${encodeURIComponent(code)}`),
  lookupBook: (code: string) => apiRequest<any>(`/circulation/book/${encodeURIComponent(code)}`),
  scan: (action: 'issue' | 'return', cardCode: string, bookCode: string) =>
    apiRequest<any>('/circulation/scan', {
      method: 'POST',
      body: JSON.stringify({ action, cardCode, bookCode }),
    }),
};
