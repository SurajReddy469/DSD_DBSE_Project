export type UserRole = 'student' | 'librarian' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  year?: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  membershipDate: string;
  borrowedCount: number;
  finesOwed: number;
}

export type BookStatus = 'available' | 'reserved' | 'low_stock' | 'out_of_stock';

export interface Review {
  id: string;
  bookId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publicationYear: number;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  coverUrl: string;
  language: string;
  status: BookStatus;
  tags: string[];
  reviews?: Review[];
  ddcClass?: string;
  edition?: string;
  floor?: string;
  rack?: string;
  section?: string;
}

export type LoanStatus = 'active' | 'due_soon' | 'overdue' | 'returned';

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  bookAuthor: string;
  userId: string;
  userName: string;
  studentId?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  renewalCount: number;
  fineAmount: number;
}

export type ReservationStatus = 'active' | 'ready' | 'fulfilled' | 'cancelled';

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  userId: string;
  userName: string;
  studentId?: string;
  reservationDate: string;
  expiryDate: string;
  queuePosition: number;
  status: ReservationStatus;
}

export type FineStatus = 'paid' | 'unpaid';

export interface Fine {
  id: string;
  loanId: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  dueDate: string;
  returnDate?: string;
  daysOverdue: number;
  amount: number;
  status: FineStatus;
  paidDate?: string;
  paymentMethod?: string;
}

export type NotificationType = 'due_reminder' | 'overdue' | 'reservation_ready' | 'book_returned' | 'announcement';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  read: boolean;
  link?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  bookCount: number;
  status: 'active' | 'inactive';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'failed';
}

export interface SystemSettings {
  libraryName: string;
  institutionName: string;
  contactEmail: string;
  contactPhone: string;
  maxLoanDurationDays: number;
  maxRenewals: number;
  fineRatePerDay: number;
  maxLoansStudent: number;
  maxLoansFaculty: number;
  enableEmailNotifications: boolean;
  enableAutoOverdueFines: boolean;
  maintenanceMode: boolean;
}
