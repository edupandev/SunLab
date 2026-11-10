import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  X,
  CheckCircle,
  CheckCircle2,
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
  FileText,
  UserCheck,
  LogIn,
  UserPlus,
  Sparkles,
  AlertCircle,
  Loader2,
  Key
} from 'lucide-react';
import { useCart, type CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  generatePixPayload,
  generatePixQRCode,
  DEFAULT_PIX_CONFIG,
  type PixConfig
} from '../utils/pix';

export const CheckoutModal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isCheckoutOpen, closeCheckout, total, clearCart, cart } = useCart();
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'boleto'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedPixKey, setCopiedPixKey] = useState(false);
  const [copiedBarcode, setCopiedBarcode] = useState(false);
  const [copiedWhatsAppText, setCopiedWhatsAppText] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Pix Oficial Banco Central (Payload e QR Code real)
  const [pixConfig, setPixConfig] = useState<PixConfig>(DEFAULT_PIX_CONFIG);
  const [pixPayload, setPixPayload] = useState('');
  const [pixQrCodeUrl, setPixQrCodeUrl] = useState('');
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
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

  // Chave de armazenamento por conta de usuário
  const getUserProfileKey = (userEmail: string) => `sunlab_checkout_profile_${userEmail.toLowerCase().trim()}`;

  const loadSavedProfile = (userEmail?: string) => {
    if (!userEmail) return null;
    try {
      const stored = localStorage.getItem(getUserProfileKey(userEmail));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}
    return null;
  };

  // Address & Payer Form States (inicia vazio ou com os dados salvos da conta do usuário)
  const [formData, setFormData] = useState(() => {
    const saved = user?.email ? loadSavedProfile(user.email) : null;
    return {
      name: saved?.name || (user?.name && user.name !== 'SunLab Admin' && !user.name.includes('@') ? user.name : ''),
      email: user?.email || '',
      phone: saved?.phone || '',
      cpf: saved?.cpf || '',
      cep: saved?.cep || '',
      street: saved?.street || '',
      number: saved?.number || '',
      complement: saved?.complement || '',
      neighborhood: saved?.neighborhood || '',
      city: saved?.city || '',
      state: saved?.state || ''
    };
  });

  // Salvar perfil do usuário para compras futuras
  const saveUserProfile = (data: typeof formData) => {
    if (!user?.email) return;
    try {
      localStorage.setItem(getUserProfileKey(user.email), JSON.stringify(data));
      localStorage.setItem('sunlab_customer_email', user.email);
    } catch (_) {}
  };

  // Carregar dados salvos da conta sempre que o modal abre ou usuário loga
  useEffect(() => {
    if (user?.email) {
      const saved = loadSavedProfile(user.email);
      setFormData(prev => ({
        ...prev,
        name: saved?.name || (user.name && user.name !== 'SunLab Admin' && !user.name.includes('@') ? user.name : prev.name || ''),
        email: user.email,
        phone: saved?.phone || prev.phone || '',
        cpf: saved?.cpf || prev.cpf || '',
        cep: saved?.cep || prev.cep || '',
        street: saved?.street || prev.street || '',
        number: saved?.number || prev.number || '',
        complement: saved?.complement || prev.complement || '',
        neighborhood: saved?.neighborhood || prev.neighborhood || '',
        city: saved?.city || prev.city || '',
        state: saved?.state || prev.state || ''
      }));
    }
  }, [user, isCheckoutOpen]);

  // Resetar modal para nova compra sempre que for aberto (impede reaparecer compra anterior)
  useEffect(() => {
    if (isCheckoutOpen) {
      setStep('form');
      setCompletedOrderData(null);
      setOrderNumber('');
      setIsProcessing(false);
      setCardError(null);
      setTimeLeft(15 * 60);
      setCopiedPix(false);
      setCopiedBarcode(false);
      setCopiedWhatsAppText(false);
    }
  }, [isCheckoutOpen]);

  // Credit Card States (Mercado Pago Transparent Checkout)
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    cpf: '',
    expiry: '',
    cvv: '',
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

  // Carregar configurações oficiais do Pix e Loja
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data && data.pix_key) {
            setPixConfig({
              key: data.pix_key,
              keyType: data.pix_key_type || 'phone',
              merchantName: data.pix_merchant_name || 'SunLab 3D',
              merchantCity: data.pix_merchant_city || 'SANTOS',
              whatsapp: data.store_whatsapp || '13996061681'
            });
          }
        }
      } catch (e) {
        console.warn('Usando configurações padrão para o Pix:', e);
      }
    };
    fetchSettings();
  }, []);

  if (!isCheckoutOpen) return null;

  const pixDiscount = paymentMethod === 'pix' ? total * 0.05 : 0;
  const finalPayableTotal = Math.max(0, total - pixDiscount);

  // Gerar dinamicamente o código Pix Copia e Cola e o QR Code real (padrão oficial Banco Central)
  useEffect(() => {
    if (finalPayableTotal > 0) {
      try {
        setIsGeneratingPix(true);
        const payload = generatePixPayload({
          key: pixConfig.key,
          name: pixConfig.merchantName,
          city: pixConfig.merchantCity,
          amount: finalPayableTotal,
          txid: orderNumber || `SLB${Math.floor(100000 + Math.random() * 900000)}`
        });
        setPixPayload(payload);
        generatePixQRCode(payload)
          .then(url => {
            setPixQrCodeUrl(url);
            setIsGeneratingPix(false);
          })
          .catch(() => {
            setIsGeneratingPix(false);
          });
      } catch (err) {
        console.error('Erro gerando Pix BRCode:', err);
        setIsGeneratingPix(false);
      }
    }
  }, [finalPayableTotal, pixConfig, orderNumber, step]);

  const formatFriendlyKey = (k: string) => {
    const raw = k.replace(/\D/g, '');
    if (raw.length === 13 && raw.startsWith('55')) {
      const ddd = raw.slice(2, 4);
      const part1 = raw.slice(4, 9);
      const part2 = raw.slice(9);
      return `(${ddd}) ${part1}-${part2}`;
    }
    if (raw.length === 11) {
      const ddd = raw.slice(0, 2);
      const part1 = raw.slice(2, 7);
      const part2 = raw.slice(7);
      return `(${ddd}) ${part1}-${part2}`;
    }
    return k;
  };

  // Formatação de CPF com máscara
  const handleCpfChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 9) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
    } else if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}.${raw.slice(3)}`;
    }
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  // Formatação de Telefone / WhatsApp com máscara
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 10) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    } else if (raw.length > 6) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
    } else if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    }
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  // Busca automática de endereço por CEP (ViaCEP)
  const handleCepChange = async (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
    setFormData(prev => ({ ...prev, cep: formatted }));

    if (raw.length === 8) {
      try {
        setIsLoadingCep(true);
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        if (res.ok) {
          const data = await res.json();
          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              street: data.logradouro || prev.street,
              neighborhood: data.bairro || prev.neighborhood,
              city: data.localidade || prev.city,
              state: data.uf || prev.state,
              complement: data.complemento || prev.complement
            }));
          }
        }
      } catch (_) {
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  // Validação matemática de CPF brasileiro
  const isValidCPF = (cpf: string): boolean => {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(clean)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i), 10) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean.charAt(9), 10)) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i), 10) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    return rev === parseInt(clean.charAt(10), 10);
  };

  // Algoritmo de Luhn oficial para validação de número de cartão de crédito real
  const isValidLuhn = (num: string): boolean => {
    const clean = num.replace(/\D/g, '');
    if (clean.length < 13 || clean.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Format Card Number
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData(prev => ({ ...prev, number: formatted }));
    if (cardError) setCardError(null);
  };

  const handleCardExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    setCardData(prev => ({ ...prev, expiry: formatted }));
    if (cardError) setCardError(null);
  };

  const handleCardCvvChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    setCardData(prev => ({ ...prev, cvv: raw }));
    if (cardError) setCardError(null);
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
    saveUserProfile(formData);
    setCardError(null);
    setCardData(prev => ({
      ...prev,
      holder: prev.holder || (formData.name || '').toUpperCase(),
      cpf: prev.cpf || formData.cpf || ''
    }));
    setStep('payment');
  };

  const handleCloseModal = () => {
    setStep('form');
    setCompletedOrderData(null);
    setOrderNumber('');
    setCardError(null);
    closeCheckout();
  };

  const isProfileComplete = Boolean(
    formData.name.trim() &&
    formData.phone.trim() &&
    formData.cpf.trim() &&
    formData.cep.trim() &&
    formData.street.trim() &&
    formData.number.trim() &&
    formData.city.trim() &&
    formData.state.trim()
  );

  const handleCompleteOrder = async () => {
    setCardError(null);

    // Validação estrita de Cartão de Crédito (impede aprovar sem cartão válido)
    if (paymentMethod === 'credit') {
      const cleanCard = cardData.number.replace(/\D/g, '');
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        setCardError('Por favor, informe os 16 dígitos do seu cartão de crédito.');
        return;
      }
      if (!isValidLuhn(cleanCard)) {
        setCardError('Número de cartão de crédito inválido. Verifique os dígitos e tente novamente.');
        return;
      }

      const holderTrim = (cardData.holder || '').trim();
      if (!holderTrim || holderTrim.split(/\s+/).length < 2) {
        setCardError('Informe o nome e sobrenome do titular como impresso no cartão.');
        return;
      }

      const cleanCpf = (cardData.cpf || formData.cpf || '').replace(/\D/g, '');
      if (cleanCpf.length !== 11 || !isValidCPF(cleanCpf)) {
        setCardError('CPF do titular do cartão inválido.');
        return;
      }

      const expiryParts = cardData.expiry.split('/');
      if (expiryParts.length !== 2) {
        setCardError('Data de validade inválida. Informe no formato MM/AA (ex: 12/28).');
        return;
      }
      const expMonth = parseInt(expiryParts[0], 10);
      const expYear = parseInt(expiryParts[1], 10);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      if (isNaN(expMonth) || isNaN(expYear) || expMonth < 1 || expMonth > 12) {
        setCardError('Mês de validade inválido (deve ser entre 01 e 12).');
        return;
      }
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        setCardError('O cartão informado já está vencido.');
        return;
      }

      const cleanCvv = cardData.cvv.replace(/\D/g, '');
      if (cleanCvv.length < 3 || cleanCvv.length > 4) {
        setCardError('Código de segurança (CVV) inválido (3 ou 4 dígitos do verso).');
        return;
      }
    }

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

    let confirmedOrderNumber = `SLB-${Math.floor(100000 + Math.random() * 900000)}`;
    let finalPaymentMethodLabel =
      paymentMethod === 'pix'
        ? 'Mercado Pago (Pix Instantâneo 5% OFF)'
        : paymentMethod === 'credit'
        ? `Mercado Pago (Cartão de Crédito ${cardData.installments}x)`
        : 'Mercado Pago (Boleto Bancário)';

    const shippingAddr = `${formData.street}, nº ${formData.number}${formData.complement ? ' (' + formData.complement + ')' : ''}${formData.neighborhood ? ', ' + formData.neighborhood : ''} — ${formData.city}/${formData.state} (CEP: ${formData.cep})`;

    // Sincronizar criação do pedido com a API de pedidos (Vercel e Express)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: shippingAddr,
          paymentMethod: finalPaymentMethodLabel,
          items: itemsPayload,
          totalAmount: finalPayableTotal
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orderNumber) {
          confirmedOrderNumber = data.orderNumber;
        }
      }
    } catch (err) {
      console.warn('Erro ao sincronizar pedido com a API:', err);
    }

    const fullOrder = {
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone || '',
      shippingAddress: shippingAddr,
      paymentMethod: finalPaymentMethodLabel,
      items: itemsPayload,
      totalAmount: finalPayableTotal,
      orderNumber: confirmedOrderNumber,
      createdAt: new Date().toISOString()
    };

    setCompletedOrderData(fullOrder);
    setOrderNumber(confirmedOrderNumber);
    saveUserProfile(formData);
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

  const copyPixCode = () => {
    if (!pixPayload) return;
    navigator.clipboard.writeText(pixPayload);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const copyDirectPixKey = () => {
    const rawToCopy = pixConfig.key.startsWith('+55') ? pixConfig.key.slice(3) : pixConfig.key;
    navigator.clipboard.writeText(rawToCopy);
    setCopiedPixKey(true);
    setTimeout(() => setCopiedPixKey(false), 2500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-700/30 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (step !== 'success' && !isProcessing) handleCloseModal();
        }}
      />

      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden z-10 my-auto sm:my-8 max-h-[96vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-200 bg-zinc-50 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-blue-950 truncate max-w-[260px] sm:max-w-none">
              {step === 'form' && 'Finalizar Pedido — Envio'}
              {step === 'payment' && 'Pagamento Seguro (Pix / Cartão)'}
              {step === 'success' && 'Pedido Confirmado!'}
            </h3>
          </div>
          {step !== 'success' && (
            <button
              onClick={handleCloseModal}
              className="p-1 rounded-lg text-blue-500 hover:text-blue-950 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          
          {/* CASO NÃO ESTEJA LOGADO: EXIGIR LOGIN OU CADASTRO PARA FINALIZAR COMPRA */}
          {!user ? (
            <div className="py-6 px-2 sm:px-4 text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center shadow-xs">
                <UserCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-xl font-bold text-zinc-900 font-display">
                  Identifique-se para Continuar
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Para acompanhar seu pedido, receber o rastreio e salvar seus dados de entrega com segurança, faça login ou crie sua conta antes de finalizar.
                </p>
              </div>

              {/* Resumo rápido do carrinho */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 max-w-sm mx-auto flex items-center justify-between text-xs">
                <span className="text-zinc-600 font-medium">Total do seu carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'}):</span>
                <strong className="text-blue-900 font-bold text-sm">R$ {total.toFixed(2).replace('.', ',')}</strong>
              </div>

              <div className="space-y-2.5 max-w-sm mx-auto pt-1">
                <button
                  type="button"
                  onClick={() => {
                    closeCheckout();
                    navigate('/login?redirect=checkout');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar com Minha Conta</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeCheckout();
                    navigate('/login?tab=register&redirect=checkout');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-zinc-600" />
                  <span>Criar Nova Conta SunLab</span>
                </button>
                <button
                  type="button"
                  onClick={closeCheckout}
                  className="text-xs text-zinc-500 hover:text-zinc-800 pt-2 cursor-pointer transition-colors block mx-auto"
                >
                  Voltar ao Carrinho
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Address Form */}
              {step === 'form' && (
                <form onSubmit={handleNextToPayment} className="space-y-4">
                  {/* Banner de Status dos Dados da Conta */}
                  {!isProfileComplete ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5 shadow-2xs">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="font-bold">Complete seus dados cadastrais e endereço:</strong>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Preencha seu nome e endereço abaixo. Suas informações ficarão salvas automaticamente na sua conta <strong>({user.email})</strong> para você não precisar digitar nas próximas compras!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-medium truncate">
                          Dados de entrega salvos e vinculados à conta <strong>{user.email}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        Salvo
                      </span>
                    </div>
                  )}

                  {/* Row 1: Nome Completo e E-mail da Conta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Nome Completo *</label>
                      <input
                        required
                        type="text"
                        placeholder="Ex: Ana Clara Silva"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center justify-between">
                        <span>E-mail da Conta *</span>
                        <span className="text-[10px] text-zinc-400 font-normal flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Vinculado
                        </span>
                      </label>
                      <input
                        disabled
                        type="email"
                        value={user.email}
                        className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-600 cursor-not-allowed outline-none select-none"
                        title="O e-mail é vinculado à sua conta logada"
                      />
                    </div>
                  </div>

                  {/* Row 2: WhatsApp e CPF */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">WhatsApp / Telefone *</label>
                      <input
                        required
                        type="text"
                        placeholder="(11) 98765-4321"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">CPF do Titular *</label>
                      <input
                        required
                        type="text"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Row 3: CEP e Bairro */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center justify-between">
                        <span>CEP *</span>
                        {isLoadingCep && <span className="text-[10px] text-blue-600 animate-pulse">Buscando CEP...</span>}
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="00000-000"
                        value={formData.cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Bairro</label>
                      <input
                        type="text"
                        placeholder="Ex: Centro, Bela Vista"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 4: Logradouro e Número */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Endereço (Rua, Av.) *</label>
                      <input
                        required
                        type="text"
                        placeholder="Ex: Rua das Flores"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Número *</label>
                      <input
                        required
                        type="text"
                        placeholder="Ex: 120"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 5: Complemento, Cidade e Estado */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Complemento (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Apto 42, Bloco B, Casa 2"
                        value={formData.complement}
                        onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Cidade *</label>
                      <input
                        required
                        type="text"
                        placeholder="Cidade"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">UF *</label>
                      <input
                        required
                        type="text"
                        maxLength={2}
                        placeholder="SP"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none uppercase font-mono"
                      />
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

              {/* PIX AREA (MERCADO PAGO OFICIAL & BANCO CENTRAL BRCODE) */}
              {paymentMethod === 'pix' && (
                <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col items-center text-center space-y-4">
                  
                  {/* Countdown Timer */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-300 text-zinc-700 text-xs font-mono font-semibold">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Expira em: {formatTimer(timeLeft)}</span>
                  </div>

                  {/* Real Scannable Pix QR Code */}
                  <div className="w-48 h-48 bg-white p-3 rounded-2xl flex items-center justify-center shadow-sm border-2 border-emerald-500/30 relative">
                    {isGeneratingPix || !pixQrCodeUrl ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                        <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                        <span className="text-[11px] font-medium text-zinc-500">Gerando QR Code Pix...</span>
                      </div>
                    ) : (
                      <img
                        src={pixQrCodeUrl}
                        alt="QR Code Pix Oficial SunLab"
                        className="w-full h-full object-contain rounded-xl select-none"
                      />
                    )}
                  </div>

                  <div>
                    <span className="text-xs text-zinc-500">Total com 5% de desconto no Pix:</span>
                    <h4 className="text-3xl font-extrabold text-zinc-900 font-display mt-0.5">
                      R$ {finalPayableTotal.toFixed(2).replace('.', ',')}
                    </h4>
                    <span className="text-[11px] text-zinc-500 mt-1 block">
                      Aprovação instantânea • Liberação imediata para a fila de impressão 3D
                    </span>
                  </div>

                  {/* Informações Oficiais da Chave Pix da Loja */}
                  <div className="w-full max-w-sm p-3.5 rounded-xl bg-white border border-zinc-200 text-left text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                      <span className="text-zinc-500 font-medium">Chave Pix Oficial:</span>
                      <strong className="text-zinc-900 font-mono font-bold">
                        {formatFriendlyKey(pixConfig.key)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Favorecido / Nome:</span>
                      <span className="text-zinc-800 font-semibold">{pixConfig.merchantName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Cidade do Titular:</span>
                      <span className="text-zinc-700">{pixConfig.merchantCity} - SP</span>
                    </div>
                  </div>

                  {/* Botões de Cópia: Copia e Cola + Chave Direta */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-sm">
                    <button
                      type="button"
                      onClick={copyPixCode}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Código Pix Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Pix Copia e Cola</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={copyDirectPixKey}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      {copiedPixKey ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Chave Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4 text-zinc-500" />
                          <span>Copiar Chave ({formatFriendlyKey(pixConfig.key)})</span>
                        </>
                      )}
                    </button>
                  </div>
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
                        <label className="block text-xs font-medium text-zinc-700 mb-1">Validade (MM/AA) *</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardData.expiry}
                          onChange={(e) => handleCardExpiryChange(e.target.value)}
                          placeholder="12/28"
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-zinc-500 outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 mb-1">Código CVV *</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={(e) => handleCardCvvChange(e.target.value)}
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

                    {/* Mensagem de Erro de Validação do Cartão */}
                    {cardError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{cardError}</span>
                      </div>
                    )}
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
                  href={`https://wa.me/5513996061681?text=${encodeURIComponent(generateFullWhatsAppMessage())}`}
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
                      handleCloseModal();
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
                    onClick={handleCloseModal}
                    className="text-xs text-zinc-500 hover:text-zinc-800 underline underline-offset-4 cursor-pointer"
                  >
                    Concluir e voltar à loja
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
          )}

        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
