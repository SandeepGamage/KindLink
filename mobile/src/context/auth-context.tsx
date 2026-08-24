import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, AuthUser } from '@/services/auth.service';

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ token: string; user: AuthUser }>;
  register: (email: string, pass: string) => Promise<{ token: string; user: AuthUser }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = useCallback(async () => {
    try {
      const storedToken = await authService.getStoredToken();
      if (storedToken) {
        setToken(storedToken);
        const currentUser = await authService.getCurrentUser(storedToken);
        if (currentUser) {
          setUser(currentUser);
        } else {
          await authService.logout();
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const register = useCallback(async (email: string, pass: string) => {
    const res = await authService.register(email, pass);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        checkAuth,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export const useAuth = useAuthContext;

