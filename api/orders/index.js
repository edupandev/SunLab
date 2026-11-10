import fs from 'fs';

// Vercel Serverless Function: Orders per user
// Stores customer purchases tied to their user account / email

const TMP_ORDERS_FILE = '/tmp/sunlab_orders.json';

function getPersistedOrders() {
  try {
    if (fs.existsSync(TMP_ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_ORDERS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (_) {}
  return [];
}

function persistOrders(orders) {
  try {
    fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(orders), 'utf8');
  } catch (_) {}
}

let memoryOrders = global._sunlab_orders && global._sunlab_orders.length 
  ? global._sunlab_orders 
  : getPersistedOrders();
global._sunlab_orders = memoryOrders;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Determine subpath / route
  let subpath = '';
  if (req.query.path) {
    subpath = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path);
  } else {
    const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
    const ordersIdx = urlParts.indexOf('orders');
    if (ordersIdx !== -1 && urlParts.length > ordersIdx + 1) {
      subpath = urlParts.slice(ordersIdx + 1).filter(p => p !== 'index').join('/');
    }
  }

  const cleanTarget = (str) => {
    return (str || '')
      .replace(/\/status$/, '')
      .replace(/^orders\//, '')
      .replace(/^\/+|\/+$/g, '')
      .trim();
  };

  // PATCH / PUT update order
  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const targetId = cleanTarget(subpath) || body?.id || body?.orderNumber || '';

      const idx = memoryOrders.findIndex(o => 
        (o.id && (o.id === targetId || targetId.includes(o.id))) || 
        (o.orderNumber && (o.orderNumber.toUpperCase() === targetId.toUpperCase() || targetId.toUpperCase().includes(o.orderNumber.toUpperCase()))) ||
        (body?.orderNumber && o.orderNumber?.toUpperCase() === body.orderNumber.toUpperCase()) ||
        (body?.id && o.id === body.id)
      );

      if (idx === -1) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      if (body) {
        if (body.status) memoryOrders[idx].status = body.status;
        if (body.customerName) memoryOrders[idx].customerName = body.customerName;
        if (body.customerEmail) memoryOrders[idx].customerEmail = body.customerEmail;
        if (body.customerPhone) memoryOrders[idx].customerPhone = body.customerPhone;
        if (body.shippingAddress) memoryOrders[idx].shippingAddress = body.shippingAddress;
        if (body.paymentMethod) memoryOrders[idx].paymentMethod = body.paymentMethod;
        if (body.totalAmount !== undefined) memoryOrders[idx].totalAmount = Number(body.totalAmount);
        memoryOrders[idx].updatedAt = new Date().toISOString();
        persistOrders(memoryOrders);
      }
      return res.status(200).json({ success: true, order: memoryOrders[idx] });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao atualizar pedido.' });
    }
  }

  // DELETE order
  if (req.method === 'DELETE') {
    const targetId = cleanTarget(subpath);
    const initialLen = memoryOrders.length;
    memoryOrders = memoryOrders.filter(o => 
      o.id !== targetId && 
      !targetId.includes(o.id) &&
      o.orderNumber?.toUpperCase() !== targetId.toUpperCase() &&
      (!o.orderNumber || !targetId.toUpperCase().includes(o.orderNumber.toUpperCase()))
    );
    global._sunlab_orders = memoryOrders;
    persistOrders(memoryOrders);

    return res.status(200).json({ success: true, message: 'Pedido excluído com sucesso.' });
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
        paymentMethod: paymentMethod || 'WhatsApp (A Combinar)',
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
      global._sunlab_orders = memoryOrders;
      persistOrders(memoryOrders);

      return res.status(201).json({ success: true, order: newOrder, orderNumber: newOrder.orderNumber });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao processar pedido' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
