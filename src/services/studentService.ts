import { apiRequest } from './api';
import { Book } from '../types';

export interface StudentInsights {
  totalLoans: number;
  completedLoans: number;
  activeLoans: number;
  preferredCategories: Array<{ name: string; count: number }>;
  monthlyActivity: Array<{ label: string; value: number }>;
}

export const studentService = {
  getInsights: () => apiRequest<StudentInsights>('/student/insights'),
  getRecommendations: (limit = 6) => apiRequest<Book[]>(`/books/recommended?limit=${limit}`),
};
