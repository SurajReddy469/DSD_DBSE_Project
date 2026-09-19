const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiRequest = async <T = any>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('lms_access_token');
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data as T;
};

export const getStored = <T>(_key: string, fallback: T): T => fallback;
export const setStored = <T>(_key: string, _data: T): void => undefined;
export const initializeStorage = (): void => undefined;
export const notifyStateChange = (): void => { window.dispatchEvent(new Event('lms_data_change')); };
export const simulateDelay = async (_ms = 0): Promise<void> => undefined;
export const STORAGE_KEYS = {} as const;
export const API_URL = API_BASE_URL;
