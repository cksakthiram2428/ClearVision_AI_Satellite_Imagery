import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  isChecking: boolean;
  accessToken: string | null;
  login: (token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

let inMemoryToken: string | null = null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(() => inMemoryToken);

  useEffect(() => {
    const savedAuth = window.localStorage.getItem('clearvision-auth');
    const savedToken = window.localStorage.getItem('clearvision-access-token');

    if (savedAuth === 'true' && savedToken) {
      inMemoryToken = savedToken;
      setAccessToken(savedToken);
      setIsAuthenticated(true);
    }

    const timer = window.setTimeout(() => setIsChecking(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const login = useCallback((token = 'clearvision-demo-token') => {
    inMemoryToken = token;
    setAccessToken(token);
    setIsAuthenticated(true);
    window.localStorage.setItem('clearvision-auth', 'true');
    window.localStorage.setItem('clearvision-access-token', token);
    // Refresh token should be issued by the backend as an HttpOnly cookie.
  }, []);

  const logout = useCallback(() => {
    inMemoryToken = null;
    setAccessToken(null);
    setIsAuthenticated(false);
    window.localStorage.removeItem('clearvision-auth');
    window.localStorage.removeItem('clearvision-access-token');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated, isChecking, accessToken, login, logout }),
    [accessToken, isAuthenticated, isChecking, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
