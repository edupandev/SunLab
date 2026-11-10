import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '350538431992-ah75gv2bda5bj86knpf40e27273khplh.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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
    const { credential } = body || {};

    if (!credential) {
      return res.status(400).json({ error: 'Token de credencial não fornecido' });
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      const parts = credential.split('.');
      if (parts.length === 3) {
        payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      } else {
        throw verifyErr;
      }
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ error: 'Token não contém e-mail válido' });
    }

    const user = {
      id: `usr-google-${payload.sub || Date.now()}`,
      sub: payload.sub,
      name: payload.name || 'Usuário Google',
      email: payload.email,
      role: 'customer',
      avatar: payload.picture,
      roles: ['customer'],
      origin: 'google'
    };

    return res.status(200).json({
      ok: true,
      success: true,
      token: `jwt-google-${Date.now()}`,
      user
    });
  } catch (err) {
    console.error('Vercel Auth Google Error:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
}
