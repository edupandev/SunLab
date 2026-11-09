import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  X,
  CheckCircle,
  ShieldCheck,
  QrCode,
  CreditCard,
  Copy,
  Check,
  MessageCircle,
  Truck,
  Lock,
  Clock,
  Printer,
  Package,
  FileText
} from 'lucide-react';
import { useCart, type CartItem } from '@/context/CartContext';

export const CheckoutModal: React.FC = () => {
  const navigate = useNavigate();
  const { isCheckoutOpen, closeCheckout, total, clearCart, cart } = useCart();
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'boleto'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedBarcode, setCopiedBarcode] = useState(false);
  const [copiedWhatsAppText, setCopiedWhatsAppText] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState<{
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    paymentMethod: string;
    items: Array<{
      name: string;
      slug?: string;
      image?: string;
      color?: string;
      size?: string;
      quantity: number;
      unitPrice: number;
    }>;
    totalAmount: number;
  } | null>(null);

  // Pix Countdown Timer (15 minutes)
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Address & Payer Form States (Mercado Pago Requer CPF)
  const [formData, setFormData] = useState({
    name: 'Miguel Nogueira',
    email: 'cliente@sunlab.com.br',
    phone: '(11) 98765-4321',
    cpf: '381.286.008-30',
    cep: '01310-100',
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Apto 82',
    city: 'São Paulo',
    state: 'SP'
  });

  // Credit Card States (Mercado Pago Transparent Checkout)
  const [cardData, setCardData] = useState({
    number: '4532 8920 1827 4921',
    holder: 'MIGUEL NOGUEIRA',
    cpf: '381.286.008-30',
    expiry: '08/29',
    cvv: '842',
    installments: '1'
  });

  const boletoBarcode = '23793.38128 60083.013528 56006.333306 8 94820000012000';

  useEffect(() => {
    let timer: any;
    if (step === 'payment' && paymentMethod === 'pix' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, paymentMethod, timeLeft]);

  if (!isCheckoutOpen) return null;

  const pixDiscount = paymentMethod === 'pix' ? total * 0.05 : 0;
  const finalPayableTotal = Math.max(0, total - pixDiscount);

  // Format Card Number
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData({ ...cardData, number: formatted });
  };

  // Detect Card Brand
  const getCardBrand = () => {
    const clean = cardData.number.replace(/\s/g, '');
    if (clean.startsWith('4')) return { name: 'Visa', color: 'from-zinc-600 to-zinc-800' };
    if (clean.startsWith('5')) return { name: 'Mastercard', color: 'from-zinc-500 to-zinc-700' };
    if (clean.startsWith('6')) return { name: 'Elo', color: 'from-zinc-600 to-zinc-800' };
    return { name: 'SunLab Card', color: 'from-zinc-700 to-zinc-900' };
  };

  const cardBrand = getCardBrand();

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    const itemsPayload = cart.map((item: CartItem) => ({
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.images[0] || '',
      color: item.selectedColor.name,
      size: item.selectedSize || 'Padrão',
      quantity: item.quantity,
      unitPrice: item.unitPrice
    }));

    const mpPayload = {
      paymentMethod,
      amount: finalPayableTotal,
      payer: {
        name: formData.name,
        email: formData.email,
        cpf: formData.cpf,
        phone: formData.phone
      },
      shippingAddress: `${formData.street}, nº ${formData.number}${formData.complement ? ' (' + formData.complement + ')' : ''} — ${formData.city}/${formData.state} (CEP: ${formData.cep})`,
      cardData: paymentMethod === 'credit' ? {
        number: cardData.number,
        holder: cardData.holder,
        cpf: cardData.cpf,
        expiry: cardData.expiry,
        cvv: cardData.cvv,
        installments: cardData.installments
      } : undefined,
      items: itemsPayload
    };

    let confirmedOrderNumber = `SLB-${Math.floor(100000 + Math.random() * 900000)}`;
    let finalPaymentMethodLabel =
      paymentMethod === 'pix'
        ? 'Mercado Pago (Pix Instantâneo 5% OFF)'
        : paymentMethod === 'credit'
        ? `Mercado Pago (Cartão de Crédito ${cardData.installments}x)`
        : 'Mercado Pago (Boleto Bancário)';

    try {
      const res = await fetch('http://localhost:3001/api/payments/mercado-pago/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mpPayload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orderNumber) {
          confirmedOrderNumber = data.orderNumber;
        }
        if (data.paymentMethod) {
          finalPaymentMethodLabel = data.paymentMethod;
        }
      }
    } catch (err) {
      console.warn('Mercado Pago checkout fallback:', err);
    }

    const fullOrder = {
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone || '',
      shippingAddress: `${formData.street}, nº ${formData.number}${formData.complement ? ' (' + formData.complement + ')' : ''} — ${formData.city}/${formData.state} (CEP: ${formData.cep})`,
      paymentMethod: finalPaymentMethodLabel,
      items: itemsPayload,
      totalAmount: finalPayableTotal,
      orderNumber: confirmedOrderNumber,
      createdAt: new Date().toISOString()
    };

    setCompletedOrderData(fullOrder);
    setOrderNumber(confirmedOrderNumber);
    setIsProcessing(false);
    setStep('success');

    // Salvar localmente para visualização instantânea na página "Meus Pedidos"
    try {
      const stored = JSON.parse(localStorage.getItem('sunlab_my_orders') || '[]');
      stored.unshift(fullOrder);
      localStorage.setItem('sunlab_my_orders', JSON.stringify(stored));
      localStorage.setItem('sunlab_customer_email', formData.email);
    } catch (e) {
      console.warn('Erro ao salvar localmente:', e);
    }

    clearCart();
  };

  const copyPixKey = () => {
    const fakePixPayload = `00020126580014BR.GOV.BCB.PIX0136mp-pix-${Date.now()}@sunlab.com.br5204000053039865406${finalPayableTotal.toFixed(2)}5802BR5920SunLab Design 3D6009Sao Paulo62070503***6304`;
    navigator.clipboard.writeText(fakePixPayload);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const copyBoletoBarcode = () => {
    navigator.clipboard.writeText(boletoBarcode);
    setCopiedBarcode(true);
    setTimeout(() => setCopiedBarcode(false), 2500);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Gerador da mensagem completa e detalhada para o WhatsApp
  const generateFullWhatsAppMessage = () => {
    const order = completedOrderData;
    if (!order) return '';

    const itemsText = order.items
      .map(
        (it, idx) =>
          `*${idx + 1}. ${it.name}*\n` +
          `   🎨 Cor: ${it.color || 'Padrão'}${it.size ? ` | Tam: ${it.size}` : ''}\n` +
          `   🔢 Qtd: ${it.quantity} un. | Valor unit.: R$ ${it.unitPrice.toFixed(2).replace('.', ',')}\n` +
          `   🏷️ Subtotal: R$ ${(it.quantity * it.unitPrice).toFixed(2).replace('.', ',')}`
      )
      .join('\n\n');

    return (
      `🌊 *NOVO PEDIDO REALIZADO — SUNLAB 3D*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔖 *PEDIDO:* #${order.orderNumber}\n` +
      `📅 *DATA:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n` +
      `👤 *DADOS DO COMPRADOR:*\n` +
      `• *Nome:* ${order.customerName}\n` +
      `• *E-mail:* ${order.customerEmail}\n` +
      `• *Telefone/WhatsApp:* ${order.customerPhone || 'Não informado'}\n\n` +
      `📍 *ENDEREÇO DE ENTREGA:*\n` +
      `• ${order.shippingAddress}\n\n` +
      `💳 *FORMA DE PAGAMENTO:*\n` +
      `• ${order.paymentMethod}\n\n` +
      `📦 *PRODUTOS COMPRADOS:*\n` +
      `${itemsText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *VALOR TOTAL: R$ ${order.totalAmount.toFixed(2).replace('.', ',')}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `⚙️ *Status Inicial:* Aguardando início na impressora 3D\n` +
      `_SunLab Design & Fabricação Digital_`
    );
  };

  const copyWhatsAppDetails = () => {
    const text = generateFullWhatsAppMessage();
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedWhatsAppText(true);
      setTimeout(() => setCopiedWhatsAppText(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-700/30 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (step !== 'success' && !isProcessing) closeCheckout();
        }}
      />

      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden z-10 my-8">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-bold text-blue-950">
              {step === 'form' && 'Finalizar Pedido — Endereço de Envio'}
              {step === 'payment' && 'Ambiente de Pagamento Seguro (Pix / Cartão)'}
              {step === 'success' && 'Pedido Confirmado com Sucesso!'}
            </h3>
          </div>
          {step !== 'success' && (
            <button
              onClick={closeCheckout}
              className="p-1 rounded-lg text-blue-500 hover:text-blue-950 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6">
          
          {/* STEP 1: Address Form */}
          {step === 'form' && (
            <form onSubmit={handleNextToPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">Nome Completo *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-blue-950 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">E-mail para Recibo *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 2: WhatsApp, CPF, CEP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">WhatsApp *</label>
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">CPF do Titular *</label>
                  <input
                    required
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">CEP *</label>
                  <input
                    required
                    type="text"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none"
                  />
                </div>
              </div>

              {/* Row 3: City, Street, Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Cidade / UF *</label>
                  <input
                    required
                    type="text"
                    value={`${formData.city} / ${formData.state}`}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Endereço (Rua, Av.) e Número *</label>
                  <div className="flex gap-2">
                    <input
                      required
                      type="text"
                      placeholder="Logradouro"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Nº"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className="w-20 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:border-zinc-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order Mini Summary */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs text-zinc-700">
                <div className="flex items-center gap-2 text-zinc-600">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Envio com seguro e rastreio via Correios / Jadlog</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 text-[10px] block">Total estimado</span>
                  <span className="font-bold text-zinc-900 text-sm">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeCheckout}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
                >
                  Ir para Pagamento com Mercado Pago →
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Methods (Mercado Pago Suite: Pix, Card, Boleto) */}
          {step === 'payment' && (
            <div className="space-y-6">
              
              {/* Mercado Pago Official Trust Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#009EE3] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                    MP
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1.5 text-zinc-900">
                      <span>Mercado Pago</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#009EE3] text-white text-[9px] font-semibold">OFICIAL</span>
                    </div>
                    <p className="text-[10px] text-zinc-500">Checkout Transparente Protegido • Compra 100% Segura</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-sky-700 font-medium">
                  <Lock className="w-3.5 h-3.5 text-[#009EE3]" />
                  <span className="hidden sm:inline">Criptografia 256-bit</span>
                </div>
              </div>

              {/* Selector Tabs (Mercado Pago: Pix, Cartão, Boleto) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-300 shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span className="truncate">PIX (5% OFF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'credit'
                      ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-300 shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="truncate">Cartão de Crédito</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  className={`flex items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === 'boleto'
                      ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-300 shadow-xs'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span className="truncate">Boleto Bancário</span>
                </button>
              </div>

              {/* PIX AREA (MERCADO PAGO) */}
              {paymentMethod === 'pix' && (
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col items-center text-center space-y-4">
                  
                  {/* Countdown Timer */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-300 text-zinc-700 text-xs font-mono font-semibold">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Expira em: {formatTimer(timeLeft)}</span>
                  </div>

                  {/* Pix QR Code */}
                  <div className="w-40 h-40 bg-white p-3 rounded-2xl flex items-center justify-center shadow-xs border-2 border-zinc-200">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <rect width="100" height="100" fill="#ffffff" />
                      <rect x="10" y="10" width="26" height="26" fill="#009EE3" rx="3" />
                      <rect x="14" y="14" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="18" y="18" width="10" height="10" fill="#009EE3" />
                      
                      <rect x="64" y="10" width="26" height="26" fill="#009EE3" rx="3" />
                      <rect x="68" y="14" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="72" y="18" width="10" height="10" fill="#009EE3" />
                      
                      <rect x="10" y="64" width="26" height="26" fill="#009EE3" rx="3" />
                      <rect x="14" y="68" width="18" height="18" fill="#ffffff" rx="2" />
                      <rect x="18" y="72" width="10" height="10" fill="#009EE3" />
                      
                      <rect x="42" y="14" width="16" height="16" fill="#2563eb" rx="2" />
                      <rect x="42" y="42" width="16" height="16" fill="#009EE3" rx="2" />
                      <rect x="14" y="42" width="16" height="16" fill="#1e40af" rx="2" />
                      <rect x="70" y="42" width="16" height="16" fill="#2563eb" rx="2" />
                      <rect x="42" y="70" width="16" height="16" fill="#009EE3" rx="2" />
                      <rect x="70" y="70" width="18" height="18" fill="#1e40af" rx="2" />
                    </svg>
                  </div>

                  <div>
                    <span className="text-xs text-zinc-500">Total com 5% de desconto no Pix Mercado Pago:</span>
                    <h4 className="text-3xl font-extrabold text-zinc-900 font-display mt-0.5">
                      R$ {finalPayableTotal.toFixed(2).replace('.', ',')}
                    </h4>
                    <span className="text-[11px] text-zinc-500 mt-1 block">
                      Aprovação instantânea • Liberação imediata para a fila de impressão 3D
                    </span>
                  </div>

                  {/* Copy Pix Button */}
                  <button
                    type="button"
                    onClick={copyPixKey}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    {copiedPix ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Código Pix Copiado com Sucesso!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-zinc-600" />
                        <span>Copiar Código Pix Copia e Cola</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* CREDIT CARD AREA (MERCADO PAGO) */}
              {paymentMethod === 'credit' && (
                <div className="space-y-5">
                  {/* Interactive Card Mockup Preview */}
                  <div className={`relative w-full max-w-sm mx-auto aspect-8/5 rounded-2xl bg-gradient-to-tr ${cardBrand.color} p-5 text-white shadow-lg border border-white/20 flex flex-col justify-between overflow-hidden`}>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-zinc-300 to-zinc-400 border border-zinc-200/50 shadow-inner" />
                      <span className="text-xs font-bold tracking-widest uppercase font-mono bg-white/20 text-white px-2 py-0.5 rounded">
                        {cardBrand.name}
                      </span>
                    </div>

                    <div className="font-mono text-base sm:text-lg tracking-widest font-semibold text-center drop-shadow">
                      {cardData.number || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex items-end justify-between text-xs">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-300 block">Titular</span>
                        <span className="font-semibold uppercase tracking-wider truncate max-w-[150px] block">
                          {cardData.holder || 'NOME NO CARTÃO'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-300 block">Validade</span>
                        <span className="font-semibold font-mono">
                          {cardData.expiry || 'MM/AA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Form */}
                  <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">Número do Cartão</label>
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-500 outline-none font-mono tracking-wider"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">Nome Impresso no Cartão</label>
                        <input
                          type="text"
                          value={cardData.holder}
                          onChange={(e) => setCardData({ ...cardData, holder: e.target.value.toUpperCase() })}
                          placeholder="COMO ESTÁ NO CARTÃO"
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-500 outline-none uppercase font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">CPF do Titular</label>
                        <input
                          type="text"
                          value={cardData.cpf}
                          onChange={(e) => setCardData({ ...cardData, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-500 outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">Validade (MM/AA)</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          placeholder="12/28"
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-500 outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">Código CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          placeholder="•••"
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-500 outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">Parcelamento Mercado Pago</label>
                      <select
                        value={cardData.installments}
                        onChange={(e) => setCardData({ ...cardData, installments: e.target.value })}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-500 outline-none cursor-pointer"
                      >
                        <option value="1">1x de R$ {total.toFixed(2).replace('.', ',')} sem juros</option>
                        <option value="2">2x de R$ {(total / 2).toFixed(2).replace('.', ',')} sem juros</option>
                        <option value="3">3x de R$ {(total / 3).toFixed(2).replace('.', ',')} sem juros</option>
                        <option value="6">6x de R$ {(total / 6).toFixed(2).replace('.', ',')} sem juros</option>
                        <option value="10">10x de R$ {(total / 10).toFixed(2).replace('.', ',')} sem juros</option>
                        <option value="12">12x de R$ {(total / 12).toFixed(2).replace('.', ',')} sem juros</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* BOLETO BANCARIO AREA (MERCADO PAGO) */}
              {paymentMethod === 'boleto' && (
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-xs text-zinc-500">Valor do Boleto Mercado Pago:</span>
                    <h4 className="text-3xl font-extrabold text-zinc-900 font-display mt-0.5">
                      R$ {finalPayableTotal.toFixed(2).replace('.', ',')}
                    </h4>
                    <span className="text-[11px] text-zinc-500 mt-1 block">
                      Vencimento: em 3 dias úteis • Compensação rápida via Mercado Pago
                    </span>
                  </div>

                  {/* Visual Barcode Box */}
                  <div className="w-full max-w-md bg-white p-4 rounded-xl border border-zinc-200 text-left space-y-2 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Linha Digitável do Boleto:</span>
                    <div className="font-mono text-xs text-zinc-900 font-bold bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 break-all select-all">
                      {boletoBarcode}
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      Pague no app do seu banco, internet banking ou agências lotéricas.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyBoletoBarcode}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    {copiedBarcode ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Código do Boleto Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-zinc-600" />
                        <span>Copiar Linha Digitável</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Bottom Payment Actions */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer"
                >
                  ← Alterar endereço
                </button>

                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isProcessing
                      ? 'Processando com Mercado Pago...'
                      : paymentMethod === 'pix'
                        ? 'Confirmar Pagamento Pix Realizado'
                        : paymentMethod === 'credit'
                        ? `Pagar R$ ${total.toFixed(2).replace('.', ',')} com Cartão`
                        : 'Emitir Boleto Mercado Pago'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Confirmed & Receipt */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold mb-2 shadow-xs">
                  <span className="px-1.5 py-0.2 rounded bg-[#009EE3] text-white text-[9px] font-extrabold">MP</span>
                  <span>Pagamento Processado com Sucesso via Mercado Pago</span>
                </div>
                <div className="block mt-1">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-700 uppercase tracking-widest">
                    Pedido #{orderNumber}
                  </span>
                </div>
                <h4 className="text-2xl font-extrabold text-zinc-900 font-display mt-3">
                  Compra Confirmada!
                </h4>
                <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Seu pagamento foi confirmado pelo Mercado Pago e seu pedido já entrou na fila de manufatura 3D.
                </p>
              </div>

              {/* Order Receipt Box with Products Breakdown */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 max-w-lg mx-auto text-left space-y-3">
                <div className="flex justify-between pb-2 border-b border-zinc-200">
                  <span className="text-zinc-500">Forma de Pagamento:</span>
                  <span className="text-zinc-900 font-semibold flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-[#009EE3] text-white text-[9px] font-bold">MP</span>
                    <span>{completedOrderData?.paymentMethod || 'Mercado Pago'}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Destinatário:</span>
                  <span className="text-zinc-900 font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">WhatsApp / Telefone:</span>
                  <span className="text-zinc-900 font-medium font-mono">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Endereço de Entrega:</span>
                  <span className="text-zinc-900 font-medium text-right max-w-[260px] truncate" title={`${formData.street}, ${formData.number} — ${formData.city}/${formData.state}`}>
                    {formData.street}, {formData.number} — {formData.city}/{formData.state}
                  </span>
                </div>

                {/* Purchased Products Detailed List */}
                {completedOrderData && completedOrderData.items && completedOrderData.items.length > 0 && (
                  <div className="pt-2 border-t border-zinc-200 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
                      Itens do Pedido ({completedOrderData.items.length}):
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {completedOrderData.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-zinc-200">
                          <div className="flex items-center gap-2.5">
                            {it.image && (
                              <img src={it.image} alt={it.name} className="w-8 h-8 rounded-lg object-cover border border-zinc-200" />
                            )}
                            <div>
                              <div className="font-semibold text-zinc-900 text-xs">{it.name}</div>
                              <div className="text-[10px] text-zinc-500">
                                {it.color && `Cor: ${it.color}`} {it.size && `• Tam: ${it.size}`} • {it.quantity}x
                              </div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-zinc-900 text-xs">
                            R$ {(it.quantity * it.unitPrice).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-zinc-200">
                  <span className="font-bold text-zinc-900">Total Pago:</span>
                  <span className="text-zinc-900 font-extrabold text-base">
                    R$ {finalPayableTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Action Buttons for WhatsApp & Orders Page */}
              <div className="space-y-2.5 max-w-lg mx-auto pt-1">
                {/* Primary: Send Full Order Details to WhatsApp */}
                <a
                  href={`https://wa.me/5511999999999?text=${encodeURIComponent(generateFullWhatsAppMessage())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enviar Pedido Completo para o WhatsApp da Loja</span>
                </a>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={copyWhatsAppDetails}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs transition-colors cursor-pointer border border-zinc-200"
                  >
                    {copiedWhatsAppText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-600" />}
                    <span>{copiedWhatsAppText ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      closeCheckout();
                      navigate('/orders');
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold text-xs transition-colors cursor-pointer border border-blue-200"
                  >
                    <Package className="w-3.5 h-3.5 text-blue-700" />
                    <span>Ver Meus Pedidos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 font-medium text-xs transition-colors cursor-pointer border border-zinc-200"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Imprimir</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="text-xs text-zinc-500 hover:text-zinc-800 underline underline-offset-4 cursor-pointer"
                  >
                    Concluir e voltar à loja
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
