import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Compass } from 'lucide-react';

export const NoRoutes: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
          Erro 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Página não encontrada
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          O endereço que você tentou acessar não existe ou foi realocado na nova versão do estúdio.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md shadow-blue-500/20"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Retornar à Página Inicial</span>
      </Link>
    </div>
  );
};

export default NoRoutes;
