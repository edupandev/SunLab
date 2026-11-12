import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, Waves } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
      
      {/* Badge de Localização */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 shadow-2xs"
      >
        <Waves className="w-3.5 h-3.5 text-blue-600" />
        <span>Santos • Litoral Paulista</span>
      </motion.div>

      {/* Grid Principal: Texto da SunLab + Imagem Simples e Limpa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Texto Institucional */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 space-y-6"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-display leading-tight">
            🌊 Prazer, somos a SunLab!
          </h1>

          <div className="space-y-4 text-base text-zinc-600 leading-relaxed font-normal">
            <p>
              Nascemos em Santos, no litoral paulista, trazendo um pouco da nossa essência caiçara para um universo cheio de criatividade e tecnologia.
            </p>
            <p>
              A SunLab surgiu da vontade de transformar ideias em algo real. Aqui, misturamos impressão 3D, personalização e tecnologia para criar peças que tenham identidade e façam sentido para quem recebe.
            </p>
            <p>
              Mais do que imprimir objetos, queremos explorar possibilidades: criar, personalizar, experimentar e dar vida a novas ideias.
            </p>
            <p>
              De peças personalizadas a soluções com tecnologia NFC, estamos sempre buscando algo novo para tirar do papel.
            </p>
            <p>
              Tudo isso com criatividade, curiosidade e aquele toque de quem nasceu perto do mar. ☀️
            </p>
          </div>

          <div className="pt-2">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-zinc-900 font-bold text-base shadow-2xs">
              Somos a SunLab. Ideias que ganham forma.
            </div>
          </div>
        </motion.div>

        {/* Imagem Oficial SunLab */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-5"
        >
          <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-md bg-white aspect-square">
            <img
              src="/sunlab-sobre.jpg"
              alt="Prazer, somos a SunLab! Impressões 3D em Santos"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

      </div>

      {/* Caixa de Chamada (CTA) Simples e Direta */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="p-8 sm:p-10 rounded-2xl bg-zinc-100 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs"
      >
        <div className="space-y-1.5 text-center sm:text-left">
          <h2 className="text-xl font-bold text-zinc-900 font-display">
            Quer transformar sua ideia em realidade?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500">
            Conheça nossos produtos disponíveis no catálogo ou solicite um projeto personalizado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            <span>Ver Catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/custom"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 font-semibold text-xs transition-colors shadow-xs"
          >
            Projetos Sob Medida
          </Link>
        </div>
      </motion.div>

    </div>
  );
};

export default AboutUs;
