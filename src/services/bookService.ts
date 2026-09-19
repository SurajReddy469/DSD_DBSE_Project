import { Book, Category } from '../types';
import { apiRequest } from './api';

export interface BookFilterParams { search?: string; category?: string; author?: string; availability?: 'all'|'available'|'low_stock'|'out_of_stock'; minRating?: number; year?: number|string; sortBy?: 'title'|'rating'|'year'|'availableCopies'; sortOrder?: 'asc'|'desc'; page?: number; limit?: number; }
export interface PaginatedBooksResult { books: Book[]; total: number; page: number; totalPages: number; }

export const bookService = {
  getBooks: (params: BookFilterParams = {}) => apiRequest<PaginatedBooksResult>(`/books?${new URLSearchParams(Object.entries(params).filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>[k,String(v)])).toString()}`),
  getBookById: async (id: string) => { try { return await apiRequest<Book>(`/books/${id}`); } catch { return undefined; } },
  getFeaturedBooks: (limit=4) => apiRequest<Book[]>(`/books/featured?limit=${limit}`),
  getSimilarBooks: (category:string,currentBookId:string,limit=3) => apiRequest<Book[]>(`/books/similar?${new URLSearchParams({category,currentBookId,limit:String(limit)})}`),
  createBook: (bookData: Omit<Book,'id'|'rating'|'reviewCount'>) => apiRequest<Book>('/books',{method:'POST',body:JSON.stringify(bookData)}),
  updateBook: (id:string, updates:Partial<Book>) => apiRequest<Book>(`/books/${id}`,{method:'PATCH',body:JSON.stringify(updates)}),
  deleteBook: async (id:string) => { await apiRequest(`/books/${id}`,{method:'DELETE'}); return true; },
  getCategories: () => apiRequest<Category[]>('/categories'),
};
