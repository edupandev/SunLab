import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/data/products';
import { PRODUCTS as FALLBACK_PRODUCTS } from '@/data/products';

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

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data: Product[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          persistProducts(data);
          setError(null);
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('sunlab_auth_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

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

    // Atualização otimista imediata no catálogo
    persistProducts([fullProduct, ...products]);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(fullProduct)
      });
      if (res.ok) {
        const data = await res.json();
        persistProducts([data, ...products.filter(p => p.id !== id)]);
        return { success: true, product: data };
      }
    } catch (err: any) {
      console.warn('Erro ao conectar com API para criar produto, mantido em cache:', err);
    }
    return { success: true, product: fullProduct };
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    // Atualização imediata do preço e campos na memória e no localStorage
    const updatedList = products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...productData,
          price: productData.price !== undefined ? Number(productData.price) : p.price,
          originalPrice: productData.originalPrice !== undefined ? (productData.originalPrice ? Number(productData.originalPrice) : undefined) : p.originalPrice
        } as Product;
      }
      return p;
    });

    persistProducts(updatedList);
    const updatedProd = updatedList.find(p => p.id === id);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        const data = await res.json();
        persistProducts(products.map(p => p.id === id ? data : p));
        return { success: true, product: data };
      }
    } catch (err: any) {
      console.warn('Erro ao sincronizar atualização no backend, mantido em cache local:', err);
    }
    return { success: true, product: updatedProd };
  };

  const deleteProduct = async (id: string) => {
    const updatedList = products.filter(p => p.id !== id);
    persistProducts(updatedList);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Erro ao deletar produto no backend:', err);
    }
    return { success: true };
  };

  const toggleProductField = async (id: string, field: 'in_stock' | 'featured' | 'bestseller' | 'new_arrival') => {
    const camelField = field === 'in_stock' ? 'inStock' :
                       field === 'new_arrival' ? 'newArrival' : field;

    const updatedList = products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          [camelField]: !p[camelField as keyof Product]
        } as Product;
      }
      return p;
    });
    persistProducts(updatedList);

    try {
      const res = await fetch(`/api/products/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ field })
      });
      if (res.ok) {
        const data = await res.json();
        persistProducts(products.map(p => p.id === id ? data : p));
      }
    } catch (err: any) {
      console.warn('Erro ao alternar campo no backend:', err);
    }
    return { success: true };
  };

  const resetToDefault = async () => {
    try {
      setLoading(true);
      persistProducts(FALLBACK_PRODUCTS);
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
