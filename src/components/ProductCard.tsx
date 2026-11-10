import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Eye, ShoppingBag, Star, Sparkles, Check } from 'lucide-react';
import type { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openQuickView } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1600);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col rounded-3xl bg-white border border-zinc-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badges */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-wrap gap-1 pointer-events-none">
        {product.bestseller && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold bg-white/95 text-blue-700 border border-blue-200 shadow-xs backdrop-blur-md">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" /> Mais Vendido
          </span>
        )}
        {product.newArrival && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold bg-white/95 text-zinc-800 border border-zinc-200 shadow-xs backdrop-blur-md">
            Lançamento
          </span>
        )}
        {product.category === 'custom' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs backdrop-blur-md">
            Sob Medida
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square sm:aspect-4/3 w-full bg-zinc-100 overflow-hidden">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out ${
              isHovered ? 'scale-108' : 'scale-100'
            }`}
            loading="lazy"
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} detalhe`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}
        </Link>

        {/* Quick Action Overlay Buttons */}
        <div className="absolute bottom-3 inset-x-3 flex gap-2 justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleQuickView}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/95 hover:bg-white text-zinc-700 hover:text-zinc-900 border border-zinc-200 text-xs font-semibold backdrop-blur-md transition-all shadow-xs cursor-pointer active:scale-95"
            title="Visualização Rápida"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            <span>Espiar</span>
          </button>
          {product.price > 0 ? (
            <button
              onClick={handleQuickAdd}
              disabled={addedAnimation}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 ${
                addedAnimation
                  ? 'bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-zinc-900 hover:bg-black text-white'
              }`}
              title="Adicionar ao Carrinho"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5 animate-bounce" />
                  <span>Adicionado!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Comprar</span>
                </>
              )}
            </button>
          ) : (
            <Link
              to="/custom"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <span>Orçar</span>
            </Link>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between gap-2 sm:gap-3">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span className="uppercase tracking-wider font-bold text-[9px] sm:text-[10px] text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-md truncate max-w-[110px]">
              {product.categoryLabel}
            </span>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400 shrink-0" />
              <span className="font-bold text-zinc-800">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <Link to={`/product/${product.slug}`} className="group/title block">
            <h3 className="font-bold text-xs sm:text-base text-zinc-900 group-hover/title:text-blue-600 transition-colors line-clamp-2 leading-tight">
              {product.name}
            </h3>
            <p className="hidden sm:block text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
              {product.tagline}
            </p>
          </Link>
        </div>

        {/* Color Variants Preview */}
        {product.colors && product.colors.length > 1 && (
          <div className="flex items-center gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
            <span className="text-[10px] sm:text-[11px] text-zinc-400 mr-0.5">Cor:</span>
            {product.colors.slice(0, 4).map(col => (
              <button
                key={col.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(col);
                }}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all cursor-pointer shrink-0 ${
                  selectedColor.name === col.name
                    ? 'ring-2 ring-blue-600 ring-offset-1 sm:ring-offset-2 ring-offset-white border-white scale-110'
                    : 'border-zinc-300 hover:scale-110'
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
            <span className="hidden sm:inline text-[11px] font-medium text-zinc-600 ml-1 truncate max-w-[110px]">
              {selectedColor.name}
            </span>
          </div>
        )}

        {/* Price & Action Button */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-zinc-100 mt-auto gap-1.5 sm:gap-2">
          <div>
            {product.price > 0 ? (
              <div>
                <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                  <span className="text-sm sm:text-lg font-extrabold text-zinc-900 tracking-tight">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 line-through">
                      R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>
                <p className="text-[9px] sm:text-[10px] text-zinc-400 hidden xs:block">
                  Prazo: {product.leadTime}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold text-zinc-700">Sob Orçamento</span>
                <p className="text-[9px] sm:text-[10px] text-zinc-400">Customizável</p>
              </div>
            )}
          </div>

          {product.price > 0 ? (
            <button
              onClick={handleQuickAdd}
              disabled={addedAnimation}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1 active:scale-95 ${
                addedAnimation
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Adicionado!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Comprar</span>
                </>
              )}
            </button>
          ) : (
            <Link
              to="/custom"
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 transition-colors shrink-0"
            >
              Orçar
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
