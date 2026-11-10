import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/data/products';
import { PRODUCTS as FALLBACK_PRODUCTS } from '@/data/products';
import { isSupabaseConfigured, fetchSupabaseProducts, upsertSupabaseProduct, deleteSupabaseProduct } from '@/lib/supabase';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<{ success: boolean; product?: Product; error?: string }>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<{ success: boolean; product?: Product; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleProductField: (id: string, field: 'in_stock' | 'featured' | 'bestseller' | 'new_arrival') => Promise<{ success: boolean; error?: string }>;
  resetToDefault: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = 'sunlab_products_catalog';
const CUSTOM_PRODUCTS_KEY = 'sunlab_custom_products';
const DELETED_PRODUCTS_KEY = 'sunlab_deleted_products';
const EDITS_KEY = 'sunlab_custom_edits';

const getStoredCustomProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getStoredDeletedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getStoredEdits = (): Record<string, Partial<Product>> => {
  try {
    const raw = localStorage.getItem(EDITS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const custom = getStoredCustomProducts();
      const deleted = getStoredDeletedIds();
      const edits = getStoredEdits();

      let base: Product[] = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          base = parsed;
        }
      }
      if (!base.length) base = FALLBACK_PRODUCTS;

      const map = new Map<string, Product>();
      // 1. Produtos customizados criados pelo usuário têm prioridade e nunca somem
      custom.forEach(p => {
        if (!deleted.includes(p.id)) {
          map.set(p.id, p);
        }
      });
      // 2. Produtos padrão do catálogo base
      base.forEach(p => {
        if (!deleted.includes(p.id) && !map.has(p.id)) {
          const applied = edits[p.id] ? { ...p, ...edits[p.id] } : p;
          map.set(p.id, applied);
        }
      });
      return Array.from(map.values());
    } catch (_) {}
    return FALLBACK_PRODUCTS;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const persistProducts = (updated: Product[]) => {
    setProducts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('sunlab_auth_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Prioridade Máxima: Supabase (Nuvem Permanente)
      if (isSupabaseConfigured()) {
        const supaProducts = await fetchSupabaseProducts();
        if (supaProducts && supaProducts.length > 0) {
          persistProducts(supaProducts);
          setError(null);
          setLoading(false);
          return;
        }
      }

      // 2. Fallback: API local / Express / Vercel
      const res = await fetch('/api/products');
      if (res.ok) {
        const serverData: Product[] = await res.json();
        if (Array.isArray(serverData)) {
          const custom = getStoredCustomProducts();
          const deleted = getStoredDeletedIds();
          const edits = getStoredEdits();

          const map = new Map<string, Product>();
          // Produtos adicionados pelo usuário SEMPRE são mantidos e têm prioridade máxima
          custom.forEach(p => {
            if (!deleted.includes(p.id)) {
              map.set(p.id, p);
            }
          });

          // Produtos vindos da API do servidor
          serverData.forEach(p => {
            if (!deleted.includes(p.id)) {
              if (!map.has(p.id)) {
                const applied = edits[p.id] ? { ...p, ...edits[p.id] } : p;
                map.set(p.id, applied);
              }
            }
          });

          const merged = Array.from(map.values());
          persistProducts(merged);
          setError(null);

          // Se existirem produtos customizados que o backend ainda não possui (ex: reinício na Vercel),
          // sincronizar silenciosamente com o backend para manter a persistência global
          const serverIds = new Set(serverData.map(p => p.id));
          const missingOnServer = custom.filter(p => !serverIds.has(p.id) && !deleted.includes(p.id));
          if (missingOnServer.length > 0) {
            missingOnServer.forEach(async (missing) => {
              try {
                await fetch('/api/products', {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify(missing)
                });
              } catch (_) {}
            });
          }
          return;
        }
      }
    } catch (err: any) {
      console.warn('API error, usando catálogo local persistido:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (productData: Partial<Product>) => {
    const id = productData.id || `prt-${Date.now().toString(36)}`;
    const fullProduct: Product = {
      ...(productData as Product),
      id,
      slug: productData.slug || (productData.name ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : id),
      price: Number(productData.price || 0),
      inStock: productData.inStock !== false,
      featured: Boolean(productData.featured)
    };

    // 1. Salvar na lista de produtos customizados para nunca sumir
    try {
      const custom = getStoredCustomProducts();
      const updatedCustom = [fullProduct, ...custom.filter(p => p.id !== id)];
      localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updatedCustom));

      // Se estava na lista de deletados, remover
      const deleted = getStoredDeletedIds().filter(delId => delId !== id);
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(deleted));
    } catch (_) {}

    // 2. Atualização imediata no estado da aplicação e catálogo
    setProducts(prev => {
      const updated = [fullProduct, ...prev.filter(p => p.id !== id)];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    // 3. Sincronizar com Supabase se configurado
    if (isSupabaseConfigured()) {
      upsertSupabaseProduct(fullProduct).catch(() => {});
    }

    // 4. Sincronizar com o backend local / Vercel
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(fullProduct)
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, product: data };
      }
    } catch (err: any) {
      console.warn('Erro ao conectar com API para criar produto, mantido em cache local:', err);
    }
    return { success: true, product: fullProduct };
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    // 1. Salvar no Supabase se configurado
    if (isSupabaseConfigured()) {
      upsertSupabaseProduct({ ...productData, id }).catch(() => {});
    }
    // Salvar edição persistente
    try {
      const edits = getStoredEdits();
      edits[id] = { ...(edits[id] || {}), ...productData };
      localStorage.setItem(EDITS_KEY, JSON.stringify(edits));

      // Se for produto customizado, atualizar direto nele
      const custom = getStoredCustomProducts();
      const customIdx = custom.findIndex(p => p.id === id);
      if (customIdx >= 0) {
        custom[customIdx] = { ...custom[customIdx], ...productData } as Product;
        localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(custom));
      }
    } catch (_) {}

    let updatedProd: Product | undefined;
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          const u = {
            ...p,
            ...productData,
            price: productData.price !== undefined ? Number(productData.price) : p.price,
            originalPrice: productData.originalPrice !== undefined ? (productData.originalPrice ? Number(productData.originalPrice) : undefined) : p.originalPrice
          } as Product;
          updatedProd = u;
          return u;
        }
        return p;
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, product: data };
      }
    } catch (_) {}

    return { success: true, product: updatedProd };
  };

  const deleteProduct = async (id: string) => {
    // 1. Remover da lista customizada
    try {
      const custom = getStoredCustomProducts().filter(p => p.id !== id);
      localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(custom));

      // 2. Adicionar aos deletados para nunca reaparecer após fetch da API
      const deleted = Array.from(new Set([...getStoredDeletedIds(), id]));
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(deleted));
    } catch (_) {}

    // 3. Remover do catálogo
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    // 4. Remover do Supabase se configurado
    if (isSupabaseConfigured()) {
      deleteSupabaseProduct(id).catch(() => {});
    }

    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
    } catch (_) {}

    return { success: true };
  };

  const toggleProductField = async (id: string, field: 'in_stock' | 'featured' | 'bestseller' | 'new_arrival') => {
    const camelField = field === 'in_stock' ? 'inStock' :
                       field === 'new_arrival' ? 'newArrival' : field;

    let targetValue: boolean = false;
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          targetValue = !p[camelField as keyof Product];
          return {
            ...p,
            [camelField]: targetValue
          } as Product;
        }
        return p;
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    try {
      const edits = getStoredEdits();
      edits[id] = { ...(edits[id] || {}), [camelField]: targetValue };
      localStorage.setItem(EDITS_KEY, JSON.stringify(edits));

      const custom = getStoredCustomProducts();
      const customIdx = custom.findIndex(p => p.id === id);
      if (customIdx >= 0) {
        (custom[customIdx] as any)[camelField] = targetValue;
        localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(custom));
      }
    } catch (_) {}

    try {
      await fetch(`/api/products/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ field })
      });
    } catch (_) {}

    return { success: true };
  };

  const resetToDefault = async () => {
    try {
      setLoading(true);
      try {
        localStorage.removeItem(CUSTOM_PRODUCTS_KEY);
        localStorage.removeItem(DELETED_PRODUCTS_KEY);
        localStorage.removeItem(EDITS_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(FALLBACK_PRODUCTS));
      } catch (_) {}
      setProducts(FALLBACK_PRODUCTS);
      await fetch('/api/products/reset', { 
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (err) {
      console.error('Error resetting products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts: fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        toggleProductField,
        resetToDefault
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
