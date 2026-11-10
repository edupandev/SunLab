import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Layers,
  Star,
  ChevronRight,
  Mail,
  Check,
  Flame,
  Sliders,
  Cpu,
  ShieldCheck,
  Box,
  Eye,
  RefreshCw,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { REVIEWS } from '@/data/products';
import { useProducts } from '@/context/ProductContext';
import { ProductCard } from '@/components/ProductCard';

// Interactive Showcase Palette for Hero 3D Studio (Coleção Natal SunLab)
const FILAMENTS = [
  {
    id: 'vela-renas',
    name: 'Conjunto Vela & Renas',
    hex: '#f8fafc',
    accent: 'from-blue-600 to-indigo-600',
    image: '/products/natal/01_vela_renas/01_hero_estudio.jpg',
    material: 'Bio-PLA Mineral Fosco',
    temp: '210°C'
  },
  {
    id: 'presepio',
    name: 'Presépio Sagrada Família',
    hex: '#f1f5f9',
    accent: 'from-slate-200 to-slate-400',
    image: '/products/natal/02_presepio_familia/01_hero_estudio.jpg',
    material: 'PLA Silk Acetinado',
    temp: '215°C'
  },
  {
    id: 'pinheiro',
    name: 'Pinheiro Feliz Natal',
    hex: '#15803d',
    accent: 'from-emerald-600 to-teal-700',
    image: '/products/natal/03_pinheiro_natal/01_hero_estudio.jpg',
    material: 'Bio-Polímero Eco-Green',
    temp: '205°C'
  },
  {
    id: 'flocos',
    name: 'Kit Flocos de Neve',
    hex: '#e0f2fe',
    accent: 'from-sky-400 to-blue-600',
    image: '/products/natal/04_flocos_neve/01_flatlay_conjunto.jpg',
    material: 'Cristalino Translúcido',
    temp: '215°C'
  },
  {
    id: 'bicolor',
    name: 'Tags Bicolores Natal',
    hex: '#dc2626',
    accent: 'from-red-600 to-rose-700',
    image: '/products/natal/05_enfeites_bicolores/01_flatlay_catalogo.jpg',
    material: 'Coextrusão Dupla Cor',
    temp: '220°C'
  }
];

export const Home: React.FC = () => {
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'newArrivals'>('featured');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Creative 3D Studio States
  const [selectedFilament, setSelectedFilament] = useState(FILAMENTS[0]);
  const [slicerMode, setSlicerMode] = useState(false);
  const [layerHeight, setLayerHeight] = useState<'0.08' | '0.12' | '0.16'>('0.08');
  const [rotationAngle, setRotationAngle] = useState(0);

  // Interactive Manufacturing Steps State
  const [activeStep, setActiveStep] = useState(0);

  // Interactive Desk Hotspots State
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

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

  const stepsData = [
    {
      num: '01',
      title: 'Modelagem Paramétrica 3D',
      subtitle: 'Algoritmos generativos & CAD avançado',
      desc: 'Nossos designers desenvolvem geometrias computacionais impossíveis de moldar na injeção plástica convencional, como malhas Voronoi, treliças Gyroid e curvas fluidas matemáticas.',
      icon: Cpu,
      badge: 'Software CAD Paramétrico',
      stat: '100% Autoral'
    },
    {
      num: '02',
      title: 'Fatiamento Micrométrico G-Code',
      subtitle: 'Simulação física e trajetórias de bocal',
      desc: 'O modelo é convertido em até 1.400 fatias micrométricas. Otimizamos caminhos de extrusão, perímetros contínuos e taxas de retração para acabamento liso e sedoso sem costuras visíveis.',
      icon: Sliders,
      badge: 'Camadas de 0.08mm',
      stat: 'Zero Rebarbas'
    },
    {
      num: '03',
      title: 'Impressão Aditiva de Alta Precisão',
      subtitle: 'Bancada industrial com controle térmico',
      desc: 'Extrusão precisa de biopolímeros ecológicos em câmaras isoladas com nivelamento óptico a laser. Sem emissão de fumos tóxicos e com 100% de eficiência energética.',
      icon: Flame,
      badge: 'Bocal de 0.4mm a 215°C',
      stat: 'Bio-PLA Ecológico'
    },
    {
      num: '04',
      title: 'Pós-Processamento Artesanal & Envio',
      subtitle: 'Acabamento manual, curadoria e despacho seguro',
      desc: 'Cada peça é desmoldada, limpa e inspecionada visualmente sob luz tangencial. Embalada em papel kraft reciclado com selo de garantia e enviada com rastreio no seu WhatsApp.',
      icon: ShieldCheck,
      badge: 'Inspeção Manual 1 a 1',
      stat: 'Despacho Seguro'
    }
  ];

  return (
    <div className="w-full flex flex-col space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      
      {/* 🚀 TICKER ANIMADO DINÂMICO (Marquee Infinito com estilo 3D Studio) */}
      <div className="w-full bg-zinc-900 text-white py-2.5 overflow-hidden border-b border-zinc-800 text-[11px] font-medium tracking-wide shadow-xs select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <strong className="text-blue-400">ATELIER ATIVO:</strong> 12 Impressoras em Operação 24/7
          </span>
          <span className="text-zinc-500">•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Camadas Ultrarrefinadas de <strong>0.08mm</strong>
          </span>
          <span className="text-zinc-500">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Mercado Pago Oficial <strong>(Pix 5% OFF, Boleto e Cartão até 12x)</strong>
          </span>
          <span className="text-zinc-500">•</span>
          <span className="flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-blue-400" /> Biopolímeros 100% Biodegradáveis
          </span>
          <span className="text-zinc-500">•</span>
          <span className="flex items-center gap-1.5">
            💬 Rastreamento e Pedidos em Tempo Real no <strong>WhatsApp</strong>
          </span>
          <span className="text-zinc-500">•</span>
          <span className="flex items-center gap-1.5">
            ⭐ <strong>4.9/5</strong> em mais de 850 encomendas entregues no Brasil
          </span>
          <span className="text-zinc-500">•</span>
          {/* Loop repeat for seamless marquee */}
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <strong className="text-blue-400">ATELIER ATIVO:</strong> 12 Impressoras em Operação 24/7
          </span>
          <span className="text-zinc-500">•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Camadas Ultrarrefinadas de <strong>0.08mm</strong>
          </span>
          <span className="text-zinc-500">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Mercado Pago Oficial <strong>(Pix 5% OFF, Boleto e Cartão até 12x)</strong>
          </span>
        </div>
      </div>

      {/* 1. HERO SECTION CRIATIVO & ANIMADO */}
      <section className="relative w-full pt-6 pb-16 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-zinc-50/50 border-b border-zinc-200">
        
        {/* Subtle CAD Background Grid */}
        <div className="absolute inset-0 bg-grid-tech opacity-60 pointer-events-none" />

        {/* Ambient Subtle Glow Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Status Badge with Live Pulse */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-xs font-bold text-blue-700 shadow-xs backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                <span className="uppercase tracking-wider">LABORATÓRIO DE IMPRESSÃO 3D DE ALTA PRECISÃO</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] sm:leading-[1.1] font-display">
                Se dá pra imaginar, <br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                  a gente imprime.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-lg text-zinc-600 max-w-xl font-normal leading-relaxed">
                De chaveiros e colecionáveis a peças personalizadas pra sua marca ou pro seu setup. Sem complicação, com acabamento impecável e direto na sua porta.
              </p>

              {/* Interactive Filament Quick Palette on Hero */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-xs max-w-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-800 flex items-center gap-1.5 text-[11px] sm:text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Experimente o Acabamento Interativo:
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 truncate max-w-[120px]">
                    {selectedFilament.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2.5 pt-1 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
                  {FILAMENTS.map(filament => (
                    <button
                      key={filament.id}
                      onClick={() => setSelectedFilament(filament)}
                      className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer shrink-0 ${
                        selectedFilament.id === filament.id
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs scale-102'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                        style={{ backgroundColor: filament.hex }}
                      />
                      <span className="text-[11px]">{filament.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1">
                <Link
                  to="/catalog"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explorar Catálogo 2026</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/custom"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-900 hover:text-white border-2 border-zinc-900 text-zinc-900 font-bold text-sm transition-all cursor-pointer shadow-xs hover:-translate-y-0.5 active:scale-98"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Imprimir Meu Arquivo .STL</span>
                </Link>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-4 sm:pt-6 border-t border-zinc-200 max-w-lg">
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-100 shadow-2xs text-center sm:text-left">
                  <div className="text-lg sm:text-2xl font-bold text-zinc-900 font-display">0.08<span className="text-blue-600 text-xs sm:text-sm">mm</span></div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 leading-tight">Camadas de precisão</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-100 shadow-2xs text-center sm:text-left">
                  <div className="text-lg sm:text-2xl font-bold text-zinc-900 font-display">100<span className="text-blue-600 text-xs sm:text-sm">%</span></div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 leading-tight">Biopolímeros ecológicos</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-zinc-100 shadow-2xs text-center sm:text-left">
                  <div className="text-lg sm:text-2xl font-bold text-zinc-900 font-display">48<span className="text-blue-600 text-xs sm:text-sm">h</span></div>
                  <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 leading-tight">Média de fabricação</div>
                </div>
              </div>
            </motion.div>

            {/* Right Interactive 3D Studio Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              {/* Outer Decorative Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-3xl blur-2xl transform rotate-1 scale-105" />

              <div className="relative rounded-3xl bg-white border border-zinc-200 shadow-xl p-4 overflow-hidden">
                
                {/* 3D Studio Header HUD */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-xs font-bold text-zinc-800 tracking-tight">SUNLAB SLICER STUDIO 3D</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSlicerMode(!slicerMode)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                        slicerMode
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                      }`}
                      title="Ativar simulação de camadas de impressão"
                    >
                      <Layers className="w-3 h-3" />
                      <span>{slicerMode ? 'Modo Camadas ATIVO' : 'Ver Camadas CAD'}</span>
                    </button>
                    <button
                      onClick={() => setRotationAngle(prev => (prev + 90) % 360)}
                      className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border border-zinc-200 transition-colors cursor-pointer"
                      title="Girar ângulo de inspeção"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main 3D Viewport Area */}
                <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-zinc-950 mt-3 border border-zinc-800 group">
                  
                  {/* Subtle 3D Grid Overlay inside viewport */}
                  <div className="absolute inset-0 bg-grid-tech opacity-15 pointer-events-none" />

                  {/* Rendered 3D Image with dynamic transition */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedFilament.id + rotationAngle}
                      src={selectedFilament.image}
                      alt={selectedFilament.name}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ transform: `rotate(${rotationAngle}deg)` }}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out"
                    />
                  </AnimatePresence>

                  {/* Slicer Laser Scanline (when slicerMode is active) */}
                  {slicerMode && (
                    <>
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#3b82f6] animate-scan-laser pointer-events-none z-20" />
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(37,99,235,0.18)_4px)] pointer-events-none z-10" />
                      <div className="absolute top-3 left-3 z-20 bg-blue-900/90 backdrop-blur-md border border-blue-400/50 text-blue-200 text-[10px] font-mono px-2 py-1 rounded-md">
                        SLICING: 0.08mm | Z: 142.4mm
                      </div>
                    </>
                  )}

                  {/* Floating Badges inside Viewport */}
                  <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
                    <span className="backdrop-blur-md bg-white/90 border border-zinc-200 px-2.5 py-1 rounded-full text-[11px] font-bold text-zinc-800 shadow-xs flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      Coleção 2026
                    </span>
                    <span className="backdrop-blur-md bg-zinc-900/80 border border-zinc-700 px-2.5 py-1 rounded-full text-[10px] font-mono text-zinc-200 shadow-xs flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      {selectedFilament.temp}
                    </span>
                  </div>

                  {/* Bottom Interactive HUD Overlay */}
                  <div className="absolute bottom-3 inset-x-3 backdrop-blur-xl bg-white/95 border border-zinc-200 p-3.5 rounded-2xl text-left shadow-lg z-20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                            Atelier SunLab 3D
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono font-medium">
                            {selectedFilament.material}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-zinc-900 mt-0.5">
                          Projetos & Peças Sob Medida
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block">Orçamento</span>
                        <span className="text-sm font-bold text-blue-600">Sob Consulta</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 font-mono text-[10px]">Resolução:</span>
                        {(['0.08', '0.12', '0.16'] as const).map(res => (
                          <button
                            key={res}
                            onClick={() => setLayerHeight(res)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                              layerHeight === res
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                          >
                            {res}mm
                          </button>
                        ))}
                      </div>
                      <Link
                        to="/custom"
                        className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                      >
                        Personalizar Projeto →
                      </Link>
                    </div>
                  </div>

                </div>

                {/* 3D Telemetry Strip */}
                <div className="grid grid-cols-4 gap-2 mt-3 text-center text-[10px] font-mono text-zinc-600 pt-2 border-t border-zinc-100">
                  <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 block text-[9px]">BOCAL</span>
                    <strong className="text-zinc-800">{selectedFilament.temp}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 block text-[9px]">MESA</span>
                    <strong className="text-zinc-800">60°C</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 block text-[9px]">VELOCIDADE</span>
                    <strong className="text-zinc-800">220 mm/s</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-zinc-400 block text-[9px]">PRECISÃO</span>
                    <strong className="text-blue-600">{layerHeight}mm</strong>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>

          {/* 4 Hero Features Strip com Efeito Hover Dinâmico */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-6">
            <motion.div
              whileHover={{ y: -4 }}
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                📏
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">Precisão Milimétrica</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Camadas de 0.08 a 0.16mm sem rebarbas</p>
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
                <h3 className="text-xs font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors">Polímeros Sustentáveis</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">PLA Mineral ecológico, PETG e resinas</p>
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

        </div>
      </section>

      {/* 2. CATEGORIAS DE PRODUTOS CRIATIVAS (Cards Pastel com Micro-interações) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Curadoria de Linhas SunLab
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
              Explorar Coleções em 3D
            </h2>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors group"
          >
            <span>Ver todas as coleções do atelier</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Decoração (#e8f4f8 soft sky) */}
          <Link
            to="/catalog?cat=decor"
            className="group relative p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg flex flex-col justify-between border border-zinc-200/80 overflow-hidden"
            style={{ backgroundColor: '#e8f4f8' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="relative text-4xl mb-4 group-hover:rotate-6 transition-transform duration-300">
              🏺
            </div>
            <div className="relative">
              <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                Linha Autoral
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-1">
                Decoração Paramétrica
              </h3>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Vasos esculturais, luminárias Voronoi e centros de mesa de geometria fluida.
              </p>
            </div>
            <div className="relative mt-5 pt-3 border-t border-blue-200/70 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-900">
              <span>Ver peças decorativas</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Card 2: Utilitários (#f0e8f8 soft purple) */}
          <Link
            to="/catalog?cat=utility"
            className="group relative p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg flex flex-col justify-between border border-zinc-200/80 overflow-hidden"
            style={{ backgroundColor: '#f0e8f8' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="relative text-4xl mb-4 group-hover:rotate-6 transition-transform duration-300">
              💻
            </div>
            <div className="relative">
              <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
                Ergonomia & Mesa
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-1">
                Utilitários & Desk Setup
              </h3>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Docks modulares magnéticos MagSafe, organizadores de mesa e elevadores de laptop.
              </p>
            </div>
            <div className="relative mt-5 pt-3 border-t border-purple-200/70 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:text-purple-900">
              <span>Ver utilitários</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Card 3: Tecnologia (#e8f8f0 soft emerald) */}
          <Link
            to="/catalog?cat=tech"
            className="group relative p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg flex flex-col justify-between border border-zinc-200/80 overflow-hidden"
            style={{ backgroundColor: '#e8f8f0' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="relative text-4xl mb-4 group-hover:rotate-6 transition-transform duration-300">
              🎧
            </div>
            <div className="relative">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                Setup & Periféricos
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-1">
                Tecnologia & Stands
              </h3>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Suportes de headset Gyroid, bases de carregamento e organizadores de cabos.
              </p>
            </div>
            <div className="relative mt-5 pt-3 border-t border-emerald-200/70 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
              <span>Ver linha tech</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Card 4: Personalizados (#f8f0e8 soft amber) */}
          <Link
            to="/custom"
            className="group relative p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg flex flex-col justify-between border border-zinc-200/80 overflow-hidden"
            style={{ backgroundColor: '#f8f0e8' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
            <div className="relative text-4xl mb-4 group-hover:rotate-6 transition-transform duration-300">
              🛠️
            </div>
            <div className="relative">
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                Atelier Sob Medida
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-1">
                Projetos Personalizados
              </h3>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Envie seu arquivo 3D (.STL / .OBJ / .STEP) para produzirmos sob medida com garantia.
              </p>
            </div>
            <div className="relative mt-5 pt-3 border-t border-amber-200/70 flex items-center justify-between text-xs font-bold text-amber-800 group-hover:text-amber-950">
              <span>Orçar projeto exclusivo</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. PRODUTOS EM DESTAQUE COM FILTROS INTERATIVOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
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
                Orçar Peça Personalizada (.STL)
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

      {/* 4. SEÇÃO CRIATIVA INTERATIVA: EXPLORADOR DO PROCESSO DE ENGENHARIA 3D */}
      <section className="relative w-full py-16 bg-gradient-to-b from-zinc-50 via-white to-blue-50/30 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center justify-center gap-1.5">
              <Cpu className="w-4 h-4" /> Engenharia & Manufatura Digital
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-display mt-1">
              Como fabricamos cada peça SunLab
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
              Clique em cada etapa para explorar os parâmetros de qualidade, calibração e acabamento que diferenciam a manufatura aditiva SunLab.
            </p>
          </div>

          {/* Interactive Stepper Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {stepsData.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-bold ${isActive ? 'text-blue-200' : 'text-zinc-400'}`}>
                      ETAPA {step.num}
                    </span>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  </div>
                  <h4 className={`text-xs sm:text-sm font-bold leading-tight ${isActive ? 'text-white' : 'text-zinc-900'}`}>
                    {step.title}
                  </h4>
                </button>
              );
            })}
          </div>

          {/* Active Step Detailed Card with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-3xl border border-zinc-200 shadow-md p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-8 space-y-4 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    Etapa {stepsData[activeStep].num} de 04
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {stepsData[activeStep].badge}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700">
                    {stepsData[activeStep].stat}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 font-display">
                  {stepsData[activeStep].title}
                </h3>
                <p className="text-sm font-semibold text-blue-600">
                  {stepsData[activeStep].subtitle}
                </p>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-2xl font-normal">
                  {stepsData[activeStep].desc}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    to="/custom"
                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-colors shadow-xs"
                  >
                    <span>Solicitar Produção com Esta Tecnologia</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Graphic / Visual Box for Active Step */}
              <div className="lg:col-span-4 bg-gradient-to-br from-zinc-100 to-zinc-50 border border-zinc-200 rounded-2xl p-6 flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-blue-600">
                  {React.createElement(stepsData[activeStep].icon, { className: 'w-10 h-10' })}
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">Padrão de Precisão</div>
                  <div className="text-lg font-bold text-zinc-900 mt-0.5">{stepsData[activeStep].badge}</div>
                </div>
                <div className="text-[11px] text-zinc-500 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 w-full">
                  Inspecionado digitalmente com tolerância dimensional de ±0.1mm
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* 5. HOTSPOT INTERATIVO: SETUP SUNLAB INSPIRATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl mb-8">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Inspiração para seu Espaço
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display mt-1">
              Monte seu Setup Minimalista
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              Todos os acessórios de mesa são impressos sob medida para organizar cabos, acomodar fones de ouvido e elevar a estética do seu ambiente de trabalho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onMouseEnter={() => setActiveHotspot(1)}
              onMouseLeave={() => setActiveHotspot(null)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeHotspot === 1
                  ? 'bg-zinc-800/90 border-blue-400 shadow-lg'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="text-2xl mb-2">🎧</div>
              <h3 className="text-sm font-bold text-white">Suporte Headset Gyroid</h3>
              <p className="text-xs text-zinc-400 mt-1">Estrutura interna inspirada em favos de abelha. Resistente e ultraleve.</p>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-blue-400">
                <span>R$ 119,00</span>
                <Link to="/catalog?cat=tech" className="hover:underline">Ver no catálogo →</Link>
              </div>
            </div>

            <div
              onMouseEnter={() => setActiveHotspot(2)}
              onMouseLeave={() => setActiveHotspot(null)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeHotspot === 2
                  ? 'bg-zinc-800/90 border-blue-400 shadow-lg'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="text-sm font-bold text-white">Dock Modular MagSafe</h3>
              <p className="text-xs text-zinc-400 mt-1">Encaixe magnético com peso balanceado para retirada do iPhone com uma mão.</p>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-blue-400">
                <span>R$ 89,00</span>
                <Link to="/catalog?cat=utility" className="hover:underline">Ver no catálogo →</Link>
              </div>
            </div>

            <div
              onMouseEnter={() => setActiveHotspot(3)}
              onMouseLeave={() => setActiveHotspot(null)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeHotspot === 3
                  ? 'bg-zinc-800/90 border-blue-400 shadow-lg'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="text-2xl mb-2">🏺</div>
              <h3 className="text-sm font-bold text-white">Vaso Paramétrico Waveform</h3>
              <p className="text-xs text-zinc-400 mt-1">Acabamento fosco cerâmico para dar um toque orgânico à escrivaninha.</p>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-blue-400">
                <span>R$ 149,00</span>
                <Link to="/catalog?cat=decor" className="hover:underline">Ver no catálogo →</Link>
              </div>
            </div>
          </div>

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
              Receba Lançamentos & Arquivos 3D Exclusivos
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mt-1.5 leading-relaxed">
              Junte-se à nossa comunidade para receber cupons de desconto, novos modelos em .STL e novidades do atelier.
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

      {/* 7. DEPOIMENTOS DE CLIENTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center justify-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" /> Avaliações Verificadas
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
            O que dizem os clientes SunLab
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map(rev => (
            <motion.div
              key={rev.id}
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200 shadow-2xs"
                />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">{rev.author}</h4>
                  <p className="text-[11px] text-zinc-500">{rev.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
