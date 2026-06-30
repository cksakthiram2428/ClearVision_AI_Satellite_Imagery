import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  isChecking: boolean;
  accessToken: string | null;
  userEmail: string | null;
  userName: string | null;
  login: (token?: string, email?: string) => void;
  logout: () => void;
  updateProfile: (name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

let inMemoryToken: string | null = null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(() => inMemoryToken);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const savedAuth = window.localStorage.getItem('clearvision-auth');
    const savedToken = window.localStorage.getItem('clearvision-access-token');
    const savedEmail = window.localStorage.getItem('clearvision-user-email');
    const savedName = window.localStorage.getItem('clearvision-user-name');

    if (savedAuth === 'true' && savedToken) {
      inMemoryToken = savedToken;
      setAccessToken(savedToken);
      setIsAuthenticated(true);
      if (savedEmail) setUserEmail(savedEmail);
      if (savedName) setUserName(savedName);
    }

    const timer = window.setTimeout(() => setIsChecking(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const login = useCallback((token = 'clearvision-demo-token', email?: string) => {
    inMemoryToken = token;
    setAccessToken(token);
    setIsAuthenticated(true);
    const resolvedEmail = email ?? 'admin@clearvision.ai';
    const [localPart, domainPart] = resolvedEmail.split('@');
    const domainName = (domainPart ?? '').split('.')[0];
    const resolvedName = `${localPart} ${domainName}`
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
    setUserEmail(resolvedEmail);
    setUserName(resolvedName);
    window.localStorage.setItem('clearvision-auth', 'true');
    window.localStorage.setItem('clearvision-access-token', token);
    window.localStorage.setItem('clearvision-user-email', resolvedEmail);
    window.localStorage.setItem('clearvision-user-name', resolvedName);
  }, []);

  const logout = useCallback(() => {
    inMemoryToken = null;
    setAccessToken(null);
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserName(null);
    window.localStorage.removeItem('clearvision-auth');
    window.localStorage.removeItem('clearvision-access-token');
    window.localStorage.removeItem('clearvision-user-email');
    window.localStorage.removeItem('clearvision-user-name');
  }, []);

  const updateProfile = useCallback((name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    window.localStorage.setItem('clearvision-user-name', name);
    window.localStorage.setItem('clearvision-user-email', email);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated, isChecking, accessToken, userEmail, userName, login, logout, updateProfile }),
    [accessToken, isAuthenticated, isChecking, userEmail, userName, login, logout, updateProfile],
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
