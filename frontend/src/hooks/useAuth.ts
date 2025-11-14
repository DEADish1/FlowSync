'use client';

import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useAuth() {
  const { user, token, isAuthenticated, setUser, setToken, logout: storeLogout } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;

      setUser(user);
      setToken(token);

      router.push('/dashboard');
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(email, password, name);
      const { user, token } = response.data;

      setUser(user);
      setToken(token);

      router.push('/dashboard');
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore errors on logout
    } finally {
      storeLogout();
      router.push('/login');
    }
  };

  const checkAuth = async () => {
    if (!token) return false;

    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
      return true;
    } catch (err) {
      storeLogout();
      return false;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
  };
}
