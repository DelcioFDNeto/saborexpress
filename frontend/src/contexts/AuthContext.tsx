import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { setAuthToken } from '../lib/api';

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
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@SaborExpress:token');
    const storedUser = localStorage.getItem('@SaborExpress:user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      setAuthToken(storedToken);
    }
    
    setIsLoading(false);
  }, []);

  const login = (newToken: string, loggedUser: User) => {
    setToken(newToken);
    setUser(loggedUser);
    
    localStorage.setItem('@SaborExpress:token', newToken);
    localStorage.setItem('@SaborExpress:user', JSON.stringify(loggedUser));
    
    setAuthToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('@SaborExpress:token');
    localStorage.removeItem('@SaborExpress:user');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
