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

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (!res.ok) {
        throw new Error('Falha ao obter produtos do servidor.');
      }
      const data: Product[] = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        setError(null);
      }
    } catch (err: any) {
      console.warn('API error, using initial dataset:', err.message);
      // Keep fallback products
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
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao criar produto.' };
      }
      setProducts(prev => [data, ...prev]);
      return { success: true, product: data };
    } catch (err: any) {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao atualizar produto.' };
      }
      setProducts(prev => prev.map(p => p.id === id ? data : p));
      return { success: true, product: data };
    } catch (err: any) {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao excluir produto.' };
      }
      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  const toggleProductField = async (id: string, field: 'in_stock' | 'featured' | 'bestseller' | 'new_arrival') => {
    try {
      const res = await fetch(`/api/products/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ field })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao alternar status.' };
      }
      setProducts(prev => prev.map(p => p.id === id ? data : p));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  const resetToDefault = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products/reset', { 
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
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
