import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiRequest } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (identifier: string, role?: UserRole, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('lms_access_token');
    if (!token) return;
    apiRequest<User>('/auth/me').then((u)=>{setCurrentUser(u);setIsAuthenticated(true);}).catch(()=>localStorage.removeItem('lms_access_token'));
  }, []);

  const login = async (identifier: string, _role?: UserRole, password = 'password') => {
    const result = await apiRequest<{token:string;user:User}>('/auth/login',{method:'POST',body:JSON.stringify({identifier,password})});
    localStorage.setItem('lms_access_token',result.token); localStorage.removeItem('lms_pending_password');
    setCurrentUser(result.user); setIsAuthenticated(true); return true;
  };

  const switchRole = async (newRole: UserRole) => {
    const demoEmails: Record<UserRole,string> = {student:'student@klh.edu.in',librarian:'librarian@klh.edu.in',admin:'admin@klh.edu.in'};
    await login(demoEmails[newRole]);
  };

  const logout = () => { localStorage.removeItem('lms_access_token'); setCurrentUser(null); setIsAuthenticated(false); };
  const updateCurrentUser = async (updates: Partial<User>) => { if (!currentUser) return; const u=await apiRequest<User>(`/users/${currentUser.id}`,{method:'PATCH',body:JSON.stringify(updates)}); setCurrentUser(u); };

  return <AuthContext.Provider value={{user:currentUser,role:currentUser?.role||'student',isAuthenticated,login,logout,switchRole,updateCurrentUser}}>{children}</AuthContext.Provider>;
};
export const useAuth=():AuthContextType=>{const context=useContext(AuthContext);if(!context)throw new Error('useAuth must be used within an AuthProvider');return context;};
