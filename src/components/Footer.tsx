import React, { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles, Check, Instagram, MessageCircle } from 'lucide-react';
import SunLabLogo from './SunLabLogo';
import { CATEGORIES } from '@/data/products';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-zinc-100 border-t border-zinc-200 pt-16 pb-12 mt-auto">
      {/* Trust Badges - White and Gray */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-zinc-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Envio Seguro para o Brasil</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">Embalagem anti-impacto e rastreio total</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Precisão Micrométrica</h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">Camadas de 0.08 a 0.16mm sem rebarbas</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">Troca Descomplicada</h4>
              <p className="text-[11px] text-blue-600 mt-0.5">7 dias de garantia incondicional</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">100% Polímeros Bio</h4>
              <p className="text-[11px] text-blue-600 mt-0.5">Matéria-prima renovável de origem vegetal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block group">
              <SunLabLogo size="lg" variant="light" />
            </Link>
            <p className="text-xs text-blue-800/85 leading-relaxed max-w-sm">
              Não somos uma gráfica 3D comum. A SunLab é um estúdio de design e manufatura aditiva focado em objetos contemporâneos, utilitários ergonômicos e projetos autorais sob demanda.
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white border border-zinc-200 hover:border-blue-400 hover:text-blue-900 flex items-center justify-center text-blue-700 transition-colors shadow-xs"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white border border-zinc-200 hover:border-blue-400 hover:text-blue-900 flex items-center justify-center text-blue-700 transition-colors shadow-xs"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs text-blue-800">
              <li>
                <Link to="/" className="hover:text-blue-950 transition-colors">Início</Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-blue-950 transition-colors">Loja / Catálogo</Link>
              </li>
              <li>
                <Link to="/custom" className="hover:text-blue-950 transition-colors">Projetos Sob Medida</Link>
              </li>
              <li>
                <Link to="/aboutus" className="hover:text-blue-950 transition-colors">Sobre a SunLab</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-950 transition-colors">Contato & FAQ</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-blue-950 transition-colors font-medium">Meus Pedidos Comprados</Link>
              </li>
            </ul>
          </div>

          {/* Categories Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
              Coleções 3D
            </h4>
            <ul className="space-y-2 text-xs text-blue-800">
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <li key={cat.id}>
                  <Link to={`/catalog?cat=${cat.id}`} className="hover:text-blue-950 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
              Novidades & 10% OFF
            </h4>
            <p className="text-xs text-blue-800/85 leading-relaxed">
              Assine nosso boletim e receba o cupom <strong className="text-blue-950 font-mono">SUNLAB10</strong> no seu e-mail.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-500 shadow-xs"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribed && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-700 font-medium animate-in fade-in">
                  <Check className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Cadastrado! Use SUNLAB10</span>
                </div>
              )}
            </form>
          </div>

        </div>
      </div>

      {/* Bottom Bar & Payments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
        <div>
          © {new Date().getFullYear()} SunLab Studio 3D Ltda. CNPJ: 45.892.110/0001-92. Todos os direitos reservados.
        </div>

        {/* Payment badges */}
        <div className="flex items-center gap-2 text-zinc-600">
          <span className="text-[10px] uppercase font-semibold text-zinc-400">Pagamento:</span>
          <span className="px-2 py-0.5 rounded bg-white border border-zinc-300 text-[10px] font-mono text-zinc-800 font-bold shadow-xs">PIX 5% OFF</span>
          <span className="px-2 py-0.5 rounded bg-white border border-zinc-300 text-[10px] font-semibold text-zinc-700 shadow-xs">Cartão até 12x</span>
          <span className="px-2 py-0.5 rounded bg-white border border-zinc-300 text-[10px] font-semibold text-zinc-700 shadow-xs">Boleto</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
