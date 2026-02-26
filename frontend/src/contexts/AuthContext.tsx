import React, { createContext, useContext, ReactNode } from 'react';
import { Role } from '../backend';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role | string;
}

interface AuthContextType {
  currentUser: AuthUser;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const DEFAULT_ADMIN_USER: AuthUser = {
  id: '1',
  name: 'Admin',
  email: 'admin@hallmarkevents.com',
  role: Role.Admin,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always authenticated as admin — no login required
  const currentUser = DEFAULT_ADMIN_USER;
  const isAdmin = true;
  const isAuthenticated = true;

  // No-op stubs kept for interface compatibility
  const login = (_user: AuthUser) => {};
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
