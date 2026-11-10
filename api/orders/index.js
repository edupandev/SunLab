// Vercel Serverless Function: Orders per user
// Stores customer purchases tied to their user account / email

let memoryOrders = global._sunlab_orders || [];
global._sunlab_orders = memoryOrders;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET Orders
  if (req.method === 'GET') {
    const email = (req.query.email || '').trim().toLowerCase();
    if (email) {
      const userOrders = memoryOrders.filter(o => o.customerEmail?.toLowerCase() === email);
      return res.status(200).json(userOrders);
    }
    return res.status(200).json(memoryOrders);
  }

  // POST Create Order
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, items, totalAmount } = body;

      if (!customerName || !customerEmail || !totalAmount) {
        return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
      }

      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `SLB-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName,
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone || '',
        shippingAddress: shippingAddress || 'Retirada / A combinar',
        paymentMethod: paymentMethod || 'Pix Instantâneo',
        items: items || [],
        totalAmount: Number(totalAmount),
        status: 'Pendente',
        createdAt: new Date().toISOString()
      };

      memoryOrders.unshift(newOrder);
      return res.status(201).json({ success: true, order: newOrder, orderNumber: newOrder.orderNumber });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao processar pedido' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
