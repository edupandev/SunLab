import fs from 'fs';
import path from 'path';

let defaultProducts = [];
try {
  const filePath = path.join(process.cwd(), 'api', 'products', 'defaultCatalog.json');
  if (fs.existsSync(filePath)) {
    defaultProducts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
} catch (err) {
  console.warn('[Vercel Serverless] Falha ao carregar defaultCatalog.json:', err);
}

// Global serverless memory persistence across requests
if (!global._sunlab_products || !global._sunlab_products.length) {
  global._sunlab_products = defaultProducts.length ? JSON.parse(JSON.stringify(defaultProducts)) : [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Determine path / sub-route
  let subpath = '';
  if (req.query.path) {
    subpath = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path);
  } else {
    const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
    const prodIdx = urlParts.indexOf('products');
    if (prodIdx !== -1 && urlParts.length > prodIdx + 1) {
      subpath = urlParts.slice(prodIdx + 1).join('/');
    }
  }

  // 1. POST /api/products/reset
  if (req.method === 'POST' && subpath === 'reset') {
    global._sunlab_products = JSON.parse(JSON.stringify(defaultProducts));
    return res.status(200).json(global._sunlab_products);
  }

  // 2. GET /api/products
  if (req.method === 'GET') {
    if (!subpath) {
      return res.status(200).json(global._sunlab_products);
    }
    // GET /api/products/:id
    const product = global._sunlab_products.find(p => p.id === subpath || p.slug === subpath);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    return res.status(200).json(product);
  }

  // 3. POST /api/products (Create new product)
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body.name || body.price === undefined) {
        return res.status(400).json({ error: 'Nome e preço do produto são obrigatórios.' });
      }

      const id = body.id || `prt-${Date.now().toString(36)}`;
      const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const newProduct = {
        id,
        slug,
        name: body.name,
        tagline: body.tagline || '',
        description: body.description || '',
        story: body.story || '',
        price: Number(body.price),
        originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : undefined,
        category: body.category || 'decor',
        categoryLabel: body.categoryLabel || 'Decoração',
        rating: Number(body.rating || 5.0),
        reviewsCount: Number(body.reviewsCount || 0),
        inStock: body.inStock !== false,
        leadTime: body.leadTime || '2 a 3 dias úteis',
        featured: Boolean(body.featured),
        bestseller: Boolean(body.bestseller),
        newArrival: Boolean(body.newArrival),
        images: Array.isArray(body.images) && body.images.length ? body.images : [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80'
        ],
        colors: Array.isArray(body.colors) && body.colors.length ? body.colors : [
          { name: 'Branco Neve', hex: '#f8fafc' }
        ],
        sizes: Array.isArray(body.sizes) ? body.sizes : ['Padrão'],
        specs: body.specs || {
          material: 'Bio-PLA Premium',
          layerHeight: '0.12mm',
          dimensions: '20 x 10 x 15 cm',
          weight: '180g',
          infill: '20%',
          finish: 'Fosco acetinado'
        },
        highlights: Array.isArray(body.highlights) ? body.highlights : [
          'Design exclusivo impresso em 3D',
          'Material ecológico biodegradável'
        ]
      };

      global._sunlab_products.unshift(newProduct);
      return res.status(201).json(newProduct);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao cadastrar produto.' });
    }
  }

  // 4. PATCH /api/products/:id/toggle
  if (req.method === 'PATCH' && subpath.includes('/toggle')) {
    const id = subpath.replace('/toggle', '');
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { field } = body || {};

    const idx = global._sunlab_products.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Produto não encontrado para toggle.' });
    }

    const current = global._sunlab_products[idx];
    const camelField = field === 'in_stock' ? 'inStock' :
                       field === 'new_arrival' ? 'newArrival' : field;

    current[camelField] = !current[camelField];
    global._sunlab_products[idx] = current;
    return res.status(200).json(current);
  }

  // 5. PUT /api/products/:id (Update product details & PRICE)
  if (req.method === 'PUT') {
    const id = subpath;
    if (!id) {
      return res.status(400).json({ error: 'ID do produto não informado para atualização.' });
    }

    const idx = global._sunlab_products.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Produto não encontrado para atualização.' });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const existing = global._sunlab_products[idx];

      const updated = {
        ...existing,
        ...body,
        id: existing.id, // Preservar ID
        price: body.price !== undefined ? Number(body.price) : existing.price,
        originalPrice: body.originalPrice !== undefined ? (body.originalPrice ? Number(body.originalPrice) : undefined) : existing.originalPrice,
        inStock: body.inStock !== undefined ? Boolean(body.inStock) : existing.inStock,
        featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
        bestseller: body.bestseller !== undefined ? Boolean(body.bestseller) : existing.bestseller,
        newArrival: body.newArrival !== undefined ? Boolean(body.newArrival) : existing.newArrival
      };

      global._sunlab_products[idx] = updated;
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao processar dados de atualização do produto.' });
    }
  }

  // 6. DELETE /api/products/:id
  if (req.method === 'DELETE') {
    const id = subpath;
    const initialLen = global._sunlab_products.length;
    global._sunlab_products = global._sunlab_products.filter(p => p.id !== id);

    if (global._sunlab_products.length === initialLen) {
      return res.status(404).json({ error: 'Produto não encontrado para remoção.' });
    }
    return res.status(200).json({ success: true, message: 'Produto removido com sucesso.' });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
