import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  X,
  CheckCircle,
  ShieldCheck,
  Copy,
  Check,
  MessageCircle,
  Clock,
  Printer,
  Package,
  UserCheck,
  LogIn,
  UserPlus,
  Loader2
} from 'lucide-react';
import { useCart, type CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured, upsertSupabaseOrder } from '@/lib/supabase';

export const CheckoutModal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isCheckoutOpen, closeCheckout, total, clearCart, cart } = useCart();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [copiedWhatsAppText, setCopiedWhatsAppText] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

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
      setCopiedWhatsAppText(false);
    }
  }, [isCheckoutOpen]);

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
    let formatted = raw;
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    }
    setFormData(prev => ({ ...prev, cep: formatted }));

    if (raw.length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        if (res.ok) {
          const data = await res.json();
          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              street: data.logradouro || prev.street,
              neighborhood: data.bairro || prev.neighborhood,
              city: data.localidade || prev.city,
              state: data.uf || prev.state
            }));
          }
        }
      } catch (e) {
        console.warn('Erro ao consultar ViaCEP:', e);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  // Validação simples de CPF
  const isValidCPF = (cpf: string) => {
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

  const handleCloseModal = () => {
    setStep('form');
    setCompletedOrderData(null);
    setOrderNumber('');
    closeCheckout();
  };

  const isProfileComplete = Boolean(
    formData.name.trim() &&
    formData.phone.trim() &&
    formData.cpf.trim() &&
    isValidCPF(formData.cpf) &&
    formData.cep.trim() &&
    formData.street.trim() &&
    formData.number.trim() &&
    formData.city.trim() &&
    formData.state.trim()
  );

  // Gerador da mensagem completa e detalhada para o WhatsApp
  const generateWhatsAppMessage = (order: NonNullable<typeof completedOrderData>) => {
    const itemsText = order.items
      .map(
        (it, idx) =>
          `*${idx + 1}. ${it.name}*\n` +
          `   🎨 Cor: ${it.color || 'Padrão'}${it.size ? ` | Tam: ${it.size}` : ''}\n` +
          `   🔢 Qtd: ${it.quantity} un. | Valor: R$ ${(it.quantity * it.unitPrice).toFixed(2).replace('.', ',')}`
      )
      .join('\n\n');

    return (
      `🌊 *NOVO PEDIDO REALIZADO — SUNLAB 3D*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔖 *PEDIDO:* #${order.orderNumber}\n` +
      `📅 *DATA:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n` +
      `👤 *DADOS DO CLIENTE:*\n` +
      `• *Nome:* ${order.customerName}\n` +
      `• *E-mail:* ${order.customerEmail}\n` +
      `• *Telefone/WhatsApp:* ${order.customerPhone || 'Não informado'}\n\n` +
      `📍 *ENDEREÇO CADASTRADO:*\n` +
      `• ${order.shippingAddress}\n\n` +
      `📦 *PRODUTOS ESCOLHIDOS:*\n` +
      `${itemsText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *VALOR TOTAL: R$ ${order.totalAmount.toFixed(2).replace('.', ',')}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `💬 *Olá SunLab! Gostaria de confirmar meu pedido #${order.orderNumber} e receber as informações para pagamento e início da fabricação 3D!*\n` +
      `_SunLab Design & Fabricação Digital_`
    );
  };

  const handleCompleteOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isProfileComplete || isProcessing) return;

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

    let confirmedOrderNumber = orderNumber || `SLB-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalPaymentMethodLabel = 'WhatsApp (A Combinar)';
    const payableTotal = total;

    const shippingAddr = `${formData.street}, nº ${formData.number}${formData.complement ? ' (' + formData.complement + ')' : ''}${formData.neighborhood ? ', ' + formData.neighborhood : ''} — ${formData.city}/${formData.state} (CEP: ${formData.cep})`;

    // Sincronizar criação do pedido com a API de pedidos (Vercel e Express)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: confirmedOrderNumber,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: shippingAddr,
          paymentMethod: finalPaymentMethodLabel,
          items: itemsPayload,
          totalAmount: payableTotal
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
      totalAmount: payableTotal,
      orderNumber: confirmedOrderNumber,
      createdAt: new Date().toISOString()
    };

    setCompletedOrderData(fullOrder);
    setOrderNumber(confirmedOrderNumber);
    saveUserProfile(formData);

    // Salvar permanentemente no Supabase (Nuvem) se configurado
    if (isSupabaseConfigured()) {
      upsertSupabaseOrder({
        id: `ord-${confirmedOrderNumber}`,
        orderNumber: confirmedOrderNumber,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone || '',
        shippingAddress: shippingAddr,
        paymentMethod: finalPaymentMethodLabel,
        items: itemsPayload,
        totalAmount: payableTotal,
        status: 'Pendente'
      }).catch(err => console.warn('[Supabase] Falha ao enviar pedido:', err));
    }

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
    setIsProcessing(false);
    setStep('success');

    // Redirecionar / Abrir conversa no WhatsApp automaticamente
    const msg = generateWhatsAppMessage(fullOrder);
    const waUrl = `https://wa.me/5513996061681?text=${encodeURIComponent(msg)}`;
    try {
      window.open(waUrl, '_blank');
    } catch (_) {}
  };

  const copyWhatsAppDetails = () => {
    if (!completedOrderData) return;
    const text = generateWhatsAppMessage(completedOrderData);
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedWhatsAppText(true);
      setTimeout(() => setCopiedWhatsAppText(false), 3000);
    }
  };

  if (!isCheckoutOpen) return null;

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
              {step === 'form' && 'Finalizar Pedido — Dados de Cadastro'}
              {step === 'success' && 'Pedido Registrado com Sucesso!'}
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
                  Para acompanhar seu pedido e salvar seus dados com segurança, faça login ou crie sua conta antes de finalizar.
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
              {/* STEP 1: Formulário e Pedido Direto ao WhatsApp */}
              {step === 'form' && (
                <form onSubmit={handleCompleteOrder} className="space-y-4">
                  {/* Banner de Identificação do Usuário */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-blue-950 block">{user.name}</span>
                        <span className="text-blue-700 text-[11px]">{user.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-blue-200 text-blue-800 font-medium">
                      Conta Conectada
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Nome Completo do Destinatário *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nome e Sobrenome"
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        WhatsApp / Celular com DDD *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(13) 99999-9999"
                        className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        CPF do Titular *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        placeholder="000.000.000-00"
                        className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-zinc-900 focus:ring-1 outline-none font-mono ${
                          formData.cpf && !isValidCPF(formData.cpf)
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
                            : 'border-zinc-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      />
                      {formData.cpf && !isValidCPF(formData.cpf) && (
                        <span className="text-[10px] text-red-500 mt-0.5 block">CPF inválido</span>
                      )}
                    </div>
                  </div>

                  {/* Endereço Cadastrado */}
                  <div className="pt-2 border-t border-zinc-100 space-y-3">
                    <span className="text-xs font-bold text-zinc-900 block">
                      Endereço Cadastrado
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          CEP * {isLoadingCep && <span className="text-blue-600 text-[10px] animate-pulse">Buscando...</span>}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.cep}
                          onChange={(e) => handleCepChange(e.target.value)}
                          placeholder="00000-000"
                          maxLength={9}
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Rua / Avenida *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          placeholder="Nome do logradouro"
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.number}
                          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                          placeholder="Ex: 123"
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Complemento (opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.complement}
                          onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                          placeholder="Apto 42, Bloco B..."
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Bairro *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.neighborhood}
                          onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                          placeholder="Bairro"
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Cidade *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Cidade"
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Estado (UF) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={2}
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                          className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none uppercase font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Mini Summary */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs text-zinc-700">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Produção sob demanda garantida</span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-400 text-[10px] block">Valor Total</span>
                      <span className="font-bold text-zinc-900 text-sm">
                        R$ {total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={!isProfileComplete || isProcessing}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Registrando pedido e abrindo WhatsApp...</span>
                        </div>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                          <span>Finalizar Pedido e Pagar no WhatsApp</span>
                        </>
                      )}
                    </button>
                    
                    <p className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1.5 pt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>O pedido ficará salvo na sua conta e o WhatsApp abrirá para confirmação imediata.</span>
                    </p>
                  </div>
                </form>
              )}

              {/* STEP 2: Pedido Registrado e Confirmação via WhatsApp */}
              {step === 'success' && (
                <div className="text-center py-6 space-y-6 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-2 shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                      <span>Pedido Registrado • Aguardando Pagamento no WhatsApp</span>
                    </div>
                    <div className="block mt-1">
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-700 uppercase tracking-widest">
                        Pedido #{orderNumber}
                      </span>
                    </div>
                    <h4 className="text-2xl font-extrabold text-zinc-900 font-display mt-3">
                      Pedido Realizado com Sucesso!
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 leading-relaxed">
                      O seu pedido já está salvo na sua conta SunLab. Você foi direcionado ao WhatsApp da loja para combinar o pagamento. Assim que recebido, confirmamos o status e iniciamos a fabricação 3D!
                    </p>
                  </div>

                  {/* Order Receipt Box with Products Breakdown */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 max-w-lg mx-auto text-left space-y-3">
                    <div className="flex justify-between pb-2 border-b border-zinc-200">
                      <span className="text-zinc-500">Status do Pedido:</span>
                      <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Aguardando Pagamento no WhatsApp</span>
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
                      <span className="text-zinc-500">Endereço Cadastrado:</span>
                      <span className="text-zinc-900 font-medium text-right max-w-[260px] truncate" title={`${formData.street}, ${formData.number} — ${formData.city}/${formData.state}`}>
                        {formData.street}, {formData.number} — {formData.city}/${formData.state}
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
                      <span className="font-bold text-zinc-900">Total a Pagar:</span>
                      <span className="text-zinc-900 font-extrabold text-base">
                        R$ {(completedOrderData?.totalAmount || total).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons for WhatsApp & Orders Page */}
                  <div className="space-y-2.5 max-w-lg mx-auto pt-1">
                    {/* Primary: Send Full Order Details to WhatsApp */}
                    <a
                      href={`https://wa.me/5513996061681?text=${encodeURIComponent(
                        completedOrderData ? generateWhatsAppMessage(completedOrderData) : ''
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]"
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                      <span>Abrir WhatsApp da SunLab para Pagamento</span>
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
