import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, AuthUser, UpdateUserPayload } from '@/services/auth.service';

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ token: string; user: AuthUser }>;
  verifyCode: (email: string, code: string) => Promise<{ token: string; user: AuthUser }>;
  setSession: (token: string, user: AuthUser) => void;
  register: (email: string, pass: string) => Promise<any>;
  updateUser: (payload: UpdateUserPayload, photoUri?: string) => Promise<AuthUser>;
  /** Re-reads the profile from the server without disturbing the session. */
  refreshUser: () => Promise<void>;
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

  const setSession = useCallback((newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    const res = await authService.verifyCode(email, code);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const register = useCallback(async (email: string, pass: string) => {
    const res = await authService.register(email, pass);
    return res;
  }, []);

  const updateUser = useCallback(async (payload: UpdateUserPayload, photoUri?: string) => {
    const updated = await authService.updateUser(payload, undefined, photoUri);
    setUser(updated);
    return updated;
  }, []);

  /**
   * Pulls the latest profile from /auth/me.
   *
   * Unlike `checkAuth` this never signs the user out: a screen refreshing in the
   * background should not end the session just because the network blipped, so
   * a null result is left alone and the cached user stays on screen.
   */
  const refreshUser = useCallback(async () => {
    const current = await authService.getCurrentUser();
    if (current) {
      setUser(current);
    }
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
        verifyCode,
        setSession,
        register,
        updateUser,
        refreshUser,
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

