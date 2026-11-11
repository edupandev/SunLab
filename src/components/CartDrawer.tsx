import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    totalItems,
    openCheckout
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const navigate = useNavigate();

  const handleClearCart = () => {
    if (confirmClear) {
      clearCart();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3500);
    }
  };

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback({
      message: res.message,
      isError: !res.success
    });
    if (res.success) {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-700/30 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-white border-l border-zinc-200 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-200 bg-zinc-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-bold text-blue-950 tracking-tight">
                Seu Carrinho
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    confirmClear
                      ? 'bg-red-600 text-white font-semibold shadow-xs animate-in fade-in'
                      : 'text-zinc-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200'
                  }`}
                  title={confirmClear ? "Clique novamente para confirmar" : "Limpar todos os itens do carrinho"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{confirmClear ? 'Confirmar?' : 'Limpar carrinho'}</span>
                </button>
              )}

              <button
                onClick={closeCart}
                className="p-1.5 rounded-lg text-blue-600 hover:text-blue-950 hover:bg-blue-50 transition-colors cursor-pointer"
                title="Fechar carrinho"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 text-zinc-400">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4 text-zinc-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-zinc-800 mb-1">
                  Seu carrinho está vazio
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mb-6">
                  Descubra nossas criações autorais de design e objetos funcionais impressos em 3D.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/catalog');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 font-semibold text-sm transition-colors cursor-pointer shadow-xs"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-cover bg-zinc-200 border border-zinc-200 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block border border-zinc-300"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            {item.selectedColor.name}
                          </span>
                          {item.selectedSize && (
                            <span>• {item.selectedSize}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Remover do carrinho"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-200">
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-zinc-900 text-zinc-500 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-zinc-800 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-zinc-900 text-zinc-500 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-zinc-900">
                        R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-zinc-200 bg-zinc-50 space-y-4">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-zinc-200 text-xs">
                    <div className="flex items-center gap-1.5 text-blue-900 font-medium">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      <span>Cupom <strong>{appliedCoupon}</strong> ativo</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-blue-600 hover:text-blue-900 underline cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Cupom (ex: SUNLAB10)"
                      className="flex-1 bg-white border border-zinc-300 rounded-lg px-3 py-1.5 text-xs text-blue-950 placeholder-blue-300 outline-none focus:border-blue-500 uppercase"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-blue-950 border border-zinc-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </form>
                )}
                {couponFeedback && (
                  <p className={`text-[11px] mt-1 ${couponFeedback.isError ? 'text-red-500' : 'text-blue-800'}`}>
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              {/* Order Calculations */}
              <div className="space-y-1.5 text-xs text-zinc-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-900">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-zinc-700 font-medium">
                    <span>Desconto do Cupom</span>
                    <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>Total</span>
                  <span className="text-zinc-900 text-lg">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 text-right">
                  ou até 3x de R$ {(total / 3).toFixed(2).replace('.', ',')} sem juros
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={openCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 font-semibold text-sm transition-all shadow-xs cursor-pointer"
                >
                  <span>Finalizar Pedido</span>
                  <ArrowRight className="w-4 h-4 text-zinc-600" />
                </button>
                <button
                  onClick={closeCart}
                  className="w-full py-2 text-xs font-medium text-blue-600 hover:text-blue-950 transition-colors cursor-pointer text-center"
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
