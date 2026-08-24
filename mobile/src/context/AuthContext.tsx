import React, { createContext, useState, useContext, useEffect } from 'react';

type Role = 'guest' | 'user' | 'admin';

interface AuthContextType {
  userRole: Role;
  isLoading: boolean;
  setRole: (role: Role) => void;
  // This will later be replaced by login(email, password)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<Role>('guest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state (e.g., checking async storage for tokens)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const setRole = (role: Role) => {
    setIsLoading(true);
    setUserRole(role);
    setTimeout(() => setIsLoading(false), 200); // Small delay to allow router to catch up
  };

  return (
    <AuthContext.Provider value={{ userRole, isLoading, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
