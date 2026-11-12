import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Mail,
  Check,
  ShieldCheck,
  Box,
  ShoppingBag
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { ProductCard } from '@/components/ProductCard';

// Featured Showcase Collection
const SHOWCASE_ITEMS = [
  {
    id: 'vela-renas',
    name: 'Conjunto Vela & Renas',
    image: '/products/natal/01_vela_renas/01_hero_estudio.jpg'
  },
  {
    id: 'presepio',
    name: 'Presépio Sagrada Família',
    image: '/products/natal/02_presepio_familia/01_hero_estudio.jpg'
  },
  {
    id: 'pinheiro',
    name: 'Pinheiro Feliz Natal',
    image: '/products/natal/03_pinheiro_natal/01_hero_estudio.jpg'
  },
  {
    id: 'flocos',
    name: 'Kit Flocos de Neve',
    image: '/products/natal/04_flocos_neve/01_flatlay_conjunto.jpg'
  },
  {
    id: 'bicolor',
    name: 'Tags Bicolores Natal',
    image: '/products/natal/05_enfeites_bicolores/01_flatlay_catalogo.jpg'
  }
];

export const Home: React.FC = () => {
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'newArrivals'>('featured');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Featured Showcase State
  const [selectedShowcase] = useState(SHOWCASE_ITEMS[0]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterSubscribed(false);
        setNewsletterEmail('');
      }, 4000);
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeTab === 'bestsellers') return p.bestseller;
    if (activeTab === 'newArrivals') return p.newArrival;
    return p.featured;
  }).slice(0, 8);

  return (
    <div className="w-full flex flex-col space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      
      {/* 🚀 TICKER ANIMADO DINÂMICO (Marquee Infinito com estilo 3D Studio) */}
      <div className="w-full bg-[#0A2540] text-white py-2.5 overflow-hidden border-b border-slate-800 text-[11px] font-medium tracking-wide shadow-xs select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Acabamento <strong>Impecável e Suave</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-sky-400" /> Material de Alta Qualidade
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1.5">
            💬 Atendimento e Pedidos Direto no <strong>WhatsApp</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1.5">
            ⭐ <strong>4.9/5</strong> Avaliação de Excelência e Satisfação
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Pagamento Seguro via <strong>PIX</strong>
          </span>
          <span className="text-slate-500">•</span>
          {/* Loop repeat for seamless marquee */}
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Acabamento <strong>Impecável e Suave</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-sky-400" /> Material de Alta Qualidade
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1.5">
            💬 Atendimento e Pedidos Direto no <strong>WhatsApp</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1.5">
            ⭐ <strong>4.9/5</strong> Avaliação de Excelência e Satisfação
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Pagamento Seguro via <strong>PIX</strong>
          </span>
        </div>
      </div>

      {/* 1. HERO SECTION CRIATIVO & ANIMADO */}
      <section className="relative w-full pt-6 pb-16 overflow-hidden bg-gradient-to-b from-amber-50/30 via-white to-slate-50/50 border-b border-zinc-200">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-grid-tech opacity-60 pointer-events-none" />

        {/* Ambient Subtle Glow Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] sm:leading-[1.1] font-display">
                Se dá pra imaginar, <br />
                <span className="bg-gradient-to-r from-[#0A2540] via-[#0284C7] to-[#F59E0B] bg-clip-text text-transparent">
                  a gente imprime.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-lg text-zinc-600 max-w-xl font-normal leading-relaxed">
                De chaveiros e colecionáveis a peças personalizadas pra sua marca ou pro seu setup. Sem complicação, com acabamento impecável e direto na sua porta.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1">
                <a
                  href="#produtos"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0A2540] hover:bg-[#0F3A66] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Quick Quality Highlights */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-4 sm:pt-6 border-t border-zinc-200 max-w-lg">
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-100 shadow-2xs text-center sm:text-left">
                  <div className="text-base sm:text-lg font-bold text-zinc-900 font-display">Design</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 leading-tight">Autoral & exclusivo</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-100 shadow-2xs text-center sm:text-left">
                  <div className="text-base sm:text-lg font-bold text-zinc-900 font-display">100%</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 leading-tight">Material de qualidade</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-100 shadow-2xs text-center sm:text-left">
                  <div className="text-base sm:text-lg font-bold text-zinc-900 font-display">48h</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 leading-tight">Média de fabricação</div>
                </div>
              </div>
            </motion.div>

            {/* Right Product Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              {/* Outer Decorative Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-amber-400/10 rounded-3xl blur-2xl transform rotate-1 scale-105" />

              <div className="relative rounded-3xl bg-white border border-zinc-200 shadow-xl p-3 sm:p-4 overflow-hidden">
                {/* Main Viewport Area */}
                <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 group">
                  <img
                    src={selectedShowcase.image}
                    alt={selectedShowcase.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  {/* Floating Badge */}
                  <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
                    <span className="backdrop-blur-md bg-white/95 border border-zinc-200 px-3 py-1 rounded-full text-[11px] font-bold text-zinc-800 shadow-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Coleção Exclusiva
                    </span>
                  </div>

                  {/* Subtle Bottom Title */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent text-white">
                    <span className="text-xs font-semibold tracking-wide block text-white/95">
                      {selectedShowcase.name}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. PRODUTOS EM DESTAQUE COM FILTROS INTERATIVOS (Aparece logo após o Hero/Texto) */}
      <section id="produtos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Catálogo Selecionado
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
              Peças Prontas para Fabricação
            </h2>
          </div>

          {/* Filter Tabs in White and Gray with Blue Text */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-100 border border-zinc-200 overflow-x-auto whitespace-nowrap scrollbar-none max-w-full shadow-2xs">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                activeTab === 'featured'
                  ? 'bg-white text-blue-700 shadow-xs border border-zinc-200 font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              ⭐ Destaques
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                activeTab === 'bestsellers'
                  ? 'bg-white text-blue-700 shadow-xs border border-zinc-200 font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              🔥 Mais Vendidos
            </button>
            <button
              onClick={() => setActiveTab('newArrivals')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                activeTab === 'newArrivals'
                  ? 'bg-white text-blue-700 shadow-xs border border-zinc-200 font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              ✨ Lançamentos
            </button>
          </div>
        </div>

        {/* Products Grid with Animated Cards (2-cols on mobile) */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 px-6 text-center rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-2xl text-blue-600 shadow-2xs">
              📦
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Catálogo Vazio</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto leading-relaxed">
                Nenhum produto cadastrado no momento. Você pode cadastrar novas peças com fotos e detalhes através do painel de administração ou solicitar um orçamento sob medida.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/admin"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                + Cadastrar Novo Produto
              </Link>
              <Link
                to="/custom"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 font-bold text-xs transition-colors"
              >
                Orçar Peça Personalizada
              </Link>
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div className="text-center pt-10">
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-300 hover:border-blue-500 text-blue-800 font-bold text-sm transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
            >
              <span>Ver Todos os {products.length} Produtos do Catálogo</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>
          </div>
        )}
      </section>

      {/* 4. BENEFÍCIOS & GARANTIAS DO ATELIER (Hover Strip) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -4 }}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
              📏
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">Acabamento Suave</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Superfície lisa, suave e sem rebarbas</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
              🌿
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">Materiais Premium</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Matérias-primas de alta qualidade e durabilidade</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all group cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
              ⚙️
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 group-hover:text-purple-700 transition-colors">Encaixe & Ergonomia</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Ajuste perfeito para sua mesa e setup</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
              🛡️
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 group-hover:text-amber-700 transition-colors">Garantia & Mercado Pago</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">100% inspecionado e compra protegida</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. NEWSLETTER INTERATIVA COM CUPOM */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-display">
              Receba Lançamentos & Modelos Exclusivos
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mt-1.5 leading-relaxed">
              Junte-se à nossa comunidade para receber cupons de desconto, novos lançamentos e novidades do atelier.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
            <input
              required
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs text-zinc-900 outline-none focus:bg-white focus:border-blue-600 shadow-xs"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Inscrever-se
            </button>
          </form>

          {newsletterSubscribed && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Inscrição confirmada! Use o cupom <strong>SUNLAB10</strong> para 10% OFF no Checkout Mercado Pago.</span>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;
