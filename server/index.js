import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import db, { initDatabase, seedInitialProducts } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

// Setup Uploads Directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `sunlab-${cleanName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve Uploaded Files
app.use('/uploads', express.static(uploadsDir));

// Helper to format product from DB row to frontend Product interface
function formatProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    story: row.story || '',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    category: row.category,
    categoryLabel: row.category_label,
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || 0),
    inStock: Boolean(row.in_stock),
    leadTime: row.lead_time || '2 a 3 dias úteis',
    featured: Boolean(row.featured),
    bestseller: Boolean(row.bestseller),
    newArrival: Boolean(row.new_arrival),
    images: JSON.parse(row.images_json || '[]'),
    colors: JSON.parse(row.colors_json || '[]'),
    sizes: row.sizes_json ? JSON.parse(row.sizes_json) : undefined,
    specs: JSON.parse(row.specs_json || '{}'),
    highlights: JSON.parse(row.highlights_json || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// ---------------- FILE UPLOAD ROUTES ---------------- //

// Upload multiple or single image files
app.post('/api/upload', upload.array('photos', 10), (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const urls = files.map(file => `/uploads/${file.filename}`);
    return res.json({ success: true, urls });
  } catch (err) {
    console.error('Error uploading files:', err);
    return res.status(500).json({ error: 'Erro ao processar upload de arquivo.' });
  }
});

// Upload base64 image (direct canvas/drag-drop data-uri)
app.post('/api/upload-base64', (req, res) => {
  try {
    const { base64, filename } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'Dados base64 ausentes.' });
    }

    // Extract mime type and data
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Formato base64 inválido.' });
    }

    const mime = matches[1];
    const data = Buffer.from(matches[2], 'base64');
    let ext = '.jpg';
    if (mime.includes('png')) ext = '.png';
    else if (mime.includes('webp')) ext = '.webp';
    else if (mime.includes('svg')) ext = '.svg';

    const safeName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '') : 'img';
    const uniqueFile = `sunlab-${safeName}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFile);

    fs.writeFileSync(filePath, data);

    return res.json({
      success: true,
      url: `/uploads/${uniqueFile}`
    });
  } catch (err) {
    console.error('Error saving base64 image:', err);
    return res.status(500).json({ error: 'Erro ao salvar imagem.' });
  }
});

// ---------------- LOGINSRV JWT ARCHITECTURE (qvest-digital/loginsrv) ---------------- //

const JWT_SECRET = process.env.JWT_SECRET || 'sunlab-loginsrv-jwt-secret-key-2026';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Issue RFC 7519 JWT Token following qvest-digital/loginsrv specification
function issueLoginsrvJWT(user) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    roles: [user.role],
    origin: 'sqlite',
    iat: now,
    exp: now + 7 * 24 * 3600 // 7 days
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return {
    token: `${encodedHeader}.${encodedPayload}.${signature}`,
    claims: payload
  };
}

// Verify RFC 7519 JWT Token
function verifyLoginsrvJWT(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

// loginsrv metadata & status endpoint
app.get('/api/loginsrv/info', (_req, res) => {
  return res.json({
    service: 'loginsrv',
    repository: 'https://github.com/qvest-digital/loginsrv',
    jwtAlgorithm: 'HS256',
    tokenExpiration: '7 days',
    backends: ['sqlite', 'oauth2']
  });
});

// Helper login handler shared between /api/login and /api/auth/login
function handleLoginsrvLogin(req, res) {
  const emailInput = req.body.email || req.body.username;
  const passwordInput = req.body.password;

  if (!emailInput || !passwordInput) {
    return res.status(400).json({ error: 'E-mail (ou usuário) e senha são obrigatórios.' });
  }

  const cleanEmail = String(emailInput).trim().toLowerCase();
  const user = db.prepare('SELECT id, name, email, password, role FROM users WHERE LOWER(email) = ?').get(cleanEmail);

  if (!user) {
    return res.status(401).json({
      error: 'Usuário não cadastrado. Verifique o e-mail digitado ou crie uma conta na aba "Criar Conta".'
    });
  }

  if (user.password !== passwordInput) {
    return res.status(401).json({
      error: 'Senha incorreta para esta conta. Verifique sua senha e tente novamente.'
    });
  }

  // Issue cryptographic RFC 7519 JWT Token (loginsrv standard)
  const { token, claims } = issueLoginsrvJWT(user);

  // Set HTTP cookie matching loginsrv standard
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 3600 * 1000
  });

  return res.json({
    success: true,
    service: 'loginsrv',
    token,
    user: {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: claims.roles,
      origin: claims.origin
    }
  });
}

// loginsrv official login endpoint
app.post('/api/login', handleLoginsrvLogin);
app.post('/api/auth/login', handleLoginsrvLogin);

// loginsrv official userinfo endpoint
function handleLoginsrvUserInfo(req, res) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '').trim();
  }

  if (!token) {
    return res.status(401).json({ error: 'Token JWT não fornecido. Faça login para continuar.' });
  }

  const claims = verifyLoginsrvJWT(token);
  if (!claims || !claims.sub) {
    return res.status(401).json({ error: 'Token JWT inválido ou expirado.' });
  }

  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(claims.sub);
  if (!user) {
    return res.status(401).json({ error: 'Usuário do token não encontrado no banco de dados.' });
  }

  return res.json({
    user: {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: claims.roles,
      origin: claims.origin
    }
  });
}

app.get('/api/userinfo', handleLoginsrvUserInfo);
app.get('/api/auth/me', handleLoginsrvUserInfo);

// loginsrv logout endpoint
app.get('/api/logout', (_req, res) => {
  res.clearCookie('jwt');
  res.clearCookie('jwt_token');
  return res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

// Cadastrar novo usuário (Registro seguro no banco SQLite)
function handleLoginsrvRegister(req, res) {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Nome deve ter no mínimo 2 caracteres.' });
  }

  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
  }

  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'A senha deve conter no mínimo 4 caracteres.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check if user already exists
  const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
  if (existingUser) {
    return res.status(409).json({ error: 'Este e-mail já está cadastrado no sistema. Faça login com sua senha.' });
  }

  // Create new user in SQLite
  const newUserId = `usr-${Date.now()}-${Math.round(Math.random() * 1e4)}`;
  db.prepare(`
    INSERT INTO users (id, name, email, password, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(newUserId, name.trim(), cleanEmail, password, 'customer');

  const newUser = {
    id: newUserId,
    name: name.trim(),
    email: cleanEmail,
    role: 'customer'
  };

  const { token, claims } = issueLoginsrvJWT(newUser);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 3600 * 1000
  });

  return res.status(201).json({
    success: true,
    service: 'loginsrv',
    token,
    user: {
      sub: newUserId,
      id: newUserId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      roles: claims.roles,
      origin: claims.origin
    }
  });
}

app.post('/api/register', handleLoginsrvRegister);
app.post('/api/auth/register', handleLoginsrvRegister);

// OAuth Handler (loginsrv OAuth backend)
app.post('/api/auth/login-with/:provider', (req, res) => {
  try {
    const { provider } = req.params;
    const { email, name, avatar } = req.body || {};

    const validProviders = ['google', 'github', 'apple', 'twitter'];
    if (!validProviders.includes(provider.toLowerCase())) {
      return res.status(400).json({ error: `Provedor '${provider}' não suportado.` });
    }

    // Default profiles if not explicitly passed by client
    const defaultProfiles = {
      google: {
        name: name || 'Usuário Google',
        email: email || 'usuario.google@gmail.com',
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      },
      github: {
        name: name || 'Desenvolvedor GitHub',
        email: email || 'dev.github@sunlab.com.br',
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      },
      apple: {
        name: name || 'Usuário Apple ID',
        email: email || 'usuario.apple@icloud.com',
        avatar: avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
      },
      twitter: {
        name: name || 'Usuário X/Twitter',
        email: email || 'usuario.x@sunlab.com.br',
        avatar: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      }
    };

    const chosenProfile = defaultProfiles[provider.toLowerCase()] || {
      name: name || `Usuário ${provider}`,
      email: email || `${provider}.user@sunlab.com.br`,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    };

    const cleanEmail = chosenProfile.email.trim().toLowerCase();

    // Check if user already exists in SQLite
    let userRow = db.prepare('SELECT id, name, email, role FROM users WHERE LOWER(email) = ?').get(cleanEmail);

    if (!userRow) {
      const role = cleanEmail === 'admin@sunlab.com.br' ? 'admin' : 'customer';
      const newId = `usr-${provider}-${Date.now()}`;
      
      db.prepare(`
        INSERT INTO users (id, name, email, password, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(newId, chosenProfile.name, cleanEmail, `oauth_${provider}_${Date.now()}`, role);

      userRow = {
        id: newId,
        name: chosenProfile.name,
        email: cleanEmail,
        role
      };
    }

    // Issue cryptographic RFC 7519 JWT Token (loginsrv standard)
    const { token, claims } = issueLoginsrvJWT({
      ...userRow,
      origin: provider.toLowerCase()
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600 * 1000
    });

    return res.json({
      success: true,
      service: 'loginsrv',
      provider: provider.toLowerCase(),
      token,
      user: {
        sub: userRow.id,
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        role: userRow.role,
        roles: claims.roles,
        avatar: chosenProfile.avatar,
        origin: provider.toLowerCase()
      }
    });
  } catch (err) {
    console.error('Error handling login-with:', err);
    return res.status(500).json({ error: 'Erro ao processar login social.' });
  }
});

// ---------------- PRODUCTS ROUTES ---------------- //

// GET all products
app.get('/api/products', (req, res) => {
  try {
    const { category, search, inStock, featured } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (inStock === 'true') {
      query += ' AND in_stock = 1';
    }
    if (featured === 'true') {
      query += ' AND featured = 1';
    }
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR tagline LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY featured DESC, created_at DESC';

    const rows = db.prepare(query).all(...params);
    const products = rows.map(formatProduct);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Erro ao carregar produtos do banco de dados.' });
  }
});

// GET product by ID or Slug
app.get('/api/products/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const row = db.prepare('SELECT * FROM products WHERE id = ? OR slug = ?').get(idOrSlug, idOrSlug);
    if (!row) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    res.json(formatProduct(row));
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Erro ao buscar produto.' });
  }
});

// POST create product
app.post('/api/products', (req, res) => {
  try {
    const p = req.body;
    if (!p.name || p.price === undefined || !p.category) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes (name, price, category).' });
    }

    const id = p.id || `wvk-${Date.now().toString(36)}`;
    const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const images_json = JSON.stringify(Array.isArray(p.images) && p.images.length ? p.images : [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80'
    ]);

    const colors_json = JSON.stringify(Array.isArray(p.colors) && p.colors.length ? p.colors : [
      { name: 'Onyx Black', hex: '#121214' }
    ]);

    const sizes_json = p.sizes ? JSON.stringify(p.sizes) : null;
    const specs_json = JSON.stringify(p.specs || {
      material: 'PLA Mineral Bio-composto',
      layerHeight: '0.12 mm',
      dimensions: '150 x 150 x 200 mm',
      weight: '300g',
      infill: '25% Gyroid',
      finish: 'Acetinado mate'
    });
    const highlights_json = JSON.stringify(Array.isArray(p.highlights) ? p.highlights : [
      'Fabricação aditiva de alta precisão SunLab',
      'Filamento sustentável biodegradável'
    ]);

    const category_label = p.categoryLabel || (
      p.category === 'decor' ? 'Decoração' :
      p.category === 'utility' ? 'Utilitários' :
      p.category === 'tech' ? 'Tecnologia' :
      p.category === 'gifts' ? 'Presentes' : 'Personalizados'
    );

    const stmt = db.prepare(`
      INSERT INTO products (
        id, slug, name, tagline, description, story, price, original_price,
        category, category_label, rating, reviews_count, in_stock, lead_time,
        featured, bestseller, new_arrival, images_json, colors_json, sizes_json,
        specs_json, highlights_json, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);

    stmt.run(
      id,
      slug,
      p.name,
      p.tagline || '',
      p.description || '',
      p.story || '',
      Number(p.price),
      p.originalPrice ? Number(p.originalPrice) : null,
      p.category,
      category_label,
      Number(p.rating || 5.0),
      Number(p.reviewsCount || 0),
      p.inStock ? 1 : 0,
      p.leadTime || '2 a 3 dias úteis',
      p.featured ? 1 : 0,
      p.bestseller ? 1 : 0,
      p.newArrival ? 1 : 0,
      images_json,
      colors_json,
      sizes_json,
      specs_json,
      highlights_json
    );

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return res.status(201).json(formatProduct(created));
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ error: 'Erro ao criar produto: ' + err.message });
  }
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Produto não encontrado para edição.' });
    }

    const slug = p.slug || existing.slug;
    const category_label = p.categoryLabel || existing.category_label;
    const images_json = p.images ? JSON.stringify(p.images) : existing.images_json;
    const colors_json = p.colors ? JSON.stringify(p.colors) : existing.colors_json;
    const sizes_json = p.sizes ? JSON.stringify(p.sizes) : existing.sizes_json;
    const specs_json = p.specs ? JSON.stringify(p.specs) : existing.specs_json;
    const highlights_json = p.highlights ? JSON.stringify(p.highlights) : existing.highlights_json;

    const stmt = db.prepare(`
      UPDATE products SET
        slug = ?,
        name = ?,
        tagline = ?,
        description = ?,
        story = ?,
        price = ?,
        original_price = ?,
        category = ?,
        category_label = ?,
        rating = ?,
        reviews_count = ?,
        in_stock = ?,
        lead_time = ?,
        featured = ?,
        bestseller = ?,
        new_arrival = ?,
        images_json = ?,
        colors_json = ?,
        sizes_json = ?,
        specs_json = ?,
        highlights_json = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      slug,
      p.name !== undefined ? p.name : existing.name,
      p.tagline !== undefined ? p.tagline : existing.tagline,
      p.description !== undefined ? p.description : existing.description,
      p.story !== undefined ? p.story : existing.story,
      p.price !== undefined ? Number(p.price) : existing.price,
      p.originalPrice !== undefined ? (p.originalPrice ? Number(p.originalPrice) : null) : existing.original_price,
      p.category !== undefined ? p.category : existing.category,
      category_label,
      p.rating !== undefined ? Number(p.rating) : existing.rating,
      p.reviewsCount !== undefined ? Number(p.reviewsCount) : existing.reviews_count,
      p.inStock !== undefined ? (p.inStock ? 1 : 0) : existing.in_stock,
      p.leadTime !== undefined ? p.leadTime : existing.lead_time,
      p.featured !== undefined ? (p.featured ? 1 : 0) : existing.featured,
      p.bestseller !== undefined ? (p.bestseller ? 1 : 0) : existing.bestseller,
      p.newArrival !== undefined ? (p.newArrival ? 1 : 0) : existing.new_arrival,
      images_json,
      colors_json,
      sizes_json,
      specs_json,
      highlights_json,
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return res.json(formatProduct(updated));
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ error: 'Erro ao atualizar produto: ' + err.message });
  }
});

// PATCH toggle status (quick toggle in stock, featured, bestseller)
app.patch('/api/products/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const { field } = req.body; // 'in_stock', 'featured', 'bestseller', 'new_arrival'

    const validFields = ['in_stock', 'featured', 'bestseller', 'new_arrival'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ error: 'Campo inválido para toggle.' });
    }

    const current = db.prepare(`SELECT ${field} FROM products WHERE id = ?`).get(id);
    if (!current) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    const newValue = current[field] === 1 ? 0 : 1;
    db.prepare(`UPDATE products SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newValue, id);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return res.json(formatProduct(updated));
  } catch (err) {
    console.error('Error toggling status:', err);
    return res.status(500).json({ error: 'Erro ao alternar status do produto.' });
  }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Produto não encontrado para remoção.' });
    }
    return res.json({ success: true, message: 'Produto removido com sucesso.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ error: 'Erro ao remover produto do banco de dados.' });
  }
});

// RESET to factory default catalog
app.post('/api/products/reset', (req, res) => {
  try {
    db.prepare('DELETE FROM products').run();
    seedInitialProducts();
    const rows = db.prepare('SELECT * FROM products ORDER BY featured DESC').all();
    return res.json(rows.map(formatProduct));
  } catch (err) {
    console.error('Error resetting products:', err);
    return res.status(500).json({ error: 'Erro ao resetar produtos.' });
  }
});

// GET admin metrics / stats
app.get('/api/admin/stats', (req, res) => {
  try {
    const totalRow = db.prepare('SELECT COUNT(*) as total FROM products').get();
    const featuredRow = db.prepare('SELECT COUNT(*) as featured FROM products WHERE featured = 1').get();
    const bestsellerRow = db.prepare('SELECT COUNT(*) as bestsellers FROM products WHERE bestseller = 1').get();
    const outOfStockRow = db.prepare('SELECT COUNT(*) as outOfStock FROM products WHERE in_stock = 0').get();
    const avgPriceRow = db.prepare('SELECT AVG(price) as avgPrice FROM products WHERE price > 0').get();

    return res.json({
      total: totalRow.total,
      featured: featuredRow.featured,
      bestsellers: bestsellerRow.bestsellers,
      outOfStock: outOfStockRow.outOfStock,
      avgPrice: avgPriceRow.avgPrice ? Number(avgPriceRow.avgPrice.toFixed(2)) : 0
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({ error: 'Erro ao calcular estatísticas.' });
  }
});

// ---------------- ORDERS MANAGEMENT (E-COMMERCE 2.5) ---------------- //

// GET all orders with optional filter by email, orderNumber or search query
app.get('/api/orders', (req, res) => {
  try {
    const { email, orderNumber, search } = req.query;
    let query = 'SELECT * FROM orders';
    const params = [];
    const conditions = [];

    if (orderNumber) {
      conditions.push('order_number = ?');
      params.push(orderNumber);
    }
    if (email) {
      conditions.push('LOWER(customer_email) = LOWER(?)');
      params.push(email);
    }
    if (search) {
      conditions.push('(order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ? OR items_json LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params);
    const formatted = rows.map(r => ({
      id: r.id,
      orderNumber: r.order_number,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      customerPhone: r.customer_phone || '',
      shippingAddress: r.shipping_address,
      paymentMethod: r.payment_method,
      items: JSON.parse(r.items_json || '[]'),
      totalAmount: Number(r.total_amount),
      status: r.status,
      createdAt: r.created_at
    }));
    return res.json(formatted);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
  }
});

// POST create new order
app.post('/api/orders', (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      items,
      totalAmount
    } = req.body;

    if (!customerName || !customerEmail || !shippingAddress || !totalAmount) {
      return res.status(400).json({ error: 'Dados obrigatórios do pedido ausentes.' });
    }

    const id = `ord-${Date.now()}`;
    const orderNumber = `SLB-${Math.floor(100000 + Math.random() * 900000)}`;

    db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone,
        shipping_address, payment_method, items_json, total_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone || '',
      shippingAddress,
      paymentMethod || 'Pix Instantâneo',
      JSON.stringify(items || []),
      Number(totalAmount),
      'Pendente'
    );

    return res.status(201).json({
      success: true,
      id,
      orderNumber,
      message: 'Pedido registrado com sucesso no banco de dados!'
    });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ error: 'Erro ao registrar pedido.' });
  }
});

// ---------------- MERCADO PAGO GATEWAY (Kauanrodrigues01/checkout-mercado-pago) ---------------- //

app.post('/api/payments/mercado-pago/checkout', (req, res) => {
  try {
    const {
      paymentMethod, // 'pix' | 'card' | 'boleto'
      amount,
      payer, // { name, email, cpf, phone }
      shippingAddress,
      cardData, // { number, holder, expiry, cvv, installments }
      items
    } = req.body;

    if (!paymentMethod || !amount || !payer?.email || !payer?.name) {
      return res.status(400).json({ error: 'Dados obrigatórios do checkout ausentes.' });
    }

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `SLB-${Math.floor(100000 + Math.random() * 900000)}`;
    const mpPaymentId = Math.floor(10000000000 + Math.random() * 90000000000);

    let paymentMethodLabel = '';
    let status = 'approved';
    let statusDetail = 'accredited';
    let qrCode = null;
    let qrCodeBase64 = null;
    let ticketUrl = null;
    let barcode = null;

    if (paymentMethod === 'pix') {
      paymentMethodLabel = 'Mercado Pago (Pix Instantâneo 5% OFF)';
      qrCode = `00020126580014BR.GOV.BCB.PIX0136mp-pix-${mpPaymentId}@sunlab.com.br5204000053039865406${Number(amount).toFixed(2)}5802BR5920SunLab Design 3D6009Sao Paulo62070503***6304`;
      qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`;
      ticketUrl = `https://www.mercadopago.com.br/payments/${mpPaymentId}/ticket`;
    } else if (paymentMethod === 'card') {
      const installments = cardData?.installments || '1';
      paymentMethodLabel = `Mercado Pago (Cartão de Crédito ${installments}x)`;
      status = 'approved';
      statusDetail = 'accredited';
    } else if (paymentMethod === 'boleto') {
      paymentMethodLabel = 'Mercado Pago (Boleto Bancário)';
      status = 'pending';
      statusDetail = 'pending_waiting_payment';
      barcode = `23793.38128 60083.013528 56006.333306 8 ${Math.floor(10000000000000 + Math.random() * 90000000000000)}`;
      ticketUrl = `https://www.mercadopago.com.br/payments/${mpPaymentId}/ticket`;
    }

    // Persistir pedido diretamente na tabela SQLite
    db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone,
        shipping_address, payment_method, items_json, total_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      orderNumber,
      payer.name,
      payer.email,
      payer.phone || '',
      shippingAddress || 'Endereço informado no checkout',
      paymentMethodLabel,
      JSON.stringify(items || []),
      Number(amount),
      status === 'approved' ? 'Em Produção 3D' : 'Pendente'
    );

    return res.status(200).json({
      success: true,
      mpPaymentId: String(mpPaymentId),
      orderId,
      orderNumber,
      status,
      statusDetail,
      paymentMethod: paymentMethodLabel,
      amount: Number(amount),
      qrCode,
      qrCodeBase64,
      ticketUrl,
      barcode,
      dateApproved: status === 'approved' ? new Date().toISOString() : null,
      message: status === 'approved' ? 'Pagamento aprovado pelo Mercado Pago!' : 'Aguardando pagamento pelo Mercado Pago'
    });
  } catch (err) {
    console.error('Error processing Mercado Pago checkout:', err);
    return res.status(500).json({ error: 'Erro ao processar pagamento com Mercado Pago.' });
  }
});

// PATCH update order status
app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status é obrigatório.' });

    const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    if (result.changes === 0) return res.status(404).json({ error: 'Pedido não encontrado.' });

    return res.json({ success: true, message: `Status do pedido atualizado para: ${status}` });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({ error: 'Erro ao atualizar status do pedido.' });
  }
});

// DELETE order
app.delete('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'Pedido não encontrado.' });

    return res.json({ success: true, message: 'Pedido excluído com sucesso.' });
  } catch (err) {
    console.error('Error deleting order:', err);
    return res.status(500).json({ error: 'Erro ao excluir pedido.' });
  }
});

app.listen(PORT, () => {
  console.log(`[SunLab Server] Backend API running at http://localhost:${PORT}`);
  console.log(`[SunLab Server] SQLite database connected: server/data/sunlab.db`);
});
