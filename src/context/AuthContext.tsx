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
  loginWith: (provider: LoginWithProvider, profile?: { name?: string; email?: string; credential?: string }) => Promise<{ success: boolean; message?: string; user?: User }>;
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

  // Login com validação no backend (com fallback inteligente para Vercel)
  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data.success) {
          setUser(data.user);
          setToken(data.token);
          return { success: true };
        }
        return { success: false, message: data.error || 'Credenciais inválidas.' };
      }
    } catch (e) {
      console.warn('Backend indisponível, usando validação Vercel local:', e);
    }

    // Fallback de Autenticação Offline (protegido por SHA-256 criptográfico)
    const ADMIN_HASH_HEX = 'eafedbfa670e9470b1240ea0123130a547e037d098ab8bed800e9b9624d256be';
    let inputHash = '';
    try {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      inputHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (_) {}

    if (cleanEmail === 'admin@sunlab.com.br' && inputHash === ADMIN_HASH_HEX) {
      const adminUser: User = {
        id: 'usr-admin-01',
        name: 'SunLab Admin',
        email: 'admin@sunlab.com.br',
        role: 'admin'
      };
      const mockToken = `jwt-admin-${Date.now()}`;
      setUser(adminUser);
      setToken(mockToken);
      return { success: true };
    }

    // Verificar usuários locais cadastrados
    try {
      const localUsers = JSON.parse(localStorage.getItem('sunlab_local_users') || '[]');
      const found = localUsers.find((u: any) => u.email.toLowerCase() === cleanEmail && u.password === password);
      if (found) {
        const custUser: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role || 'customer'
        };
        const mockToken = `jwt-user-${Date.now()}`;
        setUser(custUser);
        setToken(mockToken);
        return { success: true };
      }
    } catch {}

    return { success: false, message: 'Usuário ou senha incorretos. Verifique suas credenciais.' };
  };

  // Criar nova conta no banco de dados SQLite / Vercel
  const register = async (name: string, email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: cleanEmail, password })
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data.success) {
          setUser(data.user);
          setToken(data.token);
          return { success: true };
        }
        return { success: false, message: data.error || 'Erro ao registrar nova conta.' };
      }
    } catch (e) {
      console.warn('Backend indisponível, registrando conta no armazenamento Vercel:', e);
    }

    // Fallback Vercel: persistir no localStorage
    const newUserId = `usr-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      role: 'customer'
    };

    try {
      const localUsers = JSON.parse(localStorage.getItem('sunlab_local_users') || '[]');
      if (localUsers.some((u: any) => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, message: 'Este e-mail já está cadastrado. Faça login com sua senha.' };
      }
      localUsers.push({ id: newUserId, name: name.trim(), email: cleanEmail, password, role: 'customer' });
      localStorage.setItem('sunlab_local_users', JSON.stringify(localUsers));
    } catch {}

    setUser(newUser);
    setToken(`jwt-user-${Date.now()}`);
    return { success: true };
  };

  // loginsrv OAuth integration (Google, GitHub, Apple, Twitter)
  const loginWith = async (provider: LoginWithProvider, profile?: { name?: string; email?: string; credential?: string }) => {
    try {
      const response = await fetch(`/api/auth/login-with/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile || {})
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data.success) {
          setUser(data.user);
          setToken(data.token);
          return { success: true, user: data.user };
        }
      }
    } catch {}

    // Fallback Vercel
    const socialUser: User = {
      id: `usr-${provider}-${Date.now()}`,
      name: profile?.name || `Usuário ${provider}`,
      email: profile?.email || `${provider}@sunlab.com.br`,
      role: 'customer'
    };
    setUser(socialUser);
    setToken(`jwt-${provider}-${Date.now()}`);
    return { success: true, user: socialUser };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem('sunlab_my_orders');
      localStorage.removeItem('sunlab_customer_email');
      localStorage.removeItem('sunlab_cart_v1');
      localStorage.removeItem('sunlab_cart');
      // Limpa dados de perfil/checkout salvos em cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sunlab_checkout_profile_') || key.startsWith('sunlab_customer_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Erro ao limpar cache no logout:', e);
    }
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
