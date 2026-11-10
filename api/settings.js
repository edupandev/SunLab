// Vercel Serverless Function: Settings (Pix & Store Config)

let memorySettings = global._sunlab_settings || {
  pix_key: '+5513996061681',
  pix_key_type: 'phone',
  pix_merchant_name: 'SunLab 3D',
  pix_merchant_city: 'SANTOS',
  store_whatsapp: '13996061681'
};
global._sunlab_settings = memorySettings;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(memorySettings);
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { pix_key, pix_key_type, pix_merchant_name, pix_merchant_city, store_whatsapp } = body;
      
      if (pix_key !== undefined) memorySettings.pix_key = pix_key.trim();
      if (pix_key_type !== undefined) memorySettings.pix_key_type = pix_key_type.trim();
      if (pix_merchant_name !== undefined) memorySettings.pix_merchant_name = pix_merchant_name.trim();
      if (pix_merchant_city !== undefined) memorySettings.pix_merchant_city = pix_merchant_city.trim();
      if (store_whatsapp !== undefined) memorySettings.store_whatsapp = store_whatsapp.trim();

      return res.status(200).json({ success: true, settings: memorySettings });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao salvar configurações' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
