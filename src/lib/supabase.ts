import { createClient } from '@supabase/supabase-js';
import type { Product } from '@/data/products';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Nomes das tabelas isoladas para o SunLab (evita conflito com outros projetos)
export const PRODUCTS_TABLE = 'produtos1';
export const ORDERS_TABLE = 'pedidos1';
export const SETTINGS_TABLE = 'configuracoes1';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey.length > 20
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

// ======================== PRODUTOS ======================== //

export const fetchSupabaseProducts = async (): Promise<Product[] | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Erro ao buscar produtos:', error);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map((r: any): Product => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        tagline: r.tagline || 'Design & Fabricação 3D SunLab',
        description: r.description || '',
        story: r.story || r.description || '',
        price: Number(r.price),
        originalPrice: r.original_price ? Number(r.original_price) : undefined,
        category: (r.category || 'decor') as any,
        categoryLabel: r.category_label || (r.category === 'utility' ? 'Utilidades & Suportes' : r.category === 'tech' ? 'Tecnologia & Acessórios' : r.category === 'gifts' ? 'Presentes & Colecionáveis' : r.category === 'custom' ? 'Projetos Sob Medida' : 'Design & Decoração'),
        images: Array.isArray(r.images) ? r.images : (typeof r.images === 'string' ? JSON.parse(r.images || '[]') : []),
        colors: Array.isArray(r.colors) ? r.colors : (typeof r.colors === 'string' ? JSON.parse(r.colors || '[]') : []),
        sizes: Array.isArray(r.sizes) ? r.sizes : (typeof r.sizes === 'string' ? JSON.parse(r.sizes || '[]') : undefined),
        featured: Boolean(r.featured),
        bestseller: Boolean(r.bestseller),
        newArrival: Boolean(r.new_arrival),
        inStock: r.in_stock !== undefined ? Boolean(r.in_stock) : true,
        leadTime: r.lead_time || '2 a 4 dias úteis',
        rating: r.rating ? Number(r.rating) : 5.0,
        reviewsCount: r.reviews_count ? Number(r.reviews_count) : 0,
        specs: r.specs && typeof r.specs === 'object' ? r.specs : {
          material: r.material || 'PLA Premium Biodegradável',
          layerHeight: r.layer_height || '0.12mm (Ultra Definição)',
          dimensions: r.dimensions || 'Sob medida',
          weight: r.weight || '120g',
          infill: r.fill_density || '20% Gyroid',
          finish: 'Acabamento acetinado'
        },
        highlights: Array.isArray(r.highlights) ? r.highlights : ['Impressão 3D de alta precisão', 'Design autoral exclusivo SunLab', 'Material eco-friendly sustentável']
      }));
    }
  } catch (err) {
    console.warn('[Supabase] Falha de conexão ao buscar produtos:', err);
  }
  return null;
};

export const upsertSupabaseProduct = async (p: Partial<Product>): Promise<boolean> => {
  if (!supabase || !p.id) return false;
  try {
    const record = {
      id: p.id,
      name: p.name,
      slug: p.slug || p.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      tagline: p.tagline || 'Design & Fabricação 3D SunLab',
      description: p.description || '',
      story: p.story || p.description || '',
      price: Number(p.price) || 0,
      original_price: p.originalPrice ? Number(p.originalPrice) : null,
      category: p.category || 'decor',
      category_label: p.categoryLabel || 'Design & Decoração',
      images: p.images || [],
      colors: p.colors || [],
      sizes: p.sizes || null,
      featured: Boolean(p.featured),
      bestseller: Boolean(p.bestseller),
      new_arrival: Boolean(p.newArrival),
      in_stock: p.inStock !== undefined ? Boolean(p.inStock) : true,
      lead_time: p.leadTime || '2 a 4 dias úteis',
      rating: p.rating || 5.0,
      reviews_count: p.reviewsCount || 0,
      specs: p.specs || null,
      highlights: p.highlights || [],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from(PRODUCTS_TABLE).upsert(record, { onConflict: 'id' });
    if (error) {
      console.warn('[Supabase] Erro ao salvar produto:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Falha ao enviar produto:', err);
    return false;
  }
};

export const deleteSupabaseProduct = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq('id', id);
    if (error) {
      console.warn('[Supabase] Erro ao deletar produto:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Falha ao deletar produto:', err);
    return false;
  }
};

// ======================== PEDIDOS ======================== //

export interface SupabaseOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export const fetchSupabaseOrders = async (email?: string): Promise<SupabaseOrder[] | null> => {
  if (!supabase) return null;
  try {
    let query = supabase.from(ORDERS_TABLE).select('*').order('created_at', { ascending: false });
    if (email) {
      query = query.ilike('customer_email', email.trim());
    }
    const { data, error } = await query;
    if (error) {
      console.warn('[Supabase] Erro ao buscar pedidos:', error);
      return null;
    }
    if (data && Array.isArray(data)) {
      return data.map((r: any) => ({
        id: r.id,
        orderNumber: r.order_number,
        customerName: r.customer_name,
        customerEmail: r.customer_email,
        customerPhone: r.customer_phone || '',
        shippingAddress: r.shipping_address,
        paymentMethod: r.payment_method,
        items: Array.isArray(r.items) ? r.items : (typeof r.items === 'string' ? JSON.parse(r.items || '[]') : []),
        totalAmount: Number(r.total_amount),
        status: r.status,
        createdAt: r.created_at
      }));
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao buscar pedidos:', err);
  }
  return null;
};

export const upsertSupabaseOrder = async (order: Partial<SupabaseOrder>): Promise<boolean> => {
  if (!supabase || (!order.id && !order.orderNumber)) return false;
  try {
    const record = {
      id: order.id || `ord-${order.orderNumber || Date.now()}`,
      order_number: order.orderNumber,
      customer_name: order.customerName,
      customer_email: order.customerEmail?.toLowerCase(),
      customer_phone: order.customerPhone || '',
      shipping_address: order.shippingAddress || '',
      payment_method: order.paymentMethod || 'WhatsApp',
      items: order.items || [],
      total_amount: Number(order.totalAmount) || 0,
      status: order.status || 'Pendente',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from(ORDERS_TABLE).upsert(record, { onConflict: 'order_number' });
    if (error) {
      console.warn('[Supabase] Erro ao salvar pedido:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Falha ao enviar pedido:', err);
    return false;
  }
};

export const deleteSupabaseOrder = async (orderIdOrNumber: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from(ORDERS_TABLE)
      .delete()
      .or(`id.eq.${orderIdOrNumber},order_number.eq.${orderIdOrNumber}`);
    if (error) {
      console.warn('[Supabase] Erro ao excluir pedido:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Falha ao deletar pedido:', err);
    return false;
  }
};

// ======================== CONFIGURAÇÕES ======================== //

export const fetchSupabaseSettings = async (): Promise<Record<string, string> | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from(SETTINGS_TABLE).select('*');
    if (error) return null;
    if (data && Array.isArray(data)) {
      const settingsMap: Record<string, string> = {};
      for (const row of data) {
        settingsMap[row.key] = row.value;
      }
      return settingsMap;
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao buscar configurações:', err);
  }
  return null;
};

export const saveSupabaseSetting = async (key: string, value: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    return !error;
  } catch {
    return false;
  }
};
