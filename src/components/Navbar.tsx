import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Search, ShoppingBag, Menu, X, ArrowUpRight, ChevronDown, User, ShieldCheck, LogOut } from 'lucide-react';
import SunLabLogo from './SunLabLogo';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES } from '@/data/products';

export const Navbar: React.FC = () => {
  const { totalItems, openCart, openSearch } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu mobile ao trocar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Main Header Bar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-zinc-200 shadow-xs'
            : 'bg-white/85 backdrop-blur-md border-b border-zinc-200/80'
        }`}
      >
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* SunLab Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group cursor-pointer transition-transform hover:scale-[1.02] shrink-0"
          >
            <SunLabLogo size="md" variant="light" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 2xl:gap-3 whitespace-nowrap shrink-0">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#0a2540] bg-amber-50 font-bold border border-amber-200/80 shadow-xs'
                    : 'text-slate-700 hover:text-[#0a2540] hover:bg-slate-100/70'
                }`
              }
            >
              Início
            </NavLink>

            <NavLink
              to="/catalog"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#0a2540] bg-amber-50 font-bold border border-amber-200/80 shadow-xs'
                    : 'text-slate-700 hover:text-[#0a2540] hover:bg-slate-100/70'
                }`
              }
            >
              Loja
            </NavLink>

            {/* Categorias Popover Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-[#0a2540] hover:bg-slate-100/70 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Categorias</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryDropdownOpen ? 'rotate-180 text-[#0a2540]' : 'text-slate-400'}`} />
              </button>

              {isCategoryDropdownOpen && (
                <div
                  onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                  className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-white border border-zinc-200 shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="text-[10px] uppercase font-bold text-amber-600 px-3 py-1.5 tracking-wider">
                    Coleções SunLab
                  </div>
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <Link
                      key={cat.id}
                      to={`/catalog?cat=${cat.id}`}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-800 hover:text-[#0a2540] hover:bg-amber-50/70 transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-amber-600 font-normal">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink
              to="/custom"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#0a2540] bg-amber-50 border border-amber-200/80 font-bold shadow-xs'
                    : 'text-slate-700 hover:text-[#0a2540] hover:bg-slate-100/70'
                }`
              }
            >
              <span>Personalizados</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </NavLink>

            <NavLink
              to="/aboutus"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#0a2540] bg-amber-50 font-bold border border-amber-200/80 shadow-xs'
                    : 'text-slate-700 hover:text-[#0a2540] hover:bg-slate-100/70'
                }`
              }
            >
              Sobre Nós
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#0a2540] bg-amber-50 font-bold border border-amber-200/80 shadow-xs'
                    : 'text-slate-700 hover:text-[#0a2540] hover:bg-slate-100/70'
                }`
              }
            >
              Contato
            </NavLink>

            {!user && (
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#0a2540] bg-amber-50 font-bold border border-amber-200/80 shadow-xs'
                      : 'text-slate-700 hover:text-[#0a2540] hover:bg-slate-100/70'
                  }`
                }
              >
                Meus Pedidos
              </NavLink>
            )}
          </nav>

          {/* Right Action Icons (Search, Cart, Mobile Menu) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
            {/* Search Trigger */}
            <button
              onClick={openSearch}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 text-blue-700 transition-colors cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap"
              title="Buscar produtos"
            >
              <Search className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs text-blue-600 hidden 2xl:inline font-normal whitespace-nowrap">Buscar...</span>
            </button>

            {/* Login / Admin Action & Sair */}
            {user ? (
              <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                {isAdmin ? (
                  <NavLink
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 whitespace-nowrap"
                    title="Painel Administrativo SunLab"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">Painel Admin</span>
                  </NavLink>
                ) : (
                  <NavLink
                    to="/orders"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 text-xs font-medium transition-colors shrink-0 whitespace-nowrap"
                    title="Minha Conta e Pedidos"
                  >
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="hidden sm:inline truncate max-w-[100px] whitespace-nowrap">{user.name.split(' ')[0]}</span>
                  </NavLink>
                )}

                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-zinc-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-zinc-600 border border-zinc-200 text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                  title="Sair da conta"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline whitespace-nowrap">Sair</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="Entrar na Conta"
              >
                <User className="w-4 h-4 text-zinc-600 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Entrar</span>
              </NavLink>
            )}

            {/* Cart Trigger - SunLab Ocean Navy & Solar Amber */}
            <button
              onClick={openCart}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-[#0a2540] border border-slate-200 hover:border-amber-300 transition-all cursor-pointer flex items-center gap-2 shadow-xs shrink-0 whitespace-nowrap"
              title="Abrir carrinho"
            >
              <ShoppingBag className="w-4 h-4 text-[#0a2540] shrink-0" />
              <span className="text-xs font-semibold text-[#0a2540] hidden sm:inline whitespace-nowrap">
                Carrinho
              </span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 sm:p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 transition-colors cursor-pointer shrink-0"
              title="Menu de navegação"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-zinc-200 px-5 py-6 space-y-4 animate-in slide-in-from-top duration-200 shadow-md">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-3 py-2.5 rounded-xl text-base font-semibold text-zinc-800 hover:bg-zinc-100 flex items-center justify-between"
              >
                <span>Início</span>
              </Link>
              <Link
                to="/catalog"
                className="px-3 py-2.5 rounded-xl text-base font-semibold text-zinc-800 hover:bg-zinc-100 flex items-center justify-between"
              >
                <span>Loja Completa</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </Link>
              <div className="pl-3 py-1 space-y-1 border-l-2 border-zinc-300 my-1">
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <Link
                    key={cat.id}
                    to={`/catalog?cat=${cat.id}`}
                    className="block py-1.5 px-3 text-sm text-zinc-600 hover:text-zinc-900"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              <Link
                to="/custom"
                className="px-3 py-2.5 rounded-xl text-base font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200 flex items-center justify-between"
              >
                <span>Projetos Personalizados</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">Sob Medida</span>
              </Link>
              <Link
                to="/aboutus"
                className="px-3 py-2.5 rounded-xl text-base font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
              >
                Sobre a SunLab
              </Link>
              <Link
                to="/contact"
                className="px-3 py-2.5 rounded-xl text-base font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
              >
                Contato
              </Link>
              <Link
                to="/orders"
                className="px-3 py-2.5 rounded-xl text-base font-semibold text-blue-900 bg-blue-50/70 border border-blue-200 flex items-center justify-between"
              >
                <span>Meus Pedidos Comprados</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">Status 3D</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-2.5 rounded-xl text-base font-bold text-blue-900 bg-blue-50 border border-blue-200 flex items-center justify-between"
                >
                  <span>Painel Administrativo</span>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </Link>
              )}
              {user ? (
                <div className="pt-2 border-t border-zinc-200 space-y-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                    <div className="truncate">
                      <span className="text-zinc-500 block text-[10px]">Conectado como:</span>
                      <strong className="text-zinc-900 truncate">{user.name}</strong>
                    </div>
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-2.5 rounded-xl text-base font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200 flex items-center justify-between"
                >
                  <span>Entrar / Cadastrar</span>
                  <User className="w-4 h-4 text-zinc-600" />
                </Link>
              )}
            </nav>

            <div className="pt-3 border-t border-zinc-200 flex gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openSearch();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-sm font-medium text-zinc-800"
              >
                <Search className="w-4 h-4 text-zinc-500" />
                <span>Buscar Produtos</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
