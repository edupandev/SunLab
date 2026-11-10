import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { X, Star, ShoppingBag, ArrowRight, Cpu, Box, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, closeQuickView, addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(quickViewProduct?.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(quickViewProduct?.sizes?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedImageIndex(0);
      setSelectedColor(quickViewProduct.colors[0]);
      setSelectedSize(quickViewProduct.sizes?.[0]);
      setQuantity(1);
      setAdded(false);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const handleAdd = () => {
    if (selectedColor) {
      addToCart(quickViewProduct, quantity, selectedColor, selectedSize);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        closeQuickView();
      }, 800);
    }
  };

  const handleViewFullPage = () => {
    closeQuickView();
    navigate(`/product/${quickViewProduct.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-700/30 backdrop-blur-xs transition-opacity"
        onClick={closeQuickView}
      />

      <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden z-10 my-auto sm:my-8 max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200 shadow-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images Section */}
          <div className="p-6 bg-zinc-50 border-r border-zinc-200 flex flex-col justify-between">
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-white border border-zinc-200 relative shadow-xs">
              <img
                src={quickViewProduct.images[selectedImageIndex] || quickViewProduct.images[0]}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Thumbnails */}
            {quickViewProduct.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {quickViewProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-zinc-800 scale-95'
                        : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <span className="uppercase tracking-wider font-semibold text-zinc-500">
                  {quickViewProduct.categoryLabel}
                </span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-zinc-800">{quickViewProduct.rating.toFixed(1)}</span>
                  <span className="text-zinc-400">({quickViewProduct.reviewsCount} avaliações)</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                {quickViewProduct.name}
              </h2>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                {quickViewProduct.description}
              </p>

              {/* Price */}
              <div className="mt-4 pb-4 border-b border-zinc-100">
                {quickViewProduct.price > 0 ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-zinc-900">
                      R$ {quickViewProduct.price.toFixed(2).replace('.', ',')}
                    </span>
                    {quickViewProduct.originalPrice && (
                      <span className="text-sm text-zinc-400 line-through">
                        R$ {quickViewProduct.originalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    <span className="text-xs text-zinc-700 font-medium bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                      5% OFF no Pix
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-zinc-800">
                    Projeto Sob Consulta
                  </span>
                )}
              </div>

              {/* Color Selector */}
              {quickViewProduct.colors && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-zinc-700 mb-2">
                    Cor Selecionada: <strong className="text-zinc-900">{selectedColor?.name}</strong>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.colors.map(col => (
                      <button
                        key={col.name}
                        onClick={() => setSelectedColor(col)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          selectedColor?.name === col.name
                            ? 'bg-zinc-100 border-zinc-700 text-zinc-900 ring-1 ring-zinc-500'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-zinc-300"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector if available */}
              {quickViewProduct.sizes && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-zinc-700 mb-2">
                    Dimensão / Tamanho:
                  </label>
                  <div className="flex gap-2">
                    {quickViewProduct.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'bg-zinc-200 border-zinc-400 text-zinc-900 font-bold'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick specs pill */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-zinc-600">
                <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span className="truncate">{quickViewProduct.specs.material}</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center gap-2">
                  <Box className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span className="truncate">Camada {quickViewProduct.specs.layerHeight}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {quickViewProduct.price > 0 ? (
                <div className="flex gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 px-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2 py-2 text-zinc-600 hover:text-zinc-900 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2 text-sm font-semibold text-zinc-900 min-w-[24px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2 py-2 text-zinc-600 hover:text-zinc-900 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAdd}
                    disabled={added}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      added
                        ? 'bg-zinc-300 text-zinc-900'
                        : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 shadow-xs'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 text-zinc-800" />
                        <span>Adicionado ao Carrinho!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-zinc-700" />
                        <span>Adicionar ao Carrinho</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    closeQuickView();
                    navigate('/custom');
                  }}
                  className="w-full py-3 px-5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Solicitar Orçamento Personalizado
                </button>
              )}

              <button
                onClick={handleViewFullPage}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer py-1"
              >
                <span>Ver página completa com todas as fotos e detalhes técnicos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
