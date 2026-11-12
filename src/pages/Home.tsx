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

        {/* Ambient Subtle Glow Orbs with Float Animation */}
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/2 -right-24 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" 
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column with Staggered Entrance */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12, delayChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Main Headline */}
              <motion.h1 
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] sm:leading-[1.1] font-display"
              >
                Se dá pra imaginar, <br />
                <span className="bg-gradient-to-r from-[#0A2540] via-[#0284C7] to-[#F59E0B] bg-clip-text text-transparent">
                  a gente imprime.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5 }}
                className="text-sm sm:text-lg text-zinc-600 max-w-xl font-normal leading-relaxed"
              >
                De chaveiros e colecionáveis a peças personalizadas pra sua marca ou pro seu setup. Sem complicação, com acabamento impecável e direto na sua porta.
              </motion.p>

              {/* Call to Actions */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1"
              >
                <motion.a
                  href="#produtos"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0A2540] hover:bg-[#0F3A66] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer group"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1.5 transition-transform" />
                </motion.a>
              </motion.div>

              {/* Quick Quality Highlights with Hover Spring */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
                className="grid grid-cols-3 gap-2 sm:gap-6 pt-4 sm:pt-6 border-t border-zinc-200 max-w-lg"
              >
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }} 
                  className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-100 shadow-2xs hover:shadow-md text-center sm:text-left transition-shadow cursor-default"
                >
                  <div className="text-base sm:text-lg font-bold text-zinc-900 font-display">Design</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 leading-tight">Autoral & exclusivo</div>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }} 
                  className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-100 shadow-2xs hover:shadow-md text-center sm:text-left transition-shadow cursor-default"
                >
                  <div className="text-base sm:text-lg font-bold text-zinc-900 font-display">100%</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 leading-tight">Material de qualidade</div>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }} 
                  className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-100 shadow-2xs hover:shadow-md text-center sm:text-left transition-shadow cursor-default"
                >
                  <div className="text-base sm:text-lg font-bold text-zinc-900 font-display">48h</div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 leading-tight">Média de fabricação</div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Product Showcase with Floating Levitation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              {/* Outer Decorative Glow with Gentle Breathing */}
              <motion.div 
                animate={{ scale: [1, 1.08, 1], rotate: [1, -1, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-amber-400/10 rounded-3xl blur-2xl transform" 
              />

              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative rounded-3xl bg-white border border-zinc-200 shadow-xl p-3 sm:p-4 overflow-hidden"
              >
                {/* Main Viewport Area */}
                <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 group">
                  <img
                    src={selectedShowcase.image}
                    alt={selectedShowcase.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />

                  {/* Floating Badge with Breathing Pulse */}
                  <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
                    <motion.span 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="backdrop-blur-md bg-white/95 border border-zinc-200 px-3 py-1 rounded-full text-[11px] font-bold text-zinc-800 shadow-xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Coleção Exclusiva
                    </motion.span>
                  </div>

                  {/* Subtle Bottom Title */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent text-white">
                    <span className="text-xs font-semibold tracking-wide block text-white/95">
                      {selectedShowcase.name}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. PRODUTOS EM DESTAQUE COM FILTROS INTERATIVOS & ABAS ANIMADAS */}
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

          {/* Filter Tabs com LayoutId Spring Animation */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-100 border border-zinc-200 overflow-x-auto whitespace-nowrap scrollbar-none max-w-full shadow-2xs relative">
            {[
              { id: 'featured', label: '⭐ Destaques' },
              { id: 'bestsellers', label: '🔥 Mais Vendidos' },
              { id: 'newArrivals', label: '✨ Lançamentos' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 z-10 ${
                  activeTab === tab.id
                    ? 'text-blue-700 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs border border-zinc-200 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid with Animated Cards */}
        {filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
          >
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
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
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center pt-10"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white hover:bg-zinc-50 border-2 border-zinc-300 hover:border-blue-500 text-blue-800 font-bold text-sm transition-all cursor-pointer shadow-xs hover:shadow-md group"
              >
                <span>Ver Todos os {products.length} Produtos do Catálogo</span>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* 4. BENEFÍCIOS & GARANTIAS DO ATELIER (Com Stagger & Spring Hover) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: '📏',
              bg: 'bg-blue-50',
              border: 'border-blue-100',
              hoverBorder: 'hover:border-blue-300',
              titleColor: 'group-hover:text-blue-700',
              title: 'Acabamento Suave',
              desc: 'Superfície lisa, suave e sem rebarbas'
            },
            {
              icon: '🌿',
              bg: 'bg-emerald-50',
              border: 'border-emerald-100',
              hoverBorder: 'hover:border-emerald-300',
              titleColor: 'group-hover:text-emerald-700',
              title: 'Materiais Premium',
              desc: 'Matérias-primas de alta qualidade e durabilidade'
            },
            {
              icon: '⚙️',
              bg: 'bg-purple-50',
              border: 'border-purple-100',
              hoverBorder: 'hover:border-purple-300',
              titleColor: 'group-hover:text-purple-700',
              title: 'Encaixe & Ergonomia',
              desc: 'Ajuste perfeito para sua mesa e setup'
            },
            {
              icon: '🛡️',
              bg: 'bg-amber-50',
              border: 'border-amber-100',
              hoverBorder: 'hover:border-amber-300',
              titleColor: 'group-hover:text-amber-700',
              title: 'Garantia & Mercado Pago',
              desc: '100% inspecionado e compra protegida'
            }
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs ${item.hoverBorder} hover:shadow-md transition-all group cursor-default`}
            >
              <div className={`w-12 h-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center text-2xl shrink-0 group-hover:scale-115 group-hover:rotate-6 transition-transform duration-300`}>
                {item.icon}
              </div>
              <div>
                <h3 className={`text-xs font-bold text-zinc-900 ${item.titleColor} transition-colors`}>{item.title}</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. NEWSLETTER INTERATIVA COM CUPOM */}
      <motion.section 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 w-full"
      >
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-6">
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-2xs transition-transform"
          >
            <Mail className="w-6 h-6" />
          </motion.div>
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
              className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs text-zinc-900 outline-none focus:bg-white focus:border-blue-600 shadow-xs transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Inscrever-se
            </motion.button>
          </form>

          {newsletterSubscribed && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Inscrição confirmada! Use o cupom <strong>SUNLAB10</strong> para 10% OFF no Checkout Mercado Pago.</span>
            </motion.div>
          )}
        </div>
      </motion.section>

    </div>
  );
};

export default Home;
