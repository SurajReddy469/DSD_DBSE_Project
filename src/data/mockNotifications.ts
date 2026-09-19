import { Notification } from '../types';

export const mockNotifications: Notification[] = [
  {
    id: 'nt-401',
    userId: 'usr-student-1',
    title: 'Urgent: Book Overdue',
    message: '"Deep Learning" was due on March 5, 2024. Overdue charges of $0.50/day are currently accumulating.',
    type: 'overdue',
    date: '2024-03-06T09:00:00Z',
    read: false,
    link: '/student/fines',
  },
  {
    id: 'nt-402',
    userId: 'usr-student-1',
    title: 'Due Soon Reminder',
    message: '"Introduction to Algorithms (CLRS)" is due in 2 days (March 14, 2024). Renew online if needed.',
    type: 'due_reminder',
    date: '2024-03-12T08:30:00Z',
    read: false,
    link: '/student/borrowed',
  },
  {
    id: 'nt-403',
    userId: 'usr-student-1',
    title: 'Reservation Status Update',
    message: 'You are position #1 in queue for "Principles of Quantum Mechanics". We will notify you when a copy is checked in.',
    type: 'reservation_ready',
    date: '2024-03-02T14:15:00Z',
    read: true,
    link: '/student/reservations',
  },
  {
    id: 'nt-404',
    userId: 'usr-student-1',
    title: 'Book Return Confirmed',
    message: 'Receipt: "Clean Architecture: A Craftsman\'s Guide" was returned in good condition. Thank you!',
    type: 'book_returned',
    date: '2024-01-24T16:20:00Z',
    read: true,
    link: '/student/history',
  },
  {
    id: 'nt-405',
    userId: 'usr-student-1',
    title: 'Spring Break Library Hours',
    message: 'The Main Academic Library will operate on modified hours (8:00 AM - 6:00 PM) during Spring Break week.',
    type: 'announcement',
    date: '2024-03-10T10:00:00Z',
    read: true,
  }
];
