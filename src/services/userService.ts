import { User, UserRole, SystemSettings } from '../types';
import { apiRequest } from './api';
export const userService = {
  registerUser: (data: {name:string;email:string;password:string;studentId?:string;department?:string;year?:string;phone?:string}) => apiRequest<{token:string;user:User}>('/auth/register',{method:'POST',body:JSON.stringify(data)}),
  getUsers: (role?:UserRole) => apiRequest<User[]>(`/users${role?`?role=${role}`:''}`),
  getUserById: async (id:string) => { try{return await apiRequest<User>(`/users/${id}`);}catch{return undefined;} },
  createUser: (userData:Omit<User,'id'|'borrowedCount'|'finesOwed'> & {password?:string}) => apiRequest<User>('/users',{method:'POST',body:JSON.stringify(userData)}),
  updateUser: (id:string,updates:Partial<User>) => apiRequest<User>(`/users/${id}`,{method:'PATCH',body:JSON.stringify(updates)}),
  toggleUserStatus: (id:string) => apiRequest<User>(`/users/${id}/toggle-status`,{method:'POST'}),
  getSettings: () => apiRequest<SystemSettings>('/settings'),
  updateSettings: (settings:Partial<SystemSettings>) => apiRequest<SystemSettings>('/settings',{method:'PATCH',body:JSON.stringify(settings)}),
};
