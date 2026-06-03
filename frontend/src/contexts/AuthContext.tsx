import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api, clearStoredAuthSession, getStoredToken, getStoredUser, setAuthToken, storeAuthSession } from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'administrator' | 'waiter' | 'kitchen' | 'cashier' | 'delivery' | 'client';
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setToken(storedToken);
        setUser(parsedUser);
        setAuthToken(storedToken);
        storeAuthSession(storedToken, parsedUser);
      } catch {
        clearStoredAuthSession();
        setAuthToken(null);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, loggedUser: User) => {
    setToken(newToken);
    setUser(loggedUser);
    
    storeAuthSession(newToken, loggedUser);
    setAuthToken(newToken);
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/logout');
      }
    } finally {
      setToken(null);
      setUser(null);
      clearStoredAuthSession();
      setAuthToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
