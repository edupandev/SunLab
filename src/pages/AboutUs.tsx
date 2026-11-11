import React from 'react';
import { Link } from 'react-router';
import { Compass, Layers, ShieldCheck, Leaf, HeartHandshake } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-20">
      
      {/* Hero Banner */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 shadow-sm">
          <Compass className="w-3.5 h-3.5" />
          <span>O Manifesto SunLab</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-950 tracking-tight font-display leading-tight">
          A matéria física elevada pela geometria computacional.
        </h1>
        <p className="text-base text-blue-800/85 leading-relaxed">
          Nascemos com a convicção de que a manufatura aditiva (impressão 3D) não é um método de prototipagem rápida qualquer, mas a tecnologia de fabricação definitiva para o design contemporâneo.
        </p>
      </div>

      {/* Narrative Section with Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-950 font-display">
            Da tela dos softwares generativos para as mãos de pessoas que valorizam o detalhe.
          </h2>
          <p className="text-sm text-blue-800/85 leading-relaxed">
            Fundada por designers industriais e entusiastas de manufatura digital, a <strong className="text-blue-950">SunLab</strong> surgiu para preencher o abismo entre o artesanato tradicional e a produção em massa despersonalizada.
          </p>
          <p className="text-sm text-blue-800/85 leading-relaxed">
            Enquanto as indústrias tradicionais produzem centenas de milhares de unidades idênticas de plástico descartável em moldes de aço pesados, nós produzimos sob demanda com materiais de alta qualidade e acabamento impecável.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
              <span className="text-2xl font-bold text-blue-950 font-display">100%</span>
              <p className="text-xs text-blue-600 mt-1">Design autoral com produção local no Brasil</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs">
              <span className="text-2xl font-bold text-blue-950 font-display">Zero</span>
              <p className="text-xs text-blue-600 mt-1">Desperdício de matéria-prima em estoque ocioso</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="rounded-3xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-200 shadow-xl relative">
            <img
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85"
              alt="Laboratório SunLab 3D"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
              <p className="text-xs text-slate-200">
                Fazenda de manufatura digital SunLab — parque de impressão fechado com filtragem de ar HEPA e calibração a laser.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Four Pillars Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Os 4 Pilares da Nossa Engenharia
          </h2>
          <p className="text-xs text-slate-500">
            Cada linha de código G-code e cada filamento é cuidadosamente calibrado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Algoritmos Paramétricos</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Formas orgânicas inspiradas em equações matemáticas que seriam impossíveis de serem fabricadas por moldes convencionais.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Compromisso Ecológico</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Utilização de PLA puro atóxico e PETG reciclado. Nossos resíduos de calibração são 100% triturados e re-extrudados.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Inspeção Milimétrica</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada camada é monitorada por sensores de fluxo e câmeras térmicas de IA para garantir adesão perfeita e zero delaminação.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Acabamento Manual</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Após o resfriamento na mesa térmica, cada produto recebe lixamento refinado de arestas e impermeabilização artesanal.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-zinc-100 text-zinc-900 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl font-bold text-zinc-900 font-display">
            Pronto para transformar seu espaço?
          </h3>
          <p className="text-xs text-zinc-600 max-w-md">
            Conheça as peças da nossa coleção ou solicite um projeto autoral sob encomenda.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/catalog"
            className="px-6 py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Ver Loja
          </Link>
          <Link
            to="/custom"
            className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs transition-colors cursor-pointer border border-zinc-200 shadow-xs"
          >
            Personalizados
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AboutUs;
