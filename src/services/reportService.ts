import { apiRequest, API_URL } from './api';

export interface AdminAnalytics {
  generatedAt: string;
  library: string;
  campus: string;
  kpis: {
    students: number;
    activeMembers: number;
    suspendedMembers: number;
    librarians: number;
    titles: number;
    copies: number;
    availableCopies: number;
    issuedCopies: number;
    lostCopies: number;
    damagedCopies: number;
    activeLoans: number;
    overdueLoans: number;
    dueSoonLoans: number;
    reservations: number;
    outstandingFines: number;
    paidFines: number;
    circulationUtilization: number;
  };
  monthlyCirculation: Array<{ label: string; issued: number; returned: number }>;
  categoryDistribution: Array<{ label: string; value: number }>;
  departmentBorrowing: Array<{ label: string; value: number }>;
  popularBooks: Array<{ id: string; title: string; author: string; loans: number; available: number; total: number }>;
  overdueTrend: Array<{ label: string; value: number }>;
}

export const getAdminAnalytics = () => apiRequest<AdminAnalytics>('/admin/analytics');

export const downloadReport = async (type: 'circulation' | 'members' | 'fines' | 'inventory') => {
  const token = localStorage.getItem('lms_access_token');
  const response = await fetch(`${API_URL}/reports/${type}/csv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Report download failed (${response.status})`);
  }
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const filenameMatch = disposition.match(/filename=([^;]+)/i);
  const filename = filenameMatch?.[1]?.replace(/"/g, '') || `klh_${type}_report.csv`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
