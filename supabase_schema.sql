-- ====================================================================
-- SunLab 3D - Script SQL de Configuração do Banco de Dados no Supabase
-- Tabelas isoladas: produtos1, pedidos1, configuracoes1
-- (Não conflita com nenhum outro projeto já existente no mesmo banco)
-- ====================================================================

-- 1. TABELA DE PRODUTOS (produtos1)
CREATE TABLE IF NOT EXISTS public.produtos1 (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tagline TEXT DEFAULT 'Design & Fabricação 3D SunLab',
  description TEXT DEFAULT '',
  story TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  category TEXT NOT NULL DEFAULT 'decor',
  category_label TEXT DEFAULT 'Design & Decoração',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  bestseller BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  lead_time TEXT DEFAULT '2 a 4 dias úteis',
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  specs JSONB,
  highlights JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE PEDIDOS (pedidos1)
CREATE TABLE IF NOT EXISTS public.pedidos1 (
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

-- 3. TABELA DE CONFIGURAÇÕES (configuracoes1)
CREATE TABLE IF NOT EXISTS public.configuracoes1 (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_produtos1_category ON public.produtos1(category);
CREATE INDEX IF NOT EXISTS idx_produtos1_slug ON public.produtos1(slug);
CREATE INDEX IF NOT EXISTS idx_pedidos1_email ON public.pedidos1(customer_email);
CREATE INDEX IF NOT EXISTS idx_pedidos1_number ON public.pedidos1(order_number);

-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.produtos1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes1 ENABLE ROW LEVEL SECURITY;

-- Limpar policies anteriores para evitar erro 42710 (policy already exists)
DROP POLICY IF EXISTS "Acesso produtos1" ON public.produtos1;
DROP POLICY IF EXISTS "Acesso pedidos1" ON public.pedidos1;
DROP POLICY IF EXISTS "Acesso configuracoes1" ON public.configuracoes1;

-- Criar policies com permissão total para a aplicação
CREATE POLICY "Acesso produtos1" ON public.produtos1 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso pedidos1" ON public.pedidos1 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso configuracoes1" ON public.configuracoes1 FOR ALL USING (true) WITH CHECK (true);

-- 6. CONFIGURAÇÕES INICIAIS SUNLAB (WhatsApp e Pix)
INSERT INTO public.configuracoes1 (key, value) VALUES
  ('store_whatsapp', '5513996061681'),
  ('pix_key', '13996061681'),
  ('pix_key_type', 'TELEFONE'),
  ('pix_merchant_name', 'SunLab 3D Studio'),
  ('pix_merchant_city', 'Santos')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
