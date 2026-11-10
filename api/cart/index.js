// Vercel Serverless Function: Multi-device Cart Sync per user
// Stores cart items tied to each user's email across PC, mobile, and tablets

// Global memory cache per lambda instance
let memoryCarts = global._sunlab_carts || new Map();
global._sunlab_carts = memoryCarts;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const email = (req.query.email || req.headers['x-user-email'] || (req.body && (typeof req.body === 'string' ? JSON.parse(req.body) : req.body).email) || '').trim().toLowerCase();

  // GET Cart for user
  if (req.method === 'GET') {
    if (!email) {
      return res.status(200).json({ items: [] });
    }
    const items = memoryCarts.get(email) || [];
    return res.status(200).json({ items, user: email });
  }

  // POST Save Cart for user
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const userEmail = (body.email || email).trim().toLowerCase();
      const items = Array.isArray(body.items) ? body.items : [];

      if (!userEmail) {
        return res.status(400).json({ error: 'E-mail do usuário obrigatório para salvar carrinho.' });
      }

      memoryCarts.set(userEmail, items);
      return res.status(200).json({ success: true, count: items.length, user: userEmail });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao salvar carrinho' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
