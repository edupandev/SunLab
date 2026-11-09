import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Search, X, RotateCcw, PackageOpen } from 'lucide-react';
import { CATEGORIES } from '@/data/products';
import { useProducts } from '@/context/ProductContext';
import { ProductCard } from '@/components/ProductCard';

export const Catalog: React.FC = () => {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('cat') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name'>('featured');
  const [priceRange, setPriceRange] = useState<'all' | 'under-150' | '150-250' | 'over-250'>('all');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sync category param with URL
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('cat');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cat: catId });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setPriceRange('all');
    setInStockOnly(false);
    searchParams.delete('cat');
    setSearchParams(searchParams);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesCat = p.categoryLabel.toLowerCase().includes(query);
        const matchesMat = p.specs.material.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesMat) return false;
      }

      // Price range filter
      if (priceRange === 'under-150' && (p.price <= 0 || p.price > 150)) return false;
      if (priceRange === '150-250' && (p.price < 150 || p.price > 250)) return false;
      if (priceRange === 'over-250' && p.price < 250) return false;

      // In stock filter
      if (inStockOnly && !p.inStock) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [selectedCategory, searchQuery, sortBy, priceRange, inStockOnly]);

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery !== '' || priceRange !== 'all' || inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      
      {/* Page Header */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Loja & Coleções Exclusivas
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-950 tracking-tight font-display">
              Catálogo de Produtos 3D
            </h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-xl">
              Peças de design autoral, utilitários modulares e acessórios tecnológicos impressos em biopolímeros sustentáveis de ultra-alta resolução.
            </p>
          </div>
          <span className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 shadow-xs self-start sm:self-auto shrink-0">
            Exibindo <strong className="text-zinc-900">{filteredProducts.length}</strong> de <strong className="text-zinc-900">{products.length}</strong> produtos
          </span>
        </div>
      </div>

      {/* Filter and Search Controls - White & Gray */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
        
        {/* Top Controls: Search & Sort */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por nome, categoria ou material..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:bg-white focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector & Quick Toggles */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span className="hidden sm:inline">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
              >
                <option value="featured">Destaques SunLab</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="rating">Melhores Avaliações</option>
                <option value="name">Nome (A - Z)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-blue-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-zinc-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Pronta entrega</span>
            </label>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase font-bold text-blue-500 mr-1">Categorias:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-100 text-blue-950 font-bold border border-blue-300 shadow-xs'
                  : 'bg-zinc-100 text-blue-800 hover:text-blue-950 hover:bg-blue-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters (Price Range & Reset) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-bold text-zinc-400 mr-1">Preço:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'under-150', label: 'Até R$ 150' },
              { id: '150-250', label: 'R$ 150 a R$ 250' },
              { id: 'over-250', label: 'Acima de R$ 250' }
            ].map(range => (
              <button
                key={range.id}
                onClick={() => setPriceRange(range.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                  priceRange === range.id
                    ? 'bg-zinc-200 text-zinc-900 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar todos os filtros</span>
            </button>
          )}
        </div>

      </div>

      {/* Product Results Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-3xl bg-white border border-zinc-200 space-y-4 shadow-xs max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900">
              {products.length === 0 ? 'Catálogo Vazio' : 'Nenhum produto encontrado'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              {products.length === 0
                ? 'Nenhum produto cadastrado no momento. Você pode adicionar produtos pelo painel administrativo ou solicitar um projeto sob medida.'
                : 'Não encontramos produtos para os critérios de busca selecionados. Tente ajustar os filtros ou fazer uma nova pesquisa.'}
            </p>
          </div>
          {products.length === 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="/admin"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                + Cadastrar Produto no Painel
              </a>
              <a
                href="/custom"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 font-bold text-xs transition-colors"
              >
                Orçar Peça Personalizada (.STL)
              </a>
            </div>
          ) : (
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Redefinir Filtros
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default Catalog;
