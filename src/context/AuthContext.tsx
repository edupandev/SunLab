import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar?: string;
  provider?: string;
}

export type LoginWithProvider = 'google' | 'github' | 'apple' | 'twitter';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWith: (provider: LoginWithProvider, profile?: { name?: string; email?: string }) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'sunlab_auth_user';
const AUTH_TOKEN_KEY = 'sunlab_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user && token) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch (e) {
      console.error('Error persisting auth state:', e);
    }
  }, [user, token]);

  // Login com validação no backend
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, message: data.error || 'Credenciais inválidas. Verifique seus dados.' };
      }

      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch {
      return { success: false, message: 'Não foi possível conectar ao servidor de autenticação.' };
    }
  };

  // Criar nova conta no banco de dados SQLite
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, message: data.error || 'Erro ao registrar nova conta.' };
      }

      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch {
      return { success: false, message: 'Erro ao conectar ao servidor para criar a conta.' };
    }
  };

  // loginsrv OAuth integration (Google, GitHub, Apple, Twitter)
  const loginWith = async (provider: LoginWithProvider, profile?: { name?: string; email?: string }) => {
    try {
      const response = await fetch(`/api/auth/login-with/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile || {})
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.error || `Autenticação com ${provider.toUpperCase()} falhou.`
        };
      }

      setUser(data.user);
      setToken(data.token);
      return { success: true, user: data.user };
    } catch {
      return {
        success: false,
        message: `Não foi possível conectar ao provedor ${provider.toUpperCase()}.`
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, register, loginWith, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
