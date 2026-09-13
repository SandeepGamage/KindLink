import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { login as apiLogin, getMe, type AdminUser } from '../api/auth';
import { TOKEN_KEY, UNAUTHORIZED_EVENT } from '../api/client';

export type { AdminUser };

/* ---- Types ---- */
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
  /** Re-fetches the signed-in user, e.g. after a profile edit. */
  refreshUser: () => Promise<void>;
  /** Replaces the cached user without a round trip. */
  setUser: (user: AdminUser) => void;
}

const SIGNED_OUT: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
};

/* ---- Context ---- */
const AuthContext = createContext<AuthContextValue | null>(null);

/* ---- Provider ---- */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ ...SIGNED_OUT, isLoading: true });

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState(SIGNED_OUT);
  }, []);

  // On mount: try restoring session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
      setState(SIGNED_OUT);
      return;
    }

    getMe()
      .then((user) => {
        if (user.role !== 'admin') {
          logout();
          return;
        }
        setState({
          user,
          token: savedToken,
          isLoading: false,
          isAuthenticated: true,
          isAdmin: true,
        });
      })
      .catch(logout);
  }, [logout]);

  // Any 401 from the API means the token is no longer good.
  useEffect(() => {
    const onUnauthorized = () => {
      if (localStorage.getItem(TOKEN_KEY)) logout();
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

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

  const setUser = useCallback((user: AdminUser) => {
    setState((s) => ({ ...s, user }));
  }, []);

  const refreshUser = useCallback(async () => {
    const user = await getMe();
    setUser(user);
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser, setUser }}>
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
