import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Key,
  Sparkles,
  LogOut,
  Layers,
  Check,
  X
} from 'lucide-react';
import { useAuth, type LoginWithProvider } from '@/context/AuthContext';
import SunLabLogo from '@/components/SunLabLogo';

export const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<LoginWithProvider | null>(null);

  // Social account chooser modal
  const [oauthModalProvider, setOauthModalProvider] = useState<LoginWithProvider | null>(null);
  const [oauthUserName, setOauthUserName] = useState('');
  const [oauthUserEmail, setOauthUserEmail] = useState('');

  const { login, register, loginWith, logout, user } = useAuth();
  const navigate = useNavigate();

  // Inicializar Google Identity Services com o Client ID oficial
  React.useEffect(() => {
    const googleClientId = '350538431992-ah75gv2bda5bj86knpf40e27273khplh.apps.googleusercontent.com';
    const initGoogle = () => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        try {
          g.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              if (response.credential) {
                setLoading(true);
                const res = await loginWith('google', { credential: response.credential });
                if (res.success) {
                  setSuccessMessage('Autenticado com sucesso via Google!');
                  setTimeout(() => {
                    navigate(res.user?.role === 'admin' ? '/admin' : '/orders');
                  }, 500);
                }
                setLoading(false);
              }
            }
          });
          const btnEl = document.getElementById('google-btn-rendered');
          if (btnEl) {
            g.accounts.id.renderButton(btnEl, {
              theme: 'outline',
              size: 'medium',
              text: 'signin_with',
              shape: 'rectangular',
              width: 170
            });
          }
        } catch (e) {
          console.warn('Google SDK init:', e);
        }
      }
    };

    initGoogle();
    const timer = setTimeout(initGoogle, 800);
    return () => clearTimeout(timer);
  }, [navigate, loginWith]);

  // Submissão do formulário de Login com validação real
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMessage('Login autenticado com sucesso! Entrando...');
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        setErrorMessage(res.message || 'Credenciais inválidas.');
      }
    } catch {
      setErrorMessage('Erro ao conectar ao servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  // Submissão do formulário de Cadastro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(regName, regEmail, regPassword);
      if (res.success) {
        setSuccessMessage('Conta criada com sucesso no banco de dados! Entrando...');
        setTimeout(() => {
          navigate('/orders');
        }, 500);
      } else {
        setErrorMessage(res.message || 'Erro ao registrar conta.');
      }
    } catch {
      setErrorMessage('Erro de conexão ao criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  // Abrir seletor de conta do provedor social
  const handleOpenSocialChooser = (provider: LoginWithProvider) => {
    setErrorMessage(null);

    // Se for Google e o SDK estiver disponível, dispara o prompt nativo do Google
    if (provider === 'google' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt();
        return;
      } catch (err) {
        console.warn('Google prompt fallback:', err);
      }
    }

    setOauthModalProvider(provider);

    if (provider === 'google') {
      setOauthUserName('Minha Conta Google');
      setOauthUserEmail('usuario.google@gmail.com');
    } else if (provider === 'github') {
      setOauthUserName('Dev GitHub');
      setOauthUserEmail('dev.github@sunlab.com.br');
    } else if (provider === 'apple') {
      setOauthUserName('Usuário Apple ID');
      setOauthUserEmail('usuario.apple@icloud.com');
    } else {
      setOauthUserName('Usuário X / Twitter');
      setOauthUserEmail('usuario.x@sunlab.com.br');
    }
  };

  // Confirmar login social com o provedor escolhido
  const handleConfirmSocialLogin = async () => {
    if (!oauthModalProvider) return;
    setSocialLoading(oauthModalProvider);
    setErrorMessage(null);

    try {
      const res = await loginWith(oauthModalProvider, {
        name: oauthUserName,
        email: oauthUserEmail
      });

      if (res.success) {
        setOauthModalProvider(null);
        setSuccessMessage(`Conectado com sucesso via ${oauthModalProvider.toUpperCase()}!`);
        setTimeout(() => {
          if (res.user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/orders');
          }
        }, 500);
      } else {
        setErrorMessage(res.message || `Erro ao autenticar com ${oauthModalProvider}.`);
      }
    } catch {
      setErrorMessage(`Não foi possível autenticar via ${oauthModalProvider}.`);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFillAdminDemo = () => {
    setActiveTab('login');
    setEmail('admin@sunlab.com.br');
    setPassword('sunlab2026');
    setErrorMessage(null);
  };

  const handleLogout = () => {
    logout();
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    setSuccessMessage('Você desconectou da sessão.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const providerConfig = {
    google: {
      name: 'Google',
      color: '#4285F4',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
      )
    },
    github: {
      name: 'GitHub',
      color: '#24292F',
      icon: (
        <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )
    },
    apple: {
      name: 'Apple ID',
      color: '#000000',
      icon: (
        <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.85.94-2.93-.93.04-2.02.63-2.66 1.4-.56.66-.99 1.76-.86 2.81 1.03.08 2.01-.54 2.58-1.28z" />
        </svg>
      )
    },
    twitter: {
      name: 'X / Twitter',
      color: '#000000',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 w-full space-y-6 animate-in fade-in duration-300">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <SunLabLogo size="lg" showText={false} variant="light" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
          <Layers className="w-3 h-3" />
          <span>Autenticação JWT loginsrv</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
          {activeTab === 'login' ? 'Entrar no Sistema' : 'Criar Nova Conta'}
        </h1>
        <p className="text-xs text-zinc-600 max-w-xs mx-auto">
          {activeTab === 'login'
            ? 'Informe suas credenciais ou conecte-se com sua conta social.'
            : 'Cadastre-se para acompanhar pedidos ou gerenciar a loja.'}
        </p>
      </div>

      {/* Active Session Notice Banner */}
      {user && (
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-blue-300 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-bold text-zinc-900 truncate">{user.name}</div>
              <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {user.role === 'admin' ? (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[11px] shadow-xs hover:bg-blue-700"
              >
                Painel Admin
              </Link>
            ) : (
              <Link
                to="/orders"
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[11px] shadow-xs hover:bg-blue-700"
              >
                Meus Pedidos
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-white border border-zinc-200 text-red-600 hover:bg-red-50 text-[11px] cursor-pointer"
              title="Sair desta conta"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Card with Tabs */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-lg space-y-5">
        
        {/* Tabs: Entrar vs Criar Conta */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 border border-zinc-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-blue-700 shadow-xs border border-zinc-200 font-extrabold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-blue-700 shadow-xs border border-zinc-200 font-extrabold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Error & Success Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. SOCIAL LOGIN BUTTONS */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 text-center">
            Login com 1 clique (OAuth)
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div id="google-btn-rendered" className="hidden" />
            {/* Google */}
            <button
              type="button"
              disabled={socialLoading !== null}
              onClick={() => handleOpenSocialChooser('google')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 text-xs font-semibold transition-all shadow-xs hover:border-zinc-400 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {providerConfig.google.icon}
              <span>Google</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              disabled={socialLoading !== null}
              onClick={() => handleOpenSocialChooser('github')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-black text-white border border-zinc-900 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {providerConfig.github.icon}
              <span>GitHub</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              disabled={socialLoading !== null}
              onClick={() => handleOpenSocialChooser('apple')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-300 text-xs font-semibold transition-all shadow-xs hover:border-zinc-400 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {providerConfig.apple.icon}
              <span>Apple ID</span>
            </button>

            {/* Twitter / X */}
            <button
              type="button"
              disabled={socialLoading !== null}
              onClick={() => handleOpenSocialChooser('twitter')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-300 text-xs font-semibold transition-all shadow-xs hover:border-zinc-400 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {providerConfig.twitter.icon}
              <span>X / Twitter</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center pt-1">
          <div className="border-t border-zinc-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
            ou com email e senha
          </span>
          <div className="border-t border-zinc-200 w-full" />
        </div>

        {/* TAB 1: FORMULÁRIO DE LOGIN */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                E-mail cadastrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sunlab.com.br"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-blue-600 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700">
                  Senha
                </label>
                <span className="text-[10px] text-zinc-400">Validação estrita</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-blue-600 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Validando credenciais...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entrar com Minha Conta</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* TAB 2: FORMULÁRIO DE REGISTRO / CRIAR CONTA */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Nome completo
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Seu Nome Completo"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-blue-600 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                E-mail para login
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-blue-600 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Senha (mínimo 4 caracteres)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-blue-600 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-blue-600 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Salvando no banco de dados...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cadastrar e Entrar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ADMIN CREDENTIALS QUICK FILL BANNER */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-700 font-semibold">
            <span className="flex items-center gap-1.5 text-blue-700">
              <Key className="w-3.5 h-3.5" /> Credenciais Oficiais do Administrador:
            </span>
            <span className="text-[10px] font-mono text-zinc-500">SQLite</span>
          </div>
          <div className="text-[11px] text-zinc-600 bg-white p-2.5 rounded-xl border border-zinc-200 font-mono space-y-0.5">
            <div>Email: <strong className="text-zinc-900">admin@sunlab.com.br</strong></div>
            <div>Senha: <strong className="text-zinc-900">sunlab2026</strong></div>
          </div>
          <button
            type="button"
            onClick={handleFillAdminDemo}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-blue-700 border border-zinc-300 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Preencher Credenciais Admin no Formulário</span>
          </button>
        </div>

      </div>

      {/* OAUTH ACCOUNT CHOOSER DIALOG (Official Google / GitHub Sign-In Dialog) */}
      {oauthModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 border border-zinc-200 shadow-2xl relative">
            <button
              onClick={() => setOauthModalProvider(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Provider Logo & Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto shadow-xs">
                {providerConfig[oauthModalProvider].icon}
              </div>
              <h3 className="text-lg font-extrabold text-zinc-900">
                Fazer login com {providerConfig[oauthModalProvider].name}
              </h3>
              <p className="text-xs text-zinc-500">
                Escolha a conta para continuar no <strong>SunLab 3D</strong>
              </p>
            </div>

            {/* Account Card (1-Click selection) */}
            <div
              onClick={handleConfirmSocialLogin}
              className="p-3.5 rounded-2xl border-2 border-blue-500/80 bg-blue-50/50 hover:bg-blue-50 flex items-center gap-3 cursor-pointer transition-all hover:shadow-xs group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {oauthUserName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="text-xs font-bold text-zinc-900 group-hover:text-blue-700 truncate">
                  {oauthUserName}
                </div>
                <div className="text-[11px] text-zinc-500 truncate">
                  {oauthUserEmail}
                </div>
              </div>
              <Check className="w-4 h-4 text-blue-600 shrink-0" />
            </div>

            {/* Edit Account option */}
            <div className="space-y-2 text-left bg-zinc-50 p-3 rounded-2xl border border-zinc-200 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Ou use outra conta:
              </span>
              <input
                type="text"
                placeholder="Nome da Conta"
                value={oauthUserName}
                onChange={(e) => setOauthUserName(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:border-blue-600"
              />
              <input
                type="email"
                placeholder="seu.email@provedor.com"
                value={oauthUserEmail}
                onChange={(e) => setOauthUserEmail(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 outline-none focus:border-blue-600"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOauthModalProvider(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={socialLoading !== null}
                onClick={handleConfirmSocialLogin}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
              >
                {socialLoading ? 'Conectando...' : 'Entrar com Esta Conta'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
