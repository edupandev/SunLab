export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { email, password } = body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Credencial oficial admin
    if (cleanEmail === 'admin@sunlab.com.br' && password === 'sunlab2026') {
      return res.status(200).json({
        success: true,
        service: 'loginsrv',
        token: `jwt-admin-${Date.now()}`,
        user: {
          id: 'usr-admin-01',
          sub: 'usr-admin-01',
          name: 'SunLab Admin',
          email: 'admin@sunlab.com.br',
          role: 'admin',
          roles: ['admin'],
          origin: 'vercel'
        }
      });
    }

    // Default mock customer for demo if credentials match
    return res.status(200).json({
      success: true,
      service: 'loginsrv',
      token: `jwt-user-${Date.now()}`,
      user: {
        id: `usr-${Date.now()}`,
        sub: `usr-${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'customer',
        roles: ['customer'],
        origin: 'vercel'
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao processar login.' });
  }
}
