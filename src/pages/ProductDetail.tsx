import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  Star,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Clock
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products } = useProducts();
  const { addToCart, openCheckout } = useCart();

  const product = products.find(p => p.slug === slug || p.id === slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product?.sizes?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors[0]);
      setSelectedSize(product.sizes?.[0]);
      setQuantity(1);
    }
  }, [slug, product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900">Produto não encontrado</h2>
        <p className="text-zinc-500 text-sm">O produto que você procura não está mais disponível ou mudou de endereço.</p>
        <Link
          to="/catalog"
          className="inline-block px-5 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 font-semibold text-xs"
        >
          Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (selectedColor) {
      addToCart(product, quantity, selectedColor, selectedSize);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (selectedColor) {
      addToCart(product, quantity, selectedColor, selectedSize);
      openCheckout();
    }
  };

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <Link to="/" className="hover:text-zinc-800 transition-colors">Início</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/catalog" className="hover:text-zinc-800 transition-colors">Loja</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/catalog?cat=${product.category}`} className="hover:text-zinc-800 transition-colors">
          {product.categoryLabel}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-800 font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Info & Media Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Gallery Section */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-xs">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {product.bestseller && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-zinc-700 border border-zinc-200 shadow-xs backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" /> Mais Vendido
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-blue-600 ring-2 ring-blue-300 scale-95'
                      : 'border-zinc-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Production Guarantee Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-2 sm:pt-4 text-xs text-zinc-600">
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Produção: {product.leadTime}</span>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Garantia de 1 ano</span>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>Troca em 7 dias</span>
            </div>
          </div>
        </div>

        {/* Product Purchase Actions & Specs */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
              <span className="uppercase tracking-wider font-bold text-zinc-500">
                {product.categoryLabel}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-zinc-800">{product.rating.toFixed(1)}</span>
                <span className="text-zinc-400">({product.reviewsCount} avaliações)</span>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
              {product.name}
            </h1>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              {product.tagline}
            </p>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            {product.price > 0 ? (
              <>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-zinc-900">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-zinc-400 line-through">
                      R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                    Pagamento via WhatsApp
                  </span>
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  Atendimento direto e liberação para a fila de manufatura 3D
                </p>
              </>
            ) : (
              <div>
                <span className="text-xl font-bold text-zinc-900">
                  Projeto Sob Medida
                </span>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Orçamento personalizado conforme geometria e volume
                </p>
              </div>
            )}
          </div>

          {/* Color Selection */}
          {product.colors && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-700">
                Cor do Acabamento: <strong className="text-zinc-900">{selectedColor?.name}</strong>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map(col => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      selectedColor?.name === col.name
                        ? 'bg-zinc-100 border-zinc-700 text-zinc-900 ring-1 ring-zinc-500'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-zinc-300"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-700">
                Dimensão / Tamanho:
              </label>
              <div className="flex gap-2.5">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-zinc-200 border-zinc-400 text-zinc-900 font-bold shadow-xs'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Purchase CTA Buttons - Gray and White */}
          <div className="space-y-3 pt-2">
            {product.price > 0 ? (
              <>
                <div className="flex gap-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 px-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="py-2 text-zinc-600 hover:text-zinc-950 font-bold cursor-pointer px-1"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-semibold text-zinc-900 min-w-[24px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="py-2 text-zinc-600 hover:text-zinc-950 font-bold cursor-pointer px-1"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      addedToast
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-zinc-200 text-blue-950 hover:bg-zinc-300 border border-zinc-300'
                    }`}
                  >
                    {addedToast ? (
                      <>
                        <Check className="w-4 h-4 text-blue-700" />
                        <span>Adicionado ao Carrinho!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-blue-700" />
                        <span>Adicionar ao Carrinho</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-blue-950 border border-zinc-300 text-sm font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <span>Comprar Agora com 1 Clique</span>
                  <ArrowRight className="w-4 h-4 text-blue-700" />
                </button>
              </>
            ) : (
              <Link
                to="/custom"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-blue-950 border border-zinc-300 text-sm font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>Solicitar Orçamento Deste Projeto</span>
                <ArrowRight className="w-4 h-4 text-blue-700" />
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Technical Specifications & Description Accordions */}
      <div className="pt-10 border-t border-zinc-200 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-6 space-y-4">
          <h3 className="text-xl font-bold text-zinc-900 font-display">
            Sobre o Objeto & Narrativa
          </h3>
          <p className="text-sm text-zinc-600 leading-relaxed">
            {product.description}
          </p>
          <p className="text-sm text-zinc-600 leading-relaxed italic bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            "{product.story}"
          </p>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Destaques de Design:
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-700">
              {product.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Specs Table */}
        <div className="md:col-span-6 space-y-4">
          <h3 className="text-xl font-bold text-zinc-900 font-display">
            Detalhes do Produto
          </h3>
          <div className="rounded-xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100 text-xs bg-white shadow-xs">
            <div className="flex justify-between p-3.5 bg-zinc-50/60">
              <span className="text-zinc-500">Material</span>
              <span className="font-semibold text-zinc-900">{product.specs.material}</span>
            </div>
            <div className="flex justify-between p-3.5 bg-white">
              <span className="text-zinc-500">Dimensões (AxLxP)</span>
              <span className="font-semibold text-zinc-900">{product.specs.dimensions}</span>
            </div>
            <div className="flex justify-between p-3.5 bg-zinc-50/60">
              <span className="text-zinc-500">Peso Aproximado</span>
              <span className="font-semibold text-zinc-900">{product.specs.weight}</span>
            </div>
            <div className="flex justify-between p-3.5 bg-white">
              <span className="text-zinc-500">Acabamento</span>
              <span className="font-semibold text-zinc-900 text-right max-w-[240px]">{product.specs.finish}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Carousel / Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-zinc-200 space-y-6 pb-16 md:pb-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 font-display">
              Você também pode gostar
            </h3>
            <Link to="/catalog" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              Ver mais na loja →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Buy Bar */}
      {product.price > 0 && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xl safe-area-bottom">
          <div className="min-w-0">
            <span className="text-[10px] text-zinc-400 block font-medium">Preço à vista</span>
            <div className="text-base font-extrabold text-zinc-900 tracking-tight truncate">
              R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAddToCart}
              className="p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 active:bg-zinc-100 text-zinc-700 active:scale-95 transition-all shadow-xs"
              title="Adicionar ao Carrinho"
            >
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={handleBuyNow}
              className="px-5 py-2.5 rounded-xl bg-blue-600 active:bg-blue-700 text-white font-bold text-xs shadow-md active:scale-95 flex items-center gap-1.5 transition-all"
            >
              <span>Comprar Agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
