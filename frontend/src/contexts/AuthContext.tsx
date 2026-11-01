import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  isFounder: boolean;
  isPlanner: boolean;
  isFinance: boolean;
  isFieldCoordinator: boolean;
  isClient: boolean;
  isVendor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('royal_knot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('royal_knot_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data.user);
        localStorage.setItem('royal_knot_user', JSON.stringify(response.data.data.user));
      } catch (err) {
        console.error('Failed to verify token:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  const persistAuth = (newToken: string, userData: User) => {
    localStorage.setItem('royal_knot_token', newToken);
    localStorage.setItem('royal_knot_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data;
    persistAuth(newToken, userData);
    return userData;
  };

  const register = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<User> => {
    const res = await api.post('/auth/register', payload);
    const { token: newToken, user: userData } = res.data.data;
    persistAuth(newToken, userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('royal_knot_token');
    localStorage.removeItem('royal_knot_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    isFounder: user?.role === 'FOUNDER',
    isPlanner: user?.role === 'PLANNER',
    isFinance: user?.role === 'FINANCE',
    isFieldCoordinator: user?.role === 'FIELD_COORDINATOR',
    isClient: user?.role === 'CLIENT',
    isVendor: user?.role === 'VENDOR',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
