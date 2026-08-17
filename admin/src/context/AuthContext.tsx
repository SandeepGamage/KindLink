import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { login as apiLogin, getMe } from '../api/auth';

/* ---- Types ---- */
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profileImage?: string;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

/* ---- Context ---- */
const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'kindlink_admin_token';

/* ---- Provider ---- */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
  });

  // On mount: try restoring session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    getMe(savedToken)
      .then((res) => {
        if (res.user.role !== 'admin') {
          localStorage.removeItem(TOKEN_KEY);
          setState({ user: null, token: null, isLoading: false, isAuthenticated: false, isAdmin: false });
        } else {
          setState({
            user: res.user,
            token: savedToken,
            isLoading: false,
            isAuthenticated: true,
            isAdmin: true,
          });
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false, isAdmin: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);

    if (res.user.role !== 'admin') {
      throw new Error(
        'Access denied. This portal is restricted to KindLink administrators.'
      );
    }

    localStorage.setItem(TOKEN_KEY, res.token);
    setState({
      user: res.user,
      token: res.token,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false, isAdmin: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ---- Hook ---- */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
