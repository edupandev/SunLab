import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://uxzzsdrwhucbivzufpzv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4enpzZHJ3aHVjYml2enVmcHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyNzIxNzEsImV4cCI6MjEwOTg0ODE3MX0.JbkIw5mSmpDo7pikH1xaIZYS83cTrR8TbVKOoF7EA88';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testando conexão com Supabase...');
  
  // 1. Testar tabela produtos1
  const { data: prodData, error: prodError } = await supabase.from('produtos1').select('id, name');
  if (prodError) {
    console.error('Erro ao ler produtos1:', prodError);
  } else {
    console.log('Sucesso! Tabela produtos1 acessível. Total de produtos atuais:', prodData?.length);
  }

  // 2. Se estiver vazia, sincronizar catálogo padrão inicial
  if (!prodData || prodData.length === 0) {
    console.log('Tabela produtos1 vazia. Carregando catálogo padrão de defaultCatalog.json...');
    try {
      const defaultCatalog = JSON.parse(fs.readFileSync('api/products/defaultCatalog.json', 'utf8'));
      console.log(`Encontrados ${defaultCatalog.length} produtos para sincronizar.`);
      for (const p of defaultCatalog) {
        const record = {
          id: p.id,
          name: p.name,
          slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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
          in_stock: p.inStock !== false,
          lead_time: p.leadTime || '2 a 4 dias úteis',
          rating: p.rating || 5.0,
          reviews_count: p.reviewsCount || 0,
          specs: p.specs || null,
          highlights: p.highlights || []
        };
        const { error } = await supabase.from('produtos1').upsert(record, { onConflict: 'id' });
        if (error) console.error(`Erro ao subir ${p.name}:`, error);
      }
      console.log('Catálogo inicial sincronizado com sucesso no Supabase!');
    } catch (e) {
      console.error('Falha ao ler catálogo padrão:', e);
    }
  }

  // 3. Testar tabela pedidos1
  const { data: ordData, error: ordError } = await supabase.from('pedidos1').select('id, order_number');
  if (ordError) {
    console.error('Erro ao ler pedidos1:', ordError);
  } else {
    console.log('Sucesso! Tabela pedidos1 acessível. Total de pedidos:', ordData?.length);
  }

  // 4. Testar tabela configuracoes1
  const { data: cfgData, error: cfgError } = await supabase.from('configuracoes1').select('*');
  if (cfgError) {
    console.error('Erro ao ler configuracoes1:', cfgError);
  } else {
    console.log('Sucesso! Tabela configuracoes1 acessível. Registros:', cfgData);
  }
}

testConnection();
