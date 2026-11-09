import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, ArrowRight, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import type { Product } from '@/data/products';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch } = useCart();
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults(products.slice(0, 4)); // sugestões populares
      return;
    }

    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(trimmed) ||
      p.tagline.toLowerCase().includes(trimmed) ||
      p.categoryLabel.toLowerCase().includes(trimmed) ||
      p.specs.material.toLowerCase().includes(trimmed)
    );
    setResults(filtered);
  }, [query, products]);

  // Tecla Esc fecha modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  if (!isSearchOpen) return null;

  const handleSelectProduct = (product: Product) => {
    closeSearch();
    navigate(`/product/${product.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-700/30 backdrop-blur-xs transition-opacity"
        onClick={closeSearch}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-200 bg-zinc-50">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por vaso, luminária, suporte, PLA, modelo..."
            className="w-full bg-transparent text-zinc-900 placeholder-zinc-400 text-base outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-zinc-700 p-1 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeSearch}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-700 border border-zinc-300 transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 pb-1">
            {query.trim() ? `Resultados (${results.length})` : 'Sugestões em Alta'}
          </div>

          {results.length > 0 ? (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className="group flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 hover:border-zinc-300 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover bg-white border border-zinc-200 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      {product.categoryLabel}
                    </span>
                    <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {product.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    {product.price > 0 ? (
                      <span className="text-sm font-bold text-zinc-900">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-zinc-700">
                        Sob Consulta
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-zinc-500">
              <Package className="w-10 h-10 mx-auto text-zinc-400 mb-2 stroke-1" />
              <p className="text-sm font-medium">Nenhum produto encontrado para "{query}"</p>
              <p className="text-xs text-zinc-400 mt-1">Tente buscar por "vaso", "suporte", "luminária" ou "game"</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Use as setas ou clique para navegar</span>
          <span className="font-semibold text-zinc-700">SunLab 3D Studio</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
