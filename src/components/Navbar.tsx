import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Search, ShoppingBag, Menu, X, ArrowUpRight, ChevronDown, User, ShieldCheck } from 'lucide-react';
import SunLabLogo from './SunLabLogo';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES } from '@/data/products';

export const Navbar: React.FC = () => {
  const { totalItems, openCart, openSearch } = useCart();
  const { user, isAdmin } = useAuth();
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
      {/* Top Notification Announcement Bar (Inspirado no visual do eComerce-3Dprints) */}
      <div className="bg-blue-600 text-white py-2 px-4 text-xs font-medium border-b border-blue-700 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-around gap-4 text-center overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span>📦</span>
            <span>Envios seguros para todo o Brasil</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span>🎯</span>
            <span>Impressão 3D de alta precisão (0.08mm)</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <span>✅</span>
            <span>Garantia de qualidade e acabamento</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 bg-blue-700 px-2.5 py-0.5 rounded-full text-[11px] shadow-xs">
            <span>🏷️</span>
            <span>Cupom: <strong className="font-mono text-white">SUNLAB10</strong> (10% OFF)</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-zinc-200 shadow-xs'
            : 'bg-white/85 backdrop-blur-md border-b border-zinc-200/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* SunLab Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group cursor-pointer transition-transform hover:scale-[1.02]"
          >
            <SunLabLogo size="md" variant="light" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-900 bg-blue-50 font-semibold border border-blue-200 shadow-xs'
                    : 'text-blue-700 hover:text-blue-950 hover:bg-blue-50/60'
                }`
              }
            >
              Início
            </NavLink>

            <NavLink
              to="/catalog"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-900 bg-blue-50 font-semibold border border-blue-200 shadow-xs'
                    : 'text-blue-700 hover:text-blue-950 hover:bg-blue-50/60'
                }`
              }
            >
              Loja
            </NavLink>

            {/* Categorias Popover Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-blue-700 hover:text-blue-950 hover:bg-blue-50/60 transition-colors cursor-pointer"
              >
                <span>Categorias</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryDropdownOpen ? 'rotate-180 text-blue-900' : 'text-blue-500'}`} />
              </button>

              {isCategoryDropdownOpen && (
                <div
                  onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                  className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-white border border-zinc-200 shadow-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="text-[10px] uppercase font-bold text-blue-600 px-3 py-1.5 tracking-wider">
                    Linhas de Fabricação 3D
                  </div>
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <Link
                      key={cat.id}
                      to={`/catalog?cat=${cat.id}`}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-blue-800 hover:text-blue-950 hover:bg-blue-50 transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-blue-400 font-normal">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink
              to="/custom"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-900 bg-blue-50 border border-blue-200 font-semibold shadow-xs'
                    : 'text-blue-700 hover:text-blue-950 hover:bg-blue-50/60'
                }`
              }
            >
              <span>Personalizados</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </NavLink>

            <NavLink
              to="/aboutus"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-900 bg-blue-50 font-semibold border border-blue-200 shadow-xs'
                    : 'text-blue-700 hover:text-blue-950 hover:bg-blue-50/60'
                }`
              }
            >
              Sobre a SunLab
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-900 bg-blue-50 font-semibold border border-blue-200 shadow-xs'
                    : 'text-blue-700 hover:text-blue-950 hover:bg-blue-50/60'
                }`
              }
            >
              Contato
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-900 bg-blue-50 font-semibold border border-blue-200 shadow-xs'
                    : 'text-blue-700 hover:text-blue-950 hover:bg-blue-50/60'
                }`
              }
            >
              Meus Pedidos
            </NavLink>
          </nav>

          {/* Right Action Icons (Search, Cart, Mobile Menu) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={openSearch}
              className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 text-blue-700 transition-colors cursor-pointer flex items-center gap-2"
              title="Buscar produtos"
            >
              <Search className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-blue-600 hidden lg:inline font-normal">Buscar no catálogo...</span>
            </button>

            {/* Login / Admin Action */}
            {isAdmin ? (
              <NavLink
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-blue-800 border border-zinc-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title="Painel Administrativo"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Painel Admin</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-700 text-white rounded font-mono font-bold">BD</span>
              </NavLink>
            ) : user ? (
              <NavLink
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-blue-700 border border-zinc-200 text-xs font-medium transition-colors"
              >
                <User className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-blue-800 border border-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Área Administrativa"
              >
                <User className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Login</span>
              </NavLink>
            )}

            {/* Cart Trigger - Clean Gray Button with Blue Text */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-blue-900 border border-zinc-300 transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              title="Abrir carrinho"
            >
              <ShoppingBag className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-semibold text-blue-900 hidden sm:inline">
                Carrinho
              </span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 transition-colors cursor-pointer"
              title="Menu de navegação"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-zinc-200 px-5 py-6 space-y-4 animate-in slide-in-from-top duration-200 shadow-md">
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
              <Link
                to={isAdmin ? "/admin" : "/login"}
                className="px-3 py-2.5 rounded-xl text-base font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200 flex items-center justify-between"
              >
                <span>{isAdmin ? "Painel Admin (SQLite)" : "Acesso / Login"}</span>
                <ShieldCheck className="w-4 h-4 text-zinc-600" />
              </Link>
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
