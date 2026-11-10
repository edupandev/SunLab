-- ====================================================================
-- SunLab 3D - Script SQL de Configuração do Banco de Dados no Supabase
-- Cole e execute este script no "SQL Editor" do seu painel Supabase.
-- ====================================================================

-- 1. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  category TEXT NOT NULL DEFAULT 'Decoração',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  bestseller BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  dimensions TEXT,
  print_time TEXT,
  layer_height TEXT,
  material TEXT,
  weight TEXT,
  fill_density TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  shipping_address TEXT DEFAULT '',
  payment_method TEXT DEFAULT 'WhatsApp (A Combinar)',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE CONFIGURAÇÕES GERAIS (WhatsApp, Pix, Loja)
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ÍNDICES DE ALTA VELOCIDADE
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- 5. HABILITAR ROW LEVEL SECURITY (RLS) COM POLÍTICAS DE ACESSO
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas de Produtos (Leitura pública, inserção/edição permitida)
CREATE POLICY "Permitir leitura pública de produtos" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção e atualização de produtos" ON public.products
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas de Pedidos (Leitura e criação pública/cliente)
CREATE POLICY "Permitir leitura de pedidos" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção e atualização de pedidos" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas de Configurações
CREATE POLICY "Permitir leitura de configurações" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Permitir atualização de configurações" ON public.settings
  FOR ALL USING (true) WITH CHECK (true);

-- 6. CONFIGURAÇÕES INICIAIS DA SUNLAB
INSERT INTO public.settings (key, value) VALUES
  ('store_whatsapp', '5513996061681'),
  ('pix_key', '13996061681'),
  ('pix_key_type', 'TELEFONE'),
  ('pix_merchant_name', 'SunLab 3D Studio'),
  ('pix_merchant_city', 'Santos')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
