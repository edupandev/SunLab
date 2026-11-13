import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://uxzzsdrwhucbivzufpzv.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4enpzZHJ3aHVjYml2enVmcHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyNzIxNzEsImV4cCI6MjEwOTg0ODE3MX0.JbkIw5mSmpDo7pikH1xaIZYS83cTrR8TbVKOoF7EA88';

const PRINT3D_API_KEY =
  process.env.PRINT3D_API_KEY ||
  'slb_p3d_6ada07c6ac6ef63b19d4e63efc337cd52e879a778239b90a';

const PRODUCTS_TABLE = 'produtos1';

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  const apiKeyHeader = req.headers['x-api-key'] || req.headers['X-Api-Key'];
  if (typeof apiKeyHeader === 'string') {
    return apiKeyHeader.trim();
  }
  return '';
}

function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function mapCategory(rawCategory) {
  const cat = String(rawCategory || '').toLowerCase();
  if (cat.includes('kit') || cat.includes('geek') || cat.includes('presente') || cat.includes('lembran')) {
    return 'gifts';
  }
  if (cat.includes('util') || cat.includes('suporte') || cat.includes('organiz')) {
    return 'utility';
  }
  if (cat.includes('tech') || cat.includes('nfc') || cat.includes('acess')) {
    return 'tech';
  }
  if (cat.includes('custom') || cat.includes('sob medida') || cat.includes('personaliz')) {
    return 'custom';
  }
  return 'decor';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Api-Key, X-Requested-With, Accept'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método não permitido. Use POST.' });
  }

  // Autenticação via Bearer Token ou X-Api-Key
  const providedToken = extractToken(req);
  if (!providedToken || !safeCompare(providedToken, PRINT3D_API_KEY)) {
    return res.status(401).json({ ok: false, error: 'Não autorizado. Token inválido ou ausente.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ ok: false, error: 'Payload JSON inválido.' });
    }

    const id = String(body.id || '').trim();
    const title = String(body.title || body.name || '').trim();
    const price = Number(body.price);

    if (!id) {
      return res.status(400).json({ ok: false, error: 'Campo "id" é obrigatório.' });
    }
    if (!title) {
      return res.status(400).json({ ok: false, error: 'Campo "title" é obrigatório.' });
    }
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ ok: false, error: 'Campo "price" inválido.' });
    }

    const regularPrice =
      body.regular_price !== undefined && body.regular_price !== null
        ? Number(body.regular_price)
        : null;
    const originalPrice =
      regularPrice !== null && Number.isFinite(regularPrice) && regularPrice > price
        ? regularPrice
        : null;

    const description = String(body.description || '').trim();
    const baseSlug = slugify(title) || slugify(id);
    const slug = baseSlug;

    const rawImages = Array.isArray(body.images) && body.images.length > 0
      ? body.images.filter(Boolean)
      : body.image
        ? [String(body.image)]
        : [];
    const images = rawImages.length > 0 ? rawImages : ['/sunlab-sobre.jpg'];

    const kitItems = Array.isArray(body.items)
      ? body.items
          .filter((it) => it && it.name)
          .map((it) => ({
            name: String(it.name).trim(),
            qty: Number(it.qty) > 0 ? Number(it.qty) : 1
          }))
      : [];

    const tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean) : [];
    const categoryLabel = String(
      body.category || (body.type === 'kit' ? 'Kits' : 'Design & Decoração')
    ).trim();

    const record = {
      id,
      name: title,
      slug,
      tagline: description ? description.slice(0, 140) : `${categoryLabel} • SunLab 3D`,
      description,
      story: description,
      price,
      original_price: originalPrice,
      category: mapCategory(body.category || (body.type === 'kit' ? 'kit' : '')),
      category_label: categoryLabel,
      images,
      colors: [],
      sizes: [],
      featured: true,
      bestseller: false,
      new_arrival: true,
      in_stock: true,
      lead_time: '2 a 4 dias úteis',
      rating: 5.0,
      reviews_count: 0,
      specs: {
        material: tags.length ? tags[0] : 'Impressão 3D',
        layerHeight: 'Alta Definição',
        dimensions: 'Padrão',
        weight: body.weight_grams ? `${Number(body.weight_grams)}g` : 'Sob consulta',
        infill: 'Reforçado',
        finish: 'Acabamento SunLab',
        type: body.type === 'kit' ? 'kit' : 'product',
        sku: body.code ? String(body.code).trim() : '',
        printTimeHours: body.print_time_hours ? Number(body.print_time_hours) : null,
        cost: body.cost ? Number(body.cost) : null,
        tags,
        kitItems
      },
      highlights: tags,
      updated_at: new Date().toISOString()
    };

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { error } = await supabase
      .from(PRODUCTS_TABLE)
      .upsert(record, { onConflict: 'id' });

    if (error) {
      console.error('[Print3D Webhook] Erro ao salvar no Supabase:', error);
      return res.status(500).json({
        ok: false,
        error: 'Erro ao salvar produto no banco de dados.',
        details: error.message
      });
    }

    // Atualiza cache em memória caso exista na mesma instância serverless
    if (Array.isArray(global._sunlab_products)) {
      const frontendProduct = {
        id: record.id,
        name: record.name,
        slug: record.slug,
        tagline: record.tagline,
        description: record.description,
        story: record.story,
        price: record.price,
        originalPrice: record.original_price ?? undefined,
        category: record.category,
        categoryLabel: record.category_label,
        images: record.images,
        colors: record.colors,
        sizes: record.sizes,
        featured: record.featured,
        bestseller: record.bestseller,
        newArrival: record.new_arrival,
        inStock: record.in_stock,
        leadTime: record.lead_time,
        rating: record.rating,
        reviewsCount: record.reviews_count,
        specs: record.specs,
        highlights: record.highlights
      };
      const existingIdx = global._sunlab_products.findIndex((p) => p.id === record.id);
      if (existingIdx !== -1) {
        global._sunlab_products[existingIdx] = frontendProduct;
      } else {
        global._sunlab_products.unshift(frontendProduct);
      }
    }

    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'sunlab-brown.vercel.app';
    const productUrl = `${proto}://${host}/product/${slug}`;

    return res.status(200).json({
      ok: true,
      message: 'Produto publicado com sucesso',
      url: productUrl
    });
  } catch (err) {
    console.error('[Print3D Webhook] Erro inesperado:', err);
    return res.status(500).json({ ok: false, error: 'Erro interno ao processar webhook.' });
  }
}
