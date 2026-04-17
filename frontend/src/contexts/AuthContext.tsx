'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, type User } from '@/stores/authStore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading, login: storeLogin, register: storeRegister, logout: storeLogout } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    await storeLogin(email, password);
    router.push('/');
  }, [storeLogin, router]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    await storeRegister(email, password, name);
    router.push('/');
  }, [storeRegister, router]);

  const logout = useCallback(() => {
    storeLogout();
    router.push('/login');
  }, [storeLogout, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
