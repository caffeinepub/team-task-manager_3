import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '../backend';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type AuthContextType = {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function checkIsAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  // Check both the enum value and the string "Admin" to be safe with localStorage serialization
  return user.role === Role.Admin || (user.role as string) === 'Admin';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!currentUser;
  const isAdmin = checkIsAdmin(currentUser);

  const login = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
