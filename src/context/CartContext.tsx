import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Product, ProductColor } from '@/data/products';
import { useAuth } from '@/context/AuthContext';

export interface CartItem {
  id: string; // unique item id (productId + color + size)
  product: Product;
  quantity: number;
  selectedColor: ProductColor;
  selectedSize?: string;
  unitPrice: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: ProductColor, size?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  totalItems: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  
  // UI states
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;

  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sunlab_cart_v1';
// Promoção: Taxa de entrega grátis para todo o Brasil
const FREE_SHIPPING_LIMIT = 0;
const STANDARD_SHIPPING_RATE = 0;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const isInitialLoad = useRef(true);
  const syncTimer = useRef<any>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(0);
  const [isFreeShippingCoupon, setIsFreeShippingCoupon] = useState<boolean>(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const previousUserRef = useRef<string | null>(user?.email || null);

  // Ao deslogar, limpa imediatamente os itens do carrinho e cache local
  useEffect(() => {
    if (previousUserRef.current && !user) {
      setCart([]);
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch (_) {}
    }
    previousUserRef.current = user?.email || null;
  }, [user]);

  // Auto-abrir checkout se veio de redirecionamento de login (?checkout=true)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('checkout') === 'true') {
        setIsCheckoutOpen(true);
        const url = new URL(window.location.href);
        url.searchParams.delete('checkout');
        window.history.replaceState({}, '', url.pathname + (url.search || ''));
      }
    } catch (_) {}
  }, []);

  // 1. Sincronização multi-dispositivo: Ao logar na conta (PC ou Celular), carrega o carrinho salvo no banco
  useEffect(() => {
    if (!user?.email) return;

    const fetchUserCart = async () => {
      try {
        const res = await fetch(`/api/cart?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            setCart(prev => {
              const map = new Map<string, CartItem>();
              data.items.forEach((it: CartItem) => map.set(it.id, it));
              prev.forEach(it => {
                if (!map.has(it.id)) map.set(it.id, it);
              });
              return Array.from(map.values());
            });
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar carrinho da conta:', err);
      } finally {
        isInitialLoad.current = false;
      }
    };

    fetchUserCart();
  }, [user?.email]);

  // 2. Salva localmente e sincroniza na nuvem/banco da conta do usuário
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }

    if (user?.email && !isInitialLoad.current) {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(async () => {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              items: cart
            })
          });
        } catch (err) {
          console.warn('Falha ao salvar carrinho no banco de dados:', err);
        }
      }, 500);
    }
  }, [cart, user?.email]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    color?: ProductColor,
    size?: string
  ) => {
    const selectedColor = color || product.colors[0] || { name: 'Padrão', hex: '#18181B' };
    const selectedSize = size || (product.sizes ? product.sizes[0] : undefined);
    const itemId = `${product.id}-${selectedColor.name}-${selectedSize || 'std'}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          quantity,
          selectedColor,
          selectedSize,
          unitPrice: product.price
        }
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscountPercent(0);
    setIsFreeShippingCoupon(false);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'SUNLAB10' || cleanCode === 'PRINTIVA10') {
      setAppliedCoupon('SUNLAB10');
      setCouponDiscountPercent(0.10);
      setIsFreeShippingCoupon(false);
      return { success: true, message: 'Cupom de 10% de desconto aplicado com sucesso!' };
    }
    if (cleanCode === 'SUNLAB20' || cleanCode === 'PRINTIVA20') {
      setAppliedCoupon('SUNLAB20');
      setCouponDiscountPercent(0.20);
      setIsFreeShippingCoupon(false);
      return { success: true, message: 'Cupom de 20% especial aplicado com sucesso!' };
    }
    if (cleanCode === 'FRETEGRATIS') {
      setAppliedCoupon('FRETEGRATIS');
      setIsFreeShippingCoupon(true);
      return { success: true, message: 'Frete grátis aplicado para seu pedido!' };
    }
    return { success: false, message: 'Cupom inválido ou expirado. Tente SUNLAB10' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountPercent(0);
    setIsFreeShippingCoupon(false);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const discount = subtotal * couponDiscountPercent;
  
  const rawShipping = subtotal === 0
    ? 0
    : (subtotal >= FREE_SHIPPING_LIMIT || isFreeShippingCoupon)
      ? 0
      : STANDARD_SHIPPING_RATE;

  const shipping = rawShipping;
  const total = Math.max(0, subtotal - discount + shipping);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_LIMIT - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discount,
        shipping,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        totalItems,
        freeShippingThreshold: FREE_SHIPPING_LIMIT,
        amountNeededForFreeShipping,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        isCheckoutOpen,
        openCheckout: () => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        },
        closeCheckout: () => setIsCheckoutOpen(false),
        quickViewProduct,
        openQuickView: (product: Product) => setQuickViewProduct(product),
        closeQuickView: () => setQuickViewProduct(null),
        isSearchOpen,
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
