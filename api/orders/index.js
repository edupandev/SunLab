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
    const orderNumber = (req.query.orderNumber || '').trim().toLowerCase();
    const search = (req.query.search || '').trim().toLowerCase();

    let result = memoryOrders;
    if (email) {
      result = result.filter(o => o.customerEmail?.toLowerCase() === email);
    }
    if (orderNumber) {
      result = result.filter(o => o.orderNumber?.toLowerCase().includes(orderNumber));
    }
    if (search) {
      result = result.filter(o => 
        o.orderNumber?.toLowerCase().includes(search) ||
        o.customerName?.toLowerCase().includes(search) ||
        o.customerEmail?.toLowerCase().includes(search) ||
        o.customerPhone?.includes(search)
      );
    }
    return res.status(200).json(result);
  }

  // POST Create Order
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { orderNumber: customOrderNumber, customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, items, totalAmount } = body;

      if (!customerName || !customerEmail || !totalAmount) {
        return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
      }

      const orderNumber = (customOrderNumber || '').trim() || `SLB-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder = {
        id: body.id || `ord-${Date.now()}`,
        orderNumber,
        customerName,
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone || '',
        shippingAddress: shippingAddress || 'Retirada / A combinar',
        paymentMethod: paymentMethod || 'Pix Instantâneo (5% OFF)',
        items: items || [],
        totalAmount: Number(totalAmount),
        status: 'Pendente',
        createdAt: new Date().toISOString()
      };

      const existingIndex = memoryOrders.findIndex(o => o.orderNumber === orderNumber);
      if (existingIndex >= 0) {
        memoryOrders[existingIndex] = { ...memoryOrders[existingIndex], ...newOrder };
      } else {
        memoryOrders.unshift(newOrder);
      }
      return res.status(201).json({ success: true, order: newOrder, orderNumber: newOrder.orderNumber });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao processar pedido' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
